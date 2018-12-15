export function createRenderingContext(canvas) {
  return canvas.getContext('webgl', {
    premultipliedAlpha: false,
    alpha: false,
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
