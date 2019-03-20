import { TEXTURE_TYPE, BASE_TEXTURE_TYPE, FRAMEBUFFER_TEXTURE_TYPE } from './texture_types';

export const isTexture = t => t.type === TEXTURE_TYPE;

export const isBaseTexture = t => t.type === BASE_TEXTURE_TYPE;

export const isFramebufferTexture = t => t.type === FRAMEBUFFER_TEXTURE_TYPE;
