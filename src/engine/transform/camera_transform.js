import { mat3 } from 'gl-matrix';

export class CameraTransform {
  #tMatrix;

  #sMatrix;

  #vMatrix;

  constructor(width, height) {
    this.#tMatrix = mat3.fromTranslation(mat3.create(), [width - 1, 1 - height]);
    this.#sMatrix = mat3.fromScaling(mat3.create(), [width, height]);
    this.#vMatrix = mat3.create();
  }

  update() {
    // tbd update only on changes.
    this.#vMatrix = mat3.mul(this.#vMatrix, this.#tMatrix, this.#sMatrix);
  }

  get vMatrix() {
    return this.#vMatrix;
  }
}

export default CameraTransform;
