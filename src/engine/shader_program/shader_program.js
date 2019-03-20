export class ShaderProgram {
  #vSource;

  #fSource;

  #attributes;

  #uniforms;

  constructor({ vSource, fSource, attributes, uniforms }) {
    this.#vSource = vSource;
    this.#fSource = fSource;
    this.#attributes = attributes;
    this.#uniforms = uniforms;
  }

  /**
   * Should be overriden.
   */
  onUpdate() {
    return false;
  }

  get vSource() {
    return this.#vSource;
  }

  get fSource() {
    return this.#fSource;
  }

  get attributes() {
    return this.#attributes;
  }

  get uniforms() {
    return this.#uniforms;
  }
}

export default ShaderProgram;
