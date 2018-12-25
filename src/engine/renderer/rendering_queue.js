import { Renderable } from './renderable';

export class RenderingQueue extends Renderable {
  #queue;

  constructor() {
    super();
    this.#queue = [];
  }

  prepare(gl) {
    super.prepare(gl);

    this.#queue.forEach(obj => obj.prepare(gl));
  }

  update(gl, ctx) {
    super.update(gl, ctx);

    this.#queue.forEach(obj => this.perObjRendering(obj, gl, ctx));
  }

  perObjRendering(obj, gl, ctx) {
    obj.update(obj, gl, ctx);
  }

  add(obj) {
    this.#queue.push(obj);
  }

  pop() {
    this.#queue.pop();
  }

  get queue() {
    return this.#queue;
  }
}

export default RenderingQueue;
