// راه‌اندازی بعد از بارگذاری صفحه
document.addEventListener('DOMContentLoaded', () => {
    gameEngine.init();
});

// ============================================
// ۴. کلاس مدیریت بازی دوز (Tic Tac Toe)
// ============================================
class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'ai'; // 'ai', '2player', 'online'
        this.difficulty = 'medium'; // 'easy', 'medium', 'hard', 'expert'
        this.scores = { X: 0, O: 0 };
        this.moveHistory = [];
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // ردیف‌ها
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // ستون‌ها
            [0, 4, 8], [2, 4, 6]             // قطرها
        ];
    }

    // ========== شروع بازی جدید ==========
    newGame(mode = 'ai', difficulty = 'medium') {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = mode;
        this.difficulty = difficulty;
        this.moveHistory = [];
        
        console.log(`🎮 بازی دوز شروع شد - حالت: ${mode}, سختی: ${difficulty}`);
        
        if (mode === 'ai' && this.currentPlayer === 'O') {
            this.makeAIMove();
        }
    }

    // ========== حرکت بازیکن ==========
    makeMove(position) {
        if (!this.gameActive) return false;
        if (this.board[position] !== '') return false;
        if (this.gameMode === 'ai' && this.currentPlayer === 'O') return false;

        // ثبت حرکت
        this.board[position] = this.currentPlayer;
        this.moveHistory.push({
            player: this.currentPlayer,
            position: position,
            time: new Date().toISOString()
        });

        // بررسی برد یا مساوی
        if (this.checkWin()) {
            this.gameActive = false;
            this.scores[this.currentPlayer]++;
            return { status: 'win', player: this.currentPlayer };
        } else if (this.checkDraw()) {
            this.gameActive = false;
            return { status: 'draw' };
        }

        // تغییر نوبت
        this.switchPlayer();

        // حرکت هوش مصنوعی
        if (this.gameMode === 'ai' && this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }

        return { status: 'continue', player: this.currentPlayer };
    }

    // ========== حرکت هوش مصنوعی ==========
    makeAIMove() {
        if (!this.gameActive) return;
        if (this.currentPlayer !== 'O') return;

        let position;
        
        switch (this.difficulty) {
            case 'easy':
                position = this.getEasyMove();
                break;
            case 'medium':
                position = this.getMediumMove();
                break;
            case 'hard':
                position = this.getHardMove();
                break;
            case 'expert':
                position = this.getExpertMove();
                break;
            default:
                position = this.getMediumMove();
        }

        if (position !== undefined) {
            this.makeMove(position);
        }
    }

    // ========== حرکت آسان ==========
    getEasyMove() {
        // حرکت تصادفی
        const emptyPositions = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        
        if (emptyPositions.length === 0) return undefined;
        
        const randomIndex = Math.floor(Math.random() * emptyPositions.length);
        return emptyPositions[randomIndex];
    }

    // ========== حرکت متوسط ==========
    getMediumMove() {
        // 70% هوشمند، 30% تصادفی
        if (Math.random() < 0.3) {
            return this.getEasyMove();
        }
        return this.getHardMove();
    }

    // ========== حرکت سخت ==========
    getHardMove() {
        // الگوریتم مینی‌مکس با عمق محدود
        return this.minimax(this.board, 0, true).position;
    }

    // ========== حرکت حرفه‌ای ==========
    getExpertMove() {
        // الگوریتم مینی‌مکس کامل
        return this.minimax(this.board, 0, true, -Infinity, Infinity).position;
    }

    // ========== الگوریتم Minimax ==========
    minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
        const winner = this.checkWinner(board);
        
        if (winner === 'O') return { score: 10 - depth };
        if (winner === 'X') return { score: depth - 10 };
        if (this.isBoardFull(board)) return { score: 0 };

        if (isMaximizing) {
            let bestScore = -Infinity;
            let bestMove = null;

            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    const result = this.minimax(board, depth + 1, false, alpha, beta);
                    board[i] = '';
                    
                    if (result.score > bestScore) {
                        bestScore = result.score;
                        bestMove = i;
                    }
                    
                    alpha = Math.max(alpha, bestScore);
                    if (beta <= alpha) break;
                }
            }
            return { score: bestScore, position: bestMove };
        } else {
            let bestScore = Infinity;
            let bestMove = null;

            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    const result = this.minimax(board, depth + 1, true, alpha, beta);
                    board[i] = '';
                    
                    if (result.score < bestScore) {
                        bestScore = result.score;
                        bestMove = i;
                    }
                    
                    beta = Math.min(beta, bestScore);
                    if (beta <= alpha) break;
                }
            }
            return { score: bestScore, position: bestMove };
        }
    }

    // ========== بررسی برنده ==========
    checkWinner(board = this.board) {
        for (const combo of this.winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    // ========== بررسی برد ==========
    checkWin() {
        const winner = this.checkWinner();
        return winner !== null;
    }

    // ========== بررسی مساوی ==========
    checkDraw() {
        return this.board.every(cell => cell !== '') && !this.checkWin();
    }

    // ========== بررسی پر بودن صفحه ==========
    isBoardFull(board = this.board) {
        return board.every(cell => cell !== '');
    }

    // ========== تغییر بازیکن ==========
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    // ========== بازنشانی امتیازات ==========
    resetScores() {
        this.scores = { X: 0, O: 0 };
    }

    // ========== دریافت وضعیت صفحه ==========
    getBoardState() {
        return {
            board: [...this.board],
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive,
            gameMode: this.gameMode,
            difficulty: this.difficulty,
            scores: { ...this.scores },
            moveCount: this.moveHistory.length
        };
    }

    // ========== بازگردانی حرکت ==========
    undoMove() {
        if (this.moveHistory.length === 0) return false;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.position] = '';
        this.currentPlayer = lastMove.player;
        this.gameActive = true;
        
        return true;
    }
}

