package com.beyon.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.beyon.app.databinding.FragmentProfileBinding
import com.beyon.app.network.BackendTunnel
import kotlinx.coroutines.launch

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tvBackendUrl.text = BackendTunnel.baseUrl

        binding.btnTestBackend.setOnClickListener {
            binding.btnTestBackend.isEnabled = false
            binding.btnTestBackend.text = "Testing Direct Tunnel..."

            lifecycleScope.launch {
                val (ok, latency) = BackendTunnel.ping()
                binding.btnTestBackend.isEnabled = true
                binding.btnTestBackend.text = "⚡ Ping Backend Service"

                if (ok) {
                    binding.tvTunnelStatus.text = "ONLINE (${latency}ms)"
                    binding.tvTunnelStatus.setTextColor(resources.getColor(com.beyon.app.R.color.primary, null))
                    Toast.makeText(context, "✓ Connected to backend: ${latency}ms latency", Toast.LENGTH_SHORT).show()
                } else {
                    binding.tvTunnelStatus.text = "OFFLINE"
                    binding.tvTunnelStatus.setTextColor(resources.getColor(com.beyon.app.R.color.danger, null))
                    Toast.makeText(context, "✕ Backend unreachable on ${BackendTunnel.baseUrl}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
