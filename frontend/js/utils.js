function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-toast backdrop-blur-md border border-white/10 ${type === 'success' ? 'bg-[#13ec5b]/20 text-white' : 'bg-red-500/20 text-white'
        }`;

    toast.innerHTML = `
        <span class="material-symbols-outlined text-[20px] ${type === 'success' ? 'text-[#13ec5b]' : 'text-red-400'
        }">${type === 'success' ? 'check_circle' : 'error'}</span>
        <span class="text-sm font-bold tracking-wide">${message}</span>
    `;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getMonthName(monthIndex) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[monthIndex];
}
