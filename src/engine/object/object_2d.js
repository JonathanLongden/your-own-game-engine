import { mat3 } from 'gl-matrix';

export class Object2D {
  #tMatrix;

  #rMatrix;

  #sMatrix;

  #mMatrix;

  #vertices;

  constructor({ vertices, translation, rotation, scale } = {}) {
    this.#vertices = Float32Array.from(vertices);
    this.#tMatrix = mat3.fromTranslation(mat3.create(), translation || [0, 0]);
    this.#rMatrix = mat3.fromRotation(mat3.create(), rotation || 0);
    this.#sMatrix = mat3.fromScaling(mat3.create(), scale || [1, 1]);
    this.#mMatrix = mat3.create();

    this.recalculate();
  }

  recalculate() {
    // M = T x R x S.
    mat3.mul(this.#mMatrix, this.#tMatrix, this.#rMatrix);
    mat3.mul(this.#mMatrix, this.#mMatrix, this.#sMatrix);
  }

  get translationMatrix() {
    return this.#tMatrix;
  }

  get rotationMatrix() {
    return this.#rMatrix;
  }

  get scaleMatrix() {
    return this.#sMatrix;
  }

  get modelMatrix() {
    return this.#mMatrix;
  }

  get vertices() {
    return this.#vertices;
  }
}

export default Object2D;
