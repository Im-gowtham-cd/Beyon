package com.beyon.app

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.beyon.app.databinding.ActivityMainBinding
import com.beyon.app.fragments.*
import com.beyon.app.network.BackendTunnel

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Load default HomeFragment
        if (savedInstanceState == null) {
            loadFragment(HomeFragment())
        }

        binding.bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> {
                    loadFragment(HomeFragment())
                    true
                }
                R.id.nav_practice -> {
                    loadFragment(PracticeFragment())
                    true
                }
                R.id.nav_skills -> {
                    loadFragment(SkillsFragment())
                    true
                }
                R.id.nav_opportunities -> {
                    loadFragment(OpportunitiesFragment())
                    true
                }
                R.id.nav_profile -> {
                    loadFragment(ProfileFragment())
                    true
                }
                else -> false
            }
        }

        binding.btnSettings.setOnClickListener {
            showTunnelSettingsDialog()
        }
    }

    fun selectTab(tabId: Int) {
        binding.bottomNav.selectedItemId = tabId
    }

    private fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }

    fun showAssessmentLockdownDialog() {
        val sessionToken = "test-gpu-kernel-01"
        AlertDialog.Builder(this)
            .setTitle("🛡️ Proctored Assessment Center")
            .setMessage("High-stakes proctored examinations run exclusively on the Beyon Desktop Lockdown Client with hardware kiosk security and AI biometric monitoring.\n\nYour Assigned Session Token:\n$sessionToken")
            .setPositiveButton("📋 Copy Token") { _, _ ->
                val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                val clip = ClipData.newPlainText("Session Token", sessionToken)
                clipboard.setPrimaryClip(clip)
                Toast.makeText(this, "Session token copied to clipboard!", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Close", null)
            .show()
    }

    private fun showTunnelSettingsDialog() {
        val input = EditText(this).apply {
            setText(BackendTunnel.baseUrl)
            hint = "http://10.0.2.2:8085/api/v1"
            setSingleLine()
            setPadding(40, 30, 40, 30)
        }

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(40, 20, 40, 0)
            addView(input)
        }

        AlertDialog.Builder(this)
            .setTitle("⚡ Direct Backend Service Gateway")
            .setMessage("Set your local host backend address:\n(10.0.2.2 maps to your PC localhost in emulator)")
            .setView(container)
            .setPositiveButton("Save") { _, _ ->
                val newUrl = input.text.toString().trim()
                if (newUrl.isNotEmpty()) {
                    BackendTunnel.baseUrl = newUrl
                    Toast.makeText(this, "Backend URL updated to: $newUrl", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}
