const { createApp, reactive } = Vue;

const API_BASE = "http://localhost:8001";

const LanguageStore = reactive({
  language: localStorage.getItem("language") || "de",
});

const t = (de, en) => (LanguageStore.language === "de" ? de : en);

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
    };
  },
  methods: {
    t,
    setTheme(mode) {
      this.theme = mode;
      localStorage.setItem("theme", mode);
      document.body.classList.toggle("dark-mode", mode === "dark");
    },
    setLanguage(lang) {
      this.language = lang;
      LanguageStore.language = lang;
      localStorage.setItem("language", lang);
    },
    // === Nur lokales Logout ===
    logout() {
      // Lokale Daten löschen
      localStorage.removeItem("selectedWGID");
      localStorage.removeItem("selectedWGName");
      localStorage.removeItem("wgList");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");

      this.message = this.t(
        "Erfolgreich ausgeloggt. Weiterleitung …",
        "Successfully logged out. Redirecting…"
      );

      // Nach 2 Sekunden zurück zur Login-Seite
      setTimeout(() => {
        window.location.href = "../Login/index.html";
      }, 2000);
    },
  

    /*
    async logout() {
      try {
        const res = await fetch(`${API_BASE}/user/logout`, {
          method: "POST",
          credentials: "include",
        });

        localStorage.clear();

        if (res.ok) {
          this.message = this.t(
            "Erfolgreich ausgeloggt. Weiterleitung …",
            "Successfully logged out. Redirecting…"
          );
          setTimeout(() => {
            window.location.href = "../Login/index.html";
          }, 2000);
        } else {
          this.message = this.t(
            "Fehler beim Ausloggen.",
            "Error logging out."
          );
        }
      } catch (err) {
        console.error("Logout-Fehler:", err);
        this.message = this.t(
          "Verbindungsfehler beim Ausloggen.",
          "Connection error during logout."
        );
      }
    },
    */
  },
  mounted() {
    document.body.classList.toggle("dark-mode", this.theme === "dark");
  },
}).mount("#app");
