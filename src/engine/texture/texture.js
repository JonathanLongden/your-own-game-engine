import { coords } from '../util';
import { AbstractTexture } from './abstract_texture';
import { TEXTURE_TYPE } from './texture_types';

export class Texture extends AbstractTexture {
  #baseTexture;

  #textureCoords;

  #width;

  #height;

  constructor({ baseTexture, pixelCoords = [0, 0, 1, 1] }) {
    super({ type: TEXTURE_TYPE });
    this.#baseTexture = baseTexture;

    const { image: { width = 1, height = 1 } = {} } = this.#baseTexture;
    const textureCoords = coords.px2unit(width, height, pixelCoords);

    this.#textureCoords = Float32Array.from(textureCoords);

    this.#width = pixelCoords[2] - pixelCoords[0];
    this.#height = pixelCoords[3] - pixelCoords[1];
  }

  get baseTexture() {
    return this.#baseTexture;
  }

  get textureCoords() {
    return this.#textureCoords;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }
}

export default Texture;
