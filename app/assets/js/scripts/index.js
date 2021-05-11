const { remote , ipcRenderer} = require('electron');
const os = require('os')

const store = remote.getGlobal('store');
const methods = require('./assets/js/scripts/methods');
const auth = require('./assets/js/auth');

const vue = Vue.createApp({
    data() {
        return {
            view: null,
            settings: null,
            login: {
                username: '',
                password: '',
            },
            user: null,
            progress: {
                info: '',
                value: 0,
                isVisible: false,
            },
            update: {
                percentage: 0,
                ready: false,
            },
            config: {
                maxRamForAsign: Math.round(os.totalmem() / 1000000000 / 1.2),
            }
        }
    },
    methods,
    async mounted() {
        const loadConfig = (key, def) => {this.config[key] = (store.has(key)) ? store.get(key) : def;}
        loadConfig('minRam', 1);
        loadConfig('maxRam', 2);

        let i = 1;
        setInterval(() => {
            if(i > 7) i = 0;
            document.body.style.backgroundImage = 'url("./assets/images/backgrounds/' + i.toString() + '.jpg")';
            i++;
        }, 10000)

        if(!store.get('isWelcome')) {
            this.switchView('welcome');
            store.set('isWelcome', true)
        } else {
            if(!store.get('isLogged')) {
                this.switchView('login');
            } else {
                const user = await auth.auth({
                    username: store.get('credentials').username,
                    password: store.get('credentials').password,
                });

                if(!user) {
                    store.set('isLogged', false);
                    this.switchView('login');
                } else {
                    console.log(user)
                    this.user = {
                        name: user.selectedProfile.name,
                        id: user.selectedProfile.id,
                        accessToken: user.accessToken,
                    }
                    this.loadAllFromUser();
                    this.switchView('landing')
                }
            }
        }
        this.switchSettings('account')
    }
}).mount('#app');

function data() {
    console.log(vue);
}

/*ipcRenderer.on('update-available', (event, info) => {
    vue.update = {
        version: info.version,
    }
})*/

ipcRenderer.on('download-progress', (event, info) => {
    vue.update.percentage = info.percent;
})

ipcRenderer.on('update-downloaded', (event, info) => {
    vue.update.ready = true;
})