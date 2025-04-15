let senCards = [], senCurrent = 0, senCorrect = 0;
let senReverse = false;
let senCount = 10;

function initSentenceGame() {
    const tab = document.querySelector('[data-tab-content="tab6"]');
    tab.innerHTML = `
        <h2>✨ სიტყვა წინადადებაში</h2>
        <button id="senStart">დაწყება</button>
        <div id="senGame"></div>
    `;
    document.getElementById('senStart').onclick = startSentenceGame;
}

function startSentenceGame() {
    const { tag, count, reverse, hideMastered } = getGlobalTrainingSettings();
    senReverse = reverse;
    senCount = count;

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
        return en.length > 0 || ge.length > 0;
    }).slice(0, senCount);

    senCards = cards;
    senCurrent = 0;
    senCorrect = 0;

    showNextSentence();
}

function showNextSentence() {
    if (senCurrent >= senCards.length) return showSentenceResult();

    const card = senCards[senCurrent];
    const word = card.querySelector('.word').textContent.trim();
    const correctWord = word;
    const enSentences = JSON.parse(card.dataset.english || '[]');
    const geSentences = JSON.parse(card.dataset.georgian || '[]');
    const sentences = senReverse ? geSentences : enSentences;

    const matchedWords = [];
    const base = word.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${base}(es|s|ed|d|ing|er|est)?\\b`, 'gi');

    const displayedSentences = sentences.map(s =>
        s.replace(regex, (match) => {
            matchedWords.push(match);
            return '_____';
        })
    );

    const allCards = [...document.querySelectorAll('.card')];
    const options = shuffleArray(
        [correctWord, ...allCards
            .filter(c => c !== card)
            .map(c => c.querySelector('.word').textContent.trim())
            .filter(w => w.toLowerCase() !== correctWord.toLowerCase())
            .slice(0, 5)
        ]
    ).slice(0, 6);

    const game = document.getElementById('senGame');
    game.innerHTML = `
        <h3>კითხვის ${senCurrent + 1} / ${senCards.length}</h3>
        <div id="senSentences">${displayedSentences.map((s, i) => `<p><strong>${i + 1}.</strong> ${s}</p>`).join('')}</div>
        <div id="senOptions">
            ${options.map(opt => `<button class="sen-option">${opt}</button>`).join('')}
        </div>
        <div id="senFeedback" style="margin-top: 10px;"></div>
    `;

    document.querySelectorAll('.sen-option').forEach(btn => {
        btn.onclick = () => {
            const val = btn.textContent.trim();
            const feedback = document.getElementById('senFeedback');
            const isCorrect = val.toLowerCase() === correctWord.toLowerCase();

            incrementStat('TOTAL_TESTS', 1);
            incrementStat(isCorrect ? 'TOTAL_CORRECT' : 'TOTAL_WRONG', 1);

            if (isCorrect) {
                feedback.innerHTML = `<span style="color:green;">სწორია!</span>`;
                updateCardByText(correctWord, 4);
                senCorrect++;
            } else {
                feedback.innerHTML = `<span style="color:red;">არასწორია. სწორი იყო: <strong>${correctWord}</strong></span>`;
                updateCardByText(correctWord, -4);
            }

            let i = 0;
            document.querySelectorAll('#senSentences p').forEach(p => {
                p.innerHTML = p.innerHTML.replace(/_____+/g, () => {
                    const original = matchedWords[i++] || correctWord;
                    return `<strong style="color: orange;">${original}</strong>`;
                });
            });

            applyCurrentSort?.();
            document.querySelectorAll('.sen-option').forEach(b => {
                b.disabled = true;
                const bText = b.textContent.trim().toLowerCase();
                const correctText = correctWord.toLowerCase();

                if (bText === correctText) b.classList.add('correct');
                if (b === btn && bText !== correctText) b.classList.add('incorrect');
            });

            setTimeout(() => {
                senCurrent++;
                showNextSentence();
            }, 3000);
        };
    });
}

function updateCardByText(wordText, delta) {
    const card = [...document.querySelectorAll('.card')].find(c =>
        c.querySelector('.word')?.textContent.trim().toLowerCase() === wordText.toLowerCase()
    );
    if (card) updateCardProgress(card, delta);
}

function showSentenceResult() {
    const game = document.getElementById('senGame');
    game.innerHTML = `
        <h3>შედეგები</h3>
        <p>სწორი პასუხები: ${senCorrect} / ${senCards.length}</p>
    `;
}

function shuffleArray(arr) {
    return [...arr].sort(() => 0.5 - Math.random());
}

function incrementStat(key, amount) {
    const val = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, val + amount);
}

document.addEventListener('DOMContentLoaded', () => {
    const tabBtn = document.querySelector('[data-tab="tab6"]');
    if (tabBtn) {
        tabBtn.addEventListener('click', initSentenceGame);
    }
});
