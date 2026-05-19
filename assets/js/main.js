/* ── ΔE Slider ───────────────────────────────────────────────── */
const EVAL_DATA = {
  instruction: "Translate the circle right by 13.35% of the image width. Place the transformed shape underneath any possible overlapping shapes. Clip any parts that may extend beyond the image boundary.",
  model: "Nano Banana 2",
  task: "Translation",
  edit_acc:  [70.8, 78.0, 78.4, 78.4, 78.5, 78.5, 78.5, 78.5, 78.5, 78.5, 78.5],
  pres_acc:  [95.5, 97.6, 98.2, 98.2, 98.2, 98.3, 98.3, 98.3, 98.3, 98.3, 98.4],
  iou:       [39.3, 54.4, 58.9, 59.4, 59.7, 60.0, 60.2, 60.4, 60.5, 60.6, 60.7],
};

function threshToImg(t) {
  if (t <= 2) return "assets/img/eval_diff_cie76_0.png";
  if (t <= 7) return "assets/img/eval_diff_cie76_5.png";
  return "assets/img/eval_diff_cie76_10.png";
}

function initSlider() {
  const slider = document.getElementById("de-slider");
  const diffImg = document.getElementById("diff-img");
  const statT   = document.getElementById("stat-t");
  const statEdit = document.getElementById("stat-edit");
  const statIoU  = document.getElementById("stat-iou");
  if (!slider) return;

  function update(t) {
    diffImg.src = threshToImg(t);
    statT.textContent = `ΔE ≤ ${t}`;
    statEdit.textContent = EVAL_DATA.edit_acc[t].toFixed(1) + "%";
    statIoU.textContent  = EVAL_DATA.iou[t].toFixed(1) + "%";
  }

  slider.addEventListener("input", () => update(+slider.value));
  update(0);
}

/* ── Task switcher ───────────────────────────────────────────── */
const TASKS = {
  geo: {
    name: "Geometric Transformation",
    input:  "assets/img/ex_translation_input.png",
    answer: "assets/img/ex_translation_answer.png",
    instruction: "Translate the heart so that its pointy tip aligns with the center of the cyan circle. Place the transformed shape underneath any possible overlapping shapes. Clip any parts that may extend beyond the image boundary.",
  },
  str: {
    name: "Structural Manipulation",
    input:  "assets/img/ex_construction_input.png",
    answer: "assets/img/ex_construction_answer.png",
    instruction: "Draw a filled gray (#808080) polygon with vertices in order at the top edge midpoint of the image, the highest point of the cloud, and the center of the rectangle. Place it on top of any existing shapes.",
  },
  col: {
    name: "Color Change",
    input:  "assets/img/ex_gradient_input.png",
    answer: "assets/img/ex_gradient_answer.png",
    instruction: "Apply a linear RGB gradient from black (#000000) at the top edge to red (#FF0000) at the bottom edge of the interior of the orange outlined region. Recolor only background pixels; keep non-background pixels and the outline as is.",
  },
  sym: {
    name: "Symbolic Reasoning",
    input:  "assets/img/ex_counting_input.png",
    answer: "assets/img/ex_counting_answer.png",
    instruction: "Add one more cyan (#00FFFF) star to the image, matching the size and style of the existing cyan stars.",
  },
};

function initTaxonomy() {
  const btns   = document.querySelectorAll(".cat-btn");
  const panels = document.querySelectorAll(".cat-panel");
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      btns.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const panel = document.getElementById(`panel-${cat}`);
      if (panel) {
        panel.classList.add("active");
        const t = TASKS[cat];
        panel.querySelector(".ex-input").src = t.input;
        panel.querySelector(".ex-answer").src = t.answer;
        panel.querySelector(".ex-instruction").textContent = t.instruction;
      }
    });
  });

  // Activate first by default
  btns[0].click();
}

/* ── Heatmap ─────────────────────────────────────────────────── */
const TASK_ORDER = [
  // Geometric
  { key:"translation", label:"Translation", cat:"geo" },
  { key:"rotation",    label:"Rotation",    cat:"geo" },
  { key:"reflection",  label:"Reflection",  cat:"geo" },
  { key:"scaling",     label:"Scaling",     cat:"geo" },
  { key:"shearing",    label:"Shearing",    cat:"geo" },
  // Structural
  { key:"construction",label:"Construction",cat:"str" },
  { key:"removal",     label:"Removal",     cat:"str" },
  { key:"copying",     label:"Copying",     cat:"str" },
  { key:"border",      label:"Border",      cat:"str" },
  { key:"cropping",    label:"Cropping",    cat:"str" },
  // Color
  { key:"recolor",          label:"Recolor",      cat:"col" },
  { key:"flood_fill",       label:"Flood Fill",   cat:"col" },
  { key:"blending",         label:"Blending",     cat:"col" },
  { key:"gradient",         label:"Gradient",     cat:"col" },
  { key:"point_operations", label:"Point Ops",    cat:"col" },
  // Symbolic
  { key:"comparison",  label:"Comparison",  cat:"sym" },
  { key:"ordering",    label:"Ordering",    cat:"sym" },
  { key:"pattern",     label:"Pattern",     cat:"sym" },
  { key:"counting",    label:"Counting",    cat:"sym" },
  { key:"legend",      label:"Legend",      cat:"sym" },
];

