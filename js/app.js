// A boat class. Boats can transport the player over water blocks
var Boat = function() {
    this.sprite = "images/little-boat.png";
    // Initiates boats randomly on the water rows
    this.x = 150 / Math.random();
    // Creates a boatSpeed variable to attach to player's position once on a boat
    var boatSpeed = 50;
    this.speed = boatSpeed;
    // initiate one and only one boat per row of water blocks
    this.y = topWhiteSquare + (indexWaterRows[indexWaterRows.length-1] - 1) * drawnSquareHeight;
    indexWaterRows.pop();
};

Boat.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Boat.prototype.update = function(dt) {
    this.x += this.speed * dt;
    // Allows the boat to surf back to the left-hand side of the canvas
    if (this.x > (numCols*cellWidth)) {
        this.x = 0
    };
};



var Enemy = function() {
    this.sprite = 'images/enemy-bug.png';
    /* initialRow randomly provides us the row on which the enemy will be created.
     * It takes into account the index of rows with stones, then randomly picks
     * one of them and initiates the enemy on it. The formula used to pick a random
     * number within the array is the following: Math.floor(Math.random() * (max - min))
     * where max(excluded) = indexStoneRows.length, and min(included) = 0.
     */
    var initialRow = indexStoneRows[Math.floor(Math.random() * (indexStoneRows.length))];
    // topWhiteSquare (51px) represents the white space at the top.
    this.y = topWhiteSquare + (initialRow - 1) * drawnSquareHeight;
    this.x = 150 / Math.random();
    // Initial speed is 0 and will be modified when the first position update runs
    this.speed = 0;
};

// Update the enemy's position and speed
Enemy.prototype.update = function(dt) {
    if (this.speed === 0) {
        /* Checks whether speed variable has been set already (i.e. if the
         * instance of the enemy class just got created or if it reached the
         * end of the canvas) and sets it randomly.
         */
        this.speed = (Math.random() + 1) * 75;
        // Use of dt to smoothen enemy movements
        this.x += this.speed * dt;
    } else {
        /* this line assumes that the instance's speed has already
         * been set. It therefore adds another "jump" to the enemy's
         * x coordinate, making it move to the right.
         */
        this.x += this.speed * dt;
    };

    /* Add the option not to render if the enemy is off-canvas. If this condition
     * is true, the x and y coordinates and the speed are reset to initial values.
     */
    if (this.x > (numCols*cellWidth)) {
        var initialRow = indexStoneRows[Math.floor(Math.random() * (indexStoneRows.length))];
        this.y = topWhiteSquare + (initialRow - 1) * drawnSquareHeight;
        this.x = 0;
        this.speed = 0;
    };
};

// Draw enemies on screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};



// The player class
var Player = function() {
    this.sprite = 'images/char-boy.png';
    /* Sets our player's initial position using relative values so that a
     * change in canvas size would not require a lot of changes in our game.
     */
    playerInitX = Math.floor(numCols / 2) * cellWidth;
    playerInitY = (numRows - 2) * cellHeight;
    this.x = playerInitX;
    this.y = playerInitY;
};

Player.prototype.update = function() {
    // corrects player position when surfing on the boat to the edge
    // of the screen and prevents player from surfing off-canvas.
    if (this.x > (numCols - 1) * cellWidth) {
        this.x = (numCols - 1) * cellWidth;
    };
};

/* This method gets the input from the keyup event listener and transforms it
 * into player moves on x and y axes. The function also allows the player to follow
 * enemies and boats when going off-canvas.
 */
Player.prototype.handleInput = function(keypressed) {
    if (keypressed === "up") {
        this.y -= drawnSquareHeight;
        if (this.y < (-1)*drawnSquareHeight) {
            this.y += drawnSquareHeight;
        };
    } else if (keypressed === "down") {
        this.y += drawnSquareHeight;
        if (this.y > (numRows - 2) * cellHeight) {
            this.y -= drawnSquareHeight;
        };
    } else if (keypressed === "right") {
        this.x += cellWidth;
        if (this.x > (numCols) * cellWidth) {
            this.x -= cellWidth;
        };
    } else if (keypressed === "left") {
        this.x -= cellWidth;
        if (this.x < 0) {
            this.x += cellWidth;
        };
    };
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};



// New simple class: a winning tile the player must reach
var WinningTile = function() {
    this.sprite = 'images/winning-tile.png';
    this.x = Math.floor(numCols / 2) * cellWidth;
    this.y = (-33);
}



/* These lines will set a time interval of 4s to generate
 * new enemies until their number reaches the max amount set
 * by the difficulty level.
 */
var addMoreEnemies = function() {
    allEnemies.push(new Enemy());
    while (allEnemies.length < indexStoneRows.length) {
        allEnemies.push(new Enemy());
    };
}

// Function to add a boat per water row
var addBoats = function() {
    for (var i = 0; i < indexWaterRows.length + 1; i++) {
        allBoats.push(new Boat());
    };
}



// Check for collisions between player and enemies & player and boats
var checkCollisions = function() {
    // Collisions with enemies
    for (var i = 0; i < allEnemies.length; i++) {
        if (player.y === (allEnemies[i].y + 17)) {
        // After some testing, I found out that exactly 17 pixels were separating
        // enemies.y and player.y coordinates on each and every row (same goes for boats).
            if (player.x > (allEnemies[i].x - cellWidth*2/3) && player.x < (allEnemies[i].x + cellWidth*2/3)) {
                player.x = playerInitX;
                player.y = playerInitY;
            };
        };
    };
    // Player & boats interactions
    for (var i = 0; i < allBoats.length; i++) {
        if (player.y === (allBoats[i].y + 17)) {
            if (player.x > (allBoats[i].x - cellWidth*5/6) && player.x < (allBoats[i].x + cellWidth*5/6)) {
                player.x = allBoats[i].x;
            } else {
                player.y += drawnSquareHeight;
            };
        };
    };
};

var checkWinningCondition = function() {
    if (player.y === (winningTile.y + 17)) {
        if (player.x > (winningTile.x - cellWidth*2/3) && player.x < (winningTile.x + cellWidth*2/3)) {
            return true;
        };
    };
}

// Instantiate a player and creates the array for instantiating enemies and boats
var player = new Player(),
    allEnemies = [],
    allBoats = [],
    winningTile = new WinningTile();


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
