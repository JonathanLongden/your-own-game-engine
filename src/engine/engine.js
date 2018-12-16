import { autobind } from 'core-decorators';

import { WebGLRenderer, rendererEvent } from './renderer';
import { Keyboard } from './io';

const defaultConfiguration = {
  renderer: null,
  keyboard: null
};

export class Engine {
  #configuration;

  #renderer;

  #io;

  constructor(configuration) {
    this.#configuration = Object.assign({}, defaultConfiguration, configuration);
    this.#renderer = this._setupRenderer(configuration.renderer);
    this.#io = [this._setupKeyboard(configuration.keyboard)];
  }

  start() {
    this.#io.forEach(io => io.bind());
    this.#renderer.on(rendererEvent.UPDATE, this._updateIo);
    this.#renderer.start();
  }

  _setupRenderer(renderer) {
    if (renderer && !(renderer instanceof WebGLRenderer)) {
      throw new Error('Unknown renderer, please provide "WeblGLRenderer" instance');
    }

    return renderer || new WebGLRenderer();
  }

  _setupKeyboard(keyboard) {
    if (keyboard && !(keyboard instanceof Keyboard)) {
      throw new Error('Unknown keyboard, please provide "Keyboard" instance');
    }

    return keyboard || new Keyboard();
  }

  @autobind
  _updateIo() {
    this.#io.forEach(io => io.update());
  }
}

export default Engine;
