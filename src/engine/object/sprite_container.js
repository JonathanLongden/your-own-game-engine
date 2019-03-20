import { Object2D } from './object_2d';
import { SPRITE_CONTAINER_TYPE } from './object_2d_types';
import { FramebufferTexture } from '../texture';
import { Framebuffer } from '../renderer';
import {
  SPRITE_CONTAINER_CHILD_ADD,
  SPRITE_CONTAINER_CHILD_REMOVE,
  SPRITE_CONTAINER_DIFFUSE_MAP_CHANGE
} from './sprite_container_events';

export class SpriteContainer extends Object2D {
  #children;

  #diffuseMap;

  #framebuffer;

  constructor(props) {
    super({ ...props, vertices: [0, 0, 0, 1, 1, 0, 1, 1], type: SPRITE_CONTAINER_TYPE });

    this.#children = [];
    this.#diffuseMap = null;
    this.#framebuffer = new Framebuffer();
  }

  add(...children) {
    children.forEach(child => {
      this.#children.push(child);
      this.emit(SPRITE_CONTAINER_CHILD_ADD, child);
      this._recreateDiffuseMap();
    });
  }

  remove(child) {
    this.#children.splice(this.#children.indexOf(child), 1);
    this.emit(SPRITE_CONTAINER_CHILD_REMOVE, child);
    this._recreateDiffuseMap();
  }

  _recreateDiffuseMap(shouldEmit = true) {
    const { width, height } = this.#children.reduce(
      (
        acc,
        {
          diffuseMap: {
            baseTexture: {
              image: { width, height }
            }
          }
        }
      ) => ({ width: acc.width + width, height: acc.height + height }),
      {
        width: 0,
        height: 0
      }
    );
    this.#diffuseMap = new FramebufferTexture({ width, height });

    if (shouldEmit) {
      this.emit(SPRITE_CONTAINER_DIFFUSE_MAP_CHANGE, this.#diffuseMap);
    }
  }

  get children() {
    return this.#children;
  }

  get diffuseMap() {
    return this.#diffuseMap;
  }

  get framebuffer() {
    return this.#framebuffer;
  }
}

export default SpriteContainer;
