import { EventEmitter } from 'fbemitter';

import { createCanvas, setupCanvas } from './canvas';
import { checkWebGLSupport, createRenderingContext } from './webgl';
import { rendererEvent } from './renderer_event';
import { createError } from './error';
import { RenderTimer } from './render_timer';

const defaultConfiguration = {
  fpsThreshold: 60
};

export class WebGLRenderer {
  canvas;

  #eventEmitter;

  #timer;

  constructor(configuration = {}) {
    const { canvas } = Object.assign({}, defaultConfiguration, configuration);

    this.canvas = setupCanvas(canvas || createCanvas(), configuration);
    this.#eventEmitter = new EventEmitter();
    this.#timer = new RenderTimer(configuration.fpsThreshold);
  }

  start() {
    const gl = createRenderingContext(this.canvas);

    if (!checkWebGLSupport(gl)) {
      this.#eventEmitter.emit(
        rendererEvent.WEBGL_IS_NOT_SUPPORTED,
        createError('WebGL is not supported')
      );
      return;
    }

    this._prepare(gl);

    this._render(gl);
  }

  on(event, handler) {
    this.#eventEmitter.addListener(event, handler);
  }

  _prepare(gl) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Set first checkpoint.
    this.#timer.init();
  }

  _render(...args) {
    const [gl] = args;

    this.#timer.checkpoint();

    if (this.#timer.isReachedThreshold()) {
      this.#timer.reduce();

      this.#eventEmitter.emit(rendererEvent.UPDATE, this.#timer.delta);

      this._renderFrame(gl);
    }

    window.requestAnimationFrame(this._render.bind(this, ...args));
  }

  _renderFrame(gl) {
    gl.clearColor(Math.random(), Math.random(), Math.random(), 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
}

export default WebGLRenderer;
