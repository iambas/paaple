var w = 400;
var h = 600;

var isMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
if (isMobile) {
    w = window.innerWidth;
    h = window.innerHeight;
}

var game = new Phaser.Game(w, h, Phaser.CANVAS, 'game');
var platforms;
var BASKET = 'basket';
var APPLE = 'apple';
var PAPPLE = 'papple';
var TREE = 'tree';
var GRASS = 'grass';
var BOMB = 'bomb';
var KEEP = 'keep';
var EXPLOSION = 'explosion';
var INTRO = 'intro';
var SOUND = 'sound';
var HIGH_SCORE = 'high_score_papple';
var hightScore = getCookie(HIGH_SCORE);

var homeState = {
    preload: function() {
        game.load.image(BASKET, 'assets/basket.png');
        game.load.image(APPLE, 'assets/apple.png');
        game.load.image(PAPPLE, 'assets/papple.png');
        game.load.image(TREE, 'assets/tree.png');
        game.load.image(GRASS, 'assets/grass.png');
        game.load.image(BOMB, 'assets/bomb.png');
        game.load.audio(KEEP, 'assets/keep.wav');
        game.load.audio(EXPLOSION, 'assets/explosion.mp3');
        game.load.audio(INTRO, 'assets/intro.mp3');
        game.load.audio(SOUND, 'assets/sound.mp3');
    },

    create: function() {
        game.stage.backgroundColor = "#2196F3";
        platforms = game.add.group();
        platforms.enableBody = true;

        this.tree = platforms.create(game.world.width / 2, game.world.height - 10, TREE);
        this.tree.anchor.setTo(0.5, 1);
        this.tree.alpha = 0.5;
        this.grass = platforms.create(0, game.world.height - 35, GRASS);
        this.grass.body.allowGravity = false;
        this.grass.alpha = 0.9;

        this.textAlert();
        this.introSound = game.add.audio(INTRO);
        this.playIntro();
        game.time.events.loop(3635, this.playIntro, this);
    },

    update: function() {
        if (this.input.activePointer.isDown) {
            game.state.start('main');
            this.introSound.stop();
        }
    },

    playIntro: function() {
        this.introSound.play();
    },

    addApple: function() {
        var ran = Math.random() * (game.world.width - 50);
        var apple = game.add.sprite(ran, -200, APPLE);
        game.physics.enable(apple, Phaser.Physics.ARCADE);
        apple.body.gravity.y = 200;
    },

    addBomb: function() {
        var ran = Math.random() * (game.world.width - 50);
        var bomb = game.add.sprite(ran, -200, BOMB);
        game.physics.enable(bomb, Phaser.Physics.ARCADE);
        bomb.body.gravity.y = 300;
    },

    textAlert: function() {
        var txtPappleGame = 'Papple Game';
        this.endText = this.add.text(game.world.width / 2, game.world.height / 2 - 20, txtPappleGame, {
            font: '48px serif',
            fill: '#fff'
        });
        this.endText.anchor.setTo(0.5, 0.5);

        var txtPlay = 'Tab to play';
        this.playText = this.add.text(game.world.width / 2, game.world.height / 2 + 20, txtPlay, {
            font: '24px serif',
            fill: '#fff'
        });
        this.playText.anchor.setTo(0.5, 0.5);
    }
}

