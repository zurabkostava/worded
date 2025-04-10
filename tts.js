// tts.js
const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;
let isSpeaking = false;
let lastSpokenButton = null;

// Default voices that should work on mobile
const defaultVoices = {
    english: {
        name: "Default English",
        lang: "en-US"
    },
    georgian: {
        name: "Default Georgian",
        lang: "ka-GE"
    }
};

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

    // Add default option first
    const defaultOption = document.createElement('option');
    defaultOption.value = "default";
    defaultOption.textContent = "Default System Voice";
    voiceSelect.appendChild(defaultOption);

    // Try to add available voices
    voices.forEach(voice => {
        if (voice.lang.includes('en-')) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (localStorage.getItem(VOICE_STORAGE_KEY) {
                if (localStorage.getItem(VOICE_STORAGE_KEY) === voice.name) {
                    option.selected = true;
                    selectedVoice = voice;
                }
            }
            voiceSelect.appendChild(option);
        }
    });

    // If no voices found, use default
    if (voices.length === 0) {
        selectedVoice = defaultVoices.english;
    }
}

function populateGeorgianDropdown() {
    const voices = speechSynthesis.getVoices();
    const geoSelect = document.getElementById('georgianVoiceSelect');
    geoSelect.innerHTML = '';

    // Add default option first
    const defaultOption = document.createElement('option');
    defaultOption.value = "default";
    defaultOption.textContent = "Default System Voice";
    geoSelect.appendChild(defaultOption);

    // Try to add available voices
    voices.forEach(voice => {
        if (voice.lang.includes('ka-')) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (localStorage.getItem(GEORGIAN_VOICE_KEY)) {
                if (localStorage.getItem(GEORGIAN_VOICE_KEY) === voice.name) {
                    option.selected = true;
                    selectedGeorgianVoice = voice;
                }
            }
            geoSelect.appendChild(option);
        }
    });

    // If no voices found, use default
    if (voices.length === 0) {
        selectedGeorgianVoice = defaultVoices.georgian;
    }
}

function loadVoices() {
    // On mobile, we need to handle voice loading differently
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Mobile device - use simpler voice handling
        selectedVoice = defaultVoices.english;
        selectedGeorgianVoice = defaultVoices.georgian;
        return;
    }

    // Desktop handling
    const voices = speechSynthesis.getVoices();
    populateVoiceDropdown();
    populateGeorgianDropdown();

    const storedVoice = localStorage.getItem(VOICE_STORAGE_KEY);
    if (storedVoice) {
        selectedVoice = voices.find(v => v.name === storedVoice);
    }

    const storedGeo = localStorage.getItem(GEORGIAN_VOICE_KEY);
    if (storedGeo) {
        selectedGeorgianVoice = voices.find(v => v.name === storedGeo);
    }
}

function loadVoicesWithDelay(retry = 0) {
    // On mobile, don't retry - just use defaults
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        loadVoices();
        return;
    }

    // Desktop handling with retry
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0 || retry >= 10) {
        loadVoices();
        return;
    }
    setTimeout(() => loadVoicesWithDelay(retry + 1), 200);
}

// Initialize speech synthesis
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoicesWithDelay();
} else {
    console.warn("Speech synthesis not supported");
}

function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!window.speechSynthesis) {
        console.warn("Speech synthesis not available");
        return;
    }

    // Handle case where voiceObj is our default voice object
    if (voiceObj && !voiceObj.voiceURI) {
        voiceObj = null; // Let the system choose default
    }

    if (buttonEl && buttonEl === lastSpokenButton && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        if (buttonEl) buttonEl.classList.remove('active');
        if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
        lastSpokenButton = null;
        return;
    }

    lastSpokenButton = buttonEl;

    const speak = (txt, lang, el) => {
        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(txt);

            // Set language
            utterance.lang = lang || 'en-US';

            // Set rate
            const rate = (lang === 'ka-GE')
                ? parseFloat(localStorage.getItem(GEORGIAN_RATE_KEY) || 1
                : parseFloat(localStorage.getItem(ENGLISH_RATE_KEY) || 1;
            utterance.rate = rate;

            if (buttonEl) buttonEl.classList.add('active');
            if (el) el.classList.add('highlighted-sentence');

            utterance.onend = () => {
                if (buttonEl) buttonEl.classList.remove('active');
                if (el) el.classList.remove('highlighted-sentence');
                lastSpokenButton = null;
                resolve();
            };

            utterance.onerror = (err) => {
                console.error("Speech error:", err);
                if (buttonEl) buttonEl.classList.remove('active');
                if (el) el.classList.remove('highlighted-sentence');
                resolve();
            };

            speechSynthesis.speak(utterance);
        });
    };

    speechSynthesis.cancel();

    // Small delay to ensure cancellation works
    delay(100).then(async () => {
        try {
            if (highlightEl) highlightEl.classList.add('highlighted-sentence');

            // Determine language
            const lang = (voiceObj === selectedGeorgianVoice || voiceObj?.lang?.includes('ka')) ? 'ka-GE' : 'en-US';

            await speak(text, lang, highlightEl);

            if (extraText) {
                await delay(50);
                await speak(extraText, lang);
            }
        } catch (err) {
            console.error("Speech error:", err);
        } finally {
            if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
            if (buttonEl) buttonEl.classList.remove('active');
            lastSpokenButton = null;
        }
    });
}

// Mobile-specific event listener
document.addEventListener('click', (e) => {
    const speakBtn = e.target.closest('.speak-btn');
    if (!speakBtn) return;

    e.stopPropagation();
    e.preventDefault();

    const text = speakBtn.dataset.text || speakBtn.dataset.word;
    const extraText = speakBtn.dataset.extra || null;
    const lang = speakBtn.dataset.lang;

    // On mobile, we need to handle touch events differently
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Add visual feedback
        speakBtn.classList.add('active-touch');
        setTimeout(() => speakBtn.classList.remove('active-touch'), 200);
    }

    if (lang === 'ka') {
        speakWithVoice(text, selectedGeorgianVoice, speakBtn, extraText);
    } else {
        speakWithVoice(text, selectedVoice, speakBtn);
    }
});
