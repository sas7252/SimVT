# STUD-2020-Sim-VT

Sim-VT is a simulation environment used in our (see [People](#people--background)) study about the interaction between a teleoperator and  an actual driver in a remote vehicle operation scenario. The simulation basically consists of two webclients and a 'backend'. One webclient mocks a smarphone app that can be used to request/order remote vehicle operation service, while the other weblient acts as the cars infotainment screen. Communication between the apps and the server works via websockets. The 'backend' it self has a nice ui to view the network messages and send commands to the clients. 


## What does this project contain/offer?
* (Mocked) __Smartphone-App "DriveMe"__ for ordering remote vehicle operation services.
* (Mocked) __Car Infotainment-Screen__ (to understand interaction between teleoperator & driver in the car)
* a really basic webapp to test websockets functionallity _(pretty much the only thing that might also be usefull for other projects)_
* __buildin web server__ for hosting previously mentiones webapps and a rest api
* __buildin websockets server__ is used for sending commands and request signals
* an __Admin-UI__ for the backend in it´s own local window

## Getting started

### Regarding code quality
The code in this repository was quickly hacked together and should not be used (directly or as reference) for any serious production work.
Testing was only done within the parameters of our study setup (which is not documented here). You can still use this code if you want though. (You have been warned!)

### Workspace setup

We do not provide any binaries. You will therefore have to setup a full development workspace.
> Make sure you have NodeJS + npm installed before you start!

#### First-Time-Use Preparations
1. Clone this project to the preferred location
2. Run `npm install` to install the required nodejs modules


#### Running the software
*  just run `npm start` and you should be good to go:
   * The local __Admin-UI__ for the backend will open in a new window  
   *  The buildin webserver should be available at `http://localhost:8080` locally and over the network _(using the computers ip adress)_
      * The DriveMe-App is located at `http://server_ip:8080/app`
      * The Car Infotainment is located at `http://server_ip:8080/car`
      * The WebSockets-Test-Client is locates at `http://server_ip:8080/ws-test`. It will by default point to the websockets server at `ws://server_ip:8081`

*  We discourage just "terminating" the software. (But you can for sure do so by just hitting `ctrl+c` inside your console window). The proper way to do this would be to right-click the programs´s icon in you systems menubar and choosing 'Quit' form the context-menu.

## Developer Insights

### Technologies
We use:
* NodeJS v12.4 (and npm)
* ElectronJS aka 'electron'
* Pure (vanilla) javascript (yep, sandly no fancy typescript stuff)
* ExpressJS
* WS (Websocket) module for nodeJS 

### Project Structure
The project structure may not be self explanatory. Therefore we would like to give you a quick overview:

* `/frontend` contains the _(electron based)_ frontend for the __Admin-UI__
* `/server` contains the server code. 
  * The main `index.js` file just acts as a service controller for the actual server-modules inside the `./services` directory:
    * `contentService.js` - static webserver (using _expressjs_) that exposes the subdirectory `./data/clients` via (insecure) http on port `8080`. This exposed clients directory contains:
      * `./app/*` the (mocked) "DriveMe"-SmartphoneApp
      * `./car/*` the (mocked) "Car-Infortainment" Screen
      * `./ws-test/*`the websockets test client
      * `./shared/assets/*` contains assets that are reused in different webapps like 
        * `./fonts` (.woff2), 
        * `./css`-stylesheets (and fonts-stylesheets), 
        * `./images`.
        * `./javascript`-files
          * `webui.js` that contains the main `app` code for the mocked clients. Their individual app.js files will implement/overwrite certain functions in this file
          * `./lib` contains additional libraries/frameworks (like jQuery) from other vendors
     * `signalService.js` - websockets server (using _ws_ module) that runs on port `8081`
* `appController.js` is the main script/controller for the entire simulation environment. It contains "glue code" for the backends Admin-UI, starts/stops the services and acts as delegate for incomming (websocket) signals/messages.
* `main.js` is the entry/startup script to the simulation environment.

### Take-Aways

-> Do not use pure (vanilla) javascript for things like this. If we had to do it again, we would go with typescript.

## People & Background

* Samuel Schreiber aka. [samyLS](https://www.samyls.net)
* Lena Stütz 
* Veronica Hartl

## License