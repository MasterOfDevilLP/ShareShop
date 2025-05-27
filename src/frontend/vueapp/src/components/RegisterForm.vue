<template>
    <div class="auth-form">
        <h2>Registrieren</h2>

        <input 
        type="email"
        placeholder="E-Mail"
        v-model="email"
        />

        <input 
        type="password"
        placeholder="Passwort"
        v-model="password"
        />

        <input 
        type="password"
        placeholder="Passwort wiederholen"
        v-model="repeatPassword"
        />

        <button @click="register">Registrieren</button>

        <p class="link" @click="$emit('switchMode')">
            Bereits registriert? Zum Login
        </p>
    </div>
</template>

<script>
export default {
    data(){
        return{
            email: '',
            password: '',
            repeatPassword: '',
        };
    },
    methods: {
        register(){
            if(this.password !== this.repeatPassword){
                alert('Passwörter stimmen nicht überein');
                return;
            }
            console.log('Registrieren:', this.email);
            this.$emit('switchMode'); //Zurück zum Login
        }
    }
};
</script>

<style scoped>
/* Same styles as LoginForm.vue */
.auth-form {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
input {
  width: 100%;
  margin: 8px 0;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
}
.link {
  text-align: center;
  margin-top: 12px;
  color: #2563eb;
  cursor: pointer;
}
</style>