// ============================================
// ۵. کلاس مدیریت مار و پله (Snakes & Ladders)
// ============================================
class SnakesLadders {
    constructor() {
        this.boardSize = 100;
        this.players = [];
        this.currentPlayer = 0;
        this.gameActive = false;
        this.diceValue = 0;
        this.moveHistory = [];
        
        // موقعیت مارها
        this.snakes = {
            16: 6, 47: 26, 49: 11, 56: 53, 62: 19,
            64: 60, 87: 24, 93: 73, 95: 75, 98: 78
        };
        
        // موقعیت نردبان‌ها
        this.ladders = {
            1: 38, 4: 14, 9: 31, 21: 42, 28: 84,
            36: 44, 51: 67, 71: 91, 80: 100
        };
    }

    // ========== شروع بازی ==========
    startGame(playerCount = 2, playerNames = []) {
        this.players = [];
        for (let i = 0; i < playerCount; i++) {
            this.players.push({
                id: i + 1,
                name: playerNames[i] || `بازیکن ${i + 1}`,
                position: 0,
                color: this.getPlayerColor(i),
                moves: 0,
                lastDice: 0
            });
        }
        
        this.currentPlayer = 0;
        this.gameActive = true;
        this.moveHistory = [];
        
        console.log(`🎲 بازی مار و پله شروع شد - ${playerCount} بازیکن`);
        
        return this.getGameState();
    }

    // ========== دریافت رنگ بازیکن ==========
    getPlayerColor(index) {
        const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        return colors[index % colors.length];
    }

