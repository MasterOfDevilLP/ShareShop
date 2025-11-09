// Composition API script for the Vue application
const { createApp, ref, computed, toRaw } = Vue;

const App = {
    // Component setup function (Composition API)
    setup() {
        // --- State/Data (Reactive References) ---
        
        // Modal state
        const isModalOpen = ref(false);
        const selectedTransaction = ref(null);

        // Core transaction data
        const transactions = ref([
            { id: 1, store: 'REWE', date: '21/04/2025', total: 9.21, paidBy: 'Mir', participants: ['Mir', 'Woman'], myShare: 4.61, myStatus: 'verlangen',
              splits: [{ person: 'Mir', amount: 9.21, isPayer: true, isMe: true }, { person: 'Woman', amount: 4.61, isPayer: false, isMe: false }] },
            { id: 2, store: 'dm', date: '30/04/2025', total: 14.19, paidBy: 'Woman', participants: ['Woman', 'Mir'], myShare: 7.10, myStatus: 'bezahlen',
              splits: [{ person: 'Woman', amount: 14.19, isPayer: true, isMe: false }, { person: 'Mir', amount: 7.10, isPayer: false, isMe: true }] },
            { id: 3, store: 'REWE', date: '21/04/2025', total: 10.07, paidBy: 'Mir', participants: ['Mir', 'Woman'], myShare: 5.04, myStatus: 'verlangen',
              splits: [{ person: 'Mir', amount: 10.07, isPayer: true, isMe: true }, { person: 'Woman', amount: 5.04, isPayer: false, isMe: false }] },
            { id: 4, store: 'Woman', date: '15/04/2025', total: 75, paidBy: 'Woman', participants: ['Woman', 'Mir'], myShare: 37.5, myStatus: 'verrechnen',
              splits: [{ person: 'Woman', amount: 75, isPayer: true, isMe: false }, { person: 'Mir', amount: 37.5, isPayer: false, isMe: true }] },
            { id: 5, store: 'Bob', date: '10/04/2025', total: 12, paidBy: 'Bob', participants: ['Bob', 'Mir'], myShare: 6, myStatus: 'verlangen',
              splits: [{ person: 'Bob', amount: 12, isPayer: true, isMe: false }, { person: 'Mir', amount: 6, isPayer: false, isMe: true }] },
            { id: 6, store: 'Value', date: '05/04/2025', total: 12, paidBy: 'Mir', participants: ['Mir', 'A'], myShare: 6, myStatus: 'fertig',
              splits: [{ person: 'Mir', amount: 12, isPayer: true, isMe: true }, { person: 'A', amount: 6, isPayer: false, isMe: false }] }
        ]);

        // --- Utility Functions/Computed Properties ---
    
        // Helper function (now a method)
        const getStatusLabel = (status) => {
            const labels = { verrechnen: 'Verrechnen', verlangen: 'Verlangen', bezahlen: 'Bezahlen', fertig: 'Fertig' };
            return labels[status] || status;
        };
        
        // Helper function (now a method)
        const getTransactionAmount = (t) => {
            if (t.myStatus === 'verlangen') return t.myShare;
            if (t.myStatus === 'bezahlen') return -t.myShare;
            return 0;
        };

        // Computed property for the total owed (Du schuldest)
        const owedAmount = computed(() => {
            return transactions.value
                .filter(t => t.myStatus === 'verlangen')
                .reduce((sum, t) => sum + t.myShare, 0)
                .toFixed(2).replace('.', ','); // Formatting for German locale
        });

        // Computed property for the total owing (Schulde dir)
        const owingAmount = computed(() => {
            return transactions.value
                .filter(t => t.myStatus === 'bezahlen')
                .reduce((sum, t) => sum + t.myShare, 0)
                .toFixed(2).replace('.', ','); // Formatting for German locale
        });

        const goToStartseite = () => {
            window.location.href = '../Startseitendesign/startseite.html';
        };

        // --- Methods/Actions ---
        const openModal = (transaction) => {
            // Vue automatically unwraps the ref when used in the template, 
            // but here we assign the raw object or a copy for safety
            selectedTransaction.value = toRaw(transaction);
            isModalOpen.value = true;
        };

        const closeModal = () => {
            isModalOpen.value = false;
            selectedTransaction.value = null;
        };
        
        // Return everything needed in the template
        return {
            transactions,
            isModalOpen,
            selectedTransaction,
            owedAmount,
            owingAmount,
            getStatusLabel,
            getTransactionAmount,
            openModal,
            closeModal,
            goToStartseite
        };
    },
    
    // --- Vue Template  ---
    template: `
        <div class="header">
            <h1>Rechnungen</h1>
        </div>

        <div class="balance-cards">
            <div class="balance-card owed">
                <div class="balance-amount">€{{ owedAmount }}</div>
                <div class="balance-label">Du schuldest</div>
            </div>
            <div class="balance-card owing">
                <div class="balance-amount">€{{ owingAmount }}</div>
                <div class="balance-label">Schulde dir</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Offene Rechnungen:</div>
            
            <div class="transaction-list">
                <div 
                    v-for="transaction in transactions" 
                    :key="transaction.id"
                    class="transaction-item"
                    @click="openModal(transaction)" 
                >
                    <div class="transaction-left">
                        <div class="transaction-icon">🛒</div>
                        <div class="transaction-info">
                            <div class="transaction-name">{{ transaction.store }}</div>
                            <div class="transaction-date">{{ transaction.date }}</div>
                            <div class="transaction-participants" :title="transaction.participants.join(', ')">
                                {{ transaction.participants.join(', ') }}
                            </div>
                        </div>
                    </div>
                    <div class="transaction-right">
                        <div 
                            class="transaction-amount" 
                            :class="{ 'positive': getTransactionAmount(transaction) > 0, 'negative': getTransactionAmount(transaction) < 0 }"
                        >
                            {{ getTransactionAmount(transaction) > 0 ? '+' : '' }}{{ getTransactionAmount(transaction).toFixed(2) }} €
                        </div>
                        <div :class="['transaction-status', 'status-' + transaction.myStatus]">
                            {{ getStatusLabel(transaction.myStatus) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal" :class="{ 'active': isModalOpen }" @click.self="closeModal" v-if="selectedTransaction">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">Details</div>
                    <button class="close-btn" @click="closeModal">&times;</button>
                </div>
                <div class="modal-body">
                    
                    <div class="detail-section">
                        <div class="detail-header">
                            <div class="detail-store">{{ selectedTransaction.store }}</div>
                            <div class="detail-total">{{ selectedTransaction.total.toFixed(2) }} €</div>
                        </div>
                        <div class="detail-date">{{ selectedTransaction.date }}</div>
                        <div class="shared-with">
                            <span class="shared-label">Geteilt mit</span>
                            <div class="avatar-group">
                                <div class="avatar" v-for="p in selectedTransaction.participants" :key="p">
                                    {{ p.charAt(0) }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <div class="section-title">Aufteilung:</div>
                        <div class="split-list">
                            <div 
                                v-for="split in selectedTransaction.splits" 
                                :key="split.person"
                                class="split-item" 
                                :class="{ 'highlight': split.isMe }"
                            >
                                <div class="split-person">
                                    <div class="split-avatar">{{ split.person.charAt(0) }}</div>
                                    <div>
                                        <div class="split-name">{{ split.person }}{{ split.isMe ? ' (Du)' : '' }}</div>
                                        <div class="split-label">{{ split.isPayer ? 'Hat bezahlt' : 'Muss beitragen' }}</div>
                                    </div>
                                </div>
                                <div class="split-amount">{{ split.amount.toFixed(2) }} €</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="action-buttons" v-if="selectedTransaction.myStatus !== 'fertig'">
                        <button 
                            class="btn btn-primary" 
                            v-if="selectedTransaction.myStatus === 'verrechnen' || selectedTransaction.myStatus === 'verlangen'"
                            @click="() => console.log('Action for', selectedTransaction.myStatus)"
                        >
                            {{ getStatusLabel(selectedTransaction.myStatus) }}
                        </button>
                        <button 
                            class="btn btn-secondary" 
                            v-else-if="selectedTransaction.myStatus === 'bezahlen'"
                            @click="() => console.log('Action for', selectedTransaction.myStatus)"
                        >
                            Bezahlen
                        </button>
                    </div>

                </div>
            </div>
        </div>

     <nav class="bottom-nav">
            <button class="nav-item" @click="goToStartseite">
                <img src="icons/Liste.png" alt="Liste" class="nav-icon" />
                Liste
            </button>
            <button class="nav-item active">
                <img src="icons/Rechnung.png" alt="Rechnungen" class="nav-icon" />
                Rechnungen
            </button>
            <button class="nav-item">
                <img src="icons/Kalender.png" alt="Kalender" class="nav-icon" />
                Kalender
            </button>
            <button class="nav-item">
                <img src="icons/Rezepte.png" alt="Rezepte" class="nav-icon" />
                Rezepte
            </button>
            <button class="nav-item">
                <img src="icons/Profil.png" alt="Profil" class="nav-icon" />
                Profil
            </button>
        </nav>
    `
};

// Mount the app to the DOM
createApp(App).mount('#app');