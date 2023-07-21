type Board = Array<Array<string | null>>;

class Gomoku {
  board: Board;
  currentPlayer: string;
  opponentPlayer: string;

  constructor() {
    this.board = this.createEmptyBoard();
    this.currentPlayer = 'X'; // Player X starts
    this.opponentPlayer = 'O';
  }

  createEmptyBoard(): Board {
    const board: Board = [];
    for (let i = 0; i < 15; i++) {
      board.push(Array(15).fill(null));
    }
    return board;
  }

  makeMove(row: number, col: number): void {
    if (this.board[row][col] === null) {
      this.board[row][col] = this.currentPlayer;
      this.swapPlayers();
    }
  }

  swapPlayers(): void {
    [this.currentPlayer, this.opponentPlayer] = [this.opponentPlayer, this.currentPlayer];
  }

  evaluateBoard(): number {
    const lines = [
      { dx: 1, dy: 0 },  // Horizontal
      { dx: 0, dy: 1 },  // Vertical
      { dx: 1, dy: 1 },  // Diagonal (top-left to bottom-right)
      { dx: -1, dy: 1 }  // Diagonal (top-right to bottom-left)
    ];

    let score = 0;

    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        if (this.board[row][col] === this.currentPlayer) {
          for (const line of lines) {
            const lineScore = this.evaluateLine(row, col, line.dx, line.dy);
            score += lineScore;
          }
        } else if (this.board[row][col] === this.opponentPlayer) {
          for (const line of lines) {
            const lineScore = this.evaluateLine(row, col, line.dx, line.dy);
            score -= lineScore;
          }
        }
      }
    }

    return score;
  }

  evaluateLine(row: number, col: number, dx: number, dy: number): number {
    const playerPiece = this.board[row][col];
    let pieceCount = 1;
    let consecutiveCount = 0;
    let blockedEnds = 0;

    // Check forward direction
    let r = row + dx;
    let c = col + dy;
    while (r >= 0 && r < 15 && c >= 0 && c < 15 && this.board[r][c] === playerPiece) {
      pieceCount++;
      consecutiveCount++;
      r += dx;
      c += dy;
    }
    if (r >= 0 && r < 15 && c >= 0 && c < 15 && this.board[r][c] === null) {
      blockedEnds++;
    }

    // Check backward direction
    r = row - dx;
    c = col - dy;
    while (r >= 0 && r < 15 && c >= 0 && c < 15 && this.board[r][c] === playerPiece) {
      pieceCount++;
      consecutiveCount++;
      r -= dx;
      c -= dy;
    }
    if (r >= 0 && r < 15 && c >= 0 && c < 15 && this.board[r][c] === null) {
      blockedEnds++;
    }

    // Calculate score for the line
    let score = 0;
    if (consecutiveCount >= 5) {
      score += Math.pow(10, consecutiveCount - 5);
    } else if (consecutiveCount === 4 && blockedEnds === 2) {
      score += 1000;
    } else if (consecutiveCount === 3 && blockedEnds === 2) {
      score += 100;
    } else if (consecutiveCount === 2 && blockedEnds === 2) {
      score += 10;
    } else if (consecutiveCount === 1 && blockedEnds === 2) {
      score += 1;
    }

    return score;
  }

  getAvailableMoves(): Array<[number, number]> {
    const moves: Array<[number, number]> = [];

    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        if (this.board[row][col] === null) {
          moves.push([row, col]);
        }
      }
    }

    return moves;
  }

  findBestMove(): [number, number] {
    let bestScore = -Infinity;
    let bestMove: [number, number] = [-1, -1];

    const moves = this.getAvailableMoves();

    for (const [row, col] of moves) {
      this.board[row][col] = this.currentPlayer;
      this.swapPlayers();

      const score = this.minimax(0, false, -Infinity, Infinity);

      this.board[row][col] = null;
      this.swapPlayers();

      if (score > bestScore) {
        bestScore = score;
        bestMove = [row, col];
      }
    }

    return bestMove;
  }

  minimax(depth: number, isMaximizingPlayer: boolean, alpha: number, beta: number): number {
    const score = this.evaluateBoard();

    if (depth === 0 || Math.abs(score) === Infinity) {
      return score;
    }

    const moves = this.getAvailableMoves();

    if (isMaximizingPlayer) {
      let maxScore = -Infinity;
      for (const [row, col] of moves) {
        this.board[row][col] = this.currentPlayer;
        this.swapPlayers();

        const childScore = this.minimax(depth - 1, false, alpha, beta);
        maxScore = Math.max(maxScore, childScore);
        alpha = Math.max(alpha, maxScore);

        this.board[row][col] = null;
        this.swapPlayers();

        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const [row, col] of moves) {
        this.board[row][col] = this.opponentPlayer;
        this.swapPlayers();

        const childScore = this.minimax(depth - 1, true, alpha, beta);
        minScore = Math.min(minScore, childScore);
        beta = Math.min(beta, minScore);

        this.board[row][col] = null;
        this.swapPlayers();

        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }
      return minScore;
    }
  }
  
    checkWin(row, col) {
      const player = this.board[row][col];
  
      // Check horizontal
      let count = 1;
      let c = col - 1;
      while (c >= 0 && this.board[row][c] === player) {
        count++;
        c--;
      }
      c = col + 1;
      while (c < 15 && this.board[row][c] === player) {
        count++;
        c++;
      }
      if (count >= 5) return true;
  
      // Check vertical
      count = 1;
      let r = row - 1;
      while (r >= 0 && this.board[r][col] === player) {
        count++;
        r--;
      }
      r = row + 1;
      while (r < 15 && this.board[r][col] === player) {
        count++;
        r++;
      }
      if (count >= 5) return true;
  
      // Check diagonal (top-left to bottom-right)
      count = 1;
      r = row - 1;
      c = col - 1;
      while (r >= 0 && c >= 0 && this.board[r][c] === player) {
        count++;
        r--;
        c--;
      }
      r = row + 1;
      c = col + 1;
      while (r < 15 && c < 15 && this.board[r][c] === player) {
        count++;
        r++;
        c++;
      }
      if (count >= 5) return true;
  
      // Check diagonal (top-right to bottom-left)
      count = 1;
      r = row - 1;
      c = col + 1;
      while (r >= 0 && c < 15 && this.board[r][c] === player) {
        count++;
        r--;
        c++;
      }
      r = row + 1;
      c = col - 1;
      while (r < 15 && c >= 0 && this.board[r][c] === player) {
        count++;
        r++;
        c--;
      }
      if (count >= 5) return true;
  
      return false;
    }
  
    reset() {
      this.board = this.createEmptyBoard();
      this.currentPlayer = 'X';
      this.opponentPlayer = 'O';
    }
}



