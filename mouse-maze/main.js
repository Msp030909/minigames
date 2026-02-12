(function () {
  "use strict";

  var levels = window.levels || [];
  var currentLevelIndex = 0;
  var isPlaying = false;
  var isGameOver = false;

  var maze = document.getElementById("maze");
  var start = document.getElementById("start");
  var finish = document.getElementById("finish");
  var levelName = document.getElementById("levelName");
  var message = document.getElementById("message");

  function setMessage(text) {
    message.textContent = text;
  }

  function resetState() {
    isPlaying = false;
    isGameOver = false;
    document.body.classList.remove("game-over");
    maze.classList.remove("locked");
    setMessage("Move into START to begin.");
  }

  function clearWalls() {
    var walls = maze.querySelectorAll(".wall");
    walls.forEach(function (wall) {
      wall.remove();
    });
  }

  function positionElement(el, data) {
    el.style.left = data.x + "px";
    el.style.top = data.y + "px";
    el.style.width = data.w + "px";
    el.style.height = data.h + "px";
  }

  function renderWalls(walls) {
    walls.forEach(function (wallData) {
      var wall = document.createElement("div");
      wall.className = "wall";
      positionElement(wall, wallData);
      wall.addEventListener("mouseenter", handleWallHit);
      maze.appendChild(wall);
    });
  }

  function applyLevel(level) {
    clearWalls();
    resetState();

    levelName.textContent = level.name;
    maze.style.width = level.size.width + "px";
    maze.style.height = level.size.height + "px";

    positionElement(start, level.start);
    positionElement(finish, level.finish);

    renderWalls(level.walls);
  }

  function startGame() {
    if (isGameOver) {
      return;
    }
    isPlaying = true;
    setMessage("Stay inside the paths.");
  }

  function handleWallHit() {
    if (!isPlaying || isGameOver) {
      return;
    }
    endGame("Game over! Refresh the page to play again.");
  }

  function handleMazeLeave() {
    if (!isPlaying || isGameOver) {
      return;
    }
    endGame("Game over! Refresh the page to play again.");
  }

  function handleFinish() {
    if (!isPlaying || isGameOver) {
      return;
    }

    if (currentLevelIndex === levels.length - 1) {
      endGame("You escaped all 5 levels! Refresh to play again.");
      return;
    }

    currentLevelIndex += 1;
    applyLevel(levels[currentLevelIndex]);
  }

  function endGame(text) {
    isGameOver = true;
    isPlaying = false;
    document.body.classList.add("game-over");
    maze.classList.add("locked");
    setMessage(text);
  }

  start.addEventListener("mouseenter", startGame);
  finish.addEventListener("mouseenter", handleFinish);
  maze.addEventListener("mouseleave", handleMazeLeave);

  if (levels.length === 0) {
    setMessage("No levels found.");
    return;
  }
  // currentLevelIndex
  applyLevel(levels[currentLevelIndex]);
})();
