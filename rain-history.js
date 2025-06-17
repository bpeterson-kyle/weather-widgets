/* ---- read creds ---- */
const API  = document.querySelector('meta[name="WeatherSTEM-api-key"]').content;
const STN  = document.querySelector('meta[name="WeatherSTEM-station"]').content;

/* ---- date range ---- */
const today = new Date();
const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()-29);
const iso   = d => d.toISOString().slice(0,19).replace('T',' ');

/* ---- payload (no sensor filter) ---- */
const payload = { api_key: API, stations:[STN], from: iso(start), to: iso(today) };

/* ---- JSONP fetch ---- */
function fetchHistory(cb){
  const url = 'https://api.weatherstem.com/api'
            + '?input=' + encodeURIComponent(JSON.stringify(payload))
            + '&callback=' + cb.name;
  document.head.appendChild(Object.assign(document.createElement('script'),{src:url}));
}

/* choose correct rain field once */
const prefer = ["Rain Gauge"];

function rainKey(keys){
  for(const k of prefer) if(keys.includes(k)) return k;
  return keys.find(k=>/total\s*rain/i.test(k)) || null;
}

/* ---- callback ---- */
function render(json){
  const h = json.results?.[0]?.history || [];
  if(!h.length){ draw([],[]); return; }

  const sample = h[0].sensors || h[0];
  const key    = rainKey(Object.keys(sample));
  if(!key){ draw([],[]); return; }

  const daily = {};
  h.forEach(r=>{
    const val = r.sensors ? +r.sensors[key] : +r[key];
    if(isNaN(val)) return;
    const day = (r.timestamp||r.time).split(' ')[0];
    daily[day] = (daily[day]||0) + val;
  });

  const labels = Object.keys(daily).sort();
  const data   = labels.map(d=>+(daily[d].toFixed(2)));
  draw(labels,data);
}

/* ---- chart ---- */
function draw(labels,data){
  new Chart(document.getElementById('rainChart'),{
    type:'bar',
    data:{labels,datasets:[{data,label:'Inches',barPercentage:0.8}]},
    options:{
      scales:{
        x:{ticks:{autoSkip:true,maxTicksLimit:10}},
        y:{beginAtZero:true}},
      plugins:{legend:{display:false}},
      maintainAspectRatio:false
    }
  });
}

/* kick off */
fetchHistory(render);
