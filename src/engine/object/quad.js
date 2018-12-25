import { Object2D } from './object_2d';

/**
 * A(0, 0)-------------B(1, 0)
 * |                         |
 * |                         |
 * |                         |
 * C(0, 1)-------------D(1, 1)
 *
 * TRIANGLE_STIP:
 * A, C, B, D => [0, 0, 0, 1, 1, 0, 1, 1]
 */

export class Quad extends Object2D {
  constructor() {
    super([0, 0, 0, 1, 1, 0, 1, 1]);
  }
}

export default Quad;
