
/**
 *    Connect UI-Elements
 */

const textfieldServerAddress = document.getElementById('uiTextfield_serverAddress');
const textfieldMessage = document.getElementById('uiTextfield_message');
const textviewConsole = document.getElementById('uiTextview_console');

const textlabelStatus = document.getElementById('uiTextlabel_status');

const buttonConnect = document.getElementById('uiButton_connect');
const buttonDisconnect = document.getElementById('uiButton_disconnect');
const buttonSendMessage = document.getElementById('uiButton_sendMessage');


textfieldMessage.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    buttonSendMessage.click();
  }
}); 

/**
 *    Wire up the buttons
 */

buttonConnect.addEventListener("click", function() {
    serverAddress = textfieldServerAddress.value;
    connect(serverAddress);
});

buttonDisconnect.addEventListener("click", function() {
    disconnect();
});

buttonSendMessage.addEventListener("click", function() {
    message = textfieldMessage.value;
    textfieldMessage.value = "";
    sendMessage(message);
})

let websocket;

function connect(serverAddress) {
  buttonConnect.setAttribute("disabled", true)
  textfieldServerAddress.setAttribute("readonly", true);
  textfieldServerAddress.setAttribute("disabled", true);
  textlabelStatus.innerHTML = "Connecting..."
  websocket = new WebSocket(serverAddress);
  websocket.onopen = function(evt) { onWsOpen(evt) };
  websocket.onclose = function(evt) { onWsClose(evt) };
  websocket.onmessage = function(evt) { onWsMessage(evt) };
  websocket.onerror = function(evt) { onWsError(evt) };
}

function disconnect() {
  websocket.close();
}

function sendMessage(message) {
  writeToConsole("SENT: " + message, "white");
  websocket.send(message);
}

function init() {
  textfieldServerAddress.value = "ws://" + location.hostname + ":8081";
}



window.addEventListener("load", init, false);

function onWsOpen(evt)
{
  buttonDisconnect.removeAttribute("disabled");
  buttonSendMessage.removeAttribute("disabled");
  textlabelStatus.innerHTML = "Connected";
  writeToConsole("CONNECTED", "orange");
}

function onWsClose(evt)
{
  writeToConsole("DISCONNECTED", "orange");
  buttonConnect.removeAttribute("disabled");
  buttonDisconnect.setAttribute("disabled", true);
  buttonSendMessage.setAttribute("disabled", true);
  textfieldServerAddress.removeAttribute("readonly");
  textfieldServerAddress.removeAttribute("disabled");
  textlabelStatus.innerHTML = ""
}

function onWsMessage(evt)
{
  writeToConsole('RESPONSE: ' + evt.data, "green");
}

function onWsError(evt)
{
  writeToConsole('ERROR: ' + evt.data, "red");
}

function writeToConsole(message, color)
{
  var currentDate = '[' + new Date().toLocaleString() + '] ';
  var pre = document.createElement("p");
  pre.innerHTML = currentDate + message;
  pre.style.color = color; 
  textviewConsole.appendChild(pre);
}

window.addEventListener("load", init, false);

//hasFocus()