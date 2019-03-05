import Object2D from './object_2d';
import { SPRITE_TYPE } from './object_2d_types';

export class Sprite extends Object2D {
  #colorMapTexture;

  #texels;

  constructor(props) {
    super({ ...props, vertices: [0, 0, 0, 1, 1, 0, 1, 1], type: props.type || SPRITE_TYPE });

    this.#colorMapTexture = {
      ...props.colorMapTexture,
      coords: Float32Array.from(props.colorMapTexture.coords || [0, 0, 0, 1, 1, 0, 1, 1])
    };
  }

  get colorMapTexture() {
    return this.#colorMapTexture;
  }

  get texels() {
    return this.#texels;
  }
}

export default Sprite;
