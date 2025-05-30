// ✅ Service Worker Registrierung
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('ServiceWorker registriert:', registration))
      .catch(error => console.log('ServiceWorker Registrierung fehlgeschlagen:', error));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Elemente abrufen
  const addButton = document.querySelector('.add-list');
  const bottomSheet = document.getElementById('bottomSheet');
  const closeSheetBtn = document.getElementById('closeSheet');
  const listNameInput = document.getElementById('listNameInput');
  const createListBtn = document.getElementById('createListBtn');

  const form = document.getElementById('neueListeFormular');
  const newListInput = document.getElementById('neueListeInput');
  const newListBtn = document.getElementById('listeErstellenBtn');
  const listeContainer = document.querySelector('.shopping-list');

  const iframeOverlay = document.getElementById('listOverlay');

  // Bottom Sheet öffnen
  if (bottomSheet && addButton && listNameInput) {
    addButton.addEventListener('click', () => {
      bottomSheet.classList.remove('hidden');
      setTimeout(() => bottomSheet.classList.add('visible'), 10);
    });

    closeSheetBtn?.addEventListener('click', () => {
      bottomSheet.classList.remove('visible');
      setTimeout(() => bottomSheet.classList.add('hidden'), 300);
    });

    listNameInput.addEventListener('input', () => {
      createListBtn.disabled = listNameInput.value.trim() === '';
    });

    createListBtn?.addEventListener('click', () => {
      alert('Liste erstellt: ' + listNameInput.value);
    });
  }

  // 🟩 Neue Liste zur Seite hinzufügen
 createListBtn.addEventListener('click', () => {
  const name = listNameInput.value.trim();
  if (name !== '') {
    const neueKachel = document.createElement('div');
    neueKachel.className = 'list-card';
    neueKachel.innerHTML = `
      <div class="list-left">
        <img src="icons/Wagen.png" alt="Cart Icon" class="nav-icon" />
        ${name}
      </div>
      <div class="list-arrow">
        <img src="icons/arrow_right.svg" alt="Arrow" class="list-arrow" />
      </div>
    `;
    document.querySelector('.shopping-list').appendChild(neueKachel);
    listNameInput.value = '';
    bottomSheet.classList.remove('visible');
    setTimeout(() => bottomSheet.classList.add('hidden'), 300);
  }
});

});
