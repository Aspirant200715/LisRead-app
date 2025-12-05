//initializing variables 
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const saveBtn  = document.getElementById("saveBtn");
const outputEl = document.getElementById("speechOutput");
const notesContainer = document.getElementById("notesContainer");
let readyToSaveOnShift = false;

// Feature detection: SpeechRecognition vendor prefix
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  // If unsupported, disable UI and show a message
  startBtn.disabled = true;
  saveBtn.disabled = true;
  outputEl.placeholder = "SpeechRecognition not supported in this browser.";
  console.warn("SpeechRecognition API not available in this browser.");
} 

// App state
let recognition = null;
let isListening = false;
let interimTranscript = "";   // live (temporary) text
let finalTranscript = "";    
let autoRestart = true;      

//Notes data
let notes = [];

function createRecognition() {
  if (!SpeechRecognition) return null;
  const r = new SpeechRecognition();
  r.continuous = true;        
  r.interimResults = true;     
  r.lang = "en-IN";         
  return r;
}

function startListening() {
  if (!SpeechRecognition) return;
  if (!recognition) recognition = createRecognition();

  if (isListening) return;

  finalTranscript = outputEl.value || "";
  interimTranscript = "";

  recognition.onstart = () => {
    isListening = true;
    updateUIOnStart();
    readyToSaveOnShift = false;
  };

  recognition.onresult = (event) => {
    let interim = "";
    let finalParts = [];

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (res.isFinal) {
        finalParts.push(res[0].transcript);
      } else {
        interim += res[0].transcript;
      }
    }

    if (finalParts.length) {
      finalTranscript += (finalParts.join(" ") + " ");
      outputEl.value = finalTranscript + interim;
      interimTranscript = "";
    } else {
      interimTranscript = interim;
      outputEl.value = finalTranscript + interimTranscript;
    }

    outputEl.scrollTop = outputEl.scrollHeight;
  };

  recognition.onerror = (errEvent) => {
    console.error("SpeechRecognition error", errEvent.error);
    if (errEvent.error === "not-allowed" || errEvent.error === "service-not-allowed") {
      alert("Microphone access denied. Allow microphone permissions.");
      stopListening({manual: true});
    }
  };

  recognition.onend = () => {
    isListening = false;
    updateUIOnStop();

    if (autoRestart && !stopBtn.dataset.manualStop) {
      recognition = createRecognition();
      setTimeout(() => {
        try { recognition.start(); } catch (e) {}
      }, 250);
    } else {
      stopBtn.dataset.manualStop = "";
    }
     readyToSaveOnShift = true;
  };

  try {
    recognition.start();
  } catch (e) {
    console.warn("recognition.start() error:", e);
  }
}

// Stop listening
function stopListening({manual = true} = {}) {
  if (!recognition) return;

  autoRestart &&= !manual;
  if (manual) stopBtn.dataset.manualStop = "true";

  try {
    recognition.stop();
  } catch (e) {
    console.warn("recognition.stop() error:", e);
    isListening = false;
    updateUIOnStop();
  }
}

// UI updates
function updateUIOnStart() {
  startBtn.style.display = "none";
  stopBtn.style.display = "inline-flex";
  document.querySelector(".listen-label").textContent = "Listening…";

  stopBtn.classList.add("listening");
}

function updateUIOnStop() {
  startBtn.style.display = "inline-flex";
  stopBtn.style.display = "none";
  document.querySelector(".listen-label").textContent = "Start Listening";

  stopBtn.classList.remove("listening");
}

function saveCurrentNote() {
  const text = outputEl.value.trim();
  if (!text) return alert("Nothing to save. Speak first or type a note.");

  const note = {
    id: Date.now(),
    text,
    createdAt: new Date().toISOString()
  };

  notes.unshift(note);
  persistNotes();
  renderNotes();


  outputEl.value = "";
  finalTranscript = "";
  interimTranscript = "";
}
//insert into local storage 
function persistNotes() {
  try {
    localStorage.setItem("lisread_notes", JSON.stringify(notes));
  } catch (e) {
    console.error("Could not save notes in localStorage", e);
  }
}

function loadNotes() {
  const raw = localStorage.getItem("lisread_notes");
  if (!raw) return;

  try {
    const arr = JSON.parse(raw);      //[parsing]
    if (Array.isArray(arr)) notes = arr;
  } catch (e) {
    console.error("Could not parse saved notes", e);
  }
}

function renderNotes() {
  notesContainer.innerHTML = "";
  if (!notes.length) {
    notesContainer.innerHTML = `<p style="color:#666;text-align:center">No notes yet</p>`;
    return;
  }

  for (const note of notes) {
    const card = document.createElement("div");
    card.className = "note-card";

    const ts = document.createElement("div");
    ts.className = "timestamp";
    ts.textContent = new Date(note.createdAt).toLocaleString();

    const textEl = document.createElement("div");
    textEl.className = "note-text";
    textEl.textContent = note.text;

    const actions = document.createElement("div");
    actions.style.marginTop = "8px";
    actions.style.display = "flex";
    actions.style.justifyContent = "flex-end";
    actions.style.gap = "8px";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.background = "#e53935";
    delBtn.style.color = "white";
    delBtn.style.border = "none";
    delBtn.style.padding = "6px 10px";
    delBtn.style.borderRadius = "6px";
    delBtn.style.cursor = "pointer";

    delBtn.onclick = () => {
      if (!confirm("Delete this note?")) return;
      notes = notes.filter(n => n.id !== note.id);
      persistNotes();
      renderNotes();
    };

    actions.appendChild(delBtn);

    card.appendChild(ts);
    card.appendChild(textEl);
    card.appendChild(actions);

    notesContainer.appendChild(card);
  }
}

// Event listeners
startBtn.addEventListener("click", () => {
  stopBtn.dataset.manualStop = "";
  autoRestart = true;
  startListening();
});

stopBtn.addEventListener("click", () => {
  stopListening({manual: true});
});
saveBtn.addEventListener("click", saveCurrentNote);


window.addEventListener("beforeunload", () => {
  persistNotes();
  try { recognition && recognition.stop(); } catch (e) {}
});

// keyboard shortcuts
document.addEventListener("keydown", (e) => {

    // SHIFT → Save note (only when recognition finished)
    if (e.key === "Shift" && readyToSaveOnShift) {
        saveCurrentNote();
        readyToSaveOnShift = false; // avoid double-save
    }

    // SPACE → Start listening (only if not already listening)
    if (e.code === "Space" && !isListening) {
        e.preventDefault(); // prevent page scroll
        stopBtn.dataset.manualStop = "";
        autoRestart = true;
        startListening();
    }

    // ESC → Stop listening (only if listening)
    if (e.key === "Escape" && isListening) {
        stopListening({ manual: true });
    }

    // CTRL + ENTER → Save note normally
    if (e.ctrlKey && e.key === "Enter") {
        saveCurrentNote();
    }

    // CTRL + SHIFT + S → Save note + Clear textarea instantly
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        saveCurrentNote();

  // Extra: Clear input immediately
        outputEl.value = "";
        finalTranscript = "";
        interimTranscript = "";
    }
});






