import { mat3 } from 'gl-matrix';

export const transform = (...transformations) => (...objects) => {
  objects.forEach(obj => {
    transformations.forEach(t => t(obj));

    const { updateModelMatrix, updateViewProjectionMatrix } = obj;

    // Force update model & projection matrices.
    [updateModelMatrix, updateViewProjectionMatrix].forEach(updater => {
      if (updater) updater();
    });
  });
};

export const translate = v => ({ translationMatrix }) => {
  mat3.translate(translationMatrix, translationMatrix, [v[0], -v[1]]);
};

export const rotate = rad => ({ rotationMatrix }) => {
  mat3.rotate(rotationMatrix, rotationMatrix, -rad);
};

export const scale = v => ({ scaleMatrix }) => {
  mat3.scale(scaleMatrix, scaleMatrix, v);
};

export const translateTo = v => ({ translationMatrix }) => {
  mat3.fromTranslation(translationMatrix, [v[0], -v[1]]);
};

export const rotateTo = rad => ({ rotationMatrix }) => {
  mat3.fromRotation(rotationMatrix, rad);
};

export const scaleTo = v => ({ scaleMatrix }) => {
  mat3.fromScaling(scaleMatrix, v);
};
