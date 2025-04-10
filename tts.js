const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;
let isSpeaking = false;
let lastSpokenButton = null;

// ხმების ფილტრი რომლებიც უპირატესად გამოყენებული იქნება
const preferredEnglishVoices = [
    "Microsoft Libby Online (Natural)",
    "Microsoft Maisie Online (Natural)",
    "Microsoft Ryan Online (Natural)",
    "Microsoft Sonia Online (Natural)",
    "Microsoft Thomas Online (Natural)",
    "Microsoft Ana Online (Natural)"
];

const preferredGeorgianVoices = [
    "Microsoft Eka Online (Natural)",
    "Microsoft Giorgi Online (Natural)"
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

// ხმების დროპდაუნის შევსება
function populateVoiceDropdown() {
    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '';

    // დამატება default ოფშენი
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'აირჩიე ხმა';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    voiceSelect.appendChild(defaultOption);

    // ჯერ უპირატესი ხმები
    preferredEnglishVoices.forEach(name => {
        const voice = voices.find(v => v.name.includes(name));
        if (voice) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name.replace(' (Natural)', '').replace('Microsoft ', '');
            if (localStorage.getItem(VOICE_STORAGE_KEY) === voice.name) {
                option.selected = true;
                selectedVoice = voice;
            }
            voiceSelect.appendChild(option);
        }
    });

    // შემდეგ სხვა ხმები
    voices.forEach(voice => {
        if (voice.lang.startsWith('en-') &&
            !preferredEnglishVoices.some(v => voice.name.includes(v)) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name.replace(' (Natural)', '').replace('Microsoft ', '');
            if (localStorage.getItem(VOICE_STORAGE_KEY) {
                if (localStorage.getItem(VOICE_STORAGE_KEY) === voice.name) {
                    option.selected = true;
                    selectedVoice = voice;
                }
            } else if (!selectedVoice) {
                // თუ არჩეული არ არის, აირჩიე პირველი ხმა
                option.selected = true;
                selectedVoice = voice;
            }
            voiceSelect.appendChild(option);
        }
    });
}

function populateGeorgianDropdown() {
    const voices = speechSynthesis.getVoices();
    const geoSelect = document.getElementById('georgianVoiceSelect');
    geoSelect.innerHTML = '';

    // დამატება default ოფშენი
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'აირჩიე ხმა';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    geoSelect.appendChild(defaultOption);

    // ჯერ უპირატესი ქართული ხმები
    preferredGeorgianVoices.forEach(name => {
        const voice = voices.find(v => v.name.includes(name));
        if (voice) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name.replace(' (Natural)', '').replace('Microsoft ', '');
            if (localStorage.getItem(GEORGIAN_VOICE_KEY) {
                if (localStorage.getItem(GEORGIAN_VOICE_KEY) === voice.name) {
                    option.selected = true;
                    selectedGeorgianVoice = voice;
                }
            } else if (!selectedGeorgianVoice) {
                // თუ არჩეული არ არის, აირჩიე პირველი ხმა
                option.selected = true;
                selectedGeorgianVoice = voice;
            }
            geoSelect.appendChild(option);
        }
    });

    // შემდეგ სხვა ხმები
    voices.forEach(voice => {
        if (voice.lang.startsWith('ka-') &&
            !preferredGeorgianVoices.some(v => voice.name.includes(v))) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name.replace(' (Natural)', '').replace('Microsoft ', '');
            if (localStorage.getItem(GEORGIAN_VOICE_KEY) === voice.name) {
                option.selected = true;
                selectedGeorgianVoice = voice;
            }
            geoSelect.appendChild(option);
        }
    });
}

