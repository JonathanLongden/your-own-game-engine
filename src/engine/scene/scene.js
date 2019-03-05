import { EventEmitter } from 'fbemitter';

import { SCENE_CHILD_ADD, SCENE_CHILD_REMOVE } from './scene_event';
import { SCENE_TYPE } from './scene_types';

export class Scene extends EventEmitter {
  #children;

  #type;

  constructor({ type } = {}) {
    super();
    this.#children = [];
    this.#type = type || SCENE_TYPE;
  }

  add(...children) {
    children.forEach(child => {
      this.#children.push(child);
      this.emit(SCENE_CHILD_ADD, child);
    });
  }

  remove(child) {
    this.#children.splice(this.#children.indexOf(child), 1);
    this.emit(SCENE_CHILD_REMOVE, child);
  }

  get type() {
    return this.#type;
  }

  get children() {
    return this.#children;
  }
}

export default Scene;
