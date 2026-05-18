/* ═══════════════════════════════════════════════════
   PaintBench — main.js
   ═══════════════════════════════════════════════════ */

/* ── Gallery task data — one real benchmark example per task ── */
const GALLERY_ORDER = [
  { key:"translation",      cat:"geo", label:"Translation",
    instruction:"Translate the black cross vertically so that its rightmost edge midpoint aligns horizontally with the center of the black rectangle. Place the transformed shape on top of any possible overlapping shapes. Clip any parts that may extend beyond the image boundary.",
    model:"FLUX.2-Klein-9B" },
  { key:"rotation",         cat:"geo", label:"Rotation",
    instruction:"Rotate the purple circle by 300° counterclockwise about its rightmost point. Place the transformed shape on top of any possible overlapping shapes. Clip any parts that may extend beyond the image boundary.",
    model:"Nano Banana 2" },
  { key:"reflection",       cat:"geo", label:"Reflection",
    instruction:"Reflect the gray shape across the top-left to bottom-right diagonal of its bounding box. Place the transformed shape underneath any possible overlapping shapes. Clip any parts that may extend beyond the image boundary.",
    model:"Nano Banana 2" },
  { key:"scaling",          cat:"geo", label:"Scaling",
    instruction:"Scale the brown cross vertically so its bounding box height is 89% of its current height, keeping its top bounding box edge fixed.",
    model:"Nano Banana 1" },
  { key:"shearing",         cat:"geo", label:"Shearing",
    instruction:"Shear the ivory white shape so its right bounding box edge shifts down by 64% of its bounding box height, keeping the left bounding box edge fixed. Place the transformed shape underneath any possible overlapping shapes. Clip any parts that may extend beyond the image boundary.",
    model:"Qwen-Image-Edit" },
  { key:"construction",     cat:"str", label:"Construction",
    instruction:"Draw a filled blue (#0000FF) polygon with vertices in order at (68.57%, 85.61%), (60.37%, 56.33%), and (58.21%, 91.36%). Place it on top of any existing shapes.",
    model:"Nano Banana 1" },
  { key:"removal",          cat:"str", label:"Removal",
    instruction:"Remove the shape at (87.89%, 12.60%).",
    model:"Nano Banana 2" },
  { key:"copying",          cat:"str", label:"Copying",
    instruction:"Copy the shapes (ignoring background) in the lower outlined square into the upper outlined square, maintaining the exact shape positions.",
    model:"GPT Image 2" },
  { key:"border",           cat:"str", label:"Border",
    instruction:"Color all pixels within a Euclidean distance of at most 3.2% image width from any pixel in the purple diamond to orange (#FFA500), without recoloring the shape itself.",
    model:"Nano Banana 2" },
  { key:"cropping",         cat:"str", label:"Cropping",
    instruction:"Crop to the interior of the outlined region, deskewing so that the highest corner of the region interior corresponds to the top-right corner of the cropped image. Scale to fill the canvas using nearest-neighbor interpolation.",
    model:"Nano Banana 2" },
  { key:"recolor",          cat:"col", label:"Recolor",
    instruction:"Recolor all shapes that are not a arrow to green (#00FF00).",
    model:"HunyuanImage-3" },
  { key:"flood_fill",       cat:"col", label:"Flood Fill",
    instruction:"Recolor all non-background pixels inside the gold outlined polygon to tan-colored (#CBAA85). Keep the outline as is.",
    model:"GPT Image 2" },
  { key:"blending",         cat:"col", label:"Blending",
    instruction:"Blend the color red (#FF0000) at 62% opacity over all pixels inside the white outlined polygon. Keep the outline as is.",
    model:"FLUX.1-Kontext" },
  { key:"gradient",         cat:"col", label:"Gradient",
    instruction:"Apply a linear RGB gradient from pink (#FFC0CB) at the top-left corner to black (#000000) at the bottom-right corner of the interior of the brown outlined region. Recolor only background pixels; keep non-background pixels and the outline as is.",
    model:"Nano Banana 2" },
  { key:"point_operations", cat:"col", label:"Point Operations",
    instruction:"Invert the colors of all pixels inside the orange outlined polygon. Keep the outline as is.",
    model:"Nano Banana 1" },
  { key:"comparison",       cat:"sym", label:"Comparison",
    instruction:"Remove the 3rd largest star.",
    model:"LongCat-Edit" },
  { key:"ordering",         cat:"sym", label:"Ordering",
    instruction:"Rearrange the diamond shapes top-to-bottom in increasing order of height, keeping each shape in the same position inside its box.",
    model:"GPT Image 2" },
  { key:"pattern",          cat:"sym", label:"Pattern",
    instruction:"Fill in the missing shape in this 6×8 pattern.",
    model:"InstructPix2Pix" },
  { key:"counting",         cat:"sym", label:"Counting",
    instruction:"The black shapes arranged in a line on the top of the image are used as tallies. Remove tallies from the right so the number of tallies equals the number of semicircle shapes.",
    model:"BAGEL-7B-MoT" },
  { key:"legend",           cat:"sym", label:"Legend",
    instruction:"Apply the legend at the bottom of the image. Recolor shapes whose color points to a new color, and remove shapes whose color points to an X. Keep the legend in place.",
    model:"FLUX.2-dev" },
];