var mainState = {
    preload: function() {},

    create: function() {
        this.score = 0;
        this.end = false;
        this.appleSpeed = 200;
        this.bombSpeed = 300;

        game.stage.backgroundColor = "#2196F3";
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 100;

        if (hightScore == "") hightScore = 0;
        this.hightScoreText = game.add.text(16, 16, 'High Score : ' + hightScore, {
            fontSize: '20px',
            fill: '#fff'
        });
        this.scoreText = game.add.text(16, 40, 'Score : ' + this.score, {
            fontSize: '20px',
            fill: '#fff'
        });

        platforms = game.add.group();
        platforms.enableBody = true;
        this.apples = game.add.group();
        this.papples = game.add.group();
        this.bombs = game.add.group();

        this.setupTree();
        this.setupGrass();
        this.setupBasket();

        var r = Math.random() * 3000 + 1000;
        game.time.events.loop(1000, this.addApple, this);
        game.time.events.loop(10000, this.addPapple, this);
        game.time.events.loop(r, this.addBomb, this);
        game.time.events.loop(14522, this.playSound, this);

        this.keepSound = game.add.audio(KEEP);
        this.expSound = game.add.audio(EXPLOSION);
        this.sound = game.add.audio(SOUND);
        this.sound.play();
    },

    update: function() {
        if (!this.end) {
            game.physics.arcade.overlap(this.basket, this.apples, this.hitApple, null, this);
            game.physics.arcade.overlap(this.basket, this.papples, this.hitPapple, null, this);
            game.physics.arcade.overlap(this.basket, this.bombs, this.hitBomb, null, this);
            game.physics.arcade.overlap(this.grass, this.apples, this.gameOver, null, this);
            game.physics.arcade.overlap(this.grass, this.papples, this.gameOver, null, this);
            this.basket.x = game.input.x;
        } else {
            if (this.input.activePointer.isDown) {
                game.state.start('main');
                this.sound.stop();
            }
        }
    },

    setupTree: function() {
        this.tree = platforms.create(game.world.width / 2, game.world.height - 10, TREE);
        this.tree.anchor.setTo(0.5, 1);
        this.tree.alpha = 0.5;
        this.tree.body.allowGravity = false;
    },

    setupGrass: function() {
        this.grass = platforms.create(0, game.world.height - 35, GRASS);
        this.grass.body.allowGravity = false;
        this.grass.alpha = 0.9;
    },

    setupBasket: function() {
        this.basket = platforms.create(game.world.width / 2, game.world.height - 70, BASKET);
        this.basket.body.immovable = true;
        this.basket.speed = 3000;
        this.basket.anchor.setTo(0.5);
        this.basket.body.allowGravity = false;
    },

    addApple: function() {
        var ran = Math.random() * (game.world.width - 50);
        var apple = game.add.sprite(ran, -200, APPLE);
        game.physics.enable(apple, Phaser.Physics.ARCADE);
        this.apples.add(apple);
        apple.body.gravity.y = this.appleSpeed++;
    },

    addPapple: function() {
        var ran = Math.random() * (game.world.width - 100);
        var papple = game.add.sprite(ran, -200, PAPPLE);
        game.physics.enable(papple, Phaser.Physics.ARCADE);
        this.papples.add(papple);
        papple.body.gravity.y = this.appleSpeed;
    },

    addBomb: function() {
        var ran = Math.random() * (game.world.width - 50);
        var bomb = game.add.sprite(ran, -200, BOMB);
        game.physics.enable(bomb, Phaser.Physics.ARCADE);
        this.bombs.add(bomb);
        bomb.body.gravity.y = this.bombSpeed++;
    },

    playSound: function() {
        this.sound.play();
    },

    hitApple: function(basket, apple) {
        if (!this.end) {
            this.score += 1;
            this.scoreText.text = 'Score : ' + this.score;
            apple.destroy();
            this.keepSound.play();
        }
    },

    hitPapple: function(basket, papple) {
        if (!this.end) {
            this.score += 5;
            this.scoreText.text = 'Score : ' + this.score;
            papple.destroy();
            this.keepSound.play();
        }
    },

    hitBomb: function(basket, bomb) {
        if (!this.end) {
            bomb.destroy();
            this.gameOver();
        }
    },

    gameOver: function(grass, apple) {
        this.expSound.play();
        this.end = true;
        this.textAlert();

        if (this.score > hightScore) hightScore = this.score;
        this.hightScoreText.text = 'High Score : ' + hightScore;
        document.cookie = HIGH_SCORE + "=" + hightScore;
    },

    textAlert: function() {
        var txtGameOver = 'Game Over!';
        this.endText = this.add.text(game.world.width / 2, game.world.height / 2 - 20, txtGameOver, {
            font: '48px serif',
            fill: '#fff'
        });
        this.endText.anchor.setTo(0.5, 0.5);

        var txtPlay = 'Tab to play';
        this.playText = this.add.text(game.world.width / 2, game.world.height / 2 + 20, txtPlay, {
            font: '24px serif',
            fill: '#fff'
        });
        this.playText.anchor.setTo(0.5, 0.5);
    }
};

game.state.add('home', homeState);
game.state.add('main', mainState);
game.state.start('home');

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}