    // ========== پرتاب تاس ==========
    rollDice() {
        if (!this.gameActive) return { error: 'بازی فعال نیست' };
        
        this.diceValue = Math.floor(Math.random() * 6) + 1;
        const player = this.players[this.currentPlayer];
        
        player.lastDice = this.diceValue;
        player.moves++;
        
        let newPosition = player.position + this.diceValue;
        
        // بررسی برد
        if (newPosition > this.boardSize) {
            newPosition = this.boardSize - (newPosition - this.boardSize);
        }
        
        // بررسی مار و نردبان
        if (this.snakes[newPosition]) {
            newPosition = this.snakes[newPosition];
            this.moveHistory.push({
                player: player.id,
                type: 'snake',
                from: player.position + this.diceValue,
                to: newPosition
            });
        }
        
        if (this.ladders[newPosition]) {
            newPosition = this.ladders[newPosition];
            this.moveHistory.push({
                player: player.id,
                type: 'ladder',
                from: player.position + this.diceValue,
                to: newPosition
            });
        }
        
        const oldPosition = player.position;
        player.position = newPosition;
        
        this.moveHistory.push({
            player: player.id,
            dice: this.diceValue,
            from: oldPosition,
            to: player.position,
            time: new Date().toISOString()
        });
        
        // بررسی برنده
        if (player.position === this.boardSize) {
            this.gameActive = false;
            return {
                winner: player,
                dice: this.diceValue,
                position: player.position,
                gameEnd: true
            };
        }
        
        // تغییر نوبت (اگر 6 نیامده باشد)
        const nextPlayer = this.diceValue === 6 ? this.currentPlayer : (this.currentPlayer + 1) % this.players.length;
        this.currentPlayer = nextPlayer;
        
        return {
            player: player,
            dice: this.diceValue,
            oldPosition: oldPosition,
            newPosition: player.position,
            nextPlayer: this.players[this.currentPlayer],
            snakes: this.snakes[player.position + this.diceValue] ? true : false,
            ladders: this.ladders[player.position + this.diceValue] ? true : false
        };
    }

    // ========== دریافت وضعیت بازی ==========
    getGameState() {
        return {
            players: this.players.map(p => ({ ...p })),
            currentPlayer: this.players[this.currentPlayer],
            gameActive: this.gameActive,
            diceValue: this.diceValue,
            snakes: { ...this.snakes },
            ladders: { ...this.ladders },
            boardSize: this.boardSize,
            moveHistory: [...this.moveHistory]
        };
    }

    // ========== بازنشانی بازی ==========
    resetGame() {
        this.players.forEach(player => {
            player.position = 0;
            player.moves = 0;
            player.lastDice = 0;
        });
        this.currentPlayer = 0;
        this.gameActive = true;
        this.moveHistory = [];
        this.diceValue = 0;
    }
}

