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

import { API_BASE } from "../config.js";
console.log("API_BASE=", API_BASE);

new Vue({
  el: "#app",

  /**
   * Datenmodell der Vue-App
   */
  data: {
    // Listen in der aktuell ausgewählten WG
    lists: [],

    // Liste der WGs aus localStorage oder leer initialisieren
    wgList: JSON.parse(localStorage.getItem("wgList")) || [],

    // aktuell ausgewählte WG
    selectedWG: null,
    selectedWGName: "",

    // Name für neue WG (im Modal)
    newGroupName: "",

    // Daten für neue Liste
    touched: { name: false }, // für Validierung
    newList: { name: "", wg: "" }, 

    // UI-Zustände
    showPopup: false,            // Bottom Sheet "Liste hinzufügen"
    showCreateGroupModal: false, // Modal "Neue WG erstellen"
    showListOptions: false,      // Bottom Sheet "Listenoptionen": inklusive Umbenennen/Löschen/Teilen/Kopieren
    selectedList: null,          // aktuell ausgewählte Liste
    showRenameModal: false,      // Modal "Liste umbenennen"
    renameListName: "",          

    isWGOpen: false,             
    showCopyToast: false,        // Kurzes "Link kopiert"-Toast
    showEmailInput: false,       // Email Input anzeigen
    emailToShare: "",            // Email für Teilen
    QRCode: null,
    qrCodeDataUrl: "",           // QR Code als Data URL
    wgDropdownOpen: false,      
    inviteLinkfromAPI: localStorage.getItem("inviteLinkfromAPI"), // Einladungslink vom Backend
    token: "",                    // Token aus dem Einladungslink
    frontendLink: "",             // Einladungslink, der an invite/invite.html weiterleitet
    showQRChoiceModal: false,
    baseUrl: window.location.origin, //baseURL von Invite Link
  },

  computed: {
    /**
     * Prüft, ob die neue Liste gültig ist (Name nicht leer)
     */
    isListValid() {
      return this.newList.name.trim() !== "";
    },
  },

  mounted() {
    this.fetchUserWG(); // WGs des Users laden
    this.inviteLinkfromAPI = localStorage.getItem("inviteLinkfromAPI") || "";

    if (this.inviteLinkfromAPI) {
      this.token = this.inviteLinkfromAPI.split("/").pop();
      this.frontendLink = `${this.baseUrl}/invite/invite.html?token=${this.token}`;
      QRCode.toDataURL(this.frontendLink)
        .then(url => {
          this.qrCodeDataUrl = url;
          localStorage.setItem("qrCodeDataUrl", url);
        })
        .catch(err => console.error("Fehler beim Generieren des QR Codes:", err));
    }

    localStorage.setItem("frontendLink", this.frontendLink);
  },

  methods: {

    /**
     * QR-Code für den Invite-Link generieren
     */
    async generateQRCode() {
      if (!this.frontendLink) {
        try {
          const resp = await fetch(`${API_BASE}/wg/${this.selectedWG}/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ expires: null, targetUser: null }),
          });

          if (!resp.ok) throw new Error("Fehler beim Erstellen des Invite-Links");

          const data = await resp.json();
          this.frontendLink = `${window.location.origin}/invite/${data.id}`;
          localStorage.setItem("inviteLinkfromAPI", this.frontendLink);
        } catch (err) {
          console.error(err);
          alert("Invite-Link konnte nicht erstellt werden: " + err.message);
          return;
        }
      }
      try {
        this.qrCodeDataUrl = await QRCode.toDataURL(this.frontendLink);
        localStorage.setItem("qrCodeDataUrl", this.qrCodeDataUrl);
        window.location.href = "wg_qr_code.html";
      } catch (err) {
        console.error("Fehler beim Generieren des QR Codes:", err);
      }
    },

    /**
     * Lädt alle WGs des Benutzers vom Backend
     */
    async fetchUserWG() {
      try {
        const userResp = await fetch(`${API_BASE}/user`, {
          credentials: "include",
        });

        if (!userResp.ok) throw new Error("Fehler beim Laden der User-Daten");

        const userData = await userResp.json();
        let widList = userData.wid;

        if (!widList) throw new Error("User hat keine WG");

        // Falls widList String ist → Array
        if (typeof widList === "string") {
          widList = widList.split(",").map((s) => s.trim());
        }

        this.wgList = [];

        // Hole Details für jede WG
        for (const wid of widList) {
          try {
            const wgResp = await fetch(`${API_BASE}/wg/${wid}`, {
              credentials: "include",
            });
            if (!wgResp.ok) continue;

            const wgData = await wgResp.json();
            this.wgList.push(wgData);
          } catch (innerErr) {
            console.error("Fehler beim Laden einer WG:", innerErr);
          }
        }

        // Auswahl der aktuellen WG aus localStorage oder erste WG
        if (this.wgList.length > 0) {
          this.selectedWG = this.wgList[0].wid;
          this.selectedWGName = this.wgList[0].name;
          localStorage.setItem("selectedWGName", this.selectedWGName);
          await this.fetchLists();
        }
      } catch (err) {
        console.error(err);
        this.lists = [];
      }
    },

    /**
     * Öffnet das Popup für "Liste hinzufügen"
     */
    add_list() {
      if (!this.selectedWG) {
        alert("Bitte zuerst eine WG erstellen und auswählen.");
        return;
      }
      this.showPopup = true;
      this.showListOptions = false;
    },

    /**
     * Schließt das "Liste hinzufügen"-Popup
     */
    closePopup() {
      this.showPopup = false;
      this.resetNewList();
    },

    /**
     * Setzt das neue List-Objekt zurück
     */
    resetNewList() {
      this.newList = { name: "" };
    },

    /**
     * Öffnet die Optionen für eine Liste
     */
    openListOptions(list) {
      this.selectedList = list;
      this.showListOptions = true;
      this.showPopup = false;
    },

    /**
     * Schließt die Optionen einer Liste
     */
    closeListOptions() {
      this.selectedList = null;
      this.showListOptions = false;
    },

    /**
     * Speichert eine neue Liste im Backend & localStorage
     */
    async saveList() {
      if (!this.newList.name.trim()) return;
      const wgId = this.selectedWG;
      if (!wgId) {
        alert("Bitte zuerst eine WG auswählen.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/wg/${wgId}/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: this.newList.name.trim() }),
        });

        let data = null;
        try {
          data = await response.json();
        } catch (e) {
          console.warn("Response ist kein JSON:", e);
        }

        if (!response.ok) throw new Error(data?.message || `Fehler ${response.status}`);

        // LocalStorage aktualisieren
        const key = `lists_${wgId}`;
        const saved = JSON.parse(localStorage.getItem(key)) || [];
        const newItem = { id: data?.id || `temp-${Date.now()}`, name: this.newList.name.trim() };
        saved.push(newItem);
        localStorage.setItem(key, JSON.stringify(saved));

        if (this.selectedWG === wgId) this.lists.push(newItem);
        this.closePopup();
      } catch (err) {
        console.error(err);
        alert("Fehler beim Erstellen: " + err.message);
      }
    },

    /**
     * Kopiert den Invite-Link in die Zwischenablage
     */
    copyInviteLink() {
      navigator.clipboard.writeText(this.frontendLink)
        .then(() => {
          this.showCopyToast = true;
          setTimeout(() => (this.showCopyToast = false), 2000);
        })
        .catch((err) => console.error("Fehler beim Kopieren:", err));
    },

    /**
     * Toggle für die Email-Input-Box
     */
    toggleEmailInput() {
      this.showEmailInput = !this.showEmailInput;
    },

    /**
     * Senden des Invite-Links per Email
     */
    sendLink() {
      const form = this.$refs.emailForm;
      if (!this.emailToShare.trim()) {
        alert("Bitte Email eingeben.");
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const subject = encodeURIComponent("Einladung zur WG-Gruppe");
      const body =
      encodeURIComponent("Hallo,\n\nHier ist dein Einladungslink:\n\n") +
      this.frontendLink +
      encodeURIComponent("\n\nViele Grüße");

      try {
        window.location.href = `mailto:${this.emailToShare}?subject=${subject}&body=${body}`;
      } catch (e) {
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(this.emailToShare)}&su=${subject}&body=${body}`;
        window.open(gmailLink, "_blank");
      }

      this.emailToShare = "";
      this.showEmailInput = false;
    },

    /**
     * Auswahl der WG aus Dropdown
     */
    selectWG(id) {
      if (id === "__create__") {
        this.showCreateGroupModal = true;
        return;
      }

      const wg = this.wgList.find((w) => w.wid === id);
      if (!wg) return;

      this.selectedWG = wg.wid;
      this.selectedWGName = wg.name;
      console.log("Ausgewählte WG:", this.selectedWG, this.selectedWGName);

      localStorage.setItem("selectedWG", wg.wid);
      localStorage.setItem("selectedWGName", wg.name);

      this.lists = [];
      this.fetchLists();
      this.wgDropdownOpen = false;
    },

    /**
     * Lädt Listen für eine WG vom Backend
     */
    async fetchLists(wgIdOverride = null) {
      const wgId = wgIdOverride || this.selectedWG;
      if (!wgId) {
        console.warn("Keine WG ausgewählt! → fetchLists übersprungen");
        this.lists = [];
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/wg/${wgId}/list`, { credentials: "include" });

        if (response.status === 403 || response.status === 404) {
          console.warn("Keine Listen für diese WG.");
          this.lists = [];
          return;
        }

        if (!response.ok) throw new Error("Fehler beim Laden der Listen");

        const data = await response.json();
        this.lists = data.map((l) => ({ id: l.lid, name: l.name || "neue Liste" }));
      } catch (err) {
        console.error(err);
      }
    },

    /**
     * Neue WG erstellen
     */
    async createNewGroup() {
      if (!this.newGroupName.trim()) {
        alert("Bitte einen Gruppennamen eingeben.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/wg/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: this.newGroupName.trim() }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || `Fehler ${response.status}`);
        if (!data || !data.id) throw new Error("Backend hat keine WG-ID zurückgegeben.");

        const newGroup = { id: data.id, name: this.newGroupName.trim() };
        this.wgList.push(newGroup);
        localStorage.setItem("wgList", JSON.stringify(this.wgList));
        localStorage.setItem(`lists_${newGroup.id}`, JSON.stringify([]));
        this.selectedWG = newGroup.id;
        this.selectedWGName = newGroup.name;
        localStorage.setItem("selectedWG", newGroup.id);
        localStorage.setItem("selectedWGName", newGroup.name);
        this.lists = [];
        this.newGroupName = "";
        this.showCreateGroupModal = false;
      } catch (err) {
        console.error("Fehler beim Erstellen der WG:", err);
        alert("Fehler beim Erstellen der WG: " + err.message);
      }
    },

    /**
     * Modal: Liste umbenennen
     */
    openRenameModal() {
      if (!this.selectedList) return;
      this.renameListName = this.selectedList.name;
      this.showRenameModal = true;
    },

    /**
     * Speichert den neuen Namen der Liste im Backend & localStorage
     */
    async renameList() {
      if (!this.renameListName.trim()) {
        alert("Name darf nicht leer sein.");
        return;
      }

      const newName = this.renameListName.trim();
      const wgId = this.selectedWG;
      const listId = this.selectedList?.id;
      if (!wgId || !listId) return;

      try {
        const response = await fetch(`${API_BASE}/wg/${wgId}/list/${listId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: newName }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || `Fehler ${response.status}`);
        }

        const index = this.lists.findIndex((l) => l.id === listId);
        if (index !== -1) this.lists[index].name = newName;

        const key = `lists_${wgId}`;
        const saved = JSON.parse(localStorage.getItem(key)) || [];
        const sIndex = saved.findIndex((x) => x.id === listId);
        if (sIndex !== -1) {
          saved[sIndex].name = newName;
          localStorage.setItem(key, JSON.stringify(saved));
        }

        this.showRenameModal = false;
        this.showListOptions = false;
      } catch (err) {
        console.error("Fehler beim Umbenennen der Liste:", err);
        alert("Fehler beim Umbenennen der Liste: " + err.message);
      }
    },


    openWGCreateModal() {
      this.showCreateGroupModal = true;
    },

    /**
     * Öffnet die ausgewählte Liste
    */
    goToList(list) {
      localStorage.setItem("selectedWGID", this.selectedWG);
      localStorage.setItem("selectedListID", list.id);
      localStorage.setItem("selectedListName", list.name);
      window.location.href = "../Einkaufsliste/einkaufsliste.html";
    },

    /**
     * QR-Code Scan-Optionen anzeigen
     */
    scanOtherQR() {
      this.showQRChoiceModal = true;
    },

    async startCameraScan() {
      try {
        const video = this.$refs.video;
        video.style.display = "block";

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const scan = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const code = jsQR(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
            if (code) {
              window.location.href = code.data;
              stream.getTracks().forEach(track => track.stop());
              video.style.display = "none";
              return;
            }
          }
          requestAnimationFrame(scan);
        };
        scan();
      } catch (err) {
        alert("Kamera konnte nicht geöffnet werden: " + err.message);
      }
    },

    /**
     * Verarbeitet den Datei-Upload für QR-Code Bilder
     */
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const code = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
          if (code) {
            window.location.href = code.data;
          } else {
            alert("Kein QR Code gefunden!");
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },
});
