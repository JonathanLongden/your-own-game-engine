import { EventEmitter } from 'fbemitter';
import { autobind } from 'core-decorators';

import { KEY_DOWN, KEY_UP } from './io_events';

export class KeyboardController extends EventEmitter {
  #pressedKeys;

  constructor() {
    super();

    this.#pressedKeys = {};
  }

  bind() {
    this.unbind();

    window.addEventListener('keydown', this._handleKeyDown, { passive: false });
    window.addEventListener('keyup', this._handleKeyUp, { passive: false });
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

    e.preventDefault();

    this.#pressedKeys[code] = {
      shift,
      ctrl,
      meta,
      alt
    };

    this.emit(KEY_DOWN, { shift, ctrl, meta, alt, code });
  }

  @autobind
  _handleKeyUp(e) {
    const {
      shiftKey: shift = false,
      altKey: alt = false,
      metaKey: meta = false,
      ctrlKey: ctrl = false,
      keyCode: code
    } = e;

    e.preventDefault();

    delete this.#pressedKeys[code];

    this.emit(KEY_UP, { shift, ctrl, meta, alt, code });
  }
}

export default KeyboardController;