const MODELS_HM = [
  { name:"Nano Banana 2", scores:{ translation:23.9,rotation:16.6,reflection:10.9,scaling:9.0,shearing:4.4,construction:20.0,removal:45.8,copying:14.1,border:27.4,cropping:26.3,recolor:31.2,flood_fill:37.4,blending:8.1,gradient:13.8,point_operations:26.3,comparison:39.8,ordering:21.5,pattern:15.9,counting:18.8,legend:58.8 }, overall:23.5 },
  { name:"GPT Image Edit 2", scores:{ translation:27.2,rotation:19.1,reflection:14.7,scaling:13.8,shearing:12.4,construction:20.6,removal:53.0,copying:15.3,border:25.0,cropping:27.2,recolor:34.2,flood_fill:35.3,blending:7.8,gradient:2.2,point_operations:7.2,comparison:32.7,ordering:24.6,pattern:19.2,counting:16.8,legend:27.8 }, overall:21.8 },
  { name:"Nano Banana 1", scores:{ translation:16.4,rotation:10.2,reflection:10.7,scaling:7.4,shearing:4.7,construction:6.7,removal:33.9,copying:12.2,border:8.6,cropping:12.8,recolor:8.4,flood_fill:14.5,blending:6.7,gradient:4.0,point_operations:10.6,comparison:19.8,ordering:19.8,pattern:10.8,counting:18.8,legend:40.7 }, overall:13.9 },
  { name:"Qwen-Image-Edit", scores:{ translation:7.2,rotation:7.4,reflection:3.9,scaling:2.3,shearing:3.6,construction:4.8,removal:29.4,copying:6.8,border:0.5,cropping:7.9,recolor:6.6,flood_fill:18.2,blending:3.8,gradient:0.3,point_operations:2.3,comparison:14.2,ordering:9.7,pattern:9.1,counting:6.2,legend:0.5 }, overall:7.2 },
  { name:"BAGEL-7B-MoT", scores:{ translation:3.5,rotation:6.6,reflection:3.9,scaling:1.9,shearing:5.3,construction:2.0,removal:29.9,copying:6.0,border:0.2,cropping:14.0,recolor:5.2,flood_fill:3.8,blending:0.3,gradient:0.5,point_operations:0.6,comparison:12.0,ordering:5.5,pattern:6.1,counting:3.9,legend:12.1 }, overall:6.2 },
  { name:"FLUX.2-dev", scores:{ translation:8.5,rotation:9.0,reflection:5.8,scaling:3.0,shearing:4.3,construction:4.7,removal:20.5,copying:0.7,border:0.5,cropping:16.9,recolor:4.3,flood_fill:5.9,blending:0.8,gradient:1.8,point_operations:1.8,comparison:13.0,ordering:6.0,pattern:3.8,counting:1.3,legend:0.4 }, overall:5.6 },
  { name:"FLUX.1-Kontext", scores:{ translation:6.1,rotation:5.5,reflection:3.7,scaling:5.1,shearing:3.6,construction:5.8,removal:14.7,copying:0.8,border:0.3,cropping:10.1,recolor:4.5,flood_fill:5.8,blending:0.8,gradient:0.9,point_operations:1.4,comparison:7.8,ordering:4.4,pattern:1.8,counting:2.4,legend:4.3 }, overall:4.5 },
  { name:"FLUX.2-Klein-9B", scores:{ translation:4.1,rotation:3.4,reflection:1.6,scaling:0.7,shearing:1.3,construction:4.1,removal:24.2,copying:6.3,border:0.0,cropping:5.4,recolor:2.7,flood_fill:3.7,blending:0.2,gradient:1.9,point_operations:1.1,comparison:17.1,ordering:1.1,pattern:2.0,counting:1.3,legend:0.0 }, overall:4.1 },
  { name:"LongCat-Edit", scores:{ translation:2.8,rotation:2.5,reflection:2.5,scaling:1.7,shearing:1.5,construction:2.1,removal:19.2,copying:6.1,border:0.0,cropping:10.6,recolor:1.6,flood_fill:5.3,blending:1.8,gradient:0.2,point_operations:1.8,comparison:3.5,ordering:4.0,pattern:1.1,counting:4.6,legend:1.5 }, overall:3.7 },
  { name:"HunyuanImage-3", scores:{ translation:1.0,rotation:0.4,reflection:0.1,scaling:0.4,shearing:0.6,construction:0.6,removal:1.6,copying:0.1,border:0.2,cropping:1.8,recolor:0.4,flood_fill:0.2,blending:0.0,gradient:0.1,point_operations:0.2,comparison:0.7,ordering:0.3,pattern:0.1,counting:0.4,legend:0.9 }, overall:0.5 },
  { name:"InstructPix2Pix", scores:{ translation:0.1,rotation:0.0,reflection:0.0,scaling:0.0,shearing:0.0,construction:1.2,removal:0.5,copying:0.0,border:0.1,cropping:0.5,recolor:0.4,flood_fill:0.1,blending:0.0,gradient:0.1,point_operations:0.5,comparison:1.1,ordering:0.0,pattern:0.0,counting:0.0,legend:0.0 }, overall:0.2 },
];

