/**
 * Created by keith on 2017-01-03.
 */
function Zindex() {
    Zindex.count = (Zindex.count += 1) || 1;    //this function acts like a static function it always returns
    return Zindex.count;                        //an increased number that Im using to control the div windows z-index
}                                               //so they can go on top of each other on my conditions

module.exports = Zindex;
