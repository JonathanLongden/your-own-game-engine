import { SPRITE_CONTAINER_TYPE, SPRITE_TYPE } from './object_2d_types';

export const isSpriteContainer = obj => obj.type === SPRITE_CONTAINER_TYPE;

export const isSprite = obj => obj.type === SPRITE_TYPE;
