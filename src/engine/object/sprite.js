import Object2D from './object_2d';

export class Sprite extends Object2D {
  #colorMapTexture;

  #texels;

  constructor(props) {
    super({ ...props, vertices: [0, 0, 0, 1, 1, 0, 1, 1] });

    this.#colorMapTexture = props.colorMapTexture;
    this.#texels = Float32Array.from([0, 0, 0, 1, 1, 0, 1, 1]);
  }

  get colorMapTexture() {
    return this.#colorMapTexture;
  }

  get texels() {
    return this.#texels;
  }
}

export default Sprite;
