// TODO: Options menu accessible to the player
const cellSize = 20;
const topBarHeight = cellSize;
const gridWidth = 40;
const gridHeight = 30 - 1; // -1 for the top-bar
const grid = make2DGrid(gridWidth);
const percentageMines = 0.2;
const numMines = percentageMines * gridWidth * gridHeight;
let moves = 0;
let gameIsOver = false;
let timerValue = 0;
let timerDisplay = 0;

function setup() {
    createCanvas(800, 600);
    // Initialize cells
    loopGrid((x, y) => {
        grid[x][y] = new Cell(x, y, cellSize);
    });
}

function draw() {
    background(220);
    loopGrid((x, y) => {
        grid[x][y].show();
    });
    fill(255);
    rect(0, 0, gridWidth * cellSize, topBarHeight);
    fill(0);
    textSize(12);
    text(`Moves: ${moves}`, 5, topBarHeight - 5);

    // Timer
    timerValue += deltaTime;
    timerDisplay = floor(timerValue / 1000);
    if (timerDisplay > 60) {
        // Display minutes
        mins = floor(timerDisplay / 60);
        secs = timerDisplay % 60;
        secsstr = (secs < 10 ? "0" : "") + secs;
        timerDisplay = `${mins}:${secsstr}`;
    }
    text(timerDisplay, width / 2 - textWidth(timerDisplay) / 2, topBarHeight - 5);
}

function mousePressed() {
    clickedOn = mouseToGridCoords();
    if (!clickedOn) return;
    clickedOn.mouseHeld = true;
}

function mouseReleased() {
    clickedOn = mouseToGridCoords();
    if (!clickedOn) return;
    clickedOn.mouseHeld = false;

    if (mouseButton === CENTER) {
        clickedOn.onMouseMiddle();
    }

    // You can't reveal or place flags on an already revealed tile
    if (clickedOn.isRevealed) return;

    if (mouseButton === RIGHT) {
        clickedOn.onMouseRight();
    }

    if (mouseButton === LEFT) {
        clickedOn.onMouseLeft();
    }
}

function mouseToGridCoords() {
    // Don't click outside of game
    if (mouseX > gridWidth * cellSize || mouseX < 0) return;
    if (mouseY > gridHeight * cellSize + topBarHeight || mouseY < topBarHeight) return;

    // Don't click if game is over
    if (gameIsOver) return;

    // Calculate which cell was clicked on from mouse co-ordinates
    return grid[floor(mouseX / cellSize)][floor((mouseY - topBarHeight) / cellSize)];
}

function make2DGrid(arrayWidth) {
    var output = [];
    for (let i = 0; i < arrayWidth; i++) {
        output[i] = [];
    }
    return output;
}

function loopGrid(callback) {
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            callback(i, j);
        }
    }
}

function loopNeighbors(x, y, callback) {
    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            // Out of bounds
            if (i < 0 || i > gridWidth - 1 || j < 0 || j > gridHeight - 1) {
                continue;
            }
            // Center
            if (i == x && j == y) {
                continue;
            }
            callback(i, j);
        }
    }
}

function plantMines() {
    if (numMines > gridWidth * gridHeight - 9) {
        // -9 for cells that have been flagged as mustNotBeMine
        console.error("Trying to place more mines than spaces on the grid!");
        return;
    }
    var timesLooped = 0;
    for (let i = 0; i < numMines; i++) {
        timesLooped++;
        var target = grid[floor(random(gridWidth))][floor(random(gridHeight))];

        // Don't place mines on mines
        if (!target.isMine) {
            target.isMine = true;
        } else {
            i--;
        }

        // Don't place mines on or around mouse
        if (target.mustNotBeMine) {
            target.isMine = false;
            i--;
        }

        // Don't infinite loop
        if (timesLooped >= 10000) {
            console.warn(`Could not place mine after ${timesLooped} tries, giving up.`);
            return;
        }
    }
}

function checkWinCondition() {
    var won = true;
    loopGrid((x, y) => {
        if (grid[x][y].isMine && !grid[x][y].isFlagged) {
            won = false;
        }
    });
    if (won) {
        gameOver();
        alert(`You win!\nTime: ${timerDisplay}`);
    }
}

function gameOver() {
    gameIsOver = true;
    loopGrid((x, y) => {
        grid[x][y].reveal();
    });
}

// Disable right click context menu
document.addEventListener("contextmenu", (event) => event.preventDefault());
