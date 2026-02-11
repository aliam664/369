// بازی دوز - نسخه تقویت شده

class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp';
        this.difficulty = 'easy';
        this.movesHistory = [];
        this.redoHistory = [];
        this.scores = {
            X: { wins: 0, games: 0, score: 0 },
            O: { wins: 0, games: 0, score: 0 }
        };
        this.totalGames = 0;
        this.totalDraws = 0;
        this.winStreak = 0;
        this.fastestWin = null;
        this.gameStartTime = null;
        this.moveTimer = null;
        this.moveTimeLimit = 30;
        this.animationsEnabled = true;
        this.soundEnabled = true;
        this.showHints = true;
        this.highlightMoves = true;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadStats();
        this.updateUI();
        this.startTimer();
    }

    cacheElements() {
        this.cells = document.querySelectorAll('.cell');
        this.gameBoard = document.getElementById('gameBoard');
        this.statusText = document.getElementById('statusText');
        this.winLines = document.getElementById('winLines');
        this.movesList = document.getElementById('movesList');
        
        // عناصر صدا
        this.clickSound = document.getElementById('clickSound');
        this.winSound = document.getElementById('winSound');
        this.drawSound = document.getElementById('drawSound');
        this.errorSound = document.getElementById('errorSound');
        
        // دکمه‌ها
        this.newGameBtn = document.getElementById('newGameBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        this.resetScoreBtn = document.getElementById('resetScoreBtn');
        this.quickRestartBtn = document.getElementById('quickRestartBtn');
        this.hintBtn = document.getElementById('hintBtn');
        
        // اطلاعات بازیکنان
        this.playerXCard = document.getElementById('playerXCard');
        this.playerOCard = document.getElementById('playerOCard');
        this.xTurnIndicator = document.getElementById('xTurnIndicator');
        this.oTurnIndicator = document.getElementById('oTurnIndicator');
        this.xThinking = document.getElementById('xThinking');
        this.oThinking = document.getElementById('oThinking');
        
        // آمار
        this.playerXScore = document.getElementById('playerXScore');
        this.playerXWins = document.getElementById('playerXWins');
        this.playerXGames = document.getElementById('playerXGames');
        this.playerOScore = document.getElementById('playerOScore');
        this.playerOWins = document.getElementById('playerOWins');
        this.playerOGames = document.getElementById('playerOGames');
        this.totalGamesElement = document.getElementById('totalGames');
        this.totalDrawsElement = document.getElementById('totalDraws');
        this.totalTimeElement = document.getElementById('totalTime');
        this.winStreakElement = document.getElementById('winStreak');
        this.fastestWinElement = document.getElementById('fastestWin');
        
        // تنظیمات
        this.boardSize = document.getElementById('boardSize');
        this.moveTime = document.getElementById('moveTime');
        this.moveTimeValue = document.getElementById('moveTimeValue');
        this.soundEffects = document.getElementById('soundEffects');
        this.animations = document.getElementById('animations');
        this.showHintsCheck = document.getElementById('showHints');
        this.highlightMovesCheck = document.getElementById('highlightMoves');
    }

    bindEvents() {
        // سلول‌های بازی
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
            cell.addEventListener('mouseenter', () => this.handleCellHover(cell, true));
            cell.addEventListener('mouseleave', () => this.handleCellHover(cell, false));
        });

        // دکمه‌های کنترل
        this.newGameBtn.addEventListener('click', () => this.startNewGame(true));
        this.undoBtn.addEventListener('click', () => this.undoMove());
        this.redoBtn.addEventListener('click', () => this.redoMove());
        this.resetScoreBtn.addEventListener('click', () => this.resetScores());
        this.quickRestartBtn.addEventListener('click', () => this.startNewGame());
        this.hintBtn.addEventListener('click', () => this.showHint());

        // تغییر نوع بازیکن
        document.querySelectorAll('.change-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const player = e.currentTarget.dataset.player;
                this.togglePlayerType(player);
            });
        });

        // تغییر حالت بازی
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.gameMode = e.currentTarget.dataset.mode;
                
                if (this.gameMode !== 'pvp') {
                    this.difficulty = this.gameMode;
                    this.setPlayerType('O', 'ai');
                    
                    if (this.currentPlayer === 'O' && this.gameActive) {
                        this.makeAIMove();
                    }
                } else {
                    this.setPlayerType('O', 'human');
                }
                
                this.updateStatus();
            });
        });

        // تنظیمات
        this.boardSize.addEventListener('change', (e) => {
            this.changeBoardSize(parseInt(e.target.value));
        });

        this.moveTime.addEventListener('input', (e) => {
            this.moveTimeLimit = parseInt(e.target.value);
            this.moveTimeValue.textContent = e.target.value;
            this.resetMoveTimer();
        });

        this.soundEffects.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });

        this.animations.addEventListener('change', (e) => {
            this.animationsEnabled = e.target.checked;
        });

        this.showHintsCheck.addEventListener('change', (e) => {
            this.showHints = e.target.checked;
        });

        this.highlightMovesCheck.addEventListener('change', (e) => {
            this.highlightMoves = e.target.checked;
        });

        // کلیدهای میانبر
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.startNewGame(true);
            if (e.key === 'z' && e.ctrlKey) this.undoMove();
            if (e.key === 'y' && e.ctrlKey) this.redoMove();
            if (e.key === 'h' && e.ctrlKey) this.showHint();
        });
    }

    handleCellClick(cell) {
        if (!this.gameActive) return;
        
        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] !== null) {
            this.playSound('error');
            this.shakeCell(cell);
            return;
        }

        this.makeMove(index, this.currentPlayer);
    }

    handleCellHover(cell, isEntering) {
        if (!this.gameActive || !this.highlightMoves) return;
        
        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] === null) {
            if (isEntering) {
                cell.classList.add('cell-placeholder');
                cell.textContent = this.currentPlayer;
                cell.style.color = this.currentPlayer === 'X' ? '#ef4444' : '#3b82f6';
                cell.style.opacity = '0.3';
            } else {
                cell.classList.remove('cell-placeholder');
                cell.textContent = '';
                cell.style.opacity = '1';
            }
        }
    }

    makeMove(index, player) {
        this.playSound('click');
        
        // ذخیره حرکت در تاریخچه
        this.movesHistory.push({
            board: [...this.board],
            player: this.currentPlayer,
            index: index,
            timestamp: Date.now()
        });
        
        this.redoHistory = [];
        this.updateControlButtons();
        
        // اعمال حرکت
        this.board[index] = player;
        this.updateBoard();
        
        // اضافه کردن به تاریخچه حرکات
        this.addToMoveHistory(index, player);
        
        // بررسی برنده
        const winResult = this.checkWinner();
        
        if (winResult) {
            this.handleWin(winResult);
            return;
        }
        
        // بررسی تساوی
        if (this.board.every(cell => cell !== null)) {
            this.handleDraw();
            return;
        }
        
        // تغییر بازیکن
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnIndicators();
        this.updateStatus();
        
        // حرکت هوش مصنوعی
        if (this.isAIPlayer() && this.gameActive) {
            this.showAIThinking();
            setTimeout(() => this.makeAIMove(), 1000);
        }
        
        // ریست تایمر حرکت
        this.resetMoveTimer();
    }

    makeAIMove() {
        if (!this.gameActive) return;
        
        let index;
        
        switch(this.difficulty) {
            case 'easy':
                index = this.getRandomMove();
                break;
            case 'medium':
                index = this.getMediumMove();
                break;
            case 'hard':
                index = this.getBestMove();
                break;
            default:
                index = this.getRandomMove();
        }
        
        this.hideAIThinking();
        this.makeMove(index, this.currentPlayer);
    }

    getRandomMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === null ? index : null)
            .filter(index => index !== null);
        
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    getMediumMove() {
        // ابتدا سعی می‌کند برنده شود
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                if (this.checkWinner() && this.checkWinner().player === 'O') {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // سپس سعی می‌کند از برد حریف جلوگیری کند
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'X';
                if (this.checkWinner() && this.checkWinner().player === 'X') {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // در غیر این صورت حرکت تصادفی انجام می‌دهد
        return this.getRandomMove();
    }

    getBestMove() {
        // الگوریتم Minimax برای بهترین حرکت
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        const result = this.checkWinner();
        
        if (result) {
            if (result.player === 'O') return 10 - depth;
            if (result.player === 'X') return depth - 10;
        }
        
        if (board.every(cell => cell !== null)) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // ردیف‌ها
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // ستون‌ها
            [0, 4, 8], [2, 4, 6]             // قطرها
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                
                return {
                    player: this.board[a],
                    pattern: pattern,
                    cells: [a, b, c]
                };
            }
        }
        
        return null;
    }

    handleWin(winResult) {
        this.gameActive = false;
        this.stopTimer();
        
        // نمایش خط برنده
        this.showWinLine(winResult.pattern);
        
        // هایلایت سلول‌های برنده
        winResult.cells.forEach(index => {
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            cell.classList.add('win-cell');
        });
        
        // بروزرسانی آمار
        this.updateStats(winResult.player, true);
        
        // نمایش مودال برنده
        const movesCount = this.movesHistory.filter(move => move.player === winResult.player).length + 1;
        const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        if (typeof window.showWinner === 'function') {
            window.showWinner(winResult.player, movesCount, gameTime);
        }
        
        // پخش صدا
        this.playSound('win');
        
        // ایجاد کنفتی
        if (typeof window.createConfetti === 'function') {
            window.createConfetti(100);
        }
    }

    handleDraw() {
        this.gameActive = false;
        this.stopTimer();
        
        // انیمیشن تساوی
        this.cells.forEach(cell => {
            cell.classList.add('draw-animation');
        });
        
        // بروزرسانی آمار
        this.updateStats(null, false);
        
        // نمایش مودال تساوی
        if (typeof window.showDraw === 'function') {
            window.showDraw();
        }
        
        // پخش صدا
        this.playSound('draw');
    }

    showWinLine(pattern) {
        const boardRect = this.gameBoard.getBoundingClientRect();
        const cellSize = boardRect.width / 3;
        
        let line;
        
        if (pattern[0] === 0 && pattern[2] === 2) { // ردیف بالا
            line = this.createWinLine(
                cellSize / 2,
                cellSize / 2,
                boardRect.width - cellSize / 2,
                cellSize / 2,
                'horizontal'
            );
        } else if (pattern[0] === 3 && pattern[2] === 5) { // ردیف وسط
            line = this.createWinLine(
                cellSize / 2,
                cellSize * 1.5,
                boardRect.width - cellSize / 2,
                cellSize * 1.5,
                'horizontal'
            );
        } else if (pattern[0] === 6 && pattern[2] === 8) { // ردیف پایین
            line = this.createWinLine(
                cellSize / 2,
                cellSize * 2.5,
                boardRect.width - cellSize / 2,
                cellSize * 2.5,
                'horizontal'
            );
        } else if (pattern[0] === 0 && pattern[2] === 6) { // ستون چپ
            line = this.createWinLine(
                cellSize / 2,
                cellSize / 2,
                cellSize / 2,
                boardRect.height - cellSize / 2,
                'vertical'
            );
        } else if (pattern[0] === 1 && pattern[2] === 7) { // ستون وسط
            line = this.createWinLine(
                cellSize * 1.5,
                cellSize / 2,
                cellSize * 1.5,
                boardRect.height - cellSize / 2,
                'vertical'
            );
        } else if (pattern[0] === 2 && pattern[2] === 8) { // ستون راست
            line = this.createWinLine(
                cellSize * 2.5,
                cellSize / 2,
                cellSize * 2.5,
                boardRect.height - cellSize / 2,
                'vertical'
            );
        } else if (pattern[0] === 0 && pattern[2] === 8) { // قطر اصلی
            line = this.createWinLine(
                cellSize / 2,
                cellSize / 2,
                boardRect.width - cellSize / 2,
                boardRect.height - cellSize / 2,
                'diagonal'
            );
        } else if (pattern[0] === 2 && pattern[2] === 6) { // قطر فرعی
            line = this.createWinLine(
                boardRect.width - cellSize / 2,
                cellSize / 2,
                cellSize / 2,
                boardRect.height - cellSize / 2,
                'diagonal'
            );
        }
        
        if (line) {
            this.winLines.appendChild(line);
        }
    }

    createWinLine(x1, y1, x2, y2, type) {
        const line = document.createElement('div');
        line.classList.add('win-line');
        
        if (type === 'horizontal') {
            line.style.width = `${Math.abs(x2 - x1)}px`;
            line.style.height = '8px';
            line.style.top = `${y1 - 4}px`;
            line.style.left = `${Math.min(x1, x2)}px`;
        } else if (type === 'vertical') {
            line.style.width = '8px';
            line.style.height = `${Math.abs(y2 - y1)}px`;
            line.style.top = `${Math.min(y1, y2)}px`;
            line.style.left = `${x1 - 4}px`;
        } else if (type === 'diagonal') {
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            line.style.width = `${length}px`;
            line.style.height = '8px';
            line.style.top = `${y1 - 4}px`;
            line.style.left = `${x1}px`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.transformOrigin = '0 0';
        }
        
        return line;
    }

    updateBoard() {
        this.cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
            cell.className = 'cell';
            
            if (this.board[index] === 'X') {
                cell.classList.add('x');
            } else if (this.board[index] === 'O') {
                cell.classList.add('o');
            }
        });
    }

    updateStatus() {
        if (!this.gameActive) return;
        
        const playerName = this.currentPlayer === 'X' ? 'بازیکن X' : 'بازیکن O';
        const playerType = this.getPlayerType(this.currentPlayer);
        
        if (playerType === 'ai') {
            this.statusText.textContent = `نوبت هوش مصنوعی (${playerName}) است...`;
        } else {
            this.statusText.textContent = `نوبت ${playerName} است`;
        }
    }

    updateTurnIndicators() {
        if (this.currentPlayer === 'X') {
            this.xTurnIndicator.classList.add('current-turn');
            this.oTurnIndicator.classList.remove('current-turn');
            
            this.playerXCard.classList.add('active-player');
            this.playerOCard.classList.remove('active-player');
        } else {
            this.xTurnIndicator.classList.remove('current-turn');
            this.oTurnIndicator.classList.add('current-turn');
            
            this.playerXCard.classList.remove('active-player');
            this.playerOCard.classList.add('active-player');
        }
    }

    showAIThinking() {
        if (this.currentPlayer === 'X') {
            this.xThinking.style.display = 'flex';
            this.xTurnIndicator.style.display = 'none';
        } else {
            this.oThinking.style.display = 'flex';
            this.oTurnIndicator.style.display = 'none';
        }
    }

    hideAIThinking() {
        this.xThinking.style.display = 'none';
        this.oThinking.style.display = 'none';
        
        this.xTurnIndicator.style.display = 'flex';
        this.oTurnIndicator.style.display = 'flex';
    }

    updateStats(winner, isWin) {
        // بروزرسانی آمار بازیکنان
        if (isWin) {
            this.scores[winner].wins++;
            this.scores[winner].score += 10;
            
            // بروزرسانی رکورد برد متوالی
            if (winner === this.getLastWinner()) {
                this.winStreak++;
            } else {
                this.winStreak = 1;
            }
            
            // بروزرسانی سریع‌ترین برد
            const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
            if (!this.fastestWin || gameTime < this.fastestWin) {
                this.fastestWin = gameTime;
                this.fastestWinElement.textContent = `${gameTime} ثانیه`;
            }
            
            this.setLastWinner(winner);
        }
        
        this.scores.X.games++;
        this.scores.O.games++;
        
        this.totalGames++;
        
        if (!isWin) {
            this.totalDraws++;
        }
        
        // ذخیره آمار در localStorage
        this.saveStats();
        
        // بروزرسانی UI
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        this.playerXScore.textContent = this.scores.X.score;
        this.playerXWins.textContent = this.scores.X.wins;
        this.playerXGames.textContent = this.scores.X.games;
        
        this.playerOScore.textContent = this.scores.O.score;
        this.playerOWins.textContent = this.scores.O.wins;
        this.playerOGames.textContent = this.scores.O.games;
        
        this.totalGamesElement.textContent = this.totalGames;
        this.totalDrawsElement.textContent = this.totalDraws;
        this.winStreakElement.textContent = this.winStreak;
        
        // محاسبه زمان کل بازی
        const totalMinutes = Math.floor(this.totalGames * 2); // تخمینی
        this.totalTimeElement.textContent = totalMinutes;
        
        // انیمیشن بروزرسانی امتیاز
        if (this.animationsEnabled) {
            this.playerXScore.classList.add('score-updated');
            this.playerOScore.classList.add('score-updated');
            
            setTimeout(() => {
                this.playerXScore.classList.remove('score-updated');
                this.playerOScore.classList.remove('score-updated');
            }, 500);
        }
    }

    addToMoveHistory(index, player) {
        const moveItem = document.createElement('div');
        moveItem.classList.add('move-item');
        
        const row = Math.floor(index / 3) + 1;
        const col = (index % 3) + 1;
        
        moveItem.innerHTML = `
            <span>${player === 'X' ? '❌' : '⭕'} حرکت ${player}</span>
            <span>ردیف ${row}, ستون ${col}</span>
        `;
        
        const emptyMoves = this.movesList.querySelector('.empty-moves');
        if (emptyMoves) {
            emptyMoves.remove();
        }
        
        this.movesList.appendChild(moveItem);
        this.movesList.scrollTop = this.movesList.scrollHeight;
    }

    showHint() {
        if (!this.gameActive || !this.showHints) return;
        
        this.playSound('click');
        
        // پیدا کردن بهترین حرکت برای راهنمایی
        let hintIndex;
        
        if (this.currentPlayer === 'X') {
            // برای بازیکن انسانی
            hintIndex = this.getBestMoveForPlayer('X');
        } else {
            // برای هوش مصنوعی یا بازیکن دوم
            hintIndex = this.getBestMoveForPlayer('O');
        }
        
        if (hintIndex !== null) {
            const cell = document.querySelector(`.cell[data-index="${hintIndex}"]`);
            const hintText = document.getElementById('hintText');
            
            // فلش سلول
            if (this.animationsEnabled) {
                cell.classList.add('hint-flash');
                hintText.classList.add('hint-flash');
                
                setTimeout(() => {
                    cell.classList.remove('hint-flash');
                }, 3000);
                
                setTimeout(() => {
                    hintText.classList.remove('hint-flash');
                }, 3000);
            }
            
            // به‌روزرسانی متن راهنمایی
            const row = Math.floor(hintIndex / 3) + 1;
            const col = (hintIndex % 3) + 1;
            hintText.textContent = `حرکت خود را در ردیف ${row}, ستون ${col} انجام دهید`;
        }
    }

    getBestMoveForPlayer(player) {
        // اولویت‌های استراتژیک
        const priorities = [4, 0, 2, 6, 8, 1, 3, 5, 7]; // مرکز، گوشه‌ها، سپس لبه‌ها
        
        // اول: برنده شو
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === null) {
                this.board[i] = player;
                if (this.checkWinner() && this.checkWinner().player === player) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // دوم: از برد حریف جلوگیری کن
        const opponent = player === 'X' ? 'O' : 'X';
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === null) {
                this.board[i] = opponent;
                if (this.checkWinner() && this.checkWinner().player === opponent) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // سوم: بر اساس اولویت‌ها حرکت کن
        for (const index of priorities) {
            if (this.board[index] === null) {
                return index;
            }
        }
        
        // چهارم: هر حرکت خالی
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === null) {
                return i;
            }
        }
        
        return null;
    }

    undoMove() {
        if (this.movesHistory.length === 0) return;
        
        this.playSound('click');
        
        const lastMove = this.movesHistory.pop();
        this.redoHistory.push({
            board: [...this.board],
            player: this.currentPlayer
        });
        
        // بازگرداندن وضعیت قبلی
        this.board = lastMove.board;
        this.currentPlayer = lastMove.player;
        this.gameActive = true;
        
        this.updateBoard();
        this.updateTurnIndicators();
        this.updateStatus();
        this.updateControlButtons();
        
        // پاک کردن خطوط برنده
        this.winLines.innerHTML = '';
        
        // پاک کردن انیمیشن‌ها
        this.cells.forEach(cell => {
            cell.classList.remove('win-cell', 'draw-animation');
        });
        
        // حذف آخرین حرکت از تاریخچه
        const moveItems = this.movesList.querySelectorAll('.move-item');
        if (moveItems.length > 0) {
            moveItems[moveItems.length - 1].remove();
        }
        
        if (this.movesList.children.length === 0) {
            const emptyMoves = document.createElement('div');
            emptyMoves.className = 'empty-moves';
            emptyMoves.textContent = 'هنوز حرکتی انجام نشده';
            this.movesList.appendChild(emptyMoves);
        }
        
        // اگر هوش مصنوعی بود، حرکت آن را هم بازگردان
        if (this.isAIPlayer() && this.currentPlayer === 'O') {
            this.undoMove();
        }
    }

    redoMove() {
        if (this.redoHistory.length === 0) return;
        
        this.playSound('click');
        
        const nextMove = this.redoHistory.pop();
        this.movesHistory.push({
            board: [...this.board],
            player: this.currentPlayer
        });
        
        // اعمال حرکت بعدی
        this.board = nextMove.board;
        this.currentPlayer = nextMove.player === 'X' ? 'O' : 'X';
        
        this.updateBoard();
        this.updateTurnIndicators();
        this.updateStatus();
        this.updateControlButtons();
    }

    updateControlButtons() {
        this.undoBtn.disabled = this.movesHistory.length === 0;
        this.redoBtn.disabled = this.redoHistory.length === 0;
    }

    startNewGame(resetBoard = false) {
        this.playSound('click');
        
        // ریست تخته
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.movesHistory = [];
        this.redoHistory = [];
        
        this.updateBoard();
        this.updateTurnIndicators();
        this.updateStatus();
        this.updateControlButtons();
        
        // پاک کردن خطوط برنده و انیمیشن‌ها
        this.winLines.innerHTML = '';
        this.cells.forEach(cell => {
            cell.classList.remove('win-cell', 'draw-animation');
        });
        
        // پاک کردن تاریخچه حرکات
        this.movesList.innerHTML = '<div class="empty-moves">هنوز حرکتی انجام نشده</div>';
        
        // ریست تایمر
        this.startTimer();
        this.resetMoveTimer();
        
        // اگر هوش مصنوعی باشد و شروع کننده O باشد
        if (this.isAIPlayer() && this.currentPlayer === 'O') {
            this.showAIThinking();
            setTimeout(() => this.makeAIMove(), 1000);
        }
        
        // اگر ریست کامل بخواهیم
        if (resetBoard) {
            this.hideAIThinking();
        }
    }

    resetScores() {
        if (confirm('آیا از ریست کردن تمام آمار و امتیازها مطمئن هستید؟')) {
            this.scores = {
                X: { wins: 0, games: 0, score: 0 },
                O: { wins: 0, games: 0, score: 0 }
            };
            
            this.totalGames = 0;
            this.totalDraws = 0;
            this.winStreak = 0;
            this.fastestWin = null;
            
            this.saveStats();
            this.updateScoreDisplay();
            
            this.playSound('click');
        }
    }

    changeBoardSize(size) {
        if (size !== 3) {
            if (confirm(`آیا مایلید تخته بازی را به ${size}×${size} تغییر دهید؟`)) {
                // در این نسخه فقط اندازه ۳×۳ پشتیبانی می‌شود
                alert('این قابلیت در نسخه فعلی در دسترس نیست. به زودی اضافه خواهد شد.');
            }
        }
    }

    togglePlayerType(player) {
        const currentType = this.getPlayerType(player);
        const newType = currentType === 'human' ? 'ai' : 'human';
        
        this.setPlayerType(player, newType);
        this.updatePlayerTypeDisplay(player, newType);
        
        // اگر بازیکن فعلی هوش مصنوعی شد و نوبت اوست
        if (newType === 'ai' && this.currentPlayer === player && this.gameActive) {
            this.showAIThinking();
            setTimeout(() => this.makeAIMove(), 1000);
        }
    }

    getPlayerType(player) {
        return localStorage.getItem(`player_${player}_type`) || 'human';
    }

    setPlayerType(player, type) {
        localStorage.setItem(`player_${player}_type`, type);
    }

    updatePlayerTypeDisplay(player, type) {
        const badge = document.querySelector(`.player-${player.toLowerCase()}-card .player-type-badge`);
        const button = document.querySelector(`.player-${player.toLowerCase()}-card .change-type-btn i`);
        
        if (type === 'human') {
            badge.textContent = 'انسان';
            badge.className = 'player-type-badge human';
            button.style.transform = 'rotate(0deg)';
        } else {
            badge.textContent = 'هوش مصنوعی';
            badge.className = 'player-type-badge ai';
            button.style.transform = 'rotate(180deg)';
        }
    }

    isAIPlayer() {
        return this.getPlayerType(this.currentPlayer) === 'ai' || this.gameMode !== 'pvp';
    }

    getLastWinner() {
        return localStorage.getItem('last_winner');
    }

    setLastWinner(winner) {
        localStorage.setItem('last_winner', winner);
    }

    playSound(soundType) {
        if (!this.soundEnabled) return;
        
        let sound;
        switch(soundType) {
            case 'click':
                sound = this.clickSound;
                sound.volume = 0.3;
                break;
            case 'win':
                sound = this.winSound;
                sound.volume = 0.5;
                break;
            case 'draw':
                sound = this.drawSound;
                sound.volume = 0.4;
                break;
            case 'error':
                sound = this.errorSound;
                sound.volume = 0.3;
                break;
        }
        
        sound.currentTime = 0;
        sound.play().catch(e => console.log("صدا پخش نشد:", e));
    }

    shakeCell(cell) {
        if (!this.animationsEnabled) return;
        
        cell.style.animation = 'none';
        setTimeout(() => {
            cell.style.animation = 'shake 0.5s ease';
        }, 10);
    }

    startTimer() {
        this.gameStartTime = Date.now();
        
        if (typeof window.startTimer === 'function') {
            window.startTimer();
        }
    }

    stopTimer() {
        if (typeof window.stopTimer === 'function') {
            window.stopTimer();
        }
    }

    resetMoveTimer() {
        if (this.moveTimer) {
            clearTimeout(this.moveTimer);
        }
        
        if (this.moveTimeLimit > 0) {
            this.moveTimer = setTimeout(() => {
                if (this.gameActive) {
                    // زمان حرکت تمام شد
                    this.playSound('error');
                    
                    // اگر بازیکن انسانی است، حرکت تصادفی انجام می‌دهد
                    if (this.getPlayerType(this.currentPlayer) === 'human') {
                        const emptyCells = this.board
                            .map((cell, index) => cell === null ? index : null)
                            .filter(index => index !== null);
                        
                        if (emptyCells.length > 0) {
                            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                            this.makeMove(randomIndex, this.currentPlayer);
                        }
                    }
                }
            }, this.moveTimeLimit * 1000);
        }
    }

    saveStats() {
        const stats = {
            scores: this.scores,
            totalGames: this.totalGames,
            totalDraws: this.totalDraws,
            winStreak: this.winStreak,
            fastestWin: this.fastestWin
        };
        
        localStorage.setItem('tic_tac_toe_stats', JSON.stringify(stats));
    }

    loadStats() {
        const savedStats = localStorage.getItem('tic_tac_toe_stats');
        
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            
            this.scores = stats.scores || this.scores;
            this.totalGames = stats.totalGames || 0;
            this.totalDraws = stats.totalDraws || 0;
            this.winStreak = stats.winStreak || 0;
            this.fastestWin = stats.fastestWin || null;
        }
        
        // بارگذاری نوع بازیکنان
        this.updatePlayerTypeDisplay('X', this.getPlayerType('X'));
        this.updatePlayerTypeDisplay('O', this.getPlayerType('O'));
    }

    updateUI() {
        this.updateScoreDisplay();
        this.updateTurnIndicators();
        this.updateStatus();
        this.updateControlButtons();
    }
}

// شروع بازی وقتی صفحه لود شد
document.addEventListener('DOMContentLoaded', () => {
    window.ticTacToeGame = new TicTacToeGame();
    
    // اضافه کردن استایل shake
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
});
