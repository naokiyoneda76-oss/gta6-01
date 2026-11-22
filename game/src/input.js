export const InputManager = class InputManager {
  constructor(target = window) {
    this.held = new Set(); this.actions = 0; this.mouseX = 0; this.mouseY = 0; this.mouseButtons = 0;
    target.addEventListener('keydown', e => { this.held.add(e.code); if (!e.repeat) { if (e.code === 'Enter' || e.code === 'Space') this.actions |= 1; if (e.code === 'Escape' || e.code === 'KeyP') this.actions |= 2; if (e.code === 'KeyE') this.actions |= 4; if (e.code === 'Tab') { this.actions |= 8; e.preventDefault(); } } if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault(); });
    target.addEventListener('keyup', e => this.held.delete(e.code)); target.addEventListener('blur', () => this.held.clear());
    target.addEventListener('pointermove', e => { this.mouseX = e.clientX; this.mouseY = e.clientY; });
    target.addEventListener('pointerdown', e => { this.mouseButtons |= 1 << e.button; }); target.addEventListener('pointerup', e => { this.mouseButtons &= ~(1 << e.button); });
  }
  isDown(code) { return this.held.has(code); }
  takeActions() { const a = this.actions; this.actions = 0; return a; }
};