/* ── Full model data (mIoU %, averaged across all 8 visual conditions) ── */
const MODELS = [
  {
    name: "Nano Banana 2", abbr: "NB-2", overall: 16.4,
    cat: { geo: 6.1, str: 21.1, col: 15.7, sym: 22.8 },
    tasks: { translation:12.3, rotation:7.6, reflection:4.4, scaling:3.0, shearing:3.1, construction:15.7, removal:37.8, copying:14.0, border:18.9, cropping:19.1, recolor:23.0, flood_fill:24.8, blending:5.3, gradient:13.0, point_operations:12.3, comparison:16.1, ordering:20.0, pattern:13.4, counting:16.3, legend:48.3 },
  },
  {
    name: "GPT Image 2", abbr: "GPT-I2", overall: 16.3,
    cat: { geo: 11.1, str: 24.3, col: 13.5, sym: 16.3 },
    tasks: { translation:17.5, rotation:13.2, reflection:9.1, scaling:7.8, shearing:7.8, construction:14.3, removal:49.6, copying:13.9, border:15.2, cropping:28.5, recolor:27.1, flood_fill:27.1, blending:6.4, gradient:1.4, point_operations:5.4, comparison:10.7, ordering:21.0, pattern:13.7, counting:14.9, legend:21.3 },
  },
  {
    name: "Nano Banana 1", abbr: "NB-1", overall: 10.8,
    cat: { geo: 6.2, str: 12.6, col: 6.0, sym: 18.5 },
    tasks: { translation:9.6, rotation:7.1, reflection:5.1, scaling:4.6, shearing:4.4, construction:4.8, removal:31.5, copying:12.8, border:4.6, cropping:9.5, recolor:5.7, flood_fill:11.2, blending:2.6, gradient:2.9, point_operations:7.4, comparison:14.3, ordering:18.2, pattern:8.7, counting:14.8, legend:36.7 },
  },
  {
    name: "Qwen-Image-Edit", abbr: "Qwen-IE", overall: 6.3,
    cat: { geo: 3.4, str: 9.0, col: 5.2, sym: 7.7 },
    tasks: { translation:5.3, rotation:5.5, reflection:3.0, scaling:1.9, shearing:1.4, construction:5.3, removal:25.1, copying:6.0, border:0.6, cropping:7.8, recolor:5.8, flood_fill:16.3, blending:1.2, gradient:0.7, point_operations:2.2, comparison:12.9, ordering:8.0, pattern:8.0, counting:8.4, legend:1.1 },
  },
  {
    name: "BAGEL-7B-MoT", abbr: "BAGEL", overall: 4.8,
    cat: { geo: 2.4, str: 9.6, col: 2.1, sym: 5.1 },
    tasks: { translation:3.6, rotation:4.0, reflection:1.8, scaling:1.0, shearing:1.4, construction:1.0, removal:25.7, copying:4.9, border:0.1, cropping:16.5, recolor:6.3, flood_fill:2.3, blending:1.1, gradient:0.2, point_operations:0.7, comparison:4.2, ordering:5.1, pattern:4.4, counting:5.5, legend:6.1 },
  },
  {
    name: "FLUX.2-dev", abbr: "FLUX.2-D", overall: 4.5,
    cat: { geo: 3.3, str: 7.9, col: 2.6, sym: 4.0 },
    tasks: { translation:4.5, rotation:5.6, reflection:4.0, scaling:0.8, shearing:1.6, construction:3.4, removal:19.4, copying:1.4, border:0.4, cropping:14.7, recolor:4.6, flood_fill:4.9, blending:0.7, gradient:0.8, point_operations:2.1, comparison:6.2, ordering:6.2, pattern:5.4, counting:1.6, legend:0.7 },
  },
  {
    name: "FLUX.1-Kontext", abbr: "FLUX.1-Kt", overall: 3.7,
    cat: { geo: 2.4, str: 7.3, col: 1.6, sym: 3.5 },
    tasks: { translation:2.7, rotation:3.0, reflection:2.7, scaling:1.8, shearing:1.8, construction:5.3, removal:21.0, copying:0.8, border:0.3, cropping:9.2, recolor:2.0, flood_fill:2.6, blending:1.7, gradient:0.5, point_operations:1.1, comparison:6.0, ordering:3.9, pattern:2.3, counting:1.9, legend:3.6 },
  },
  {
    name: "LongCat-Edit", abbr: "LCat-IE", overall: 3.6,
    cat: { geo: 2.2, str: 7.0, col: 1.8, sym: 3.5 },
    tasks: { translation:3.9, rotation:2.9, reflection:2.5, scaling:0.7, shearing:1.2, construction:2.4, removal:18.5, copying:3.2, border:0.1, cropping:10.9, recolor:2.4, flood_fill:4.7, blending:0.9, gradient:0.1, point_operations:0.9, comparison:7.5, ordering:4.5, pattern:0.9, counting:2.2, legend:2.4 },
  },
  {
    name: "FLUX.2-Klein-9B", abbr: "FLUX.2-Kl", overall: 3.4,
    cat: { geo: 1.4, str: 6.7, col: 2.4, sym: 3.2 },
    tasks: { translation:3.0, rotation:1.9, reflection:1.1, scaling:0.8, shearing:0.5, construction:3.1, removal:20.3, copying:4.5, border:0.1, cropping:5.4, recolor:4.1, flood_fill:3.8, blending:1.2, gradient:1.1, point_operations:1.7, comparison:8.2, ordering:1.8, pattern:3.2, counting:2.3, legend:0.5 },
  },
  {
    name: "HunyuanImage-3", abbr: "HYI-3", overall: 0.4,
    cat: { geo: 0.1, str: 1.0, col: 0.2, sym: 0.3 },
    tasks: { translation:0.1, rotation:0.1, reflection:0.1, scaling:0.2, shearing:0.0, construction:0.6, removal:3.0, copying:0.1, border:0.1, cropping:1.1, recolor:0.3, flood_fill:0.3, blending:0.1, gradient:0.1, point_operations:0.3, comparison:0.4, ordering:0.2, pattern:0.4, counting:0.3, legend:0.1 },
  },
  {
    name: "InstructPix2Pix", abbr: "IP2P", overall: 0.3,
    cat: { geo: 0.0, str: 0.9, col: 0.3, sym: 0.1 },
    tasks: { translation:0.0, rotation:0.1, reflection:0.0, scaling:0.0, shearing:0.0, construction:1.2, removal:3.2, copying:0.0, border:0.1, cropping:0.1, recolor:0.4, flood_fill:0.2, blending:0.1, gradient:0.0, point_operations:0.6, comparison:0.5, ordering:0.1, pattern:0.0, counting:0.0, legend:0.0 },
  },
];

