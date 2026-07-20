// ============ IST TIME HELPERS ============
function getISTDate(){
  const now = new Date();
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcMs + (5.5 * 60 * 60000));
}
function getISTTimeString(){
  return getISTDate().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}
function isWithinWindow(startHour, endHour){
  const ist = getISTDate();
  const totalMinutes = ist.getHours()*60 + ist.getMinutes();
  return totalMinutes >= startHour*60 && totalMinutes < endHour*60;
}

const PLOTLY_DARK_LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#e8eaed' },
  margin: { t: 30, r: 60, l: 60, b: 60 },
  legend: { orientation: 'h', y: -0.2 }
};
const GRID_COLOR = '#262b36';

// ============ CHART RENDERERS ============
const rendered = {};

function renderChart1(){
  const cats = CHART1_DATA.map(d => d.category);
  const ratings = CHART1_DATA.map(d => d.avg_rating);
  const reviews = CHART1_DATA.map(d => d.total_reviews);
  const traceRating = { x: cats, y: ratings, type: 'bar', name: 'Avg Rating', marker: {color:'#4fd1c5'}, yaxis: 'y' };
  const traceReviews = { x: cats, y: reviews, type: 'bar', name: 'Total Reviews', marker: {color:'#f2a65a'}, yaxis: 'y2' };
  const layout = Object.assign({}, PLOTLY_DARK_LAYOUT, {
    barmode: 'group',
    xaxis: { gridcolor: GRID_COLOR },
    yaxis: { title: 'Average Rating', range: [0,5], gridcolor: GRID_COLOR },
    yaxis2: { title: 'Total Reviews', overlaying: 'y', side: 'right', gridcolor: GRID_COLOR }
  });
  Plotly.newPlot('plot-1', [traceRating, traceReviews], layout, {responsive:true, displayModeBar:false});
}

function renderChart2(){
  const select = document.getElementById('cat2-select');
  if(!select.dataset.populated){
    CHART2_DATA.forEach((d,i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = d.category + (d.highlight ? '  ⭐ (>1M installs)' : '') + '  —  ' + d.total_installs.toLocaleString() + ' installs';
      select.appendChild(opt);
    });
    select.dataset.populated = '1';
    select.addEventListener('change', () => drawChoropleth(parseInt(select.value)));
  }
  drawChoropleth(0);
}

function drawChoropleth(idx){
  const entry = CHART2_DATA[idx];
  const z = WORLD_COUNTRIES.map(() => entry.total_installs);
  const trace = {
    type: 'choropleth',
    locations: WORLD_COUNTRIES,
    locationmode: 'country names',
    z: z,
    colorscale: entry.highlight ? 'YlOrRd' : 'Blues',
    colorbar: { title: 'Installs', tickformat: '.2s' }
  };
  const layout = Object.assign({}, PLOTLY_DARK_LAYOUT, {
    title: entry.category + (entry.highlight ? ' — Highlighted (exceeds 1M installs)' : ''),
    geo: { showframe: false, showcoastlines: true, projection: {type: 'natural earth'}, bgcolor: 'rgba(0,0,0,0)' }
  });
  Plotly.newPlot('plot-2', [trace], layout, {responsive:true, displayModeBar:false});
}

