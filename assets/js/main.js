/* ═══════════════════════════════════════════════════════════
   PaintBench — main.js
   ═══════════════════════════════════════════════════════════ */

/* ── Task definitions (cycling order: geo→str→col→sym) ── */
const GALLERY_ORDER = [
  // Round 1
  { key:"translation",      cat:"geo", label:"Translation",       instruction:"Translate the heart so that its pointy tip aligns with the center of the cyan circle." },
  { key:"construction",     cat:"str", label:"Construction",      instruction:"Draw a filled polygon with the given vertices on top of existing shapes." },
  { key:"recolor",          cat:"col", label:"Recolor",           instruction:"Recolor the maroon star to the target hex color value #42AEFF." },
  { key:"comparison",       cat:"sym", label:"Comparison",        instruction:"Remove the shape that is largest among all shapes in the scene." },
  // Round 2
  { key:"rotation",         cat:"geo", label:"Rotation",          instruction:"Rotate the teal rectangle 90° clockwise around its center." },
  { key:"removal",          cat:"str", label:"Removal",           instruction:"Remove the specified shape from the scene, filling the region with the background color." },
  { key:"flood_fill",       cat:"col", label:"Flood Fill",        instruction:"Flood fill the region inside the outlined polygon with the specified color." },
  { key:"ordering",         cat:"sym", label:"Ordering",          instruction:"Reorder the shapes by size, placing the largest at the top of the image." },
  // Round 3
  { key:"reflection",       cat:"geo", label:"Reflection",        instruction:"Reflect the specified shape across the vertical axis of the image." },
  { key:"copying",          cat:"str", label:"Copying",           instruction:"Copy the specified shape and place the copy in the opposite quadrant of the canvas." },
  { key:"blending",         cat:"col", label:"Blending",          instruction:"Blend the specified shape with cyan at 60% alpha." },
  { key:"pattern",          cat:"sym", label:"Pattern",           instruction:"Tile the specified shape pattern across the full canvas." },
  // Round 4
  { key:"scaling",          cat:"geo", label:"Scaling",           instruction:"Scale the orange circle to 200% of its current size around its center." },
  { key:"border",           cat:"str", label:"Border",            instruction:"Draw a 12px border around the specified shape using the target color." },
  { key:"gradient",         cat:"col", label:"Gradient",          instruction:"Apply a linear gradient from black at the top to red at the bottom inside the outlined region." },
  { key:"counting",         cat:"sym", label:"Counting",          instruction:"Count the number of triangles in the scene and write the numeral in the center of the canvas." },
  // Round 5
  { key:"shearing",         cat:"geo", label:"Shearing",          instruction:"Apply a horizontal shear transformation with factor 0.4 to the specified shape." },
  { key:"cropping",         cat:"str", label:"Cropping",          instruction:"Crop to the interior of the outlined region and scale to fill the canvas." },
  { key:"point_operations", cat:"col", label:"Point Operations",  instruction:"Invert the pixel colors of all pixels inside the outlined polygon." },
  { key:"legend",           cat:"sym", label:"Legend",            instruction:"Recolor all shapes to match the legend key shown in the upper-left of the image." },
];

