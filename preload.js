const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    lockLeft: async () => await ipcRenderer.invoke('lock-left'),
    unlockLeft: async () => await ipcRenderer.invoke('unlock-left'),
    lockRight: async () => await ipcRenderer.invoke('lock-right'),
    unlockRight: async () => await ipcRenderer.invoke('unlock-right'),
});
