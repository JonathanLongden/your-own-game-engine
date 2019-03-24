import AbstractTexture from './abstract_texture';
import { FRAMEBUFFER_TEXTURE_TYPE } from './texture_types';
import BaseTexture from './base_texture';

export class FramebufferTexture extends AbstractTexture {
  #baseTexture;

  #textureCoords;

  constructor({ width, height }) {
    super({ type: FRAMEBUFFER_TEXTURE_TYPE });

    this.#baseTexture = new BaseTexture({ width, height });
    this.#textureCoords = Float32Array.from([0, 0, 0, 1, 1, 0, 1, 1]);
  }

  get baseTexture() {
    return this.#baseTexture;
  }

  get textureCoords() {
    return this.#textureCoords;
  }

  get width() {
    return this.#baseTexture.width;
  }

  get height() {
    return this.#baseTexture.height;
  }
}

export default FramebufferTexture;
