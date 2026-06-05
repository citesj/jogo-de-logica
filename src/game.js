import { houses, levels, startPoint } from './levels.js';
import { playError, playSuccess } from './audio.js';

const HOUSE_ORDER = ['green', 'yellow', 'blue', 'red'];
const HOUSE_WIDTH = 150;
const HOUSE_HEIGHT = 62;
const POINTER_RADIUS = 34;
const ITEM_RADIUS = 31;
const IDLE_HINT_MS = 10000;

const houseY = houses.green.y;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function nearestPointOnSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);

  return {
    x: start.x + t * dx,
    y: start.y + t * dy,
    distance: Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy)),
  };
}

function segmentKey(a, b) {
  return `${Math.round(a.x)},${Math.round(a.y)}>${Math.round(b.x)},${Math.round(b.y)}`;
}

export class LogicPathGame {
  constructor({ canvas, referenceList, levelBadge, message, controls }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.referenceList = referenceList;
    this.levelBadge = levelBadge;
    this.message = message;
    this.controls = controls;
    this.levelIndex = 0;
    this.pointerActive = false;
    this.collected = [];
    this.completedItems = new Set();
    this.activeErrorUntil = 0;
    this.lastInteractionAt = Date.now();
    this.position = { ...startPoint };
    this.lastBranch = { ...startPoint };
    this.reachableSegments = new Set();
    this.raf = null;
  }

  start() {
    this.bindEvents();
    this.loadLevel(0);
    this.loop();
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', (event) => this.handlePointerDown(event));
    this.canvas.addEventListener('pointermove', (event) => this.handlePointerMove(event));
    window.addEventListener('pointerup', () => this.handlePointerUp());

    this.controls.prev.addEventListener('click', () => this.loadLevel(this.levelIndex - 1));
    this.controls.restart.addEventListener('click', () => this.loadLevel(this.levelIndex));
    this.controls.next.addEventListener('click', () => this.loadLevel(this.levelIndex + 1));
  }

  loadLevel(index) {
    this.levelIndex = (index + levels.length) % levels.length;
    this.level = levels[this.levelIndex];
    this.position = { ...startPoint };
    this.lastBranch = { ...this.level.branchFallback };
    this.pointerActive = false;
    this.collected = [];
    this.completedItems = new Set();
    this.activeErrorUntil = 0;
    this.lastInteractionAt = Date.now();
    this.reachableSegments.clear();
    this.message.textContent = `${this.level.name}: siga ${this.level.target.join(' → ')}.`;
    this.levelBadge.textContent = `Nível ${this.level.id}/15 · ${this.level.difficulty}`;
    this.renderReference();
    this.updateControls();
  }

  updateControls() {
    this.controls.prev.disabled = this.levelIndex === 0;
    this.controls.next.disabled = this.levelIndex === levels.length - 1;
  }

  renderReference() {
    this.referenceList.innerHTML = '';
    this.level.target.forEach((emoji, index) => {
      const entry = document.createElement('li');
      entry.className = 'reference-item';
      entry.dataset.index = String(index);
      entry.innerHTML = `<span class="reference-emoji">${emoji}</span><span class="reference-status" aria-label="pendente">○</span>`;
      this.referenceList.appendChild(entry);
    });
  }

  getPointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  handlePointerDown(event) {
    const pointer = this.getPointer(event);
    if (distance(pointer, this.position) <= POINTER_RADIUS) {
      this.pointerActive = true;
      this.touch();
      this.canvas.setPointerCapture?.(event.pointerId);
    }
  }

  handlePointerMove(event) {
    if (!this.pointerActive) return;
    event.preventDefault();
    this.touch();

    const pointer = this.getPointer(event);
    const nearest = this.findNearestPlayablePoint(pointer);
    if (!nearest || nearest.distance > POINTER_RADIUS) return;

    this.position = { x: nearest.x, y: nearest.y };
    this.reachableSegments.add(segmentKey(nearest.segmentStart, nearest.segmentEnd));
    this.updateLastBranch();
    this.checkItems();
    this.checkHouseArrival();
  }

  handlePointerUp() {
    this.pointerActive = false;
  }

  touch() {
    this.lastInteractionAt = Date.now();
  }

  findNearestPlayablePoint(pointer) {
    let best = null;

    this.level.paths.forEach((currentPath) => {
      currentPath.points.slice(0, -1).forEach((point, index) => {
        const nextPoint = currentPath.points[index + 1];
        const candidate = nearestPointOnSegment(pointer, point, nextPoint);
        const canEnter = distance(this.position, point) < 68 || distance(this.position, nextPoint) < 68 || this.reachableSegments.has(segmentKey(point, nextPoint));
        if (!canEnter) return;

        if (!best || candidate.distance < best.distance) {
          best = {
            ...candidate,
            path: currentPath,
            segmentStart: point,
            segmentEnd: nextPoint,
          };
        }
      });
    });

    return best;
  }

  updateLastBranch() {
    this.level.paths.forEach((currentPath) => {
      const important = currentPath.branch || currentPath.intersection || currentPath.crossing;
      if (!important) return;

      currentPath.points.forEach((point) => {
        if (distance(this.position, point) < 40) {
          this.lastBranch = { ...point };
        }
      });
    });
  }

