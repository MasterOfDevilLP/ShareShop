import { API_BASE } from '../config.js';
new Vue({
    el: '#app',
    data: {
      baseUrl: API_BASE,
      wgID: localStorage.getItem("selectedWGID") || '',
      listID: localStorage.getItem("selectedListID") || '',
      products: [], //item in WG
      listItems: [],   //Items in shopping list (Listeeinträge)
      kategorien: ['Obst', 'Gemüse', 'Getränke', 'Fleisch', 'Backwaren', 'Snacks', 'Haushalt', 'Sonstiges'],
      newProduct: {
        id:'',
        name: '',
        kategorie: '',
        menge: '',
        einheit: '',
        preis:'',
        fromWG: false
      },
    list_name: 'Meine Einkaufsliste',
    showPopup:false,
    showDeleteListPopup:false,
    showChangeListName: false,
    isEditing: false
    },
    
 mounted() {
    if (this.wgID && this.listID) {
      this.initData();
    } else {
      console.warn("WG or list not selected. Please select from Startseite first.");
    }
  },

  methods: {
    async initData() {
      try {
        await this.loadWGItems();
        await this.loadList();
      } catch (err) {
        console.error('Initialization failed', err);
      }
    },

    // Handle adding a new product to the list
    // Load items from WG: when entering product name, if it exists in WG, show the corresponding product to choose
    loadWGItems() {
        fetch(`${this.baseUrl}/wg/${this.wgID}/item`, {
            credentials: 'include'
        })
        .then(res => {
            if (!res.ok) {
              console.error('Fetch failed:', res.status, res.statusText);
              return [];
            }
            return res.json();
          })
        .then(data => {
          this.products = data.map(item => ({
            id: item.iid,
            name: item.name,
            description: item.description,
            price: item.price
          }));
          console.log('Loaded products:', this.products);
        });
      },
    
    // After selecting a item from WG, automatically fill other fields
    onProductNameInput() {
      const matched = this.products.find(p => p.name === this.newProduct.name);
      if (matched) {
        // in WG → fill id, kategorie, price from matched item
        this.newProduct.id = matched.id;
        this.newProduct.kategorie = matched.description;
        this.newProduct.preis = matched.price;
        this.newProduct.fromWG = true; 
      } else {
        // not in WG → reset id, allow editing kategorie/price
        this.newProduct.id = '';
        this.newProduct.kategorie = '';
        this.newProduct.preis = '';
        this.newProduct.fromWG = false; 
      }
    },

      // reusable function to parse list items (for loading items, toggling tick item from list, deleting item from list) 
      parseListItems(data) {
        if (!data.items || !Array.isArray(data.items)) {
        console.warn('No shopping list items received', data);
        return [];
      }
      return data.items.map(entry => ({
        iid: entry.item.iid,
        name: entry.item.name,
        kategorie: entry.item.description || '',
        preis: entry.item.price || 0,
        amount: entry.amount || 0,
        ticked: entry.item.ticked || false,
        datum: entry.item.datum || ''
      }));
    },

    // Load items from shopping list
    loadList() {
    fetch(`${this.baseUrl}/wg/${this.wgID}/list/${this.listID}`, {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (!data.items || !Array.isArray(data.items)) {
          console.warn('No shopping list items received', data);
          this.listItems = [];
          return;
        }
        this.listItems = this.parseListItems(data);
        console.log('Loaded shopping list:', this.listItems);
      })
      .catch(err => console.error('Cannot load shopping list', err));
    },

    // Return suitable icon for product category when displaying product in list
    getIcon(kategorie) {
      const icons = {
        Obst: 'Icons/obst.png',
        Gemüse: 'Icons/gemuese.png',
        Getränke: 'Icons/getraenke.png',
        Fleisch: 'Icons/fleisch.png',
        Backwaren: 'Icons/backwaren.png',
        Haushalt: 'Icons/haushalt.png',     
        Snacks: 'Icons/snacks.png',         
        Sonstiges: 'Icons/default.png'   
      };
      return icons[kategorie] || 'Icons/default.png'; 
    },

    // Open popup to add item to list
    add_product() {
    this.showPopup = true;
    },

    // Close popup to add/edit item from list
    closePopup() {
      this.showPopup = false;
      this.resetNewProduct();
    },
    resetNewProduct() {
          this.newProduct = { name: '', kategorie: '', menge: '', einheit: '' };
    },

    // Handle save button in Popup: neue Product hinfugen oder Product anpassen
    saveProduct() {
      if (!this.newProduct.name) {
        alert('Bitte den Name der Produkte ausfüllen.');
        return;
      }

      if (this.isEditing) {
        // update  listItems directly
        const index = this.listItems.findIndex(p => p.iid === this.newProduct.iid);
        if (index !== -1) {
          this.listItems[index] = { ...this.listItems[index], ...this.newProduct, amount: this.newProduct.menge };
        }
        this.isEditing = false;
        this.closePopup();
        return;
      }

      const self = this;

      // Check if item already exists in WG (for adding new item to WG)
      let existingItem = this.products.find(p => p.name === this.newProduct.name);

      const addToList = (iid) => {
        // Send request to add to shopping list
        const payload = {
          iid: iid,        // ID of item in WG
          type: "add",     // action: add
          amount: parseFloat(this.newProduct.menge) || 1  
        };
        fetch(`${self.baseUrl}/wg/${self.wgID}/list/${self.listID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        })
        .then(res => res.json())
        .then(updatedList => {
          console.log('Updated list:', updatedList);
          this.listItems = this.parseListItems(updatedList).map(item => ({
            ...item,
            einheit: this.newProduct.einheit || item.einheit || 'Stück' 
          }));
          this.loadList();
          this.loadWGItems()
        })
        .catch(err => {
          console.error('Cannot add to list', err);
          alert('Fehler beim Hinzufügen zur Liste');
        });
      };

      if (existingItem) {
        // Item already exists in WG → use existing id
        addToList(existingItem.id);
      } else {
        // Item not exists in WG → create new item in WG first
        const payload = {
          name: this.newProduct.name,
          description: this.newProduct.kategorie || "",
          price: parseFloat(this.newProduct.preis) || 0
        };
        fetch(`${this.baseUrl}/wg/${this.wgID}/item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        })
        .then(res => res.json())
        .then(newItem => {
          // Add new item to products (products ist aray which including item from WG in frontend)
          self.products.push({
            id: newItem.id,
            name: newItem.name,
            kategorie: newItem.description,
            preis: newItem.price
          });

          // Use the newly created id to add to list
          addToList(newItem.id);
        })
        .catch(err => {
          console.error('Cannot add item', err);
          alert('Fehler beim Hinzufügen des Artikels zur WG');
        });
      }

      // Reset popup
      this.closePopup();
    },
    
    //tick the item in the list
    toggleTick(item) {
      const payload = { iid: item.iid, type: 'tick', amount: item.amount, price: item.price || 0 };
      fetch(`${this.baseUrl}/wg/${this.wgID}/list/${this.listID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })
      .then(res => res.json())
      .then(updatedList => {
        this.listItems = this.parseListItems(updatedList);
        this.loadList();
        this.loadWGItems()
      })
      .catch(err => console.error('Cannot tick item', err));
    },

    //delete item from the list
    removeFromList(item) {
      const payload = { iid: item.iid, type: 'remove', amount: item.amount };
      fetch(`${this.baseUrl}/wg/${this.wgID}/list/${this.listID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })
      .then(res => res.json())
      .then(updatedList => {
        this.listItems = this.parseListItems(updatedList);
        this.loadList();
        this.loadWGItems()
      })
      .catch(err => console.error('Cannot remove item', err));
    },
    
      openChangeProduct(item){ 
        this.newProduct = { ...item, menge: item.amount,}; //copy choosen item into newProduct
        this.showPopup = true;
        this.isEditing = true;  
      },

      confirmDeleteList(){
        this.showDeleteListPopup = true;
      },

      closeDeleteListPopup(){
        this.showDeleteListPopup = false;
      },

      deleteList(wid, lid){
        fetch(`/wgs/${wid}/lists/${lid}`, { method: "DELETE" })
         .then(res => {
          if (res.status === 204) {
            setLists(prev => prev.filter(list => list.id !== lid));
          } else {
            console.error("Fehler beim Löschen:", res.status);
          }
        });
        window.location.href = '../Startseitendesign/startseite.html';
      },

      openChangeListName(){
        this.showChangeListName=true;
      },

      closeChangeListName(){
        this.showChangeListName=false;
      },

      changeListName(){
        this.showChangeListName=false;
      },

      goToStartseite(){
        window.location.href = '../Startseitendesign/startseite.html';
      }
  }
});


// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').then(registration => {
//       console.log('ServiceWorker registriert:', registration);
//     }).catch(error => {
//       console.log('ServiceWorker Registrierung fehlgeschlagen:', error);
//     });
//   });
// }
