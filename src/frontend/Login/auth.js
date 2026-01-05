/**
 * @file auth.js
 * @description
 * Enthält die komplette Authentifizierungslogik (Login & Registrierung)
 * für die ShareShop Web-App.
 *
 * Die Benutzeroberfläche wird komponentenbasiert mit Vue 3 umgesetzt.
 * UI-Templates sind direkt in den JavaScript-Komponenten definiert
 * und werden dynamisch in den HTML-Mount-Point (#app) gerendert.
 *
 * @author ShareShop Team
 * @version 1.0
 */

/**
 * Reaktiver globaler Store zur Verwaltung der aktuell
 * ausgewählten Sprache (Internationalisierung).
 *
 * Standard-Sprache: Deutsch ('de')
 *
 * @type {{ language: 'de' | 'en' }}
 */
const LanguageStore = Vue.reactive({
  language: 'de'
});

/**
 * Basis-URL der Backend-API.
 * Wird aus der zentralen Konfigurationsdatei importiert.
 */
import { API_BASE_URL as API_BASE } from '../config.js';

/**
 * Minimale Passwortlänge für die Registrierung.
 * @constant {number}
 */
const MIN_PASSWORD_LENGTH = 6; 

/**
 * Destrukturierte Vue-Funktionen für bessere Lesbarkeit.
 */
const { reactive, createApp } = Vue;

/**
 * Zentrales Übersetzungsobjekt für UI-Texte.
 * Die Texte werden schlüsselbasiert abgerufen.
 *
 * Unterstützte Sprachen:
 * - de (Deutsch)
 * - en (Englisch)
 *
 * Teilweise werden Funktionen verwendet,
 * um dynamische Texte (z. B. Passwortlänge) zu erzeugen.
 *
 * @type {Object.<string, {de: string|Function, en: string|Function}>}
 */
const translations = {
    'LOGIN_TITLE': { de: 'Login', en: 'Sign In' },
    'REGISTER_TITLE': { de: 'Registrieren', en: 'Register' },

    'EMAIL_PLACEHOLDER': { de: 'E-Mail', en: 'Email' },
    'PASSWORD_PLACEHOLDER': { de: 'Passwort', en: 'Password' },
    'REPEAT_PASSWORD_PLACEHOLDER': { de: 'Passwort wiederholen', en: 'Repeat Password' },

    'LOGIN_BUTTON': { de: 'Einloggen', en: 'Log In' },
    'LOGIN_LOADING': { de: 'Logge ein...', en: 'Logging in...' },
    'REGISTER_BUTTON': { de: 'Registrieren', en: 'Register' },
    'REGISTER_LOADING': { de: 'Registriert...', en: 'Registering...' },

    'NO_ACCOUNT_PRE': { de: 'Noch kein Account? ', en: 'No account? ' },
    'NO_ACCOUNT_LINK': { de: 'Jetzt registrieren', en: 'Register here' },
    'ALREADY_REGISTERED_PRE': { de: 'Bereits registriert? ', en: 'Already registered? ' },
    'ALREADY_REGISTERED_LINK': { de: 'Zum Login', en: 'Login here' },

    'ERR_FILL_FIELDS': { de: 'Bitte alle Felder ausfüllen.', en: 'Please fill in all fields.' },
    'ERR_INVALID_EMAIL': { de: 'Ungültiges E-Mail-Format.', en: 'Invalid email format.' },
    'ERR_PASSWORD_LENGTH': { de: (len) => `Das Passwort muss mindestens ${len} Zeichen lang sein.`, en: (len) => `Password must be at least ${len} characters long.` },
    'ERR_PASSWORD_MISMATCH': { de: 'Passwörter stimmen nicht überein.', en: 'Passwords do not match.' },
    'ERR_LOGIN_FAILED': { de: 'Falsche E-Mail oder Passwort.', en: 'Incorrect email or password.' },
    'ERR_INPUT_INVALID': { de: 'Ungültige Eingabe. Bitte überprüfe deine Daten.', en: 'Invalid input. Please check your data.' },
    'ERR_GENERIC': { de: 'Fehler beim Einloggen. Server nicht erreichbar.', en: 'Error logging in. Server unreachable.' },
    'ERR_NETWORK': { de: 'Netzwerkfehler. Bitte versuche es später erneut.', en: 'Network error. Please try again later.' },
    'SUCCESS_LOGIN': { de: 'Erfolgreich eingeloggt. Weiterleitung...', en: 'Successfully logged in. Redirecting...' },
    'SUCCESS_REGISTER': { de: 'Registrierung erfolgreich! Bitte loggen Sie sich nun ein.', en: 'Registration successful! Please sign in now.' },
    'ERR_EMAIL_TAKEN': { de: 'Ungültige Eingabe oder E-Mail bereits registriert.', en: 'Invalid input or email already registered.' },
};

