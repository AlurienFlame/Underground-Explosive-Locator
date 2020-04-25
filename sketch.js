// TODO: Options menu accessible to the player
const gridWidth = 20;
const gridHeight = 20;
const grid = make2DGrid();
const numMines = 70;
let move = 0;
let gameIsOver = false;

function setup() {
    createCanvas(400, 420);
    // Initialize cells
    loopGrid((x, y) => {
        grid[x][y] = new Cell(x, y, 20);
    });
}

function draw() {
    // TODO: Make this more sensitive
    // Use mouseReleased function and move functionality into cell class
    if (mouseIsPressed) {
        // Find out if the % 20 is event neccessary
        var clickedOn = grid[floor(mouseX / 20) % 20][floor((mouseY - 20) / 20) % 20];

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
    rect(0, 0, gridWidth * 20, gridHeight);
    fill(0);
    textSize(12);
    text(`Moves: ${move}`, 5, gridHeight - 5);
}

function make2DGrid() {
    var output = [];
    for (let i = 0; i < gridWidth; i++) {
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
    var realI = 0;
    for (let i = 0; i < numMines; i++) {
        realI++;
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
        if (realI >= 10000) {
            console.warn(`Could not place mine after ${realI} tries giving up.`);
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
