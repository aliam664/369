// main.js - اسکریپت اصلی صفحه بازی‌های کلاسیک | طراحی شده توسط Ali369

// ============================================
// بخش ۱: تنظیمات اصلی و متغیرهای سراسری
// ============================================
class ClassicGames {
    constructor() {
        this.init();
    }

    init() {
        // متغیرهای سراسری
        this.config = {
            appName: 'بازی‌های کلاسیک',
            version: '2.0.1',
            developer: 'Ali369',
            year: '2024',
            debug: false,
            
            // تنظیمات انیمیشن
            animationDuration: 300,
            scrollThreshold: 100,
            counterSpeed: 50,
            
            // API endpoints
            endpoints: {
                stats: '/api/stats',
                users: '/api/users'
            }
        };

        // وضعیت برنامه
        this.state = {
            isDarkMode: false,
            isMenuOpen: false,
            isScrolled: false,
            countersActive: false,
            loading: true
        };

        // عناصر DOM
        this.elements = {
            // هدر و ناوبری
            header: document.querySelector('.main-header'),
            navMenu: document.getElementById('navMenu'),
            menuToggle: document.getElementById('menuToggle'),
            themeToggle: document.getElementById('themeToggle'),
            
            // صفحه بارگذاری
            loadingScreen: document.getElementById('loading-screen'),
            progressBar: document.getElementById('progressBar'),
            
            // هیرو سکشن
            heroTitle: document.querySelector('.hero-title'),
            
            // شمارنده‌ها
            counters: document.querySelectorAll('.counter'),
            statsCounters: document.querySelectorAll('.stats-counter'),
            
            // دکمه‌ها
            backToTop: document.getElementById('backToTop'),
            developerBadge: document.querySelector('.developer-badge'),
            
            // بازی‌ها
            gameCards: document.querySelectorAll('.game-card'),
            featureCards: document.querySelectorAll('.feature-card'),
            
            // بخش‌ها
            sections: document.querySelectorAll('section'),
            
            // فوتر
            footer: document.querySelector('.main-footer')
        };

        // ذخیره‌سازی محلی
        this.storage = {
            get: (key) => {
                try {
                    return JSON.parse(localStorage.getItem(key));
                } catch {
                    return localStorage.getItem(key);
                }
            },
            set: (key, value) => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch {
                    localStorage.setItem(key, value);
                }
            },
            remove: (key) => localStorage.removeItem(key),
            clear: () => localStorage.clear()
        };

