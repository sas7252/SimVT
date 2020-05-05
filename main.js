
    const {app} = require('electron');
    const appController = require('./appController');
    const appInfo = require('./app.properties.json');
    
    //Overwrite default log-function
    console.logCopy = console.log.bind(console);
    
    console.log = function(data)
    {
        var currentDate = '[' + new Date().toLocaleString() + '] ';
        this.logCopy(currentDate, data);
    };
    
    let didLaunch = false;
    let ready = true
    
    function launch() {
        if (!didLaunch && ready) {
            ready = false;
            console.log("Launching " + appInfo.productName + " " + appInfo.productVersionString);
            appController.initWithProperties(appInfo);
            didLaunch = true;
            ready = true;
        }
    }
    
    app.whenReady().then(launch);