/**
 * Gibt den übersetzten Text für einen Schlüssel
 * in der aktuell ausgewählten Sprache zurück.
 *
 * Unterstützt auch dynamische Texte (Funktionen).
 *
 * @param {string} key - Übersetzungsschlüssel
 * @param {*} [arg1] - Optionales Argument für dynamische Texte
 * @returns {string} Übersetzter Text
 */
const t = (key, arg1) => {
    const currentLang = LanguageStore.language;
    let text = translations[key]?.[currentLang] || key;
    
    if (typeof text === 'function') {
        return text(arg1);
    }
    return text;
};

/**
 * Prüft, ob eine E-Mail-Adresse ein gültiges Format besitzt.
 *
 * @param {string} email - Zu prüfende E-Mail-Adresse
 * @returns {boolean} true bei gültigem Format, sonst false
 */
const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/* HILFSFUNKTION: Simuliert eine Verzögerung für das Testen des Spinners
* const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)); 
*/

/**
 * Gemeinsames Vue-Mixin für Login- und Registrierungsformulare.
 *
 * Enthält:
 * - Statusmeldungen (Fehler / Erfolg)
 * - Ladezustand (Spinner)
 * - Zentrale Fehlerbehandlung für API-Aufrufe
 */
const AuthMixin = {
  data() {
    return {
      errorMessage: '',
      successMessage: '',
      isLoading: false,   
    };
  },
   methods: {
        t, 
        /**
        * Setzt alle Statusmeldungen zurück.
        */
        clearMessages() {
            this.errorMessage = '';
            this.successMessage = '';
        },
        
        /**
         * Behandelt API-Fehler abhängig vom HTTP-Statuscode.
         *
         * @param {Response} res - Fetch-Response-Objekt
         * @param {boolean} isRegister - true bei Registrierung
         */
        handleApiError(res, isRegister = false) {
            this.clearMessages();
            if (res.status === 401) {
                this.errorMessage = t('ERR_LOGIN_FAILED');
            } else if (res.status === 400) {
                this.errorMessage = t(isRegister ? 'ERR_EMAIL_TAKEN' : 'ERR_INPUT_INVALID');
            } else {
                this.errorMessage = t('ERR_GENERIC');
            }
        },
        handleNetworkError(error) {
            console.error('Fetch error:', error);
            this.clearMessages();
            this.errorMessage = t('ERR_NETWORK');
        }
    }
};

/**
 * Vue-Komponente zur Umschaltung der Anwendungssprache.
 *
 * Die Komponente greift auf den globalen LanguageStore zu
 * und ändert die aktuell aktive Sprache (Deutsch / Englisch).
 *
 * Die Auswahl wirkt sich sofort auf alle übersetzten UI-Texte aus.
 */
const LanguageSwitcher = {
    template: `
        <div class="lang-buttons">
            <button :class="{ active: language === 'de' }" @click="language = 'de'">
                <img src="icons/flag-de.png" alt="German Flag" class="flag-icon" /> DE
            </button>
            <button :class="{ active: language === 'en' }" @click="language = 'en'">
                <img src="icons/flag-en.png" alt="English Flag" class="flag-icon" /> EN
            </button>
        </div>
    `,
    computed: {
        /**
        * Getter/Setter für die aktuell ausgewählte Sprache.
        * Nutzt den reaktiven globalen LanguageStore.
        */
        language: {
            get() {
                return LanguageStore.language;
            },
            set(val) {
                LanguageStore.language = val;
            }
        }
    }
};

/**
 * Wiederverwendbare Eingabekomponente für Authentifizierungsformulare.
 *
 * Unterstützt:
 * - Text- und E-Mail-Felder
 * - Passwortfelder mit Sichtbarkeitsumschaltung
 * - Icons
 * - v-model Anbindung
 *
 * Wird sowohl im Login- als auch im Registrierungsformular verwendet.
 */
