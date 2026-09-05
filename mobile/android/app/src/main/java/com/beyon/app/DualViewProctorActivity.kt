package com.beyon.app

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.SurfaceTexture
import android.hardware.camera2.*
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.util.Size
import android.view.Surface
import android.view.TextureView
import android.view.View
import android.view.WindowManager
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.beyon.app.databinding.ActivityDualViewProctorBinding
import com.beyon.app.network.BackendTunnel
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions
import kotlinx.coroutines.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.util.concurrent.TimeUnit

class DualViewProctorActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDualViewProctorBinding
    private var procSessionId: String? = null
    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null
    private var pulseCount = 0
    private var isStreaming = false
    private var heartbeatJob: Job? = null
    private var frameJob: Job? = null
    private var localVisionJob: Job? = null
    private var localObstructedStreak = 0
    private var localAbsentStreak = 0
    private var serverViolationActive = false
    private var currentLensFacing = CameraCharacteristics.LENS_FACING_BACK

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(8, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()

    companion object {
        private const val CAMERA_PERMISSION_REQUEST = 101
    }

    private val qrScanLauncher = registerForActivityResult(ScanContract()) { result ->
        val contents = result.contents
        if (!contents.isNullOrBlank()) {
            handleScannedQr(contents)
        } else {
            // Re-open camera preview if user cancelled QR scanning
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                initCamera()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        binding = ActivityDualViewProctorBinding.inflate(layoutInflater)
        setContentView(binding.root)

        updateServerHostLabel()

        // Check if token was passed via deep link or intent
        val tokenFromIntent = intent.data?.getQueryParameter("token") ?: intent.getStringExtra("token")
        if (!tokenFromIntent.isNullOrBlank()) {
            binding.etPairingToken.setText(tokenFromIntent)
            pairWithToken(tokenFromIntent)
        }

        binding.btnScanQr.setOnClickListener {
            launchQrScanner()
        }

        binding.btnSwitchCamera.setOnClickListener {
            toggleCameraFacing()
        }

        binding.btnSwitchCameraHeader.setOnClickListener {
            toggleCameraFacing()
        }

        binding.btnSwitchCameraStreaming.setOnClickListener {
            toggleCameraFacing()
        }

        binding.btnConnect.setOnClickListener {
            val token = binding.etPairingToken.text.toString().trim()
            if (token.isNotEmpty()) {
                pairWithToken(token)
            } else {
                Toast.makeText(this, "Please scan QR code or enter pairing token", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnConfigServer.setOnClickListener {
            showServerConfigDialog()
        }

        binding.btnDisconnect.setOnClickListener {
            stopStreaming()
            finish()
        }

        // Initialize camera preview immediately so candidate can see their environment
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            initCamera()
        } else {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), CAMERA_PERMISSION_REQUEST)
        }
    }

    private fun toggleCameraFacing() {
        currentLensFacing = if (currentLensFacing == CameraCharacteristics.LENS_FACING_BACK) {
            CameraCharacteristics.LENS_FACING_FRONT
        } else {
            CameraCharacteristics.LENS_FACING_BACK
        }
        closeCamera()
        initCamera()
        updateCameraSwitchButtons()
    }

    private fun updateCameraSwitchButtons() {
        val isFront = currentLensFacing == CameraCharacteristics.LENS_FACING_FRONT
        binding.btnSwitchCameraHeader.text = if (isFront) "FRONT" else "REAR"
        binding.btnSwitchCamera.text = if (isFront) "Switch to Rear Camera" else "Switch to Front Camera"
        binding.btnSwitchCameraStreaming.text = if (isFront) "Rear" else "Front"
        val facingName = if (isFront) "Front (Selfie) Camera" else "Rear (Environment) Camera"
        Toast.makeText(this, "Switched to $facingName", Toast.LENGTH_SHORT).show()
    }

    override fun onResume() {
        super.onResume()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            if (cameraDevice == null) {
                initCamera()
            }
        }
    }

    override fun onPause() {
        super.onPause()
        if (!isStreaming) {
            closeCamera()
        }
    }

    private fun launchQrScanner() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), CAMERA_PERMISSION_REQUEST)
            return
        }
        // Safely close camera before launching ZXing scanner
        closeCamera()

        val options = ScanOptions().apply {
            setPrompt("Align Desktop Assessment QR Code inside viewfinder")
            setBeepEnabled(true)
            setOrientationLocked(true)
            setBarcodeImageEnabled(false)
            setDesiredBarcodeFormats(ScanOptions.QR_CODE)
        }
        qrScanLauncher.launch(options)
    }

    private fun handleScannedQr(contents: String) {
        var rawToken = contents.trim()
        try {
            val uri = android.net.Uri.parse(rawToken)
            val queryToken = uri.getQueryParameter("token")
            if (!queryToken.isNullOrBlank()) {
                rawToken = queryToken
            } else if (rawToken.contains("token=")) {
                val match = Regex("[?&]token=([^&]+)").find(rawToken)
                if (match != null) {
                    rawToken = match.groupValues[1]
                }
            }

            // Auto-detect host IP if scanned from desktop QR
            uri.host?.let { host ->
                if (host.matches(Regex("\\d+\\.\\d+\\.\\d+\\.\\d+"))) {
                    BackendTunnel.baseUrl = "http://$host:8085/api/v1"
                    updateServerHostLabel()
                }
            }
        } catch (e: Exception) {
            // Fallback to raw string
        }

        binding.etPairingToken.setText(rawToken)
        Toast.makeText(this, "QR Code Scanned! Connecting to Assessment...", Toast.LENGTH_SHORT).show()
        pairWithToken(rawToken)
    }

    private fun showServerConfigDialog() {
        val input = EditText(this).apply {
            setText(BackendTunnel.baseUrl)
            hint = "http://10.1.36.24:8085/api/v1"
            setSingleLine()
            setPadding(40, 30, 40, 30)
        }

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(40, 20, 40, 0)
            addView(input)
        }

        AlertDialog.Builder(this)
            .setTitle("Assessment Server Gateway")
            .setMessage("Enter the IP address of your desktop computer running the backend:")
            .setView(container)
            .setPositiveButton("Save") { _, _ ->
                val newUrl = input.text.toString().trim()
                if (newUrl.isNotEmpty()) {
                    BackendTunnel.baseUrl = newUrl
                    updateServerHostLabel()
                    Toast.makeText(this, "Gateway updated to: $newUrl", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun updateServerHostLabel() {
        try {
            val host = android.net.Uri.parse(BackendTunnel.baseUrl).authority ?: BackendTunnel.baseUrl
            binding.tvServerHost.text = "Server Gateway: $host (Tap to change)"
        } catch (e: Exception) {
            binding.tvServerHost.text = "Server Gateway: ${BackendTunnel.baseUrl} (Tap to change)"
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_PERMISSION_REQUEST) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                initCamera()
            } else {
                Toast.makeText(this, "Camera permission is required for dual camera proctoring", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun pairWithToken(token: String) {
        binding.btnConnect.isEnabled = false
        binding.btnConnect.text = "Authenticating with Desktop..."

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val json = JSONObject().apply {
                    put("token", token)
                    put("fingerprint", "Android Native Client")
                }
                val body = json.toString().toRequestBody(JSON_MEDIA_TYPE)
                val request = Request.Builder()
                    .url("${BackendTunnel.baseUrl}/proctoring/dualview/pair")
                    .post(body)
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    val resString = response.body?.string() ?: ""
                    if (response.isSuccessful) {
                        val resJson = JSONObject(resString)
                        procSessionId = resJson.optString("procSessionId")
                        withContext(Dispatchers.Main) {
                            startCameraAndStream()
                        }
                    } else {
                        withContext(Dispatchers.Main) {
                            binding.btnConnect.isEnabled = true
                            binding.btnConnect.text = "Connect"
                            Toast.makeText(this@DualViewProctorActivity, "Pairing failed: Invalid token", Toast.LENGTH_LONG).show()
                        }
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.btnConnect.isEnabled = true
                    binding.btnConnect.text = "Connect"
                    Toast.makeText(this@DualViewProctorActivity, "Connection error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun startCameraAndStream() {
        binding.cardPairing.visibility = View.GONE
        binding.cardStreaming.visibility = View.VISIBLE
        binding.tvLiveIndicator.text = "STREAMING TO DESKTOP"
        binding.tvTelemetryWatermark.text = "KIOSK LINKED"
        isStreaming = true

        if (cameraDevice == null) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                initCamera()
            }
        }

        startTelemetryLoops()
    }

    private fun initCamera() {
        if (binding.textureViewCamera.isAvailable) {
            openCamera()
        } else {
            binding.textureViewCamera.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
                override fun onSurfaceTextureAvailable(surface: SurfaceTexture, width: Int, height: Int) {
                    openCamera()
                }
                override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) {}
                override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean {
                    closeCamera()
                    return true
                }
                override fun onSurfaceTextureUpdated(surface: SurfaceTexture) {}
            }
        }
    }

    private fun closeCamera() {
        try {
            localVisionJob?.cancel()
            localVisionJob = null
            localObstructedStreak = 0
            localAbsentStreak = 0
            captureSession?.stopRepeating()
            captureSession?.close()
            captureSession = null
            cameraDevice?.close()
            cameraDevice = null
        } catch (e: Exception) {
            localVisionJob = null
            captureSession = null
            cameraDevice = null
        }
    }

    private fun openCamera() {
        val manager = getSystemService(Context.CAMERA_SERVICE) as CameraManager
        try {
            var targetCameraId: String? = null
            for (id in manager.cameraIdList) {
                val chars = manager.getCameraCharacteristics(id)
                val facing = chars.get(CameraCharacteristics.LENS_FACING)
                if (facing == currentLensFacing) {
                    targetCameraId = id
                    break
                }
            }
            if (targetCameraId == null) {
                targetCameraId = manager.cameraIdList.firstOrNull() ?: return
            }

            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) return

            manager.openCamera(targetCameraId, object : CameraDevice.StateCallback() {
                override fun onOpened(camera: CameraDevice) {
                    cameraDevice = camera
                    startPreview()
                }

                override fun onDisconnected(camera: CameraDevice) {
                    camera.close()
                    cameraDevice = null
                }

                override fun onError(camera: CameraDevice, error: Int) {
                    camera.close()
                    cameraDevice = null
                }
            }, Handler(Looper.getMainLooper()))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun startPreview() {
        val texture = binding.textureViewCamera.surfaceTexture ?: return
        val manager = getSystemService(Context.CAMERA_SERVICE) as CameraManager
        var targetCameraId: String? = null
        for (id in manager.cameraIdList) {
            val chars = manager.getCameraCharacteristics(id)
            if (chars.get(CameraCharacteristics.LENS_FACING) == currentLensFacing) {
                targetCameraId = id
                break
            }
        }
        if (targetCameraId == null) {
            targetCameraId = manager.cameraIdList.firstOrNull() ?: return
        }
        val chars = manager.getCameraCharacteristics(targetCameraId)
        val map = chars.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
        val choices = map?.getOutputSizes(SurfaceTexture::class.java) ?: emptyArray()
        val chosenSize = choices.firstOrNull { it.width == 1280 && it.height == 720 }
            ?: choices.firstOrNull { it.width == 640 && it.height == 480 }
            ?: choices.firstOrNull() ?: Size(640, 480)

        texture.setDefaultBufferSize(chosenSize.width, chosenSize.height)
        val surface = Surface(texture)

        try {
            val builder = cameraDevice?.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW)?.apply {
                addTarget(surface)
            }

            cameraDevice?.createCaptureSession(listOf(surface), object : CameraCaptureSession.StateCallback() {
                override fun onConfigured(session: CameraCaptureSession) {
                    captureSession = session
                    builder?.let {
                        session.setRepeatingRequest(it.build(), null, Handler(Looper.getMainLooper()))
                    }
                    startLocalVisionMonitor()
                }

                override fun onConfigureFailed(session: CameraCaptureSession) {}
            }, Handler(Looper.getMainLooper()))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun startLocalVisionMonitor() {
        localVisionJob?.cancel()
        localVisionJob = lifecycleScope.launch(Dispatchers.Default) {
            while (isActive) {
                delay(750)
                if (cameraDevice == null) continue

                var bitmap: Bitmap? = null
                withContext(Dispatchers.Main) {
                    bitmap = binding.textureViewCamera.bitmap
                }
                val bmp = bitmap ?: continue

                try {
                    val small = Bitmap.createScaledBitmap(bmp, 80, 60, false)
                    val pixels = IntArray(80 * 60)
                    small.getPixels(pixels, 0, 80, 0, 0, 80, 60)

                    var totalLum = 0L
                    var totalRed = 0L
                    var totalGreen = 0L
                    var totalBlue = 0L
                    var edgeTransitions = 0
                    var skinPixels = 0

                    for (y in 0 until 60) {
                        for (x in 0 until 80) {
                            val color = pixels[y * 80 + x]
                            val r = (color shr 16) and 0xFF
                            val g = (color shr 8) and 0xFF
                            val b = color and 0xFF
                            val lum = (r + g + b) / 3

                            totalLum += lum
                            totalRed += r
                            totalGreen += g
                            totalBlue += b

                            if (x < 79) {
                                val nextColor = pixels[y * 80 + (x + 1)]
                                val nextLum = (((nextColor shr 16) and 0xFF) + ((nextColor shr 8) and 0xFF) + (nextColor and 0xFF)) / 3
                                if (Math.abs(lum - nextLum) > 16) {
                                    edgeTransitions++
                                }
                            }

                            // Skin detection (YCbCr biometric) in upper 70% of frame
                            if (y < 42) {
                                val Y  =  0.299 * r + 0.587 * g + 0.114 * b
                                val Cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128
                                val Cr =  0.5 * r - 0.4187 * g - 0.0813 * b + 128
                                if (Y in 30.0..240.0 && Cb in 75.0..135.0 && Cr in 128.0..180.0 && r > g && r > b && (r - g > 6)) {
                                    skinPixels++
                                }
                            }
                        }
                    }

                    val meanLum = (totalLum / (80 * 60)).toInt()
                    val avgR = totalRed / (80 * 60)
                    val avgG = maxOf(totalGreen / (80 * 60), 1L)
                    val avgB = maxOf(totalBlue / (80 * 60), 1L)

                    // 1. Camera cover / obstruction:
                    // Complete dark (< 22) OR finger covering lens (red dominance + low edges) OR out of focus flat surface
                    val isFingerCover = (avgR > 1.35 * avgB) && (avgR > 1.15 * avgG) && (edgeTransitions < 35)
                    val isCameraCovered = (meanLum < 22) || (edgeTransitions < 25 && meanLum < 110) || isFingerCover

                    // 2. Candidate absence:
                    // Lens is clear, but candidate skin pixels in upper frame < 20 (< 0.5% of upper frame)
                    val isCandidateAbsent = !isCameraCovered && (skinPixels < 20)

                    withContext(Dispatchers.Main) {
                        if (isCameraCovered) {
                            localObstructedStreak++
                            localAbsentStreak = 0
                            if (localObstructedStreak >= 2) {
                                binding.bannerWarning.visibility = View.VISIBLE
                                binding.bannerWarning.setBackgroundColor(0xE6DC2626.toInt())
                                binding.tvWarningText.text = "CRITICAL WARNING: Camera lens covered or obstructed! Uncover immediately!"
                            }
                        } else if (isCandidateAbsent) {
                            localAbsentStreak++
                            localObstructedStreak = 0
                            if (localAbsentStreak >= 2) {
                                binding.bannerWarning.visibility = View.VISIBLE
                                binding.bannerWarning.setBackgroundColor(0xE6D97706.toInt())
                                binding.tvWarningText.text = "WARNING: Candidate not visible in camera view! Return immediately!"
                            }
                        } else {
                            localObstructedStreak = 0
                            localAbsentStreak = 0
                            if (!serverViolationActive) {
                                binding.bannerWarning.visibility = View.GONE
                            }
                        }
                    }
                } catch (e: Exception) {
                    // Local monitor best effort
                }
            }
        }
    }

    private fun startTelemetryLoops() {
        heartbeatJob?.cancel()
        frameJob?.cancel()

        // Send heartbeat every 4 seconds
        heartbeatJob = lifecycleScope.launch(Dispatchers.IO) {
            while (isActive && isStreaming) {
                procSessionId?.let { id ->
                    sendHeartbeat(id)
                }
                delay(4000)
            }
        }

        // Send video frame every 1.8 seconds
        frameJob = lifecycleScope.launch(Dispatchers.IO) {
            while (isActive && isStreaming) {
                procSessionId?.let { id ->
                    captureAndSendFrame(id)
                }
                delay(1800)
            }
        }
    }

    private suspend fun sendHeartbeat(id: String) {
        try {
            val json = JSONObject().apply {
                put("deviceType", "MOBILE")
                put("cameraActive", true)
                put("micActive", true)
            }
            val body = json.toString().toRequestBody(JSON_MEDIA_TYPE)
            val request = Request.Builder()
                .url("${BackendTunnel.baseUrl}/proctoring/dualview/$id/heartbeat")
                .post(body)
                .build()

            httpClient.newCall(request).execute().use {
                if (it.isSuccessful) {
                    pulseCount++
                    withContext(Dispatchers.Main) {
                        binding.tvPulseCounter.text = "PULSE #$pulseCount"
                    }
                }
            }
        } catch (e: Exception) {
            // Heartbeat best-effort
        }
    }

    private suspend fun captureAndSendFrame(id: String) {
        var bitmap: Bitmap? = null
        withContext(Dispatchers.Main) {
            bitmap = binding.textureViewCamera.bitmap
        }
        val bmp = bitmap ?: return

        try {
            val baos = ByteArrayOutputStream()
            val scaled = Bitmap.createScaledBitmap(bmp, 320, 240, true)
            scaled.compress(Bitmap.CompressFormat.JPEG, 60, baos)
            val base64 = "data:image/jpeg;base64," + Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP)

            val json = JSONObject().apply {
                put("frameData", base64)
                put("timestamp", System.currentTimeMillis())
            }
            val body = json.toString().toRequestBody(JSON_MEDIA_TYPE)
            val request = Request.Builder()
                .url("${BackendTunnel.baseUrl}/proctoring/dualview/$id/mobile-frame")
                .post(body)
                .build()

            httpClient.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val resString = response.body?.string() ?: ""
                    if (resString.isNotEmpty()) {
                        val resJson = JSONObject(resString)
                        val secondPersonDetected = resJson.optBoolean("secondPersonDetected", false)
                        val phoneDetected = resJson.optBoolean("phoneDetected", false)
                        val cameraObstructed = resJson.optBoolean("cameraObstructed", false)
                        val candidateAbsent = resJson.optBoolean("candidateAbsent", false)

                        serverViolationActive = phoneDetected || secondPersonDetected || cameraObstructed || candidateAbsent

                        withContext(Dispatchers.Main) {
                            if (phoneDetected) {
                                binding.bannerWarning.visibility = View.VISIBLE
                                binding.bannerWarning.setBackgroundColor(0xE6DC2626.toInt())
                                binding.tvWarningText.text = "CRITICAL VIOLATION: Mobile phone detected! Test terminating!"
                            } else if (cameraObstructed) {
                                binding.bannerWarning.visibility = View.VISIBLE
                                binding.bannerWarning.setBackgroundColor(0xE6DC2626.toInt())
                                binding.tvWarningText.text = "CRITICAL WARNING: Camera lens covered or obstructed! Uncover immediately!"
                            } else if (secondPersonDetected) {
                                binding.bannerWarning.visibility = View.VISIBLE
                                binding.bannerWarning.setBackgroundColor(0xE6D97706.toInt())
                                binding.tvWarningText.text = "WARNING: Additional person detected in camera view"
                            } else if (candidateAbsent) {
                                binding.bannerWarning.visibility = View.VISIBLE
                                binding.bannerWarning.setBackgroundColor(0xE6D97706.toInt())
                                binding.tvWarningText.text = "WARNING: Candidate not visible in workspace view! Return immediately!"
                            } else if (localObstructedStreak < 2 && localAbsentStreak < 2) {
                                binding.bannerWarning.visibility = View.GONE
                            }
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // Frame best-effort
        }
    }

    private fun stopStreaming() {
        isStreaming = false
        heartbeatJob?.cancel()
        frameJob?.cancel()
        binding.cardPairing.visibility = View.VISIBLE
        binding.cardStreaming.visibility = View.GONE
        binding.tvLiveIndicator.text = "LIVE CAMERA VIEW"
        binding.tvTelemetryWatermark.text = "AI PROCTOR READY"
        binding.bannerWarning.visibility = View.GONE

        closeCamera()

        procSessionId?.let { id ->
            lifecycleScope.launch(Dispatchers.IO) {
                try {
                    val request = Request.Builder()
                        .url("${BackendTunnel.baseUrl}/proctoring/dualview/$id/mobile-disconnect")
                        .post("{}".toRequestBody(JSON_MEDIA_TYPE))
                        .build()
                    httpClient.newCall(request).execute().close()
                } catch (e: Exception) {}
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopStreaming()
    }
}