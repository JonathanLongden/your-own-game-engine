export class Scene {
  #children;

  constructor() {
    this.#children = [];
  }

  add(child) {
    this.#children.push(child);
  }

  remove(child) {
    this.#children.splice(this.#children.indexOf(child), 1);
  }

  get children() {
    return this.#children;
  }
}

export default Scene;
