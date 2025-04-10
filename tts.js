const VOICE_STORAGE_KEY = 'selected_voice_name';
const GEORGIAN_VOICE_KEY = 'selected_georgian_voice';
const ENGLISH_RATE_KEY = 'english_voice_rate';
const GEORGIAN_RATE_KEY = 'georgian_voice_rate';

let selectedVoice = null;
let selectedGeorgianVoice = null;

function loadVoicesWithRetry(retries = 10) {
    const voices = speechSynthesis.getVoices();
    if (voices.length || retries <= 0) {
        setVoices(voices);
    } else {
        setTimeout(() => loadVoicesWithRetry(retries - 1), 200);
    }
}

function setVoices(voices) {
    const stored = localStorage.getItem(VOICE_STORAGE_KEY);
    selectedVoice = voices.find(v => v.name === stored) || voices.find(v => v.lang.startsWith('en'));

    const storedGeo = localStorage.getItem(GEORGIAN_VOICE_KEY);
    selectedGeorgianVoice = voices.find(v => v.name === storedGeo) || voices.find(v => v.lang === 'ka-GE');
}

function speak(text, lang = 'en', extra = null, rate = 1, voice = null) {
    if (!window.speechSynthesis || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;

    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
    }

    speechSynthesis.cancel();
    setTimeout(() => {
        speechSynthesis.speak(utterance);
        if (extra) {
            utterance.onend = () => {
                const extraUtterance = new SpeechSynthesisUtterance(extra);
                extraUtterance.lang = lang;
                extraUtterance.rate = rate;
                if (voice) {
                    extraUtterance.voice = voice;
                    extraUtterance.lang = voice.lang;
                }
                speechSynthesis.speak(extraUtterance);
            };
        }
    }, 150);
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.speak-btn');
    if (!btn) return;

    const text = btn.dataset.text || btn.dataset.word;
    const extra = btn.dataset.extra || null;
    const lang = btn.dataset.lang || 'en';

    if (lang === 'ka') {
        const rate = parseFloat(localStorage.getItem(GEORGIAN_RATE_KEY) || '1');
        speak(text, 'ka-GE', extra, rate, selectedGeorgianVoice);
    } else {
        const rate = parseFloat(localStorage.getItem(ENGLISH_RATE_KEY) || '1');
        speak(text, 'en-US', extra, rate, selectedVoice);
    }
});

// ხმების ჩატვირთვა
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => loadVoicesWithRetry();
}
loadVoicesWithRetry();
