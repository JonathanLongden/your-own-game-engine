import { autobind } from 'core-decorators';

import { Controller } from './controller';

export class Touch extends Controller {
  #touches;

  constructor() {
    super();

    this.#touches = {};
  }

  bind() {
    this.unbind();

    window.addEventListener('touchstart', this._handleTouchStart);
    window.addEventListener('touchmove', this._handleTouchMove);
    window.addEventListener('touchend', this._handleTouchEnd);
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

    for (let i = 0; i < changedTouches.length; i += 1) {
      const { identifier, screenX: x, screenY: y } = changedTouches[i];

      this.#touches[identifier] = {
        x,
        y,
        moveX: 0,
        moveY: 0
      };
    }
  }

  @autobind
  _handleTouchMove(e) {
    const { changedTouches } = e;

    for (let i = 0; i < changedTouches.length; i += 1) {
      const { identifier, screenX: x, screenY: y } = changedTouches[i];

      const { x: prevX, y: prevY } = this.#touches[identifier];

      this.#touches[identifier] = {
        x,
        y,
        moveX: x - prevX,
        moveY: y - prevY
      };
    }
  }

  @autobind
  _handleTouchEnd(e) {
    const { changedTouches } = e;

    for (let i = 0; i < changedTouches.length; i += 1) {
      const { identifier } = changedTouches[i];

      delete this.#touches[identifier];
    }
  }
}

export default Touch;
