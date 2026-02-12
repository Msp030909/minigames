window.levels = window.levels || [];

window.levels[1] = {
  name: "Level 2",
  size: { width: 700, height: 450 },
  start: { x: 20, y: 40, w: 80, h: 60 },
  finish: { x: 600, y: 350, w: 80, h: 60 },
  // Edit walls below: x, y, w (width), h (height)
  walls: [
    { x: 120, y: 0, w: 20, h: 300 },
    { x: 120, y: 350, w: 20, h: 100 },
    { x: 200, y: 150, w: 20, h: 300 },
    { x: 280, y: 0, w: 20, h: 260 },
    { x: 280, y: 320, w: 20, h: 130 },
    { x: 360, y: 120, w: 20, h: 330 },
    { x: 440, y: 0, w: 20, h: 280 },
    { x: 440, y: 330, w: 20, h: 120 },
    { x: 520, y: 150, w: 20, h: 300 }
  ]
};
