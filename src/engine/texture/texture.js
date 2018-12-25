export class Texture {
  #glTexture;

  #glTexels;

  #image;

  constructor(image, texels) {
    this.#image = image;
    this.#glTexels = Float32Array.from(texels || [0, 0, 0, 1, 1, 0, 1, 1]);
  }

  prepare(gl) {
    this.#glTexture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.#glTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.#image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  update(gl, texNum) {
    gl.activeTexture(texNum);
    gl.bindTexture(this.#glTexture);
  }

  get glTexture() {
    return this.#glTexture;
  }

  get glTexels() {
    return this.#glTexels;
  }
}

export default Texture;
