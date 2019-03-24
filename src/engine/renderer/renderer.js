// tbd @andytyurin renderer.registerTexture is not consistent, need to trigger also on scene child remove.
import { pipe, always } from 'ramda';

import { events as sceneEvents } from '../scene';
import { types as objectTypes, events as objectEvents, utils as objectUtils } from '../object';
import { START, UPDATE, STOP } from './renderer_event';
// import { TEXTURE_DRAWING_TARGET } from './drawing_target';
import { SpriteShaderProgram } from '../shader_program';

const defaultShaderPrograms = [new SpriteShaderProgram()];

const drawEntityByProgram = ({ renderer, entity, context, camera, program }) => {
  const { diffuseMap, children } = entity;

  // Render sprite container children.
  if (objectUtils.isSpriteContainer(entity)) {
    renderer.bindFramebuffer(entity.framebuffer.uuid);
    children.forEach(
      // eslint-disable-next-line no-use-before-define
      getEntityUpdater({ renderer, context: entity, camera })
    );
    renderer.unbindFramebuffer();
  }

  if (objectUtils.isSpriteContainer(context)) {
    camera.updateProjectionMatrix({
      width: context.diffuseMap.width,
      height: context.diffuseMap.height
    });
    renderer.viewport = {
      width: context.diffuseMap.width,
      height: context.diffuseMap.height
    };
  } else {
    const { width, height } = renderer.canvas;
    renderer.viewport = { width, height };
    camera.updateProjectionMatrix({
      width,
      height
    });
  }

  // Bind target's color map texture.
  if (diffuseMap) {
    renderer.bindTexture(diffuseMap.uuid);
  }

  // Update current shader program attributes and uniforms.
  const { attributes, uniforms } = program.onUpdate({
    entity,
    context,
    camera,
    renderer
  });

  Object.keys(attributes).forEach(name => {
    renderer.setAttributeValue(program.uuid, name, attributes[name]);
  });

  Object.keys(uniforms).forEach(name => {
    renderer.setUniformValue(program.uuid, name, uniforms[name]);
  });

  // Activate shader program.
  renderer.bindProgram(program.uuid);

  renderer.draw(Math.floor(entity.vertices.length / 2));
};

const getEntityPrograms = ({ programs: p = [] }) => (p.length && p) || defaultShaderPrograms;

const getEntityUpdater = props => entity => {
  getEntityPrograms(entity).forEach(program => drawEntityByProgram({ ...props, entity, program }));
};

const registerPrebuiltPrograms = ({ renderer, shaderPrograms }) => {
  shaderPrograms.forEach(program => renderer.registerProgram(program));
};

const prepareSprite = ({ renderer, entity }) => {
  renderer.registerTexture(entity.diffuseMap);
  renderer.loadTexture(entity.diffuseMap.uuid);
};

const prepareSpriteContainer = ({ renderer, entity }) => {
  let originalDiffuseMap;

  // eslint-disable-next-line no-use-before-define
  const prepareChild = entity => prepareEntity({ renderer, entity });

  // tbd @andytyurin refactor by spliting the stuff.
  const updateDiffuseMap = () => {
    if (originalDiffuseMap) {
      renderer.deregisterTexture(originalDiffuseMap.uuid);
    }

    renderer.registerTexture(entity.diffuseMap);
    renderer.registerFramebuffer(entity.framebuffer);

    renderer.loadTexture(entity.diffuseMap.uuid);
    renderer.loadFramebuffer(entity.framebuffer.uuid, entity.diffuseMap.uuid);

    originalDiffuseMap = entity.diffuseMap;
  };

  entity.addListener(objectEvents.SPRITE_CONTAINER_CHILD_ADD, prepareChild);
  entity.addListener(objectEvents.SPRITE_CONTAINER_DIFFUSE_MAP_CHANGE, updateDiffuseMap);

  entity.children.forEach(child => {
    prepareChild(child);
    updateDiffuseMap();
  });
};

const prepareEntity = ({ renderer, entity }) => {
  (({
    [objectTypes.SPRITE_CONTAINER_TYPE]: prepareSpriteContainer,
    [objectTypes.SPRITE_TYPE]: prepareSprite
  }[entity.type] || always())({ renderer, entity }));
};

const prepareScene = ({ renderer, scene }) => {
  const listener = entity => prepareEntity({ entity, renderer });

  scene.addListener(sceneEvents.SCENE_CHILD_ADD, listener);
  scene.children.forEach(listener);
};

const prepareRenderer = ({ renderer }) => {
  registerPrebuiltPrograms({ renderer, shaderPrograms: defaultShaderPrograms });
  renderer.viewport = { width: renderer.canvas.width, height: renderer.canvas.height };
  renderer.setTransparentBlending();

  // tbd @andytyurin remove in favor of per entity texture-program-fbo loading.
  renderer.loadAllPrograms();
  renderer.loadAllTextures();
};

const createNextFrameRenderer = ({ prevTs = 0, accumulator = 0, ...restProps }) => ts => {
  // Difference between 2 frames' timestamps.
  const dt = ts - prevTs;

  // Next delta time is equal to delta time between 2 frames and accumulated time of skept frames.
  const nextDt = dt + accumulator;

  // Next accumulator will be accumulated by current frame time.
  const nextAccumulator = accumulator + dt;

  // eslint-disable-next-line no-use-before-define
  render({ ...restProps, dt: nextDt, prevTs: ts, accumulator: nextAccumulator });
};

const requestNextFrame = pipe(
  createNextFrameRenderer,
  nextRender => window.requestAnimationFrame(nextRender)
);

const render = props => {
  const { scene, camera, renderer, isStopRequested, accumulator = 0, dt = 0 } = props;
  const msThreshold = 1000 / renderer.fpsThreshold;

  // Stop requested, close rendering loop.
  if (isStopRequested()) {
    renderer.emit(STOP);
    return;
  }

  if (accumulator < msThreshold) {
    // Skip frame.
    requestNextFrame(props);
    return;
  }

  // Render frame.
  renderer.emit(UPDATE, { dt });
  scene.children.forEach(getEntityUpdater({ renderer, context: scene, camera }));

  // Request next frame and reset skip frame accumulator.
  requestNextFrame({ ...props, accumulator: 0 });
};

export const start = props => {
  let stopSignal = false;

  const stop = () => {
    stopSignal = true;
  };

  const isStopRequested = () => stopSignal;

  props.renderer.emit(START);

  prepareScene(props);
  prepareRenderer(props);
  render({ ...props, isStopRequested });

  return stop;
};

export const registerPrograms = ({ renderer, programs }) => {
  programs.forEach(program => renderer.registerProgram(program));
};

export const registerTextures = ({ renderer, textures }) => {
  textures.forEach(texture => renderer.registerTexture(texture));
};

// tbd Fuctionality is not fully implemented.
// export const withPrograms = programs => target => new ProgramObject(target, programs);
