export class Object2D {
  #glVertices;

  constructor(vertices) {
    this.#glVertices = Float32Array.from(vertices);
  }

  get glVertices() {
    return this.#glVertices;
  }
}

export default Object2D;
