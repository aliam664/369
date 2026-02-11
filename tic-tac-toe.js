/* ============================================
   TIC-TAC-TOE.JS - بازی دوز حرفه‌ای
   طراحی شده توسط Ali369 Studio
   نسخه: 3.0.0
   تاریخ: بهمن ۱۴۰۲
   لایسنس: MIT
   ============================================ */

'use strict';

// --------------------------------------------
// ۱. متغیرها و ثابت‌های سراسری
// --------------------------------------------

const GAME_VERSION = '3.0.0';
const GAME_NAME = 'بازی دوز حرفه‌ای';
const STUDIO_NAME = 'Ali369 Studio';
const BUILD_DATE = '2024-01-25';

// ترکیب‌های برنده برای تخته ۳x۳
const WIN_PATTERNS_3x3 = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // ردیف‌ها
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // ستون‌ها
    [0, 4, 8], [2, 4, 6]             // قطرها
];

// ترکیب‌های برنده برای تخته ۴x۴
const WIN_PATTERNS_4x4 = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
    [0, 5, 10, 15], [3, 6, 9, 12]
];

// ترکیب‌های برنده برای تخته ۵x۵
const WIN_PATTERNS_5x5 = [
    [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
];

// --------------------------------------------
// ۲. کلاس هوش مصنوعی پیشرفته
// --------------------------------------------

class TicTacToeAI {
    constructor(difficulty = 'medium', boardSize = 3) {
        this.difficulty = difficulty;
        this.boardSize = boardSize;
        
        // امتیازات برای الگوریتم Minimax
        this.scores = {
            'X': -100,
            'O': 100,
            'tie': 0
        };
        
        // عمق جستجو برای سطوح مختلف
        this.depths = {
            'easy': 1,
            'medium': 3,
            'hard': 5,
            'expert': 7,
            'impossible': 9
        };
        
        // درصد حرکات تصادفی برای سطوح مختلف
        this.randomness = {
            'easy': 0.7,
            'medium': 0.4,
            'hard': 0.2,
            'expert': 0.05,
            'impossible': 0
        };
    }

    // ========== دریافت حرکت هوش مصنوعی ==========
    getMove(board, player) {
        // حرکت تصادفی بر اساس سطح دشواری
        if (Math.random() < this.randomness[this.difficulty]) {
            return this.getRandomMove(board);
        }
        
        const depth = this.depths[this.difficulty] || 3;
        const result = this.minimax(
            [...board],
            player,
            depth,
            -Infinity,
            Infinity,
            player === 'O'
        );
        
        return result.position;
    }

    // ========== حرکت تصادفی ==========
    getRandomMove(board) {
        const availableMoves = board
            .map((cell, index) => cell === null ? index : null)
            .filter(index => index !== null);
        
        if (availableMoves.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }

    // ========== الگوریتم Minimax با هرس آلفا-بتا ==========
    minimax(board, player, depth, alpha, beta, isMaximizing) {
        // بررسی پایان بازی
        const winner = this.checkWinner(board);
        
        if (winner !== null || depth === 0) {
            if (winner === 'O') return { score: this.scores.O - depth };
            if (winner === 'X') return { score: this.scores.X + depth };
            if (winner === 'tie') return { score: 0 };
            return { score: 0 };
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            let bestMove = null;

            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    const result = this.minimax(board, player, depth - 1, alpha, beta, false);
                    board[i] = null;

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

            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    const result = this.minimax(board, player, depth - 1, alpha, beta, true);
                    board[i] = null;

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
    checkWinner(board) {
        let patterns;
        if (this.boardSize === 3) patterns = WIN_PATTERNS_3x3;
        else if (this.boardSize === 4) patterns = WIN_PATTERNS_4x4;
        else patterns = WIN_PATTERNS_5x5;

        for (const pattern of patterns) {
            const first = board[pattern[0]];
            if (!first) continue;

            let win = true;
            for (let i = 1; i < pattern.length; i++) {
                if (board[pattern[i]] !== first) {
                    win = false;
                    break;
            }
        }

            if (win) return first;
        }

        if (!board.includes(null)) return 'tie';
        return null;
    }

    // ========== دریافت حرکت پیشنهادی برای راهنمایی ==========
    getHint(board, player) {
        const depth = 5;
        const result = this.minimax(
            [...board],
            player === 'X' ? 'O' : 'X',
            depth,
            -Infinity,
            Infinity,
            player === 'O'
        );
        return result.position;
    }
}

// --------------------------------------------
// ۳. کلاس مدیریت صدا
// --------------------------------------------

class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.initialized = false;
    }

    // ========== مقداردهی اولیه ==========
    init() {
        if (this.initialized) return;
        
        this.sounds = {
            click: document.getElementById('clickSound'),
            move: document.getElementById('moveSound'),
            win: document.getElementById('winSound'),
            draw: document.getElementById('drawSound'),
            error: document.getElementById('errorSound'),
            hint: document.getElementById('hintSound')
        };

        // تنظیم ولوم پیش‌فرض
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = this.volume;
            }
        });

        this.initialized = true;
    }

    // ========== پخش صدا ==========
    play(type) {
        if (!this.enabled) return;
        if (!this.initialized) this.init();

        const sound = this.sounds[type];
        if (!sound) return;

        // تنظیم ولوم بر اساس نوع صدا
        switch(type) {
            case 'click':
                sound.volume = this.volume * 0.3;
                break;
            case 'move':
                sound.volume = this.volume * 0.2;
                break;
            case 'win':
                sound.volume = this.volume * 0.5;
                break;
            case 'draw':
                sound.volume = this.volume * 0.4;
                break;
            case 'error':
                sound.volume = this.volume * 0.3;
                break;
            case 'hint':
                sound.volume = this.volume * 0.4;
                break;
        }

        sound.currentTime = 0;
        sound.play().catch(e => console.log('🎵 خطا در پخش صدا:', e));
    }

    // ========== قطع/وصل صدا ==========
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // ========== تنظیم ولوم ==========
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            if (sound) sound.volume = this.volume;
        });
    }
}

// --------------------------------------------
// ۴. کلاس مدیریت ذخیره‌سازی
// --------------------------------------------

