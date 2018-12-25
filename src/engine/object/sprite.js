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

    this.#texture.prepare(gl);
  }

  update(gl, ctx) {
    super.update(gl);

    const { camera } = ctx;

    // Color map texture (TEXTURE0) update.
    this.#texture.update(gl, gl.TEXTURE0);

    this.sp.update(
      gl,
      {},
      {
        u_cm: gl.TEXTURE0,
        u_v: camera.transform.vMatrix
      }
    );
  }

  get texture() {
    return this.#texture;
  }
}

export default Sprite;
