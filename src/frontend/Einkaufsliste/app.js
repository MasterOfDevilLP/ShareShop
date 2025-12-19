/**
 * Diese Seite ermöglicht die Verwaltung der Einkaufsliste einer Wohngemeinschaft (WG).
 *
 * Funktionen und Features:
 *  - Laden und Anzeigen von WG-Produkten und der aktuellen Einkaufsliste.
 *  - Hinzufügen neuer Produkte zur Liste, inkl.:
 *      * Autovervollständigung von WG-Produkten
 *      * Erstellen neuer Produkte, falls sie noch nicht in der WG existieren
 *  - Bearbeiten bestehender Produkte in der Liste.
 *  - Produkte als gekauft markieren (Tick-Funktion).
 *  - Löschen von Produkten aus der Liste.
 *  - Ändern des Listennamens.
 *  - Verwaltung von UI-Popups:
 *      * Produkt hinzufügen/ändern
 *      * Liste löschen bestätigen
 *      * Listenname ändern
 *
 * Datenstruktur (data):
 *  - wgID, listID, list_name: aktuelle WG- und Listeninformationen
 *  - products: alle Produkte der WG (für Autocomplete und Popup)
 *  - listItems: aktuelle Items der Einkaufsliste
 *  - newProduct: Objekt für Produkt-Hinzufügen/Bearbeiten
 *  - showPopup, showDeleteListPopup, showChangeListName, isEditing: UI-Zustände
 *
 * Methoden (methods):
 *  - initData(), loadWGItems(), loadList(), parseListItems()
 *  - add_product(), openChangeProduct(), onProductNameInput(), saveProduct()
 *  - addOrCreateProduct(), createProductInWG(), addToList(), updateListItem()
 *  - removeFromList(), toggleTick()
 *  - changeListName(), goToStartseite()
 *
 * Mounted:
 *  - Prüft, ob WG und Liste ausgewählt sind, und lädt Daten entsprechend.
 *
 * Hinweis:
 *  - Alle API-Aufrufe nutzen die Basis-URL aus API_BASE.
 *  - Produkte und Listen werden teilweise im localStorage zwischengespeichert.
 */
import { API_BASE } from "../config.js";

