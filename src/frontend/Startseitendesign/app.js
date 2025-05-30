new Vue({
    el: '#app',
    data: {
      lists: [
      { id: "1", name: "Wocheneinkauf"},
      ],
    
    newList: {
      name: ''
    },
  
    showPopup:false
    },

    
    methods: {
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
          id: Date.now().toString(),
          name: this.newList.name
        });

        this.closePopup();
      },
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
