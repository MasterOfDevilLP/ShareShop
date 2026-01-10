/**
 * @fileoverview Authentication system with Vue.js 3
 * Provides login and registration forms with internationalization (i18n) support.
 * Supports German (de) and English (en) languages with reactive language switching.
 * 
 * @requires Vue
 * @requires ../config.js
 */

// === 1. Shared Language Store ===
/**
 * Reactive store for managing the current language setting
 * @type {Object}
 * @property {string} language - Current language code ('de' or 'en')
 */
const LanguageStore = Vue.reactive({
  language: 'de'
});

// === API and Constants ===
import { API_BASE } from "../config.js";

/**
 * Minimum required password length for registration
 * @const {number}
 */
const MIN_PASSWORD_LENGTH = 6; // Standard minimum password length

const { reactive, createApp } = Vue;


// 2. Translation Dictionary (Key-based i18n)
/**
 * Translation dictionary containing all UI text in supported languages
 * Supports both static strings and dynamic function-based translations
 * @const {Object.<string, Object.<string, string|function>>}
 */
const translations = {
  // General UI Texts
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

    // Messages/Errors
    'ERR_FILL_FIELDS': { de: 'Bitte alle Felder ausfüllen.', en: 'Please fill in all fields.' },
    'ERR_INVALID_EMAIL': { de: 'Ungültiges E-Mail-Format.', en: 'Invalid email format.' },
    // Function for dynamic messages
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

// === 3. Translation Helper === 
/**
 * Translation helper function that retrieves the appropriate text based on the current language
 * Supports both static strings and dynamic function-based translations
 * 
 * @param {string} key - Translation key to look up
 * @param {*} [arg1] - Optional argument for function-based translations (e.g., password length)
 * @returns {string} Translated text in the current language, or the key itself if not found
 */
const t = (key, arg1) => {
    const currentLang = LanguageStore.language;
    let text = translations[key]?.[currentLang] || key;
    
    // Handle function-based dynamic messages (like password length)
    if (typeof text === 'function') {
        return text(arg1);
    }
    return text;
};


// === 4. Input Validation Helpers ===
/**
 * Validates email format using regex pattern
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid, false otherwise
 */
const isValidEmail = (email) => {
  // Simple regex for basic email format validation
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// HILFSFUNKTION: Simuliert eine Verzögerung für das Testen des Spinners
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// === 5. Shared Vue Mixin ===
/**
 * Shared Vue mixin for authentication forms
 * Centralizes message state management and error handling logic
 * Used by both LoginForm and RegisterForm components
 * 
 * @mixin
 * @property {Object} data - Component data
 * @property {string} data.errorMessage - Current error message to display
 * @property {string} data.successMessage - Current success message to display
 * @property {boolean} data.isLoading - Loading state for async operations
 */
const AuthMixin = {
  data() {
    return {
      errorMessage: '',
      successMessage: '',
      isLoading: false,   // loading state
    };
  },
   methods: {
        t, // Include the global translation function
        /**
         * Clears all error and success messages
         */
        clearMessages() {
            this.errorMessage = '';
            this.successMessage = '';
        },
        /**
         * Centralized API error handling logic
         * Sets appropriate error message based on HTTP status code
         * 
         * @param {Response} res - Fetch API response object
         * @param {boolean} [isRegister=false] - Whether this is a registration request
         */
        handleApiError(res, isRegister = false) {
            this.clearMessages();
            if (res.status === 401) {
                this.errorMessage = t('ERR_LOGIN_FAILED');
            } else if (res.status === 400) {
                // Use different message for register vs login 400
                this.errorMessage = t(isRegister ? 'ERR_EMAIL_TAKEN' : 'ERR_INPUT_INVALID');
            } else {
                this.errorMessage = t('ERR_GENERIC');
            }
        },
        /**
         * Handles network errors during API calls
         * Logs error to console and sets user-friendly error message
         * 
         * @param {Error} error - Error object from failed fetch request
         */
        handleNetworkError(error) {
            console.error('Fetch error:', error);
            this.clearMessages();
            this.errorMessage = t('ERR_NETWORK');
        }
    }
};

// === 6. Shared Components ===
/**
 * Language Switcher Component
 * Provides UI buttons to switch between German (DE) and English (EN)
 * Updates the global LanguageStore when language is changed
 * 
 * @component
 */
const LanguageSwitcher = {
    template: `
        <div class="lang-buttons">
            <button :class="{ active: language === 'de' }" @click="language = 'de'">
                <img src="Login/icons/flag-de.png" alt="German Flag" class="flag-icon" /> DE
            </button>
            <button :class="{ active: language === 'en' }" @click="language = 'en'">
                <img src="Login/icons/flag-en.png" alt="English Flag" class="flag-icon" /> EN
            </button>
        </div>
    `,
    computed: {
        /**
         * Computed property for two-way binding with LanguageStore
         * @returns {string} Current language code
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
 * AuthInput Component
 * Reusable input field component with icon support and password visibility toggle
 * Handles v-model binding for parent components
 * 
 * @component
 * @property {string} modelValue - Current input value (v-model)
 * @property {string} placeholderKey - Translation key for placeholder text
 * @property {string} icon - Path to icon image file
 * @property {boolean} [isPassword=false] - Whether this is a password field
 * @property {string} [inputType='text'] - HTML input type (text/email)
 * @emits update:modelValue - Emitted when input value changes
 */
const AuthInput = {
    props: {
        modelValue: String, // v-model binding
        placeholderKey: { type: String, required: true },
        icon: { type: String, required: true },
        isPassword: { type: Boolean, default: false },
        // Use an explicit type prop for email/text input
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
                :src="showPassword ? 'Login/icons/eye-off.png' : 'Login/icons/eye.png'"
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
        /**
         * Resolves the actual input type based on password visibility state
         * @returns {string} 'password', 'text', or the custom inputType
         */
        resolvedType() {
            // Logic to handle password visibility toggle
            if (!this.isPassword) return this.inputType;
            return this.showPassword ? 'text' : 'password';

        }
    },
    methods: {
        /**
         * Toggles password visibility between hidden and visible
         */
        togglePassword() {
            this.showPassword = !this.showPassword;
        }
    }
};


// === 7. Login Form (Uses Mixin and AuthInput) ===
/**
 * Login Form Component
 * Handles user authentication with email and password
 * Includes client-side validation and API integration
 * 
 * @component
 * @emits switchMode - Emitted when user clicks to switch to registration form
 */
const LoginForm = {
    components: { LanguageSwitcher, AuthInput },
    mixins: [AuthMixin],
    template: `
        <div class="auth-form" @keydown.enter="login">
            <h2>{{ t('LOGIN_TITLE') }}</h2>
            <LanguageSwitcher />

            <AuthInput
                icon="Login/icons/email.png"
                placeholderKey="EMAIL_PLACEHOLDER"
                inputType="email"
                :modelValue="email"
                @update:modelValue="email = $event; clearMessages()"
            />
            
            <AuthInput
                icon="Login/icons/lock.png"
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
        /**
         * Handles login form submission
         * Performs client-side validation, sends credentials to API,
         * and redirects user on successful authentication
         * 
         * @async
         */
        async login() {
            this.clearMessages();

            // --- Client-Side Validation ---
            if (!this.email || !this.password) {
                this.errorMessage = t('ERR_FILL_FIELDS');
                return;
            }
            if (!isValidEmail(this.email)) {
                this.errorMessage = t('ERR_INVALID_EMAIL');
                return;
            }

            this.isLoading = true; // activate loading state

            try {
                // await delay(3000); 
                const res = await fetch(`${API_BASE}/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: this.email, password: this.password }),
                credentials: "include",
              });


                if (res.ok) {
                    this.successMessage = t('SUCCESS_LOGIN');
                    setTimeout(() => {
                        const redirectUrl = localStorage.getItem("redirectAfterLogin");
                    if (redirectUrl) {
                        localStorage.removeItem("redirectAfterLogin");
                        window.location.href = redirectUrl; // go back to invite site
                    } else {
                        window.location.href = '../Startseitendesign/startseite.html';
                    }
                    }, 1500);
                } else {
                    this.handleApiError(res, false);
                }

            } catch (error) {
                this.handleNetworkError(error);
            } finally {
                this.isLoading = false; // deactivate loading state
            } 
        } 
    }
};

