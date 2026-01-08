import { API_BASE } from '../config.js';

const { createApp, reactive } = Vue;

/**
 * Reactive global language store.
 * Persists the selected language in localStorage.
 *
 * @typedef {Object} LanguageStore
 * @property {string} language - Current UI language ("de" | "en")
 */
const LanguageStore = reactive({
  language: localStorage.getItem("language") || "de",
});

/**
 * Translation helper function.
 *
 * @param {string} de - German translation
 * @param {string} en - English translation
 * @returns {string} Translated string based on current language
 */
const t = (de, en) => (LanguageStore.language === "de" ? de : en);

/**
 * Main Vue application instance.
 */
createApp({
  data() {
    return {
      /**
       * Logged-in user data (stored locally).
       */
      user: {
        name: localStorage.getItem("userName") || "User Name",
        avatar: localStorage.getItem("userAvatar") || "avatar1",
      },
      
      /**
       * Available avatar definitions.
       * @type {Array<{id:string, emoji:string, color:string, name:string}>}
       */
      avatars: [
        { id: 'avatar1', emoji: '👑', color: '#7DCFB6', name: t('Einkaufsboss', 'Shopping Boss') },
        { id: 'avatar2', emoji: '🥔', color: '#FFB84D', name: t('Kartoffel', 'Potato') },
        { id: 'avatar3', emoji: '🤓', color: '#FF6B9D', name: t('Listen-Mensch', 'List Person') },
        { id: 'avatar4', emoji: '🦝', color: '#4A90E2', name: t('Snack-Dieb', 'Snack Thief') },
        { id: 'avatar5', emoji: '👮‍♂️', color: '#F5D142', name: t('Schaut Nur', 'Just Watching') },
        { id: 'avatar6', emoji: '💀', color: '#E74C3C', name: t('Pleite-Geier', 'Broke Student') },
        { id: 'avatar7', emoji: '🤡', color: '#598eb6ff', name: t('Hat Gegessen', 'Already Ate') },
        { id: 'avatar8', emoji: '🏃', color: '#F39C12', name: t('Last Minute', 'Last Minute') },
        { id: 'avatar9', emoji: '💅', color: '#3498DB', name: t('Putzpolizei', 'Clean Police') }
      ],
      
      /**
       * Temporary edit form state for profile modal.
       */
      editUser: {
        /** @type {string} */
        firstName: "",
        /** @type {string} */
        lastName: "",
        /** @type {string} */
        password: "",
      },

      /** @type {"light" | "dark"} */
      theme: localStorage.getItem("theme") || "light",

      /** @type {string} */
      language: LanguageStore.language,

      /** @type {string} */
      message: "",

      /** @type {boolean} */
      isLoggingOut: false,

      // Modal visibility flags
      showLogoutModal: false,
      showEditProfile: false,
      showAvatarPicker: false,
      showNotificationSettings: false,
      showCurrencySettings: false,
      showDeleteAccount: false,
      
      /** @type {string} */
      deletePassword: "",

      /**
       * Notification preferences stored locally.
       */
      notifications: {
        listUpdates: localStorage.getItem("notif_listUpdates") !== "false",
        newItems: localStorage.getItem("notif_newItems") !== "false",
        sharedLists: localStorage.getItem("notif_sharedLists") !== "false",
        reminders: localStorage.getItem("notif_reminders") !== "false",
      },
      
      // Custom Modal System
      customModal: {
        show: false,
        title: "",
        message: "",
        type: "info",
        buttons: [],
      },
    };
  },
  
  methods: {
    t,
    
    /**
     * Opens a generic modal dialog.
     *
     * @param {string} title
     * @param {string} message
     * @param {"info"|"success"|"warning"|"error"} [type="info"]
     * @param {Array<Object>|null} [buttons=null]
     */
      showModal(title, message, type = 'info', buttons = null) {
      this.customModal = {
        show: true,
        title,
        message,
        type,
        buttons: buttons || [
          {
            text: this.t('OK', 'OK'),
            action: () => this.closeModal(),
            class: 'btn-save'
          }
        ]
      };
    },
    
    /**
     * Shows a confirmation dialog with confirm/cancel actions.
     *
     * @param {string} title
     * @param {string} message
     * @param {Function} onConfirm
     * @param {Function|null} [onCancel=null]
     */
    showConfirm(title, message, onConfirm, onCancel = null) {
      this.customModal = {
        show: true,
        title,
        message,
        type: 'warning',
        buttons: [
          {
            text: this.t('Abbrechen', 'Cancel'),
            action: () => {
              this.closeModal();
              if (onCancel) onCancel();
            },
            class: 'btn-cancel'
          },
          {
            text: this.t('Bestätigen', 'Confirm'),
            action: () => {
              this.closeModal();
              onConfirm();
            },
            class: 'btn-confirm'
          }
        ]
      };
    },
    
    closeModal() {
      this.customModal.show = false;
    },
    
    /**
     * Fetches user data from the backend API.
     * Uses cookies for authentication.
     *
     * @async
     * @returns {Promise<void>}
     */    
    async fetchUserData() {
      try {
        const response = await fetch(`${API_BASE}/user`, {
          method: "GET",
          credentials: "include",
        });
        
        if (response.ok) {
          const userData = await response.json();
          
          // Store user ID
          if (userData.uid || userData.id) {
            const userId = userData.uid || userData.id;
            localStorage.setItem("userID", userId);
            
            // Store user-specific data for members list (only current user)
            localStorage.setItem(`user_name_${userId}`, this.user.name);
            localStorage.setItem(`user_avatar_${userId}`, this.user.avatar);
          }
          
          // Store WG list
          if (userData.wid && Array.isArray(userData.wid)) {
            localStorage.setItem("wgList", JSON.stringify(userData.wid));
          } else if (userData.wgs && Array.isArray(userData.wgs)) {
            localStorage.setItem("wgList", JSON.stringify(userData.wgs));
          }
          
          // If email is available, use it
          if (userData.email) {
            this.user.email = userData.email;
            localStorage.setItem("userEmail", this.user.email);
            
            // Use firstName/lastName if available, otherwise email username
            if (userData.firstname || userData.lastname) {
              this.user.name = [userData.firstname, userData.lastname]
                .filter(Boolean)
                .join(" ")
                .trim() || userData.email.split("@")[0];
            } else {
              this.user.name = userData.email.split("@")[0];
            }
            
            localStorage.setItem("userName", this.user.name);
            
            // Update user-specific data with new name
            const userId = userData.uid || userData.id;
            if (userId) {
              localStorage.setItem(`user_name_${userId}`, this.user.name);
            }
          }
          
        } else if (response.status === 401) {
          // Not logged in, redirect to login
          window.location.href = "../index.html";
        }
      } catch (error) {
        // Silently fail and use cached data
        console.error("Error fetching user data:", error);
      }
    },
    
    /**
     * Sets the UI theme.
     *
     * @param {"light"|"dark"} mode
     */
    setTheme(mode) {
      this.theme = mode;
      localStorage.setItem("theme", mode);
      document.body.classList.toggle("dark-mode", mode === "dark");
    },
    
    /**
     * Sets the application language.
     *
     * @param {"de"|"en"} lang
     */
      setLanguage(lang) {
      this.language = lang;
      LanguageStore.language = lang;
      localStorage.setItem("language", lang);
    },
    
    /**
     * Returns avatar metadata for a given avatar ID.
     *
     * @param {string} avatarId
     * @returns {{id:string, emoji:string, color:string, name:string}}
     */    getAvatarData(avatarId) {
      return this.avatars.find(a => a.id === avatarId) || this.avatars[0];
    },
    
    /**
     * Selects and stores the user's avatar locally.
     *
     * @param {string} avatarId
     */
    selectAvatar(avatarId) {
      this.user.avatar = avatarId;
      localStorage.setItem("userAvatar", avatarId);
      
      // Also update user-specific avatar for members list
      const userId = localStorage.getItem("userID");
      if (userId) {
        localStorage.setItem(`user_avatar_${userId}`, avatarId);
      }
      
      this.showAvatarPicker = false;
      
      // Info: Lokal gespeichert
      this.showModal(
        this.t('Avatar geändert', 'Avatar changed'),
        this.t(
          '✅ Avatar wurde lokal gespeichert.\n\nℹ️ Hinweis: Deine Änderung ist nur auf diesem Gerät sichtbar.',
          '✅ Avatar has been saved locally.\n\nℹ️ Note: Your change is only visible on this device.'
        ),
        'success'
      );
    },
    
    /**
     * Opens the profile edit modal and pre-fills the form
     * with the currently stored user name.
     *
     * Splits the full name into first and last name parts
     * and resets the password field.
     *
     * @returns {void}
     */
    openEditProfile() {
      // Populate edit form with current data
      const nameParts = this.user.name.split(" ");
      this.editUser.firstName = nameParts[0] || "";
      this.editUser.lastName = nameParts.slice(1).join(" ") || "";
      this.editUser.password = "";
      this.showEditProfile = true;
    },
    
    /**
     * Saves profile changes locally.
     *
     * - Validates password length if provided
     * - Ensures at least a first or last name is set
     * - Persists data in localStorage
     *
     * Note: Backend does NOT support profile updates.
     *
     * @async
     * @returns {Promise<void>}
     */
    async saveProfile() {
      try {
        if (this.editUser.password.trim()) {
          if (this.editUser.password.length < 6) {
            this.showModal(
              this.t('Ungültiges Passwort', 'Invalid Password'),
              this.t("Das Passwort muss mindestens 6 Zeichen lang sein.", "Password must be at least 6 characters long."),
              'error'
            );
            return;
          }
        }
        
        const fullName = [this.editUser.firstName, this.editUser.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        
        if (!fullName) {
          this.showModal(
            this.t('Fehler', 'Error'),
            this.t('Bitte gib mindestens einen Vor- oder Nachnamen ein.', 'Please enter at least a first or last name.'),
            'error'
          );
          return;
        }
        
        this.user.name = fullName;
        localStorage.setItem("userName", fullName);
        localStorage.setItem("firstName", this.editUser.firstName);
        localStorage.setItem("lastName", this.editUser.lastName);
        
        // Also update user-specific name for members list
        const userId = localStorage.getItem("userID");
        if (userId) {
          localStorage.setItem(`user_name_${userId}`, fullName);
        }
        
        this.showEditProfile = false;
        
        // Zeige Erfolg mit Info
        this.showModal(
          this.t('Profil aktualisiert', 'Profile updated'),
          this.t(
            '✅ Dein Name wurde lokal gespeichert.\n\nℹ️ Hinweis: Deine Änderung ist nur auf diesem Gerät sichtbar und wird nicht mit anderen geteilt.',
            '✅ Your name has been saved locally.\n\nℹ️ Note: Your change is only visible on this device and not shared with others.'
          ),
          'success'
        );
        
      } catch (error) {
        console.error("Error updating profile:", error);
        this.showModal(
          this.t('Fehler', 'Error'),
          this.t(
            "Fehler beim Speichern. Bitte versuche es erneut.",
            "Error saving. Please try again."
          ),
          'error'
        );
      }
    },
    
    /**
     * Logs the user out locally and attempts
     * to notify the backend session.
     *
     * Always clears local storage and redirects
     * to the login page.
     *
     * @async
     * @returns {Promise<void>}
     */
    async confirmLogout() {
      this.showLogoutModal = false;
      this.isLoggingOut = true;
      this.message = "";
      
      // Clear local storage
      localStorage.removeItem("selectedWGID");
      localStorage.removeItem("selectedWGName");
      localStorage.removeItem("wgList");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      localStorage.removeItem("inviteLinkfromAPI");
      localStorage.removeItem("frontendLink");
      
      // Try to notify backend
      try {
        const res = await fetch(`${API_BASE}/user/logout`, {
          method: "POST",
          credentials: "include",
        });
        
        if (res.ok) {
          this.message = this.t(
            "Erfolgreich ausgeloggt. Weiterleitung …",
            "Successfully logged out. Redirecting…"
          );
        } else {
          this.message = this.t(
            "Abmeldung fehlgeschlagen, aber lokale Daten wurden gelöscht.",
            "Logout failed on server, but local session cleared."
          );
        }
      } catch (err) {
        console.warn("No server contact:", err);
        this.message = this.t(
          "Kein Serverkontakt – du wurdest lokal ausgeloggt.",
          "No server connection – logged out locally."
        );
      }
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
    },
    
    /**
     * Handles account deletion attempt.
     *
     * Currently only validates password input
     * and shows an informational warning because
     * backend deletion is not supported.
     *
     * @async
     * @returns {Promise<void>}
     */
    async confirmDeleteAccount() {
      if (!this.deletePassword) {
        this.showModal(
          this.t('Passwort erforderlich', 'Password Required'),
          this.t("Bitte gib dein Passwort ein.", "Please enter your password."),
          'error'
        );
        return;
      }
      
      // Show info that backend doesn't support deletion
      this.showModal(
        this.t('Account-Löschung nicht verfügbar', 'Account Deletion Unavailable'),
        this.t(
          '⚠️ Aktuell ist keine Account-Löschung möglich .\n\nBitte kontaktiere einen Administrator, wenn du deinen Account löschen möchtest.',
          '⚠️ Account deletion is currently not supported.\n\nPlease contact an administrator if you want to delete your account.'
        ),
        'warning'
      );
      
      this.showDeleteAccount = false;
      this.deletePassword = "";
    },
    
    /**
     * Opens the notification settings modal.
     *
     * @returns {void}
     */
    openNotificationSettings() {
      this.showNotificationSettings = true;
    },
    
    /**
     * Toggles a single notification setting
     * and persists it in localStorage.
     *
     * @param {string} key - Notification setting key
     * @returns {void}
     */
    toggleNotification(key) {
      this.notifications[key] = !this.notifications[key];
      localStorage.setItem(`notif_${key}`, this.notifications[key]);
    },
    
    /**
     * Closes the notification settings modal
     * and confirms local persistence.
     *
     * @returns {void}
     */
    saveNotificationSettings() {
      this.showNotificationSettings = false;
      this.showModal(
        this.t('Gespeichert', 'Saved'),
        this.t(
          "✅ Benachrichtigungseinstellungen lokal gespeichert!",
          "✅ Notification settings saved locally!"
        ),
        'success'
      );
    },

    /**
     * Displays placeholder information for
     * future currency settings.
     *
     * @returns {void}
     */
    openCurrencySettings() {
      this.showCurrencySettings = true;
      this.showModal(
        this.t('In Entwicklung', 'In Development'),
        this.t(
          "Währungseinstellungen werden in einer zukünftigen Version verfügbar sein.",
          "Currency settings will be available in a future version."
        ),
        'info'
      );
      this.showCurrencySettings = false;
    },
  },
  
  /**
   * Lifecycle hook executed after component mount.
   *
   * @async
   * @returns {Promise<void>}
   */
  async mounted() {
    document.body.classList.toggle("dark-mode", this.theme === "dark");
        await this.fetchUserData();
    
    const nameParts = this.user.name.split(" ");
    this.editUser.firstName = nameParts[0] || "";
    this.editUser.lastName = nameParts.slice(1).join(" ") || "";
  },
  
  watch: {
    /**
     * Resets edit form when profile modal opens.
     *
     * @param {boolean} newVal
     */    showEditProfile(newVal) {
      if (newVal) {
        const nameParts = this.user.name.split(" ");
        this.editUser.firstName = nameParts[0] || "";
        this.editUser.lastName = nameParts.slice(1).join(" ") || "";
        this.editUser.password = "";
      }
    },
    
    /**
     * Clears password field when delete-account modal opens.
     *
     * @param {boolean} newVal
     */
    showDeleteAccount(newVal) {
      if (newVal) {
        // Reset password field
        this.deletePassword = "";
      }
    },
  },
}).mount("#app");