// ==== tts.js ====

const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;
let isSpeaking = false;
let lastSpokenButton = null;
let voicesLoaded = false;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 🎙 Voice Dropdown — ინგლისური
function populateVoiceDropdown() {
    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '';

    let stored = localStorage.getItem(VOICE_STORAGE_KEY);
    let selected = false;

    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = voice.name;

        if (stored === voice.name) {
            option.selected = true;
            selectedVoice = voice;
            selected = true;
        }

        voiceSelect.appendChild(option);
    });

    if (!selected && voices.length) {
        selectedVoice = voices[0];
        localStorage.setItem(VOICE_STORAGE_KEY, voices[0].name);
    }
}

// 🎙 Voice Dropdown — ქართული
function populateGeorgianDropdown() {
    const voices = speechSynthesis.getVoices();
    const geoSelect = document.getElementById('georgianVoiceSelect');
    geoSelect.innerHTML = '';

    let stored = localStorage.getItem(GEORGIAN_VOICE_KEY);
    let selected = false;

    const kaVoices = voices.filter(v => v.lang.startsWith('ka') || v.name.toLowerCase().includes('giorgi') || v.name.toLowerCase().includes('eka'));

    kaVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = voice.name;

        if (stored === voice.name) {
            option.selected = true;
            selectedGeorgianVoice = voice;
            selected = true;
        }

        geoSelect.appendChild(option);
    });

    if (!selected && kaVoices.length) {
        selectedGeorgianVoice = kaVoices[0];
        localStorage.setItem(GEORGIAN_VOICE_KEY, kaVoices[0].name);
    }
}

// 🔁 ხმების ჩატვირთვა (retry მექანიზმით)
function loadVoicesWithRetry(retries = 10, interval = 300) {
    let attempts = 0;

    function tryLoad() {
        const voices = speechSynthesis.getVoices();
        if (voices.length) {
            populateVoiceDropdown();
            populateGeorgianDropdown();
            voicesLoaded = true;
            return;
        }

        attempts++;
        if (attempts < retries) {
            setTimeout(tryLoad, interval);
        } else {
            console.warn("⚠️ ხმების ჩატვირთვა ვერ მოხერხდა.");
        }
    }

    tryLoad();
}

// 🔊 ტექსტის წაკითხვა
async function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!window.speechSynthesis || !text) return;

    // fallback ხმა
    if (!voiceObj) {
        const fallback = speechSynthesis.getVoices().find(v => v.lang.startsWith('en')) || speechSynthesis.getVoices()[0];
        voiceObj = fallback;
        console.warn("⚠️ Voice არ მოიძებნა. fallback:", fallback?.name);
    }

    // მეორედ დაჭერა — გააუქმე
    if (buttonEl && buttonEl === lastSpokenButton && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        buttonEl.classList.remove('active');
        if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
        lastSpokenButton = null;
        return;
    }

    lastSpokenButton = buttonEl;

    const speakPart = (txt, el) => {
        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(txt);
            utterance.voice = voiceObj;
            utterance.lang = voiceObj.lang;
            utterance.rate = (voiceObj.lang === 'ka-GE')
                ? parseFloat(localStorage.getItem(GEORGIAN_RATE_KEY) || 1)
                : parseFloat(localStorage.getItem(ENGLISH_RATE_KEY) || 1);

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

    await speakPart(text, highlightEl);
    if (extraText) {
        await delay(50);
        await speakPart(extraText, highlightEl);
    }
}

// 🎧 speak-btn დაჭერის წამკითხველი
document.addEventListener('click', (e) => {
    const speakBtn = e.target.closest('.speak-btn');
    if (!speakBtn) return;

    e.stopPropagation();

    const text = speakBtn.dataset.text || speakBtn.dataset.word;
    const extra = speakBtn.dataset.extra || null;
    const lang = speakBtn.dataset.lang;

    if (lang === 'ka') {
        speakWithVoice(text, selectedGeorgianVoice, speakBtn, extra);
    } else {
        speakWithVoice(text, selectedVoice, speakBtn);
    }
});


// 🚀 საწყისი ინიციალიზაცია
document.addEventListener('DOMContentLoaded', () => {
    speechSynthesis.getVoices(); // trigger preload
    speechSynthesis.onvoiceschanged = () => {
        if (!voicesLoaded) {
            populateVoiceDropdown();
            populateGeorgianDropdown();
        }
    };

    loadVoicesWithRetry(); // მრავალჯერ სცადე
});
