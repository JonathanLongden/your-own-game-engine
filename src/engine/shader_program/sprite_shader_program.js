import { ShaderProgram } from './shader_program';
import { FLOAT_ARRAY_2, MAT_3, INT_1 } from '../renderer/webgl_types';

const vSource = `
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
`;

const fSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
    #else
        precision mediump float;
    #endif
        precision mediump int;
    uniform sampler2D u_diffuse;
    varying vec2 v_tex;
    void main() {
        gl_FragColor = texture2D(u_diffuse, v_tex);
    }
`;

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
  u_p: {
    type: MAT_3
  },
  u_v: {
    type: MAT_3
  },
  u_m: {
    type: MAT_3
  },
  u_diffuse: {
    type: INT_1
  }
};

export class SpriteShaderProgram extends ShaderProgram {
  constructor() {
    super({ vSource, fSource, attributes, uniforms });
  }

  // Override.
  onUpdate({ entity, camera }) {
    return {
      attributes: {
        a_pos: entity.vertices,
        a_tex: entity.diffuseMap.textureCoords
      },
      uniforms: {
        u_m: entity.modelMatrix,
        u_v: camera.viewMatrix,
        u_p: camera.projectionMatrix,
        u_diffuse: 0
      }
    };
  }
}

export default SpriteShaderProgram;
