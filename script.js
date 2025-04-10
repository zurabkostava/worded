//script.js
// ==== აქ შეგროვებულია ყველა DOM ელემენტი ====
const addCardBtn = document.getElementById('addCardBtn');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
const cancelSelectionBtn = document.getElementById('cancelSelectionBtn');
const modalOverlay = document.getElementById('modalOverlay');
const cancelBtn = document.getElementById('cancelBtn');
const saveCardBtn = document.getElementById('saveCardBtn');
const cardContainer = document.getElementById('cardContainer');

const wordInput = document.getElementById('wordInput');
const mainTranslationInput = document.getElementById('mainTranslationInput');
const addMainTranslationBtn = document.getElementById('addMainTranslationBtn');
const mainTranslationTags = document.getElementById('mainTranslationTags');
const extraTranslationInput = document.getElementById('extraTranslationInput');
const addExtraTranslationBtn = document.getElementById('addExtraTranslationBtn');
const extraTranslationTags = document.getElementById('extraTranslationTags');

const tagInput = document.getElementById('tagInput');
const addTagBtn = document.getElementById('addTagBtn');
const tagList = document.getElementById('tagList');
const tagDropdown = document.getElementById('tagDropdown');

const tagLibraryBtn = document.getElementById('tagLibraryBtn');
const tagLibraryModal = document.getElementById('tagLibraryModal');
const closeTagLibraryBtn = document.getElementById('closeTagLibraryBtn');
const tagListContainer = document.getElementById('tagListContainer');

const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebar = document.getElementById('sidebar');
const sidebarTagList = document.getElementById('sidebarTagList');

const searchInput = document.getElementById('searchInput');
const selectAllBtn = document.getElementById('selectAllBtn');

const englishSentencesInput = document.getElementById('englishSentences');
const georgianSentencesInput = document.getElementById('georgianSentences');


const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const voiceSelect = document.getElementById('voiceSelect');
const saveVoiceBtn = document.getElementById('saveVoiceBtn');


const prevBtn = document.querySelector('.player .fa-backward-step').closest('button');
const nextBtn = document.querySelector('.player .fa-forward-step').closest('button');
const mobileSidebarBtn = document.getElementById('mobileSidebarBtn');
mobileSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    activeFilterTags.clear(); // ავტომატურად წავშალოთ ფილტრი
    renderSidebarTags();
    filterCardsByTags(); // ბარათებიც განულდეს
});



// ... სადღაც ზედა ნაწილში გამოვიყვანოთ ელემენტები:
const statsBtn = document.getElementById('statsBtn');
const statsModal = document.getElementById('statsModal');
const closeStatsBtn = document.getElementById('closeStatsBtn');


// შემდეგ სადღაც DOMContentLoaded ან გარეთვე:
statsBtn.onclick = () => {
    // 1. შევაგროვოთ სტატისტიკა
    updateStatsModal();

    // 2. გავხსნათ მოდალი
    statsModal.style.display = 'flex';
};

closeStatsBtn.onclick = () => {
    statsModal.style.display = 'none';
};

function updateStatsModal() {
    // 1) საერთო სიტყვების რაოდენობა
    const allCards = document.querySelectorAll('.card');
    const totalWords = allCards.length;

    // 2) mastered words – progress >= 100
    let masteredCount = 0;
    let totalProgress = 0;

    allCards.forEach(card => {
        const prog = parseFloat(card.dataset.progress || '0');
        if (prog >= 100) {
            masteredCount++;
        }
        totalProgress += prog;
    });

    // 3) საშუალო პროგრესი
    const avgProgress = totalWords > 0
        ? (totalProgress / totalWords).toFixed(1)
        : 0;

    // 4) „გავლილი ტესტირება (სულ)“ – თუ არ გვიჭირავს არც ერთ Card-ზე.
    //   ვთქვათ, შევინახავთ localStorage-ში
    //   ან card.dataset.tests ამჟამად არ გვაქვს.
    const totalTests = parseInt(localStorage.getItem('TOTAL_TESTS') || '0');
    // თუ გინდა სულაც 0 იყოს

    // 5) სწორი vs არასწორი (თუ არ გაქვს დაგროვებული, შეგვიძლია ასევე localStorage-ში.)
    const totalCorrect = parseInt(localStorage.getItem('TOTAL_CORRECT') || '0');
    const totalWrong = parseInt(localStorage.getItem('TOTAL_WRONG') || '0');
    const totalAnswers = totalCorrect + totalWrong;
    let correctPercent = 0, wrongPercent = 0;
    if (totalAnswers > 0) {
        correctPercent = ((totalCorrect / totalAnswers) * 100).toFixed(1);
        wrongPercent = ((totalWrong / totalAnswers) * 100).toFixed(1);
    }

    // ახლა ჩანერგე html-ში
    document.getElementById('statsTotalWords').textContent = totalWords;
    document.getElementById('statsMastered').textContent = masteredCount;
    document.getElementById('statsTotal2').textContent = totalWords;
    document.getElementById('statsAvgProgress').textContent = avgProgress;
    document.getElementById('statsTests').textContent = totalTests;
    document.getElementById('statsCorrectWrong').textContent =
        `${totalCorrect} - ${totalWrong}  (${correctPercent}% - ${wrongPercent}%)`;
}

document.getElementById('resetStatsBtn')?.addEventListener('click', () => {
    if (!confirm("ნამდვილად გსურს სტატისტიკისა და პროგრესის განულება?")) return;

    // 📤 სტატისტიკის გასუფთავება
    localStorage.removeItem('TOTAL_TESTS');
    localStorage.removeItem('TOTAL_CORRECT');
    localStorage.removeItem('TOTAL_WRONG');

    // 📤 თითოეული ქარდის progress-ის განულება
    document.querySelectorAll('.card').forEach(card => {
        card.dataset.progress = '0';
        if (progress >= 100) {
            card.classList.add('mastered');
        }

        const progressBar = card.querySelector('.progress-bar');
        const progressLabel = card.querySelector('.progress-label');

        if (progressBar) progressBar.style.width = '0%';
        if (progressLabel) progressLabel.textContent = '0%';

        // მოაშორე mastered კლასიც
        card.classList.remove('mastered');
    });

    // 💾 შენახვა
    saveToStorage?.();

    // 🔁 სტატისტიკის მოდალის განახლება რეალურ დროში
    updateStatsModal?.();

    // თუ გაქვს ცალკე UI-ს გასაახლებელი ფუნქცია (progress bar display-ზე)
    updateStatsUI?.();
});



function getGlobalTrainingSettings() {
    const tag = document.getElementById('globalTagSelect')?.value || '';
    const count = parseInt(document.getElementById('globalQuestionCount')?.value || '10');
    const reverse = document.getElementById('globalReverseToggle')?.checked || false;
    const hideMastered = document.getElementById('hideMasteredToggle')?.checked || false;

    return { tag, count, reverse, hideMastered };
}



function populateGlobalTags() {
    const select = document.getElementById('globalTagSelect');
    if (!select) return;

    const tagSet = new Set();

    document.querySelectorAll('.card').forEach(card => {
        card.querySelectorAll('.card-tag').forEach(tagEl => {
            const tag = tagEl.textContent.replace('#', '').trim();
            if (tag) tagSet.add(tag);
        });
    });

    select.innerHTML = '<option value="">ყველა</option>';
    [...tagSet].sort().forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag;
        opt.textContent = tag;
        select.appendChild(opt);
    });
}


document.addEventListener('DOMContentLoaded', populateGlobalTags);



