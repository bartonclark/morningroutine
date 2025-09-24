// Morning Routine Tracker - Core Application Logic
// Combines Huberman neuroscience protocols with Mel Robbins behavioral psychology
// Enhanced for mobile touch devices

class MorningRoutineApp {
    constructor() {
        this.currentTab = 'routine';
        this.routineState = {
            countdown: false,
            bedMaking: false,
            highFive: false,
            hydration: false,
            lightExposure: false,
            movement: false
        };
        this.routineProgress = 0;
        this.wakeTime = null;
        this.startTime = null;
        this.timers = {};
        this.streakData = this.loadStreakData();
        this.analyticsData = this.loadAnalyticsData();
        this.userSettings = this.loadUserSettings();
        this.waterIntake = 0;
        this.selectedMood = null;
        this.selectedMovement = null;
        this.priorities = this.loadPriorities();
        this.priorityAnalytics = this.loadPriorityAnalytics();
        
        this.affirmations = [
            "You are capable of amazing things today!",
            "Your energy and focus are getting stronger every day.",
            "You have the power to create positive change in your life.",
            "Today is an opportunity to become the best version of yourself.",
            "You are resilient, strong, and ready for whatever comes your way.",
            "Your morning routine is building the foundation for your success.",
            "You are worthy of all the good things coming your way.",
            "Every day you're getting better at taking care of yourself.",
            "You have the strength to overcome any challenges today.",
            "Your positive choices this morning will ripple through your entire day."
        ];
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.updateDisplay();
        this.checkDailyReset();
        this.calculateBedtime();
        this.requestNotificationPermission();
        this.loadWeatherData();
        this.updateAnalytics();
        this.showDailyAffirmation();
        this.initializePriorities();
    }
    
