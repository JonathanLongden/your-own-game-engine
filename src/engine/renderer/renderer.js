import { pipe, always } from 'ramda';

import { events as sceneEvents } from '../scene';
import { ProgramObject, types as objectTypes, events as objectEvents } from '../object';
import { spriteShaderProgram } from './sprite_shader_program';
import { START, UPDATE, STOP } from './renderer_event';
import { CANVAS_DRAWING_TARGET, TEXTURE_DRAWING_TARGET } from './drawing_target';

const drawEntityByProgram = ({
  renderer,
  entity,
  context,
  camera,
  program,
  target = CANVAS_DRAWING_TARGET
}) => {
  const { colorMapTexture, children } = entity;

  // Set current drawing target.
  renderer.target = target;

  // Update drawing viewport.
  if (target === TEXTURE_DRAWING_TARGET) {
    const { width, height } = context.colorMapTexture;
    renderer.viewport = { width, height };
  } else {
    // Canvas.
    const { width, height } = renderer.canvas;
    renderer.viewport = { width, height };
  }

  if (children) {
    // Target is container.

    // In a case if target is SpriteContainer, it's needed somehow
    // to prepare framebuffer and draw into and after drawing we need to bind to actual canvas.

    // tbd: All containers have internal framebuffers?
    // tbd: Where to define framebuffer?
    // tbd: How to manage framebuffer?
    // tbd: Do we need pre-load and pre-initialize buffer or on first rendering?

    // WARNING: THIS CODE IS NOT WORKED.

    // We have using TEXTURE_TARGET for each sprite which behaves as container's child.
    children.forEach(
      // eslint-disable-next-line no-use-before-define
      getEntityUpdater({ renderer, context: entity, camera, target: TEXTURE_DRAWING_TARGET })
    );
    // WARNING: THIS CODE IS NOT WORKED.
    return;
  }

  renderer.useProgram(program.name);

  // Bind target's color map texture.
  if (colorMapTexture) {
    // tbd: In a case if texture has framebuffer and current target is `TEXTURE_TARGET`, then framebuffer should be swapped!
    renderer.useTexture(colorMapTexture.name);
  }

  // Update current shader program attributes and uniforms.
  const { attributes, uniforms } = program.onUpdate({ entity, context, camera });

  attributes.forEach(({ name, value }) => renderer.setAttributeValue(name, value));

  uniforms.forEach(({ name, value }) => {
    // As we are writing directly to texture, we need avoid using of projection matrix.
    if (target === TEXTURE_DRAWING_TARGET && name === 'u_p') {
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
  entity.children.addListener(objectEvents.SPRITE_CONTAINER_CHILD_ADD, listener);

  renderer.registerTarget({ type: TEXTURE_DRAWING_TARGET, name: entity.uuid });
};

const prepareEntity = ({ renderer, entity }) => {
  (({
    [objectTypes.SPRITE_CONTAINER_TYPE]: prepareSpriteContainer,
    [objectTypes.SPRITE]: prepareSprite
  }(entity.type) || always())({ renderer, entity }));
};

const prepareScene = ({ renderer, scene }) => {
  scene.addListener(sceneEvents.SCENE_CHILD_ADD, entity => prepareEntity({ renderer, entity }));
};

const prepareRenderer = ({ renderer }) => {
  registerPrebuiltPrograms({ renderer, shaderPrograms: [spriteShaderProgram] });
  renderer.viewport = { width: renderer.canvas.width, height: renderer.canvas.height };
  renderer.setTransparentBlending();
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
