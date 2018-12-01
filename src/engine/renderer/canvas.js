export function setupCanvas(canvas, configuration) {
  const { width, height } = configuration;

  canvas.width = width;
  canvas.height = height;

  return canvas;
}

export function createCanvas() {
  return document.createElement('canvas');
}

export default {
  setupCanvas,
  createCanvas
};
