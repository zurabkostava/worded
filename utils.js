//utils.js

function updateCardProgress(card, delta) {
    let current = parseFloat(card.dataset.progress || '0');
    current = Math.max(0, Math.min(100, current + delta));
    card.dataset.progress = current.toFixed(1);

    if (parseFloat(card.dataset.progress) >= 100) {

        card.classList.add('mastered');
    } else {
        card.classList.remove('mastered');
    }

    const progressBar = card.querySelector('.progress-bar');
    const label = card.querySelector('.progress-label');

    if (progressBar) {
        progressBar.style.width = `${current.toFixed(1)}%`;
        progressBar.style.backgroundColor = getProgressColor(current);
    }

    if (label) {
        label.textContent = `${current.toFixed(1)}%`;
    }

    if (typeof saveToStorage === 'function') saveToStorage();
    autoSyncIfEnabled(); // ✅ ავტომატური

}

function getProgressColor(percent) {
    if (percent <= 10) return '#eee';
    if (percent <= 25) return '#c8e6c9';
    if (percent <= 50) return '#a5d6a7';
    if (percent <= 75) return '#81c784';
    if (percent < 100) return '#66bb6a';
    return '#55d288';
}

document.addEventListener('DOMContentLoaded', () => {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        const progress = parseFloat(card.dataset.progress || '0');
        if (progress >= 100) {
            card.classList.add('mastered');
        }

        const progressBar = card.querySelector('.progress-bar');
        const label = card.querySelector('.progress-label');

        if (progressBar) {
            progressBar.style.width = `${progress.toFixed(1)}%`;
            progressBar.style.backgroundColor = getProgressColor(progress);
        }

        if (label) {
            label.textContent = `${progress.toFixed(1)}%`;
        }
    });
});

document.getElementById('hideMasteredCheckbox').addEventListener('change', (e) => {
    const hide = e.target.checked;
    document.querySelectorAll('.card').forEach(card => {
        const progress = parseFloat(card.dataset.progress || '0');
        card.style.display = (hide && progress >= 100) ? 'none' : 'block';
    });
});


document.getElementById("testUploadBtn").addEventListener("click", syncTestCardToFirebase);

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000); // 3 წამში ქრება
}