const boardContainer = document.querySelector('.board');
const gomoku = new Gomoku();
let boardSize = 15
function renderBoard() {
    if (boardContainer === null) return;
    boardContainer.innerHTML = '';
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
          const cell = document.createElement('div');
          const blackchild = document.createElement('div');
          const whitechild = document.createElement('div');
          whitechild.className = 'white-ball';
          blackchild.className = 'black-ball';
          cell.className = 'cell';
          cell.dataset.row = row.toString();
          cell.dataset.col = col.toString();
          cell.addEventListener('click', handleCellClick);
          if (gomoku.board[row][col] !== null) {
            if (gomoku.board[row][col] == 'X') cell.appendChild(blackchild);
            else cell.appendChild(whitechild);
          }
          boardContainer.appendChild(cell);
        }
      }
    }

function handleCellClick(event) {
    const info = document.querySelector('.info');
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    gomoku.makeMove(row, col);
    renderBoard();
    if (gomoku.checkWin(row, col)) {
        if (gomoku.currentPlayer === 'X' && info !== null) info.textContent = 'White wins';
        else if (gomoku.currentPlayer === 'O' && info !== null) info.textContent = 'Black wins';
        const allcells = document.querySelectorAll('.cell');
        if (allcells !== null) {
          for (const cll of allcells) {
            cll.removeEventListener('click', handleCellClick);
        }
      }
    }
    else {
      if (gomoku.currentPlayer === 'X' && info !== null) info.textContent = 'Active Player: Black';
      else if (gomoku.currentPlayer === 'O' && info !== null) info.textContent = 'Active Player: White';
    }
}

renderBoard();


// attach event listener to reset 
const reset = document.querySelector('.reset');
reset?.addEventListener('click', () => {
  gomoku.reset();
  renderBoard();
})

// change board size

const size = document.getElementById('size');
size?.addEventListener('change', (e) => {
  boardSize = parseInt((<HTMLInputElement>document.getElementById('size'))?.value);
  console.log(boardSize);
  const theBoard = document.querySelector('.board');
  (<HTMLElement>theBoard).style.gridTemplateColumns = `repeat(${boardSize}, 20px)`;
  (<HTMLElement>theBoard).style.width = `${boardSize * 20 + 2}px`;
  gomoku.reset();
  renderBoard();
})