/* ── TGB gallery data — all 20 tasks, one real benchmark example each ── */
const TGB_GALLERY_ORDER = [
  { key:"bar_chart_add_bar",              chart:"Bar Chart",    task:"Add Bar",               cat:"tgb-bar",     instruction:'Add the bar for "aLid" with value 0.805 and color #E8CA94.',                                                                                                                                                                                    model:"Nano Banana 2" },
  { key:"bar_chart_recolor_bar",          chart:"Bar Chart",    task:"Recolor Bar",            cat:"tgb-bar",     instruction:'Recolor the bar for "zjYi" to #DE9C7F.',                                                                                                                                                                                                      model:"GPT Image 2" },
  { key:"bar_chart_remove_bar",           chart:"Bar Chart",    task:"Remove Bar",             cat:"tgb-bar",     instruction:'Remove the bar and label for "NgifvfB". Keep everything else in the same place.',                                                                                                                                                              model:"Nano Banana 1" },
  { key:"bar_chart_sort_bars",            chart:"Bar Chart",    task:"Sort Bars",              cat:"tgb-bar",     instruction:"Sort the bars in ascending order, moving the corresponding labels.",                                                                                                                                                                           model:"Qwen-Image-Edit" },
  { key:"heatmap_add_cell",               chart:"Heatmap",      task:"Add Cell",               cat:"tgb-heatmap", instruction:"Fill the empty cell at row 2, column 5 (1-based indexing from top left) with the color corresponding to the value -4.78e+03.",                                                                                                               model:"BAGEL-7B-MoT" },
  { key:"heatmap_change_colormap",        chart:"Heatmap",      task:"Change Colormap",        cat:"tgb-heatmap", instruction:"Edit the heatmap and key to use a gradient with a low-value color of #DED675 and a high-value color of #59ED27.",                                                                                                                             model:"FLUX.2-dev" },
  { key:"heatmap_mask_cells",             chart:"Heatmap",      task:"Mask Cells",             cat:"tgb-heatmap", instruction:"Remove every cell with a value greater than 0.059.",                                                                                                                                                                                          model:"FLUX.1-Kontext" },
  { key:"heatmap_shift_heatmap",          chart:"Heatmap",      task:"Shift Heatmap",          cat:"tgb-heatmap", instruction:"Shift the heatmap 2 cells down. Cells that fall off the edge should be discarded, and cells exposed on the opposite side should become empty.",                                                                                               model:"LongCat-Edit" },
  { key:"line_chart_draw_segments",       chart:"Line Chart",   task:"Draw Segments",          cat:"tgb-line",    instruction:"Connect the gaps with straight segments in the same width and color as existing segments.",                                                                                                                                                    model:"HunyuanImage-3" },
  { key:"line_chart_filter_series",       chart:"Line Chart",   task:"Filter Series",          cat:"tgb-line",    instruction:'Only show the parts of the series where "otV" is at least 208.',                                                                                                                                                                              model:"InstructPix2Pix" },
  { key:"line_chart_normalize_series",    chart:"Line Chart",   task:"Normalize Series",       cat:"tgb-line",    instruction:'Scale and shift the series vertically so its lowest point corresponds to "uqEGxQB oupdmG SWq" = -60.6 and its highest point corresponds to "uqEGxQB oupdmG SWq" = 125. Keep the axes unchanged.',                                           model:"FLUX.2-Klein-9B" },
  { key:"line_chart_shade_interval",      chart:"Line Chart",   task:"Shade Interval",         cat:"tgb-line",    instruction:'In the plot, shade the area under the series between "LHrDxddZ Xala nAQ" = 1.82e+04 and "LHrDxddZ Xala nAQ" = 4.61e+04 with the color #5972AC.',                                                                                            model:"Nano Banana 2" },
  { key:"network_add_node",               chart:"Network",task:"Add Node",               cat:"tgb-network", instruction:'Add the node "NexDt" so that all nodes are evenly spaced on a circle. Connect it to "ONZi".',                                                                                                                                                 model:"GPT Image 2" },
  { key:"network_recolor_node",           chart:"Network",task:"Recolor Node",           cat:"tgb-network", instruction:'Recolor node "oav" to #8F7145. Update the color in both the graph and the key.',                                                                                                                                                              model:"Nano Banana 1" },
  { key:"network_remove_node",            chart:"Network",task:"Remove Node",            cat:"tgb-network", instruction:'Remove node "Qxl" and its incident edges. Leave the key unchanged.',                                                                                                                                                                          model:"Qwen-Image-Edit" },
  { key:"network_swap_nodes",             chart:"Network",task:"Swap Nodes",             cat:"tgb-network", instruction:'Swap the positions of nodes "dKMlN" and "NTpp".',                                                                                                                                                                                             model:"BAGEL-7B-MoT" },
  { key:"scatter_plot_draw_best_fit_line",chart:"Scatter Plot", task:"Draw Best-Fit Line",     cat:"tgb-scatter", instruction:"Draw the line of best fit for the class of points without a line. Use the same color as those points and the same thickness as the existing line. Overlay the line on top of all existing elements.",                                         model:"FLUX.2-dev" },
  { key:"scatter_plot_recolor_class",     chart:"Scatter Plot", task:"Recolor Class",          cat:"tgb-scatter", instruction:"Recolor the line of best fit and its corresponding points to #90827B.",                                                                                                                                                                       model:"FLUX.1-Kontext" },
  { key:"scatter_plot_remove_outlier",    chart:"Scatter Plot", task:"Remove Outlier",         cat:"tgb-scatter", instruction:"In the class of points with the line of best fit, remove the point that is vertically furthest from the line. Keep the line in place.",                                                                                                       model:"LongCat-Edit" },
  { key:"scatter_plot_swap_axes",         chart:"Scatter Plot", task:"Swap Axes",              cat:"tgb-scatter", instruction:"Swap the x and y coordinates of every point and the line of best fit. Points in the class without the line of best fit should be overlaid on top.",                                                                                           model:"HunyuanImage-3" },
];