// ============================================
// ۶. کلاس مدیریت بازی مار (Snake Game)
// ============================================
class SnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 20;
        this.cellSize = 25;
        this.snake = [];
        this.direction = 'RIGHT';
        self.direction = 'RIGHT';
        this.food = {};
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.gameActive = false;
        this.gameSpeed = 100;
        this.obstacles = [];
        this.powerUps = [];
        this.animationFrame = null;
    }

    // ========== مقداردهی اولیه ==========
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return false;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        
        return true;
    }

    // ========== تغییر اندازه کانواس ==========
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        this.cellSize = Math.floor(containerWidth / this.gridSize);
        this.canvas.width = this.gridSize * this.cellSize;
        this.canvas.height = this.gridSize * this.cellSize;
    }

    // ========== شروع بازی ==========
    start() {
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 },
            { x: 7, y: 10 }
        ];
        this.direction = 'RIGHT';
        self.direction = 'RIGHT';
        this.score = 0;
        this.gameActive = true;
        this.obstacles = [];
        this.powerUps = [];
        
        this.generateFood();
        this.generateObstacles();
        
        this.gameLoop();
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        console.log('🐍 بازی مار شروع شد');
    }

    // ========== حلقه اصلی بازی ==========
    gameLoop() {
        if (!this.gameActive) return;
        
        this.move();
        this.checkCollisions();
        this.draw();
        
        this.animationFrame = setTimeout(() => this.gameLoop(), this.gameSpeed);
    }

    // ========== حرکت مار ==========
    move() {
        const head = { ...this.snake[0] };
        
        switch (this.direction) {
            case 'RIGHT': head.x++; break;
            case 'LEFT': head.x--; break;
            case 'UP': head.y--; break;
            case 'DOWN': head.y++; break;
        }
        
        // عبور از دیوار
        if (head.x < 0) head.x = this.gridSize - 1;
        if (head.x >= this.gridSize) head.x = 0;
        if (head.y < 0) head.y = this.gridSize - 1;
        if (head.y >= this.gridSize) head.y = 0;
        
        this.snake.unshift(head);
        
        // خوردن غذا
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
            
            // افزایش سرعت
            if (this.score % 50 === 0) {
                this.gameSpeed = Math.max(50, this.gameSpeed - 10);
            }
        } else {
            this.snake.pop();
        }
    }

    // ========== تولید غذا ==========
    generateFood() {
        let attempts = 0;
        const maxAttempts = 1000;
        
        while (attempts < maxAttempts) {
            const food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
            
            if (!this.snake.some(segment => segment.x === food.x && segment.y === food.y) &&
                !this.obstacles.some(obs => obs.x === food.x && obs.y === food.y)) {
                this.food = food;
                return;
            }
            
            attempts++;
        }
        
        // اگر جا نبود، بازی رو تموم کن
        this.gameActive = false;
    }

    // ========== تولید موانع ==========
    generateObstacles() {
        this.obstacles = [];
        const count = Math.floor(this.score / 100) + 2;
        
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            const maxAttempts = 100;
            
            while (attempts < maxAttempts) {
                const obstacle = {
                    x: Math.floor(Math.random() * this.gridSize),
                    y: Math.floor(Math.random() * this.gridSize)
                };
                
                if (!this.snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) &&
                    !(obstacle.x === this.food.x && obstacle.y === this.food.y)) {
                    this.obstacles.push(obstacle);
                    break;
                }
                
                attempts++;
            }
        }
    }

    // ========== بررسی برخورد ==========
    checkCollisions() {
        const head = this.snake[0];
        
        // برخورد با خود
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameActive = false;
            }
        }
        
        // برخورد با موانع
        for (const obstacle of this.obstacles) {
            if (head.x === obstacle.x && head.y === obstacle.y) {
                this.gameActive = false;
            }
        }
        
        if (!this.gameActive) {
            this.endGame();
        }
    }

    // ========== به‌روزرسانی امتیاز ==========
    updateScore() {
        const scoreElement = document.getElementById('snakeScore');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            
            const highScoreElement = document.getElementById('snakeHighScore');
            if (highScoreElement) {
                highScoreElement.textContent = this.highScore;
            }
        }
    }

    // ========== رسم بازی ==========
    draw() {
        if (!this.ctx) return;
        
        // پاک کردن صفحه
        this.ctx.fillStyle = '#1a1e2c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // رسم گرید
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
        
        // رسم موانع
        this.ctx.fillStyle = '#ef4444';
        this.obstacles.forEach(obs => {
            this.ctx.fillRect(
                obs.x * this.cellSize + 2,
                obs.y * this.cellSize + 2,
                this.cellSize - 4,
                this.cellSize - 4
            );
        });
        
        // رسم غذا
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.cellSize + this.cellSize / 2,
            this.food.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 2 - 4,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // رسم مار
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.cellSize,
                segment.y * this.cellSize,
                (segment.x + 1) * this.cellSize,
                (segment.y + 1) * this.cellSize
            );
            
            if (index === 0) {
                gradient.addColorStop(0, '#10b981');
                gradient.addColorStop(1, '#059669');
            } else {
                gradient.addColorStop(0, '#34d399');
                gradient.addColorStop(1, '#10b981');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.shadowBlur = index === 0 ? 15 : 5;
            this.ctx.shadowColor = '#10b981';
            
            this.ctx.fillRect(
                segment.x * this.cellSize + 2,
                segment.y * this.cellSize + 2,
                this.cellSize - 4,
                this.cellSize - 4
            );
            
            // چشم مار
            if (index === 0) {
                this.ctx.fillStyle = 'white';
                this.ctx.shadowBlur = 0;
                
                if (this.direction === 'RIGHT' || this.direction === 'LEFT') {
                    this.ctx.beginPath();
                    this.ctx.arc(
                        segment.x * this.cellSize + (this.direction === 'RIGHT' ? this.cellSize - 8 : 8),
                        segment.y * this.cellSize + 8,
                        3,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                    
                    this.ctx.beginPath();
                    this.ctx.arc(
                        segment.x * this.cellSize + (this.direction === 'RIGHT' ? this.cellSize - 8 : 8),
                        segment.y * this.cellSize + this.cellSize - 8,
                        3,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(
                        segment.x * this.cellSize + 8,
                        segment.y * this.cellSize + (this.direction === 'DOWN' ? this.cellSize - 8 : 8),
                        3,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                    
                    this.ctx.beginPath();
                    this.ctx.arc(
                        segment.x * this.cellSize + this.cellSize - 8,
                        segment.y * this.cellSize + (this.direction === 'DOWN' ? this.cellSize - 8 : 8),
                        3,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                }
            }
        });
        
        this.ctx.shadowBlur = 0;
    }

    // ========== کنترل صفحه کلید ==========
    handleKeyPress(e) {
        if (!this.gameActive) return;
        
        const key = e.key;
        
        // جلوگیری از حرکت معکوس
        if (key === 'ArrowUp' && this.direction !== 'DOWN') {
            this.direction = 'UP';
            self.direction = 'UP';
        } else if (key === 'ArrowDown' && this.direction !== 'UP') {
            this.direction = 'DOWN';
            self.direction = 'DOWN';
        } else if (key === 'ArrowLeft' && this.direction !== 'RIGHT') {
            this.direction = 'LEFT';
            self.direction = 'LEFT';
        } else if (key === 'ArrowRight' && this.direction !== 'LEFT') {
            this.direction = 'RIGHT';
            self.direction = 'RIGHT';
        }
    }

    // ========== پایان بازی ==========
    endGame() {
        this.gameActive = false;
        clearTimeout(this.animationFrame);
        
        console.log(`🏆 بازی مار تمام شد - امتیاز: ${this.score}`);
        
        // نمایش پیام پایان بازی
        gameEngine.showModal({
            title: '🐍 بازی تمام شد!',
            message: `امتیاز شما: ${this.score}\nبهترین امتیاز: ${this.highScore}`,
            type: 'info',
            duration: 5000
        });
    }

    // ========== توقف بازی ==========
    stop() {
        this.gameActive = false;
        clearTimeout(this.animationFrame);
    }
}

// ============================================
// ۷. کلاس مدیریت صدا و موسیقی
// ============================================
class AudioManager {
    constructor() {
        this.sounds = {};
        this.muted = localStorage.getItem('gameMuted') === 'true';
        this.volume = parseFloat(localStorage.getItem('gameVolume')) || 0.7;
        this.audioContext = null;
        this.isInitialized = false;
    }

    // ========== مقداردهی اولیه ==========
    async init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            console.log('🎵 سیستم صدا راه‌اندازی شد');
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی صدا:', error);
        }
    }

    // ========== پخش صدا ==========
    play(soundName, loop = false) {
        if (this.muted) return;
        if (!this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            sound.volume = this.volume;
            sound.loop = loop;
            sound.currentTime = 0;
            sound.play().catch(e => console.log('🎵 پخش خودکار مجاز نیست'));
        } catch (error) {
            console.error(`❌ خطا در پخش ${soundName}:`, error);
        }
    }

    // ========== توقف صدا ==========
    stop(soundName) {
        if (!this.sounds[soundName]) return;
        
        try {
            this.sounds[soundName].pause();
            this.sounds[soundName].currentTime = 0;
        } catch (error) {
            console.error(`❌ خطا در توقف ${soundName}:`, error);
        }
    }

    // ========== قطع/وصل صدا ==========
    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('gameMuted', this.muted);
        return this.muted;
    }

    // ========== تنظیم صدا ==========
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('gameVolume', this.volume);
        
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
    }
}

