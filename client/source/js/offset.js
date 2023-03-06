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

    function foo() {                                                    //Google Copy Paste function,
        let c = document.getElementById("c");                           //Not my "Keith" comments from here on.
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
