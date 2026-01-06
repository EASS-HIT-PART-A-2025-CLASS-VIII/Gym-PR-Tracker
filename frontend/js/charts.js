// Chart and Stats Rendering

function renderTrainingFocusChart(prs) {
    // 1. Filter for Current Month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyPRs = prs.filter(pr => {
        const d = new Date(pr.performed_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // 2. Update Label
    const label = document.getElementById('training-focus-label');
    if (label) {
        label.textContent = `Stats for ${getMonthName(currentMonth)} ${currentYear}`;
    }

    // 3. Render Dashboard Chart
    renderCSSChart(monthlyPRs, 'dashboard-focus-chart', 'dashboard-total-prs', 'training-focus-legend');
}

function renderCSSChart(prs, chartId, countId, legendId) {
    const chartEl = document.getElementById(chartId);
    if (!chartEl) return;

    const total = prs.length;

    // Update Count
    const countEl = document.getElementById(countId);
    if (countEl) countEl.textContent = total;


    const muscleCounts = {};
    prs.forEach(pr => {
        let muscle = pr.muscle_group || EXERCISE_TO_MUSCLE[pr.exercise] || "Other";
        muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
    });

    let sortedMuscles = Object.entries(muscleCounts)
        .map(([name, count]) => ({ name, count }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Define Colors
    const rankColors = [
        '#13ec5b',
        '#ffffff',
        '#a1a1aa',
        '#52525b',
        '#27272a'
    ];

    // Generate Gradient
    if (total === 0) {
        chartEl.style.background = `conic-gradient(#222 0% 100%)`; // Empty state
    } else {
        let gradientParts = [];
        let currentPercentage = 0;

        sortedMuscles.forEach((item, index) => {
            const percent = (item.count / total) * 100;
            const endPercentage = currentPercentage + percent;
            const color = rankColors[index] || '#333';
            gradientParts.push(`${color} ${currentPercentage}% ${endPercentage}%`);
            currentPercentage = endPercentage;
        });

        if (currentPercentage < 100) {
            gradientParts.push(`transparent ${currentPercentage}% 100%`);
        }

        chartEl.style.background = `conic-gradient(${gradientParts.join(', ')})`;
    }

    // Update Legend 
    if (legendId) {
        const legendContainer = document.getElementById(legendId);
        if (legendContainer) {
            if (sortedMuscles.length === 0) {
                legendContainer.innerHTML = '<span class="text-xs text-gray-500">No data available</span>';
            } else {
                legendContainer.innerHTML = sortedMuscles.map((item, index) => {
                    const percent = Math.round((item.count / total) * 100);
                    const color = rankColors[index] || '#333';

                    return `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full" style="background-color: ${color};"></div>
                            <span class="text-sm font-medium text-gray-300 truncate w-20">${item.name}</span>
                        </div>
                        <span class="text-sm font-bold text-white">${percent}%</span>
                    </div>
                    `;
                }).join('');
            }
        }
    }
}

function renderStats(prs) {
    // Total Count
    const totalCount = prs.length;
    const totalEl = document.getElementById('stats-total-count');
    if (totalEl) totalEl.textContent = totalCount;

    // Weekly Count
    const now = new Date();
    // Get start of week 
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyCount = prs.filter(pr => {
        const prDate = new Date(pr.performed_at);
        return prDate >= startOfWeek;
    }).length;

    const badgeEl = document.getElementById('stats-weekly-badge');
    if (badgeEl) {
        badgeEl.textContent = `+${weeklyCount} this week`;
    }
}