    setupEventListeners() {
        // Enhanced mobile touch support for navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            // Handle both click and touch events for better mobile support
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
            
            tab.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
            
            // Prevent double-tap zoom on iOS
            tab.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
        });
        
        // Routine Actions
        this.addClickHandler('startCountdown', () => this.startCountdownSequence());
        this.addClickHandler('bedMadeBtn', () => this.completeBedMaking());
        this.addClickHandler('highFiveBtn', () => this.completeHighFive());
        this.addClickHandler('newAffirmation', () => this.showNewAffirmation());
        this.addClickHandler('completeMovement', () => this.completeMovement());
        
        // Mood selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            this.addClickHandler(btn, () => this.selectMood(btn.dataset.mood, btn));
        });
        
        // Water tracking
        document.querySelectorAll('.water-btn').forEach(btn => {
            this.addClickHandler(btn, () => this.addWater(parseInt(btn.dataset.amount)));
        });
        
        // Movement selection
        document.querySelectorAll('.option-btn').forEach(btn => {
            this.addClickHandler(btn, () => this.selectMovement(btn.dataset.movement, btn));
        });
        
        // Light exposure timer
        this.addClickHandler('startLightTimer', () => this.startLightTimer());
        this.addClickHandler('stopLightTimer', () => this.stopLightTimer());
        
        // Sleep preparation
        document.getElementById('wakeTime').addEventListener('change', () => this.calculateBedtime());
        document.querySelectorAll('#sleep-tab input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateSleepQuality());
        });
        
        // Priority management
        this.addClickHandler('savePriorities', () => this.savePriorities());
        this.addClickHandler('clearPriorities', () => this.clearPriorities());
        this.addClickHandler('emailPriorities', () => this.emailPriorities());
        
        // Time sliders
        document.querySelectorAll('.time-slider').forEach(slider => {
            slider.addEventListener('input', (e) => this.updateTimeDisplay(e.target));
        });
        
        // Settings
        document.getElementById('userName').addEventListener('change', (e) => this.updateSetting('name', e.target.value));
        document.getElementById('location').addEventListener('change', (e) => this.updateSetting('location', e.target.value));
        this.addClickHandler('exportData', () => this.exportData());
        this.addClickHandler('resetData', () => this.resetData());
        
        // Modal
        this.addClickHandler('modalClose', () => this.closeModal());
    }
    
    // Enhanced click handler for better mobile support
    addClickHandler(elementOrId, callback) {
        const element = typeof elementOrId === 'string' ? 
            document.getElementById(elementOrId) : elementOrId;
            
        if (!element) return;
        
        let touchStartTime = 0;
        let hasMoved = false;
        
        element.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            hasMoved = false;
        }, { passive: true });
        
        element.addEventListener('touchmove', () => {
            hasMoved = true;
        }, { passive: true });
        
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touchDuration = Date.now() - touchStartTime;
            
            // Only trigger if it was a quick tap without movement
            if (touchDuration < 500 && !hasMoved) {
                callback(e);
            }
        });
        
        // Fallback for non-touch devices
        element.addEventListener('click', (e) => {
            // Prevent double execution on touch devices
            if (e.detail === 0 || e.pointerType === 'mouse') {
                callback(e);
            }
        });
    }
    
    switchTab(tabName) {
        // Update navigation with enhanced mobile feedback
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.style.transform = 'scale(1)';
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            // Add subtle scale animation for mobile feedback
            activeTab.style.transform = 'scale(0.95)';
            setTimeout(() => {
                activeTab.style.transform = 'scale(1)';
            }, 100);
        }
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${tabName}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        this.currentTab = tabName;
        
        // Load tab-specific data
        if (tabName === 'analytics') {
            this.updateAnalytics();
        }
    }
    
    startCountdownSequence() {
        if (this.routineState.countdown) return;
        
        if (!this.startTime) {
            this.startTime = new Date();
        }
        
        const button = document.getElementById('startCountdown');
        const display = document.getElementById('countdownDisplay');
        const timeToAction = document.getElementById('timeToAction');
        
        button.disabled = true;
        button.textContent = 'Counting Down...';
        
        let count = 5;
        display.textContent = count;
        display.classList.add('pulsing');
        
        // Enhanced haptic feedback for mobile
        this.triggerHapticFeedback();
        
        const countdownInterval = setInterval(() => {
            count--;
            display.textContent = count;
            this.triggerHapticFeedback();
            
            if (count === 0) {
                clearInterval(countdownInterval);
                display.textContent = 'GO!';
                display.style.color = '#27AE60';
                
                setTimeout(() => {
                    this.completeCountdown();
                    this.startActionTimer();
                }, 1000);
            }
        }, 1000);
    }
    
    completeCountdown() {
        this.routineState.countdown = true;
        this.updateRoutineProgress();
        this.updateTaskStatus('countdown-status', true);
        
        const button = document.getElementById('startCountdown');
        button.textContent = '✅ Countdown Complete!';
        button.style.background = '#27AE60';
        
        this.saveProgress();
        this.showMicroCelebration('Great start! You beat the snooze!');
    }
    
    startActionTimer() {
        const timeToAction = document.getElementById('timeToAction');
        const actionTime = document.getElementById('actionTime');
        
        timeToAction.style.display = 'block';
        let seconds = 0;
        
        this.timers.actionTimer = setInterval(() => {
            seconds++;
            actionTime.textContent = seconds;
        }, 1000);
    }
    
    completeBedMaking() {
        if (this.routineState.bedMaking) return;
        
        this.routineState.bedMaking = true;
        this.updateRoutineProgress();
        this.updateTaskStatus('bedmaking-status', true);
        
        // Update bed making streak
        this.streakData.bedMakingStreak++;
        document.getElementById('bedStreak').textContent = this.streakData.bedMakingStreak;
        
        const button = document.getElementById('bedMadeBtn');
        button.textContent = '✅ Bed Made!';
        button.style.background = '#27AE60';
        button.disabled = true;
        
        this.saveProgress();
        this.showMicroCelebration('Excellent! Starting strong with a made bed!');
    }
    
    completeHighFive() {
        if (this.routineState.highFive) return;
        
        this.routineState.highFive = true;
        this.updateRoutineProgress();
        this.updateTaskStatus('highfive-status', true);
        
        const button = document.getElementById('highFiveBtn');
        button.textContent = '✅ High-Five Complete! 🙌';
        button.style.background = '#27AE60';
        button.disabled = true;
        
        // Record mood if selected
        if (this.selectedMood) {
            this.analyticsData.moods.push({
                date: new Date().toDateString(),
                mood: this.selectedMood,
                time: 'morning'
            });
        }
        
        this.saveProgress();
        this.showMicroCelebration('You\'re building unstoppable confidence! 🌟');
    }
    
    selectMood(mood, button) {
        // Clear previous selection
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Select current mood with enhanced mobile feedback
        button.classList.add('selected');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
        
        this.selectedMood = mood;
    }
    
    showNewAffirmation() {
        const affirmationElement = document.getElementById('dailyAffirmation');
        const randomAffirmation = this.affirmations[Math.floor(Math.random() * this.affirmations.length)];
        
        affirmationElement.style.opacity = '0';
        setTimeout(() => {
            affirmationElement.textContent = randomAffirmation;
            affirmationElement.style.opacity = '1';
        }, 200);
    }
    
    showDailyAffirmation() {
        const today = new Date().toDateString();
        const savedAffirmation = localStorage.getItem(`affirmation_${today}`);
        
        if (!savedAffirmation) {
            const dailyAffirmation = this.affirmations[Math.floor(Math.random() * this.affirmations.length)];
            document.getElementById('dailyAffirmation').textContent = dailyAffirmation;
            localStorage.setItem(`affirmation_${today}`, dailyAffirmation);
        } else {
            document.getElementById('dailyAffirmation').textContent = savedAffirmation;
        }
    }
    
    addWater(amount) {
        this.waterIntake += amount;
        document.getElementById('waterAmount').textContent = `${this.waterIntake}oz`;
        
        // Check if hydration goal is met
        if (this.waterIntake >= 16 && !this.routineState.hydration) {
            this.completeHydration();
        }
        
        // Start caffeine timer on first water intake
        if (this.waterIntake === amount && !this.timers.caffeineTimer) {
            this.startCaffeineTimer();
        }
    }
    
    completeHydration() {
        this.routineState.hydration = true;
        this.updateRoutineProgress();
        this.updateTaskStatus('hydration-status', true);
        
        this.saveProgress();
        this.showMicroCelebration('Hydration on point! Your brain is thanking you! 💧');
    }
    
    startCaffeineTimer() {
        const caffeineTimer = document.getElementById('caffeineTimer');
        const countdown = document.getElementById('caffeineCountdown');
        
        caffeineTimer.style.display = 'block';
        
        let totalMinutes = 90; // 90 minutes optimal delay
        
        this.timers.caffeineTimer = setInterval(() => {
            const minutes = Math.floor(totalMinutes);
            const seconds = Math.floor((totalMinutes - minutes) * 60);
            
            countdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            totalMinutes -= 1/60; // Decrease by 1 second
            
            if (totalMinutes <= 0) {
                clearInterval(this.timers.caffeineTimer);
                countdown.textContent = '☕ Coffee Time!';
                countdown.style.color = '#F1C40F';
                this.showNotification('Optimal caffeine time! Your adenosine levels are perfect for coffee.');
            }
        }, 1000);
    }
    
    startLightTimer() {
        if (this.timers.lightTimer) return;
        
        const startBtn = document.getElementById('startLightTimer');
        const stopBtn = document.getElementById('stopLightTimer');
        const display = document.getElementById('lightTimerDisplay');
        
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        
        let seconds = 0;
        
        this.timers.lightTimer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            display.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    stopLightTimer() {
        if (!this.timers.lightTimer) return;
        
        clearInterval(this.timers.lightTimer);
        this.timers.lightTimer = null;
        
        const startBtn = document.getElementById('startLightTimer');
        const stopBtn = document.getElementById('stopLightTimer');
        
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        
        this.completeLightExposure();
    }
    
    completeLightExposure() {
        if (this.routineState.lightExposure) return;
        
        this.routineState.lightExposure = true;
        this.updateRoutineProgress();
        this.updateTaskStatus('light-status', true);
        
        this.saveProgress();
        this.showMicroCelebration('Circadian rhythm optimized! Your cortisol awakening response is primed! ☀️');
    }
    
    selectMovement(movement, button) {
        // Clear previous selection
        document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Select current movement with mobile feedback
        button.classList.add('selected');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
        
        this.selectedMovement = movement;
    }
    
    completeMovement() {
        if (this.routineState.movement) return;
        
        const gratitude = document.getElementById('gratitudeInput').value.trim();
        const intention = document.getElementById('intentionInput').value.trim();
        
        if (!this.selectedMovement) {
            alert('Please select a movement option first!');
            return;
        }
        
        if (!gratitude || !intention) {
            alert('Please complete both gratitude and intention sections!');
            return;
        }
        
        this.routineState.movement = true;
        this.updateRoutineProgress();
        this.updateTaskStatus('movement-status', true);
        
        // Save journal entries
        this.analyticsData.journalEntries.push({
            date: new Date().toDateString(),
            gratitude: gratitude,
            intention: intention,
            movement: this.selectedMovement
        });
        
        const button = document.getElementById('completeMovement');
        button.textContent = '✅ Movement & Mindfulness Complete!';
        button.style.background = '#27AE60';
        button.disabled = true;
        
        this.saveProgress();
        this.showMicroCelebration('Mind and body aligned! You\'re unstoppable! 🧘‍♀️');
        
        // Check if routine is complete
        this.checkRoutineCompletion();
    }
    
    updateRoutineProgress() {
        const completed = Object.values(this.routineState).filter(Boolean).length;
        const total = Object.keys(this.routineState).length;
        
        this.routineProgress = (completed / total) * 100;
        
        document.getElementById('routineProgress').style.width = `${this.routineProgress}%`;
        document.getElementById('progressText').textContent = `${completed}/${total} Complete`;
        
        // Update main progress indicator
        if (completed === total) {
            document.querySelector('.routine-header h2').textContent = '🎉 Morning Mastery Complete!';
        }
    }
    
    updateTaskStatus(statusId, completed) {
        const statusIndicator = document.getElementById(statusId);
        if (statusIndicator && completed) {
            statusIndicator.classList.add('completed');
            statusIndicator.parentElement.parentElement.classList.add('completed');
        }
    }
    
    checkRoutineCompletion() {
        const allComplete = Object.values(this.routineState).every(Boolean);
        
        if (allComplete) {
            // Stop action timer
            if (this.timers.actionTimer) {
                clearInterval(this.timers.actionTimer);
            }
            
            // Calculate completion time
            const completionTime = new Date();
            const duration = Math.round((completionTime - this.startTime) / 1000 / 60); // minutes
            
            // Update streak
            this.streakData.currentStreak++;
            this.streakData.longestStreak = Math.max(this.streakData.longestStreak, this.streakData.currentStreak);
            this.streakData.lastCompletionDate = new Date().toDateString();
            
            // Record completion
            this.analyticsData.completions.push({
                date: new Date().toDateString(),
                duration: duration,
                completionTime: completionTime.toTimeString().substring(0, 5)
            });
            
            this.updateDisplay();
            this.saveProgress();
            
            this.showCompletionModal(duration);
        }
    }
    
    showCompletionModal(duration) {
        const modal = document.getElementById('successModal');
        const title = document.getElementById('modalTitle');
        const message = document.getElementById('modalMessage');
        
        title.textContent = `🎉 Million Dollar Morning Complete!`;
        message.innerHTML = `
            Amazing work! You completed your routine in <strong>${duration} minutes</strong>.<br><br>
            Your cortisol peak is optimized, your dopamine is primed, and you're ready to dominate the day!<br><br>
            Current streak: <strong>${this.streakData.currentStreak} days</strong>
        `;
        
        modal.classList.add('show');
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            this.closeModal();
        }, 5000);
    }
    
    closeModal() {
        document.getElementById('successModal').classList.remove('show');
    }
    
    showMicroCelebration(message) {
        // Simple toast notification with enhanced mobile styling
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #27AE60, #2ECC71);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            z-index: 1001;
            max-width: 90%;
            text-align: center;
            box-shadow: 0 8px 32px rgba(39, 174, 96, 0.4);
            animation: slideInDown 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutUp 0.3s ease-in forwards';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
    
    // Priority Management Methods
    initializePriorities() {
        this.updateTimeDisplays();
        this.loadTodaysPriorities();
        this.showSmartSuggestions();
        this.updatePriorityAnalytics();
    }
    
    updateTimeDisplays() {
        document.querySelectorAll('.time-slider').forEach(slider => {
            this.updateTimeDisplay(slider);
        });
    }
    
    updateTimeDisplay(slider) {
        const minutes = parseInt(slider.value);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        let display = '';
        if (hours > 0) {
            display += `${hours}h `;
        }
        if (remainingMinutes > 0 || hours === 0) {
            display += `${remainingMinutes}m`;
        }
        
        const displayElement = document.getElementById(`timeDisplay${slider.id.slice(-1)}`);
        if (displayElement) {
            displayElement.textContent = display.trim();
        }
    }
    
    savePriorities() {
        const priorities = [];
        let hasValidPriority = false;
        
        for (let i = 1; i <= 3; i++) {
            const text = document.getElementById(`priority${i}`).value.trim();
            const category = document.getElementById(`category${i}`).value;
            const time = parseInt(document.getElementById(`time${i}`).value);
            
            if (text) {
                hasValidPriority = true;
                priorities.push({
                    id: `priority_${Date.now()}_${i}`,
                    text: text,
                    category: category,
                    estimatedTime: time,
                    order: i,
                    completed: false,
                    satisfaction: null,
                    createdAt: new Date().toISOString(),
                    targetDate: this.getTomorrowDate()
                });
            }
        }
        
        if (!hasValidPriority) {
            alert('Please enter at least one priority before saving.');
            return;
        }
        
        // Save priorities for tomorrow
        const tomorrow = this.getTomorrowDate();
        this.priorities[tomorrow] = priorities;
        
        // Update evening checklist
        document.getElementById('prioritiesSet').checked = true;
        
        // Show success message
        this.showPrioritiesSuccess();
        
        // Update analytics
        this.priorityAnalytics.totalPriorities += priorities.length;
        this.priorityAnalytics.planningDays.push(new Date().toDateString());
        
        // Save to localStorage
        this.savePriorityData();
        this.updateSleepQuality();
        this.updatePriorityCompletion();
        
        // Offer email option
        this.showEmailOption(priorities);
        
        this.showMicroCelebration('Tomorrow\'s priorities set! You\'re preparing for success! 🎯');
    }
    
    showEmailOption(priorities) {
        const emailBtn = document.getElementById('emailPriorities');
        if (emailBtn) {
            emailBtn.style.display = 'block';
            emailBtn.dataset.priorities = JSON.stringify(priorities);
        }
    }
    
    emailPriorities() {
        const prioritiesData = document.getElementById('emailPriorities').dataset.priorities;
        if (!prioritiesData) return;
        
        const priorities = JSON.parse(prioritiesData);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const subject = `Your Top 3 Priorities for ${tomorrow.toLocaleDateString()}`;
        const body = this.generateEmailBody(priorities, tomorrow);
        
        // Create mailto link
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Try to open email client
        window.location.href = mailtoLink;
        
        this.showMicroCelebration('Email draft opened! Send it to yourself for accountability! 📧');
    }
    
    generateEmailBody(priorities, date) {
        let body = `🌅 TOMORROW'S TOP 3 PRIORITIES\n`;
        body += `Date: ${date.toLocaleDateString()}\n`;
        body += `Set: ${new Date().toLocaleString()}\n\n`;
        
        body += `Yesterday evening, I decided these were my most important priorities:\n\n`;
        
        priorities.forEach((priority, index) => {
            body += `${index + 1}. ${priority.text}\n`;
            if (priority.category) {
                body += `   Category: ${this.getCategoryName(priority.category)}\n`;
            }
            body += `   Estimated Time: ${this.formatTime(priority.estimatedTime)}\n\n`;
        });
        
        body += `📋 FOCUS STRATEGY:\n`;
        body += `• Tackle these during Phase One work blocks (0-8 hours post-wake)\n`;
        body += `• Use your cortisol peak for challenging tasks\n`;
        body += `• Rate satisfaction (1-5) after completion\n\n`;
        
        body += `💡 NEUROSCIENCE REMINDER:\n`;
        body += `Your brain is most focused in the first 8 hours after waking.\n`;
        body += `Use this optimal state for your most important work!\n\n`;
        
        body += `Generated by Morning Routine Tracker 🌟\n`;
        body += `Combining Huberman neuroscience with Mel Robbins psychology`;
        
        return body;
    }
    
    getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toDateString();
    }
    
    showPrioritiesSuccess() {
        const successElement = document.getElementById('prioritiesSuccess');
        if (successElement) {
            successElement.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 5000);
        }
    }
    
    clearPriorities() {
        if (confirm('Clear all priorities? This cannot be undone.')) {
            for (let i = 1; i <= 3; i++) {
                document.getElementById(`priority${i}`).value = '';
                document.getElementById(`category${i}`).value = '';
                document.getElementById(`time${i}`).value = i === 1 ? 60 : i === 2 ? 45 : 30;
                this.updateTimeDisplay(document.getElementById(`time${i}`));
            }
            
            const successElement = document.getElementById('prioritiesSuccess');
            if (successElement) {
                successElement.style.display = 'none';
            }
            
            document.getElementById('prioritiesSet').checked = false;
            this.updateSleepQuality();
            this.updatePriorityCompletion();
            
            const emailBtn = document.getElementById('emailPriorities');
            if (emailBtn) {
                emailBtn.style.display = 'none';
            }
        }
    }
    
    loadTodaysPriorities() {
        const today = new Date().toDateString();
        const todaysPriorities = this.priorities[today];
        
        if (todaysPriorities && todaysPriorities.length > 0) {
            this.displayMorningPriorities(todaysPriorities);
        } else {
            const morningPriorities = document.getElementById('morningPriorities');
            if (morningPriorities) {
                morningPriorities.style.display = 'none';
            }
        }
    }
    
    displayMorningPriorities(priorities) {
        const morningPrioritiesCard = document.getElementById('morningPriorities');
        const priorityList = document.getElementById('morningPriorityList');
        
        if (!morningPrioritiesCard || !priorityList) return;
        
        priorityList.innerHTML = '';
        
        priorities.forEach((priority, index) => {
            const priorityElement = this.createMorningPriorityElement(priority, index);
            priorityList.appendChild(priorityElement);
        });
        
        morningPrioritiesCard.style.display = 'block';
        this.checkAllPrioritiesComplete();
    }
    
    createMorningPriorityElement(priority, index) {
        const priorityDiv = document.createElement('div');
        priorityDiv.className = `morning-priority-item ${priority.completed ? 'completed' : ''}`;
        priorityDiv.dataset.priorityId = priority.id;
        
        const timeDisplay = this.formatTime(priority.estimatedTime);
        const categoryBadge = priority.category ? 
            `<span class="priority-category-badge ${priority.category}">${this.getCategoryEmoji(priority.category)} ${this.getCategoryName(priority.category)}</span>` : '';
        
        priorityDiv.innerHTML = `
            <div class="priority-content">
                <input type="checkbox" class="priority-checkbox" ${priority.completed ? 'checked' : ''} 
                       onchange="morningRoutineApp.togglePriorityCompletion('${priority.id}')">
                <div class="priority-info">
                    <div class="priority-text">${priority.text}</div>
                    <div class="priority-meta">
                        ${categoryBadge}
                        <span class="priority-time">${timeDisplay}</span>
                    </div>
                </div>
            </div>
            <div class="satisfaction-rating ${priority.completed ? 'show' : ''}">
                <label>How satisfied are you with completing this? (1-5)</label>
                <div class="rating-buttons">
                    ${[1,2,3,4,5].map(rating => 
                        `<button class="rating-btn ${priority.satisfaction === rating ? 'selected' : ''}" 
                                onclick="morningRoutineApp.setPrioritySatisfaction('${priority.id}', ${rating})">${rating}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        return priorityDiv;
    }
    
    getCategoryEmoji(category) {
        const emojis = {
            work: '💼',
            personal: '👤', 
            health: '💪',
            creative: '🎨',
            relationships: '❤️',
            learning: '📚'
        };
        return emojis[category] || '📋';
    }
    
    getCategoryName(category) {
        const names = {
            work: 'Work',
            personal: 'Personal',
            health: 'Health', 
            creative: 'Creative',
            relationships: 'Relationships',
            learning: 'Learning'
        };
        return names[category] || 'Other';
    }
    
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours > 0) {
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        }
        return `${remainingMinutes}m`;
    }
    
    togglePriorityCompletion(priorityId) {
        const today = new Date().toDateString();
        const todaysPriorities = this.priorities[today];
        
        if (todaysPriorities) {
            const priority = todaysPriorities.find(p => p.id === priorityId);
            if (priority) {
                priority.completed = !priority.completed;
                priority.completedAt = priority.completed ? new Date().toISOString() : null;
                
                // Update UI
                const priorityElement = document.querySelector(`[data-priority-id="${priorityId}"]`);
                if (priorityElement) {
                    const satisfactionRating = priorityElement.querySelector('.satisfaction-rating');
                    
                    if (priority.completed) {
                        priorityElement.classList.add('completed');
                        if (satisfactionRating) satisfactionRating.classList.add('show');
                        
                        this.showMicroCelebration(`Priority completed! "${priority.text}" ✅`);
                    } else {
                        priorityElement.classList.remove('completed');
                        if (satisfactionRating) satisfactionRating.classList.remove('show');
                        priority.satisfaction = null;
                    }
                }
                
                this.savePriorityData();
                this.checkAllPrioritiesComplete();
                this.updatePriorityAnalytics();
            }
        }
    }
    
    setPrioritySatisfaction(priorityId, satisfaction) {
        const today = new Date().toDateString();
        const todaysPriorities = this.priorities[today];
        
        if (todaysPriorities) {
            const priority = todaysPriorities.find(p => p.id === priorityId);
            if (priority) {
                priority.satisfaction = satisfaction;
                
                // Update UI
                const priorityElement = document.querySelector(`[data-priority-id="${priorityId}"]`);
                if (priorityElement) {
                    const ratingButtons = priorityElement.querySelectorAll('.rating-btn');
                    
                    ratingButtons.forEach(btn => {
                        btn.classList.remove('selected');
                        if (parseInt(btn.textContent) === satisfaction) {
                            btn.classList.add('selected');
                        }
                    });
                }
                
                this.savePriorityData();
                
                if (satisfaction >= 4) {
                    this.showMicroCelebration('High satisfaction rating! You\'re crushing your priorities! 🌟');
                }
            }
        }
    }
    
    checkAllPrioritiesComplete() {
        const today = new Date().toDateString();
        const todaysPriorities = this.priorities[today];
        
        if (todaysPriorities && todaysPriorities.length > 0) {
            const allComplete = todaysPriorities.every(p => p.completed);
            const celebrationElement = document.getElementById('allPrioritiesComplete');
            
            if (celebrationElement) {
                if (allComplete) {
                    celebrationElement.style.display = 'block';
                    this.showMicroCelebration('🎉 ALL PRIORITIES COMPLETE! You\'re having an incredibly productive day!');
                } else {
                    celebrationElement.style.display = 'none';
                }
            }
        }
    }
    
    updatePriorityCompletion() {
        const totalSet = this.getTotalPrioritiesSet();
        const completionElement = document.getElementById('prioritiesCompletion');
        if (completionElement) {
            completionElement.textContent = `${totalSet}/3`;
        }
    }
    
    getTotalPrioritiesSet() {
        let count = 0;
        for (let i = 1; i <= 3; i++) {
            const input = document.getElementById(`priority${i}`);
            if (input && input.value.trim()) {
                count++;
            }
        }
        return count;
    }
    
    showSmartSuggestions() {
        const suggestions = this.generateSmartSuggestions();
        
        if (suggestions.length > 0) {
            const suggestionsContainer = document.getElementById('smartSuggestions');
            const suggestionsList = document.getElementById('suggestionsList');
            
            if (suggestionsContainer && suggestionsList) {
                suggestionsList.innerHTML = '';
                suggestions.forEach(suggestion => {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.className = 'suggestion-item';
                    suggestionElement.textContent = suggestion.text;
                    this.addClickHandler(suggestionElement, () => {
                        this.applySuggestion(suggestion);
                    });
                    suggestionsList.appendChild(suggestionElement);
                });
                
                suggestionsContainer.style.display = 'block';
            }
        }
    }
    
    generateSmartSuggestions() {
        const suggestions = [];
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        // Day-based suggestions
        if (dayOfWeek === 1) { // Monday
            suggestions.push({
                text: "Plan weekly goals and priorities",
                category: "work",
                time: 60
            });
        } else if (dayOfWeek === 5) { // Friday
            suggestions.push({
                text: "Review week and plan for next week",
                category: "work",
                time: 45
            });
        }
        
        // Default suggestions for new users
        if (this.priorityAnalytics.totalPriorities === 0) {
            suggestions.push(
                {
                    text: "Complete most important work task",
                    category: "work",
                    time: 90
                },
                {
                    text: "30-minute morning exercise",
                    category: "health",
                    time: 30
                },
                {
                    text: "Connect with family or friends",
                    category: "relationships",
                    time: 30
                }
            );
        }
        
        return suggestions.slice(0, 3); // Show max 3 suggestions
    }
    
    applySuggestion(suggestion) {
        // Find first empty priority slot
        for (let i = 1; i <= 3; i++) {
            const priorityInput = document.getElementById(`priority${i}`);
            if (priorityInput && !priorityInput.value.trim()) {
                priorityInput.value = suggestion.text;
                
                if (suggestion.category) {
                    const categorySelect = document.getElementById(`category${i}`);
                    if (categorySelect) {
                        categorySelect.value = suggestion.category;
                    }
                }
                
                if (suggestion.time) {
                    const timeSlider = document.getElementById(`time${i}`);
                    if (timeSlider) {
                        timeSlider.value = suggestion.time;
                        this.updateTimeDisplay(timeSlider);
                    }
                }
                
                break;
            }
        }
        
        // Hide suggestions after applying one
        const suggestionsContainer = document.getElementById('smartSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }
    
    updatePriorityAnalytics() {
        // Update completion rate
        const last7Days = this.getLast7DaysData();
        const completionRate = this.calculateCompletionRate(last7Days);
        const completionElement = document.getElementById('priorityCompletionRate');
        if (completionElement) {
            completionElement.textContent = `${completionRate}%`;
        }
        
        // Update planning impact
        const planningImpact = this.calculatePlanningImpact();
        const impactElement = document.getElementById('planningImpact');
        if (impactElement) {
            impactElement.textContent = `+${planningImpact}%`;
        }
        
        // Update patterns
        this.updatePriorityPatterns();
    }
    
    getLast7DaysData() {
        const last7Days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const dayPriorities = this.priorities[dateStr] || [];
            last7Days.push({
                date: dateStr,
                priorities: dayPriorities,
                completedCount: dayPriorities.filter(p => p.completed).length,
                totalCount: dayPriorities.length
            });
        }
        return last7Days;
    }
    
    calculateCompletionRate(data) {
        const totalPriorities = data.reduce((sum, day) => sum + day.totalCount, 0);
        const completedPriorities = data.reduce((sum, day) => sum + day.completedCount, 0);
        
        return totalPriorities > 0 ? Math.round((completedPriorities / totalPriorities) * 100) : 0;
    }
    
    calculatePlanningImpact() {
        // Compare completion rates between planned vs unplanned days
        const plannedDays = this.priorityAnalytics.planningDays.length;
        const totalDays = Object.keys(this.priorities).length;
        
        if (plannedDays === 0 || totalDays === 0) return 0;
        
        // Simulate impact (in real app, would calculate actual difference)
        return Math.min(Math.round((plannedDays / totalDays) * 25), 25);
    }
    
    updatePriorityPatterns() {
        const patterns = this.generatePriorityPatterns();
        const container = document.getElementById('priorityPatterns');
        
        if (container) {
            container.innerHTML = '';
            
            patterns.forEach(pattern => {
                const patternDiv = document.createElement('div');
                patternDiv.className = 'pattern-item';
                patternDiv.textContent = pattern;
                container.appendChild(patternDiv);
            });
        }
    }
    
    generatePriorityPatterns() {
        const patterns = [];
        
        // Planning correlation
        const planningDays = this.priorityAnalytics.planningDays.length;
        
        if (planningDays > 0) {
            patterns.push(`Your most productive days start with evening planning`);
        }
        
        // Default patterns for new users
        if (patterns.length === 0) {
            patterns.push(
                "Start setting priorities to see personalized patterns",
                "Evening planning increases next-day productivity by 25%",
                "Most successful people prioritize health and relationships alongside work"
            );
        }
        
        return patterns.slice(0, 3);
    }
    
    calculateBedtime() {
        const wakeTimeInput = document.getElementById('wakeTime');
        const bedtimeResult = document.getElementById('bedtimeResult');
        
        if (wakeTimeInput && bedtimeResult && wakeTimeInput.value) {
            const [hours, minutes] = wakeTimeInput.value.split(':').map(Number);
            const wakeTime = new Date();
            wakeTime.setHours(hours, minutes, 0, 0);
            
            // Subtract 9 hours for optimal sleep
            const bedtime = new Date(wakeTime.getTime() - (9 * 60 * 60 * 1000));
            
            // Handle next day scenario
            if (bedtime.getDate() !== wakeTime.getDate()) {
                bedtime.setDate(bedtime.getDate() + 1);
            }
            
            const bedtimeStr = bedtime.toTimeString().substring(0, 5);
            bedtimeResult.textContent = bedtimeStr;
            
            // Save wake time
            this.userSettings.wakeTime = wakeTimeInput.value;
            this.saveUserSettings();
        }
    }
    
    updateSleepQuality() {
        const checkboxes = document.querySelectorAll('#sleep-tab input[type="checkbox"]');
        const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        
        const qualityScore = Math.round((completed / total) * 100);
        const scoreElement = document.getElementById('qualityScore');
        
        if (scoreElement) {
            scoreElement.textContent = `${qualityScore}%`;
            
            // Update color based on score
            if (qualityScore >= 80) {
                scoreElement.style.color = '#27AE60';
            } else if (qualityScore >= 60) {
                scoreElement.style.color = '#F1C40F';
            } else {
                scoreElement.style.color = '#E74C3C';
            }
        }
    }
    
    loadWeatherData() {
        // For demo purposes, we'll use placeholder data
        const weatherInfo = document.getElementById('weatherInfo');
        const lightDuration = document.getElementById('lightDuration');
        
        if (weatherInfo && lightDuration) {
            // Simulate weather data
            const conditions = ['☀️ Sunny', '⛅ Partly Cloudy', '☁️ Cloudy', '🌧️ Rainy'];
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            
            weatherInfo.textContent = condition;
            
            // Adjust recommended duration based on "weather"
            let duration;
            if (condition.includes('Sunny')) {
                duration = '5-10 minutes';
            } else if (condition.includes('Partly')) {
                duration = '10-15 minutes';
            } else {
                duration = '15-30 minutes (consider light therapy)';
            }
            
            lightDuration.textContent = `Recommended: ${duration}`;
        }
    }
    
    updateAnalytics() {
        // Update streak display
        const analyticsStreak = document.getElementById('analyticsStreak');
        const currentStreak = document.getElementById('currentStreak');
        
        if (analyticsStreak) analyticsStreak.textContent = this.streakData.currentStreak;
        if (currentStreak) currentStreak.textContent = this.streakData.currentStreak;
        
        // Calculate completion rate (last 7 days)
        const last7Days = this.analyticsData.completions.filter(completion => {
            const completionDate = new Date(completion.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return completionDate >= weekAgo;
        }).length;
        
        const completionRate = Math.round((last7Days / 7) * 100);
        const completionRateElement = document.getElementById('completionRate');
        if (completionRateElement) {
            completionRateElement.textContent = `${completionRate}%`;
        }
        
        // Best completion time
        if (this.analyticsData.completions.length > 0) {
            const bestTime = Math.min(...this.analyticsData.completions.map(c => c.duration));
            const bestTimeElement = document.getElementById('bestTime');
            if (bestTimeElement) {
                bestTimeElement.textContent = `${bestTime}m`;
            }
        }
        
        // Average energy (mood)
        if (this.analyticsData.moods.length > 0) {
            const moodValues = {
                'energized': 4,
                'motivated': 3,
                'calm': 2,
                'tired': 1
            };
            
            const avgMood = this.analyticsData.moods.reduce((sum, mood) => {
                return sum + (moodValues[mood.mood] || 2);
            }, 0) / this.analyticsData.moods.length;
            
            const moodLabels = ['Tired', 'Calm', 'Good', 'Motivated', 'Energized'];
            const avgEnergyElement = document.getElementById('avgEnergy');
            if (avgEnergyElement) {
                avgEnergyElement.textContent = moodLabels[Math.round(avgMood) - 1] || 'N/A';
            }
        }
        
        this.drawProgressChart();
        this.updatePriorityAnalytics();
    }
    
    drawProgressChart() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get last 7 days of data
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const completion = this.analyticsData.completions.find(c => c.date === dateStr);
            last7Days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                completed: completion ? 1 : 0
            });
        }
        
        // Draw chart
        const barWidth = canvas.width / 7;
        const maxHeight = canvas.height - 40;
        
        ctx.fillStyle = '#FF6B35';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        last7Days.forEach((day, index) => {
            const x = index * barWidth;
            const height = day.completed * maxHeight;
            
            // Draw bar
            ctx.fillRect(x + 5, canvas.height - height - 20, barWidth - 10, height);
            
            // Draw label
            ctx.fillStyle = '#666';
            ctx.fillText(day.date, x + barWidth / 2, canvas.height - 5);
            ctx.fillStyle = '#FF6B35';
        });
    }
    
    checkDailyReset() {
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('lastRoutineDate');
        
        if (lastDate !== today) {
            // Reset daily routine state
            this.routineState = {
                countdown: false,
                bedMaking: false,
                highFive: false,
                hydration: false,
                lightExposure: false,
                movement: false
            };
            
            this.waterIntake = 0;
            this.selectedMood = null;
            this.selectedMovement = null;
            this.startTime = null;
            
            // Load today's priorities if they exist
            this.loadTodaysPriorities();
            
            // Clear timers
            Object.values(this.timers).forEach(timer => clearInterval(timer));
            this.timers = {};
            
            // Reset UI
            this.resetUI();
            
            // Check streak continuation
            if (lastDate) {
                const lastCompletionDate = new Date(this.streakData.lastCompletionDate);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastCompletionDate.toDateString() !== yesterday.toDateString()) {
                    // Streak broken
                    this.streakData.currentStreak = 0;
                }
            }
            
            localStorage.setItem('lastRoutineDate', today);
            this.updateDisplay();
        }
    }
    
    resetUI() {
        // Reset all buttons and indicators
        document.querySelectorAll('.status-indicator').forEach(indicator => {
            indicator.classList.remove('completed');
        });
        
        document.querySelectorAll('.routine-card').forEach(card => {
            card.classList.remove('completed');
        });
        
        // Reset buttons
        const buttons = [
            { id: 'startCountdown', text: 'Start 5-4-3-2-1 Counter' },
            { id: 'bedMadeBtn', text: '✅ Bed Made' },
            { id: 'highFiveBtn', text: 'Give Yourself a High-Five! 🙌' },
            { id: 'completeMovement', text: 'Complete Movement & Mindfulness' }
        ];
        
        buttons.forEach(btn => {
            const element = document.getElementById(btn.id);
            if (element) {
                element.textContent = btn.text;
                element.disabled = false;
                element.style.background = '';
            }
        });
        
        // Reset displays
        const countdownDisplay = document.getElementById('countdownDisplay');
        if (countdownDisplay) {
            countdownDisplay.textContent = '5';
            countdownDisplay.style.color = '';
            countdownDisplay.classList.remove('pulsing');
        }
        
        const waterAmount = document.getElementById('waterAmount');
        if (waterAmount) waterAmount.textContent = '0oz';
        
        const lightTimerDisplay = document.getElementById('lightTimerDisplay');
        if (lightTimerDisplay) lightTimerDisplay.textContent = '00:00';
        
        const timeToAction = document.getElementById('timeToAction');
        if (timeToAction) timeToAction.style.display = 'none';
        
        const caffeineTimer = document.getElementById('caffeineTimer');
        if (caffeineTimer) caffeineTimer.style.display = 'none';
        
        // Clear form inputs
        const gratitudeInput = document.getElementById('gratitudeInput');
        if (gratitudeInput) gratitudeInput.value = '';
        
        const intentionInput = document.getElementById('intentionInput');
        if (intentionInput) intentionInput.value = '';
        
        // Clear selections
        document.querySelectorAll('.mood-btn, .option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        this.updateRoutineProgress();
    }
    
    updateDisplay() {
        const currentStreak = document.getElementById('currentStreak');
        if (currentStreak) currentStreak.textContent = this.streakData.currentStreak;
        
        const bedStreak = document.getElementById('bedStreak');
        if (bedStreak) bedStreak.textContent = this.streakData.bedMakingStreak;
        
        if (this.userSettings.wakeTime) {
            const wakeTime = document.getElementById('wakeTime');
            if (wakeTime) {
                wakeTime.value = this.userSettings.wakeTime;
                this.calculateBedtime();
            }
        }
        
        if (this.userSettings.name) {
            const userName = document.getElementById('userName');
            if (userName) userName.value = this.userSettings.name;
        }
        
        if (this.userSettings.location) {
            const location = document.getElementById('location');
            if (location) location.value = this.userSettings.location;
        }
    }
    
    triggerHapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Morning Routine Tracker', {
                body: message,
                icon: 'icons/icon-192x192.png'
            });
        }
    }
    
    updateSetting(key, value) {
        this.userSettings[key] = value;
        this.saveUserSettings();
        
        if (key === 'location') {
            this.loadWeatherData();
        }
    }
    
    exportData() {
        const data = {
            streakData: this.streakData,
            analyticsData: this.analyticsData,
            userSettings: this.userSettings,
            priorities: this.priorities,
            priorityAnalytics: this.priorityAnalytics,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `morning-routine-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.clear();
            location.reload();
        }
    }
    
    // Data persistence methods
    saveProgress() {
        localStorage.setItem('routineState', JSON.stringify(this.routineState));
        localStorage.setItem('streakData', JSON.stringify(this.streakData));
        localStorage.setItem('analyticsData', JSON.stringify(this.analyticsData));
        localStorage.setItem('waterIntake', this.waterIntake.toString());
        localStorage.setItem('selectedMood', this.selectedMood);
        localStorage.setItem('selectedMovement', this.selectedMovement);
        if (this.startTime) {
            localStorage.setItem('startTime', this.startTime.toISOString());
        }
    }
    
    saveUserSettings() {
        localStorage.setItem('userSettings', JSON.stringify(this.userSettings));
    }
    
    savePriorityData() {
        localStorage.setItem('priorities', JSON.stringify(this.priorities));
        localStorage.setItem('priorityAnalytics', JSON.stringify(this.priorityAnalytics));
    }
    
    loadStreakData() {
        const saved = localStorage.getItem('streakData');
        return saved ? JSON.parse(saved) : {
            currentStreak: 0,
            longestStreak: 0,
            bedMakingStreak: 0,
            lastCompletionDate: null
        };
    }
    
    loadAnalyticsData() {
        const saved = localStorage.getItem('analyticsData');
        return saved ? JSON.parse(saved) : {
            completions: [],
            moods: [],
            journalEntries: []
        };
    }
    
    loadUserSettings() {
        const saved = localStorage.getItem('userSettings');
        return saved ? JSON.parse(saved) : {
            name: '',
            location: '',
            wakeTime: '06:00',
            notifications: {
                morning: true,
                evening: true,
                streaks: true
            }
        };
    }
    
    loadPriorities() {
        const saved = localStorage.getItem('priorities');
        return saved ? JSON.parse(saved) : {};
    }
    
    loadPriorityAnalytics() {
        const saved = localStorage.getItem('priorityAnalytics');
        return saved ? JSON.parse(saved) : {
            totalPriorities: 0,
            completedPriorities: [],
            planningDays: [],
            perfectDays: [],
            patterns: []
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.morningRoutineApp = new MorningRoutineApp();
});

// Add dynamic styles for mobile animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideOutUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
    
    /* Enhanced mobile touch feedback */
    .nav-tab {
        transition: all 0.2s ease-out;
        -webkit-tap-highlight-color: rgba(255, 107, 53, 0.2);
    }
    
    .nav-tab:active {
        transform: scale(0.95);
        background: rgba(255, 107, 53, 0.1);
    }
    
    .action-btn, .mood-btn, .option-btn, .water-btn {
        -webkit-tap-highlight-color: rgba(255, 107, 53, 0.2);
        transition: all 0.2s ease-out;
    }
    
    .action-btn:active, .mood-btn:active, .option-btn:active, .water-btn:active {
        transform: scale(0.95);
    }
    
    /* Disable text selection for better mobile UX */
    .nav-tab, .action-btn, .mood-btn, .option-btn, .water-btn {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
`;
document.head.appendChild(style);
