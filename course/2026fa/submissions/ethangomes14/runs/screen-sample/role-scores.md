# Role Scorer report — 2026-10-03

*Bayesian Role Scorer (Ch.11). Weights: sponsorship 0.35, fit 0.3, role_quality 0 [role_quality weight is **[VERIFY]** — not pinned by the chapter]. Threshold 0.3. Profile requires sponsorship.*

**Summary:** 5 roles → Apply 3 · Consider 1 · Skip 1. **Skip rate 20%** (below the ~50% a healthy run skips; check the inputs).

| Role | Composite | Rec | Why | Audit (term · value · weight · source) |
|---|---|---|---|---|
| Sigma Computing — Data Engineer | 0.525 | **Apply** | composite 0.525 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [model-judgment]; fit 0.7·0.3 [model-judgment] × liveness 1[record]×timeline 1[your-input] |
| Klaviyo — Analytics Engineer | 0.525 | **Apply** | composite 0.525 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [model-judgment]; fit 0.7·0.3 [model-judgment] × liveness 1[record]×timeline 1[your-input] |
| Gusto — Senior Data Engineer | 0.465 | **Apply** | composite 0.465 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [model-judgment]; fit 0.5·0.3 [model-judgment] × liveness 1[record]×timeline 1[your-input] |
| Airbnb — Senior Staff Data Engineer, Foundational Data | 0.230 | **Consider** | composite 0.230 in the Consider band [0.2, 0.3) | sponsorship 0.4·0.35 [model-judgment]; fit 0.3·0.3 [model-judgment] × liveness 1[record]×timeline 1[your-input] |
| Stripe — Software Engineer, Data Orchestration | 0.000 | **Skip** | gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes) | sponsorship 0.4·0.35 [model-judgment]; fit 0.7·0.3 [model-judgment] × liveness 0[record]×timeline 1[your-input] |

*Every term traces to its source. If you cannot explain a row term-by-term, distrust the recommendation before your confusion (Ch.11).*
