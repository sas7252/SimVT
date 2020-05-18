const textviewConsole = document.getElementById('uiTextView_console');

const { ipcRenderer } = require('electron');


/*
function addMessageToWindowConsole(message, color) {
    var currentDate = '[' + new Date().toLocaleString() + '] ';
    var pre = document.createElement("p");
    pre.innerHTML = currentDate + message;
    pre.style.color = color;
    textviewConsole.appendChild(pre);
}

const buttonSendMessage = document.getElementById('uiButton_sendMessage');
const textfieldMessage = document.getElementById('uiTextfield_message');

textfieldMessage.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        buttonSendMessage.click();
    }
});

buttonSendMessage.addEventListener("click", function() {
    message = textfieldMessage.value;
    textfieldMessage.value = "";
    ipcRenderer.send('asynchronous-message', message);
})

*/

mx = {

}