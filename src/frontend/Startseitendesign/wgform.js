new Vue({
  el: '#wgform', //  wichtig: eigenes Element, nicht #app
  data() {
    return {
      showCreateGroupModal: true,
      newGroup: {
        name: '',
        description: '',
        image: null,
        preview: ''
      },
      saveSuccess: false,
      saveError: ''
    };
  },
  methods: {
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.newGroup.image = file;
        this.newGroup.preview = URL.createObjectURL(file);
      }
    },
    async saveGroup() {
      if (!this.newGroup.name || !this.newGroup.description) {
        this.saveError = 'Bitte alle Pflichtfelder ausfüllen.';
        return;
      }

      const formData = new FormData();
      formData.append('name', this.newGroup.name);
      formData.append('beschreibung', this.newGroup.description);
      if (this.newGroup.image) formData.append('image', this.newGroup.image);

      try {
        const response = await fetch('http://localhost:8001/api/wg/create', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        if (response.ok) {
          this.saveSuccess = true;
          this.saveError = '';
          console.log('WG erstellt:', result);
        } else {
          this.saveError = result.message || 'Fehler beim Speichern.';
        }
      } catch (err) {
        this.saveError = 'Serverfehler oder Netzwerkproblem.';
        console.error(err);
      }
    }
  }
});
