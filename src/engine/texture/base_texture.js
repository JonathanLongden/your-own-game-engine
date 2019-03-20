import { BASE_TEXTURE_TYPE } from './texture_types';
import { AbstractTexture } from './abstract_texture';

export class BaseTexture extends AbstractTexture {
  #image;

  #width;

  #height;

  #glTexture;

  constructor({ image = null, width, height } = {}) {
    super({ type: BASE_TEXTURE_TYPE });
    this.#image = image;
    this.#glTexture = null;
    this.#width = (image && image.width) || width;
    this.#height = (image && image.height) || height;
  }

  get image() {
    return this.#image;
  }

  set glTexture(glTexture) {
    this.#glTexture = glTexture;
  }

  get glTexture() {
    return this.#glTexture;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }
}

export default BaseTexture;
