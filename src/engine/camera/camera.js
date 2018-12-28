import { CameraTransform } from '../transform';
import { Renderable } from '../renderer/renderable';

export class Camera extends Renderable {
  #transform;

  constructor(width, height) {
    super();
    this.#transform = new CameraTransform(width, height);
  }

  update(gl, ctx) {
    super.update(gl, ctx);

    this.#transform.update();
  }

  get transform() {
    return this.#transform;
  }
}

export default Camera;
