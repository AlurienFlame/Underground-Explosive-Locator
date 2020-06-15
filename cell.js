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
        this.countNeighboringMines();
        this.isRevealed = true;

        // FloodFill
        if (this.neighboringMines == 0) {
            loopNeighbors(this.x, this.y, (x, y) => {
                let neighbor = grid[x][y];
                neighbor.countNeighboringMines();
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
}
