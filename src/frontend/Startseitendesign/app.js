import { API_BASE_URL } from '../config.js';
new Vue({ 
  el: '#app',
  data: {
    lists: [
      { id: "1", name: "Wocheneinkauf" }
    ],
    wgList: JSON.parse(localStorage.getItem("wgList")) || [
      { id: 1, name: "WG Sonnenstraße" },
      { id: 2, name: "WG Blumenweg" },
      { id: 3, name: "WG Fuchsbau" },
      { id: 4, name: "WG Mondhain" }
    ],
    
    selectedWG: localStorage.getItem("selectedWGID") || 1,
    selectedWGName: localStorage.getItem("selectedWGName") || "",
    benutzerID: 123,
    touched: {
    name: false,
    beschreibung: false
    },
    newList: {
    name: '',
    beschreibung: '',
    wg: ''
    },
    showPopup: false,
    showCreateGroupModal: false,
    //newGroupName: '',
    showListOptions: false,
    selectedList: null,
    showRenameModal: false,
    renameListName: '',
    isWGOpen: false,
  },
  computed: {
    isListValid() {
      return this.newList.name.trim() !== '';
    }
  },


    methods: {
      
      //Fragen Einkaufliste von DB ab 
      async fetchLists() {
        try {
          const response = await fetch(`${API_BASE_URL}/api/lists`); 
          if (!response.ok) throw new Error('Fehler beim Laden der Listen');
          const data = await response.json();
          this.lists = data.map(item => ({
            id: item.listID,
            name: item.listName,
          }));
        } catch (error) {
          console.error(error);
          alert('Konnte Listen nicht laden');
        }
      },
      
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

      saveList() {
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
      },

 
      //Liste erstellen
async saveList() {
  if (!this.newList.name) {
    alert("Bitte einen Namen eingeben.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/wg/${this.selectedWG}/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: this.newList.name })
    });

    let data;

    try {
      data = await response.json();
    } catch (err) {
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.message || `Fehler ${response.status}`);
    }

    if (!data || !data.id) {
      throw new Error("Backend hat keine Listen-ID zurückgegeben.");
    }

    this.lists.push({
      id: data.id,
      name: this.newList.name.trim()
    });

    this.closePopup();

  } catch (error) {
    alert("Fehler beim Erstellen der Liste: " + error.message);
  }
},



      //Liste anpassen
      /*
      async updateList(){
       const list = this.lists.find(l => l.id === listID);
        if (!list) {
          alert("Die Liste nicht gefunden");
          return;
        }
        
        const listData = {
          listID:  listID,
          listName: newName,
          creationDate: list.creationDate 
        };

        try {
            const response = await fetch(`/api/list/update/${listID}`, { //wgID ist Parameter
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(listData)
            });

            if (response.ok) {
              const idx = this.lists.findIndex(l => l.id === listID);
              if (idx !== -1) {
                this.lists[idx].name = newName;                      
              }
            } else {
              alert("Fehler beim Aktualisieren der Liste"); 
            }
        } catch (error) {
          console.error(error);
          alert("Fehler beim Netzwerk"); 
        }
      }/*
      /*

      //Liste loeschen
      async deleteList(listID) {
      try {
        const response = await fetch(`api/list/delete/${listID}`, {
          method: "DELETE"
        });
        if (response.ok) {
          this.lists = this.lists.filter(l => l.id !== listID);
        } else {
          alert("Fehler beim Löschen der Liste");
        }
      } catch (error) {
        console.error(error);
        alert("Fehler beim Netzwerk");
      }
    },

       
  selectWG(id) {
        document.getElementById("dropdown-toggle").checked = false;

        if (id === '__create__') {
          this.showCreateGroupModal = true;
          this.selectedWG = null;
          this.selectedWGName = "Neue Gruppe";
          return;
        }

        const wg = this.wgList.find(w => w.id === id);
        if (wg) {
          this.selectedWG = wg.id;
          this.selectedWGName = wg.name;
          //this.switchWG();
        }
      },*/

  selectWGForNewList(name) {
      this.newList.wg = name;
      this.isWGOpen = false;
    },
      
      //Logik WG wechsel
      /*
      async switchWG() {
        if (this.selectedWG === '__create__') {
          this.showCreateGroupModal = true;
          this.selectedWG = null;
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/lists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              benutzerID: this.benutzerID,
              neueWGID: this.selectedWG
            })
          });

          if (!response.ok) throw new Error("WG-Wechsel fehlgeschlagen");

          const result = await response.json();
          console.log("WG gewechselt:", result);
          alert("WG erfolgreich gewechselt");

        } catch (error) {
          console.error("Fehler beim WG-Wechsel:", error);
          alert("Fehler beim Wechseln der WG");
        }
      },*/
/* --> Formular für WG erstellung branch #145      
async createNewGroup() {
    if (!this.newGroupName.trim()) {
        alert("Bitte einen Gruppennamen eingeben.");
        return;
    }

    try {
      console.log("Sende WG-Daten an Server:", JSON.stringify({ name: this.newGroupName }));
        const response = await fetch(`${API_BASE_URL}/wg/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',  // Stellt sicher, dass der Cookie mitgesendet wird
            body: JSON.stringify({
                name: this.newGroupName
            })
        });

        // Wenn die Antwort erfolgreich war, den JSON-Inhalt direkt extrahieren
        const result = await response.json();

        console.log("Serverantwort:", response.status, result);

        // Wenn erfolgreich
       if (response.ok) {
            alert("WG erfolgreich erstellt: " + result.name);  // Die Antwort kann hier ein Text sein, kein JSON

          // Neue WG zur Liste hinzufügen
          this.wgList.push({
              name:this.newGroupName
          });

          // Lokale Speicherung
          localStorage.setItem("wgList", JSON.stringify(this.wgList));
          localStorage.setItem("selectedWGID", result.id);
          localStorage.setItem("selectedWGName", result.name);

          // Auswahl updaten
          this.selectedWG = result.id;
          this.selectedWGName = result.name;

          // Modal schließen & Eingabe zurücksetzen
          this.showCreateGroupModal = false;
          this.newGroupName = '';

        } else if (response.status === 400) {
            // Fehler bei 400 Bad Request - Server gibt möglicherweise mehr Details zurück
            console.error("Fehler 400: Bad Request. Serverantwort:", result);
            alert("Fehler beim Erstellen der WG. Serverantwort: " + result);
        } else if (response.status === 401) {
            // Authentifizierungsfehler
            alert("Backend verweigert Zugriff (401). Bitte sicherstellen, dass der Benutzer eingeloggt ist.");
        } else {
            // Anderer Fehlercode
            alert("Fehler beim Erstellen der WG. Serverantwort: " + result);
            throw new Error("Fehlercode: " + response.status);
        }
    } catch (error) {
        console.error("Fehler beim Erstellen der WG:", error);
        alert("Fehler beim Erstellen der WG. Details: " + error.message);
    }
},
*/
      /* Lokal
      createNewGroup() {
        if (!this.newGroupName.trim()) {
          alert("Bitte einen Gruppennamen eingeben.");
          return;
        }

        const newGroup = {
          id: Date.now(),
          name: this.newGroupName
        };

        this.wgList.push(newGroup);
        this.selectedWG = newGroup.id;
        this.selectedWGName = newGroup.name;
        this.newGroupName = '';
        this.showCreateGroupModal = false;

        localStorage.setItem("wgList", JSON.stringify(this.wgList));
        localStorage.setItem("selectedWGID", newGroup.id);
        localStorage.setItem("selectedWGName", newGroup.name);
      },*/
      

      openRenameModal() {
        if (!this.selectedList) return;
        this.renameListName = this.selectedList.name;
        this.showRenameModal = true;
      },
      //Lokale Umbennung Liste 
      renameList() {
        if (!this.renameListName.trim()) {
          alert("Name darf nicht leer sein.");
          return;
        }

        // optional nur lokal:
        const index = this.lists.findIndex(l => l.id === this.selectedList.id);
        if (index !== -1) {
          this.lists[index].name = this.renameListName;
          this.showRenameModal = false;
          this.showListOptions = false;
        }

        // alternativ: updateList() aufrufen
        // this.updateList();
      }, 
/* Logik Umbennung Liste 
    async renameList() {
  if (!this.selectedList || !this.renameListName.trim()) {
    alert("Name darf nicht leer sein.");
    return;
  }

  const listID = this.selectedList.id;
  const newName = this.renameListName;

  try {
    const response = await fetch(`/api/list/update/${listID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        listID: listID,
        listName: newName
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Unbekannter Fehler");
    }

    // Lokale Liste aktualisieren
    const index = this.lists.findIndex(l => l.id === listID);
    if (index !== -1) {
      this.lists[index].name = newName;
    }

    this.showRenameModal = false;
    this.showListOptions = false;
    alert("Liste erfolgreich umbenannt.");
  } catch (error) {
    console.error("Fehler beim Umbenennen:", error);
    alert("Umbenennen fehlgeschlagen: " + error.message);
  }
},*/

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