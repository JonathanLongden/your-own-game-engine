import { coords } from '../util';

// on update

// tbd we need to calculate original size in gl quad coords.

// const { image: { width: contextWidth, height: contextHeight } = {} } = context;
// const {
//   coords: [x, x1, y, y1],
//   image: { width: entityWidth, height: entityHeight } = {}
// } = entity.colorMapTexture;
// const w = entityWidth || x1 - x;
// const h = entityHeight || y1 - y;

import { FLOAT_ARRAY_2, MAT_3, INT_1 } from './webgl_types';

export const spriteShaderProgram = {
  name: '_sprite_shader_program',
  vSource: `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
            precision highp float;
        #else
            precision mediump float;
        #endif
        attribute vec2 a_pos;
        attribute vec2 a_tex;
        uniform mat3 u_v;
        uniform mat3 u_p;
        uniform mat3 u_m;
        varying vec2 v_tex;
        void main() {
            vec2 pos = a_pos * 2.0 - 1.0;
            gl_Position = vec4((u_p * u_v * u_m * vec3(pos, 1)).xy, 1.0, 1.0);
            v_tex = a_tex;
        }
    `,
  fSource: `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
            precision highp float;
        #else
            precision mediump float;
        #endif
            precision mediump int;
        uniform sampler2D u_cm;
        varying vec2 v_tex;
        void main() {
            gl_FragColor = texture2D(u_cm, v_tex);
        }
    `,
  attributes: [
    {
      name: 'a_pos',
      location: 0,
      type: FLOAT_ARRAY_2
    },
    {
      name: 'a_tex',
      type: FLOAT_ARRAY_2
    }
  ],
  uniforms: [
    {
      name: 'u_p',
      type: MAT_3
    },
    {
      name: 'u_v',
      type: MAT_3
    },
    { name: 'u_m', type: MAT_3 },
    { name: 'u_cm', type: INT_1 }
  ],
  onUpdate: ({ entity, context, camera }) => ({
    attributes: [
      { name: 'a_pos', value: entity.vertices },
      {
        name: 'a_tex',
        value: coords.px2quad(w)
      }
    ],
    uniforms: [
      { name: 'u_m', value: entity.modelMatrix },
      { name: 'u_v', value: camera.viewMatrix },
      { name: 'u_p', value: camera.projectionMatrix },
      { name: 'u_cm', value: 0 }
    ]
  })
};

export default spriteShaderProgram;
