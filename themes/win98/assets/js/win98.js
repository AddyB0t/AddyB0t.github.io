// === CLOCK ===
function tick() {
  var d = new Date();
  var h = d.getHours() % 12 || 12;
  var m = String(d.getMinutes()).padStart(2, '0');
  var ap = d.getHours() >= 12 ? 'PM' : 'AM';
  var el = document.getElementById('clock98');
  if (el) el.textContent = h + ':' + m + ' ' + ap;
}
tick();
setInterval(tick, 30000);

// === BOOT ===
setTimeout(function() {
  var b = document.getElementById('boot98');
  if (b) b.remove();
}, 4000);

// === START MENU ===
function toggleStart() {
  document.getElementById('startMenu98').classList.toggle('open');
}

function closeStart() {
  document.getElementById('startMenu98').classList.remove('open');
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.start98') && !e.target.closest('.startmenu98')) {
    closeStart();
  }
});

// === WINDOW MANAGEMENT ===
var winOrder = [];

function bringFront(el) {
  var idx = winOrder.indexOf(el);
  if (idx > -1) winOrder.splice(idx, 1);
  winOrder.push(el);
  winOrder.forEach(function(w, i) { w.style.zIndex = 100 + i; });
}

function openWin(name) {
  closeStart();
  var el = document.getElementById('win-' + name);
  if (el) {
    el.classList.add('open');
    bringFront(el);
    updateTb();
  }
}

function closeWin(name) {
  var el = document.getElementById('win-' + name);
  if (el) {
    el.classList.remove('open');
    updateTb();
  }
}

function minimizeWin(name) {
  closeWin(name);
}

function toggleMax(id) {
  document.getElementById(id).classList.toggle('maximized');
}

function updateTb() {
  var items = document.getElementById('tbItems98');
  if (!items) return;
  items.innerHTML = '';
  document.querySelectorAll('.w98-window.open').forEach(function(w) {
    var titleEl = w.querySelector('.w98-title-left');
    var iconEl = w.querySelector('.w98-title-icon');
    if (!titleEl) return;
    var title = titleEl.textContent.trim();
    var icon = iconEl ? iconEl.textContent : '';
    var div = document.createElement('div');
    div.className = 'tb98-item pressed';
    div.textContent = icon + ' ' + title.substring(0, 20);
    div.onclick = function() { bringFront(w); };
    items.appendChild(div);
  });
}

// === DRAG ===
var dragEl = null, dx = 0, dy = 0;

function startDrag(e, id) {
  var el = document.getElementById(id);
  if (el.classList.contains('maximized')) return;
  bringFront(el);
  dragEl = el;
  dx = e.clientX - el.offsetLeft;
  dy = e.clientY - el.offsetTop;
  e.preventDefault();
}

document.addEventListener('mousemove', function(e) {
  if (!dragEl) return;
  dragEl.style.left = Math.max(0, e.clientX - dx) + 'px';
  dragEl.style.top = Math.max(0, e.clientY - dy) + 'px';
});

document.addEventListener('mouseup', function() { dragEl = null; });

// === SCROLL ===
function scrollTo98(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
