const { Client, Authenticator } = require('minecraft-launcher-core');
const getAppdataPath = require('appdata-path');
const electron = require('electron')
const http = require('http');
const fs = require('fs');
const sha1 = require('sha1-file');
const rimraf = require('rimraf');
const unzip = require('unzipper');

const launcher = new Client();

module.exports = (vue) => {
    (async () => {
        const folder = getAppdataPath('.pixelcity')
        fs.mkdirSync(folder, {recursive: true}, () => {})
        document.getElementById('play').setAttribute('disabled', '')
        vue.progress.isVisible = true;
        vue.progress.info = "Vérification de java";

        // Get Config
        const config = await (await fetch('https://kairrot.inovaperf.me/launcher.json')).json();

        // Download JRE
        fs.mkdirSync(folder + '/jre', {recursive: true}, () => {})
        const onlineHash = await (await fetch((process.platform == 'win32') ? config.windows.sha1 : config.linux.sha1)).text();
        if(fs.existsSync(folder + '/jre/jre1.8.zip')) {
            const hash = sha1.sync(folder + '/jre/jre1.8.zip');
            if(hash != onlineHash) {
                rimraf.sync(folder + '/jre')
                await downloadJRE(vue, folder, config)
            }
        } else await downloadJRE(vue, folder, config)

        await fs.createReadStream(folder + '/jre/jre1.8.zip').pipe(unzip.Extract({path: folder})).promise();
        fs.chmodSync((process.platform == 'linux') ? folder + '/jre/bin/java' : folder + '/jre/bin/java.exe', '0777');

        // Minecraft
        vue.progress.value= 0;
        vue.progress.info = 'Vérification des fichiers de Minecraft';

        try {
            rimraf.sync(folder + '/minecraft/mods');
            rimraf.sync(folder + '/minecraft/config');
            fs.rmSync(folder + '/minecraft/forge.jar');
        } catch (e) {}

        launcher.launch({
            clientPackage: config.minecraft,
            authorization: {
                access_token: vue.user.accessToken,
                name: vue.user.name,
                uuid: vue.user.id,
                user_properties: [{"name": "preferredLanguage", "value": "fr-fr"}, {"name": "registrationCountry","value": "FR"}]
            },
            javaPath: (process.platform == 'linux') ? folder + '/jre/bin/java' : folder + '/jre/bin/java.exe',
            root: folder + '/minecraft',
            forge: folder + '/minecraft/forge.jar',
            version: {
                number: "1.16.5",
                type: "release"
            },
            memory: {
                min: vue.config.minRam + 'G',
                max: vue.config.maxRam + 'G'
            },
        });

        launcher.on('debug', (e) => console.log(e));
        launcher.on('progress', (e) => {
            switch (e.type) {
                case 'natives':
                    vue.progress.info = "Téléchargement des natives";
                    break;
                case 'classes-maven-custom':
                    vue.progress.info = "Téléchargement des classe modifiées de maven"
                    break;
                case 'classes-custom':
                    vue.progress.info = "Téléchargement des classes modifiées";
                    break;
                case 'classes':
                    vue.progress.info = "Téléchargement des classes";
                    break;
                case 'assets':
                    vue.progress.info = "Téléchargement des assets";
                    if(e.task == e.total) {
                        vue.progress.info = 'Lancement de Minecraft';
                    }
                    break;
            }
            vue.progress.value = Math.round((e.task / e.total) * 100);
        });
        launcher.on('data', (e) => {
            console.log(e);
            if(electron.remote.getCurrentWindow().isVisible()) {
                electron.remote.getCurrentWindow().hide();

                vue.progress = {
                    info: '',
                    value: 0,
                    isVisible: false,
                }

                document.getElementById('play').removeAttribute('disabled')

                launcher.on('close', () => {
                    electron.remote.getCurrentWindow().show()
                });
            }
        });
    })();
}

async function downloadJRE(vue, folder, config) {
    vue.progress.info = 'Téléchargement de Java';
    const file = fs.createWriteStream(folder + '/jre/jre1.8.zip');

    var url = (process.platform == 'win32') ? config.windows.jre : config.linux.jre;
    await new Promise(((resolve, reject) => {
        const request = http.get(url, response => {
            var downloader = 0;
            var len = parseInt(response.headers['content-length'], 10);
            response.on('data', chunk => {
                downloader += chunk.length
                vue.progress.value = Math.round((downloader / len) * 100)
            })

            response.on('end', () => {
                resolve()
            })

            response.pipe(file);
        })
    }))
}