class StorageManager {
    constructor(prefix = 'tictactoe_') {
        this.prefix = prefix;
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

    // ========== ذخیره آمار بازی ==========
    saveGameStats(stats) {
        return this.set('game_stats', stats);
    }

    // ========== دریافت آمار بازی ==========
    getGameStats() {
        return this.get('game_stats', {
            totalGames: 0,
            totalWins: { X: 0, O: 0 },
            totalDraws: 0,
            totalTime: 0,
            bestStreak: 0,
            fastestWin: null,
            achievements: []
        });
    }

    // ========== ذخیره تنظیمات ==========
    saveSettings(settings) {
        return this.set('settings', settings);
    }

    // ========== دریافت تنظیمات ==========
    getSettings() {
        return this.get('settings', {
            soundEnabled: true,
            animations: true,
            highlightMoves: true,
            autoSuggest: true,
            moveTimeLimit: 30,
            boardSize: 3,
            difficulty: 'medium',
            theme: 'light'
        });
    }

    // ========== ذخیره لیدربورد ==========
    saveLeaderboard(leaderboard) {
        return this.set('leaderboard', leaderboard);
    }

    // ========== دریافت لیدربورد ==========
    getLeaderboard() {
        return this.get('leaderboard', []);
    }

    // ========== افزودن امتیاز جدید به لیدربورد ==========
    addLeaderboardEntry(entry) {
        const leaderboard = this.getLeaderboard();
        leaderboard.push({
            ...entry,
            date: new Date().toISOString()
        });
        
        // مرتب‌سازی بر اساس امتیاز
        leaderboard.sort((a, b) => b.score - a.score);
        
        // نگه‌داری ۱۰۰ رکورد برتر
        if (leaderboard.length > 100) {
            leaderboard.length = 100;
        }
        
        return this.saveLeaderboard(leaderboard);
    }
}

// --------------------------------------------
// ۵. کلاس اصلی بازی
// --------------------------------------------

class TicTacToeGame {
    constructor() {
        // ========== وضعیت بازی ==========
        this.boardSize = 3;
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.gameMode = 'pvp';
        this.aiDifficulty = 'medium';
        this.winner = null;
        this.winningPattern = null;
        
        // ========== تاریخچه حرکات ==========
        this.moveHistory = [];
        this.moveHistoryIndex = -1;
        this.moveCount = 0;
        
        // ========== تایمر ==========
        this.timer = {
            startTime: null,
            elapsedSeconds: 0,
            interval: null,
            moveStartTime: null,
            moveTimeLimit: 30
        };
        
        // ========== آمار بازیکنان ==========
        this.players = {
            X: {
                type: 'human',
                name: 'بازیکن X',
                score: 1280,
                wins: 42,
                losses: 18,
                draws: 12,
                games: 72,
                streak: 3,
                level: 'پلاتینیوم',
                winRate: 58
            },
            O: {
                type: 'human',
                name: 'بازیکن O',
                score: 890,
                wins: 28,
                losses: 32,
                draws: 12,
                games: 72,
                streak: 1,
                level: 'طلا',
                winRate: 39
            }
        };
        
        // ========== آمار کلی ==========
        this.stats = {
            totalGames: 187,
            totalDraws: 23,
            totalTime: 846,
            winStreak: 7,
            currentStreak: 3,
            fastestWin: 18,
            xWins: 42,
            oWins: 28
        };
        
        // ========== تنظیمات ==========
        this.settings = {
            soundEnabled: true,
            animations: true,
            highlightMoves: true,
            autoSuggest: true,
            moveTimeLimit: 30,
            boardSize: 3,
            difficulty: 'medium',
            theme: 'light'
        };
        
        // ========== دستاوردها ==========
        this.achievements = {
            firstWin: { id: 'firstWin', name: 'اولین برد', description: 'اولین بازی خود را ببرید', unlocked: true, progress: 1, total: 1, icon: '🎯' },
            winStreak5: { id: 'winStreak5', name: '۵ برد متوالی', description: '۵ بازی پشت سر هم ببرید', unlocked: false, progress: 3, total: 5, icon: '🔥' },
            winStreak10: { id: 'winStreak10', name: '۱۰ برد متوالی', description: '۱۰ بازی پشت سر هم ببرید', unlocked: false, progress: 3, total: 10, icon: '⚡' },
            fastestWin: { id: 'fastestWin', name: 'سریع‌ترین برد', description: 'در کمتر از ۲۰ ثانیه برنده شوید', unlocked: true, progress: 18, total: 20, icon: '⏱️' },
            perfectGame: { id: 'perfectGame', name: 'بازی عالی', description: 'بدون اشتباه برنده شوید', unlocked: false, progress: 0, total: 1, icon: '💎' },
            beatExpert: { id: 'beatExpert', name: 'شکست استاد', description: 'هوش مصنوعی سطح استاد را شکست دهید', unlocked: false, progress: 2, total: 5, icon: '🤖' },
            noLosses: { id: 'noLosses', name: 'شکست‌ناپذیر', description: '۱۰ بازی بدون باخت', unlocked: false, progress: 7, total: 10, icon: '🛡️' },
            master: { id: 'master', name: 'استاد دوز', description: '۱۰۰ بازی برنده شوید', unlocked: false, progress: 42, total: 100, icon: '👑' }
        };
        
        // ========== لیدربورد ==========
        this.leaderboard = [
            { rank: 1, name: 'آرمان', score: 2300, wins: 158, level: 'الماس' },
            { rank: 2, name: 'سارا', score: 2100, wins: 142, level: 'پلاتینیوم' },
            { rank: 3, name: 'کیان', score: 2050, wins: 138, level: 'پلاتینیوم' },
            { rank: 4, name: 'نیما', score: 1900, wins: 125, level: 'طلا' },
            { rank: 5, name: 'هلیا', score: 1850, wins: 120, level: 'طلا' }
        ];
        
        // ========== کامپوننت‌های کمکی ==========
        this.soundManager = new SoundManager();
        this.storageManager = new StorageManager();
        this.ai = new TicTacToeAI(this.aiDifficulty, this.boardSize);
        
        // ========== المان‌های DOM ==========
        this.elements = {};
        
        // ========== وضعیت مودال ==========
        this.activeModal = null;
    }

    // ========== مقداردهی اولیه ==========
    async init() {
        console.log(`🎮 ${GAME_NAME} v${GAME_VERSION} - ${STUDIO_NAME}`);
        console.log(`📅 تاریخ ساخت: ${BUILD_DATE}`);
        
        try {
            // بارگذاری تنظیمات
            await this.loadSettings();
            
            // بارگذاری آمار
            await this.loadStats();
            
            // مقداردهی صدا
            this.soundManager.init();
            
            // ایجاد تخته
            this.createBoard();
            
            // تنظیم رویدادها
            this.setupEventListeners();
            
            // بروزرسانی UI
            this.updateUI();
            
            // شبیه‌سازی بارگذاری
            this.simulateLoading();
            
            // فعال کردن بازی
            this.gameActive = true;
            this.startTimer();
            
            console.log('✅ بازی با موفقیت راه‌اندازی شد');
            
            // نمایش پیام خوش‌آمدگویی
            this.showToast('🎮 به بازی دوز حرفه‌ای خوش آمدید!', 'success', 3000);
            
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی بازی:', error);
            this.showToast('❌ خطا در راه‌اندازی بازی!', 'error', 5000);
        }
    }

