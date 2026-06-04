/* ── Nav canvas ──────────────────────────────────────────────── */
function initNavCanvas() {
  const canvas = document.getElementById('nav-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const nav = canvas.closest('nav');
  let mouse = { x: -9999, y: -9999 };

  const SP = 28;          // grid spacing
  const REPEL_R = 68, REPEL_F = 0.5;
  const BLUE = 'rgba(43,94,167,';
  let dots = [], geom = [];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function buildScene() {
    const W = canvas.width, H = canvas.height;
    dots = []; geom = [];

    /* dot grid — minimal jitter so it reads as intentional */
    const cols = Math.ceil(W / SP) + 2;
    const rows = Math.ceil(H / SP) + 1;
    const offY = (H - (rows - 1) * SP) / 2;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const ox = c * SP + rnd(-2, 2), oy = offY + r * SP + rnd(-2, 2);
        dots.push({ x: ox, y: oy, ox, oy, vx: 0, vy: 0 });
      }
    }

    /* 3 partial arcs — spaced across width, radius fits within nav */
    [0.18, 0.52, 0.82].forEach(xf => {
      const r = rnd(10, H * 0.42);
      geom.push({
        kind: 'arc',
        cx: W * xf + rnd(-24, 24), cy: rnd(r + 2, H - r - 2),
        r,
        a0: rnd(0, Math.PI * 2),
        sweep: rnd(0.55, 1.15) * Math.PI,
        rot: (Math.random() < 0.5 ? 1 : -1) * rnd(0.0005, 0.0009),
        t: 0,
      });
    });

    /* 4 measurement lines — nearly horizontal, short, with tick caps */
    for (let i = 0; i < 4; i++) {
      const x1 = rnd(W * 0.05, W * 0.75);
      const y1 = rnd(H * 0.2, H * 0.8);
      const len = rnd(55, 110), angle = rnd(-0.12, 0.12);
      const x2 = x1 + Math.cos(angle) * len;
      const y2 = Math.min(H - 5, Math.max(5, y1 + Math.sin(angle) * len));
      geom.push({ kind: 'line', x1, y1, x2, y2 });
    }
  }

  function resize() {
    canvas.width = nav.offsetWidth;
    canvas.height = nav.offsetHeight;
    buildScene();
  }
  resize();
  window.addEventListener('resize', resize);

  nav.addEventListener('mousemove', e => {
    const rc = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rc.left; mouse.y = e.clientY - rc.top;
  });
  nav.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* physics */
    dots.forEach(d => {
      const mx = d.x - mouse.x, my = d.y - mouse.y;
      const md = Math.sqrt(mx * mx + my * my);
      if (md < REPEL_R && md > 0) {
        const f = (1 - md / REPEL_R) * REPEL_F;
        d.vx += (mx / md) * f; d.vy += (my / md) * f;
      }
      d.vx += (d.ox - d.x) * 0.06; d.vy += (d.oy - d.y) * 0.06;
      d.vx *= 0.78; d.vy *= 0.78;
      d.x += d.vx; d.y += d.vy;
    });

    /* connections — only direct neighbors */
    ctx.lineWidth = 0.65;
    ctx.setLineDash([2, 5]);
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
        if (Math.abs(dx) > SP * 1.4 || Math.abs(dy) > SP * 1.4) continue;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < SP * 1.4) {
          ctx.strokeStyle = `rgba(20,20,20,${(1 - dist / (SP * 1.4)) * 0.2})`;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }

    /* arcs */
    geom.filter(g => g.kind === 'arc').forEach(g => {
      g.t += g.rot;
      ctx.strokeStyle = BLUE + '0.42)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.arc(g.cx, g.cy, g.r, g.a0 + g.t, g.a0 + g.t + g.sweep);
      ctx.stroke();
    });

    /* measurement lines */
    geom.filter(g => g.kind === 'line').forEach(g => {
      ctx.strokeStyle = BLUE + '0.36)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(g.x1, g.y1); ctx.lineTo(g.x2, g.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = BLUE + '0.5)';
      const ang = Math.atan2(g.y2 - g.y1, g.x2 - g.x1) + Math.PI / 2;
      [[g.x1, g.y1], [g.x2, g.y2]].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.moveTo(px + Math.cos(ang) * 4, py + Math.sin(ang) * 4);
        ctx.lineTo(px - Math.cos(ang) * 4, py - Math.sin(ang) * 4);
        ctx.stroke();
      });
    });

    ctx.setLineDash([]);

    /* dots */
    dots.forEach(d => {
      ctx.fillStyle = 'rgba(20,20,20,0.36)';
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2); ctx.fill();
    });

    /* ruler ticks */
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 8) {
      const h = x % 40 === 0 ? 6 : x % 20 === 0 ? 3.5 : 1.5;
      ctx.strokeStyle = x % 40 === 0 ? 'rgba(20,20,20,0.28)' : 'rgba(20,20,20,0.16)';
      ctx.beginPath();
      ctx.moveTo(x + 0.5, canvas.height - h); ctx.lineTo(x + 0.5, canvas.height);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }
  draw();
}

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

