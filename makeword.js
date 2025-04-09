let mwCards = [];
let mwCurrentIndex = 0;
let mwCorrectAnswers = 0;
let mwTotalQuestions = 10;
let mwReverse = false;
let mwFullBlankMode = false;

let mwContainer, mwResultContainer;

document.addEventListener('DOMContentLoaded', () => {
    const tab = document.querySelector('[data-tab-content="tab4"]');
    if (!tab) return;

    tab.innerHTML = `
        <h2>🧠 გამოტოვებული ასოების შევსება</h2>
        <label style="margin-bottom:10px; display:inline-block;">
            <input type="checkbox" id="mwFullBlankToggle" />
            ყველა ასო ცარიელი იყოს
        </label>
        <button id="mwStartBtn">დაწყება</button>
        <div id="mwContainer" style="margin-top: 1rem;"></div>
        <div id="mwResultContainer" style="margin-top: 2rem;"></div>
    `;

    mwContainer = document.getElementById('mwContainer');
    mwResultContainer = document.getElementById('mwResultContainer');

    document.getElementById('mwStartBtn').addEventListener('click', startMakewordGame);
    populateMWTags();
});

function populateMWTags() {
    const select = document.getElementById('mwTagSelect');
    if (!select) return;

    const allTags = new Set();
    document.querySelectorAll('.card').forEach(card => {
        card.querySelectorAll('.card-tag').forEach(tagEl => {
            const tag = tagEl.textContent.replace('#', '').trim();
            if (tag) allTags.add(tag);
        });
    });

    select.innerHTML = '<option value="">ყველა</option>';
    [...allTags].sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
    });
}

// === სტატისტიკის დამხმარე ფუნქციები ===
function incrementStat(key, amount) {
    const currentVal = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentVal + amount).toString());
}

function startMakewordGame() {
    const { tag, count, reverse, hideMastered } = getGlobalTrainingSettings();
    mwReverse = reverse;
    mwTotalQuestions = count;
    mwFullBlankMode = document.getElementById('mwFullBlankToggle')?.checked;

    let allCards = [...document.querySelectorAll('.card')];
    if (hideMastered) {
        allCards = allCards.filter(card => parseFloat(card.dataset.progress || '0') < 100);
    }

    if (tag) {
        allCards = allCards.filter(card =>
            [...card.querySelectorAll('.card-tag')].some(el => el.textContent.includes(tag))
        );
    }

    if (allCards.length === 0) {
        alert("ბარათები ვერ მოიძებნა არჩეული თეგით.");
        return;
    }

    const shuffled = allCards.sort(() => 0.5 - Math.random());
    mwCards = shuffled.slice(0, mwTotalQuestions);
    mwCurrentIndex = 0;
    mwCorrectAnswers = 0;

    mwResultContainer.innerHTML = '';
    showNextMWQuestion();
}

