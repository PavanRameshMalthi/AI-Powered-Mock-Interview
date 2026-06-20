const { TextDecoder, TextEncoder } = require("util");

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
  }

  observe(element) {
    this.callback([{ isIntersecting: true, target: element }], this);
  }

  unobserve() {}

  disconnect() {}
}

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.IntersectionObserver = global.IntersectionObserver || IntersectionObserverMock;
global.ResizeObserver = global.ResizeObserver || ResizeObserverMock;

global.matchMedia =
  global.matchMedia ||
  function matchMedia(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    };
  };
