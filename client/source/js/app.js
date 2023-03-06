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

