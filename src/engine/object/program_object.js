export class ProgramObject {
  #object;

  #programs;

  constructor(object, programs) {
    this.#object = object;
    this.#programs = programs;
  }

  get object() {
    return this.#object;
  }

  get programs() {
    return this.#programs;
  }
}

export default ProgramObject;
