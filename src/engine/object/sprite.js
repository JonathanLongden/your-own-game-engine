import { Quad } from './quad';
import { simpleShaderProgram } from '../shader/simple_sp';

export class Sprite extends Quad {
  #texture;

  constructor(texture) {
    super(simpleShaderProgram);

    this.#texture = texture;
  }

  prepare(gl) {
    super.prepare(gl);

    this.#texture.prepare(gl); // tbd Each time?
  }

  update(gl, ctx) {
    super.update(gl);

    const { camera } = ctx;

    // Color map texture (TEXTURE0) update.
    this.#texture.update(gl, gl.TEXTURE0);

    this.sp.update(
      gl,
      {
        a_tex: this.#texture.glTexels
      },
      {
        u_cm: 0,
        u_v: camera.transform.vMatrix
      }
    );
  }

  get texture() {
    return this.#texture;
  }
}

export default Sprite;