function getVisibleCards() {
    const hideMastered = document.getElementById('hideMasteredToggle')?.checked;
    return [...document.querySelectorAll('.card')].filter(c => {
        const visible = c.style.display !== 'none';
        const mastered = parseFloat(c.dataset.progress || '0') >= 100;
        return visible && (!hideMastered || !mastered);
    });
}




const englishRateSlider = document.getElementById('englishRateSlider');
const georgianRateSlider = document.getElementById('georgianRateSlider');




nextBtn.onclick = async () => {
    const cards = getVisibleCards();
    if (cards.length === 0) return;

    if (shuffleMode) {
        if (playedIndices.length >= cards.length) return;
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * cards.length);
        } while (playedIndices.includes(nextIndex));
        currentCardIndex = nextIndex;
        playedIndices.push(currentCardIndex);
    } else {
        // იპოვე მიმდინარე ქარდი და შემდეგზე გადადი
        const currentCard = document.querySelector('.card.playing');
        const indexInVisible = cards.indexOf(currentCard);
        if (indexInVisible === -1 || indexInVisible >= cards.length - 1) return;

        currentCardIndex = indexInVisible + 1;
    }

    const card = cards[currentCardIndex];

    document.querySelectorAll('.card').forEach(c => c.classList.remove('playing'));
    card.classList.add('playing');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (!previewManuallyClosed && isPlaying) {
        loadCardIntoModal(card);
    }
    speechSynthesis.cancel();

    if (isPlaying) {
        await speakPreviewCard(card);
        if (!shuffleMode) currentCardIndex++;
        startAutoPlay();
    }
};


prevBtn.onclick = async () => {
    const cards = getVisibleCards();
    if (cards.length === 0) return;

    if (shuffleMode) {
        if (playedIndices.length <= 1) return;
        playedIndices.pop(); // წაშალე მიმდინარე
        currentCardIndex = playedIndices[playedIndices.length - 1];
    } else {
        const currentCard = document.querySelector('.card.playing');
        const indexInVisible = cards.indexOf(currentCard);
        if (indexInVisible <= 0) return;

        currentCardIndex = indexInVisible - 1;
    }

    const card = cards[currentCardIndex];

    document.querySelectorAll('.card').forEach(c => c.classList.remove('playing'));
    card.classList.add('playing');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (!previewManuallyClosed && isPlaying) {
        loadCardIntoModal(card);
    }
    speechSynthesis.cancel();

    if (isPlaying) {
        await speakPreviewCard(card);
        if (!shuffleMode) currentCardIndex++;
        startAutoPlay();
    }
};





async function speakPreviewCard(card) {
    if (!card) return;

    const word = card.querySelector('.word').textContent;
    const translationEl = card.querySelector('.translation');
    const mainPart = translationEl.childNodes[0]?.textContent?.trim() || '';
    const extraPart = translationEl.querySelector('.extra')?.textContent?.trim() || '';

    const en = JSON.parse(card.dataset.english || '[]');
    const ge = JSON.parse(card.dataset.georgian || '[]');

    await delay(500);
    const previewWordEl = document.getElementById('previewWord');
    await speakWithVoice(word, selectedVoice, null, null, previewWordEl);
    updateCardProgress(card, 0.2);
    applyCurrentSort?.();

    const previewTranslationEl = document.getElementById('previewTranslation');
    await speakWithVoice(mainPart, selectedGeorgianVoice, null, extraPart, previewTranslationEl);

    for (let i = 0; i < Math.max(en.length, ge.length); i++) {
        if (en[i]) {
            const enEl = document.querySelectorAll('#previewEnglishSentences p')[i];
            await speakWithVoice(en[i], selectedVoice, null, null, enEl);
        }
        if (ge[i]) {
            const geEl = document.querySelectorAll('#previewGeorgianSentences p')[i];
            await speakWithVoice(ge[i], selectedGeorgianVoice, null, null, geEl);
        }
    }
}

document.getElementById('showTopBtn').addEventListener('click', () => {
    document.querySelector('.top').classList.toggle('show');
});


// 👆 Call on settings open
settingsBtn.onclick = () => {
    populateVoiceDropdown();
    loadSpeechRates();
    settingsModal.style.display = 'flex';
};

closeSettingsBtn.onclick = () => {
    settingsModal.style.display = 'none';
};

// 💾 Save slider values
saveVoiceBtn.onclick = () => {
    const selected = voiceSelect.value;
    localStorage.setItem(VOICE_STORAGE_KEY, selected);
    selectedVoice = speechSynthesis.getVoices().find(v => v.name === selected);

    const geoSelected = georgianVoiceSelect.value;
    localStorage.setItem(GEORGIAN_VOICE_KEY, geoSelected);
    selectedGeorgianVoice = speechSynthesis.getVoices().find(v => v.name === geoSelected);

    // 👇 Save rates
    localStorage.setItem(ENGLISH_RATE_KEY, englishRateSlider.value);
    localStorage.setItem(GEORGIAN_RATE_KEY, georgianRateSlider.value);

    settingsModal.style.display = 'none';
};







const TEXTAREA_STORAGE_KEY = 'sentence_textareas_data';

// შენახვა ავტომატურად როცა იწერება
function saveTextareaToLocalStorage() {
    const data = {
        english: englishSentencesInput.value,
        georgian: georgianSentencesInput.value
    };
    localStorage.setItem(TEXTAREA_STORAGE_KEY, JSON.stringify(data));
}

englishSentencesInput.addEventListener('input', saveTextareaToLocalStorage);
georgianSentencesInput.addEventListener('input', saveTextareaToLocalStorage);




function setupSmartNumbering(textarea) {
    textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();

            const lines = textarea.value.split('\n');
            const currentLineIndex = textarea.selectionStart === 0
                ? 0
                : textarea.value.substr(0, textarea.selectionStart).split('\n').length - 1;

            const currentLines = textarea.value.split('\n');
            const nextNumber = currentLines.length + 1;
            const before = textarea.value.substring(0, textarea.selectionStart);
            const after = textarea.value.substring(textarea.selectionStart);

            const prefix = `${nextNumber}. `;
            textarea.value = before + '\n' + prefix + after;

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = before.length + prefix.length + 1;
            }, 0);
        }
    });

    textarea.addEventListener('focus', () => {
        const lines = textarea.value.split('\n');
        if (lines.length > 0 && !/^\d+\.\s/.test(lines[0])) {
            lines[0] = '1. ' + lines[0].replace(/^\d+\.\s*/, '');
            textarea.value = lines.join('\n');
        }
    });
}

setupSmartNumbering(document.getElementById('englishSentences'));
setupSmartNumbering(document.getElementById('georgianSentences'));



selectAllBtn.onclick = () => {
    const visibleCards = [...document.querySelectorAll('.card')]
        .filter(card => card.style.display !== 'none');

    visibleCards.forEach(card => card.classList.add('selected'));

    selectionMode = true;
    updateSelectionUI();
};




// ==== აპის მდგომარეობის ცვლადები ====
let isEditing = false;
let editingCard = null;
let mainTranslations = [];
let extraTranslations = [];
let tags = [];
let allTags = new Set();

let selectionMode = false;
let longPressTimer = null;
let wasLongPress = false;
let activeFilterTags = new Set();
let currentCardIndex = -1;
const sortSelect = document.getElementById('sortSelect');
let currentSortMode = 'progress'; // ახლა default-ად progress
let isPlaying = false;
let stopRequested = false;
let shuffleMode = false;
let playedIndices = [];
let previewManuallyClosed = false;
let sortOrder = 'asc'; // 'asc' ან 'desc'
let touchStartX = 0;
let touchEndX = 0;
const shuffleBtn = document.querySelector('.player .fa-shuffle').closest('button');



