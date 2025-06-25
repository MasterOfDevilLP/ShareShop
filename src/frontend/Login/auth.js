// === Shared Language Store ===
// Reactive store for current language setting (default: German)
const LanguageStore = Vue.reactive({
  language: 'de'
});

// === Translation Helper === '
// returns the correct text based on current language
const t = (de, en) => LanguageStore.language === 'de' ? de : en;

// === Shared Language Switcher ===
const LanguageSwitcher = {
  template: `
    <div class="lang-buttons">
      <button :class="{ active: language === 'de' }" @click="language = 'de'">🇩🇪 DE</button>
      <button :class="{ active: language === 'en' }" @click="language = 'en'">🇬🇧 EN</button>
    </div>
  `,
  computed: {
    // Bind component language to shared reactive LanguageStore
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

const API_BASE = 'http://localhost:8001'; // ← API-Basis-URL

// === Login Form ===
const LoginForm = {
  components: { LanguageSwitcher },
  template: `
    <div class="auth-form">
      <h2>{{ t('Login', 'Sign In') }}</h2>
      <LanguageSwitcher />

    <!-- Email input -->
    <div class="input-with-icon">
      <img src="icons/email.png" class="email-icon" />
      <input type="email" :placeholder="t('E-Mail', 'Email')" v-model="email" />
    </div>

     <!-- Password input with toggle visibility-->
    <div class="input-with-icon">
      <img src="icons/lock.png" class="lock-icon" />
      <input :type="showPassword ? 'text' : 'password'" :placeholder="t('Passwort', 'Password')" v-model="password" />
      <img
        :src="showPassword ? 'icons/eye-off.png' : 'icons/eye.png'"
        class="eye-icon"
        @click="togglePassword"
        alt="Toggle Password Visibility"
      />  
    </div>

       <!-- Login Button -->
      <button @click="login">{{ t('Einloggen', 'Log In') }}</button>
      
      <!-- Switch to register form -->
      <p class="link" @click="$emit('switchMode')">
        {{ t('Noch kein Account? Jetzt registrieren', 'No account? Register here') }}
      </p>

      <!-- Display error message -->
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      errorMessage: ''
    };
  },
  methods: {
    t,  // Use global translation function

    // Toggle password visibility
    togglePassword() {
    this.showPassword = !this.showPassword;
    },

    // Handle login logic
   async login() {
      this.errorMessage = '';

      if (!this.email || !this.password) {
        this.errorMessage = t('Bitte alle Felder ausfüllen.', 'Please fill in all fields.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/user/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password }),
          credentials: 'include'
        });

        console.log("Status:", res.status);

        // Check if body has content before parsing as JSON
        const contentType = res.headers.get("content-type");
        let data = {};
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          console.log("Kein JSON-Body vorhanden.");
        }

        if (res.ok) {
          window.location.href = '/src/frontend/Startseitendesign/startseite.html';
        } else if (res.status === 401) {
          this.errorMessage = t('Falsche Email oder Passwort.', 'Incorrect email or password.');
        } else {
          this.errorMessage = t('Fehler beim Einloggen.', 'Error logging in.');
        }

      } catch (error) {
        console.error('Fehler bei der Anfrage:', error);
        this.errorMessage = t('Fehler beim Einloggen.', 'Error logging in.');
      }
    }
  }
};

// === Register Form ===
const RegisterForm = {
  components: { LanguageSwitcher },
  template: `
    <div class="auth-form">
      <h2>{{ t('Registrieren', 'Register') }}</h2>
      <LanguageSwitcher />

    <!-- Email input -->
    <div class="input-with-icon">
      <img src="icons/email.png" class="email-icon" />
      <input type="email" :placeholder="t('E-Mail', 'Email')" v-model="email" />
    </div>

    <!-- Password input -->
    <div class="input-with-icon">
      <img src="icons/lock.png" class="lock-icon" />
      <input :type="showPassword ? 'text' : 'password'" :placeholder="t('Passwort', 'Password')" v-model="password" />
      <img
        :src="showPassword ? 'icons/eye-off.png' : 'icons/eye.png'"
        class="eye-icon"
        @click="togglePassword"
        alt="Toggle Password Visibility"
      />  
    </div>

    <!-- Repeat Password input -->
    <div class="input-with-icon">
      <img src="icons/lock.png" class="lock-icon" />
      <input :type="showRepeatPassword ? 'text' : 'password'" :placeholder="t('Passwort wiederholen', 'Repeat Password')" v-model="repeatPassword" />
      <img
        :src="showRepeatPassword ? 'icons/eye-off.png' : 'icons/eye.png'"
        class="eye-icon"
        @click="toggleRepeatPassword"
        alt="Toggle Password Visibility"
      />  
    </div>

      <!-- Register button -->
      <button @click="register">{{ t('Registrieren', 'Register') }}</button>

      <!-- Switch to login form -->
      <p class="link" @click="$emit('switchMode')">
        {{ t('Bereits registriert? Zum Login', 'Already registered? Login here') }}
      </p>

      <!-- Error msg -->
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  `,
  
  data() {
    return {
      email: '',
      password: '',
      repeatPassword: '',
      showRepeatPassword: false,
      showPassword: false,
      errorMessage: ''
    };
  },
  methods: {
    t,

    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    toggleRepeatPassword() {
      this.showRepeatPassword = !this.showRepeatPassword;
    },
    
    // Handle registration logic
    async register() {
      this.errorMessage = '';
      // Validate input fields
      if (!this.email || !this.password || !this.repeatPassword) {
        this.errorMessage = t('Bitte alle Felder ausfüllen.', 'Please fill in all fields.');
        return;
      }
      // Check password match
      if (this.password !== this.repeatPassword) {
        this.errorMessage = t('Passwörter stimmen nicht überein.', 'Passwords do not match.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/user/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password })
        });

        // Handle registration result
        if (res.ok) {
          // Register success --> weiterleiten
          window.location.href = '/startseitendesign/startseite.html?erklaermodus=true'; //path to startenseite
        } else if (res.status === 400) {
          this.errorMessage = t(
            'Ungültige Eingabe. Bitte überprüfe deine Daten.',
            'Invalid input. Please check your data.');
        }
          // Show specific error if email already exists
          else if (res.status === 401) {
            this.errorMessage = t(
              'Diese E-Mail ist bereits registriert. Bitte einloggen.',
              'This email is already registered. Please log in.'
            );
          } else {
            this.errorMessage = t('Registrierung nicht erfolgreich.', 'Registration failed.');
          }
        
      } catch (err) {
       console.error('Fehler bei der Anfrage:', err);
    this.errorMessage = t('Fehler bei der Registrierung.', 'Error during registration.');
      }
    }
  }
};

// === Auth Wrapper ===
// Parent component to toggle between login and register form
const AuthWrapper = {
  components: { LoginForm, RegisterForm },
  template: `
    <div class="auth-wrapper">
      <component :is="isLogin ? 'LoginForm' : 'RegisterForm'" @switchMode="toggleForm" />
    </div>
  `,
  data() {
    return {
      isLogin: true
    };
  },
  methods: {
    // Toggle between login and register
    toggleForm() {
      this.isLogin = !this.isLogin;
    }
  }
};

// === Mount App ===
const app = Vue.createApp(AuthWrapper);
app.component('LanguageSwitcher', LanguageSwitcher);
app.mount('#app');
