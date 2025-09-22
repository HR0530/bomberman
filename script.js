const rows = 11;
const cols = 13;
const gameEl = document.getElementById("game");

let grid = [];
let player = { x: 1, y: 1, speed: 1, power: 1 };

function createGrid() {
  gameEl.innerHTML = "";
  grid = [];

  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      // 壊れないブロック配置
      if (x % 2 === 0 && y % 2 === 0) {
        cell.classList.add("unbreakable");
        row.push("U");
      }
      // ランダム壊れるブロック
      else if (Math.random() < 0.3 && !(x === 1 && y === 1)) {
        cell.classList.add("breakable");
        row.push("B");
      } else {
        row.push(" ");
      }

      gameEl.appendChild(cell);
    }
    grid.push(row);
  }
  placePlayer();
}

function placePlayer() {
  const index = player.y * cols + player.x;
  gameEl.children[index].classList.add("player");
}

createGrid();