/* ── Full model data ──────────────────────────────────────── */
const MODELS = [
  {
    name: "Nano Banana 2",     abbr: "NB-2",
    overall: 23.5,
    cat: { geo: 13.0, str: 26.7, col: 23.4, sym: 30.9 },
    tasks: { translation:23.9, rotation:16.6, reflection:10.9, scaling:9.0, shearing:4.4, construction:20.0, removal:45.8, copying:14.1, border:27.4, cropping:26.3, recolor:31.2, flood_fill:37.4, blending:8.1, gradient:13.8, point_operations:26.3, comparison:39.8, ordering:21.5, pattern:15.9, counting:18.8, legend:58.8 },
  },
  {
    name: "GPT Image Edit 2",  abbr: "GPT-IE2",
    overall: 21.8,
    cat: { geo: 17.4, str: 28.2, col: 17.3, sym: 24.2 },
    tasks: { translation:27.2, rotation:19.1, reflection:14.7, scaling:13.8, shearing:12.4, construction:20.6, removal:53.0, copying:15.3, border:25.0, cropping:27.2, recolor:34.2, flood_fill:35.3, blending:7.8, gradient:2.2, point_operations:7.2, comparison:32.7, ordering:24.6, pattern:19.2, counting:16.8, legend:27.8 },
  },
  {
    name: "Nano Banana 1",     abbr: "NB-1",
    overall: 13.9,
    cat: { geo: 9.9, str: 14.8, col: 8.8, sym: 22.0 },
    tasks: { translation:16.4, rotation:10.2, reflection:10.7, scaling:7.4, shearing:4.7, construction:6.7, removal:33.9, copying:12.2, border:8.6, cropping:12.8, recolor:8.4, flood_fill:14.5, blending:6.7, gradient:4.0, point_operations:10.6, comparison:19.8, ordering:19.8, pattern:10.8, counting:18.8, legend:40.7 },
  },
  {
    name: "Qwen-Image-Edit",   abbr: "Qwen-IE",
    overall: 7.2,
    cat: { geo: 4.9, str: 9.9, col: 6.2, sym: 8.0 },
    tasks: { translation:7.2, rotation:7.4, reflection:3.9, scaling:2.3, shearing:3.6, construction:4.8, removal:29.4, copying:6.8, border:0.5, cropping:7.9, recolor:6.6, flood_fill:18.2, blending:3.8, gradient:0.3, point_operations:2.3, comparison:14.2, ordering:9.7, pattern:9.1, counting:6.2, legend:0.5 },
  },
  {
    name: "BAGEL-7B-MoT",      abbr: "BAGEL",
    overall: 6.2,
    cat: { geo: 4.2, str: 10.4, col: 2.1, sym: 7.9 },
    tasks: { translation:3.5, rotation:6.6, reflection:3.9, scaling:1.9, shearing:5.3, construction:2.0, removal:29.9, copying:6.0, border:0.2, cropping:14.0, recolor:5.2, flood_fill:3.8, blending:0.3, gradient:0.5, point_operations:0.6, comparison:12.0, ordering:5.5, pattern:6.1, counting:3.9, legend:12.1 },
  },
  {
    name: "FLUX.2-dev",        abbr: "FLUX.2-D",
    overall: 5.6,
    cat: { geo: 6.1, str: 8.7, col: 2.9, sym: 4.9 },
    tasks: { translation:8.5, rotation:9.0, reflection:5.8, scaling:3.0, shearing:4.3, construction:4.7, removal:20.5, copying:0.7, border:0.5, cropping:16.9, recolor:4.3, flood_fill:5.9, blending:0.8, gradient:1.8, point_operations:1.8, comparison:13.0, ordering:6.0, pattern:3.8, counting:1.3, legend:0.4 },
  },
  {
    name: "FLUX.1-Kontext",    abbr: "FLUX.1-Kt",
    overall: 4.5,
    cat: { geo: 4.8, str: 6.4, col: 2.7, sym: 4.1 },
    tasks: { translation:6.1, rotation:5.5, reflection:3.7, scaling:5.1, shearing:3.6, construction:5.8, removal:14.7, copying:0.8, border:0.3, cropping:10.1, recolor:4.5, flood_fill:5.8, blending:0.8, gradient:0.9, point_operations:1.4, comparison:7.8, ordering:4.4, pattern:1.8, counting:2.4, legend:4.3 },
  },
  {
    name: "FLUX.2-Klein-9B",   abbr: "FLUX.2-Kl",
    overall: 4.1,
    cat: { geo: 2.2, str: 8.0, col: 1.9, sym: 4.3 },
    tasks: { translation:4.1, rotation:3.4, reflection:1.6, scaling:0.7, shearing:1.3, construction:4.1, removal:24.2, copying:6.3, border:0.0, cropping:5.4, recolor:2.7, flood_fill:3.7, blending:0.2, gradient:1.9, point_operations:1.1, comparison:17.1, ordering:1.1, pattern:2.0, counting:1.3, legend:0.0 },
  },
  {
    name: "LongCat-Edit",      abbr: "LCat-IE",
    overall: 3.7,
    cat: { geo: 2.2, str: 7.6, col: 2.1, sym: 2.9 },
    tasks: { translation:2.8, rotation:2.5, reflection:2.5, scaling:1.7, shearing:1.5, construction:2.1, removal:19.2, copying:6.1, border:0.0, cropping:10.6, recolor:1.6, flood_fill:5.3, blending:1.8, gradient:0.2, point_operations:1.8, comparison:3.5, ordering:4.0, pattern:1.1, counting:4.6, legend:1.5 },
  },
  {
    name: "HunyuanImage-3",    abbr: "HYI-3",
    overall: 0.5,
    cat: { geo: 0.5, str: 0.9, col: 0.1, sym: 0.5 },
    tasks: { translation:1.0, rotation:0.4, reflection:0.1, scaling:0.4, shearing:0.6, construction:0.6, removal:1.6, copying:0.1, border:0.2, cropping:1.8, recolor:0.4, flood_fill:0.2, blending:0.0, gradient:0.1, point_operations:0.2, comparison:0.7, ordering:0.3, pattern:0.1, counting:0.4, legend:0.9 },
  },
  {
    name: "InstructPix2Pix",   abbr: "IP2P",
    overall: 0.2,
    cat: { geo: 0.0, str: 0.5, col: 0.2, sym: 0.2 },
    tasks: { translation:0.1, rotation:0.0, reflection:0.0, scaling:0.0, shearing:0.0, construction:1.2, removal:0.5, copying:0.0, border:0.1, cropping:0.5, recolor:0.4, flood_fill:0.1, blending:0.0, gradient:0.1, point_operations:0.5, comparison:1.1, ordering:0.0, pattern:0.0, counting:0.0, legend:0.0 },
  },
];

