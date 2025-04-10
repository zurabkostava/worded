const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;
let isSpeaking = false;
let lastSpokenButton = null;

// ნაგულისხმევი ხმები, თუ სისტემური ხმები ვერ მოიძებნა
const DEFAULT_ENGLISH_VOICE = {
    name: 'Default English',
    lang: 'en-US',
    default: true
};

const DEFAULT_GEORGIAN_VOICE = {
    name: 'Default Georgian',
    lang: 'ka-GE',
    default: true
};

// დაშვებული ხმების სია სხვადასხვა პლატფორმებისთვის
const ALLOWED_VOICES = {
    english: [
        "Microsoft Libby Online (Natural) - English (United Kingdom)",
        "Microsoft Maisie Online (Natural) - English (United Kingdom)",
        "Microsoft Ryan Online (Natural) - English (United Kingdom)",
        "Microsoft Sonia Online (Natural) - English (United Kingdom)",
        "Microsoft Thomas Online (Natural) - English (United Kingdom)",
        "Microsoft Ana Online (Natural) - English (United States)",
        // Android/iOS ხმები
        "Google UK English Female",
        "Google UK English Male",
        "Google US English",
        "Samantha", // iOS
        "Daniel", // iOS
        // Edge ხმები
        "Microsoft David Desktop - English (United States)",
        "Microsoft Zira Desktop - English (United States)"
    ],
    georgian: [
        "Microsoft Eka Online (Natural) - Georgian (Georgia)",
        "Microsoft Giorgi Online (Natural) - Georgian (Georgia)",
        // სხვა პლატფორმების ხმები
        "Google ქართული",
        "Microsoft Eka Desktop - Georgian (Georgia)", // Windows-ის ლოკალური ხმა
        "Microsoft Giorgi Desktop - Georgian (Georgia)" // Windows-ის ლოკალური ხმა
    ]
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadSpeechRates() {
    const englishRateSlider = document.getElementById('englishRateSlider');
    const georgianRateSlider = document.getElementById('georgianRateSlider');

    if (englishRateSlider) {
        englishRateSlider.value = localStorage.getItem(ENGLISH_RATE_KEY) || 1;
    }
    if (georgianRateSlider) {
        georgianRateSlider.value = localStorage.getItem(GEORGIAN_RATE_KEY) || 1;
    }
}

// ხმის არჩევის დროს შემოწმება
function findBestVoice(voices, preferredName, lang, isDefault = false) {
    // 1. ჯერ ვეძებთ ზუსტი დამთხვევის მიხედვით
    const exactMatch = voices.find(v => v.name === preferredName);
    if (exactMatch) return exactMatch;

    // 2. ვეძებთ ენის მიხედვით
    const langMatch = voices.find(v => v.lang.startsWith(lang));
    if (langMatch) return langMatch;

    // 3. ვეძებთ დაშვებულ სიაში
    const allowedList = lang === 'en' ? ALLOWED_VOICES.english : ALLOWED_VOICES.georgian;
    for (const name of allowedList) {
        const voice = voices.find(v => v.name.includes(name));
        if (voice) return voice;
    }

    // 4. თუ არაფერი ვერ ვიპოვეთ, ვაბრუნებთ ნაგულისხმევს
    return isDefault ? DEFAULT_ENGLISH_VOICE : DEFAULT_GEORGIAN_VOICE;
}

function populateVoiceDropdown() {
    const voices = window.speechSynthesis?.getVoices() || [];
    const voiceSelect = document.getElementById('voiceSelect');
    if (!voiceSelect) return;

    voiceSelect.innerHTML = '';

    // დავამატოთ ნაგულისხმევი ვარიანტი
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'აირჩიე ინგლისური ხმა';
    voiceSelect.appendChild(defaultOption);

    // დავამატოთ ხელმისაწვდომი ხმები
    ALLOWED_VOICES.english.forEach(name => {
        const voice = voices.find(v => v.name.includes(name));
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

    // თუ არჩეული ხმა ვერ მოიძებნა, მაგრამ localStorage-ში ინფოა
    const storedVoiceName = localStorage.getItem(VOICE_STORAGE_KEY);
    if (storedVoiceName && !selectedVoice) {
        selectedVoice = findBestVoice(voices, storedVoiceName, 'en', true);
    }
}

function populateGeorgianDropdown() {
    const voices = window.speechSynthesis?.getVoices() || [];
    const geoSelect = document.getElementById('georgianVoiceSelect');
    if (!geoSelect) return;

    geoSelect.innerHTML = '';

    // დავამატოთ ნაგულისხმევი ვარიანტი
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'აირჩიე ქართული ხმა';
    geoSelect.appendChild(defaultOption);

    // დავამატოთ ხელმისაწვდომი ხმები
    ALLOWED_VOICES.georgian.forEach(name => {
        const voice = voices.find(v => v.name.includes(name));
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

    // თუ არჩეული ხმა ვერ მოიძებნა, მაგრამ localStorage-ში ინფოა
    const storedGeoName = localStorage.getItem(GEORGIAN_VOICE_KEY);
    if (storedGeoName && !selectedGeorgianVoice) {
        selectedGeorgianVoice = findBestVoice(voices, storedGeoName, 'ka');
    }
}

function loadVoices() {
    if (!window.speechSynthesis) {
        console.warn('Speech synthesis not supported in this browser');
        return;
    }

    const voices = window.speechSynthesis.getVoices();

    // თუ ხმები ჯერ არ არის ჩატვირთული, ველოდებით
    if (voices.length === 0) {
        setTimeout(loadVoices, 200);
        return;
    }

    populateVoiceDropdown();
    populateGeorgianDropdown();

    // თუ ხმა ჯერ არ არის არჩეული, ვირჩევთ ნაგულისხმევს
    if (!selectedVoice) {
        selectedVoice = findBestVoice(voices, localStorage.getItem(VOICE_STORAGE_KEY), 'en', true);
    }
    if (!selectedGeorgianVoice) {
        selectedGeorgianVoice = findBestVoice(voices, localStorage.getItem(GEORGIAN_VOICE_KEY), 'ka');
    }
}

function speakWithVoice(text, voiceObj, buttonEl = null, extraText = null, highlightEl = null) {
    if (!window.speechSynthesis) {
        alert('Speech synthesis is not supported in your browser');
        return Promise.resolve();
    }

    // თუ ხმა არ არის მითითებული, ვიყენებთ ნაგულისხმევს
    if (!voiceObj) {
        const lang = buttonEl?.dataset.lang === 'ka' ? 'ka' : 'en';
        voiceObj = lang === 'ka' ? selectedGeorgianVoice || DEFAULT_GEORGIAN_VOICE : selectedVoice || DEFAULT_ENGLISH_VOICE;
    }

    // თუ იგივე ღილაკზე კლიკია და ხმა უკვე მიდის
    if (buttonEl && buttonEl === lastSpokenButton && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        if (buttonEl) buttonEl.classList.remove('active');
        if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
        lastSpokenButton = null;
        return Promise.resolve();
    }

    lastSpokenButton = buttonEl;

    const speak = (txt, el) => {
        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(txt);

            // თუ ხმის ობიექტი არის სისტემური (არის ნამდვილი SpeechSynthesisVoice)
            if (voiceObj && voiceObj.voiceURI) {
                utterance.voice = voiceObj;
                utterance.lang = voiceObj.lang;
            } else {
                // ნაგულისხმევი ხმისთვის
                utterance.lang = voiceObj.lang;
            }

            // სიჩქარის დაყენება
            const rate = (voiceObj.lang === 'ka-GE' || voiceObj === DEFAULT_GEORGIAN_VOICE)
                ? parseFloat(localStorage.getItem(GEORGIAN_RATE_KEY) || 1)
                : parseFloat(localStorage.getItem(ENGLISH_RATE_KEY) || 1);
            utterance.rate = rate;

            // UI განახლება
            if (buttonEl) buttonEl.classList.add('active');
            if (el) el.classList.add('highlighted-sentence');

            utterance.onend = () => {
                if (buttonEl) buttonEl.classList.remove('active');
                if (el) el.classList.remove('highlighted-sentence');
                lastSpokenButton = null;
                resolve();
            };

            utterance.onerror = (e) => {
                console.error('Speech error:', e);
                if (buttonEl) buttonEl.classList.remove('active');
                if (el) el.classList.remove('highlighted-sentence');
                lastSpokenButton = null;
                resolve();
            };

            speechSynthesis.speak(utterance);
        });
    };

    speechSynthesis.cancel();

    return delay(100).then(async () => {
        try {
            if (highlightEl) highlightEl.classList.add('highlighted-sentence');
            await speak(text, highlightEl);

            if (extraText) {
                await delay(50);
                await speak(extraText);
            }
        } catch (e) {
            console.error('Error in speakWithVoice:', e);
        } finally {
            if (highlightEl) highlightEl.classList.remove('highlighted-sentence');
            if (buttonEl) buttonEl.classList.remove('active');
            lastSpokenButton = null;
        }
    });
}

// ხმის სინთეზის მხარდაჭერის შემოწმება
function checkSpeechSupport() {
    if (!window.speechSynthesis) {
        console.warn('Web Speech API not supported');
        // დავამალოთ ან გამოვართოთ TTS ფუნქციონალი
        document.querySelectorAll('.speak-btn').forEach(btn => {
            btn.style.display = 'none';
        });
        return false;
    }
    return true;
}

// გამოძახება გვერდის ჩატვირთვისას
document.addEventListener('DOMContentLoaded', () => {
    if (checkSpeechSupport()) {
        // iOS-ისთვის საჭიროა სპეციალური დაყოვნება
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            setTimeout(loadVoices, 500);
        } else {
            loadVoices();
        }

        // ხმების ცვლილებაზე რეაგირება
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    loadSpeechRates();
});

// საერთო click event listener
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
