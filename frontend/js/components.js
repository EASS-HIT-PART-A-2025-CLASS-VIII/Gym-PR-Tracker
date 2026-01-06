// UI Components & Card Rendering

function renderRecentRecords(prs) {
    const container = document.getElementById('dashboard-recent-prs');
    if (!container) return;

    // Sort 
    const sorted = [...prs].sort((a, b) => new Date(b.performed_at) - new Date(a.performed_at));
    const top5 = sorted.slice(0, 5);

    if (top5.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-sm text-center py-4">No records yet. Start logging!</div>';
        return;
    }

    container.innerHTML = top5.map(pr => createHistoryCard(pr)).join('');
}

function renderPRs(prs) {
    const container = document.getElementById('pr-container');
    if (!container) return;

    if (prs.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500">No PRs records found. Log your first one!</div>';
        return;
    }

    const sortedPrs = [...prs].sort((a, b) => new Date(b.performed_at) - new Date(a.performed_at));

    const recentPRs = sortedPrs.slice(0, 4); // Show 4 instead of 3 for the grid
    container.innerHTML = recentPRs.map((pr, index) => createPRCard(pr, index)).join('');
}

function createPRCard(pr, index) {
    const date = new Date(pr.performed_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const delay = 0.05 + (index * 0.05);

    // Image Selection Logic
    let imageUrl = prImageCache[pr.id];

    if (!imageUrl) {
        let pool = EXERCISE_IMAGE_POOLS[pr.exercise];

        if (!pool) {
            if (pr.exercise.includes("Press") || pr.exercise.includes("Raise") || pr.exercise.includes("Extension")) {
                pool = GENERIC_PUSH_IMAGES;
            } else if (pr.exercise.includes("Pull") || pr.exercise.includes("Row") || pr.exercise.includes("Deadlift")) {
                pool = GENERIC_PULL_IMAGES;
            } else {
                pool = EXERCISE_IMAGE_POOLS["Other"];
            }
        }

        // Pick random from pool
        imageUrl = pool[Math.floor(Math.random() * pool.length)];

        // Cache it
        prImageCache[pr.id] = imageUrl;
    }

    return `
    <div class="glass-card p-4 rounded-xl flex items-center gap-4 animate-fade-in-up hover:bg-white/5 transition-colors cursor-pointer border border-white/5" style="animation-delay: ${delay}s" onclick="editPR('${pr.id}')">
        <img src="${imageUrl}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=150&fit=crop';" alt="${pr.exercise}" class="w-12 h-12 rounded-lg object-cover shadow-sm bg-surface-dark border border-white/10 shrink-0">
        <div class="flex-1 min-w-0">
            <h4 class="text-white font-bold text-sm truncate tracking-tight">${pr.exercise}</h4>
            <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">${date}</p>
        </div>
        <div class="text-right">
            <span class="block text-lg font-bold text-primary leading-none">${pr.weight}<span class="text-xs text-gray-500 ml-0.5 font-medium">kg</span></span>
        </div>
    </div>
    `;
}

function createHistoryCard(pr) {
    const date = new Date(pr.performed_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    let imageUrl = prImageCache[pr.id];
    if (!imageUrl) {
        let pool = EXERCISE_IMAGE_POOLS[pr.exercise] || EXERCISE_IMAGE_POOLS["Other"] || GENERIC_PULL_IMAGES;

        if (!EXERCISE_IMAGE_POOLS[pr.exercise]) {
            if (pr.exercise.includes("Press") || pr.exercise.includes("Raise")) pool = GENERIC_PUSH_IMAGES;
            else if (pr.exercise.includes("Pull") || pr.exercise.includes("Row")) pool = GENERIC_PULL_IMAGES;
        }
        imageUrl = pool[Math.floor(Math.random() * pool.length)];
        prImageCache[pr.id] = imageUrl;
    }

    // Determine Muscle Group Label
    const muscle = pr.muscle_group || EXERCISE_TO_MUSCLE[pr.exercise] || "Other";

    return `
    <div class="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors border border-white/5 group" onclick="editPR('${pr.id}')">
        <img src="${imageUrl}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=150&fit=crop';" 
            class="w-16 h-16 rounded-xl object-cover shadow-sm bg-surface-dark border border-white/10 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
        
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
                <h4 class="text-white font-bold text-base truncate">${pr.exercise}</h4>
                <span class="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wide">${muscle}</span>
            </div>
            <p class="text-xs text-gray-400 flex items-center gap-1">
                <span class="material-symbols-outlined text-[10px] text-gray-500">calendar_today</span>
                ${date}
            </p>
        </div>

        <div class="text-right pl-4 border-l border-white/5 flex flex-col items-end gap-1">
             <div>
                <span class="block text-xl font-bold text-primary leading-none mb-0.5">${pr.weight}<span class="text-xs text-gray-500 ml-0.5 font-medium">kg</span></span>
                <span class="block text-xs text-gray-500 font-medium">${pr.reps} reps</span>
             </div>
             
             <!-- Actions -->
             <div class="flex items-center gap-1 mt-2">
                <button onclick="event.stopPropagation(); editPR('${pr.id}')" class="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all" title="Edit">
                    <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button onclick="event.stopPropagation(); deletePR('${pr.id}')" class="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                    <span class="material-symbols-outlined text-lg">delete</span>
                </button>
             </div>
        </div>
    </div>
    `;
}