/* ── TGB chart data ──────────────────────────────────────── */
const TGB_DATA = {
  bar:     { img:"assets/img/tgb_bar_chart.png",    cap:"<strong>Bar Chart</strong> — Add bar, sort bars, remove bar, recolor bar. Best: NB-2 (37.4%), GPT-IE2 (34.8%)." },
  scatter: { img:"assets/img/tgb_scatter_plot.png", cap:"<strong>Scatter Plot</strong> — Draw best-fit line, swap axes, remove outlier, recolor class. Best: GPT-IE2 (6.8%), NB-2 (5.5%)." },
  line:    { img:"assets/img/tgb_line_chart.png",   cap:"<strong>Line Chart</strong> — Draw segments, normalize series, filter series, shade interval. Best: GPT-IE2 (16.0%), NB-2 (12.5%)." },
  heatmap: { img:"assets/img/tgb_heatmap.png",      cap:"<strong>Heatmap</strong> — Add cell, shift heatmap, mask cells, change colormap. Best: NB-2 (21.9%), GPT-IE2 (15.5%)." },
  network: { img:"assets/img/tgb_network.png",      cap:"<strong>Network Graph</strong> — Add node, swap nodes, remove node, recolor node. Best: NB-2 (5.6%), GPT-IE2 (4.8%)." },
};

/* ── Heatmap task list ────────────────────────────────────── */
const HM_TASKS = [
  { key:"translation",      label:"Translation",       cat:"geo" },
  { key:"rotation",         label:"Rotation",          cat:"geo" },
  { key:"reflection",       label:"Reflection",        cat:"geo" },
  { key:"scaling",          label:"Scaling",           cat:"geo" },
  { key:"shearing",         label:"Shearing",          cat:"geo" },
  { key:"construction",     label:"Construction",      cat:"str" },
  { key:"removal",          label:"Removal",           cat:"str" },
  { key:"copying",          label:"Copying",           cat:"str" },
  { key:"border",           label:"Border",            cat:"str" },
  { key:"cropping",         label:"Cropping",          cat:"str" },
  { key:"recolor",          label:"Recolor",           cat:"col" },
  { key:"flood_fill",       label:"Flood Fill",        cat:"col" },
  { key:"blending",         label:"Blending",          cat:"col" },
  { key:"gradient",         label:"Gradient",          cat:"col" },
  { key:"point_operations", label:"Point Ops",         cat:"col" },
  { key:"comparison",       label:"Comparison",        cat:"sym" },
  { key:"ordering",         label:"Ordering",          cat:"sym" },
  { key:"pattern",          label:"Pattern",           cat:"sym" },
  { key:"counting",         label:"Counting",          cat:"sym" },
  { key:"legend",           label:"Legend",            cat:"sym" },
];

/* ── Color helpers ──────────────────────────────────────── */
const CAT_HUE = { geo: 218, str: 24, col: 142, sym: 278 };
const CAT_SAT = { geo: 65,  str: 68, col: 55,  sym: 65  };

