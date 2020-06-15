// TODO: Options menu accessible to the player
const cellSize = 20;
const topBarHeight = cellSize;
const gridWidth = 40;
const gridHeight = 30 - 1; // -1 for the top-bar
const grid = make2DGrid(gridWidth);
// TODO: Make numMines a percentage
const numMines = 70;
let move = 0;
let gameIsOver = false;

function setup() {
    createCanvas(800, 600);
    // Initialize cells
    loopGrid((x, y) => {
        grid[x][y] = new Cell(x, y, cellSize);
    });
}

function draw() {
    // TODO: Make this more sensitive
    // Use mouseReleased function and move functionality into cell class
    if (mouseIsPressed) {

        // Don't click outside of game
        if (mouseX > gridWidth * cellSize || mouseX < 0) return;
        if (mouseY > gridHeight * cellSize + topBarHeight || mouseY < topBarHeight) return;

        // FIXME: Stop using magic numbers, it's breaking it.
        var clickedOn = grid[floor(mouseX / cellSize)][floor((mouseY - topBarHeight) / cellSize)];

        if (mouseButton === CENTER) {
            var canMiddleClick;
            var justLost;

            loopNeighbors(clickedOn.x, clickedOn.y, (x, y) => {
                if (grid[x][y].isRevealed) {
                    canMiddleClick = true;
                }
            });

            if (canMiddleClick) {
                loopNeighbors(clickedOn.x, clickedOn.y, (x, y) => {
                    if (!grid[x][y].isFlagged) {
                        grid[x][y].reveal();
                    }
                    if (grid[x][y].isMine) {
                        justLost = true;
                    }
                });
            }

            if (justLost) {
                gameOver();
                alert("You lose!");
            }
        }

        if (clickedOn.isRevealed || gameIsOver) {
            return;
        }

        // FIXME: Stop flashing flag bug
        if (mouseButton === RIGHT) {
            // Flag
            clickedOn.isFlagged = !clickedOn.isFlagged;
            if (clickedOn.isMine) {
                checkWinCondition();
            }
        }

        if (mouseButton === LEFT) {
            // Reveal
            move++;
            if (move == 1) {
                clickedOn.mustNotBeMine = true;
                loopNeighbors(clickedOn.x, clickedOn.y, (x, y) => {
                    grid[x][y].mustNotBeMine = true;
                });
                plantMines(clickedOn);
            }

            if (clickedOn.isMine) {
                gameOver();
                alert("You lose!");
                return;
            }

            clickedOn.reveal();
        }
    }

    background(220);
    loopGrid((x, y) => {
        grid[x][y].show();
    });
    fill(255);
    rect(0, 0, gridWidth * cellSize, topBarHeight);
    fill(0);
    textSize(12);
    text(`Moves: ${move}`, 5, topBarHeight - 5);
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

function plantMines(clickedOn) {
    if (numMines > gridWidth * gridHeight - 1) {
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
        alert("You win!");
    }
}

function gameOver() {
    gameIsOver = true;
    loopGrid((x, y) => {
        grid[x][y].reveal();
    });
}

document.addEventListener("contextmenu", (event) => event.preventDefault());