function renderChart3(){
  const cats = Object.keys(CHART3_DATA);
  const freeInstalls = cats.map(c => CHART3_DATA[c].Free.avg_installs);
  const paidInstalls = cats.map(c => CHART3_DATA[c].Paid.avg_installs);
  const freeRevenue = cats.map(c => CHART3_DATA[c].Free.avg_revenue);
  const paidRevenue = cats.map(c => CHART3_DATA[c].Paid.avg_revenue);

  const traces = [
    { x: cats, y: freeInstalls, type: 'bar', name: 'Avg Installs (Free)', marker: {color:'#4fd1c5'}, yaxis: 'y' },
    { x: cats, y: paidInstalls, type: 'bar', name: 'Avg Installs (Paid)', marker: {color:'#f2a65a'}, yaxis: 'y' },
    { x: cats, y: freeRevenue, type: 'scatter', mode: 'lines+markers', name: 'Avg Revenue (Free)', line:{color:'#7c9cff', dash:'dot'}, yaxis: 'y2' },
    { x: cats, y: paidRevenue, type: 'scatter', mode: 'lines+markers', name: 'Avg Revenue (Paid)', line:{color:'#e05d5d'}, yaxis: 'y2' }
  ];
  const layout = Object.assign({}, PLOTLY_DARK_LAYOUT, {
    barmode: 'group',
    xaxis: { gridcolor: GRID_COLOR },
    yaxis: { title: 'Average Installs', gridcolor: GRID_COLOR },
    yaxis2: { title: 'Average Revenue ($)', overlaying: 'y', side: 'right', gridcolor: GRID_COLOR }
  });
  Plotly.newPlot('plot-3', traces, layout, {responsive:true, displayModeBar:false});
}

const CATEGORY_LABELS_4 = { BEAUTY: 'ब्यूटी (Beauty)', BUSINESS: 'வணிகம் (Business)' };

function renderChart4(){
  const traces = [];
  const shapes = [];
  const palette = ['#4fd1c5','#f2a65a','#7c9cff','#e05d5d','#c792ea','#82e0aa','#f7dc6f','#85c1e9'];
  let colorIdx = 0;

  Object.keys(CHART4_DATA).sort().forEach(cat => {
    const entry = CHART4_DATA[cat];
    const color = palette[colorIdx % palette.length]; colorIdx++;
    const label = CATEGORY_LABELS_4[cat] || cat;
    traces.push({
      x: entry.months, y: entry.installs, type: 'scatter', mode: 'lines+markers',
      name: label, line: {color: color}, fill: 'tozeroy', fillcolor: color + '22'
    });
    // Highlight high-growth months with a shaded vertical band
    entry.high_growth_months.forEach(m => {
      const idx = entry.months.indexOf(m);
      if(idx > 0){
        shapes.push({
          type: 'rect', xref: 'x', yref: 'paper',
          x0: entry.months[idx-1], x1: entry.months[idx],
          y0: 0, y1: 1,
          fillcolor: color, opacity: 0.12, line: {width:0}
        });
      }
    });
  });

  const layout = Object.assign({}, PLOTLY_DARK_LAYOUT, {
    xaxis: { title: 'Month (based on Last Updated)', gridcolor: GRID_COLOR, type: 'category' },
    yaxis: { title: 'Total Installs', gridcolor: GRID_COLOR },
    shapes: shapes
  });
  Plotly.newPlot('plot-4', traces, layout, {responsive:true, displayModeBar:false});
}

const CATEGORY_LABELS_5 = { BEAUTY: 'ब्यूटी (Beauty)', BUSINESS: 'வணிகம் (Business)', DATING: 'Partnersuche (Dating)' };

function renderChart5(){
  const byCat = {};
  CHART5_DATA.forEach(d => {
    if(!byCat[d.category]) byCat[d.category] = [];
    byCat[d.category].push(d);
  });

  const maxInstalls = Math.max(...CHART5_DATA.map(d => d.installs));
  const traces = Object.keys(byCat).map(cat => {
    const pts = byCat[cat];
    const isGame = cat === 'GAME';
    return {
      x: pts.map(p => p.size_mb),
      y: pts.map(p => p.rating),
      text: pts.map(p => p.app + '<br>Installs: ' + p.installs.toLocaleString()),
      hoverinfo: 'text',
      mode: 'markers',
      name: CATEGORY_LABELS_5[cat] || cat,
      marker: {
        size: pts.map(p => 12 + 48 * Math.sqrt(p.installs / maxInstalls)),
        color: isGame ? '#ff5da2' : undefined,
        opacity: 0.75,
        line: { width: 1, color: '#0f1115' }
      }
    };
  });

  const layout = Object.assign({}, PLOTLY_DARK_LAYOUT, {
    xaxis: { title: 'App Size (MB)', gridcolor: GRID_COLOR },
    yaxis: { title: 'Average Rating', gridcolor: GRID_COLOR, range: [3.3, 5] }
  });
  Plotly.newPlot('plot-5', traces, layout, {responsive:true, displayModeBar:false});
}