new Vue({
  el: "#app",
  data: {
    /** @type {string} API Basis-URL */
    baseUrl: API_BASE,

    /** @type {string} Aktuell ausgewählte WG-ID */
    wgID: localStorage.getItem("selectedWGID") || "",

    /** @type {string} Aktuell ausgewählte Listen-ID */
    listID: localStorage.getItem("selectedListID") || "",

    /** @type {string} Name der aktuellen Einkaufsliste */
    list_name:
      localStorage.getItem("selectedListName") || "Meine Einkaufsliste",

    /** @type {Array} Alle Produkte in der WG */
    products: [],

    /** @type {Array} Alle Items in der Einkaufsliste */
    listItems: [],

    /** @type {Array<string>} Kategorien für Produkte */
    kategorien: [
      "Obst",
      "Gemüse",
      "Getränke",
      "Fleisch",
      "Backwaren",
      "Snacks",
      "Haushalt",
      "Sonstiges",
    ],

    /** @type {Object} Daten des aktuell neuen/zu bearbeitenden Produkts 
     * @property {string} id - Produkt-ID, falls bereits in der WG vorhanden
     * @property {string} name - Name des Produkts
     * @property {string} kategorie - Kategorie des Produkts
     * @property {number|string} menge - Menge des Produkts in der Liste
     * @property {number|string} preis - Preis des Produkts
     * @property {boolean} fromWG - Flag, ob das Produkt bereits in der WG existiert
    */
    newProduct: {
      id: "",
      name: "",
      kategorie: "",
      menge: "",
      //einheit: "",
      preis: "",
      fromWG: false,
    },

    /** @type {boolean} Popup für Produkt hinzufügen/ändern sichtbar */
    showPopup: false,

    /** @type {boolean} Popup zum Löschen der Liste sichtbar */
    showDeleteListPopup: false,

    /** @type {boolean} Popup zum Umbenennen der Liste sichtbar */
    showChangeListName: false,

    /** @type {boolean} Flag: gerade ein Produkt bearbeiten */
    isEditing: false,
  },

  mounted() {
    /**
     * Lädt initial die WG-Produkte und die Einkaufsliste, falls IDs vorhanden.
     */
    if (this.wgID && this.listID) {
      this.initData();
    } else {
      console.warn(
        "WG oder Liste nicht ausgewählt. Bitte zuerst auf der Startseite auswählen.",
      );
    }
  },

  methods: {
    /********** Initialisierung & Laden von Daten **********/

    /**
     * @description Initialisiert die Daten: WG-Produkte und Einkaufsliste laden
     */
    async initData() {
      try {
        await this.loadWGItems();
        await this.loadList();
      } catch (err) {
        console.error("Initialisierung fehlgeschlagen", err);
      }
    },

    /**
     * @description Lädt alle Produkte der WG vom Backend
     * Speichert sie in `this.products` für Autocomplete und Popup.
     * @returns {Promise<void>}
     */
    loadWGItems() {
      fetch(`${this.baseUrl}/wg/${this.wgID}/item`, { credentials: "include" })
        .then((res) => {
          if (!res.ok) {
            console.error("Fetch fehlgeschlagen:", res.status, res.statusText);
            return [];
          }
          return res.json();
        })
        .then((data) => {
          this.products = data.map((item) => ({
            id: item.iid,
            name: item.name,
            description: item.description,
            price: item.price,
          }));
          console.log("Produkte geladen:", this.products);
        });
    },

    /**
     * @description Parst die Items einer Einkaufsliste aus Backend-Daten
     * @param {Object} data - Rohdaten vom Backend
     * @returns {Array} Parsed ListItems
     */
    parseListItems(data) {
      if (!data.items || !Array.isArray(data.items)) {
        console.warn("Keine Einträge in der Einkaufsliste erhalten", data);
        return [];
      }
      return data.items.map((entry) => ({
        iid: entry.item.iid,
        name: entry.item.name,
        kategorie: entry.item.description || "",
        preis: entry.item.price || 0,
        amount: entry.amount || 0,
        ticked: entry.item.ticked || false,
        datum: entry.item.datum || "",
      }));
    },

    /**
     * @description Lädt die Items der aktuellen Einkaufsliste vom Backend. Speichert sie in `this.listItems`
     */
    loadList() {
      fetch(`${this.baseUrl}/wg/${this.wgID}/list/${this.listID}`, {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (!data.items || !Array.isArray(data.items)) {
            console.warn("Keine Einkaufsliste-Einträge erhalten", data);
            this.listItems = [];
            return;
          }
          this.listItems = this.parseListItems(data);
          console.log("Einkaufsliste geladen:", this.listItems);
        })
        .catch((err) =>
          console.error("Einkaufsliste konnte nicht geladen werden", err),
        );
    },

    /**
     * @description Gibt Icon-Pfad für Produktkategorie zurück
     * @param {string} kategorie
     * @returns {string} Icon-Pfad
     */
    getIcon(kategorie) {
      const icons = {
        Obst: "Icons/obst.png",
        Gemüse: "Icons/gemuese.png",
        Getränke: "Icons/getraenke.png",
        Fleisch: "Icons/fleisch.png",
        Backwaren: "Icons/backwaren.png",
        Haushalt: "Icons/haushalt.png",
        Snacks: "Icons/snacks.png",
        Sonstiges: "Icons/default.png",
      };
      return icons[kategorie] || "Icons/default.png";
    },

    /********** Item/Listeeintrag hinzufügen/bearbeiten **********/

    /** Öffnet Popup zum Produkt hinzufügen */
    add_product() {
      this.showPopup = true;
    },

    /** Öffnet Popup zum Produkt bearbeiten */
    openChangeProduct(item) {
      this.newProduct = { ...item, menge: item.amount };
      this.showPopup = true;
      this.isEditing = true;
    },

    /** Füllt Produktfelder automatisch, wenn Name in WG existiert */
    onProductNameInput() {
      const matched = this.products.find(
        (p) => p.name === this.newProduct.name,
      );
      if (matched) {
        this.newProduct.id = matched.id;
        this.newProduct.kategorie = matched.description;
        this.newProduct.preis = matched.price;
        this.newProduct.fromWG = true;
      } else {
        this.newProduct.id = "";
        this.newProduct.kategorie = "";
        this.newProduct.preis = "";
        this.newProduct.fromWG = false;
      }
    },

    /** Popup schließen und neue Produktdaten zurücksetzen */
    closePopup() {
      this.showPopup = false;
      this.resetNewProduct();
    },

    /** Hauptfunktion: Produkt speichern (hinzufügen oder bearbeiten) */
    saveProduct() {
      if (!this.newProduct.name) {
        alert("Bitte den Namen des Produkts ausfüllen.");
        return;
      }

      if (this.isEditing) {
        this.updateListItem();
      } else {
        this.addOrCreateProduct();
      }

      this.closePopup();
    },

    /** 
     * Bearbeitet ein bestehendes Produkt in der Liste 
    */
    async updateListItem() {
      const existingItem = this.products.find(p => p.name === this.newProduct.name);
      if (!existingItem) return;

      const iid = existingItem.id;
      const currentItem = this.listItems.find(i => i.iid === iid);
      const currentAmount = currentItem?.amount || 0;

      const newAmount = parseFloat(this.newProduct.menge) || 1;
      // wenn neue Menge größer als aktuell, hinzufügen
      // wenn neue Menge kleiner als aktuell, entfernen
      try {
        if (newAmount > currentAmount) {
          await this.addToList(iid, newAmount - currentAmount);
        } else if (newAmount < currentAmount) {
          await this.removeFromList({ iid, amount: currentAmount - newAmount });
        }

        await this.loadList();
        await this.loadWGItems();
      } catch (err) {
        console.error("Cannot update item", err);
        alert("Fehler beim Aktualisieren der Liste");
      }

      this.isEditing = false;
    },


    /** Prüft, ob Produkt existiert; sonst neu erstellen und zur Liste hinzufügen */
    addOrCreateProduct() {
      const existingItem = this.products.find(
        (p) => p.name === this.newProduct.name,
      );

      //wenn Produkt neuer Preis im Vergleich mit dem in WG gespeichert hat, dann aktualisieren
      const price = parseFloat(this.newProduct.preis) || 0;


      if (existingItem) {
        this.addToList(existingItem.id);
      } else {
        this.createProductInWG();
      }
    },

    /** Erstellt ein neues Produkt in der WG */
    createProductInWG() {
      const payload = {
        name: this.newProduct.name,
        description: this.newProduct.kategorie || "",
        price: parseFloat(this.newProduct.preis) || 0,
      };
      const menge = parseFloat(this.newProduct.menge) || 1;

      fetch(`${this.baseUrl}/wg/${this.wgID}/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
        .then((res) => res.json())
        .then((newItem) => {
          this.products.push({
            id: newItem.id,
            name: newItem.name,
            kategorie: newItem.description,
            preis: newItem.price,
          });
          this.addToList(newItem.id, menge);
        })
        .catch((err) => {
          console.error("Item konnte nicht erstellt werden", err);
          alert("Fehler beim Hinzufügen des Artikels zur WG");
        });
    },

    /** Fügt ein Produkt zur Einkaufsliste hinzu */
    addToList(iid, amount = null, deltaPrice = 0) {
      const amt = amount !== null ? amount : parseFloat(this.newProduct.menge) || 1;
      const price = parseFloat(this.newProduct.preis) || 0;

      const payload = {
        iid,
        type: "add",
        amount: amt,
        price: price, 
      };

      return fetch(`${this.baseUrl}/wg/${this.wgID}/list/${this.listID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
        .then((res) => res.json())
        .then((updatedList) => {
          this.listItems = this.parseListItems(updatedList).map((item) => ({
            ...item,
            preis: item.iid === iid ? price : item.preis, 
          }));
          this.loadList();
          this.loadWGItems();
        })
        .catch((err) => {
          console.error("Item konnte nicht hinzugefügt werden", err);
          alert("Fehler beim Hinzufügen zur Liste");
        });
    },

    /** Setzt neue Produkt-Daten zurück */
    resetNewProduct() {
      this.newProduct = { name: "", kategorie: "", menge: "", einheit: "" };
    },

    /********** Item als gekauft markieren **********/
    toggleTick(item) {
      const payload = {
        iid: item.iid,
        type: "tick",
        amount: item.amount,
        price: item.price || 0,
      };
      fetch(`${this.baseUrl}/wg/${this.wgID}/list/${this.listID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
        .then((res) => res.json())
        .then((updatedList) => {
          this.listItems = this.parseListItems(updatedList);
          this.loadList();
          this.loadWGItems();
        })
        .catch((err) =>
          console.error("Item konnte nicht abgehakt werden", err),
        );
    },

    /********** Item löschen **********/
    removeFromList(item) {
      const payload = { iid: item.iid, type: "remove", amount: item.amount };
      fetch(`${this.baseUrl}/wg/${this.wgID}/list/${this.listID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
        .then((res) => res.json())
        .then((updatedList) => {
          this.listItems = this.parseListItems(updatedList);
          this.loadList();
          this.loadWGItems();
        })
        .catch((err) =>
          console.error("Item konnte nicht gelöscht werden", err),
        );
    },

    /********** Liste löschen (noch nicht implementiert) **********/
    deleteList(wid, lid) {},

    /** Popup Löschen bestätigen */
    confirmDeleteList() {
      this.showDeleteListPopup = true;
    },

    /** Popup Löschen schließen */
    closeDeleteListPopup() {
      this.showDeleteListPopup = false;
    },

    /** Popup zum Listenname ändern öffnen */
    openChangeListName() {
      this.showChangeListName = true;
    },

    /** Popup zum Listenname ändern schließen */
    closeChangeListName() {
      this.showChangeListName = false;
    },

    /** Ändert den Namen der Einkaufsliste */
    async changeListName() {
      try {
        const response = await fetch(
          `${this.baseUrl}/wg/${this.wgID}/list/${this.listID}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name: this.list_name }),
          },
        );

        if (!response.ok) {
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (e) {}
          console.error("Fehler beim Ändern des Listennamens:", errorData);
          alert(
            "Fehler beim Umbenennen der Liste: " +
              (errorData.message || response.statusText),
          );
          return;
        }

        let text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          console.log("Listename erfolgreich geändert:", data);
        } else {
          console.log(
            "Listename erfolgreich geändert (kein JSON zurückgegeben)",
          );
        }

        this.showChangeListName = false;
        localStorage.setItem("selectedListName", this.list_name);
      } catch (err) {
        console.error("Fehler beim Umbenennen der Liste:", err);
        alert("Fehler beim Umbenennen der Liste: " + err.message);
      }
    },

    /** Navigiert zurück zur Startseite */
    goToStartseite() {
      window.location.href = "../Startseitendesign/startseite.html";
    },
  },
});
<<<<<<< HEAD
=======

>>>>>>> origin/develop