function loadVoices() {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
        // თუ ხმები არ არის ხელმისაწვდომი, სცადე მოგვიანებით
        setTimeout(loadVoices, 200);
        return;
    }

    populateVoiceDropdown();
    populateGeorgianDropdown();

    // არჩეული ხმის აღდგენა localStorage-დან
    const storedVoice = localStorage.getItem(VOICE_STORAGE_KEY);
    if (storedVoice) {
        selectedVoice = voices.find(v => v.name === storedVoice);
    } else {
        // თუ არ არის შენახული, აირჩიე პირველი ხელმისაწვდომი ინგლისური ხმა
        selectedVoice = voices.find(v => v.lang.startsWith('en-')) || voices[0];
    }

    const storedGeo = localStorage.getItem(GEORGIAN_VOICE_KEY);
    if (storedGeo) {
        selectedGeorgianVoice = voices.find(v => v.name === storedGeo);
    } else {
        // თუ არ არის შენახული, აირჩიე პირველი ხელმისაწვდომი ქართული ხმა
        selectedGeorgianVoice = voices.find(v => v.lang.startsWith('ka-'));
    }
}

// ხმის არჩევის ივენთი
document.getElementById('voiceSelect')?.addEventListener('change', (e) => {
    const voiceName = e.target.value;
    const voices = speechSynthesis.getVoices();
    selectedVoice = voices.find(v => v.name === voiceName);
    if (selectedVoice) {
        localStorage.setItem(VOICE_STORAGE_KEY, voiceName);
    }
});

// ქართული ხმის არჩევის ივენთი
document.getElementById('georgianVoiceSelect')?.addEventListener('change', (e) => {
    const voiceName = e.target.value;
    const voices = speechSynthesis.getVoices();
    selectedGeorgianVoice = voices.find(v => v.name === voiceName);
    if (selectedGeorgianVoice) {
        localStorage.setItem(GEORGIAN_VOICE_KEY, voiceName);
    }
});

// სიჩქარის ცვლილების ივენთები
document.getElementById('englishRateSlider')?.addEventListener('input', (e) => {
    localStorage.setItem(ENGLISH_RATE_KEY, e.target.value);
});

document.getElementById('georgianRateSlider')?.addEventListener('input', (e) => {
    localStorage.setItem(GEORGIAN_RATE_KEY, e.target.value);
});

function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!window.speechSynthesis || !voiceObj) {
        console.warn('Speech synthesis not available or voice not selected');
        return;
    }

    // თუ იგივე ღილაკზე დაჭერით გავაჩერებთ
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

            // სიჩქარის დაყენება ენის მიხედვით
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

            utterance.onerror = (err) => {
                console.error('Speech error:', err);
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
        try {
            if (highlightEl) highlightEl.classList.add('highlighted-sentence');
            await speak(text, highlightEl);
            if (extraText) {
                await delay(50);
                await speak(extraText);
            }
        } catch (err) {
            console.error('Speaking error:', err);
        } finally {
            if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
            if (buttonEl) buttonEl.classList.remove('active');
            lastSpokenButton = null;
        }
    });
}

// დაკლიკების მოსმენა speak ღილაკებზე
document.addEventListener('click', (e) => {
    const speakBtn = e.target.closest('.speak-btn');
    if (!speakBtn) return;

    e.stopPropagation();

    const text = speakBtn.dataset.text || speakBtn.dataset.word;
    const extraText = speakBtn.dataset.extra || null;
    const lang = speakBtn.dataset.lang;

    if (!text) return;

    if (lang === 'ka') {
        if (!selectedGeorgianVoice) {
            // თუ ქართული ხმა არ არის არჩეული, სცადე ინგლისური
            speakWithVoice(text, selectedVoice, speakBtn, extraText);
        } else {
            speakWithVoice(text, selectedGeorgianVoice, speakBtn, extraText);
        }
    } else {
        speakWithVoice(text, selectedVoice, speakBtn);
    }
});

// ხმების ჩატვირთვა გვერდის ჩატვირთვისას
document.addEventListener('DOMContentLoaded', () => {
    loadSpeechRates();
    loadVoices();

    // Edge-ში ხმების ჩატვირთვას შეიძლება დრო დასჭირდეს
    setTimeout(loadVoices, 500);
});

// ხმების ხელახალი ჩატვირთვა voiceschanged ივენთზე
speechSynthesis.onvoiceschanged = loadVoices;