/* ── Heatmap task list ────────────────────────────── */
const HM_TASKS = [
  { key:"translation",      label:"Translation",    cat:"geo" },
  { key:"rotation",         label:"Rotation",       cat:"geo" },
  { key:"reflection",       label:"Reflection",     cat:"geo" },
  { key:"scaling",          label:"Scaling",        cat:"geo" },
  { key:"shearing",         label:"Shearing",       cat:"geo" },
  { key:"construction",     label:"Construction",   cat:"str" },
  { key:"removal",          label:"Removal",        cat:"str" },
  { key:"copying",          label:"Copying",        cat:"str" },
  { key:"border",           label:"Border",         cat:"str" },
  { key:"cropping",         label:"Cropping",       cat:"str" },
  { key:"recolor",          label:"Recolor",        cat:"col" },
  { key:"flood_fill",       label:"Flood Fill",     cat:"col" },
  { key:"blending",         label:"Blending",       cat:"col" },
  { key:"gradient",         label:"Gradient",       cat:"col" },
  { key:"point_operations", label:"Point Ops",      cat:"col" },
  { key:"comparison",       label:"Comparison",     cat:"sym" },
  { key:"ordering",         label:"Ordering",       cat:"sym" },
  { key:"pattern",          label:"Pattern",        cat:"sym" },
  { key:"counting",         label:"Counting",       cat:"sym" },
  { key:"legend",           label:"Legend",         cat:"sym" },
];

