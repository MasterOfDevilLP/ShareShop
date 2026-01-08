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

    /** @type {boolean} Preis-Modal fur Einkaufsmodus sichtbar */
    showPriceModal: false,
    modalProduct: null,
    modalTickOnSave: false, //Flag, ob beim Speichern getickt werden soll

    /** @type {boolean} Modal für Meldungen für erfolfreiche abgehackte/geloschte Items */
    showMiniModal: false,
    miniModalMessage: "",

    showDropdownForProductFromWG: false,
    filteredProducts: [],

    localTicks: {},
  },

  watch: {
    localTicks: {
      handler(val) {
        localStorage.setItem("localTicks", JSON.stringify(val));
      },
      deep: true,
    },
  },

  computed: {
    /** @type {number} Gesamtsumme der getickten Produkte */
    totalTickedPrice() {
      const tickedItems = this.listItems.filter((item) => this.isTicked(item));
      return tickedItems.reduce(
        (sum, item) => sum + (parseFloat(item.preis) || 0),
        0,
      );
    },
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

    /** Vorhandene lokale Ticks laden */
    const savedTicks = localStorage.getItem("localTicks");
    if (savedTicks) this.localTicks = JSON.parse(savedTicks);

    /** Seite verlassen → localTicks zurücksetzen */
    window.addEventListener("beforeunload", () => {
      this.resetLocalTicks();
    });
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
          console.log("Produkte ist erfolgreich geladen");
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
          console.log("Einkaufsliste ist efolreich geladen");
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
        Obst: "icons/obst.png",
        Gemüse: "icons/gemuese.png",
        Getränke: "icons/getraenke.png",
        Fleisch: "icons/fleisch.png",
        Backwaren: "icons/backwaren.png",
        Haushalt: "icons/haushalt.png",
        Snacks: "icons/snacks.png",
        Sonstiges: "icons/default.png",
      };
      return icons[kategorie] || "icons/default.png";
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
      if (!this.newProduct.name) {
        this.filteredProducts = [];
        return;
      }
      this.filteredProducts = this.products.filter((p) =>
        p.name.toLowerCase().includes(this.newProduct.name.toLowerCase()),
      );
    },

    selectProduct(product) {
      this.newProduct.name = product.name;
      this.newProduct.id = product.id;
      this.newProduct.kategorie = product.description;
      this.newProduct.preis = product.price;
      this.newProduct.fromWG = true;
      this.showDropdownForProductFromWG = false;
    },

    hideDropdown() {
      setTimeout(() => {
        this.showDropdownForProductFromWG = false;
      }, 100);
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
      const existingItem = this.products.find(
        (p) => p.name === this.newProduct.name,
      );
      if (!existingItem) return;

      const iid = existingItem.id;
      const currentItem = this.listItems.find((i) => i.iid === iid);
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
      const amt =
        amount !== null ? amount : parseFloat(this.newProduct.menge) || 1;
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
    /** Öffnen für Einzelitem (nur Preis ändern) */
    openPriceModal(product) {
      this.modalProduct = { ...product };
      this.modalTickOnSave = false; // nur Preis, kein Tick
      this.showPriceModal = true;
    },

    closePriceModal() {
      this.modalProduct = null;
      this.showPriceModal = false;
      this.modalTickOnSave = false;
    },

    /** Speichert Preis ohne Markierung als gekauft */
    savePriceBeforeTick() {
      if (!this.modalProduct) return;
      const item = this.listItems.find((i) => i.iid === this.modalProduct.iid);
      if (item) {
        item.preis = parseFloat(this.modalProduct.preis) || 0;
      }
      this.closePriceModal();
    },

    /** Öffnen für "Einkaufen fertig" (Preis + Tick)*/
    openPriceModalForFertig() {
      this.modalProduct = {
        preis: this.listItems
          .filter((item) => this.isTicked(item))
          .reduce((sum, item) => sum + (parseFloat(item.preis) || 0), 0),
      };
      this.modalTickOnSave = true; // Tick wird gesetzt
      this.showPriceModal = true;
    },

    showMiniModalMsg(msg, duration = 500) {
      this.miniModalMessage = msg;
      this.showMiniModal = true;
      console.log("Showing mini modal:", msg);

      setTimeout(() => {
        const el = document.querySelector(".mini-modal");
        if (el) el.classList.add("fade-out");
      }, 100);

      setTimeout(() => {
        this.showMiniModal = false;
        this.miniModalMessage = "";
      }, duration + 100);
    },

    /** Toggle nur lokal, nicht direkt Backend */
    toggleLocalTick(item) {
      if (!item || !item.iid) return;
      // switchen des local tick status
      this.$set(this.localTicks, item.iid, !this.localTicks[item.iid]);
    },

    /** Prüft, ob Item lokal getickt wurde oder bereits auf Backend */
    isTicked(item) {
      return this.localTicks[item.iid] ?? item.ticked;
    },

    savePrice() {
      if (!this.modalProduct) return;

      if (this.modalTickOnSave) {
        this.savePriceAndTick(); // Preis speichern + Items ticken
      } else {
        this.savePriceBeforeTick(); // nur Preis speichern
      }

      this.closePriceModal();
    },

    /** Speichert Preis und markiert alle lokal getickten Items als gekauft */
    savePriceAndTick() {
      if (!this.modalProduct) return;

      // Preis setzen für alle lokal getickten Items
      const tickedItems = this.listItems.filter((item) => this.isTicked(item));

      tickedItems.forEach((item) => {
        item.preis = parseFloat(this.modalProduct.preis) || item.preis;
      });

      // alle getickten Items im Backend markieren
      this.finalizeTicks();

      this.showMiniModalMsg("Alle Produkte als gekauft markiert", 500);
    },

    /** Alle lokal getickten Items wirklich auf Backend setzen */
    async finalizeTicks() {
      const tickedItems = Object.entries(this.localTicks)
        .filter(([iid, ticked]) => ticked)
        .map(([iid]) => iid);

      for (const iid of tickedItems) {
        const item = this.listItems.find((i) => i.iid === iid);
        if (item) {
          await this.toggleTick(item); // ruft dein Backend auf
        }
      }

      // localStorage leeren
      this.localTicks = {};
      localStorage.removeItem("localTicks");
    },

    /** Seite verlassen ohne Speichern → localStorage löschen */
    resetLocalTicks() {
      this.localTicks = {};
      localStorage.removeItem("localTicks");
    },

    /** Markiert ein Item als gekauft (Tick) im Backend */
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
          this.showMiniModalMsg("Artikel als gekauft markiert", 300);
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
          this.showMiniModalMsg("Item gelöscht", 300);
        })
        .catch((err) =>
          console.error("Item konnte nicht gelöscht werden", err),
        );
    },

    /********** Liste löschen **********/
    deleteList() {
      fetch(`${this.baseUrl}/wg/${this.wgID}/list/${this.listID}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (res.status === 401) {
            this.showMiniModalMsg(
              "Du hast keine Berechtigung, diese Liste zu löschen",
              2000,
            );
            throw new Error("401");
          }
          if (!res.ok) {
            throw new Error(res.status);
          }
          return;
        })
        .then(() => {
          console.log("Liste gelöscht");
          this.goToStartseite();
        })
        .catch((err) => console.error("Fehler beim Löschen der Liste:", err));
    },

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
