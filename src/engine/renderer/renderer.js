import { pipe } from 'ramda';

import { ProgramObject } from '../object';
import { spriteShaderProgram } from './sprite_shader_program';
import { rendererEvent } from '.';

const drawTargetByProgram = ({ renderer, target, scene, camera, program }) => {
  renderer.useProgram(program.name);

  // Update current shader program attributes and uniforms.
  const { attributes, uniforms } = program.onUpdate({ target, scene, camera });
  attributes.forEach(({ name, value }) => renderer.setAttributeValue(name, value));
  uniforms.forEach(({ name, value }) => renderer.setUniformValue(name, value));

  // Bind current shader program attributes and uniforms.
  renderer.bindProgramAttributes();
  renderer.bindProgramUniforms();

  // Bind target's textures.
  [target.colorMapTexture].forEach(t => t && renderer.useTexture(t.name));

  renderer.draw(Math.floor(target.vertices.length / 2));
};

const getTargetPrograms = ({ programs: p = [] }) => (p.length && p) || [spriteShaderProgram];

const getTargetUpdater = props => target => {
  getTargetPrograms(target).forEach(program => drawTargetByProgram({ ...props, target, program }));
};

const registerPrebuiltPrograms = ({ renderer, shaderPrograms }) => {
  shaderPrograms.forEach(program => renderer.registerProgram(program));
};

const prepareRenderer = ({ renderer }) => {
  registerPrebuiltPrograms({ renderer, shaderPrograms: [spriteShaderProgram] });

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
    renderer.emit(rendererEvent.STOP);
    return;
  }

  if (accumulator < msThreshold) {
    // Skip frame.
    requestNextFrame(props);
    return;
  }

  // Render frame.
  renderer.emit(rendererEvent.UPDATE, { dt });
  scene.children.forEach(getTargetUpdater({ renderer, scene, camera }));

  // Request next frame and reset skip frame accumulator.
  requestNextFrame({ ...props, accumulator: 0 });
};

// const renderer = new WebGLRenderer(canvas);
// const scene = new Scene();
// const camera = new Camera({ width: 800, height: 600 })
//
// const programs = [{
//  name: 'my-own-program',
//  vSource: 'vertex data source',
//  fSource: 'fragment data source'
//  attributes: [{ name: 'a_pos', type: FLOAT_ARRAY_2 }],
//  uniforms: [{ name: 'u_m', type: MAT_3}],
//  onUpdate: ({ target, scene, camera }) => ({
//    attributes: [{ name: 'a_pos', value: target.vertices}],
//    uniforms: [{ name: 'u_m', value: target.mMatrix }]
//  })
// }]
//
// const image = new Image(); // Imagine that is already loaded.
//
// const textures = [{
//   name: 'my-texture',
//   type: COLOR_MAP,
//   image
// }]
//
// registerPrograms({ renderer, programs })
// registerTextures({ renderer, textures })
//
// const sprite = new Sprite({ colorMapTexture: texture[0]})
//
// const spriteMultiProgram = withPrograms(programs)(sprite)
//
// scene.add(spriteMultiProgram);
//
// start({ renderer, scene, camera })
//

export const start = props => {
  let stopSignal = false;

  const stop = () => {
    stopSignal = true;
  };

  const isStopRequested = () => stopSignal;

  props.renderer.emit(rendererEvent.START);

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

export const withPrograms = programs => target => new ProgramObject(target, programs);
