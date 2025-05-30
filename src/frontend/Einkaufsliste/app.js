new Vue({
    el: '#app',
    data: {
     products: [
      { id: "1", kategorie: "Obst", name: "Äpfel", preis: "", datum: "12/2/2025", menge: "200", einheit: "gramm" },
      { id: "2", kategorie: "Gemüse", name: "Tomaten", preis: "", datum: "12/2/2025", menge: "3", einheit: "stücke" },
      { id: "3", kategorie: "Getränke", name: "Orangensaft", preis: "", datum: "12/2/2025", menge: "1", einheit: "liter" },
      { id: "4", kategorie: "Fleisch", name: "Hähnchenbrust", preis: "", datum: "12/2/2025", menge: "500", einheit: "gramm" },
      { id: "5", kategorie: "Backwaren", name: "Brot", preis: "", datum: "12/2/2025", menge: "1", einheit: "stück" }
      ],
    
    newProduct: {
      name: '',
      kategorie: '',
      menge: '',
      einheit:''
    },
  
    list_name: 'Wocheneinkauf',
    showPopup:false
    },

    
    methods: {
      zuruck_startseite(){
         window.location.href = '../Startseitendesign/startseite.html';
      },

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
        if(!this.newProduct.name || !this.newProduct.kategorie || !this.newProduct.menge || !this.newProduct.einheit) 
          {
          alert('Bitte alle Felder ausfüllen.');
          return;
          }

        this.products.push({
          id: Date.now().toString(),
          name: this.newProduct.name,
          kategorie: this.newProduct.kategorie,
          datum: new Date().toLocaleDateString(),
          menge: this.newProduct.menge,
          einheit: this.newProduct.einheit,
          preis: null
        });

        this.closePopup();
      },

      deleteProduct(id){
        this.products = this.products.filter(product => product.id !== id);
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

