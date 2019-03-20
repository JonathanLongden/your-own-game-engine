import { uuid } from '../util';

export class Framebuffer {
  #uuid;

  #glFramebuffer;

  constructor() {
    this.#uuid = uuid();
  }

  get uuid() {
    return this.#uuid;
  }

  get glFramebuffer() {
    return this.#glFramebuffer;
  }

  set glFramebuffer(glFramebuffer) {
    this.#glFramebuffer = glFramebuffer;
  }
}

export default Framebuffer;
