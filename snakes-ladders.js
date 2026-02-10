// snakes-ladders.js - بخش اول
// منطق کامل بازی مار و پله

// کلاس اصلی بازی
class SnakesAndLaddersGame {
    constructor() {
        // متغیرهای بازی
        this.config = {
            boardSize: 100,
            minPlayers: 2,
            maxPlayers: 4,
            defaultPlayerColors: [
                { name: 'قرمز', hex: '#ef4444', icon: '🚀' },
                { name: 'آبی', hex: '#3b82f6', icon: '👑' },
                { name: 'سبز', hex: '#10b981', icon: '⭐' },
                { name: 'زرد', hex: '#f59e0b', icon: '⚡' }
            ],
            snakes: [
                { from: 98, to: 45, length: 15 },
                { from: 95, to: 75, length: 12 },
                { from: 87, to: 24, length: 20 },
                { from: 64, to: 60, length: 4 },
                { from: 62, to: 19, length: 15 },
                { from: 56, to: 53, length: 3 },
                { from: 49, to: 11, length: 15 },
                { from: 47, to: 26, length: 12 },
                { from: 16, to: 6, length: 10 }
            ],
            ladders: [
                { from: 2, to: 38, length: 12 },
                { from: 4, to: 14, length: 10 },
                { from: 8, to: 31, length: 12 },
                { from: 21, to: 42, length: 10 },
                { from: 28, to: 84, length: 20 },
                { from: 36, to: 44, length: 8 },
                { from: 51, to: 67, length: 8 },
                { from: 71, to: 91, length: 10 },
                { from: 80, to: 100, length: 10 }
            ],
            seasons: [
                { 
                    name: 'بهار', 
                    icon: '🌱',
                    effect: 'شانس نردبان +۲۰٪',
                    bonus: { ladderChance: 0.2 },
                    weather: 'sunny'
                },
                { 
                    name: 'تابستان', 
                    icon: '☀️',
                    effect: 'تاس‌های بالاتر',
                    bonus: { diceBonus: 1 },
                    weather: 'sunny'
                },
                { 
                    name: 'پاییز', 
                    icon: '🍂',
                    effect: 'مارها کوتاه‌تر',
                    bonus: { snakeReduction: 0.3 },
                    weather: 'windy'
                },
                { 
                    name: 'زمستان', 
                    icon: '❄️',
                    effect: 'حرکت آهسته',
                    bonus: { moveDelay: 500 },
                    weather: 'snowy'
                }
            ],
            powerups: [
                {
                    id: 'double',
                    name: 'تاس دوبل',
                    description: '۲ بار تاس می‌اندازید',
                    icon: 'fas fa-dice-d6',
                    color: '#f59e0b',
                    cost: 50,
                    maxUses: 3
                },
                {
                    id: 'shield',
                    name: 'محافظ مار',
                    description: 'در برابر یک مار ایمن هستید',
                    icon: 'fas fa-shield-alt',
                    color: '#3b82f6',
                    cost: 75,
                    maxUses: 2
                },
                {
                    id: 'teleport',
                    name: 'تلپورت',
                    description: 'به هر خانه‌ای بروید',
                    icon: 'fas fa-random',
                    color: '#8b5cf6',
                    cost: 100,
                    maxUses: 1
                },
                {
                    id: 'freeze',
                    name: 'انجماد',
                    description: 'حریف یک نوبت نمی‌اندازد',
                    icon: 'fas fa-snowflake',
                    color: '#06b6d4',
                    cost: 60,
                    maxUses: 2
                }
            ],
            achievements: [
                {
                    id: 'first_game',
                    title: 'اولین بازی',
                    description: 'اولین بازی خود را انجام دهید',
                    icon: 'fas fa-play-circle',
                    reward: 100,
                    condition: (stats) => stats.gamesPlayed >= 1
                },
                {
                    id: 'snake_master',
                    title: 'مارگیر حرفه‌ای',
                    description: '۱۰ بار از مار پایین بروید',
                    icon: 'fas fa-snake',
                    reward: 250,
                    condition: (stats) => stats.snakeBites >= 10
                },
                {
                    id: 'ladder_climber',
                    title: 'نردبان‌بان',
                    description: '۲۰ بار از نردبان بالا بروید',
                    icon: 'fas fa-ladder-ladder',
                    reward: 300,
                    condition: (stats) => stats.ladderClimbs >= 20
                },
                {
                    id: 'fast_winner',
                    title: 'سریع‌ترین',
                    description: 'در کمتر از ۳ دقیقه برنده شوید',
                    icon: 'fas fa-bolt',
                    reward: 200,
                    condition: (stats) => stats.fastestWin <= 180
                },
                {
                    id: 'perfect_game',
                    title: 'بازی کامل',
                    description: 'بدون افتادن روی مار برنده شوید',
                    icon: 'fas fa-crown',
                    reward: 500,
                    condition: (stats) => stats.perfectWins >= 1
                }
            ]
        };

        // وضعیت بازی
        this.state = {
            gameActive: false,
            gameMode: 'classic', // classic, advanced, speed, tournament
            players: [],
            currentPlayerIndex: 0,
            diceValue: 0,
            moveHistory: [],
            round: 1,
            turnTimer: 30,
            seasonIndex: 0,
            weather: 'sunny',
            powerups: {},
            shopItems: [],
            achievements: [],
            statistics: {
                totalGames: 0,
                totalWins: 0,
                totalRolls: 0,
                totalSnakes: 0,
                totalLadders: 0,
                maxDice: 0,
                minDice: 6,
                avgDice: 0,
                maxMoves: 0,
                fastestWin: null,
                longestGame: 0,
                totalCoins: 1000
            }
        };

        // عناصر DOM
        this.elements = {};
        
        // تایمرها
        this.timers = {
            game: null,
            turn: null,
            animation: null
        };

        // صداها
        this.audio = {
            enabled: true,
            volume: 0.5
        };

        // انیمیشن‌ها
        this.animations = {
            enabled: true,
            speed: 'normal' // slow, normal, fast
        };

        // ذخیره‌سازی
        this.storage = {
            enabled: true,
            key: 'snakesAndLaddersGame'
        };

        // هوش مصنوعی
        this.ai = {
            difficulty: 'medium', // easy, medium, hard
            thinkingDelay: 1000
        };

        this.init();
    }

    // مقداردهی اولیه
    init() {
        console.log('🎲 شروع بازی مار و پله...');
        
        // ذخیره نمونه بازی در window برای دسترسی جهانی
        window.snakesAndLaddersGame = this;
        
        // کش کردن عناصر DOM
        this.cacheElements();
        
        // اتصال رویدادها
        this.bindEvents();
        
        // بارگذاری از localStorage
        this.loadFromStorage();
        
        // ایجاد تخته بازی
        this.createGameBoard();
        
        // ایجاد بازیکنان اولیه
        this.createInitialPlayers();
        
        // ایجاد فصل
        this.updateSeason();
        
        // ایجاد قدرت‌ها
        this.initPowerups();
        
        // به‌روزرسانی نمایش
        this.updateDisplay();
        
        // شروع موسیقی زمینه
        this.startBackgroundMusic();
        
        console.log('✅ بازی آماده است!');
    }

    // کش کردن عناصر DOM
    cacheElements() {
        // عناصر اصلی
        this.elements = {
            // صفحه بارگذاری
            gameLoading: document.getElementById('game-loading'),
            
            // تخته بازی
            gameBoard: document.getElementById('gameBoard'),
            boardElements: document.getElementById('boardElements'),
            playersOnBoard: document.getElementById('playersOnBoard'),
            specialEffects: document.getElementById('specialEffects'),
            weatherEffect: document.getElementById('weatherEffect'),
            
            // اطلاعات بازیکنان
            playersContainer: document.getElementById('playersContainer'),
            customPlayers: document.getElementById('customPlayers'),
            
            // تاس
            mainDice: document.getElementById('mainDice'),
            rollDiceBtn: document.getElementById('rollDiceBtn'),
            lastRollValue: document.getElementById('lastRollValue'),
            diceHistory: document.getElementById('diceHistory'),
            
            // قدرت‌ها
            doubleCount: document.getElementById('doubleCount'),
            shieldCount: document.getElementById('shieldCount'),
            teleportCount: document.getElementById('teleportCount'),
            freezeCount: document.getElementById('freezeCount'),
            playerCoins: document.getElementById('playerCoins'),
            
            // فصل و آب‌وهوا
            seasonIcon: document.getElementById('seasonIcon'),
            seasonName: document.getElementById('seasonName'),
            seasonEffect: document.getElementById('seasonEffect'),
            
            // آمار
            totalWins: document.getElementById('totalWins'),
            totalRolls: document.getElementById('totalRolls'),
            totalSnakes: document.getElementById('totalSnakes'),
            totalLadders: document.getElementById('totalLadders'),
            maxDice: document.getElementById('maxDice'),
            minDice: document.getElementById('minDice'),
            avgDice: document.getElementById('avgDice'),
            maxMoves: document.getElementById('maxMoves'),
            fastestWin: document.getElementById('fastestWin'),
            longestGame: document.getElementById('longestGame'),
            
            // رویدادها
            eventsList: document.getElementById('eventsList'),
            currentPlayerName: document.getElementById('currentPlayerName'),
            currentPlayerStatus: document.getElementById('currentPlayerStatus'),
            currentPosition: document.getElementById('currentPosition'),
            currentScore: document.getElementById('currentScore'),
            currentMoves: document.getElementById('currentMoves'),
            
            // کنترل‌ها
            newGameBtn: document.getElementById('newGameBtn'),
            pauseGameBtn: document.getElementById('pauseGameBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            helpBtn: document.getElementById('helpBtn'),
            
            // چت
            chatMessages: document.getElementById('chatMessages'),
            chatInput: document.getElementById('chatInput'),
            sendMessageBtn: document.getElementById('sendMessageBtn'),
            
            // مودال‌ها
            winnerModal: document.getElementById('winnerModal'),
            settingsModal: document.getElementById('settingsModal'),
            helpModal: document.getElementById('helpModal'),
            
            // موسیقی
            musicPlayer: document.getElementById('musicPlayer'),
            backgroundMusic: document.getElementById('backgroundMusic')
        };
    }

    // اتصال رویدادها
    bindEvents() {
        // دکمه تاس
        if (this.elements.rollDiceBtn) {
            this.elements.rollDiceBtn.addEventListener('click', () => this.rollDice());
        }

        // دکمه‌های بازی جدید
        if (this.elements.newGameBtn) {
            this.elements.newGameBtn.addEventListener('click', () => this.startNewGame());
        }

        // دکمه مکث
        if (this.elements.pauseGameBtn) {
            this.elements.pauseGameBtn.addEventListener('click', () => this.togglePause());
        }

        // دکمه تنظیمات
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // دکمه راهنما
        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => this.showHelp());
        }

