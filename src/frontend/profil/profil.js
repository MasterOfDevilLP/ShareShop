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
    avatars : [
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
        type: "info", // 'info', 'success', 'warning', 'error'
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
            if (userData.firstName || userData.lastName) {
              this.user.name = [userData.firstName, userData.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() || userData.email.split("@")[0];
            } else {
              this.user.name = userData.email.split("@")[0];
            }
            
            localStorage.setItem("userName", this.user.name);
          }
          // If no email, just keep the cached name or default
          
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
    },
    
    // === Profile Editing ===
    openEditProfile() {
      // Populate edit form with current data
      this.editUser.name = this.user.name;
      this.editUser.email = this.user.email;
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
        
        // NOTE: The API currently doesn't have a full implementation for updating user profile
        // The endpoint exists (POST /user) but returns "Not yet implemented"
        
        this.showModal(
          this.t('Hinweis', 'Note'),
          this.t(
            "Die API unterstützt derzeit keine Profiländerungen. Der Endpoint muss noch implementiert werden.\n\nLokal gespeicherte Daten wurden aktualisiert.",
            "The API currently doesn't support profile updates. The endpoint needs to be implemented.\n\nLocally stored data has been updated."
          ),
          'info'
        );
        
        // Update local display and storage
        const fullName = [this.editUser.firstName, this.editUser.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        
        if (fullName) {
          this.user.name = fullName;
          localStorage.setItem("userName", fullName);
        }
        
        this.showEditProfile = false;
        
        /* 
        // Uncomment when the backend endpoint is fully implemented:
        const updateData = {
          firstName: this.editUser.firstName || null,
          lastName: this.editUser.lastName || null,
          email: this.editUser.email,
        };
        
        if (this.editUser.password.trim()) {
          updateData.password = this.editUser.password;
        }
        
        const response = await fetch(`${API_BASE}/user`, {
          method: "POST", // or PATCH when implemented
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updateData),
        });
        
        if (response.ok) {
          // Update local data
          const fullName = [this.editUser.firstName, this.editUser.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || this.editUser.email.split("@")[0];
          
          this.user.name = fullName;
          this.user.email = this.editUser.email;
          localStorage.setItem("userName", fullName);
          localStorage.setItem("userEmail", this.editUser.email);
          
          alert(this.t("Profil erfolgreich aktualisiert!", "Profile updated successfully!"));
          this.showEditProfile = false;
        } else {
          const errorData = await response.json();
          alert(this.t(
            `Fehler beim Aktualisieren: ${errorData.message || "Unbekannter Fehler"}`,
            `Update failed: ${errorData.message || "Unknown error"}`
          ));
        }
        */
      } catch (error) {
        console.error("Error updating profile:", error);
        this.showModal(
          this.t('Fehler', 'Error'),
          this.t(
            "Fehler beim Aktualisieren des Profils. Bitte versuche es später erneut.",
            "Error updating profile. Please try again later."
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
      
      // Show additional confirmation
      this.showConfirm(
        this.t('⚠️ Konto löschen', '⚠️ Delete Account'),
        this.t(
          "WARNUNG: Dies wird dein Konto und alle deine Daten DAUERHAFT löschen!\n\nBist du absolut sicher?",
          "WARNING: This will PERMANENTLY delete your account and all your data!\n\nAre you absolutely sure?"
        ),
        async () => {
          // User confirmed, proceed with deletion
          try {
            // NOTE: The API currently doesn't have an endpoint for deleting user accounts
            // Expected endpoint: DELETE /user with password verification
            
            this.showModal(
              this.t('Hinweis', 'Note'),
              this.t(
                "Die API unterstützt derzeit keine Kontolöschung. Ein neuer Endpoint muss implementiert werden.\n\nBitte kontaktiere einen Administrator.",
                "The API currently doesn't support account deletion. A new endpoint needs to be implemented.\n\nPlease contact an administrator."
              ),
              'info'
            );
            
            this.showDeleteAccount = false;
            this.deletePassword = "";
            
            /*
            // Uncomment this when the backend endpoint is ready:
            const response = await fetch(`${API_BASE}/user`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                password: this.deletePassword,
              }),
            });
            
            if (response.ok) {
              // Clear all local data
              localStorage.clear();
              
              this.showModal(
                this.t('Erfolgreich', 'Success'),
                this.t(
                  "Dein Konto wurde erfolgreich gelöscht.",
                  "Your account has been successfully deleted."
                ),
                'success',
                [{
                  text: 'OK',
                  action: () => {
                    window.location.href = "../index.html";
                  },
                  class: 'btn-save'
                }]
              );
            } else {
              const errorData = await response.json();
              this.showModal(
                this.t('Fehler', 'Error'),
                this.t(
                  `Fehler beim Löschen: ${errorData.message || "Falsches Passwort"}`,
                  `Deletion failed: ${errorData.message || "Incorrect password"}`
                ),
                'error'
              );
            }
            */
          } catch (error) {
            console.error("Error deleting account:", error);
            this.showModal(
              this.t('Fehler', 'Error'),
              this.t(
                "Fehler beim Löschen des Kontos. Bitte versuche es später erneut.",
                "Error deleting account. Please try again later."
              ),
              'error'
            );
          }
        }
      );
    },
    
    // === Notification Settings (placeholder) ===
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
          "Benachrichtigungseinstellungen gespeichert!",
          "Notification settings saved!"
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