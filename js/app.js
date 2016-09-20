// Enemies our player must avoid
var Enemy = function() {
    this.sprite = 'images/enemy-bug.png';
};

// Determine the enemy's initial position randomly
Enemy.prototype.initialPosition = function() {
    this.x = 0;
    var initialRow = numWaterRows + (Math.floor((Math.random() * (numStoneRows + 1)) + 1));
    /* initialRow randomly provides us the row on which the enemy
     * will be created. It takes into account the number of
     * rows with water and the amount of rows with stones. It then calculates
     * a number randomly between (0 + numWaterRows) and
     * (0 + numWaterRows + numStoneRows).
     */
    this.y = initialRow * cellHeight;
    // To get the exact y coordinate, we must multiply
    // the initial row number with our cellHeight
    this.speed = 0;
    // Initial speed is equal to 0 and will be modified
    // when the first position update runs.
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if (this.speed === 0) {
        /* If speed variable has not yet been set (i.e. when
         * the instance of the enemy just got created), set it
         * by randomly picking an amount of column the enemy could
         * "jump" every tick.
         */
        this.speed = (Math.floor((Math.random() * (numCols + 1)) + 1));
        this.x += this.speed * dt;
        // Use of dt to smoothen enemies movements
    } else {
        this.x += this.speed * dt;
    };
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
