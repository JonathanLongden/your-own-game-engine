import { pipe, always } from 'ramda';

import { events as sceneEvents } from '../scene';
import { types as objectTypes, events as objectEvents, utils as objectUtils } from '../object';
import { spriteShaderProgram } from './sprite_shader_program';
import { START, UPDATE, STOP } from './renderer_event';
import { TEXTURE_DRAWING_TARGET } from './drawing_target';

const drawEntityByProgram = ({ renderer, entity, context, camera, program }) => {
  const { colorMapTexture, children } = entity;

  // Bind drawing target depends on entity UUID that was registered.
  // In a case if target was not found for received UUID, then
  // canvas drawing target will be used instead.
  renderer.bindTarget(entity.uuid);

  const { drawingTargetType: drawingTarget } = renderer;

  // Render sprite container children.
  if (objectUtils.isSpriteContainer(entity)) {
    children.forEach(
      // eslint-disable-next-line no-use-before-define
      getEntityUpdater({ renderer, context: entity, camera })
    );

    renderer.bindTarget();
  }

  // Setting up renderer viewport depends of drawing target.
  if (drawingTarget === TEXTURE_DRAWING_TARGET) {
    // tbd no width and height?
    // const { width, height } = entity.colorMapTexture;
    // renderer.viewport = { width, height };
  } else {
    const { width, height } = renderer.canvas;
    renderer.viewport = { width, height };
  }

  // Activate shader program.
  renderer.useProgram(program.name);

  // Bind target's color map texture.
  if (colorMapTexture) {
    // tbd: In a case if texture has framebuffer and current target is `TEXTURE_TARGET`, then framebuffer should be swapped!
    renderer.useTexture(colorMapTexture.name);
  }

  // Update current shader program attributes and uniforms.
  const { attributes, uniforms } = program.onUpdate({ entity, context, camera });

  attributes.forEach(({ name, value }) => renderer.setAttributeValue(name, value));

  // tbd HACK!
  uniforms.forEach(({ name, value }) => {
    // As we are writing directly to texture, we need avoid using of projection matrix.
    if (drawingTarget === TEXTURE_DRAWING_TARGET && name === 'u_p') {
      // value = defaultProjectionMatrix;
    }

    renderer.setUniformValue(name, value);
  });

  // Bind current shader program attributes and uniforms.
  renderer.bindProgramAttributes();
  renderer.bindProgramUniforms();

  renderer.draw(Math.floor(entity.vertices.length / 2));
};

const getEntityPrograms = ({ programs: p = [] }) => (p.length && p) || [spriteShaderProgram];

const getEntityUpdater = props => entity => {
  getEntityPrograms(entity).forEach(program => drawEntityByProgram({ ...props, entity, program }));
};

const registerPrebuiltPrograms = ({ renderer, shaderPrograms }) => {
  shaderPrograms.forEach(program => renderer.registerProgram(program));
};

const prepareSprite = ({ renderer, entity }) => {
  renderer.registerTexture(entity.colorMapTexture);
};

const prepareSpriteContainer = ({ renderer, entity }) => {
  // eslint-disable-next-line no-use-before-define
  const listener = entity => prepareEntity({ renderer, entity });
  entity.addListener(objectEvents.SPRITE_CONTAINER_CHILD_ADD, listener);

  renderer.registerTarget({ type: TEXTURE_DRAWING_TARGET, name: entity.uuid });
  renderer.registerTexture(entity.colorMapTexture);
};

const prepareEntity = ({ renderer, entity }) => {
  (({
    [objectTypes.SPRITE_CONTAINER_TYPE]: prepareSpriteContainer,
    [objectTypes.SPRITE]: prepareSprite
  }[entity.type] || always())({ renderer, entity }));
};

const prepareScene = ({ renderer, scene }) => {
  const listener = entity => prepareEntity({ entity, renderer });

  scene.addListener(sceneEvents.SCENE_CHILD_ADD, listener);
  scene.children.forEach(listener);
};

const prepareRenderer = ({ renderer }) => {
  registerPrebuiltPrograms({ renderer, shaderPrograms: [spriteShaderProgram] });
  renderer.viewport = { width: renderer.canvas.width, height: renderer.canvas.height };
  renderer.setTransparentBlending();
  renderer.loadAllTargets();
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
