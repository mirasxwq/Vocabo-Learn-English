/* ========= SAMPLE TEXTS FOR ALL LEVELS ========= */

const samples = {
    A1: {
        reading: {
            text: "Every morning I wake up at 7 o’clock. I wash my face and brush my teeth. Then I eat breakfast. I usually have tea and toast. After breakfast, I go to school. I like mornings because they are quiet.",
            correct: { q1: "At 7 o’clock", q2: "Tea and toast", q3: "Because mornings are quiet" }
        },
        speaking: "A black cat is sitting in a box",
        listening: `Mary has got a kitty! Her name is Milka. She is gray with white paws and green eyes.`,
        listeningCorrect: { l1: "Milka", l2: "Gray with white paws", l3:"Lying on the sofa"},
        pronunciation: "I have a little kitten."
    },

    A2: {
        reading: {
            text: "Tom lives in a small town near the mountains. Every morning, he walks to school with his friend Anna. They like to talk about animals.",
            correct: { q1: "Tom", q2: "Mountains", q3: "Anna" }
        },
        speaking: "Two children are walking near the mountains",
        listening: `Tom and Anna want to go to the zoo today, because Anna loves animals and Tom wants to see the monkeys.`,
        listeningCorrect: { l1: "Zoo", l2: "Animals", l3: "Monkeys" },
        pronunciation: "We are walking to the mountain village."
    },

    B1: {
        reading: {
            text: "Sarah enjoys traveling. Last summer she visited Spain, where she explored old streets, tasted traditional food, and learned a few Spanish words.",
            correct: { q1: "Spain", q2: "Food", q3: "Spanish" }
        },
        speaking: "A small cup is standing on a wooden table. Next to the cup, there is an open notebook",
        listening: `Two days ago, Sarah came back from Spain. She says that the trip was amazing and memorable, but the most, Anna liked the old streets and the local food`,
        listeningCorrect: { l1: "Spain", l2: "Streets", l3: "Food" },
        pronunciation: "Traveling helps people understand the world better."
    },

    B2: {
        reading: {
            text: "Technology has changed the way people work and communicate. Many companies now allow employees to work remotely, which increases flexibility and productivity.",
            correct: { q1: "Technology", q2: "Remotely", q3: "Flexibility" }
        },
        speaking: "People are working remotely using laptops and video calls",
        listening: `John: Working from home has made my life easier. Anna: Really? John: Yes, I can manage my time better and focus more.`,
        listeningCorrect: { l1: "Home", l2: "Time", l3: "Focus" },
        pronunciation: "Remote work improves productivity and work-life balance."
    }
};


/* ========= UTILITIES ========= */

function normalize(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();
}

/* Версія для слів: повертає список слів (чистих) */
function wordsList(s) {
    return normalize(s).split(/\s+/).filter(Boolean);
}

/* Порівняння символів (залишив як резерв) */
function compareByChar(ref, inp) {
    const a = normalize(ref);
    const b = normalize(inp);
    if (a.length === 0 && b.length === 0) return { percent: 100, matches: 0, total: 0 };
    if (a.length === 0) return { percent: 0, matches: 0, total: b.length };
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) matches++;
    }
    const percent = Math.round(matches / Math.max(a.length, b.length) * 100);
    return { percent, matches, total: Math.max(a.length, b.length) };
}

/* ========= WORD-LEVEL SPEAKING CHECK =========
   Логіка:
   - беремо слова з еталона (sampleWords) і створюємо map частот;
   - беремо слова з відповіді користувача (inputWords), і підраховуємо
     скільки еталонних слів було вказано (максимум — частота в еталоні).
   - процент = matches / sampleWords.length * 100
*/
function compareByWords(ref, inp) {
    const sampleWords = wordsList(ref);
    const inputWords = wordsList(inp);
    if (sampleWords.length === 0) return { percent: 0, matches: 0, total: 0 };

    // frequency map for sample
    const freq = {};
    sampleWords.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

    let matches = 0;
    inputWords.forEach(w => {
        if (freq[w] && freq[w] > 0) {
            matches++;
            freq[w]--;
        }
    });

    const percent = Math.round(matches / sampleWords.length * 100);
    return { percent, matches, total: sampleWords.length };
}


/* ========= TTS helpers ========= */

function speakText(text) {
    try {
        if (!('speechSynthesis' in window)) { alert('TTS не підтримується в цьому браузері.'); return; }
        // cancel previous speak to avoid overlap
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        const voices = speechSynthesis.getVoices();
        if (voices && voices.length) {
            const v = voices.find(x => /en/i.test(x.lang)) || voices[0];
            if (v) u.voice = v;
        }
        speechSynthesis.speak(u);
    } catch (e) {
        console.error('TTS error', e);
    }
}

function stopSpeech() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
}


/* ========= READING ========= */

function checkReading(level) {
    try {
        const correct = samples[level].reading.correct;
        let score = 0;

        const q1 = document.querySelector('input[name="reading_q1"]:checked');
        const q2 = document.querySelector('input[name="reading_q2"]:checked');
        const q3 = document.querySelector('input[name="reading_q3"]:checked');

        if (q1 && q1.value === correct.q1) score++;
        if (q2 && q2.value === correct.q2) score++;
        if (q3 && q3.value === correct.q3) score++;

        const percent = Math.round(score / 3 * 100);

        localStorage.setItem(level + "_Reading", percent);
        const resEl = document.getElementById("readingResult");
        if (resEl) resEl.textContent = `Результат: ${percent}% (${score}/3)`;

        // enable answers button (if present)
        const btn = document.getElementById('readingAnswerBtn');
        if (btn) btn.disabled = false;

    } catch (e) {
        console.error(e);
        alert('Помилка при перевірці Reading');
    }
}

