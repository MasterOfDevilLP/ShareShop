import { API_BASE } from "../config.js";
new Vue({
  el: "#setting",
  data: {
    baseUrl: window.location.origin, //baseURL von Invite Link
    wgList: JSON.parse(localStorage.getItem("wgList")) || [],
    selectedWG: localStorage.getItem("selectedWG") || null,
    selectedWGName: localStorage.getItem("selectedWGName") || "WG auswählen",
    newGroupName: "",
    wgUsers: [],
    inviteLinkfromAPI: "",
    showError: function (msg) {
      console.error("Fehler:", msg);
    }
  },
  mounted() {
    console.log("Mounted: selectedWG =", this.selectedWG);

    this.createInviteLink().then(() => {
      console.log("InviteLink nach Erstellung:", this.inviteLinkfromAPI);
    });
  },

  methods: {
    /**
     * Einladungslink erstellen & teilen
     */
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
          body: JSON.stringify({
            expires: null,
            targetUser: null,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Fehler ${response.status}`);
        }

        const data = await response.json();

        this.inviteLinkfromAPI = `${window.location.origin}/invite/${data.id}`;
        localStorage.setItem("inviteLinkfromAPI", this.inviteLinkfromAPI);

        console.log("InviteLink nach Erstellung:", this.inviteLinkfromAPI);
      } catch (err) {
        console.error("Invite Fehler:", err.message);
      }
    },

  },
    
  // Endpoint zum Abrufen der WG-Benutzer ist noch nicht implementiert
    // async fetchWGUsers() {
    // try {
    //     const wid = this.selectedWG;
    //     const response = await fetch(`${API_BASE}/wg/${wid}/user`);
    //     if (!response.ok) throw new Error("Konnte Users nicht laden");

    //     const users = await response.json();
    //     console.log("Users:", users);
    //     this.wgUsers = users;
    // } catch (error) {
    //     console.error(error);
    // }
    // console.log("WG",this.selectedWG);
    // },
});
