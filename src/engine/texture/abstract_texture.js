import { uuid } from '../util';

export class AbstractTexture {
  #uuid;

  #type;

  constructor({ type }) {
    this.#type = type;
    this.#uuid = uuid();
  }

  get type() {
    return this.#type;
  }

  get uuid() {
    return this.#uuid;
  }
}

export default AbstractTexture;