/* ── Task data: all 20 tasks (baseline examples from the benchmark) ─ */
const TASKS = {
  // Geometric Transformation
  translation: {
    cat: "geo", label: "Translation",
    input:  "assets/img/ex_translation_input.png",
    answer: "assets/img/ex_translation_answer.png",
    output: "assets/img/ex_translation_output.png", model: "GPT Image 2",
    instruction: "Translate the red circle down by 29.75% of the image height. Place the transformed shape on top of any possible overlapping shapes. Clip any parts that may extend beyond the image boundary.",
  },
  rotation: {
    cat: "geo", label: "Rotation",
    input:  "assets/img/ex_rotation_input.png",
    answer: "assets/img/ex_rotation_answer.png",
    output: "assets/img/ex_rotation_output.png", model: "BAGEL",
    instruction: "Rotate the red shape by 246\u00b0 clockwise about its highest point. Place the transformed shape underneath any possible overlapping shapes. Clip any parts that may extend beyond the image boundary.",
  },
  reflection: {
    cat: "geo", label: "Reflection",
    input:  "assets/img/ex_reflection_input.png",
    answer: "assets/img/ex_reflection_answer.png",
    output: "assets/img/ex_reflection_output.png", model: "FLUX.1-Kt",
    instruction: "Reflect the green shape across the line that passes through the leftmost edge midpoint of the brown cross and the 30-degree vertex of the green triangle. Place the transformed shape underneath any possible overlapping shapes. Clip any parts that may extend beyond the image boundary.",
  },
  scaling: {
    cat: "geo", label: "Scaling",
    input:  "assets/img/ex_scaling_input.png",
    answer: "assets/img/ex_scaling_answer.png",
    output: "assets/img/ex_scaling_output.png", model: "BAGEL",
    instruction: "Scale the brown shape uniformly so its bounding box height matches the bounding box height of the white shape, keeping its bottom-right bounding box corner fixed.",
  },
  shearing: {
    cat: "geo", label: "Shearing",
    input:  "assets/img/ex_shearing_input.png",
    answer: "assets/img/ex_shearing_answer.png",
    output: "assets/img/ex_shearing_output.png", model: "FLUX.2-D",
    instruction: "Shear the cross so its right bounding box edge shifts down by 58% of its bounding box height, keeping the left bounding box edge fixed. Place the transformed shape on top of any possible overlapping shapes. Clip any parts that may extend beyond the image boundary.",
  },
  // Structural Manipulation
  construction: {
    cat: "str", label: "Construction",
    input:  "assets/img/ex_construction_input.png",
    answer: "assets/img/ex_construction_answer.png",
    output: "assets/img/ex_construction_output.png", model: "Nano Banana 2",
    instruction: "Draw a filled purple (#800080) circle with diameter endpoints at (6.11%, 16.49%) and (24.29%, 13.39%). Place it on top of any existing shapes. Clip any parts that may extend beyond the image boundary.",
  },
  removal: {
    cat: "str", label: "Removal",
    input:  "assets/img/ex_removal_input.png",
    answer: "assets/img/ex_removal_answer.png",
    output: "assets/img/ex_removal_output.png", model: "GPT Image 2",
    instruction: "Remove the purple star.",
  },
  copying: {
    cat: "str", label: "Copying",
    input:  "assets/img/ex_copying_input.png",
    answer: "assets/img/ex_copying_answer.png",
    output: "assets/img/ex_copying_output.png", model: "Nano Banana 2",
    instruction: "Copy the shapes (ignoring background) in the right outlined square into the left outlined square, maintaining the exact shape positions.",
  },
  border: {
    cat: "str", label: "Border",
    input:  "assets/img/ex_border_input.png",
    answer: "assets/img/ex_border_answer.png",
    output: "assets/img/ex_border_output.png", model: "Nano Banana 2",
    instruction: "Color all pixels within a Euclidean distance of at most 3.2% image width from any pixel in the orange heart to black (#000000), without recoloring the shape itself.",
  },
  cropping: {
    cat: "str", label: "Cropping",
    input:  "assets/img/ex_cropping_input.png",
    answer: "assets/img/ex_cropping_answer.png",
    output: "assets/img/ex_cropping_output.png", model: "FLUX.2-Kl",
    instruction: "Crop to the interior of the outlined region, deskewing so that the highest corner of the region interior corresponds to the top-left corner of the cropped image. Scale to fill the canvas using nearest-neighbor interpolation.",
  },
  // Color Change
  recolor: {
    cat: "col", label: "Recolor",
    input:  "assets/img/ex_recolor_input.png",
    answer: "assets/img/ex_recolor_answer.png",
    output: "assets/img/ex_recolor_output.png", model: "FLUX.2-D",
    instruction: "Recolor the cloud to the color of the shape at (67.48%, 39.45%).",
  },
  flood_fill: {
    cat: "col", label: "Flood Fill",
    input:  "assets/img/ex_flood_fill_input.png",
    answer: "assets/img/ex_flood_fill_answer.png",
    output: "assets/img/ex_flood_fill_output.png", model: "BAGEL",
    instruction: "Recolor all non-background pixels inside the green outlined polygon to pink (#FFC0CB). Keep the outline as is.",
  },
  blending: {
    cat: "col", label: "Blending",
    input:  "assets/img/ex_blending_input.png",
    answer: "assets/img/ex_blending_answer.png",
    output: "assets/img/ex_blending_output.png", model: "Nano Banana 2",
    instruction: "Blend the color green (#00FF00) at 18% opacity over all pixels inside the black outlined polygon. Keep the outline as is.",
  },
  gradient: {
    cat: "col", label: "Gradient",
    input:  "assets/img/ex_gradient_input.png",
    answer: "assets/img/ex_gradient_answer.png",
    output: "assets/img/ex_gradient_output.png", model: "FLUX.1-Kt",
    instruction: "Apply a linear RGB gradient from gray (#808080) at the bottom-right corner to purple (#800080) at the top-left corner of the interior of the black outlined region. Recolor only background pixels; keep non-background pixels and the outline as is.",
  },
  point_operations: {
    cat: "col", label: "Point Operations",
    input:  "assets/img/ex_point_operations_input.png",
    answer: "assets/img/ex_point_operations_answer.png",
    output: "assets/img/ex_point_operations_output.png", model: "LCat-IE",
    instruction: "Invert the colors of all pixels inside the red outlined polygon. Keep the outline as is.",
  },
  // Symbolic Reasoning
  comparison: {
    cat: "sym", label: "Comparison",
    input:  "assets/img/ex_comparison_input.png",
    answer: "assets/img/ex_comparison_answer.png",
    output: "assets/img/ex_comparison_output.png", model: "Nano Banana 2",
    instruction: "Remove the tallest purple shape.",
  },
  ordering: {
    cat: "sym", label: "Ordering",
    input:  "assets/img/ex_ordering_input.png",
    answer: "assets/img/ex_ordering_answer.png",
    output: "assets/img/ex_ordering_output.png", model: "GPT Image 2",
    instruction: "Rearrange the semicircle shapes left-to-right in increasing order of size, keeping each shape in the same position inside its box.",
  },
  pattern: {
    cat: "sym", label: "Pattern",
    input:  "assets/img/ex_pattern_input.png",
    answer: "assets/img/ex_pattern_answer.png",
    output: "assets/img/ex_pattern_output.png", model: "FLUX.2-Kl",
    instruction: "Fill in the missing shape in this 5\u00d710 pattern.",
  },
  counting: {
    cat: "sym", label: "Counting",
    input:  "assets/img/ex_counting_input.png",
    answer: "assets/img/ex_counting_answer.png",
    output: "assets/img/ex_counting_output.png", model: "LCat-IE",
    instruction: "The white shapes arranged in a line on the right of the image are used as tallies. Remove tallies from the top so the number of tallies equals the number of green shapes.",
  },
  legend: {
    cat: "sym", label: "Legend",
    input:  "assets/img/ex_legend_input.png",
    answer: "assets/img/ex_legend_answer.png",
    output: "assets/img/ex_legend_output.png", model: "GPT Image 2",
    instruction: "Apply the legend at the bottom of the image. Recolor shapes whose color points to a new color, and remove shapes whose color points to an X. Keep the legend in place.",
  },
};

