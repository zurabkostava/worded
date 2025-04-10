const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadSpeechRates() {
    document.getElementById('englishRateSlider').value = localStorage.getItem(ENGLISH_RATE_KEY) || 1;
    document.getElementById('georgianRateSlider').value = localStorage.getItem(GEORGIAN_RATE_KEY) || 1;
}

function populateVoiceDropdown() {
    const voices = speechSynthesis.getVoices();
    const select = document.getElementById('voiceSelect');
    select.innerHTML = '';
    voices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = v.name;
        if (localStorage.getItem(VOICE_STORAGE_KEY) === v.name) {
            opt.selected = true;
            selectedVoice = v;
        }
        select.appendChild(opt);
    });
}

function populateGeorgianDropdown() {
    const voices = speechSynthesis.getVoices();
    const select = document.getElementById('georgianVoiceSelect');
    select.innerHTML = '';
    voices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = v.name;
        if (localStorage.getItem(GEORGIAN_VOICE_KEY) === v.name) {
            opt.selected = true;
            selectedGeorgianVoice = v;
        }
        select.appendChild(opt);
    });
}

function loadVoices() {
    const voices = speechSynthesis.getVoices();
    populateVoiceDropdown();
    populateGeorgianDropdown();

    selectedVoice = voices.find(v => v.name === localStorage.getItem(VOICE_STORAGE_KEY));
    selectedGeorgianVoice = voices.find(v => v.name === localStorage.getItem(GEORGIAN_VOICE_KEY));
}

function loadVoicesWithDelay(retry = 0) {
    if (speechSynthesis.getVoices().length > 0 || retry > 10) {
        loadVoices();
        return;
    }
    setTimeout(() => loadVoicesWithDelay(retry + 1), 200);
}

speechSynthesis.onvoiceschanged = loadVoices;

function speakWithVoice(text, voiceObj, buttonEl = null) {
    if (!window.speechSynthesis || !voiceObj) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceObj;
    utterance.lang = voiceObj.lang;
    utterance.rate = (voiceObj.lang === 'ka-GE')
        ? parseFloat(localStorage.getItem(GEORGIAN_RATE_KEY) || 1)
        : parseFloat(localStorage.getItem(ENGLISH_RATE_KEY) || 1);

    if (buttonEl) buttonEl.classList.add('active');
    utterance.onend = () => {
        if (buttonEl) buttonEl.classList.remove('active');
    };

    speechSynthesis.cancel(); // უსაფრთხოდ
    setTimeout(() => {
        speechSynthesis.speak(utterance);
    }, 150);
}

// მხოლოდ speak-btn-ზე ვაკავშირებთ TTS ფუნქციას — მეტი არაფერი ბლოკავს Read Aloud-ს
document.addEventListener('click', e => {
    const btn = e.target.closest('.speak-btn');
    if (!btn) return;
    const text = btn.dataset.text || btn.dataset.word;
    const lang = btn.dataset.lang;

    if (lang === 'ka') {
        speakWithVoice(text, selectedGeorgianVoice, btn);
    } else {
        speakWithVoice(text, selectedVoice, btn);
    }
});