const AuthInput = {
    props: {
        /** Aktueller Wert des Eingabefeldes (v-model) */
        modelValue: String, 

        /** Übersetzungsschlüssel für das Platzhalter-Text */
        placeholderKey: { type: String, required: true },

        /** Icon-Pfad für das Eingabefeld */
        icon: { type: String, required: true },

        /** Gibt an, ob es sich um ein Passwortfeld handelt */
        isPassword: { type: Boolean, default: false },

        /** Typ des Eingabefeldes (z.B. text, email) */
        inputType: { type: String, default: 'text' }
    },
    mixins: [AuthMixin],
    template: `
        <div class="input-with-icon">
            <!-- Email/Lock Icon -->
            <img 
                :src="icon" 
                :class="{ 'email-icon': icon.includes('email'), 'lock-icon': icon.includes('lock') }"
                :alt="t(placeholderKey)" 
            />
            
            <input 
                :type="resolvedType" 
                :placeholder="t(placeholderKey)" 
                :value="modelValue" 
                @input="$emit('update:modelValue', $event.target.value)"
                :autocomplete="isPassword ? 'off' : 'email'"
            />
            
            <img
                v-if="isPassword"
                :src="showPassword ? 'icons/eye-off.png' : 'icons/eye.png'"
                class="eye-icon"
                @click="togglePassword"
                alt="Toggle Password Visibility"
            />
        </div>
    `,
    data() {
        return {
            showPassword: false,
        };
    },
    computed: {
        resolvedType() {
            if (!this.isPassword) return this.inputType;
            return this.showPassword ? 'text' : 'password';
        }
    },
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword;
        }
    }
};


/**
 * Vue-Komponente für das Login-Formular.
 *
 * Verantwortlichkeiten:
 * - Erfassung von E-Mail & Passwort
 * - Client-seitige Validierung
 * - Login-Request an das Backend
 * - Anzeige von Fehler- und Erfolgsmeldungen
 */
