import { mat3 } from 'gl-matrix';

export class Transform {
  #tMatrix;

  #rMatrix;

  #sMatrix;

  #mMatrix;

  constructor() {
    this.#tMatrix = mat3.fromTranslation(mat3.create(), [0, 0]);
    this.#rMatrix = mat3.fromRotation(mat3.create(), 0);
    this.#sMatrix = mat3.fromScaling(mat3.create(), [1, 1]);
    this.#mMatrix = mat3.create();
  }

  update() {
    // tbd upd. only on changes.
    // Transpation x Rotation = TR.
    mat3.mul(this.#mMatrix, this.#tMatrix, this.#rMatrix);

    // TR x Scale = Model.
    this.#mMatrix = mat3.mul(this.#mMatrix, this.#mMatrix, this.#sMatrix);
  }

  get mMatrix() {
    return this.#mMatrix;
  }
}

export default Transform;
