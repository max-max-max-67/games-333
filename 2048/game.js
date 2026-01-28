class Game2048 {
    constructor() {
        this.board = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('2048-best') || 0;
        this.gameOver = false;
        this.won = false;
        this.gameContainer = document.getElementById('gameContainer');
        this.scoreDisplay = document.getElementById('score');
        this.bestDisplay = document.getElementById('best');
        this.bestDisplay.textContent = this.bestScore;
        
        this.tileSize = 0;
        this.gap = 0;
        this.containerSize = 0;
        
        this.setupEventListeners();
        this.calculateSizes();
        this.init();
    }

    calculateSizes() {
        const containerWidth = this.gameContainer.offsetWidth;
        this.containerSize = containerWidth;
        this.gap = 10;
        this.tileSize = (containerWidth - this.gap * 5) / 4;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('newGameBtn').addEventListener('click', () => this.init());
        document.getElementById('retryBtn').addEventListener('click', () => this.init());
        window.addEventListener('resize', () => {
            this.calculateSizes();
            this.render();
        });
    }

    init() {
        this.board = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.scoreDisplay.textContent = this.score;
        document.getElementById('gameMessage').classList.remove('show');
        
        this.addNewTile();
        this.addNewTile();
        this.render();
    }

    addNewTile() {
        const emptyTiles = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    emptyTiles.push({ row: i, col: j });
                }
            }
        }

        if (emptyTiles.length > 0) {
            const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            this.board[randomTile.row][randomTile.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    handleKeyPress(e) {
        if (this.gameOver || this.won) return;

        const key = e.key.toLowerCase();
        const arrowMap = {
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };

        if (key in arrowMap) {
            e.preventDefault();
            const moved = this.move(arrowMap[key]);
            if (moved) {
                this.addNewTile();
                this.render();
                this.checkGameState();
            }
        }
    }

    move(direction) {
        let moved = false;
        const oldBoard = JSON.parse(JSON.stringify(this.board));

        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) {
                if (direction === 'left') {
                    this.board[i] = this.slideAndMerge(this.board[i]);
                } else {
                    this.board[i] = this.slideAndMerge(this.board[i].reverse()).reverse();
                }
            }
        } else {
            for (let j = 0; j < 4; j++) {
                let column = [this.board[0][j], this.board[1][j], this.board[2][j], this.board[3][j]];
                if (direction === 'up') {
                    column = this.slideAndMerge(column);
                } else {
                    column = this.slideAndMerge(column.reverse()).reverse();
                }
                for (let i = 0; i < 4; i++) {
                    this.board[i][j] = column[i];
                }
            }
        }

        moved = JSON.stringify(oldBoard) !== JSON.stringify(this.board);
        return moved;
    }

    slideAndMerge(line) {
        let newLine = line.filter(val => val !== 0);
        
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                this.score += newLine[i];
                newLine.splice(i + 1, 1);
            }
        }

        while (newLine.length < 4) {
            newLine.push(0);
        }

        return newLine;
    }

    checkGameState() {
        this.scoreDisplay.textContent = this.score;

        // Check for win
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 2048 && !this.won) {
                    this.won = true;
                    this.showMessage('You won!');
                    return;
                }
            }
        }

        // Check for lose
        if (!this.canMove()) {
            this.gameOver = true;
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('2048-best', this.bestScore);
                this.bestDisplay.textContent = this.bestScore;
            }
            this.showMessage('Game Over!');
        }
    }

    canMove() {
        // Check for empty tiles
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) return true;
            }
        }

        // Check for possible merges
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.board[i][j];
                if ((j < 3 && current === this.board[i][j + 1]) ||
                    (i < 3 && current === this.board[i + 1][j])) {
                    return true;
                }
            }
        }

        return false;
    }

    showMessage(text) {
        const messageEl = document.getElementById('gameMessage');
        document.getElementById('messageText').textContent = text;
        messageEl.classList.add('show');
    }

    render() {
        this.gameContainer.innerHTML = '';

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = this.board[i][j];
                
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = 'tile new';
                    tile.setAttribute('data-value', value);
                    tile.textContent = value;
                    
                    const left = j * (this.tileSize + this.gap) + this.gap;
                    const top = i * (this.tileSize + this.gap) + this.gap;
                    
                    tile.style.left = left + 'px';
                    tile.style.top = top + 'px';
                    tile.style.width = this.tileSize + 'px';
                    tile.style.height = this.tileSize + 'px';
                    
                    this.gameContainer.appendChild(tile);
                }
            }
        }
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
