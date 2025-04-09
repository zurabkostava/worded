let puzzleCards = [], puzzleCurrent = 0, puzzleCorrect = 0;
let puzzleReverse = false;
let puzzleCount = 10;

function initPuzzleGame() {
    const tab = document.querySelector('[data-tab-content="tab7"]');
    tab.innerHTML = `
        <h2>🧩 წინადადების აწყობა</h2>
        <button id="puzzleStart">დაწყება</button>
        <div id="puzzleGame" style="margin-top: 1rem;"></div>
    `;
    document.getElementById('puzzleStart').onclick = startPuzzleGame;
}

function startPuzzleGame() {
    const { tag, count, reverse, hideMastered  } = getGlobalTrainingSettings();
    puzzleReverse = reverse;
    puzzleCount = count;

    let cards = [...document.querySelectorAll('.card')];
    if (hideMastered) {
        cards = cards.filter(card => parseFloat(card.dataset.progress || '0') < 100);
    }
    if (tag) {
        cards = cards.filter(card =>
            [...card.querySelectorAll('.card-tag')].some(t => t.textContent.replace('#', '') === tag)
        );
    }

    cards = shuffleArray(cards).filter(card => {
        const en = JSON.parse(card.dataset.english || '[]');
        const ge = JSON.parse(card.dataset.georgian || '[]');
        return (puzzleReverse ? ge : en).length > 0;
    }).slice(0, puzzleCount);

    puzzleCards = cards;
    puzzleCurrent = 0;
    puzzleCorrect = 0;

    showNextPuzzle();
}

