import Object2D from './object_2d';
import { SPRITE_TYPE } from './object_2d_types';

export class Sprite extends Object2D {
  #diffuseMap;

  constructor(props) {
    super({ ...props, vertices: [0, 0, 0, 1, 1, 0, 1, 1], type: SPRITE_TYPE });

    this.#diffuseMap = props.diffuseMap;
  }

  get diffuseMap() {
    return this.#diffuseMap;
  }
}

export default Sprite;
