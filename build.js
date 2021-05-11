const builder = require('electron-builder');
const Platform = builder.Platform;

function getPlatform(){
    switch(process.argv[2]){
        case 'win':
            return Platform.WINDOWS
        case 'darwin':
            return Platform.MAC
        case 'linux':
            return Platform.LINUX
        default:
            console.error('Cannot resolve current platform!')
            return undefined
    }
}

builder.build({
    targets: getPlatform().createTarget(),
    config: {
        appId: 'powercity-launcher',
        productName: 'PowerCity-Launcher',
        artifactName: '${productName}-${version}.${ext}',
        directories: {
            buildResources: 'build',
            output: 'dist'
        },
        win: {
            target: [
                {
                    target: 'nsis',
                    arch: 'x64'
                }
            ]
        },
        nsis: {
            oneClick: false,
            perMachine: false,
            allowElevation: true,
            allowToChangeInstallationDirectory: true
        },
        mac: {
            target: 'dmg',
            category: 'public.app-category.games'
        },
        linux: {
            target: 'AppImage',
            maintainer: 'Kairrot',
            description: 'Launcher de PowerCity',
            category: 'Game'
        },
        compression: 'maximum',
        publish: [{
            provider: 'github',
            owner: 'Kairrot',
            repo: 'powercity-launcher'
        }]
    }
}).then(() => {
    console.log('Build complete')
})