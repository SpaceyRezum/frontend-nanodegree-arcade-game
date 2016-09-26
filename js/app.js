// This is a new class: boats that can transport the player over the water
var Boat = function() {
    this.sprite = "images/little-boat.png";
    // initiate boats randomly on the water rows
    this.x = Math.random() * 500;
    // create a boatSpeed variable to attach to player's position once on a boat
    var boatSpeed = 100;
    this.speed = boatSpeed;
    // initiate one and only one boat per water row
    this.y = topWhiteSquare + (indexWaterRows[indexWaterRows.length-1] - 1) * drawnSquareHeight;
    indexWaterRows.pop();
};

Boat.prototype.render = function() {
    if (this.x > (numCols*cellWidth)) {
        this.x = 0;
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };
}

Boat.prototype.update = function(dt) {
    this.x += this.speed * dt;
}


// Rewrite the enemy class using the Boat Class. Boats are simpler version of enemies.
var Enemy = function() {
    this.sprite = 'images/enemy-bug.png';
    this.x = 0;
    /* initialRow randomly provides us the row on which the enemy
     * will be created. It takes into account the index of
     * rows with stones, then randomly picks one of them and initiate
     * the enemy on it. The formula used to pick a random number within the array
     * is the following Math.floor(Math.random() * (max - min)). This assumes that
     * the max = indexStoneRows.length (max is excluded) and the min = 0 (min is included).
     */
    var initialRow = indexStoneRows[Math.floor(Math.random() * (indexStoneRows.length))];
    // topWhiteSquare (51px) represents the white space at the top.
    this.y = topWhiteSquare + (initialRow - 1) * drawnSquareHeight;
    /* Initial speed is equal to 0 and will be modified
     * when the first position update runs.
     */
    this.speed = 0;
};

// Update the enemy's position
Enemy.prototype.update = function(dt) {
    if (this.speed === 0) {
        /* Checks whether speed variable has been set already (i.e. if
         * the instance of the enemy just got created or if it just reached
         * the end of the canvas) and sets it randomly.
         */
        this.speed = (Math.random() + 1) * 100;
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
    // console.log(Math.floor(indexStoneRows[Math.floor(Math.random() * (4))]));
    /* Add the option no to render if the enemy is off the canvas.
     * If this is true, the x and y coordinates and the speed are reset to 0.
     */
    if (this.x > (numCols*cellWidth)) {
        var initialRow = indexStoneRows[Math.floor(Math.random() * (indexStoneRows.length))];
        this.y = topWhiteSquare + (initialRow - 1) * drawnSquareHeight;
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
    // Next lines allow the player to surf with the boat off-canvas
    if (this.x > (numCols) * cellWidth) {
        this.x = 0;
    };
    // insert life up and down functions
    // insert winning conditions
    // insert level up functions
};

/* This method gets the input from the keyup event listener and transforms it
 * into player moves on x and y axes. The function also allows the player to follow
 * enemies and boats when going off-canvas.
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
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


/* These lines will set a time interval of 4s to generate
 * new enemies until their number reaches the max amount set
 * by the difficulty level.
 */
var addMoreEnemies = function() {
    allEnemies.push(new Enemy());
    window.setInterval(function() {
        // Restricts the total number of enemies to (number of stone rows * 2)
        if (allEnemies.length > ((indexStoneRows.length * 2) - 1)) {
            clearInterval(addMoreEnemies);
        } else {
            allEnemies.push(new Enemy());
            console.log(allEnemies);
        };
    },2000);
}

var addBoats = function() {
    for (var i = 0; i < indexWaterRows.length + 1; i++) {
        allBoats.push(new Boat());
    };
}

// Check for collisions between player and enemies & player and boats
var checkCollisions = function() {
    for (var i = 0; i < allEnemies.length; i++) {
        if (player.y === (allEnemies[i].y + 17)) {
        // After some testing, I found out that exactly 17 pixels were separating
        // enemies.y and player.y coordinates on each and every row (same goes for boats).
            if (player.x > (allEnemies[i].x - cellWidth*2/3) && player.x < (allEnemies[i].x + cellWidth*2/3)) {
                player.x = PlayerInitX;
                player.y = PlayerInitY;
            };
        };
    };
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


// Instantiate a player and creates the array for instantiating enemies and boats
var player = new Player(),
    allEnemies = [],
    allBoats = [];


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
