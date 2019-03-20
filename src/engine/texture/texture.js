import { coords } from '../util';
import { AbstractTexture } from './abstract_texture';
import { TEXTURE_TYPE } from './texture_types';

export class Texture extends AbstractTexture {
  #baseTexture;

  #textureCoords;

  constructor({ baseTexture, textureCoords = [0, 0, 1, 1] }) {
    super({ type: TEXTURE_TYPE });
    this.#baseTexture = baseTexture;

    const { image: { width = 1, height = 1 } = {} } = this.#baseTexture;
    const unitCoords = coords.px2unit(width, height, textureCoords);

    this.#textureCoords = Float32Array.from(unitCoords);
  }

  get baseTexture() {
    return this.#baseTexture;
  }

  get textureCoords() {
    return this.#textureCoords;
  }
}

export default Texture;
