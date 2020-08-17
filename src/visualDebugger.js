// We'll make VisualDebugger no-op for any environments lacking a DOM (e.g. SSR and React Native non-web platforms).
const hasDOM = window && window.document;

const WIDTH = hasDOM ? window.innerWidth : 0;
const HEIGHT = hasDOM ? window.innerHeight : 0;

class VisualDebugger {
  constructor() {
    if (hasDOM) {
      this.debugCtx = VisualDebugger.createCanvas('sn-debug', 1010);
      this.layoutsCtx = VisualDebugger.createCanvas('sn-layouts', 1000);
    }
  }

  static createCanvas(id, zIndex) {
    const canvas = document.querySelector(`#${id}`) || document.createElement('canvas');

    canvas.setAttribute('id', id);

    const ctx = canvas.getContext('2d');

    canvas.style = `position: fixed; top: 0; left: 0; z-index: ${zIndex}`;

    document.body.appendChild(canvas);

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    return ctx;
  }

  clear() {
    if (!hasDOM) {
      return;
    }
    this.debugCtx.clearRect(0, 0, WIDTH, HEIGHT);
  }

  clearLayouts() {
    if (!hasDOM) {
      return;
    }
    this.layoutsCtx.clearRect(0, 0, WIDTH, HEIGHT);
  }

  drawLayout(layout, focusKey, parentFocusKey) {
    if (!hasDOM) {
      return;
    }
    this.layoutsCtx.strokeStyle = 'green';
    this.layoutsCtx.strokeRect(layout.left, layout.top, layout.width, layout.height);
    this.layoutsCtx.font = '8px monospace';
    this.layoutsCtx.fillStyle = 'red';
    this.layoutsCtx.fillText(focusKey, layout.left, layout.top + 10);
    this.layoutsCtx.fillText(parentFocusKey, layout.left, layout.top + 25);
    this.layoutsCtx.fillText(`left: ${layout.left}`, layout.left, layout.top + 40);
    this.layoutsCtx.fillText(`top: ${layout.top}`, layout.left, layout.top + 55);
  }

  drawPoint(x, y, color = 'blue', size = 10) {
    if (!hasDOM) {
      return;
    }
    this.debugCtx.strokeStyle = color;
    this.debugCtx.lineWidth = 3;
    this.debugCtx.strokeRect(x - (size / 2), y - (size / 2), size, size);
  }
}

export default VisualDebugger;
