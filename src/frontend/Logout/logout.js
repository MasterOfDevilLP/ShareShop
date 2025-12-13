import { API_BASE } from '../config.js';
const { createApp, reactive } = Vue;

// === Sprache & Übersetzung ===
const LanguageStore = reactive({
  language: localStorage.getItem("language") || "de",
});

const t = (de, en) => (LanguageStore.language === "de" ? de : en);

// === App ===
createApp({
  data() {
    return {
      user: {
        name: localStorage.getItem("userName") || "User Name",
        email: localStorage.getItem("userEmail") || "abc@gmail.com",
      },
      theme: localStorage.getItem("theme") || "light",
      language: LanguageStore.language,
      message: "",
      isLoggingOut: false,
    };
  },

  methods: {
    t,

    // Theme wechseln (unvollständig)
    setTheme(mode) {
      this.theme = mode;
      localStorage.setItem("theme", mode);
      document.body.classList.toggle("dark-mode", mode === "dark");
    },

    // Sprache wechseln 
    setLanguage(lang) {
      this.language = lang;
      LanguageStore.language = lang;
      localStorage.setItem("language", lang);
    },

    //  Logout mit Bestätigung, Token-Wipe und API-Request
    async logout() {
      // Nutzer bestätigen lassen
      const confirmLogout = confirm(
        this.t("Möchtest du dich wirklich ausloggen?", "Are you sure you want to log out?")
      );
      if (!confirmLogout) return;

      this.isLoggingOut = true;
      this.message = "";

      //Lokales Token & Daten löschen
      localStorage.removeItem("selectedWGID");
      localStorage.removeItem("selectedWGName");
      localStorage.removeItem("wgList");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");

      //Versuch, Backend zu informieren (optional)
      try {
        const res = await fetch(`${API_BASE}/user/logout`, { //?? API endpoint
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          this.message = this.t(
            "Erfolgreich ausgeloggt. Weiterleitung …",
            "Successfully logged out. Redirecting…"
          );
        } else {
          this.message = this.t(
            "Abmeldung fehlgeschlagen, aber lokale Daten wurden gelöscht.",
            "Logout failed on server, but local session cleared."
          );
        }
      } catch (err) {
        console.warn("Kein Serverkontakt:", err);
        this.message = this.t(
          "Kein Serverkontakt – du wurdest lokal ausgeloggt.",
          "No server connection – logged out locally."
        );
      }

      //Weiterleitung
      setTimeout(() => {
        window.location.href = "../Login/index.html";
      }, 2000);
    },
  },

  mounted() {
    document.body.classList.toggle("dark-mode", this.theme === "dark");
  },
}).mount("#app");
