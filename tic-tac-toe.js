// tic-tac-toe.js - منطق کامل بازی دوز

// متغیرهای اصلی بازی
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp'; // pvp, easy, medium, hard
        this.scores = { X: 0, O: 0, draws: 0 };
        this.history = [];
        this.redoStack = [];
        this.moveHistory = [];
        this.startTime = null;
        this.timer = null;
        this.soundEnabled = true;
        this.animationsEnabled = true;
        
        // حالت‌های هوش مصنوعی
        this.aiLevels = {
            easy: this.aiEasy.bind(this),
            medium: this.aiMedium.bind(this),
            hard: this.aiHard.bind(this)
        };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadFromStorage();
        this.updateDisplay();
        this.startTimer();
        
        // اگر حالت هوش مصنوعی باشد و نوبت کامپیوتر است
        if (this.gameMode !== 'pvp' && this.currentPlayer === 'O') {
            setTimeout(() => this.aiMove(), 500);
        }
    }
    
    cacheElements() {
        // سلول‌های بازی
        this.cells = document.querySelectorAll('.cell');
        
        // عناصر اطلاعات بازی
        this.statusText = document.getElementById('statusText');
        this.playerXScore = document.getElementById('playerXScore');
        this.playerOScore = document.getElementById('playerOScore');
        this.playerXWins = document.getElementById('playerXWins');
        this.playerOWins = document.getElementById('playerOWins');
        this.playerXGames = document.getElementById('playerXGames');
        this.playerOGames = document.getElementById('playerOGames');
        this.totalGames = document.getElementById('totalGames');
        this.totalDraws = document.getElementById('totalDraws');
        this.totalTime = document.getElementById('totalTime');
        this.winStreak = document.getElementById('winStreak');
        this.fastestWin = document.getElementById('fastestWin');
        
        // دکمه‌ها
        this.newGameBtn = document.getElementById('newGameBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        this.resetScoreBtn = document.getElementById('resetScoreBtn');
        this.quickRestartBtn = document.getElementById('quickRestartBtn');
        this.hintBtn = document.getElementById('hintBtn');
        
        // کارت بازیکنان
        this.playerXCard = document.getElementById('playerXCard');
        this.playerOCard = document.getElementById('playerOCard');
        this.xTurnIndicator = document.getElementById('xTurnIndicator');
        this.oTurnIndicator = document.getElementById('oTurnIndicator');
        this.xThinking = document.getElementById('xThinking');
        this.oThinking = document.getElementById('oThinking');
        
        // لیست حرکات
        this.movesList = document.getElementById('movesList');
        
        // تایمر
        this.gameTimer = document.getElementById('gameTimer');
    }
    
    bindEvents() {
        // کلیک روی سلول‌ها
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
        
        // دکمه‌های کنترل
        this.newGameBtn.addEventListener('click', () => this.startNewGame(true));
        this.undoBtn.addEventListener('click', () => this.undoMove());
        this.redoBtn.addEventListener('click', () => this.redoMove());
        this.resetScoreBtn.addEventListener('click', () => this.resetScore());
        this.quickRestartBtn.addEventListener('click', () => this.startNewGame());
        this.hintBtn.addEventListener('click', () => this.showHint());
        
        // تغییر حالت بازی
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeGameMode(e.target.dataset.mode));
        });
        
        // تغییر نوع بازیکن
        document.querySelectorAll('.change-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const player = e.target.closest('button').dataset.player;
                this.togglePlayerType(player);
            });
        });
    }
    
    handleCellClick(cell) {
        if (!this.gameActive) return;
        
        const index = parseInt(cell.dataset.index);
        
        // بررسی پر نبودن سلول
        if (this.board[index] !== '') {
            this.playSound('error');
            return;
        }
        
        // ثبت حرکت
        this.makeMove(index);
        
        // پخش صدا
        this.playSound('click');
    }
    
    makeMove(index) {
        // ذخیره حالت فعلی برای undo
        this.history.push({
            board: [...this.board],
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive
        });
        this.redoStack = [];
        
        // اعمال حرکت
        this.board[index] = this.currentPlayer;
        this.cells[index].textContent = this.currentPlayer;
        this.cells[index].classList.add(this.currentPlayer.toLowerCase());
        
        // اضافه کردن به تاریخچه حرکات
        this.addToMoveHistory(index);
        
        // بررسی وضعیت بازی
        const gameResult = this.checkGameResult();
        
        if (gameResult) {
            this.handleGameResult(gameResult);
        } else {
            // تغییر نوبت
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateDisplay();
            
            // اگر حالت هوش مصنوعی است و نوبت کامپیوتر است
            if (this.gameMode !== 'pvp' && this.currentPlayer === 'O' && this.gameActive) {
                this.showAIIndicator();
                setTimeout(() => this.aiMove(), 1000);
            }
        }
        
        this.updateControls();
    }
    
    checkGameResult() {
        // الگوهای برد
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // ردیف‌ها
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // ستون‌ها
            [0, 4, 8], [2, 4, 6]             // قطرها
        ];
        
        // بررسی برنده
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                return {
                    winner: this.board[a],
                    pattern: pattern,
                    type: 'win'
                };
            }
        }
        
        // بررسی تساوی
        if (!this.board.includes('')) {
            return {
                winner: null,
                type: 'draw'
            };
        }
        
        return null;
    }
    
    handleGameResult(result) {
        this.gameActive = false;
        this.stopTimer();
        
        if (result.type === 'win') {
            // نمایش خط برنده
            this.showWinLine(result.pattern);
            
            // برجسته کردن سلول‌های برنده
            result.pattern.forEach(index => {
                this.cells[index].classList.add('win-cell');
            });
            
            // به‌روزرسانی امتیازات
            this.scores[result.winner]++;
            
            // نمایش مودال برنده
            setTimeout(() => {
                if (typeof window.showWinner === 'function') {
                    window.showWinner(
                        result.winner, 
                        this.moveHistory.length,
                        Math.floor((Date.now() - this.startTime) / 1000)
                    );
                }
                this.playSound('win');
            }, 1000);
            
        } else if (result.type === 'draw') {
            // نمایش مودال تساوی
            setTimeout(() => {
                if (typeof window.showDraw === 'function') {
                    window.showDraw();
                }
                this.playSound('draw');
                this.scores.draws++;
            }, 500);
        }
        
        this.saveToStorage();
        this.updateDisplay();
    }
    
    showWinLine(pattern) {
        // حذف خطوط قبلی
        document.getElementById('winLines').innerHTML = '';
        
        // تعیین نوع خط (افقی، عمودی یا مورب)
        const [a, b, c] = pattern;
        const line = document.createElement('div');
        line.classList.add('win-line');
        
        // محاسبات موقعیت خط
        const cellSize = 166; // اندازه هر سلول
        const gap = 10;
        
        if (pattern[0] % 3 === 0 && pattern[1] % 3 === 1 && pattern[2] % 3 === 2) {
            // خط افقی
            const row = Math.floor(a / 3);
            line.style.width = 'calc(100% - 40px)';
            line.style.height = '8px';
            line.style.top = `${(row * cellSize) + (row * gap) + cellSize/2 - 4}px`;
            line.style.left = '20px';
        } else if (pattern[0] < 3 && pattern[1] < 6 && pattern[2] < 9) {
            // خط عمودی
            const col = a % 3;
            line.style.width = '8px';
            line.style.height = 'calc(100% - 40px)';
            line.style.left = `${(col * cellSize) + (col * gap) + cellSize/2 - 4}px`;
            line.style.top = '20px';
        } else if (pattern[0] === 0 && pattern[1] === 4 && pattern[2] === 8) {
            // خط مورب چپ به راست
            line.style.width = 'calc(141% - 40px)';
            line.style.height = '8px';
            line.style.top = 'calc(50% - 4px)';
            line.style.left = '20px';
            line.style.transform = 'rotate(45deg)';
            line.style.transformOrigin = 'left center';
        } else if (pattern[0] === 2 && pattern[1] === 4 && pattern[2] === 6) {
            // خط مورب راست به چپ
            line.style.width = 'calc(141% - 40px)';
            line.style.height = '8px';
            line.style.top = 'calc(50% - 4px)';
            line.style.right = '20px';
            line.style.transform = 'rotate(-45deg)';
            line.style.transformOrigin = 'right center';
        }
        
        document.getElementById('winLines').appendChild(line);
    }
    
    addToMoveHistory(index) {
        const moveNumber = this.moveHistory.length + 1;
        const player = this.currentPlayer;
        const row = Math.floor(index / 3) + 1;
        const col = (index % 3) + 1;
        
        this.moveHistory.push({ player, index, moveNumber });
        
        // به‌روزرسانی نمایش تاریخچه
        const moveItem = document.createElement('div');
        moveItem.classList.add('move-item');
        
        moveItem.innerHTML = `
            <div class="move-player ${player.toLowerCase()}">${player}</div>
            <span>حرکت ${moveNumber}:</span>
            <span>ردیف ${row}، ستون ${col}</span>
        `;
        
        // اگر لیست خالی است، حذف پیام خالی
        const emptyMoves = this.movesList.querySelector('.empty-moves');
        if (emptyMoves) {
            emptyMoves.remove();
        }
        
        this.movesList.prepend(moveItem);
        this.movesList.scrollTop = 0;
    }
    
    updateDisplay() {
        // به‌روزرسانی سلول‌ها
        this.cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
            cell.className = 'cell';
            if (this.board[index]) {
                cell.classList.add(this.board[index].toLowerCase());
            }
        });
        
        // به‌روزرسانی وضعیت
        if (this.gameActive) {
            this.statusText.textContent = `نوبت بازیکن ${this.currentPlayer} است`;
        }
        
        // به‌روزرسانی امتیازات
        this.playerXScore.textContent = this.scores.X;
        this.playerOScore.textContent = this.scores.O;
        this.playerXWins.textContent = this.scores.X;
        this.playerOWins.textContent = this.scores.O;
        this.playerXGames.textContent = this.scores.X + this.scores.draws;
        this.playerOGames.textContent = this.scores.O + this.scores.draws;
        this.totalGames.textContent = this.scores.X + this.scores.O + this.scores.draws;
        this.totalDraws.textContent = this.scores.draws;
        
        // به‌روزرسالی کارت بازیکنان
        if (this.currentPlayer === 'X') {
            this.playerXCard.classList.add('active-player');
            this.playerOCard.classList.remove('active-player');
            this.xTurnIndicator.style.display = 'flex';
            this.oTurnIndicator.style.display = 'none';
        } else {
            this.playerXCard.classList.remove('active-player');
            this.playerOCard.classList.add('active-player');
            this.xTurnIndicator.style.display = 'none';
            this.oTurnIndicator.style.display = 'flex';
        }
    }
    
    updateControls() {
        // فعال/غیرفعال کردن دکمه‌های undo/redo
        this.undoBtn.disabled = this.history.length === 0;
        this.redoBtn.disabled = this.redoStack.length === 0;
    }
    
    startNewGame(fullReset = false) {
        // ریست تخته
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.history = [];
        this.redoStack = [];
        this.moveHistory = [];
        
        // پاکسازی تاریخچه حرکات
        this.movesList.innerHTML = '<div class="empty-moves">هنوز حرکتی انجام نشده</div>';
        
        // پاکسازی خطوط برنده
        document.getElementById('winLines').innerHTML = '';
        
        // ریست تایمر
        this.startTimer();
        
        // اگر ریست کامل خواسته شده
        if (fullReset) {
            // می‌توانید حالت بازی را نیز ریست کنید
        }
        
        this.updateDisplay();
        this.updateControls();
        
        // پخش صدا
        this.playSound('click');
    }
    
    undoMove() {
        if (this.history.length === 0) return;
        
        // ذخیره حالت فعلی برای redo
        this.redoStack.push({
            board: [...this.board],
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive
        });
        
        // بازگرداندن به حالت قبلی
        const lastState = this.history.pop();
        this.board = lastState.board;
        this.currentPlayer = lastState.currentPlayer;
        this.gameActive = lastState.gameActive;
        
        // حذف آخرین حرکت از تاریخچه
        if (this.moveHistory.length > 0) {
            this.moveHistory.pop();
            const lastMove = this.movesList.querySelector('.move-item');
            if (lastMove) {
                lastMove.remove();
            }
            
            // اگر تاریخچه خالی شد
            if (this.movesList.children.length === 0) {
                this.movesList.innerHTML = '<div class="empty-moves">هنوز حرکتی انجام نشده</div>';
            }
        }
        
        // پاکسازی خطوط برنده
        document.getElementById('winLines').innerHTML = '';
        
        this.updateDisplay();
        this.updateControls();
        this.playSound('click');
    }
    
    redoMove() {
        if (this.redoStack.length === 0) return;
        
        // ذخیره حالت فعلی برای undo
        this.history.push({
            board: [...this.board],
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive
        });
        
        // اعمال حرکت بعدی
        const nextState = this.redoStack.pop();
        this.board = nextState.board;
        this.currentPlayer = nextState.currentPlayer;
        this.gameActive = nextState.gameActive;
        
        this.updateDisplay();
        this.updateControls();
        this.playSound('click');
    }
    
    resetScore() {
        if (!confirm('آیا مطمئن هستید که می‌خواهید تمام امتیازات را ریست کنید؟')) {
            return;
        }
        
        this.scores = { X: 0, O: 0, draws: 0 };
        localStorage.removeItem('ticTacToeScores');
        this.updateDisplay();
        this.playSound('click');
    }
    
    showHint() {
        if (!this.gameActive) return;
        
        // پیدا کردن بهترین حرکت
        const bestMove = this.getBestHint();
        
        if (bestMove !== -1) {
            // هایلایت کردن سلول پیشنهادی
            this.cells[bestMove].classList.add('cell-placeholder');
            
            // نمایش پیام راهنمایی
            const row = Math.floor(bestMove / 3) + 1;
            const col = (bestMove % 3) + 1;
            const hintText = document.getElementById('hintText');
            hintText.textContent = `حرکت بعدی خود را در ردیف ${row}، ستون ${col} انجام دهید`;
            
            // حذف هایلایت بعد از 3 ثانیه
            setTimeout(() => {
                this.cells[bestMove].classList.remove('cell-placeholder');
            }, 3000);
        }
        
        this.playSound('click');
    }
    
    getBestHint() {
        // ابتدا سعی می‌کند برنده شود
        let move = this.getWinningMove(this.currentPlayer);
        if (move !== -1) return move;
        
        // سپس سعی می‌کند از برد حریف جلوگیری کند
        move = this.getWinningMove(this.currentPlayer === 'X' ? 'O' : 'X');
        if (move !== -1) return move;
        
        // اگر مرکز خالی است، آن را انتخاب می‌کند
        if (this.board[4] === '') return 4;
        
        // سپس گوشه‌های خالی
        const corners = [0, 2, 6, 8];
        const emptyCorners = corners.filter(i => this.board[i] === '');
        if (emptyCorners.length > 0) {
            return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
        }
        
        // در نهایت هر خانه خالی
        const emptyCells = this.board.map((cell, index) => cell === '' ? index : -1)
                                   .filter(index => index !== -1);
        if (emptyCells.length > 0) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        
        return -1;
    }
    
    getWinningMove(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            const cells = [this.board[a], this.board[b], this.board[c]];
            
            // اگر دو خانه از این سه خانه متعلق به بازیکن باشد و سومی خالی باشد
            const playerCount = cells.filter(cell => cell === player).length;
            const emptyCount = cells.filter(cell => cell === '').length;
            
            if (playerCount === 2 && emptyCount === 1) {
                // بازگشت خانه خالی
                if (this.board[a] === '') return a;
                if (this.board[b] === '') return b;
                if (this.board[c] === '') return c;
            }
        }
        
        return -1;
    }
    
    // منطق هوش مصنوعی
    aiMove() {
        if (!this.gameActive || this.gameMode === 'pvp') return;
        
        this.hideAIIndicator();
        
        // انتخاب سطح دشواری
        const aiFunction = this.aiLevels[this.gameMode];
        const move = aiFunction();
        
        if (move !== -1) {
            setTimeout(() => {
                this.makeMove(move);
            }, 500);
        }
    }
    
    aiEasy() {
        // حرکت تصادفی
        const emptyCells = this.board.map((cell, index) => cell === '' ? index : -1)
                                   .filter(index => index !== -1);
        if (emptyCells.length > 0) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        return -1;
    }
    
    aiMedium() {
        // 70% شانس استفاده از منطق هوشمند، 30% شانس حرکت تصادفی
        if (Math.random() < 0.7) {
            // ابتدا سعی در برد
            let move = this.getWinningMove('O');
            if (move !== -1) return move;
            
            // سپس جلوگیری از برد حریف
            move = this.getWinningMove('X');
            if (move !== -1) return move;
            
            // اگر مرکز خالی است
            if (this.board[4] === '') return 4;
            
            // گوشه‌های خالی
            const corners = [0, 2, 6, 8];
            const emptyCorners = corners.filter(i => this.board[i] === '');
            if (emptyCorners.length > 0) {
                return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
            }
        }
        
        // در غیر این صورت حرکت تصادفی
        return this.aiEasy();
    }
    
    aiHard() {
        // استفاده از الگوریتم Minimax
        return this.minimax(this.board, 'O').index;
    }
    
    minimax(board, player) {
        // بررسی وضعیت پایان بازی
        const result = this.checkGameResultForAI(board);
        if (result !== null) {
            return {
                score: result === 'O' ? 10 : result === 'X' ? -10 : 0
            };
        }
        
        // لیست حرکات ممکن
        const moves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                const move = {};
                move.index = i;
                
                // انجام حرکت
                board[i] = player;
                
                // محاسبه امتیاز با استفاده از بازگشت
                if (player === 'O') {
                    move.score = this.minimax(board, 'X').score;
                } else {
                    move.score = this.minimax(board, 'O').score;
                }
                
                // بازگرداندن حرکت
                board[i] = '';
                
                moves.push(move);
            }
        }
        
        // انتخاب بهترین حرکت
        let bestMove;
        if (player === 'O') {
            // ماکزیمم کردن امتیاز
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            // مینیمم کردن امتیاز
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        
        return moves[bestMove];
    }
    
    checkGameResultForAI(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        // بررسی تساوی
        if (!board.includes('')) {
            return 'draw';
        }
        
        return null;
    }
    
    showAIIndicator() {
        if (this.currentPlayer === 'O') {
            this.oThinking.style.display = 'flex';
            this.oTurnIndicator.style.display = 'none';
        } else {
            this.xThinking.style.display = 'flex';
            this.xTurnIndicator.style.display = 'none';
        }
    }
    
    hideAIIndicator() {
        this.xThinking.style.display = 'none';
        this.oThinking.style.display = 'none';
        if (this.currentPlayer === 'X') {
            this.xTurnIndicator.style.display = 'flex';
        } else {
            this.oTurnIndicator.style.display = 'flex';
        }
    }
    
    changeGameMode(mode) {
        this.gameMode = mode;
        
        // به‌روزرسانی دکمه‌های حالت
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        // شروع بازی جدید
        this.startNewGame();
    }
    
    togglePlayerType(player) {
        // در نسخه فعلی، فقط نوع بازیکن O می‌تواند تغییر کند
        if (player === 'o') {
            const badge = document.querySelector('.player-o-card .player-type-badge');
            const isHuman = badge.classList.contains('human');
            
            if (isHuman) {
                badge.textContent = 'هوش مصنوعی';
                badge.classList.remove('human');
                badge.classList.add('ai');
                this.gameMode = 'medium';
                this.changeGameMode('medium');
            } else {
                badge.textContent = 'انسان';
                badge.classList.remove('ai');
                badge.classList.add('human');
                this.gameMode = 'pvp';
                this.changeGameMode('pvp');
            }
        }
    }
    
    // مدیریت تایمر
    startTimer() {
        if (typeof window.startTimer === 'function') {
            window.startTimer();
        }
        this.startTime = Date.now();
    }
    
    stopTimer() {
        if (typeof window.stopTimer === 'function') {
            window.stopTimer();
        }
        
        // محاسبه و ذخیره زمان کل
        if (this.startTime) {
            const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
            const totalTime = parseInt(this.totalTime.textContent || '0');
            this.totalTime.textContent = totalTime + Math.floor(gameTime / 60);
        }
    }
    
    // مدیریت صدا
    playSound(type) {
        if (typeof window.playSound === 'function') {
            window.playSound(type);
        }
    }
    
    // ذخیره و بازیابی از localStorage
    saveToStorage() {
        const gameData = {
            scores: this.scores,
            gameMode: this.gameMode,
            totalTime: parseInt(this.totalTime.textContent || '0'),
            winStreak: parseInt(this.winStreak.textContent || '0'),
            fastestWin: this.fastestWin.textContent
        };
        
        localStorage.setItem('ticTacToeData', JSON.stringify(gameData));
    }
    
    loadFromStorage() {
        const savedData = localStorage.getItem('ticTacToeData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.scores = data.scores || { X: 0, O: 0, draws: 0 };
            this.gameMode = data.gameMode || 'pvp';
            
            // به‌روزرسانی نمایش
            this.totalTime.textContent = data.totalTime || '0';
            this.winStreak.textContent = data.winStreak || '0';
            this.fastestWin.textContent = data.fastestWin || '-';
            
            // به‌روزرسانی دکمه حالت بازی
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.mode === this.gameMode) {
                    btn.classList.add('active');
                }
            });
        }
    }
}

// شروع بازی وقتی صفحه لود شد
document.addEventListener('DOMContentLoaded', () => {
    window.game = new TicTacToeGame();
    
    // تعریف توابع عمومی برای دسترسی از خارج
    window.startNewGame = (fullReset = false) => {
        window.game.startNewGame(fullReset);
    };
    
    window.startTimer = () => {
        if (typeof window.startTimer === 'function') {
            window.startTimer();
        }
    };
    
    window.stopTimer = () => {
        if (typeof window.stopTimer === 'function') {
            window.stopTimer();
        }
    };
    
    window.resetTimer = () => {
        if (typeof window.resetTimer === 'function') {
            window.resetTimer();
        }
    };
});