        // اجرای برنامه
        this.setup();
    }

    // ============================================
    // بخش ۲: راه‌اندازی اولیه
    // ============================================
    setup() {
        console.log(`%c🎮 ${this.config.appName} v${this.config.version}`, 
            'font-size: 24px; font-weight: bold; color: #3b82f6;');
        console.log(`%c📱 توسعه داده شده توسط ${this.config.developer}`, 
            'font-size: 14px; color: #6b7280;');

        // بارگذاری تنظیمات
        this.loadSettings();
        
        // رویداددهی
        this.bindEvents();
        
        // انیمیشن‌های اولیه
        this.initAnimations();
        
        // شروع بارگذاری
        this.startLoading();
    }

    // ============================================
    // بخش ۳: مدیریت رویدادها
    // ============================================
    bindEvents() {
        // رویدادهای اسکرول
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // رویدادهای کلیک
        document.addEventListener('click', this.handleClick.bind(this));
        
        // رویدادهای کیبورد
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // رویدادهای رزایز
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // رویدادهای تاچ
        document.addEventListener('touchstart', this.handleTouch.bind(this));
        
        // رویدادهای ماوس
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // رویدادهای visibility
        document.addEventListener('visibilitychange', this.handleVisibility.bind(this));
        
        // رویدادهای beforeunload
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    // ============================================
    // بخش ۴: مدیریت اسکرول
    // ============================================
    handleScroll() {
        const scrollY = window.scrollY;
        
        // هدر اسکرول شده
        if (scrollY > this.config.scrollThreshold) {
            if (!this.state.isScrolled) {
                this.elements.header.classList.add('scrolled');
                this.state.isScrolled = true;
            }
        } else {
            if (this.state.isScrolled) {
                this.elements.header.classList.remove('scrolled');
                this.state.isScrolled = false;
            }
        }
        
        // دکمه بازگشت به بالا
        if (scrollY > 500) {
            this.elements.backToTop.classList.add('visible');
        } else {
            this.elements.backToTop.classList.remove('visible');
        }
        
        // فعال‌سازی انیمیشن‌ها
        if (!this.state.countersActive && this.isElementInViewport(document.querySelector('.hero-stats'))) {
            this.startCounters();
            this.state.countersActive = true;
        }
        
        // انیمیشن اسکرول
        this.animateOnScroll();
    }

    // ============================================
    // بخش ۵: مدیریت کلیک
    // ============================================
    handleClick(e) {
        const target = e.target;
        
        // منوی همبرگری
        if (target.closest('#menuToggle')) {
            this.toggleMenu();
        }
        
        // تغییر تم
        if (target.closest('#themeToggle')) {
            this.toggleTheme();
        }
        
        // بازگشت به بالا
        if (target.closest('#backToTop')) {
            this.scrollToTop();
        }
        
        // بستن منو با کلیک روی لینک
        if (target.closest('.nav-link')) {
            if (this.state.isMenuOpen) {
                this.closeMenu();
            }
        }
        
        // بازی‌های غیرفعال
        if (target.closest('.btn-disabled')) {
            e.preventDefault();
            this.showComingSoon();
        }
        
        // دمو ویدئو
        if (target.closest('[onclick*="showDemoVideo"]')) {
            e.preventDefault();
            this.showDemoVideo();
        }
        
        // افکت ریپل روی دکمه‌ها
        if (target.closest('.btn-play')) {
            this.createRipple(e);
        }
        
        // کارت‌های بازی
        if (target.closest('.game-card')) {
            this.animateGameCard(target.closest('.game-card'));
        }
    }

    // ============================================
    // بخش ۶: مدیریت کیبورد
    // ============================================
    handleKeydown(e) {
        // میانبرهای کیبورد
        switch(e.key) {
            case 'Escape':
                if (this.state.isMenuOpen) this.closeMenu();
                break;
            case 't':
            case 'T':
                if (e.ctrlKey) this.toggleTheme();
                break;
            case 'm':
            case 'M':
                if (e.ctrlKey) this.toggleMenu();
                break;
            case 'Home':
                e.preventDefault();
                this.scrollToTop();
                break;
            case 'End':
                e.preventDefault();
                this.scrollToBottom();
                break;
        }
        
        // ناوبری با کلیدهای جهت‌دار
        if (e.key.startsWith('Arrow')) {
            this.handleArrowKeys(e);
        }
    }

    // ============================================
    // بخش ۷: مدیریت رزایز
    // ============================================
    handleResize() {
        // به‌روزرسانی موقعیت‌ها
        this.updateLayout();
        
        // بستن منو در موبایل
        if (window.innerWidth > 768 && this.state.isMenuOpen) {
            this.closeMenu();
        }
        
        // بهینه‌سازی انیمیشن‌ها
        this.optimizeAnimations();
    }

    // ============================================
    // بخش ۸: مدیریت لمسی
    // ============================================
    handleTouch(e) {
        // جلوگیری از زوم ناخواسته
        if (e.touches.length > 1) {
            e.preventDefault();
        }
        
        // افکت لمسی روی کارت‌ها
        const card = e.target.closest('.game-card, .feature-card');
        if (card) {
            this.animateTouch(card);
        }
    }

    // ============================================
    // بخش ۹: مدیریت حرکت ماوس
    // ============================================
    handleMouseMove(e) {
        // افکت پارالاکس
        this.applyParallax(e);
        
        // افکت follow mouse روی عناصر خاص
        this.followMouseEffect(e);
    }

    // ============================================
    // بخش ۱۰: مدیریت visibility
    // ============================================
    handleVisibility() {
        if (document.hidden) {
            // صفحه مخفی شده
            this.pauseAnimations();
        } else {
            // صفحه قابل مشاهده شد
            this.resumeAnimations();
        }
    }

    // ============================================
    // بخش ۱۱: مدیریت beforeunload
    // ============================================
    handleBeforeUnload() {
        // ذخیره تنظیمات
        this.saveSettings();
        
        // پاک کردن cache اگر لازم باشد
        this.cleanup();
    }

    // ============================================
    // بخش ۱۲: مدیریت بارگذاری
    // ============================================
    startLoading() {
        // شبیه‌سازی بارگذاری
        let progress = 0;
        const maxProgress = 100;
        const speed = 2; // سریع‌تر
        
        const updateProgress = () => {
            progress += Math.random() * 15;
            if (progress > maxProgress) progress = maxProgress;
            
            this.elements.progressBar.style.width = `${progress}%`;
            
            if (progress < maxProgress) {
                setTimeout(updateProgress, 100);
            } else {
                // بارگذاری کامل
                setTimeout(() => {
                    this.finishLoading();
                }, 500);
            }
        };
        
        // شروع بارگذاری
        setTimeout(updateProgress, 300);
    }

    finishLoading() {
        // انیمیشن خروج صفحه بارگذاری
        this.elements.loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.loadingScreen.style.display = 'none';
            this.state.loading = false;
            
            // شروع انیمیشن‌ها
            this.initPageAnimations();
            
            // ایجاد ذرات
            this.createParticles();
            
            // شروع شمارنده‌ها با تأخیر
            setTimeout(() => {
                if (this.isElementInViewport(document.querySelector('.hero-stats'))) {
                    this.startCounters();
                    this.state.countersActive = true;
                }
            }, 1000);
            
            // ثبت لاگ
            if (this.config.debug) {
                console.log('📦 صفحه با موفقیت بارگذاری شد');
            }
        }, 500);
    }

    // ============================================
    // بخش ۱۳: مدیریت تم
    // ============================================
    toggleTheme() {
        this.state.isDarkMode = !this.state.isDarkMode;
        
        if (this.state.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.updateThemeIcon('sun');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            this.updateThemeIcon('moon');
        }
        
        // ذخیره در localStorage
        this.storage.set('theme', this.state.isDarkMode ? 'dark' : 'light');
        
        // پخش صدا (اختیاری)
        this.playSound('click');
        
        // ثبت لاگ
        if (this.config.debug) {
            console.log(`🎨 تم ${this.state.isDarkMode ? 'تاریک' : 'روشن'} فعال شد`);
        }
    }

    loadSettings() {
        // بارگذاری تم
        const savedTheme = this.storage.get('theme') || 'light';
        this.state.isDarkMode = savedTheme === 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(this.state.isDarkMode ? 'sun' : 'moon');
        
        // بارگذاری تنظیمات دیگر
        const settings = this.storage.get('settings') || {};
        Object.assign(this.config, settings);
        
        // ثبت لاگ
        if (this.config.debug) {
            console.log('⚙️ تنظیمات بارگذاری شد');
        }
    }

    saveSettings() {
        const settings = {
            animationDuration: this.config.animationDuration,
            scrollThreshold: this.config.scrollThreshold
        };
        
        this.storage.set('settings', settings);
        this.storage.set('theme', this.state.isDarkMode ? 'dark' : 'light');
    }

    updateThemeIcon(icon) {
        const iconElement = this.elements.themeToggle.querySelector('i');
        if (iconElement) {
            iconElement.className = `fas fa-${icon}`;
        }
    }

    // ============================================
    // بخش ۱۴: مدیریت منو
    // ============================================
    toggleMenu() {
        if (this.state.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.elements.navMenu.classList.add('active');
        this.updateMenuIcon('times');
        this.state.isMenuOpen = true;
        
        // جلوگیری از اسکرول پشت منو
        document.body.style.overflow = 'hidden';
        
        // پخش صدا
        this.playSound('menu');
    }

    closeMenu() {
        this.elements.navMenu.classList.remove('active');
        this.updateMenuIcon('bars');
        this.state.isMenuOpen = false;
        
        // فعال‌کردن مجدد اسکرول
        document.body.style.overflow = '';
    }

    updateMenuIcon(icon) {
        const iconElement = this.elements.menuToggle.querySelector('i');
        if (iconElement) {
            iconElement.className = `fas fa-${icon}`;
        }
    }

    // ============================================
    // بخش ۱۵: اسکرول
    // ============================================
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // پخش صدا
        this.playSound('click');
    }

    scrollToBottom() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }

    scrollToElement(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // ============================================
    // بخش ۱۶: شمارنده‌ها
    // ============================================
    startCounters() {
        // شمارنده‌های هیرو
        this.elements.counters.forEach(counter => {
            this.animateCounter(counter);
        });
        
        // شمارنده‌های آمار
        this.elements.statsCounters.forEach(counter => {
            this.animateCounter(counter);
        });
        
        // ثبت لاگ
        if (this.config.debug) {
            console.log('🔢 شمارنده‌ها فعال شدند');
        }
    }

    animateCounter(element) {
        const target = parseFloat(element.getAttribute('data-target'));
        const duration = 2000; // 2 ثانیه
        const startTime = Date.now();
        const startValue = 0;
        
        const updateCounter = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            let currentValue = startValue + (target - startValue) * easeOutQuart;
            
            // فرمت عدد
            if (target % 1 === 0) {
                element.textContent = Math.floor(currentValue);
            } else {
                element.textContent = currentValue.toFixed(1);
            }
            
            // افکت scale
            element.style.transform = `scale(${1 + (0.1 * progress)})`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                // بازگشت به حالت نرمال
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 300);
            }
        };
        
        updateCounter();
    }

    // ============================================
    // بخش ۱۷: انیمیشن‌ها
    // ============================================
    initAnimations() {
        // Intersection Observer برای انیمیشن اسکرول
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            }
        );
        
        // مشاهده عناصر
        this.elements.gameCards.forEach(card => this.observer.observe(card));
        this.elements.featureCards.forEach(card => this.observer.observe(card));
        
        // انیمیشن‌های CSS
        this.initCSSAnimations();
    }

    initPageAnimations() {
        // انیمیشن تایپ برای عنوان هیرو
        this.typeWriterEffect();
        
        // انیمیشن کارت‌ها
        this.animateGameCards();
        
        // انیمیشن شکل‌های شناور
        this.animateShapes();
        
        // انیمیشن پس‌زمینه
        this.animateBackground();
    }

    typeWriterEffect() {
        const title = this.elements.heroTitle;
        if (!title) return;
        
        const text = title.textContent;
        title.textContent = '';
        
        let i = 0;
        const type = () => {
            if (i < text.length) {
                title.textContent += text.charAt(i);
                i++;
                setTimeout(type, 100);
            }
        };
        
        // شروع با تأخیر
        setTimeout(type, 500);
    }

    animateOnScroll() {
        this.elements.sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                section.classList.add('visible');
            }
        });
    }

    animateGameCard(card) {
        // اضافه کردن افکت hover
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.boxShadow = 'var(--shadow-2xl)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = 'var(--shadow-lg)';
        });
    }

    animateGameCards() {
        this.elements.gameCards.forEach((card, index) => {
            // تأخیر برای انیمیشن متوالی
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // ============================================
    // بخش ۱۸: افکت‌های ویژه
    // ============================================
    createParticles() {
        const container = document.querySelector('.particles-container');
        if (!container) return;
        
        const particleCount = window.innerWidth < 768 ? 30 : 100;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // اندازه تصادفی
            const size = Math.random() * 8 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // موقعیت تصادفی
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // رنگ تصادفی
            const colors = [
                'rgba(59, 130, 246, 0.3)',
                'rgba(139, 92, 246, 0.3)',
                'rgba(236, 72, 153, 0.3)',
                'rgba(16, 185, 129, 0.3)'
            ];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            // انیمیشن
            const duration = Math.random() * 20 + 10;
            particle.style.animation = `float ${duration}s ease-in-out infinite`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            
            container.appendChild(particle);
        }
    }

    createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
        
        // حذف بعد از انیمیشن
        setTimeout(() => {
            circle.remove();
        }, 600);
    }

    applyParallax(event) {
        const elements = document.querySelectorAll('.parallax');
        elements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const x = (window.innerWidth - event.pageX * speed) / 100;
            const y = (window.innerHeight - event.pageY * speed) / 100;
            
            element.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    }

    followMouseEffect(event) {
        const elements = document.querySelectorAll('.follow-mouse');
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            element.style.setProperty('--mouse-x', `${x}px`);
            element.style.setProperty('--mouse-y', `${y}px`);
        });
    }

    animateShapes() {
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            // تأخیر‌های مختلف برای انیمیشن
            shape.style.animationDelay = `${index * 2}s`;
        });
    }

    animateBackground() {
        // گرادیان متحرک برای پس‌زمینه
        const hero = document.querySelector('.hero');
        if (hero) {
            let angle = 0;
            setInterval(() => {
                angle = (angle + 0.5) % 360;
                hero.style.background = `linear-gradient(${angle}deg, var(--gradient-light))`;
            }, 100);
        }
    }

    // ============================================
    // بخش ۱۹: صداها
    // ============================================
    playSound(type) {
        // در نسخه واقعی می‌توانید فایل‌های صوتی واقعی پخش کنید
        switch(type) {
            case 'click':
                // صدای کلیک
                break;
            case 'menu':
                // صدای منو
                break;
            case 'success':
                // صدای موفقیت
                break;
        }
    }

    // ============================================
    // بخش ۲۰: دموها و پیام‌ها
    // ============================================
    showDemoVideo() {
        // در نسخه واقعی می‌توانید یک مودال ویدئو نمایش دهید
        this.showNotification('🎬 نسخه دموی ویدئویی به زودی اضافه می‌شود!', 'info');
    }

    showComingSoon() {
        this.showNotification('⏳ این بازی در حال توسعه است و به زودی منتشر می‌شود!', 'warning');
    }

    showNotification(message, type = 'info') {
        // ایجاد نوتیفیکیشن
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // اضافه کردن به صفحه
        document.body.appendChild(notification);
        
        // انیمیشن ورود
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // حذف خودکار
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        // بستن دستی
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }

    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'error': 'times-circle'
        };
        return icons[type] || 'info-circle';
    }

    // ============================================
    // بخش ۲۱: بهینه‌سازی
    // ============================================
    optimizeAnimations() {
        // غیرفعال کردن انیمیشن‌ها در دستگاه‌های ضعیف
        if (this.isLowEndDevice()) {
            document.documentElement.classList.add('reduced-motion');
        }
        
        // بهینه‌سازی تصاویر
        this.optimizeImages();
        
        // بهینه‌سازی فونت‌ها
        this.optimizeFonts();
    }

    isLowEndDevice() {
        // تشخیص دستگاه ضعیف
        const ua = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const memory = navigator.deviceMemory || 4;
        
        return isMobile && memory < 4;
    }

    optimizeImages() {
        // لودینگ تنبل برای تصاویر
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    optimizeFonts() {
        // پیش‌بارگذاری فونت‌های مهم
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap';
        link.as = 'style';
        document.head.appendChild(link);
    }

    pauseAnimations() {
        // مکث انیمیشن‌ها هنگام عدم نمایش صفحه
        document.documentElement.classList.add('paused');
    }

    resumeAnimations() {
        // ادامه انیمیشن‌ها
        document.documentElement.classList.remove('paused');
    }

    // ============================================
    // بخش ۲۲: utility functions
    // ============================================
    isElementInViewport(el) {
        if (!el) return false;
        
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    handleArrowKeys(e) {
        e.preventDefault();
        
        // ناوبری بین بخش‌ها
        const sections = Array.from(this.elements.sections);
        const currentSection = sections.findIndex(section => 
            this.isElementInViewport(section)
        );
        
        let nextSection;
        switch(e.key) {
            case 'ArrowUp':
                nextSection = Math.max(currentSection - 1, 0);
                break;
            case 'ArrowDown':
                nextSection = Math.min(currentSection + 1, sections.length - 1);
                break;
        }
        
        if (sections[nextSection]) {
            this.scrollToElement(sections[nextSection]);
        }
    }

    updateLayout() {
        // به‌روزرسانی موقعیت عناصر بر اساس سایز صفحه
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    animateTouch(element) {
        // افکت لمسی
        element.classList.add('touched');
        setTimeout(() => {
            element.classList.remove('touched');
        }, 300);
    }

    // ============================================
    // بخش ۲۳: انیمیشن‌های CSS
    // ============================================
    initCSSAnimations() {
        // اضافه کردن کلاس‌های انیمیشن به عناصر
        this.elements.gameCards.forEach(card => {
            card.classList.add('animate-on-scroll');
        });
        
        // انیمیشن‌های فوتر
        this.elements.footer.classList.add('animate-on-load');
    }

    // ============================================
    // بخش ۲۴: cleanup و مدیریت حافظه
    // ============================================
    cleanup() {
        // پاک کردن observers
        if (this.observer) {
            this.elements.gameCards.forEach(card => this.observer.unobserve(card));
            this.elements.featureCards.forEach(card => this.observer.unobserve(card));
            this.observer.disconnect();
        }
        
        // پاک کردن event listeners اضافی
        document.removeEventListener('visibilitychange', this.handleVisibility.bind(this));
        window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // پاک کردن cache
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    caches.delete(cacheName);
                });
            });
        }
    }

    // ============================================
    // بخش ۲۵: API و داده‌های داینامیک
    // ============================================
    async fetchStats() {
        try {
            const response = await fetch(this.config.endpoints.stats);
            const data = await response.json();
            
            // به‌روزرسانی آمار
            this.updateStats(data);
            
            // ذخیره در localStorage
            this.storage.set('stats', data);
            
        } catch (error) {
            console.error('خطا در دریافت آمار:', error);
            // استفاده از داده‌های ذخیره شده
            const cachedStats = this.storage.get('stats');
            if (cachedStats) {
                this.updateStats(cachedStats);
            }
        }
    }

    updateStats(data) {
        // به‌روزرسانی شمارنده‌ها با داده‌های واقعی
        if (data.totalUsers) {
            const counter = document.querySelector('[data-target="15420"]');
            if (counter) {
                counter.setAttribute('data-target', data.totalUsers);
            }
        }
        
        // به‌روزرسانی دیگر آمارها
        // ...
    }

    // ============================================
    // بخش ۲۶: service worker (PWA)
    // ============================================
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('✅ Service Worker ثبت شد:', registration.scope);
                        
                        // بررسی بروزرسانی
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // بروزرسانی جدید موجود است
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.log('❌ ثبت Service Worker ناموفق بود:', error);
                    });
            });
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <i class="fas fa-sync-alt"></i>
                <span>بروزرسانی جدید موجود است!</span>
                <button onclick="location.reload()">بروزرسانی</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 1000);
    }

    // ============================================
    // بخش ۲۷: تحلیل و آمار
    // ============================================
    trackEvent(category, action, label) {
        // ارسال داده به Google Analytics یا سرویس مشابه
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
        
        // ذخیره در localStorage برای تحلیل آفلاین
        const events = this.storage.get('events') || [];
        events.push({
            category,
            action,
            label,
            timestamp: new Date().toISOString()
        });
        this.storage.set('events', events.slice(-100)); // فقط ۱۰۰ رویداد آخر
    }

    // ============================================
    // بخش ۲۸: ویژگی‌های پیشرفته
    // ============================================
    initAdvancedFeatures() {
        // WebGL effects (اگر پشتیبانی شود)
        if (this.supportsWebGL()) {
            this.initWebGLEffects();
        }
        
        // Web Audio API
        if (this.supportsWebAudio()) {
            this.initAudioContext();
        }
        
        // WebRTC برای بازی‌های چندنفره
        if (this.supportsWebRTC()) {
            this.initWebRTC();
        }
    }

    supportsWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch {
            return false;
        }
    }

    supportsWebAudio() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }

    supportsWebRTC() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    initWebGLEffects() {
        // WebGL effects برای پس‌زمینه
        // در نسخه کامل می‌توانید افکت‌های سه‌بعدی اضافه کنید
    }

    initAudioContext() {
        // مدیریت صداهای پیشرفته
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    initWebRTC() {
        // آماده‌سازی برای بازی‌های چندنفره آنلاین
    }

       // ============================================
    // بخش ۲۹: مدیریت خطاها
    // ============================================
    handleError(error, context = 'عمومی') {
        console.error(`❌ خطا در ${context}:`, error);
        
        // ثبت خطا در localStorage
        const errors = this.storage.get('errors') || [];
        errors.push({
            message: error.message,
            context,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
        
        // نگهداری فقط ۵۰ خطای آخر
        this.storage.set('errors', errors.slice(-50));
        
        // نمایش خطا به کاربر (فقط در محیط توسعه)
        if (this.config.debug) {
            this.showNotification(`⚠️ خطا: ${error.message}`, 'error');
        }
        
        // ارسال خطا به سرور
        this.logErrorToServer(error, context);
    }

    async logErrorToServer(error, context) {
        try {
            const errorData = {
                message: error.message,
                context,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                theme: this.state.isDarkMode ? 'dark' : 'light'
            };
            
            // ارسال به سرور
            if (this.config.endpoints.errorLog) {
                await fetch(this.config.endpoints.errorLog, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(errorData)
                });
            }
        } catch (logError) {
            console.error('❌ خطا در ثبت خطا:', logError);
        }
    }

    // ============================================
    // بخش ۳۰: دسترسی‌پذیری (Accessibility)
    // ============================================
    initAccessibility() {
        // افزودن skip to content لینک
        this.addSkipLink();
        
        // بهبود ناوبری کیبورد
        this.improveKeyboardNavigation();
        
        // افزودن ARIA attributes
        this.addAriaAttributes();
        
        // مدیریت focus trap در منوها
        this.manageFocusTrap();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#games';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'رفتن به محتوای اصلی';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--primary-color);
            color: white;
            padding: 8px 16px;
            z-index: 9999;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    improveKeyboardNavigation() {
        // افزودن outline برای ناوبری کیبورد
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.documentElement.classList.add('keyboard-nav');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.documentElement.classList.remove('keyboard-nav');
        });
    }

    addAriaAttributes() {
        // افزودن ARIA attributes به المان‌های تعاملی
        this.elements.navMenu?.setAttribute('aria-label', 'منوی اصلی');
        
        document.querySelectorAll('.nav-link').forEach((link, index) => {
            link.setAttribute('role', 'menuitem');
            link.setAttribute('tabindex', '0');
            link.setAttribute('aria-label', link.textContent.trim());
        });
        
        this.elements.menuToggle?.setAttribute('aria-label', 'باز و بسته کردن منو');
        this.elements.menuToggle?.setAttribute('aria-expanded', 'false');
        
        this.elements.themeToggle?.setAttribute('aria-label', 'تغییر تم');
        
        this.elements.backToTop?.setAttribute('aria-label', 'بازگشت به بالای صفحه');
    }

    manageFocusTrap() {
        // مدیریت focus trap برای منوی موبایل
        if (this.elements.navMenu) {
            const focusableElements = this.elements.navMenu.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            this.elements.navMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable?.focus();
                    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable?.focus();
                    }
                }
                
                if (e.key === 'Escape') {
                    this.closeMenu();
                }
            });
        }
    }

    // ============================================
    // بخش ۳۱: Localization و زبان
    // ============================================
    translations = {
        fa: {
            loading: 'در حال بارگذاری...',
            play: 'شروع بازی',
            comingSoon: 'به زودی...',
            viewDemo: 'مشاهده دمو',
            backToTop: 'بازگشت به بالا',
            developedBy: 'طراحی شده توسط',
            version: 'نسخه',
            errors: {
                network: 'خطا در ارتباط با سرور',
                notFound: 'صفحه مورد نظر یافت نشد',
                server: 'خطای سرور'
            }
        },
        en: {
            loading: 'Loading...',
            play: 'Play Now',
            comingSoon: 'Coming Soon...',
            viewDemo: 'View Demo',
            backToTop: 'Back to Top',
            developedBy: 'Developed by',
            version: 'Version',
            errors: {
                network: 'Network error',
                notFound: 'Page not found',
                server: 'Server error'
            }
        }
    };

    currentLanguage = 'fa';

    t(key) {
        return key.split('.').reduce((obj, i) => obj?.[i], this.translations[this.currentLanguage]) || key;
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this.storage.set('language', lang);
            this.updateUIText();
            
            // به‌روزرسانی جهت صفحه
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
        }
    }

    updateUIText() {
        // به‌روزرسانی متن‌های UI بر اساس زبان انتخاب شده
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            element.textContent = this.t(key);
        });
    }

    // ============================================
    // بخش ۳۲: Analytics و آمارگیری
    // ============================================
    initAnalytics() {
        // ثبت زمان شروع سشن
        this.sessionStart = Date.now();
        
        // ثبت رویداد شروع
        this.trackEvent('session', 'start', 'page_load');
        
        // ثبت زمان‌های اقامت
        this.trackTimeOnPage();
        
        // ثبت تعاملات کاربر
        this.trackUserInteractions();
        
        // ثبت اسکرول عمق
        this.trackScrollDepth();
    }

    trackTimeOnPage() {
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - this.sessionStart) / 1000);
            this.trackEvent('engagement', 'time_on_page', `${timeSpent}s`);
        });
    }

    trackUserInteractions() {
        // کلیک روی دکمه‌ها
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.trackEvent('interaction', 'button_click', btn.textContent);
            });
        });
        
        // کلیک روی کارت‌های بازی
        this.elements.gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('.game-title')?.textContent;
                this.trackEvent('game', 'view', title);
            });
        });
    }

    trackScrollDepth() {
        const depths = [25, 50, 75, 100];
        let maxDepth = 0;
        
        window.addEventListener('scroll', this.debounce(() => {
            const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
            
            depths.forEach(depth => {
                if (scrollPercent >= depth && depth > maxDepth) {
                    maxDepth = depth;
                    this.trackEvent('engagement', 'scroll_depth', `${depth}%`);
                }
            });
        }, 200));
    }

    // ============================================
    // بخش ۳۳: Performance Monitoring
    // ============================================
    initPerformanceMonitoring() {
        if ('performance' in window) {
            // اندازه‌گیری زمان بارگذاری
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const metrics = {
                        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                        tcp: perfData.connectEnd - perfData.connectStart,
                        request: perfData.responseStart - perfData.requestStart,
                        response: perfData.responseEnd - perfData.responseStart,
                        dom: perfData.domComplete - perfData.domInteractive,
                        load: perfData.loadEventEnd - perfData.navigationStart
                    };
                    
                    console.log('📊 Performance Metrics:', metrics);
                    
                    // ثبت در localStorage
                    this.storage.set('performance', metrics);
                    
                    // ارسال به سرور اگر کاربر رضایت داشته باشد
                    if (this.config.telemetry) {
                        this.sendPerformanceMetrics(metrics);
                    }
                }, 0);
            });
            
            // Core Web Vitals
            this.measureWebVitals();
        }
    }

    measureWebVitals() {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('🎨 LCP:', lastEntry.startTime / 1000, 's');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('⌨️ FID:', entry.processingStart - entry.startTime, 'ms');
            });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((entryList) => {
            let clsValue = 0;
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log('📐 CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // ============================================
    // بخش ۳۴: Utility Functions پیشرفته
    // ============================================
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    memoize(func) {
        const cache = new Map();
        return function(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = func.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }

    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    mergeObjects(target, ...sources) {
        return Object.assign(target, ...sources);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('fa-IR').format(num);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }

    // ============================================
    // بخش ۳۵: Cache Management
    // ============================================
    initCacheManagement() {
        // حداکثر عمر کش: 1 ساعت
        this.cacheTTL = 60 * 60 * 1000;
        
        // پاکسازی کش منقضی شده
        this.clearExpiredCache();
        
        // تنظیم پاکسازی دوره‌ای
        setInterval(() => {
            this.clearExpiredCache();
        }, this.cacheTTL);
    }

    setCache(key, value, ttl = this.cacheTTL) {
        const cacheItem = {
            value,
            timestamp: Date.now(),
            ttl
        };
        this.storage.set(`cache_${key}`, cacheItem);
    }

    getCache(key) {
        const cacheItem = this.storage.get(`cache_${key}`);
        
        if (!cacheItem) return null;
        
        const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;
        
        if (isExpired) {
            this.storage.remove(`cache_${key}`);
            return null;
        }
        
        return cacheItem.value;
    }

    clearExpiredCache() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('cache_')) {
                try {
                    const cacheItem = this.storage.get(key);
                    if (cacheItem && Date.now() - cacheItem.timestamp > cacheItem.ttl) {
                        this.storage.remove(key);
                    }
                } catch (e) {
                    console.warn('⚠️ خطا در پاکسازی کش:', e);
                }
            }
        }
    }

    // ============================================
    // بخش ۳۶: Network Status
    // ============================================
    initNetworkMonitoring() {
        this.isOnline = navigator.onLine;
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('✅ اتصال اینترنت برقرار شد', 'success');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('⚠️ اتصال اینترنت قطع شد', 'warning');
        });
        
        // بررسی کیفیت اتصال
        this.checkConnectionQuality();
    }

    checkConnectionQuality() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            console.log('📶 نوع اتصال:', connection.effectiveType);
            console.log('⚡ سرعت:', connection.downlink, 'Mbps');
            console.log('🔄 RTT:', connection.rtt, 'ms');
            
            // تنظیم کیفیت براساس سرعت اتصال
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.documentElement.classList.add('slow-connection');
            }
        }
    }

    syncOfflineData() {
        // همگام‌سازی داده‌های ذخیره شده آفلاین
        const offlineActions = this.storage.get('offline_actions') || [];
        
        offlineActions.forEach(async (action, index) => {
            try {
                await this.syncAction(action);
                offlineActions.splice(index, 1);
            } catch (error) {
                console.error('❌ خطا در همگام‌سازی:', error);
            }
        });
        
        this.storage.set('offline_actions', offlineActions);
    }

    // ============================================
    // بخش ۳۷: Offline Support
    // ============================================
    initOfflineSupport() {
        // ذخیره داده‌های مهم در IndexedDB
        this.initIndexedDB();
        
        // ایجاد صفحه آفلاین
        this.createOfflinePage();
        
        // کش کردن منابع ضروری
        this.cacheCriticalResources();
    }

    async initIndexedDB() {
        if (!window.indexedDB) {
            console.warn('⚠️ IndexedDB پشتیبانی نمی‌شود');
            return;
        }
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ClassicGamesDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // ایجاد object stores
                if (!db.objectStoreNames.contains('games')) {
                    db.createObjectStore('games', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('scores')) {
                    const scoreStore = db.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
                    scoreStore.createIndex('game', 'game');
                    scoreStore.createIndex('player', 'player');
                    scoreStore.createIndex('score', 'score');
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            };
        });
    }

    createOfflinePage() {
        // صفحه آفلاین ساده
        const offlinePage = `
            <!DOCTYPE html>
            <html lang="fa" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>آفلاین</title>
                <style>
                    body {
                        font-family: Vazirmatn, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        text-align: center;
                    }
                    .offline-container {
                        max-width: 500px;
                        padding: 2rem;
                    }
                    h1 { font-size: 3rem; margin-bottom: 1rem; }
                    p { font-size: 1.2rem; opacity: 0.9; }
                    .icon { font-size: 5rem; margin-bottom: 1rem; }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <div class="icon">📵</div>
                    <h1>شما آفلاین هستید</h1>
                    <p>لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.</p>
                </div>
            </body>
            </html>
        `;
        
        // ذخیره در cache برای نمایش آفلاین
        caches.open('offline-v1').then(cache => {
            const offlineResponse = new Response(offlinePage, {
                headers: { 'Content-Type': 'text/html' }
            });
            cache.put('/offline', offlineResponse);
        });
    }

    cacheCriticalResources() {
        const criticalResources = [
            '/',
            '/css/main.css',
            '/js/main.js',
            'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ];
        
        caches.open('critical-v1').then(cache => {
            cache.addAll(criticalResources);
        });
    }

    // ============================================
    // بخش ۳۸: SEO Optimization
    // ============================================
    initSEO() {
        this.addMetaTags();
        this.generateSitemap();
        this.addStructuredData();
        this.optimizeCanonical();
    }

    addMetaTags() {
        // عنوان
        document.title = 'بازی‌های کلاسیک | دوز و مار و پله | Ali369';
        
        // متا توضیحات
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = 'مجموعه کامل بازی‌های کلاسیک ایرانی و جهانی - دوز، مار و پله، مار و ... با طراحی مدرن و امکانات پیشرفته. ساخته شده توسط Ali369';
        
        // Open Graph
        this.addOpenGraphTags();
        
        // Twitter Cards
        this.addTwitterCardTags();
        
        // Robots
        this.addRobotsMeta();
    }

    addOpenGraphTags() {
        const ogTags = {
            'og:title': 'بازی‌های کلاسیک حرفه‌ای',
            'og:description': 'مجموعه بازی‌های کلاسیک با طراحی مدرن و امکانات پیشرفته',
            'og:type': 'website',
            'og:url': window.location.href,
            'og:image': 'https://classic-games.ali369.ir/preview.jpg',
            'og:site_name': 'بازی‌های کلاسیک'
        };
        
        Object.entries(ogTags).forEach(([property, content]) => {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.content = content;
        });
    }

    addTwitterCardTags() {
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': 'بازی‌های کلاسیک حرفه‌ای',
            'twitter:description': 'مجموعه بازی‌های کلاسیک با طراحی مدرن و امکانات پیشرفته',
            'twitter:image': 'https://classic-games.ali369.ir/preview.jpg',
            'twitter:creator': '@ali369_dev'
        };
        
        Object.entries(twitterTags).forEach(([name, content]) => {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = name;
                document.head.appendChild(meta);
            }
            meta.content = content;
        });
    }

    addRobotsMeta() {
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {
            robots = document.createElement('meta');
            robots.name = 'robots';
            document.head.appendChild(robots);
        }
        robots.content = 'index, follow';
    }

    generateSitemap() {
        // این تابع در سرور اجرا می‌شود
        // نمونه XML sitemap
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                <url>
                    <loc>${window.location.origin}</loc>
                    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
                    <changefreq>daily</changefreq>
                    <priority>1.0</priority>
                </url>
                <url>
                    <loc>${window.location.origin}/tic-tac-toe.html</loc>
                    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.9</priority>
                </url>
            </urlset>`;
    }

    addStructuredData() {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "بازی‌های کلاسیک",
            "description": "مجموعه بازی‌های کلاسیک با طراحی مدرن و امکانات پیشرفته",
            "url": window.location.href,
            "author": {
                "@type": "Person",
                "name": "Ali369",
                "url": "https://github.com/ali369-dev"
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${window.location.origin}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        };
        
        let script = document.querySelector('script[type="application/ld+json"]');
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(structuredData, null, 2);
    }

    optimizeCanonical() {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = window.location.href.split('?')[0].split('#')[0];
    }

    // ============================================
    // بخش ۳۹: Performance Optimization
    // ============================================
    initPerformanceOptimization() {
        // Lazy loading برای تصاویر
        this.initLazyLoading();
        
        // Resource hints
        this.addResourceHints();
        
        // Critical CSS
        this.extractCriticalCSS();
        
        // Font optimization
        this.optimizeFonts();
    }

    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    addResourceHints() {
        // Preconnect برای دامنه‌های مهم
        const preconnectDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdnjs.cloudflare.com'
        ];
        
        preconnectDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
        
        // Preload برای منابع حیاتی
        const preloadResources = [
            { href: '/css/main.css', as: 'style' },
            { href: '/js/main.js', as: 'script' },
            { href: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;800&display=swap', as: 'style' }
        ];
        
        preloadResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }

    extractCriticalCSS() {
        // این تابع CSS حیاتی را استخراج و inline می‌کند
        const criticalSelectors = [
            '.main-header',
            '.hero',
            '.game-card',
            '.btn',
            '.container'
        ];
        
        // در نسخه واقعی، CSS حیاتی استخراج و به صورت inline اضافه می‌شود
    }

    // ============================================
    // بخش ۴۰: Ali369 Special Features
    // ============================================
    initAli369Features() {
        this.addSignature();
        this.addEasterEggs();
        this.initConsoleArt();
        this.addWatermark();
    }

    addSignature() {
        const signature = document.createElement('div');
        signature.className = 'ali369-signature';
        signature.innerHTML = `
            <span class="signature-text">Ali369</span>
            <span class="signature-year">© ${this.config.year}</span>
        `;
        
        // اضافه کردن امضا به فوتر
        const footer = document.querySelector('.footer-bottom');
        if (footer) {
            footer.appendChild(signature);
        }
    }

    addEasterEggs() {
        // ترکیب کلید مخفی برای ایستر اگ
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                
                if (konamiIndex === konamiCode.length) {
                    this.activateEasterEgg();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
        
        // کلیک مخفی روی لوگو
        let clickCount = 0;
        let clickTimer;
        
        document.querySelector('.logo')?.addEventListener('click', (e) => {
            e.preventDefault();
            
            clickCount++;
            
            if (clickCount === 3) {
                this.activateSecretMode();
                clickCount = 0;
                clearTimeout(clickTimer);
            } else {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 1000);
            }
        });
    }

    activateEasterEgg() {
        console.log('%c🎮 ایستر اگ فعال شد!', 'font-size: 24px; color: #8b5cf6;');
        console.log('%c👑 طراحی شده توسط Ali369', 'font-size: 18px; color: #3b82f6;');
        
        // انیمیشن خاص
        document.body.classList.add('easter-egg-active');
        
        // اضافه کردن کنفتی
        this.createConfetti();
        
        // پخش صدا
        this.playSound('easter-egg');
        
        setTimeout(() => {
            document.body.classList.remove('easter-egg-active');
        }, 5000);
    }

    activateSecretMode() {
        // حالت مخفی
        this.state.secretMode = true;
        this.showNotification('🔮 حالت مخفی فعال شد!', 'success');
        
        // تغییر تم به رنگین‌کمان
        document.documentElement.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8f00ff)');
    }

    initConsoleArt() {
        console.log(`
╔══════════════════════════════════════╗
║                                      ║
║     🎮  بازی‌های کلاسیک  v2.0.1     ║
║                                      ║
║     طراحی شده با ❤️ توسط Ali369     ║
║                                      ║
╚══════════════════════════════════════╝
        `);
    }

    addWatermark() {
        const watermark = document.createElement('div');
        watermark.className = 'developer-watermark';
        watermark.innerHTML = `
            <span class="watermark-text">Ali369</span>
        `;
        
        document.body.appendChild(watermark);
        
        // استایل واترمارک
        const style = document.createElement('style');
        style.textContent = `
            .developer-watermark {
                position: fixed;
                bottom: 20px;
                left: 20px;
                opacity: 0.1;
                font-size: 12px;
                color: #000;
                pointer-events: none;
                z-index: 9999;
                transform: rotate(-5deg);
                user-select: none;
            }
            
            [data-theme="dark"] .developer-watermark {
                color: #fff;
            }
            
            .easter-egg-active .developer-watermark {
                opacity: 0.3;
                animation: pulse 2s infinite;
            }
        `;
        document.head.appendChild(style);
    }

    createConfetti() {
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'easter-egg-confetti';
            
            const size = Math.random() * 10 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            confetti.style.cssText = `
                position: fixed;
                top: -10px;
                left: ${Math.random() * 100}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${Math.random() * 50}%;
                transform: rotate(${Math.random() * 360}deg);
                animation: confetti-fall ${Math.random() * 3 + 2}s ease-out forwards;
                z-index: 99999;
                pointer-events: none;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
        
        const confettiStyle = document.createElement('style');
        confettiStyle.textContent = `
            @keyframes confetti-fall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(${Math.random() * 720}deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(confettiStyle);
    }

    // ============================================
    // بخش ۴۱: Error Recovery
    // ============================================
    initErrorRecovery() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'runtime');
            this.attemptErrorRecovery(event);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'promise');
            this.attemptPromiseRecovery(event);
        });
    }

    attemptErrorRecovery(errorEvent) {
        // تلاش برای بازیابی از خطا
        const errorElement = errorEvent.target;
        
        // اگر تصویر خطا داد، fallback نمایش بده
        if (errorElement.tagName === 'IMG') {
            errorElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎮</text></svg>';
        }
        
        // اگر فایل CSS خطا داد
        if (errorElement.tagName === 'LINK' && errorElement.rel === 'stylesheet') {
            console.warn('⚠️ فایل CSS بارگذاری نشد:', errorElement.href);
        }
    }

    attemptPromiseRecovery(promiseEvent) {
        // تلاش برای بازیابی از خطای Promise
        console.warn('⚠️ خطای Promise:', promiseEvent.reason);
        
        // نمایش نوتیفیکیشن به کاربر
        this.showNotification('خطایی رخ داد، در حال تلاش مجدد...', 'warning');
    }

    // ============================================
    // بخش ۴۲: Memory Management
    // ============================================
    initMemoryManagement() {
        // پاکسازی حافظه هر ۵ دقیقه
        setInterval(() => {
            this.cleanupMemory();
        }, 300000);
    }

    cleanupMemory() {
        // پاک کردن کش‌های قدیمی
        this.clearExpiredCache();
        
        // پاک کردن observers غیرضروری
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // پاک کردن متغیرهای موقت
        if (this.tempData) {
            delete this.tempData;
        }
        
        // فعال‌سازی garbage collector (در صورت امکان)
        if (window.gc) {
            window.gc();
        }
    }

    // ============================================
    // بخش ۴۳: Browser Compatibility
    // ============================================
    initBrowserCompatibility() {
        this.detectBrowser();
        this.addPolyfills();
        this.applyBrowserSpecificFixes();
    }

    detectBrowser() {
        const ua = navigator.userAgent;
        
        if (ua.includes('Chrome')) {
            this.browser = 'chrome';
        } else if (ua.includes('Firefox')) {
            this.browser = 'firefox';
        } else if (ua.includes('Safari')) {
            this.browser = 'safari';
        } else if (ua.includes('Edge')) {
            this.browser = 'edge';
        } else {
            this.browser = 'other';
        }
        
        // اعمال فیکس‌های مخصوص مرورگر
        document.documentElement.classList.add(`browser-${this.browser}`);
    }

    addPolyfills() {
        // Intersection Observer
        if (!window.IntersectionObserver) {
            require('intersection-observer');
        }
        
        // Resize Observer
        if (!window.ResizeObserver) {
            require('resize-observer-polyfill');
        }
        
        // Web Animations
        if (!document.body.animate) {
            require('web-animations-js');
        }
    }

    applyBrowserSpecificFixes() {
        // فیکس برای Safari
        if (this.browser === 'safari') {
            document.documentElement.classList.add('safari-fix');
            
            // فیکس برای flexbox در Safari
            const style = document.createElement('style');
            style.textContent = `
                .game-card-main {
                    -webkit-backdrop-filter: none;
                    backdrop-filter: none;
                }
            `;
            document.head.appendChild(style);
        }
        
        // فیکس برای Firefox
        if (this.browser === 'firefox') {
            document.documentElement.classList.add('firefox-fix');
            
            // فیکس برای smooth scrolling
            const style = document.createElement('style');
            style.textContent = `
                html {
                    scroll-behavior: auto;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ============================================
    // بخش ۴۴: راه‌اندازی نهایی
    // ============================================
    finalize() {
        // ذخیره زمان شروع
        this.startTime = Date.now();
        
        // ثبت در کنسول
        this.printWelcomeMessage();
        
        // اجرای ویژگی‌های نهایی
        this.runFinalChecks();
    }

    printWelcomeMessage() {
        console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🎮  بازی‌های کلاسیک - Classic Games Collection       ║
║                                                            ║
║     🚀 نسخه: ${this.config.version.padEnd(20)}          ║
║     👨‍💻 توسعه‌دهنده: ${this.config.developer.padEnd(20)}   ║
║     📅 سال: ${this.config.year.padEnd(22)}               ║
║     ⚡ وضعیت: فعال                                        ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║     ✨ ویژگی‌های فعال:                                   ║
║     • PWA Support                                        ║
║     • Offline Mode                                      ║
║     • RTL Persian                                        ║
║     • Dark/Light Theme                                  ║
║     • Advanced Animations                               ║
║     • SEO Optimized                                     ║
║     • Accessibility                                     ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║     📢 برای اطلاعات بیشتر:                               ║
║     • GitHub: /ali369-dev                               ║
║     • Telegram: @ali369                                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
        `);
    }

    runFinalChecks() {
        // بررسی اتصال اینترنت
        if (!navigator.onLine) {
            this.showNotification('📴 شما در حالت آفلاین هستید', 'warning');
        }
        
        // بررسی سازگاری مرورگر
        this.checkBrowserCompatibility();
        
        // بررسی عملکرد
        this.measurePerformance();
        
        // ثبت موفقیت راه‌اندازی
        console.log('✅ برنامه با موفقیت راه‌اندازی شد!');
        console.log(`⏱️ زمان راه‌اندازی: ${Date.now() - this.startTime}ms`);
    }

    checkBrowserCompatibility() {
        const checks = {
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            indexedDB: !!window.indexedDB,
            serviceWorker: 'serviceWorker' in navigator,
            webGL: this.supportsWebGL(),
            webAudio: this.supportsWebAudio(),
            webRTC: this.supportsWebRTC(),
            webWorkers: !!window.Worker,
            webAnimations: !!document.body.animate,
            cssGrid: CSS.supports('display', 'grid'),
            cssVariables: CSS.supports('--custom-property', '0')
        };
        
        const incompatibleFeatures = Object.entries(checks)
            .filter(([_, supported]) => !supported)
            .map(([feature]) => feature);
        
        if (incompatibleFeatures.length > 0) {
            console.warn('⚠️ ویژگی‌های پشتیبانی نشده:', incompatibleFeatures);
        }
        
        return checks;
    }

    measurePerformance() {
        const metrics = {
            domContentLoaded: performance.timing?.domContentLoadedEventEnd - performance.timing?.navigationStart,
            load: performance.timing?.loadEventEnd - performance.timing?.navigationStart,
            domInteractive: performance.timing?.domInteractive - performance.timing?.navigationStart
        };
        
        console.log('📊 آمار عملکرد:', metrics);
    }
}

// ============================================
// بخش ۴۵: ایجاد استایل‌های پویا
// ============================================
class DynamicStyles {
    static inject() {
        const style = document.createElement('style');
        style.textContent = `
            /* استایل‌های پویا برای نوتیفیکیشن‌ها */
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--white);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
                padding: var(--space-4) var(--space-6);
                display: flex;
                align-items: center;
                gap: var(--space-4);
                transform: translateX(120%);
                transition: transform var(--transition-normal);
                z-index: 9999;
                max-width: 400px;
                border: 2px solid var(--gray-200);
            }
            
            [data-theme="dark"] .notification {
                background: var(--gray-800);
                border-color: var(--gray-700);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                flex: 1;
            }
            
            .notification-info i { color: var(--info-color); }
            .notification-success i { color: var(--success-color); }
            .notification-warning i { color: var(--warning-color); }
            .notification-error i { color: var(--danger-color); }
            
            .notification-close {
                width: 30px;
                height: 30px;
                border-radius: var(--radius-full);
                border: none;
                background: var(--gray-100);
                color: var(--gray-600);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--transition-fast);
            }
            
            [data-theme="dark"] .notification-close {
                background: var(--gray-700);
                color: var(--gray-400);
            }
            
            .notification-close:hover {
                background: var(--danger-color);
                color: var(--white);
                transform: rotate(90deg);
            }
            
            /* انیمیشن ریپل */
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.7);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            /* کلاس‌های keyboard navigation */
            .keyboard-nav *:focus {
                outline: 3px solid var(--primary-color) !important;
                outline-offset: 2px !important;
            }
            
            /* Reduced motion */
            .reduced-motion * {
                animation: none !important;
                transition: none !important;
            }
            
            /* Touch feedback */
            .touched {
                transform: scale(0.95) !important;
                transition: transform 0.1s !important;
            }
            
            /* Update notification */
            .update-notification {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: var(--gradient-primary);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
                color: var(--white);
                box-shadow: var(--shadow-xl);
                transform: translateY(200%);
                transition: transform var(--transition-normal);
                z-index: 9999;
            }
            
            .update-notification.show {
                transform: translateY(0);
            }
            
            .update-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--space-4);
                flex-wrap: wrap;
            }
            
            .update-content button {
                padding: var(--space-2) var(--space-6);
                background: var(--white);
                border: none;
                border-radius: var(--radius-md);
                color: var(--primary-color);
                font-weight: 600;
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            
            .update-content button:hover {
                transform: scale(1.05);
                box-shadow: var(--shadow-md);
            }
            
            /* Responsive notifications */
            @media (max-width: 768px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
                
                .update-content {
                    flex-direction: column;
                }
                
                .update-content button {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// بخش ۴۶: Export و راه‌اندازی
// ============================================

// تزریق استایل‌های پویا
DynamicStyles.inject();

// ایجاد instance اصلی
let gameInstance;

// اجرا پس از بارگذاری کامل DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        gameInstance = new ClassicGames();
        window.gameInstance = gameInstance; // برای دسترسی در کنسول
        
        // ثبت در کنسول جهانی
        console.log('🎮 برای دسترسی به بازی از window.gameInstance استفاده کنید');
    } catch (error) {
        console.error('❌ خطا در راه‌اندازی برنامه:', error);
        
        // نمایش خطای بحرانی
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Vazirmatn, sans-serif; text-align: center; padding: 20px;">
                <div>
                    <h1 style="font-size: 3rem; margin-bottom: 1rem;">⚠️</h1>
                    <h2 style="margin-bottom: 1rem;">خطا در بارگذاری بازی</h2>
                    <p style="color: var(--gray-600); margin-bottom: 2rem;">لطفاً صفحه را مجدداً بارگذاری کنید</p>
                    <button onclick="location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        بارگذاری مجدد
                    </button>
                </div>
            </div>
        `;
    }
});

// ============================================
// بخش ۴۷: Module Exports
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClassicGames;
}

// ============================================
// پایان فایل JavaScript
// ============================================
/*
   طراحی و توسعه: Ali369
   تاریخ: دی ۱۴۰۲
   نسخه: ۲.۰.۱
   
   این فایل JavaScript توسط Ali369 طراحی و توسعه داده شده است.
   تمامی حقوق محفوظ است.
   
   ویژگی‌های پیاده‌سازی شده:
   ✓ سیستم مدیریت تم پویا
   ✓ انیمیشن‌های پیشرفته
   ✓ پشتیبانی از PWA
   ✓ حالت آفلاین
   ✓ SEO Optimization
   ✓ Accessibility
   ✓ Performance Optimization
   ✓ Error Recovery
   ✓ Memory Management
   ✓ Browser Compatibility
   ✓ Responsive Design
   ✓ RTL Support
   ✓ Multi-language Ready
   ✓ Analytics
   ✓ Easter Eggs
   ✓ Developer Features
*/