function scoreColor(score, cat) {
  const h = CAT_HUE[cat], s = CAT_SAT[cat];
  const l = 96 - (score / 100) * 66;
  return `hsl(${h},${s}%,${l}%)`;
}
function scoreTextColor(score) {
  return score > 38 ? "rgba(255,255,255,.92)" : "rgba(15,15,30,.75)";
}

/* ════════════════════════════════════════════════════════════
   GALLERY
   ════════════════════════════════════════════════════════════ */
function buildGallery() {
  const track = document.getElementById("gallery-track");
  if (!track) return;

  // Build 2× the cards for seamless infinite scroll
  const makeCards = () => GALLERY_ORDER.map(t => {
    const card = document.createElement("div");
    card.className = "g-card";
    card.innerHTML = `
      <div class="g-card-header">
        <span class="g-task-name">${t.label}</span>
        <span class="g-cat-badge ${t.cat}">${catLabel(t.cat)}</span>
      </div>
      <div class="g-card-images">
        <div class="g-img-slot">
          <img src="assets/img/ex_${t.key}_input.png" alt="${t.label} input" loading="lazy" />
          <span class="g-img-label">Input</span>
        </div>
        <div class="g-arrow">→</div>
        <div class="g-img-slot">
          <img src="assets/img/ex_${t.key}_answer.png" alt="${t.label} answer" loading="lazy" />
          <span class="g-img-label">Answer</span>
        </div>
        <div class="g-arrow">|</div>
        <div class="g-img-slot">
          <div class="g-placeholder">
            <span class="g-placeholder-text">Model output<br>coming soon</span>
          </div>
          <span class="g-img-label">Best Model</span>
        </div>
      </div>
      <p class="g-instruction">${t.instruction}</p>
    `;
    return card;
  });

  const set1 = makeCards();
  const set2 = makeCards();
  [...set1, ...set2].forEach(c => track.appendChild(c));
}

function catLabel(cat) {
  return { geo:"Geometric", str:"Structural", col:"Color", sym:"Symbolic" }[cat] || cat;
}

/* ════════════════════════════════════════════════════════════
   LEADERBOARD
   ════════════════════════════════════════════════════════════ */
function buildLeaderboard() {
  const list = document.getElementById("lb-list");
  if (!list) return;

  const maxScore = Math.max(...MODELS.map(m => m.overall));

  MODELS.forEach((m, i) => {
    const rank = i + 1;
    const rankClass = rank <= 3 ? ` r${rank}` : "";

    const row = document.createElement("div");
    row.className = "lb-row";
    row.innerHTML = `
      <div class="lb-main">
        <span class="lb-rank${rankClass}">${rank}</span>
        <span class="lb-name">${m.name}<span class="lb-abbr">${m.abbr}</span></span>
        <div class="lb-score-wrap">
          <div class="lb-bar-bg">
            <div class="lb-bar-fill" style="width:${(m.overall / maxScore * 100).toFixed(1)}%"></div>
          </div>
          <span class="lb-score-num">${m.overall.toFixed(1)}%</span>
        </div>
      </div>
      <div class="lb-details">
        <div class="lb-cat-bars">
          ${["geo","str","col","sym"].map(cat => `
            <div class="lb-cat-row">
              <span class="lb-cat-label ${cat}">${catFullLabel(cat)}</span>
              <div class="lb-cat-bar-bg">
                <div class="lb-cat-bar-fill ${cat}" style="width:${Math.min(m.cat[cat] / 60 * 100, 100).toFixed(1)}%"></div>
              </div>
              <span class="lb-cat-score">${m.cat[cat].toFixed(1)}%</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    row.querySelector(".lb-main").addEventListener("click", () => {
      const isOpen = row.classList.contains("expanded");
      // Collapse all others
      list.querySelectorAll(".lb-row.expanded").forEach(r => r.classList.remove("expanded"));
      if (!isOpen) row.classList.add("expanded");
    });

    list.appendChild(row);
  });
}

function catFullLabel(cat) {
  return { geo:"Geometric Transformation", str:"Structural Manipulation", col:"Color Change", sym:"Symbolic Reasoning" }[cat];
}

/* ════════════════════════════════════════════════════════════
   HEATMAP
   ════════════════════════════════════════════════════════════ */
