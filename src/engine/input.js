// Virtual joystick (left side, appears where the thumb lands) + big action button + keyboard

export class Input {
  constructor() {
    this.keys = {};
    this.action = false;
    this.enabled = true;
    this.joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
    this.botMove = null; // for automated tests
    this.R = 58;

    const layer = document.getElementById('touch');
    const base = this.base = document.getElementById('joy-base');
    const knob = this.knob = document.getElementById('joy-knob');
    this.layer = layer;

    const down = (e) => {
      if (!this.enabled) return;
      if (this.joy.id !== null) return;
      if (e.clientX > window.innerWidth * 0.62 && e.pointerType !== 'mouse') return;
      this.joy.id = e.pointerId;
      this.joy.ox = e.clientX; this.joy.oy = e.clientY;
      this.joy.x = 0; this.joy.y = 0;
      base.style.display = 'block';
      base.style.left = e.clientX + 'px'; base.style.top = e.clientY + 'px';
      knob.style.transform = 'translate(-50%,-50%)';
      try { layer.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      e.preventDefault();
    };
    const move = (e) => {
      if (e.pointerId !== this.joy.id) return;
      let dx = e.clientX - this.joy.ox, dy = e.clientY - this.joy.oy;
      const d = Math.hypot(dx, dy);
      const R = this.R;
      if (d > R) {
        // let the base follow the thumb a little so it never feels stuck
        const k = (d - R) / d;
        this.joy.ox += dx * k; this.joy.oy += dy * k;
        base.style.left = this.joy.ox + 'px'; base.style.top = this.joy.oy + 'px';
        dx = e.clientX - this.joy.ox; dy = e.clientY - this.joy.oy;
      }
      this.joy.x = dx / R; this.joy.y = dy / R;
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      e.preventDefault();
    };
    const up = (e) => {
      if (e.pointerId !== this.joy.id) return;
      this.joy.id = null; this.joy.x = 0; this.joy.y = 0;
      base.style.display = 'none';
    };
    layer.addEventListener('pointerdown', down);
    layer.addEventListener('pointermove', move);
    layer.addEventListener('pointerup', up);
    layer.addEventListener('pointercancel', up);
    layer.addEventListener('lostpointercapture', up);

    const btn = document.getElementById('act-btn');
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!this.enabled) return;
      this.action = true;
      btn.classList.add('press');
      setTimeout(() => btn.classList.remove('press'), 120);
    });

    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT')) return;
      this.keys[e.code] = true;
      if (['Space', 'KeyE', 'Enter', 'KeyJ'].includes(e.code) && !e.repeat) {
        if (this.enabled) this.action = true;
        e.preventDefault();
      }
      if (e.code.startsWith('Arrow')) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('blur', () => { this.keys = {}; });
  }
  reset() {
    this.joy.id = null; this.joy.x = 0; this.joy.y = 0; this.action = false; this.keys = {};
    this.base.style.display = 'none';
  }
  consumeAction() {
    const a = this.action;
    this.action = false;
    return a && this.enabled;
  }
  vector() {
    if (!this.enabled) return { x: 0, y: 0 };
    if (this.botMove) return this.botMove;
    let x = this.joy.x, y = this.joy.y;
    const k = this.keys;
    if (k.ArrowLeft || k.KeyA) x -= 1;
    if (k.ArrowRight || k.KeyD) x += 1;
    if (k.ArrowUp || k.KeyW) y -= 1;
    if (k.ArrowDown || k.KeyS) y += 1;
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    if (m < 0.12) return { x: 0, y: 0 };
    return { x, y };
  }
}