// === 8. Register Form (Uses Mixin and AuthInput) ===
/**
 * Registration Form Component
 * Handles new user registration with email and password
 * Includes password confirmation and comprehensive validation
 * 
 * @component
 * @emits switchMode - Emitted when user clicks to switch to login form or after successful registration
 */
const RegisterForm = {
    components: { LanguageSwitcher, AuthInput },
    mixins: [AuthMixin],
    template: `
        <div class="auth-form" @keydown.enter="register">
            <h2>{{ t('REGISTER_TITLE') }}</h2>
            <LanguageSwitcher />

            <AuthInput
                icon="Login/icons/email.png"
                placeholderKey="EMAIL_PLACEHOLDER"
                inputType="email"
                :modelValue="email"
                @update:modelValue="email = $event; clearMessages()"
            />

            <AuthInput
                icon="Login/icons/lock.png"
                placeholderKey="PASSWORD_PLACEHOLDER"
                :isPassword="true"
                :modelValue="password"
                @update:modelValue="password = $event; clearMessages()"
            />
            
            <AuthInput
                icon="Login/icons/lock.png"
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
         * Handles registration form submission
         * Performs comprehensive client-side validation including password matching,
         * sends registration data to API, and switches to login form on success
         * 
         * @async
         */
        async register() {
            this.clearMessages();

            // --- Client-Side Validation ---
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

            this.isLoading = true; // activate loading state

            try {
                const res = await fetch(`${API_BASE}/user/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: this.email, password: this.password }),
                credentials: "include",
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
                this.isLoading = false; // deactivate loading state
            }
        }
    }
};

// === 9. Auth Wrapper ===
/**
 * Auth Wrapper Component
 * Container component that manages switching between login and registration forms
 * 
 * @component
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
         * Toggles between login and registration forms
         */
        toggleForm() {
            this.isLogin = !this.isLogin;
        }
    }
};

// === 10. Mount App ===
/**
 * Creates and mounts the main Vue application
 * Registers global components and mounts to #app element
 */
const app = createApp(AuthWrapper);
app.component('LanguageSwitcher', LanguageSwitcher);
app.component('AuthInput', AuthInput);
app.mount('#app');