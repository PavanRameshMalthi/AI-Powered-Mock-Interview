import "@testing-library/jest-dom";

/* global jest */
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  canvas: document.createElement("canvas"),
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: [] })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  resetTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  arc: jest.fn(),
  arcTo: jest.fn(),
  ellipse: jest.fn(),
  rect: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  clip: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  setLineDash: jest.fn(),
  getLineDash: jest.fn(() => []),
  fillText: jest.fn(),
  strokeText: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
}));

jest.mock("lucide-react", () => {
  return new Proxy(
    {},
    {
      get: (target, property) => {
        if (property === "__esModule") return true;
        return (props) => require("react").createElement("svg", {
          "data-testid": `lucide-${property.toLowerCase()}`,
          ...props
        });
      },
    }
  );
});
