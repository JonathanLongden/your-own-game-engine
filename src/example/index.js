/**
 * Your game engine show cases will be here.
 */

import { Camera } from '../engine/camera';
import { Scene } from '../engine/scene';
import { Sprite } from '../engine/object';
import { KeyboardController, MouseController, TouchController } from '../engine/io';
import {
  WebGLRenderer,
  rendererEvent,
  start,
  registerTextures,
  COLOR_MAP
} from '../engine/renderer';

import testImgUrl from './i/test.png';

// eslint-disable-next-line
console.log('Your examples script is working well');

const image = new Image();

// Prepare sprite
image.onload = () => {
  // re-style body object.
  window.document.body.style.margin = 0;
  window.document.body.style.padding = 0;

  const canvas = document.createElement('canvas');

  window.document.body.appendChild(canvas);

  const { innerWidth, innerHeight } = window;

  // const fpsThreshold = 60; // fps.

  const renderer = new WebGLRenderer({
    canvas
    // width: innerWidth,
    // height: innerHeight,
    // fpsThreshold: 1000 / fpsThreshold // ms
  });

  const keyboardController = new KeyboardController();
  const mouseController = new MouseController();
  const touchController = new TouchController();

  renderer.on(rendererEvent.START, () => {
    keyboardController.bind();
    mouseController.bind();
    touchController.bind();
  });

  renderer.on(rendererEvent.STOP, () => {
    keyboardController.unbind();
    mouseController.unbind();
    touchController.unbind();
  });

  renderer.on(rendererEvent.UPDATE, () => {
    mouseController.update();
    touchController.update();

    if (keyboardController.pressed(87)) {
      // eslint-disable-next-line no-console
      console.log('Key "W" triggered');
    }

    if (mouseController.pressed(0)) {
      // eslint-disable-next-line no-console
      console.log('Mouse "0" triggered', {
        x: mouseController.x,
        y: mouseController.y,
        wheel: mouseController.wheel,
        movementX: mouseController.movementX,
        movementY: mouseController.movementY,
        movementWheel: mouseController.movementWheel
      });
    }

    if (touchController.pressed(0, 1)) {
      // eslint-disable-next-line no-console
      console.log('Two fingers touched', touchController.getTouch(0));
    }
  });

  renderer.on(rendererEvent.WEBGL_IS_NOT_SUPPORTED, err => {
    // eslint-disable-next-line no-console
    console.error(err.message);
  });

  const scene = new Scene();

  const minSize = Math.min(innerWidth, innerHeight);
  const sizeFactor = 0.25;
  const width = (minSize / innerWidth) * sizeFactor;
  const height = (minSize / innerHeight) * sizeFactor;
  const camera = new Camera({ width, height });

  const textures = [
    {
      name: 'my-texture',
      type: COLOR_MAP,
      image
    }
  ];

  registerTextures({ renderer, textures });

  for (let i = 0, l = 5000; i < l; i += 1) {
    scene.add(new Sprite({ colorMap: textures[0] }));
  }

  const stop = start({ renderer, scene, camera });

  // Stop renderer after 15 seconds.
  setTimeout(() => stop(), 15000);
};

// Trigger image loading.
image.src = testImgUrl;
