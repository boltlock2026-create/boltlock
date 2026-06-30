const canvas = document.getElementById('frameCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
const liveCalls = document.getElementById('liveCalls');
const answered = document.getElementById('answered');
const hotLeads = document.getElementById('hotLeads');
const handoffs = document.getElementById('handoffs');
const activityFeed = document.getElementById('activityFeed');

const feed = [
  ['Lead atendido', 'interesse confirmado', 'agora'],
  ['Corretor acionado', 'contexto enviado', '12s'],
  ['Tentativa reagendada', 'melhor horário salvo', '29s'],
  ['Número balanceado', 'cadência ajustada', '48s']
];

let width = 0;
let height = 0;
let dpr = 1;
let tick = 0;
let callCount = 184;
let hotCount = 36;
let handoffCount = 18;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawFrame() {
  tick += 0.007;
  ctx.clearRect(0, 0, width, height);

  const columns = Math.ceil(width / 46);
  const rows = Math.ceil(height / 46);

  for (let x = 0; x < columns; x += 1) {
    for (let y = 0; y < rows; y += 1) {
      const phase = Math.sin(tick + x * 0.48 + y * 0.31);
      const alpha = Math.max(0, phase) * 0.11;
      if (alpha > 0.01) {
        ctx.fillStyle = `rgba(70, 217, 255, ${alpha})`;
        ctx.fillRect(x * 46, y * 46, 1, 16);
        ctx.fillStyle = `rgba(243, 197, 90, ${alpha * 0.75})`;
        ctx.fillRect(x * 46 + 18, y * 46 + 22, 12, 1);
      }
    }
  }

  requestAnimationFrame(drawFrame);
}

function renderFeed() {
  activityFeed.innerHTML = feed.map(([title, detail, time]) => (
    `<li><b></b><span><strong>${title}</strong> - ${detail}</span><small>${time}</small></li>`
  )).join('');
}

function updateCounters() {
  callCount += Math.floor(Math.random() * 4) + 1;
  if (Math.random() > 0.55) hotCount += 1;
  if (Math.random() > 0.65) handoffCount += 1;

  liveCalls.textContent = callCount.toLocaleString('pt-BR');
  answered.textContent = `${70 + Math.floor(Math.random() * 4)}%`;
  hotLeads.textContent = hotCount.toString();
  handoffs.textContent = handoffCount.toString();

  const next = feed.pop();
  feed.unshift(next);
  renderFeed();
}

resize();
renderFeed();
drawFrame();
window.addEventListener('resize', resize);
setInterval(updateCounters, 2600);
