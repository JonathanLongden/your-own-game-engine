export function createRenderingContext(canvas) {
  return canvas.getContext('webgl', {
    preserveDrawingBuffer: false,
    premultipliedAlpha: false,
    alpha: true,
    antialias: false
  });
}

export function checkWebGLSupport(gl) {
  return gl && gl instanceof WebGLRenderingContext;
}

export default {
  createRenderingContext,
  checkWebGLSupport
};
