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
  var menu = document.getElementById('startMenu98');
  if (menu) menu.classList.toggle('open');
}

function closeStart() {
  var menu = document.getElementById('startMenu98');
  if (menu) menu.classList.remove('open');
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.start98') && !e.target.closest('.startmenu98')) {
    closeStart();
  }
});

// === WINDOW MANAGEMENT ===
var winOrder = [];

function nameFromWindow(el) {
  return el && el.id ? el.id.replace(/^win-/, '') : '';
}

function refreshActiveTitles() {
  var active = null;
  for (var i = winOrder.length - 1; i >= 0; i--) {
    if (winOrder[i].classList.contains('open') && !winOrder[i].classList.contains('minimized')) {
      active = winOrder[i];
      break;
    }
  }
  document.querySelectorAll('.w98-window').forEach(function(w) {
    var title = w.querySelector('.w98-title');
    if (title) title.classList.toggle('inactive', w !== active);
  });
}

function bringFront(el) {
  if (!el) return;
  var idx = winOrder.indexOf(el);
  if (idx > -1) winOrder.splice(idx, 1);
  winOrder.push(el);
  winOrder.forEach(function(w, i) { w.style.zIndex = 100 + i; });
  refreshActiveTitles();
}

function openWin(name) {
  closeStart();
  var el = document.getElementById('win-' + name);
  if (!el) return;
  el.classList.add('open');
  el.classList.remove('minimized');
  bringFront(el);
  updateTb();
  if (name === 'pinball') drawPinball();
}

function closeWin(name) {
  var el = document.getElementById('win-' + name);
  if (!el) return;
  el.classList.remove('open', 'minimized', 'maximized');
  var idx = winOrder.indexOf(el);
  if (idx > -1) winOrder.splice(idx, 1);
  if (name === 'pinball') pausePinball();
  refreshActiveTitles();
  updateTb();
}

function minimizeWin(name) {
  var el = document.getElementById('win-' + name);
  if (!el) return;
  el.classList.add('minimized');
  refreshActiveTitles();
  updateTb();
}

function restoreWin(name) {
  var el = document.getElementById('win-' + name);
  if (!el) return;
  el.classList.add('open');
  el.classList.remove('minimized');
  bringFront(el);
  updateTb();
}

function toggleMax(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('maximized');
  bringFront(el);
  updateTb();
}

function updateTb() {
  var items = document.getElementById('tbItems98');
  if (!items) return;
  items.innerHTML = '';
  document.querySelectorAll('.w98-window.open').forEach(function(w) {
    var titleEl = w.querySelector('.w98-title-left');
    var iconEl = w.querySelector('.w98-title-icon');
    if (!titleEl) return;
    var titleClone = titleEl.cloneNode(true);
    var titleIcon = titleClone.querySelector('.w98-title-icon');
    if (titleIcon) titleIcon.remove();
    var title = titleClone.textContent.trim();
    var icon = iconEl ? iconEl.textContent : '';
    var name = nameFromWindow(w);
    var div = document.createElement('div');
    div.className = 'tb98-item' + (w.classList.contains('minimized') ? '' : ' pressed');
    div.textContent = icon + ' ' + title.substring(0, 22);
    div.onclick = function() {
      if (w.classList.contains('minimized')) restoreWin(name);
      else bringFront(w);
      updateTb();
    };
    items.appendChild(div);
  });
}

document.querySelectorAll('.w98-window').forEach(function(w) {
  w.addEventListener('mousedown', function() {
    if (w.classList.contains('open') && !w.classList.contains('minimized')) bringFront(w);
  });
});

document.querySelectorAll('.w98-window.open').forEach(function(w) {
  bringFront(w);
});
updateTb();

// === DRAG ===
var dragEl = null, dx = 0, dy = 0;

function startDrag(e, id) {
  var el = document.getElementById(id);
  if (!el || el.classList.contains('maximized')) return;
  bringFront(el);
  dragEl = el;
  dx = e.clientX - el.offsetLeft;
  dy = e.clientY - el.offsetTop;
  e.preventDefault();
}

