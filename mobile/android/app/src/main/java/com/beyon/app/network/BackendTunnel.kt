package com.beyon.app.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

object BackendTunnel {
    var baseUrl: String = "http://10.0.2.2:8085/api/v1"
    var authToken: String? = "mock-token-student-01"

    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(8, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()

    suspend fun ping(targetUrl: String = baseUrl): Pair<Boolean, Long> = withContext(Dispatchers.IO) {
        val start = System.currentTimeMillis()
        try {
            val request = Request.Builder()
                .url("$targetUrl/health")
                .get()
                .build()
            client.newCall(request).execute().use { response ->
                val latency = System.currentTimeMillis() - start
                Pair(response.isSuccessful, latency)
            }
        } catch (e: Exception) {
            val latency = System.currentTimeMillis() - start
            Pair(false, latency)
        }
    }

    suspend fun get(endpoint: String): String? = withContext(Dispatchers.IO) {
        try {
            val url = if (endpoint.startsWith("http")) endpoint else "$baseUrl$endpoint"
            val builder = Request.Builder().url(url).get()
            authToken?.let { builder.addHeader("Authorization", "Bearer $it") }
            client.newCall(builder.build()).execute().use { response ->
                if (response.isSuccessful) response.body?.string() else null
            }
        } catch (e: Exception) {
            null
        }
    }

    suspend fun post(endpoint: String, jsonBody: String): String? = withContext(Dispatchers.IO) {
        try {
            val url = if (endpoint.startsWith("http")) endpoint else "$baseUrl$endpoint"
            val body = jsonBody.toRequestBody(JSON_MEDIA_TYPE)
            val builder = Request.Builder().url(url).post(body)
            authToken?.let { builder.addHeader("Authorization", "Bearer $it") }
            client.newCall(builder.build()).execute().use { response ->
                if (response.isSuccessful) response.body?.string() else null
            }
        } catch (e: Exception) {
            null
        }
    }
}
