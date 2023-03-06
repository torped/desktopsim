(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./config.json":3,"./zIndex.js":9}],2:[function(require,module,exports){
/*jshint esnext: true */
/* jshint latedef:nofunc */
try {
    window.onload = function() {
        let memory = require("./memory.js");
        let InstaChat = require("./InstaChat.js");
        let EventListerner = require("./eventListerner.js");
        let Snake = require("./snake.js");
        let Offset = require("./offset.js");                                             //Starting point of this nested
        let Zindex = require("./zIndex.js");                                             //javaScript. Basically here I am
        let template = document.querySelector("#menuBar");                               //just declaring some variables
        let menuBar = document.importNode(template.content.firstElementChild, true);     //for the event listener that is
        let index = 0;                                                                   //listening on app icons
        let parent = document.querySelector("#appContainer");
        parent.addEventListener("click", launchApp, false);

        function launchApp(event) {
            if (event.target !== event.currentTarget) {                                 //the event function who decides what
                let clone = event.target.nextElementSibling.cloneNode(true);            //will happens next. it listen to
                document.querySelector("#play").appendChild(clone);                     //a click on any of the app icons.
                clone.appendChild(menuBar.cloneNode(true));
                clone.style.visibility = "visible";
                if (event.target.className === "snakeImg") {
                    Snake(clone);
                } else if (event.target.className === "memoryImg") {
                    memory.playMemory(clone);
                } else if (event.target.className === "chatImg") {
                    new InstaChat(clone);
                } else if (event.target.className === "crossImg") {
                    if (index === 0) {
                        clone.parentNode.removeChild(clone);
                        Offset.prototype.importante(clone);
                        index = 1;
                    } else {
                        location.reload();
                    }
                }

                clone.style.zIndex = Zindex();              //Also passing the event two other functions
                Offset(clone);                              //that is deciding how it will appear on the
            }                                               // the document.

            event.stopPropagation();
        }

        EventListerner();
    };
}catch (e) {
    console.log("Error: " + e.name);
}


},{"./InstaChat.js":1,"./eventListerner.js":4,"./memory.js":5,"./offset.js":6,"./snake.js":7,"./zIndex.js":9}],3:[function(require,module,exports){
module.exports={
  "address": "ws://vhost3.lnu.se:20080/socket/",
  "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}
},{}],4:[function(require,module,exports){
/**
 * Created by keith on 2016-12-29.
 */
/*jshint esnext: true */
/* jshint latedef:nofunc */
let InstaChat = require("./InstaChat.js");
let Zindex = require("./zIndex.js");
let SnakeConfig = require("./snakeConfig.js");
let Snake = require("./snake.js");
let memory = require("./memory.js");

function EventListerner() {                         //Instead of having several event listener for each object
    let source;                                     //this function will listen to all object.
    let top;                                        //So I control inside the listener what I want to listen on and pass
    let left;                                       //throw.
    let xDiff;
    let yDiff;
    document.querySelector("#play").addEventListener("mousedown", mouseDown, false);
    document.addEventListener("mouseup", mouseUp, false);
    window.addEventListener("click", close, true);
    window.addEventListener("input", input, false);
    document.addEventListener("focus", focus, true);
    document.addEventListener("blur", blur, true);
    function blur() {

    }

    function focus(event) {
        if (event.target.className === "menu" || event.target.parentNode.className === "memory") {
            event.target.parentNode.parentNode.style.zIndex = Zindex();                             //this listen for
        }else {                                                                                     //object that want to
            event.target.style.zIndex = Zindex();                                                   //get focus
        }
    }

    function input(event)
    {
        source = event.srcElement;                          //this listen on events in the menu

        let input = event.target.value;
        if (input === "close") {
            source.parentNode.parentNode.parentNode.removeChild(source.parentNode.parentNode);
        }

        if (input === "settings") {
            settings(event);
        }

        if (input === "restart") {
            restart(event);
        }
    }

    function restart(event) {
        let settingId = event.target.parentNode.parentNode.id;

        if (settingId === "snakeContainer") {                                   //restart events
            Snake.prototype.ReStart(event.target.parentNode.parentNode);
        }

        if (settingId === "chatContainer") {
            InstaChat.prototype.ReStart(event.target.parentNode.parentNode);
        }

        if (settingId === "memoryContainer") {
            memory.playMemory.prototype.ReStart(event.target.parentNode.parentNode);
        }
    }

    function settings(event) {

        let settingId = event.target.parentNode.parentNode.id;

        if (settingId === "snakeContainer") {
            SnakeConfig(event);                                     //setting events
        }

        if (settingId === "chatContainer") {
            InstaChat.prototype.chatConfig(event);
        }

        if (settingId === "memoryContainer") {
            memory.playMemory.prototype.MemoryConfig(event);
        }
    }

    function close(event) {
        source = event.srcElement;                          //close events
        if (source.id === "close") {
            source.parentNode.parentNode.parentNode.removeChild(source.parentNode.parentNode);

        }

        if (source === document.querySelector("input")) {
            if (source.value === "close") {
                source.parentNode.parentNode.parentNode.removeChild(source.parentNode.parentNode);
            }
        }

    }

    function mouseUp() {                                                                    //this mouse up event sets a
        if (source && source.tagName === "DIV" && source.className === "menuContainer") {   //signature on the elements
            document.removeEventListener("mousemove", mouseMove, true);                     //that have been moved
            source.parentNode.setAttribute("data-value", "3");                              //and removes the mouse move event
            source.parentNode.insertBefore(source, source.parentNode.firstChild);           //and re arrange the elements
        }                                                                                   //in theirs parentnode
    }

    function mouseDown(event) {
        source = event.srcElement;
        if (source.className === "menuContainer") {             //mousedown events most important event is to trigger mousemove
            top = source.parentNode.offsetTop;                  //event if any menu bar is pressed by the mouse
            left = source.parentNode.offsetLeft;                //and there is some calculation for where the mouse pointer is
            xDiff = event.clientX - left;                       //relative to the document and the target.
            yDiff = event.clientY - top;
            source.parentNode.style.zIndex = Zindex();
            document.addEventListener("mousemove", mouseMove, true);

        }
    }

    function mouseMove(event) {
        source.parentNode.style.top = event.clientY - yDiff + "px";         //with this mousemove event  it moves the
        source.parentNode.style.left = event.clientX  - xDiff + "px";       //target relative to the mouse
    }
}

module.exports = EventListerner;

},{"./InstaChat.js":1,"./memory.js":5,"./snake.js":7,"./snakeConfig.js":8,"./zIndex.js":9}],5:[function(require,module,exports){
/**
 * Created by keith on 2016-12-28.
 */
/*jshint esnext: true */
/* jshint latedef:nofunc */
let Zindex = require("./zIndex.js");
module.exports = {
    playMemory: PlayMemory,
    shuffle: getPictureArray
};
function PlayMemory(container, rows, cols) {                //Here all the fun starts, this is a memory game
    let radds = size(container, rows, cols);                //Old config settings are stored in localstorage,
    rows = radds.rows;                                      //so it checks there first to se if there are any old data
    cols = radds.cols;                                      //to use and teh function size take also care of rending the
    let a;                                                  //game field to a proper size.
    let tiles = [];
    let turn1;
    let turn2;
    let lastTile;
    let pairs = 0;
    let tries = 0;
    tiles = getPictureArray(rows, cols);            //returns a shuffled pic array of desired size.
    let templateDiv = document.querySelectorAll("#memoryTemplate")[0].content.firstElementChild;

    let div = document.importNode(templateDiv, false);                  //Printing up all the necessary info on the DOM-tree

    tiles.forEach(function(tile, index) {
        a = document.importNode(templateDiv.firstElementChild, true);
        a.firstElementChild.setAttribute("data-bricknumber", index.toString());

        div.appendChild(a);

        if ((index + 1) % cols === 0) {
            div.appendChild(document.createElement("br"));
        }
    });

    div.addEventListener("click", function(event) {                     //Event listener on the target
        event.preventDefault();
        let img = event.target.nodeName === "IMG" ? event.target : event.target.firstElementChild;
        let index = parseInt(img.getAttribute("data-bricknumber"));
        if (typeof index === "number" && !isNaN(index)) {           //Checks so it really was a img the user clicked on
            turnBrick(tiles[index], img);                           //a function that will turn the bricks and see if they
        }                                                           //match or not.
    });

    container.appendChild(div);
    container.appendChild(document.importNode(templateDiv.nextElementSibling, true));
    function turnBrick(tile, img) {

        if (turn2) {return;}

        img.src = "image/memory/" + tile + ".png";
        if (!turn1) {
            turn1 = img;                                    //first brick turned
            lastTile = tile;
        }else {

            if (img === turn1) {return;}

            tries += 1;                                     //second brick turned
            turn2 = img;
            if (tile === lastTile) {                        //and compared
                pairs += 1;
                if (pairs === (cols * rows) / 2) {          //when all are turned
                    result(container, tries, rows, cols);   //it prints the result
                }

                window.setTimeout(function() {
                    turn1.parentNode.classList.add("removed");          //if pair it will add a small timeout before they are removed
                    turn2.parentNode.classList.add("removed");

                    turn1 = null;
                    turn2 = null;
                }, 300);
            }else {
                window.setTimeout(function() {
                        turn1.src = "image/memory/0.png";          //else this timeout will pause the event and turn them back again
                        turn2.src = "image/memory/0.png";
                        turn1 = null;
                        turn2 = null;
                    }, 500);
            }

        }
    }

}

function result(source, tries, rows, cols) {
    let memory = "scoreType" + rows * cols;                 //Result function will store the score in localstorage
    let oldScore = localStorage.getItem(memory);            //and they will be stored separably depending on how big
    let result;                                             //field you are playing on
    if (oldScore === null || tries < oldScore) {
        localStorage.setItem(memory, tries);
        if (oldScore === null) {
            oldScore = "undefined";
        }
    }

    if (tries < oldScore) {
        result = document.createTextNode("Nytt rekord på " + tries + " försök");
    }else {
        result = document.createTextNode("Rekordet är " + oldScore + " försök du klarade på " + tries);
    }

    let p = document.createElement("p");                //Printing a small message about the scores.
    source.appendChild(p);
    p.appendChild(result);
}

function getPictureArray(rows, cols) {              //Creating an array with a index
    let i;
    let arr = [];

    for (i = 1; i <= (rows * cols / 2); i += 1) {
        arr.push(i);
        arr.push(i);
    }

    for (i = arr.length - 1; i > 0; i -= 1) {               //Shuffle the array
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    return arr;
}

function size(source, rows, cols) {                                    //this function is checking for user input size
    let dataObject = JSON.parse(localStorage.getItem("memory"));        //or last known setting from localstorage
    if (dataObject === null) {                                          //or it will create a default value
        dataObject = {
            rows: 4,
            cols: 4
        };
    }

    if ((typeof rows === "number" && rows !== 0) && (typeof cols === "number" && cols !== 0)) {
        dataObject.rows = rows;
        dataObject.cols = cols;
    }

    source.style.width = (110 * dataObject.cols) + "px";            //and here it will resize the field to a proper size
    source.style.height = (112 * dataObject.rows) + "px";           //depending on how man cols and rows.

    return dataObject;
}

PlayMemory.prototype.MemoryConfig = function(event) {                   //this function controls the user setting inputs
    let source = event.target.parentNode.parentNode;                    //with an event listener on the submit button
    let radios = document.getElementsByName("one");
    radios[0].checked = true;
    source.querySelector("#memoryConfig").style.display = "block";
    source.querySelector("#memoryConfig").style.visibility = "visible";
    source.querySelector("form").addEventListener("submit", submit, false);

    function submit(event) {
        event.preventDefault();
        source.querySelector("#memoryConfig").style.display = "none";

        let size;
        let dif = 0;
        for (let i = 0; i < radios.length; i += 1) {            //checks which value is submitted
            if (radios[i].checked) {
                size = radios[i].value;
                break;
            }
        }

        if (size === "3") {
            dif = 1;
        }

        size = parseInt(size);

        let field = {
            rows: size - dif,
            cols: size + dif
        };
        localStorage.setItem("memory", JSON.stringify(field));                  //Saving the size value to loacalstorage
        PlayMemory.prototype.ReStart(source);                                   //And restarting the game with new value
        source.querySelector("form").removeEventListener("submit", submit);
    }
};

PlayMemory.prototype.ReStart = function(source) {
    let top = source.offsetTop;
    let left = source.offsetLeft;
    source.parentNode.removeChild(source);
    let app = document.querySelector("#appContainer");
    let memoryContainer = app.querySelector("#memoryContainer").cloneNode(true);
    let template = document.querySelector("#menuBar");
    let menuBar = document.importNode(template.content.firstElementChild, true);
    document.querySelector("#play").appendChild(memoryContainer);
    memoryContainer.appendChild(menuBar.cloneNode(true));
    memoryContainer.style.top = top + "px";
    memoryContainer.style.left = left + "px";
    memoryContainer.style.zIndex = Zindex();
    memoryContainer.style.visibility = "visible";
    PlayMemory(memoryContainer);
};

},{"./zIndex.js":9}],6:[function(require,module,exports){
/**
 * Created by keith on 2017-01-03.
 */
/*jshint esnext: true */
/* jshint latedef:nofunc */

let memory = require("./memory.js");
let Snake = require("./snake.js");
let Zindex = require("./zIndex.js");
function Offset(source) {
    let previos = source.previousElementSibling;
    let directionLeft;
    let directionTop;                                           //Offset function is placing the div that is passed to
    let left;                                                   //it on the document relative to where the previous
    let top;                                                    //siblings have been placed that the user haven't been
    let windowH = window.innerHeight;                           //moving. Or if there is none it get a default value.
    let windowW = window.innerWidth;
    if (!previos) {
        source.style.left = "100px";
        source.style.top = "100px";
    }else if (previos.getAttribute("data-value") === "1") {
        if (previos.previousElementSibling && previos.previousElementSibling.getAttribute("data-value") === "1") {
            let prePre = previos.previousElementSibling;
            directionTop = previos.offsetTop - prePre.offsetTop;
            directionLeft = previos.offsetLeft - prePre.offsetLeft;
            direction();
        }else {
            top = 15;
            left = 15;
        }

        source.style.left = parseInt(previos.style.left.slice(0, -2)) + left + "px";
        source.style.top = parseInt(previos.style.top.slice(0, -2)) + top + "px";
    }else {
        source.style.left = "100px";
        source.style.top = "100px";
    }

    function direction() {                          //this function mainly adjusting the offset´s direction of placing
        if (directionLeft) {                        //the element so it bounce on the edges of the window.
            if (directionTop > 0) {

                if (previos.offsetTop + source.clientHeight + 15 > windowH) {
                    top = -15;
                } else {
                    top = 15;
                }
            } else {
                if (previos.offsetTop - 15 < 0) {
                    top = 15;
                } else {
                    top = -15;
                }
            }

            if (directionLeft > 0) {
                if (previos.offsetLeft + source.clientWidth + 15 > windowW) {
                    left = -15;
                } else {
                    left = +15;
                }
            } else {
                if (previos.offsetLeft < 0) {
                    left = 15;
                } else {
                    left = -15;
                }
            }
        }
    }
}

Offset.prototype.importante = function() {                                          //Did u press on the red button, well
    let template = document.querySelector("#menuBar");                              //well its here the magic happens.
    let menuBar = document.importNode(template.content.firstElementChild, true);    //this function was most for fun and
    let playContainer = document.querySelector("#appContainer");                    //half of the code I just copyed
    let snakeContainer = playContainer.querySelector("#snakeContainer");            //from google. So its nothing u need
    let memoryContainer = playContainer.querySelector("#memoryContainer");          //to consider.
    let n = 0;
    let am = setInterval(interval, 1);
    function interval() {
        n += 1;
        if (n === 110) {
            document.querySelector("body").style.background = "black";
            document.querySelectorAll("img")[0].style.visibility = "hidden";
            document.querySelectorAll("img")[1].style.visibility = "hidden";
            document.querySelectorAll("img")[2].style.visibility = "hidden";
            document.querySelector("canvas").style.display = "block";
            document.querySelector("canvas").style.position = "relative";
            document.querySelector("canvas").style.zIndex = 2000000;
            clearInterval(am);
            foo();
        }

        let rnd = Math.floor((Math.random() * 2) + 1);
        if (rnd === 1) {
            let b = document.querySelector("#play").appendChild(snakeContainer.cloneNode(true));
            b.appendChild(menuBar.cloneNode(true));
            b.style.visibility = "visible";
            Snake(b);
            b.style.zIndex = Zindex();
            Offset(b);
        } else {
            let c = document.querySelector("#play").appendChild(memoryContainer.cloneNode(true));
            c.appendChild(menuBar.cloneNode(true));
            c.style.visibility = "visible";
            memory.playMemory(c);
            c.style.zIndex = Zindex();
            Offset(c);
        }
    }

    function foo() {
        let c = document.getElementById("c");
        let ctx = c.getContext("2d");

        //making the canvas full screen
        c.height = window.outerHeight + 20;
        c.width = window.outerWidth + 20;
        c.style.top = "-10px";
        c.style.left = "-10px";

        //chinese characters - taken from the unicode charset
        let chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";

        //converting the string into an array of single characters
        chinese = chinese.split("");

        let fontSize = 10;
        let columns = c.width / fontSize; //number of columns for the rain
        //an array of drops - one per column
        let drops = [];

        //x below is the x coordinate
        //1 = y co-ordinate of the drop(same for every drop initially)
        for (let x = 0; x < columns; x += 1) {
            drops[x] = 1;
        }

        //drawing the characters
        function draw()
        {
            //Black BG for the canvas
            //translucent BG to show trail
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, c.width, c.height);

            ctx.fillStyle = "#0F0"; //green text
            ctx.font = fontSize + "px arial";

            //looping over drops
            for (let i = 0; i < drops.length; i += 1)
            {
                //a random chinese character to print
                let text = chinese[Math.floor(Math.random() * chinese.length)];

                //x = i*font_size, y = value of drops[i]*font_size
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                //sending the drop back to the top randomly after it has crossed the screen
                //adding a randomness to the reset to make the drops scattered on the Y axis
                if (drops[i] * fontSize > c.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                //incrementing Y coordinate
                drops[i] += 1;
            }
        }

        setInterval(draw, 33);
    }
};

module.exports = Offset;

},{"./memory.js":5,"./snake.js":7,"./zIndex.js":9}],7:[function(require,module,exports){
/**
 * Created by keith on 2016-12-31.
 */
/*jshint esnext: true */
/* jshint latedef:nofunc */
function Snake(source, mySpeed=1) {                             //the beginning of this snake game is just declaring all types of
    let key = "";                                               //variables to minimize lag when playing, and there is a default
    let interval = "";                                          //speed value if it is not specified.
    let render = "";
    let foodX = 0;
    let foodY = 0;
    let tailarr = [];
    let cloneBody = [];
    let foodCount = 0;
    let posX = 200;
    let posY = 200;
    let currentKey = "";
    let rotateHead = "";
    let template = document.querySelector("#snakeTemplate");
    let snake = document.importNode(template.content.firstElementChild, true);      //Building up the snake game in the
    let config = document.importNode(template.content.lastElementChild, true);      //DOM tree.
    source.appendChild(snake);
    source.appendChild(config);
    let speed = speedFunc();
    let head = source.querySelector("#head").style;
    let apple = source.querySelector("#apple").style;
    head.left = posX + "px";
    head.top = posY + "px";
    source.addEventListener("keydown", move, false);        //Here are where the game begins, an event listener.
    apple.visibility = "visible";                           //That is listening on the four arrow keys on the keyboard

    function move(event) {
        key = event.keyCode;
        if (!gameOver()) {                                  //An if statement that checks that current values are OK.
            result(source, foodCount);                      //If not throwing us to the end of the program.
        }

        if (key > 36 && key < 41 && key !== currentKey) {   //Here it checks for key.code from the event
            currentKey = key;
            if (interval) {                                  //If not the first time we will clear the interval that is
                clearInterval(interval);                     //moving the snake so we don't end up with several intervals
            }

            interval = setInterval(intervalMove, speed);      //And here the interval of moving the snake kicks in
        }else {                                               //with a speed variable so we can adjust the speed
            key = currentKey;
        }

        render = setInterval(renderSnake, 0);                //A render Interval that fires as many times as possible
    }

    function renderSnake() {                                 //It is in this interval the snake will be printed on the
        head.top = posY + "px";                             //document, first I had the render procedure in the same
        head.left = posX + "px";                            // interval as the move interval but it didn't end up so nice
        head.transform = rotateHead;                        // for the eye, it became a bit laggy at high speeds.
        apple.top = foodY + "px";
        apple.left = foodX + "px";
        if (foodCount > 0) {
            tail();
        }
    }

    function intervalMove() {                       //this is the interval for moving the head of the snake
        if (key === 37) {   //left                  //And assigning the correct values for x and y coordinates
            posX -= 50;                             //And which way the head should rotate
            rotateHead = "rotate(90deg)";
        } else if (key === 38) {   //up
            posY -= 50;
            rotateHead = "rotate(180deg)";
        } else if (key === 39) {   //right
            posX += 50;
            rotateHead = "rotate(270deg)";
        } else if (key === 40) {   //down
            posY += 50;
            rotateHead = "rotate(0deg)";
        }

        tailarr.push({posx: posX, posy: posY});     //this is an Object to store old position of the head so we can use
        if (foodX === posX && foodY === posY) {     //for the tail.
            food();                                 //Here it checks if we hit a food object and if so it will produce a new one
            if (speed > 150) {                      //If u eat u get faster!
                speed -= 6;
            }
        }

        if (!gameOver()) {                          //And here it checks the values again so we can play on
            result(source, foodCount);
        }
    }

    function food() {
        let foodPlace = false;

        for (let j = 0; j < 15 && foodPlace === false; j += 1) {           //Here it produce food coordinates
            foodX = Math.floor((Math.random() * 10)) * 50;                  //And it tries to place it on random locations
            foodY = Math.floor((Math.random() * 10)) * 50;                  //But I did get let it have no more then 15 tries
            foodPlace = true;                                               //Since when u get a big worm there is more likely
            for (let i = 0; i < foodCount && foodPlace === true; i += 1) {  //the food end up under the snake so I couldn't
                if (tailarr[tailarr.length - i - 1].posx === foodX &&       //have it in a while loop for ever.
                        tailarr[tailarr.length - i - 1].posy === foodY) {
                    foodPlace = false;
                }else {
                    foodPlace = true;
                }
            }
        }

        cloneBody[foodCount] = source.querySelector("#snakeBody").cloneNode(true);          //Cloning and appending a body part
        source.querySelector("#snake").appendChild(cloneBody[foodCount]);
        cloneBody[foodCount].style.left = tailarr[tailarr.length - foodCount - 3].posx + "px"; //Giving it a position
        cloneBody[foodCount].style.top = tailarr[tailarr.length - foodCount - 3].posy + "px";
        foodCount += 1;                                                                         //foodCounter
    }

    function tail() {
        for (let i = 0; i < foodCount; i += 1) {                                            //This is the tail repositioning process
            if (cloneBody[i].offsetTop === tailarr[tailarr.length - foodCount - 2].posy &&  //First I had a solution to repositioning
                cloneBody[i].offsetLeft === tailarr[tailarr.length - foodCount - 2].posx) { //every body part but I did come up with
                cloneBody[i].style.left = tailarr[tailarr.length - 2].posx + "px";          //a conclusion it is only the last body
                cloneBody[i].style.top = tailarr[tailarr.length - 2].posy + "px";           //part that is in need of moving.
            }                                                                               //So the last body part will end up to the first.

            cloneBody[i].style.visibility = "visible";
            if (tailarr > foodCount + 10) {                 //deleting som coordinates that is not necessary anymore.
                tailarr.splice(0, 1);
            }
        }
    }

    function gameOver() {
        if (!(posX >= 0 && posY >= 0 && posX + 50 <= 500 && posY + 50 <= 500)) {
            source.removeEventListener("keydown", move, false);
            clearInterval(interval);                                //when gamOver is true it removes events and intervals
            clearInterval(render);
            return false;
        }

        for (let i = 0; i < foodCount; i += 1) {
            if (tailarr[tailarr.length - i - 2].posy === posY && tailarr[tailarr.length - i - 2].posx === posX) {
                source.removeEventListener("keydown", move, false);
                clearInterval(interval);
                clearInterval(render);
                return false;
            }
        }

        return true;
    }

    function speedFunc() {
        source.querySelector("#mySpeed").value = mySpeed.toString();    //Here it save the speed u chosen
        return 500 - mySpeed;                                           //It will be reseted if closing.
    }
}

function result(source, foodCount) {
    let result;
    let gameOver = document.createTextNode("Game Over!");
    if (!localStorage.getItem("snake")) {
        localStorage.setItem("snake", foodCount);
        result = document.createTextNode("Your score: " + foodCount + " new high score!");
    }else if (localStorage.getItem("snake") < foodCount) {
        localStorage.removeItem("snake");
        localStorage.setItem("snake", foodCount);
        result = document.createTextNode("Your score: " + foodCount + " new high score!");
    }else {
        result = document.createTextNode("Your score: " + foodCount + ", high score is : " + localStorage.getItem("snake"));
    }

    let snake = source.querySelector("#snake");             //Saving highScore to localstorage and printing out
    snake.innerHTML = "";                                   //game over message
    let p = document.createElement("p");
    p.appendChild(gameOver);
    p.appendChild(document.createElement("br"));
    p.appendChild(result);
    snake.appendChild(p);
}

Snake.prototype.ReStart = function restart(source) {        //restarting by cloning a new node and deleting the current
    let speed;                                              //saving the old speed.
    if (source.querySelector("#snake")) {
        source.querySelector("#snake").parentNode.removeChild(source.querySelector("#snake"));
    }

    if (source.querySelector("#snakeConfig")) {
        speed = parseInt(source.querySelector("#mySpeed").value);
        source.querySelector("#snakeConfig").parentNode.removeChild(source.querySelector("#snakeConfig"));
    }

    if (source.querySelector(".menuContainer")) {
        let template = document.querySelector("#menuBar");
        let menuBar = document.importNode(template.content.firstElementChild, true);
        source.querySelector(".menuContainer").parentNode.removeChild(source.querySelector(".menuContainer"));
        source.appendChild(menuBar.cloneNode(true));
    }

    Snake(source, speed);       //Starting the new node passing the old speed with it.
};

module.exports = Snake;


},{}],8:[function(require,module,exports){
/**
 * Created by keith on 2017-01-03.
 */
/*jshint esnext: true */
/* jshint latedef:nofunc */
let Snake = require("./snake.js");
function SnakeConfig(event) {

    let source = event.target.parentNode.parentNode;

    source.querySelector("#snakeConfig").style.display = "block";
    source.querySelector("#snakeConfig").style.visibility = "visible";
    source.querySelector("form").addEventListener("submit", submit, false);
    function submit(event) {
        event.preventDefault();
        source.querySelector("#snakeConfig").style.display = "none";
        if (source.querySelector("#snake")) {
            source.querySelector("#snake").parentNode.removeChild(source.querySelector("#snake"));
        }

        Snake.prototype.ReStart(source);
        source.querySelector("form").removeEventListener("submit", submit);
    }
}

module.exports = SnakeConfig;

},{"./snake.js":7}],9:[function(require,module,exports){
/**
 * Created by keith on 2017-01-03.
 */
function Zindex() {
    Zindex.count = (Zindex.count += 1) || 1;    //this function acts like a static function it always returns
    return Zindex.count;                        //an increased number that Im using to control the div windows z-index
}                                               //so they can go on top of each other on my conditions

module.exports = Zindex;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvSW5zdGFDaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2NvbmZpZy5qc29uIiwiY2xpZW50L3NvdXJjZS9qcy9ldmVudExpc3Rlcm5lci5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9vZmZzZXQuanMiLCJjbGllbnQvc291cmNlL2pzL3NuYWtlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9zbmFrZUNvbmZpZy5qcyIsImNsaWVudC9zb3VyY2UvanMvekluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGtlaXRoIG9uIDIwMTYtMTItMjguXG4gKi9cbi8qanNoaW50IGVzbmV4dDogdHJ1ZSAqL1xuLyoganNoaW50IGxhdGVkZWY6bm9mdW5jICovXG5sZXQgY29uZmlnID0gcmVxdWlyZShcIi4vY29uZmlnLmpzb25cIik7XG5sZXQgWmluZGV4ID0gcmVxdWlyZShcIi4vekluZGV4LmpzXCIpO1xuZnVuY3Rpb24gSW5zdGFDaGF0KGNvbnRhaW5lcikge1xuXG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQnVpbGRpbmcgdXAgdGhlIGNoYXQgd2luZG93XG5cbiAgICB0aGlzLmNoYXREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgdGhpcy5jaGF0RGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkgeyAgICAgICAgICAgICAgICAgICAgICAvL2FkZGluZyBhIGV2ZW50IGxpc3Rlcm5lclxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aGVuIGVudGVyIGtleSBpcyBwcmVzc2VkXG4gICAgICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3RoZSB2YWx1ZSBvZiB0aGUgdGV4dCBmaWVsZCBpIHBhc3NlZFxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jaGF0RGl2KTtcbiAgICB0aGlzLmdldEhpc3RvcnkoKTsgICAgICAvL2dldHMgdGhlIGxhdGVzdCBoaXN0b3J5IG1lc3NhZ2VzXG4gICAgdGhpcy5jb25uZWN0KCk7ICAgICAgICAvL2Nvbm5lY3RpbmdcbiAgICB0aGlzLnVzZXJOYW1lKCk7XG59XG5cbkluc3RhQ2hhdC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkgeyAgICAgICAgICAgICAgLy9BIHByb21pc2UgaXMgZWl0aGVyIGZ1bGZpbGxlZCBvciByZWplY3RlZCBub3QgcGVuZGluZ1xuICAgICAgICBpZiAodGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLmFkZHJlc3MpOyAgICAgICAgICAgIC8vY3JlYXRpbmcgYSBuZXcgc2Vzc2lvbiB3aXRoIGFuIGFkcmVzcyBmcm9tIEpTT04gY29uZmlnIGZpbGVcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHsgICAgICAgIC8vb3BlbiBsaW5lIGNvbm5lY3Rpb25cbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbihldmVudCkgeyAgICAgLy9saXN0ZW4gZm9yIGVycm9ycyBpbiB0aGUgY29ubmVjdGlvblxuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkNvdWxlZCBub3QgY29ubmVjdFwiKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHsgICAgICAgLy9saXN0ZW4gZm9yIG1lc3NhZ2VzIGZyb20gdGhlIGNvbm5lY3Rpb25cbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwibWVzc2FnZVwiKSB7ICAgICAgICAgICAvL2Nob3NpbmcgdG8gb25seSBsaXN0ZW4gdG8gdGhpcyB0eXBlIG9mIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICB0aGlzLnByaW50TWVzc2FnZShtZXNzYWdlKTsgICAgICAgICAgICAgLy9QYXNzaW5nIHRoZSBtZXNzYWdlIHRvIHByaW50IGZ1bmN0aW9uXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIH0uYmluZCh0aGlzKSk7XG5cbn07XG5cbkluc3RhQ2hhdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KSB7XG5cbiAgICBsZXQgdXNlciA9IHRoaXMudXNlck5hbWUoKTsgICAgICAgICAgICAgICAgICAvL2dldHRpbmcgdGhlIGxhc3Qga25vd24gdXNlciBuYW1lIHVzZWQgb3IgcHJvbXRpbmdcbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGRhdGE6IHRleHQsXG4gICAgICAgIHVzZXJuYW1lOiB1c2VyLCAgICAgICAgICAgICAgICAgICAgIC8vc2V0dGluZyB1cCBhIGNvbmZpZyBvYmplY3RcbiAgICAgICAgY2hhbm5lbDogXCJcIixcbiAgICAgICAga2V5OiBjb25maWcua2V5XG4gICAgfTtcblxuICAgIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KSB7ICAgICAgLy9pZiBvcGVuIGxpbmUgdGhlbiBzZW5kaW5nIHRoZSBkYXRhIGFzIEpTT09OIHN0cmluZ1xuICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHsgICAgICAgICAgICAgICAgICAgICAgLy9jYXRjaGluZyBhcHBlbHNcbiAgICAgICAgY29uc29sZS5sb2coXCJTb21ldGhpbmcgd2VudCB3cm9uZ1wiLCBlcnJvcik7XG4gICAgfSk7XG5cbn07XG5cbkluc3RhQ2hhdC5wcm90b3R5cGUucHJpbnRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVcIilbMF07XG4gICAgbGV0IG1lc3NhZ2VEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLnRleHRcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGE7ICAgICAgICAgICAgIC8vcHJpbnRpbmcgb3V0IHRoZSBtZXNzYWdlIHVzZXIgYW5kIGRhdGFcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXV0aG9yXCIpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS51c2VybmFtZTsgICAgICAgLy90byB0aGUgY2hhdCBlbGVtZW50XG5cbiAgICB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZXNzYWdlc1wiKVswXS5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcbiAgICBsZXQgb2JqRGl2ID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZXNcIik7XG4gICAgb2JqRGl2LnNjcm9sbFRvcCA9IG9iakRpdi5zY3JvbGxIZWlnaHQ7XG5cbiAgICB0aGlzLnNldEhpc3RvcnkobWVzc2FnZSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2Fsc28gcGFzc2luZyB0aGUgbWVzc2FnZSB0aHJvdyBzbyB3ZSBjYW4gc3RvcmUgaXRcbn07XG5cbkluc3RhQ2hhdC5wcm90b3R5cGUuc2V0SGlzdG9yeSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBsZXQgaGlzdG9yeSA9IHtcbiAgICAgICAgICAgICAgICB1c2VyOiBtZXNzYWdlLnVzZXJuYW1lLCAgICAgICAgICAgICAgICAgICAgICAgICAvL3NhdmluZyBhbGwgdGhlIG1lc3NhZ2VzIGFzIEpTT04gb2JqZWN0IGluIGxvY2Fsc3RvcmFnZVxuICAgICAgICAgICAgICAgIGRhdGE6IG1lc3NhZ2UuZGF0YVxuICAgICAgICAgICAgfTtcbiAgICBsZXQgb2xkSXRlbXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaW5zdGFjaGFuZWxcIikpIHx8IFtdO1xuICAgIGlmIChvbGRJdGVtc1tvbGRJdGVtcy5sZW5ndGggLSAxXS51c2VybmFtZSAhPT0gaGlzdG9yeS51c2VybmFtZSB8fFxuICAgICAgICBvbGRJdGVtc1tvbGRJdGVtcy5sZW5ndGggLSAxXS5kYXRhICE9PSBoaXN0b3J5LmRhdGEpIHtcbiAgICAgICAgb2xkSXRlbXMucHVzaChoaXN0b3J5KTtcbiAgICB9XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImluc3RhY2hhbmVsXCIsIEpTT04uc3RyaW5naWZ5KG9sZEl0ZW1zKSk7XG59O1xuXG5JbnN0YUNoYXQucHJvdG90eXBlLmdldEhpc3RvcnkgPSBmdW5jdGlvbihob3dNYW55ID0gMjApIHsgICAgICAgICAgIC8vZGVmYXVsdCB2YWx1ZSBvZiByZXRyaWV2aW5nIGFuZCBwcmludCBvdXQgdGhlIG9sZFxuICAgIGxldCBnZXQgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaW5zdGFjaGFuZWxcIikpOyAgICAgIC8vc3RvcmVkIG1lc3NhZ2VzXG4gICAgbGV0IHRlbXBsYXRlID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVwiKVswXTtcbiAgICBpZiAoZ2V0ICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChob3dNYW55ID4gZ2V0Lmxlbmd0aCkge1xuICAgICAgICAgICAgaG93TWFueSA9IGdldC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9ZWxzZSB7XG4gICAgICAgIGhvd01hbnkgPSAwO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSBob3dNYW55OyBpID4gMDsgaSAtPSAxKSB7XG4gICAgICAgIGxldCBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLnRleHRcIilbMF0udGV4dENvbnRlbnQgPSBnZXRbZ2V0Lmxlbmd0aCAtIGldLmRhdGE7XG4gICAgICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbChcIi5hdXRob3JcIilbMF0udGV4dENvbnRlbnQgPSBnZXRbZ2V0Lmxlbmd0aCAtIGldLnVzZXI7XG4gICAgICAgIHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lc3NhZ2VzXCIpWzBdLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xuICAgIH1cblxuICAgIGxldCBvYmpEaXYgPSB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlc1wiKTtcbiAgICBvYmpEaXYuc2Nyb2xsVG9wID0gb2JqRGl2LnNjcm9sbEhlaWdodDtcbn07XG5cbkluc3RhQ2hhdC5wcm90b3R5cGUuUmVTdGFydCA9IGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgIGxldCB0b3AgPSBzb3VyY2Uub2Zmc2V0VG9wOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUmVzdGFydCBmdW5jdGlvbiB0aGF0IGlzIGNsb25pbmcgYSBuZXdcbiAgICBsZXQgbGVmdCA9IHNvdXJjZS5vZmZzZXRMZWZ0OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL25vZGUgYW5kIGRlbGV0aW5nIHRoZSBvbGQgb25lXG4gICAgc291cmNlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc291cmNlKTtcbiAgICBsZXQgYXBwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcHBDb250YWluZXJcIik7XG4gICAgbGV0IGNoYXRDb250YWluZXIgPSBhcHAucXVlcnlTZWxlY3RvcihcIiNjaGF0Q29udGFpbmVyXCIpLmNsb25lTm9kZSh0cnVlKTtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnVCYXJcIik7XG4gICAgbGV0IG1lbnVCYXIgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheVwiKS5hcHBlbmRDaGlsZChjaGF0Q29udGFpbmVyKTtcbiAgICBjaGF0Q29udGFpbmVyLmFwcGVuZENoaWxkKG1lbnVCYXIuY2xvbmVOb2RlKHRydWUpKTtcbiAgICBjaGF0Q29udGFpbmVyLnN0eWxlLnRvcCA9IHRvcCArIFwicHhcIjtcbiAgICBjaGF0Q29udGFpbmVyLnN0eWxlLmxlZnQgPSBsZWZ0ICsgXCJweFwiO1xuICAgIGNoYXRDb250YWluZXIuc3R5bGUuekluZGV4ID0gWmluZGV4KCk7XG4gICAgY2hhdENvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgbmV3IEluc3RhQ2hhdChjaGF0Q29udGFpbmVyKTsgICAgICAgICAgICAgICAgICAgLy9uZXcgc2Vzc2lvblxufTtcblxuSW5zdGFDaGF0LnByb3RvdHlwZS51c2VyTmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB1c2VyID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm5hbW5cIikpO1xuICAgIGlmICh1c2VyID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuY2hhdENvbmZpZyhldmVudCk7XG4gICAgfWVsc2UgaWYgKC9eW2EtekEtWl0vLnRlc3QodXNlcikpIHsgICAgICAgICAgICAgICAgICAgICAgIC8vdmFsaWRhdGluZyB0aGUgdXNlciBuYW1lIGlucHV0XG4gICAgICAgIHJldHVybiB1c2VyO1xuICAgIH1lbHNlIHtcbiAgICAgICAgdGhpcy5jaGF0Q29uZmlnKGV2ZW50KTtcbiAgICB9XG59O1xuXG5JbnN0YUNoYXQucHJvdG90eXBlLmNoYXRDb25maWcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGxldCBzb3VyY2UgPSBldmVudC50YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlO1xuICAgIGxldCB1c2VyO1xuICAgIHNvdXJjZS5xdWVyeVNlbGVjdG9yKFwiI2NoYXRDb25maWdcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNjaGF0Q29uZmlnXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcImZvcm1cIikuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBzdWJtaXQsIGZhbHNlKTsgICAgIC8vbGlzdGVuIG9uIG5ldyB1c2VyIG5hbWUgaW5wdXRcblxuICAgIGZ1bmN0aW9uIHN1Ym1pdChldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNjaGF0Q29uZmlnXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgdXNlciA9IHNvdXJjZS5xdWVyeVNlbGVjdG9yKFwiI3VzZXJOYW1lXCIpLnZhbHVlO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm5hbW5cIiwgSlNPTi5zdHJpbmdpZnkodXNlcikpO1xuICAgICAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNjaGF0Q29uZmlnXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgc291cmNlLnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgc3VibWl0KTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RhQ2hhdDtcbiIsIi8qanNoaW50IGVzbmV4dDogdHJ1ZSAqL1xuLyoganNoaW50IGxhdGVkZWY6bm9mdW5jICovXG50cnkge1xuICAgIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IG1lbW9yeSA9IHJlcXVpcmUoXCIuL21lbW9yeS5qc1wiKTtcbiAgICAgICAgbGV0IEluc3RhQ2hhdCA9IHJlcXVpcmUoXCIuL0luc3RhQ2hhdC5qc1wiKTtcbiAgICAgICAgbGV0IEV2ZW50TGlzdGVybmVyID0gcmVxdWlyZShcIi4vZXZlbnRMaXN0ZXJuZXIuanNcIik7XG4gICAgICAgIGxldCBTbmFrZSA9IHJlcXVpcmUoXCIuL3NuYWtlLmpzXCIpO1xuICAgICAgICBsZXQgT2Zmc2V0ID0gcmVxdWlyZShcIi4vb2Zmc2V0LmpzXCIpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vU3RhcnRpbmcgcG9pbnQgb2YgdGhpcyBuZXN0ZWRcbiAgICAgICAgbGV0IFppbmRleCA9IHJlcXVpcmUoXCIuL3pJbmRleC5qc1wiKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2phdmFTY3JpcHQuIEJhc2ljYWxseSBoZXJlIEkgYW1cbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51QmFyXCIpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2p1c3QgZGVjbGFyaW5nIHNvbWUgdmFyaWFibGVzXG4gICAgICAgIGxldCBtZW51QmFyID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTsgICAgIC8vZm9yIHRoZSBldmVudCBsaXN0ZW5lciB0aGF0IGlzXG4gICAgICAgIGxldCBpbmRleCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vbGlzdGVuaW5nIG9uIGFwcCBpY29uc1xuICAgICAgICBsZXQgcGFyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcHBDb250YWluZXJcIik7XG4gICAgICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbGF1bmNoQXBwLCBmYWxzZSk7XG5cbiAgICAgICAgZnVuY3Rpb24gbGF1bmNoQXBwKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9PSBldmVudC5jdXJyZW50VGFyZ2V0KSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgZXZlbnQgZnVuY3Rpb24gd2hvIGRlY2lkZXMgd2hhdFxuICAgICAgICAgICAgICAgIGxldCBjbG9uZSA9IGV2ZW50LnRhcmdldC5uZXh0RWxlbWVudFNpYmxpbmcuY2xvbmVOb2RlKHRydWUpOyAgICAgICAgICAgIC8vd2lsbCBoYXBwZW5zIG5leHQuIGl0IGxpc3RlbiB0b1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheVwiKS5hcHBlbmRDaGlsZChjbG9uZSk7ICAgICAgICAgICAgICAgICAgICAgLy9hIGNsaWNrIG9uIGFueSBvZiB0aGUgYXBwIGljb25zLlxuICAgICAgICAgICAgICAgIGNsb25lLmFwcGVuZENoaWxkKG1lbnVCYXIuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgICAgICAgICBjbG9uZS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc05hbWUgPT09IFwic25ha2VJbWdcIikge1xuICAgICAgICAgICAgICAgICAgICBTbmFrZShjbG9uZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQuY2xhc3NOYW1lID09PSBcIm1lbW9yeUltZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9yeS5wbGF5TWVtb3J5KGNsb25lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5jbGFzc05hbWUgPT09IFwiY2hhdEltZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ldyBJbnN0YUNoYXQoY2xvbmUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTmFtZSA9PT0gXCJjcm9zc0ltZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjbG9uZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBPZmZzZXQucHJvdG90eXBlLmltcG9ydGFudGUoY2xvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSAxO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjbG9uZS5zdHlsZS56SW5kZXggPSBaaW5kZXgoKTsgICAgICAgICAgICAgIC8vQWxzbyBwYXNzaW5nIHRoZSBldmVudCB0d28gb3RoZXIgZnVuY3Rpb25zXG4gICAgICAgICAgICAgICAgT2Zmc2V0KGNsb25lKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3RoYXQgaXMgZGVjaWRpbmcgaG93IGl0IHdpbGwgYXBwZWFyIG9uIHRoZVxuICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGRvY3VtZW50LlxuXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEV2ZW50TGlzdGVybmVyKCk7XG4gICAgfTtcbn1jYXRjaCAoZSkge1xuICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgZS5uYW1lKTtcbn1cblxuIiwibW9kdWxlLmV4cG9ydHM9e1xyXG4gIFwiYWRkcmVzc1wiOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXHJcbiAgXCJrZXlcIjogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXHJcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkga2VpdGggb24gMjAxNi0xMi0yOS5cbiAqL1xuLypqc2hpbnQgZXNuZXh0OiB0cnVlICovXG4vKiBqc2hpbnQgbGF0ZWRlZjpub2Z1bmMgKi9cbmxldCBJbnN0YUNoYXQgPSByZXF1aXJlKFwiLi9JbnN0YUNoYXQuanNcIik7XG5sZXQgWmluZGV4ID0gcmVxdWlyZShcIi4vekluZGV4LmpzXCIpO1xubGV0IFNuYWtlQ29uZmlnID0gcmVxdWlyZShcIi4vc25ha2VDb25maWcuanNcIik7XG5sZXQgU25ha2UgPSByZXF1aXJlKFwiLi9zbmFrZS5qc1wiKTtcbmxldCBtZW1vcnkgPSByZXF1aXJlKFwiLi9tZW1vcnkuanNcIik7XG5cbmZ1bmN0aW9uIEV2ZW50TGlzdGVybmVyKCkgeyAgICAgICAgICAgICAgICAgICAgICAgICAvL0luc3RlYWQgb2YgaGF2aW5nIHNldmVyYWwgZXZlbnQgbGlzdGVuZXIgZm9yIGVhY2ggb2JqZWN0XG4gICAgbGV0IHNvdXJjZTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGZ1bmN0aW9uIHdpbGwgbGlzdGVuIHRvIGFsbCBvYmplY3QuXG4gICAgbGV0IHRvcDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TbyBJIGNvbnRyb2wgaW5zaWRlIHRoZSBsaXN0ZW5lciB3aGF0IEkgd2FudCB0byBsaXN0ZW4gb24gYW5kIHBhc3NcbiAgICBsZXQgbGVmdDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3Rocm93LlxuICAgIGxldCB4RGlmZjtcbiAgICBsZXQgeURpZmY7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbW91c2VEb3duLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbW91c2VVcCwgZmFsc2UpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2UsIHRydWUpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgaW5wdXQsIGZhbHNlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgZm9jdXMsIHRydWUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIGJsdXIsIHRydWUpO1xuICAgIGZ1bmN0aW9uIGJsdXIoKSB7XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb2N1cyhldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTmFtZSA9PT0gXCJtZW51XCIgfHwgZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuY2xhc3NOYW1lID09PSBcIm1lbW9yeVwiKSB7XG4gICAgICAgICAgICBldmVudC50YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlLnN0eWxlLnpJbmRleCA9IFppbmRleCgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGxpc3RlbiBmb3JcbiAgICAgICAgfWVsc2UgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL29iamVjdCB0aGF0IHdhbnQgdG9cbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5zdHlsZS56SW5kZXggPSBaaW5kZXgoKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2dldCBmb2N1c1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5wdXQoZXZlbnQpXG4gICAge1xuICAgICAgICBzb3VyY2UgPSBldmVudC5zcmNFbGVtZW50OyAgICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGxpc3RlbiBvbiBldmVudHMgaW4gdGhlIG1lbnVcblxuICAgICAgICBsZXQgaW5wdXQgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIGlmIChpbnB1dCA9PT0gXCJjbG9zZVwiKSB7XG4gICAgICAgICAgICBzb3VyY2UucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc291cmNlLnBhcmVudE5vZGUucGFyZW50Tm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5wdXQgPT09IFwic2V0dGluZ3NcIikge1xuICAgICAgICAgICAgc2V0dGluZ3MoZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlucHV0ID09PSBcInJlc3RhcnRcIikge1xuICAgICAgICAgICAgcmVzdGFydChldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXN0YXJ0KGV2ZW50KSB7XG4gICAgICAgIGxldCBzZXR0aW5nSWQgPSBldmVudC50YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlLmlkO1xuXG4gICAgICAgIGlmIChzZXR0aW5nSWQgPT09IFwic25ha2VDb250YWluZXJcIikgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXN0YXJ0IGV2ZW50c1xuICAgICAgICAgICAgU25ha2UucHJvdG90eXBlLlJlU3RhcnQoZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUucGFyZW50Tm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ0lkID09PSBcImNoYXRDb250YWluZXJcIikge1xuICAgICAgICAgICAgSW5zdGFDaGF0LnByb3RvdHlwZS5SZVN0YXJ0KGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLnBhcmVudE5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmdJZCA9PT0gXCJtZW1vcnlDb250YWluZXJcIikge1xuICAgICAgICAgICAgbWVtb3J5LnBsYXlNZW1vcnkucHJvdG90eXBlLlJlU3RhcnQoZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUucGFyZW50Tm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXR0aW5ncyhldmVudCkge1xuXG4gICAgICAgIGxldCBzZXR0aW5nSWQgPSBldmVudC50YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlLmlkO1xuXG4gICAgICAgIGlmIChzZXR0aW5nSWQgPT09IFwic25ha2VDb250YWluZXJcIikge1xuICAgICAgICAgICAgU25ha2VDb25maWcoZXZlbnQpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NldHRpbmcgZXZlbnRzXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ0lkID09PSBcImNoYXRDb250YWluZXJcIikge1xuICAgICAgICAgICAgSW5zdGFDaGF0LnByb3RvdHlwZS5jaGF0Q29uZmlnKGV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5nSWQgPT09IFwibWVtb3J5Q29udGFpbmVyXCIpIHtcbiAgICAgICAgICAgIG1lbW9yeS5wbGF5TWVtb3J5LnByb3RvdHlwZS5NZW1vcnlDb25maWcoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xvc2UoZXZlbnQpIHtcbiAgICAgICAgc291cmNlID0gZXZlbnQuc3JjRWxlbWVudDsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2xvc2UgZXZlbnRzXG4gICAgICAgIGlmIChzb3VyY2UuaWQgPT09IFwiY2xvc2VcIikge1xuICAgICAgICAgICAgc291cmNlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNvdXJjZS5wYXJlbnROb2RlLnBhcmVudE5vZGUpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc291cmNlID09PSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIikpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UudmFsdWUgPT09IFwiY2xvc2VcIikge1xuICAgICAgICAgICAgICAgIHNvdXJjZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzb3VyY2UucGFyZW50Tm9kZS5wYXJlbnROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW91c2VVcCgpIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcyBtb3VzZSB1cCBldmVudCBzZXRzIGFcbiAgICAgICAgaWYgKHNvdXJjZSAmJiBzb3VyY2UudGFnTmFtZSA9PT0gXCJESVZcIiAmJiBzb3VyY2UuY2xhc3NOYW1lID09PSBcIm1lbnVDb250YWluZXJcIikgeyAgIC8vc2lnbmF0dXJlIG9uIHRoZSBlbGVtZW50c1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3VzZU1vdmUsIHRydWUpOyAgICAgICAgICAgICAgICAgICAgIC8vdGhhdCBoYXZlIGJlZW4gbW92ZWRcbiAgICAgICAgICAgIHNvdXJjZS5wYXJlbnROb2RlLnNldEF0dHJpYnV0ZShcImRhdGEtdmFsdWVcIiwgXCIzXCIpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYW5kIHJlbW92ZXMgdGhlIG1vdXNlIG1vdmUgZXZlbnRcbiAgICAgICAgICAgIHNvdXJjZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzb3VyY2UsIHNvdXJjZS5wYXJlbnROb2RlLmZpcnN0Q2hpbGQpOyAgICAgICAgICAgLy9hbmQgcmUgYXJyYW5nZSB0aGUgZWxlbWVudHNcbiAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9pbiB0aGVpcnMgcGFyZW50bm9kZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdXNlRG93bihldmVudCkge1xuICAgICAgICBzb3VyY2UgPSBldmVudC5zcmNFbGVtZW50O1xuICAgICAgICBpZiAoc291cmNlLmNsYXNzTmFtZSA9PT0gXCJtZW51Q29udGFpbmVyXCIpIHsgICAgICAgICAgICAgLy9tb3VzZWRvd24gZXZlbnRzIG1vc3QgaW1wb3J0YW50IGV2ZW50IGlzIHRvIHRyaWdnZXIgbW91c2Vtb3ZlXG4gICAgICAgICAgICB0b3AgPSBzb3VyY2UucGFyZW50Tm9kZS5vZmZzZXRUb3A7ICAgICAgICAgICAgICAgICAgLy9ldmVudCBpZiBhbnkgbWVudSBiYXIgaXMgcHJlc3NlZCBieSB0aGUgbW91c2VcbiAgICAgICAgICAgIGxlZnQgPSBzb3VyY2UucGFyZW50Tm9kZS5vZmZzZXRMZWZ0OyAgICAgICAgICAgICAgICAvL2FuZCB0aGVyZSBpcyBzb21lIGNhbGN1bGF0aW9uIGZvciB3aGVyZSB0aGUgbW91c2UgcG9pbnRlciBpc1xuICAgICAgICAgICAgeERpZmYgPSBldmVudC5jbGllbnRYIC0gbGVmdDsgICAgICAgICAgICAgICAgICAgICAgIC8vcmVsYXRpdmUgdG8gdGhlIGRvY3VtZW50IGFuZCB0aGUgdGFyZ2V0LlxuICAgICAgICAgICAgeURpZmYgPSBldmVudC5jbGllbnRZIC0gdG9wO1xuICAgICAgICAgICAgc291cmNlLnBhcmVudE5vZGUuc3R5bGUuekluZGV4ID0gWmluZGV4KCk7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdXNlTW92ZSwgdHJ1ZSk7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdXNlTW92ZShldmVudCkge1xuICAgICAgICBzb3VyY2UucGFyZW50Tm9kZS5zdHlsZS50b3AgPSBldmVudC5jbGllbnRZIC0geURpZmYgKyBcInB4XCI7ICAgICAgICAgLy93aXRoIHRoaXMgbW91c2Vtb3ZlIGV2ZW50ICBpdCBtb3ZlcyB0aGVcbiAgICAgICAgc291cmNlLnBhcmVudE5vZGUuc3R5bGUubGVmdCA9IGV2ZW50LmNsaWVudFggIC0geERpZmYgKyBcInB4XCI7ICAgICAgIC8vdGFyZ2V0IHJlbGF0aXZlIHRvIHRoZSBtb3VzZVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudExpc3Rlcm5lcjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBrZWl0aCBvbiAyMDE2LTEyLTI4LlxuICovXG4vKmpzaGludCBlc25leHQ6IHRydWUgKi9cbi8qIGpzaGludCBsYXRlZGVmOm5vZnVuYyAqL1xubGV0IFppbmRleCA9IHJlcXVpcmUoXCIuL3pJbmRleC5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBsYXlNZW1vcnk6IFBsYXlNZW1vcnksXG4gICAgc2h1ZmZsZTogZ2V0UGljdHVyZUFycmF5XG59O1xuZnVuY3Rpb24gUGxheU1lbW9yeShjb250YWluZXIsIHJvd3MsIGNvbHMpIHsgICAgICAgICAgICAgICAgLy9IZXJlIGFsbCB0aGUgZnVuIHN0YXJ0cywgdGhpcyBpcyBhIG1lbW9yeSBnYW1lXG4gICAgbGV0IHJhZGRzID0gc2l6ZShjb250YWluZXIsIHJvd3MsIGNvbHMpOyAgICAgICAgICAgICAgICAvL09sZCBjb25maWcgc2V0dGluZ3MgYXJlIHN0b3JlZCBpbiBsb2NhbHN0b3JhZ2UsXG4gICAgcm93cyA9IHJhZGRzLnJvd3M7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NvIGl0IGNoZWNrcyB0aGVyZSBmaXJzdCB0byBzZSBpZiB0aGVyZSBhcmUgYW55IG9sZCBkYXRhXG4gICAgY29scyA9IHJhZGRzLmNvbHM7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3RvIHVzZSBhbmQgdGVoIGZ1bmN0aW9uIHNpemUgdGFrZSBhbHNvIGNhcmUgb2YgcmVuZGluZyB0aGVcbiAgICBsZXQgYTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2FtZSBmaWVsZCB0byBhIHByb3BlciBzaXplLlxuICAgIGxldCB0aWxlcyA9IFtdO1xuICAgIGxldCB0dXJuMTtcbiAgICBsZXQgdHVybjI7XG4gICAgbGV0IGxhc3RUaWxlO1xuICAgIGxldCBwYWlycyA9IDA7XG4gICAgbGV0IHRyaWVzID0gMDtcbiAgICB0aWxlcyA9IGdldFBpY3R1cmVBcnJheShyb3dzLCBjb2xzKTsgICAgICAgICAgICAvL3JldHVybnMgYSBzaHVmZmxlZCBwaWMgYXJyYXkgb2YgZGVzaXJlZCBzaXplLlxuICAgIGxldCB0ZW1wbGF0ZURpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjbWVtb3J5VGVtcGxhdGVcIilbMF0uY29udGVudC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgIGxldCBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LCBmYWxzZSk7ICAgICAgICAgICAgICAgICAgLy9QcmludGluZyB1cCBhbGwgdGhlIG5lY2Vzc2FyeSBpbmZvIG9uIHRoZSBET00tdHJlZVxuXG4gICAgdGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlLCBpbmRleCkge1xuICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuc2V0QXR0cmlidXRlKFwiZGF0YS1icmlja251bWJlclwiLCBpbmRleC50b1N0cmluZygpKTtcblxuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYSk7XG5cbiAgICAgICAgaWYgKChpbmRleCArIDEpICUgY29scyA9PT0gMCkge1xuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHsgICAgICAgICAgICAgICAgICAgICAvL0V2ZW50IGxpc3RlbmVyIG9uIHRoZSB0YXJnZXRcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGV0IGltZyA9IGV2ZW50LnRhcmdldC5ub2RlTmFtZSA9PT0gXCJJTUdcIiA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgbGV0IGluZGV4ID0gcGFyc2VJbnQoaW1nLmdldEF0dHJpYnV0ZShcImRhdGEtYnJpY2tudW1iZXJcIikpO1xuICAgICAgICBpZiAodHlwZW9mIGluZGV4ID09PSBcIm51bWJlclwiICYmICFpc05hTihpbmRleCkpIHsgICAgICAgICAgIC8vQ2hlY2tzIHNvIGl0IHJlYWxseSB3YXMgYSBpbWcgdGhlIHVzZXIgY2xpY2tlZCBvblxuICAgICAgICAgICAgdHVybkJyaWNrKHRpbGVzW2luZGV4XSwgaW1nKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2EgZnVuY3Rpb24gdGhhdCB3aWxsIHR1cm4gdGhlIGJyaWNrcyBhbmQgc2VlIGlmIHRoZXlcbiAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9tYXRjaCBvciBub3QuXG4gICAgfSk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5uZXh0RWxlbWVudFNpYmxpbmcsIHRydWUpKTtcbiAgICBmdW5jdGlvbiB0dXJuQnJpY2sodGlsZSwgaW1nKSB7XG5cbiAgICAgICAgaWYgKHR1cm4yKSB7cmV0dXJuO31cblxuICAgICAgICBpbWcuc3JjID0gXCJpbWFnZS9tZW1vcnkvXCIgKyB0aWxlICsgXCIucG5nXCI7XG4gICAgICAgIGlmICghdHVybjEpIHtcbiAgICAgICAgICAgIHR1cm4xID0gaW1nOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZmlyc3QgYnJpY2sgdHVybmVkXG4gICAgICAgICAgICBsYXN0VGlsZSA9IHRpbGU7XG4gICAgICAgIH1lbHNlIHtcblxuICAgICAgICAgICAgaWYgKGltZyA9PT0gdHVybjEpIHtyZXR1cm47fVxuXG4gICAgICAgICAgICB0cmllcyArPSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NlY29uZCBicmljayB0dXJuZWRcbiAgICAgICAgICAgIHR1cm4yID0gaW1nO1xuICAgICAgICAgICAgaWYgKHRpbGUgPT09IGxhc3RUaWxlKSB7ICAgICAgICAgICAgICAgICAgICAgICAgLy9hbmQgY29tcGFyZWRcbiAgICAgICAgICAgICAgICBwYWlycyArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChwYWlycyA9PT0gKGNvbHMgKiByb3dzKSAvIDIpIHsgICAgICAgICAgLy93aGVuIGFsbCBhcmUgdHVybmVkXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdChjb250YWluZXIsIHRyaWVzLCByb3dzLCBjb2xzKTsgICAvL2l0IHByaW50cyB0aGUgcmVzdWx0XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcInJlbW92ZWRcIik7ICAgICAgICAgIC8vaWYgcGFpciBpdCB3aWxsIGFkZCBhIHNtYWxsIHRpbWVvdXQgYmVmb3JlIHRoZXkgYXJlIHJlbW92ZWRcbiAgICAgICAgICAgICAgICAgICAgdHVybjIucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwicmVtb3ZlZFwiKTtcblxuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCAzMDApO1xuICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHVybjEuc3JjID0gXCJpbWFnZS9tZW1vcnkvMC5wbmdcIjsgICAgICAgICAgLy9lbHNlIHRoaXMgdGltZW91dCB3aWxsIHBhdXNlIHRoZSBldmVudCBhbmQgdHVybiB0aGVtIGJhY2sgYWdhaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIHR1cm4yLnNyYyA9IFwiaW1hZ2UvbWVtb3J5LzAucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxufVxuXG5mdW5jdGlvbiByZXN1bHQoc291cmNlLCB0cmllcywgcm93cywgY29scykge1xuICAgIGxldCBtZW1vcnkgPSBcInNjb3JlVHlwZVwiICsgcm93cyAqIGNvbHM7ICAgICAgICAgICAgICAgICAvL1Jlc3VsdCBmdW5jdGlvbiB3aWxsIHN0b3JlIHRoZSBzY29yZSBpbiBsb2NhbHN0b3JhZ2VcbiAgICBsZXQgb2xkU2NvcmUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShtZW1vcnkpOyAgICAgICAgICAgIC8vYW5kIHRoZXkgd2lsbCBiZSBzdG9yZWQgc2VwYXJhYmx5IGRlcGVuZGluZyBvbiBob3cgYmlnXG4gICAgbGV0IHJlc3VsdDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ZpZWxkIHlvdSBhcmUgcGxheWluZyBvblxuICAgIGlmIChvbGRTY29yZSA9PT0gbnVsbCB8fCB0cmllcyA8IG9sZFNjb3JlKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG1lbW9yeSwgdHJpZXMpO1xuICAgICAgICBpZiAob2xkU2NvcmUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIG9sZFNjb3JlID0gXCJ1bmRlZmluZWRcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0cmllcyA8IG9sZFNjb3JlKSB7XG4gICAgICAgIHJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTnl0dCByZWtvcmQgcMOlIFwiICsgdHJpZXMgKyBcIiBmw7Zyc8O2a1wiKTtcbiAgICB9ZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiUmVrb3JkZXQgw6RyIFwiICsgb2xkU2NvcmUgKyBcIiBmw7Zyc8O2ayBkdSBrbGFyYWRlIHDDpSBcIiArIHRyaWVzKTtcbiAgICB9XG5cbiAgICBsZXQgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpOyAgICAgICAgICAgICAgICAvL1ByaW50aW5nIGEgc21hbGwgbWVzc2FnZSBhYm91dCB0aGUgc2NvcmVzLlxuICAgIHNvdXJjZS5hcHBlbmRDaGlsZChwKTtcbiAgICBwLmFwcGVuZENoaWxkKHJlc3VsdCk7XG59XG5cbmZ1bmN0aW9uIGdldFBpY3R1cmVBcnJheShyb3dzLCBjb2xzKSB7ICAgICAgICAgICAgICAvL0NyZWF0aW5nIGFuIGFycmF5IHdpdGggYSBpbmRleFxuICAgIGxldCBpO1xuICAgIGxldCBhcnIgPSBbXTtcblxuICAgIGZvciAoaSA9IDE7IGkgPD0gKHJvd3MgKiBjb2xzIC8gMik7IGkgKz0gMSkge1xuICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgfVxuXG4gICAgZm9yIChpID0gYXJyLmxlbmd0aCAtIDE7IGkgPiAwOyBpIC09IDEpIHsgICAgICAgICAgICAgICAvL1NodWZmbGUgdGhlIGFycmF5XG4gICAgICAgIGxldCBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgICAgIGxldCB0ZW1wID0gYXJyW2ldO1xuICAgICAgICBhcnJbaV0gPSBhcnJbal07XG4gICAgICAgIGFycltqXSA9IHRlbXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn1cblxuZnVuY3Rpb24gc2l6ZShzb3VyY2UsIHJvd3MsIGNvbHMpIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMgZnVuY3Rpb24gaXMgY2hlY2tpbmcgZm9yIHVzZXIgaW5wdXQgc2l6ZVxuICAgIGxldCBkYXRhT2JqZWN0ID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm1lbW9yeVwiKSk7ICAgICAgICAvL29yIGxhc3Qga25vd24gc2V0dGluZyBmcm9tIGxvY2Fsc3RvcmFnZVxuICAgIGlmIChkYXRhT2JqZWN0ID09PSBudWxsKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9vciBpdCB3aWxsIGNyZWF0ZSBhIGRlZmF1bHQgdmFsdWVcbiAgICAgICAgZGF0YU9iamVjdCA9IHtcbiAgICAgICAgICAgIHJvd3M6IDQsXG4gICAgICAgICAgICBjb2xzOiA0XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCh0eXBlb2Ygcm93cyA9PT0gXCJudW1iZXJcIiAmJiByb3dzICE9PSAwKSAmJiAodHlwZW9mIGNvbHMgPT09IFwibnVtYmVyXCIgJiYgY29scyAhPT0gMCkpIHtcbiAgICAgICAgZGF0YU9iamVjdC5yb3dzID0gcm93cztcbiAgICAgICAgZGF0YU9iamVjdC5jb2xzID0gY29scztcbiAgICB9XG5cbiAgICBzb3VyY2Uuc3R5bGUud2lkdGggPSAoMTEwICogZGF0YU9iamVjdC5jb2xzKSArIFwicHhcIjsgICAgICAgICAgICAvL2FuZCBoZXJlIGl0IHdpbGwgcmVzaXplIHRoZSBmaWVsZCB0byBhIHByb3BlciBzaXplXG4gICAgc291cmNlLnN0eWxlLmhlaWdodCA9ICgxMTIgKiBkYXRhT2JqZWN0LnJvd3MpICsgXCJweFwiOyAgICAgICAgICAgLy9kZXBlbmRpbmcgb24gaG93IG1hbiBjb2xzIGFuZCByb3dzLlxuXG4gICAgcmV0dXJuIGRhdGFPYmplY3Q7XG59XG5cblBsYXlNZW1vcnkucHJvdG90eXBlLk1lbW9yeUNvbmZpZyA9IGZ1bmN0aW9uKGV2ZW50KSB7ICAgICAgICAgICAgICAgICAgIC8vdGhpcyBmdW5jdGlvbiBjb250cm9scyB0aGUgdXNlciBzZXR0aW5nIGlucHV0c1xuICAgIGxldCBzb3VyY2UgPSBldmVudC50YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlOyAgICAgICAgICAgICAgICAgICAgLy93aXRoIGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBzdWJtaXQgYnV0dG9uXG4gICAgbGV0IHJhZGlvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwib25lXCIpO1xuICAgIHJhZGlvc1swXS5jaGVja2VkID0gdHJ1ZTtcbiAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlDb25maWdcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlDb25maWdcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgIHNvdXJjZS5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHN1Ym1pdCwgZmFsc2UpO1xuXG4gICAgZnVuY3Rpb24gc3VibWl0KGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNvdXJjZS5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUNvbmZpZ1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAgICAgbGV0IHNpemU7XG4gICAgICAgIGxldCBkaWYgPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhZGlvcy5sZW5ndGg7IGkgKz0gMSkgeyAgICAgICAgICAgIC8vY2hlY2tzIHdoaWNoIHZhbHVlIGlzIHN1Ym1pdHRlZFxuICAgICAgICAgICAgaWYgKHJhZGlvc1tpXS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgc2l6ZSA9IHJhZGlvc1tpXS52YWx1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzaXplID09PSBcIjNcIikge1xuICAgICAgICAgICAgZGlmID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNpemUgPSBwYXJzZUludChzaXplKTtcblxuICAgICAgICBsZXQgZmllbGQgPSB7XG4gICAgICAgICAgICByb3dzOiBzaXplIC0gZGlmLFxuICAgICAgICAgICAgY29sczogc2l6ZSArIGRpZlxuICAgICAgICB9O1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm1lbW9yeVwiLCBKU09OLnN0cmluZ2lmeShmaWVsZCkpOyAgICAgICAgICAgICAgICAgIC8vU2F2aW5nIHRoZSBzaXplIHZhbHVlIHRvIGxvYWNhbHN0b3JhZ2VcbiAgICAgICAgUGxheU1lbW9yeS5wcm90b3R5cGUuUmVTdGFydChzb3VyY2UpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9BbmQgcmVzdGFydGluZyB0aGUgZ2FtZSB3aXRoIG5ldyB2YWx1ZVxuICAgICAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcImZvcm1cIikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBzdWJtaXQpO1xuICAgIH1cbn07XG5cblBsYXlNZW1vcnkucHJvdG90eXBlLlJlU3RhcnQgPSBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICBsZXQgdG9wID0gc291cmNlLm9mZnNldFRvcDtcbiAgICBsZXQgbGVmdCA9IHNvdXJjZS5vZmZzZXRMZWZ0O1xuICAgIHNvdXJjZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNvdXJjZSk7XG4gICAgbGV0IGFwcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYXBwQ29udGFpbmVyXCIpO1xuICAgIGxldCBtZW1vcnlDb250YWluZXIgPSBhcHAucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlDb250YWluZXJcIikuY2xvbmVOb2RlKHRydWUpO1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudUJhclwiKTtcbiAgICBsZXQgbWVudUJhciA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5XCIpLmFwcGVuZENoaWxkKG1lbW9yeUNvbnRhaW5lcik7XG4gICAgbWVtb3J5Q29udGFpbmVyLmFwcGVuZENoaWxkKG1lbnVCYXIuY2xvbmVOb2RlKHRydWUpKTtcbiAgICBtZW1vcnlDb250YWluZXIuc3R5bGUudG9wID0gdG9wICsgXCJweFwiO1xuICAgIG1lbW9yeUNvbnRhaW5lci5zdHlsZS5sZWZ0ID0gbGVmdCArIFwicHhcIjtcbiAgICBtZW1vcnlDb250YWluZXIuc3R5bGUuekluZGV4ID0gWmluZGV4KCk7XG4gICAgbWVtb3J5Q29udGFpbmVyLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICBQbGF5TWVtb3J5KG1lbW9yeUNvbnRhaW5lcik7XG59O1xuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkga2VpdGggb24gMjAxNy0wMS0wMy5cclxuICovXHJcbi8qanNoaW50IGVzbmV4dDogdHJ1ZSAqL1xyXG4vKiBqc2hpbnQgbGF0ZWRlZjpub2Z1bmMgKi9cclxuXHJcbmxldCBtZW1vcnkgPSByZXF1aXJlKFwiLi9tZW1vcnkuanNcIik7XHJcbmxldCBTbmFrZSA9IHJlcXVpcmUoXCIuL3NuYWtlLmpzXCIpO1xyXG5sZXQgWmluZGV4ID0gcmVxdWlyZShcIi4vekluZGV4LmpzXCIpO1xyXG5mdW5jdGlvbiBPZmZzZXQoc291cmNlKSB7XHJcbiAgICBsZXQgcHJldmlvcyA9IHNvdXJjZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgbGV0IGRpcmVjdGlvbkxlZnQ7XHJcbiAgICBsZXQgZGlyZWN0aW9uVG9wOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL09mZnNldCBmdW5jdGlvbiBpcyBwbGFjaW5nIHRoZSBkaXYgdGhhdCBpcyBwYXNzZWQgdG9cclxuICAgIGxldCBsZWZ0OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaXQgb24gdGhlIGRvY3VtZW50IHJlbGF0aXZlIHRvIHdoZXJlIHRoZSBwcmV2aW91c1xyXG4gICAgbGV0IHRvcDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9zaWJsaW5ncyBoYXZlIGJlZW4gcGxhY2VkIHRoYXQgdGhlIHVzZXIgaGF2ZW4ndCBiZWVuXHJcbiAgICBsZXQgd2luZG93SCA9IHdpbmRvdy5pbm5lckhlaWdodDsgICAgICAgICAgICAgICAgICAgICAgICAgICAvL21vdmluZy4gT3IgaWYgdGhlcmUgaXMgbm9uZSBpdCBnZXQgYSBkZWZhdWx0IHZhbHVlLlxyXG4gICAgbGV0IHdpbmRvd1cgPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIGlmICghcHJldmlvcykge1xyXG4gICAgICAgIHNvdXJjZS5zdHlsZS5sZWZ0ID0gXCIxMDBweFwiO1xyXG4gICAgICAgIHNvdXJjZS5zdHlsZS50b3AgPSBcIjEwMHB4XCI7XHJcbiAgICB9ZWxzZSBpZiAocHJldmlvcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXZhbHVlXCIpID09PSBcIjFcIikge1xyXG4gICAgICAgIGlmIChwcmV2aW9zLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgJiYgcHJldmlvcy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLmdldEF0dHJpYnV0ZShcImRhdGEtdmFsdWVcIikgPT09IFwiMVwiKSB7XHJcbiAgICAgICAgICAgIGxldCBwcmVQcmUgPSBwcmV2aW9zLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgIGRpcmVjdGlvblRvcCA9IHByZXZpb3Mub2Zmc2V0VG9wIC0gcHJlUHJlLm9mZnNldFRvcDtcclxuICAgICAgICAgICAgZGlyZWN0aW9uTGVmdCA9IHByZXZpb3Mub2Zmc2V0TGVmdCAtIHByZVByZS5vZmZzZXRMZWZ0O1xyXG4gICAgICAgICAgICBkaXJlY3Rpb24oKTtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIHRvcCA9IDE1O1xyXG4gICAgICAgICAgICBsZWZ0ID0gMTU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzb3VyY2Uuc3R5bGUubGVmdCA9IHBhcnNlSW50KHByZXZpb3Muc3R5bGUubGVmdC5zbGljZSgwLCAtMikpICsgbGVmdCArIFwicHhcIjtcclxuICAgICAgICBzb3VyY2Uuc3R5bGUudG9wID0gcGFyc2VJbnQocHJldmlvcy5zdHlsZS50b3Auc2xpY2UoMCwgLTIpKSArIHRvcCArIFwicHhcIjtcclxuICAgIH1lbHNlIHtcclxuICAgICAgICBzb3VyY2Uuc3R5bGUubGVmdCA9IFwiMTAwcHhcIjtcclxuICAgICAgICBzb3VyY2Uuc3R5bGUudG9wID0gXCIxMDBweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRpcmVjdGlvbigpIHsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcyBmdW5jdGlvbiBtYWlubHkgYWRqdXN0aW5nIHRoZSBvZmZzZXTCtHMgZGlyZWN0aW9uIG9mIHBsYWNpbmdcclxuICAgICAgICBpZiAoZGlyZWN0aW9uTGVmdCkgeyAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhlIGVsZW1lbnQgc28gaXQgYm91bmNlIG9uIHRoZSBlZGdlcyBvZiB0aGUgd2luZG93LlxyXG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uVG9wID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW9zLm9mZnNldFRvcCArIHNvdXJjZS5jbGllbnRIZWlnaHQgKyAxNSA+IHdpbmRvd0gpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3AgPSAtMTU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IDE1O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3Mub2Zmc2V0VG9wIC0gMTUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gMTU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IC0xNTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbkxlZnQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvcy5vZmZzZXRMZWZ0ICsgc291cmNlLmNsaWVudFdpZHRoICsgMTUgPiB3aW5kb3dXKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IC0xNTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9ICsxNTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW9zLm9mZnNldExlZnQgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IDE1O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gLTE1O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5PZmZzZXQucHJvdG90eXBlLmltcG9ydGFudGUgPSBmdW5jdGlvbigpIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0RpZCB1IHByZXNzIG9uIHRoZSByZWQgYnV0dG9uLCB3ZWxsXHJcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnVCYXJcIik7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93ZWxsIGl0cyBoZXJlIHRoZSBtYWdpYyBoYXBwZW5zLlxyXG4gICAgbGV0IG1lbnVCYXIgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpOyAgICAvL3RoaXMgZnVuY3Rpb24gd2FzIG1vc3QgZm9yIGZ1biBhbmRcclxuICAgIGxldCBwbGF5Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcHBDb250YWluZXJcIik7ICAgICAgICAgICAgICAgICAgICAvL2hhbGYgb2YgdGhlIGNvZGUgSSBqdXN0IGNvcHllZFxyXG4gICAgbGV0IHNuYWtlQ29udGFpbmVyID0gcGxheUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiI3NuYWtlQ29udGFpbmVyXCIpOyAgICAgICAgICAgIC8vZnJvbSBnb29nbGUuIFNvIGl0cyBub3RoaW5nIHUgbmVlZFxyXG4gICAgbGV0IG1lbW9yeUNvbnRhaW5lciA9IHBsYXlDb250YWluZXIucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlDb250YWluZXJcIik7ICAgICAgICAgIC8vdG8gY29uc2lkZXIuXHJcbiAgICBsZXQgbiA9IDA7XHJcbiAgICBsZXQgYW0gPSBzZXRJbnRlcnZhbChpbnRlcnZhbCwgMSk7XHJcbiAgICBmdW5jdGlvbiBpbnRlcnZhbCgpIHtcclxuICAgICAgICBuICs9IDE7XHJcbiAgICAgICAgaWYgKG4gPT09IDExMCkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKS5zdHlsZS5iYWNrZ3JvdW5kID0gXCJibGFja1wiO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW1nXCIpWzBdLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW1nXCIpWzFdLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW1nXCIpWzJdLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiY2FudmFzXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIikuc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIikuc3R5bGUuekluZGV4ID0gMjAwMDAwMDtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChhbSk7XHJcbiAgICAgICAgICAgIGZvbygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJuZCA9IE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAyKSArIDEpO1xyXG4gICAgICAgIGlmIChybmQgPT09IDEpIHtcclxuICAgICAgICAgICAgbGV0IGIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXlcIikuYXBwZW5kQ2hpbGQoc25ha2VDb250YWluZXIuY2xvbmVOb2RlKHRydWUpKTtcclxuICAgICAgICAgICAgYi5hcHBlbmRDaGlsZChtZW51QmFyLmNsb25lTm9kZSh0cnVlKSk7XHJcbiAgICAgICAgICAgIGIuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xyXG4gICAgICAgICAgICBTbmFrZShiKTtcclxuICAgICAgICAgICAgYi5zdHlsZS56SW5kZXggPSBaaW5kZXgoKTtcclxuICAgICAgICAgICAgT2Zmc2V0KGIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBjID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5XCIpLmFwcGVuZENoaWxkKG1lbW9yeUNvbnRhaW5lci5jbG9uZU5vZGUodHJ1ZSkpO1xyXG4gICAgICAgICAgICBjLmFwcGVuZENoaWxkKG1lbnVCYXIuY2xvbmVOb2RlKHRydWUpKTtcclxuICAgICAgICAgICAgYy5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XHJcbiAgICAgICAgICAgIG1lbW9yeS5wbGF5TWVtb3J5KGMpO1xyXG4gICAgICAgICAgICBjLnN0eWxlLnpJbmRleCA9IFppbmRleCgpO1xyXG4gICAgICAgICAgICBPZmZzZXQoYyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGZvbygpIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Hb29nbGUgQ29weSBQYXN0ZSBmdW5jdGlvbixcclxuICAgICAgICBsZXQgYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY1wiKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAvL05vdCBteSBcIktlaXRoXCIgY29tbWVudHMgZnJvbSBoZXJlIG9uLlxyXG4gICAgICAgIGxldCBjdHggPSBjLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgLy9tYWtpbmcgdGhlIGNhbnZhcyBmdWxsIHNjcmVlblxyXG4gICAgICAgIGMuaGVpZ2h0ID0gd2luZG93Lm91dGVySGVpZ2h0ICsgMjA7XHJcbiAgICAgICAgYy53aWR0aCA9IHdpbmRvdy5vdXRlcldpZHRoICsgMjA7XHJcbiAgICAgICAgYy5zdHlsZS50b3AgPSBcIi0xMHB4XCI7XHJcbiAgICAgICAgYy5zdHlsZS5sZWZ0ID0gXCItMTBweFwiO1xyXG5cclxuICAgICAgICAvL2NoaW5lc2UgY2hhcmFjdGVycyAtIHRha2VuIGZyb20gdGhlIHVuaWNvZGUgY2hhcnNldFxyXG4gICAgICAgIGxldCBjaGluZXNlID0gXCLnlLDnlLHnlLLnlLPnlLTnlLXnlLbnlLfnlLjnlLnnlLrnlLvnlLznlL3nlL7nlL/nlYDnlYHnlYLnlYPnlYTnlYXnlYbnlYfnlYjnlYnnlYrnlYvnlYznlY3nlY7nlY/nlZDnlZFcIjtcclxuXHJcbiAgICAgICAgLy9jb252ZXJ0aW5nIHRoZSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBzaW5nbGUgY2hhcmFjdGVyc1xyXG4gICAgICAgIGNoaW5lc2UgPSBjaGluZXNlLnNwbGl0KFwiXCIpO1xyXG5cclxuICAgICAgICBsZXQgZm9udFNpemUgPSAxMDtcclxuICAgICAgICBsZXQgY29sdW1ucyA9IGMud2lkdGggLyBmb250U2l6ZTsgLy9udW1iZXIgb2YgY29sdW1ucyBmb3IgdGhlIHJhaW5cclxuICAgICAgICAvL2FuIGFycmF5IG9mIGRyb3BzIC0gb25lIHBlciBjb2x1bW5cclxuICAgICAgICBsZXQgZHJvcHMgPSBbXTtcclxuXHJcbiAgICAgICAgLy94IGJlbG93IGlzIHRoZSB4IGNvb3JkaW5hdGVcclxuICAgICAgICAvLzEgPSB5IGNvLW9yZGluYXRlIG9mIHRoZSBkcm9wKHNhbWUgZm9yIGV2ZXJ5IGRyb3AgaW5pdGlhbGx5KVxyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgY29sdW1uczsgeCArPSAxKSB7XHJcbiAgICAgICAgICAgIGRyb3BzW3hdID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vZHJhd2luZyB0aGUgY2hhcmFjdGVyc1xyXG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9CbGFjayBCRyBmb3IgdGhlIGNhbnZhc1xyXG4gICAgICAgICAgICAvL3RyYW5zbHVjZW50IEJHIHRvIHNob3cgdHJhaWxcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLCAwLCAwLCAwLjA1KVwiO1xyXG4gICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgYy53aWR0aCwgYy5oZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiIzBGMFwiOyAvL2dyZWVuIHRleHRcclxuICAgICAgICAgICAgY3R4LmZvbnQgPSBmb250U2l6ZSArIFwicHggYXJpYWxcIjtcclxuXHJcbiAgICAgICAgICAgIC8vbG9vcGluZyBvdmVyIGRyb3BzXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZHJvcHMubGVuZ3RoOyBpICs9IDEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vYSByYW5kb20gY2hpbmVzZSBjaGFyYWN0ZXIgdG8gcHJpbnRcclxuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gY2hpbmVzZVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGluZXNlLmxlbmd0aCldO1xyXG5cclxuICAgICAgICAgICAgICAgIC8veCA9IGkqZm9udF9zaXplLCB5ID0gdmFsdWUgb2YgZHJvcHNbaV0qZm9udF9zaXplXHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQodGV4dCwgaSAqIGZvbnRTaXplLCBkcm9wc1tpXSAqIGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL3NlbmRpbmcgdGhlIGRyb3AgYmFjayB0byB0aGUgdG9wIHJhbmRvbWx5IGFmdGVyIGl0IGhhcyBjcm9zc2VkIHRoZSBzY3JlZW5cclxuICAgICAgICAgICAgICAgIC8vYWRkaW5nIGEgcmFuZG9tbmVzcyB0byB0aGUgcmVzZXQgdG8gbWFrZSB0aGUgZHJvcHMgc2NhdHRlcmVkIG9uIHRoZSBZIGF4aXNcclxuICAgICAgICAgICAgICAgIGlmIChkcm9wc1tpXSAqIGZvbnRTaXplID4gYy5oZWlnaHQgJiYgTWF0aC5yYW5kb20oKSA+IDAuOTc1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJvcHNbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vaW5jcmVtZW50aW5nIFkgY29vcmRpbmF0ZVxyXG4gICAgICAgICAgICAgICAgZHJvcHNbaV0gKz0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2V0SW50ZXJ2YWwoZHJhdywgMzMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPZmZzZXQ7XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBrZWl0aCBvbiAyMDE2LTEyLTMxLlxuICovXG4vKmpzaGludCBlc25leHQ6IHRydWUgKi9cbi8qIGpzaGludCBsYXRlZGVmOm5vZnVuYyAqL1xuZnVuY3Rpb24gU25ha2Uoc291cmNlLCBteVNwZWVkPTEpIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhlIGJlZ2lubmluZyBvZiB0aGlzIHNuYWtlIGdhbWUgaXMganVzdCBkZWNsYXJpbmcgYWxsIHR5cGVzIG9mXG4gICAgbGV0IGtleSA9IFwiXCI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3ZhcmlhYmxlcyB0byBtaW5pbWl6ZSBsYWcgd2hlbiBwbGF5aW5nLCBhbmQgdGhlcmUgaXMgYSBkZWZhdWx0XG4gICAgbGV0IGludGVydmFsID0gXCJcIjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NwZWVkIHZhbHVlIGlmIGl0IGlzIG5vdCBzcGVjaWZpZWQuXG4gICAgbGV0IHJlbmRlciA9IFwiXCI7XG4gICAgbGV0IGZvb2RYID0gMDtcbiAgICBsZXQgZm9vZFkgPSAwO1xuICAgIGxldCB0YWlsYXJyID0gW107XG4gICAgbGV0IGNsb25lQm9keSA9IFtdO1xuICAgIGxldCBmb29kQ291bnQgPSAwO1xuICAgIGxldCBwb3NYID0gMjAwO1xuICAgIGxldCBwb3NZID0gMjAwO1xuICAgIGxldCBjdXJyZW50S2V5ID0gXCJcIjtcbiAgICBsZXQgcm90YXRlSGVhZCA9IFwiXCI7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzbmFrZVRlbXBsYXRlXCIpO1xuICAgIGxldCBzbmFrZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7ICAgICAgLy9CdWlsZGluZyB1cCB0aGUgc25ha2UgZ2FtZSBpbiB0aGVcbiAgICBsZXQgY29uZmlnID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50Lmxhc3RFbGVtZW50Q2hpbGQsIHRydWUpOyAgICAgIC8vRE9NIHRyZWUuXG4gICAgc291cmNlLmFwcGVuZENoaWxkKHNuYWtlKTtcbiAgICBzb3VyY2UuYXBwZW5kQ2hpbGQoY29uZmlnKTtcbiAgICBsZXQgc3BlZWQgPSBzcGVlZEZ1bmMoKTtcbiAgICBsZXQgaGVhZCA9IHNvdXJjZS5xdWVyeVNlbGVjdG9yKFwiI2hlYWRcIikuc3R5bGU7XG4gICAgbGV0IGFwcGxlID0gc291cmNlLnF1ZXJ5U2VsZWN0b3IoXCIjYXBwbGVcIikuc3R5bGU7XG4gICAgaGVhZC5sZWZ0ID0gcG9zWCArIFwicHhcIjtcbiAgICBoZWFkLnRvcCA9IHBvc1kgKyBcInB4XCI7XG4gICAgc291cmNlLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG1vdmUsIGZhbHNlKTsgICAgICAgIC8vSGVyZSBhcmUgd2hlcmUgdGhlIGdhbWUgYmVnaW5zLCBhbiBldmVudCBsaXN0ZW5lci5cbiAgICBhcHBsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9UaGF0IGlzIGxpc3RlbmluZyBvbiB0aGUgZm91ciBhcnJvdyBrZXlzIG9uIHRoZSBrZXlib2FyZFxuXG4gICAgZnVuY3Rpb24gbW92ZShldmVudCkge1xuICAgICAgICBrZXkgPSBldmVudC5rZXlDb2RlO1xuICAgICAgICBpZiAoIWdhbWVPdmVyKCkpIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9BbiBpZiBzdGF0ZW1lbnQgdGhhdCBjaGVja3MgdGhhdCBjdXJyZW50IHZhbHVlcyBhcmUgT0suXG4gICAgICAgICAgICByZXN1bHQoc291cmNlLCBmb29kQ291bnQpOyAgICAgICAgICAgICAgICAgICAgICAvL0lmIG5vdCB0aHJvd2luZyB1cyB0byB0aGUgZW5kIG9mIHRoZSBwcm9ncmFtLlxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleSA+IDM2ICYmIGtleSA8IDQxICYmIGtleSAhPT0gY3VycmVudEtleSkgeyAgIC8vSGVyZSBpdCBjaGVja3MgZm9yIGtleS5jb2RlIGZyb20gdGhlIGV2ZW50XG4gICAgICAgICAgICBjdXJyZW50S2V5ID0ga2V5O1xuICAgICAgICAgICAgaWYgKGludGVydmFsKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vSWYgbm90IHRoZSBmaXJzdCB0aW1lIHdlIHdpbGwgY2xlYXIgdGhlIGludGVydmFsIHRoYXQgaXNcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTsgICAgICAgICAgICAgICAgICAgICAvL21vdmluZyB0aGUgc25ha2Ugc28gd2UgZG9uJ3QgZW5kIHVwIHdpdGggc2V2ZXJhbCBpbnRlcnZhbHNcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChpbnRlcnZhbE1vdmUsIHNwZWVkKTsgICAgICAvL0FuZCBoZXJlIHRoZSBpbnRlcnZhbCBvZiBtb3ZpbmcgdGhlIHNuYWtlIGtpY2tzIGluXG4gICAgICAgIH1lbHNlIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vd2l0aCBhIHNwZWVkIHZhcmlhYmxlIHNvIHdlIGNhbiBhZGp1c3QgdGhlIHNwZWVkXG4gICAgICAgICAgICBrZXkgPSBjdXJyZW50S2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgcmVuZGVyID0gc2V0SW50ZXJ2YWwocmVuZGVyU25ha2UsIDApOyAgICAgICAgICAgICAgICAvL0EgcmVuZGVyIEludGVydmFsIHRoYXQgZmlyZXMgYXMgbWFueSB0aW1lcyBhcyBwb3NzaWJsZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlclNuYWtlKCkgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vSXQgaXMgaW4gdGhpcyBpbnRlcnZhbCB0aGUgc25ha2Ugd2lsbCBiZSBwcmludGVkIG9uIHRoZVxuICAgICAgICBoZWFkLnRvcCA9IHBvc1kgKyBcInB4XCI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2RvY3VtZW50LCBmaXJzdCBJIGhhZCB0aGUgcmVuZGVyIHByb2NlZHVyZSBpbiB0aGUgc2FtZVxuICAgICAgICBoZWFkLmxlZnQgPSBwb3NYICsgXCJweFwiOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnRlcnZhbCBhcyB0aGUgbW92ZSBpbnRlcnZhbCBidXQgaXQgZGlkbid0IGVuZCB1cCBzbyBuaWNlXG4gICAgICAgIGhlYWQudHJhbnNmb3JtID0gcm90YXRlSGVhZDsgICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3IgdGhlIGV5ZSwgaXQgYmVjYW1lIGEgYml0IGxhZ2d5IGF0IGhpZ2ggc3BlZWRzLlxuICAgICAgICBhcHBsZS50b3AgPSBmb29kWSArIFwicHhcIjtcbiAgICAgICAgYXBwbGUubGVmdCA9IGZvb2RYICsgXCJweFwiO1xuICAgICAgICBpZiAoZm9vZENvdW50ID4gMCkge1xuICAgICAgICAgICAgdGFpbCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW50ZXJ2YWxNb3ZlKCkgeyAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGlzIHRoZSBpbnRlcnZhbCBmb3IgbW92aW5nIHRoZSBoZWFkIG9mIHRoZSBzbmFrZVxuICAgICAgICBpZiAoa2V5ID09PSAzNykgeyAgIC8vbGVmdCAgICAgICAgICAgICAgICAgIC8vQW5kIGFzc2lnbmluZyB0aGUgY29ycmVjdCB2YWx1ZXMgZm9yIHggYW5kIHkgY29vcmRpbmF0ZXNcbiAgICAgICAgICAgIHBvc1ggLT0gNTA7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0FuZCB3aGljaCB3YXkgdGhlIGhlYWQgc2hvdWxkIHJvdGF0ZVxuICAgICAgICAgICAgcm90YXRlSGVhZCA9IFwicm90YXRlKDkwZGVnKVwiO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gMzgpIHsgICAvL3VwXG4gICAgICAgICAgICBwb3NZIC09IDUwO1xuICAgICAgICAgICAgcm90YXRlSGVhZCA9IFwicm90YXRlKDE4MGRlZylcIjtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDM5KSB7ICAgLy9yaWdodFxuICAgICAgICAgICAgcG9zWCArPSA1MDtcbiAgICAgICAgICAgIHJvdGF0ZUhlYWQgPSBcInJvdGF0ZSgyNzBkZWcpXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSA0MCkgeyAgIC8vZG93blxuICAgICAgICAgICAgcG9zWSArPSA1MDtcbiAgICAgICAgICAgIHJvdGF0ZUhlYWQgPSBcInJvdGF0ZSgwZGVnKVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFpbGFyci5wdXNoKHtwb3N4OiBwb3NYLCBwb3N5OiBwb3NZfSk7ICAgICAvL3RoaXMgaXMgYW4gT2JqZWN0IHRvIHN0b3JlIG9sZCBwb3NpdGlvbiBvZiB0aGUgaGVhZCBzbyB3ZSBjYW4gdXNlXG4gICAgICAgIGlmIChmb29kWCA9PT0gcG9zWCAmJiBmb29kWSA9PT0gcG9zWSkgeyAgICAgLy9mb3IgdGhlIHRhaWwuXG4gICAgICAgICAgICBmb29kKCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9IZXJlIGl0IGNoZWNrcyBpZiB3ZSBoaXQgYSBmb29kIG9iamVjdCBhbmQgaWYgc28gaXQgd2lsbCBwcm9kdWNlIGEgbmV3IG9uZVxuICAgICAgICAgICAgaWYgKHNwZWVkID4gMTUwKSB7ICAgICAgICAgICAgICAgICAgICAgIC8vSWYgdSBlYXQgdSBnZXQgZmFzdGVyIVxuICAgICAgICAgICAgICAgIHNwZWVkIC09IDY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWdhbWVPdmVyKCkpIHsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQW5kIGhlcmUgaXQgY2hlY2tzIHRoZSB2YWx1ZXMgYWdhaW4gc28gd2UgY2FuIHBsYXkgb25cbiAgICAgICAgICAgIHJlc3VsdChzb3VyY2UsIGZvb2RDb3VudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb29kKCkge1xuICAgICAgICBsZXQgZm9vZFBsYWNlID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxNSAmJiBmb29kUGxhY2UgPT09IGZhbHNlOyBqICs9IDEpIHsgICAgICAgICAgIC8vSGVyZSBpdCBwcm9kdWNlIGZvb2QgY29vcmRpbmF0ZXNcbiAgICAgICAgICAgIGZvb2RYID0gTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIDEwKSkgKiA1MDsgICAgICAgICAgICAgICAgICAvL0FuZCBpdCB0cmllcyB0byBwbGFjZSBpdCBvbiByYW5kb20gbG9jYXRpb25zXG4gICAgICAgICAgICBmb29kWSA9IE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAxMCkpICogNTA7ICAgICAgICAgICAgICAgICAgLy9CdXQgSSBkaWQgZ2V0IGxldCBpdCBoYXZlIG5vIG1vcmUgdGhlbiAxNSB0cmllc1xuICAgICAgICAgICAgZm9vZFBsYWNlID0gdHJ1ZTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vU2luY2Ugd2hlbiB1IGdldCBhIGJpZyB3b3JtIHRoZXJlIGlzIG1vcmUgbGlrZWx5XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvb2RDb3VudCAmJiBmb29kUGxhY2UgPT09IHRydWU7IGkgKz0gMSkgeyAgLy90aGUgZm9vZCBlbmQgdXAgdW5kZXIgdGhlIHNuYWtlIHNvIEkgY291bGRuJ3RcbiAgICAgICAgICAgICAgICBpZiAodGFpbGFyclt0YWlsYXJyLmxlbmd0aCAtIGkgLSAxXS5wb3N4ID09PSBmb29kWCAmJiAgICAgICAvL2hhdmUgaXQgaW4gYSB3aGlsZSBsb29wIGZvciBldmVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgdGFpbGFyclt0YWlsYXJyLmxlbmd0aCAtIGkgLSAxXS5wb3N5ID09PSBmb29kWSkge1xuICAgICAgICAgICAgICAgICAgICBmb29kUGxhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvb2RQbGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2xvbmVCb2R5W2Zvb2RDb3VudF0gPSBzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNzbmFrZUJvZHlcIikuY2xvbmVOb2RlKHRydWUpOyAgICAgICAgICAvL0Nsb25pbmcgYW5kIGFwcGVuZGluZyBhIGJvZHkgcGFydFxuICAgICAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNzbmFrZVwiKS5hcHBlbmRDaGlsZChjbG9uZUJvZHlbZm9vZENvdW50XSk7XG4gICAgICAgIGNsb25lQm9keVtmb29kQ291bnRdLnN0eWxlLmxlZnQgPSB0YWlsYXJyW3RhaWxhcnIubGVuZ3RoIC0gZm9vZENvdW50IC0gM10ucG9zeCArIFwicHhcIjsgLy9HaXZpbmcgaXQgYSBwb3NpdGlvblxuICAgICAgICBjbG9uZUJvZHlbZm9vZENvdW50XS5zdHlsZS50b3AgPSB0YWlsYXJyW3RhaWxhcnIubGVuZ3RoIC0gZm9vZENvdW50IC0gM10ucG9zeSArIFwicHhcIjtcbiAgICAgICAgZm9vZENvdW50ICs9IDE7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZm9vZENvdW50ZXJcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0YWlsKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvb2RDb3VudDsgaSArPSAxKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1RoaXMgaXMgdGhlIHRhaWwgcmVwb3NpdGlvbmluZyBwcm9jZXNzXG4gICAgICAgICAgICBpZiAoY2xvbmVCb2R5W2ldLm9mZnNldFRvcCA9PT0gdGFpbGFyclt0YWlsYXJyLmxlbmd0aCAtIGZvb2RDb3VudCAtIDJdLnBvc3kgJiYgIC8vRmlyc3QgSSBoYWQgYSBzb2x1dGlvbiB0byByZXBvc2l0aW9uaW5nXG4gICAgICAgICAgICAgICAgY2xvbmVCb2R5W2ldLm9mZnNldExlZnQgPT09IHRhaWxhcnJbdGFpbGFyci5sZW5ndGggLSBmb29kQ291bnQgLSAyXS5wb3N4KSB7IC8vZXZlcnkgYm9keSBwYXJ0IGJ1dCBJIGRpZCBjb21lIHVwIHdpdGhcbiAgICAgICAgICAgICAgICBjbG9uZUJvZHlbaV0uc3R5bGUubGVmdCA9IHRhaWxhcnJbdGFpbGFyci5sZW5ndGggLSAyXS5wb3N4ICsgXCJweFwiOyAgICAgICAgICAvL2EgY29uY2x1c2lvbiBpdCBpcyBvbmx5IHRoZSBsYXN0IGJvZHlcbiAgICAgICAgICAgICAgICBjbG9uZUJvZHlbaV0uc3R5bGUudG9wID0gdGFpbGFyclt0YWlsYXJyLmxlbmd0aCAtIDJdLnBvc3kgKyBcInB4XCI7ICAgICAgICAgICAvL3BhcnQgdGhhdCBpcyBpbiBuZWVkIG9mIG1vdmluZy5cbiAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TbyB0aGUgbGFzdCBib2R5IHBhcnQgd2lsbCBlbmQgdXAgdG8gdGhlIGZpcnN0LlxuXG4gICAgICAgICAgICBjbG9uZUJvZHlbaV0uc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgICAgaWYgKHRhaWxhcnIgPiBmb29kQ291bnQgKyAxMCkgeyAgICAgICAgICAgICAgICAgLy9kZWxldGluZyBzb20gY29vcmRpbmF0ZXMgdGhhdCBpcyBub3QgbmVjZXNzYXJ5IGFueW1vcmUuXG4gICAgICAgICAgICAgICAgdGFpbGFyci5zcGxpY2UoMCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnYW1lT3ZlcigpIHtcbiAgICAgICAgaWYgKCEocG9zWCA+PSAwICYmIHBvc1kgPj0gMCAmJiBwb3NYICsgNTAgPD0gNTAwICYmIHBvc1kgKyA1MCA8PSA1MDApKSB7XG4gICAgICAgICAgICBzb3VyY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgbW92ZSwgZmFsc2UpO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3doZW4gZ2FtT3ZlciBpcyB0cnVlIGl0IHJlbW92ZXMgZXZlbnRzIGFuZCBpbnRlcnZhbHNcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwocmVuZGVyKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZm9vZENvdW50OyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmICh0YWlsYXJyW3RhaWxhcnIubGVuZ3RoIC0gaSAtIDJdLnBvc3kgPT09IHBvc1kgJiYgdGFpbGFyclt0YWlsYXJyLmxlbmd0aCAtIGkgLSAyXS5wb3N4ID09PSBwb3NYKSB7XG4gICAgICAgICAgICAgICAgc291cmNlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG1vdmUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHJlbmRlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3BlZWRGdW5jKCkge1xuICAgICAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNteVNwZWVkXCIpLnZhbHVlID0gbXlTcGVlZC50b1N0cmluZygpOyAgICAvL0hlcmUgaXQgc2F2ZSB0aGUgc3BlZWQgdSBjaG9zZW5cbiAgICAgICAgcmV0dXJuIDUwMCAtIG15U3BlZWQ7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vSXQgd2lsbCBiZSByZXNldGVkIGlmIGNsb3NpbmcuXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZXN1bHQoc291cmNlLCBmb29kQ291bnQpIHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGxldCBnYW1lT3ZlciA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiR2FtZSBPdmVyIVwiKTtcbiAgICBpZiAoIWxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic25ha2VcIikpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJzbmFrZVwiLCBmb29kQ291bnQpO1xuICAgICAgICByZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIllvdXIgc2NvcmU6IFwiICsgZm9vZENvdW50ICsgXCIgbmV3IGhpZ2ggc2NvcmUhXCIpO1xuICAgIH1lbHNlIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInNuYWtlXCIpIDwgZm9vZENvdW50KSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwic25ha2VcIik7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwic25ha2VcIiwgZm9vZENvdW50KTtcbiAgICAgICAgcmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJZb3VyIHNjb3JlOiBcIiArIGZvb2RDb3VudCArIFwiIG5ldyBoaWdoIHNjb3JlIVwiKTtcbiAgICB9ZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiWW91ciBzY29yZTogXCIgKyBmb29kQ291bnQgKyBcIiwgaGlnaCBzY29yZSBpcyA6IFwiICsgbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzbmFrZVwiKSk7XG4gICAgfVxuXG4gICAgbGV0IHNuYWtlID0gc291cmNlLnF1ZXJ5U2VsZWN0b3IoXCIjc25ha2VcIik7ICAgICAgICAgICAgIC8vU2F2aW5nIGhpZ2hTY29yZSB0byBsb2NhbHN0b3JhZ2UgYW5kIHByaW50aW5nIG91dFxuICAgIHNuYWtlLmlubmVySFRNTCA9IFwiXCI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2dhbWUgb3ZlciBtZXNzYWdlXG4gICAgbGV0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBwLmFwcGVuZENoaWxkKGdhbWVPdmVyKTtcbiAgICBwLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XG4gICAgcC5hcHBlbmRDaGlsZChyZXN1bHQpO1xuICAgIHNuYWtlLmFwcGVuZENoaWxkKHApO1xufVxuXG5TbmFrZS5wcm90b3R5cGUuUmVTdGFydCA9IGZ1bmN0aW9uIHJlc3RhcnQoc291cmNlKSB7ICAgICAgICAvL3Jlc3RhcnRpbmcgYnkgY2xvbmluZyBhIG5ldyBub2RlIGFuZCBkZWxldGluZyB0aGUgY3VycmVudFxuICAgIGxldCBzcGVlZDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9zYXZpbmcgdGhlIG9sZCBzcGVlZC5cbiAgICBpZiAoc291cmNlLnF1ZXJ5U2VsZWN0b3IoXCIjc25ha2VcIikpIHtcbiAgICAgICAgc291cmNlLnF1ZXJ5U2VsZWN0b3IoXCIjc25ha2VcIikucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNzbmFrZVwiKSk7XG4gICAgfVxuXG4gICAgaWYgKHNvdXJjZS5xdWVyeVNlbGVjdG9yKFwiI3NuYWtlQ29uZmlnXCIpKSB7XG4gICAgICAgIHNwZWVkID0gcGFyc2VJbnQoc291cmNlLnF1ZXJ5U2VsZWN0b3IoXCIjbXlTcGVlZFwiKS52YWx1ZSk7XG4gICAgICAgIHNvdXJjZS5xdWVyeVNlbGVjdG9yKFwiI3NuYWtlQ29uZmlnXCIpLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc291cmNlLnF1ZXJ5U2VsZWN0b3IoXCIjc25ha2VDb25maWdcIikpO1xuICAgIH1cblxuICAgIGlmIChzb3VyY2UucXVlcnlTZWxlY3RvcihcIi5tZW51Q29udGFpbmVyXCIpKSB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudUJhclwiKTtcbiAgICAgICAgbGV0IG1lbnVCYXIgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgICAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcIi5tZW51Q29udGFpbmVyXCIpLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc291cmNlLnF1ZXJ5U2VsZWN0b3IoXCIubWVudUNvbnRhaW5lclwiKSk7XG4gICAgICAgIHNvdXJjZS5hcHBlbmRDaGlsZChtZW51QmFyLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgfVxuXG4gICAgU25ha2Uoc291cmNlLCBzcGVlZCk7ICAgICAgIC8vU3RhcnRpbmcgdGhlIG5ldyBub2RlIHBhc3NpbmcgdGhlIG9sZCBzcGVlZCB3aXRoIGl0LlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTbmFrZTtcblxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGtlaXRoIG9uIDIwMTctMDEtMDMuXG4gKi9cbi8qanNoaW50IGVzbmV4dDogdHJ1ZSAqL1xuLyoganNoaW50IGxhdGVkZWY6bm9mdW5jICovXG5sZXQgU25ha2UgPSByZXF1aXJlKFwiLi9zbmFrZS5qc1wiKTtcbmZ1bmN0aW9uIFNuYWtlQ29uZmlnKGV2ZW50KSB7XG5cbiAgICBsZXQgc291cmNlID0gZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUucGFyZW50Tm9kZTtcblxuICAgIHNvdXJjZS5xdWVyeVNlbGVjdG9yKFwiI3NuYWtlQ29uZmlnXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgc291cmNlLnF1ZXJ5U2VsZWN0b3IoXCIjc25ha2VDb25maWdcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgIHNvdXJjZS5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHN1Ym1pdCwgZmFsc2UpO1xuICAgIGZ1bmN0aW9uIHN1Ym1pdChldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNzbmFrZUNvbmZpZ1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIGlmIChzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNzbmFrZVwiKSkge1xuICAgICAgICAgICAgc291cmNlLnF1ZXJ5U2VsZWN0b3IoXCIjc25ha2VcIikucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzb3VyY2UucXVlcnlTZWxlY3RvcihcIiNzbmFrZVwiKSk7XG4gICAgICAgIH1cblxuICAgICAgICBTbmFrZS5wcm90b3R5cGUuUmVTdGFydChzb3VyY2UpO1xuICAgICAgICBzb3VyY2UucXVlcnlTZWxlY3RvcihcImZvcm1cIikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBzdWJtaXQpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTbmFrZUNvbmZpZztcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGtlaXRoIG9uIDIwMTctMDEtMDMuXHJcbiAqL1xyXG5mdW5jdGlvbiBaaW5kZXgoKSB7XHJcbiAgICBaaW5kZXguY291bnQgPSAoWmluZGV4LmNvdW50ICs9IDEpIHx8IDE7ICAgIC8vdGhpcyBmdW5jdGlvbiBhY3RzIGxpa2UgYSBzdGF0aWMgZnVuY3Rpb24gaXQgYWx3YXlzIHJldHVybnNcclxuICAgIHJldHVybiBaaW5kZXguY291bnQ7ICAgICAgICAgICAgICAgICAgICAgICAgLy9hbiBpbmNyZWFzZWQgbnVtYmVyIHRoYXQgSW0gdXNpbmcgdG8gY29udHJvbCB0aGUgZGl2IHdpbmRvd3Mgei1pbmRleFxyXG59ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NvIHRoZXkgY2FuIGdvIG9uIHRvcCBvZiBlYWNoIG90aGVyIG9uIG15IGNvbmRpdGlvbnNcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gWmluZGV4O1xyXG4iXX0=
