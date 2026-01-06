// Milestones and Motivation Rendering

// Main Milestones Logic (Chronological for Accurate Dates)
function renderMilestones(prs) {
    // console.log('DEBUG: renderMilestones entered', prs ? prs.length : 'no data');
    const widgetContainer = document.getElementById('milestones-widget');
    const fullContainer = document.getElementById('milestones-full-grid');
    if (!widgetContainer && !fullContainer) return;

    if (typeof MILESTONE_DEFINITIONS === 'undefined') {
        console.error('MILESTONE_DEFINITIONS not loaded');
        if (widgetContainer) widgetContainer.innerHTML = '<p class="text-red-500">Error: Data missing</p>';
        return;
    }

    try {
        // 1. Sort PRs Chronologically (Oldest First)
        const sortedPRs = [...prs].sort((a, b) => new Date(a.performed_at) - new Date(b.performed_at));

        // 2. Calculate Milestones
        window.globalMilestoneData = calculateMilestoneStats(sortedPRs);

        // 3. Render Widget (Dashboard - Top 6 Priority)
        // Logic: Closest to completion (High Progress Locked) > Recently Unlocked
        if (widgetContainer) {
            const locked = window.globalMilestoneData.filter(m => !m.isUnlocked);
            const unlocked = window.globalMilestoneData.filter(m => m.isUnlocked);

            // Sort Locked by Progress Descending (Closest to goal)
            locked.sort((a, b) => b.progressVal - a.progressVal);

            // Sort Unlocked by Date Descending (Recently achieved)
            unlocked.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Combine: Fill with locked first, then unlocked
            let displayItems = [...locked];

            // If we have fewer than 6 locked, fill with unlocked
            if (displayItems.length < 6) {
                const slotsRemaining = 6 - displayItems.length;
                displayItems = [...displayItems, ...unlocked.slice(0, slotsRemaining)];
            } else {
                displayItems = displayItems.slice(0, 6);
            }

            if (displayItems.length === 0) {
                widgetContainer.innerHTML = '<p class="text-gray-500 text-sm">Keep training to unlock milestones!</p>';
            } else {
                widgetContainer.innerHTML = displayItems.map(m => createMilestoneCard(m, true)).join('');
            }
        }

        // 4. Render Full View (All Milestones)
        if (fullContainer) {
            // Sort by unlocked status (unlocked first), then progress
            const allItems = [...window.globalMilestoneData].sort((a, b) => {
                if (a.isUnlocked && !b.isUnlocked) return -1;
                if (!a.isUnlocked && b.isUnlocked) return 1;
                return b.progressVal - a.progressVal;
            });
            fullContainer.innerHTML = allItems.map(m => createMilestoneCard(m, false)).join('');
        }

    } catch (e) {
        console.error("Error in renderMilestones:", e);
        if (widgetContainer) widgetContainer.innerHTML = '<p class="text-red-500 text-xs">Error loading milestones</p>';
    }
}

