import { WebGLRenderer, COLOR_MAP, start, events as rendererEvent } from '../engine/renderer';
import { Sprite, SpriteContainer } from '../engine/object';
import { Scene } from '../engine/scene';
import { Camera } from '../engine/camera';
import { transform, translate, rotate } from '../engine/transform';
import { BaseTexture, Texture } from '../engine/texture';

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
    const minSize = Math.min(innerWidth, innerHeight);
    const sizeFactor = 0.25;
    const width = (minSize / innerWidth) * sizeFactor;
    const height = (minSize / innerHeight) * sizeFactor;
    const camera = new Camera({ width, height });

    const baseTexture = new BaseTexture({ image });
    const texture01 = new Texture({ baseTexture, textureCoords: [0, 0, 128, 128] });
    const texture02 = new Texture({ baseTexture, textureCoords: [128, 128, 256, 256] });

    const tiles = new SpriteContainer();

    // Create sprites with attached textures.
    const sprite01 = new Sprite({ diffuseMap: texture01 });
    const sprite02 = new Sprite({ diffuseMap: texture02 });

    // Add sprites to sprite container.
    tiles.add(sprite01, sprite02);

    // Add sprite container to scene.
    scene.add(tiles);

    // Translate sprites.
    transform(translate([-1, 0])(sprite01));
    transform(translate([1, 0]))(sprite02);

    // Notify about rendering stuff and initialize IO.
    renderer.addListener(rendererEvent.START, () => {
      // eslint-disable-next-line no-console
      console.log('Rendering started');
    });

    renderer.addListener(rendererEvent.UPDATE, () => {
      transform(rotate(0.01))(tiles);
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
