
import { API_BASE } from '../config.js';

new Vue({ 
  el: '#app',
  data: {
    // Listen in der aktuell ausgewählten WG
    lists: [],

    // WGs (aus localStorage)
    wgList: JSON.parse(localStorage.getItem("wgList")) || [],

    // aktuell ausgewählte WG
    selectedWG: null,
    selectedWGName: "",

    // für später, aktuell egal
    benutzerID: 123,

    // Name für neue WG (im Modal)
    newGroupName: "",

    // Daten für neue Liste
    touched: {
      name: false,
      beschreibung: false
    },
    newList: {
      name: "",
      beschreibung: "",
      wg: ""
    },

    // UI-Zustände
    showPopup: false,
    showCreateGroupModal: false,
    showListOptions: false,
    selectedList: null,
    showRenameModal: false,
    renameListName: "",
    isWGOpen: false
  },

  computed: {
    isListValid() {
      return this.newList.name.trim() !== "";
    }
  },
  mounted() {


    this.fetchUserWG();
},

  methods: {
    async fetchUserWG() {
      try {
        const userResp = await fetch(`${API_BASE}/user`, {
          credentials: "include"
        });

        if (!userResp.ok) throw new Error("Fehler beim Laden der User-Daten");

        const userData = await userResp.json();
        const wid = userData.wid;
        if (!wid) throw new Error("User hat keine WG");

        const wgResp = await fetch(`${API_BASE}/wg/${wid}`, {
          credentials: "include"
        });

        if (!wgResp.ok) throw new Error("Fehler beim Laden der WG-Daten");

        const wgData = await wgResp.json();

        this.wgList = [wgData];
        this.selectedWG = wgData.wid;
        this.selectedWGName = wgData.name;
        await this.fetchLists();
        

      } catch (err) {
        console.error(err);
        this.lists = [];
        alert("Konnte WG nicht laden: " + err.message);
      }
    },

    // Popup "Liste hinzufügen" öffnen
    add_list() {
      if (!this.selectedWG) {
        alert("Bitte zuerst eine WG erstellen und auswählen.");
        return;
      }
      this.showPopup = true;
      this.showListOptions = false;
    },

    closePopup() {
      this.showPopup = false;
      this.resetNewList();
    },

    resetNewList() {
      this.newList = { name: "", beschreibung: "" };
      this.touched = { name: false, beschreibung: false };
    },

    openListOptions(list) {
      this.selectedList = list;
      this.showListOptions = true;
      this.showPopup = false;
    },

    closeListOptions() {
      this.selectedList = null;
      this.showListOptions = false;
    },

    // ─────────────────────────────
    // Liste erstellen
    // ─────────────────────────────
async saveList() {
  if (!this.newList.name.trim()) return;

  const wgId =  this.selectedWG;

  if (!wgId) {
    alert("Bitte zuerst eine WG auswählen."); 

    return;
  }

  try {
    const response = await fetch(`${API_BASE}/wg/${wgId}/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: this.newList.name.trim() })
    });

    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      console.warn("Response ist kein JSON:", e);
    }

    if (!response.ok) {
      throw new Error(data?.message || `Fehler ${response.status}`);
    }

    const key = `lists_${wgId}`;
    const saved = JSON.parse(localStorage.getItem(key)) || [];

    const newItem = {
      id: data?.id || `temp-${Date.now()}`,
      name: this.newList.name.trim(),
      beschreibung: this.newList.beschreibung || ""
    };

    saved.push(newItem);
    localStorage.setItem(key, JSON.stringify(saved));

    if (this.selectedWG === wgId) {
      this.lists.push(newItem);
    }

    this.closePopup();

  } catch (err) {
    console.error(err);
    alert("Fehler beim Erstellen: " + err.message);
  }
},


    // ─────────────────────────────
    // WG aus Dropdown auswählen
    // ─────────────────────────────
    selectWG(id) {
      if (id === "__create__") {
        this.showCreateGroupModal = true;
        return;
      }

      const wg = this.wgList.find(w => w.id === id);
      if (!wg) return;

      this.selectedWG = wg.id;
      this.selectedWGName = wg.name;

      localStorage.setItem("selectedWG", wg.id);
      localStorage.setItem("selectedWGName", wg.name);

      // Listen der neuen WG laden
      this.lists = [];
      this.fetchLists();
    },

    // WG für neue Liste auswählen
    selectWGForNewList(wg) {
      this.newList.wg = {
        id: wg.id,
        name: wg.name
      };
      this.isWGOpen = false;
    },



    // ─────────────────────────────
    // Listen der aktuellen WG laden
    // ─────────────────────────────
    async fetchLists(wgIdOverride = null) {
      const wgId = wgIdOverride || this.selectedWG;
      if (!wgId) {
          console.warn("Keine WG ausgewählt! → fetchLists übersprungen");
          this.lists = [];
          return;
      };

      try {
        const response = await fetch(`${API_BASE}/wg/${wgId}/list`, {
          credentials: "include"
        });

        // keine Listen / keine Berechtigung = einfach leer lassen
        if (response.status === 403 || response.status === 404) {
          console.warn("Keine Listen für diese WG (neuer User / keine Berechtigung).");
          this.lists = [];
          return;
        }

        if (!response.ok) {
          if (response.status === 500) {
        console.warn("Backend 500 → set lists leer");
        this.lists = [];
        return;
      }
          throw new Error("Fehler beim Laden der Listen");
        }

        // Backend liefert: ["id1,name1,item", "id2,name2,item", ...]
        const data = await response.json();

        this.lists = data.map(l => ({
          id: l.id,
          name: l.name || "neue Liste",
          beschreibung: l.beschreibung || ""
        }));
        

      } catch (err) {
        console.error(err);
        // für echte Fehler kannst du den Alert lassen, wenn du willst:
        // alert("Konnte Listen nicht laden: " + err.message);
      }
    },


    // ─────────────────────────────
    // Neue WG erstellen
    // ─────────────────────────────
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
          body: JSON.stringify({ name: this.newGroupName.trim() })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || `Fehler ${response.status}`);
        }

        if (!data || !data.id) {
          throw new Error("Backend hat keine WG-ID zurückgegeben.");
        }

        const newGroup = {
          id: data.id,
          name: this.newGroupName.trim()
        };

        // WG-Liste im Frontend & localStorage ergänzen
        this.wgList.push(newGroup);
        localStorage.setItem("wgList", JSON.stringify(this.wgList));

        // leeren Listen-Speicher für diese WG erzeugen
        localStorage.setItem(`lists_${newGroup.id}`, JSON.stringify([]));

        // Auswahl auf neue WG setzen
        this.selectedWG = newGroup.id;
        this.selectedWGName = newGroup.name;
        localStorage.setItem("selectedWG", newGroup.id);
        localStorage.setItem("selectedWGName", newGroup.name);

        // UI-Reset
        this.lists = [];
        this.newGroupName = "";
        this.showCreateGroupModal = false;

        alert("WG wurde erstellt!");
      } catch (err) {
        console.error("Fehler beim Erstellen der WG:", err);
        alert("Fehler beim Erstellen der WG: " + err.message);
      }
    },

    // ─────────────────────────────
    // Liste umbenennen
    // ─────────────────────────────
    openRenameModal() {
      if (!this.selectedList) return;
      this.renameListName = this.selectedList.name;
      this.showRenameModal = true;
    },
    //lokale änderung
    renameList() {
      if (!this.renameListName.trim()) {
        alert("Name darf nicht leer sein.");
        return;
      }

      const newName = this.renameListName.trim();
      const wgId = this.selectedWG;
      if (!wgId) return;

      // UI aktualisieren
      const index = this.lists.findIndex(l => l.id === this.selectedList.id);
      if (index !== -1) {
        this.lists[index].name = newName;
      }

      // localStorage aktualisieren (WG-spezifisch)
      const key = `lists_${wgId}`;
      const saved = JSON.parse(localStorage.getItem(key)) || [];
      const sIndex = saved.findIndex(x => x.id === this.selectedList.id);

      if (sIndex !== -1) {
        saved[sIndex].name = newName;
        localStorage.setItem(key, JSON.stringify(saved));
      }

      this.showRenameModal = false;
      this.showListOptions = false;
    },

    openWGCreateModal() {
      this.showCreateGroupModal = true;
    },

    dev_logout(){
      localStorage.removeItem("wgList");
      localStorage.removeItem("selectedWG");
      localStorage.removeItem("selectedWGName");
      window.location.href = "../Login/index.html";

    }
  },



});

// Service Worker (optional behalten)
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registriert:', registration);
      })
      .catch(error => {
        console.log('ServiceWorker Registrierung fehlgeschlagen:', error);
      });
  });
  
}
*/