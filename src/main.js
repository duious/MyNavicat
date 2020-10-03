import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import mysql from './util-mysql';
import setting from '../setting.json';
import message from './message';

const app = createApp(App);

app.config.devtools = true;
app.use(router);
app.use(message);
app.use(mysql);
app.mount('#app');
