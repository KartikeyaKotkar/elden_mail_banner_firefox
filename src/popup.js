document.addEventListener("DOMContentLoaded", () => {
  const soundToggle = document.getElementById("soundToggle");
  const colorOptions = document.querySelectorAll(".color-option");
  
  // Use browser API with chrome as fallback for cross-browser compatibility
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  // load preferences
  browserAPI.storage.sync.get(["soundEnabled", "bannerColor"]).then((prefs) => {
    soundToggle.checked = prefs.soundEnabled !== false; // default true -> with sound
    const selectedColor = prefs.bannerColor || "yellow";
    colorOptions.forEach(opt => {
      opt.classList.toggle("selected", opt.dataset.color === selectedColor);
    });
  }).catch(err => console.error("Error loading preferences:", err));

  // save sound toggle
  soundToggle.addEventListener("change", () => {
    browserAPI.storage.sync.set({ soundEnabled: soundToggle.checked })
      .catch(err => console.error("Error saving sound preference:", err));
  });

  // save color choice
  colorOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      colorOptions.forEach(c => c.classList.remove("selected"));
      opt.classList.add("selected");
      browserAPI.storage.sync.set({ bannerColor: opt.dataset.color })
        .catch(err => console.error("Error saving color preference:", err));
    });
  });
});