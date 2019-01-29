export class Scene {
  #children;

  constructor() {
    this.#children = [];
  }

  add(...children) {
    children.forEach(child => this.#children.push(child));
  }

  remove(child) {
    this.#children.splice(this.#children.indexOf(child), 1);
  }

  get children() {
    return this.#children;
  }
}

export default Scene;
