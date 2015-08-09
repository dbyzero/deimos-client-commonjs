var Vector = require('./tools/Vector')

var Config = {};

Config.FPS = 60;
Config.mode = "debug",
Config.messageLevel = "verbose",
Config.FPS = 60;
Config.GAME_SPEED = 33;
Config.SQUARE_AUTHORITY = 100*100;
Config.DELTA_SERVER_SYNC = 5000;
Config.showOwnMirror = false;

Config.Gravity = new Vector(0, 300);

module.exports = Config;