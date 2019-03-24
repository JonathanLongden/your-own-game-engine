import { WebGLRenderer, start, events as rendererEvent } from '../engine/renderer';
import { Sprite, SpriteContainer } from '../engine/object';
import { Scene } from '../engine/scene';
import { Camera } from '../engine/camera';
import { transform, translate, rotate } from '../engine/transform';
import { BaseTexture, Texture, FramebufferTexture } from '../engine/texture';

import imageUrl from './i/atlas.jpg';

export default () => {
  const { innerWidth, innerHeight } = window;

  // Stop rendering function (will be assigned after start).
  let stopRenderer;

  const image = new Image();

  // When image will be loaded, prepare renderer, scene & camera.
  image.onload = () => {
    // Add canvas and set size to full screen.
    const canvas = document.createElement('canvas');
    window.document.body.appendChild(canvas);
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    // Initialize WebGL renderer with 15 FPS threshold.
    const renderer = new WebGLRenderer({
      canvas
    });

    // Create scene where sprites will be added.
    const scene = new Scene();

    // Camera initialization.
    const camera = new Camera({ width: innerWidth, height: innerHeight });

    const baseTexture = new BaseTexture({ image });
    // tbd Rename pixel coords?
    const texture01 = new Texture({ baseTexture, pixelCoords: [0, 0, 512, 512] });
    const texture02 = new Texture({ baseTexture, pixelCoords: [512, 512, 1024, 1024] });

    // tbd Rename width & height? How to distinguish px from %?
    const framebufferTexture = new FramebufferTexture({ width: 1024, height: 512 });

    // tbd We don't have an access to PX, instead better to use % measurement?
    // tbd Create coordinates object which has ref to renderer and could calculate px, % and wherever.
    const tiles01 = new SpriteContainer({
      diffuseMap: framebufferTexture,
      width: 1024,
      height: 512
    });
    const tiles02 = new SpriteContainer({
      diffuseMap: framebufferTexture,
      width: 1024,
      height: 512
    });

    // Create sprites with attached textures.
    const sprite01 = new Sprite({ diffuseMap: texture01, width: 512, height: 512 });
    const sprite02 = new Sprite({ diffuseMap: texture02, width: 512, height: 512 });

    const sprite03 = new Sprite({ diffuseMap: texture01, width: 512, height: 512 });
    const sprite04 = new Sprite({ diffuseMap: texture02, width: 512, height: 512 });

    // Translate sprites.
    transform(translate([-1, 0]))(sprite01, sprite03);
    transform(translate([1, 0]))(sprite02, sprite04);

    // Add sprites to sprite container.
    tiles01.add(sprite01, sprite02);
    tiles02.add(sprite03, sprite04);

    // tiles.add(sprite01);

    // Add sprite container to scene.
    scene.add(tiles01, tiles02);

    // Notify about rendering stuff and initialize IO.
    renderer.addListener(rendererEvent.START, () => {
      // eslint-disable-next-line no-console
      console.log('Rendering started');
      transform(rotate(Math.PI / 2))(tiles02);
    });

    renderer.addListener(rendererEvent.UPDATE, () => {
      transform(rotate(0.01))(tiles01);
    });

    // Notify about stop rendering.
    renderer.addListener(rendererEvent.STOP, () => {
      // eslint-disable-next-line no-console
      console.log('Rendering stopped');
    });

    // Start rendering.
    stopRenderer = start({ renderer, scene, camera });
  };

  // Trigger image loading.
  image.src = imageUrl;

  // Stop current example.
  return () => {
    // Stop loading image.
    image.src = '';

    if (stopRenderer) {
      // Stop renderer.
      stopRenderer();
    }
  };
};
