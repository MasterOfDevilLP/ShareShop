/**
 * Einstellungen (settings.js) – WG Verwaltung
 *
 * Zweck:
 * Diese Seite dient zur Verwaltung der aktuell ausgewählten WG in den Einstellungen.
 * Der Benutzer kann zwischen seinen WGs wechseln, einen Einladungslink erzeugen/teilen
 * und die WG verlassen.
 *
 * Haupt-Features:
 *  - WG laden & auswählen: User holen, WG-Details laden, Auswahl im Dropdown speichern
 *  - Einladungen: Invite-Link per API erzeugen und im UI zum Kopieren/Teilen bereitstellen
 *  - WG verlassen: User aus der ausgewählten WG entfernen (Backend) + lokale Daten bereinigen
 *
 * Hinweise:
 *  - Vue.js übernimmt State + UI-Binding
 *  - API-Aufrufe laufen über API_BASE mit Cookie-Session (credentials: "include")
 *  - Persistenz über localStorage: wgList, selectedWG, selectedWGName, inviteLinkfromAPI
 *  - WG Bild/Beschreibung werden optional lokal geladen (wg_image_<id>, wg_desc_<id>)
 */


console.log("settings.js loaded");
import { API_BASE } from "../config.js";

function normalizeWG(wg) {
  if (!wg) return null;
  return {
    ...wg,
    id: wg.id ?? wg.wid ?? wg._id,
  };
}

new Vue({
  el: "#setting",

  data: {
    baseUrl: window.location.origin,

    wgList: [],
    selectedWG: localStorage.getItem("selectedWG") || null,
    selectedWGName: localStorage.getItem("selectedWGName") || "WG auswählen",

    userId: null,
    newGroupName: "",
    wgUsers: [],

    inviteLinkfromAPI: localStorage.getItem("inviteLinkfromAPI") || "",

    showError(msg) {
      console.error("Fehler:", msg);
    },
  },

  async mounted() {
    await this.loadUserAndWGs();
    if (this.selectedWG) await this.createInviteLink();
  },

  computed: {
    
    wgImageLocal() {
      if (!this.selectedWG) return null;
      return localStorage.getItem(`wg_image_${this.selectedWG}`) || null;
    },

    wgDescLocal() {
      if (!this.selectedWG) return null;
      return localStorage.getItem(`wg_desc_${this.selectedWG}`) || null;
    },

    selectedWGDetails() {
      return (
        this.wgList.find((wg) => String(wg.id) === String(this.selectedWG)) ||
        null
      );
    },
  },

  methods: {
    async loadUserAndWGs() {
      // 1) user holen
      const meRes = await fetch(`${API_BASE}/user`, {
        credentials: "include",
      });

      if (!meRes.ok) {
        this.userId = null;
        this.wgList = [];
        this.selectedWG = null;
        this.selectedWGName = "WG auswählen";
        localStorage.removeItem("selectedWG");
        localStorage.removeItem("selectedWGName");
        return;
      }

      const me = await meRes.json().catch(() => ({}));
      this.userId = me?.uid ?? me?.id ?? null;

      // 2) wid-liste
      let wids = me?.wid;
      if (typeof wids === "string") {
        wids = wids
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (!Array.isArray(wids)) wids = [];

      // 3) wg-details laden
      const wgs = [];
      for (const wid of wids) {
        try {
          const r = await fetch(`${API_BASE}/wg/${wid}`, {
            credentials: "include",
          });
          if (!r.ok) continue;

          const wgData = await r.json();
          const norm = normalizeWG(wgData);
          if (norm?.id) wgs.push(norm);
        } catch (e) {
          console.warn("WG fetch failed for", wid, e);
        }
      }

      this.wgList = wgs;
      localStorage.setItem("wgList", JSON.stringify(this.wgList));

      // 4) selectedWG validieren
      const savedWG = localStorage.getItem("selectedWG");
      const exists =
        savedWG && this.wgList.some((w) => String(w.id) === String(savedWG));

      if (exists) {
        const sel = this.wgList.find((w) => String(w.id) === String(savedWG));
        this.selectedWG = sel.id;
        this.selectedWGName = sel.name || "WG auswählen";
      } else if (this.wgList.length > 0) {
        this.selectedWG = this.wgList[0].id;
        this.selectedWGName = this.wgList[0].name || "WG auswählen";
      } else {
        this.selectedWG = null;
        this.selectedWGName = "WG auswählen";
      }

      if (this.selectedWG) {
        localStorage.setItem("selectedWG", this.selectedWG);
        localStorage.setItem("selectedWGName", this.selectedWGName);
      } else {
        localStorage.removeItem("selectedWG");
        localStorage.removeItem("selectedWGName");
      }
    },

    selectWG(id) {
      const wg = this.wgList.find((w) => String(w.id) === String(id));
      if (!wg) return;

      this.selectedWG = wg.id;
      this.selectedWGName = wg.name || "WG auswählen";

      localStorage.setItem("selectedWG", this.selectedWG);
      localStorage.setItem("selectedWGName", this.selectedWGName);

      this.createInviteLink();
    },
    async leaveWG() {
  if (!this.selectedWG) {
    alert("Keine WG ausgewählt.");
    return;
  }

  try {
    // user nochmal holen
    const meRes = await fetch(`${API_BASE}/user`, {
      method: "GET",
      credentials: "include",
    });

    if (!meRes.ok) {
      alert("Nicht eingeloggt (GET /user fehlgeschlagen).");
      this.userId = null;
      return;
    }

    const me = await meRes.json().catch(() => ({}));
    const uid = me?.uid ?? me?.id ?? null;

    if (!uid) {
      alert("User-ID fehlt in /user Response.");
      return;
    }

    this.userId = uid;

    const wg = this.wgList.find((w) => String(w.id) === String(this.selectedWG));
    const wgName = wg?.name || "diese WG";

    if (!confirm(`Möchtest du "${wgName}" wirklich verlassen?`)) return;

    const res = await fetch(`${API_BASE}/wg/${this.selectedWG}/user/${uid}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let msg = text || `HTTP ${res.status}`;
      try {
        const j = JSON.parse(text);
        if (j?.message) msg = j.message;
      } catch (_) {}
      alert(`Fehler beim Verlassen der WG:\n\n${msg}`);
      return;
    }

    // lokal updaten
    this.wgList = this.wgList.filter(
      (w) => String(w.id) !== String(this.selectedWG)
    );
    localStorage.setItem("wgList", JSON.stringify(this.wgList));

    this.selectedWG = null;
    this.selectedWGName = "WG auswählen";
    localStorage.removeItem("selectedWG");
    localStorage.removeItem("selectedWGName");

    alert("Du hast die WG verlassen.");
  } catch (err) {
    console.error("leaveWG exception:", err);
    alert("Fehler beim Verlassen der WG: " + err.message);
  }
},


    async createInviteLink() {
      if (!this.selectedWG) {
        this.showError("Bitte zuerst eine WG auswählen.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/wg/${this.selectedWG}/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ expires: null, targetUser: null }),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(text || `Fehler ${response.status}`);
        }

        const data = await response.json().catch(() => ({}));

        this.inviteLinkfromAPI = `${window.location.origin}/invite/${data.id}`;
        localStorage.setItem("inviteLinkfromAPI", this.inviteLinkfromAPI);
      } catch (err) {
        console.error("Invite Fehler:", err.message);
      }
    },
  },
});
