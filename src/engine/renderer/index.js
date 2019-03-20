import { WebGLRenderer } from './webgl_renderer';
import { Framebuffer } from './framebuffer';
import { start, registerPrograms, registerTextures } from './renderer';
import * as events from './renderer_event';

export { WebGLRenderer, Framebuffer, events, start, registerPrograms, registerTextures };

export default {
  WebGLRenderer,
  Framebuffer,
  events,
  start,
  registerPrograms,
  registerTextures
};
