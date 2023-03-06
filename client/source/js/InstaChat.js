/**
 * Created by keith on 2016-12-28.
 */
/*jshint esnext: true */
/* jshint latedef:nofunc */
let config = require("./config.json");
let Zindex = require("./zIndex.js");
function InstaChat(container) {

    let template = document.querySelector("#chat");                                 //Building up the chat window

    this.chatDiv = document.importNode(template.content.firstElementChild, true);

    this.chatDiv.addEventListener("keypress", function(event) {                      //adding a event listerner
        if (event.keyCode === 13) {                                                 //when enter key is pressed
            this.sendMessage(event.target.value);                                   //the value of the text field i passed
            event.target.value = "";

            event.preventDefault();
        }
    }.bind(this));

    container.appendChild(this.chatDiv);
    this.getHistory();      //gets the latest history messages
    this.connect();        //connecting
    this.userName();
}

InstaChat.prototype.connect = function() {

    return new Promise(function(resolve, reject) {              //A promise is either fulfilled or rejected not pending
        if (this.socket && this.socket.readyState === 1) {
            resolve(this.socket);
            return;
        }

        this.socket = new WebSocket(config.address);            //creating a new session with an adress from JSON config file

        this.socket.addEventListener("open", function() {        //open line connection
            resolve(this.socket);
        }.bind(this));

        this.socket.addEventListener("error", function(event) {     //listen for errors in the connection
            reject(new Error("Couled not connect"));
        }.bind(this));

        this.socket.addEventListener("message", function(event) {       //listen for messages from the connection
            let message = JSON.parse(event.data);
            if (message.type === "message") {           //chosing to only listen to this type of message
                this.printMessage(message);             //Passing the message to print function
            }

        }.bind(this));

    }.bind(this));

};

InstaChat.prototype.sendMessage = function(text) {

    let user = this.userName();                  //getting the last known user name used or promting
    let data = {
        type: "message",
        data: text,
        username: user,                     //setting up a config object
        channel: "",
        key: config.key
    };

    this.connect().then(function(socket) {      //if open line then sending the data as JSOON string
        socket.send(JSON.stringify(data));
    }).catch(function(error) {                      //catching appels
        console.log("Something went wrong", error);
    });

};

InstaChat.prototype.printMessage = function(message) {
    let template = this.chatDiv.querySelectorAll("template")[0];
    let messageDiv = document.importNode(template.content.firstElementChild, true);

    messageDiv.querySelectorAll(".text")[0].textContent = message.data;             //printing out the message user and data
    messageDiv.querySelectorAll(".author")[0].textContent = message.username;       //to the chat element

    this.chatDiv.querySelectorAll(".messages")[0].appendChild(messageDiv);
    let objDiv = this.chatDiv.querySelector(".messages");
    objDiv.scrollTop = objDiv.scrollHeight;

    this.setHistory(message);                                   //also passing the message throw so we can store it
};

InstaChat.prototype.setHistory = function(message) {
    let history = {
                user: message.username,                         //saving all the messages as JSON object in localstorage
                data: message.data
            };
    let oldItems = JSON.parse(localStorage.getItem("instachanel")) || [];
    if (oldItems[oldItems.length - 1].username !== history.username ||
        oldItems[oldItems.length - 1].data !== history.data) {
        oldItems.push(history);
    }

    localStorage.setItem("instachanel", JSON.stringify(oldItems));
};

InstaChat.prototype.getHistory = function(howMany = 20) {           //default value of retrieving and print out the old
    let get = JSON.parse(localStorage.getItem("instachanel"));      //stored messages
    let template = this.chatDiv.querySelectorAll("template")[0];
    if (get !== null) {
        if (howMany > get.length) {
            howMany = get.length;
        }
    }else {
        howMany = 0;
    }

    for (let i = howMany; i > 0; i -= 1) {
        let messageDiv = document.importNode(template.content.firstElementChild, true);
        messageDiv.querySelectorAll(".text")[0].textContent = get[get.length - i].data;
        messageDiv.querySelectorAll(".author")[0].textContent = get[get.length - i].user;
        this.chatDiv.querySelectorAll(".messages")[0].appendChild(messageDiv);
    }

    let objDiv = this.chatDiv.querySelector(".messages");
    objDiv.scrollTop = objDiv.scrollHeight;
};

InstaChat.prototype.ReStart = function(source) {
    let top = source.offsetTop;                                             //Restart function that is cloning a new
    let left = source.offsetLeft;                                           //node and deleting the old one
    source.parentNode.removeChild(source);
    let app = document.querySelector("#appContainer");
    let chatContainer = app.querySelector("#chatContainer").cloneNode(true);
    let template = document.querySelector("#menuBar");
    let menuBar = document.importNode(template.content.firstElementChild, true);
    document.querySelector("#play").appendChild(chatContainer);
    chatContainer.appendChild(menuBar.cloneNode(true));
    chatContainer.style.top = top + "px";
    chatContainer.style.left = left + "px";
    chatContainer.style.zIndex = Zindex();
    chatContainer.style.visibility = "visible";
    new InstaChat(chatContainer);                   //new session
};

InstaChat.prototype.userName = function() {
    let user = JSON.parse(localStorage.getItem("namn"));
    if (user === null) {
        this.chatConfig(event);
    }else if (/^[a-zA-Z]/.test(user)) {                       //validating the user name input
        return user;
    }else {
        this.chatConfig(event);
    }
};

InstaChat.prototype.chatConfig = function(event) {
    let source = event.target.parentNode.parentNode;
    let user;
    source.querySelector("#chatConfig").style.display = "block";
    source.querySelector("#chatConfig").style.visibility = "visible";
    source.querySelector("form").addEventListener("submit", submit, false);     //listen on new user name input

    function submit(event) {
        event.preventDefault();
        source.querySelector("#chatConfig").style.display = "none";
        user = source.querySelector("#userName").value;
        localStorage.setItem("namn", JSON.stringify(user));
        source.querySelector("#chatConfig").style.display = "none";
        source.querySelector("form").removeEventListener("submit", submit);
    }
};

module.exports = InstaChat;
