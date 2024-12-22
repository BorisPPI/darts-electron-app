document.getElementById('lock-btn').addEventListener('click', async () => {
    try {
        const result = await window.api.lockDevice();
        alert(`Lock Response: ${result}`);
    } catch (error) {
        alert(`Failed to lock device: ${error}`);
    }
});

document.getElementById('unlock-btn').addEventListener('click', async () => {
    try {
        const result = await window.api.unlockDevice();
        alert(`Unlock Response: ${result}`);
    } catch (error) {
        alert(`Failed to unlock device: ${error}`);
    }
});
