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

    let fallbackSet = false;

    allowedVoicesEnglish.forEach(name => {
        const voice = voices.find(v => v.name === name);
        if (voice) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name;
            if (localStorage.getItem(VOICE_STORAGE_KEY) === voice.name) {
                option.selected = true;
                selectedVoice = voice;
                fallbackSet = true;
            }
            voiceSelect.appendChild(option);
        }
    });

    if (!selectedVoice && voices.length > 0 && !fallbackSet) {
        selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        localStorage.setItem(VOICE_STORAGE_KEY, selectedVoice.name);
        const fallbackOption = document.createElement('option');
        fallbackOption.value = selectedVoice.name;
        fallbackOption.textContent = `[Default] ${selectedVoice.name}`;
        fallbackOption.selected = true;
        voiceSelect.appendChild(fallbackOption);
    }
}

function populateGeorgianDropdown() {
    const voices = speechSynthesis.getVoices();
    const geoSelect = document.getElementById('georgianVoiceSelect');
    geoSelect.innerHTML = '';

    let fallbackSet = false;

    allowedVoicesGeorgian.forEach(name => {
        const voice = voices.find(v => v.name === name);
        if (voice) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name;
            if (localStorage.getItem(GEORGIAN_VOICE_KEY) === voice.name) {
                option.selected = true;
                selectedGeorgianVoice = voice;
                fallbackSet = true;
            }
            geoSelect.appendChild(option);
        }
    });

    if (!selectedGeorgianVoice && voices.length > 0 && !fallbackSet) {
        selectedGeorgianVoice = voices.find(v => v.lang === 'ka-GE') || voices.find(v => v.lang.startsWith('en')) || voices[0];
        localStorage.setItem(GEORGIAN_VOICE_KEY, selectedGeorgianVoice.name);
        const fallbackOption = document.createElement('option');
        fallbackOption.value = selectedGeorgianVoice.name;
        fallbackOption.textContent = `[Default] ${selectedGeorgianVoice.name}`;
        fallbackOption.selected = true;
        geoSelect.appendChild(fallbackOption);
    }
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

window.addEventListener('load', () => {
    loadSpeechRates();
    loadVoicesWithForce();
});


speechSynthesis.onvoiceschanged = loadVoicesWithDelay;

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
// Try to "wake up" voices
window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
setTimeout(() => {
    const voices = speechSynthesis.getVoices();
    console.log(voices); // Debug: do voices appear?
}, 500);
function loadVoicesWithForce(retry = 0) {
    const voices = speechSynthesis.getVoices();

    if (voices.length > 0 || retry >= 10) {
        loadVoices();
        return;
    }

    // Try to wake voices manually
    const dummy = new SpeechSynthesisUtterance('');
    speechSynthesis.speak(dummy);

    setTimeout(() => loadVoicesWithForce(retry + 1), 300);
}


console.log('Voices Loaded:', speechSynthesis.getVoices());
if (voices.length === 0) {
    alert("⚠ ხმოვანი მოდელები ვერ მოიძებნა. სცადე ბრაუზერის Read Aloud, ან გამოიყენე Edge Android-ში.");
}
