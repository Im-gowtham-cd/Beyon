package com.beyon.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.beyon.app.R
import com.beyon.app.databinding.FragmentPracticeBinding

class PracticeFragment : Fragment() {

    private var _binding: FragmentPracticeBinding? = null
    private val binding get() = _binding!!

    data class McqQuestion(
        val category: String,
        val difficulty: String,
        val title: String,
        val question: String,
        val optA: String,
        val optB: String,
        val optC: String,
        val optD: String,
        val correctOpt: String,
        val explanation: String
    )

    private val questions = listOf(
        McqQuestion(
            category = "GPU & CUDA Architecture",
            difficulty = "HARD",
            title = "Warp Divergence in Branch Execution",
            question = "In NVIDIA CUDA architecture, what happens when threads within the same 32-thread warp execute divergent code paths inside a conditional branch (if-else)?",
            optA = "All threads execute both paths in parallel simultaneously using dual issue.",
            optB = "The warp serially executes each branch path, disabling threads that are not on that path.",
            optC = "The GPU hardware splits the warp into two independent 16-thread warps permanently.",
            optD = "An out-of-memory GPU kernel exception is thrown immediately.",
            correctOpt = "B",
            explanation = "When warp divergence occurs, the SIMT warp serially executes each divergent branch path while masking inactive threads, reducing overall instruction throughput."
        ),
        McqQuestion(
            category = "Distributed Systems",
            difficulty = "MEDIUM",
            title = "Raft Consensus Leader Election",
            question = "In the Raft consensus algorithm, how does a candidate node determine if it has successfully won a leader election for term T?",
            optA = "It receives a heartbeat acknowledgment from the previous leader.",
            optB = "It receives votes from a strict majority (quorum) of servers in the cluster.",
            optC = "It verifies that its local log index has exceeded 1,000 committed entries.",
            optD = "It queries the ZooKeeper metadata registry for leadership lock.",
            correctOpt = "B",
            explanation = "A candidate wins an election if it receives votes from a strict majority (>50%) of all nodes in the cluster for that specific election term."
        ),
        McqQuestion(
            category = "LLM Fine-Tuning",
            difficulty = "MEDIUM",
            title = "LoRA Parameter-Efficient Adaptation",
            question = "Low-Rank Adaptation (LoRA) freezes the pretrained model weights and injects trainable rank decomposition matrices into which layers typically?",
            optA = "Only the final classification softmax head.",
            optB = "Self-attention projection matrices (Wq, Wk, Wv, Wo).",
            optC = "The token vocabulary embedding table only.",
            optD = "The RMSNorm / LayerNorm scale and bias parameters.",
            correctOpt = "B",
            explanation = "LoRA injects low-rank matrices into multi-head self-attention projection weights, vastly reducing memory and trainable parameter footprint."
        )
    )

    private var currentIdx = 0
    private var selectedOpt: String? = null
    private var isChecked = false
    private var score = 0

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPracticeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        loadQuestion(0)

        binding.optA.setOnClickListener { selectOption("A") }
        binding.optB.setOnClickListener { selectOption("B") }
        binding.optC.setOnClickListener { selectOption("C") }
        binding.optD.setOnClickListener { selectOption("D") }

        binding.btnCheckOrNext.setOnClickListener {
            if (!isChecked) {
                if (selectedOpt == null) {
                    Toast.makeText(context, "Please select an answer option", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                checkAnswer()
            } else {
                nextQuestion()
            }
        }
    }

    private fun loadQuestion(idx: Int) {
        currentIdx = idx
        val q = questions[currentIdx]
        selectedOpt = null
        isChecked = false

        binding.tvQuestionProgress.text = "QUESTION ${currentIdx + 1} OF ${questions.size}"
        binding.tvPracticeScore.text = "Score: +$score XP"

        binding.tvCategoryTag.text = q.category
        binding.tvDifficultyTag.text = q.difficulty
        binding.tvQuestionTitle.text = q.title
        binding.tvQuestionText.text = q.question

        binding.tvOptAText.text = q.optA
        binding.tvOptBText.text = q.optB
        binding.tvOptCText.text = q.optC
        binding.tvOptDText.text = q.optD

        resetOptionStyles()
        binding.boxExplanation.visibility = View.GONE
        binding.btnCheckOrNext.text = "Check Answer"
        binding.btnCheckOrNext.setBackgroundResource(R.drawable.bg_btn_primary)
    }

    private fun selectOption(opt: String) {
        if (isChecked) return
        selectedOpt = opt
        resetOptionStyles()

        when (opt) {
            "A" -> binding.optA.setBackgroundResource(R.drawable.bg_option_selected)
            "B" -> binding.optB.setBackgroundResource(R.drawable.bg_option_selected)
            "C" -> binding.optC.setBackgroundResource(R.drawable.bg_option_selected)
            "D" -> binding.optD.setBackgroundResource(R.drawable.bg_option_selected)
        }
    }

    private fun resetOptionStyles() {
        binding.optA.setBackgroundResource(R.drawable.bg_option_default)
        binding.optB.setBackgroundResource(R.drawable.bg_option_default)
        binding.optC.setBackgroundResource(R.drawable.bg_option_default)
        binding.optD.setBackgroundResource(R.drawable.bg_option_default)
    }

    private fun checkAnswer() {
        isChecked = true
        val q = questions[currentIdx]
        val isCorrect = selectedOpt == q.correctOpt

        if (isCorrect) {
            score += 10
            binding.tvPracticeScore.text = "Score: +$score XP"
            binding.tvExplanationTitle.text = "✓ Correct Answer (+10 XP)"
            binding.tvExplanationTitle.setTextColor(resources.getColor(R.color.primary, null))
        } else {
            binding.tvExplanationTitle.text = "✕ Incorrect (Correct: ${q.correctOpt})"
            binding.tvExplanationTitle.setTextColor(resources.getColor(R.color.danger, null))
        }

        // Highlight correct green, wrong red
        when (q.correctOpt) {
            "A" -> binding.optA.setBackgroundResource(R.drawable.bg_option_correct)
            "B" -> binding.optB.setBackgroundResource(R.drawable.bg_option_correct)
            "C" -> binding.optC.setBackgroundResource(R.drawable.bg_option_correct)
            "D" -> binding.optD.setBackgroundResource(R.drawable.bg_option_correct)
        }

        if (!isCorrect) {
            when (selectedOpt) {
                "A" -> binding.optA.setBackgroundResource(R.drawable.bg_option_wrong)
                "B" -> binding.optB.setBackgroundResource(R.drawable.bg_option_wrong)
                "C" -> binding.optC.setBackgroundResource(R.drawable.bg_option_wrong)
                "D" -> binding.optD.setBackgroundResource(R.drawable.bg_option_wrong)
            }
        }

        binding.tvExplanationBody.text = q.explanation
        binding.boxExplanation.visibility = View.VISIBLE
        binding.btnCheckOrNext.text = "Next Question ➔"
        binding.btnCheckOrNext.setBackgroundResource(R.drawable.bg_btn_accent)
    }

    private fun nextQuestion() {
        val nextIdx = (currentIdx + 1) % questions.size
        loadQuestion(nextIdx)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
