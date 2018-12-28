import { RenderingQueue } from '../renderer';

export class Scene extends RenderingQueue {
  #camera;

  attachCamera(camera) {
    this.add(camera);

    this.#camera = camera;
  }

  perObjRendering(obj, gl, ctx) {
    // tbd drawing without camera preparation?
    if (obj !== this.#camera) {
      obj.update(gl, { ...ctx, camera: this.#camera });

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, Math.floor(obj.glVertices.length / 2));
      return;
    }

    obj.update(gl, ctx);
  }
}

export default Scene;
