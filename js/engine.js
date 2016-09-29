/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.




TO-DO:

order:
ImageLoad
Init
    (CheckLevel)
    Reset = (drawfield, welcome-menu)
    SpacebarCheck
    Main
        Update
        Render

1. Find a way to align the intro text and find a better color.
2. Write on the top of the screen the level the player is at.
3. Integrate a "level won" platform at the top of the screen, that will make you go up a level
4. Maybe integrate keys that the player needs to pick-up before reaching the winning point!
5. Integrate a certain number of life and levels to the game.


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
        [grassBlock,stoneBlock,stoneBlock,stoneBlock,grassBlock,grassBlock],
        [grassBlock,waterBlock,stoneBlock,stoneBlock,grassBlock,grassBlock],
        [grassBlock,waterBlock,stoneBlock,stoneBlock,waterBlock,grassBlock],
        [grassBlock,waterBlock,stoneBlock,waterBlock,stoneBlock,grassBlock]
    ];


    // Locates the water & stone rows and saves their index number
    countSpecialRows = function() {
        indexStoneRows = [];
        indexWaterRows = [];
        for (i = 0; i < levelRows[currentLevel - 1].length; i++) {
            if (levelRows[currentLevel - 1][i].includes("stone") === true) {
                indexStoneRows.push(i);
            } else if (levelRows[currentLevel - 1][i].includes("water") === true) {
                indexWaterRows.push(i);
            };
        };
    };

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
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        document.addEventListener('keyup', function(e) {
            if (e.keyCode === 32) {
                countSpecialRows();
                addBoats();
                addMoreEnemies();
                main();
            };
        });
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
        checkWinningCondition();
        // Next lines check whether the player has reached the winning tile
        // if so, the currentlevel variable goes up by one and the game restarts.
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
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

    function render() {
        drawField();
        renderEntities();
    }

    function drawField() {
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
        drawField();
        showWelcomeMenu();
    }

    function showWelcomeMenu() {
        ctx.font = "30px Impact";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        if (currentLevel === 1) {
            ctx.fillText("Welcome to Alex's Frogger",canvas.width/2,250);
            ctx.fillText("Hit the Space Bar to Start",canvas.width/2,300);
            ctx.fillText("Have Fun!",canvas.width/2,350);
        } else {
            ctx.fillText("Get Ready for Next Level!",canvas.width/2,250);
            ctx.fillText("Hit the Space Bar to Start",canvas.width/2,300);
            ctx.fillText("Have Fun!",canvas.width/2,350);
        };
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

    Resources.onReady(init)

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);

