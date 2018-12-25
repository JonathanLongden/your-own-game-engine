import { CameraTransform } from '../transform';
import { Renderable } from '../renderer/renderable';

export class Camera extends Renderable {
  #transform;

  constructor() {
    super();
    this.#transform = new CameraTransform();
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
