
// width and height of canvas
var width = 320,
    height = 420,
    gLoop,
    points = 0,
    state = true,
    // get the canvas
    c = document.getElementById('c'),
    // add a two-dimensonal graphic context
    ctx = c.getContext('2d');

// set canvas size
c.width = width;
c.height = height;

// it is not possible to move objects in canvas
// this is down by drawing, removing and redrawing - hence it seems to move
// so we need a clear functio after each frame
var clear = function () {
    // normaly we use clearRect to erase the canvas
    //ctx.clearRect(0, 0, width, height);
    // this time we darw a blue filling in the background
    ctx.fillStyle = '#d0e7f9';
    // start drawing
    ctx.beginPath();
    // draw a rectangle form point (0, 0) - upper lefthand corner to
    // point (width, height) - lower righthand corner
    ctx.rect(0, 0, width, height);
    // stop drawing
    ctx.closePath();
    // fill the rectangle with the color
    ctx.fill();
};

var howManyCircles = 10,
    circles = [];

for (var i = 0; i < howManyCircles; i++)
circles.push([Math.random() * width, Math.random() * height, Math.random() * 100, Math.random() / 2]);

var DrawCircles = function () {
    for (var i = 0; i < howManyCircles; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + circles[i][3] + ')';
        ctx.beginPath();
        ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
};

var MoveCircles = function (e) {
    for (var i = 0; i < howManyCircles; i++) {
        if (circles[i][1] - circles[i][2] > height) {
            circles[i][0] = Math.random() * width;
            circles[i][2] = Math.random() * 100;
            circles[i][1] = 0 - circles[i][2];
            circles[i][3] = Math.random() / 2;
        } else {
            circles[i][1] += e;
        }
    }
};

var player = new(function () {
    //create new object based on function and assign
    //what it returns to the 'player' variable

    var that = this;
    //'that' will be the context now

    //attributes
    that.image = new Image();
    that.image.src = "player.png";
    //create new Image and set it's source

    that.width = 65;
    //width of the single frame
    that.height = 95;
    //height of the single frame

    that.X = 0;
    that.Y = 0;
    //X&Y position

    //methods
    that.setPosition = function (x, y) {
        that.X = x;
        that.Y = y;
    };

    that.frames = 1;
    // number of frames of player animation index from zero
    that.actualFrame = 0;
    // start from here
    that.interval = 0;
    // dont switch frame on each gameloop - interval is helping with that

    // jumping and falling state
    that.isJumping = false;
    that.isFalling = false;

    // jumping and falling speed values
    that.jumpSpeed = 0;
    that.fallSpeed = 0;

    // jumping
    // start jumping
    that.jump = function () {
        // if object is not jumping or falling at the moment
        if (!that.isJumping && !that.isFalling) {
            that.fallSpeed = 0;
            that.isJumping = true;
            that.jumpSpeed = 17;
        }
    };

    that.checkJump = function () {
        // if player reaches half of screen stop him and move rest
        if (that.Y > height * 0.4) {
            // move playerobject up by number of pixels equal to current value of jumpspeed
            that.setPosition(that.X, that.Y - that.jumpSpeed);
        } else {
            points++;
            // dont move player move platforms and background
            // move background slower
            MoveCircles(that.jumpSpeed * 0.5);
            platforms.forEach(function (platform, ind) {
                platform.y += that.jumpSpeed;
                // create new platforms if platforms move out of screen
                if (platform.y > height) {
                    // again every 5th platform is special
                    var type = ~~ (Math.random() * specialPlatformFactor);
                    if (type === 0) {
                        type = 1;
                    } else {
                        type = 0;
                    }
                    platforms[ind] = new Platform(Math.random() * (width - platformWidth), platform.y - height, type);
                }
            });
            collectables.forEach(function (collectable, ind) {
                collectable.y += that.jumpSpeed;
                if (collectable.y > height) {
                    collectables[ind] = new Collectable(Math.random() * (width - collectableWidth), collectable.y - height, 0);
                }
            });
        }
        // decrease jumpspeed while it is going
        // gravity implementation :-)
        that.jumpSpeed--;
        // if jump velocity has decreased to zero ... start falling
        if (that.jumpSpeed === 0) {
            that.isJumping = false;
            that.isFalling = true;
            that.fallSpeed = 1;
        }
    };

    that.checkFall = function () {
        // check if the objects hits bottom of screen
        if (that.Y < height - that.height) {
            // if not change position downwards and accelerate
            that.setPosition(that.X, that.Y + that.fallSpeed);
            that.fallSpeed++;
        } else {
            // allow to step on the floor at start of game
            if (points === 0) {
                // if we hit the bottom stop ...
                that.fallStop();
            } else {
                GameOver();
            }
        }
    };

    // stop falling, start jumping again ...
    that.fallStop = function () {
        that.isFalling = false;
        that.fallSpeed = 0;
        that.jump();
    };

    that.moveLeft = function () {
        if (that.X > 0) {
            that.setPosition(that.X - 5, that.Y);
        }
    };

    that.moveRight = function () {
        if (that.X + that.width < width) {
            that.setPosition(that.X + 5, that.Y);
        }
    };

    that.draw = function () {
        try {
            ctx.drawImage(that.image, 0, that.height * that.actualFrame, that.width, that.height, that.X, that.Y, that.width, that.height);
            //cutting source image and pasting it into destination one,
            //drawImage(Image Object, source X, source Y, source Width, source Height, destination X (X position), destination Y (Y position), Destination width, Destination height)
            //
            //3rd agument needs to be multiplied by number of frames, so on each loop different frame will be cut from the source image
        } catch (e) {
            //sometimes, if character's image is too big and will not load until the drawing of the first frame, Javascript will throws error and stop executing everything. To avoid this we have to catch an error and retry painting in another frame. It is invisible for the user with 50 frames per second.
        }
        // switch frames of player image every 4 gameloops
        if (that.interval == 4) {
            if (that.actualFrame == that.frames) {
                that.actualFrame = 0;
            } else {
                that.actualFrame++;
            }
            that.interval = 0;
        }
        that.interval++;
    };
})();

var nrOfPlatforms = 6,
    specialPlatformFactor = nrOfPlatforms - 2,
    platforms = [],
    platformWidth = 70,
    platformHeight = 15;

var Platform = function (x, y, type) {
    var that = this;

    that.firstColor = '#FF8C00';
    that.secondColor = '#EEEE00';

    that.isMoving = ~~ (Math.random() * 2);
    that.direction = ~~ (Math.random() * 2) ? -1 : 1;
    that.onCollide = function () {
        player.fallStop();
    };
    if (type === 1) {
        that.firstColor = '#AADD00';
        that.secondColor = '#698B22';
        that.onCollide = function () {
            player.fallStop();
            player.jumpSpeed = player.jumpSpeed * 2;
        };
    }
    that.x = ~~x;
    that.y = ~~y;
    that.type = type;

    that.draw = function () {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        var gradient = ctx.createRadialGradient(that.x + (platformWidth / 2), that.y + (platformHeight / 2), 5, that.x + (platformWidth / 2), that.y + (platformHeight / 2), 45);
        gradient.addColorStop(0, that.firstColor);
        gradient.addColorStop(1, that.secondColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(that.x, that.y, platformWidth, platformHeight);
    };
    return that;
};

var generatePlatforms = function () {
    var position = 0,
        type;
    for (var i = 0; i < nrOfPlatforms; i++) {
        type = ~~ (Math.random() * specialPlatformFactor);
        if (type === 0) type = 1;
        else type = 0;
        platforms[i] = new Platform(Math.random() * (width - platformWidth), position, type);
        if (position < height - platformHeight) position += ~~ (height / nrOfPlatforms);
    }
}();

var checkCollison = function () {
    platforms.forEach(function (e, ind) {
        if (
        // collission on
        // player falling
        (player.isFalling) &&
        // player lefthandside within plattform
        (player.X < e.x + platformWidth) &&
        // player righthandside within plattform
        (player.X + player.width > e.x) &&
        // player completly above plattform
        (player.Y + player.height > e.y) && (player.Y + player.height < e.y + platformHeight)) {
            e.onCollide();
        }
    });
    collectables.forEach(function (e, ind) {
        if (
        // collission on
        // player lefthandside within plattform
        (player.X < (e.x + collectableWidth / 2)) &&
        // player righthandside within plattform
        (player.X + player.width > (e.x + collectableWidth / 2)) &&
        (player.Y < e.y + collectableHeight / 2) &&
        (player.Y + player.height > e.y + collectableHeight / 2)
        ) {
        e.onCollide();
        }
    });
};

var nrOfCollectables = 1,
    specialCollectable = nrOfCollectables - 2,
    collectables = [],
    collectableWidth = 20,
    collectableHeight = 20;

var Collectable = function (x, y, type) {
    var that = this;

    that.firstColor = '#FFFF00';
    that.secondColor = 'yellow';
    that.onCollide = function () {
        //TODO
        points += 10;
        // remove collectable
        // cheer player :-)
        that.remove();
        console.log('collected');
    };
    that.x = ~~x;
    that.y = ~~y;
    that.type = type;

    if (type === 1) {
        // special collectable
        that.firstColor = 'orange';
        that.secondColor = 'green';
        that.onCollide = function () {
            points += 50;
            // remove collectable
            // cheer player :-)
        };
    }
    that.remove = function () {
        collectables.pop();
        collectables.push(new Collectable(Math.random() * (width - collectableWidth), 0, type));
    };
    that.draw = function () {
        /*
        //ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        //ctx.fillRect(that.x, that.y, collectableWidth, collectableHeight);
        // star?
        ctx.moveTo(that.x, that.y);
        var length = 15;
        ctx.beginPath();
        for (var i = 5; i--;) {
            // draw line up
            ctx.lineTo(0, length);
            // move origin to current same location as pen
            ctx.translate(0, length);
            // rotate the drawing board the angle of a star point
            ctx.rotate((Math.PI * 2 / 10));
            // draw line down
            ctx.lineTo(0, -length);
            // again, move origin to pen...
            ctx.translate(0, -length);
            // ...and rotate, ready for next arm
            // this rotation is the angle between the points, 120°
            ctx.rotate(-(Math.PI * 6 / 10));
        }
        // last line to connect things up
        ctx.lineTo(0, length);
        ctx.closePath();
        var gradient = ctx.createRadialGradient(that.x + (collectableWidth / 2), that.y + (collectableHeight / 2), 5, that.x + (collectableWidth / 2), that.y + (collectableHeight / 2), 45);
        gradient.addColorStop(0, that.firstColor);
        gradient.addColorStop(1, that.secondColor);
        ctx.fillStyle = gradient;

        ctx.fill();
        */
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        var gradient = ctx.createRadialGradient(that.x + (collectableWidth / 2), that.y + (collectableHeight / 2), 5, that.x + (collectableWidth / 2), that.y + (collectableHeight / 2), 45);
        gradient.addColorStop(0, that.firstColor);
        gradient.addColorStop(1, that.secondColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(that.x, that.y, collectableWidth, collectableHeight);
    };
    return that;
};

var generateCollectables = function () {
    var position = 0,
        type = 0;
    for (var i = 0; i < nrOfCollectables; i++) {
        collectables[i] = new Collectable(Math.random() * (width - platformWidth), position, type);
        if (position < height - collectableHeight) position += ~~ (height / nrOfCollectables);
    }
}();

player.setPosition(~~ ((width - player.width) / 2), ~~ ((height - player.height) / 2));
//our character is ready, let's move it
//to the center of the screen,
//'~~' returns nearest lower integer from
//given float, equivalent of Math.floor()

// start jumping
player.jump();

// handle input
if (window.DeviceOrientationEvent) {
  // Listen for the deviceorientation event and handle the raw data
  window.addEventListener('deviceorientation', function(eventData) {
    // gamma is the left-to-right tilt in degrees, where right is positive
    var tiltLR = eventData.gamma;
    deviceOrientationHandler(tiltLR);
  }, false);
} else if (window.OrientationEvent) {
  window.addEventListener('MozOrientation', function(eventData) {
    // x is the left-to-right tilt from -1 to +1, so we need to convert to degrees
    var tiltLR = eventData.x * 90;
      deviceOrientationHandler(tiltLR);
  }, false);
}

var deviceOrientationHandler = function(e) {
    if (e < 0) {
        player.moveLeft();
    } else if (e > 0) {
        player.moveRight();
    }
};
// always use fallback to mousemove
// bind movment functions of player object to mouse
document.onmousemove = function (e) {
    if (player.X + c.offsetLeft > e.pageX) {
        player.moveLeft();
    } else if (player.X + c.offsetLeft < e.pageX) {
        player.moveRight();
    }

};

var GameLoop = function () {
    clear();
    DrawCircles();
    // change player position accourding to jump / fall
    if (player.isJumping) player.checkJump();
    if (player.isFalling) player.checkFall();
    player.draw();
    platforms.forEach(function (platform, index) {
        if (platform.isMoving) {
            if (platform.x < 0) {
                platform.direction = 1;
            } else if (platform.x > width - platformWidth) {
                platform.direction = -1;
            }
            // make them move faster every 100 points
            platform.x += platform.direction * (index / 2) * ~~ (points / 200);
        }
        platform.draw();
    });
    collectables.forEach(function (collectable, index) {
        collectable.draw();
    });
    checkCollison();

    // score
    ctx.fillStyle = "Black";
    ctx.fillText("POINTS:" + points, 10, height - 10);
    if (state) {
        gLoop = setTimeout(GameLoop, 1000 / 30);
    }
};
var GameOver = function () {
    state = false;
    clearTimeout(gLoop);
    setTimeout(function () {
        clear();
        try {
            ctx.drawImage(title, 0, 0);
        } catch (e) {}
        ctx.fillStyle = "Black";
        ctx.font = "10pt Arial";
        ctx.fillText("GAME OVER", width / 2 - 60, height / 2 - 50);
        ctx.fillText("YOUR RESULT:" + points, width / 2 - 60, height / 2 - 30);
        ctx.fillText("reload to play again!", width / 2 - 60, height / 2);
    }, 100);
};

GameLoop();