const previewModal = document.getElementById('cardPreviewModal');

previewModal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

previewModal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
});

function handleSwipeGesture() {
    const threshold = 50; // მინიმალური დისტანცია swipe-ისთვის

    if (touchEndX - touchStartX > threshold) {
        // 👉 Swipe right (წინა სიტყვა)
        document.getElementById('prevCardBtn').click();
    } else if (touchStartX - touchEndX > threshold) {
        // 👈 Swipe left (შემდეგი სიტყვა)
        document.getElementById('nextCardBtn').click();
    }
}

shuffleBtn.onclick = () => {
    shuffleMode = !shuffleMode;
    shuffleBtn.classList.toggle('active', shuffleMode);

    // როცა shuffle ირთვება თავიდან ვიწყებთ
    if (shuffleMode) {
        playedIndices = [];
    } else {
        // 🔄 თუ shuffle გამოირთო და previewModal ღიაა — გადავიდეთ შემდეგზე ჩვეულებრივად
        const modalVisible = document.getElementById('cardPreviewModal').style.display === 'flex';
        if (modalVisible) {
            const cards = getVisibleCards();
            if (currentCardIndex < cards.length - 1) {
                currentCardIndex++;
                loadCardIntoModal(cards[currentCardIndex]);
            }
        }
    }
};


sortSelect.addEventListener('change', () => {
    currentSortMode = sortSelect.value;
    sortCards();
});

function sortCards() {
    const cards = [...document.querySelectorAll('.card')];

    cards.sort((a, b) => {
        let valA, valB;

        if (currentSortMode === 'alphabetical') {
            valA = a.querySelector('.word').textContent.trim().toLowerCase();
            valB = b.querySelector('.word').textContent.trim().toLowerCase();
        } else if (currentSortMode === 'updated') {
            valA = parseInt(a.dataset.updated || 0);
            valB = parseInt(b.dataset.updated || 0);
        } else if (currentSortMode === 'progress') {
            valA = parseFloat(a.dataset.progress || 0);
            valB = parseFloat(b.dataset.progress || 0);
        }


        const result = valA > valB ? 1 : valA < valB ? -1 : 0;
        return sortOrder === 'asc' ? result : -result;
    });

    cards.forEach(card => cardContainer.appendChild(card));

}
function applyCurrentSort() {
    sortCards(); // გადაალაგე ქარდები
}


const sortIcon = document.getElementById('sortDirectionIcon');

sortIcon.addEventListener('click', () => {
    sortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
    sortCards();

    // 🧠 Update icon visual direction
    sortIcon.classList.remove('fa-sort-up', 'fa-sort-down');
    sortIcon.classList.add(sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
});



const playBtn = document.querySelector('.player .fa-play').closest('button');
const stopBtn = document.querySelector('.player .fa-stop').closest('button');

playBtn.onclick = () => {
    if (isPlaying) return;
    isPlaying = true;
    stopRequested = false;
    previewManuallyClosed = false; // დაუშვას მოდალის გამოჩენა თავიდან
    playBtn.classList.add('active');
    startAutoPlay().then(() => {
        isPlaying = false;
        playBtn.classList.remove('active');
    });
};



stopBtn.onclick = () => {
    isPlaying = false;
    stopRequested = true;
    playBtn.classList.remove('active');
    speechSynthesis.cancel();

    // ✅ Highlight-ები მოვაშოროთ
    document.querySelectorAll('.card').forEach(c => c.classList.remove('playing'));
    document.querySelectorAll('.highlighted-sentence').forEach(el => el.classList.remove('highlighted-sentence'));
};



async function startAutoPlay() {
    // const cards = [...document.querySelectorAll('.card')];
    const cards = getVisibleCards();
    if (cards.length === 0) return;

    isPlaying = true;
    playBtn.classList.add('active');
    stopRequested = false;

    while (!stopRequested && playedIndices.length < cards.length) {
        if (shuffleMode) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * cards.length);
            } while (playedIndices.includes(nextIndex));

            currentCardIndex = nextIndex;
            playedIndices.push(currentCardIndex);
        } else {
            if (currentCardIndex === -1 || currentCardIndex >= cards.length) {
                currentCardIndex = 0;
            }
        }

        const card = cards[currentCardIndex];

        // Highlight მიმდინარე ქარდი
        document.querySelectorAll('.card').forEach(c => c.classList.remove('playing'));
        card.classList.add('playing');

        if (!previewManuallyClosed) {
            loadCardIntoModal(card); // მოდალი მხოლოდ მაშინ იხსნება თუ არ დაუხურავს მომხმარებელს
        }
        await delay(300);
        await speakPreviewCard(card);

        await delay(500);

        if (!shuffleMode) currentCardIndex++;
    }

    isPlaying = false;
    playBtn.classList.remove('active');
}




const STORAGE_KEY = 'english_cards_app';






// ==== ღილაკებზე ქმედებები ====
addCardBtn.onclick = () => {
    resetModal(); // ✅ ყოველი დამატების დროს მოდალი დაისუფთავოს
    modalOverlay.style.display = 'flex';
};

cancelBtn.onclick = resetModal;
deleteSelectedBtn.onclick = () => {
    document.querySelectorAll('.card.selected').forEach(card => card.remove());
    selectionMode = false;
    updateSelectionUI();
    saveToStorage();
};
cancelSelectionBtn.onclick = () => {
    document.querySelectorAll('.card.selected').forEach(card => card.classList.remove('selected'));
    selectionMode = false;
    updateSelectionUI();
};

tagLibraryBtn.onclick = () => {
    tagLibraryModal.style.display = 'flex';
    renderTagLibrary();
};
closeTagLibraryBtn.onclick = () => tagLibraryModal.style.display = 'none';

toggleSidebarBtn.onclick = () => {
    sidebar.classList.toggle('active');
    renderSidebarTags();
};
closeSidebarBtn.onclick = () => {
    sidebar.classList.remove('active');
};




