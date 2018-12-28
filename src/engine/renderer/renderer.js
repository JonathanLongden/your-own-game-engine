import { EventEmitter } from 'fbemitter';

import { createCanvas, setupCanvas } from './canvas';
import { checkWebGLSupport, createRenderingContext } from './webgl';
import { rendererEvent } from './renderer_event';
import { createError } from './error';
import { RenderTimer } from './render_timer';
import { RenderingQueue } from './rendering_queue';

const defaultConfiguration = {
  fpsThreshold: 60
};

export class WebGLRenderer {
  canvas;

  #eventEmitter;

  #timer;

  #queue;

  constructor(configuration = {}) {
    const { canvas } = Object.assign({}, defaultConfiguration, configuration);

    this.canvas = setupCanvas(canvas || createCanvas(), configuration);
    this.#eventEmitter = new EventEmitter();
    this.#timer = new RenderTimer(configuration.fpsThreshold);
    this.#queue = configuration.queue || new RenderingQueue();
  }

  start() {
    const gl = createRenderingContext(this.canvas);

    // if (!checkWebGLSupport(gl)) {
    //   this.#eventEmitter.emit(
    //     rendererEvent.WEBGL_IS_NOT_SUPPORTED,
    //     createError('WebGL is not supported')
    //   );
    //   return;
    // }

    this._prepare(gl);

    this._render(gl);
  }

  on(event, handler) {
    this.#eventEmitter.addListener(event, handler);
  }

  _prepare(gl) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.#queue.prepare(gl);

    // Set first checkpoint.
    this.#timer.init();
  }

  _render(gl) {
    this.#timer.checkpoint();

    if (this.#timer.isReachedThreshold()) {
      this.#timer.reduce();

      this.#eventEmitter.emit(rendererEvent.UPDATE, this.#timer.delta);

      this._renderFrame(gl);
    }

    window.requestAnimationFrame(this._render.bind(this, gl));
  }

  _renderFrame(gl, ctx) {
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.#queue.update(gl, ctx);
  }

  set queue(queue) {
    this.#queue = queue;
  }

  get queue() {
    return this.#queue;
  }
}

export default WebGLRenderer;
