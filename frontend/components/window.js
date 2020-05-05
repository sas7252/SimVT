/**
 * BrowserWindow
 */

const { BrowserWindow } = require('electron');

module.exports = {
    createWithDelegate,
    getBrowserWindow
}

let created = false;
let appDelegate = null;
let quitNow = false;

let bWindow = null;

let defaults = {
    width: 1270,
    height: 800,
    title: "",
    transparent: false,
    icon: "",
    frame: false,
    webPreferences: {
        nodeIntegration: true
    }
}

function createWithDelegate(delegate) {
    if (!created) {
        appDelegate = delegate;
        defaults.icon = appDelegate.getProductIcon();
        defaults.title = appDelegate.getProductName();
        bWindow = new BrowserWindow(defaults);
        bWindow.setMenuBarVisibility(false);
        bWindow.loadFile('./frontend/resources/views/html/default.html');
        bWindow.on('close', function (event) {
            if (!quitNow) {
                event.preventDefault();
                bWindow.hide();
            }
        });
        created = true;
        return bWindow;
    }
}

function getBrowserWindow() {
    return bWindow;
}