// ==== გადმოტვირთვა localStorage-დან ====
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closePreviewBtn');
    const previewModal = document.getElementById('cardPreviewModal');
    const stored = localStorage.getItem(TEXTAREA_STORAGE_KEY);
    const btn = document.getElementById("downloadTemplateBtn");
    if (quizTab) {
        createQuizUI();
        populateQuizTags();
    }
    if (btn) {
        btn.addEventListener("click", () => {
            const templateData = [
                ["Word", "MainTranslations", "ExtraTranslations", "Tags", "EnglishSentences", "GeorgianSentences"]
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(templateData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

            XLSX.writeFile(workbook, "template.xlsx");
        });
    }

    loadVoices();
    loadVoicesWithDelay(); // <-- ახალი ფუნქცია

    if (stored) {
        const data = JSON.parse(stored);
        englishSentencesInput.value = data.english || '';
        georgianSentencesInput.value = data.georgian || '';
    }
    if (closeBtn && previewModal) {
        closeBtn.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('speak-btn')) {
            e.stopPropagation();
            const text = e.target.dataset.text || e.target.dataset.word;
            const extraText = e.target.dataset.extra || null;
            const lang = e.target.dataset.lang;


            if (lang === 'ka') {
                speakWithVoice(text, selectedGeorgianVoice, e.target, extraText);
            } else {
                speakWithVoice(text, selectedVoice, e.target);
            }

        }
    });



    function speakWord(text) {
        if (!window.speechSynthesis) {
            alert('SpeechSynthesis არ არის ხელმისაწვდომი თქვენს ბრაუზერში');
            return;
        }

        // 1. გავაუქმოთ ყველა მიმდინარე წაკითხვა
        window.speechSynthesis.cancel();

        // 2. მცირე დაყოვნება, რომ cancel მუშაობდეს სრულად
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);

            if (selectedVoice) {
                utterance.voice = selectedVoice;
                utterance.lang = selectedVoice.lang; // სავალდებულოა, თორემ default-ით წაიკითხავს ხელახლა
            } else {
                utterance.lang = 'en-GB';
            }

            // 3. გავუშვათ წაკითხვა
            window.speechSynthesis.speak(utterance);
        }, 150); // მცირე დაყოვნება (~150ms) რომ თავიდან აირიდო ორმაგი ხმა
    }




    document.addEventListener('click', e => {
        if (e.target.classList.contains('card-tag')) {
            const tag = e.target.textContent.replace('#', '');

            if (activeFilterTags.has(tag)) {
                activeFilterTags.delete(tag);
            } else {
                activeFilterTags.add(tag);
            }

            renderSidebarTags();
            filterCardsByTags();
        }
    });

    loadCardsFromStorage();
    sortCards();
    // აჩვენე სწორი აიკონის მიმართულება page-ის ჩატვირთვისას
    if (sortIcon) {
        sortIcon.classList.remove('fa-sort-up', 'fa-sort-down');
        sortIcon.classList.add(sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
    }


    document.addEventListener('click', function(e) {
        const tagInputFocused = tagInput.contains(e.target);
        const dropdownFocused = tagDropdown.contains(e.target);

        if (!tagInputFocused && !dropdownFocused) {
            tagDropdown.style.display = 'none';
        }
    });
    tagInput.addEventListener('blur', () => {
        setTimeout(() => {
            tagDropdown.style.display = 'none';
        }, 200); // ოდნავი დაყოვნება – რომ არჩევა მოესწროს
    });

    const toggleBtn = document.getElementById("toggleDarkModeBtn");

    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");

        // შეცვალე აიკონი (optional)
        toggleBtn.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
    });

// ტემის გახსენება ჩატვირთვისას
    window.addEventListener("DOMContentLoaded", () => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark");
            toggleBtn.innerHTML = `<i class="fas fa-sun"></i>`;
        }
    });

    document.addEventListener('mousedown', function (e) {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('toggleSidebarBtn');

        const clickedInsideSidebar = sidebar.contains(e.target);
        const clickedToggleBtn = toggleBtn.contains(e.target);

        if (!clickedInsideSidebar && !clickedToggleBtn) {
            sidebar.classList.remove('active');
        }
    });

    const script = document.createElement('script');
    script.src = 'typegame.js';
    script.onload = () => {
        const typingTab = document.querySelector('[data-tab-content="tab5"]');
        if (typingTab) showTypingUI?.();
    };
    document.body.appendChild(script);


    populateGlobalTags();



});

// Show modal
document.getElementById('trainingBtn').addEventListener('click', () => {
    document.getElementById('trainingModal').classList.remove('hidden');
});

// Close modal
document.querySelector('.training-close').addEventListener('click', () => {
    document.getElementById('trainingModal').classList.add('hidden');
});

// Switch tabs
document.querySelectorAll('.training-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Tab UI
        document.querySelectorAll('.training-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Tab content
        const selected = tab.dataset.tab;
        document.querySelectorAll('.training-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.querySelector(`[data-tab-content="${selected}"]`).classList.remove('hidden');
    });
});





// ==== თარგმანების დამატება ====
addMainTranslationBtn.onclick = () => addTranslation(mainTranslationInput, mainTranslations, mainTranslationTags);
addExtraTranslationBtn.onclick = () => addTranslation(extraTranslationInput, extraTranslations, extraTranslationTags);
mainTranslationInput.addEventListener('keypress', e => { if (e.key === 'Enter') addMainTranslationBtn.click(); });
extraTranslationInput.addEventListener('keypress', e => { if (e.key === 'Enter') addExtraTranslationBtn.click(); });

function addTranslation(inputEl, list, container) {
    const val = inputEl.value.trim();
    if (val && !list.includes(val)) {
        list.push(val);
        renderTags(container, list, list, true);
        inputEl.value = '';
    }
}

// ==== Tag Dropdown ფუნქციონალი ====
tagInput.addEventListener('focus', () => showTagDropdown(''));
tagInput.addEventListener('input', () => {
    const value = tagInput.value.trim().toLowerCase();
    showTagDropdown(value);
});
tagInput.addEventListener('keypress', e => { if (e.key === 'Enter') addTagBtn.click(); });
addTagBtn.onclick = () => {
    const val = tagInput.value.trim();
    if (val && !tags.includes(val)) {
        tags.push(val);
        allTags.add(val);
        renderTags(tagList, tags, tags, false);
        tagInput.value = '';
        tagDropdown.style.display = 'none';
    }
};

function showTagDropdown(filterValue) {
    const matches = [...allTags].filter(tag =>
        tag.toLowerCase().includes(filterValue)
    );

    tagDropdown.innerHTML = '';
    tagDropdown.style.display = matches.length ? 'block' : 'none';

    matches.forEach(tag => {
        const div = document.createElement('div');
        div.textContent = tag;

        if (tags.includes(tag)) {
            div.style.opacity = '0.5';
            div.style.pointerEvents = 'none';
            div.style.fontStyle = 'italic';
            div.textContent += ' ✓';
        } else {
            div.onclick = () => {
                tags.push(tag);
                renderTags(tagList, tags, tags, false);
                tagInput.value = '';
                tagDropdown.style.display = 'none';
            };
        }

        tagDropdown.appendChild(div);
    });
}

// ==== Tag Library CRUD ====
function renderTagLibrary() {
    tagListContainer.innerHTML = '';
    [...allTags].forEach(tag => {
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.value = tag;

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'შენახვა';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'წაშლა';
        deleteBtn.style.background = '#dc3545';
        deleteBtn.style.color = '#fff';

        saveBtn.onclick = () => {
            const newVal = input.value.trim();
            if (!newVal || newVal === tag) return;

            // 🔁 ჩაანაცვლე `allTags`
            allTags.delete(tag);
            allTags.add(newVal);

            // 🔁 განაახლე ყველა ბარათი
            document.querySelectorAll('.card').forEach(card => {
                card.querySelectorAll('.tags span').forEach(span => {
                    if (span.textContent === `#${tag}`) span.textContent = `#${newVal}`;
                });
            });

            saveToStorage();
            renderTagLibrary();
        };

        deleteBtn.onclick = () => {
            // ✅ წავშალოთ მხოლოდ ბიბლიოთეკიდან
            allTags.delete(tag);

            // ✅ ბარათებიდან კი უბრალოდ მოვაშოროთ ვიზუალურად
            document.querySelectorAll('.card').forEach(card => {
                card.querySelectorAll('.tags span').forEach(span => {
                    if (span.textContent === `#${tag}`) span.remove();
                });
            });

            saveToStorage();
            renderTagLibrary();
        };

        li.appendChild(input);
        li.appendChild(saveBtn);
        li.appendChild(deleteBtn);
        tagListContainer.appendChild(li);
    });
}


document.getElementById('addNewTagBtn').onclick = () => {
    const val = document.getElementById('newTagInput').value.trim();
    if (val && !allTags.has(val)) {
        allTags.add(val);
        document.getElementById('newTagInput').value = '';
        renderTagLibrary();
        saveToStorage();
    }
};

// ==== Sidebar Tag Filter ====
function renderSidebarTags() {
    sidebarTagList.innerHTML = '';
    [...allTags].forEach(tag => {
        const li = document.createElement('li');
        li.textContent = tag;
        if (activeFilterTags.has(tag)) li.classList.add('active');

        li.onclick = () => {
            if (activeFilterTags.has(tag)) {
                activeFilterTags.delete(tag);
            } else {
                activeFilterTags.add(tag);
            }
            renderSidebarTags();
            filterCardsByTags();
        };

        sidebarTagList.appendChild(li);
    });
}

