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

    let hasSelected = false;

    voices
        .filter(v => v.lang.startsWith('en')) // მხოლოდ ინგლისური
        .forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name;
            if (localStorage.getItem(VOICE_STORAGE_KEY) === voice.name) {
                option.selected = true;
                selectedVoice = voice;
                hasSelected = true;
            }
            voiceSelect.appendChild(option);
        });

    // fallback default
    if (!hasSelected && voices.length > 0) {
        selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }
}


function populateGeorgianDropdown() {
    const voices = speechSynthesis.getVoices();
    const geoSelect = document.getElementById('georgianVoiceSelect');
    geoSelect.innerHTML = '';

    let hasSelected = false;

    voices
        .filter(v => v.lang.startsWith('ka') || v.name.includes('Giorgi') || v.name.includes('Eka'))
        .forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name;
            if (localStorage.getItem(GEORGIAN_VOICE_KEY) === voice.name) {
                option.selected = true;
                selectedGeorgianVoice = voice;
                hasSelected = true;
            }
            geoSelect.appendChild(option);
        });

    // fallback default
    if (!hasSelected && voices.length > 0) {
        selectedGeorgianVoice = voices.find(v => v.lang.startsWith('ka')) || voices[0];
    }
}

function loadVoices() {
    const voices = speechSynthesis.getVoices();
    populateVoiceDropdown();
    populateGeorgianDropdown();

    const storedVoice = localStorage.getItem(VOICE_STORAGE_KEY);
    selectedVoice = voices.find(v => v.name === storedVoice);

    // 📱 fallback for mobile: default English voice
    if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    const storedGeo = localStorage.getItem(GEORGIAN_VOICE_KEY);
    selectedGeorgianVoice = voices.find(v => v.name === storedGeo);

    // 📱 fallback for mobile: default Georgian voice or similar
    if (!selectedGeorgianVoice) {
        selectedGeorgianVoice = voices.find(v => v.lang === 'ka-GE') || voices.find(v => v.lang.startsWith('en')) || voices[0];
    }
}


function loadVoicesWithDelay(retry = 0) {
    const voices = speechSynthesis.getVoices();

    if (voices.length > 0 || retry >= 10) {
        // ➕ fallback თუ არ მოიძებნა არჩეული ხმა
        const storedVoice = localStorage.getItem(VOICE_STORAGE_KEY);
        selectedVoice = voices.find(v => v.name === storedVoice) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        const storedGeo = localStorage.getItem(GEORGIAN_VOICE_KEY);
        selectedGeorgianVoice = voices.find(v => v.name === storedGeo) || voices.find(v => v.lang.startsWith('ka')) || voices[0];

        populateVoiceDropdown();
        populateGeorgianDropdown();
        return;
    }

    setTimeout(() => loadVoicesWithDelay(retry + 1), 200);
}


speechSynthesis.onvoiceschanged = loadVoices;

function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!window.speechSynthesis || !text) return;

    if (!voiceObj) {
        // 📱 fallback ხმა ტელეფონებისთვის
        const fallbackLang = text.charCodeAt(0) > 128 ? 'ka-GE' : 'en';
        voiceObj = speechSynthesis.getVoices().find(v => v.lang === fallbackLang)
            || speechSynthesis.getVoices().find(v => v.lang.startsWith(fallbackLang.slice(0, 2)))
            || speechSynthesis.getVoices()[0];
    }

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