const CATEGORY_LABELS_6 = { TRAVEL_AND_LOCAL: 'Voyages et Local (Travel & Local)', PRODUCTIVITY: 'Productividad (Productivity)', PHOTOGRAPHY: '写真 (Photography)' };

function renderChart6(){
  const data = CHART6_DATA.data;
  const months = CHART6_DATA.all_months;
  const palette = ['#4fd1c5','#f2a65a','#7c9cff','#e05d5d','#c792ea','#82e0aa'];
  let colorIdx = 0;
  const traces = [];

  Object.keys(data).sort().forEach(cat => {
    const entry = data[cat];
    const color = palette[colorIdx % palette.length]; colorIdx++;
    const label = CATEGORY_LABELS_6[cat] || cat;

    // Base stacked area trace
    traces.push({
      x: months, y: entry.cumulative_installs, type: 'scatter', mode: 'lines',
      name: label, stackgroup: 'one', line: {color: color, width: 0.5},
      fillcolor: color
    });

    // Overlay markers on high-growth months (increased color intensity)
    const hgIdx = entry.high_growth_months.map(m => months.indexOf(m)).filter(i => i >= 0);
    if(hgIdx.length){
      traces.push({
        x: hgIdx.map(i => months[i]),
        y: hgIdx.map(i => entry.cumulative_installs[i]),
        type: 'scatter', mode: 'markers',
        name: label + ' (>25% MoM growth)',
        marker: { color: color, size: 11, symbol: 'diamond', line: {color:'#fff', width:1.5} },
        showlegend: false
      });
    }
  });

  const layout = Object.assign({}, PLOTLY_DARK_LAYOUT, {
    xaxis: { title: 'Month (based on Last Updated)', gridcolor: GRID_COLOR, type: 'category' },
    yaxis: { title: 'Cumulative Installs', gridcolor: GRID_COLOR }
  });
  Plotly.newPlot('plot-6', traces, layout, {responsive:true, displayModeBar:false});
}

const CHART_RENDERERS = {
  1: renderChart1, 2: renderChart2, 3: renderChart3,
  4: renderChart4, 5: renderChart5, 6: renderChart6
};

// ============ VISIBILITY ENGINE ============
function updateAllSections(){
  document.getElementById('masterClock').textContent = 'Current IST time: ' + getISTTimeString();

  for(let i=1; i<=6; i++){
    const section = document.getElementById('section-' + i);
    const start = parseInt(section.dataset.start);
    const end = parseInt(section.dataset.end);
    const within = isWithinWindow(start, end);

    const plotDiv = document.getElementById('plot-' + i);
    const gate = document.getElementById('gate-' + i);
    const dot = document.getElementById('dot-' + i);
    const status = document.getElementById('status-' + i);
    const select2 = document.getElementById('cat2-select');

    if(within){
      plotDiv.style.display = 'block';
      if(select2) select2.style.display = 'block';
      gate.style.display = 'none';
      dot.className = 'status-dot live';
      status.textContent = 'Live now (window ' + start + ':00–' + end + ':00 IST)';
      if(!rendered[i]){
        CHART_RENDERERS[i]();
        rendered[i] = true;
      }
    } else {
      plotDiv.style.display = 'none';
      if(select2) select2.style.display = 'none';
      gate.style.display = 'flex';
      dot.className = 'status-dot hidden';
      status.textContent = 'Hidden outside ' + start + ':00–' + end + ':00 IST';
    }
  }
}

updateAllSections();
setInterval(updateAllSections, 15000);