function filterCardsByTags() {
    const tagsArray = [...activeFilterTags];

    document.querySelectorAll('.card').forEach(card => {
        const tagSpans = [...card.querySelectorAll('.tags span')];
        const cardTags = tagSpans.map(span => span.textContent.replace('#', ''));

        // OR ლოგიკა
        const matches = tagsArray.some(tag => cardTags.includes(tag)) || tagsArray.length === 0;
        card.style.display = matches ? 'block' : 'none';

        // განვაახლოთ გაფილტრული თეგების სტილი
        tagSpans.forEach(span => {
            const tag = span.textContent.replace('#', '');
            if (tagsArray.includes(tag)) {
                span.classList.add('filtered');
            } else {
                span.classList.remove('filtered');
            }
        });
    });
}








// ==== ძიება ====
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
        const word = card.querySelector('.word').textContent.toLowerCase();
        const translation = card.querySelector('.translation').textContent.toLowerCase();
        const tags = card.querySelector('.tags').textContent.toLowerCase();
        const matches = word.includes(query) || translation.includes(query) || tags.includes(query);
        card.style.display = matches ? 'block' : 'none';
    });
});

// ==== ქარდის CRUD ====
saveCardBtn.onclick = () => {
    const word = wordInput.value.trim();
    if (!word) return;

    const duplicateExists = [...document.querySelectorAll('.card')].some(card => {
        const cardWord = card.querySelector('.word').textContent.trim().toLowerCase();
        return cardWord === word.toLowerCase() && card !== editingCard;
    });
    if (duplicateExists) {
        alert('ასეთი სიტყვა უკვე არსებობს!');
        return;
    }

    const englishSentences = englishSentencesInput.value
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line !== '');

    const georgianSentences = georgianSentencesInput.value
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line !== '');

    const translationHTML = `${mainTranslations.join(', ')}<span class="extra">${extraTranslations.join(', ')}</span>`;
    const tagHTML = tags.map(tag => {
        const color = getColorForTag(tag);
        return `<span class="card-tag" style="background-color: ${color}">#${tag}</span>`;
    }).join('');

    if (isEditing && editingCard) {
        editingCard.querySelector('.word').textContent = word;
        editingCard.querySelector('.translation').innerHTML = translationHTML;
        editingCard.querySelector('.tags').innerHTML = tagHTML;
        editingCard.dataset.english = JSON.stringify(englishSentences);
        editingCard.dataset.georgian = JSON.stringify(georgianSentences);
        editingCard.dataset.updated = Date.now(); // ✅ განახლების დრო

        sortCards(); // ✅ update-ის შემდეგ გადალაგდეს
    } else {
        renderCardFromData({
            word,
            mainTranslations,
            extraTranslations,
            tags,
            englishSentences,
            georgianSentences
        });
    }

    saveToStorage();
    resetModal();
};



function editCard(card) {
    const word = card.querySelector('.word').textContent;
    const translationEl = card.querySelector('.translation');
    const mainPart = translationEl.childNodes[0]?.textContent?.trim();
    const extraPart = translationEl.querySelector('.extra')?.textContent?.trim();

    mainTranslations = mainPart ? mainPart.split(',').map(s => s.trim()) : [];
    extraTranslations = extraPart ? extraPart.split(',').map(s => s.trim()) : [];

    const tagsEl = card.querySelector('.tags');
    tags = [...tagsEl.querySelectorAll('span')].map(s => s.textContent.replace('#', ''));

    const en = JSON.parse(card.dataset.english || '[]');
    const ge = JSON.parse(card.dataset.georgian || '[]');

    englishSentencesInput.value = en.map((s, i) => `${i + 1}. ${s}`).join('\n');
    georgianSentencesInput.value = ge.map((s, i) => `${i + 1}. ${s}`).join('\n');

    wordInput.value = word;
    renderTags(mainTranslationTags, mainTranslations, mainTranslations, true);
    renderTags(extraTranslationTags, extraTranslations, extraTranslations, true);
    renderTags(tagList, tags, tags, false);

    isEditing = true;
    editingCard = card;
    modalOverlay.style.display = 'flex';
}


const englishSentences = englishSentencesInput.value
    .split('\n')
    .map(line => line.replace(/^\\d+\\.\\s*/, '').trim())
    .filter(line => line !== '');

const georgianSentences = georgianSentencesInput.value
    .split('\n')
    .map(line => line.replace(/^\\d+\\.\\s*/, '').trim())
    .filter(line => line !== '');



const tagColors = new Map();

function getColorForTag(tag) {
    const hash = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 80%, 95%)`; // პასტელური
}






// ==== ქარდის რენდერი ====
function renderCardFromData(data) {
    const {
        word,
        mainTranslations,
        extraTranslations,
        tags,
        englishSentences = [],
        georgianSentences = [],
        progress = 0 // ✅ Default to 0%
    } = data;


    const translationHTML = `${mainTranslations.join(', ')}<span class="extra">${extraTranslations.join(', ')}</span>`;
    const tagHTML = tags.map(tag => {
        const color = getColorForTag(tag);
        return `<span class="card-tag" style="background-color: ${color}">#${tag}</span>`;
    }).join('');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-header">
            <div class="card-header">
            <button class="speak-btn" title="წაიკითხე სიტყვა" data-word="${word}"><i class="fas fa-volume-up"></i></button>
                <h2 class="word">${word}</h2>
                
            </div>
            <div class="card-actions">
                <i class="fas fa-edit"></i>
                <i class="fas fa-trash-alt"></i>
            </div>
        </div>
        <p class="translation">${translationHTML}</p>
<div class="tags">${tagHTML}</div>
<div class="progress-bar-container">
    <div class="progress-bar" style="width: ${data.progress || 0}%;"></div>
