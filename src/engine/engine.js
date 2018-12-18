import { WebGLRenderer, rendererEvent } from './renderer';
import { Keyboard, Mouse } from './io';

const defaultConfiguration = {
  renderer: null,
  keyboard: null,
  mouse: null
};

export class Engine {
  #configuration;

  #renderer;

  #io;

  constructor(configuration) {
    this.#configuration = Object.assign({}, defaultConfiguration, configuration);
    this.#renderer = this._setupRenderer(configuration.renderer);
    this.#io = [this._setupKeyboard(configuration.keyboard), this._setupMouse(configuration.mouse)];
  }

  start() {
    this.#io.forEach(io => io.bind());
    this.#renderer.on(rendererEvent.UPDATE, () => this.#io.forEach(io => io.update()));
    this.#renderer.start();
  }

  _setupRenderer(renderer) {
    if (renderer && !(renderer instanceof WebGLRenderer)) {
      throw new Error('Unknown renderer, please provide "WeblGLRenderer" compatible interface');
    }

    return renderer || new WebGLRenderer();
  }

  _setupKeyboard(keyboard) {
    if (keyboard && !(keyboard instanceof Keyboard)) {
      throw new Error('Unknown keyboard, please provide "Keyboard" compatible interface');
    }

    return keyboard || new Keyboard();
  }

  _setupMouse(mouse) {
    if (mouse && !(mouse instanceof Mouse)) {
      throw new Error('Unknown mouse, please provide "Mouse" compatible interface');
    }

    return mouse || new Mouse();
  }
}

export default Engine;
