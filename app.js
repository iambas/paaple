var game = new Phaser.Game(window.screen.availWidth * window.devicePixelRatio, window.screen.availHeight * window.devicePixelRatio, Phaser.CANVAS, 'game');

var platforms;
var BASKET = 'basket';
var APPLE = 'apple';
var GRASS = 'grass';
var BOMB = 'bomb';
var KEEP = 'keep';
var EXPLOSION = 'explosion';

var mainState = {
    preload: function() {
        game.load.image(BASKET, 'assets/basket.png');
        game.load.image(APPLE, 'assets/apple.png');
        game.load.image(GRASS, 'assets/grass.png');
        game.load.image(BOMB, 'assets/bomb.png');
        // Load the keep sound
        game.load.audio(KEEP, 'assets/keep.wav');
        game.load.audio(EXPLOSION, 'assets/explosion.mp3');
    },

    create: function() {
        this.score = 0;
        this.scoreText;
        this.end = false;

        this.scoreText = game.add.text(16, 16, 'Score : ' + this.score, {
            fontSize: '20px',
            fill: '#fff'
        });
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 100;

        platforms = game.add.group();
        platforms.enableBody = true;

        this.apples = game.add.group();
        this.bombs = game.add.group();
        this.grass = [];

        this.setupGrass();

        this.basket = platforms.create(game.world.width / 2, game.world.height - 70, BASKET);
        this.basket.scale.setTo(0.2, 0.2);
        this.basket.body.immovable = true;
        this.basket.speed = 3000;
        this.basket.anchor.setTo(0.5);
        this.basket.body.allowGravity = false;

        this.timer = game.time.events.loop(1500, this.addApple, this);

        var r = Math.random() * 3000 + 500;
        game.time.events.loop(r, this.addBomb, this);

        // Add the keep sound
        this.keepSound = game.add.audio(KEEP);
        this.keepSound.volume = 0.2;

        this.expSound = game.add.audio(EXPLOSION);
        this.expSound.volume = 0.2;
    },

    update: function() {
        if (!this.end) {
            game.physics.arcade.overlap(this.basket, this.apples, this.hitApple, null, this);
            game.physics.arcade.overlap(this.basket, this.bombs, this.hitBomb, null, this);
            for (var i = 0; i < 8; i++) {
                game.physics.arcade.overlap(this.grass[i], this.apples, this.gameOver, null, this);
            }

            this.basket.x = game.input.x;
        } else {
            if (this.input.activePointer.isDown) {
                game.state.start('main');
            }
        }
    },

    hitApple: function(basket, apple) {
        if (!this.end) {
            this.score += 1;
            this.scoreText.text = 'Score : ' + this.score;
            apple.destroy();
            this.keepSound.play();
        }
    },

    hitBomb: function(basket, bomb) {
        if (!this.end) {
            bomb.destroy();
            this.gameOver();
            this.expSound.play();
        }
    },

    addApple: function() {
        var ran = Math.random() * (game.world.width - 40);
        var apple = game.add.sprite(ran, -200, APPLE);
        game.physics.enable(apple, Phaser.Physics.ARCADE);
        this.apples.add(apple);
        apple.scale.setTo(0.1, 0.1);
        apple.body.gravity.y = 200;
    },

    addBomb: function() {
        var ran = Math.random() * (game.world.width - 40);
        var bomb = game.add.sprite(ran, -200, BOMB);
        game.physics.enable(bomb, Phaser.Physics.ARCADE);
        this.bombs.add(bomb);
        bomb.scale.setTo(0.1, 0.1);
        bomb.body.gravity.y = 200;
    },

    setupGrass: function() {
        var w = -40;
        for (var i = 0; i < 30; i++) {
            this.grass[i] = platforms.create(w, game.world.height - 35, GRASS);
            this.grass[i].scale.setTo(0.2, 0.2);
            this.grass[i].body.allowGravity = false;
            w += 50;
        }
    },

    gameOver: function(grass, apple) {
        this.end = true;

        var message = 'Game Over!';
        this.endText = this.add.text(game.world.width / 2, game.world.height / 2 - 20, message, {
            font: '48px serif',
            fill: '#fff'
        });
        this.endText.anchor.setTo(0.5, 0.5);

        message = 'Tab to play';
        this.playText = this.add.text(game.world.width / 2, game.world.height / 2 + 20, message, {
            font: '24px serif',
            fill: '#fff'
        });
        this.playText.anchor.setTo(0.5, 0.5);
    }
};

game.state.add('main', mainState);
game.state.start('main');