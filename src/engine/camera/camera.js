import { mat3 } from 'gl-matrix';

export class Camera {
  #pMatrix;

  #tMatrix;

  #sMatrix;

  #rMatrix;

  #vMatrix;

  #zoom;

  constructor({ width, height, zoom, rotation, translation, scale }) {
    this.#tMatrix = mat3.fromTranslation(mat3.create(), translation || [0, 0]);
    this.#rMatrix = mat3.fromRotation(mat3.create(), rotation || 0);
    this.#sMatrix = mat3.fromScaling(mat3.create(), scale || [1, 1]);
    this.#vMatrix = mat3.create();
    this.#pMatrix = mat3.create();
    this.#zoom = zoom;

    this.updateProjectionMatrix({ width, height });
    this.updateViewMatrix();
  }

  updateProjectionMatrix({ width, height }) {
    const aspectWidth = 1 / Math.max(width / height, 1);
    const aspectHeight = 1 / Math.max(height / width, 1);

    this.#pMatrix = mat3.set(
      mat3.create(),
      aspectWidth,
      0,
      aspectWidth - 1,
      0,
      aspectHeight,
      1 - aspectHeight,
      0,
      0,
      1
    );
  }

  updateViewMatrix() {
    mat3.mul(this.#vMatrix, this.#tMatrix, this.#rMatrix);
    mat3.mul(this.#vMatrix, this.#vMatrix, this.#sMatrix);
    mat3.invert(this.#vMatrix, this.#vMatrix);
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

  get zoom() {
    return this.#zoom;
  }

  set zoom(zoom) {
    this.#zoom = zoom;
  }
}

export default Camera;
