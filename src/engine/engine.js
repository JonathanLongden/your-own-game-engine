import { WebGLRenderer, rendererEvent } from './renderer';
import { Keyboard, Mouse, Touch } from './io';
import { Scene } from './scene';

const defaultConfiguration = {
  renderer: null,
  keyboard: null,
  mouse: null,
  touch: null
};

export class Engine {
  #configuration;

  #renderer;

  #io;

  constructor(configuration) {
    this.#configuration = Object.assign({}, defaultConfiguration, configuration);
    this.#renderer = this._setupRenderer(configuration.renderer);
    this.#io = [
      this._setupKeyboard(configuration.keyboard),
      this._setupMouse(configuration.mouse),
      this._setupTouch(configuration.touch)
    ];
  }

  start(scene) {
    this.#io.forEach(io => io.bind());
    this.#renderer.on(rendererEvent.UPDATE, () => this.#io.forEach(io => io.update()));

    this.#renderer.queue = scene || new Scene();

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
      throw new Error(
        'Unknown keyboard controller, please provide "Keyboard" compatible interface'
      );
    }

    return keyboard || new Keyboard();
  }

  _setupMouse(mouse) {
    if (mouse && !(mouse instanceof Mouse)) {
      throw new Error('Unknown mouse controller, please provide "Mouse" compatible interface');
    }

    return mouse || new Mouse();
  }

  _setupTouch(touch) {
    if (touch && !(touch instanceof Touch)) {
      throw new Error('Unknown touch controller, please provide "Touch" compatible interface');
    }

    return touch || new Touch();
  }
}

export default Engine;
