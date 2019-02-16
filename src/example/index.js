import { KeyboardController, events } from '../engine/io';

import exampleExecutor1 from './example1';
import exampleExecutor2 from './example2';
import exampleExecutor3 from './example3';

let stopExample = () => {};

const codeExecutors = {
  48: () => stopExample,
  49: exampleExecutor1,
  50: exampleExecutor2,
  51: exampleExecutor3
};

// Initialize keyboard.
const keyboardController = new KeyboardController();
keyboardController.bind();

// Set default styles for body object.
window.document.body.style.margin = 0;
window.document.body.style.padding = 0;

// Start example by running specific example's executor.
const startExample = (executor = () => {}) => {
  // Clear body.
  const { body } = document;
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  // Do not add any css modifications to body or any parents.
  // Execute example.
  return executor();
};

// Listen for keyboard key down to switch between examples.
keyboardController.addListener(events.KEY_DOWN, ({ code }) => {
  const executor = codeExecutors[code];

  if (executor) {
    // Stop example.
    stopExample();

    // Start example.
    stopExample = startExample(executor);
  }
});
