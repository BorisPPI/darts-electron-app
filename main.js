const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

// Different base URLs
const baseUrls = {
    left: 'http://192.168.100.103:8080',
    right: 'http://192.168.50.94:8080',
};

// Function to handle API requests
async function apiRequest(baseUrl, endpoint) {
    const url = `${baseUrl}/${endpoint}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`HTTP ${error.response.status}: ${error.response.data}`);
        } else {
            throw new Error(`Network Error: ${error.message}`);
        }
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadFile('index.html');

    // IPC Handlers for different endpoints
    ipcMain.handle('lock-left', async () => {
        return await apiRequest(baseUrls.left, 'lock');
    });

    ipcMain.handle('unlock-left', async () => {
        return await apiRequest(baseUrls.left, 'unlock');
    });

    ipcMain.handle('lock-right', async () => {
        return await apiRequest(baseUrls.right, 'lock');
    });

    ipcMain.handle('unlock-right', async () => {
        return await apiRequest(baseUrls.right, 'unlock');
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
