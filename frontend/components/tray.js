/**
 * SystemTray Item & (Main-)Menu
 */

const { app, Menu, Tray, Notification, BrowserWindow } = require('electron');
const path = require('path');

module.exports = {
    createWithDelegate,
}

let created = false;
let appDelegate = null;
let contextMenu = null;
let tray = null;

function createWithDelegate(delegate) {
    if (!created) {
        appDelegate = delegate;
        tray = new Tray('./frontend/resources/icons/icons8-traffic-jam-24.png');
        tray.setToolTip(appDelegate.getProductName());
        contextMenu = buildMainMenu();
        tray.setContextMenu(contextMenu);
        if (process.platform === 'win32') {
            tray.on('click', appDelegate.activateWindow);
        }
        created = true;
        return tray;
    }
}

function buildMainMenu() {
    return Menu.buildFromTemplate([{
            label: appDelegate.getProductName(),
            sublabel: appDelegate.getProductVersionString(),
            icon: appDelegate.getProductIcon(),
            click() { appDelegate.activateWindow() }
        },
        { type: 'separator' },
        {
            id: 'toggleSystemNotifications',
            label: 'Display notifications',
            type: 'checkbox',
            click() { appDelegate.toggleSystemNotifications() },
            checked: true
        },
        {
            label: 'Developer Tools (Local Window)',
            click() { appDelegate.openBrowserWindowDeveloperTools() }
        },
        { type: 'separator' },
        /*{ label: 'Controller Service (WS): Running (0 Clients)', enabled: false },
        { label: 'Content Service (HTTP): Running (0 Clients)', enabled: false },
        { type: 'separator' },
        {
            label: 'Open Client (Viewer) locally', submenu: [
                {
                    label: 'MobileApp',
                    click() { appDelegate.launchBrowserForClient('mobileapp') }
                },
                {
                    label: 'HU/Infotainment-Display (InCar)',
                    click() { appDelegate.launchBrowserForClient('car-hu') }
                }
            ]
        },*/
        {
            label: 'Quit',
            click() { appDelegate.quitApplication() }
        }
    ]);
}