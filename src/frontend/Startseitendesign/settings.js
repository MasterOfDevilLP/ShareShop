/**
 * Einstellungen (settings.js) – WG Verwaltung
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
    loadingUsers: false,
    showMembersList: false,
    inviteLinkfromAPI: localStorage.getItem("inviteLinkfromAPI") || "",
    
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

    modal: {
      show: false,
      type: 'info',
      title: '',
      message: '',
      confirmCallback: null,
      cancelCallback: null,
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
    showError(msg) {
      console.error("Fehler:", msg);
    },

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
      const callback = this.modal.confirmCallback;
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
        
        if (callback) {
          callback();
        }
      }, 350);
    },

    handleModalCancel() {
      if (this.modal.cancelCallback) {
        this.modal.cancelCallback();
      }
      this.closeModal();
    },

    async loadUserAndWGs() {
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

      let wids = me?.wid;
      if (typeof wids === "string") {
        wids = wids
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (!Array.isArray(wids)) wids = [];

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
        const response = await fetch(`${API_BASE}/wg/${this.selectedWG}/user`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const userIds = await response.json();
        
        if (!Array.isArray(userIds)) {
          console.error("API returned non-array response:", userIds);
          this.wgUsers = [];
          return;
        }
        
        this.wgUsers = userIds.map(uid => {
          const isCurrentUser = String(uid) === String(this.userId);
          
          let userName;
          let userAvatar;
          
          if (isCurrentUser) {
            userName = localStorage.getItem("userName") || this.formatUserName(uid);
            userAvatar = localStorage.getItem("userAvatar") || 'avatar1';
          } else {
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

    formatUserName(uuid) {
      if (!uuid) return "Unbekannt";
      return uuid.substring(0, 8);
    },

    getAvatarData(avatarId) {
      return this.avatars.find(a => a.id === avatarId) || this.avatars[0];
    },

    getUserAvatarEmoji(user) {
      const avatarData = this.getAvatarData(user.avatar);
      return avatarData.emoji;
    },

    getUserAvatarColor(user) {
      const avatarData = this.getAvatarData(user.avatar);
      return avatarData.color;
    },

    getUserInitials(name) {
      if (!name) return "?";
      const parts = name.split("-");
      if (parts.length >= 2) {
        return parts[0].substring(0, 1).toUpperCase() + parts[1].substring(0, 1).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },

    toggleMembersList() {
      this.showMembersList = !this.showMembersList;
      
      if (this.showMembersList && this.wgUsers.length === 0 && this.selectedWG) {
        this.loadWGMembers();
      }
    },

    isCurrentUser(userId) {
      return String(userId) === String(this.userId);
    },

    async removeUserFromWG(user) {
      if (!this.selectedWG) {
        this.showAlert("Keine WG ausgewählt.", "Fehler", "error");
        return;
      }

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

        this.wgUsers = this.wgUsers.filter(u => String(u.id) !== String(userId));
        this.showAlert("Mitglied wurde erfolgreich entfernt.", "Erfolg", "success");
      } catch (err) {
        console.error("performRemoveUser exception:", err);
        this.showAlert("Fehler beim Entfernen des Mitglieds: " + err.message, "Fehler", "error");
      }
    },

    openWgActionModal(mode = 'leave') {
      if (!this.selectedWG) {
        this.showAlert("Keine WG ausgewählt.", "Hinweis", "info");
        return;
      }

      const wg = this.wgList.find((w) => String(w.id) === String(this.selectedWG));
      const wgName = wg?.name || "diese WG";

      if (mode === 'delete') {
        this.showConfirm(
          `Willst du "${wgName}" wirklich löschen?`,
          'WG löschen',
          async () => {
            await this.performDeleteWG();
          }
        );
      } else {
        this.showConfirm(
          `Möchtest du "${wgName}" wirklich verlassen?`,
          'WG verlassen',
          async () => {
            await this.performLeaveWG();
          }
        );
      }
    },

    async performLeaveWG() {
      try {
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

        const removedId = String(this.selectedWG);

        this.wgList = this.wgList.filter((w) => String(w.id) !== removedId);
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
    async performDeleteWG(force = false) {
      if (!this.selectedWG) {
        this.showAlert("Keine WG ausgewählt.", "Fehler", "error");
        return;
      }

      const wid = String(this.selectedWG);

      const readBodyMessage = async (res) => {
        const raw = await res.text().catch(() => "");
        if (!raw) return "";
        try {
          const j = JSON.parse(raw);
          return j?.message || j?.error || raw;
        } catch (_) {
          return raw;
        }
      };

      try {
        
        if (force) {
          const listRes = await fetch(`${API_BASE}/wg/${wid}/list`, {
            method: "GET",
            credentials: "include",
          });

          if (!listRes.ok) {
            const msg = await readBodyMessage(listRes);
            this.showAlert(
              msg || `Listen konnten nicht geladen werden (HTTP ${listRes.status})`,
              "Fehler",
              "error"
            );
            return;
          }

          const listRaw = await listRes.json().catch(() => []);
          console.log("GET /wg/:wid/list raw:", listRaw);

          
          const listIds = (Array.isArray(listRaw) ? listRaw : [])
            .map((x) => {
              if (typeof x === "string") return x;
              return x?.id ?? x?.lid ?? x?._id ?? x?.uuid ?? null;
            })
            .filter(Boolean);

          console.log("Extracted listIds:", listIds);

          for (const lid of listIds) {
            const delListRes = await fetch(
              `${API_BASE}/wg/${wid}/list/${encodeURIComponent(lid)}`,
              {
                method: "DELETE",
                credentials: "include",
              }
            );

            if (!delListRes.ok) {
              const msg = await readBodyMessage(delListRes);
              this.showAlert(
                msg || `Liste ${lid} konnte nicht gelöscht werden (HTTP ${delListRes.status})`,
                "Fehler",
                "error"
              );
              return;
            }
          }
        }

        
        const res = await fetch(`${API_BASE}/wg/${wid}`, {
          method: "DELETE",
          credentials: "include",
        });

        const msg = await readBodyMessage(res);

        if (res.status === 403) {
          this.showAlert(msg || "Du darfst diese WG nicht löschen.", "Nicht erlaubt", "error");
          return;
        }

        if (!res.ok) {
          
          if (!force) {
            this.showConfirm(
              (msg || `WG konnte nicht gelöscht werden (HTTP ${res.status}).`) +
                "\n\nSoll ich zuerst ALLE Listen in der WG löschen und es erneut versuchen?",
              "WG löschen",
              async () => {
                await this.performDeleteWG(true);
              }
            );
            return;
          }

          this.showAlert(msg || `Fehler beim Löschen (HTTP ${res.status})`, "Fehler", "error");
          return;
        }

      
        await this.loadUserAndWGs();
        const stillExists = this.wgList.some((w) => String(w.id) === wid);

        if (stillExists) {
          
          this.showConfirm(
            "Die WG konnte nicht gelöscht werden (sie existiert serverseitig noch).\n\n" +
              "Vermutlich sind noch Listen/Inhalte vorhanden.\n" +
              "Soll ich zuerst alle Listen löschen und es danach nochmal versuchen?",
            "WG konnte nicht gelöscht werden",
            async () => {
              await this.performDeleteWG(true);
            }
          );
          return;
        }

      
        this.selectedWG = null;
        this.selectedWGName = "WG auswählen";
        this.wgUsers = [];

        localStorage.removeItem("selectedWG");
        localStorage.removeItem("selectedWGName");

        this.inviteLinkfromAPI = "";
        localStorage.removeItem("inviteLinkfromAPI");

        this.showAlert("WG wurde gelöscht.", "Erledigt", "success");
      } catch (err) {
        console.error("performDeleteWG exception:", err);
        this.showAlert("Fehler beim Löschen der WG: " + err.message, "Fehler", "error");
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