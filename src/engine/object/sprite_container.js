import { Object2D } from './object_2d';

export class SpriteContainer extends Object2D {
  #children;

  constructor(props) {
    super({ ...props, vertices: [0, 0, 0, 1, 1, 0, 1, 1] });

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

export default SpriteContainer;
