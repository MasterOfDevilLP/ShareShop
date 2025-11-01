/**
 * Startseite der WG-Listen-App
 *
 * Zweck:
 * Diese Seite ermöglicht dem Benutzer, seine mehrere Wohngemeinschaften (WGs) zu verwalten,
 * Listen anzulegen und bestehende Listen zu verwalten. Einladungen können über Link
 * oder QR-Code geteilt werden. 
 *
 * Haupt-Features:
 *  - WG-Verwaltung: Anzeigen, Auswählen, Erstellen
 *  - Liste verwalten: Hinzufügen, Umbenennen, Öffnen
 *  - Einladungen: Kopieren des Invite-Links, QR-Code, Email
 *
 * Hinweise:
 *  - Vue.js wird für die Datenbindung zwischen UI und Daten genutzt
 *  - API-Aufrufe erfolgen über die Basis-URL API_BASE
 *  - Einige Daten werden lokal im localStorage gespeichert
 */
console.log("app.js loaded", location.href);

import { API_BASE } from "../config.js";

function wgIdOf(w) {
  return w?.id ?? w?.wid ?? w?._id;
}

function listIdOf(l) {
  return l?.lid ?? l?.id ?? l?._id;
}

new Vue({
  el: "#app",

  data: {
    // Daten
    userId: null,
    wgList: [],
    selectedWG: null,
    selectedWGName: "WG auswählen",
    lists: [],

    // UI
    showPopup: false,
    showCreateGroupModal: false,
    showListOptions: false,
    showRenameModal: false,
    selectedList: null,

    // Form (Liste)
    newList: { name: "" },
    touched: { name: false },
    renameListName: "",

    // Dropdown
    wgDropdownOpen: false,

    // Form (WG)
    newGroup: {
      name: "",
      description: "",
      preview: null,     // Base64 für Preview + localStorage
      imageFile: null,   // nur lokal
    },
    errors: {
      name: null,
      description: null,
    },
    formValid: false,
    isSaving: false,
    saveSuccess: false,
    saveError: null,

    // Invite / Share
    baseUrl: window.location.origin,
    showCopyToast: false,
    showEmailInput: false,
    emailToShare: "",
    inviteLinkfromAPI: localStorage.getItem("inviteLinkfromAPI") || "",
    token: "",
    frontendLink: "",
  },

  computed: {
    isListValid() {
      return this.newList.name.trim() !== "";
    },
  },

  async mounted() {
    try {
      await this.loadUserAndWGs();

      if (this.selectedWG) {
        await this.fetchLists(this.selectedWG);
      }

      // Invite-Link aus localStorage initialisieren (falls vorhanden)
      this.inviteLinkfromAPI = localStorage.getItem("inviteLinkfromAPI") || "";
      this.rebuildFrontendInviteLinkFromStored();
    } catch (e) {
      console.error("mounted crashed:", e);
      this.wgList = [];
      this.lists = [];
      this.selectedWG = null;
      this.selectedWGName = "WG auswählen";
    }
  },

  methods: {
    // damit Startseite.html :key="wgIdOf(wg)" sicher funktioniert
    wgIdOf,

    // -----------------------------
    // Helper: frontendLink aus inviteLinkfromAPI bauen
    // -----------------------------
    rebuildFrontendInviteLinkFromStored() {
      if (!this.inviteLinkfromAPI) {
        this.token = "";
        this.frontendLink = "";
        localStorage.removeItem("frontendLink");
        return;
      }
      this.token = this.inviteLinkfromAPI.split("/").pop();
      this.frontendLink = `${this.baseUrl}/invite/invite.html?token=${this.token}`;
      localStorage.setItem("frontendLink", this.frontendLink);
    },

    // -----------------------------
    // Bootstrap: User + WGs laden
    // -----------------------------
    async loadUserAndWGs() {
      const meRes = await fetch(`${API_BASE}/user`, { credentials: "include" });

      if (!meRes.ok) {
        this.userId = null;
        this.wgList = [];
        this.lists = [];
        this.selectedWG = null;
        this.selectedWGName = "WG auswählen";
        localStorage.removeItem("selectedWG");
        localStorage.removeItem("selectedWGName");
        return;
      }

      const me = await meRes.json().catch(() => ({}));
      this.userId = me?.uid ?? me?.id ?? null;

      let widList = me?.wid;
      if (!widList) widList = [];

      if (typeof widList === "string") {
        widList = widList
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (!Array.isArray(widList)) widList = [];

      const wgs = [];
      for (const wid of widList) {
        try {
          const r = await fetch(`${API_BASE}/wg/${wid}`, { credentials: "include" });
          if (!r.ok) continue;
          const wgData = await r.json();
          // normalisieren: id immer vorhanden
          const norm = { ...wgData, id: wgIdOf(wgData) };
          if (norm.id) wgs.push(norm);
        } catch (e) {
          console.warn("WG fetch failed:", wid, e);
        }
      }

      this.wgList = wgs;
      localStorage.setItem("wgList", JSON.stringify(this.wgList));

      const savedWG = localStorage.getItem("selectedWG");
      const savedName = localStorage.getItem("selectedWGName");

      const exists =
        savedWG && this.wgList.some((w) => String(w.id) === String(savedWG));

      if (exists) {
        const match = this.wgList.find((w) => String(w.id) === String(savedWG));
        this.selectedWG = match.id;
        this.selectedWGName = savedName || match?.name || "WG auswählen";
      } else if (this.wgList.length > 0) {
        this.selectedWG = this.wgList[0].id;
        this.selectedWGName = this.wgList[0]?.name || "WG auswählen";
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

    // -----------------------------
    // WG auswählen
    // -----------------------------
    async selectWG(id) {
      if (id === "__create__") {
        this.showCreateGroupModal = true;
        return;
      }

      const wg = this.wgList.find((w) => String(w.id) === String(id));
      if (!wg) return;

      this.selectedWG = wg.id;
      this.selectedWGName = wg.name || "WG auswählen";
      this.wgDropdownOpen = false;

      localStorage.setItem("selectedWG", this.selectedWG);
      localStorage.setItem("selectedWGName", this.selectedWGName);

      await this.fetchLists(this.selectedWG);
    },

    // -----------------------------
    // Listen laden
    // -----------------------------
    async fetchLists(wgIdOverride = null) {
      const wgId = wgIdOverride || this.selectedWG;
      if (!wgId) {
        this.lists = [];
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/wg/${wgId}/list`, {
          credentials: "include",
        });

        if (res.status === 403 || res.status === 404) {
          this.lists = [];
          return;
        }
        if (!res.ok) {
          this.lists = [];
          return;
        }

        const data = await res.json().catch(() => []);
        this.lists = (data || []).map((l) => ({
          id: listIdOf(l),
          name: l?.name || "neue Liste",
        }));

        localStorage.setItem(`lists_${wgId}`, JSON.stringify(this.lists));
      } catch (e) {
        console.error("fetchLists failed:", e);
        this.lists = [];
      }
    },

    // -----------------------------
    // Liste hinzufügen
    // -----------------------------
    add_list() {
      if (!this.selectedWG) {
        alert("Bitte zuerst eine WG erstellen und auswählen.");
        return;
      }
      this.showPopup = true;
      this.showListOptions = false;
    },

    closePopup() {
      this.showPopup = false;
      this.newList = { name: "" };
      this.touched = { name: false };
    },

    async saveList() {
      if (!this.newList.name.trim()) return;

      const wgId = this.selectedWG;
      if (!wgId) {
        alert("Bitte zuerst eine WG auswählen.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/wg/${wgId}/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: this.newList.name.trim() }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `Fehler ${res.status}`);

        const newItem = {
          id: listIdOf(data) ?? data?.lid ?? data?.id ?? `temp-${Date.now()}`,
          name: this.newList.name.trim(),
        };

        this.lists.push(newItem);
        localStorage.setItem(`lists_${wgId}`, JSON.stringify(this.lists));

        this.closePopup();
      } catch (e) {
        console.error(e);
        alert("Fehler beim Erstellen: " + e.message);
      }
    },

    // -----------------------------
    // Listen Optionen
    // -----------------------------
    openListOptions(list) {
      this.selectedList = list;
      this.showListOptions = true;
      this.showPopup = false;
    },

    closeListOptions() {
      this.selectedList = null;
      this.showListOptions = false;
    },

    openRenameModal() {
      if (!this.selectedList) return;
      this.renameListName = this.selectedList.name;
      this.showRenameModal = true;
      this.showListOptions = false;
    },

    async renameList() {
      const newName = this.renameListName.trim();
      if (!newName) {
        alert("Name darf nicht leer sein.");
        return;
      }

      const wgId = this.selectedWG;
      const listId = this.selectedList?.id;
      if (!wgId || !listId) return;

      try {
        const res = await fetch(`${API_BASE}/wg/${wgId}/list/${listId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: newName }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `Fehler ${res.status}`);

        const idx = this.lists.findIndex((l) => String(l.id) === String(listId));
        if (idx !== -1) this.lists[idx].name = newName;

        localStorage.setItem(`lists_${wgId}`, JSON.stringify(this.lists));

        this.showRenameModal = false;
        this.selectedList = null;
      } catch (e) {
        console.error(e);
        alert("Fehler beim Umbenennen: " + e.message);
      }
    },

    async deleteList(listId) {
      const wgId = this.selectedWG;
      if (!wgId || !listId) return;

      if (!confirm("Liste wirklich löschen?")) return;

      try {
        const res = await fetch(`${API_BASE}/wg/${wgId}/list/${listId}`, {
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
          throw new Error(msg);
        }

        this.lists = this.lists.filter((l) => String(l.id) !== String(listId));
        localStorage.setItem(`lists_${wgId}`, JSON.stringify(this.lists));

        this.showListOptions = false;
        this.selectedList = null;
      } catch (e) {
        console.error(e);
        alert("Fehler beim Löschen: " + e.message);
      }
    },

    // -----------------------------
    // Navigation
    // -----------------------------
    goToList(list) {
      localStorage.setItem("selectedWGID", this.selectedWG);
      localStorage.setItem("selectedListID", list.id);
      localStorage.setItem("selectedListName", list.name);
      window.location.href = "../Einkaufsliste/einkaufsliste.html";
    },

    // -----------------------------
    // WG Form: Validierung / Image lokal
    // -----------------------------
    validateGroupForm() {
      this.errors.name = this.newGroup.name.trim() ? null : "Name ist erforderlich.";

      // Beschreibung optional lassen (oder Pflicht machen, wenn du willst)
      this.errors.description = null;

      this.formValid = !this.errors.name && !this.errors.description;
    },

    handleImageUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      this.newGroup.imageFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.newGroup.preview = reader.result; // Base64
      };
      reader.readAsDataURL(file);
    },

    closeModal() {
      this.showCreateGroupModal = false;
      this.newGroup = { name: "", description: "", preview: null, imageFile: null };
      this.errors = { name: null, description: null };
      this.formValid = false;
      this.isSaving = false;
      this.saveSuccess = false;
      this.saveError = null;
    },

    // -----------------------------
    // Neue WG erstellen (Backend ohne Bild) + Bild lokal speichern
    // -----------------------------
    async saveGroup() {
      this.validateGroupForm();
      if (!this.formValid) return;

      this.isSaving = true;
      this.saveError = null;
      this.saveSuccess = false;

      try {
        const res = await fetch(`${API_BASE}/wg/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: this.newGroup.name.trim(),
            description: this.newGroup.description?.trim() || "",
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `Fehler ${res.status}`);

        const newId = data?.id ?? data?.wid ?? data?._id;
        if (!newId) throw new Error("Backend hat keine WG-ID zurückgegeben.");

        // ✅ Bild/Desc lokal speichern (weil Backend kein Bild erwartet)
        if (this.newGroup.preview) {
          localStorage.setItem(`wg_image_${newId}`, this.newGroup.preview);
        }
        if (this.newGroup.description?.trim()) {
          localStorage.setItem(`wg_desc_${newId}`, this.newGroup.description.trim());
        }

        await this.loadUserAndWGs();

        this.selectedWG = String(newId);
        const wg = this.wgList.find((w) => String(w.id) === String(newId));
        this.selectedWGName = wg?.name || this.newGroup.name.trim();

        localStorage.setItem("selectedWG", this.selectedWG);
        localStorage.setItem("selectedWGName", this.selectedWGName);

        await this.fetchLists(this.selectedWG);

        this.saveSuccess = true;
        setTimeout(() => this.closeModal(), 500);
      } catch (e) {
        console.error(e);
        this.saveError = "Fehler beim Erstellen der WG: " + e.message;
      } finally {
        this.isSaving = false;
      }
    },

    // -----------------------------
    // Invite Link
    // -----------------------------
    async createInviteLink() {
      if (!this.selectedWG) {
        alert("Bitte zuerst eine WG auswählen.");
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

        this.rebuildFrontendInviteLinkFromStored();
      } catch (err) {
        console.error("Invite Fehler:", err.message);
      }
    },

    copyInviteLink() {
      if (!this.frontendLink) {
        alert("Kein Invite-Link vorhanden. Bitte erst erstellen.");
        return;
      }

      navigator.clipboard
        .writeText(this.frontendLink)
        .then(() => {
          this.showCopyToast = true;
          setTimeout(() => (this.showCopyToast = false), 2000);
        })
        .catch((err) => console.error("Fehler beim Kopieren:", err));
    },

    toggleEmailInput() {
      this.showEmailInput = !this.showEmailInput;
    },

    sendLink() {
      const form = this.$refs.emailForm;

      if (!this.emailToShare.trim()) {
        alert("Bitte Email eingeben.");
        return;
      }
      if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (!this.frontendLink) {
        alert("Kein Invite-Link vorhanden. Bitte erst erstellen.");
        return;
      }

      const subject = encodeURIComponent("Einladung zur WG-Gruppe");
      const body =
        encodeURIComponent("Hallo,\n\nHier ist dein Einladungslink:\n\n") +
        this.frontendLink +
        encodeURIComponent("\n\nViele Grüße");

      window.location.href = `mailto:${this.emailToShare}?subject=${subject}&body=${body}`;

      this.emailToShare = "";
      this.showEmailInput = false;
    },
  },
});
