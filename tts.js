// tts.js - Updated for mobile compatibility
const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;
let isSpeaking = false;
let lastSpokenButton = null;

// Mobile-friendly voice selection
const mobileVoices = {
    english: [
        { name: "Microsoft Libby Online", lang: "en-GB" },
        { name: "Microsoft Maisie Online", lang: "en-GB" },
        { name: "Microsoft Ryan Online", lang: "en-GB" },
        { name: "Microsoft Sonia Online", lang: "en-GB" },
        { name: "Microsoft Thomas Online", lang: "en-GB" },
        { name: "Microsoft Ana Online", lang: "en-US" }
    ],
    georgian: [
        { name: "Microsoft Eka Online", lang: "ka-GE" },
        { name: "Microsoft Giorgi Online", lang: "ka-GE" }
    ]
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

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function populateVoiceDropdown() {
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '<option value="" disabled selected>Select voice</option>';

    if (isMobileDevice()) {
        // Mobile devices - use predefined voices
        mobileVoices.english.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name;
            if (localStorage.getItem(VOICE_STORAGE_KEY) === voice.name) {
                option.selected = true;
                selectedVoice = new SpeechSynthesisVoiceMock(voice.name, voice.lang);
            }
            voiceSelect.appendChild(option);
        });
    } else {
        // Desktop - use actual voices
        const voices = speechSynthesis.getVoices();
        voices
            .filter(v => v.lang.includes('en'))
            .forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (localStorage.getItem(VOICE_STORAGE_KEY) === voice.name) {
                    option.selected = true;
                    selectedVoice = voice;
                }
                voiceSelect.appendChild(option);
            });
    }
}

function populateGeorgianDropdown() {
    const geoSelect = document.getElementById('georgianVoiceSelect');
    geoSelect.innerHTML = '<option value="" disabled selected>Select voice</option>';

    if (isMobileDevice()) {
        // Mobile devices - use predefined voices
        mobileVoices.georgian.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name;
            if (localStorage.getItem(GEORGIAN_VOICE_KEY) === voice.name) {
                option.selected = true;
                selectedGeorgianVoice = new SpeechSynthesisVoiceMock(voice.name, voice.lang);
            }
            geoSelect.appendChild(option);
        });
    } else {
        // Desktop - use actual voices
        const voices = speechSynthesis.getVoices();
        voices
            .filter(v => v.lang.includes('ka'))
            .forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (localStorage.getItem(GEORGIAN_VOICE_KEY) === voice.name) {
                    option.selected = true;
                    selectedGeorgianVoice = voice;
                }
                geoSelect.appendChild(option);
            });
    }
}

// Mock voice object for mobile devices
function SpeechSynthesisVoiceMock(name, lang) {
    return {
        name: name,
        lang: lang,
        voiceURI: name,
        localService: true,
        default: false
    };
}

function loadVoices() {
    if (isMobileDevice()) {
        // On mobile, we use our predefined voices
        const storedVoice = localStorage.getItem(VOICE_STORAGE_KEY);
        const storedGeo = localStorage.getItem(GEORGIAN_VOICE_KEY);

        // Find matching voice from our predefined list
        if (storedVoice) {
            const voice = mobileVoices.english.find(v => v.name === storedVoice);
            if (voice) {
                selectedVoice = new SpeechSynthesisVoiceMock(voice.name, voice.lang);
            }
        }

        if (storedGeo) {
            const voice = mobileVoices.georgian.find(v => v.name === storedGeo);
            if (voice) {
                selectedGeorgianVoice = new SpeechSynthesisVoiceMock(voice.name, voice.lang);
            }
        }
    }

    populateVoiceDropdown();
    populateGeorgianDropdown();
}

function loadVoicesWithDelay(retry = 0) {
    if (isMobileDevice()) {
        loadVoices();
        return;
    }

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

    // Some browsers don't fire the voiceschanged event
    setTimeout(loadVoicesWithDelay, 1000);
} else {
    console.warn('Speech Synthesis API not supported');
}

function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!window.speechSynthesis || !voiceObj) {
        console.warn('Speech synthesis not available');
        return Promise.resolve();
    }

    // Cancel if same button is clicked while speaking
    if (buttonEl && buttonEl === lastSpokenButton && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        if (buttonEl) buttonEl.classList.remove('active');
        if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
        lastSpokenButton = null;
        return Promise.resolve();
    }

    lastSpokenButton = buttonEl;

    return new Promise((resolve) => {
        // Mobile devices often need a small delay between utterances
        speechSynthesis.cancel();

        setTimeout(() => {
            const speakText = (txt, lang) => {
                return new Promise((innerResolve) => {
                    const utterance = new SpeechSynthesisUtterance(txt);

                    // Set voice properties
                    utterance.voice = voiceObj;
                    utterance.lang = lang || voiceObj.lang;

                    // Set rate from localStorage
                    const rateKey = (lang === 'ka-GE') ? GEORGIAN_RATE_KEY : ENGLISH_RATE_KEY;
                    utterance.rate = parseFloat(localStorage.getItem(rateKey) || 1;

                    // UI updates
                    if (buttonEl) buttonEl.classList.add('active');
                    if (highlightEl) highlightEl.classList.add('highlighted-sentence');

                    utterance.onend = () => {
                        if (buttonEl) buttonEl.classList.remove('active');
                        if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
                        innerResolve();
                    };

                    utterance.onerror = (e) => {
                        console.error('SpeechSynthesis error:', e);
                        if (buttonEl) buttonEl.classList.remove('active');
                        if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
                        innerResolve();
                    };

                    speechSynthesis.speak(utterance);
                });
            };

            // Chain the speech operations
            (async () => {
                try {
                    if (highlightEl) highlightEl.classList.add('highlighted-sentence');
                    await speakText(text);

                    if (extraText) {
                        await delay(300); // Small delay between parts
                        await speakText(extraText);
                    }
                } catch (e) {
                    console.error('Speech error:', e);
                } finally {
                    if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
                    if (buttonEl) buttonEl.classList.remove('active');
                    lastSpokenButton = null;
                    resolve();
                }
            })();
        }, 100); // Initial delay to ensure cancellation works
    });
}

// Handle speak button clicks
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

// Add this to your existing utils.js or script.js
function checkTTSSupport() {
    if (!('speechSynthesis' in window)) {
        alert('Text-to-speech is not supported in your browser. Please try Chrome or Firefox.');
        return false;
    }
    return true;
}

// Call this when initializing your app
document.addEventListener('DOMContentLoaded', () => {
    checkTTSSupport();
    loadVoicesWithDelay();
});