    // ========== شبیه‌سازی بارگذاری ==========
    simulateLoading() {
        let progress = 0;
        const loadingScreen = document.getElementById('game-loading');
        const progressBar = document.getElementById('loadingProgress');
        const loadingText = document.getElementById('loadingText');
        const loadingTip = document.getElementById('loadingTip');
        
        const tips = [
            '💡 آیا می‌دانستید؟ بازی دوز یکی از قدیمی‌ترین بازی‌های جهان است!',
            '🤖 هوش مصنوعی ما از الگوریتم Minimax با هرس آلفا-بتا استفاده می‌کند',
            '🏆 رکورد جهانی سریع‌ترین برد دوز در ۳ حرکت ثبت شده است',
            '🎮 بیش از ۱ میلیون بازیکن از این بازی استفاده کرده‌اند',
            '✨ گرافیک 4K و انیمیشن‌های سینمایی فقط برای شما',
            '🌍 در ۲۵ کشور جهان از این بازی استفاده می‌شود',
            '📱 نسخه موبایل با ۶۰ فریم بر ثانیه اجرا می‌شود',
            '🎯 هوش مصنوعی ما ۵ سطح دشواری دارد',
            '🧠 سطح "غیرممکن" هیچگاه نمی‌بازد!',
            '⭐ بیش از ۲۰ دستاورد برای کسب کردن وجود دارد'
        ];

        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            
            if (loadingText) {
                if (progress < 30) {
                    loadingText.textContent = '🔄 بارگذاری منابع...';
                } else if (progress < 60) {
                    loadingText.textContent = '🧠 راه‌اندازی هوش مصنوعی...';
                } else if (progress < 90) {
                    loadingText.textContent = '🎨 بارگذاری گرافیک...';
                } else {
                    loadingText.textContent = '✨ آماده‌سازی تجربه بازی...';
                }
            }
            
            if (progress % 20 === 0 && loadingTip) {
                const randomTip = tips[Math.floor(Math.random() * tips.length)];
                loadingTip.textContent = randomTip;
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    if (loadingScreen) {
                        loadingScreen.style.opacity = '0';
                        setTimeout(() => {
                            loadingScreen.style.display = 'none';
                        }, 500);
                    }
                }, 500);
            }
        }, 100);
    }

    // ========== ایجاد تخته بازی ==========
    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        if (!gameBoard) return;
        
        gameBoard.innerHTML = '';
        
        // تنظیم گرید بر اساس اندازه تخته
        gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;
        
        // ایجاد سلول‌ها
        for (let i = 0; i < this.board.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.setAttribute('aria-label', `خانه ${i + 1}`);
            
            gameBoard.appendChild(cell);
        }
        
        // دریافت سلول‌ها
        this.elements.cells = document.querySelectorAll('.cell');
    }

    // ========== تنظیم رویدادها ==========
    setupEventListeners() {
        // ========== سلول‌های بازی ==========
        if (this.elements.cells) {
            this.elements.cells.forEach(cell => {
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                cell.addEventListener('mouseenter', (e) => this.handleCellHover(e));
                cell.addEventListener('mouseleave', (e) => this.handleCellLeave(e));
            });
        }

        // ========== دکمه‌های اصلی ==========
        this.elements.newGameBtn = document.getElementById('newGameBtn');
        if (this.elements.newGameBtn) {
            this.elements.newGameBtn.addEventListener('click', () => this.newGame());
        }

        this.elements.undoBtn = document.getElementById('undoBtn');
        if (this.elements.undoBtn) {
            this.elements.undoBtn.addEventListener('click', () => this.undoMove());
        }

        this.elements.redoBtn = document.getElementById('redoBtn');
        if (this.elements.redoBtn) {
            this.elements.redoBtn.addEventListener('click', () => this.redoMove());
        }

        this.elements.resetStatsBtn = document.getElementById('resetStatsBtn');
        if (this.elements.resetStatsBtn) {
            this.elements.resetStatsBtn.addEventListener('click', () => this.resetStats());
        }

        this.elements.quickRestartBtn = document.getElementById('quickRestartBtn');
        if (this.elements.quickRestartBtn) {
            this.elements.quickRestartBtn.addEventListener('click', () => this.quickRestart());
        }

        this.elements.hintBtn = document.getElementById('hintBtn');
        if (this.elements.hintBtn) {
            this.elements.hintBtn.addEventListener('click', () => this.showHint());
        }

        // ========== حالت‌های بازی ==========
        this.elements.modeButtons = document.querySelectorAll('.mode-btn');
        this.elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.changeGameMode(mode);
                this.elements.modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // ========== دکمه تغییر نوع بازیکن ==========
        document.querySelectorAll('.change-type-btn').forEach(btn => {
            btn.addEventListener('click', () => this.togglePlayerType(btn.dataset.player));
        });

        // ========== دکمه‌های تنظیمات ==========
        this.elements.soundToggle = document.getElementById('soundToggle');
        if (this.elements.soundToggle) {
            this.elements.soundToggle.addEventListener('click', () => this.toggleSound());
        }

        this.elements.themeToggle = document.getElementById('themeToggle');
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        this.elements.boardSize = document.getElementById('boardSize');
        if (this.elements.boardSize) {
            this.elements.boardSize.addEventListener('change', () => this.changeBoardSize());
        }

        this.elements.moveTime = document.getElementById('moveTime');
        this.elements.moveTimeValue = document.getElementById('moveTimeValue');
        if (this.elements.moveTime) {
            this.elements.moveTime.addEventListener('input', () => {
                const value = this.elements.moveTime.value;
                if (this.elements.moveTimeValue) {
                    this.elements.moveTimeValue.textContent = value;
                }
                this.settings.moveTimeLimit = parseInt(value);
                this.saveSettings();
            });
        }

        this.elements.soundEffects = document.getElementById('soundEffects');
        if (this.elements.soundEffects) {
            this.elements.soundEffects.addEventListener('change', () => {
                this.settings.soundEnabled = this.elements.soundEffects.checked;
                this.soundManager.enabled = this.settings.soundEnabled;
                this.saveSettings();
            });
        }

        this.elements.animations = document.getElementById('animations');
        if (this.elements.animations) {
            this.elements.animations.addEventListener('change', () => {
                this.settings.animations = this.elements.animations.checked;
                this.saveSettings();
            });
        }

        this.elements.highlightMoves = document.getElementById('highlightMoves');
        if (this.elements.highlightMoves) {
            this.elements.highlightMoves.addEventListener('change', () => {
                this.settings.highlightMoves = this.elements.highlightMoves.checked;
                this.saveSettings();
            });
        }

        this.elements.autoSuggest = document.getElementById('autoSuggest');
        if (this.elements.autoSuggest) {
            this.elements.autoSuggest.addEventListener('change', () => {
                this.settings.autoSuggest = this.elements.autoSuggest.checked;
                this.saveSettings();
            });
        }

        // ========== المان‌های آمار ==========
        this.elements.totalGames = document.getElementById('totalGames');
        this.elements.totalDraws = document.getElementById('totalDraws');
        this.elements.totalTime = document.getElementById('totalTime');
        this.elements.winStreak = document.getElementById('winStreak');
        this.elements.currentStreak = document.getElementById('currentStreak');
        
        this.elements.playerXScore = document.getElementById('playerXScore');
        this.elements.playerOScore = document.getElementById('playerOScore');
        this.elements.playerXWins = document.getElementById('playerXWins');
        this.elements.playerOWins = document.getElementById('playerOWins');
        this.elements.playerXWinRate = document.getElementById('playerXWinRate');
        this.elements.playerOWinRate = document.getElementById('playerOWinRate');
        this.elements.playerXLevel = document.getElementById('playerXLevel');
        this.elements.playerOLevel = document.getElementById('playerOLevel');
        this.elements.playerXType = document.getElementById('playerXType');
        this.elements.playerOType = document.getElementById('playerOType');
        
        this.elements.xTurnIndicator = document.getElementById('xTurnIndicator');
        this.elements.oTurnIndicator = document.getElementById('oTurnIndicator');
        this.elements.xThinking = document.getElementById('xThinking');
        this.elements.oThinking = document.getElementById('oThinking');
        
        this.elements.gameTimer = document.getElementById('gameTimer');
        this.elements.movesList = document.getElementById('movesList');
        this.elements.hintText = document.getElementById('hintText');
        this.elements.statusText = document.getElementById('statusText');

        // ========== مودال‌ها ==========
        this.elements.winnerModal = document.getElementById('winnerModal');
        this.elements.drawModal = document.getElementById('drawModal');
        this.elements.winnerModalTitle = document.getElementById('winnerModalTitle');
        this.elements.winnerModalPlayer = document.getElementById('winnerModalPlayer');
        this.elements.winnerModalDesc = document.getElementById('winnerModalDesc');
        this.elements.winnerModalMoves = document.getElementById('winnerModalMoves');
        this.elements.winnerModalTime = document.getElementById('winnerModalTime');
        this.elements.winnerModalXP = document.getElementById('winnerModalXP');

        // ========== دکمه‌های مودال ==========
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal);
            });
        });

        this.elements.rematchBtn = document.getElementById('rematchBtn');
        if (this.elements.rematchBtn) {
            this.elements.rematchBtn.addEventListener('click', () => {
                this.closeModal(this.elements.winnerModal);
                this.quickRestart();
            });
        }

        this.elements.newGameModalBtn = document.getElementById('newGameModalBtn');
        if (this.elements.newGameModalBtn) {
            this.elements.newGameModalBtn.addEventListener('click', () => {
                this.closeModal(this.elements.winnerModal);
                this.newGame();
            });
        }

        this.elements.drawRematchBtn = document.getElementById('drawRematchBtn');
        if (this.elements.drawRematchBtn) {
            this.elements.drawRematchBtn.addEventListener('click', () => {
                this.closeModal(this.elements.drawModal);
                this.quickRestart();
            });
        }

        this.elements.shareWinBtn = document.getElementById('shareWinBtn');
        if (this.elements.shareWinBtn) {
            this.elements.shareWinBtn.addEventListener('click', () => this.shareResult());
        }

        this.elements.viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn');
        if (this.elements.viewLeaderboardBtn) {
            this.elements.viewLeaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        }

        // ========== کنترل‌های موبایل ==========
        this.elements.mobileBtns = document.querySelectorAll('.mobile-btn');
        this.elements.mobileBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const panel = btn.dataset.panel;
                this.switchMobilePanel(panel);
                this.elements.mobileBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // ========== رویدادهای کیبورد ==========
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // ========== رویداد ریسایز ==========
        window.addEventListener('resize', () => this.handleResize());

        // ========== بستن مودال با کلیک خارج ==========
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    // ========== کلیک روی سلول ==========
    handleCellClick(event) {
        if (!this.gameActive) return;
        
        const cell = event.currentTarget;
        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] !== null) {
            this.soundManager.play('error');
            this.showToast('این خانه قبلاً انتخاب شده!', 'error', 2000);
            return;
        }
        
        const currentPlayerType = this.players[this.currentPlayer].type;
        if (currentPlayerType === 'ai') return;
        
        this.makeMove(index);
    }

    // ========== هاور روی سلول ==========
    handleCellHover(event) {
        if (!this.settings.highlightMoves) return;
        if (!this.gameActive) return;
        
        const cell = event.currentTarget;
        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] === null && this.players[this.currentPlayer].type === 'human') {
            cell.classList.add('cell-placeholder');
            cell.textContent = this.currentPlayer;
            cell.classList.add(this.currentPlayer.toLowerCase());
        }
    }

    handleCellLeave(event) {
        const cell = event.currentTarget;
        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] === null) {
            cell.classList.remove('cell-placeholder');
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        }
    }

    // ========== انجام حرکت ==========
    makeMove(index) {
        if (!this.gameActive) return false;
        if (this.board[index] !== null) return false;
        
        // ثبت حرکت
        const move = {
            player: this.currentPlayer,
            position: index,
            time: this.timer.elapsedSeconds,
            moveNumber: this.moveCount + 1,
            timestamp: Date.now()
        };
        
        // مدیریت تاریخچه
        if (this.moveHistoryIndex < this.moveHistory.length - 1) {
            this.moveHistory = this.moveHistory.slice(0, this.moveHistoryIndex + 1);
        }
        
        this.moveHistory.push(move);
        this.moveHistoryIndex = this.moveHistory.length - 1;
        this.moveCount++;
        
        // بروزرسانی تخته
        this.board[index] = this.currentPlayer;
        
        // پخش صدا
        this.soundManager.play('move');
        
        // بروزرسانی UI
        this.updateBoard();
        this.updateMoveHistory();
        this.updateControls();
        
        // بررسی نتیجه بازی
        const winner = this.checkWinner();
        
        if (winner) {
            this.endGame(winner);
        } else if (this.isBoardFull()) {
            this.endGame('tie');
        } else {
            this.switchPlayer();
        }
        
        return true;
    }

    // ========== حرکت هوش مصنوعی ==========
    async makeAIMove() {
        if (!this.gameActive) return;
        if (this.players[this.currentPlayer].type !== 'ai') return;
        
        this.showThinkingIndicator(true);
        
        // تاخیر هوشمند بر اساس سطح دشواری
        const delay = this.aiDifficulty === 'easy' ? 500 :
                     this.aiDifficulty === 'medium' ? 700 :
                     this.aiDifficulty === 'hard' ? 900 :
                     this.aiDifficulty === 'expert' ? 1100 : 1500;
        
        await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 500));
        
        if (!this.gameActive) return;
        
        const aiMove = this.ai.getMove([...this.board], this.currentPlayer);
        
        if (aiMove !== null && aiMove !== undefined) {
            this.makeMove(aiMove);
        }
        
        this.showThinkingIndicator(false);
    }

    // ========== نمایش اندیکاتور فکر کردن ==========
    showThinkingIndicator(show) {
        const indicator = this.currentPlayer === 'X' ? this.elements.xThinking : this.elements.oThinking;
        const turnIndicator = this.currentPlayer === 'X' ? this.elements.xTurnIndicator : this.elements.oTurnIndicator;
        
        if (indicator) indicator.classList.toggle('d-none', !show);
        if (turnIndicator) turnIndicator.style.display = show ? 'none' : 'flex';
        
        if (show && this.elements.statusText) {
            this.elements.statusText.textContent = '🤖 هوش مصنوعی در حال فکر کردن...';
        }
    }

    // ========== بررسی برنده ==========
    checkWinner() {
        let patterns;
        if (this.boardSize === 3) patterns = WIN_PATTERNS_3x3;
        else if (this.boardSize === 4) patterns = WIN_PATTERNS_4x4;
        else patterns = WIN_PATTERNS_5x5;
        
        for (const pattern of patterns) {
            const first = this.board[pattern[0]];
            if (!first) continue;
            
            let win = true;
            for (let i = 1; i < pattern.length; i++) {
                if (this.board[pattern[i]] !== first) {
                    win = false;
                    break;
                }
            }
            
            if (win) {
                this.winningPattern = pattern;
                return first;
            }
        }
        
        return null;
    }

    // ========== بررسی پر بودن تخته ==========
    isBoardFull() {
        return !this.board.includes(null);
    }

    // ========== تغییر بازیکن ==========
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updatePlayerCards();
        this.updateStatusMessage();
        
        if (this.players[this.currentPlayer].type === 'ai' && this.gameActive) {
            this.makeAIMove();
        }
    }

    // ========== پایان بازی ==========
    endGame(result) {
        this.gameActive = false;
        this.stopTimer();
        
        const moves = this.moveCount;
        const time = this.timer.elapsedSeconds;
        
        if (result === 'tie') {
            // بازی مساوی
            this.stats.totalDraws++;
            this.players.X.draws++;
            this.players.O.draws++;
            
            this.showDrawModal();
            this.soundManager.play('draw');
            this.showToast('🤝 بازی مساوی شد!', 'info', 3000);
            
        } else {
            // بازیکن برنده شده
            const winner = result;
            const loser = winner === 'X' ? 'O' : 'X';
            
            // محاسبه امتیاز
            const baseScore = 100;
            const timeBonus = Math.max(0, 50 - time);
            const moveBonus = Math.max(0, 30 - moves);
            const difficultyBonus = 
                this.aiDifficulty === 'easy' ? 10 :
                this.aiDifficulty === 'medium' ? 20 :
                this.aiDifficulty === 'hard' ? 30 :
                this.aiDifficulty === 'expert' ? 50 : 100;
            
            const xpGain = baseScore + timeBonus + moveBonus + difficultyBonus;
            
            // بروزرسانی آمار
            this.players[winner].wins++;
            this.players[winner].score += xpGain;
            this.players[winner].streak++;
            this.players[loser].streak = 0;
            
            this.stats[`${winner.toLowerCase()}Wins`]++;
            this.stats.currentStreak = this.players[winner].streak;
            
            if (this.stats.currentStreak > this.stats.winStreak) {
                this.stats.winStreak = this.stats.currentStreak;
            }
            
            if (!this.stats.fastestWin || time < this.stats.fastestWin) {
                this.stats.fastestWin = time;
            }
            
            // بروزرسانی سطح بازیکن
            this.updatePlayerLevel(winner);
            
            // بررسی دستاوردها
            this.checkAchievements(winner, moves, time, xpGain);
            
            // نمایش مودال برنده
            this.showWinnerModal(winner, moves, time, xpGain);
            this.soundManager.play('win');
            
            // ایجاد کنفتی
            if (this.settings.animations) {
                this.createConfetti();
            }
            
            // هایلایت سلول‌های برنده
            this.highlightWinningCells();
            
            this.showToast(`🎉 بازیکن ${winner} برنده شد! +${xpGain} XP`, 'success', 4000);
        }
        
        // بروزرسانی آمار کلی
        this.stats.totalGames++;
        this.players.X.games++;
        this.players.O.games++;
        
        // محاسبه درصد برد
        this.players.X.winRate = Math.round((this.players.X.wins / this.players.X.games) * 100) || 0;
        this.players.O.winRate = Math.round((this.players.O.wins / this.players.O.games) * 100) || 0;
        
        this.stats.totalTime += time;
        
        // ذخیره آمار
        this.saveStats();
        
        // بروزرسانی UI
        this.updatePlayerStats();
        this.updateStats();
        this.updateControls();
    }

    // ========== هایلایت سلول‌های برنده ==========
    highlightWinningCells() {
        if (!this.winningPattern) return;
        
        this.winningPattern.forEach(index => {
            const cell = this.elements.cells[index];
            if (cell) cell.classList.add('win-cell');
        });
        
        this.drawWinningLine();
    }

    // ========== رسم خط برنده ==========
    drawWinningLine() {
        if (!this.winningPattern) return;
        
        const board = document.getElementById('gameBoard');
        if (!board) return;
        
        const pattern = this.winningPattern;
        let lineClass = '';
        let styles = {};
        
        // تشخیص نوع خط
        if (pattern[0] % this.boardSize === pattern[1] % this.boardSize) {
            lineClass = 'vertical-line';
            const col = pattern[0] % this.boardSize;
            styles.left = `${((col + 0.5) / this.boardSize) * 100}%`;
        } else if (Math.floor(pattern[0] / this.boardSize) === Math.floor(pattern[1] / this.boardSize)) {
            lineClass = 'horizontal-line';
            const row = Math.floor(pattern[0] / this.boardSize);
            styles.top = `${((row + 0.5) / this.boardSize) * 100}%`;
        } else if (pattern[0] === 0 && pattern[pattern.length - 1] === this.board.length - 1) {
            lineClass = 'diagonal-line';
        } else {
            lineClass = 'diagonal-line-2';
        }
        
        const line = document.createElement('div');
        line.className = `win-line ${lineClass}`;
        Object.assign(line.style, styles);
        
        board.appendChild(line);
    }

    // ========== نمایش مودال برنده ==========
    showWinnerModal(winner, moves, time, xpGain) {
        if (!this.elements.winnerModal) return;
        
        const playerName = winner === 'X' ? 'بازیکن X' : 'بازیکن O';
        
        if (this.elements.winnerModalTitle) {
            this.elements.winnerModalTitle.textContent = `🎉 بازیکن ${winner} برنده شد! 🎉`;
        }
        
        if (this.elements.winnerModalPlayer) {
            this.elements.winnerModalPlayer.textContent = playerName;
        }
        
        if (this.elements.winnerModalDesc) {
            this.elements.winnerModalDesc.textContent = `با ${moves} حرکت و ${time} ثانیه`;
        }
        
        if (this.elements.winnerModalMoves) {
            this.elements.winnerModalMoves.textContent = moves;
        }
        
        if (this.elements.winnerModalTime) {
            this.elements.winnerModalTime.textContent = time;
        }
        
        if (this.elements.winnerModalXP) {
            this.elements.winnerModalXP.textContent = `+${xpGain}`;
        }
        
        this.openModal(this.elements.winnerModal);
    }

    // ========== نمایش مودال تساوی ==========
    showDrawModal() {
        if (this.elements.drawModal) {
            this.openModal(this.elements.drawModal);
        }
    }

    // ========== مدیریت مودال‌ها ==========
    openModal(modal) {
        if (!modal) return;
        
        // بستن مودال قبلی
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.activeModal = modal;
    }

    closeModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        if (this.activeModal === modal) {
            this.activeModal = null;
        }
    }

    // ========== بازی جدید ==========
    newGame() {
        // ریست تخته
        this.board = Array(this.boardSize * this.boardSize).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winner = null;
        this.winningPattern = null;
        this.moveCount = 0;
        
        // ریست تاریخچه
        this.moveHistory = [];
        this.moveHistoryIndex = -1;
        
        // پاک کردن خطوط برنده
        document.querySelectorAll('.win-line').forEach(line => line.remove());
        
        // پاک کردن کلاس‌های برنده
        if (this.elements.cells) {
            this.elements.cells.forEach(cell => {
                cell.classList.remove('win-cell');
            });
        }
        
        // ریست تایمر
        this.resetTimer();
        this.startTimer();
        
        // بروزرسانی UI
        this.updateBoard();
        this.updateMoveHistory();
        this.updatePlayerCards();
        this.updateControls();
        this.updateStatusMessage();
        
        // بستن مودال‌ها
        this.closeModal(this.elements.winnerModal);
        this.closeModal(this.elements.drawModal);
        
        // پخش صدا
        this.soundManager.play('click');
        
        this.showToast('🎮 بازی جدید شروع شد!', 'success', 2000);
        
        // اگر نوبت AI است
        if (this.players[this.currentPlayer].type === 'ai') {
            setTimeout(() => this.makeAIMove(), 1000);
        }
    }

    // ========== شروع سریع ==========
    quickRestart() {
        this.newGame();
    }

    // ========== بازگشت به حرکت قبلی ==========
    undoMove() {
        if (this.moveHistoryIndex < 0) {
            this.showToast('❌ حرکتی برای بازگشت وجود ندارد', 'error', 2000);
            return;
        }
        
        const move = this.moveHistory[this.moveHistoryIndex];
        this.board[move.position] = null;
        this.moveHistoryIndex--;
        this.moveCount--;
        
        this.currentPlayer = move.player;
        this.gameActive = true;
        this.winner = null;
        this.winningPattern = null;
        
        // پاک کردن خطوط برنده
        document.querySelectorAll('.win-line').forEach(line => line.remove());
        if (this.elements.cells) {
            this.elements.cells.forEach(cell => cell.classList.remove('win-cell'));
        }
        
        this.updateBoard();
        this.updateMoveHistory();
        this.updatePlayerCards();
        this.updateControls();
        this.updateStatusMessage();
        
        this.soundManager.play('click');
        this.showToast('↩️ حرکت قبلی بازگردانی شد', 'info', 1500);
    }

    // ========== تکرار حرکت ==========
    redoMove() {
        if (this.moveHistoryIndex >= this.moveHistory.length - 1) {
            this.showToast('❌ حرکتی برای تکرار وجود ندارد', 'error', 2000);
            return;
        }
        
        this.moveHistoryIndex++;
        const move = this.moveHistory[this.moveHistoryIndex];
        this.board[move.position] = move.player;
        this.moveCount++;
        
        this.currentPlayer = move.player === 'X' ? 'O' : 'X';
        
        const winner = this.checkWinner();
        if (winner || this.isBoardFull()) {
            this.gameActive = false;
            this.endGame(winner || 'tie');
        }
        
        this.updateBoard();
        this.updateMoveHistory();
        this.updatePlayerCards();
        this.updateControls();
        this.updateStatusMessage();
        
        this.soundManager.play('click');
        this.showToast('↪️ حرکت تکرار شد', 'info', 1500);
    }

    // ========== تغییر حالت بازی ==========
    changeGameMode(mode) {
        this.gameMode = mode;
        this.aiDifficulty = mode;
        this.ai = new TicTacToeAI(mode, this.boardSize);
        
        if (mode === 'pvp') {
            this.players.X.type = 'human';
            this.players.O.type = 'human';
        } else {
            this.players.X.type = 'human';
            this.players.O.type = 'ai';
        }
        
        this.updatePlayerTypes();
        this.saveSettings();
        this.newGame();
        
        const modeNames = {
            'pvp': 'دو نفره',
            'easy': 'آسان',
            'medium': 'متوسط',
            'hard': 'سخت',
            'expert': 'استاد',
            'impossible': 'غیرممکن'
        };
        
        this.showToast(`🎯 حالت بازی به "${modeNames[mode]}" تغییر کرد`, 'success', 2000);
    }

    // ========== تغییر نوع بازیکن ==========
    togglePlayerType(player) {
        const currentType = this.players[player].type;
        this.players[player].type = currentType === 'human' ? 'ai' : 'human';
        
        this.updatePlayerTypes();
        
        if (this.gameMode !== 'pvp') {
            if (this.players.X.type === 'human' && this.players.O.type === 'human') {
                this.gameMode = 'pvp';
                this.elements.modeButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.mode === 'pvp');
                });
            } else {
                this.gameMode = 'custom';
            }
        }
        
        if (this.gameActive && this.players[this.currentPlayer].type === 'ai') {
            setTimeout(() => this.makeAIMove(), 500);
        }
        
        const typeText = this.players[player].type === 'human' ? 'انسان' : 'هوش مصنوعی';
        this.showToast(`👤 بازیکن ${player} به ${typeText} تغییر کرد`, 'info', 2000);
    }

    // ========== نمایش راهنمایی ==========
    showHint() {
        if (!this.gameActive) {
            this.showToast('❌ بازی فعال نیست', 'error', 2000);
            return;
        }
        
        if (!this.settings.autoSuggest) {
            this.showToast('💡 راهنمایی خودکار غیرفعال است', 'warning', 2000);
            return;
        }
        
        const hintMove = this.ai.getHint([...this.board], this.currentPlayer);
        
        if (hintMove !== null) {
            const row = Math.floor(hintMove / this.boardSize) + 1;
            const col = (hintMove % this.boardSize) + 1;
            
            if (this.elements.hintText) {
                this.elements.hintText.textContent = `💡 پیشنهاد: خانه ${row}، ستون ${col}`;
                this.elements.hintText.classList.add('hint-flash');
            }
            
            const cell = this.elements.cells[hintMove];
            if (cell) {
                cell.classList.add('hint-flash');
                setTimeout(() => cell.classList.remove('hint-flash'), 2000);
            }
            
            this.soundManager.play('hint');
            
            setTimeout(() => {
                if (this.elements.hintText) {
                    this.elements.hintText.classList.remove('hint-flash');
                }
            }, 3000);
        } else {
            if (this.elements.hintText) {
                this.elements.hintText.textContent = '❌ هیچ خانه خالی وجود ندارد!';
            }
            this.soundManager.play('error');
        }
    }

    // ========== تغییر اندازه تخته ==========
    changeBoardSize() {
        if (!this.elements.boardSize) return;
        
        const size = parseInt(this.elements.boardSize.value);
        this.boardSize = size;
        this.board = Array(size * size).fill(null);
        
        this.ai = new TicTacToeAI(this.aiDifficulty, size);
        this.createBoard();
        this.newGame();
        
        // بروزرسانی رویدادها برای سلول‌های جدید
        this.setupEventListeners();
        
        this.showToast(`📏 اندازه تخته به ${size}×${size} تغییر کرد`, 'success', 2000);
    }

    // ========== تغییر تم ==========
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.settings.theme = newTheme;
        
        const icon = this.elements.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        this.saveSettings();
        this.showToast(`🎨 تم ${newTheme === 'dark' ? 'تاریک' : 'روشن'} فعال شد`, 'info', 1500);
    }

    // ========== قطع/وصل صدا ==========
    toggleSound() {
        const enabled = this.soundManager.toggle();
        this.settings.soundEnabled = enabled;
        
        const icon = this.elements.soundToggle?.querySelector('i');
        if (icon) {
            icon.className = enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
        
        if (this.elements.soundToggle) {
            this.elements.soundToggle.classList.toggle('active', enabled);
        }
        
        if (this.elements.soundEffects) {
            this.elements.soundEffects.checked = enabled;
        }
        
        this.saveSettings();
        
        if (enabled) {
            this.soundManager.play('click');
            this.showToast('🔊 صدا فعال شد', 'success', 1500);
        } else {
            this.showToast('🔇 صدا غیرفعال شد', 'info', 1500);
        }
    }

    // ========== ریست آمار ==========
    resetStats() {
        if (!confirm('⚠️ آیا از بازنشانی تمام آمار و امتیازات اطمینان دارید؟')) return;
        
        this.players.X = {
            ...this.players.X,
            score: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            games: 0,
            streak: 0,
            winRate: 0
        };
        
        this.players.O = {
            ...this.players.O,
            score: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            games: 0,
            streak: 0,
            winRate: 0
        };
        
        this.stats = {
            totalGames: 0,
            totalDraws: 0,
            totalTime: 0,
            winStreak: 0,
            currentStreak: 0,
            fastestWin: null,
            xWins: 0,
            oWins: 0
        };
        
        Object.keys(this.achievements).forEach(key => {
            this.achievements[key].unlocked = false;
            this.achievements[key].progress = 0;
        });
        
        this.updatePlayerStats();
        this.updateStats();
        this.saveStats();
        
        this.soundManager.play('click');
        this.showToast('📊 تمام آمار بازنشانی شدند', 'success', 3000);
    }

    // ========== تایمر ==========
    startTimer() {
        this.timer.startTime = Date.now();
        this.timer.elapsedSeconds = 0;
        
        if (this.timer.interval) {
            clearInterval(this.timer.interval);
        }
        
        this.timer.interval = setInterval(() => {
            this.timer.elapsedSeconds = Math.floor((Date.now() - this.timer.startTime) / 1000);
            
            const minutes = Math.floor(this.timer.elapsedSeconds / 60);
            const seconds = this.timer.elapsedSeconds % 60;
            
            if (this.elements.gameTimer) {
                this.elements.gameTimer.innerHTML = `
                    <i class="fas fa-hourglass-half"></i>
                    <span>${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</span>
                `;
            }
            
            if (this.settings.moveTimeLimit - this.timer.elapsedSeconds <= 10) {
                this.elements.gameTimer?.classList.add('timer-pulse');
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer.interval) {
            clearInterval(this.timer.interval);
            this.timer.interval = null;
        }
        
        this.elements.gameTimer?.classList.remove('timer-pulse');
    }

    resetTimer() {
        this.stopTimer();
        this.timer.elapsedSeconds = 0;
        
        if (this.elements.gameTimer) {
            this.elements.gameTimer.innerHTML = `
                <i class="fas fa-hourglass-half"></i>
                <span>00:00</span>
            `;
        }
    }

    // ========== بروزرسانی سطح بازیکن ==========
    updatePlayerLevel(player) {
        const score = this.players[player].score;
        
        if (score >= 5000) {
            this.players[player].level = 'الماس';
        } else if (score >= 3000) {
            this.players[player].level = 'پلاتینیوم';
        } else if (score >= 2000) {
            this.players[player].level = 'طلا';
        } else if (score >= 1000) {
            this.players[player].level = 'نقره';
        } else if (score >= 500) {
            this.players[player].level = 'برنز';
        } else {
            this.players[player].level = 'آهنی';
        }
    }

    // ========== بررسی دستاوردها ==========
    checkAchievements(player, moves, time, xpGain) {
        // اولین برد
        if (this.players[player].wins === 1) {
            this.unlockAchievement('firstWin');
        }
        
        // برد متوالی
        if (this.players[player].streak >= 5) {
            this.achievements.winStreak5.progress = this.players[player].streak;
            if (this.players[player].streak >= 5) {
                this.unlockAchievement('winStreak5');
            }
        }
        
        if (this.players[player].streak >= 10) {
            this.achievements.winStreak10.progress = this.players[player].streak;
            if (this.players[player].streak >= 10) {
                this.unlockAchievement('winStreak10');
            }
        }
        
        // سریع‌ترین برد
        if (time <= 20) {
            this.unlockAchievement('fastestWin');
        }
        
        // بازی عالی (بدون اشتباه)
        if (moves <= 5 && player === 'X') {
            this.unlockAchievement('perfectGame');
        }
        
        // شکست استاد
        if (this.aiDifficulty === 'expert' && player === 'X') {
            this.achievements.beatExpert.progress++;
            if (this.achievements.beatExpert.progress >= this.achievements.beatExpert.total) {
                this.unlockAchievement('beatExpert');
            }
        }
        
        // شکست‌ناپذیر
        if (this.players[player].losses === 0 && this.players[player].games >= 10) {
            this.unlockAchievement('noLosses');
        }
        
        // استاد دوز
        if (this.players[player].wins >= 100) {
            this.unlockAchievement('master');
        }
    }

    // ========== باز کردن دستاورد ==========
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        achievement.progress = achievement.total;
        
        this.showToast(`🏆 دستاورد جدید: ${achievement.name}`, 'success', 5000);
        this.soundManager.play('win');
        
        // ذخیره دستاوردها
        this.saveStats();
    }

    // ========== بارگذاری تنظیمات ==========
    async loadSettings() {
        const savedSettings = this.storageManager.getSettings();
        this.settings = { ...this.settings, ...savedSettings };
        
        // اعمال تنظیمات
        this.soundManager.enabled = this.settings.soundEnabled;
        
        if (this.elements.moveTime) {
            this.elements.moveTime.value = this.settings.moveTimeLimit;
        }
        
        if (this.elements.moveTimeValue) {
            this.elements.moveTimeValue.textContent = this.settings.moveTimeLimit;
        }
        
        if (this.elements.soundEffects) {
            this.elements.soundEffects.checked = this.settings.soundEnabled;
        }
        
        if (this.elements.animations) {
            this.elements.animations.checked = this.settings.animations;
        }
        
        if (this.elements.highlightMoves) {
            this.elements.highlightMoves.checked = this.settings.highlightMoves;
        }
        
        if (this.elements.autoSuggest) {
            this.elements.autoSuggest.checked = this.settings.autoSuggest;
        }
        
        if (this.elements.boardSize) {
            this.elements.boardSize.value = this.settings.boardSize;
        }
        
        // اعمال تم
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        if (this.elements.themeToggle) {
            const icon = this.elements.themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    saveSettings() {
        this.storageManager.saveSettings(this.settings);
    }

    // ========== بارگذاری آمار ==========
    async loadStats() {
        const savedStats = this.storageManager.getGameStats();
        
        if (savedStats) {
            if (savedStats.players) {
                this.players = { ...this.players, ...savedStats.players };
            }
            if (savedStats.stats) {
                this.stats = { ...this.stats, ...savedStats.stats };
            }
            if (savedStats.achievements) {
                this.achievements = { ...this.achievements, ...savedStats.achievements };
            }
        }
        
        // بارگذاری لیدربورد
        const leaderboard = this.storageManager.getLeaderboard();
        if (leaderboard && leaderboard.length > 0) {
            this.leaderboard = leaderboard;
        }
    }

    saveStats() {
        this.storageManager.saveGameStats({
            players: this.players,
            stats: this.stats,
            achievements: this.achievements
        });
    }

    // ========== بروزرسانی UI ==========
    updateUI() {
        this.updateBoard();
        this.updatePlayerStats();
        this.updatePlayerTypes();
        this.updatePlayerCards();
        this.updateStats();
        this.updateMoveHistory();
        this.updateControls();
        this.updateStatusMessage();
    }

    updateBoard() {
        if (!this.elements.cells) return;
        
        this.elements.cells.forEach((cell, index) => {
            const value = this.board[index];
            cell.textContent = value || '';
            cell.classList.toggle('x', value === 'X');
            cell.classList.toggle('o', value === 'O');
            cell.classList.toggle('occupied', value !== null);
            cell.classList.remove('cell-placeholder');
        });
    }

    updatePlayerCards() {
        const isXActive = this.currentPlayer === 'X';
        
        const playerXCard = document.querySelector('.player-x-card');
        const playerOCard = document.querySelector('.player-o-card');
        
        if (playerXCard) playerXCard.classList.toggle('active-player', isXActive);
        if (playerOCard) playerOCard.classList.toggle('active-player', !isXActive);
        
        if (this.elements.xTurnIndicator) {
            this.elements.xTurnIndicator.classList.toggle('current-turn', isXActive);
            this.elements.xTurnIndicator.style.display = 
                this.players.X.type === 'ai' && isXActive ? 'none' : 'flex';
        }
        
        if (this.elements.oTurnIndicator) {
            this.elements.oTurnIndicator.classList.toggle('current-turn', !isXActive);
            this.elements.oTurnIndicator.style.display = 
                this.players.O.type === 'ai' && !isXActive ? 'none' : 'flex';
        }
    }

    updatePlayerStats() {
        if (this.elements.playerXScore) {
            this.elements.playerXScore.textContent = this.players.X.score.toLocaleString();
        }
        
        if (this.elements.playerOScore) {
            this.elements.playerOScore.textContent = this.players.O.score.toLocaleString();
        }
        
        if (this.elements.playerXWins) {
            this.elements.playerXWins.textContent = this.players.X.wins;
        }
        
        if (this.elements.playerOWins) {
            this.elements.playerOWins.textContent = this.players.O.wins;
        }
        
        if (this.elements.playerXWinRate) {
            this.elements.playerXWinRate.textContent = `${this.players.X.winRate || 0}%`;
        }
        
        if (this.elements.playerOWinRate) {
            this.elements.playerOWinRate.textContent = `${this.players.O.winRate || 0}%`;
        }
        
        if (this.elements.playerXLevel) {
            this.elements.playerXLevel.textContent = this.players.X.level;
        }
        
        if (this.elements.playerOLevel) {
            this.elements.playerOLevel.textContent = this.players.O.level;
        }
    }

    updatePlayerTypes() {
        if (this.elements.playerXType) {
            this.elements.playerXType.textContent = this.players.X.type === 'human' ? 'انسان' : 'هوش مصنوعی';
            this.elements.playerXType.className = `player-type-badge ${this.players.X.type}`;
        }
        
        if (this.elements.playerOType) {
            this.elements.playerOType.textContent = this.players.O.type === 'human' ? 'انسان' : 'هوش مصنوعی';
            this.elements.playerOType.className = `player-type-badge ${this.players.O.type}`;
        }
    }

    updateStats() {
        if (this.elements.totalGames) {
            this.elements.totalGames.textContent = this.stats.totalGames;
        }
        
        if (this.elements.totalDraws) {
            this.elements.totalDraws.textContent = this.stats.totalDraws;
        }
        
        if (this.elements.totalTime) {
            this.elements.totalTime.textContent = Math.floor(this.stats.totalTime / 60);
        }
        
        if (this.elements.winStreak) {
            this.elements.winStreak.textContent = this.stats.winStreak;
        }
        
        if (this.elements.currentStreak) {
            this.elements.currentStreak.textContent = this.stats.currentStreak;
        }
    }

    updateMoveHistory() {
        if (!this.elements.movesList) return;
        
        this.elements.movesList.innerHTML = '';
        
        if (this.moveHistory.length === 0) {
            this.elements.movesList.innerHTML = '<div class="empty-moves">هنوز حرکتی انجام نشده است</div>';
            return;
        }
        
        const startIndex = Math.max(0, this.moveHistoryIndex - 9);
        const movesToShow = this.moveHistory.slice(startIndex, this.moveHistoryIndex + 1);
        
        movesToShow.forEach((move, idx) => {
            const moveElement = document.createElement('div');
            moveElement.className = 'move-item';
            
            const row = Math.floor(move.position / this.boardSize) + 1;
            const col = (move.position % this.boardSize) + 1;
            
            moveElement.innerHTML = `
                <div class="move-number">${startIndex + idx + 1}</div>
                <div class="move-player ${move.player.toLowerCase()}-move">${move.player}</div>
                <div class="move-info">
                    <div class="move-position">خانه ${row}، ستون ${col}</div>
                    <div class="move-time">${Math.floor(move.time / 60)}:${(move.time % 60).toString().padStart(2, '0')}</div>
                </div>
            `;
            
            this.elements.movesList.appendChild(moveElement);
        });
        
        this.elements.movesList.scrollTop = this.elements.movesList.scrollHeight;
    }

    updateControls() {
        if (this.elements.undoBtn) {
            this.elements.undoBtn.disabled = this.moveHistoryIndex < 0;
        }
        
        if (this.elements.redoBtn) {
            this.elements.redoBtn.disabled = this.moveHistoryIndex >= this.moveHistory.length - 1;
        }
        
        if (this.elements.hintBtn) {
            this.elements.hintBtn.disabled = !this.gameActive || !this.settings.autoSuggest;
        }
    }

    updateStatusMessage() {
        if (!this.elements.statusText) return;
        
        if (!this.gameActive) {
            const winner = this.checkWinner();
            if (winner) {
                this.elements.statusText.textContent = `🏆 بازیکن ${winner} برنده شد!`;
            } else if (this.isBoardFull()) {
                this.elements.statusText.textContent = '🤝 بازی مساوی شد!';
            }
        } else {
            const playerName = this.currentPlayer === 'X' ? 'بازیکن X' : 'بازیکن O';
            const playerType = this.players[this.currentPlayer].type;
            
            if (playerType === 'ai') {
                this.elements.statusText.textContent = `🤖 نوبت هوش مصنوعی (${playerName})`;
            } else {
                this.elements.statusText.textContent = `🎯 نوبت ${playerName}`;
            }
        }
    }

    // ========== نمایش Toast ==========
    showToast(message, type = 'info', duration = 3000) {
        // ایجاد المان toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        switch(type) {
            case 'success': icon = '✅'; break;
            case 'error': icon = '❌'; break;
            case 'warning': icon = '⚠️'; break;
            default: icon = 'ℹ️';
        }
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">${message}</div>
        `;
        
        // اضافه کردن استایل toast
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-gradient)' : 
                       type === 'error' ? 'var(--danger-gradient)' : 
                       type === 'warning' ? 'var(--warning-gradient)' : 
                       'var(--info-gradient)'};
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            box-shadow: var(--shadow-xl);
            z-index: var(--z-toast);
            animation: slideIn 0.3s ease-out;
            direction: rtl;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ========== کنفتی ==========
    createConfetti(count = 100) {
        if (!this.settings.animations) return;
        
        const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            const x = Math.random() * 100;
            const y = -10;
            const size = Math.random() * 12 + 8;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            confetti.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                animation: confettiFall ${duration}s ease-out ${delay}s forwards;
                position: fixed;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                transform: rotate(${Math.random() * 360}deg);
                opacity: 0.8;
                z-index: var(--z-modal);
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), (duration + delay) * 1000);
        }
    }

    // ========== اشتراک‌گذاری نتیجه ==========
    shareResult() {
        const winner = this.checkWinner();
        const moves = this.moveCount;
        const time = this.timer.elapsedSeconds;
        
        const shareText = `🎮 من در بازی دوز حرفه‌ای برنده شدم!\n` +
                         `🏆 بازیکن ${winner} با ${moves} حرکت و ${time} ثانیه\n` +
                         `⭐ امتیاز کسب شده: ${Math.floor(100 / moves) + 50}\n` +
                         `🎯 ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'برد در بازی دوز حرفه‌ای!',
                text: shareText,
                url: window.location.href
            }).catch(() => {
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('✅ نتیجه در کلیپ‌بورد کپی شد!', 'success', 2000);
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showToast('✅ نتیجه در کلیپ‌بورد کپی شد!', 'success', 2000);
    }

    // ========== نمایش لیدربورد ==========
    showLeaderboard() {
        const leaderboardHtml = this.leaderboard.map((entry, index) => `
            <div class="record-item">
                <span class="record-rank rank-${index + 1}">
                    ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <div class="record-info">
                    <div class="record-name">${entry.name}</div>
                    <div class="record-score">${entry.wins} برد • ${entry.score} امتیاز</div>
                </div>
                <span class="player-level" style="background: var(--gradient-gold); padding: 4px 8px; border-radius: 20px; font-size: 12px;">${entry.level}</span>
            </div>
        `).join('');
        
        // ایجاد مودال لیدربورد
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>🏆 برترین بازیکنان</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="records-list" style="margin-bottom: 20px;">
                        ${leaderboardHtml}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">باشه</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // ========== تغییر پنل موبایل ==========
    switchMobilePanel(panel) {
        const playerPanel = document.querySelector('.player-panel');
        const gameBoard = document.querySelector('.game-board-wrapper');
        const settingsPanel = document.querySelector('.settings-panel');
        
        if (!playerPanel || !gameBoard || !settingsPanel) return;
        
        if (panel === 'game') {
            playerPanel.style.display = 'none';
            gameBoard.style.display = 'block';
            settingsPanel.style.display = 'none';
        } else if (panel === 'players') {
            playerPanel.style.display = 'block';
            gameBoard.style.display = 'none';
            settingsPanel.style.display = 'none';
        } else if (panel === 'settings') {
            playerPanel.style.display = 'none';
            gameBoard.style.display = 'none';
            settingsPanel.style.display = 'block';
        } else if (panel === 'stats') {
            this.showLeaderboard();
        }
    }

    // ========== کیبورد ==========
    handleKeyboard(e) {
        // Ctrl + N: بازی جدید
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            this.newGame();
        }
        
        // Ctrl + Z: بازگشت
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            this.undoMove();
        }
        
        // Ctrl + Y: تکرار
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            this.redoMove();
        }
        
        // Ctrl + H: راهنمایی
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            this.showHint();
        }
        
        // Ctrl + R: شروع سریع
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            this.quickRestart();
        }
        
        // Escape: بستن مودال‌ها
        if (e.key === 'Escape') {
            if (this.activeModal) {
                this.closeModal(this.activeModal);
            }
        }
        
        // اعداد 1-9: حرکت سریع
        if (this.gameActive && this.players[this.currentPlayer].type === 'human') {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9 && num <= this.board.length) {
                const index = num - 1;
                if (this.board[index] === null) {
                    this.makeMove(index);
                }
            }
        }
    }

    // ========== ریسپانسیو ==========
    handleResize() {
        const isMobile = window.innerWidth <= 1024;
        const mobileControls = document.querySelector('.mobile-controls');
        
        if (mobileControls) {
            mobileControls.style.display = isMobile ? 'block' : 'none';
        }
        
        if (!isMobile) {
            const playerPanel = document.querySelector('.player-panel');
            const gameBoard = document.querySelector('.game-board-wrapper');
            const settingsPanel = document.querySelector('.settings-panel');
            
            if (playerPanel) playerPanel.style.display = '';
            if (gameBoard) gameBoard.style.display = '';
            if (settingsPanel) settingsPanel.style.display = '';
        }
    }

    // ========== پاکسازی ==========
    destroy() {
        this.stopTimer();
        this.saveStats();
        this.saveSettings();
        
        // پاکسازی رویدادها
        document.removeEventListener('keydown', this.handleKeyboard);
        window.removeEventListener('resize', this.handleResize);
        
        console.log('🧹 بازی پاکسازی شد');
    }
}

