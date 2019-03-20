import { coords } from '../util';
import AbstractTexture from './abstract_texture';
import { FRAMEBUFFER_TEXTURE_TYPE } from './texture_types';
import BaseTexture from './base_texture';

export class FramebufferTexture extends AbstractTexture {
  #baseTexture;

  #textureCoords;

  constructor({ width, height }) {
    super({ type: FRAMEBUFFER_TEXTURE_TYPE });

    this.#baseTexture = new BaseTexture({ width, height });
    const unitCoords = coords.px2unit(width, height, [0, 0, 1, 1]);

    this.#textureCoords = Float32Array.from(unitCoords);
  }

  get baseTexture() {
    return this.#baseTexture;
  }

  get textureCoords() {
    return this.#textureCoords;
  }
}

export default FramebufferTexture;
