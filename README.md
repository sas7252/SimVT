# Sim-VT (BA sas7252)

Sim-VT (Simulate Vehicle Teleoperation) is a simulation environment originally created for a university research project about  teleoperation in 2020 (See [here](https://github.com/THI-SS2020-STUD-G6/SimVT) for more info). The software was then/now modified to be used in a user study for my bachelor thesis. The project is build on electron/nodeJS and includes a webclient, a webserver (to serve the client) and a backend build on nodeJS/javascript. Communication happens in realtime via websockets. 

The webclient acts as the cars infotainment screen. It can be used to request remote driving assistance or display alerts on problematic driving behaviour. The backend provides a one-man teleoperation call center.


## What does this project contain/offer?
* (Mocked) __Car Infotainment-Screen__ for requesting & offering teleoperation
* a really basic webapp to test websockets functionallity
* __buildin web server__ for hosting previously the webclient and a rest api
* __buildin websockets server__ is used for sending commands and request signals from/to webclient/backend
* an __Admin-UI__ for the backend in an electron provided (local) window

## Getting started

### Regarding code quality
The code in this repository was quickly hacked together and should not be used (directly or as reference) for any serious production work.
Testing was only done within the parameters of our study setup (which is not documented here). You can still use this code if you want though. (You have been warned!)

### Workspace setup

No binaries are provided. You will therefore have to setup a full development workspace.
> Make sure you have NodeJS + npm installed before you start!

#### First-Time-Use Preparations
1. Clone this project to the preferred location
2. Run `npm install` to install the required nodejs modules


#### Running the software
*  just run `npm start` and you should be good to go:
   * The local __Admin-UI__ for the Teleoperator Call Center will open in a new window  
   *  The buildin webserver should be available at `http://localhost:8080` locally and over the network _(using the computers ip adress)_
      * The Car Infotainment is located at `http://server_ip:8080/car`
      * The WebSockets-Test-Client is locates at `http://server_ip:8080/ws-test`. It will by default point to the websockets server at `ws://server_ip:8081`

*  "terminating" the software. (But you can for sure do so by just hitting `ctrl+c` inside your console window). The proper way to do this would be to right-click the programs´s icon in you systems menubar and choosing 'Quit' form the context-menu.

## Developer Insights

### Technologies
* Nod4JS v14 LTS(and npm)
* ElectronJS / 'electron' 8
* Pure (vanilla) javascript (yep, no fancy typescript stuff here)
* ExpressJS (as buildin webserver / for rest api)
* WS (Websocket) module for nodeJS 

### Project Structure
The project structure may not be self explanatory. Therefore we would like to give you a quick overview:

* `/frontend` contains the _(electron based)_ frontend for the __Admin-UI__
* `/server` contains the server code. 
  * The main `index.js` file just acts as a service controller for the actual server-modules inside the `./services` directory:
    * `contentService.js` - static webserver (using _expressjs_) that exposes the subdirectory `./data/clients` via (insecure) http on port `8080`. This exposed clients directory contains:
      * `./car/*` the (mocked) "Car-Infortainment" Screen
      * `./ws-test/*`the websockets test client
      * `./shared/assets/*` contains assets that are reused in different webapps like 
        * `./css`-stylesheets (and fonts-stylesheets), 
        * `./images`.
        * `./javascript`-files
          * `webui.js` that contains the main `app` code for the mocked clients. Their individual app.js files will implement/overwrite certain functions in this file
          * `./lib` contains additional libraries/frameworks (like jQuery) from other vendors
     * `signalService.js` - websockets server (using _ws_ module) that runs on port `8081`
* `appController.js` is the main script/controller for the entire simulation environment. It contains "glue code" for the backends Admin-UI, starts/stops the services and acts as delegate for incomming (websocket) signals/messages.
* `main.js` is the entry/startup script to the simulation environment.


## People & Background

* Samuel Schreiber aka. [samyLS](https://www.samyls.net)
  UXD (User Experience Design) Student at University of Applied Sciences Ingolstadt (THI)

## License

No descicion has been made

### Included works of others

* Icons are from from [Icons8](https://icons8.com)
* Stock photos from [Pixabay](https://pixabay.com) as driver-personas:
  * https://pixabay.com/photos/beautiful-girl-smiling-young-woman-1687955/ (-> "Elenor Kaiser")
  * https://pixabay.com/photos/beard-face-man-model-mustache-1845166/ (-> "Jan Mayer")

* Sound-files (mp3) were produced by me
