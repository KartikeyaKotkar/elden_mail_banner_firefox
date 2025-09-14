
console.log("Elden Mail Banner content.js loaded!");

// Use browser API with chrome as fallback for cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// pre-load the sound file
const soundUrl = browserAPI.runtime.getURL("src/assets/elden_ring_sound.mp3");

// dictionary of "Send" keywords in various languages
const keywords = ["Invia","Send","傳送","发送","送信","보내기","Enviar","Senden","Envoyer","Отправить","إرسال","ส่ง","Skicka"];

// default settings
let soundEnabled = true;
let bannerColor = "yellow";

// load settings on startup
browserAPI.storage.sync.get(["soundEnabled", "bannerColor"]).then((prefs) => {
    soundEnabled = prefs.soundEnabled !== false;
    bannerColor = prefs.bannerColor || "yellow";
}).catch(err => console.error("Error loading settings:", err));

// update in real-time the settings if changed from the popup
browserAPI.storage.onChanged.addListener((changes) => {
    if (changes.soundEnabled) {
        soundEnabled = changes.soundEnabled.newValue !== false;
    }
    if (changes.bannerColor) {
        bannerColor = changes.bannerColor.newValue || "yellow";
    }
});


function showEldenRingBanner(type = 'email') {
    console.log("Banner function called");

    const banner = document.createElement('div');
    banner.id = 'elden-ring-banner';
    const imgPath = browserAPI.runtime.getURL(
        type === 'subscribe' 
            ? 'src/assets/youtuber_subscribed.png'
            : `src/assets/email_sent_${bannerColor}.png`
    );
    const img = document.createElement('img');
    img.src = imgPath;
    img.alt = type === 'subscribe' ? 'Subscribed' : 'Email Sent';
    banner.appendChild(img);
    document.body.appendChild(banner);
    console.log("Banner appended");

    if (soundEnabled) {
        try {
            const audio = new Audio();
            audio.volume = 0.35;
            audio.src = soundUrl;
            
            // Add event listeners to better handle errors
            audio.addEventListener('error', (e) => {
                console.error("Audio error:", e.target.error);
            });
            
            // Load the audio first, then play
            audio.load();
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error("Error playing sound:", err);
                });
            }
        } catch (err) {
            console.error("Error setting up audio:", err);
        }
    }

    setTimeout(() => banner.classList.add('show'), 50);
    setTimeout(() => {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 500);
    }, 3000);
}

// gmail observer
const gmailObserver = new MutationObserver(() => {
    document.querySelectorAll('div[role="button"], button[role="button"]').forEach(btn => {
        // take aria-label, data-tooltip and innerText
        const label = btn.getAttribute("aria-label") || "";
        const tooltip = btn.getAttribute("data-tooltip") || "";
        const text = (btn.innerText || "").trim();

        // match: if label, tooltip or text start with a keyword
        const isSendBtn = keywords.some(k =>
        label.trim().toLowerCase().startsWith(k.toLowerCase()) ||
        tooltip.trim().toLowerCase().startsWith(k.toLowerCase()) ||
        text.toLowerCase().startsWith(k.toLowerCase())
        );

        if (isSendBtn && !btn.dataset.eldenRingAttached) {
        btn.addEventListener("click", () => {
            console.log("Gmail send button clicked");
            setTimeout(showEldenRingBanner, 500);
        });
        btn.dataset.eldenRingAttached = "true";
        }
    });
});
gmailObserver.observe(document.body, { childList: true, subtree: true });

// outlook observer
const outlookObserver = new MutationObserver(() => {
    document.querySelectorAll('button, div[role="button"]').forEach(btn => {
        // take aria-label, data-tooltip and innerText
        const title = btn.getAttribute("title") || "";
        const label = btn.getAttribute("aria-label") || "";
        const text = (btn.innerText || "").trim();

        // match: if label, tooltip or text start with a keyword
        const isSendBtn = keywords.some(k =>
        title.trim().toLowerCase().startsWith(k.toLowerCase()) ||
        label.trim().toLowerCase().startsWith(k.toLowerCase()) ||
        text.toLowerCase().startsWith(k.toLowerCase())
        );

        if (isSendBtn && !btn.dataset.eldenRingAttached) {
        btn.addEventListener('click', () => {
            console.log("Outlook send button clicked");
            setTimeout(showEldenRingBanner, 500);
        });
        btn.dataset.eldenRingAttached = "true";
        }
    });
});
outlookObserver.observe(document.body, { childList: true, subtree: true });

const youtubeObserver = new MutationObserver(() => {
    document.querySelectorAll('yt-icon-button, button, div[role="button"]').forEach(btn => {
        // take aria-label and innerText
        const label = btn.getAttribute("aria-label") || "";
        const text = (btn.innerText || "").trim();
        
        // Check for both send feedback and subscribe buttons
        const isSendFeedbackBtn = /send feedback/i.test(label) || /send feedback/i.test(text);
        const isSubscribeBtn = /^subscribe$/i.test(text) || /^subscribe$/i.test(label);

        if ((isSendFeedbackBtn || isSubscribeBtn) && !btn.dataset.eldenRingAttached) {
            btn.addEventListener('click', () => {
                const action = isSubscribeBtn ? "subscribe" : "send feedback";
                console.log(`YouTube ${action} button clicked`);
                setTimeout(() => showEldenRingBanner(action), 500);
            });
            btn.dataset.eldenRingAttached = "true";
        }
    });
});
youtubeObserver.observe(document.body, { childList: true, subtree: true })