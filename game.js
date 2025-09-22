const TILE = 32;
const COLS = 13;
const ROWS = 11;

const FLOOR = 0, HARD = 1, SOFT = 2, PLAYER = 3, ENEMY = 4;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

const DIRS = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
let state;

function resetGame() {
  state = {
    grid: generateMap(),
    player: {x:1,y:1},
    bombs: [],
    flames: [],
    enemies: [{x:COLS-2,y:ROWS-2,dir:"left",cd:20}],
    tick:0,
    cleared:false,
    over:false,
  };
}

function generateMap() {
  const g = Array.from({length:ROWS},()=>Array(COLS).fill(FLOOR));
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    if(x===0||y===0||x===COLS-1||y===ROWS-1) g[y][x]=HARD;
    else if(x%2===0&&y%2===0) g[y][x]=HARD;
    else if(Math.random()<0.3 && !(x<=2&&y<=2)) g[y][x]=SOFT;
  }
  return g;
}

function update() {
  if(state.over||state.cleared) return;
  state.tick++;

  // 爆弾処理
  for(const b of state.bombs){
    b.timer--;
    if(b.timer===0) explode(b);
  }
  state.bombs=state.bombs.filter(b=>!b.done);

  // 炎寿命
  state.flames=state.flames.filter(f=>--f.ttl>0);

  // 敵AI
  for(const e of state.enemies){
    if(--e.cd<=0){
      e.cd=20;
      const [dx,dy]=DIRS[e.dir]||[0,0];
      const nx=e.x+dx, ny=e.y+dy;
      if(state.grid[ny][nx]===FLOOR && !isBomb(nx,ny)) { e.x=nx; e.y=ny; }
      else e.dir=randomDir();
    }
    if(e.x===state.player.x&&e.y===state.player.y){ gameOver("風船にやられた！"); }
  }

  // 炎ヒット判定
  for(const f of state.flames){
    if(f.x===state.player.x&&f.y===state.player.y) gameOver("爆風にやられた！");
    state.enemies=state.enemies.filter(e=>!(e.x===f.x&&e.y===f.y));
  }

  if(state.enemies.length===0) { state.cleared=true; }
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    if(state.grid[y][x]===HARD){ ctx.fillStyle="#555"; ctx.fillRect(x*TILE,y*TILE,TILE,TILE); }
    else if(state.grid[y][x]===SOFT){ ctx.fillStyle="#964B00"; ctx.fillRect(x*TILE+4,y*TILE+4,TILE-8,TILE-8); }
    else { ctx.fillStyle="#222"; ctx.fillRect(x*TILE,y*TILE,TILE,TILE); }
  }
  // 爆弾
  ctx.fillStyle="black";
  for(const b of state.bombs) ctx.fillRect(b.x*TILE+8,b.y*TILE+8,16,16);

  // 炎
  ctx.fillStyle="orange";
  for(const f of state.flames) ctx.fillRect(f.x*TILE+4,f.y*TILE+4,TILE-8,TILE-8);

  // 敵
  ctx.fillStyle="pink";
  for(const e of state.enemies) ctx.beginPath(),ctx.arc(e.x*TILE+16,e.y*TILE+16,14,0,Math.PI*2),ctx.fill();

  // プレイヤー
  ctx.fillStyle="cyan";
  ctx.fillRect(state.player.x*TILE+4,state.player.y*TILE+4,TILE-8,TILE-8);

  if(state.cleared){ msg("🎉 CLEAR!"); }
  if(state.over){ msg("💀 GAME OVER"); }
}

function msg(t){
  ctx.fillStyle="rgba(0,0,0,0.5)";
  ctx.fillRect(0,canvas.height/2-30,canvas.width,60);
  ctx.fillStyle="white";
  ctx.font="28px sans-serif";
  ctx.textAlign="center";
  ctx.fillText(t,canvas.width/2,canvas.height/2+10);
}

function placeBomb(){
  if(state.over||state.cleared) return;
  const {x,y}=state.player;
  if(isBomb(x,y)) return;
  state.bombs.push({x,y,timer:60,range:2,done:false});
}

function explode(b){
  const cells=[{x:b.x,y:b.y}];
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    for(let i=1;i<=b.range;i++){
      const nx=b.x+dx*i, ny=b.y+dy*i;
      if(state.grid[ny][nx]===HARD) break;
      cells.push({x:nx,y:ny});
      if(state.grid[ny][nx]===SOFT){ state.grid[ny][nx]=FLOOR; break; }
    }
  }
  for(const c of cells) state.flames.push({x:c.x,y:c.y,ttl:20});
  b.done=true;
}

function isBomb(x,y){ return state.bombs.some(b=>!b.done&&b.x===x&&b.y===y); }
function randomDir(){ return ["up","down","left","right"][(Math.random()*4)|0]; }
function gameOver(r){ state.over=true; console.log(r); }

function tryMove(dir){
  if(state.over||state.cleared) return;
  const [dx,dy]=DIRS[dir]; const nx=state.player.x+dx, ny=state.player.y+dy;
  if(state.grid[ny][nx]===FLOOR && !isBomb(nx,ny)){ state.player.x=nx; state.player.y=ny; }
}

document.addEventListener("keydown",e=>{
  if(e.key==="ArrowUp")tryMove("up");
  if(e.key==="ArrowDown")tryMove("down");
  if(e.key==="ArrowLeft")tryMove("left");
  if(e.key==="ArrowRight")tryMove("right");
  if(e.key===" ")placeBomb();
});

document.querySelectorAll(".dpad button").forEach(b=>b.addEventListener("click",()=>tryMove(b.dataset.dir)));
document.getElementById("bombBtn").addEventListener("click",placeBomb);

function loop(){ update(); draw(); requestAnimationFrame(loop); }

resetGame(); loop();
