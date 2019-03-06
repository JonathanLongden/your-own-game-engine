import { Object2D } from './object_2d';
import { SPRITE_CONTAINER_TYPE } from './object_2d_types';
import {
  SPRITE_CONTAINER_CHILD_ADD,
  SPRITE_CONTAINER_CHILD_REMOVE
} from './sprite_container_events';
import { COLOR_MAP } from '../renderer';

export class SpriteContainer extends Object2D {
  #children;

  #colorMapTexture;

  constructor(props) {
    super({ ...props, vertices: [0, 0, 0, 1, 1, 0, 1, 1], type: SPRITE_CONTAINER_TYPE });

    this.#children = [];
    this.#colorMapTexture = {
      width: 0,
      height: 0,
      coords: Float32Array.from([0, 0, 0, 1, 1, 0, 1, 1]),
      type: COLOR_MAP,
      name: `${this.uuid}_color_map`
    };
  }

  add(...children) {
    children.forEach(child => {
      this.#children.push(child);
      this.emit(SPRITE_CONTAINER_CHILD_ADD, child);

      const {
        coords: [x, y, x1, y1] = [],
        image: { width: imageWidth, height: imageHeight } = {}
      } = child.colorMapTexture;

      const width = imageWidth || x1 - x;
      const height = imageHeight || y1 - y;

      this.#colorMapTexture.width += width;
      this.#colorMapTexture.height += height;
    });

    console.log(this.#colorMapTexture);
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
