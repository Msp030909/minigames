window.levels = window.levels || [];

window.levels[0] = {
  name: "Level 1",
  size: { width: 700, height: 450 },
  start: { x: 20, y: 190, w: 80, h: 60 },
  finish: { x: 600, y: 190, w: 80, h: 60 },
  // Edit walls below: x, y, w (width), h (height)
  walls: [
    { x: 140, y: 70, w: 20, h: 310 },
    { x: 220, y: 0, w: 20, h: 240 },
    { x: 220, y: 300, w: 20, h: 150 },
    { x: 320, y: 70, w: 20, h: 310 },
    { x: 400, y: 0, w: 20, h: 240 },
    { x: 400, y: 300, w: 20, h: 150 },
    { x: 500, y: 70, w: 20, h: 310 }
  ]
};
