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
    this.createInviteLink();
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
      } catch (err) {
        console.error("Invite Fehler:", err.message);
      }
    },

  },
});
