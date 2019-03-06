/* eslint-disable import/prefer-default-export */

export const diagonal2quad = ([x, y, x1, y1]) => [x, y, x, y1, x1, y, x1, y1];

// eslint-disable-next-line no-unused-vars
export const quad2diagonal = ([x, y, _, y1, x1]) => [x, y, x1, y1];

export const px2quad = (originalWidth, originalHeight, width, height) => {
  const x = 0;
  const y = 0;
  const x1 = originalWidth / width;
  const y1 = originalHeight / height;

  return [x, y, x, y1, x1, y, x1, y1];
};

export const quad2px = (originalWidth, originalHeight, [x, y, _, y1, x1]) => [
  originalWidth * x1,
  originalHeight * y1
];
