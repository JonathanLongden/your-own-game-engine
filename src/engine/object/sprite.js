import Object2D from './object_2d';
import { SPRITE_TYPE } from './object_2d_types';

export class Sprite extends Object2D {
  #diffuseMap;

  #width;

  #height;

  constructor(props) {
    super({ ...props, vertices: [0, 0, 0, 1, 1, 0, 1, 1], type: SPRITE_TYPE });

    this.#diffuseMap = props.diffuseMap;
    this.#width = props.width || props.diffuseMap.baseTexture.width;
    this.#height = props.height || props.diffuseMap.baseTexture.height;
  }

  get diffuseMap() {
    return this.#diffuseMap;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }
}

export default Sprite;
