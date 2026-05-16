# PaintBench — Twitter Post Captions

**Post strategy:** Lead with the surprising stat (23.5%), then explain why the benchmark
matters (methodology), then show the gap extends to real-world tasks (TinyGrafixBench).
Goal: curiosity → credibility → call to action.

---

## Figure 1 — `fig1.html`
**File:** `fig1.html` (1080×1350px, 4:5 ratio)
**Content:** 4 example problems (input → ground truth → model output placeholder) + leaderboard table

**Caption:**
> We built PaintBench to answer a simple question: how well do image-editing models execute *precise* visual instructions?
>
> The answer is humbling. Tasks trivial in any raster editor — move a shape, apply a gradient, match a legend — remain largely out of reach for frontier AI. The best model scores just **23.5% mIoU** on 1,050 deterministic problems across 20 task types.
>
> Key: every problem has exactly one correct output, evaluated by pixel-level comparison. No model judges. No ambiguity. 🧵 1/3
>
> 📄 arxiv.org/abs/2506.07220

---

## Figure 2 — `fig2.html`
**File:** `fig2.html` (1080×1350px, 4:5 ratio)
**Content:** What makes PaintBench different — 3 design pillars + evaluation pipeline

**Caption:**
> Why not just use human raters or VLM judges?
>
> Because every PaintBench problem has a **unique correct answer** — moving a shape 50px left produces exactly one valid output. This lets us evaluate with pure pixel math, the same way HumanEval evaluates code by running tests.
>
> Three principles behind the design:
> ⬡ **Primitive operations** — 20 atomic task types, the building blocks of real editing workflows
> ✓ **Deterministically evaluated** — CIE ΔE₇₆ pixel distance, no subjective scores
> ∞ **Dynamically scalable** — fresh problems from any seed, preventing dataset saturation
>
> 🧵 2/3

---

## Figure 3 — `fig3.html`
**File:** `fig3.html` (1080×1350px, 4:5 ratio)
**Content:** TinyGrafixBench — 5 chart types + ranking comparison table

**Caption:**
> Do failures on geometric primitives predict failures on real-world tasks?
>
> We built **TinyGrafixBench** — 600 problems across 5 chart types (bar, scatter, line, heatmap, network graph) — using the same framework. The answer: **yes, completely.**
>
> Rankings transfer almost perfectly from PaintBench to TinyGrafixBench. The model that can't move a triangle can't sort the bars in a chart either. This validates PaintBench as a proxy for real-world chart-editing capability.
>
> Code + data: github.com/PaintBench | Paper: arxiv.org/abs/2506.07220 🧵 3/3

---

## Thread opener (no image)
> 🖼️ We built PaintBench to find out: how precisely do image-editing models execute visual instructions?
>
> Spoiler: even frontier models score just **23.5%** on tasks that take one click in MS Paint.
>
> New benchmark, 1,050 problems, 20 task types, zero model judges. 🧵

---

## Alt text for each figure

**Fig 1:** Four columns showing example PaintBench problems. Each column has: task name and category badge, input image, ground truth answer image, placeholder for model output, and a mIoU score. Below: a leaderboard table showing 5 models with their overall mIoU and per-category scores (Geometric, Structural, Color, Symbolic). Best model: Nano Banana 2 at 23.5%.

**Fig 2:** Dark-background graphic titled "A benchmark built for precision, not preference." Three pillars: (1) Primitive Operations — 20 atomic task types across 4 categories; (2) Deterministically Evaluated — pixel-level CIE ΔE comparison, like HumanEval for code; (3) Dynamically Scalable — infinite fresh problems from random seeds. Below: a 5-step evaluation pipeline (Random Seed → Input Image → Model Output → Pixel Compare → mIoU Score).

**Fig 3:** White-background graphic titled "Failures on primitives generalize to real charts." Shows 5 chart types from TinyGrafixBench (bar, scatter, line, heatmap, network) with example task images. Below: a 4-row table comparing PaintBench vs TinyGrafixBench rankings, showing that the top models on PaintBench are also the top models on TinyGrafixBench.