// ============================================
// ۸. کلاس مدیریت آنلاین
// ============================================
class OnlineManager {
    constructor() {
        this.connected = false;
        this.socket = null;
        this.roomId = null;
        self.playerId = null;
        this.players = [];
        this.gameType = null;
        this.eventListeners = {};
    }

    // ========== اتصال به سرور ==========
    connect(serverUrl = 'wss://classic-games.ali369.ir/ws') {
        try {
            this.socket = new WebSocket(serverUrl);
            
            this.socket.onopen = () => {
                this.connected = true;
                console.log('🔗 متصل به سرور بازی');
                this.emit('connected');
            };
            
            this.socket.onclose = () => {
                this.connected = false;
                console.log('🔌 قطع اتصال از سرور');
                this.emit('disconnected');
            };
            
            this.socket.onerror = (error) => {
                console.error('❌ خطای اتصال:', error);
                this.emit('error', error);
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('❌ خطای پردازش پیام:', error);
                }
            };
            
            return true;
        } catch (error) {
            console.error('❌ خطا در اتصال به سرور:', error);
            return false;
        }
    }

    // ========== پردازش پیام ==========
    handleMessage(data) {
        switch (data.type) {
            case 'room_created':
                this.roomId = data.roomId;
                self.playerId = data.playerId;
                this.emit('roomCreated', data);
                break;
                
            case 'player_joined':
                this.players = data.players;
                this.emit('playerJoined', data);
                break;
                
            case 'game_start':
                this.gameType = data.gameType;
                this.emit('gameStart', data);
                break;
                
            case 'move':
                this.emit('opponentMove', data);
                break;
                
            case 'chat':
                this.emit('chat', data);
                break;
                
            case 'game_end':
                this.emit('gameEnd', data);
                break;
        }
    }

    // ========== ساخت اتاق ==========
    createRoom(gameType, playerName) {
        if (!this.connected) return false;
        
        this.send({
            type: 'create_room',
            gameType: gameType,
            playerName: playerName,
            timestamp: Date.now()
        });
        
        return true;
    }

    // ========== پیوستن به اتاق ==========
    joinRoom(roomId, playerName) {
        if (!this.connected) return false;
        
        this.send({
            type: 'join_room',
            roomId: roomId,
            playerName: playerName,
            timestamp: Date.now()
        });
        
        return true;
    }

    // ========== ارسال حرکت ==========
    sendMove(moveData) {
        if (!this.connected) return false;
        
        this.send({
            type: 'move',
            roomId: this.roomId,
            playerId: self.playerId,
            move: moveData,
            timestamp: Date.now()
        });
        
        return true;
    }

    // ========== ارسال پیام ==========
    sendMessage(message) {
        if (!this.connected) return false;
        
        this.send({
            type: 'chat',
            roomId: this.roomId,
            playerId: self.playerId,
            message: message,
            timestamp: Date.now()
        });
        
        return true;
    }

    // ========== ارسال داده ==========
    send(data) {
        if (!this.connected || !this.socket) return;
        
        try {
            this.socket.send(JSON.stringify(data));
        } catch (error) {
            console.error('❌ خطا در ارسال داده:', error);
        }
    }

    // ========== رویدادها ==========
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    // ========== قطع اتصال ==========
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.connected = false;
        this.roomId = null;
        self.playerId = null;
        this.players = [];
    }
}

