
/**
 * Frontend
 */

const trayComponent = require('./components/tray');
const windComponent = require('./components/window');

module.exports = {
    createWithDelegate,
    getMainMenu,
    getWindow,
    destroy
}

mainMenu = null;
window = null;
created = false;

function createWithDelegate(delegate) {
    if (!created) {
        mainMenu = trayComponent.createWithDelegate(delegate);
        window = windComponent.createWithDelegate(delegate);
        created = true;
        console.log("Frontend initialized");
    }
}

function getMainMenu() {
    return mainMenu;
}

function getWindow() {
    return window;
}

function destroy() {
    mainMenu.destroy();
    window.destroy();
}