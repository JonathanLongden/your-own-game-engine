/**
 * Your game engine show cases will be here.
 */

import { Engine, WebGLRenderer, Keyboard, rendererEvent } from '../engine';

// eslint-disable-next-line
console.log('Your examples script is working well');

const canvas = document.createElement('canvas');

window.document.body.appendChild(canvas);

const { innerWidth, innerHeight } = window;

const fpsThreshold = 5; // fps.

const renderer = new WebGLRenderer({
  canvas,
  width: innerWidth,
  height: innerHeight,
  fpsThreshold: 1000 / fpsThreshold // ms
});

const keyboard = new Keyboard();

renderer.on(rendererEvent.UPDATE, () => {
  if (keyboard.pressed(87)) {
    // eslint-disable-next-line no-console
    console.log('Key "W" triggered');
  }
});

renderer.on(rendererEvent.WEBGL_IS_NOT_SUPPORTED, err => {
  // eslint-disable-next-line no-console
  console.error(err.message);
});

const engine = new Engine({
  renderer,
  keyboard
});

engine.start();
