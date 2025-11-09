import { API_BASE } from '../config.js';
new Vue({
    el: "#setting",
    data: {
        wgList: JSON.parse(localStorage.getItem("wgList")) || [
        { id: 1, name: "WG Sonnenstraße" },
        { id: 2, name: "WG Blumenweg" },
        { id: 3, name: "WG Fuchsbau" },
        { id: 4, name: "WG Mondhain" },
        ],
        selectedWG: localStorage.getItem("selectedWGID") || null,
        selectedWGName:
        localStorage.getItem("selectedWGName") || "WG auswählen",
        newGroupName: "",
        wgUsers: []
    },
    methods: {
        //get Users of selected WG
        async fetchWGUsers() {
        try {
            const wid = this.selectedWG; 
            const response = await fetch(`${API_BASE}/wg/${wid}/user`);  
            if (!response.ok) throw new Error("Konnte Users nicht laden");

            const users = await response.json();
            console.log("Users:", users);
            this.wgUsers = users; 
        } catch (error) {
            console.error(error);
            alert("Fehler beim Laden der Users");
        }
        },

        selectWG(id) {
        document.getElementById("dropdown-toggle").checked = false;

        if (id === "__create__") {
            const name = prompt("Name der neuen WG:");
            if (!name) return;

            const newId = this.wgList.length + 1;
            const newWG = { id: newId, name };
            this.wgList.push(newWG);
            this.setWG(newWG);
            return;
        }
        
        const wg = this.wgList.find((w) => w.id === id);
        if (wg) {
            this.setWG(wg);
        }
        },
        setWG(wg) {
        this.selectedWG = wg.id;
        this.selectedWGName = wg.name;
        },
        deleteWG() {
        if (!this.selectedWG) {
            alert("Keine WG ausgewählt.");
            return;
        }

        const wg = this.wgList.find((w) => w.id == this.selectedWG);
        if (!wg) {
            alert("WG nicht gefunden.");
            return;
        }

        if (confirm(`Möchtest du "${wg.name}" wirklich löschen?`)) {
            // Entferne die WG aus der Liste
            this.wgList = this.wgList.filter((w) => w.id != this.selectedWG);

            // Aktualisiere localStorage
            localStorage.setItem("wgList", JSON.stringify(this.wgList));
            localStorage.removeItem("selectedWGID");
            localStorage.removeItem("selectedWGName");

            // Zurücksetzen in der UI
            this.selectedWG = null;
            this.selectedWGName = "WG auswählen";

            alert("WG gelöscht.");

            // Optional: Seite neu laden, um Liste zu aktualisieren
            // window.location.reload();
        }
        },
        //Logik löschen WG
        /*
        async deleteWG() {
        if (!this.selectedWG) {
            alert("Keine WG ausgewählt.");
            return;
        }

        const confirmed = confirm("Möchtest du diese WG wirklich löschen?");
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/wg/${this.selectedWG}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
            }

            alert("WG erfolgreich gelöscht.");

            // Optional: Auch im UI entfernen
            this.wgList = this.wgList.filter((w) => w.id != this.selectedWG);
            this.selectedWG = null;
            this.selectedWGName = "WG auswählen";

            // Weiterleitung
            location.href = "startseite.html";
        } catch (error) {
            console.error(error);
            alert("Fehler beim Löschen: " + error.message);
        }
        },*/
    },
    });
