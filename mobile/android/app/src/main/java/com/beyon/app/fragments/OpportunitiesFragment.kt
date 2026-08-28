package com.beyon.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import com.beyon.app.databinding.FragmentOpportunitiesBinding

class OpportunitiesFragment : Fragment() {

    private var _binding: FragmentOpportunitiesBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOpportunitiesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnApply1.setOnClickListener {
            binding.btnApply1.text = "✓ Application Submitted"
            binding.btnApply1.isEnabled = false
            AlertDialog.Builder(requireContext())
                .setTitle("Application Submitted!")
                .setMessage("Your verified Beyon competency profile and 109 Skills Matrix have been submitted to Anthropic AI Systems.")
                .setPositiveButton("OK", null)
                .show()
        }

        binding.btnApply2.setOnClickListener {
            binding.btnApply2.text = "✓ Application Submitted"
            binding.btnApply2.isEnabled = false
            AlertDialog.Builder(requireContext())
                .setTitle("Application Submitted!")
                .setMessage("Your verified Beyon competency profile has been submitted to NVIDIA Acceleration Labs.")
                .setPositiveButton("OK", null)
                .show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
