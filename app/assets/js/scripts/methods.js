const { remote, ipcRenderer, shell } = require('electron')
const getAppdataPath = require('appdata-path');
const SmoothScroll = require('../smooth-scroll');
const auth = require('../auth');
const store = remote.getGlobal('store')

module.exports = {
    switchView(view) {
        this.view = view;
        if(view === 'landing') {
            setTimeout(() => {
                const scroll = new SmoothScroll(document.querySelector('.news'));
                scroll.init();
            },10)
        }
    },
    switchSettings(view) {
        this.settings = view;
    },

    close() {
        remote.getCurrentWindow().close();
    },


    loginUser(el) {
        el.target.classList.add('loading');
        (async () => {
            const user = await auth.auth({
                username: this.login.username,
                password: this.login.password,
            })

            el.target.classList.remove('loading');
            if(!user) {
                el.target.style.animation = 'shakeX 1s'
                el.target.style.transition = '.2s'
                el.target.style.color = '#ce1212'

                el.target.addEventListener('animationend', event => {
                    el.target.style.animation = ''
                    el.target.style.color = ''
                })
            } else {
                store.set('isLogged', true)
                store.set('credentials', {
                    username: this.login.username,
                    password: this.login.password,
                })

                this.user = {
                    name: user.selectedProfile.name,
                    id: user.selectedProfile.id,
                }
                this.loadAllFromUser();
                this.switchView('landing')
            }
        })();
    },
    loadAllFromUser() {
        this.user.skin = 'https://crafatar.com/renders/body/' + this.user.id;
    },
    disconnectUser() {
      store.set('credentials', null)
      store.set('isLogged', false);

      this.login =  {
          username: '',
          password: '',
      };
      this.user = null;
      this.switchView('login')
    },


    play() {
        require('../play')(this);
    },

    updateApp() {
        ipcRenderer.send('update')
    },


    triggerEnter(event) {
        if(event.key === 'Enter') {
            document.getElementById(event.target.dataset['button']).click();
        }
    },
    rangeSlider(event) {
        if(event.target.dataset['config'] === 'minRam') {
            if(event.target.value <= this.config.maxRam) {
                this.config[event.target.dataset['config']] = event.target.value;
                store.set(event.target.dataset['config'], event.target.value);
            } else event.target.value = this.config.minRam
        } else {
            if(event.target.value >= this.config.minRam) {
                this.config[event.target.dataset['config']] = event.target.value;
                store.set(event.target.dataset['config'], event.target.value);
            } else event.target.value = this.config.maxRam
        }
    },
    openExternal(url) {
        shell.openExternal(url)
    }
}