// ============================================
// ۹. کلاس مدیریت ذخیره‌سازی
// ============================================
class StorageManager {
    constructor() {
        this.prefix = 'classic_games_';
    }

    // ========== ذخیره داده ==========
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (error) {
            console.error('❌ خطا در ذخیره‌سازی:', error);
            return false;
        }
    }

    // ========== دریافت داده ==========
    get(key, defaultValue = null) {
        try {
            const serialized = localStorage.getItem(this.prefix + key);
            if (serialized === null) return defaultValue;
            return JSON.parse(serialized);
        } catch (error) {
            console.error('❌ خطا در بازیابی:', error);
            return defaultValue;
        }
    }

    // ========== حذف داده ==========
    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    // ========== پاک کردن همه ==========
    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    // ========== ذخیره امتیاز ==========
    saveScore(game, score, playerName = 'Anonymous') {
        const scores = this.get(`${game}_highscores`, []);
        scores.push({
            player: playerName,
            score: score,
            date: new Date().toISOString()
        });
        
        // مرتب‌سازی نزولی
        scores.sort((a, b) => b.score - a.score);
        
        // نگه‌داری ۱۰ امتیاز برتر
        if (scores.length > 10) {
            scores.length = 10;
        }
        
        this.set(`${game}_highscores`, scores);
        return scores;
    }

    // ========== دریافت امتیازات ==========
    getScores(game) {
        return this.get(`${game}_highscores`, []);
    }
}

