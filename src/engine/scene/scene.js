import { RenderingQueue } from '../renderer';

export class Scene extends RenderingQueue {
  #camera;

  attachCamera(camera) {
    this.add(camera);

    this.#camera = camera;
  }

  perObjRendering(obj, gl, ctx) {
    obj.update(gl, { ...ctx, camera: this.#camera });
  }
}

export default Scene;