/* ── Helpers ──────────────────────────────────────── */
const CAT_HUE = { geo: 218, str: 24, col: 142, sym: 278 };
const CAT_SAT = { geo: 65,  str: 68, col: 55,  sym: 65  };

function scoreColor(score, cat) {
  const h = CAT_HUE[cat], s = CAT_SAT[cat];
  return `hsl(${h},${s}%,${96 - (score / 100) * 66}%)`;
}
function scoreTextColor(score) {
  return score > 38 ? "rgba(255,255,255,.9)" : "rgba(15,15,30,.75)";
}
function catLabel(cat) {
  return { geo:"Geometric", str:"Structural", col:"Color", sym:"Symbolic" }[cat] || cat;
}
function catFullLabel(cat) {
  return { geo:"Geometric Transformation", str:"Structural Manipulation", col:"Color Change", sym:"Symbolic Reasoning" }[cat];
}

/* ════════════════════════════════════════════════════
   SHARED SLIDESHOW HELPER
   ════════════════════════════════════════════════════ */
function makeSlideshow({ viewport, items, renderCard, selectEl, prevBtn, nextBtn, interval = 4500 }) {
  let idx = 0;
  let timer;
  let frozen = false;

  const cards = items.map((item, i) => {
    const el = renderCard(item);
    if (i === 0) el.classList.add('ss-active');
    viewport.appendChild(el);
    return el;
  });

  function goTo(newIdx, freeze) {
    if (newIdx === idx) return;
    cards[idx].classList.remove('ss-active');
    idx = newIdx;
    cards[idx].classList.add('ss-active');
    if (selectEl) selectEl.value = newIdx;
    if (freeze) {
      frozen = true;
      clearInterval(timer);
    } else if (!frozen) {
      resetTimer();
    }
  }

  function next()  { goTo((idx + 1) % items.length, false); }
  function prev()  { goTo((idx - 1 + items.length) % items.length, false); }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, interval);
  }
  resetTimer();

  if (selectEl) selectEl.addEventListener('change', () => goTo(+selectEl.value, true));
  if (prevBtn)  prevBtn.addEventListener('click', () => goTo((idx - 1 + items.length) % items.length, true));
  if (nextBtn)  nextBtn.addEventListener('click', () => goTo((idx + 1) % items.length, true));

  return { goTo, next, prev };
}

