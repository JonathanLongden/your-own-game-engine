import { Quad } from './quad';

export class Sprite extends Quad {
  #glTexels;

  constructor() {
    super();

    this.#glTexels = Float32Array.from([0, 0, 0, 1, 1, 0, 1, 1]);
  }

  get glTexels() {
    return this.#glTexels;
  }
}

export default Sprite;