function buildHeatmap() {
  const head = document.getElementById("hm-head");
  const body = document.getElementById("hm-body");
  if (!head || !body) return;

  // Category header row
  const catRow = document.createElement("tr");
  catRow.className = "hm-cat-header";
  catRow.innerHTML = `<th class="td-model" rowspan="1"></th>`;
  const cats = ["geo","str","col","sym"];
  const catNames = { geo:"Geometric", str:"Structural", col:"Color", sym:"Symbolic" };
  cats.forEach(cat => {
    const count = HM_TASKS.filter(t => t.cat === cat).length;
    const th = document.createElement("th");
    th.colSpan = count;
    th.className = `h-${cat}`;
    th.textContent = catNames[cat];
    catRow.appendChild(th);
  });
  const thAll = document.createElement("th");
  thAll.className = "h-all";
  thAll.textContent = "Overall";
  catRow.appendChild(thAll);
  head.appendChild(catRow);

  // Task name header
  const taskRow = document.createElement("tr");
  const thModel = document.createElement("th");
  thModel.className = "td-model";
  thModel.textContent = "Model";
  taskRow.appendChild(thModel);
  HM_TASKS.forEach(t => {
    const th = document.createElement("th");
    th.textContent = t.label;
    th.title = t.label;
    taskRow.appendChild(th);
  });
  const thOv = document.createElement("th");
  thOv.textContent = "Avg";
  taskRow.appendChild(thOv);
  head.appendChild(taskRow);

  // Model rows
  MODELS.forEach(m => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.className = "td-model";
    tdName.textContent = m.abbr;
    tdName.title = m.name;
    tr.appendChild(tdName);

    HM_TASKS.forEach(t => {
      const v = m.tasks[t.key] ?? 0;
      const td = document.createElement("td");
      td.style.background = scoreColor(v, t.cat);
      td.style.color = scoreTextColor(v);
      td.innerHTML = `<span class="hm-score">${v.toFixed(0)}</span>`;
      td.title = `${m.name} — ${t.label}: ${v.toFixed(1)}%`;
      tr.appendChild(td);
    });

    const tdOv = document.createElement("td");
    tdOv.className = "td-overall";
    tdOv.innerHTML = `<strong>${m.overall.toFixed(1)}</strong>`;
    tr.appendChild(tdOv);

    body.appendChild(tr);
  });
}

/* ════════════════════════════════════════════════════════════
   HEATMAP TOGGLE
   ════════════════════════════════════════════════════════════ */
function initHeatmapToggle() {
  const btn = document.getElementById("hm-toggle");
  const panel = document.getElementById("hm-panel");
  if (!btn || !panel) return;

  let built = false;
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    if (!expanded) {
      panel.removeAttribute("hidden");
      if (!built) { buildHeatmap(); built = true; }
    } else {
      panel.setAttribute("hidden", "");
    }
  });
}

/* ════════════════════════════════════════════════════════════
   TGB TABS
   ════════════════════════════════════════════════════════════ */
function initTgbTabs() {
  const tabs = document.querySelectorAll(".tgb-tab");
  const img  = document.getElementById("tgb-img");
  const cap  = document.getElementById("tgb-cap");
  if (!tabs.length || !img || !cap) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const d = TGB_DATA[tab.dataset.chart];
      if (!d) return;
      img.style.opacity = "0";
      setTimeout(() => {
        img.src = d.img;
        img.alt = tab.textContent + " examples";
        cap.innerHTML = d.cap;
        img.style.opacity = "1";
      }, 150);
    });
  });
  img.style.transition = "opacity .2s";
}

/* ════════════════════════════════════════════════════════════
   BIBTEX COPY
   ════════════════════════════════════════════════════════════ */
function initCopy() {
  const btn   = document.getElementById("copy-btn");
  const label = document.getElementById("copy-label");
  const pre   = document.getElementById("bibtex-text");
  if (!btn || !pre) return;

  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(pre.textContent).then(() => {
      if (label) label.textContent = "Copied!";
      btn.style.color = "#7EE8A2";
      setTimeout(() => {
        if (label) label.textContent = "Copy";
        btn.style.color = "";
      }, 2000);
    }).catch(() => {
      // Fallback for non-HTTPS
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(pre);
      sel.removeAllRanges();
      sel.addRange(range);
    });
  });
}

/* ════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  buildGallery();
  buildLeaderboard();
  initHeatmapToggle();
  initTgbTabs();
  initCopy();
});
