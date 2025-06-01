const RegisterForm = {
  template: `
    <div class="auth-form">
      <h2>{{ language === 'de' ? 'Registrieren' : 'Register' }}</h2>

      <div class="lang-buttons">
        <button :class="{ active: language === 'de' }" @click="language = 'de'">🇩🇪 DE</button>
        <button :class="{ active: language === 'en' }" @click="language = 'en'">🇬🇧 EN</button>
      </div>

      <input type="email" :placeholder="language === 'de' ? 'E-Mail' : 'Email'" v-model="email" />
      <input type="password" :placeholder="language === 'de' ? 'Passwort' : 'Password'" v-model="password" />
      <input type="password" :placeholder="language === 'de' ? 'Passwort wiederholen' : 'Repeat password'" v-model="repeatPassword" />

      <button @click="register">{{ language === 'de' ? 'Registrieren' : 'Register' }}</button>

      <p class="link" @click="$emit('switchMode')">
        {{ language === 'de' ? 'Bereits registriert? Zum Login' : 'Already registered? Login here' }}
      </p>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      repeatPassword: '',
      language: 'de',
      errorMessage: ''
    };
  },
  methods: {
    async register() {
      this.errorMessage = '';
      if (!this.email || !this.password || !this.repeatPassword) {
        this.errorMessage = this.language === 'de' ? 'Bitte alle Felder ausfüllen.' : 'Please fill in all fields.';
        return;
      }
      if (this.password !== this.repeatPassword) {
        this.errorMessage = this.language === 'de' ? 'Passwörter stimmen nicht überein.' : 'Passwords do not match.';
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
          window.location.href = '/dashboard?tutorial=true';
        } else {
          this.errorMessage = data.message || (this.language === 'de' ? 'Registrierung nicht erfolgreich.' : 'Registration failed.');
        }
      } catch (err) {
        this.errorMessage = this.language === 'de' ? 'Fehler bei der Registrierung.' : 'Error during registration.';
      }
    }
  }
};