        // دکمه ارسال چت
        if (this.elements.sendMessageBtn && this.elements.chatInput) {
            this.elements.sendMessageBtn.addEventListener('click', () => this.sendChatMessage());
            this.elements.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
            });
        }

        // انتخاب تعداد بازیکنان
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const count = e.target.dataset.count;
                this.changePlayerCount(count);
            });
        });

        // تغییر حالت بازی
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.changeGameMode(mode);
            });
        });

        // دکمه قدرت‌ها
        document.querySelectorAll('.powerup-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const powerupId = e.currentTarget.dataset.powerup;
                this.usePowerup(powerupId);
            });
        });

        // دکمه خرید
        document.querySelectorAll('.btn-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.shop-item');
                const itemId = item.dataset.item;
                const cost = parseInt(item.dataset.cost);
                this.buyShopItem(itemId, cost);
            });
        });

        // پیام‌های سریع چت
        document.querySelectorAll('.quick-msg').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.dataset.msg;
                this.sendQuickMessage(message);
            });
        });

        // دکمه‌های مودال
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });

        // دکمه‌های بازی مجدد
        const modalRematch = document.getElementById('modalRematch');
        if (modalRematch) {
            modalRematch.addEventListener('click', () => {
                this.elements.winnerModal.style.display = 'none';
                this.startNewGame();
            });
        }

        // مدیریت تب‌های تنظیمات
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchSettingsTab(tabId);
            });
        });

        // تنظیمات سریع
        document.getElementById('autoRoll')?.addEventListener('change', (e) => {
            this.config.autoRoll = e.target.checked;
        });

        document.getElementById('showAnimations')?.addEventListener('change', (e) => {
            this.animations.enabled = e.target.checked;
        });

        document.getElementById('soundEffects')?.addEventListener('change', (e) => {
            this.audio.enabled = e.target.checked;
            this.toggleAudio(e.target.checked);
        });

        // کنترل‌های موسیقی
        const musicToggle = document.getElementById('musicToggle');
        if (musicToggle) {
            musicToggle.addEventListener('click', () => this.toggleMusic());
        }

        // اسلایدر حجم صدا
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }

        // بستن مودال با کلیک بیرون
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // مدیریت کلیدهای کیبورد
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // جلوگیری از کلیک راست
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.game-board-container')) {
                e.preventDefault();
            }
        });

        console.log('✅ رویدادها متصل شدند');
    }

    // ایجاد تخته بازی
    createGameBoard() {
        const board = this.elements.gameBoard;
        const elements = this.elements.boardElements;
        
        if (!board || !elements) return;
        
        // پاکسازی تخته
        board.innerHTML = '';
        elements.innerHTML = '';
        
        // ایجاد 100 خانه (از 100 به 1)
        for (let i = this.config.boardSize; i >= 1; i--) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.dataset.number = i;
            cell.dataset.index = i;
            
            // محاسبات موقعیت (مارپیچ از پایین راست)
            const row = Math.floor((i - 1) / 10);
            const col = (row % 2 === 0) ? 9 - ((i - 1) % 10) : (i - 1) % 10;
            
            cell.style.gridColumn = `${col + 1} / span 1`;
            cell.style.gridRow = `${row + 1} / span 1`;
            
            // محتوای خانه
            cell.innerHTML = `
                <div class="cell-number">${i}</div>
                ${i === 100 ? '<div class="victory-crown">👑</div>' : ''}
                ${i === 1 ? '<div class="start-flag">🚩</div>' : ''}
            `;
            
            // اضافه کردن کلاس‌های ویژه
            if (i === 1) cell.classList.add('start-cell');
            if (i === 100) cell.classList.add('end-cell');
            
            // خانه‌های خوش‌یمن
            if (i === 6 || i === 25 || i === 44 || i === 65 || i === 88) {
                cell.classList.add('lucky-cell');
                cell.innerHTML += '<div class="cell-sparkle"></div>';
            }
            
            // خانه‌های چالش‌برانگیز
            if (i === 13 || i === 42 || i === 69 || i === 84) {
                cell.classList.add('challenge-cell');
                cell.innerHTML += '<div class="mini-game-indicator"></div>';
            }
            
            board.appendChild(cell);
        }
        
        // ایجاد مارها
        this.config.snakes.forEach((snake, index) => {
            const snakeEl = this.createSnakeElement(snake, index);
            if (snakeEl) elements.appendChild(snakeEl);
        });
        
        // ایجاد نردبان‌ها
        this.config.ladders.forEach((ladder, index) => {
            const ladderEl = this.createLadderElement(ladder, index);
            if (ladderEl) elements.appendChild(ladderEl);
        });
        
        console.log('✅ تخته بازی ایجاد شد');
    }

    // ایجاد عنصر مار
    createSnakeElement(snake, index) {
        const snakeEl = document.createElement('div');
        snakeEl.className = 'snake-element';
        snakeEl.dataset.from = snake.from;
        snakeEl.dataset.to = snake.to;
        snakeEl.dataset.snakeId = index;
        
        // محاسبات موقعیت
        const fromCell = document.querySelector(`.board-cell[data-number="${snake.from}"]`);
        const toCell = document.querySelector(`.board-cell[data-number="${snake.to}"]`);
        
        if (!fromCell || !toCell) return null;
        
        const fromRect = fromCell.getBoundingClientRect();
        const toRect = toCell.getBoundingClientRect();
        const boardRect = this.elements.gameBoard.getBoundingClientRect();
        
        // محاسبه مختصات نسبی
        const fromX = (fromRect.left + fromRect.width / 2 - boardRect.left) / boardRect.width * 100;
        const fromY = (fromRect.top + fromRect.height / 2 - boardRect.top) / boardRect.height * 100;
        const toX = (toRect.left + toRect.width / 2 - boardRect.left) / boardRect.width * 100;
        const toY = (toRect.top + toRect.height / 2 - boardRect.top) / boardRect.height * 100;
        
        // محاسبات برای نمایش منحنی مار
        const deltaX = toX - fromX;
        const deltaY = toY - fromY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // تنظیم موقعیت و استایل
        snakeEl.style.position = 'absolute';
        snakeEl.style.left = `${Math.min(fromX, toX)}%`;
        snakeEl.style.top = `${Math.min(fromY, toY)}%`;
        snakeEl.style.width = `${distance}%`;
        snakeEl.style.height = '8px';
        snakeEl.style.transform = `rotate(${angle}deg)`;
        snakeEl.style.transformOrigin = 'left center';
        
        // ایجاد بخش‌های مار
        snakeEl.innerHTML = `
            <div class="snake-head">
                <i class="fas fa-snake"></i>
            </div>
            <div class="snake-body"></div>
            <div class="snake-tail"></div>
        `;
        
        return snakeEl;
    }

    // ایجاد عنصر نردبان
    createLadderElement(ladder, index) {
        const ladderEl = document.createElement('div');
        ladderEl.className = 'ladder-element';
        ladderEl.dataset.from = ladder.from;
        ladderEl.dataset.to = ladder.to;
        ladderEl.dataset.ladderId = index;
        
        // محاسبات موقعیت (مشابه مار)
        const fromCell = document.querySelector(`.board-cell[data-number="${ladder.from}"]`);
        const toCell = document.querySelector(`.board-cell[data-number="${ladder.to}"]`);
        
        if (!fromCell || !toCell) return null;
        
        const fromRect = fromCell.getBoundingClientRect();
        const toRect = toCell.getBoundingClientRect();
        const boardRect = this.elements.gameBoard.getBoundingClientRect();
        
        const fromX = (fromRect.left + fromRect.width / 2 - boardRect.left) / boardRect.width * 100;
        const fromY = (fromRect.top + fromRect.height / 2 - boardRect.top) / boardRect.height * 100;
        const toX = (toRect.left + toRect.width / 2 - boardRect.left) / boardRect.width * 100;
        const toY = (toRect.top + toRect.height / 2 - boardRect.top) / boardRect.height * 100;
        
        const deltaX = toX - fromX;
        const deltaY = toY - fromY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        ladderEl.style.position = 'absolute';
        ladderEl.style.left = `${Math.min(fromX, toX)}%`;
        ladderEl.style.top = `${Math.min(fromY, toY)}%`;
        ladderEl.style.width = '20px';
        ladderEl.style.height = `${distance}%`;
        ladderEl.style.transform = `rotate(${angle}deg)`;
        ladderEl.style.transformOrigin = 'center top';
        
        // تعداد پله‌ها
        const steps = Math.max(3, Math.floor(distance / 10));
        
        ladderEl.innerHTML = `
            <div class="ladder-top">
                <i class="fas fa-ladder-ladder"></i>
            </div>
            <div class="ladder-steps">
                ${Array(steps).fill().map((_, i) => 
                    `<div class="ladder-step" style="top: ${(i + 1) * (100 / (steps + 1))}%"></div>`
                ).join('')}
            </div>
            <div class="ladder-bottom"></div>
        `;
        
        return ladderEl;
    }

    // ایجاد بازیکنان اولیه
    createInitialPlayers() {
        this.state.players = [];
        
        // ایجاد 2 بازیکن اولیه
        for (let i = 0; i < 2; i++) {
            const player = this.createPlayer(i + 1);
            this.state.players.push(player);
        }
        
        // به‌روزرسانی نمایش بازیکنان
        this.updatePlayersDisplay();
        
        console.log('✅ بازیکنان اولیه ایجاد شدند');
    }

    // ایجاد یک بازیکن
    createPlayer(id, isAI = false) {
        const colorConfig = this.config.defaultPlayerColors[(id - 1) % this.config.defaultPlayerColors.length];
        
        return {
            id: id,
            name: `بازیکن ${id}`,
            color: colorConfig.hex,
            icon: colorConfig.icon,
            position: 0,
            score: 0,
            moves: 0,
            diceRolls: [],
            snakesBitten: 0,
            laddersClimbed: 0,
            powerups: {
                double: 0,
                shield: 0,
                teleport: 0,
                freeze: 0
            },
            isAI: isAI,
            aiLevel: isAI ? this.ai.difficulty : null,
            turn: false,
            shieldActive: false,
            frozen: false,
            winStreak: 0,
            totalWins: 0,
            createdAt: Date.now()
        };
    }

    // به‌روزرسانی نمایش بازیکنان
    updatePlayersDisplay() {
        const container = this.elements.playersContainer;
        const boardContainer = this.elements.playersOnBoard;
        
        if (!container || !boardContainer) return;
        
        // پاکسازی قبلی
        container.innerHTML = '';
        boardContainer.innerHTML = '';
        
        // ایجاد کارت هر بازیکن
        this.state.players.forEach((player, index) => {
            // کارت بازیکن
            const playerCard = this.createPlayerCard(player, index === this.state.currentPlayerIndex);
            container.appendChild(playerCard);
            
            // مهره روی تخته
            const playerPiece = this.createPlayerPiece(player);
            boardContainer.appendChild(playerPiece);
            
            // موقعیت‌یابی مهره
            this.updatePlayerPosition(player);
        });
        
        // به‌روزرسانی نمایش نوبت
        this.updateTurnDisplay();
    }

    // ایجاد کارت بازیکن
    createPlayerCard(player, isActive) {
        const card = document.createElement('div');
        card.className = `player-card ${isActive ? 'active' : ''}`;
        card.dataset.playerId = player.id;
        
        const progressPercent = (player.position / this.config.boardSize) * 100;
        
        card.innerHTML = `
            <div class="player-card-header">
                <div class="player-avatar" style="background: ${player.color}">
                    <span class="player-icon">${player.icon}</span>
                    ${player.isAI ? '<span class="ai-badge">🤖</span>' : ''}
                </div>
                <div class="player-info">
                    <h5 class="player-name">${player.name}</h5>
                    <div class="player-status">
                        ${player.turn ? '🎲 نوبت شماست' : '⏳ منتظر نوبت'}
                        ${player.frozen ? ' ❄️ منجمد' : ''}
                        ${player.shieldActive ? ' 🛡️ محافظت شده' : ''}
                    </div>
                </div>
            </div>
            <div class="player-card-body">
                <div class="player-stats">
                    <div class="player-stat">
                        <span>موقعیت:</span>
                        <span class="stat-value position">${player.position}</span>
                    </div>
                    <div class="player-stat">
                        <span>حرکات:</span>
                        <span class="stat-value moves">${player.moves}</span>
                    </div>
                    <div class="player-stat">
                        <span>برد:</span>
                        <span class="stat-value wins">${player.totalWins}</span>
                    </div>
                </div>
                <div class="player-progress">
                    <div class="progress-label">
                        <span>پیشرفت</span>
                        <span>${progressPercent.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                ${player.isAI ? '<div class="ai-thinking" style="display: none;">🤖 در حال فکر کردن...</div>' : ''}
            </div>
        `;
        
        return card;
    }

    // ایجاد مهره بازیکن
    createPlayerPiece(player) {
        const piece = document.createElement('div');
        piece.className = 'player-piece';
        piece.dataset.playerId = player.id;
        piece.style.backgroundColor = player.color;
        
        piece.innerHTML = `
            <div class="piece-icon">${player.icon}</div>
            <div class="piece-number">${player.id}</div>
            ${player.shieldActive ? '<div class="piece-shield">🛡️</div>' : ''}
            ${player.frozen ? '<div class="piece-frozen">❄️</div>' : ''}
        `;
        
        return piece;
    }

    // به‌روزرسانی موقعیت مهره
    updatePlayerPosition(player) {
        const piece = document.querySelector(`.player-piece[data-player-id="${player.id}"]`);
        if (!piece || !this.elements.gameBoard) return;
        
        if (player.position === 0) {
            piece.style.display = 'none';
            return;
        }
        
        piece.style.display = 'block';
        
        // پیدا کردن خانه مربوطه
        const cell = document.querySelector(`.board-cell[data-number="${player.position}"]`);
        if (!cell) return;
        
        const boardRect = this.elements.gameBoard.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();
        
        // محاسبه موقعیت نسبی
        const x = (cellRect.left + cellRect.width / 2 - boardRect.left) / boardRect.width * 100;
        const y = (cellRect.top + cellRect.height / 2 - boardRect.top) / boardRect.height * 100;
        
        // تنظیم موقعیت با افست برای چند بازیکن
        const playerIndex = this.state.players.findIndex(p => p.id === player.id);
        const offsetX = (playerIndex % 3) * 10 - 10;
        const offsetY = Math.floor(playerIndex / 3) * 10 - 10;
        
        piece.style.left = `${x + offsetX}%`;
        piece.style.top = `${y + offsetY}%`;
    }

    // تغییر تعداد بازیکنان
    changePlayerCount(count) {
        if (this.state.gameActive) {
            if (!confirm('تغییر تعداد بازیکنان باعث ریست بازی می‌شود. آیا ادامه می‌دهید؟')) {
                return;
            }
        }
        
        // به‌روزرسانی دکمه‌های انتخاب
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.count === count);
        });
        
        // ایجاد بازیکنان جدید
        this.state.players = [];
        let playerCount = 2;
        
        if (count === 'ai') {
            // 1 بازیکن انسانی + 1 هوش مصنوعی
            this.state.players.push(this.createPlayer(1, false));
            this.state.players.push(this.createPlayer(2, true));
            playerCount = 2;
        } else {
            playerCount = parseInt(count);
            for (let i = 0; i < playerCount; i++) {
                this.state.players.push(this.createPlayer(i + 1, false));
            }
        }
        
        // ریست بازی
        this.resetGame();
        
        // به‌روزرسانی نمایش
        this.updatePlayersDisplay();
        
        // اضافه کردن رویداد
        this.addGameEvent(`تعداد بازیکنان به ${playerCount} تغییر کرد`, 'info');
    }

    // تغییر حالت بازی
    changeGameMode(mode) {
        this.state.gameMode = mode;
        
        // به‌روزرسانی دکمه‌ها
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // اعمال قوانین حالت جدید
        this.applyGameModeRules();
        
        // اضافه کردن رویداد
        this.addGameEvent(`حالت بازی به ${this.getModeName(mode)} تغییر کرد`, 'info');
    }

    // دریافت نام حالت بازی
    getModeName(mode) {
        const names = {
            classic: 'کلاسیک',
            advanced: 'پیشرفته',
            speed: 'سرعتی',
            tournament: 'تورنمنت'
        };
        return names[mode] || mode;
    }

    // اعمال قوانین حالت بازی
    applyGameModeRules() {
        // تنظیم تایمر نوبت بر اساس حالت
        switch (this.state.gameMode) {
            case 'speed':
                this.state.turnTimer = 15;
                break;
            case 'tournament':
                this.state.turnTimer = 45;
                break;
            default:
                this.state.turnTimer = 30;
        }
        
        // به‌روزرسانی نمایش تایمر
        this.updateTurnTimerDisplay();
    }

    // شروع بازی جدید
    startNewGame() {
        if (this.state.gameActive) {
            if (!confirm('بازی در حال انجام است. آیا می‌خواهید بازی جدید شروع کنید؟')) {
                return;
            }
        }
        
        // ریست وضعیت بازی
        this.resetGame();
        
        // شروع بازی
        this.state.gameActive = true;
        this.state.round = 1;
        
        // فعال کردن دکمه تاس برای بازیکن اول
        this.enableDiceRoll();
        
        // به‌روزرسانی نمایش
        this.updateDisplay();
        
        // شروع تایمر بازی
        this.startGameTimer();
        
        // اضافه کردن رویداد
        this.addGameEvent('🎮 بازی جدید شروع شد!', 'success');
        this.addGameEvent(`نوبت ${this.getCurrentPlayer().name} است`, 'info');
        
        // پخش موسیقی
        this.playSound('game_start');
    }

    // ریست بازی
    resetGame() {
        // ریست وضعیت بازیکنان
        this.state.players.forEach(player => {
            player.position = 0;
            player.moves = 0;
            player.diceRolls = [];
            player.snakesBitten = 0;
            player.laddersClimbed = 0;
            player.shieldActive = false;
            player.frozen = false;
            player.turn = false;
        });
        
        // تنظیم بازیکن اول
        this.state.currentPlayerIndex = 0;
        this.state.players[0].turn = true;
        
        // ریست تاس
        this.state.diceValue = 0;
        
        // پاکسازی تاریخچه
        this.state.moveHistory = [];
        
        // به‌روزرسانی نمایش
        this.updatePlayersDisplay();
        this.updateDiceHistory();
        this.clearEvents();
        
        // توقف تایمرها
        this.stopAllTimers();
        
        console.log('✅ بازی ریست شد');
    }

    // انداختن تاس
    rollDice() {
        if (!this.state.gameActive) return;
        
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer.frozen) {
            this.addGameEvent(`${currentPlayer.name} منجمد است و نمی‌تواند تاس بیندازد!`, 'warning');
            this.nextTurn();
            return;
        }
        
        // غیرفعال کردن دکمه تاس
        this.disableDiceRoll();
        
        // انیمیشن تاس
        this.animateDiceRoll();
        
        // تولید عدد تصادفی با در نظر گرفتن فصل
        const baseRoll = Math.floor(Math.random() * 6) + 1;
        const seasonBonus = this.getSeasonBonus();
        let finalRoll = baseRoll;
        
        if (seasonBonus.diceBonus) {
            finalRoll = Math.min(6, baseRoll + seasonBonus.diceBonus);
        }
        
        // ذخیره مقدار تاس
        this.state.diceValue = finalRoll;
        
        // به‌روزرسانی آمار
        this.updateDiceStatistics(finalRoll);
        currentPlayer.diceRolls.push(finalRoll);
        
        // نمایش نتیجه با تأخیر
        setTimeout(() => {
            this.showDiceResult(finalRoll);
            
            // حرکت بازیکن
            setTimeout(() => {
                this.movePlayer(finalRoll);
            }, 1000);
        }, 500);
    }

    // انیمیشن تاس
    animateDiceRoll() {
        const dice = this.elements.mainDice;
        if (!dice) return;
        
        dice.classList.add('dice-rolling');
        
        // پخش صدای تاس
        this.playSound('dice');
        
        // چرخش‌های تصادفی
        const rotations = Math.floor(Math.random() * 3) + 2;
        const duration = rotations * 100;
        
        // انیمیشن 3D
        dice.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        dice.style.transform = `
            rotateX(${Math.random() * 360}deg) 
            rotateY(${Math.random() * 360}deg) 
            rotateZ(${Math.random() * 360}deg)
        `;
        
        // بازنشانی بعد از انیمیشن
        setTimeout(() => {
            dice.classList.remove('dice-rolling');
            dice.style.transition = 'none';
            dice.style.transform = 'rotateX(20deg) rotateY(20deg)';
        }, duration);
    }

    // نمایش نتیجه تاس
    showDiceResult(value) {
        // به‌روزرسانی نمایش
        if (this.elements.lastRollValue) {
            this.elements.lastRollValue.textContent = value;
            this.elements.lastRollValue.classList.add('animate__animated', 'animate__bounceIn');
            setTimeout(() => {
                this.elements.lastRollValue.classList.remove('animate__bounceIn');
            }, 1000);
        }
        
        // اضافه کردن به تاریخچه
        this.addToDiceHistory(value);
        
        // اضافه کردن رویداد
        const player = this.getCurrentPlayer();
        this.addGameEvent(`🎲 ${player.name} عدد ${value} آورد!`, 'info');
        
        // نمایش افکت
        this.createMagicEffect(50, 50, '#f59e0b');
        this.showFloatingNumber(value, 50, 50, '#f59e0b');
    }

    // حرکت بازیکن
    async movePlayer(steps) {
        const player = this.getCurrentPlayer();
        const startPosition = player.position;
        let newPosition = startPosition + steps;
        
        // بررسی برنده شدن
        if (newPosition >= this.config.boardSize) {
            newPosition = this.config.boardSize;
            await this.animatePlayerMovement(player, startPosition, newPosition);
            this.handleWin(player);
            return;
        }
        
        // حرکت عادی
        await this.animatePlayerMovement(player, startPosition, newPosition);
        
        // بررسی مار یا نردبان
        const specialMove = this.checkSpecialMove(newPosition);
        
        if (specialMove) {
            if (specialMove.type === 'snake' && player.shieldActive) {
                this.addGameEvent(`🛡️ ${player.name} توسط محافظ از مار در امان ماند!`, 'success');
                player.shieldActive = false;
            } else {
                await this.handleSpecialMove(player, specialMove);
            }
        }
        
        // به‌روزرسانی وضعیت بازیکن
        player.position = newPosition;
        player.moves++;
        
        // بررسی برنده شدن بعد از حرکت خاص
        if (player.position >= this.config.boardSize) {
            this.handleWin(player);
            return;
        }
        
        // رفتن به نوبت بعدی
        this.nextTurn();
    }

    // انیمیشن حرکت بازیکن
    animatePlayerMovement(player, from, to) {
        return new Promise((resolve) => {
            const piece = document.querySelector(`.player-piece[data-player-id="${player.id}"]`);
            if (!piece || from === to) {
                resolve();
                return;
            }
            
            // تعداد مراحل انیمیشن
            const steps = Math.abs(to - from);
            const duration = Math.min(2000, steps * 100);
            const interval = 50;
            const stepCount = duration / interval;
            let currentStep = 0;
            
            // محاسبه مسیر
            const path = this.calculateMovementPath(from, to);
            
            // شروع انیمیشن
            piece.classList.add('player-moving');
            
            const animation = setInterval(() => {
                if (currentStep >= stepCount) {
                    clearInterval(animation);
                    piece.classList.remove('player-moving');
                    
                    // افکت پایان حرکت
                    this.createMagicEffect(
                        parseFloat(piece.style.left),
                        parseFloat(piece.style.top),
                        player.color
                    );
                    
                    resolve();
                    return;
                }
                
                // محاسبه موقعیت فعلی در مسیر
                const progress = currentStep / stepCount;
                const pathIndex = Math.floor(progress * (path.length - 1));
                const currentCell = path[pathIndex];
                
                // به‌روزرسانی موقعیت مهره
                this.updatePlayerPiecePosition(piece, currentCell);
                
                // ایجاد رد پا
                if (currentStep % 2 === 0) {
                    this.createPlayerTrail(piece, player.color);
                }
                
                currentStep++;
            }, interval);
        });
    }

    // محاسبه مسیر حرکت
    calculateMovementPath(from, to) {
        const path = [];
        
        if (from < to) {
            // حرکت به جلو
            for (let i = from + 1; i <= to; i++) {
                path.push(i);
            }
        } else {
            // حرکت به عقب (برای حالت پیشرفته)
            for (let i = from - 1; i >= to; i--) {
                path.push(i);
            }
        }
        
        return path;
    }

    // به‌روزرسانی موقعیت مهره
    updatePlayerPiecePosition(piece, cellNumber) {
        const cell = document.querySelector(`.board-cell[data-number="${cellNumber}"]`);
        if (!cell || !this.elements.gameBoard) return;
        
        const boardRect = this.elements.gameBoard.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();
        
        const x = (cellRect.left + cellRect.width / 2 - boardRect.left) / boardRect.width * 100;
        const y = (cellRect.top + cellRect.height / 2 - boardRect.top) / boardRect.height * 100;
        
        piece.style.left = `${x}%`;
        piece.style.top = `${y}%`;
    }

    // ایجاد رد پای بازیکن
    createPlayerTrail(piece, color) {
        const trail = document.createElement('div');
        trail.className = 'player-trail';
        trail.style.backgroundColor = color;
        trail.style.left = piece.style.left;
        trail.style.top = piece.style.top;
        
        this.elements.specialEffects.appendChild(trail);
        
        // انیمیشن محو شدن
        setTimeout(() => {
            trail.style.opacity = '0';
            trail.style.transition = 'opacity 1s ease-out';
            
            setTimeout(() => {
                trail.remove();
            }, 1000);
        }, 100);
    }

    // بررسی حرکت خاص (مار یا نردبان)
    checkSpecialMove(position) {
        // بررسی مار
        const snake = this.config.snakes.find(s => s.from === position);
        if (snake) {
            return {
                type: 'snake',
                from: snake.from,
                to: snake.to,
                length: snake.length,
                id: this.config.snakes.indexOf(snake)
            };
        }
        
        // بررسی نردبان
        const ladder = this.config.ladders.find(l => l.from === position);
        if (ladder) {
            return {
                type: 'ladder',
                from: ladder.from,
                to: ladder.to,
                length: ladder.length,
                id: this.config.ladders.indexOf(ladder)
            };
        }
        
        return null;
    }

    // مدیریت حرکت خاص
    async handleSpecialMove(player, specialMove) {
        if (specialMove.type === 'snake') {
            await this.handleSnakeBite(player, specialMove);
        } else if (specialMove.type === 'ladder') {
            await this.handleLadderClimb(player, specialMove);
        }
    }

    // مدیریت گزیده شدن توسط مار
    async handleSnakeBite(player, snake) {
        // پخش صدا
        this.playSound('snake');
        
        // انیمیشن مار
        const snakeElement = document.querySelector(`.snake-element[data-snake-id="${snake.id}"]`);
        if (snakeElement) {
            snakeElement.classList.add('snake-animation');
            setTimeout(() => {
                snakeElement.classList.remove('snake-animation');
            }, 1000);
        }
        
        // اضافه کردن رویداد
        this.addGameEvent(`🐍 ${player.name} توسط مار گزیده شد! از ${snake.from} به ${snake.to}`, 'warning');
        
        // انیمیشن سقوط
        await this.animatePlayerMovement(player, snake.from, snake.to);
        
        // به‌روزرسانی آمار
        player.position = snake.to;
        player.snakesBitten++;
        this.state.statistics.totalSnakes++;
        
        // بروزرسانی نمایش
        this.updatePlayerPosition(player);
        this.updateStatistics();
    }

    // مدیریت بالا رفتن از نردبان
    async handleLadderClimb(player, ladder) {
        // پخش صدا
        this.playSound('ladder');
        
        // انیمیشن نردبان
        const ladderElement = document.querySelector(`.ladder-element[data-ladder-id="${ladder.id}"]`);
        if (ladderElement) {
            ladderElement.classList.add('ladder-animation');
            setTimeout(() => {
                ladderElement.classList.remove('ladder-animation');
            }, 1000);
        }
        
        // اضافه کردن رویداد
        this.addGameEvent(`🪜 ${player.name} از نردبان بالا رفت! از ${ladder.from} به ${ladder.to}`, 'success');
        
        // انیمیشن بالا رفتن
        await this.animatePlayerMovement(player, ladder.from, ladder.to);
        
        // به‌روزرسانی آمار
        player.position = ladder.to;
        player.laddersClimbed++;
        this.state.statistics.totalLadders++;
        
        // بروزرسانی نمایش
        this.updatePlayerPosition(player);
        this.updateStatistics();
    }

    // رفتن به نوبت بعدی
    nextTurn() {
        // بازنشانی تایمر نوبت
        this.resetTurnTimer();
        
        // به‌روزرسالی شیلدها (یک نوبت اعتبار دارند)
        this.state.players.forEach(player => {
            if (player.shieldActive) {
                player.shieldActive = false;
            }
        });
        
        // تغییر بازیکن فعلی
        const currentPlayer = this.getCurrentPlayer();
        currentPlayer.turn = false;
        
        let nextPlayerIndex = this.state.currentPlayerIndex;
        let attempts = 0;
        
        // پیدا کردن بازیکن بعدی که منجمد نباشد
        do {
            nextPlayerIndex = (nextPlayerIndex + 1) % this.state.players.length;
            attempts++;
            
            if (attempts > this.state.players.length) {
                // اگر همه بازیکنان منجمد هستند، همه را آزاد کن
                this.state.players.forEach(p => p.frozen = false);
                break;
            }
        } while (this.state.players[nextPlayerIndex].frozen);
        
        this.state.currentPlayerIndex = nextPlayerIndex;
        const nextPlayer = this.getCurrentPlayer();
        nextPlayer.turn = true;
        
        // اگر بازیکن منجمد بود، نوبت را رد کن
        if (nextPlayer.frozen) {
            nextPlayer.frozen = false;
            this.addGameEvent(`❄️ ${nextPlayer.name} از انجماد آزاد شد!`, 'info');
            this.nextTurn();
            return;
        }
        
        // به‌روزرسانی نمایش
        this.updatePlayersDisplay();
        this.updateTurnDisplay();
        
        // شروع تایمر نوبت جدید
        this.startTurnTimer();
        
        // فعال کردن دکمه تاس
        this.enableDiceRoll();
        
        // اضافه کردن رویداد
        this.addGameEvent(`🔄 نوبت ${nextPlayer.name}`, 'info');
        
        // اگر بازیکن کامپیوتر است
        if (nextPlayer.isAI && this.state.gameActive) {
            this.handleAITurn(nextPlayer);
        }
    }

    // مدیریت نوبت هوش مصنوعی
    handleAITurn(player) {
        // نشان دادن وضعیت فکر کردن
        const aiIndicator = document.querySelector(`.player-card[data-player-id="${player.id}"] .ai-thinking`);
        if (aiIndicator) {
            aiIndicator.style.display = 'block';
        }
        
        // تأخیر برای طبیعی‌تر شدن
        setTimeout(() => {
            // مخفی کردن نشانگر فکر کردن
            if (aiIndicator) {
                aiIndicator.style.display = 'none';
            }
            
            // انداختن تاس
            this.rollDice();
        }, this.ai.thinkingDelay);
    }

    // فعال کردن دکمه تاس
    enableDiceRoll() {
        if (this.elements.rollDiceBtn) {
            this.elements.rollDiceBtn.disabled = false;
            this.elements.rollDiceBtn.classList.add('pulse-animation');
        }
    }

    // غیرفعال کردن دکمه تاس
    disableDiceRoll() {
        if (this.elements.rollDiceBtn) {
            this.elements.rollDiceBtn.disabled = true;
            this.elements.rollDiceBtn.classList.remove('pulse-animation');
        }
    }

    // مدیریت برنده شدن
    handleWin(player) {
        // توقف بازی
        this.state.gameActive = false;
        
        // توقف تایمرها
        this.stopAllTimers();
        
        // به‌روزرسالی آمار
        player.totalWins++;
        player.winStreak++;
        this.state.statistics.totalWins++;
        
        // محاسبه زمان بازی
        const gameTime = this.getGameTime();
        
        // بروزرسانی سریع‌ترین برد
        if (!this.state.statistics.fastestWin || gameTime < this.state.statistics.fastestWin) {
            this.state.statistics.fastestWin = gameTime;
        }
        
        // اضافه کردن رویداد
        this.addGameEvent(`🎉 ${player.name} برنده شد! در ${gameTime} ثانیه`, 'success');
        
        // نمایش کنفتی
        this.createConfetti(300);
        
        // پخش صدای برنده شدن
        this.playSound('win');
        
        // نمایش مودال برنده
        setTimeout(() => {
            this.showWinnerModal(player, gameTime);
        }, 1000);
        
        // ذخیره بازی
        this.saveToStorage();
    }

    // نمایش مودال برنده
    showWinnerModal(player, gameTime) {
        const modal = this.elements.winnerModal;
        if (!modal) return;
        
        // پر کردن اطلاعات
        document.getElementById('winnerName').textContent = player.name;
        document.getElementById('winnerStats').textContent = 
            `در ${player.moves} حرکت و ${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')} برنده شدید!`;
        
        document.getElementById('gameDuration').textContent = 
            `${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}`;
        document.getElementById('totalMoves').textContent = player.moves;
        document.getElementById('totalLaddersCount').textContent = player.laddersClimbed;
        document.getElementById('totalSnakesCount').textContent = player.snakesBitten;
        document.getElementById('maxDiceRoll').textContent = Math.max(...player.diceRolls);
        document.getElementById('minDiceRoll').textContent = Math.min(...player.diceRolls);
        
        // نمایش مودال
        modal.style.display = 'block';
    }

    // به‌روزرسانی فصل
    updateSeason() {
        // چرخش فصول
        this.state.seasonIndex = (this.state.seasonIndex + 1) % this.config.seasons.length;
        const season = this.config.seasons[this.state.seasonIndex];
        
        // به‌روزرسانی نمایش
        if (this.elements.seasonIcon) {
            this.elements.seasonIcon.innerHTML = season.icon;
            this.elements.seasonIcon.className = `season-icon season-${season.weather}`;
        }
        
        if (this.elements.seasonName) {
            this.elements.seasonName.textContent = season.name;
        }
        
        if (this.elements.seasonEffect) {
            this.elements.seasonEffect.textContent = season.effect;
        }
        
        // به‌روزرسالی آب‌وهوا
        this.state.weather = season.weather;
        this.updateWeatherEffects();
        
        // اضافه کردن رویداد
        this.addGameEvent(`🌤️ فصل به ${season.name} تغییر کرد: ${season.effect}`, 'info');
    }

    // دریافت مزایای فصل
    getSeasonBonus() {
        return this.config.seasons[this.state.seasonIndex].bonus;
    }

    // به‌روزرسانی افکت‌های آب‌وهوا
    updateWeatherEffects() {
        const weatherEffect = this.elements.weatherEffect;
        if (!weatherEffect) return;
        
        // پاکسازی افکت‌های قبلی
        weatherEffect.innerHTML = '';
        
        // ایجاد افکت بر اساس آب‌وهوا
        switch (this.state.weather) {
            case 'rainy':
                this.createRainEffect();
                break;
            case 'snowy':
                this.createSnowEffect();
                break;
            case 'windy':
                this.createWindEffect();
                break;
            case 'sunny':
                this.createSunEffect();
                break;
        }
    }

    // ایجاد افکت باران
    createRainEffect() {
        const weatherEffect = this.elements.weatherEffect;
        if (!weatherEffect) return;
        
        for (let i = 0; i < 50; i++) {
            const rainDrop = document.createElement('div');
            rainDrop.className = 'rain-particle';
            rainDrop.style.left = `${Math.random() * 100}%`;
            rainDrop.style.animationDelay = `${Math.random() * 2}s`;
            rainDrop.style.animationDuration = `${0.5 + Math.random() * 1}s`;
            weatherEffect.appendChild(rainDrop);
        }
    }

    // ایجاد افکت برف
    createSnowEffect() {
        const weatherEffect = this.elements.weatherEffect;
        if (!weatherEffect) return;
        
        for (let i = 0; i < 30; i++) {
            const snowFlake = document.createElement('div');
            snowFlake.className = 'snow-particle';
            snowFlake.style.left = `${Math.random() * 100}%`;
            snowFlake.style.animationDelay = `${Math.random() * 3}s`;
            snowFlake.style.animationDuration = `${3 + Math.random() * 2}s`;
            weatherEffect.appendChild(snowFlake);
        }
    }

    // ایجاد افکت باد
    createWindEffect() {
        // افکت‌های بصری برای باد
        const weatherEffect = this.elements.weatherEffect;
        if (!weatherEffect) return;
        
        // می‌توانید افکت‌های بیشتری اضافه کنید
    }

    // ایجاد افکت آفتاب
    createSunEffect() {
        const weatherEffect = this.elements.weatherEffect;
        if (!weatherEffect) return;
        
        const sun = document.createElement('div');
        sun.className = 'sun-effect';
        sun.style.position = 'absolute';
        sun.style.top = '20px';
        sun.style.right = '20px';
        sun.style.width = '60px';
        sun.style.height = '60px';
        sun.style.background = 'radial-gradient(circle, #f59e0b, #fbbf24)';
        sun.style.borderRadius = '50%';
        sun.style.boxShadow = '0 0 40px #f59e0b';
        sun.style.animation = 'pulse 2s infinite';
        weatherEffect.appendChild(sun);
    }

    // مقداردهی اولیه قدرت‌ها
    initPowerups() {
        // مقدار اولیه برای هر بازیکن
        this.state.players.forEach(player => {
            player.powerups = {
                double: 1,
                shield: 1,
                teleport: 0,
                freeze: 0
            };
        });
        
        // به‌روزرسانی نمایش
        this.updatePowerupsDisplay();
    }

    // استفاده از قدرت
    usePowerup(powerupId) {
        const player = this.getCurrentPlayer();
        
        if (!player.turn) {
            this.addGameEvent('فقط در نوبت خود می‌توانید از قدرت استفاده کنید', 'warning');
            return;
        }
        
        if (player.powerups[powerupId] <= 0) {
            this.addGameEvent(`قدرت ${this.getPowerupName(powerupId)} تمام شده است`, 'warning');
            return;
        }
        
        // استفاده از قدرت
        player.powerups[powerupId]--;
        
        // اعمال اثر قدرت
        this.applyPowerupEffect(powerupId, player);
        
        // به‌روزرسانی نمایش
        this.updatePowerupsDisplay();
        
        // اضافه کردن رویداد
        this.addGameEvent(`✨ ${player.name} از قدرت ${this.getPowerupName(powerupId)} استفاده کرد`, 'success');
        
        // پخش صدا
        this.playSound('powerup');
    }

    // دریافت نام قدرت
    getPowerupName(powerupId) {
        const powerup = this.config.powerups.find(p => p.id === powerupId);
        return powerup ? powerup.name : powerupId;
    }

    // اعمال اثر قدرت
    applyPowerupEffect(powerupId, player) {
        switch (powerupId) {
            case 'double':
                this.applyDoubleDicePowerup(player);
                break;
            case 'shield':
                this.applyShieldPowerup(player);
                break;
            case 'teleport':
                this.applyTeleportPowerup(player);
                break;
            case 'freeze':
                this.applyFreezePowerup(player);
                break;
        }
    }

    // قدرت تاس دوبل
    applyDoubleDicePowerup(player) {
        // اجازه دو بار تاس انداختن
        player.doubleDice = true;
        this.addGameEvent(`${player.name} می‌تواند ۲ بار تاس بیندازد!`, 'info');
    }

    // قدرت محافظ مار
    applyShieldPowerup(player) {
        player.shieldActive = true;
        this.addGameEvent(`🛡️ ${player.name} در برابر مارها محافظت شد!`, 'success');
    }

    // قدرت تلپورت
    applyTeleportPowerup(player) {
        // ایجاد دایالوگ برای انتخاب خانه مقصد
        const destination = prompt('به کدام خانه می‌خواهید بروید؟ (1-100)', player.position + 10);
        const destNum = parseInt(destination);
        
        if (destNum >= 1 && destNum <= 100 && !isNaN(destNum)) {
            const oldPosition = player.position;
            player.position = destNum;
            
            // انیمیشن تلپورت
            this.animateTeleport(player, oldPosition, destNum);
            
            this.addGameEvent(`🌀 ${player.name} به خانه ${destNum} تلپورت کرد!`, 'success');
            
            // بررسی برنده شدن
            if (destNum === 100) {
                this.handleWin(player);
            }
        } else {
            this.addGameEvent('تلپورت لغو شد', 'warning');
            player.powerups.teleport++; // بازگرداندن قدرت
        }
    }

    // انیمیشن تلپورت
    animateTeleport(player, from, to) {
        const piece = document.querySelector(`.player-piece[data-player-id="${player.id}"]`);
        if (!piece) return;
        
        // افکت تلپورت
        piece.classList.add('teleporting');
        
        // ایجاد افکت جادویی
        this.createMagicEffect(
            parseFloat(piece.style.left),
            parseFloat(piece.style.top),
            player.color
        );
        
        // تأخیر و انتقال
        setTimeout(() => {
            piece.style.display = 'none';
            
            setTimeout(() => {
                this.updatePlayerPosition(player);
                piece.style.display = 'block';
                piece.classList.remove('teleporting');
                
                // افکت ظهور
                this.createMagicEffect(
                    parseFloat(piece.style.left),
                    parseFloat(piece.style.top),
                    player.color
                );
            }, 500);
        }, 500);
    }

    // قدرت انجماد
    applyFreezePowerup(player) {
        // انتخاب حریف برای انجماد
        const opponents = this.state.players.filter(p => p.id !== player.id && !p.frozen);
        if (opponents.length === 0) {
            this.addGameEvent('هیچ حریف مناسبی برای انجماد وجود ندارد', 'warning');
            player.powerups.freeze++; // بازگرداندن قدرت
            return;
        }
        
        // انتخاب تصادفی یک حریف
        const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
        randomOpponent.frozen = true;
        
        this.addGameEvent(`❄️ ${randomOpponent.name} برای یک نوبت منجمد شد!`, 'info');
    }

    // خرید از فروشگاه
    buyShopItem(itemId, cost) {
        if (this.state.statistics.totalCoins < cost) {
            this.addGameEvent('سکه کافی ندارید!', 'warning');
            return;
        }
        
        const player = this.getCurrentPlayer();
        const powerup = this.config.powerups.find(p => p.id === itemId);
        
        if (!powerup) return;
        
        // بررسی محدودیت تعداد
        if (player.powerups[itemId] >= powerup.maxUses) {
            this.addGameEvent(`شما حداکثر ${powerup.maxUses} عدد از این قدرت را دارید`, 'warning');
            return;
        }
        
        // خرید
        this.state.statistics.totalCoins -= cost;
        player.powerups[itemId]++;
        
        // به‌روزرسانی نمایش
        this.updatePowerupsDisplay();
        this.updateCoinsDisplay();
        
        // اضافه کردن رویداد
        this.addGameEvent(`🛒 ${player.name} ${powerup.name} خریداری کرد!`, 'success');
        
        // پخش صدا
        this.playSound('buy');
    }

    // به‌روزرسانی نمایش قدرت‌ها
    updatePowerupsDisplay() {
        const player = this.getCurrentPlayer();
        
        // به‌روزرسانی تعداد قدرت‌ها
        if (this.elements.doubleCount) {
            this.elements.doubleCount.textContent = player.powerups.double;
        }
        
        if (this.elements.shieldCount) {
            this.elements.shieldCount.textContent = player.powerups.shield;
        }
        
        if (this.elements.teleportCount) {
            this.elements.teleportCount.textContent = player.powerups.teleport;
        }
        
        if (this.elements.freezeCount) {
            this.elements.freezeCount.textContent = player.powerups.freeze;
        }
        
        // فعال/غیرفعال کردن دکمه قدرت‌ها
        document.querySelectorAll('.powerup-item').forEach(item => {
            const powerupId = item.dataset.powerup;
            const count = player.powerups[powerupId];
            
            if (count <= 0) {
                item.classList.add('disabled');
                item.style.opacity = '0.5';
            } else {
                item.classList.remove('disabled');
                item.style.opacity = '1';
            }
        });
    }

    // به‌روزرسانی نمایش سکه‌ها
    updateCoinsDisplay() {
        if (this.elements.playerCoins) {
            this.elements.playerCoins.textContent = this.state.statistics.totalCoins;
        }
    }

    // به‌روزرسانی آمار تاس
    updateDiceStatistics(roll) {
        this.state.statistics.totalRolls++;
        
        // به‌روزرسانی بیشترین تاس
        if (roll > this.state.statistics.maxDice) {
            this.state.statistics.maxDice = roll;
        }
        
        // به‌روزرسانی کمترین تاس
        if (roll < this.state.statistics.minDice) {
            this.state.statistics.minDice = roll;
        }
        
        // محاسبه میانگین
        const totalRolls = this.state.statistics.totalRolls;
        const sum = this.state.statistics.avgDice * (totalRolls - 1) + roll;
        this.state.statistics.avgDice = sum / totalRolls;
        
        // به‌روزرسانی نمایش
        this.updateStatistics();
    }

    // به‌روزرسانی آمار کلی
    updateStatistics() {
        const stats = this.state.statistics;
        
        if (this.elements.totalWins) {
            this.elements.totalWins.textContent = stats.totalWins;
        }
        
        if (this.elements.totalRolls) {
            this.elements.totalRolls.textContent = stats.totalRolls;
        }
        
        if (this.elements.totalSnakes) {
            this.elements.totalSnakes.textContent = stats.totalSnakes;
        }
        
        if (this.elements.totalLadders) {
            this.elements.totalLadders.textContent = stats.totalLadders;
        }
        
        if (this.elements.maxDice) {
            this.elements.maxDice.textContent = stats.maxDice;
        }
        
        if (this.elements.minDice) {
            this.elements.minDice.textContent = stats.minDice === 6 ? 0 : stats.minDice;
        }
        
        if (this.elements.avgDice) {
            this.elements.avgDice.textContent = stats.avgDice.toFixed(1);
        }
        
        if (this.elements.maxMoves) {
            this.elements.maxMoves.textContent = stats.maxMoves;
        }
        
        if (this.elements.fastestWin) {
            if (stats.fastestWin) {
                const minutes = Math.floor(stats.fastestWin / 60);
                const seconds = stats.fastestWin % 60;
                this.elements.fastestWin.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                this.elements.fastestWin.textContent = '-';
            }
        }
        
        if (this.elements.longestGame) {
            this.elements.longestGame.textContent = stats.longestGame;
        }
    }

    // اضافه کردن به تاریخچه تاس‌ها
    addToDiceHistory(value) {
        const diceHistory = this.elements.diceHistory;
        if (!diceHistory) return;
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = value;
        historyItem.classList.add('animate__animated', 'animate__fadeIn');
        
        // اضافه کردن به ابتدای لیست
        diceHistory.insertBefore(historyItem, diceHistory.firstChild);
        
        // محدود کردن تعداد آیتم‌ها
        const maxHistory = 10;
        while (diceHistory.children.length > maxHistory) {
            diceHistory.removeChild(diceHistory.lastChild);
        }
    }

    // به‌روزرسالی تاریخچه تاس‌ها
    updateDiceHistory() {
        const diceHistory = this.elements.diceHistory;
        if (!diceHistory) return;
        
        diceHistory.innerHTML = '';
    }

    // اضافه کردن رویداد
    addGameEvent(text, type = 'info') {
        const eventsList = this.elements.eventsList;
        if (!eventsList) return;
        
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${type}`;
        
        const icons = {
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle',
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle'
        };
        
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        eventItem.innerHTML = `
            <div class="event-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="event-content">
                <div class="event-title">${text}</div>
                <div class="event-time">${timeString}</div>
            </div>
        `;
        
        // اضافه کردن به ابتدای لیست
        eventsList.insertBefore(eventItem, eventsList.firstChild);
        
        // محدود کردن تعداد رویدادها
        const maxEvents = 15;
        while (eventsList.children.length > maxEvents) {
            eventsList.removeChild(eventsList.lastChild);
        }
        
        // انیمیشن
        eventItem.classList.add('animate__animated', 'animate__fadeInRight');
        setTimeout(() => {
            eventItem.classList.remove('animate__fadeInRight');
        }, 1000);
    }

    // پاکسازی رویدادها
    clearEvents() {
        const eventsList = this.elements.eventsList;
        if (!eventsList) return;
        
        eventsList.innerHTML = `
            <div class="event-item welcome">
                <div class="event-icon">
                    <i class="fas fa-gamepad"></i>
                </div>
                <div class="event-content">
                    <div class="event-title">به بازی مار و پله خوش آمدید!</div>
                    <div class="event-time">همین الآن</div>
                </div>
            </div>
        `;
    }

    // به‌روزرسالی نمایش نوبت
    updateTurnDisplay() {
        const player = this.getCurrentPlayer();
        
        if (this.elements.currentPlayerName) {
            this.elements.currentPlayerName.textContent = player.name;
        }
        
        if (this.elements.currentPlayerStatus) {
            this.elements.currentPlayerStatus.textContent = player.turn ? 
                'نوبت شماست! تاس بیندازید' : 'منتظر نوبت';
        }
        
        if (this.elements.currentPosition) {
            this.elements.currentPosition.textContent = player.position;
        }
        
        if (this.elements.currentScore) {
            this.elements.currentScore.textContent = player.score;
        }
        
        if (this.elements.currentMoves) {
            this.elements.currentMoves.textContent = player.moves;
        }
    }

    // به‌روزرسالی نمایش کلی
    updateDisplay() {
        this.updatePlayersDisplay();
        this.updatePowerupsDisplay();
        this.updateCoinsDisplay();
        this.updateStatistics();
        this.updateTurnDisplay();
        this.updateTurnTimerDisplay();
    }

    // شروع تایمر بازی
    startGameTimer() {
        this.stopGameTimer();
        
        this.timers.game = setInterval(() => {
            // می‌توانید برای تورنمنت‌ها یا چالش‌های زمانی استفاده کنید
        }, 1000);
    }

    // توقف تایمر بازی
    stopGameTimer() {
        if (this.timers.game) {
            clearInterval(this.timers.game);
            this.timers.game = null;
        }
    }

    // شروع تایمر نوبت
    startTurnTimer() {
        this.stopTurnTimer();
        
        this.timers.turn = setInterval(() => {
            this.state.turnTimer--;
            this.updateTurnTimerDisplay();
            
            if (this.state.turnTimer <= 0) {
                this.handleTurnTimeout();
            }
        }, 1000);
    }

    // توقف تایمر نوبت
    stopTurnTimer() {
        if (this.timers.turn) {
            clearInterval(this.timers.turn);
            this.timers.turn = null;
        }
    }

    // بازنشانی تایمر نوبت
    resetTurnTimer() {
        this.stopTurnTimer();
        this.state.turnTimer = this.getTurnTimerDuration();
        this.updateTurnTimerDisplay();
    }

    // دریافت مدت زمان نوبت
    getTurnTimerDuration() {
        switch (this.state.gameMode) {
            case 'speed': return 15;
            case 'tournament': return 45;
            default: return 30;
        }
    }

    // به‌روزرسالی نمایش تایمر نوبت
    updateTurnTimerDisplay() {
        const timerElement = document.getElementById('turnTimer');
        if (timerElement) {
            timerElement.textContent = this.state.turnTimer;
            
            // تغییر رنگ در زمان کم
            if (this.state.turnTimer <= 10) {
                timerElement.style.color = '#ef4444';
                timerElement.classList.add('timer-pulse');
            } else if (this.state.turnTimer <= 20) {
                timerElement.style.color = '#f59e0b';
                timerElement.classList.remove('timer-pulse');
            } else {
                timerElement.style.color = '';
                timerElement.classList.remove('timer-pulse');
            }
        }
    }

    // مدیریت تمام شدن زمان نوبت
    handleTurnTimeout() {
        const player = this.getCurrentPlayer();
        
        this.addGameEvent(`⏰ وقت ${player.name} تمام شد!`, 'warning');
        this.nextTurn();
    }

    // توقف تمام تایمرها
    stopAllTimers() {
        this.stopGameTimer();
        this.stopTurnTimer();
    }

    // مکث/ادامه بازی
    togglePause() {
        if (!this.state.gameActive) return;
        
        if (this.timers.turn) {
            // مکث
            this.stopAllTimers();
            this.state.gameActive = false;
            this.addGameEvent('⏸️ بازی مکث شد', 'warning');
            
            // تغییر آیکون دکمه
            const pauseBtn = this.elements.pauseGameBtn;
            if (pauseBtn) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> ادامه بازی';
            }
        } else {
            // ادامه
            this.state.gameActive = true;
            this.startTurnTimer();
            this.addGameEvent('▶️ بازی ادامه یافت', 'success');
            
            // تغییر آیکون دکمه
            const pauseBtn = this.elements.pauseGameBtn;
            if (pauseBtn) {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> مکث بازی';
            }
        }
    }

    // نمایش تنظیمات
    showSettings() {
        const modal = this.elements.settingsModal;
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // نمایش راهنما
    showHelp() {
        const modal = this.elements.helpModal;
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // تغییر تب تنظیمات
    switchSettingsTab(tabId) {
        // حذف active از همه تب‌ها
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // اضافه کردن active به تب انتخاب شده
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const tabContent = document.getElementById(`${tabId}Tab`);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
    }

    // ارسال پیام چت
    sendChatMessage() {
        const input = this.elements.chatInput;
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        this.addChatMessage('شما', message);
        input.value = '';
        
        // پاسخ خودکار
        setTimeout(() => {
            this.sendAutoReply();
        }, 1000);
    }

    // ارسال پیام سریع
    sendQuickMessage(message) {
        this.addChatMessage('شما', message);
        
        // پاسخ خودکار
        setTimeout(() => {
            this.sendAutoReply();
        }, 1000);
    }

    // اضافه کردن پیام چت
    addChatMessage(sender, message) {
        const chatMessages = this.elements.chatMessages;
        if (!chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender === 'شما' ? 'own' : 'other'}`;
        
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        messageEl.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-content">${message}</div>
            <div class="message-time">${timeString}</div>
        `;
        
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ارسال پاسخ خودکار
    sendAutoReply() {
        const replies = [
            'بازی جالبیه!',
            'منم همون فکر رو می‌کردم!',
            'شانس با تو یار است!',
            'مراقب مار بعدی باش!',
            'آفرین! حرکت خوبی بود.',
            'اومممم... جالبه!',
            'من دارم می‌بازم؟ 😅',
            'یه بار دیگه تاس بنداز!',
            'خیلی نزدیک شدی!',
            'وای! اون مار بدی بود!'
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        this.addChatMessage('حریف', randomReply);
    }

    // دریافت بازیکن جاری
    getCurrentPlayer() {
        return this.state.players[this.state.currentPlayerIndex];
    }

    // دریافت زمان بازی
    getGameTime() {
        // در این نسخه ساده، از زمان واقعی استفاده نمی‌کنیم
        // در نسخه کامل باید زمان شروع بازی ذخیره شود
        return Math.floor(Math.random() * 300) + 60; // زمان تصادفی برای نمونه
    }

    // ایجاد افکت جادویی
    createMagicEffect(x, y, color = '#3b82f6') {
        if (!this.animations.enabled) return;
        
        const effects = this.elements.specialEffects;
        if (!effects) return;
        
        const effect = document.createElement('div');
        effect.className = 'magic-effect';
        effect.style.left = `${x}%`;
        effect.style.top = `${y}%`;
        effect.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
        
        effects.appendChild(effect);
        
        // انیمیشن
        effect.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(3)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });
        
        // حذف بعد از انیمیشن
        setTimeout(() => {
            effect.remove();
        }, 1000);
    }

    // نمایش عدد شناور
    showFloatingNumber(number, x, y, color = '#ffffff') {
        if (!this.animations.enabled) return;
        
        const effects = this.elements.specialEffects;
        if (!effects) return;
        
        const floatNumber = document.createElement('div');
        floatNumber.className = 'floating-number';
        floatNumber.textContent = `+${number}`;
        floatNumber.style.color = color;
        floatNumber.style.left = `${x}%`;
        floatNumber.style.top = `${y}%`;
        
        effects.appendChild(floatNumber);
        
        // انیمیشن
        setTimeout(() => {
            floatNumber.style.transition = 'all 1s ease-out';
            floatNumber.style.transform = 'translateY(-50px)';
            floatNumber.style.opacity = '0';
            
            setTimeout(() => {
                floatNumber.remove();
            }, 1000);
        }, 100);
    }

    // ایجاد کنفتی
    createConfetti(count = 100) {
        if (!this.animations.enabled) return;
        
        const effects = this.elements.specialEffects;
        if (!effects) return;
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // موقعیت تصادفی
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `${Math.random() * 100}%`;
            
            // رنگ تصادفی
            const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // اندازه تصادفی
            const size = Math.random() * 15 + 5;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            // انیمیشن
            const duration = Math.random() * 3 + 2;
            confetti.style.animation = `confettiRain ${duration}s linear forwards`;
            
            effects.appendChild(confetti);
            
            // حذف بعد از انیمیشن
            setTimeout(() => {
                confetti.remove();
            }, duration * 1000);
        }
    }

    // پخش صدا
    playSound(soundType) {
        if (!this.audio.enabled) return;
        
        const audioElements = {
            dice: document.getElementById('diceSound'),
            snake: document.getElementById('snakeSound'),
            ladder: document.getElementById('ladderSound'),
            win: document.getElementById('winSound'),
            click: document.getElementById('clickSound'),
            powerup: document.getElementById('powerupSound'),
            buy: document.getElementById('clickSound'),
            game_start: document.getElementById('ladderSound')
        };
        
        const sound = audioElements[soundType];
        if (sound) {
            sound.volume = this.audio.volume;
            sound.currentTime = 0;
            sound.play().catch(e => console.log("صدا پخش نشد:", e));
        }
    }

    // تغییر وضعیت صدا
    toggleAudio(enabled) {
        this.audio.enabled = enabled;
        
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            const icon = soundToggle.querySelector('i');
            if (enabled) {
                icon.classList.remove('fa-volume-mute');
                icon.classList.add('fa-volume-up');
            } else {
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-volume-mute');
            }
        }
    }

    // تغییر وضعیت موسیقی
    toggleMusic() {
        const music = this.elements.backgroundMusic;
        const musicToggle = document.getElementById('musicToggle');
        
        if (!music || !musicToggle) return;
        
        const icon = musicToggle.querySelector('i');
        
        if (music.paused) {
            music.play();
            icon.classList.remove('fa-volume-mute');
            icon.classList.add('fa-music');
        } else {
            music.pause();
            icon.classList.remove('fa-music');
            icon.classList.add('fa-volume-mute');
        }
    }

    // تنظیم حجم صدا
    setVolume(volume) {
        this.audio.volume = volume;
        
        const music = this.elements.backgroundMusic;
        if (music) {
            music.volume = volume;
        }
    }

    // شروع موسیقی زمینه
    startBackgroundMusic() {
        const music = this.elements.backgroundMusic;
        if (music && this.audio.enabled) {
            music.volume = this.audio.volume * 0.5; // موسیقی زمینه آرام‌تر
            music.play().catch(e => {
                console.log("موسیقی زمینه پخش نشد:", e);
                // در برخی مرورگرها نیاز به تعامل کاربر است
            });
        }
    }

    // مدیریت کلیدهای کیبورد
    handleKeyboard(e) {
        if (!this.state.gameActive) return;
        
        // جلوگیری از عملکرد پیش‌فرض
        e.preventDefault();
        
        switch(e.key) {
            case ' ':
            case 'Spacebar':
                // فاصله برای تاس انداختن
                if (!this.elements.rollDiceBtn.disabled) {
                    this.rollDice();
                }
                break;
                
            case 'r':
            case 'R':
                // R برای بازی مجدد
                if (e.ctrlKey) {
                    this.startNewGame();
                }
                break;
                
            case 'p':
            case 'P':
                // P برای مکث
                this.togglePause();
                break;
                
            case 'Escape':
                // Esc برای بستن مودال‌ها
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
                break;
                
            case '1':
                // کلیدهای عددی برای قدرت‌ها
                this.usePowerup('double');
                break;
                
            case '2':
                this.usePowerup('shield');
                break;
                
            case '3':
                this.usePowerup('teleport');
                break;
                
            case '4':
                this.usePowerup('freeze');
                break;
        }
    }

    // بارگذاری از localStorage
    loadFromStorage() {
        if (!this.storage.enabled) return;
        
        try {
            const savedData = localStorage.getItem(this.storage.key);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // بارگذاری آمار
                if (data.statistics) {
                    this.state.statistics = { ...this.state.statistics, ...data.statistics };
                }
                
                // بارگذاری دستاوردها
                if (data.achievements) {
                    this.state.achievements = data.achievements;
                }
                
                // بارگذاری تنظیمات
                if (data.settings) {
                    if (data.settings.audio !== undefined) {
                        this.audio.enabled = data.settings.audio;
                        this.toggleAudio(data.settings.audio);
                    }
                    
                    if (data.settings.animations !== undefined) {
                        this.animations.enabled = data.settings.animations;
                    }
                }
                
                console.log('✅ داده‌ها از حافظه بارگذاری شدند');
            }
        } catch (error) {
            console.error('خطا در بارگذاری از حافظه:', error);
        }
    }

    // ذخیره در localStorage
    saveToStorage() {
        if (!this.storage.enabled) return;
        
        try {
            const data = {
                statistics: this.state.statistics,
                achievements: this.state.achievements,
                settings: {
                    audio: this.audio.enabled,
                    animations: this.animations.enabled
                },
                lastSave: Date.now()
            };
            
            localStorage.setItem(this.storage.key, JSON.stringify(data));
            console.log('✅ داده‌ها در حافظه ذخیره شدند');
        } catch (error) {
            console.error('خطا در ذخیره در حافظه:', error);
        }
    }

    // ایجاد یک کارت دستاورد
    createAchievementCard(achievement, unlocked) {
        const card = document.createElement('div');
        card.className = `achievement ${unlocked ? 'unlocked' : 'locked'}`;
        
        card.innerHTML = `
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
            <div class="achievement-reward">
                <i class="fas fa-coins"></i>
                <span>${achievement.reward}</span>
            </div>
        `;
        
        return card;
    }

    // بررسی دستاوردها
    checkAchievements() {
        this.config.achievements.forEach(achievement => {
            const alreadyUnlocked = this.state.achievements.includes(achievement.id);
            
            if (!alreadyUnlocked && achievement.condition(this.state.statistics)) {
                // باز کردن دستاورد
                this.unlockAchievement(achievement);
            }
        });
    }

    // باز کردن دستاورد
    unlockAchievement(achievement) {
        this.state.achievements.push(achievement.id);
        this.state.statistics.totalCoins += achievement.reward;
        
        // به‌روزرسانی نمایش
        this.updateCoinsDisplay();
        
        // نمایش نوتیفیکیشن
        this.showAchievementNotification(achievement);
        
        // اضافه کردن رویداد
        this.addGameEvent(`🏆 دستاورد "${achievement.title}" باز شد! +${achievement.reward} سکه`, 'success');
        
        // پخش صدا
        this.playSound('win');
        
        // ذخیره
        this.saveToStorage();
    }

    // نمایش نوتیفیکیشن دستاورد
    showAchievementNotification(achievement) {
        const popup = document.getElementById('miniPopup');
        const message = document.getElementById('popupMessage');
        
        if (popup && message) {
            message.innerHTML = `
                <i class="${achievement.icon}"></i>
                <strong>${achievement.title}</strong>
                <br>
                <small>${achievement.description}</small>
                <br>
                <span style="color: #f59e0b">+${achievement.reward} سکه</span>
            `;
            
            popup.classList.add('show');
            
            setTimeout(() => {
                popup.classList.remove('show');
            }, 5000);
        }
    }

    // دریافت جایزه روزانه
    claimDailyReward() {
        const today = new Date().toDateString();
        const lastClaim = localStorage.getItem('dailyRewardLastClaim');
        
        if (lastClaim === today) {
            this.addGameEvent('امروز جایزه خود را دریافت کرده‌اید! فردا برگردید.', 'warning');
            return;
        }
        
        // جایزه روزانه (50-100 سکه)
        const reward = 50 + Math.floor(Math.random() * 51);
        this.state.statistics.totalCoins += reward;
        
        // ذخیره تاریخ دریافت
        localStorage.setItem('dailyRewardLastClaim', today);
        
        // به‌روزرسانی نمایش
        this.updateCoinsDisplay();
        
        // نمایش نوتیفیکیشن
        this.showDailyRewardNotification(reward);
        
        // اضافه کردن رویداد
        this.addGameEvent(`🎁 جایزه روزانه دریافت شد! +${reward} سکه`, 'success');
        
        // ذخیره
        this.saveToStorage();
    }

    // نمایش نوتیفیکیشن جایزه روزانه
    showDailyRewardNotification(reward) {
        const popup = document.getElementById('miniPopup');
        const message = document.getElementById('popupMessage');
        
        if (popup && message) {
            message.innerHTML = `
                🎁 <strong>جایزه روزانه!</strong>
                <br>
                <span style="color: #f59e0b; font-size: 1.2em">+${reward} سکه</span>
            `;
            
            popup.classList.add('show');
            
            setTimeout(() => {
                popup.classList.remove('show');
            }, 4000);
        }
    }

    // ذخیره بازی
    saveGame() {
        const saveData = {
            state: this.state,
            players: this.state.players,
            config: this.config,
            timestamp: Date.now()
        };
        
        const saveKey = `snakesAndLaddersSave_${Date.now()}`;
        localStorage.setItem(saveKey, JSON.stringify(saveData));
        
        this.addGameEvent('بازی ذخیره شد!', 'success');
    }

    // بارگذاری بازی
    loadGame() {
        // پیدا کردن آخرین ذخیره
        let lastSaveKey = null;
        let lastSaveTime = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('snakesAndLaddersSave_')) {
                const saveData = JSON.parse(localStorage.getItem(key));
                if (saveData.timestamp > lastSaveTime) {
                    lastSaveTime = saveData.timestamp;
                    lastSaveKey = key;
                }
            }
        }
        
        if (!lastSaveKey) {
            this.addGameEvent('هیچ بازی ذخیره شده‌ای یافت نشد!', 'warning');
            return;
        }
        
        const saveData = JSON.parse(localStorage.getItem(lastSaveKey));
        
        // بارگذاری وضعیت
        this.state = { ...this.state, ...saveData.state };
        this.state.players = saveData.players;
        
        // به‌روزرسانی نمایش
        this.updateDisplay();
        this.createGameBoard();
        this.updatePlayersDisplay();
        
        this.addGameEvent('بازی بارگذاری شد!', 'success');
    }

    // خروج از بازی
    exitGame() {
        if (this.state.gameActive) {
            if (!confirm('بازی در حال انجام است. آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
                return;
            }
        }
        
        // ذخیره قبل از خروج
        this.saveToStorage();
        
        // بازگشت به صفحه اصلی
        window.location.href = 'index.html';
    }

    // راه‌اندازی کامل بازی
    setupCompleteGame() {
        console.log('🎮 بازی مار و پله آماده است!');
        
        // مخفی کردن صفحه بارگذاری
        if (this.elements.gameLoading) {
            setTimeout(() => {
                this.elements.gameLoading.style.opacity = '0';
                setTimeout(() => {
                    this.elements.gameLoading.style.display = 'none';
                    
                    // نمایش پیام خوش‌آمد
                    this.showWelcomeMessage();
                }, 500);
            }, 1000);
        }
    }

    // نمایش پیام خوش‌آمد
    showWelcomeMessage() {
        const popup = document.getElementById('miniPopup');
        const message = document.getElementById('popupMessage');
        
        if (popup && message) {
            message.innerHTML = '🎲 بازی مار و پله آماده است! بیایید شروع کنیم!';
            popup.classList.add('show');
            
            setTimeout(() => {
                popup.classList.remove('show');
            }, 3000);
        }
        
        // اضافه کردن رویداد اولیه
        this.addGameEvent('🎮 بازی شروع شد! اولین بازیکن تاس بیندازید.', 'info');
    }
}

// راه‌اندازی بازی وقتی صفحه لود شد
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakesAndLaddersGame();
    game.setupCompleteGame();
    
    // تعریف توابع عمومی برای دسترسی از طریق console
    window.game = game;
    
    // دستورات کنسول برای دیباگ
    console.log('%c🎮 بازی مار و پله', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
    console.log('%cدستورات کنسول:', 'color: #10b981; font-weight: bold;');
    console.log('%cgame.startNewGame() - شروع بازی جدید', 'color: #888;');
    console.log('%cgame.rollDice() - انداختن تاس', 'color: #888;');
    console.log('%cgame.showSettings() - نمایش تنظیمات', 'color: #888;');
    console.log('%cgame.showHelp() - نمایش راهنما', 'color: #888;');
    console.log('%cgame.saveGame() - ذخیره بازی', 'color: #888;');
    console.log('%cgame.loadGame() - بارگذاری بازی', 'color: #888;');
});
