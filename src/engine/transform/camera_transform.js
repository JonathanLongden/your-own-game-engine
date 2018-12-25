import { mat3 } from 'gl-matrix';

export class CameraTransform {
  constructor() {
    this.#tMatrix = mat3.fromTranslation(mat3.create(), [0, 0]);
    this.#sMatrix = mat3.fromScaling(mat3.create(), [1, 1]);
    this.#vMatrix = mat3.create();
  }

  update() {
    this.#vMatrix = mat3.mul(this.#vMatrix, this.#tMatrix, this.#sMatrix);
  }

  get vMatrix() {
    return this.#vMatrix;
  }
}

export default CameraTransform;
