console.log("settings.js loaded");
import { API_BASE } from "../config.js";

/**
 * Normalizes WG object to ensure consistent ID field
 * @param {Object} wg - WG object from API
 * @returns {Object|null} Normalized WG object or null
 */
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

    /** @type {Array<Object>} List of WGs the user belongs to */
    wgList: [],
    
    /** @type {string|null} Currently selected WG ID */
    selectedWG: localStorage.getItem("selectedWG") || null,
    
    /** @type {string} Name of currently selected WG */
    selectedWGName: localStorage.getItem("selectedWGName") || "WG auswählen",

    /** @type {string|null} Current user's ID */
    userId: null,
    
    /** @type {string} Input field for new group name */
    newGroupName: "",
    
    /** @type {Array<Object>} List of users in selected WG */
    wgUsers: [],
    
    /** @type {boolean} Loading state for members list */
    loadingUsers: false,
    
    /** @type {boolean} Controls visibility of members list */
    showMembersList: false,

    /** @type {string} Invite link from API */
    inviteLinkfromAPI: localStorage.getItem("inviteLinkfromAPI") || "",

    /** @type {Array<Object>} Available avatar definitions */
    avatars: [
      { id: 'avatar1', emoji: '👑', color: '#7DCFB6', name: 'Einkaufsboss' },
      { id: 'avatar2', emoji: '🥔', color: '#FFB84D', name: 'Kartoffel' },
      { id: 'avatar3', emoji: '🤓', color: '#FF6B9D', name: 'Listen-Mensch' },
      { id: 'avatar4', emoji: '🦝', color: '#4A90E2', name: 'Snack-Dieb' },
      { id: 'avatar5', emoji: '👮‍♂️', color: '#F5D142', name: 'Schaut Nur' },
      { id: 'avatar6', emoji: '💀', color: '#E74C3C', name: 'Pleite-Geier' },
      { id: 'avatar7', emoji: '🤡', color: '#598eb6ff', name: 'Hat Gegessen' },
      { id: 'avatar8', emoji: '🏃', color: '#F39C12', name: 'Last Minute' },
      { id: 'avatar9', emoji: '💅', color: '#3498DB', name: 'Putzpolizei' }
    ],

    /** @type {Object} Custom modal configuration */
    modal: {
      show: false,
      type: 'info', // 'info', 'error', 'success', 'confirm'
      title: '',
      message: '',
      confirmCallback: null,
      cancelCallback: null,
    },

    /**
     * Shows error in console
     * @param {string} msg - Error message
     */
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
    /**
     * Gets WG image from localStorage
     * @returns {string|null} Image URL or null
     */
    wgImageLocal() {
      if (!this.selectedWG) return null;
      return localStorage.getItem(`wg_image_${this.selectedWG}`) || null;
    },

    /**
     * Gets WG description from localStorage
     * @returns {string|null} Description or null
     */
    wgDescLocal() {
      if (!this.selectedWG) return null;
      return localStorage.getItem(`wg_desc_${this.selectedWG}`) || null;
    },

    /**
     * Gets full details of currently selected WG
     * @returns {Object|null} WG details or null
     */
    selectedWGDetails() {
      return (
        this.wgList.find((wg) => String(wg.id) === String(this.selectedWG)) ||
        null
      );
    },

    /**
     * Returns number of members in current WG
     * @returns {number} Member count
     */
    memberCount() {
      return this.wgUsers.length;
    },
  },

  methods: {
    /**
     * Shows an alert modal
     * @param {string} message - Message to display
     * @param {string} [title='Hinweis'] - Modal title
     * @param {string} [type='info'] - Modal type (info, error, success, confirm)
     */
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

    /**
     * Shows a confirmation modal
     * @param {string} message - Message to display
     * @param {string} [title='Bestätigung'] - Modal title
     * @param {Function} onConfirm - Callback on confirm
     * @param {Function} [onCancel=null] - Callback on cancel
     */
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

    /**
     * Closes the modal
     */
    closeModal() {
      this.modal.show = false;
      // Clear modal data after animation completes
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

    /**
     * Handles modal confirm button click
     */
    handleModalConfirm() {
      const callback = this.modal.confirmCallback;
      this.modal.show = false;
      
      // Wait for modal to close before executing callback
      setTimeout(() => {
        this.modal = {
          show: false,
          type: 'info',
          title: '',
          message: '',
          confirmCallback: null,
          cancelCallback: null,
        };
        
        if (callback) {
          callback();
        }
      }, 350);
    },

    /**
     * Handles modal cancel button click
     */
    handleModalCancel() {
      if (this.modal.cancelCallback) {
        this.modal.cancelCallback();
      }
      this.closeModal();
    },

    /**
     * Loads current user and their WGs from API
     * @async
     */
    async loadUserAndWGs() {
      // Fetch current user
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

      // Parse WG IDs
      let wids = me?.wid;
      if (typeof wids === "string") {
        wids = wids
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (!Array.isArray(wids)) wids = [];

      // Fetch WG details
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

      // Validate and set selected WG
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

    /**
     * Selects a WG and loads its data
     * @async
     * @param {string} id - WG ID to select
     */
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

    /**
     * Loads members of currently selected WG
     * @async
     */
    async loadWGMembers() {
      if (!this.selectedWG) {
        this.wgUsers = [];
        return;
      }

      this.loadingUsers = true;

      try {
        const response = await fetch(`${API_BASE}/wg/${this.selectedWG}/user`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const userIds = await response.json();
        
        // Ensure response is an array
        if (!Array.isArray(userIds)) {
          console.error("API returned non-array response:", userIds);
          this.wgUsers = [];
          return;
        }
        
        // Map UUIDs to user objects with avatar and name data
        this.wgUsers = userIds.map(uid => {
          // Check if this is the current user
          const isCurrentUser = String(uid) === String(this.userId);
          
          let userName;
          let userAvatar;
          
          if (isCurrentUser) {
            // For current user, use data from profile page
            userName = localStorage.getItem("userName") || this.formatUserName(uid);
            userAvatar = localStorage.getItem("userAvatar") || 'avatar1';
          } else {
            // For other users, use stored data or fallback to UUID
            userName = localStorage.getItem(`user_name_${uid}`) || this.formatUserName(uid);
            userAvatar = localStorage.getItem(`user_avatar_${uid}`) || 'avatar1';
          }
          
          return {
            id: uid,
            name: userName,
            avatar: userAvatar,
            fullId: uid,
            role: null
          };
        });
        
      } catch (err) {
        console.error("Error loading members:", err.message);
        this.wgUsers = [];
      } finally {
        this.loadingUsers = false;
      }
    },

    /**
     * Formats UUID for display (shows first 8 characters)
     * @param {string} uuid - Full UUID
     * @returns {string} Formatted name
     */
    formatUserName(uuid) {
      if (!uuid) return "Unbekannt";
      return uuid.substring(0, 8);
    },

    /**
     * Gets avatar data for a given avatar ID
     * @param {string} avatarId - Avatar ID
     * @returns {Object} Avatar data object
     */
    getAvatarData(avatarId) {
      return this.avatars.find(a => a.id === avatarId) || this.avatars[0];
    },

    /**
     * Gets avatar emoji for user
     * @param {Object} user - User object
     * @returns {string} Avatar emoji
     */
    getUserAvatarEmoji(user) {
      const avatarData = this.getAvatarData(user.avatar);
      return avatarData.emoji;
    },

    /**
     * Gets avatar color for user
     * @param {Object} user - User object
     * @returns {string} Avatar color hex code
     */
    getUserAvatarColor(user) {
      const avatarData = this.getAvatarData(user.avatar);
      return avatarData.color;
    },

    /**
     * Generates initials from user name for fallback
     * @param {string} name - User name
     * @returns {string} Two-character initials
     */
    getUserInitials(name) {
      if (!name) return "?";
      const parts = name.split("-");
      if (parts.length >= 2) {
        return parts[0].substring(0, 1).toUpperCase() + parts[1].substring(0, 1).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },

    /**
     * Toggles visibility of members list
     */
    toggleMembersList() {
      this.showMembersList = !this.showMembersList;
      
      // Load members if list is opened and empty
      if (this.showMembersList && this.wgUsers.length === 0 && this.selectedWG) {
        this.loadWGMembers();
      }
    },

    /**
     * Checks if given user ID is the current user
     * @param {string} userId - User ID to check
     * @returns {boolean} True if current user
     */
    isCurrentUser(userId) {
      return String(userId) === String(this.userId);
    },

    /**
     * Initiates user removal from WG with confirmation
     * @async
     * @param {Object} user - User object to remove
     */
    async removeUserFromWG(user) {
      if (!this.selectedWG) {
        this.showAlert("Keine WG ausgewählt.", "Fehler", "error");
        return;
      }

      // Prevent removing self this way (use "WG verlassen" instead)
      if (this.isCurrentUser(user.id)) {
        this.showAlert(
          'Um die WG zu verlassen, nutze bitte die Option "WG verlassen" unten auf der Seite.',
          "Hinweis",
          "info"
        );
        return;
      }

      const wg = this.wgList.find((w) => String(w.id) === String(this.selectedWG));
      const wgName = wg?.name || "diese WG";

      this.showConfirm(
        `Möchtest du ${user.name} wirklich aus "${wgName}" entfernen?`,
        "Mitglied entfernen",
        async () => {
          await this.performRemoveUser(user.id);
        }
      );
    },

    /**
     * Performs the actual user removal operation
     * @async
     * @param {string} userId - User ID to remove
     */
    async performRemoveUser(userId) {
      try {
        const res = await fetch(`${API_BASE}/wg/${this.selectedWG}/user/${userId}`, {
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
          
          this.showAlert(`Fehler beim Entfernen des Mitglieds:\n\n${msg}`, "Fehler", "error");
          return;
        }

        // Remove user from local list
        this.wgUsers = this.wgUsers.filter(u => String(u.id) !== String(userId));

        this.showAlert("Mitglied wurde erfolgreich entfernt.", "Erfolg", "success");
      } catch (err) {
        console.error("performRemoveUser exception:", err);
        this.showAlert("Fehler beim Entfernen des Mitglieds: " + err.message, "Fehler", "error");
      }
    },

    /**
     * Initiates WG leave process with confirmation
     * @async
     */
    async leaveWG() {
      if (!this.selectedWG) {
        this.showAlert("Keine WG ausgewählt.", "Fehler", "error");
        return;
      }

      try {
        // Fetch current user data
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

    /**
     * Performs the actual WG leave operation
     * @async
     * @param {string} uid - User ID to remove from WG
     */
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

        // Update local state
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

    /**
     * Creates an invite link for the selected WG
     * @async
     */
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