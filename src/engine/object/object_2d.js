import { Transform } from '../transform';
import { Renderable } from '../renderer';

export class Object2D extends Renderable {
  #glVertices;

  #sp;

  #transform;

  constructor(vertices, sp) {
    super();
    this.#glVertices = Float32Array.from(vertices);
    this.#sp = sp;
    this.#transform = new Transform();
  }

  prepare(gl) {
    super.prepare(gl);

    this.#sp.prepare(gl); // tbd Each time?
  }

  update(gl) {
    gl.useProgram(this.#sp.glProgram);

    this.#transform.update();

    this.#sp.update(
      gl,
      {
        a_pos: this.#glVertices
      },
      {
        u_m: this.#transform.mMatrix
      }
    );
  }

  get glVertices() {
    return this.#glVertices;
  }

  get transform() {
    return this.#transform;
  }

  get sp() {
    return this.#sp;
  }
}

export default Object2D;
