class Cell {
    mustNotBeMine = false;
    isMine = false;
    isFlagged = false;
    isRevealed = false;
    neighboringMines = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.pxX = x * cellSize;
        this.pxY = y * cellSize + cellSize;
    }

    show() {
        // TODO: Flag and mine textures
        if (this.isRevealed) {
            if (this.isMine) {
                fill("red");
                rect(this.pxX, this.pxY, cellSize, cellSize);
            } else {
                fill(175);
                rect(this.pxX, this.pxY, cellSize, cellSize);
                fill(0);
                if (this.neighboringMines > 0) {
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
            if (this.isFlagged) {
                fill("orange");
            } else {
                fill(255);
            }
            rect(this.pxX, this.pxY, cellSize, cellSize);
        }
    }

    reveal() {
        // TODO: Set up a system so this is calculated when you make the first move,
        // rather than every single time a mine is revealed
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
        // You can only middle click if the clicked cell or
        // at least one cell neighboring it is empty
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
                    alert("You lose!");
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
            alert("You lose!");
            return;
        }

        this.reveal();
    }
}
