# LisRead-app

A clean and modern web application that converts your speech into text in real-time, lets you save notes, and provides smart keyboard shortcuts for fast workflows.

LisRead is built using vanilla JavaScript, HTML, CSS, and the Web Speech Recognition API, making it lightweight and easy to understand for beginners and useful for production-level learning.

🚀 Features
🎤 Real-Time Speech Recognition

Converts speech to text instantly

Supports continuous and interim results

Works smoothly with the browser microphone

📝 Notes Saving System

Save spoken text instantly as a note

Notes are stored in localStorage

Notes persist even after reloading the page

Delete notes anytime

⌨️ Keyboard Shortcuts

A professional workflow with powerful shortcuts:

Action	Shortcut
Start Listening	Space
Stop Listening	Esc
Save Note (if recognition ended)	Shift
Save Note Anytime	Ctrl + Enter
Save + Clear	Ctrl + Shift + S
Open Shortcuts Popup	Click the floating ⌨️ button
🎛️ Modern Floating UI Elements

Floating keyboard-shortcut help button

Animated mic button while listening

Clean popup for shortcuts

💾 LocalStorage Integration

Notes are saved permanently in the browser

Data is loaded automatically on startup

No backend needed

🏗️ Tech Stack
Component	Technology
Speech Recognition	Web Speech API (webkitSpeechRecognition)
UI & Logic	Vanilla JavaScript
Styling	CSS3 (Inter + Roboto fonts)
Storage	LocalStorage
📂 Project Structure
lisread/
│── index.html        # Main UI
│── style.css         # Styles & font usage
│── script.js         # Speech recognition + notes logic
└── assets/           # (optional) icons, images

🧠 How It Works
1. Speech Engine Setup

The app initializes SpeechRecognition using:

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

2. Live Transcription

As the user speaks:

interimTranscript shows live text

finalTranscript stores confirmed speech

3. Saving Notes

When saving:

A new object { id, text, createdAt } is created

Stored in localStorage

Immediately rendered to the notes list

4. Keyboard Shortcuts

Global key listeners improve speed and accessibility.

📸 Screenshots (optional to add later)

You can add UI screenshots here once you capture them.

🔧 How to Run Locally

Just open the project folder and run:

index.html


No server, dependencies, or installations needed.

⚠️ Browser Support

SpeechRecognition works best in:

Chrome (recommended)

Edge

Opera

❌ Not supported in Firefox or Safari yet.

🧩 Future Enhancements

You can optionally list improvements:

Export notes as PDF

Sync notes with cloud storage

Dark / Light theme toggle

Editable notes

Auto-punctuation

🏁 Author

Developed with ❤️ using vanilla JS, aiming for a clean and modern UX.