/* ════════════════════════════════════════════════════
   GALLERY — slideshow, one task at a time
   ════════════════════════════════════════════════════ */
function buildGallery() {
  const viewport  = document.getElementById('gallery-ss-viewport');
  const selectEl  = document.getElementById('gallery-select');
  const prevBtn   = document.getElementById('gallery-prev');
  const nextBtn   = document.getElementById('gallery-next');
  if (!viewport) return;

  GALLERY_ORDER.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${t.label}  (${catLabel(t.cat)})`;
    selectEl.appendChild(opt);
  });

  function renderCard(t) {
    const card = document.createElement('div');
    card.className = `g-card cat-${t.cat}`;
    card.innerHTML = `
      <div class="g-card-header">
        <span class="g-task-name">${t.label}</span>
        <span class="g-cat-badge ${t.cat}">${catLabel(t.cat)}</span>
      </div>
      <div class="g-card-images">
        <div class="g-img-slot">
          <img src="assets/img/ex_${t.key}_input.png" alt="${t.label} input" />
          <span class="g-img-label">Input</span>
        </div>
        <div class="g-arrow">→</div>
        <div class="g-img-slot">
          <img src="assets/img/ex_${t.key}_answer.png" alt="${t.label} answer" />
          <span class="g-img-label">Answer</span>
        </div>
        <div class="g-sep">|</div>
        <div class="g-img-slot">
          <img src="assets/img/ex_${t.key}_output.png" alt="${t.label} model output" />
          <span class="g-img-label">Model Output</span>
          <span class="g-model-name">${t.model}</span>
        </div>
      </div>
      <p class="g-instruction"><span class="g-instr-label">Instruction:</span> ${t.instruction}</p>
    `;
    return card;
  }

  makeSlideshow({ viewport, items: GALLERY_ORDER, renderCard, selectEl, prevBtn, nextBtn });
}

/* ════════════════════════════════════════════════════
   TGB SLIDESHOW
   ════════════════════════════════════════════════════ */
function buildTgbSlideshow() {
  const viewport = document.getElementById('tgb-ss-viewport');
  const selectEl = document.getElementById('tgb-select');
  const prevBtn  = document.getElementById('tgb-prev');
  const nextBtn  = document.getElementById('tgb-next');
  if (!viewport) return;

  TGB_GALLERY_ORDER.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${t.chart}  —  ${t.task}`;
    selectEl.appendChild(opt);
  });

  function renderCard(t) {
    const card = document.createElement('div');
    card.className = `g-card cat-${t.cat}`;
    card.innerHTML = `
      <div class="g-card-header">
        <span class="g-task-name">${t.task}</span>
        <span class="g-cat-badge ${t.cat}">${t.chart}</span>
      </div>
      <div class="g-card-images">
        <div class="g-img-slot">
          <img src="assets/img/tgb_examples/${t.key}_input.png" alt="${t.task} input" />
          <span class="g-img-label">Input</span>
        </div>
        <div class="g-arrow">→</div>
        <div class="g-img-slot">
          <img src="assets/img/tgb_examples/${t.key}_answer.png" alt="${t.task} answer" />
          <span class="g-img-label">Answer</span>
        </div>
        <div class="g-sep">|</div>
        <div class="g-img-slot">
          <img src="assets/img/tgb_examples/${t.key}_output.png" alt="${t.task} model output" />
          <span class="g-img-label">Model Output</span>
          <span class="g-model-name">${t.model}</span>
        </div>
      </div>
      <p class="g-instruction"><span class="g-instr-label">Instruction:</span> ${t.instruction}</p>
    `;
    return card;
  }

  makeSlideshow({ viewport, items: TGB_GALLERY_ORDER, renderCard, selectEl, prevBtn, nextBtn });
}

