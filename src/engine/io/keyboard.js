import { autobind } from 'core-decorators';

import { Controller } from './controller';

export class Keyboard extends Controller {
  #pressedKeys;

  constructor() {
    super();

    this.#pressedKeys = {};
  }

  bind() {
    this.unbind();

    window.addEventListener('keydown', this._handleKeyDown, false);
    window.addEventListener('keyup', this._handleKeyUp, false);
  }

  unbind() {
    window.removeEventListener('keydown', this._handleKeyDown, false);
    window.removeEventListener('keyup', this._handleKeyUp, false);
  }

  pressed(code, { shift = false, alt = false, meta = false, ctrl = false } = {}) {
    const keyObj = this.#pressedKeys[code];

    if (!keyObj) return false;

    return (
      shift === keyObj.shift && alt === keyObj.alt && meta === keyObj.meta && ctrl === keyObj.ctrl
    );
  }

  @autobind
  _handleKeyDown(e) {
    const {
      shiftKey: shift = false,
      altKey: alt = false,
      metaKey: meta = false,
      ctrlKey: ctrl = false,
      keyCode: code
    } = e;

    this.#pressedKeys[code] = {
      shift,
      ctrl,
      meta,
      alt
    };
  }

  @autobind
  _handleKeyUp(e) {
    const { keyCode: code } = e;

    delete this.#pressedKeys[code];
  }
}

export default Keyboard;
