export class RenderTimer {
  #prevTimestamp;

  #delta;

  #accumulator;

  #threshold;

  constructor(threshold) {
    this.#prevTimestamp = 0;
    this.#delta = 0;
    this.#accumulator = 0;
    this.#threshold = threshold || Infinity;
  }

  init() {
    this.#prevTimestamp = Date.now();
  }

  checkpoint() {
    const currentTime = Date.now();
    this.#delta = currentTime - this.#prevTimestamp;
    this.#prevTimestamp = currentTime;

    this.#accumulator += this.#delta;
  }

  reduce() {
    this.#accumulator -= this.#threshold;
  }

  isReachedThreshold() {
    return this.#accumulator >= this.#threshold;
  }

  get delta() {
    return Math.max(this.#delta, this.#threshold);
  }
}

export default RenderTimer;