document.addEventListener('mousemove', function(e) {
  if (!dragEl) return;
  var maxX = Math.max(0, window.innerWidth - dragEl.offsetWidth);
  var maxY = Math.max(0, window.innerHeight - dragEl.offsetHeight - 28);
  dragEl.style.left = Math.min(maxX, Math.max(0, e.clientX - dx)) + 'px';
  dragEl.style.top = Math.min(maxY, Math.max(0, e.clientY - dy)) + 'px';
});

document.addEventListener('mouseup', function() { dragEl = null; });

document.querySelectorAll('.dicon[role="button"]').forEach(function(icon) {
  icon.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      icon.click();
    }
  });
});

// === WALLPAPER ===
var wallpaperDefaultVersion = 'classic-default-v2';
var selectedWallpaper = localStorage.getItem('addy-wallpaper') || 'classic';
if (localStorage.getItem('addy-wallpaper-default') !== wallpaperDefaultVersion) {
  selectedWallpaper = 'classic';
  localStorage.setItem('addy-wallpaper', selectedWallpaper);
  localStorage.setItem('addy-wallpaper-default', wallpaperDefaultVersion);
}
if (['classic', 'teal'].indexOf(selectedWallpaper) === -1) selectedWallpaper = 'classic';

function getSelectedWallpaper() {
  return selectedWallpaper;
}

function setWallpaper(name) {
  selectedWallpaper = name || 'teal';
  localStorage.setItem('addy-wallpaper', selectedWallpaper);
  applyWallpaper();
}

function applyWallpaper() {
  var desktop = document.getElementById('desktop');
  var preview = document.getElementById('wallpaperPreview');
  if (desktop) {
    desktop.classList.toggle('wallpaper-classic', selectedWallpaper === 'classic');
    desktop.classList.toggle('wallpaper-teal', selectedWallpaper === 'teal');
  }
  if (preview) preview.classList.toggle('classic', selectedWallpaper === 'classic');
  document.querySelectorAll('.wallpaper-choice').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-wallpaper') === selectedWallpaper);
  });
}
applyWallpaper();

