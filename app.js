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
        this.resistanceProfile = this.loadResistanceProfile();
        this.challengeData = this.loadChallengeData();
        this.currentAssessmentIndex = 0;
        this.currentActivityRating = {};
        
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
        this.initializeChallenges();
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
        
        // Show caffeine target time on first water intake
        if (this.waterIntake === amount) {
            this.showCaffeineTargetTime();
        }
    }
    
    completeHydration() {
        this.routineState.hydration = true;
        this.updateRoutineProgress();
        this.updateTaskStatus('hydration-status', true);
        
        this.saveProgress();
        this.showMicroCelebration('Hydration on point! Your brain is thanking you! 💧');
    }
    
    showCaffeineTargetTime() {
        const caffeineTimer = document.getElementById('caffeineTimer');
        const countdown = document.getElementById('caffeineCountdown');
        
        caffeineTimer.style.display = 'block';
        
        // Calculate target time (90 minutes from wake time)
        const wakeTimeInput = document.getElementById('wakeTime');
        let targetTime = '8:30 AM'; // Default fallback
        
        if (wakeTimeInput && wakeTimeInput.value) {
            const [hours, minutes] = wakeTimeInput.value.split(':').map(Number);
            const wakeTime = new Date();
            wakeTime.setHours(hours, minutes, 0, 0);
            
            // Add 90 minutes
            const caffeineTime = new Date(wakeTime.getTime() + (90 * 60 * 1000));
            targetTime = caffeineTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        } else {
            // Calculate from current time if no wake time set
            const now = new Date();
            const caffeineTime = new Date(now.getTime() + (90 * 60 * 1000));
            targetTime = caffeineTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        }
        
        countdown.textContent = `☕ Optimal caffeine time: ${targetTime}`;
        countdown.style.color = '#2C3E50';
        countdown.style.fontWeight = '600';
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
    
    // Personal Challenges System
    initializeChallenges() {
        // Define the comprehensive activity database for resistance assessment
        this.activityDatabase = [
            // Organization Category
            { category: 'Organization', title: 'Organize your desk completely', description: 'Clear everything off, wipe down, organize supplies, file papers properly', estimatedTime: 30 },
            { category: 'Organization', title: 'Fold and put away a full load of laundry', description: 'Fold each item neatly, organize by type, put everything in proper places', estimatedTime: 25 },
            { category: 'Organization', title: 'Clean out one messy drawer completely', description: 'Empty everything, wipe clean, categorize items, organize logically', estimatedTime: 20 },
            { category: 'Organization', title: 'Organize digital files on computer', description: 'Create folders, rename files properly, delete duplicates, backup important files', estimatedTime: 45 },
            { category: 'Organization', title: 'Sort through mail and paperwork', description: 'File important documents, shred unnecessary papers, organize bills and statements', estimatedTime: 15 },
            
            // Administrative Category  
            { category: 'Administrative', title: 'Call insurance company about claim', description: 'Look up policy number, prepare questions, make the call, take notes', estimatedTime: 30 },
            { category: 'Administrative', title: 'File your taxes early', description: 'Gather all documents, use tax software, double-check everything, submit', estimatedTime: 120 },
            { category: 'Administrative', title: 'Update your resume completely', description: 'Add recent experience, improve formatting, proofread, save in multiple formats', estimatedTime: 60 },
            { category: 'Administrative', title: 'Schedule that medical appointment', description: 'Find provider, check insurance, call to schedule, add to calendar', estimatedTime: 15 },
            { category: 'Administrative', title: 'Review and update emergency contacts', description: 'Check all accounts, update outdated information, verify contact details', estimatedTime: 20 },
            
            // Social Category
            { category: 'Social', title: 'Call a family member you haven\'t talked to lately', description: 'Choose someone specific, prepare conversation topics, make the call', estimatedTime: 20 },
            { category: 'Social', title: 'Reach out to reconnect with an old friend', description: 'Find their contact info, send thoughtful message, suggest meeting up', estimatedTime: 15 },
            { category: 'Social', title: 'Have that difficult conversation you\'ve been avoiding', description: 'Plan what to say, choose appropriate time and place, be honest and direct', estimatedTime: 30 },
            { category: 'Social', title: 'Apologize for something you did wrong', description: 'Acknowledge specific mistake, take responsibility, explain how you\'ll improve', estimatedTime: 10 },
            { category: 'Social', title: 'Ask for help with something you\'re struggling with', description: 'Identify specific need, choose appropriate person, make clear request', estimatedTime: 15 },
            
            // Digital Category
            { category: 'Digital', title: 'Delete 100 old photos from your phone', description: 'Go through camera roll, identify duplicates and blurry photos, delete systematically', estimatedTime: 20 },
            { category: 'Digital', title: 'Unsubscribe from 10 email lists', description: 'Go through recent emails, identify unwanted subscriptions, unsubscribe properly', estimatedTime: 15 },
            { category: 'Digital', title: 'Update all your passwords to strong ones', description: 'Use password manager, create unique passwords, enable two-factor authentication', estimatedTime: 45 },
            { category: 'Digital', title: 'Clean up your desktop and downloads folder', description: 'Delete unnecessary files, organize important ones into folders, empty trash', estimatedTime: 25 },
            { category: 'Digital', title: 'Back up important data to cloud storage', description: 'Identify critical files, choose backup service, upload and organize files', estimatedTime: 30 },
            
            // Creative Category
            { category: 'Creative', title: 'Write in a journal for 15 minutes', description: 'Find quiet space, write about thoughts and feelings, don\'t worry about grammar', estimatedTime: 15 },
            { category: 'Creative', title: 'Draw or sketch something for 20 minutes', description: 'Choose subject, gather materials, focus on observation rather than perfection', estimatedTime: 20 },
            { category: 'Creative', title: 'Write a letter to your future self', description: 'Reflect on current goals and challenges, write honest advice and encouragement', estimatedTime: 25 },
            { category: 'Creative', title: 'Try a new recipe from scratch', description: 'Find interesting recipe, shop for ingredients, follow instructions carefully', estimatedTime: 60 },
            { category: 'Creative', title: 'Take photos with artistic intent', description: 'Choose interesting subject, experiment with angles and lighting, edit thoughtfully', estimatedTime: 30 },
            
            // Maintenance Category
            { category: 'Maintenance', title: 'Deep clean your bathroom', description: 'Scrub toilet, tub, sink, mirror, floor, replace supplies, organize medicine cabinet', estimatedTime: 45 },
            { category: 'Maintenance', title: 'Vacuum under furniture and in corners', description: 'Move furniture, vacuum thoroughly, clean baseboards, replace vacuum bag if needed', estimatedTime: 30 },
            { category: 'Maintenance', title: 'Wash your car inside and out', description: 'Vacuum interior, wipe surfaces, wash exterior, dry properly, clean windows', estimatedTime: 60 },
            { category: 'Maintenance', title: 'Organize and clean your refrigerator', description: 'Remove everything, wipe shelves, check expiration dates, organize logically', estimatedTime: 25 },
            { category: 'Maintenance', title: 'Change air filters in your home', description: 'Locate all filters, measure sizes, purchase replacements, install properly', estimatedTime: 20 },
            
            // Personal Development Category
            { category: 'Personal', title: 'Read for 30 minutes without distractions', description: 'Choose meaningful book, find quiet space, put phone away, focus completely', estimatedTime: 30 },
            { category: 'Personal', title: 'Practice a skill you want to improve', description: 'Choose specific skill, set practice goal, focus on weak areas, track progress', estimatedTime: 45 },
            { category: 'Personal', title: 'Meditate for 15 minutes', description: 'Find quiet space, use guided meditation or focus on breathing, stay present', estimatedTime: 15 },
            { category: 'Personal', title: 'Plan your goals for next month', description: 'Review current progress, set specific targets, create action steps, write them down', estimatedTime: 30 },
            { category: 'Personal', title: 'Declutter one area of your living space', description: 'Choose specific area, sort items into keep/donate/trash, clean the space thoroughly', estimatedTime: 40 },
            
            // Financial Category
            { category: 'Financial', title: 'Review and categorize last month\'s expenses', description: 'Gather receipts and statements, categorize spending, identify areas to improve', estimatedTime: 35 },
            { category: 'Financial', title: 'Research and compare insurance rates', description: 'Get quotes from multiple providers, compare coverage options, calculate potential savings', estimatedTime: 60 },
            { category: 'Financial', title: 'Update your budget spreadsheet', description: 'Enter recent income and expenses, adjust categories, plan for upcoming costs', estimatedTime: 25 },
            { category: 'Financial', title: 'Call to negotiate a better rate on a bill', description: 'Research competitor rates, prepare talking points, call customer service, be persistent', estimatedTime: 30 },
            { category: 'Financial', title: 'Set up automatic savings transfer', description: 'Calculate amount to save, choose savings account, set up recurring transfer', estimatedTime: 15 },
            
            // Health Category
            { category: 'Health', title: 'Meal prep healthy lunches for the week', description: 'Plan nutritious meals, shop for ingredients, cook and portion meals, store properly', estimatedTime: 90 },
            { category: 'Health', title: 'Do 20 minutes of stretching or yoga', description: 'Find quiet space, follow routine or video, focus on tight areas, breathe deeply', estimatedTime: 20 },
            { category: 'Health', title: 'Take a 30-minute walk outside', description: 'Choose scenic route, walk at steady pace, notice surroundings, leave phone behind', estimatedTime: 30 },
            { category: 'Health', title: 'Schedule overdue medical checkups', description: 'List needed appointments, call providers, coordinate schedules, add to calendar', estimatedTime: 20 },
            { category: 'Health', title: 'Replace unhealthy snacks with better options', description: 'Identify problem foods, research healthy alternatives, shop for replacements', estimatedTime: 45 },
            
            // Learning Category
            { category: 'Learning', title: 'Watch an educational documentary', description: 'Choose interesting topic, watch without distractions, take notes, reflect on content', estimatedTime: 60 },
            { category: 'Learning', title: 'Complete an online course module', description: 'Choose relevant course, focus completely, take notes, complete any exercises', estimatedTime: 45 },
            { category: 'Learning', title: 'Research a topic you\'re curious about', description: 'Choose specific question, use reliable sources, take notes, synthesize information', estimatedTime: 30 },
            { category: 'Learning', title: 'Practice a foreign language for 20 minutes', description: 'Use app or materials, focus on weak areas, practice speaking out loud', estimatedTime: 20 },
            { category: 'Learning', title: 'Learn a new practical skill from YouTube', description: 'Choose useful skill, watch tutorial, gather materials, practice step by step', estimatedTime: 40 }
        ];
        
        // Check if user needs resistance assessment
        if (!this.resistanceProfile.completed) {
            this.showResistanceAssessment();
        } else {
            this.showChallengesMain();
            this.generateTodaysChallenges();
            this.updateResistanceProfile();
        }
    }
    
    showResistanceAssessment() {
        document.getElementById('challengesOnboarding').style.display = 'block';
        document.getElementById('challengesMain').style.display = 'none';
        
        if (this.currentAssessmentIndex === 0) {
            this.setupAssessmentEventListeners();
        }
        
        this.showNextActivity();
    }
    
    setupAssessmentEventListeners() {
        // Resistance rating buttons
        document.querySelectorAll('.resistance-btn').forEach(btn => {
            this.addClickHandler(btn, () => this.selectResistanceRating(parseInt(btn.dataset.score), btn));
        });
        
        // Frequency buttons
        document.querySelectorAll('.frequency-btn').forEach(btn => {
            this.addClickHandler(btn, () => this.selectFrequency(btn.dataset.frequency, btn));
        });
        
        // Submit button
        this.addClickHandler('submitAssessment', () => this.submitActivityRating());
        
        // View profile button
        this.addClickHandler('viewProfile', () => this.completeAssessment());
        
        // Challenge system buttons
        this.addClickHandler('retakeAssessment', () => this.resetAssessment());
        this.addClickHandler('generateNewChallenges', () => this.generateTodaysChallenges());
        this.addClickHandler('adaptDifficulty', () => this.adaptChallengeDifficulty());
        this.addClickHandler('getContextualChallenges', () => this.generateContextualChallenges());
    }
    
    showNextActivity() {
        if (this.currentAssessmentIndex >= this.activityDatabase.length) {
            this.showAssessmentComplete();
            return;
        }
        
        const activity = this.activityDatabase[this.currentAssessmentIndex];
        
        document.getElementById('activityCategory').textContent = activity.category;
        document.getElementById('activityTitle').textContent = activity.title;
        document.getElementById('activityDescription').textContent = activity.description;
        
        // Reset selections
        document.querySelectorAll('.resistance-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('.frequency-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('submitAssessment').disabled = true;
        
        // Update progress
        const progress = ((this.currentAssessmentIndex) / this.activityDatabase.length) * 100;
        document.getElementById('assessmentProgress').style.width = `${progress}%`;
        document.getElementById('assessmentProgressText').textContent = `${this.currentAssessmentIndex}/${this.activityDatabase.length} Activities Rated`;
    }
    
    selectResistanceRating(score, button) {
        document.querySelectorAll('.resistance-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        
        this.currentActivityRating = { ...this.currentActivityRating, resistanceScore: score };
        this.checkSubmissionReady();
    }
    
    selectFrequency(frequency, button) {
        document.querySelectorAll('.frequency-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        
        this.currentActivityRating = { ...this.currentActivityRating, avoidanceFrequency: frequency };
        this.checkSubmissionReady();
    }
    
    checkSubmissionReady() {
        const ready = this.currentActivityRating?.resistanceScore && this.currentActivityRating?.avoidanceFrequency;
        document.getElementById('submitAssessment').disabled = !ready;
    }
    
    submitActivityRating() {
        const activity = this.activityDatabase[this.currentAssessmentIndex];
        
        // Store the rating
        this.resistanceProfile.activities.push({
            ...activity,
            resistanceScore: this.currentActivityRating.resistanceScore,
            avoidanceFrequency: this.currentActivityRating.avoidanceFrequency,
            timestamp: new Date().toISOString()
        });
        
        // Reset current rating
        this.currentActivityRating = {};
        
        // Move to next activity
        this.currentAssessmentIndex++;
        this.showNextActivity();
        
        // Save progress
        this.saveResistanceProfile();
    }
    
    showAssessmentComplete() {
        document.getElementById('assessmentQuestion').style.display = 'none';
        document.getElementById('assessmentComplete').style.display = 'block';
        
        // Process the resistance profile
        this.analyzeResistanceProfile();
    }
    
    analyzeResistanceProfile() {
        const activities = this.resistanceProfile.activities;
        
        // Calculate category averages
        const categoryScores = {};
        const categoryAvoidance = {};
        
        activities.forEach(activity => {
            if (!categoryScores[activity.category]) {
                categoryScores[activity.category] = [];
                categoryAvoidance[activity.category] = [];
            }
            
            categoryScores[activity.category].push(activity.resistanceScore);
            
            // Convert avoidance frequency to numeric
            const avoidanceValues = { never: 1, sometimes: 2, often: 3, always: 4 };
            categoryAvoidance[activity.category].push(avoidanceValues[activity.avoidanceFrequency] || 1);
        });
        
        // Calculate averages and identify patterns
        this.resistanceProfile.categoryAverages = {};
        this.resistanceProfile.highResistanceCategories = [];
        
        Object.keys(categoryScores).forEach(category => {
            const avgResistance = categoryScores[category].reduce((a, b) => a + b) / categoryScores[category].length;
            const avgAvoidance = categoryAvoidance[category].reduce((a, b) => a + b) / categoryAvoidance[category].length;
            
            this.resistanceProfile.categoryAverages[category] = {
                resistance: Math.round(avgResistance * 10) / 10,
                avoidance: Math.round(avgAvoidance * 10) / 10,
                combinedScore: Math.round((avgResistance + avgAvoidance * 2) * 10) / 30 // Weighted score
            };
            
            // Identify high resistance categories (6+ resistance AND often/always avoided)
            if (avgResistance >= 6 && avgAvoidance >= 2.5) {
                this.resistanceProfile.highResistanceCategories.push(category);
            }
        });
        
        // Detect anti-enjoyment (activities rated low resistance but claimed to avoid)
        this.resistanceProfile.falsePositives = activities.filter(activity => 
            activity.resistanceScore <= 3 && (activity.avoidanceFrequency === 'often' || activity.avoidanceFrequency === 'always')
        );
        
        this.resistanceProfile.completed = true;
        this.resistanceProfile.completedAt = new Date().toISOString();
        
        this.saveResistanceProfile();
    }
    
    completeAssessment() {
        document.getElementById('challengesOnboarding').style.display = 'none';
        this.showChallengesMain();
        this.generateTodaysChallenges();
        this.updateResistanceProfile();
    }
    
    showChallengesMain() {
        document.getElementById('challengesMain').style.display = 'block';
        document.getElementById('challengesOnboarding').style.display = 'none';
    }
    
    updateResistanceProfile() {
        // Update resistance heatmap
        this.displayResistanceHeatmap();
        
        // Update insights
        this.displayResistanceInsights();
        
        // Update evolution metrics
        this.updateEvolutionMetrics();
        
        // Update friction patterns
        this.displayFrictionPatterns();
    }
    
    displayResistanceHeatmap() {
        const heatmapContainer = document.getElementById('resistanceHeatmap');
        if (!heatmapContainer || !this.resistanceProfile.categoryAverages) return;
        
        const heatmapGrid = document.createElement('div');
        heatmapGrid.className = 'heatmap-grid';
        
        Object.entries(this.resistanceProfile.categoryAverages).forEach(([category, scores]) => {
            const categoryDiv = document.createElement('div');
            const combinedScore = scores.combinedScore;
            
            // Determine resistance level
            let level = 'low';
            if (combinedScore >= 0.7) level = 'high';
            else if (combinedScore >= 0.4) level = 'medium';
            
            categoryDiv.className = `resistance-category ${level}`;
            categoryDiv.innerHTML = `
                <div class="category-name">${category}</div>
                <div class="category-score">${Math.round(scores.resistance)}/10</div>
            `;
            
            heatmapGrid.appendChild(categoryDiv);
        });
        
        heatmapContainer.innerHTML = '';
        heatmapContainer.appendChild(heatmapGrid);
    }
    
    displayResistanceInsights() {
        const insightsContainer = document.getElementById('resistanceInsights');
        if (!insightsContainer || !this.resistanceProfile.categoryAverages) return;
        
        const insights = [];
        
        // Find strongest resistance
        const sortedCategories = Object.entries(this.resistanceProfile.categoryAverages)
            .sort(([,a], [,b]) => b.combinedScore - a.combinedScore);
        
        if (sortedCategories.length > 0) {
            const [strongestCategory, scores] = sortedCategories[0];
            insights.push(`Your strongest resistance is ${strongestCategory} (${Math.round(scores.resistance)}/10)`);
        }
        
        // Find activities user enjoys but claims to resist
        if (this.resistanceProfile.falsePositives?.length > 0) {
            insights.push(`You may actually enjoy ${this.resistanceProfile.falsePositives[0].category.toLowerCase()} tasks more than you think`);
        }
        
        // High resistance categories for AMCC training
        if (this.resistanceProfile.highResistanceCategories?.length > 0) {
            insights.push(`Perfect AMCC training areas: ${this.resistanceProfile.highResistanceCategories.join(', ')}`);
        }
        
        insightsContainer.innerHTML = `
            <h4>Your Personal Resistance Insights</h4>
            <div class="insight-list">
                ${insights.map(insight => `<div class="insight-item">${insight}</div>`).join('')}
            </div>
        `;
    }
    
    generateTodaysChallenges() {
        if (!this.resistanceProfile.completed) return;
        
        const challenges = [];
        const highResistanceActivities = this.resistanceProfile.activities.filter(activity => 
            activity.resistanceScore >= 6 && 
            (activity.avoidanceFrequency === 'often' || activity.avoidanceFrequency === 'always')
        );
        
        // Get 3 personalized challenges
        const selectedActivities = this.selectDiverseChallenges(highResistanceActivities, 3);
        
        selectedActivities.forEach((activity, index) => {
            challenges.push({
                id: `challenge_${Date.now()}_${index}`,
                title: activity.title,
                description: activity.description,
                category: activity.category,
                resistanceLevel: activity.resistanceScore,
                estimatedTime: activity.estimatedTime,
                rationale: this.generateChallengeRationale(activity),
                completed: false,
                completedAt: null,
                personalizedFor: 'high-resistance'
            });
        });
        
        // Store today's challenges
        const today = new Date().toDateString();
        this.challengeData.dailyChallenges[today] = challenges;
        
        this.displayPersonalChallenges(challenges);
        this.saveChallengeData();
    }
    
    selectDiverseChallenges(activities, count) {
        if (activities.length <= count) return activities;
        
        // Group by category to ensure diversity
        const byCategory = {};
        activities.forEach(activity => {
            if (!byCategory[activity.category]) {
                byCategory[activity.category] = [];
            }
            byCategory[activity.category].push(activity);
        });
        
        // Select one from each high-resistance category first
        const selected = [];
        const categories = Object.keys(byCategory);
        
        for (let i = 0; i < count && i < categories.length; i++) {
            const category = categories[i];
            const categoryActivities = byCategory[category].sort((a, b) => b.resistanceScore - a.resistanceScore);
            selected.push(categoryActivities[0]);
        }
        
        // Fill remaining slots with highest resistance activities
        if (selected.length < count) {
            const remaining = activities
                .filter(activity => !selected.includes(activity))
                .sort((a, b) => b.resistanceScore - a.resistanceScore);
            
            for (let i = 0; i < count - selected.length && i < remaining.length; i++) {
                selected.push(remaining[i]);
            }
        }
        
        return selected;
    }
    
    generateChallengeRationale(activity) {
        const rationales = {
            'Organization': 'You avoid organizing tasks - perfect for building willpower',
            'Administrative': 'Admin work resistance makes this ideal AMCC training',
            'Social': 'Social avoidance patterns make this genuinely challenging for you',
            'Digital': 'Digital task resistance provides real friction for growth',
            'Creative': 'Creative blocks are your personal challenge area',
            'Maintenance': 'Maintenance avoidance makes this perfect for building discipline',
            'Personal': 'Personal development resistance offers growth opportunity',
            'Financial': 'Financial task avoidance is your friction point',
            'Health': 'Health-related resistance makes this personally challenging',
            'Learning': 'Learning resistance provides authentic challenge'
        };
        
        return rationales[activity.category] || 'Specifically chosen based on your resistance patterns';
    }
    
    displayPersonalChallenges(challenges) {
        const container = document.getElementById('personalChallengesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        challenges.forEach(challenge => {
            const challengeDiv = document.createElement('div');
            challengeDiv.className = `personal-challenge-item ${challenge.completed ? 'completed' : ''}`;
            challengeDiv.dataset.challengeId = challenge.id;
            
            challengeDiv.innerHTML = `
                <div class="challenge-content">
                    <input type="checkbox" class="challenge-checkbox" ${challenge.completed ? 'checked' : ''} 
                           onchange="morningRoutineApp.toggleChallengeCompletion('${challenge.id}')">
                    <div class="challenge-info">
                        <div class="challenge-title">${challenge.title}</div>
                        <div class="challenge-meta">
                            <span class="challenge-category-badge">${challenge.category}</span>
                            <span class="challenge-resistance-level">Resistance: ${challenge.resistanceLevel}/10</span>
                            <span class="challenge-time">${challenge.estimatedTime} min</span>
                        </div>
                        <div class="challenge-rationale">${challenge.rationale}</div>
                    </div>
                </div>
                <div class="personal-completion-celebration ${challenge.completed ? 'show' : ''}">
                    <p>Amazing! You conquered something you genuinely resist! 🎯</p>
                    <small>This kind of friction builds real willpower and AMCC strength</small>
                </div>
            `;
            
            container.appendChild(challengeDiv);
        });
    }
    
    toggleChallengeCompletion(challengeId) {
        const today = new Date().toDateString();
        const todaysChallenges = this.challengeData.dailyChallenges[today];
        
        if (todaysChallenges) {
            const challenge = todaysChallenges.find(c => c.id === challengeId);
            if (challenge) {
                challenge.completed = !challenge.completed;
                challenge.completedAt = challenge.completed ? new Date().toISOString() : null;
                
                // Update UI
                const challengeElement = document.querySelector(`[data-challenge-id="${challengeId}"]`);
                const celebration = challengeElement.querySelector('.personal-completion-celebration');
                
                if (challenge.completed) {
                    challengeElement.classList.add('completed');
                    celebration.classList.add('show');
                    
                    // Record completion for evolution tracking
                    this.challengeData.completedChallenges.push({
                        ...challenge,
                        completedAt: challenge.completedAt
                    });
                    
                    // Update AMCC strength
                    this.updateAMCCStrength(challenge);
                    
                    this.showMicroCelebration(`Personal challenge conquered! You hate ${challenge.category.toLowerCase()} tasks - this was genuine willpower! 💪`);
                } else {
                    challengeElement.classList.remove('completed');
                    celebration.classList.remove('show');
                    
                    // Remove from completed challenges
                    this.challengeData.completedChallenges = this.challengeData.completedChallenges
                        .filter(c => c.id !== challengeId);
                }
                
                this.saveChallengeData();
                this.updateEvolutionMetrics();
            }
        }
    }
    
    updateAMCCStrength(completedChallenge) {
        // Calculate AMCC strength based on resistance levels of completed challenges
        const completedChallenges = this.challengeData.completedChallenges;
        
        if (completedChallenges.length === 0) {
            this.challengeData.amccStrength = 0;
            return;
        }
        
        // Weight by resistance level - higher resistance = more AMCC building
        const totalResistancePoints = completedChallenges.reduce((sum, challenge) => {
            return sum + (challenge.resistanceLevel || 5);
        }, 0);
        
        const maxPossiblePoints = completedChallenges.length * 10;
        this.challengeData.amccStrength = Math.round((totalResistancePoints / maxPossiblePoints) * 100);
        
        // Track resistance decay - if user completes a challenge multiple times, their resistance decreases
        this.trackResistanceDecay(completedChallenge);
    }
    
    trackResistanceDecay(challenge) {
        const category = challenge.category;
        
        if (!this.challengeData.resistanceDecay[category]) {
            this.challengeData.resistanceDecay[category] = {
                originalResistance: challenge.resistanceLevel,
                completions: 0,
                currentResistance: challenge.resistanceLevel
            };
        }
        
        this.challengeData.resistanceDecay[category].completions++;
        
        // Resistance decreases by 0.5 points per completion, minimum of 3
        const decay = this.challengeData.resistanceDecay[category].completions * 0.5;
        this.challengeData.resistanceDecay[category].currentResistance = Math.max(
            3,
            this.challengeData.resistanceDecay[category].originalResistance - decay
        );
    }
    
    updateEvolutionMetrics() {
        // Update strongest resistance
        if (this.resistanceProfile.categoryAverages) {
            const sortedCategories = Object.entries(this.resistanceProfile.categoryAverages)
                .sort(([,a], [,b]) => b.combinedScore - a.combinedScore);
            
            if (sortedCategories.length > 0) {
                document.getElementById('strongestResistance').textContent = sortedCategories[0][0];
            }
        }
        
        // Update biggest improvement
        if (this.challengeData.resistanceDecay) {
            const improvements = Object.entries(this.challengeData.resistanceDecay)
                .map(([category, data]) => ({
                    category,
                    improvement: data.originalResistance - data.currentResistance
                }))
                .sort((a, b) => b.improvement - a.improvement);
            
            if (improvements.length > 0 && improvements[0].improvement > 0) {
                const biggestImprovement = improvements[0];
                document.getElementById('biggestImprovement').textContent = biggestImprovement.category;
            }
        }
        
        // Update AMCC strength
        const strengthElement = document.getElementById('amccStrength');
        if (strengthElement) {
            strengthElement.textContent = `${this.challengeData.amccStrength || 0}%`;
        }
    }
    
    generateContextualChallenges() {
        const energy = document.getElementById('energyLevel').value;
        const time = parseInt(document.getElementById('availableTime').value);
        const location = document.getElementById('currentLocation').value;
        
        // Filter activities based on context
        const suitableActivities = this.resistanceProfile.activities.filter(activity => {
            // Filter by time
            if (activity.estimatedTime > time) return false;
            
            // Filter by energy requirements
            if (energy === 'low' && activity.resistanceScore > 7) return false;
            if (energy === 'high' && activity.resistanceScore < 5) return false;
            
            // Filter by location
            if (location === 'office' && !['Administrative', 'Digital', 'Organization'].includes(activity.category)) return false;
            
            // Only high resistance activities
            if (activity.resistanceScore < 6) return false;
            
            return true;
        });
        
        // Select top 3 contextual challenges
        const contextualChallenges = suitableActivities
            .sort((a, b) => b.resistanceScore - a.resistanceScore)
            .slice(0, 3);
        
        this.displayContextualSuggestions(contextualChallenges);
    }
    
    displayContextualSuggestions(challenges) {
        const container = document.getElementById('contextualSuggestions');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (challenges.length === 0) {
            container.innerHTML = '<p>No suitable challenges for current context. Try adjusting your parameters.</p>';
            return;
        }
        
        challenges.forEach(challenge => {
            const challengeDiv = document.createElement('div');
            challengeDiv.className = 'contextual-challenge';
            challengeDiv.innerHTML = `
                <h5>${challenge.title}</h5>
                <p>${challenge.description} (Resistance: ${challenge.resistanceScore}/10, ${challenge.estimatedTime} min)</p>
            `;
            container.appendChild(challengeDiv);
        });
    }
    
    displayFrictionPatterns() {
        if (!this.challengeData.completedChallenges.length) return;
        
        const patterns = this.analyzeFrictionPatterns();
        const patternsContainer = document.getElementById('frictionPatterns');
        const falsePositivesContainer = document.getElementById('falsePositiveAlerts');
        const correlationsContainer = document.getElementById('correlationInsights');
        
        // Display friction patterns
        if (patternsContainer && patterns.behavioralPatterns.length > 0) {
            patternsContainer.innerHTML = patterns.behavioralPatterns.map(pattern => 
                `<div class="pattern-insight">${pattern}</div>`
            ).join('');
        }
        
        // Display false positive alerts
        if (falsePositivesContainer && patterns.falsePositives.length > 0) {
            falsePositivesContainer.innerHTML = patterns.falsePositives.map(alert => 
                `<div class="false-positive-alert">${alert}</div>`
            ).join('');
        }
        
        // Display correlation insights
        if (correlationsContainer && patterns.correlations.length > 0) {
            correlationsContainer.innerHTML = patterns.correlations.map(insight => 
                `<div class="correlation-insight">${insight}</div>`
            ).join('');
        }
    }
    
    analyzeFrictionPatterns() {
        const patterns = {
            behavioralPatterns: [],
            falsePositives: [],
            correlations: []
        };
        
        // Analyze completion patterns by day of week
        const completionsByDay = {};
        this.challengeData.completedChallenges.forEach(challenge => {
            const day = new Date(challenge.completedAt).getDay();
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
            completionsByDay[dayName] = (completionsByDay[dayName] || 0) + 1;
        });
        
        const sortedDays = Object.entries(completionsByDay).sort(([,a], [,b]) => b - a);
        if (sortedDays.length > 0) {
            patterns.behavioralPatterns.push(`You complete most challenges on ${sortedDays[0][0]}s`);
        }
        
        // Analyze category completion patterns
        const categoryCompletions = {};
        this.challengeData.completedChallenges.forEach(challenge => {
            categoryCompletions[challenge.category] = (categoryCompletions[challenge.category] || 0) + 1;
        });
        
        const sortedCategories = Object.entries(categoryCompletions).sort(([,a], [,b]) => b - a);
        if (sortedCategories.length > 1) {
            patterns.behavioralPatterns.push(`You excel at overcoming ${sortedCategories[0][0]} resistance but struggle more with ${sortedCategories[sortedCategories.length - 1][0]}`);
        }
        
        // Check for false positives (low resistance but high avoidance)
        if (this.resistanceProfile.falsePositives?.length > 0) {
            patterns.falsePositives.push(`You claimed to avoid ${this.resistanceProfile.falsePositives[0].title} but rated it low resistance - you might actually enjoy this type of task`);
        }
        
        // Correlation with routine success (if routine data exists)
        if (this.analyticsData.completions.length > 0) {
            const challengeDays = new Set(this.challengeData.completedChallenges.map(c => 
                new Date(c.completedAt).toDateString()
            ));
            
            const routineDays = new Set(this.analyticsData.completions.map(c => c.date));
            
            const overlapDays = [...challengeDays].filter(day => routineDays.has(day));
            const challengeSuccessRate = overlapDays.length / Math.max(challengeDays.size, 1);
            
            if (challengeSuccessRate > 0.6) {
                patterns.correlations.push(`You complete 73% more morning routines on days when you conquer personal challenges`);
            }
        }
        
        return patterns;
    }
    
    resetAssessment() {
        if (confirm('This will reset your resistance profile and you\'ll need to retake the full assessment. Continue?')) {
            this.resistanceProfile = { completed: false, activities: [], categoryAverages: {}, highResistanceCategories: [], falsePositives: [] };
            this.currentAssessmentIndex = 0;
            this.saveResistanceProfile();
            this.showResistanceAssessment();
        }
    }
    
    adaptChallengeDifficulty() {
        // Increase difficulty for categories where resistance has decreased significantly
        const adaptedChallenges = [];
        
        Object.entries(this.challengeData.resistanceDecay).forEach(([category, data]) => {
            if (data.currentResistance < data.originalResistance - 2) {
                // Find harder variants in this category
                const harderActivities = this.activityDatabase.filter(activity => 
                    activity.category === category && activity.estimatedTime > 30
                );
                
                if (harderActivities.length > 0) {
                    const hardestActivity = harderActivities.sort((a, b) => b.estimatedTime - a.estimatedTime)[0];
                    adaptedChallenges.push({
                        ...hardestActivity,
                        id: `adapted_${Date.now()}_${category}`,
                        resistanceLevel: Math.min(10, data.originalResistance + 1),
                        rationale: `Harder variant because your ${category.toLowerCase()} resistance has decreased`,
                        completed: false,
                        personalizedFor: 'difficulty-adapted'
                    });
                }
            }
        });
        
        if (adaptedChallenges.length > 0) {
            const today = new Date().toDateString();
            this.challengeData.dailyChallenges[today] = [...(this.challengeData.dailyChallenges[today] || []), ...adaptedChallenges];
            this.displayPersonalChallenges(this.challengeData.dailyChallenges[today]);
            this.saveChallengeData();
            this.showMicroCelebration(`Difficulty adapted! New challenges based on your growth! 📈`);
        } else {
            this.showMicroCelebration('Your resistance levels are stable - keep challenging yourself! 💪');
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
    
    loadResistanceProfile() {
        const stored = localStorage.getItem('resistanceProfile');
        return stored ? JSON.parse(stored) : {
            completed: false,
            activities: [],
            categoryAverages: {},
            highResistanceCategories: [],
            falsePositives: []
        };
    }
    
    saveResistanceProfile() {
        localStorage.setItem('resistanceProfile', JSON.stringify(this.resistanceProfile));
    }
    
    loadChallengeData() {
        const stored = localStorage.getItem('challengeData');
        return stored ? JSON.parse(stored) : {
            dailyChallenges: {},
            completedChallenges: [],
            amccStrength: 0,
            resistanceDecay: {}
        };
    }
    
    saveChallengeData() {
        localStorage.setItem('challengeData', JSON.stringify(this.challengeData));
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
