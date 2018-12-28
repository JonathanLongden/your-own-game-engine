import { ShaderProgram } from './sp';
import { Shader } from './shader';
import { FLOAT_ARRAY_2, MAT_3, INT_1 } from './qualifier_types';

const attributes = {
  a_pos: {
    location: 0,
    type: FLOAT_ARRAY_2
  },
  a_tex: {
    type: FLOAT_ARRAY_2
  }
};

const uniforms = {
  u_v: {
    type: MAT_3
  },
  u_m: {
    type: MAT_3
  },
  u_cm: {
    type: INT_1,
    value: 0 // ?
  }
};

const vShader = new Shader(`
    #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
    #else
        precision mediump float;
    #endif
    attribute vec2 a_pos;
    attribute vec2 a_tex;
    uniform mat3 u_v;
    uniform mat3 u_m;
    varying vec2 v_tex;
    void main() {
        vec2 pos = a_pos * 2.0 - 1.0;
        gl_Position = vec4((u_v * u_m * vec3(pos, 1)).xy, 1.0, 1.0);
        v_tex = a_tex;
    }
`);

const fShader = new Shader(`
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
`);

export const simpleShaderProgram = new ShaderProgram(vShader, fShader, attributes, uniforms);

export default simpleShaderProgram;
