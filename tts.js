const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;
let isSpeaking = false;
let lastSpokenButton = null;

const allowedVoicesEnglish = [
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

function populateDropdown(selectElement, voices, allowedNames, selectedNameKey) {
    selectElement.innerHTML = '';
    const storedName = localStorage.getItem(selectedNameKey);
    let fallbackVoice = null;

    allowedNames.forEach(name => {
        const voice = voices.find(v => v.name === name);
        if (voice) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name;
            if (storedName === voice.name) {
                option.selected = true;
                if (selectedNameKey === VOICE_STORAGE_KEY) selectedVoice = voice;
                if (selectedNameKey === GEORGIAN_VOICE_KEY) selectedGeorgianVoice = voice;
            }
            selectElement.appendChild(option);
        }
    });

    // Fallback თუ არცერთი ხმა არ გამოჩნდა
    if (!selectElement.options.length) {
        voices.forEach(voice => {
            if (!fallbackVoice && voice.lang.startsWith(selectedNameKey === GEORGIAN_VOICE_KEY ? 'ka' : 'en')) {
                fallbackVoice = voice;
            }
        });
        if (fallbackVoice) {
            const option = document.createElement('option');
            option.value = fallbackVoice.name;
            option.textContent = `[Default] ${fallbackVoice.name}`;
            option.selected = true;
            selectElement.appendChild(option);
            if (selectedNameKey === VOICE_STORAGE_KEY) selectedVoice = fallbackVoice;
            if (selectedNameKey === GEORGIAN_VOICE_KEY) selectedGeorgianVoice = fallbackVoice;
        }
    }
}

function loadVoices() {
    const voices = speechSynthesis.getVoices();
    populateDropdown(document.getElementById('voiceSelect'), voices, allowedVoicesEnglish, VOICE_STORAGE_KEY);
    populateDropdown(document.getElementById('georgianVoiceSelect'), voices, allowedVoicesGeorgian, GEORGIAN_VOICE_KEY);
}

function loadVoicesWithDelay(retry = 0) {
    const voices = speechSynthesis.getVoices();
    if (voices.length || retry >= 10) {
        loadVoices();
    } else {
        setTimeout(() => loadVoicesWithDelay(retry + 1), 200);
    }
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoicesWithDelay();

function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!voiceObj || !window.speechSynthesis) return;

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

            utterance.rate = (voiceObj.lang === 'ka-GE')
                ? parseFloat(localStorage.getItem(GEORGIAN_RATE_KEY) || 1)
                : parseFloat(localStorage.getItem(ENGLISH_RATE_KEY) || 1);

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
        await speak(text, highlightEl);
        if (extraText) {
            await delay(50);
            await speak(extraText);
        }
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
