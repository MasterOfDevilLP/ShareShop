new Vue({
    el: '#app',
    data: {
     products: [
      { id: "1", kategorie: "Obst", name: "Äpfel", preis: "4.00", datum: "12/2/2025", menge: "200", einheit: "gramm" },
      { id: "2", kategorie: "Gemüse", name: "Tomaten", preis: "3.13", datum: "12/2/2025", menge: "3", einheit: "stücke" },
      { id: "3", kategorie: "Getränke", name: "Orangensaft", preis: "2.29", datum: "12/2/2025", menge: "1", einheit: "liter" },
      { id: "4", kategorie: "Fleisch", name: "Hähnchenbrust", preis: "11.00", datum: "12/2/2025", menge: "500", einheit: "gramm" },
      { id: "5", kategorie: "Backwaren", name: "Brot", preis: "", datum: "12/2/2025", menge: "1", einheit: "stück" }
      ],
    
    newProduct: {
      id:'',
      name: '',
      kategorie: '',
      menge: '',
      einheit:'',
      preis:''
    },
  
    list_name: 'Wocheneinkauf',
    showPopup:false,
    showDeleteListPopup:false,
    showChangeListName: false,
    showChangeProduct: false
    },

    
    methods: {
      getIcon(kategorie) {
        const icons = {
          Obst: 'Icons/obst.png',
          Gemüse: 'Icons/gemuese.png',
          Getränke: 'Icons/getraenke.png',
          Fleisch: 'Icons/fleisch.png',
          Backwaren: 'Icons/brot.png'
        };
      return icons[kategorie] || 'Icons/default.png';
      },

      add_product() {
      this.showPopup = true;
      },

      closePopup() {
        this.showPopup = false;
        this.resetNewProduct();
      },
      resetNewProduct() {
            this.newProduct = { name: '', kategorie: '', menge: '', einheit: '' };
      },

      saveProduct() {
        if(!this.newProduct.name) 
          {
          alert('Bitte den Name der Produkte ausfüllen.');
          return;
          }
        this.products.push({
          id: Date.now().toString(),
          name: this.newProduct.name,
          kategorie: this.newProduct.kategorie,
          datum: new Date().toLocaleDateString(),
          menge: this.newProduct.menge,
          einheit: this.newProduct.einheit,
          preis:this.newProduct.preis
        });
        this.closePopup();
      },

      deleteProduct(id){
        this.products = this.products.filter(product => product.id !== id);
      },

      openChangeProduct(product){
        this.newProduct = { ...product };
        this.showChangeProduct=true;
      },

      changeProduct() {
        const index = this.products.findIndex(p => p.id === this.newProduct.id);
        if (index !== -1) {
        this.products[index] = { ...this.newProduct };
        }
        this.showChangeProduct = false;
      },

      closeChangeProduct(){
        this.showChangeProduct=false;
      },

      confirmDeleteList(){
        this.showDeleteListPopup = true;
      },

      closeDeleteListPopup(){
        this.showDeleteListPopup = false;
      },

      deleteList(){
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


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registriert:', registration);
    }).catch(error => {
      console.log('ServiceWorker Registrierung fehlgeschlagen:', error);
    });
  });
}

