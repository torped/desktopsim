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
