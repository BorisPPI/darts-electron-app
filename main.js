const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const dgram = require('dgram');

// Variables for left and right devices
let leftDeviceIp = null;
let rightDeviceIp = null;

// Start a UDP server for discovery
const startUdpServer = () => {
    const udpServer = dgram.createSocket('udp4');

    udpServer.on('message', (msg, rinfo) => {
        try {
            const message = JSON.parse(msg.toString());
            if (message.type === 'Android' && message.ip) {
                const deviceName = message.device_name.toLowerCase();

                if (deviceName === 'left') {
                    // Always assign to the left device
                    if (leftDeviceIp !== message.ip) {
                        leftDeviceIp = message.ip;
                        console.log(`Left device IP updated: ${leftDeviceIp}`);
                    }
                } else if (deviceName === 'right') {
                    // Update the right device only if the value changes
                    if (rightDeviceIp !== message.ip) {
                        rightDeviceIp = message.ip;
                        console.log(`Right device IP updated: ${rightDeviceIp}`);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to parse UDP message:', error);
        }
    });

    udpServer.on('listening', () => {
        const address = udpServer.address();
        console.log(`UDP server listening on ${address.address}:${address.port}`);
    });

    udpServer.bind(9999, () => {
        udpServer.setBroadcast(true);
    });

    return udpServer;
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
        if (!leftDeviceIp) throw new Error('Left device not found');
        return await apiRequest(`http://${leftDeviceIp}:8080`, 'lock');
    });

    ipcMain.handle('unlock-left', async () => {
        if (!leftDeviceIp) throw new Error('Left device not found');
        return await apiRequest(`http://${leftDeviceIp}:8080`, 'unlock');
    });

    ipcMain.handle('lock-right', async () => {
        if (!rightDeviceIp) throw new Error('Right device not found');
        return await apiRequest(`http://${rightDeviceIp}:8080`, 'lock');
    });

    ipcMain.handle('unlock-right', async () => {
        if (!rightDeviceIp) throw new Error('Right device not found');
        return await apiRequest(`http://${rightDeviceIp}:8080`, 'unlock');
    });

    ipcMain.handle('get-devices', async () => {
        return {
            left: leftDeviceIp,
            right: rightDeviceIp,
        };
    });
}

app.whenReady().then(() => {
    startUdpServer();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
