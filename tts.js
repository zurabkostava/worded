// ==== MODIFIED tts.js ==== //

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
    "Microsoft Eka Online (Natural) - Georgian (Georgia)"
];

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadSpeechRates() {
    document.getElementById('englishRateSlider').value = localStorage.getItem(ENGLISH_RATE_KEY) || 1;
    document.getElementById('georgianRateSlider').value = localStorage.getItem(GEORGIAN_RATE_KEY) || 1;
}

function findAllowedVoice(voices, allowedList, fallbackLang) {
    for (const name of allowedList) {
        const found = voices.find(v => v.name === name);
        if (found) return found;
    }
    return voices.find(v => v.lang && v.lang.startsWith(fallbackLang)) || voices[0];
}

function populateVoiceDropdown() {
    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '';

    voices.forEach(voice => {
        if (voice.lang.startsWith('en')) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name;
            if (localStorage.getItem(VOICE_STORAGE_KEY) === voice.name) {
                option.selected = true;
                selectedVoice = voice;
            }
            voiceSelect.appendChild(option);
        }
    });

    if (!selectedVoice) selectedVoice = findAllowedVoice(voices, allowedVoicesEnglish, 'en');
}

function populateGeorgianDropdown() {
    const voices = speechSynthesis.getVoices();
    const geoSelect = document.getElementById('georgianVoiceSelect');
    geoSelect.innerHTML = '';

    voices.forEach(voice => {
        if (voice.lang === 'ka-GE' || voice.name.includes('Eka') || voice.name.includes('Giorgi')) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name;
            if (localStorage.getItem(GEORGIAN_VOICE_KEY) === voice.name) {
                option.selected = true;
                selectedGeorgianVoice = voice;
            }
            geoSelect.appendChild(option);
        }
    });

    if (!selectedGeorgianVoice) selectedGeorgianVoice = findAllowedVoice(voices, allowedVoicesGeorgian, 'ka');
}

function loadVoices() {
    const voices = speechSynthesis.getVoices();
    populateVoiceDropdown();
    populateGeorgianDropdown();

    const storedVoice = localStorage.getItem(VOICE_STORAGE_KEY);
    selectedVoice = voices.find(v => v.name === storedVoice) || selectedVoice;

    const storedGeo = localStorage.getItem(GEORGIAN_VOICE_KEY);
    selectedGeorgianVoice = voices.find(v => v.name === storedGeo) || selectedGeorgianVoice;
}

function loadVoicesWithDelay(retry = 0) {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0 || retry >= 10) {
        loadVoices();
        return;
    }
    setTimeout(() => loadVoicesWithDelay(retry + 1), 200);
}

speechSynthesis.onvoiceschanged = loadVoicesWithDelay;

function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!window.speechSynthesis || !voiceObj || !text) return;

    if (buttonEl && buttonEl === lastSpokenButton && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        buttonEl?.classList.remove('active');
        highlightEl?.classList.remove('highlighted-sentence');
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

            buttonEl?.classList.add('active');
            el?.classList.add('highlighted-sentence');

            utterance.onend = () => {
                buttonEl?.classList.remove('active');
                el?.classList.remove('highlighted-sentence');
                lastSpokenButton = null;
                resolve();
            };

            speechSynthesis.speak(utterance);
        });
    };

    speechSynthesis.cancel();
    delay(100).then(async () => {
        highlightEl?.classList.add('highlighted-sentence');
        await speak(text, highlightEl);
        if (extraText) {
            await delay(50);
            await speak(extraText);
        }
        highlightEl?.classList.remove('highlighted-sentence');
        buttonEl?.classList.remove('active');
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
