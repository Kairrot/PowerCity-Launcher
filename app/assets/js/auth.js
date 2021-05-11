const { ipcRenderer } = require('electron');
const fetch = require('node-fetch');

var getFetchOptions = {
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'node-minecraft-protocol'
    }
}

async function authMicrosoft(options) {
    let accessToken;

    const XboxAuthResponse = await ipcRenderer.invoke('auth', options);
    if(!XboxAuthResponse) return null;

    try {
        const MineServicesResponse = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
            method: 'post',
            ...getFetchOptions,
            body: JSON.stringify({ identityToken: `XBL3.0 x=${XboxAuthResponse.userHash};${XboxAuthResponse.XSTSToken}` })
        }).then(checkStatus)

        getFetchOptions.headers.Authorization = `Bearer ${MineServicesResponse.access_token}`
        const MineEntitlements = await fetch('https://api.minecraftservices.com/entitlements/mcstore', getFetchOptions).then(checkStatus)
        if (MineEntitlements.items.length === 0) return null;

        accessToken = MineServicesResponse.access_token;
    } catch (err) { return null; }

    const user = await fetch('https://api.minecraftservices.com/minecraft/profile', getFetchOptions).then(checkStatus);
    return {
        accessToken: accessToken,
        selectedProfile: user,
    }
};

async function authMojang(options) {
    const user = await (await fetch('https://authserver.mojang.com/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            agent: {
                name: 'Minecraft',
                version: 1,
            },
            username: options.username,
            password: options.password,
        })
    })).json();

    if(user.error) return null;
    else return {
        clientToken: user.clientToken,
        accessToken: user.accessToken,
        selectedProfile: {
            id: user.selectedProfile.id,
            name: user.selectedProfile.name,
        }
    }
}

async function auth(options) {
    const mojang = await authMojang(options);
    if(mojang) return mojang;
    else return await authMicrosoft(options)
}

module.exports = {
    authMicrosoft,
    authMojang,
    auth,
}




function checkStatus (res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res.json()
    } else {
        throw Error(res.statusText)
    }
}