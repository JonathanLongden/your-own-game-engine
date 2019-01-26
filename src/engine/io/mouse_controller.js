import { autobind } from 'core-decorators';
import { EventEmitter } from 'fbemitter';

import { MOUSE_DOWN, MOUSE_UP, MOUSE_MOVE, MOUSE_WHEEL } from './io_events';

export class MouseController extends EventEmitter {
  #pressedKeys;

  #x;

  #y;

  #wheel;

  #movementX;

  #movementY;

  #movementWheel;

  constructor() {
    super();

    this.#pressedKeys = {};
    this.#wheel = 0;
    this.#movementX = 0;
    this.#movementY = 0;
    this.#movementWheel = 0;
  }

  bind() {
    this.unbind();

    window.addEventListener('mousedown', this._handleMouseDown, { passive: false });
    window.addEventListener('mouseup', this._handleMouseUp, { passive: false });
    window.addEventListener('mousemove', this._handleMouseMove, { passive: false });
    window.addEventListener('wheel', this._handleMouseWheel, { passive: false });
  }

  unbind() {
    window.removeEventListener('mousedown', this._handleMouseDown);
    window.removeEventListener('mouseup', this._handleMouseUp);
    window.removeEventListener('mousemove', this._handleMouseMove);
    window.removeEventListener('wheel', this._handleMouseWheel);
  }

  update() {
    this.#movementX = 0;
    this.#movementY = 0;
    this.#movementWheel = 0;
  }

  pressed(code, { shift = false, alt = false, meta = false, ctrl = false } = {}) {
    const keyObj = this.#pressedKeys[code];

    if (!keyObj) return false;

    return (
      shift === keyObj.shift && alt === keyObj.alt && meta === keyObj.meta && ctrl === keyObj.ctrl
    );
  }

  @autobind
  _handleMouseDown(e) {
    const {
      shiftKey: shift,
      altKey: alt,
      metaKey: meta,
      ctrlKey: ctrl,
      button,
      screenX: x,
      screenY: y
    } = e;

    e.preventDefault();

    this.#x = x;
    this.#y = y;
    this.#movementX = 0;
    this.#movementY = 0;

    this.#pressedKeys[button] = {
      shift,
      ctrl,
      meta,
      alt
    };

    this.emit(MOUSE_DOWN, { shift, ctrl, meta, alt, button, x, y });
  }

  @autobind
  _handleMouseUp(e) {
    const { shiftKey: shift, altKey: alt, metaKey: meta, ctrlKey: ctrl, button } = e;

    e.preventDefault();

    this.#x = undefined;
    this.#y = undefined;
    this.#movementX = 0;
    this.#movementY = 0;

    delete this.#pressedKeys[button];

    this.emit(MOUSE_UP, { shift, ctrl, meta, alt, button });
  }

  @autobind
  _handleMouseMove(e) {
    const { movementX, movementY, screenX: x, screenY: y } = e;

    e.preventDefault();

    this.#movementX = movementX;
    this.#movementY = movementY;
    this.#x = x;
    this.#y = y;

    this.emit(MOUSE_MOVE, { x, y, movementX, movementY });
  }

  @autobind
  _handleMouseWheel(e) {
    const { deltaY } = e;

    e.preventDefault();

    this.#movementWheel = this.#wheel - deltaY;
    this.#wheel = deltaY;

    this.emit(MOUSE_WHEEL, { wheel: this.#wheel, movement: this.#movementWheel });
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get wheel() {
    return this.#wheel;
  }

  get movementX() {
    return this.#movementX;
  }

  get movementY() {
    return this.#movementY;
  }

  get movementWheel() {
    return this.#movementWheel;
  }
}

export default MouseController;
