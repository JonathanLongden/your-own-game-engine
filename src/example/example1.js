import { Camera } from '../engine/camera';
import { Scene } from '../engine/scene';
import { Sprite } from '../engine/object';
import { rotate, scale, transform, translateTo } from '../engine/transform';
import { KeyboardController, MouseController, TouchController } from '../engine/io';
import {
  WebGLRenderer,
  events as rendererEvent,
  start,
  registerTextures,
  COLOR_MAP
} from '../engine/renderer';

import testImgUrl from './i/test.png';

export default () => {
  // Stop rendering function (will be assigned after start).
  let stopRenderer;

  const image = new Image();

  // Define IO controllers.
  const keyboardController = new KeyboardController();
  const mouseController = new MouseController();
  const touchController = new TouchController();

  // When image will be loaded, prepare renderer, scene & camera.
  image.onload = () => {
    const { innerWidth, innerHeight } = window;

    // Add canvas and set size to full screen.
    const canvas = document.createElement('canvas');
    window.document.body.appendChild(canvas);
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    // Initialize WebGL renderer with 15 FPS threshold.
    const renderer = new WebGLRenderer({
      canvas,
      fpsThreshold: 60 // FPS.
    });

    // Create scene where sprites will be added.
    const scene = new Scene();

    // Camera initialization.
    const minSize = Math.min(innerWidth, innerHeight);
    const sizeFactor = 0.25;
    const width = (minSize / innerWidth) * sizeFactor;
    const height = (minSize / innerHeight) * sizeFactor;
    const camera = new Camera({ width, height });

    // Textures to use.
    const textures = [
      {
        name: 'my-texture',
        type: COLOR_MAP,
        image
      }
    ];

    // Register textures for furher usage by renderer.
    registerTextures({ renderer, textures });

    // Add sprites to scene with random positions by X, Y.
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

    // Notify about rendering stuff and initialize IO.
    renderer.addListener(rendererEvent.START, () => {
      keyboardController.bind();
      mouseController.bind();
      touchController.bind();

      // eslint-disable-next-line no-console
      console.log('Rendering started');
    });

    // Notify about stop rendering.
    renderer.addListener(rendererEvent.STOP, () => {
      // eslint-disable-next-line no-console
      console.log('Rendering stopped');
    });

    // Notify about 1 frame update, transform each sprite and update IO.
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

    stopRenderer = start({ renderer, scene, camera });
  };

  // Trigger image loading.
  image.src = testImgUrl;

  // Stop current example.
  return () => {
    // Stop loading image.
    image.src = '';

    if (stopRenderer) {
      // Unbind IO.
      keyboardController.unbind();
      mouseController.unbind();
      touchController.unbind();

      // Stop renderer.
      stopRenderer();
    }
  };
};
