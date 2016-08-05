var scene,
camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
renderer, container, clock;

// MEMORY AND FRAMERATE STATS
var stats = new Stats();
var stats2 = new MemoryStats();
var utils = new Utils();

// UTILITIES
var clock = new THREE.Clock();
var keyboard = new KeyboardState();
var OC = [];
var GOC;

var particlesPool = [];
var particlesInUse = [];

/// CONSTANTS
var TRAILWIDTH = 60;
var UWWIDTH = 500;
var SECTIONHEIGHT = 4000;
var ROWS = 31;
var ROWSIZE = SECTIONHEIGHT/ROWS;
var NRSECTIONS = 2;

// LANES
var LANESPACING = 5;
var LANEWIDTH= 10;
var lanes = [-LANEWIDTH/2-LANESPACING-LANEWIDTH/2, 0,  +LANEWIDTH/2+LANESPACING+LANEWIDTH/2] ;

// SPEED
var SPEEDINITIAL;
var speed = SPEEDINITIAL = 6;
