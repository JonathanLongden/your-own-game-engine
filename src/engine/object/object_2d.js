import { mat3 } from 'gl-matrix';
import { EventEmitter } from 'fbemitter';

import { uuid } from '../util';
import { OBJECT_2D_TYPE } from './object_2d_types';

export class Object2D extends EventEmitter {
  #tMatrix;

  #rMatrix;

  #sMatrix;

  #mMatrix;

  #vertices;

  #type;

  #uuid;

  constructor({ vertices, translation, rotation, scale, type }) {
    super();
    this.#uuid = uuid();
    this.#type = type || OBJECT_2D_TYPE;
    this.#vertices = Float32Array.from(vertices);
    this.#tMatrix = mat3.fromTranslation(mat3.create(), translation || [0, 0]);
    this.#rMatrix = mat3.fromRotation(mat3.create(), rotation || 0);
    this.#sMatrix = mat3.fromScaling(mat3.create(), scale || [1, 1]);
    this.#mMatrix = mat3.create();

    this.updateModelMatrix();
  }

  updateModelMatrix() {
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

  get type() {
    return this.#type;
  }

  get uuid() {
    return this.#uuid;
  }
}

export default Object2D;