function calculateMilestoneStats(sortedPRs) {
    // Track Running Stats & Unlock Dates
    const stats = {
        maxBench: 0,
        maxSquat: 0,
        maxDeadlift: 0,
        maxOHP: 0,
        totalVolume: 0,
        totalPRs: 0,
        currentStreak: 0,
        musclesTrained: new Set(),
        maxSingleMuscleCount: 0,
        hasEarlyMorningPR: false
    };

    const unlockedDates = {}; // Map<milestoneId, string (ISO Date)>
    const muscleCounts = {};
    const weeksMap = new Set(); // For streak calcs

    sortedPRs.forEach(pr => {
        const prDate = new Date(pr.performed_at);

        // Update Stats
        stats.totalPRs++;
        const n = pr.exercise.toLowerCase();
        const w = pr.weight;

        if (n.includes('bench')) stats.maxBench = Math.max(stats.maxBench, w);
        if (n.includes('squat')) stats.maxSquat = Math.max(stats.maxSquat, w);
        if (n.includes('deadlift')) stats.maxDeadlift = Math.max(stats.maxDeadlift, w);
        if (n.includes('overhead') || n.includes('press')) stats.maxOHP = Math.max(stats.maxOHP, w);

        stats.totalVolume += (w * pr.reps);

        let muscle = pr.muscle_group || EXERCISE_TO_MUSCLE[pr.exercise] || "Other";
        stats.musclesTrained.add(muscle);
        muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
        stats.maxSingleMuscleCount = Math.max(...Object.values(muscleCounts));

        if (prDate.getHours() >= 4 && prDate.getHours() < 8) stats.hasEarlyMorningPR = true;

        // Streak Logic
        const oneJan = new Date(prDate.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((prDate - oneJan) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((prDate.getDay() + 1 + numberOfDays) / 7);
        weeksMap.add(`${prDate.getFullYear()}-W${weekNum}`);

        // CHECK UNLOCKS AT THIS MOMENT
        MILESTONE_DEFINITIONS.forEach(def => {
            if (!unlockedDates[def.id]) { // If not yet unlocked
                // Handling streaks
                if (def.id.startsWith('streak')) {
                    const sWeeks = Array.from(weeksMap).sort();
                    let cStreak = 0; let mStreak = 0; let last = -1;
                    sWeeks.forEach(wk => {
                        const [y, wn] = wk.split('-');
                        const abs = parseInt(y) * 52 + parseInt(wn.replace('W', ''));
                        if (last === -1) cStreak = 1;
                        else if (abs === last + 1) cStreak++;
                        else cStreak = 1;
                        mStreak = Math.max(mStreak, cStreak);
                        last = abs;
                    });
                    stats.currentStreak = mStreak;
                }

                if (def.check && def.check(stats)) {
                    unlockedDates[def.id] = pr.performed_at;
                }
            }
        });
    });

    // Final Streak Calc (for progress)
    const sWeeks = Array.from(weeksMap).sort();
    let cStreak = 0; let mStreak = 0; let last = -1;
    sWeeks.forEach(wk => {
        const [y, wn] = wk.split('-');
        const abs = parseInt(y) * 52 + parseInt(wn.replace('W', ''));
        if (last === -1) cStreak = 1;
        else if (abs === last + 1) cStreak++;
        else cStreak = 1;
        mStreak = Math.max(mStreak, cStreak);
        last = abs;
    });
    stats.currentStreak = mStreak;

    // Return Mapped Definitions
    return MILESTONE_DEFINITIONS.map(def => {
        const isUnlocked = !!unlockedDates[def.id];
        const progress = def.progress ? def.progress(stats) : 0;
        return {
            ...def,
            isUnlocked: isUnlocked,
            progressVal: progress,
            date: unlockedDates[def.id] || null
        };
    });
}

function renderDailyMotivation() {
    const quoteEl = document.getElementById('daily-quote-text');
    if (!quoteEl) return;

    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]?.text || "Keep pushing!";
    quoteEl.textContent = `"${randomQuote}"`;
}

function createMilestoneCard(m, isSmallWidget = false) {
    const statusColor = m.isUnlocked ? 'text-primary' : 'text-gray-500';
    const bgClass = 'glass-card bg-[#18181b]/80';
    const borderClass = m.isUnlocked ? 'border-primary/20' : 'border-white/5';

    if (isSmallWidget) {
        // Value Display logic
        let valueDisplay = m.valueLabel;
        if (m.category === 'streak') valueDisplay = `${m.target} Wks`;
        if (m.category === 'volume') valueDisplay = `${(m.target / 1000).toFixed(0)}k`;
        if (m.category === 'pr_count') valueDisplay = `${m.target} PRs`;

        // Progress Logic
        let progressPercent = Math.min(100, Math.round(m.progressVal));
        if (m.isUnlocked) progressPercent = 100;

        return `
        <div class="p-3 sm:p-4 rounded-xl border ${borderClass} ${bgClass} flex flex-col justify-between h-full min-h-[100px] hover:bg-white/5 transition-colors group">
            
            <!-- Top Row: Icon | Title | Value -->
            <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-3 min-w-0">
                    <span class="material-symbols-outlined text-gray-500 text-lg group-hover:text-primary transition-colors">${m.icon}</span>
                    <h4 class="text-sm font-bold text-white truncate leading-tight">${m.title}</h4>
                </div>
                <span class="text-xs font-bold text-white shrink-0 ml-2">${valueDisplay}</span>
            </div>

            <!-- Middle Row: Description -->
            <p class="text-[10px] text-gray-500 font-medium mb-3 truncate">Goal: ${m.desc}</p>

            <!-- Bottom Row: Progress -->
            <div class="mt-auto">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Progress</span>
                    <span class="text-[9px] font-bold ${m.isUnlocked ? 'text-primary' : 'text-gray-400'}">${progressPercent}%</span>
                </div>
                <div class="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div class="bg-primary h-full rounded-full transition-all duration-500 ${m.isUnlocked ? 'shadow-[0_0_10px_rgba(19,236,91,0.5)]' : ''}" style="width: ${progressPercent}%"></div>
                </div>
            </div>
        </div>
        `;
    }

    const progressPercent = Math.min(100, Math.round(m.progressVal));
    const footerHtml = m.isUnlocked
        ? `<div class="mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-primary text-xs font-bold"><span class="material-symbols-outlined text-sm">check_circle</span> Unlocked</div>`
        : `<div class="mt-auto pt-4 relative">
            <div class="flex justify-between mb-1">
                <span class="text-[10px] text-gray-500 uppercase font-bold">Progress</span>
                <span class="text-xs text-white font-bold">${progressPercent}%</span>
            </div>
            <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full" style="width: ${progressPercent}%"></div>
            </div>
           </div>`;

    return `
    <div class="p-6 rounded-2xl border ${borderClass} bg-[#18181b] flex flex-col h-full group hover:border-white/10 transition-colors">
        <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                 <span class="material-symbols-outlined text-xl">${m.icon}</span>
            </div>
            ${m.isUnlocked ? '<span class="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Done</span>' : ''}
        </div>
        
        <h3 class="text-lg font-bold text-white mb-1">${m.title}</h3>
        <p class="text-xs text-gray-500 mb-6 leading-relaxed">${m.desc}</p>
        
        ${footerHtml}
    </div>
    `;
}

const MOTIVATIONAL_QUOTES = [
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "Pain is weakness leaving the body.", author: "Marine Corps" },
    { text: "Do something today that your future self will thank you for.", author: "Unknown" },
];
