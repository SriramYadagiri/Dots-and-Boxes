const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

var board;
let playAgainstBotBox = document.getElementById('vs-bot-toggle');
let playAgainstBot = false;

playAgainstBotBox.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.getElementById('second-player').innerText = 'Bot';
        playAgainstBot = true;
    } else {
        document.getElementById('second-player').innerText = 'Player 2';
        playAgainstBot = false;
    }
});


let rect = canvas.getBoundingClientRect();
let scaleX = canvas.width / rect.width;
let scaleY = canvas.height / rect.height;

function resizeCanvas() {
    rect = canvas.getBoundingClientRect();
    scaleX = canvas.width / rect.width;
    scaleY = canvas.height / rect.height;
}

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    board.detectHoveredEdge(mouseX, mouseY);
});

canvas.addEventListener('click', (e) => {
    if (board.hoveredEdge && board.hoveredEdge.player === 0) {
        if (playAgainstBot){
            if (board.player === 1) board.selectEdge(board.hoveredEdge);
            if (board.player !== 1) setTimeout(playBotMove, 300);
        } else {
            board.selectEdge(board.hoveredEdge);
        }
    }
});

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, width, height);
    board.draw();
}

function setupGame(size = 10) {
    ctx.clearRect(0, 0, width, height);
    board = new Board(size, size);
    board.setPlayer(1);
    document.getElementById('score1').innerText = 0;
    document.getElementById('score2').innerText = 0;
    boardSizeSlider.value = size;
    document.getElementById('board-size-label').innerText = `${size} x ${size}`;
}

function resetGame(size = 10) {
    let userConfirmed = confirm('This will clear the current board and scores.');
    if (userConfirmed) setupGame(size);
}

const boardSizeSlider = document.getElementById('board-size');
boardSizeSlider.addEventListener('input', changeSize);

function changeSize() {
    const size = boardSizeSlider.value;
    document.getElementById('board-size-label').innerText = `${size} x ${size}`;
    setupGame(size);
}

setupGame();
draw();