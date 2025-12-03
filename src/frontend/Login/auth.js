// === 1. Shared Language Store ===
// Reactive store for current language setting (default: German)
const LanguageStore = Vue.reactive({
  language: 'de'
});

// === API and Constants ===
import { API_BASE } from '../config.js';
const MIN_PASSWORD_LENGTH = 6; // Standard minimum password length
const { reactive, createApp } = Vue;

// 2. Translation Dictionary (Key-based i18n)
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
// Returns the correct translated text based on key and interpolates arguments
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
const isValidEmail = (email) => {
  // Simple regex for basic email format validation
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// HILFSFUNKTION: Simuliert eine Verzögerung für das Testen des Spinners
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// === 5. Shared Vue Mixin ===
// Centralizes message state and error handling logic
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
        // Clears error/success messages
        clearMessages() {
            this.errorMessage = '';
            this.successMessage = '';
        },
        // Centralized API error handling logic
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
        handleNetworkError(error) {
            console.error('Fetch error:', error);
            this.clearMessages();
            this.errorMessage = t('ERR_NETWORK');
        }
    }
};

// === 6. Shared Components ===
// Language Switcher Component
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

// AuthInput: Reusable component for input fields, handles v-model and password visibility.
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
            // Logic to handle password visibility toggle
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


// === 7. Login Form (Uses Mixin and AuthInput) ===
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
                this.isLoading = false; // deactivate loading state
            } 
        } 
    }
};

// === 8. Register Form (Uses Mixin and AuthInput) ===
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
                this.isLoading = false; // deactivate loading state
            }
        }
    }
};

// === 9. Auth Wrapper ===
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
        toggleForm() {
            this.isLogin = !this.isLogin;
        }
    }
};

// === 10. Mount App ===
const app = createApp(AuthWrapper);
app.component('LanguageSwitcher', LanguageSwitcher);
app.component('AuthInput', AuthInput);
app.mount('#app');
