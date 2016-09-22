// Enemies our player must avoid
var Enemy = function() {
    this.sprite = 'images/enemy-bug.png';

    this.x = 0;
    /* initialRow randomly provides us the row on which the enemy
     * will be created. It takes into account the number of
     * rows with water and the number of rows with stones. It then
     * randomly picks an integer between (numWaterRows) and
     * (numWaterRows + numStoneRows).
     */
    var initialRow = numWaterRows + (Math.floor((Math.random() * (numStoneRows)) + 1));
    // Randomly sets the enemy's initial position
    // topWhiteSquare (51px) represents the white space at the top.
    this.y = topWhiteSquare + (initialRow - 2) * drawnSquareHeight;

    /* Initial speed is equal to 0 and will be modified
     * when the first position update runs.
     */
    this.speed = 0;
};

/* Update the enemy's position, required method for game
 * Parameter: dt, a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    if (this.speed === 0) {
        /* Checks whether speed variable has been set already (i.e. if
         * the instance of the enemy just got created or if it just reached
         * the end of the canvas) and sets it randomly.
         */
        this.speed = Math.random() * 100;
        // Use of dt to smoothen enemies movements
        this.x += this.speed * dt;
    } else {
        /* this line assumes that the instance's speed has already
         * been set. It therefore adds another "jump" to the enemy's
         * x coordinate, making it move to the right.
         */
        this.x += this.speed * dt;
    };
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    /* Add the option no to render if the enemy is off the canvas.
     * If this is true, the x coordinate and the speed are reset to 0.
     */
    if (this.x > (numCols*cellWidth)) {
        this.x = 0;
        this.speed = 0;
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };
};

// Our player class
var Player = function() {
    this.sprite = 'images/char-boy.png';
    /* Set our player's initial position using relative values so that a
     * change in canvas size would not require a lot of changes in our game.
     */
    PlayerInitX = Math.floor(numCols / 2) * cellWidth;
    PlayerInitY = (numRows - 2) * cellHeight;
    this.x = PlayerInitX;
    this.y = PlayerInitY;
};

Player.prototype.update = function() {
    // place for checkColision();
};

/* This method gets the input from the keyup event listener and transforms it
 * into player moves on x and y axes. The function also restricts the player from
 * going off-canvas.
 */
Player.prototype.handleInput = function(keypressed) {
    if (keypressed === "up") {
        this.y -= drawnSquareHeight;
        if (this.y < topWhiteSquare) {
            this.y = PlayerInitY;
            this.x = PlayerInitX;
        };
    } else if (keypressed === "down") {
        this.y += drawnSquareHeight;
        if (this.y > (numRows - 2) * cellHeight) {
            this.y -= drawnSquareHeight;
        };
    } else if (keypressed === "right") {
        this.x += cellWidth;
        if (this.x > (numCols - 1) * cellWidth) {
            this.x -= cellWidth;
        };
    } else if (keypressed === "left") {
        this.x -= cellWidth;
        if (this.x < 0) {
            this.x += cellWidth;
        };
    };
    console.log("this is player.x & y: ",this.x,this.y);
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* These lines will set a time interval of 4s to generate
 * new enemies until their number reaches the max amount set
 * by the difficulty level.
 */
var addMoreEnemies = window.setInterval(function() {
    if (allEnemies.length > 4) {
        clearInterval(addMoreEnemies);
    };
    allEnemies.push(new Enemy());
    console.log(allEnemies.length);
},4000);



// Now instantiate your objects. The game starts with one enemy.
var allEnemies = [
    enemy = new Enemy()
],
    player = new Player();


/* This listens for key presses and sends the keys to your
 * Player.handleInput() method. You don't need to modify this.
 */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
