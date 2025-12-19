import { API_BASE } from "../config.js";
console.log("API_BASE=", API_BASE);

new Vue({
  el: "#app",

  /**
   * Datenmodell der Vue-App
   */
  data: {
    ivid: null,
    selectedWG: localStorage.getItem("selectedWGID") || null,
    wgName: localStorage.getItem("selectedWGName") || "WG auswählen",
    joining: false,
    loaded: false,
    errorMsg: "",
    successMsg: "",
  },

  mounted() {
    const params = new URLSearchParams(window.location.search);
    this.ivid = params.get("token");
    console.log("ivid=", this.ivid);
    if (!this.ivid) {
      this.errorMsg = "Ungültiger Invite-Link.";
      this.loaded = true;
      return;
    }
    this.fetchInvite();
  },

  methods: {
    //Nehmen die Informationen der Einladung vom Backend: inklusiv WG-Name
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
          window.location.href = "..index.html";
        }, 1500);
      } catch (err) {
        console.error(err);
        this.errorMsg = "Fehler beim Beitreten.";
        this.joining = false;
      }
    }
  }
});
