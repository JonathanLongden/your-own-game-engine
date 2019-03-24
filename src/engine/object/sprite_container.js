import { Object2D } from './object_2d';
import { SPRITE_CONTAINER_TYPE } from './object_2d_types';
// import { FramebufferTexture } from '../texture';
import { Framebuffer } from '../renderer';
import {
  SPRITE_CONTAINER_CHILD_ADD,
  SPRITE_CONTAINER_CHILD_REMOVE
  // SPRITE_CONTAINER_DIFFUSE_MAP_CHANGE
} from './sprite_container_events';

export class SpriteContainer extends Object2D {
  #children;

  #diffuseMap;

  #framebuffer;

  #width;

  #height;

  constructor(props) {
    // tbd Hardcoded! Need coord calculations based on min side.
    super({ ...props, vertices: [-0.5, 0, -0.5, 1, 1.5, 0, 1.5, 1], type: SPRITE_CONTAINER_TYPE });

    this.#children = [];
    this.#diffuseMap = props.diffuseMap;
    this.#framebuffer = new Framebuffer();
    this.#width = props.width || props.diffuseMap.baseTexture.width;
    this.#height = props.height || props.diffuseMap.baseTexture.height;
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

  get diffuseMap() {
    return this.#diffuseMap;
  }

  get framebuffer() {
    return this.#framebuffer;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }
}

export default SpriteContainer;
