class Cell {
    mustNotBeMine = false;
    isMine = false;
    isFlagged = false;
    isRevealed = false;
    mouseHeld = false;
    neighboringMines = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.pxX = x * cellSize;
        this.pxY = y * cellSize + topBarHeight;
    }

    show() {
        if (this.isRevealed) {
            if (this.isMine) {
                // Mine
                fill("red");
                rect(this.pxX, this.pxY, cellSize, cellSize);
                fill("black");
                ellipse(this.pxX + cellSize / 2, this.pxY + cellSize / 2, cellSize * 0.6);
            } else {
                // Empty
                fill(175);
                rect(this.pxX, this.pxY, cellSize, cellSize);
                fill(0);
                if (this.neighboringMines > 0) {
                    // Number
                    switch (this.neighboringMines) {
                        case 1:
                            fill("blue");
                            break;
                        case 2:
                            fill("green");
                            break;
                        case 3:
                            fill("red");
                            break;
                        case 4:
                            fill("purple");
                            break;
                        case 5:
                            fill("black");
                            break;
                        case 6:
                            fill("turquoise");
                            break;
                    }
                    textSize(20);
                    text(this.neighboringMines, this.pxX + cellSize * 0.25, this.pxY + cellSize * 0.9);
                }
            }
        } else {
            // Unrevealed
            if (this.mouseHeld) {
                fill(200);
            } else {
                fill(255);
            }
            rect(this.pxX, this.pxY, cellSize, cellSize);
            if (this.isFlagged) {
                // Flag
                line(this.pxX + cellSize * 0.4, this.pxY + cellSize * 0.15, this.pxX + cellSize * 0.4, this.pxY + cellSize * 0.8);
                fill("orange");
                triangle(this.pxX + cellSize * 0.4, this.pxY + cellSize * 0.2, this.pxX + cellSize * 0.4, this.pxY + cellSize * 0.6, this.pxX + cellSize * 0.9, this.pxY + cellSize * 0.4);
            }
        }
    }

    reveal() {
        this.countNeighboringMines();
        this.isRevealed = true;

        // FloodFill
        if (this.neighboringMines == 0) {
            loopNeighbors(this.x, this.y, (x, y) => {
                let neighbor = grid[x][y];
                if (!neighbor.isMine && !neighbor.isRevealed) {
                    neighbor.reveal();
                }
            });
        }
    }

    countNeighboringMines() {
        this.neighboringMines = 0;
        loopNeighbors(this.x, this.y, (x, y) => {
            if (grid[x][y].isMine) {
                this.neighboringMines++;
            }
        });
    }

    onMouseMiddle() {
        // Reveal neighboring tiles which are not flagged

        // There must be neighboring tiles to reveal
        if (this.neighboringMines == 0) return;

        // There must be the same amounts of neighboring flags and mines
        let neighboringFlags = 0;

        loopNeighbors(this.x, this.y, (x, y) => {
            if (grid[x][y].isFlagged) {
                neighboringFlags++;
            }
        });

        if (neighboringFlags != this.neighboringMines) return;

        // At least one neighboring cell must be revealed
        let canMiddleClick = false;

        if (grid[this.x][this.y].isRevealed) canMiddleClick = true;

        loopNeighbors(this.x, this.y, (x, y) => {
            if (grid[x][y].isRevealed) {
                canMiddleClick = true;
            }
        });

        if (!canMiddleClick) return;

        // Do middle click
        loopNeighbors(this.x, this.y, (x, y) => {
            if (!grid[x][y].isFlagged) {
                grid[x][y].reveal();
                if (grid[x][y].isMine) {
                    gameOver();
                    alert(`You lose!\nTime: ${timerDisplay}`);
                }
            }
        });
    }

    onMouseRight() {
        // Place flag
        this.isFlagged = !this.isFlagged;
        if (this.isMine) {
            checkWinCondition();
        }
    }

    onMouseLeft() {
        // Reveal
        moves++;
        if (moves == 1) {
            // First move
            this.mustNotBeMine = true;
            loopNeighbors(this.x, this.y, (x, y) => {
                grid[x][y].mustNotBeMine = true;
            });
            plantMines();
            loopGrid((x, y) => {
                grid[x][y].countNeighboringMines();
            });
        }

        if (this.isMine) {
            gameOver();
            alert(`You lose!\nTime: ${timerDisplay}`);
            return;
        }

        this.reveal();
    }
}
