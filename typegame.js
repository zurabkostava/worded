let tiCards = [], tiCurrent = 0, tiCorrect = 0;
let tiReverse = false;
let tiCount = 10;
let tiProgressPenalty = 0.3;
let tiCurrentCard = null;
let tiHintIndex = 0;

function initTypingGame() {
    const tab = document.querySelector('[data-tab-content="tab5"]');
    tab.innerHTML = `
        <h2>🖊️ სიტყვის ჩაწერა</h2>
        <button id="tiStart">დაწყება</button>
        <div id="tiGame"></div>
    `;
    document.getElementById('tiStart').onclick = startTypingGame;

    const tagSelect = document.getElementById('tiTag');
    tagSelect.innerHTML = '<option value="">ყველა</option>';
    [...allTags].forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag;
        opt.textContent = tag;
        tagSelect.appendChild(opt);
    });
}

function startTypingGame() {
    const { tag: selectedTag, count, reverse, hideMastered } = getGlobalTrainingSettings();
    tiReverse = reverse;
    tiCount = count;

    let cards = [...document.querySelectorAll('.card')];

    if (hideMastered) {
        cards = cards.filter(card => parseFloat(card.dataset.progress || '0') < 100);
    }

    if (selectedTag) {
        cards = cards.filter(card =>
            [...card.querySelectorAll('.card-tag')].some(t => t.textContent.replace('#', '') === selectedTag)
        );
    }

    cards = shuffleArray(cards).slice(0, tiCount);
    tiCards = cards;
    tiCurrent = 0;
    tiCorrect = 0;
    showNextTyping();
}

function showNextTyping() {
    if (tiCurrent >= tiCards.length) return showTypingResult();

    const card = tiCards[tiCurrent];
    tiCurrentCard = card;
    tiHintIndex = 0;

    const word = card.querySelector('.word').textContent.trim();
    const main = card.querySelector('.translation').childNodes[0]?.textContent?.trim() || '';
    const extra = card.querySelector('.translation .extra')?.textContent?.trim() || '';
    const correctAnswers = tiReverse ? [word] : [...main.split(','), ...extra.split(',')].map(t => t.trim()).filter(Boolean);
    const shown = tiReverse ? (main.split(',')[0]?.trim() || '') : word;

    const game = document.getElementById('tiGame');
    game.innerHTML = `
        <h3>კითხვის ${tiCurrent + 1} / ${tiCards.length}</h3>
        <p style="font-size:1.2rem;">${shown}</p>
        <div class="input-container" style="margin-bottom: 10px;">
            <label class="material-input type-word-test">
                <input type="text" id="tiInput" placeholder=" " >
                <span>პასუხი</span>
            </label>
        </div>
        <button id="tiCheck">შემოწმება</button>
        <button id="tiHint">მინიშნება</button>
        <div id="tiFeedback" style="margin-top: 10px;"></div>
    `;

    document.getElementById('tiCheck').onclick = () => {
        const val = document.getElementById('tiInput').value.trim();
        const feedback = document.getElementById('tiFeedback');
        const isCorrect = correctAnswers.some(ans => ans.toLowerCase() === val.toLowerCase());

        // 🎯 სტატისტიკა
        incrementStat('TOTAL_TESTS', 1);
        incrementStat(isCorrect ? 'TOTAL_CORRECT' : 'TOTAL_WRONG', 1);

        if (isCorrect) {
            feedback.innerHTML = `<span style="color:green;">სწორია!</span>`;
            updateCardProgress(card, 3);
            tiCorrect++;
        } else {
            feedback.innerHTML = `<span style="color:red;">არასწორია. სწორი პასუხია: <strong>${correctAnswers[0]}</strong></span>`;
            updateCardProgress(card, -3);
        }
        applyCurrentSort?.();

        setTimeout(() => {
            tiCurrent++;
            showNextTyping();
        }, 1500);
    };

    document.getElementById('tiHint').onclick = () => {
        const input = document.getElementById('tiInput');
        const currentVal = input.value;
        const target = correctAnswers[0];

        let i = tiHintIndex;
        while (i < target.length && currentVal[i]?.toLowerCase() === target[i]?.toLowerCase()) {
            i++;
        }

        if (i < target.length) {
            input.value = target.substring(0, i + 1);
            tiHintIndex = i + 1;
            updateCardProgress(card, -tiProgressPenalty);
            applyCurrentSort?.();
        }
    };

    document.getElementById('tiInput').focus();
}

function showTypingResult() {
    const game = document.getElementById('tiGame');
    game.innerHTML = `
        <h3>შედეგები</h3>
        <p>სწორი პასუხები: ${tiCorrect} / ${tiCards.length}</p>
    `;
}

// 🧠 სტატისტიკის დამხმარეები
function incrementStat(key, amount) {
    const val = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, val + amount);
}
function getStat(key) {
    return parseInt(localStorage.getItem(key) || '0');
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('[data-tab="tab5"]');
    if (btn) btn.addEventListener('click', initTypingGame);
});
