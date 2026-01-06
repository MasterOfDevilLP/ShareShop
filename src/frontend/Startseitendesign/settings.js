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

 *  Ownerrechte sichtbar/nutzbar machen (Frontend-only)
 * - Ownerstatus wird über "harmlosen" PATCH-Check ermittelt:
 *   403 => kein Owner, ok => Owner
 * - Ownerstatus wird in State gespeichert (isOwner) + optional gecached
 * - UI reagiert auf WG-Wechsel (watch selectedWG)
 * - Nicht-Owner bekommen Feedback via requireOwner()
 */
console.log("settings.js loaded");
import { API_BASE } from "../config.js";

function normalizeWG(wg) {
  if (!wg) return null;
  return { ...wg, id: wg.id ?? wg.wid ?? wg._id };
}

new Vue({
  el: "#setting",

  data: {
    baseUrl: window.location.origin,

    wgList: [],
    selectedWG: localStorage.getItem("selectedWG") || null,
    selectedWGName: localStorage.getItem("selectedWGName") || "WG auswählen",

    userId: null,
    wgUsers: [],

    inviteLinkfromAPI: localStorage.getItem("inviteLinkfromAPI") || "",

    // Modal (nur verlassen)
    showWgActionModal: false,
    wgActionBusy: false,

    // Info Modal
    showInfoModal: false,
    infoTitle: "",
    infoText: "",
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
    showError(msg) {
      console.error("Fehler:", msg);
    },

    async loadUserAndWGs() {
      const meRes = await fetch(`${API_BASE}/user`, { credentials: "include" });

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

      let wids = me?.wid;
      if (typeof wids === "string") {
        wids = wids.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (!Array.isArray(wids)) wids = [];

      const wgs = [];
      for (const wid of wids) {
        try {
          const r = await fetch(`${API_BASE}/wg/${wid}`, { credentials: "include" });
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

      const savedWG = localStorage.getItem("selectedWG");
      const exists = savedWG && this.wgList.some((w) => String(w.id) === String(savedWG));

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

    openWgActionModal() {
      this.showWgActionModal = true;
    },

    closeWgActionModal() {
      this.showWgActionModal = false;
      this.wgActionBusy = false;
    },

    async confirmWgAction() {
      if (this.wgActionBusy) return;
      this.wgActionBusy = true;

      try {
        await this.leaveWG(true);
      } finally {
        this.closeWgActionModal();
      }
    },

    async leaveWG(confirmFromModal = false) {
      if (!this.selectedWG) {
        this.openInfoModal("Hinweis", "Keine WG ausgewählt.");
        return;
      }

      if (!confirmFromModal) {
        this.openWgActionModal();
        return;
      }

      try {
        const meRes = await fetch(`${API_BASE}/user`, { method: "GET", credentials: "include" });
        if (!meRes.ok) {
          this.openInfoModal("Nicht eingeloggt", "GET /user ist fehlgeschlagen.");
          this.userId = null;
          return;
        }

        const me = await meRes.json().catch(() => ({}));
        const uid = me?.uid ?? me?.id ?? null;

        if (!uid) {
          this.openInfoModal("Fehler", "User-ID fehlt in /user Response.");
          return;
        }

        this.userId = uid;

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
          this.openInfoModal("Fehler", `Fehler beim Verlassen der WG:\n\n${msg}`);
          return;
        }

        const removedId = String(this.selectedWG);

        this.wgList = this.wgList.filter((w) => String(w.id) !== removedId);
        localStorage.setItem("wgList", JSON.stringify(this.wgList));

        this.selectedWG = null;
        this.selectedWGName = "WG auswählen";

        localStorage.removeItem("selectedWG");
        localStorage.removeItem("selectedWGName");

        this.openInfoModal("Erledigt", "Du hast die WG verlassen.");
      } catch (err) {
        console.error("leaveWG exception:", err);
        this.openInfoModal("Fehler", "Fehler beim Verlassen der WG: " + err.message);
      }
    },

    async deleteWG(confirmFromModal = false) {
  if (!this.selectedWG) {
    this.openInfoModal("Hinweis", "Keine WG ausgewählt.");
    return;
  }

  // Erst Modal öffnen (Bestätigung)
  if (!confirmFromModal) {
    this.openWgActionModal("delete");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/wg/${this.selectedWG}`, {
      method: "DELETE",
      credentials: "include",
    });

    // Backend entscheidet: falls verboten
    if (res.status === 403) {
      const text = await res.text().catch(() => "");
      this.openInfoModal("Nicht erlaubt", text || "Du darfst diese WG nicht löschen.");
      return;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      this.openInfoModal(
        "Fehler",
        text || `Fehler beim Löschen (HTTP ${res.status})`
      );
      return;
    }

    const deletedId = String(this.selectedWG);

    // WG aus Liste entfernen
    this.wgList = this.wgList.filter((w) => String(w.id) !== deletedId);
    localStorage.setItem("wgList", JSON.stringify(this.wgList));

    // Auswahl zurücksetzen
    this.selectedWG = null;
    this.selectedWGName = "WG auswählen";
    localStorage.removeItem("selectedWG");
    localStorage.removeItem("selectedWGName");

    // Optional: Invite-Link löschen
    this.inviteLinkfromAPI = "";
    localStorage.removeItem("inviteLinkfromAPI");

    this.openInfoModal("Erledigt", "WG gelöscht.");
  } catch (err) {
    console.error("deleteWG exception:", err);
    this.openInfoModal("Fehler", "Fehler beim Löschen der WG: " + err.message);
  }
},


    openWgActionModal(mode) {
      this.wgActionMode = mode; // "leave" | "delete"
      this.showWgActionModal = true;
    },

    async confirmWgAction() {
      if (this.wgActionBusy) return;
      this.wgActionBusy = true;

      try {
        if (this.wgActionMode === "delete") {
          await this.deleteWG(true);
        } else {
          await this.leaveWG(true);
        }
      } finally {
        this.closeWgActionModal();
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

    openInfoModal(title, text) {
      this.infoTitle = title || "Hinweis";
      this.infoText = text || "";
      this.showInfoModal = true;
    },

    closeInfoModal() {
      this.showInfoModal = false;
      this.infoTitle = "";
      this.infoText = "";
    },
  },
});
