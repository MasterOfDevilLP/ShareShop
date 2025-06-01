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

Vue.createApp(AuthWrapper).mount('#app');