/* ── Task switcher (category accordion + per-task) ───────────── */
function initTaxonomy() {
  const catBtns  = document.querySelectorAll(".cat-btn");
  const taskBtns = document.querySelectorAll(".task-btn");
  if (!catBtns.length) return;

  const exInput     = document.getElementById("ex-input");
  const exAnswer    = document.getElementById("ex-answer");
  const exOutput    = document.getElementById("ex-output");
  const exModelName = document.getElementById("ex-model-name");
  const exInstr     = document.getElementById("ex-instr");

  function showTask(taskKey) {
    const t = TASKS[taskKey];
    if (!t) return;
    exInput.src  = t.input;
    exAnswer.src = t.answer;
    if (exOutput)    exOutput.src = t.output;
    if (exModelName) exModelName.textContent = t.model || "";
    exInstr.textContent = t.instruction;
    taskBtns.forEach(b => {
      b.classList.toggle("active", b.dataset.task === taskKey);
    });
  }

  function showCat(cat) {
    catBtns.forEach(b => b.classList.toggle("active", b.dataset.cat === cat));
    ["geo", "str", "col", "sym"].forEach(c => {
      const el = document.getElementById(`tasks-${c}`);
      if (el) el.style.display = c === cat ? "flex" : "none";
    });
    showTask(CAT_TASKS[cat][0]);
  }

  catBtns.forEach(btn => {
    btn.addEventListener("click", () => showCat(btn.dataset.cat));
  });
  taskBtns.forEach(btn => {
    btn.addEventListener("click", () => showTask(btn.dataset.task));
  });

  showCat("geo");
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
  { name:"Nano Banana 2",   scores:{ translation:12.3,rotation:7.6, reflection:4.4,scaling:3.0,shearing:3.1,construction:15.7,removal:45.8,copying:14.0,border:18.9,cropping:19.1,recolor:30.4,flood_fill:24.8,blending:5.3, gradient:13.0,point_operations:12.3,comparison:16.1,ordering:20.0,pattern:13.4,counting:16.3,legend:47.1 }, overall:17.1 },
  { name:"GPT Image Edit 2",scores:{ translation:17.5,rotation:13.2,reflection:9.1,scaling:7.8,shearing:7.8,construction:14.3,removal:50.6,copying:13.9,border:15.2,cropping:28.5,recolor:27.1,flood_fill:27.1,blending:6.4, gradient:1.4, point_operations:5.4, comparison:10.7,ordering:21.0,pattern:13.7,counting:14.9,legend:19.4 }, overall:16.3 },
  { name:"Nano Banana 1",   scores:{ translation:9.6, rotation:7.1, reflection:5.1,scaling:4.6,shearing:4.4,construction:4.8, removal:31.5,copying:12.8,border:4.6, cropping:9.5, recolor:5.7, flood_fill:11.2,blending:2.6, gradient:2.9, point_operations:7.4, comparison:14.3,ordering:18.2,pattern:8.7, counting:14.8,legend:36.7 }, overall:11.1 },
  { name:"Qwen-Image-Edit", scores:{ translation:5.3, rotation:5.5, reflection:3.0,scaling:1.9,shearing:1.4,construction:5.3, removal:25.1,copying:6.0, border:0.6, cropping:7.8, recolor:5.8, flood_fill:16.3,blending:1.2, gradient:0.7, point_operations:2.2, comparison:12.9,ordering:8.0, pattern:8.0, counting:8.4, legend:1.1  }, overall:6.7  },
  { name:"BAGEL-7B-MoT",   scores:{ translation:3.6, rotation:4.0, reflection:1.8,scaling:1.0,shearing:1.4,construction:1.0, removal:25.7,copying:4.9, border:0.1, cropping:16.5,recolor:6.3, flood_fill:2.3, blending:1.1, gradient:0.2, point_operations:0.7, comparison:4.2, ordering:5.1, pattern:4.4, counting:5.5, legend:6.1  }, overall:5.0  },
  { name:"FLUX.2-dev",     scores:{ translation:4.5, rotation:5.6, reflection:4.0,scaling:0.8,shearing:1.6,construction:3.4, removal:19.4,copying:1.4, border:0.4, cropping:14.7,recolor:4.6, flood_fill:4.9, blending:0.7, gradient:0.8, point_operations:2.1, comparison:6.2, ordering:6.2, pattern:5.4, counting:1.6, legend:0.7  }, overall:4.6  },
  { name:"FLUX.1-Kontext",  scores:{ translation:2.7, rotation:3.0, reflection:2.5,scaling:1.8,shearing:1.6,construction:5.3, removal:21.0,copying:0.8, border:0.3, cropping:9.2, recolor:2.0, flood_fill:2.6, blending:1.7, gradient:0.5, point_operations:1.1, comparison:6.0, ordering:3.9, pattern:2.3, counting:1.9, legend:3.6  }, overall:3.9  },
  { name:"LongCat-Edit",   scores:{ translation:3.9, rotation:2.9, reflection:2.5,scaling:0.7,shearing:1.2,construction:2.4, removal:18.5,copying:3.2, border:0.1, cropping:10.9,recolor:2.4, flood_fill:4.7, blending:0.9, gradient:0.1, point_operations:0.9, comparison:7.5, ordering:4.5, pattern:0.9, counting:2.2, legend:2.4  }, overall:3.6  },
  { name:"FLUX.2-Klein-9B",scores:{ translation:3.0, rotation:1.9, reflection:1.1,scaling:0.8,shearing:0.5,construction:3.1, removal:20.3,copying:4.5, border:0.1, cropping:5.4, recolor:4.1, flood_fill:3.8, blending:1.2, gradient:1.1, point_operations:1.7, comparison:8.2, ordering:1.8, pattern:3.2, counting:2.3, legend:0.5  }, overall:3.5  },
  { name:"HunyuanImage-3", scores:{ translation:0.1, rotation:0.1, reflection:0.0,scaling:0.2,shearing:0.0,construction:0.6, removal:3.0, copying:0.1, border:0.1, cropping:1.1, recolor:0.3, flood_fill:0.3, blending:0.1, gradient:0.1, point_operations:0.3, comparison:0.4, ordering:0.2, pattern:0.4, counting:0.3, legend:0.1  }, overall:0.4  },
  { name:"InstructPix2Pix",scores:{ translation:0.0, rotation:0.1, reflection:0.0,scaling:0.0,shearing:0.0,construction:1.2, removal:3.2, copying:0.0, border:0.1, cropping:0.1, recolor:0.4, flood_fill:0.2, blending:0.1, gradient:0.0, point_operations:0.6, comparison:0.5, ordering:0.1, pattern:0.0, counting:0.0, legend:0.0  }, overall:0.3  },
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

/* ── TGB carousel ────────────────────────────────────────────── */
const TGB_TASKS = [
  { key:"bar_chart_add_bar",               chart:"Bar Chart",   task:"Add Bar",            cat:"tgb-bar",     hl:'Add the bar',              instruction:'Add the bar for "aLid" with value 0.805 and color #E8CA94.' },
  { key:"bar_chart_recolor_bar",           chart:"Bar Chart",   task:"Recolor Bar",         cat:"tgb-bar",     hl:'Recolor the bar',          instruction:'Recolor the bar for "zjYi" to #DE9C7F.' },
  { key:"bar_chart_remove_bar",            chart:"Bar Chart",   task:"Remove Bar",          cat:"tgb-bar",     hl:'Remove the bar',           instruction:'Remove the bar and label for "NgifvfB". Keep everything else in the same place.' },
  { key:"bar_chart_sort_bars",             chart:"Bar Chart",   task:"Sort Bars",           cat:"tgb-bar",     hl:'Sort the bars',            instruction:"Sort the bars in ascending order, moving the corresponding labels." },
  { key:"scatter_plot_draw_best_fit_line", chart:"Scatter Plot",task:"Draw Best-Fit Line",  cat:"tgb-scatter", hl:'Draw the line of best fit',instruction:"Draw the line of best fit for the class of points without a line. Use the same color as those points and the same thickness as the existing line." },
  { key:"scatter_plot_recolor_class",      chart:"Scatter Plot",task:"Recolor Class",       cat:"tgb-scatter", hl:'Recolor the line',         instruction:"Recolor the line of best fit and its corresponding points to #90827B." },
  { key:"scatter_plot_remove_outlier",     chart:"Scatter Plot",task:"Remove Outlier",      cat:"tgb-scatter", hl:'remove the point',         instruction:"In the class of points with the line of best fit, remove the point that is vertically furthest from the line. Keep the line in place." },
  { key:"scatter_plot_swap_axes",          chart:"Scatter Plot",task:"Swap Axes",           cat:"tgb-scatter", hl:'Swap the x and y',         instruction:"Swap the x and y coordinates of every point and the line of best fit." },
  { key:"line_chart_draw_segments",        chart:"Line Chart",  task:"Draw Segments",       cat:"tgb-line",    hl:'Connect the gaps',         instruction:"Connect the gaps with straight segments in the same width and color as existing segments." },
  { key:"line_chart_filter_series",        chart:"Line Chart",  task:"Filter Series",       cat:"tgb-line",    hl:'Only show the parts',      instruction:'Only show the parts of the series where "otV" is at least 208.' },
  { key:"line_chart_normalize_series",     chart:"Line Chart",  task:"Normalize Series",    cat:"tgb-line",    hl:'Scale and shift',          instruction:'Scale and shift the series vertically so its lowest point corresponds to −60.6 and its highest point corresponds to 125. Keep the axes unchanged.' },
  { key:"line_chart_shade_interval",       chart:"Line Chart",  task:"Shade Interval",      cat:"tgb-line",    hl:'Shade the area',           instruction:'Shade the area under the series between x = 1.82e+04 and x = 4.61e+04 with the color #5972AC.' },
  { key:"heatmap_add_cell",                chart:"Heatmap",     task:"Add Cell",            cat:"tgb-heatmap", hl:'Fill the empty cell',      instruction:"Fill the empty cell at row 2, column 5 (1-based, top-left) with the color corresponding to value −4.78e+03." },
  { key:"heatmap_change_colormap",         chart:"Heatmap",     task:"Change Colormap",     cat:"tgb-heatmap", hl:'Edit the heatmap',         instruction:"Edit the heatmap and key to use a gradient with a low-value color of #DED675 and a high-value color of #59ED27." },
  { key:"heatmap_mask_cells",              chart:"Heatmap",     task:"Mask Cells",          cat:"tgb-heatmap", hl:'Remove every cell',        instruction:"Remove every cell with a value greater than 0.059." },
  { key:"heatmap_shift_heatmap",           chart:"Heatmap",     task:"Shift Heatmap",       cat:"tgb-heatmap", hl:'Shift the heatmap',        instruction:"Shift the heatmap 2 cells down. Cells that fall off the edge are discarded; exposed cells become empty." },
  { key:"network_add_node",                chart:"Network",     task:"Add Node",            cat:"tgb-network", hl:'Add the node',             instruction:'Add the node "NexDt" so that all nodes are evenly spaced on a circle. Connect it to "ONZi".' },
  { key:"network_recolor_node",            chart:"Network",     task:"Recolor Node",        cat:"tgb-network", hl:'Recolor node',             instruction:'Recolor node "oav" to #8F7145. Update the color in both the graph and the key.' },
  { key:"network_remove_node",             chart:"Network",     task:"Remove Node",         cat:"tgb-network", hl:'Remove node',              instruction:'Remove node "Qxl" and its incident edges. Leave the key unchanged.' },
  { key:"network_swap_nodes",              chart:"Network",     task:"Swap Nodes",          cat:"tgb-network", hl:'Swap the positions',       instruction:'Swap the positions of nodes "dKMlN" and "NTpp".' },
];

function buildTgbCarousel() {
  const track = document.getElementById('tgb-marquee-track');
  if (!track) return;

  const makeCard = t => {
    const div = document.createElement('div');
    div.className = 'tgb-v-card';
    div.innerHTML = `
      <div class="tgb-v-card-type">${t.chart} &nbsp;·&nbsp; ${t.task}</div>
      <div class="tgb-v-card-imgs">
        <img src="assets/img/tgb_examples/${t.key}_input.png"  alt="Input"        loading="lazy" />
        <div class="tgb-v-arrow">→</div>
        <img src="assets/img/tgb_examples/${t.key}_answer.png" alt="Ground truth" loading="lazy" />
      </div>
      <p class="tgb-v-card-instruction">${t.hl ? t.instruction.replace(t.hl, `<mark class="tgb-hl">${t.hl}</mark>`) : t.instruction}</p>`;
    return div;
  };

  // Two copies for seamless infinite loop
  [...TGB_TASKS, ...TGB_TASKS].forEach(t => track.appendChild(makeCard(t)));
}

/* ── TinyGrafixBench heatmap ─────────────────────────────────── */
const TGB_MODELS = [
  { name:"Nano Banana 2",   overall:15.9, bar:38.9, scatter:4.2,  line:11.5, heatmap:20.2, network:4.8  },
  { name:"GPT Image Edit 2",overall:15.6, bar:34.8, scatter:6.8,  line:16.0, heatmap:15.5, network:4.8  },
  { name:"Nano Banana 1",   overall:5.3,  bar:11.5, scatter:3.7,  line:4.7,  heatmap:4.0,  network:2.7  },
  { name:"Qwen-Image-Edit", overall:4.3,  bar:4.8,  scatter:1.3,  line:4.4,  heatmap:4.9,  network:1.6  },
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

/* ── Stat count-up ───────────────────────────────────────────── */
function initStatCountUp() {
  const cells = document.querySelectorAll('.stat-val');
  if (!cells.length) return;

  const targets = [
    { el: cells[0], end: 20,   decimals: 0, suffix: '' },
    { el: cells[2], end: 17.1, decimals: 1, suffix: '%' },
  ];

  function countUp(stat) {
    const duration = 900, start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = ease * stat.end;
      stat.el.textContent = (stat.decimals === 0
        ? Math.round(val).toLocaleString()
        : val.toFixed(stat.decimals)) + stat.suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function countUpInfinity(el) {
    const duration = 1100, start = performance.now();
    // Numbers accelerate from small → large → ∞
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      if (p >= 1) { el.textContent = '∞'; return; }
      // Exponential ramp: starts slow, blows up near end
      const val = Math.round(Math.pow(p, 2) * 9999 + 1);
      el.textContent = val.toLocaleString();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      targets.forEach(countUp);
      countUpInfinity(cells[1]);
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(document.querySelector('.stats-bar'));
}

/* ── Model Explorer ──────────────────────────────────────────── */
const CAT_TASKS = {
  geo: ['translation','rotation','reflection','scaling','shearing'],
  str: ['construction','removal','copying','border','cropping'],
  col: ['recolor','flood_fill','blending','gradient','point_operations'],
  sym: ['comparison','ordering','pattern','counting','legend'],
};
const CAT_LABELS  = { geo:'Geometric', str:'Structural', col:'Color', sym:'Symbolic' };
const TASK_LABELS = {
  translation:'Translation', rotation:'Rotation', reflection:'Reflection',
  scaling:'Scaling', shearing:'Shearing', construction:'Construction',
  removal:'Removal', copying:'Copying', border:'Border', cropping:'Cropping',
  recolor:'Recolor', flood_fill:'Flood Fill', blending:'Blending',
  gradient:'Gradient', point_operations:'Point Ops',
  comparison:'Comparison', ordering:'Ordering', pattern:'Pattern',
  counting:'Counting', legend:'Legend',
};

const MODEL_ABBR = {
  'Nano Banana 2':   'NB-2',    'GPT Image Edit 2': 'GPT-I2',
  'Nano Banana 1':   'NB-1',    'Qwen-Image-Edit':  'Qwen-IE',
  'BAGEL-7B-MoT':    'BAGEL',   'FLUX.2-dev':       'FLUX.2-D',
  'FLUX.1-Kontext':  'FLUX.1-Kt','LongCat-Edit':    'LCat-IE',
  'FLUX.2-Klein-9B': 'FLUX.2-Kl','HunyuanImage-3':  'HY-3',
  'InstructPix2Pix': 'IP2P',
};
// manual label offsets [dx-from-circle-edge, dy, text-anchor]
const SC_LBL = {
  'NB-2':     [  6, -5, 'start'], 'GPT-I2':   [  6, -5, 'start'],
  'NB-1':     [  6, -5, 'start'], 'Qwen-IE':  [  6, -7, 'start'],
  'BAGEL':    [  6,  5, 'start'], 'FLUX.2-D': [ -4, -8, 'end'  ],
  'FLUX.1-Kt':[  6, 11, 'start'], 'LCat-IE':  [ -4, 11, 'end'  ],
  'FLUX.2-Kl':[ -4, -7, 'end'  ], 'HY-3':     [  5, -5, 'start'],
  'IP2P':     [ -4, 10, 'end'  ],
};

function buildModelExplorer() {
  const svg = document.getElementById('model-scatter');
  if (!svg) return;

  const ns = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, text) => {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    if (text !== undefined) el.textContent = text;
    return el;
  };

  const W = 760, H = 420;
  const pad = { top: 28, right: 28, bottom: 50, left: 52 };
  const pw = W - pad.left - pad.right, ph = H - pad.top - pad.bottom;
  const maxX = 20, maxY = 22;
  const sx = v => pad.left + (v / maxX) * pw;
  const sy = v => pad.top + ph - (v / maxY) * ph;
  const sr = v => 3.5 + (v / 17.1) * 12.5;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');

  // compute scatter coords
  const pts = MODELS_HM.map(m => {
    const avg = keys => keys.reduce((s, k) => s + (m.scores[k] || 0), 0) / keys.length;
    return {
      name: m.name, abbr: MODEL_ABBR[m.name] || m.name,
      x: (avg(CAT_TASKS.geo) + avg(CAT_TASKS.str)) / 2,
      y: (avg(CAT_TASKS.col) + avg(CAT_TASKS.sym)) / 2,
      overall: m.overall,
    };
  });

  // gridlines + tick labels
  const gg = mk('g', {});
  for (let v = 0; v <= 20; v += 5) {
    gg.appendChild(mk('line', { x1:sx(v), y1:pad.top, x2:sx(v), y2:pad.top+ph, stroke:'rgba(20,20,20,.07)', 'stroke-width':1 }));
    gg.appendChild(mk('text', { x:sx(v), y:pad.top+ph+16, 'text-anchor':'middle', fill:'rgba(20,20,20,.38)', 'font-size':10, 'font-family':'Inter,sans-serif' }, String(v)));
  }
  for (let v = 5; v <= 20; v += 5) {
    gg.appendChild(mk('line', { x1:pad.left, y1:sy(v), x2:pad.left+pw, y2:sy(v), stroke:'rgba(20,20,20,.07)', 'stroke-width':1 }));
    gg.appendChild(mk('text', { x:pad.left-8, y:sy(v)+4, 'text-anchor':'end', fill:'rgba(20,20,20,.38)', 'font-size':10, 'font-family':'Inter,sans-serif' }, String(v)));
  }
  svg.appendChild(gg);

  // axes
  const ag = mk('g', { stroke:'rgba(20,20,20,.2)', 'stroke-width':1, fill:'none' });
  ag.appendChild(mk('line', { x1:pad.left, y1:pad.top,    x2:pad.left,    y2:pad.top+ph }));
  ag.appendChild(mk('line', { x1:pad.left, y1:pad.top+ph, x2:pad.left+pw, y2:pad.top+ph }));
  svg.appendChild(ag);

  // parity line y = x
  const diagEnd = Math.min(maxX, maxY);
  const dg = mk('g', {});
  dg.appendChild(mk('line', { x1:sx(0), y1:sy(0), x2:sx(diagEnd), y2:sy(diagEnd), stroke:'rgba(20,20,20,.11)', 'stroke-width':1, 'stroke-dasharray':'4 4', fill:'none' }));
  dg.appendChild(mk('text', { x:sx(9)+6, y:sy(9)-5, fill:'rgba(20,20,20,.22)', 'font-size':9, 'font-style':'italic', 'font-family':'Inter,sans-serif' }, 'parity'));
  svg.appendChild(dg);

  // axis labels
  svg.appendChild(mk('text', { x:pad.left+pw/2, y:H-4, 'text-anchor':'middle', fill:'rgba(20,20,20,.5)', 'font-size':11, 'font-weight':500, 'font-family':'Inter,sans-serif' }, 'Geometric & Structural avg. mIoU (%)'));
  const ylg = mk('g', { transform:'rotate(-90)' });
  ylg.appendChild(mk('text', { x:-(pad.top+ph/2), y:13, 'text-anchor':'middle', fill:'rgba(20,20,20,.5)', 'font-size':11, 'font-weight':500, 'font-family':'Inter,sans-serif' }, 'Color & Symbolic avg. mIoU (%)'));
  svg.appendChild(ylg);

  // model colors
  const COLORS = { 'NB-2':'#5B2085', 'GPT-I2':'#2B5EA7', 'NB-1':'#1D6645' };
  const MUTED = '#A0A09A';

  const dotsG = mk('g', {}), labelsG = mk('g', {});
  pts.forEach(p => {
    const cx = sx(p.x), cy = sy(p.y), r = sr(p.overall);
    const color = COLORS[p.abbr] || MUTED;
    const top3  = !!COLORS[p.abbr];

    const circ = mk('circle', { cx, cy, r, fill:color, 'fill-opacity': top3 ? 0.82 : 0.48,
      stroke:color, 'stroke-width': top3 ? 1.5 : 0.8 });
    circ.appendChild(mk('title', {}, `${p.name}\nOverall: ${p.overall.toFixed(1)}%\nGeo+Str: ${p.x.toFixed(1)}  Col+Sym: ${p.y.toFixed(1)}`));
    dotsG.appendChild(circ);

    const [dx, dy, anchor] = SC_LBL[p.abbr] || [6, -5, 'start'];
    const lx = anchor === 'end' ? cx - r + dx : cx + r + dx;
    labelsG.appendChild(mk('text', { x:lx, y:cy+dy, 'text-anchor':anchor, fill:color,
      'font-size': top3 ? 11 : 9.5, 'font-weight': top3 ? 700 : 400,
      'font-family':'Inter,sans-serif', 'pointer-events':'none' }, p.abbr));
  });

  svg.appendChild(dotsG);
  svg.appendChild(labelsG);
}

/* ── Boot ────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initNavCanvas();
  initStatCountUp();
  initSlider();
  initTaxonomy();
  buildHeatmap();
  buildTgbCarousel();
  buildTgbHeatmap();
  buildModelExplorer();
  initCopy();
});
