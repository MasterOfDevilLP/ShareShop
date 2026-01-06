import { API_BASE } from '../config.js';

const { createApp, reactive } = Vue;

// === Language Store ===
const LanguageStore = reactive({
  language: localStorage.getItem("language") || "de",
});

// === Translation Helper ===
const t = (de, en) => (LanguageStore.language === "de" ? de : en);

// === Main App ===
createApp({
  data() {
    return {
      // User Data
      user: {
        name: localStorage.getItem("userName") || "User Name",
        email: localStorage.getItem("userEmail") || "abc@gmail.com",
        avatar: localStorage.getItem("userAvatar") || "avatar1",
      },
      
      // Available avatars
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
      
      // Edit User Data (for modal)
      editUser: {
        firstName: "",
        lastName: "",
        password: "",
      },
      
      // Settings
      theme: localStorage.getItem("theme") || "light",
      language: LanguageStore.language,
      
      // UI State
      message: "",
      isLoggingOut: false,
      showLogoutModal: false,
      showEditProfile: false,
      showAvatarPicker: false,
      showNotificationSettings: false,
      showCurrencySettings: false,
      showDeleteAccount: false,
      
      // Delete Account
      deletePassword: "",
      
      // Notification Settings
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
    // === Translation Method ===
    t,
    
    // === Custom Modal System ===
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
    
    // === Fetch User Data from Backend ===
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
            localStorage.setItem("userID", userData.uid || userData.id);
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
    
    // === Theme Management ===
    setTheme(mode) {
      this.theme = mode;
      localStorage.setItem("theme", mode);
      document.body.classList.toggle("dark-mode", mode === "dark");
    },
    
    // === Language Management ===
    setLanguage(lang) {
      this.language = lang;
      LanguageStore.language = lang;
      localStorage.setItem("language", lang);
    },
    
    // === Avatar Management ===
    getAvatarData(avatarId) {
      return this.avatars.find(a => a.id === avatarId) || this.avatars[0];
    },
    
    selectAvatar(avatarId) {
      this.user.avatar = avatarId;
      localStorage.setItem("userAvatar", avatarId);
      this.showAvatarPicker = false;
      
      // Info: Lokal gespeichert
      this.showModal(
        this.t('Avatar geändert', 'Avatar changed'),
        this.t(
          '✅ Avatar wurde lokal gespeichert.\n\nℹ️ Hinweis: Das Backend unterstützt keine Profiländerungen. Deine Änderung ist nur auf diesem Gerät sichtbar.',
          '✅ Avatar has been saved locally.\n\nℹ️ Note: The backend doesn\'t support profile changes. Your change is only visible on this device.'
        ),
        'success'
      );
    },
    
    // === Profile Editing ===
    openEditProfile() {
      // Populate edit form with current data
      const nameParts = this.user.name.split(" ");
      this.editUser.firstName = nameParts[0] || "";
      this.editUser.lastName = nameParts.slice(1).join(" ") || "";
      this.editUser.password = "";
      this.showEditProfile = true;
    },
    
    async saveProfile() {
      try {
        // Validate password if changed
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
        
        // Update local display and storage
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
        
        // Speichere lokal
        this.user.name = fullName;
        localStorage.setItem("userName", fullName);
        
        // Speichere firstName und lastName separat (für Backend später)
        localStorage.setItem("firstName", this.editUser.firstName);
        localStorage.setItem("lastName", this.editUser.lastName);
        
        this.showEditProfile = false;
        
        // Zeige Erfolg mit Info
        this.showModal(
          this.t('Profil aktualisiert', 'Profile updated'),
          this.t(
            '✅ Dein Name wurde lokal gespeichert.\n\nℹ️ Hinweis: Das Backend unterstützt keine Profiländerungen. Deine Änderung ist nur auf diesem Gerät sichtbar und wird nicht mit anderen geteilt.',
            '✅ Your name has been saved locally.\n\nℹ️ Note: The backend doesn\'t support profile changes. Your change is only visible on this device and not shared with others.'
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
    
    // === Logout Logic ===
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
    
    // === Account Deletion ===
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
          '⚠️ Das Backend unterstützt derzeit keine Account-Löschung.\n\nBitte kontaktiere einen Administrator, wenn du deinen Account löschen möchtest.',
          '⚠️ The backend currently doesn\'t support account deletion.\n\nPlease contact an administrator if you want to delete your account.'
        ),
        'warning'
      );
      
      this.showDeleteAccount = false;
      this.deletePassword = "";
    },
    
    // === Notification Settings ===
    openNotificationSettings() {
      this.showNotificationSettings = true;
    },
    
    toggleNotification(key) {
      this.notifications[key] = !this.notifications[key];
      localStorage.setItem(`notif_${key}`, this.notifications[key]);
    },
    
    saveNotificationSettings() {
      // Settings are already saved in localStorage via toggleNotification
      this.showNotificationSettings = false;
      this.showModal(
        this.t('Gespeichert', 'Saved'),
        this.t(
          "✅ Benachrichtigungseinstellungen lokal gespeichert!\n\nℹ️ Diese Einstellungen sind nur auf diesem Gerät aktiv.",
          "✅ Notification settings saved locally!\n\nℹ️ These settings are only active on this device."
        ),
        'success'
      );
    },
    
    // === Currency Settings (placeholder) ===
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
  
  async mounted() {
    // Apply saved theme on load
    document.body.classList.toggle("dark-mode", this.theme === "dark");
    
    // Fetch user data from backend
    await this.fetchUserData();
    
    // Initialize edit user data
    const nameParts = this.user.name.split(" ");
    this.editUser.firstName = nameParts[0] || "";
    this.editUser.lastName = nameParts.slice(1).join(" ") || "";
  },
  
  watch: {
    // Watch for edit profile modal opening
    showEditProfile(newVal) {
      if (newVal) {
        // Reset edit form when modal opens
        const nameParts = this.user.name.split(" ");
        this.editUser.firstName = nameParts[0] || "";
        this.editUser.lastName = nameParts.slice(1).join(" ") || "";
        this.editUser.password = "";
      }
    },
    
    // Watch for delete account modal opening
    showDeleteAccount(newVal) {
      if (newVal) {
        // Reset password field
        this.deletePassword = "";
      }
    },
  },
}).mount("#app");