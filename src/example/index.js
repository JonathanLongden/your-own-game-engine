/**
 * Your game engine show cases will be here.
 */

import {
  Engine,
  WebGLRenderer,
  Keyboard,
  Mouse,
  Touch,
  rendererEvent,
  Scene,
  Camera,
  Texture,
  Sprite
} from '../engine';

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
const mouse = new Mouse();
const touch = new Touch();

renderer.on(rendererEvent.UPDATE, () => {
  if (keyboard.pressed(87)) {
    // eslint-disable-next-line no-console
    console.log('Key "W" triggered');
  }

  if (mouse.pressed(0)) {
    // eslint-disable-next-line no-console
    console.log('Mouse "0" triggered', {
      x: mouse.x,
      y: mouse.y,
      wheel: mouse.wheel,
      movementX: mouse.movementX,
      movementY: mouse.movementY,
      movementWheel: mouse.movementWheel
    });
  }

  if (touch.pressed(0, 1)) {
    // eslint-disable-next-line no-console
    console.log('Two fingers touched', touch.getTouch(0));
  }
});

renderer.on(rendererEvent.WEBGL_IS_NOT_SUPPORTED, err => {
  // eslint-disable-next-line no-console
  console.error(err.message);
});

const engine = new Engine({
  renderer,
  keyboard,
  mouse,
  touch
});

const scene = new Scene();
const camera = new Camera();

// Create sprite.
const texture = new Texture(new Image(1024, 768));
const sprite = new Sprite(texture);

scene.add(camera);
scene.add(sprite);

engine.start(scene);
