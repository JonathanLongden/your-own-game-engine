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
    const texture01 = new Texture({ baseTexture, textureCoords: [0, 0, 512, 512] });
    const texture02 = new Texture({ baseTexture, textureCoords: [512, 512, 1024, 1024] });
    // tbd @andytyurin why reverse? o.O
    const framebufferTexture = new FramebufferTexture({ width: 512, height: 1024 });
    const tiles = new SpriteContainer({ diffuseMap: framebufferTexture });

    // Create sprites with attached textures.
    const sprite01 = new Sprite({ diffuseMap: texture01 });
    const sprite02 = new Sprite({ diffuseMap: texture02 });

    // Translate sprites.
    transform(translate([-1, 0])(sprite01));
    transform(translate([1, 0]))(sprite02);

    // Add sprites to sprite container.
    tiles.add(sprite01, sprite02);

    // Add sprite container to scene.
    scene.add(tiles);

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