<span class="progress-label">${(parseFloat(data.progress || 0)).toFixed(1)}%</span>
</div>



    `;
    card.dataset.progress = progress;
    card.dataset.updated = data.updated || Date.now();

    card.dataset.english = JSON.stringify(englishSentences);
    card.dataset.georgian = JSON.stringify(georgianSentences);
    card.dataset.updated = Date.now(); // ✅ შენახვის დრო

    card.querySelector('.fa-edit').onclick = () => editCard(card);
    card.querySelector('.fa-trash-alt').onclick = () => {
        card.remove();
        saveToStorage();
    };

    card.onclick = (e) => {
        if (
            wasLongPress ||
            selectionMode ||
            card.classList.contains('selected') ||
            e.target.classList.contains('card-tag') ||
            e.target.closest('.card-actions') ||
            e.target.classList.contains('speak-btn') ||
            e.target.closest('.speak-btn')
        ) {
            wasLongPress = false;
            return;
        }

        const word = card.querySelector('.word').textContent;
        const mainPart = card.querySelector('.translation').childNodes[0]?.textContent?.trim() || '';
        const extraPart = card.querySelector('.translation .extra')?.textContent?.trim() || '';
        const tags = [...card.querySelectorAll('.tags span')].map(s => s.textContent.replace('#', ''));

        const mainTranslations = mainPart ? mainPart.split(',').map(s => s.trim()) : [];
        const extraTranslations = extraPart ? extraPart.split(',').map(s => s.trim()) : [];

        const en = JSON.parse(card.dataset.english || '[]');
        const ge = JSON.parse(card.dataset.georgian || '[]');

        showCardPreview(word, mainTranslations, extraTranslations, tags, en, ge);
    };

    addLongPressHandlers(card);
    cardContainer.appendChild(card);

    sortCards(); // ✅ რეალურ დროში დალაგება


}


// ==== ღილაკზე მიბმა ====
document.getElementById('syncBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('syncBtn');
    btn.disabled = true;
    btn.textContent = '⏳ სინქრონიზაცია...';
    try {
        await syncToFirestore();
        btn.textContent = '✅ დასრულდა!';
    } catch (e) {
        alert("სინქრონიზაცია ვერ მოხერხდა!");
        btn.textContent = '❌ შეცდომა';
    }
    setTimeout(() => {
        btn.disabled = false;
    }, 2000);
});


document.getElementById('closeAddModalBtn').onclick = () => {
    modalOverlay.style.display = 'none';
};

document.getElementById('closeTagLibraryXBtn').onclick = () => {
    tagLibraryModal.style.display = 'none';
};

// თუ autoplay აქტიურია და ეს მოდალიდან მოდის — მოუმატე პროგრესი
if (isPlaying && highlightEl) {
    const card = document.querySelector('.card.playing');
    if (card) updateCardProgress(card, 0.3);
}

async function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!window.speechSynthesis || !voiceObj) return;

    // 🚫 თუ იმავე ღილაკზე მეორედ დააჭირეს — გავაუქმოთ და მოვაცილოთ highlight-ები
    if (buttonEl && buttonEl === lastSpokenButton && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        if (buttonEl) buttonEl.classList.remove('active');
        if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
        lastSpokenButton = null;

        return;
    }

    lastSpokenButton = buttonEl;

    const speak = (txt, el) => {
        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(txt);
            utterance.voice = voiceObj;
            utterance.lang = voiceObj.lang;

            const rate = (voiceObj.lang === 'ka-GE')
                ? parseFloat(localStorage.getItem(GEORGIAN_RATE_KEY) || 1)
                : parseFloat(localStorage.getItem(ENGLISH_RATE_KEY) || 1);

            utterance.rate = rate;

            if (buttonEl) buttonEl.classList.add('active');
            if (el) el.classList.add('highlighted-sentence');

            utterance.onend = () => {
                if (buttonEl) buttonEl.classList.remove('active');
                if (el) el.classList.remove('highlighted-sentence');
                lastSpokenButton = null;
                resolve();
            };

            speechSynthesis.speak(utterance);
        });
    };

    speechSynthesis.cancel();
    await delay(100);

    if (highlightEl) {
        highlightEl.classList.add('highlighted-sentence');
    }

    if (highlightEl) {
        highlightEl.classList.add('highlighted-sentence');
    }

    await speak(text); // ⛔️ აღარ ვუწვდით highlightEl

    if (extraText) {
        await delay(50);
        await speak(extraText); // ⛔️ აქაც არ ვუწვდით highlightEl
    }

    if (highlightEl) {
        highlightEl.classList.remove('highlighted-sentence');
    }


    if (buttonEl) {
        buttonEl.classList.remove('active');
    }

    lastSpokenButton = null;
}







function speakWord(text, buttonEl) {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
        speechSynthesis.cancel();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
    }

    isSpeaking = true;

    if (buttonEl) {
        buttonEl.classList.add('active');
    }



    // 🔄 ვაკვირდებით როდის დასრულდება საუბარი
    const interval = setInterval(() => {
        if (!speechSynthesis.speaking) {
            clearInterval(interval);
            isSpeaking = false;
            if (buttonEl) {
                buttonEl.classList.remove('active');
            }
        }
    }, 100);
}









function showCardPreview(word, mainTranslations, extraTranslations, tags, englishSentences, georgianSentences) {
    const card = [...document.querySelectorAll('.card')].find(c =>
        c.querySelector('.word').textContent.trim().toLowerCase() === word.toLowerCase()
    );
    if (card) {
        updateCardProgress(card, 0.2);
        applyCurrentSort?.();
    }


    const previewWordEl = document.getElementById('previewWord');
    previewWordEl.innerHTML = `
  ${word}
  <button class="speak-btn" title="წაიკითხე სიტყვა" data-word="${word}">
    <i class="fas fa-volume-up"></i>
  </button>
`;

    const main = mainTranslations.join('; ');
    const extra = extraTranslations.length
        ? `<span class="extra">${extraTranslations.join('; ')}</span>`
        : `<span class="extra" style="visibility: hidden;">placeholder</span>`;


// 💬 ქართულად წამკითხავი ღილაკი
    const geoSpeakBtn = `
    <button class="speak-btn" title="წაიკითხე ქართულად"
    data-text="${mainTranslations.join(', ')}"
    data-extra="${extraTranslations.join(', ')}"
    data-lang="ka">
      <i class="fas fa-volume-up"></i>
    </button>
`;

    document.getElementById('previewTranslation').innerHTML = main + geoSpeakBtn + extra;


    const tagContainer = document.getElementById('previewTags');
    tagContainer.innerHTML = '';
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.textContent = `#${tag}`;
        span.style.backgroundColor = getColorForTag(tag);
        tagContainer.appendChild(span);
    });


    const enBlock = document.getElementById('previewEnglishSentences');
    const geBlock = document.getElementById('previewGeorgianSentences');

    if (enBlock) {
        enBlock.innerHTML = '';
        englishSentences.forEach((s, i) => {
            const p = document.createElement('p');
            p.innerHTML = `<span class="prefix">${i + 1}. </span>${s} <button class="speak-btn" title="Read English" data-text="${s}" data-lang="en"><i class="fas fa-volume-up"></i></button>`;
            enBlock.appendChild(p);
        });

    }

    if (geBlock) {
        geBlock.innerHTML = '';
        georgianSentences.forEach((s, i) => {
            const p = document.createElement('p');
            p.innerHTML = `<span class="prefix">${i + 1}. </span>${s} <button class="speak-btn" title="წაიკითხე ქართულად" data-text="${s}" data-lang="ka"><i class="fas fa-volume-up"></i></button>`;
            geBlock.appendChild(p);
        });

    }

    document.getElementById('cardPreviewModal').style.display = 'flex';
    // ინახავს აქტიური ბარათის ინდექსს
    const allCards = [...document.querySelectorAll('.card')];
    currentCardIndex = allCards.findIndex(c =>
        c.querySelector('.word').textContent.trim().toLowerCase() === word.toLowerCase()
    );
    updateNavButtons();
    const isAutoPlaying = isPlaying;

    document.getElementById('prevCardBtn').style.display = isAutoPlaying ? 'none' : 'inline-block';
    document.getElementById('nextCardBtn').style.display = isAutoPlaying ? 'none' : 'inline-block';
    document.getElementById('shuffleCardBtn').style.display = isAutoPlaying ? 'block' : 'block';


}

document.getElementById('prevCardBtn').onclick = () => {
    const cards = getVisibleCards();
    if (!cards.length) return;

    if (shuffleMode) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * cards.length);
        } while (randomIndex === currentCardIndex); // თავიდან არ აირჩიოს იგივე
        currentCardIndex = randomIndex;
    } else {
        if (currentCardIndex > 0) {
            currentCardIndex--;
        }
    }

    loadCardIntoModal(cards[currentCardIndex]);
};


document.getElementById('nextCardBtn').onclick = () => {
    const cards = getVisibleCards();
    if (!cards.length) return;

    if (shuffleMode) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * cards.length);
        } while (randomIndex === currentCardIndex);
        currentCardIndex = randomIndex;
    } else {
        if (currentCardIndex < cards.length - 1) {
            currentCardIndex++;
        }
    }

    loadCardIntoModal(cards[currentCardIndex]);
};




