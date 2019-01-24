import { autobind } from 'core-decorators';

export class MouseController {
  #pressedKeys;

  #x;

  #y;

  #wheel;

  #movementX;

  #movementY;

  #movementWheel;

  constructor() {
    this.#pressedKeys = {};
    this.#wheel = 0;
    this.#movementX = 0;
    this.#movementY = 0;
    this.#movementWheel = 0;
  }

  bind() {
    this.unbind();

    window.addEventListener('mousedown', this._handleMouseDown);
    window.addEventListener('mouseup', this._handleMouseUp);
    window.addEventListener('mousemove', this._handleMouseMove);
    window.addEventListener('wheel', this._handleMouseWheel);
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
  }

  @autobind
  _handleMouseUp(e) {
    const { button } = e;

    this.#x = undefined;
    this.#y = undefined;
    this.#movementX = 0;
    this.#movementY = 0;

    delete this.#pressedKeys[button];
  }

  @autobind
  _handleMouseMove(e) {
    const { movementX, movementY } = e;

    this.#movementX = movementX;
    this.#movementY = movementY;
  }

  @autobind
  _handleMouseWheel(e) {
    const { deltaY } = e;

    this.#movementWheel = this.#wheel - deltaY;
    this.#wheel = deltaY;
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
