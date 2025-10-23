// === Shared Language Store ===
// Reactive store for current language setting (default: German)
const LanguageStore = Vue.reactive({
  language: 'de'
});

// === Translation Helper === 
// returns the correct text based on current language
const t = (de, en) => LanguageStore.language === 'de' ? de : en;

// === Input Validation Helpers === 
const MIN_PASSWORD_LENGTH = 6; // Standard minimum password length
const isValidEmail = (email) => {
  // Simple regex for basic email format validation
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// === Shared Language Switcher ===
const LanguageSwitcher = {
  template: `
    <div class="lang-buttons">
      <button :class="{ active: language === 'de' }" @click="language = 'de'">
        <img src="icons/flag-de.png" alt="German Flag" class="flag-icon" /> DE
      </button>
      <button :class="{ active: language === 'en' }" @click="language = 'en'">
        <img src="icons/flag-en.png" alt="German Flag" class="flag-icon" /> EN
      </button>
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
      <p class="link">
       <span>{{ t('Noch kein Account? ', 'No account? ') }}</span>
        <span class="link-highlight" @click="$emit('switchMode')">
         {{ t('Jetzt registrieren', 'Register here') }}
      </span>
      </p>

      <!-- Display message -->
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      errorMessage: '',
      successMessage: ''
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
      this.successMessage = '';

      // --- Client-Side Validation ---
      if (!this.email || !this.password) {
        this.errorMessage = t('Bitte alle Felder ausfüllen.', 'Please fill in all fields.');
        return;
      }
      if (!isValidEmail(this.email)) {
        this.errorMessage = t('Ungültiges E-Mail-Format. Bitte eine gültige E-Mail-Adresse eingeben.', 'Invalid email format. Please enter a valid email address.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/user/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password }),
          credentials: 'include'
        });

        // Backend response handling based on Java code statuses
        if (res.ok) { // HTTP Status 200 (HttpStatus.OK)
          this.successMessage = t('Erfolgreich eingeloggt. Weiterleitung...', 'Successfully logged in. Redirecting...');
          setTimeout(() => {
            window.location.href = '/Startseitendesign/startseite.html';
          }, 1500);
          
        } else if (res.status === 401) { // HTTP Status 401 (HttpStatus.UNAUTHORIZED)
          // This covers login failure (email/password mismatch)
          this.errorMessage = t('Falsche E-Mail oder Passwort.', 'Incorrect email or password.');
          
        } else if (res.status === 400) { // HTTP Status 400 (HttpStatus.BAD_REQUEST)
          // This covers validation failure in the backend (req.validate() fail)
          this.errorMessage = t('Ungültige Eingabe. Bitte überprüfe deine Daten.', 'Invalid input. Please check your data.');
        
        } else {
          // General error case
          this.errorMessage = t('Fehler beim Einloggen. Server nicht erreichbar.', 'Error logging in. Server unreachable.');
        }

      } catch (error) {
        console.error('Fehler bei der Anfrage:', error);
        this.errorMessage = t('Netzwerkfehler. Bitte versuche es später erneut oder registrieren Sie sich.', 'Network error. Please try again later or register.');
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
      <p class="link">
        <span>{{ t('Bereits registriert? ', 'Already registered? ') }}</span>
        <span class="link-highlight" @click="$emit('switchMode')">
         {{ t('Zum Login', 'Login here') }}
        </span>
      </p>


      <!-- msg -->
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
  `,
  
  data() {
    return {
      email: '',
      password: '',
      repeatPassword: '',
      showRepeatPassword: false,
      showPassword: false,
      errorMessage: '',
      successMessage: ''
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
      this.successMessage = '';

      // --- Client-Side Validation ---
      if (!this.email || !this.password || !this.repeatPassword) {
        this.errorMessage = t('Bitte alle Felder ausfüllen.', 'Please fill in all fields.');
        return;
      }
      if (!isValidEmail(this.email)) {
        this.errorMessage = t('Ungültiges E-Mail-Format.', 'Invalid email format.');
        return;
      }

      // Check password length
      if (this.password.length < MIN_PASSWORD_LENGTH) {
        this.errorMessage = t(
          `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`, 
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
        );
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
          body: JSON.stringify({ email: this.email, password: this.password }),
          credentials: 'include'
        });

        // Backend response handling based on Java code statuses
        if (res.ok) { // HTTP Status 200 (HttpStatus.OK)
          // Register success --> weiterleiten to login page
          this.successMessage = t(
            'Registrierung erfolgreich! Bitte loggen Sie sich nun ein.',
            'Registration successful! Please sign in now.'
          );
          // Instead of redirecting to /Login/index.html, switch back to login form for better UX
          setTimeout(() => {
            this.$emit('switchMode');
            this.successMessage = ''; // Clear success message after switch
          }, 3000);

        } else if (res.status === 400) { // HTTP Status 400 (HttpStatus.BAD_REQUEST)
          // a general 'invalid input' warning or assume the email is taken
          this.errorMessage = t(
            'Ungültige Eingabe oder E-Mail bereits registriert.',
            'Invalid input or email already registered.');
        } else {
          // General error case
          this.errorMessage = t('Registrierung nicht erfolgreich. Serverfehler.', 'Registration failed. Server error.');
        }
        
      } catch (err) {
       console.error('Fehler bei der Anfrage:', err);
       this.errorMessage = t('Netzwerkfehler bei der Registrierung.', 'Network error during registration.');
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
      // Clear all potential messages when switching views
      const currentForm = this.isLogin ? this.$refs.loginForm : this.$refs.registerForm;
      if (currentForm) {
        currentForm.errorMessage = '';
        currentForm.successMessage = '';
      }
    }
  }
};

// === Mount App ===
const app = Vue.createApp(AuthWrapper);
app.component('LanguageSwitcher', LanguageSwitcher);
app.mount('#app');