import { COLOR_MAP } from './texture_map';
import { WebGLRenderer } from './webgl_renderer';
import { start, registerPrograms, registerTextures } from './renderer';
import * as events from './renderer_event';

export { COLOR_MAP, WebGLRenderer, events, start, registerPrograms, registerTextures };

export default {
  COLOR_MAP,
  WebGLRenderer,
  events,
  start,
  registerPrograms,
  registerTextures
};
