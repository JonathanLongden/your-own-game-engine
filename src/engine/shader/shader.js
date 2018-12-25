export class Shader {
  #source;

  #glShader;

  constructor(source) {
    this.#source = source;
    this.#glShader = null;
  }

  prepare(gl, type) {
    this.#glShader = gl.createShader(type);

    gl.shaderSource(this.#glShader, this.#source);
    gl.compileShader(this.#glShader);

    if (!gl.getShaderParameter(this.#glShader, gl.COMPILE_STATUS)) {
      throw new Error('Could not compile shader');
    }

    return this.#glShader;
  }
}

export default Shader;
