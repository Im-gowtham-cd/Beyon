package com.beyon.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.beyon.app.MainActivity
import com.beyon.app.R
import com.beyon.app.databinding.FragmentHomeBinding

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val mainActivity = activity as? MainActivity

        binding.cardDailyChallenge.setOnClickListener {
            mainActivity?.selectTab(R.id.nav_practice)
        }

        binding.cardNavPractice.setOnClickListener {
            mainActivity?.selectTab(R.id.nav_practice)
        }

        binding.cardNavSkills.setOnClickListener {
            mainActivity?.selectTab(R.id.nav_skills)
        }

        binding.cardNavJobs.setOnClickListener {
            mainActivity?.selectTab(R.id.nav_opportunities)
        }

        binding.cardNavAssessment.setOnClickListener {
            mainActivity?.showAssessmentLockdownDialog()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