/* ========= SPEAKING (WORD-LEVEL) ========= */

function checkSpeaking(level) {
    try {
        const inputEl = document.getElementById("speakTextInput");
        const user = (inputEl && inputEl.value) ? inputEl.value : "";
        const sample = samples[level].speaking || "";

        // use word-level comparison
        const r = compareByWords(sample, user);
        localStorage.setItem(level + "_Speaking", r.percent);

        const el = document.getElementById("speakingResult");
        if (el) el.textContent = `Слов правильно: ${r.matches}/${r.total} → ${r.percent}%`;

        const btn = document.getElementById('speakingAnswerBtn');
        if (btn) btn.disabled = false;
    } catch (e) {
        console.error('checkSpeaking error', e);
        alert('Помилка при перевірці Speaking');
    }
}

/* ========= LISTENING ========= */

function playDialogue(level) {
    const text = samples[level].listening || "";
    // ensure stop previous play
    stopSpeech();
    speakText(text);
}

function checkListening(level) {
    try {
        const c = samples[level].listeningCorrect;
        let score = 0;

        const a1 = document.querySelector('input[name="l1"]:checked');
        const a2 = document.querySelector('input[name="l2"]:checked');
        const a3 = document.querySelector('input[name="l3"]:checked');

        if (a1 && a1.value === c.l1) score++;
        if (a2 && a2.value === c.l2) score++;
        if (a3 && a3.value === c.l3) score++;

        const percent = Math.round(score / 3 * 100);
        localStorage.setItem(level + "_Listening", percent);

        const el = document.getElementById("listeningResult");
        if (el) el.textContent = `Результат: ${percent}% (${score}/3)`;

        const btn = document.getElementById('listeningAnswerBtn');
        if (btn) btn.disabled = false;
    } catch (e) {
        console.error(e);
        alert('Помилка при перевірці Listening');
    }
}

/* ========= PRONUNCIATION ========= */

let recognition = null;
let lastTranscript = "";
let isRecording = false;

function initRecognition() {
    if (recognition) return;
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) return;
    recognition = new R();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = e => {
        lastTranscript = e.results[0][0].transcript || "";
        const rt = document.getElementById("recognizedText");
        if (rt) rt.textContent = lastTranscript;
    };
    recognition.onerror = e => {
        console.error('rec error', e);
        alert('Помилка розпізнавання: ' + (e.error || ''));
        isRecording = false;
        updateRecBtn();
    };
    recognition.onend = () => {
        isRecording = false;
        updateRecBtn();
    };
}

function toggleRecording() {
    if (!recognition) initRecognition();
    if (!recognition) {
        alert("Розпізнавання голосу не підтримується в цьому браузері. Спробуйте Chrome/Edge.");
        return;
    }
    if (isRecording) {
        recognition.stop();
        isRecording = false;
    } else {
        lastTranscript = "";
        const rt = document.getElementById("recognizedText");
        if (rt) rt.textContent = '... запис ...';
        try {
            recognition.start();
            isRecording = true;
        } catch (e) {
            console.error('recognition start error', e);
            alert('Не вдалося почати запис: ' + (e.message || e));
            isRecording = false;
        }
    }
    updateRecBtn();
}

function updateRecBtn() {
    const b = document.getElementById('recBtn');
    if (!b) return;
    b.textContent = isRecording ? 'Зупинити' : 'Записати';
}

function checkPronunciation(level) {
    if (!lastTranscript) {
        alert("Немає розпізнаного тексту. Натисніть 'Записати' і промовте фразу.");
        return;
    }
    const sample = samples[level].pronunciation || "";
    // використовуємо символ-орієнтований метод тут (залишив як раніше)
    const r = compareByChar(sample, lastTranscript);
    localStorage.setItem(level + "_Writing", r.percent);

    const el = document.getElementById("pronResult");
    if (el) el.textContent = `Точність: ${r.percent}% (розпізнано: "${lastTranscript}")`;

    const btn = document.getElementById('pronAnswerBtn');
    if (btn) btn.disabled = false;
}

/* ========= RESULTS PAGE ========= */

function renderAllResults() {
    let html = "";
    ["A1", "A2", "B1", "B2"].forEach(level => {
        html += `<h3>${level}</h3>`;
        html += `Reading: ${localStorage.getItem(level + "_Reading") || "-"}%<br>`;
        html += `Speaking: ${localStorage.getItem(level + "_Speaking") || "-"}%<br>`;
        html += `Listening: ${localStorage.getItem(level + "_Listening") || "-"}%<br>`;
        html += `Writing: ${localStorage.getItem(level + "_Writing") || "-"}%<br><br>`;
    });
    const el = document.getElementById("allResults");
    if (el) el.innerHTML = html;
}

function clearResults() {
    ["A1", "A2", "B1", "B2"].forEach(level => {
        localStorage.removeItem(level + "_Reading");
        localStorage.removeItem(level + "_Speaking");
        localStorage.removeItem(level + "_Listening");
        localStorage.removeItem(level + "_Writing");
    });
    renderAllResults();
}

/* Ensure voices load in some browsers */
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};




