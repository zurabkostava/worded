// tts.js
const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;
let isSpeaking = false;
let lastSpokenButton = null;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// დაშვებული ხმები
const allowedVoicesEnglish = [
    "Microsoft Libby Online (Natural) - English (United Kingdom)",
    "Microsoft Maisie Online (Natural) - English (United Kingdom)",
    "Microsoft Ryan Online (Natural) - English (United Kingdom)",
    "Microsoft Sonia Online (Natural) - English (United Kingdom)",
    "Microsoft Thomas Online (Natural) - English (United Kingdom)",
    "Microsoft Ana Online (Natural) - English (United States)"
];

const allowedVoicesGeorgian = [
    "Microsoft Eka Online (Natural) - Georgian (Georgia)",
    "Microsoft Giorgi Online (Natural) - Georgian (Georgia)"
];

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ახალი: შეამოწმე TTS ხელმისაწვდომობა
function checkTTSSupport() {
    if (!('speechSynthesis' in window)) {
        console.warn('SpeechSynthesis API არ არის ხელმისაწვდომი');
        if (isMobile) {
            alert('თქვენს ბრაუზერს არ აქვს ხმის წაკითხვის მხარდაჭერა. გთხოვთ გამოიყენოთ Chrome ან Edge ბრაუზერი.');
        }
        return false;
    }
    return true;
}

// ახალი: მობილურისთვის ოპტიმიზირებული speak ფუნქცია
async function mobileSpeak(text, voice, rate = 1) {
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            // მობილურისთვის default ხმა
            utterance.lang = voice?.lang || 'en-US';
        }

        utterance.rate = rate;
        utterance.onend = resolve;
        utterance.onerror = resolve; // მობილურზე ხშირად ხდება შეცდომები

        // მობილურზე ხმის წინასწარი ჩატვირთვა
        if (isMobile) {
            speechSynthesis.cancel();
            setTimeout(() => {
                speechSynthesis.speak(utterance);
            }, 100);
        } else {
            speechSynthesis.speak(utterance);
        }
    });
}

// ახალი: ხმის სიის ჩატვირთვა მობილურისთვის
async function loadVoicesWithRetry(maxRetries = 5, delayMs = 500) {
    if (!checkTTSSupport()) return;

    for (let i = 0; i < maxRetries; i++) {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            populateVoiceDropdown();
            populateGeorgianDropdown();
            return;
        }
        await delay(delayMs);
    }
    console.warn('ხმები ვერ ჩაიტვირთა მრავალჯერადი მცდელობის შემდეგ');
}

function populateVoiceDropdown() {
    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    if (!voiceSelect) return;

    voiceSelect.innerHTML = '<option value="" disabled hidden selected>აირჩიე ხმა</option>';

    allowedVoicesEnglish.forEach(name => {
        const voice = voices.find(v => v.name === name);
        if (voice) {
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

    // მობილურისთვის default-ის დაყენება
    if (isMobile && !selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
    }
}

function populateGeorgianDropdown() {
    const voices = speechSynthesis.getVoices();
    const geoSelect = document.getElementById('georgianVoiceSelect');
    if (!geoSelect) return;

    geoSelect.innerHTML = '<option value="" disabled hidden selected>აირჩიე ხმა</option>';

    allowedVoicesGeorgian.forEach(name => {
        const voice = voices.find(v => v.name === name);
        if (voice) {
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

    // მობილურისთვის default-ის დაყენება
    if (isMobile && !selectedGeorgianVoice && voices.length > 0) {
        selectedGeorgianVoice = voices.find(v => v.lang === 'ka-GE') || voices[0];
    }
}

async function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!checkTTSSupport()) return;

    // მობილურისთვის გამარტივებული ლოგიკა
    if (isMobile) {
        try {
            if (buttonEl && buttonEl === lastSpokenButton && speechSynthesis.speaking) {
                speechSynthesis.cancel();
                buttonEl.classList.remove('active');
                if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
                lastSpokenButton = null;
                return;
            }

            lastSpokenButton = buttonEl;
            if (buttonEl) buttonEl.classList.add('active');
            if (highlightEl) highlightEl.classList.add('highlighted-sentence');

            const rate = (voiceObj?.lang === 'ka-GE')
                ? parseFloat(localStorage.getItem(GEORGIAN_RATE_KEY) || 1)
                : parseFloat(localStorage.getItem(ENGLISH_RATE_KEY) || 1);

            await mobileSpeak(text, voiceObj, rate);
            if (extraText) {
                await delay(50);
                await mobileSpeak(extraText, voiceObj, rate);
            }
        } catch (e) {
            console.error('ხმის წაკითხვის შეცდომა:', e);
        } finally {
            if (buttonEl) buttonEl.classList.remove('active');
            if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
            lastSpokenButton = null;
        }
        return;
    }

    // ორიგინალური ლოგიკა დესკტოპისთვის
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

    try {
        if (highlightEl) highlightEl.classList.add('highlighted-sentence');
        await speak(text, highlightEl);
        if (extraText) {
            await delay(50);
            await speak(extraText);
        }
    } finally {
        if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
        if (buttonEl) buttonEl.classList.remove('active');
        lastSpokenButton = null;
    }
}

// ინიციალიზაცია
if (checkTTSSupport()) {
    loadVoicesWithRetry();
    speechSynthesis.onvoiceschanged = loadVoicesWithRetry;
}

// ექსპორტი
export {
    speakWithVoice,
    selectedVoice,
    selectedGeorgianVoice,
    loadVoicesWithRetry
};