// === SCROLL ===
function scrollTo98(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// === PINBALL ===
var pinball = {
  running: false,
  raf: null,
  score: 0,
  lives: 3,
  launched: false,
  flip: { left: false, right: false },
  ball: { x: 366, y: 512, vx: 0, vy: 0, r: 7 },
  bumpers: [
    { x: 145, y: 152, r: 23, points: 250, color: '#ff4b52', flash: 0 },
    { x: 224, y: 118, r: 26, points: 500, color: '#ffe85b', flash: 0 },
    { x: 287, y: 188, r: 23, points: 250, color: '#55e3ff', flash: 0 },
    { x: 185, y: 238, r: 19, points: 150, color: '#d777ff', flash: 0 }
  ],
  rollovers: [
    { x: 118, y: 326, hit: false }, { x: 146, y: 315, hit: false },
    { x: 174, y: 326, hit: false }, { x: 202, y: 315, hit: false },
    { x: 230, y: 326, hit: false }, { x: 258, y: 315, hit: false },
    { x: 286, y: 326, hit: false }
  ]
};

function pinballCanvas() {
  return document.getElementById('pinballCanvas');
}

function pinballStatus(text) {
  var el = document.getElementById('pinballStatus');
  if (el) el.textContent = text;
}

function updatePinballScore() {
  var s = document.getElementById('pinballScore');
  var l = document.getElementById('pinballLives');
  if (s) s.textContent = pinball.score;
  if (l) l.textContent = pinball.lives;
}

function placePinball() {
  pinball.ball.x = 366;
  pinball.ball.y = 512;
  pinball.ball.vx = 0;
  pinball.ball.vy = 0;
  pinball.launched = false;
}

function resetPinball() {
  pinball.score = 0;
  pinball.lives = 3;
  pinball.bumpers.forEach(function(b) { b.flash = 0; });
  pinball.rollovers.forEach(function(r) { r.hit = false; });
  placePinball();
  updatePinballScore();
  pinballStatus('Ready');
  drawPinball();
}

function launchPinball() {
  if (!pinballCanvas()) return;
  if (pinball.lives <= 0) resetPinball();
  if (!pinball.launched) {
    pinball.ball.vx = -2.4;
    pinball.ball.vy = -12.5;
    pinball.launched = true;
  }
  startPinball();
}

function startPinball() {
  if (pinball.running) return;
  pinball.running = true;
  pinballStatus('Running');
  pinballLoop();
}

function pausePinball() {
  pinball.running = false;
  if (pinball.raf) cancelAnimationFrame(pinball.raf);
  pinball.raf = null;
  pinballStatus('Paused');
}

function pinballFlip(side, active) {
  pinball.flip[side] = active;
  drawPinball();
}

function losePinball() {
  pinball.lives -= 1;
  updatePinballScore();
  if (pinball.lives <= 0) {
    pausePinball();
    pinballStatus('Game Over');
  } else {
    pinballStatus('Ball lost - launch again');
  }
  placePinball();
  drawPinball();
}

function segmentDistance(px, py, ax, ay, bx, by) {
  var vx = bx - ax;
  var vy = by - ay;
  var wx = px - ax;
  var wy = py - ay;
  var c1 = wx * vx + wy * vy;
  if (c1 <= 0) return { d: Math.hypot(px - ax, py - ay), x: ax, y: ay };
  var c2 = vx * vx + vy * vy;
  if (c2 <= c1) return { d: Math.hypot(px - bx, py - by), x: bx, y: by };
  var t = c1 / c2;
  var x = ax + t * vx;
  var y = ay + t * vy;
  return { d: Math.hypot(px - x, py - y), x: x, y: y };
}

function pinballFlipperSegments() {
  var len = 91;
  var leftA = pinball.flip.left ? -0.68 : -0.23;
  var rightA = pinball.flip.right ? Math.PI + 0.68 : Math.PI + 0.23;
  return {
    left: {
      ax: 105, ay: 506,
      bx: 105 + Math.cos(leftA) * len,
      by: 506 + Math.sin(leftA) * len,
      active: pinball.flip.left
    },
    right: {
      ax: 315, ay: 506,
      bx: 315 + Math.cos(rightA) * len,
      by: 506 + Math.sin(rightA) * len,
      active: pinball.flip.right
    }
  };
}

function hitFlipper(f) {
  var b = pinball.ball;
  var hit = segmentDistance(b.x, b.y, f.ax, f.ay, f.bx, f.by);
  if (hit.d > b.r + 8 || b.y < 410 || b.vy < -9) return;
  var nx = b.x - hit.x;
  var ny = b.y - hit.y;
  var len = Math.hypot(nx, ny) || 1;
  nx /= len;
  ny /= len;
  b.x = hit.x + nx * (b.r + 9);
  b.y = hit.y + ny * (b.r + 9);
  b.vx = nx * (f.active ? 8.2 : 4.6) + (f.ax < f.bx ? 1.3 : -1.3);
  b.vy = -Math.abs(f.active ? 10.6 : 7.2);
  pinball.score += f.active ? 25 : 5;
  updatePinballScore();
}

function collideCircle(cx, cy, r, power, points, flashTarget) {
  var b = pinball.ball;
  var dx = b.x - cx;
  var dy = b.y - cy;
  var d = Math.hypot(dx, dy) || 1;
  var min = b.r + r;
  if (d >= min) return false;
  var nx = dx / d;
  var ny = dy / d;
  b.x = cx + nx * min;
  b.y = cy + ny * min;
  var dot = b.vx * nx + b.vy * ny;
  b.vx = b.vx - 2 * dot * nx + nx * power;
  b.vy = b.vy - 2 * dot * ny + ny * power;
  pinball.score += points || 0;
  if (flashTarget) flashTarget.flash = 8;
  updatePinballScore();
  return true;
}

function updatePinball() {
  var canvas = pinballCanvas();
  if (!canvas || !pinball.launched) return;
  var b = pinball.ball;
  b.vy += 0.17;
  b.vx *= 0.996;
  b.vy *= 0.997;
  b.x += b.vx;
  b.y += b.vy;

  var maxSpeed = 15;
  var speed = Math.hypot(b.vx, b.vy);
  if (speed > maxSpeed) {
    b.vx = b.vx / speed * maxSpeed;
    b.vy = b.vy / speed * maxSpeed;
  }

  if (b.x < 34 + b.r) {
    b.x = 34 + b.r;
    b.vx = Math.abs(b.vx) * 0.9;
  }
  if (b.x > canvas.width - 32 - b.r) {
    b.x = canvas.width - 32 - b.r;
    b.vx = -Math.abs(b.vx) * 0.9;
  }
  if (b.y < 30 + b.r) {
    b.y = 30 + b.r;
    b.vy = Math.abs(b.vy) * 0.92;
  }

  // Shooter lane gate and return into the main table.
  if (b.x > 342 && b.y > 76 && b.y < 518) {
    if (b.x < 352 + b.r) {
      b.x = 352 + b.r;
      b.vx = Math.abs(b.vx) * 0.8;
    }
  }
  if (b.x > 340 && b.y < 92) {
    b.vx -= 0.38;
  }

  // Bottom side rails leave a center drain.
  if (b.y > 490 && b.x < 92) {
    b.x = Math.max(b.x, 92);
    b.vx = Math.abs(b.vx) * 0.75;
  }
  if (b.y > 490 && b.x > 328) {
    b.x = Math.min(b.x, 328);
    b.vx = -Math.abs(b.vx) * 0.75;
  }

  pinball.bumpers.forEach(function(bp) {
    if (collideCircle(bp.x, bp.y, bp.r, 4.2, bp.points, bp)) {
      pinballStatus('Bumper +' + bp.points);
    }
    if (bp.flash > 0) bp.flash -= 1;
  });

  pinball.rollovers.forEach(function(r) {
    if (!r.hit && collideCircle(r.x, r.y, 6, 1.8, 50, null)) {
      r.hit = true;
      pinballStatus('Rollover +50');
    }
  });

  var flippers = pinballFlipperSegments();
  hitFlipper(flippers.left);
  hitFlipper(flippers.right);

  if (b.y > canvas.height + 16) losePinball();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPinballLight(ctx, x, y, color, lit) {
  ctx.save();
  ctx.shadowColor = lit ? color : 'transparent';
  ctx.shadowBlur = lit ? 10 : 0;
  ctx.fillStyle = lit ? color : '#53461c';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPinballBumper(ctx, bp) {
  var glow = bp.flash > 0;
  var ring = ctx.createRadialGradient(bp.x - 7, bp.y - 8, 2, bp.x, bp.y, bp.r + 8);
  ring.addColorStop(0, '#ffffff');
  ring.addColorStop(0.45, bp.color);
  ring.addColorStop(1, glow ? '#ffffff' : '#1c1945');
  ctx.save();
  ctx.shadowColor = bp.color;
  ctx.shadowBlur = glow ? 20 : 7;
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(bp.x, bp.y, bp.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#0b0b18';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#f8ffff';
  ctx.beginPath();
  ctx.arc(bp.x - 7, bp.y - 8, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawPinballFlipper(ctx, f, color) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = f.active ? 14 : 4;
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.moveTo(f.ax, f.ay);
  ctx.lineTo(f.bx, f.by);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(f.ax, f.ay);
  ctx.lineTo(f.bx, f.by);
  ctx.stroke();
  ctx.fillStyle = '#f5f5ff';
  ctx.beginPath();
  ctx.arc(f.ax, f.ay, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPinball() {
  var canvas = pinballCanvas();
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var cabinet = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  cabinet.addColorStop(0, '#05050f');
  cabinet.addColorStop(0.5, '#161730');
  cabinet.addColorStop(1, '#050509');
  ctx.fillStyle = cabinet;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var play = ctx.createLinearGradient(0, 20, 0, canvas.height - 25);
  play.addColorStop(0, '#1a2861');
  play.addColorStop(0.52, '#131f55');
  play.addColorStop(1, '#1b113a');
  ctx.fillStyle = play;
  drawRoundedRect(ctx, 18, 16, canvas.width - 36, canvas.height - 32, 16);
  ctx.fill();

  ctx.strokeStyle = '#e5e7ff';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, 35, 34, canvas.width - 70, canvas.height - 65, 10);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  for (var i = 0; i < 30; i++) {
    var sx = 48 + ((i * 73) % 280);
    var sy = 48 + ((i * 47) % 390);
    ctx.fillRect(sx, sy, 2, 2);
  }

  ctx.fillStyle = '#ffef5a';
  ctx.font = 'bold 18px Courier New';
  ctx.fillText('SPACE', 76, 69);
  ctx.fillStyle = '#55e3ff';
  ctx.fillText('CADET', 210, 69);

  ctx.strokeStyle = '#5fe3ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(210, 142, 132, Math.PI * 1.08, Math.PI * 1.91);
  ctx.stroke();

  ctx.strokeStyle = '#ff5058';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(55, 448);
  ctx.bezierCurveTo(77, 332, 72, 214, 48, 128);
  ctx.stroke();

  ctx.strokeStyle = '#ffdb3d';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(343, 116);
  ctx.lineTo(343, 516);
  ctx.stroke();
  ctx.fillStyle = '#050508';
  ctx.fillRect(354, 108, 30, 432);
  ctx.fillStyle = '#ffef5a';
  ctx.fillRect(363, 464, 12, pinball.launched ? 36 : 70);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.moveTo(86, 378);
  ctx.lineTo(170, 426);
  ctx.lineTo(82, 448);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(334, 378);
  ctx.lineTo(250, 426);
  ctx.lineTo(338, 448);
  ctx.closePath();
  ctx.fill();

  pinball.bumpers.forEach(function(bp) {
    drawPinballBumper(ctx, bp);
  });

  pinball.rollovers.forEach(function(r) {
    drawPinballLight(ctx, r.x, r.y, '#ffef5a', r.hit);
  });

  ctx.strokeStyle = '#fe5cff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(116, 280);
  ctx.quadraticCurveTo(196, 304, 304, 270);
  ctx.stroke();
  ctx.strokeStyle = '#67ecff';
  ctx.beginPath();
  ctx.moveTo(112, 365);
  ctx.quadraticCurveTo(205, 392, 304, 363);
  ctx.stroke();

  ctx.fillStyle = '#ff5058';
  ctx.fillRect(82, 198, 12, 44);
  ctx.fillStyle = '#55e3ff';
  ctx.fillRect(313, 246, 12, 44);
  ctx.fillStyle = '#ffef5a';
  ctx.fillRect(286, 94, 12, 36);

  var f = pinballFlipperSegments();
  drawPinballFlipper(ctx, f.left, '#ff35a5');
  drawPinballFlipper(ctx, f.right, '#52e6ff');

  var ball = ctx.createRadialGradient(pinball.ball.x - 3, pinball.ball.y - 4, 1, pinball.ball.x, pinball.ball.y, pinball.ball.r + 3);
  ball.addColorStop(0, '#ffffff');
  ball.addColorStop(0.45, '#dff3ff');
  ball.addColorStop(1, '#808898');
  ctx.fillStyle = ball;
  ctx.beginPath();
  ctx.arc(pinball.ball.x, pinball.ball.y, pinball.ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0a0a12';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (!pinball.launched) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(106, 414, 208, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px Courier New';
    ctx.fillText('Press Launch / Space', 126, 434);
  }
}

function pinballLoop() {
  if (!pinball.running) return;
  updatePinball();
  drawPinball();
  pinball.raf = requestAnimationFrame(pinballLoop);
}

document.addEventListener('keydown', function(e) {
  var pinballKeys = ['ArrowLeft', 'ArrowRight', 'z', 'Z', 'x', 'X', '/', ' '];
  if (pinballKeys.indexOf(e.key) === -1) return;
  var win = document.getElementById('win-pinball');
  if (!win || !win.classList.contains('open')) return;
  e.preventDefault();
  if (e.key === 'ArrowLeft' || e.key === 'z' || e.key === 'Z') pinball.flip.left = true;
  if (e.key === 'ArrowRight' || e.key === 'x' || e.key === 'X' || e.key === '/') pinball.flip.right = true;
  if (e.key === ' ') launchPinball();
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowLeft' || e.key === 'z' || e.key === 'Z') pinball.flip.left = false;
  if (e.key === 'ArrowRight' || e.key === 'x' || e.key === 'X' || e.key === '/') pinball.flip.right = false;
});

resetPinball();
