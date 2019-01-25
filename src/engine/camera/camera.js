import { mat3 } from 'gl-matrix';

export class Camera {
  #tMatrix;

  #sMatrix;

  #vMatrix;

  constructor({ width, height }) {
    this.#tMatrix = mat3.fromTranslation(mat3.create(), [width - 1, 1 - height]);
    this.#sMatrix = mat3.fromScaling(mat3.create(), [width, height]);
    this.#vMatrix = mat3.mul(mat3.create(), this.#tMatrix, this.#sMatrix);
  }

  get translationMatrix() {
    return this.#tMatrix;
  }

  get scaleMatrix() {
    return this.#sMatrix;
  }

  get viewMatrix() {
    return this.#vMatrix;
  }
}

export default Camera;