// --------------------------------------------
// ۶. راه‌اندازی بازی
// --------------------------------------------

let gameInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new TicTacToeGame();
    gameInstance.init();
});

// --------------------------------------------
// ۷. نمایش اطلاعات در کنسول
// --------------------------------------------

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🎮 TIC TAC TOE PRO - بازی دوز حرفه‌ای                  ║
║                                                              ║
║     نسخه: ${GAME_VERSION}                                          ║
║     توسعه: ${STUDIO_NAME}                                 ║
║     تاریخ: ${BUILD_DATE}                                        ║
║                                                              ║
║     ⚡ ویژگی‌های ویژه:                                       ║
║     • هوش مصنوعی ۵ سطحی با الگوریتم Minimax                ║
║     • گرافیک 4K و انیمیشن‌های سینمایی                      ║
║     • سیستم دستاوردها و رتبه‌بندی                          ║
║     • ذخیره‌سازی خودکار آمار و تنظیمات                     ║
║     • پشتیبانی کامل از RTL و فارسی                         ║
║     • طراحی واکنش‌گرا برای موبایل و تبلت                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

console.log('✨ میانبرهای کیبورد:');
console.log('   📌 Ctrl+N: بازی جدید');
console.log('   📌 Ctrl+Z: بازگشت');
console.log('   📌 Ctrl+Y: تکرار');
console.log('   📌 Ctrl+H: راهنمایی');
console.log('   📌 Ctrl+R: شروع سریع');
console.log('   📌 1-9: حرکت سریع');
console.log('   📌 ESC: بستن مودال');

// --------------------------------------------
// ۸. هندلینگ خطاهای سراسری
// --------------------------------------------

window.onerror = function(message, source, lineno, colno, error) {
    console.error('❌ خطای سراسری:', {
        message,
        source,
        line: lineno,
        column: colno,
        error
    });
    
    if (gameInstance) {
        gameInstance.showToast('❌ خطایی رخ داد! لطفاً صفحه را بازخوانی کنید.', 'error', 5000);
    }
    
    return true;
};

window.onunhandledrejection = function(event) {
    console.error('❌ خطای Promise:', event.reason);
    
    if (gameInstance) {
        gameInstance.showToast('❌ خطا در پردازش درخواست!', 'error', 5000);
    }
};

// --------------------------------------------
// ۹. پاکسازی هنگام خروج
// --------------------------------------------

window.addEventListener('beforeunload', () => {
    if (gameInstance) {
        gameInstance.destroy();
    }
});

// ============================================
// پایان فایل اسکریپت
// توسعه توسط Ali369 Studio
// ============================================
