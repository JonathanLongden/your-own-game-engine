import { mat3 } from 'gl-matrix';

export class Camera {
  #pMatrix;

  #tMatrix;

  #sMatrix;

  #rMatrix;

  #vMatrix;

  #vpMatrix;

  constructor({ width, height, rotation, translation, scale }) {
    this.#pMatrix = mat3.fromScaling(mat3.create(), [width, height]);
    this.#tMatrix = mat3.fromTranslation(mat3.create(), translation || [0, 0]);
    this.#rMatrix = mat3.fromRotation(mat3.create(), rotation || 0);
    this.#sMatrix = mat3.fromScaling(mat3.create(), scale || [1, 1]);
    this.#vMatrix = mat3.create();
    this.#vpMatrix = mat3.create();

    this.recalculate();
  }

  recalculate() {
    // P = PT x PS (pre-calculated).

    // V = T x R x S
    mat3.mul(this.#vMatrix, this.#tMatrix, this.#rMatrix);
    mat3.mul(this.#vMatrix, this.#vMatrix, this.#sMatrix);
    mat3.invert(this.#vMatrix, this.#vMatrix);

    // VP = P x V
    mat3.mul(this.#vpMatrix, this.#pMatrix, this.#vMatrix);
  }

  get translationMatrix() {
    return this.#tMatrix;
  }

  get scaleMatrix() {
    return this.#sMatrix;
  }

  get rotationMatrix() {
    return this.#rMatrix;
  }

  get viewMatrix() {
    return this.#vMatrix;
  }

  get projectionMatrix() {
    return this.#pMatrix;
  }

  get viewProjectionMatrix() {
    return this.#vpMatrix;
  }
}

export default Camera;
