/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in app.js).
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */
var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    // Set some basic context text drawing styles
    ctx.font = "30px Impact";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    /* These variables hold the relative URL to the image used
     * for that particular row of the game level.
     */
    var waterBlock = 'images/water-block.png',
        stoneBlock = 'images/stone-block.png',
        grassBlock = 'images/grass-block.png';

    /* I chose to make the information about rows & colums
     * globally available so developers can use it in other files.
     */
    numRows = 6;
    numCols = 5;
    cellHeight = canvas.height / numRows;
    cellWidth = canvas.width / numCols;
    // drawnSquareHeight represents the "walkable" bloc of a row image
    drawnSquareHeight = 84;
    // topWhiteSquare represents the amount of transparent pixels at the top of images
    topWhiteSquare = 51;
    currentLevel = 1;
    // This array holds the composition of different levels
    levelRows = [
        [grassBlock, stoneBlock, stoneBlock, stoneBlock, grassBlock, grassBlock],
        [grassBlock, waterBlock, stoneBlock, stoneBlock, grassBlock, grassBlock],
        [grassBlock, waterBlock, stoneBlock, stoneBlock, waterBlock, grassBlock],
        [grassBlock, waterBlock, stoneBlock, waterBlock, stoneBlock, grassBlock]
    ];


    // Locates the water & stone rows and saves their index number.
    function countSpecialRows() {
        indexStoneRows = [];
        indexWaterRows = [];
        for (i = 0; i < levelRows[currentLevel - 1].length; i++) {
            if (levelRows[currentLevel - 1][i].includes("stone") === true) {
                indexStoneRows.push(i);
            } else if (levelRows[currentLevel - 1][i].includes("water") === true) {
                indexWaterRows.push(i);
            };
        };
    }

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         * An ID is given to the request so that we can cancel it later.
         */
        frame = win.requestAnimationFrame(main);

        /* Next lines check whether the player has reached the winning tile and
         * if so, the currentlevel variable goes up by one and the game restarts.
         */
        if (checkWinningCondition()) {
            win.cancelAnimationFrame(frame);
            player.x = playerInitX;
            player.y = playerInitY;
            currentLevel += 1;
            allEnemies = [];
            allBoats = [];
            // Before reseting the game, checks game end conditions and restarts
            // the game all over when player presses spacebar.
            if (currentLevel > levelRows.length) {
                drawField(1);
                showWelcomeMenu();
                currentLevel = 1;
            } else {
                reset();
            };
        };
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        document.addEventListener("keyup", function(e) {
            // Activates the game when spacebar is hit.
            if (e.keyCode === 32) {
                countSpecialRows();
                addBoats();
                addMoreEnemies();
                main();
            };
        });
    }

    /* This function is called by main() and itself calls all
     * the functions which may need to update the various entities' data.
     * It also checks for player-with-enemy and player-with-boat collisions.
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    /* This is called by the update function and loops through all of the
     * objects within allEnemies and allBoats arrays as defined in app.js and calls
     * their update() methods. It will then call the update function for the
     * player object.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        allBoats.forEach(function(boat) {
            boat.update(dt);
        });
        player.update();
    }

    /* Once the data for all entities has been updated, the game renders the field
     * and entities accordingly.
     */
    function render() {
        drawField(currentLevel);
        renderEntities();
    }

    function drawField(currentLevel) {
        var row, col;
        /* Loop through the number of rows and columns we've defined above
         * and, using the levelRows arrays (which change depending on the level),
         * draw the correct image for that portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(levelRows[currentLevel - 1][row]), col * cellWidth, row * drawnSquareHeight);
            };
        };

        // Adds the winning tile the player must reach to pass the level
        ctx.drawImage(Resources.get(winningTile.sprite), winningTile.x, winningTile.y);

        // draw a white rectangle to cover the previous level
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 150, 30);

        // writes the current level at the top left corner
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText("Level: " + currentLevel, 15, 30);
    }

    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        allBoats.forEach(function(boat) {
            boat.render();
        });
        player.render();
    }

    function reset() {
        // Simply draws a field with no player or enemies and
        // shows the appropriate welcome message
        drawField(currentLevel);
        showWelcomeMenu();
    }

    function showWelcomeMenu() {
        if (currentLevel === 1) {
            ctx.textAlign = "center";
            ctx.fillText("Welcome to Alex's Frogger-a-like!", canvas.width / 2, 250);
            ctx.fillText("Hit the spacebar to start.", canvas.width / 2, 300);
            ctx.fillText("Have Fun!", canvas.width / 2, 350);
        } else if (currentLevel < levelRows.length + 1) {
            ctx.textAlign = "center";
            ctx.fillText("Congratulation for reaching level " + currentLevel, canvas.width / 2, 250);
            ctx.fillText("Hit the spacebar to start next level.", canvas.width / 2, 300);
            ctx.fillText("Have Fun!", canvas.width / 2, 350);
        } else {
            // if currentLevel is higher than the number of levels set, it is reset to 1 and
            // a game-end message is shown.
            currentLevel = 1;
            ctx.textAlign = "center";
            ctx.fillText("Congratulation for finishing the game!", canvas.width / 2, 250);
            ctx.fillText("Send me your suggestions for", canvas.width / 2, 300);
            ctx.fillText("improvement to info@alexis-bellet.com", canvas.width / 2, 350);
            ctx.fillText("Thanks a lot!", canvas.width / 2, 400);
        }
    }

    /* Caching the images that will be used to draw the canvas.
     * Once they are done loading, the engine is initiated with the
     * init function in callback.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/little-boat.png',
        'images/winning-tile.png'
    ]);

    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);