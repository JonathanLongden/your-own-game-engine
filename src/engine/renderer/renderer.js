import { pipe } from 'ramda';

import { ProgramObject } from '../object';
import { shaderPrograms } from './shader_programs';

const drawTargetByProgram = ({ renderer, target, scene, camera, program }) => {
  renderer.useProgram(program);

  // Update current shader program attributes and uniforms.
  program.onUpdate({ target, scene, camera });

  // Bind current shader program attributes and uniforms.
  renderer.bindProgramAttributes();
  renderer.bindProgramUniforms();

  // Bind target's textures.
  [target.colorMapTexture].forEach(t => t && renderer.useTexture(t.name));

  renderer.draw(Math.floor(target.vertices.length / 2));
};

const getTargetPrograms = ({ programs: p } = []) => (p.length && p) || [shaderPrograms[0]];

const getTargetUpdater = props => target => {
  getTargetPrograms(target).forEach(program => drawTargetByProgram({ ...props, target, program }));
};

const registerPrebuiltPrograms = ({ renderer, shaderPrograms }) => {
  shaderPrograms.forEach(renderer.registerProgram);
};

const prepareRenderer = ({ renderer }) => {
  registerPrebuiltPrograms({ renderer, shaderPrograms });

  renderer.setTransparentBlending();
  renderer.loadAllPrograms();
  renderer.loadAllTextures();
};

// eslint-disable-next-line no-use-before-define
const createNextFrameRenderer = props => ts => render({ ...props, dt: ts - props.ts });

const requestNextFrame = pipe(
  createNextFrameRenderer,
  nextRender => window.requestAnimationFrame(nextRender)
);

const render = props => {
  const { scene, camera, renderer } = props;

  scene.children.forEach(getTargetUpdater({ renderer, scene, camera }));

  requestNextFrame(props);
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
  prepareRenderer(props);
  render(props);
};

export const registerPrograms = ({ renderer, programs }) => {
  programs.forEach(renderer.registerProgram);
};

export const registerTextures = ({ renderer, textures }) => {
  textures.forEach(renderer.registerTexture);
};

export const withPrograms = programs => target => new ProgramObject(target, programs);
