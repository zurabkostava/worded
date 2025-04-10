// ==== tts.js ====
const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;
let isSpeaking = false;
let lastSpokenButton = null;

// უფრო ფართო სია ხმების, რომელიც შეიძლება იყოს ხელმისაწვდომი სხვადასხვა პლატფორმაზე
const possibleEnglishVoices = [
    "Microsoft Libby Online (Natural)",
    "Microsoft Maisie Online (Natural)",
    "Microsoft Ryan Online (Natural)",
    "Microsoft Sonia Online (Natural)",
    "Microsoft Thomas Online (Natural)",
    "Microsoft Ana Online (Natural)",
    "Google UK English Female",
    "Google UK English Male",
    "Google US English",
    "Microsoft David Desktop - English (United States)",
    "Microsoft Zira Desktop - English (United States)",
    "Microsoft Mark - English (United States)"
];

const possibleGeorgianVoices = [
    "Microsoft Eka Online (Natural)",
    "Microsoft Giorgi Online (Natural)",
    "Google ქართული"
];

// ფუნქცია, რომელიც ამოწმებს ხმის ხელმისაწვდომობას
function findAvailableVoice(voices, possibleNames) {
    // ჯერ ვცადოთ ზუსტი დამთხვევა
    for (const name of possibleNames) {
        const exactMatch = voices.find(v => v.name.includes(name));
        if (exactMatch) return exactMatch;
    }

    // თუ ზუსტი არ მოიძებნა, ვეძებთ ნებისმიერ ხმას ენის მიხედვით
    for (const voice of voices) {
        if (possibleNames.some(name => voice.name.includes(name))) {
            return voice;
        }
    }

    // საბოლოოდ, ვაბრუნებთ პირველ ხელმისაწვდომ ხმას ენის მიხედვით
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
}

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

    // დავამატოთ ნაგულისხმევი ვარიანტი
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'აირჩიე ხმა';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    voiceSelect.appendChild(defaultOption);

    // ვამატებთ ხელმისაწვდომ ხმებს
    voices.forEach(voice => {
        if (voice.lang.startsWith('en')) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (localStorage.getItem(VOICE_STORAGE_KEY) === voice.name) {
                option.selected = true;
                selectedVoice = voice;
            }
            voiceSelect.appendChild(option);
        }
    });

    // თუ არცერთი ხმა არ არის ხელმისაწვდომი
    if (voiceSelect.options.length === 1) {
        const noVoiceOption = document.createElement('option');
        noVoiceOption.value = '';
        noVoiceOption.textContent = 'ხმები ვერ მოიძებნა';
        noVoiceOption.disabled = true;
        voiceSelect.appendChild(noVoiceOption);
    }
}

function populateGeorgianDropdown() {
    const voices = speechSynthesis.getVoices();
    const geoSelect = document.getElementById('georgianVoiceSelect');
    geoSelect.innerHTML = '';

    // დავამატოთ ნაგულისხმევი ვარიანტი
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'აირჩიე ხმა';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    geoSelect.appendChild(defaultOption);

    // ვამატებთ ხელმისაწვდომ ხმებს
    voices.forEach(voice => {
        if (voice.lang.startsWith('ka')) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (localStorage.getItem(GEORGIAN_VOICE_KEY) === voice.name) {
                option.selected = true;
                selectedGeorgianVoice = voice;
            }
            geoSelect.appendChild(option);
        }
    });

    // თუ არცერთი ხმა არ არის ხელმისაწვდომი
    if (geoSelect.options.length === 1) {
        const noVoiceOption = document.createElement('option');
        noVoiceOption.value = '';
        noVoiceOption.textContent = 'ხმები ვერ მოიძებნა';
        noVoiceOption.disabled = true;
        geoSelect.appendChild(noVoiceOption);
    }
}

function loadVoices() {
    const voices = speechSynthesis.getVoices();

    // თუ ხმები არ არის ხელმისაწვდომი, ვცადოთ მოგვიანებით
    if (voices.length === 0) {
        setTimeout(loadVoices, 500);
        return;
    }

    populateVoiceDropdown();
    populateGeorgianDropdown();

    // ვიპოვოთ და დავაყენოთ შენახული ხმები ან ნაგულისხმევი
    const storedVoice = localStorage.getItem(VOICE_STORAGE_KEY);
    selectedVoice = voices.find(v => v.name === storedVoice) ||
        findAvailableVoice(voices, possibleEnglishVoices);

    const storedGeo = localStorage.getItem(GEORGIAN_VOICE_KEY);
    selectedGeorgianVoice = voices.find(v => v.name === storedGeo) ||
        findAvailableVoice(voices, possibleGeorgianVoices);
}

// დავამატოთ ხმის შეცვლის მოსმენა
document.getElementById('voiceSelect')?.addEventListener('change', (e) => {
    const voiceName = e.target.value;
    if (!voiceName) return;

    const voices = speechSynthesis.getVoices();
    selectedVoice = voices.find(v => v.name === voiceName);
    localStorage.setItem(VOICE_STORAGE_KEY, voiceName);
});

document.getElementById('georgianVoiceSelect')?.addEventListener('change', (e) => {
    const voiceName = e.target.value;
    if (!voiceName) return;

    const voices = speechSynthesis.getVoices();
    selectedGeorgianVoice = voices.find(v => v.name === voiceName);
    localStorage.setItem(GEORGIAN_VOICE_KEY, voiceName);
});

// დავამატოთ სიჩქარის შეცვლის მოსმენა
document.getElementById('englishRateSlider')?.addEventListener('input', (e) => {
    localStorage.setItem(ENGLISH_RATE_KEY, e.target.value);
});

document.getElementById('georgianRateSlider')?.addEventListener('input', (e) => {
    localStorage.setItem(GEORGIAN_RATE_KEY, e.target.value);
});

function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!window.speechSynthesis) {
        console.error('Speech synthesis not supported');
        return;
    }

    // თუ ხმა არ არის მითითებული, ვიყენებთ ნაგულისხმევს
    if (!voiceObj) {
        voiceObj = selectedVoice || findAvailableVoice(speechSynthesis.getVoices(), possibleEnglishVoices);
        if (!voiceObj) {
            console.error('No available voice found');
            return;
        }
    }

    // თუ უკვე მეტყველებს იგივე ღილაკით, გავაჩეროთ
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

            const rate = (voiceObj.lang.startsWith('ka'))
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
            console.error('Error during speech:', err);
        } finally {
            if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
            if (buttonEl) buttonEl.classList.remove('active');
            lastSpokenButton = null;
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

    if (!text) return;

    if (lang === 'ka') {
        const voiceToUse = selectedGeorgianVoice ||
            findAvailableVoice(speechSynthesis.getVoices(), possibleGeorgianVoices);
        speakWithVoice(text, voiceToUse, speakBtn, extraText);
    } else {
        const voiceToUse = selectedVoice ||
            findAvailableVoice(speechSynthesis.getVoices(), possibleEnglishVoices);
        speakWithVoice(text, voiceToUse, speakBtn);
    }
});

// დავამატოთ ხმების ჩატვირთვა გვერდის ჩატვირთვისას
document.addEventListener('DOMContentLoaded', () => {
    loadSpeechRates();
    loadVoices();

    // Edge-ზე ზოგჯერ ხმები არ იტვირთება დაუყოვნებლივ
    setTimeout(loadVoices, 1000);
    setTimeout(loadVoices, 3000);
});

// დავამატოთ ხმების ხელახალი ჩატვირთვა, როცა იცვლება
speechSynthesis.onvoiceschanged = loadVoices;
