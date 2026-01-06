// globalPRs, globalMilestoneData, currentEditingId, idToDelete are in config.js
let currentView = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialization started');
    fetchPRs();
    setupModal();
    setupDeleteModal();
    setupNavigation();
    populateExerciseDropdown();
    populateMuscleDropdown();
});

// Navigation Setup
function setupNavigation() {
    // 1. Define switchView globally
    window.switchView = function (viewName) {
        currentView = viewName;

        // Hide all views
        ['dashboard', 'history', 'milestones'].forEach(v => {
            const el = document.getElementById(`${v}-view`);
            if (el) el.classList.add('hidden');
        });

        // Show target
        const target = document.getElementById(`${viewName}-view`);
        if (target) {
            target.classList.remove('hidden');
            if (viewName === 'milestones') renderMilestones(globalPRs);
            if (viewName === 'history') filterAndRenderHistory();
        }

        // Update Nav State
        document.querySelectorAll('.nav-item').forEach(el => {
            // Reset styles
            el.classList.remove('bg-white/5', 'text-white', 'border-primary');
            el.classList.add('text-gray-400', 'border-transparent');

            if (el.getAttribute('onclick')?.includes(viewName)) {
                el.classList.add('bg-white/5', 'text-white', 'border-primary');
                el.classList.remove('text-gray-400', 'border-transparent');
            }
        });
    };

    // 2. Attach Listeners 
    const btnBack = document.getElementById('btn-back-dashboard');
    const searchInput = document.getElementById('history-search');
    const sortSelect = document.getElementById('history-sort');

    if (btnBack) btnBack.onclick = (e) => { e.preventDefault(); switchView('dashboard'); };

    if (searchInput) searchInput.addEventListener('input', filterAndRenderHistory);
    if (sortSelect) sortSelect.addEventListener('change', filterAndRenderHistory);
}

function filterAndRenderHistory() {
    const listContainer = document.getElementById('history-list-container');
    const searchInput = document.getElementById('history-search');
    const sortSelect = document.getElementById('history-sort');

    if (!listContainer) return;

    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const sortBy = sortSelect ? sortSelect.value : 'date_desc';

    // Filter
    let filtered = globalPRs.filter(pr => pr.exercise.toLowerCase().includes(query));

    // Sort
    filtered.sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.performed_at) - new Date(a.performed_at);
        if (sortBy === 'date_asc') return new Date(a.performed_at) - new Date(b.performed_at);
        if (sortBy === 'weight_desc') return b.weight - a.weight;
        if (sortBy === 'weight_asc') return a.weight - b.weight;
        return 0;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-white/5">
                <span class="material-symbols-outlined text-4xl text-gray-600 mb-2">search_off</span>
                <p class="text-gray-400">No records found matching "${query}"</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = filtered.map(pr => createHistoryCard(pr)).join('');
}


async function fetchPRs() {
    try {
        const response = await fetch('/prs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        globalPRs = data; // Store globally

        // Render List (Dashboard)
        renderPRs(data);

        // Render Charts & Milestones
        console.log('DEBUG: Calling renderTrainingFocusChart');
        try { renderTrainingFocusChart(data); } catch (e) { console.error('Error in FocusChart:', e); }

        console.log('DEBUG: Calling renderStats');
        try { renderStats(data); } catch (e) { console.error('Error in Stats:', e); }

        console.log('DEBUG: Calling renderDailyMotivation');
        try { renderDailyMotivation(); } catch (e) { console.error('Error in Motivation:', e); }

        console.log('DEBUG: Calling renderMilestones from fetchPRs');
        renderMilestones(data);

        // Update Active View Logic 
        if (currentView === 'history') {
            filterAndRenderHistory();
        } else if (currentView === 'milestones') {
            renderMilestones(data);
        } else {
            renderRecentRecords(data);
        }

    } catch (error) {
        console.error('Error fetching PRs:', error);
    }
}