function showNextMWQuestion() {
    if (mwCurrentIndex >= mwCards.length) {
        showMakewordResults();
        return;
    }

    const card = mwCards[mwCurrentIndex];
    const word = card.querySelector('.word').textContent.trim();
    const mainText = card.querySelector('.translation').childNodes[0]?.textContent?.trim() || '';
    const mainTranslation = mainText.split(',')[0]?.trim();
    const correctWord = mwReverse ? mainTranslation : word;

    if (!correctWord || correctWord.length < 4) {
        mwCurrentIndex++;
        showNextMWQuestion();
        return;
    }

    const allIndices = Array.from({ length: correctWord.length }, (_, i) => i);
    const missingIndices = mwFullBlankMode
        ? allIndices
        : generateRandomMissingIndices(correctWord);

    const blanks = correctWord.split('').map((ch, i) =>
        missingIndices.includes(i) ? '_' : ch
    );

    const missingLetters = missingIndices.map(i => correctWord[i]);
    const allChars = mwReverse
        ? "აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ".split('')
        : "abcdefghijklmnopqrstuvwxyz".split('');
    const extra = [];

    while (missingLetters.length + extra.length < 8) {
        const rand = allChars[Math.floor(Math.random() * allChars.length)];
        if (!missingLetters.includes(rand) && !extra.includes(rand)) {
            extra.push(rand);
        }
    }

    const buttons = shuffleArray([...missingLetters, ...extra]);
    const helperWord = mwReverse ? word : mainTranslation;

    mwContainer.innerHTML = `
        <h3>კითხვის ${mwCurrentIndex + 1} / ${mwCards.length}</h3>
        <div id="mwHintSection" style="margin-bottom: 10px;">
            <button id="showHintBtn" style="padding: 5px 10px; font-size: 0.9rem;">
                ❓ დახმარება
            </button>
            <span id="hintWord" style="display: ${mwFullBlankMode ? 'inline' : 'none'}; margin-left: 10px; font-weight: bold; color: #666;">
                ${helperWord}
            </span>
        </div>
        <div class="mw-word" style="font-size: 2rem; margin-bottom: 1rem;">
            ${blanks.map((ch, i) =>
        `<span class="mw-letter ${ch === '_' ? 'missing' : ''}" data-index="${i}">${ch}</span>`
    ).join('')}
        </div>
        <div class="mw-buttons" style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${buttons.map(ch =>
        `<button class="mw-char" data-char="${ch}">${ch}</button>`
    ).join('')}
        </div>
    `;

    const used = new Map();

    document.querySelectorAll('.mw-char').forEach(btn => {
        btn.addEventListener('click', () => {
            const emptySpan = document.querySelector('.mw-letter.missing:not(.inserted-letter)');
            if (!emptySpan) return;

            const letter = btn.dataset.char;
            emptySpan.textContent = letter;
            emptySpan.classList.add('inserted-letter');
            used.set(emptySpan.dataset.index, btn);
            btn.disabled = true;
            btn.style.opacity = '0.5';

            checkMWAnswer();
        });
    });

    document.querySelectorAll('.mw-letter.missing').forEach(span => {
        span.addEventListener('click', () => {
            const idx = span.dataset.index;
            if (!used.has(idx)) return;

            const btn = used.get(idx);
            btn.disabled = false;
            btn.style.opacity = '1';
            span.textContent = '_';
            span.classList.remove('inserted-letter');
            used.delete(idx);
        });
    });

    const showHintBtn = document.getElementById('showHintBtn');
    const hintWordEl = document.getElementById('hintWord');
    let hintUsed = mwFullBlankMode;

    showHintBtn?.addEventListener('click', () => {
        hintWordEl.style.display = 'inline';
        showHintBtn.style.display = 'none';

        if (!hintUsed) {
            updateCardProgress(card, -0.5);
            applyCurrentSort?.();
            hintUsed = true;
        }
    });

    function checkMWAnswer() {
        const result = [...document.querySelectorAll('.mw-letter')].map(el => el.textContent).join('');
        const isComplete = !result.includes('_');
        if (!isComplete) return;

        const isCorrect = result === correctWord;
        const delta = mwFullBlankMode ? 3 : 2;

        // ✅ Live სტატისტიკა
        incrementStat('TOTAL_TESTS', 1);
        if (isCorrect) {
            incrementStat('TOTAL_CORRECT', 1);
            mwCorrectAnswers++;
        } else {
            incrementStat('TOTAL_WRONG', 1);
        }

        updateCardProgress(card, isCorrect ? delta : -delta);
        applyCurrentSort?.();

        document.querySelectorAll('.mw-letter').forEach(el => {
            el.style.color = isCorrect ? 'green' : 'red';
        });

        setTimeout(() => {
            mwCurrentIndex++;
            showNextMWQuestion();
        }, 1500);
    }
}

function generateRandomMissingIndices(word) {
    const count = Math.min(3, Math.max(1, Math.floor(word.length / 3)));
    const indices = [];
    while (indices.length < count) {
        const i = Math.floor(Math.random() * word.length);
        if (!indices.includes(i) && /[ა-ჰa-zA-Z]/.test(word[i])) {
            indices.push(i);
        }
    }
    return indices;
}

function showMakewordResults() {
    mwContainer.innerHTML = `
        <h3>შედეგები</h3>
        <p>სწორი პასუხები: ${mwCorrectAnswers} / ${mwCards.length}</p>
        <p>არასწორი პასუხები: ${mwCards.length - mwCorrectAnswers}</p>
    `;
}

function shuffleArray(arr) {
    return [...arr].sort(() => 0.5 - Math.random());
}
