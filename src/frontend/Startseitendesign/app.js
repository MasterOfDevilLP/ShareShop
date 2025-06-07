new Vue({
  el: '#app',
  data: {
    lists: [
      { id: "1", name: "Wocheneinkauf" }
    ],
    wgList: [
      { id: 1, name: "WG Sonnenstraße" },
      { id: 2, name: "WG Blumenweg" },
      { id: 3, name: "WG Fuchsbau" },
      { id: 4, name: "WG Mondhain" }
    ],
    selectedWG: 1,
    benutzerID: 123,
    newList: { name: '' },
    showPopup: false
  },
    
    methods: {
      //Fragen Einkaufliste von DB ab 
      async fetchLists() {
        try {
          const response = await fetch('/api/lists'); 
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
      },

      closePopup() {
        this.showPopup = false;
        this.resetNewList();
      },

      resetNewList() {
            this.newList = { name: ''};
      },

      saveList() {
        if(!this.newList.name) 
          {
          alert('Bitte alle Felder ausfüllen.');
          return;
          }

        this.lists.push({
          id: Date.now().toString(36), // Date.now() gibt die aktuelle Zeit in Millisekunden seit dem 1. Januar 1970 zurück (z. B. 1717171234567), .toString(36) wandelt diese Zahl in das Zahlensystem zur Basis 36 um 
          name: this.newList.name
        });

        this.closePopup();
      },

      /* pseudocode
      //Liste erstellen
      async saveList() {
        if (!this.newList.name) {
          alert('Bitte alle Felder ausfüllen.');
          return;
        }

        const now = new Date();
        const creationDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const listID = Date.now().toString(36);

        fetch('/api/List/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            listID: listID,
            listName: this.newList.name,
            creationDate: creationDate,
          })
        })
        .then(response => {
          if (!response.ok) throw new Error('API fehlgeschlagen');
          return response.json();
        })
        .then(data => {
          this.lists.push({ id:listID, name: this.newList.name });
          this.closePopup();
        })
        .catch(error => {
          alert('Fehler beim Erstellen der Liste: ' + error.message);
        });
        }

      //Liste anpassen
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
      }

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

       */
    
    async switchWG() {
      try {
        const response = await fetch('/api/wg/switch', { // korrekten pfad angeben
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
    }

  }
});


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registriert:', registration);
    }).catch(error => {
      console.log('ServiceWorker Registrierung fehlgeschlagen:', error);
    });
  });
}