/* ════════════════════════════════════════════════════
   LEADERBOARD
   ════════════════════════════════════════════════════ */
function buildLeaderboard() {
  const list = document.getElementById("lb-list");
  if (!list) return;

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
            <div class="lb-bar-fill" style="width:${m.overall.toFixed(1)}%"></div>
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
                <div class="lb-cat-bar-fill ${cat}" style="width:${m.cat[cat].toFixed(1)}%"></div>
              </div>
              <span class="lb-cat-score">${m.cat[cat].toFixed(1)}%</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    row.querySelector(".lb-main").addEventListener("click", () => {
      const open = row.classList.contains("expanded");
      list.querySelectorAll(".lb-row.expanded").forEach(r => r.classList.remove("expanded"));
      if (!open) row.classList.add("expanded");
    });
    list.appendChild(row);
  });
}

/* ════════════════════════════════════════════════════
   HEATMAP TOGGLE
   ════════════════════════════════════════════════════ */
function buildHeatmap() {
  const head = document.getElementById("hm-head");
  const body = document.getElementById("hm-body");
  if (!head || !body) return;

  // Category group header
  const catRow = document.createElement("tr");
  catRow.className = "hm-cat-header";
  catRow.innerHTML = `<th class="td-model"></th>`;
  ["geo","str","col","sym"].forEach(cat => {
    const count = HM_TASKS.filter(t => t.cat === cat).length;
    const th = document.createElement("th");
    th.colSpan = count;
    th.className = `h-${cat}`;
    th.textContent = catLabel(cat);
    catRow.appendChild(th);
  });
  const thAll = document.createElement("th");
  thAll.className = "h-all";
  thAll.textContent = "Avg";
  catRow.appendChild(thAll);
  head.appendChild(catRow);

  // Task name row
  const taskRow = document.createElement("tr");
  const thModel = document.createElement("th");
  thModel.className = "td-model";
  thModel.textContent = "Model";
  taskRow.appendChild(thModel);
  HM_TASKS.forEach(t => {
    const th = document.createElement("th");
    th.textContent = t.label;
    taskRow.appendChild(th);
  });
  taskRow.appendChild(Object.assign(document.createElement("th"), { textContent: "Overall" }));
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

function initHeatmapToggle() {
  const btn = document.getElementById("hm-toggle");
  const panel = document.getElementById("hm-panel");
  if (!btn || !panel) return;
  let built = false;
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    panel[expanded ? "setAttribute" : "removeAttribute"]("hidden", "");
    if (!expanded && !built) { buildHeatmap(); built = true; }
  });
}

/* ════════════════════════════════════════════════════
   BIBTEX COPY
   ════════════════════════════════════════════════════ */
function initCopy() {
  const btn   = document.getElementById("copy-btn");
  const label = document.getElementById("copy-label");
  const pre   = document.getElementById("bibtex-text");
  if (!btn || !pre) return;
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(pre.textContent).then(() => {
      if (label) label.textContent = "Copied!";
      btn.style.color = "#7EE8A2";
      setTimeout(() => { if (label) label.textContent = "Copy"; btn.style.color = ""; }, 2000);
    }).catch(() => {
      const r = document.createRange();
      r.selectNodeContents(pre);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(r);
    });
  });
}

/* ════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildGallery();
  buildTgbSlideshow();
  buildLeaderboard();
  initHeatmapToggle();
  initCopy();
});