const LoginForm = {
    components: { LanguageSwitcher, AuthInput },
    mixins: [AuthMixin],
    template: `
        <div class="auth-form">
            <h2>{{ t('LOGIN_TITLE') }}</h2>
            <LanguageSwitcher />

            <AuthInput
                icon="icons/email.png"
                placeholderKey="EMAIL_PLACEHOLDER"
                inputType="email"
                :modelValue="email"
                @update:modelValue="email = $event; clearMessages()"
            />
            
            <AuthInput
                icon="icons/lock.png"
                placeholderKey="PASSWORD_PLACEHOLDER"
                :isPassword="true"
                :modelValue="password"
                @update:modelValue="password = $event; clearMessages()"
            />
            
            <button @click="login" :disabled="isLoading" :class="{ 'loading-content': isLoading }">
                <!-- Text wird nur angezeigt, wenn NICHT geladen wird -->
                <span v-if="!isLoading">{{ t('LOGIN_BUTTON') }}</span>
                <div v-if="isLoading" class="spinner"></div>                  
            </button>

            <p class="link">
                <span>{{ t('NO_ACCOUNT_PRE') }}</span>
                <span class="link-highlight" @click="$emit('switchMode')">
                    {{ t('NO_ACCOUNT_LINK') }}
                </span>
            </p>

            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success">{{ successMessage }}</p>
        </div>
    `,
    data() {
        return {
            email: '',
            password: '',
        };
    },
    methods: {
        async login() {
            this.clearMessages();

            if (!this.email || !this.password) {
                this.errorMessage = t('ERR_FILL_FIELDS');
                return;
            }
            if (!isValidEmail(this.email)) {
                this.errorMessage = t('ERR_INVALID_EMAIL');
                return;
            }

            this.isLoading = true;

            try {
                const res = await fetch(`${API_BASE}/user/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password }),
                    credentials: 'include'
                });

                if (res.ok) {
                    this.successMessage = t('SUCCESS_LOGIN');
                    setTimeout(() => {
                        window.location.href = '/Startseitendesign/startseite.html';
                    }, 1500);
                } else {
                    this.handleApiError(res, false);
                }

            } catch (error) {
                this.handleNetworkError(error);
            } finally {
                this.isLoading = false; 
            } 
        } 
    }
};

/**
 * Vue-Komponente für das Registrierungsformular.
 *
 * Verantwortlichkeiten:
 * - Erfassen der Registrierungsdaten
 * - Client-seitige Validierung (E-Mail, Passwort, Wiederholung)
 * - Kommunikation mit der Backend-API
 * - Anzeige von Ladezustand, Fehlern und Erfolgsmeldungen
 */
const RegisterForm = {
    components: { LanguageSwitcher, AuthInput },
    mixins: [AuthMixin],
    template: `
        <div class="auth-form">
            <h2>{{ t('REGISTER_TITLE') }}</h2>
            <LanguageSwitcher />

            <AuthInput
                icon="icons/email.png"
                placeholderKey="EMAIL_PLACEHOLDER"
                inputType="email"
                :modelValue="email"
                @update:modelValue="email = $event; clearMessages()"
            />

            <AuthInput
                icon="icons/lock.png"
                placeholderKey="PASSWORD_PLACEHOLDER"
                :isPassword="true"
                :modelValue="password"
                @update:modelValue="password = $event; clearMessages()"
            />
            
            <AuthInput
                icon="icons/lock.png"
                placeholderKey="REPEAT_PASSWORD_PLACEHOLDER"
                :isPassword="true"
                :modelValue="repeatPassword"
                @update:modelValue="repeatPassword = $event; clearMessages()"
            />

            <!-- Hinzugefügte visuelle Anzeige: Spinner und loading-content Klasse -->
            <button @click="register" :disabled="isLoading" :class="{ 'loading-content': isLoading }">
                <!-- Text wird nur angezeigt, wenn NICHT geladen wird -->
                <span v-if="!isLoading">{{ t('REGISTER_BUTTON') }}</span>
                <!-- Spinner-Element wird nur bei Ladezustand angezeigt -->
                <div v-if="isLoading" class="spinner"></div>
            </button>


            <p class="link">
                <span>{{ t('ALREADY_REGISTERED_PRE') }}</span>
                <span class="link-highlight" @click="$emit('switchMode')">
                    {{ t('ALREADY_REGISTERED_LINK') }}
                </span>
            </p>

            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success">{{ successMessage }}</p>
        </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            repeatPassword: '',
        };
    },
    methods: {
        /**
        * Führt die Benutzerregistrierung durch.
        * Validiert Eingaben clientseitig und sendet
        * anschließend einen POST-Request an das Backend.
        */
        async register() {
            this.clearMessages();

            /* --- Client-Side Validation --- */
            if (!this.email || !this.password || !this.repeatPassword) {
                this.errorMessage = t('ERR_FILL_FIELDS');
                return;
            }
            if (!isValidEmail(this.email)) {
                this.errorMessage = t('ERR_INVALID_EMAIL');
                return;
            }
            if (this.password.length < MIN_PASSWORD_LENGTH) {
                this.errorMessage = t('ERR_PASSWORD_LENGTH', MIN_PASSWORD_LENGTH);
                return;
            }
            if (this.password !== this.repeatPassword) {
                this.errorMessage = t('ERR_PASSWORD_MISMATCH');
                return;
            }

            this.isLoading = true; 

            try {
                const res = await fetch(`${API_BASE}/user/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password }),
                    credentials: 'include'
                });

                if (res.ok) {
                    this.successMessage = t('SUCCESS_REGISTER');
                    setTimeout(() => {
                        this.$emit('switchMode');
                    }, 3000);
                } else {
                    this.handleApiError(res, true);
                }

            } catch (err) {
                this.handleNetworkError(err);
            }
            finally {
                this.isLoading = false; 
            }
        }
    }
};

/**
 * Wrapper-Komponente für die Authentifizierungsansicht.
 *
 * Steuert, ob das Login- oder das Registrierungsformular
 * angezeigt wird.
 *
 * Die Umschaltung erfolgt über ein internes State-Flag.
 */
const AuthWrapper = {
    components: { LoginForm, RegisterForm },
    template: `
        <div class="auth-wrapper">
            <!-- Ensure components are accessed as component name strings -->
            <component :is="isLogin ? 'LoginForm' : 'RegisterForm'" @switchMode="toggleForm" />
        </div>
    `,
    data() {
        return {
            isLogin: true
        };
    },
    methods: {
        /**
        * Wechselt zwischen Login- und Registrierungsansicht.
        */
        toggleForm() {
            this.isLogin = !this.isLogin;
        }
    }
};

/**
 * Einstiegspunkt der Authentifizierungs-App.
 * Erstellt die Vue-App und mountet sie
 * in das HTML-Element mit der ID 'app'.
 */
const app = createApp(AuthWrapper);
app.component('LanguageSwitcher', LanguageSwitcher);
app.component('AuthInput', AuthInput);
app.mount('#app');
