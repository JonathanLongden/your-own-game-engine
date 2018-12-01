/**
 * Your game engine show cases will be here.
 */

import { WebGLRenderer, rendererEvents } from '../engine';

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

renderer.on(rendererEvents.WEBGL_IS_NOT_SUPPORTED, err => {
  // eslint-disable-next-line no-console
  console.error(err.message);
});

renderer.start();
