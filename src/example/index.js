/**
 * Your game engine show cases will be here.
 */

import { Camera } from '../engine/camera';
import { Scene } from '../engine/scene';
import { Sprite } from '../engine/object';
import { rotate, scale, transform, translateTo } from '../engine/transform';
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

  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const renderer = new WebGLRenderer({
    canvas,
    fpsThreshold: 60 // FPS.
  });

  const keyboardController = new KeyboardController();
  const mouseController = new MouseController();
  const touchController = new TouchController();

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

  for (let i = 0; i < 770; i += 1) {
    const sprite = new Sprite({ colorMapTexture: textures[0] });

    transform(
      translateTo([
        (Math.random() > 0.5 ? 1 : -1) * Math.random() * 25,
        (Math.random() > 0.5 ? 1 : -1) * Math.random() * 25
      ])
    )(sprite);

    scene.add(sprite);
  }

  renderer.addListener(rendererEvent.START, () => {
    keyboardController.bind();
    mouseController.bind();
    touchController.bind();

    // eslint-disable-next-line no-console
    console.log('Rendering started');
  });

  renderer.addListener(rendererEvent.STOP, () => {
    keyboardController.unbind();
    mouseController.unbind();
    touchController.unbind();

    // eslint-disable-next-line no-console
    console.log('Rendering stopped');
  });

  renderer.addListener(rendererEvent.UPDATE, ({ dt }) => {
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

    transform(rotate(0.005))(camera);

    // eslint-disable-next-line no-console
    console.log(`FPS ${Math.round(1000 / dt)}`);

    scene.children.forEach(obj => transform(scale([0.999, 0.999]))(obj));
  });

  const stop = start({ renderer, scene, camera });

  // Stop rendering after 15 seconds.
  setTimeout(stop, 15000);
};

// Trigger image loading.
image.src = testImgUrl;