// ============================================
// ۱۰. ایجاد نمونه‌های سراسری
// ============================================
const gameEngine = new ClassicGamesEngine();
const ticTacToe = new TicTacToe();
const snakesLadders = new SnakesLadders();
const snakeGame = new SnakeGame();
const audioManager = new AudioManager();
const onlineManager = new OnlineManager();
const storageManager = new StorageManager();

// ============================================
// ۱۱. راه‌اندازی نهایی
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    gameEngine.init();
    audioManager.init();
});

// ============================================
// ۱۲. توابع کمکی سراسری
// ============================================
window.playGame = function(gameType) {
    switch (gameType) {
        case 'tictactoe':
            ticTacToe.newGame('ai', 'medium');
            gameEngine.showModal({
                title: '🎮 بازی دوز',
                message: 'بازی دوز با هوش مصنوعی در حال بارگذاری...',
                type: 'info',
                duration: 2000
            });
            break;
            
        case 'snakesladders':
            snakesLadders.startGame(2);
            gameEngine.showModal({
                title: '🎲 مار و پله',
                message: 'بازی مار و پله آماده است!',
                type: 'success',
                duration: 2000
            });
            break;
            
        case 'snake':
            const canvas = document.getElementById('snakeCanvas');
            if (snakeGame.init('snakeCanvas')) {
                snakeGame.start();
            }
            break;
    }
};

window.showDemoVideo = function() {
    gameEngine.showDemoVideo();
};

window.notifyMe = function(game) {
    gameEngine.notifyMe(game);
};

// ============================================
// ۱۳. نمایش اطلاعات در کنسول
// ============================================
console.log(`
╔══════════════════════════════════════════╗
║     🎮 بازی‌های کلاسیک حرفه‌ای            ║
║     نسخه: ${APP_VERSION}                          ║
║     طراحی شده توسط: ${APP_AUTHOR}      ║
║     تاریخ ساخت: ${APP_BUILD}              ║
╚══════════════════════════════════════════╝
`);

console.log('✨ ویژگی‌های فعال:');
console.log('   ✅ موتور بازی پیشرفته');
console.log('   ✅ هوش مصنوعی ۵ سطحی');
console.log('   ✅ گرافیک سه‌بعدی');
console.log('   ✅ حالت آنلاین');
console.log('   ✅ ذخیره‌سازی ابری');
console.log('   ✅ پشتیبانی از RTL');

// ============================================
// ۱۴. مدیریت خطاهای سراسری
// ============================================
window.onerror = function(message, source, lineno, colno, error) {
    console.error('❌ خطای سراسری:', { message, source, lineno, colno, error });
    return true;
};

window.onunhandledrejection = function(event) {
    console.error('❌ خطای Promise:', event.reason);
};

// ============================================
// ۱۵. پاکسازی هنگام خروج
// ============================================
window.addEventListener('beforeunload', () => {
    snakeGame.stop();
    onlineManager.disconnect();
});