const HUE = { geo:218, str:16, col:148, sym:278 };
const SAT = { geo:68, str:65, col:58, sym:70 };

function scoreToColor(score, cat) {
  const h = HUE[cat], s = SAT[cat];
  const l = 97 - (score / 100) * 68;
  return `hsl(${h},${s}%,${l}%)`;
}
function textColor(score) {
  return score > 40 ? "rgba(255,255,255,.92)" : "rgba(20,20,20,.75)";
}

function buildHeatmap() {
  const tbody = document.getElementById("hm-body");
  if (!tbody) return;

  MODELS_HM.forEach(m => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.className = "td-model";
    tdName.textContent = m.name;
    tr.appendChild(tdName);

    const tdOverall = document.createElement("td");
    tdOverall.className = "td-overall";
    tdOverall.textContent = m.overall.toFixed(1);
    tr.appendChild(tdOverall);

    TASK_ORDER.forEach(t => {
      const v = m.scores[t.key] ?? 0;
      const td = document.createElement("td");
      td.style.background = scoreToColor(v, t.cat);
      td.style.color = textColor(v);
      td.innerHTML = `<span class="hm-score">${v.toFixed(0)}</span>`;
      td.title = `${m.name} — ${t.label}: ${v.toFixed(1)}`;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

/* ── TinyGrafixBench heatmap ─────────────────────────────────── */
const TGB_MODELS = [
  { name:"Nano Banana 2",   overall:15.9, bar:38.9, scatter:4.2,  line:11.5, heatmap:20.2, network:4.8  },
  { name:"GPT Image Edit 2",overall:15.6, bar:34.8, scatter:6.8,  line:16.0, heatmap:15.5, network:4.8  },
  { name:"Nano Banana 1",   overall:5.3,  bar:11.5, scatter:3.7,  line:4.7,  heatmap:4.0,  network:2.7  },
  { name:"Qwen-Image-Edit", overall:3.4,  bar:4.8,  scatter:1.3,  line:4.4,  heatmap:4.9,  network:1.6  },
  { name:"FLUX.2-Klein-9B", overall:3.4,  bar:2.9,  scatter:2.1,  line:4.9,  heatmap:4.8,  network:2.4  },
  { name:"LongCat-Edit",    overall:3.2,  bar:2.9,  scatter:1.0,  line:3.2,  heatmap:7.9,  network:0.8  },
  { name:"FLUX.2-dev",      overall:3.1,  bar:2.3,  scatter:4.2,  line:3.8,  heatmap:3.2,  network:1.9  },
  { name:"FLUX.1-Kontext",  overall:3.1,  bar:1.3,  scatter:4.3,  line:4.5,  heatmap:3.5,  network:1.9  },
  { name:"BAGEL-7B-MoT",    overall:2.7,  bar:2.7,  scatter:2.1,  line:4.9,  heatmap:2.0,  network:1.8  },
  { name:"HunyuanImage-3",  overall:0.3,  bar:0.2,  scatter:0.1,  line:0.0,  heatmap:0.9,  network:0.1  },
  { name:"InstructPix2Pix", overall:0.2,  bar:0.1,  scatter:0.3,  line:0.1,  heatmap:0.0,  network:0.1  },
];

const TGB_COLS = [
  { key:"bar",     label:"Bar Chart"   },
  { key:"scatter", label:"Scatter"     },
  { key:"line",    label:"Line Chart"  },
  { key:"heatmap", label:"Heatmap"     },
  { key:"network", label:"Network"     },
];

function buildTgbHeatmap() {
  const tbody = document.getElementById("tgb-hm-body");
  if (!tbody) return;

  TGB_MODELS.forEach(m => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.className = "td-model";
    tdName.textContent = m.name;
    tr.appendChild(tdName);

    const tdOverall = document.createElement("td");
    tdOverall.className = "td-overall";
    tdOverall.textContent = m.overall.toFixed(1);
    tr.appendChild(tdOverall);

    TGB_COLS.forEach(col => {
      const v = m[col.key];
      const td = document.createElement("td");
      td.style.background = scoreToColor(v, "sym");
      td.style.color = textColor(v);
      td.innerHTML = `<span class="hm-score">${v.toFixed(1)}</span>`;
      td.title = `${m.name} — ${col.label}: ${v.toFixed(1)}`;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

/* ── Copy citation ───────────────────────────────────────────── */
function initCopy() {
  const btn = document.getElementById("copy-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const text = document.getElementById("cite-text").textContent;
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = "Copied ✓";
      btn.classList.add("ok");
      setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("ok"); }, 2000);
    });
  });
}

/* ── Boot ────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initSlider();
  initTaxonomy();
  buildHeatmap();
  buildTgbHeatmap();
  initCopy();
});
