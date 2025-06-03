// === Shared Language Store ===
const LanguageStore = Vue.reactive({
  language: 'de'
});

// === Translation Helper ===
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

// === Login Form ===
const LoginForm = {
  components: { LanguageSwitcher },
  template: `
    <div class="auth-form">
      <h2>{{ t('Login', 'Sign In') }}</h2>
      <LanguageSwitcher />

    <div class="input-with-icon">
      <img src="icons/email.png" class="email-icon" />
      <input type="email" :placeholder="t('E-Mail', 'Email')" v-model="email" />
    </div>

    <div class="input-with-icon">
      <img src="icons/lock.png" class="lock-icon" />
      <input type="password" :placeholder="t('Passwort', 'Password')" v-model="password" />
    </div>

      <button @click="login">{{ t('Einloggen', 'Log In') }}</button>
      
      <p class="link" @click="$emit('switchMode')">
        {{ t('Noch kein Account? Jetzt registrieren', 'No account? Register here') }}
      </p>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  `,
  data() {
    return {
      username: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    t,
    async login() {
      this.errorMessage = '';
      if (!this.username || !this.password) {
        this.errorMessage = t('Bitte alle Felder ausfüllen.', 'Please fill in all fields.');
        return;
      }
      const hashed = CryptoJS.SHA256(this.password).toString();
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: hashed })
        });
        const data = await res.json();
        if (data.success) {
          window.location.href = '/startenseite';
        } else {
          this.errorMessage = t('Falscher Benutzername oder Passwort.', 'Incorrect username or password.');
        }
      } catch {
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

    <div class="input-with-icon">
      <img src="icons/email.png" class="email-icon" />
      <input type="email" :placeholder="t('E-Mail', 'Email')" v-model="email" />
    </div>

    <div class="input-with-icon">
      <img src="icons/lock.png" class="lock-icon" />
      <input type="password" :placeholder="t('Passwort', 'Password')" v-model="password" />
    </div>

    <div class="input-with-icon">
      <img src="icons/lock.png" class="lock-icon" />
      <input type="password" :placeholder="t('Passwort wiederholen', 'Repeat password')" v-model="repeatPassword" />
    </div>

      <button @click="register">{{ t('Registrieren', 'Register') }}</button>
      <p class="link" @click="$emit('switchMode')">
        {{ t('Bereits registriert? Zum Login', 'Already registered? Login here') }}
      </p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  `,
  
  data() {
    return {
      email: '',
      password: '',
      repeatPassword: '',
      errorMessage: ''
    };
  },
  methods: {
    t,
    async register() {
      this.errorMessage = '';
      if (!this.email || !this.password || !this.repeatPassword) {
        this.errorMessage = t('Bitte alle Felder ausfüllen.', 'Please fill in all fields.');
        return;
      }
      if (this.password !== this.repeatPassword) {
        this.errorMessage = t('Passwörter stimmen nicht überein.', 'Passwords do not match.');
        return;
      }
      const hashed = CryptoJS.SHA256(this.password).toString();
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: hashed })
        });
        const data = await res.json();
        if (data.success) {
          window.location.href = '/startenseite?erklaermodus=true';
        } else {
          if (data.message === 'Email already registered') {
            this.errorMessage = t(
              'Diese E-Mail ist bereits registriert. Bitte einloggen.',
              'This email is already registered. Please log in.'
            );
          } else {
            this.errorMessage = data.message || t('Registrierung nicht erfolgreich.', 'Registration failed.');
          }
        }
      } catch {
        this.errorMessage = t('Fehler bei der Registrierung.', 'Error during registration.');
      }
    }
  }
};

// === Auth Wrapper ===
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
    toggleForm() {
      this.isLogin = !this.isLogin;
    }
  }
};

// === Mount App ===
const app = Vue.createApp(AuthWrapper);
app.component('LanguageSwitcher', LanguageSwitcher);
app.mount('#app');
