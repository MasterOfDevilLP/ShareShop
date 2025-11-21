import { API_BASE_URL } from "../config.js";

new Vue({
  el: "#app",
  data: {
    // Beispiel-Listen
    lists: [
      { id: "1", name: "Wocheneinkauf" }
    ],

    // WG-Liste (IDs als STRING!)
    wgList: JSON.parse(localStorage.getItem("wgList")) || [],

    // Auswahl der aktuellen WG
    selectedWG: localStorage.getItem("selectedWGID") || "1",
    selectedWGName: localStorage.getItem("selectedWGName") || "WG Sonnenstraße",

    // für später, aktuell egal
    benutzerID: 123,

    // *** HIER: Name aus deinem WG-Modal ***
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



    methods: {
      
      add_list() {
      this.showPopup = true;
      this.showListOptions = false;
      },

      closePopup() {
        this.showPopup = false;
        this.resetNewList();
      },

      resetNewList() {
      this.newList = { name: '', beschreibung: '', wg: '' };
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

      /*saveList() {
          if (!this.isListValid) {
    this.touched.name = true;
    this.touched.beschreibung = true;
    return;
  }

  const listID = Date.now().toString(36);
  const newListData = {
    id: listID,
    name: this.newList.name,
    beschreibung: this.newList.beschreibung,
    wg: this.newList.wg
  }
  // Lokal speichern
  this.lists.push(newListData);
  this.resetNewList();
  this.showPopup = false;
  alert("Liste erfolgreich gespeichert");
      },*/

 
//Liste erstellen
async saveList() {
  if (!this.newList.name.trim()) return;

  try {
    const response = await fetch(`${API_BASE_URL}/wg/${this.selectedWG}/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: this.newList.name.trim() })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Fehler");
    }

    // Name für das UI speichern
    let saved = JSON.parse(localStorage.getItem("lists")) || [];
    saved.push({
      id: data.id,
      name: this.newList.name.trim(),
      beschreibung: this.newList.beschreibung || ""
    });

    localStorage.setItem("lists", JSON.stringify(saved));

    // Listen neu laden
    await this.fetchLists();

    this.closePopup();

  } catch (err) {
    console.error(err);
    alert("Fehler beim Erstellen: " + err.message);
  }
},


       
// WG aus Dropdown auswählen
selectWG(id) {
  if (id === "__create__") {
    this.showCreateGroupModal = true;
    return;
  }

  const wg = this.wgList.find(w => w.id === id);

  if (wg) {
    this.selectedWG = wg.id;
    this.selectedWGName = wg.name;

    localStorage.setItem("selectedWGID", wg.id);
    localStorage.setItem("selectedWGName", wg.name);

    this.fetchLists();  // <--- WICHTIG
  }
},




    // WG für neue Liste auswählen (falls du so ein Dropdown hast)
    selectWGForNewList(name) {
      this.newList.wg = name;
      this.isWGOpen = false;
    },

    // GET List
  async fetchLists() {
  try {
    const response = await fetch(`${API_BASE_URL}/wg/${this.selectedWG}/list`, {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Fehler beim Laden der Listen");
    }

    // Backend liefert: ["id1", "id2", ...]
    const ids = await response.json();

    // Namen aus localStorage holen
    const saved = JSON.parse(localStorage.getItem("lists")) || [];

    // IDs in Objekte mit Name umwandeln
    this.lists = ids.map(id => {
      const existing = saved.find(x => x.id === id);
      return existing || { id, name: "Neue Liste", beschreibung: "" };
    });

  } catch (err) {
    console.error(err);
    alert("Konnte Listen nicht laden");
  }
},

  
 
// Neue WG erstellen API
    async createNewGroup() {
      if (!this.newGroupName.trim()) {
        alert("Bitte einen Gruppennamen eingeben.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/wg/create`, {
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
        id: data.id,                // <-- WICHTIG!
        name: this.newGroupName
      };


        // Liste im Frontend ergänzen
        this.wgList.push(newGroup);

        // Auswahl aktualisieren + speichern
        this.selectedWG = newGroup.id;
        this.selectedWGName = newGroup.name;
        localStorage.setItem("wgList", JSON.stringify(this.wgList));
        localStorage.setItem("selectedWGID", newGroup.id);
        localStorage.setItem("selectedWGName", newGroup.name);

        // Modal schließen
        this.newGroupName = "";
        this.showCreateGroupModal = false;

        alert("WG wurde erstellt!");
      } catch (err) {
        console.error("Fehler beim Erstellen der WG:", err);
        alert("Fehler beim Erstellen der WG: " + err.message);
      }
    },

    openRenameModal() {
      if (!this.selectedList) return;
      this.renameListName = this.selectedList.name;
      this.showRenameModal = true;
    },

    renameList() {
      if (!this.renameListName.trim()) {
        alert("Name darf nicht leer sein.");
        return;
      }

      const index = this.lists.findIndex(
        l => l.id === this.selectedList.id
      );
      if (index !== -1) {
        this.lists[index].name = this.renameListName.trim();
        this.showRenameModal = false;
        this.showListOptions = false;
      }
    },

    openWGCreateModal() {
    this.showCreateGroupModal = true;
     },


mounted() {
  const wid = localStorage.getItem("selectedWG");

  if (!wid) {
    console.error("Keine WG ausgewählt!");
    alert("Bitte zuerst eine WG auswählen!");
    window.location.href = "startseite.html"; // oder deine WG-Auswahl
    return;
  }

  this.selectedWG = wid;
  this.fetchLists();
},


  }
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