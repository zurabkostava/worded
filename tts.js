// ==== tts.js ====

const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;
let isSpeaking = false;
let lastSpokenButton = null;

const allowedVoicesEnglish = [
    "Microsoft AndrewMultilingual Online (Natural) - English (United States)",
    "Microsoft AvaMultilingual Online (Natural) - English (United States)",
    "Microsoft BrianMultilingual Online (Natural) - English (United States)",
    "Microsoft EmmaMultilingual Online (Natural) - English (United States)",
    "Microsoft Libby Online (Natural) - English (United Kingdom)",
    "Microsoft Maisie Online (Natural) - English (United Kingdom)",
    "Microsoft Ryan Online (Natural) - English (United Kingdom)",
    "Microsoft Sonia Online (Natural) - English (United Kingdom)",
    "Microsoft Thomas Online (Natural) - English (United Kingdom)",
    "Microsoft Ana Online (Natural) - English (United States)"
];

const allowedVoicesGeorgian = [
    "Microsoft Giorgi Online (Natural) - Georgian (Georgia)",
    "Microsoft Eka Online (Natural) - Georgian (Georgia)",
    "Microsoft AndrewMultilingual Online (Natural) - English (United States)",
    "Microsoft AvaMultilingual Online (Natural) - English (United States)",
    "Microsoft BrianMultilingual Online (Natural) - English (United States)",
    "Microsoft EmmaMultilingual Online (Natural) - English (United States)"
];

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadSpeechRates() {
    const englishRateSlider = document.getElementById('englishRateSlider');
    const georgianRateSlider = document.getElementById('georgianRateSlider');

    englishRateSlider.value = localStorage.getItem(ENGLISH_RATE_KEY) || 1;
    georgianRateSlider.value = localStorage.getItem(GEORGIAN_RATE_KEY) || 1;
}

function populateVoiceDropdown() {
    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '';

    const stored = localStorage.getItem(VOICE_STORAGE_KEY);
    let fallbackSelected = false;

    // 👉 შევამოწმოთ პირველი ხმით მაინც თუ არსებობს Microsoft-ი
    const allowed = voices.filter(v => allowedVoicesEnglish.includes(v.name));
    const listToUse = allowed.length ? allowed : voices; // fallback: use all voices

    listToUse.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = voice.name;
        if (stored === voice.name) {
            option.selected = true;
            selectedVoice = voice;
            fallbackSelected = true;
        }
        voiceSelect.appendChild(option);
    });

    // თუ არჩეული არ მოიძებნა, ავირჩიოთ პირველი ხელმისაწვდომი
    if (!fallbackSelected && listToUse.length > 0) {
        selectedVoice = listToUse[0];
        localStorage.setItem(VOICE_STORAGE_KEY, selectedVoice.name);
    }
}

function loadVoicesWithRetry(retries = 10, interval = 300) {
    let attempts = 0;

    function tryLoad() {
        const voices = speechSynthesis.getVoices();
        if (voices.length) {
            populateVoiceDropdown();       // English
            populateGeorgianDropdown();   // Georgian
            return;
        }

        attempts++;
        if (attempts < retries) {
            setTimeout(tryLoad, interval);
        } else {
            console.warn("⚠️ ხმების ჩატვირთვა ვერ მოხერხდა Android-ზე.");
        }
    }

    tryLoad();
}




function populateGeorgianDropdown() {
    const voices = speechSynthesis.getVoices();
    const geoSelect = document.getElementById('georgianVoiceSelect');
    geoSelect.innerHTML = '';

    const stored = localStorage.getItem(GEORGIAN_VOICE_KEY);
    let fallbackSelected = false;

    const allowed = voices.filter(v => allowedVoicesGeorgian.includes(v.name));
    const listToUse = allowed.length ? allowed : voices.filter(v => v.lang.startsWith('ka') || v.name.toLowerCase().includes('eka') || v.name.toLowerCase().includes('giorgi'));

    listToUse.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = voice.name;
        if (stored === voice.name) {
            option.selected = true;
            selectedGeorgianVoice = voice;
            fallbackSelected = true;
        }
        geoSelect.appendChild(option);
    });

    if (!fallbackSelected && listToUse.length > 0) {
        selectedGeorgianVoice = listToUse[0];
        localStorage.setItem(GEORGIAN_VOICE_KEY, selectedGeorgianVoice.name);
    }
}

function loadVoices() {
    const voices = speechSynthesis.getVoices();
    populateVoiceDropdown();
    populateGeorgianDropdown();

    const storedVoice = localStorage.getItem(VOICE_STORAGE_KEY);
    selectedVoice = voices.find(v => v.name === storedVoice);

    const storedGeo = localStorage.getItem(GEORGIAN_VOICE_KEY);
    selectedGeorgianVoice = voices.find(v => v.name === storedGeo);
}

function loadVoicesWithDelay(retry = 0) {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0 || retry >= 10) {
        loadVoices();
        return;
    }
    setTimeout(() => loadVoicesWithDelay(retry + 1), 200);
}

speechSynthesis.onvoiceschanged = loadVoices;

function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!window.speechSynthesis || !voiceObj) return;

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
    delay(100).then(async () => {
        if (highlightEl) highlightEl.classList.add('highlighted-sentence');
        await speak(text, highlightEl);
        if (extraText) {
            await delay(50);
            await speak(extraText);
        }
        if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
        if (buttonEl) buttonEl.classList.remove('active');
        lastSpokenButton = null;
    });
}

document.addEventListener('click', (e) => {
    const speakBtn = e.target.closest('.speak-btn');
    if (!speakBtn) return;

    e.stopPropagation();

    const text = speakBtn.dataset.text || speakBtn.dataset.word;
    const extraText = speakBtn.dataset.extra || null;
    const lang = speakBtn.dataset.lang;

    if (lang === 'ka') {
        speakWithVoice(text, selectedGeorgianVoice, speakBtn, extraText);
    } else {
        speakWithVoice(text, selectedVoice, speakBtn);
    }
});
