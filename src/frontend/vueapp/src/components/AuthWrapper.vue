<template>
    <div class="auth-wrapper">
        <component :is="isLogin ? 'LoginForm' : 'RegisterForm'" @switchMode="toggleForm" />
    </div>
</template>

<script>
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';

export default {
    components: { LoginForm, RegisterForm },
    data(){
        return {
            isLogin: true
        };
    },
    methods: {
        toggleForm(){
            this.isLogin =!this.isLogin;
        }
    }
};
</script>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
}
</style>