function showNextPuzzle() {
    if (puzzleCurrent >= puzzleCards.length) return showPuzzleResults();

    const card = puzzleCards[puzzleCurrent];
    const word = card.querySelector('.word').textContent.trim();
    const sentences = JSON.parse(card.dataset[puzzleReverse ? 'georgian' : 'english'] || '[]');
    const oppositeSentences = JSON.parse(card.dataset[puzzleReverse ? 'english' : 'georgian'] || '[]');

    const originalSentence = sentences[Math.floor(Math.random() * sentences.length)];
    const words = originalSentence.split(/\s+/).filter(Boolean);
    const shuffled = shuffleArray(words);

    const container = document.getElementById('puzzleGame');
    container.innerHTML = `
        <h3>კითხვის ${puzzleCurrent + 1} / ${puzzleCards.length}</h3>
        <p>დააწკაპუნე სიტყვებზე სწორი თანმიმდევრობით:</p>
        <div id="puzzleWords" style="margin: 10px 0;"></div>
        <div id="puzzleAnswer" style="min-height: 40px; border: 1px dashed #ccc; padding: 10px; margin-bottom: 10px;"></div>
        <button id="puzzleSubmit" disabled>შემოწმება</button>
        <button id="puzzleHintBtn" style="margin-left: 10px;">❓ დახმარება</button>
        <button id="puzzleAutoHintBtn" style="margin-left: 10px;">💡 მინიშნება</button>
        <div id="puzzleHint" style="margin-top: 10px; color: #888;"></div>
        <div id="puzzleFeedback" style="margin-top: 1rem;"></div>
    `;

    const puzzleWords = document.getElementById('puzzleWords');
    const puzzleAnswer = document.getElementById('puzzleAnswer');
    const puzzleSubmit = document.getElementById('puzzleSubmit');
    const hintBtn = document.getElementById('puzzleHintBtn');

    const originalClickMap = new Map();

    shuffled.forEach((word, index) => {
        const btn = document.createElement('button');
        btn.textContent = word;
        btn.className = 'puzzle-word';
        btn.style.margin = '5px';
        btn.dataset.index = index;

        const clickFn = () => {
            btn.remove();
            puzzleAnswer.appendChild(btn);

            btn.onclick = () => {
                btn.remove();
                const all = [...puzzleWords.children];
                const i = parseInt(btn.dataset.index);
                puzzleWords.insertBefore(btn, all[i] || null);
                btn.onclick = originalClickMap.get(btn);
                checkSubmitEnabled();
            };

            checkSubmitEnabled();
        };

        btn.onclick = clickFn;
        originalClickMap.set(btn, clickFn);
        puzzleWords.appendChild(btn);
    });

    document.getElementById('puzzleAutoHintBtn').onclick = () => {
        const currentWords = [...puzzleAnswer.querySelectorAll('button')].map(b => b.textContent);
        let mismatchIndex = currentWords.findIndex((w, i) => w !== words[i]);
        if (mismatchIndex === -1 && currentWords.length < words.length) {
            mismatchIndex = currentWords.length;
        }

        const allSelected = [...puzzleAnswer.querySelectorAll('button')];
        for (let i = allSelected.length - 1; i >= mismatchIndex; i--) {
            const btn = allSelected[i];
            btn.remove();
            const allPool = [...puzzleWords.children];
            const originalIndex = parseInt(btn.dataset.index);
            puzzleWords.insertBefore(btn, allPool[originalIndex] || null);
            btn.onclick = originalClickMap.get(btn);
        }

        const nextWord = words[mismatchIndex];
        const btnToUse = [...puzzleWords.querySelectorAll('button')].find(b => b.textContent === nextWord);
        if (!btnToUse) return;

        btnToUse.remove();
        puzzleAnswer.appendChild(btnToUse);
        btnToUse.onclick = () => {
            btnToUse.remove();
            const all = [...puzzleWords.children];
            const i = parseInt(btnToUse.dataset.index);
            puzzleWords.insertBefore(btnToUse, all[i] || null);
            btnToUse.onclick = originalClickMap.get(btnToUse);
            checkSubmitEnabled();
        };

        updateCardProgress(card, -0.4);
        applyCurrentSort?.();
        checkSubmitEnabled();
    };

    puzzleSubmit.onclick = () => {
        const given = [...puzzleAnswer.querySelectorAll('button')].map(b => b.textContent);
        const isCorrect = given.join(' ') === words.join(' ');
        const feedback = document.getElementById('puzzleFeedback');

        // ✅ Stat update
        incrementStat('TOTAL_TESTS', 1);
        if (isCorrect) {
            incrementStat('TOTAL_CORRECT', 1);
        } else {
            incrementStat('TOTAL_WRONG', 1);
        }

        if (isCorrect) {
            feedback.innerHTML = `<span style="color: green;">სწორია!</span>`;
            updateCardProgress(card, 3);
            puzzleCorrect++;
            puzzleAnswer.querySelectorAll('button').forEach(b => {
                b.style.backgroundColor = '#4caf50';
                b.style.color = 'white';
                b.disabled = true;
            });
        } else {
            feedback.innerHTML = `<span style="color: red;">არასწორია. სწორი წინადადება:<br><strong>${originalSentence}</strong></span>`;
            updateCardProgress(card, -3);
            puzzleAnswer.querySelectorAll('button').forEach(b => b.disabled = true);
        }

        applyCurrentSort?.();
        puzzleWords.querySelectorAll('button').forEach(b => b.disabled = true);
        puzzleSubmit.disabled = true;

        setTimeout(() => {
            puzzleCurrent++;
            showNextPuzzle();
        }, 2500);
    };

    hintBtn.onclick = () => {
        const alt = oppositeSentences[0] || "(ვერ მოიძებნა საპირისპირო წინადადება)";
        document.getElementById('puzzleHint').textContent = `📘 სხვა ენაზე: ${alt}`;
        updateCardProgress(card, -0.4);
        hintBtn.disabled = true;
        applyCurrentSort?.();
    };

    function checkSubmitEnabled() {
        puzzleSubmit.disabled = puzzleAnswer.querySelectorAll('button').length !== words.length;
    }
}

function showPuzzleResults() {
    const container = document.getElementById('puzzleGame');
    container.innerHTML = `
        <h3>შედეგები</h3>
        <p>სწორი პასუხები: ${puzzleCorrect} / ${puzzleCards.length}</p>
    `;
}

function shuffleArray(arr) {
    return [...arr].sort(() => 0.5 - Math.random());
}

function incrementStat(key, amount = 1) {
    const val = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, val + amount);
}

document.addEventListener('DOMContentLoaded', () => {
    const tabBtn = document.querySelector('[data-tab="tab7"]');
    if (tabBtn) {
        tabBtn.addEventListener('click', initPuzzleGame);
    }
});