  checkItems() {
    const allItems = this.level.paths.flatMap((currentPath) => currentPath.items.map((foundItem, itemIndex) => ({ ...foundItem, pathId: currentPath.id, itemIndex })));

    allItems.forEach((foundItem) => {
      const key = `${foundItem.pathId}-${foundItem.itemIndex}`;
      if (this.completedItems.has(key) || distance(this.position, foundItem) > ITEM_RADIUS) return;

      const expected = this.level.target[this.collected.length];
      if (foundItem.emoji !== expected) {
        this.fail(`Ops! Agora era ${expected}, não ${foundItem.emoji}.`);
        return;
      }

      this.completedItems.add(key);
      this.collected.push(foundItem.emoji);
      this.markReference(this.collected.length - 1);
      this.flashObject(foundItem);
      playSuccess();
      this.message.textContent = `Muito bem! ${foundItem.emoji} coletado.`;
    });
  }

  markReference(index) {
    const element = this.referenceList.querySelector(`[data-index="${index}"]`);
    if (!element) return;
    element.classList.add('complete');
    element.querySelector('.reference-status').textContent = '✅';
    element.querySelector('.reference-status').setAttribute('aria-label', 'coletado');
  }

  flashObject(foundItem) {
    this.highlightedItem = { ...foundItem, until: Date.now() + 700 };
  }

  checkHouseArrival() {
    const houseEntry = Object.entries(houses).find(([, house]) => Math.abs(this.position.x - house.x) < HOUSE_WIDTH / 2 && Math.abs(this.position.y - houseY) < HOUSE_HEIGHT);
    if (!houseEntry) return;

    const [houseId] = houseEntry;
    if (houseId !== this.level.correctHouse) {
      this.fail(`Essa é a ${houses[houseId].label}. Procure a ${houses[this.level.correctHouse].label}.`);
      return;
    }

    if (this.collected.length !== this.level.target.length) {
      this.fail('Ainda faltam objetos da Caixa de Referência.');
      return;
    }

    this.message.textContent = `Vitória! Você chegou à ${houses[houseId].label}.`;
    this.pointerActive = false;
    playSuccess();
  }

  fail(text) {
    this.activeErrorUntil = Date.now() + 1000;
    this.message.textContent = text;
    this.position = { ...this.lastBranch };
    this.reachableSegments.clear();
    playError();
  }

  loop() {
    this.draw();
    this.raf = window.requestAnimationFrame(() => this.loop());
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground(ctx);
    this.drawPaths(ctx);
    this.drawItems(ctx);
    this.drawHouses(ctx);
    this.drawCharacter(ctx);
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 960, 560);
    gradient.addColorStop(0, '#f7e8ff');
    gradient.addColorStop(0.5, '#e2f5ff');
    gradient.addColorStop(1, '#fff3d7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 960, 560);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (let x = 40; x < 940; x += 120) {
      ctx.beginPath();
      ctx.arc(x, 92 + (x % 3) * 28, 22, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPaths(ctx) {
    this.level.paths.forEach((currentPath) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = currentPath.visualOnlyCrossing ? 12 : 18;
      ctx.strokeStyle = this.activeErrorUntil > Date.now() ? '#ff4f66' : currentPath.deadEnd ? '#d6c5ff' : '#ffffff';
      ctx.setLineDash(currentPath.visualOnlyCrossing ? [18, 18] : []);
      ctx.shadowColor = 'rgba(91, 84, 138, 0.18)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      currentPath.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      ctx.lineWidth = currentPath.visualOnlyCrossing ? 3 : 5;
      ctx.strokeStyle = currentPath.deadEnd ? '#a989e8' : '#78a8c9';
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.restore();
    });
  }

  drawItems(ctx) {
    const now = Date.now();
    const nextEmoji = this.level.target[this.collected.length];
    const shouldHint = now - this.lastInteractionAt > IDLE_HINT_MS;

    this.level.paths.forEach((currentPath) => {
      currentPath.items.forEach((foundItem, itemIndex) => {
        const key = `${currentPath.id}-${itemIndex}`;
        const isCollected = this.completedItems.has(key);
        const isFlashing = this.highlightedItem && this.highlightedItem.until > now && distance(this.highlightedItem, foundItem) < 4;
        const isHint = shouldHint && foundItem.emoji === nextEmoji && !isCollected;

        ctx.save();
        ctx.globalAlpha = isCollected ? 0.35 : 1;
        if (isFlashing || isHint) {
          ctx.shadowColor = isFlashing ? '#55d66b' : '#ffd447';
          ctx.shadowBlur = 24 + Math.sin(now / 180) * 8;
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(foundItem.x, foundItem.y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '30px system-ui, Apple Color Emoji, Segoe UI Emoji';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(foundItem.emoji, foundItem.x, foundItem.y + 1);
        ctx.restore();
      });
    });
  }

  drawHouses(ctx) {
    HOUSE_ORDER.forEach((houseId) => {
      const house = houses[houseId];
      const x = house.x - HOUSE_WIDTH / 2;
      const y = house.y - HOUSE_HEIGHT / 2;

      ctx.save();
      ctx.fillStyle = house.color;
      ctx.strokeStyle = houseId === this.level.correctHouse ? '#27496d' : 'rgba(39,73,109,0.28)';
      ctx.lineWidth = houseId === this.level.correctHouse ? 4 : 2;
      ctx.beginPath();
      ctx.roundRect(x, y, HOUSE_WIDTH, HOUSE_HEIGHT, 16);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#24364b';
      ctx.font = '700 18px Nunito, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(house.label, house.x, house.y);
      ctx.restore();
    });
  }

  drawCharacter(ctx) {
    ctx.save();
    ctx.shadowColor = 'rgba(36,54,75,0.25)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '30px system-ui, Apple Color Emoji, Segoe UI Emoji';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧒', this.position.x, this.position.y + 1);
    ctx.restore();
  }
}
