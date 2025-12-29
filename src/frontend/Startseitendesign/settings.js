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
    loadingUsers: false,
    showMembersList: false, // For collapsible members list

    inviteLinkfromAPI: localStorage.getItem("inviteLinkfromAPI") || "",

    // Custom Modal System
    modal: {
      show: false,
      type: 'info', // 'info', 'error', 'success', 'confirm'
      title: '',
      message: '',
      confirmCallback: null,
      cancelCallback: null,
    },

    showError(msg) {
      console.error("Fehler:", msg);
    },
  },

  async mounted() {
    await this.loadUserAndWGs();
    if (this.selectedWG) {
      await this.createInviteLink();
      await this.loadWGMembers();
    }
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

    memberCount() {
      return this.wgUsers.length;
    },
  },

  methods: {
    // Custom Modal Helpers
    showAlert(message, title = 'Hinweis', type = 'info') {
      this.modal = {
        show: true,
        type: type,
        title: title,
        message: message,
        confirmCallback: null,
        cancelCallback: null,
      };
    },

    showConfirm(message, title = 'Bestätigung', onConfirm, onCancel = null) {
      this.modal = {
        show: true,
        type: 'confirm',
        title: title,
        message: message,
        confirmCallback: onConfirm,
        cancelCallback: onCancel,
      };
    },

    closeModal() {
      this.modal.show = false;
      setTimeout(() => {
        this.modal = {
          show: false,
          type: 'info',
          title: '',
          message: '',
          confirmCallback: null,
          cancelCallback: null,
        };
      }, 300);
    },

    handleModalConfirm() {
      if (this.modal.confirmCallback) {
        this.modal.confirmCallback();
      }
      this.closeModal();
    },

    handleModalCancel() {
      if (this.modal.cancelCallback) {
        this.modal.cancelCallback();
      }
      this.closeModal();
    },

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

    async selectWG(id) {
      const wg = this.wgList.find((w) => String(w.id) === String(id));
      if (!wg) return;

      this.selectedWG = wg.id;
      this.selectedWGName = wg.name || "WG auswählen";

      localStorage.setItem("selectedWG", this.selectedWG);
      localStorage.setItem("selectedWGName", this.selectedWGName);

      await this.createInviteLink();
      await this.loadWGMembers();
    },

    async loadWGMembers() {
      if (!this.selectedWG) {
        this.wgUsers = [];
        return;
      }

      this.loadingUsers = true;

      try {
        // TODO: Replace with actual API endpoint when ready
        // const response = await fetch(`${API_BASE}/wg/${this.selectedWG}/users`, {
        //   method: "GET",
        //   credentials: "include",
        // });

        // if (!response.ok) {
        //   throw new Error(`HTTP ${response.status}`);
        // }

        // const data = await response.json();
        // this.wgUsers = data.users || data || [];

        // For now, use mock data for development
        // This will show example users until the backend is ready
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        this.wgUsers = this.getMockUsers();
        
        console.log("Loaded members:", this.wgUsers);
      } catch (err) {
        console.error("Error loading members:", err);
        // Fallback to mock data on error
        this.wgUsers = this.getMockUsers();
      } finally {
        this.loadingUsers = false;
      }
    },

    getMockUsers() {
      // Mock data for development - remove when API is ready
      const mockUsers = [
        { id: "1", name: "Max Mustermann", email: "max@example.com", role: "admin" },
        { id: "2", name: "Anna Schmidt", email: "anna@example.com", role: "member" },
        { id: "3", name: "Tom Weber", email: "tom@example.com", role: "member" },
      ];
      
      // Add current user if available
      if (this.userId) {
        const currentUser = mockUsers.find(u => u.id === this.userId);
        if (!currentUser) {
          mockUsers.unshift({
            id: this.userId,
            name: "Du",
            email: "your@example.com",
            role: "admin"
          });
        }
      }
      
      return mockUsers;
    },

    getUserInitials(name) {
      if (!name) return "?";
      const parts = name.trim().split(" ");
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },

    getUserAvatar(userId) {
      // Check if user has a local avatar
      if (!userId) return null;
      return localStorage.getItem(`user_avatar_${userId}`) || null;
    },

    toggleMembersList() {
      this.showMembersList = !this.showMembersList;
    },

    isCurrentUser(userId) {
      return String(userId) === String(this.userId);
    },

    async leaveWG() {
      if (!this.selectedWG) {
        this.showAlert("Keine WG ausgewählt.", "Fehler", "error");
        return;
      }

      try {
        // user nochmal holen (Quelle der Wahrheit)
        const meRes = await fetch(`${API_BASE}/user`, {
          method: "GET",
          credentials: "include",
        });

        if (!meRes.ok) {
          this.showAlert("Nicht eingeloggt (GET /user fehlgeschlagen).", "Fehler", "error");
          this.userId = null;
          return;
        }

        const me = await meRes.json().catch(() => ({}));
        const uid = me?.uid ?? me?.id ?? null;

        if (!uid) {
          this.showAlert("User-ID fehlt in /user Response.", "Fehler", "error");
          return;
        }

        this.userId = uid;

        const wg = this.wgList.find((w) => String(w.id) === String(this.selectedWG));
        const wgName = wg?.name || "diese WG";

        this.showConfirm(
          `Möchtest du "${wgName}" wirklich verlassen?`,
          "WG verlassen",
          async () => {
            await this.performLeaveWG(uid);
          }
        );
      } catch (err) {
        console.error("leaveWG exception:", err);
        this.showAlert("Fehler beim Verlassen der WG: " + err.message, "Fehler", "error");
      }
    },

    async performLeaveWG(uid) {
      try {
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
          this.showAlert(`Fehler beim Verlassen der WG:\n\n${msg}`, "Fehler", "error");
          return;
        }

        // lokal updaten
        this.wgList = this.wgList.filter(
          (w) => String(w.id) !== String(this.selectedWG)
        );
        localStorage.setItem("wgList", JSON.stringify(this.wgList));

        this.selectedWG = null;
        this.selectedWGName = "WG auswählen";
        this.wgUsers = [];
        localStorage.removeItem("selectedWG");
        localStorage.removeItem("selectedWGName");

        this.showAlert("Du hast die WG verlassen.", "Erfolg", "success");
      } catch (err) {
        console.error("performLeaveWG exception:", err);
        this.showAlert("Fehler beim Verlassen der WG: " + err.message, "Fehler", "error");
      }
    },

    async createInviteLink() {
      if (!this.selectedWG) {
        this.showAlert("Bitte zuerst eine WG auswählen.", "Hinweis", "info");
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