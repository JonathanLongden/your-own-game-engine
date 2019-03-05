import { Object2D } from './object_2d';
import { SPRITE_CONTAINER_TYPE } from './object_2d_types';
import {
  SPRITE_CONTAINER_CHILD_ADD,
  SPRITE_CONTAINER_CHILD_REMOVE
} from './sprite_container_events';

export class SpriteContainer extends Object2D {
  #children;

  #colorMapTexture;

  constructor(props) {
    super({ ...props, vertices: [0, 0, 0, 1, 1, 0, 1, 1], type: SPRITE_CONTAINER_TYPE });

    this.#children = [];
    this.#colorMapTexture = {
      width: 0,
      height: 0,
      coords: Float32Array.from([0, 0, 0, 1, 1, 0, 1, 1])
    };
  }

  add(...children) {
    children.forEach(child => {
      this.#children.push(child);
      this.emit(SPRITE_CONTAINER_CHILD_ADD, child);
    });
  }

  remove(child) {
    this.#children.splice(this.#children.indexOf(child), 1);
    this.emit(SPRITE_CONTAINER_CHILD_REMOVE, child);
  }

  get children() {
    return this.#children;
  }

  get colorMapTexture() {
    return this.#colorMapTexture;
  }
}

export default SpriteContainer;
