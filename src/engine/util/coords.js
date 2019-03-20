/* eslint-disable import/prefer-default-export */

export const px2unit = (originalWidth, originalHeight, [x0, y0, x1, y1]) => {
  const unitWidth = 1 / originalWidth;
  const unitHeight = 1 / originalHeight;
  const dx0 = unitWidth * x0;
  const dy0 = unitHeight * y0;
  const dx1 = unitWidth * x1;
  const dy1 = unitHeight * y1;
  return [dx0, dy0, dx0, dy1, dx1, dy0, dx1, dy1];
};
