import { autobind } from 'core-decorators';
import { EventEmitter } from 'fbemitter';

import { TOUCH_START, TOUCH_MOVE, TOUCH_END } from './io_events';

export class TouchController extends EventEmitter {
  #touches;

  constructor() {
    super();

    this.#touches = {};
  }

  bind() {
    this.unbind();

    window.addEventListener('touchstart', this._handleTouchStart, { passive: false });
    window.addEventListener('touchmove', this._handleTouchMove, { passive: false });
    window.addEventListener('touchend', this._handleTouchEnd, { passive: false });
  }

  unbind() {
    window.removeEventListener('touchstart', this._handleTouchStart);
    window.removeEventListener('touchmove', this._handleTouchMove);
    window.removeEventListener('touchend', this._handleTouchEnd);
  }

  pressed(...touchIds) {
    return touchIds.filter(id => this.#touches[id]).length === touchIds.length;
  }

  getTouch(touchId) {
    return this.#touches[touchId];
  }

  update() {
    Object.keys(this.#touches).forEach(id => {
      const touch = this.#touches[id];

      touch.moveX = 0;
      touch.moveY = 0;
    });
  }

  @autobind
  _handleTouchStart(e) {
    const { changedTouches } = e;

    e.preventDefault();

    const touches = [];

    for (let i = 0; i < changedTouches.length; i += 1) {
      const { identifier, screenX: x, screenY: y } = changedTouches[i];

      this.#touches[identifier] = {
        x,
        y,
        moveX: 0,
        moveY: 0
      };

      touches.push({ id: identifier, x, y });
    }

    this.emit(TOUCH_START, { touches });
  }

  @autobind
  _handleTouchMove(e) {
    const { changedTouches } = e;

    e.preventDefault();

    const touches = [];

    for (let i = 0; i < changedTouches.length; i += 1) {
      const { identifier, screenX: x, screenY: y } = changedTouches[i];

      const { x: prevX, y: prevY } = this.#touches[identifier];

      const moveX = x - prevX;
      const moveY = y - prevY;

      this.#touches[identifier] = {
        x,
        y
      };

      touches.push({ id: identifier, x, y, moveX, moveY });
    }

    this.emit(TOUCH_MOVE, { touches });
  }

  @autobind
  _handleTouchEnd(e) {
    const { changedTouches } = e;

    e.preventDefault();

    const touches = [];

    for (let i = 0; i < changedTouches.length; i += 1) {
      const { identifier } = changedTouches[i];

      delete this.#touches[identifier];

      touches.push({ id: identifier });
    }

    this.emit(TOUCH_END, { touches });
  }
}

export default TouchController;