// --- Modal close logic
document.getElementById('closePreviewBtn').onclick = () => {
    document.getElementById('cardPreviewModal').style.display = 'none';
    previewManuallyClosed = true;

    // ✅ ვაჩერებთ წამკითხველს
    isPlaying = false;
    stopRequested = true;
    playBtn.classList.remove('active');
    speechSynthesis.cancel();

    // 🔄 highlight-ების გაწმენდა
    document.querySelectorAll('.card').forEach(c => c.classList.remove('playing'));
    document.querySelectorAll('.highlighted-sentence').forEach(el => el.classList.remove('highlighted-sentence'));
};


document.getElementById('cardPreviewModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        previewManuallyClosed = true;

        // ✅ Stop
        isPlaying = false;
        stopRequested = true;
        playBtn.classList.remove('active');
        speechSynthesis.cancel();

        document.querySelectorAll('.card').forEach(c => c.classList.remove('playing'));
        document.querySelectorAll('.highlighted-sentence').forEach(el => el.classList.remove('highlighted-sentence'));
    }
});

document.getElementById('clearTagFiltersBtn').onclick = () => {
    activeFilterTags.clear();            // ყველა აქტიური თეგი წაიშალოს
    renderSidebarTags();                 // საიდბარის ვიზუალური განახლება
    filterCardsByTags();                 // ბარათების ფილტრაციის განულება
};


function loadCardIntoModal(card) {

    // წინა highlight გაასუფთავე
    document.getElementById('previewTranslation')?.classList.remove('highlighted-sentence');

    const word = card.querySelector('.word').textContent.trim();
    const translationEl = card.querySelector('.translation');
    const mainPart = translationEl.childNodes[0]?.textContent?.trim() || '';
    const extraPart = translationEl.querySelector('.extra')?.textContent?.trim() || '';
    const tags = [...card.querySelectorAll('.tags span')].map(s => s.textContent.replace('#', ''));

    const en = JSON.parse(card.dataset.english || '[]');
    const ge = JSON.parse(card.dataset.georgian || '[]');

    const mainTranslations = mainPart ? mainPart.split(',').map(s => s.trim()) : [];
    const extraTranslations = extraPart ? extraPart.split(',').map(s => s.trim()) : [];

    showCardPreview(word, mainTranslations, extraTranslations, tags, en, ge);
    updateNavButtons();

}
document.addEventListener('keydown', (e) => {
    const modalVisible = document.getElementById('cardPreviewModal').style.display === 'flex';
    if (!modalVisible) return;

    const cards = getVisibleCards();
    if (!cards.length) return;

    if (shuffleMode) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * cards.length);
        } while (randomIndex === currentCardIndex);
        currentCardIndex = randomIndex;
        loadCardIntoModal(cards[currentCardIndex]);
        return;
    }

    if (e.key === 'ArrowLeft') {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            loadCardIntoModal(cards[currentCardIndex]);
        }
    } else if (e.key === 'ArrowRight') {
        if (currentCardIndex < cards.length - 1) {
            currentCardIndex++;
            loadCardIntoModal(cards[currentCardIndex]);
        }
    }
});





document.getElementById('exportExcelBtn').onclick = () => {
    const cards = [...document.querySelectorAll('.card')].map(card => {
        const word = card.querySelector('.word').textContent.trim();

        const mainText = card.querySelector('.translation').childNodes[0]?.textContent?.trim() || '';
        const extraText = card.querySelector('.translation .extra')?.textContent?.trim() || '';

        const tags = [...card.querySelectorAll('.tags span')]
            .map(s => s.textContent.replace('#', ''))
            .join(', ');

        const englishSentences = JSON.parse(card.dataset.english || '[]').join('\n');
        const georgianSentences = JSON.parse(card.dataset.georgian || '[]').join('\n');

        const progress = parseFloat(card.dataset.progress || '0');

        return {
            Word: word,
            MainTranslations: mainText,
            ExtraTranslations: extraText,
            Tags: tags,
            EnglishSentences: englishSentences,
            GeorgianSentences: georgianSentences,
            Progress: progress + '%'
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(cards);
    worksheet['!cols'] = [
        { wch: 20 },
        { wch: 30 },
        { wch: 30 },
        { wch: 25 },
        { wch: 80 },
        { wch: 80 },
        { wch: 10 }  // Progress column width
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Words");

    XLSX.writeFile(workbook, "english_words_with_progress.xlsx");
};



document.getElementById('importExcelInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (json.length === 0) {
            alert("ცარიელი ფაილია");
            return;
        }

        json.forEach(entry => {
            const word = entry.Word?.trim();
            if (!word) return;

            const mainTranslations = (entry.MainTranslations || '').split(',').map(t => t.trim()).filter(Boolean);
            const extraTranslations = (entry.ExtraTranslations || '').split(',').map(t => t.trim()).filter(Boolean);
            const tags = (entry.Tags || '').split(',').map(t => t.trim()).filter(Boolean);
            const englishLines = (entry.EnglishSentences || '').split(/\r?\n|\|/).map(s => s.trim()).filter(Boolean);
            const georgianLines = (entry.GeorgianSentences || '').split(/\r?\n|\|/).map(s => s.trim()).filter(Boolean);

            // 🟢 დაამატე პროგრესის გადმოწოდება (პროცენტით თუ მოდის, ამოიღე %)
            let progress = 0;
            if (entry.Progress !== undefined) {
                let raw = String(entry.Progress).trim();

                if (raw.endsWith('%')) {
                    raw = raw.slice(0, -1).trim();
                }

                const numeric = parseFloat(raw);

                // თუ 0.0–1.0 შორისაა → დატოვე როგორც არის (e.g. 0.6 → 0.6%)
                // თუ 1-ზე მეტია → აღიქვი როგორც პროცენტი (60 → 60.0%)
                if (!isNaN(numeric)) {
                    progress = numeric > 1 ? parseFloat(numeric.toFixed(1)) : parseFloat((numeric * 100).toFixed(1));
                }
            }


            // ✅ ბიბლიოთეკაში ჩამატება
            tags.forEach(tag => allTags.add(tag));

            const existingCard = [...document.querySelectorAll('.card')].find(card => {
                return card.querySelector('.word').textContent.trim().toLowerCase() === word.toLowerCase();
            });

            if (existingCard) {
                // ✅ განახლება
                existingCard.querySelector('.translation').innerHTML =
                    `${mainTranslations.join(', ')}<span class="extra">${extraTranslations.join(', ')}</span>`;

                existingCard.querySelector('.tags').innerHTML =
                    tags.map(tag => {
                        const color = getColorForTag(tag);
                        return `<span class="card-tag" style="background-color: ${color}">#${tag}</span>`;
                    }).join('');




                existingCard.dataset.english = JSON.stringify(englishLines);
                existingCard.dataset.georgian = JSON.stringify(georgianLines);
                existingCard.dataset.progress = progress;

                const progressBar = existingCard.querySelector('.progress-bar');
                const progressLabel = existingCard.querySelector('.progress-label');

                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                    progressBar.style.backgroundColor = getProgressColor(progress);
                }

                if (progressLabel) {
                    progressLabel.textContent = `${progress.toFixed(1)}%`;
                }

                if (progress >= 100) {
                    existingCard.classList.add('mastered');
                } else {
                    existingCard.classList.remove('mastered');
                }

            } else {


                // ✅ ახალი ქარდის შექმნა
                renderCardFromData({
                    word,
                    mainTranslations,
                    extraTranslations,
                    tags,
                    progress,
                    englishSentences: englishLines,
                    georgianSentences: georgianLines,
                    updatedAt: new Date().toISOString()

                });

            }
        });


// 🔁 ყველა ქარდის ვიზუალური განახლება
        document.querySelectorAll('.card').forEach(updateCardVisuals);

// 🔁 sorting
        sortCards();

// 🔁 sidebar და სხვა UI
        renderSidebarTags();
        populateGlobalTags();
        renderTagLibrary();

// 💾 შენახვა
        saveToStorage();



    };

    reader.readAsArrayBuffer(file);
});




