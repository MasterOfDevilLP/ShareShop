import { API_BASE } from "../config.js";
new Vue({
  el: "#setting",
  data: {
    wgList: JSON.parse(localStorage.getItem("wgList")) || [],
    selectedWG: localStorage.getItem("selectedWGID") || null,
    selectedWGName: localStorage.getItem("selectedWGName") || "WG auswählen",
    newGroupName: "",
    wgUsers: [],
    inviteLink: "",
  },
  mounted() {
    console.log("Mounted: selectedWG =", this.selectedWG);

    this.createInviteLink().then(() => {
      console.log("InviteLink nach Erstellung:", this.inviteLink);
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

        this.inviteLink = `${window.location.origin}/invite/${data.id}`;
        localStorage.setItem("inviteLink", this.inviteLink);

        console.log("InviteLink nach Erstellung:", this.inviteLink);
      } catch (err) {
        console.error("Invite Fehler:", err.message);
      }
    },

    /**
     * WG auswählen 
     */
    selectWG(id) {
      document.getElementById("dropdown-toggle").checked = false;

      if (id === "__create__") {
        const name = prompt("Name der neuen WG:");
        if (!name) return;

        const newId = this.wgList.length + 1;
        const newWG = { id: newId, name };
        this.wgList.push(newWG);
        this.setWG(newWG);
        return;
      }

      const wg = this.wgList.find((w) => w.id === id);
      if (wg) {
        this.setWG(wg);
      }
    },
    setWG(wg) {
      this.selectedWG = wg.id;
      this.selectedWGName = wg.name;
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
