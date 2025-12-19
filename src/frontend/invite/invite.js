import { API_BASE } from "../config.js";
console.log("API_BASE=", API_BASE);

new Vue({
  el: "#app",

  data: {
    ivid: null,                                      // Token aus dem Invite-Link
    selectedWG: localStorage.getItem("selectedWGID") || null,
    wgName: localStorage.getItem("selectedWGName") || "WG auswählen",
    joining: false,                                  // Join-Status
    loaded: false,                                   // Lade-Status der Einladung
    errorMsg: "",
    successMsg: "",
  },

  mounted: async function () {
    // Token aus der URL abrufen
    const params = new URLSearchParams(window.location.search);
    this.ivid = params.get("token");
    console.log("ivid=", this.ivid);

    if (!this.ivid) {
      this.errorMsg = "Ungültiger Invite-Link.";
      this.loaded = true;
      return;
    }

    // Login prüfen
    const loggedIn = await this.checkLogin();
    if (!loggedIn) return;

    // Wenn eingeloggt → Invite-Info abrufen
    this.fetchInvite();
  },

  methods: {
    /**
     * Prüft, ob der Benutzer eingeloggt ist
     * Wenn nicht → Weiterleitung zur Login-Seite
     * Wenn ja → true zurückgeben
     */
    async checkLogin() {
      try {
        const res = await fetch(`${API_BASE}/user`, {
          credentials: "include",
        });

        if (!res.ok) {
          localStorage.setItem("redirectAfterLogin", window.location.href);
          window.location.href = "../index.html";
          return false;
        }

        return true;
      } catch (err) {
        console.error("Fehler beim Login-Check:", err);
        window.location.href = "../index.html";
        return false;
      }
    },

    /**
     * Lädt die Invite-Informationen vom Backend (inkl. WG-Name)
     */
    async fetchInvite() {
      try {
        const res = await fetch(`${API_BASE}/invite/${this.ivid}`, { credentials: "include" });

        if (!res.ok) {
          this.errorMsg = "Einladung nicht gefunden oder abgelaufen.";
          this.loaded = true;
          return;
        }

        const data = await res.json();
        this.wgName = data.wgname || "WG";
        this.loaded = true;
      } catch (err) {
        console.error(err);
        this.errorMsg = "Fehler beim Laden der Einladung.";
        this.loaded = true;
      }
    },

    /**
     * Tritt der WG über den Invite-Link bei
     */
    async joinWG() {
      this.joining = true;
      try {
        const res = await fetch(`${API_BASE}/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: this.ivid }),
        });

        if (!res.ok) {
          const errText = await res.text();
          this.errorMsg = "Teilnahme fehlgeschlagen: Du bist schon Mitglied der WG";
          console.error("Fehler beim Beitreten:", errText);
          this.joining = false;
          return;
        }

        this.successMsg = "Du bist jetzt Mitglied der WG!";
        setTimeout(() => {
          window.location.href = "../Startseitendesign/startseite.html";
        }, 1500);
      } catch (err) {
        console.error(err);
        this.errorMsg = "Fehler beim Beitreten.";
        this.joining = false;
      }
    }
  }
});
