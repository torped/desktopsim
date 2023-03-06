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
