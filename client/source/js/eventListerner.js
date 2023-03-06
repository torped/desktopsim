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
