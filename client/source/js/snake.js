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

