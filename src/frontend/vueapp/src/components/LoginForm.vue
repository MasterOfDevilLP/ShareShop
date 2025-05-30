<!-- cd /ShareShop/src/frontend/vueapp
npm install
npm run dev -->
<template>
  <div class="auth-form">
    <h2>{{ language === 'de' ? 'Login' : 'Sign In' }}</h2>

    <!-- Language Toggle Buttons -->
    <div class="lang-buttons">
      <button :class="{ active: language === 'de' }" @click="setLanguage('de')">🇩🇪 DE</button>
      <button :class="{ active: language === 'en' }" @click="setLanguage('en')">🇬🇧 EN</button>
    </div>

    <!-- Username -->
    <input
      type="text"
      :placeholder="language === 'de' ? 'Benutzername' : 'Username'"
      v-model="username"
    />

    <!-- Password -->
    <input
      type="password"
      :placeholder="language === 'de' ? 'Passwort' : 'Password'"
      v-model="password"
    />

    <!-- Login Button -->
    <button @click="login">
      {{ language === 'de' ? 'Einloggen' : 'Log In' }}
    </button>

    <!-- Switch to Register -->
    <p class="link" @click="$emit('switchMode')">
      {{ language === 'de' ? 'Noch kein Account? Jetzt registrieren' : 'No account? Register here' }}
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      language: 'de', // default language
    };
  },
  methods: {
    setLanguage(lang) {
      this.language = lang;
    },
    login() {
      console.log('Login:', this.username, this.password, 'Language:', this.language);
      // Call backend here
    }
  }
};
</script>

<style scoped>
/* Container mit Figma-Styles (frame) */
.auth-form {
  display: flex;
  width: 240px;
  flex-direction: column;
  gap: 16px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Eingabeboxen – aus Figma */
.input-box {
  display: flex;
  flex-direction: column;
  width: 240px;
  align-items: flex-start;
  gap: 8px;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* Login-Button */
button {
  width: 100%;
  padding: 10px;
  color: white;
border-radius: 8px;
border: var(--sds-size-stroke-border) solid var(--sds-color-border-default-default);
background: #7DCFB6;
font-weight: bold;
  cursor: pointer;
}

/* Sprachumschalter */
.lang-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 8px;
}

.lang-buttons button {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  background-color: #eee;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.lang-buttons .active {
  background-color: #3b82f6;
  color: white;
  border: none;
}

/* Registrierung-Link */
.link {
  text-align: center;
  width: 100%;
  margin-top: 12px;
  color: #2563eb;
  cursor: pointer;
}
</style>