function updateCardVisuals(card) {
    const progress = parseFloat(card.dataset.progress || '0');

    // 1. progress bar
    const progressBar = card.querySelector('.progress-bar');
    const label = card.querySelector('.progress-label');

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.style.backgroundColor = getProgressColor(progress);
    }

    if (label) {
        label.textContent = `${progress.toFixed(1)}%`;
    }

    // 2. mastered კლასი
    if (progress >= 100) {
        card.classList.add('mastered');
    } else {
        card.classList.remove('mastered');
    }

    // 3. თეგების ფერები
    const tagSpans = card.querySelectorAll('.card-tag');
    tagSpans.forEach(span => {
        const tag = span.textContent.replace('#', '').trim();
        const color = getColorForTag(tag);
        span.style.backgroundColor = color;
    });
}



// ==== მონიშვნის რეჟიმი ====
function selectCard(card) {
    card.classList.add('selected');
    selectionMode = true;
    updateSelectionUI();
}
function toggleCardSelection(card) {
    card.classList.toggle('selected');
    updateSelectionUI();
}
function updateSelectionUI() {
    const selected = document.querySelectorAll('.card.selected');
    const anyVisible = document.querySelectorAll('.card:not([style*="display: none"])').length;
    const hasSelected = selected.length > 0;

    // ღილაკების გამოჩენა / დამალვა (უკვე გაქვს მსგავსი)
    deleteSelectedBtn.classList.toggle('visible-button', hasSelected);
    cancelSelectionBtn.classList.toggle('visible-button', hasSelected);
    selectAllBtn.classList.toggle('visible-button', hasSelected && selectionMode && anyVisible);

    // დაემატოს toolbarActions-ის ჩვენება/დამალვა
    const toolbarActions = document.querySelector('.toolbar-actions');
    if (hasSelected) {
        toolbarActions.classList.add('visible');
    } else {
        toolbarActions.classList.remove('visible');
    }

    if (!hasSelected) selectionMode = false;
}





function addLongPressHandlers(card) {
    let pressTimer = null;
    let preventClick = false;

    const longPressDuration = 600; // 600ms

    const onPointerDown = (e) => {
        // ტრადიციული mouse-ისთვის თუ e.button !== 0 -> გასვლა
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        // ლონგ პრესის ტაიმერი
        pressTimer = setTimeout(() => {
            preventClick = true;
            selectionMode = true;
            selectCard(card);
            showCancelButton();
        }, longPressDuration);
    };

    const onPointerUpOrLeave = (e) => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    // Pointer events
    card.addEventListener('pointerdown', onPointerDown);
    card.addEventListener('pointerup', onPointerUpOrLeave);
    card.addEventListener('pointerleave', onPointerUpOrLeave);
    card.addEventListener('pointercancel', onPointerUpOrLeave);

    // თუ user აბრუნებს თითს ან ა.შ.
    card.addEventListener('pointermove', () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    });

    // click
    card.addEventListener('click', (e) => {
        if (preventClick) {
            preventClick = false;
            e.preventDefault();
            return;
        }
        if (selectionMode) {
            toggleCardSelection(card);
        }
    });
}






function showCancelButton() {
    cancelSelectionBtn.style.display = 'inline-block';
    deleteSelectedBtn.style.display = 'inline-block';
}


// ==== Tag-ების ვიზუალური ჩასმა ====
function renderTags(container, list, sourceArray, isTranslation) {
    container.innerHTML = '';
    list.forEach((tag, index) => {
        const span = document.createElement('span');
        if (isTranslation) {
            span.className = list === mainTranslations ? 'main-translation-tag' : 'extra-translation-tag';
        } else {
            span.className = 'tag';
            span.style.backgroundColor = getColorForTag(tag);
        }
        if (!isTranslation) {
            span.style.backgroundColor = getColorForTag(tag);
        }

        span.innerHTML = `${tag} <i class="fas fa-times"></i>`;
        span.querySelector('i').onclick = () => {
            sourceArray.splice(index, 1);
            renderTags(container, list, sourceArray, isTranslation);
        };
        container.appendChild(span);
    });
}


function updateNavButtons() {
    const cards = [...document.querySelectorAll('.card')];

    if (shuffleMode) {
        // Shuffle რეჟიმში — ღილაკები ყოველთვის აქტიურია
        document.getElementById('prevCardBtn').disabled = false;
        document.getElementById('nextCardBtn').disabled = false;
    } else {
        // ჩვეულებრივ რეჟიმში ბლოკი კიდეებზე
        document.getElementById('prevCardBtn').disabled = currentCardIndex <= 0;
        document.getElementById('nextCardBtn').disabled = currentCardIndex >= cards.length - 1;
    }
}



// ==== Reset Modal ====
function resetModal() {
    modalOverlay.style.display = 'none';
    wordInput.value = '';
    mainTranslationInput.value = '';
    extraTranslationInput.value = '';
    tagInput.value = '';
    englishSentencesInput.value = '';  // ცარიელდება
    georgianSentencesInput.value = ''; // ცარიელდება
    mainTranslations = [];
    extraTranslations = [];
    tags = [];
    isEditing = false;
    editingCard = null;
    tagDropdown.style.display = 'none';
    renderTags(mainTranslationTags, [], [], true);
    renderTags(extraTranslationTags, [], [], true);
    renderTags(tagList, [], [], false);
}


// ==== LocalStorage save/load ====
function saveToStorage() {
    const cards = [...document.querySelectorAll('.card')].map(card => {
        const word = card.querySelector('.word').textContent;
        const mainText = card.querySelector('.translation').childNodes[0]?.textContent?.trim();
        const extraText = card.querySelector('.translation .extra')?.textContent?.trim();
        const tagList = [...card.querySelectorAll('.tags span')].map(span => span.textContent.replace('#', ''));

        const englishSentences = JSON.parse(card.dataset.english || '[]');
        const georgianSentences = JSON.parse(card.dataset.georgian || '[]');

        return {
            word,
            mainTranslations: mainText ? mainText.split(',').map(s => s.trim()) : [],
            extraTranslations: extraText ? extraText.split(',').map(s => s.trim()) : [],
            tags: tagList,
            englishSentences,
            georgianSentences,
            progress: parseFloat(card.dataset.progress || 0)

        };
    });

    const data = {
        cards,
        tagLibrary: [...allTags]
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

}

function loadCardsFromStorage() {
    const stored = localStorage.getItem("english_cards_app");
    if (!stored) return;
    const data = JSON.parse(stored);

    // 1. გაწმენდა
    allTags.clear();

    // 2. თუა tagLibrary, ჩავამატოთ `allTags`-ში
    if (data.tagLibrary && data.tagLibrary.length) {
        data.tagLibrary.forEach(tag => allTags.add(tag));
    }

    // 3. შემდეგ გავივლით თითო ბარათს და ვახატავთ
    data.cards.forEach(cardData => {
        // თუ ბარათშია tags, შევიტანოთ allTags-შიც
        if (cardData.tags) {
            cardData.tags.forEach(t => allTags.add(t));
        }
        renderCardFromData(cardData);
    });

    // 4. დაბოლოს, გამოვიძახოთ	renderTagLibrary() – რომ თეგების ბიბლიოტეკაც წარმოიქმნას
    renderTagLibrary();
}

