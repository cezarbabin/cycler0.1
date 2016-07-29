var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container, clock;

var stats = new Stats();

var clock = new THREE.Clock();
var keyboard = new KeyboardState();
var OC;

/// CONSTANTS
var TRAILWIDTH = 120;
var UWWIDTH = 500;
var SECTIONHEIGHT = 1000;
var ROWS = 10;
var ROWSIZE = SECTIONHEIGHT/ROWS;


// LANES
var LANESPACING = 10;
var LANEWIDTH= 20;
var lanes = [-LANEWIDTH/2-LANESPACING-LANEWIDTH/2, 0,  +LANEWIDTH/2+LANESPACING+LANEWIDTH/2] ;

window.addEventListener('load', init, false);

function createScene() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xcccccc, 100, 950);
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 320;
	nearPlane = 1;
	farPlane = 20000;
	
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 80;
  camera.position.y = -125;
  camera.rotation.x = 60 * Math.PI / 180;

	renderer = new THREE.WebGLRenderer({ 
		alpha: true, 
		antialias: true 
	});

	renderer.setSize(WIDTH, HEIGHT);

	renderer.shadowMap.enabled = true;
	
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);

	// framerate stats
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	
	// Listen to the screen: if the user resizes it
	// we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

var hemisphereLight, shadowLight;
function createLights() {
	hemisphereLight = new THREE.HemisphereLight(0xcccccc,0x000000, .9)
	shadowLight = new THREE.DirectionalLight(0x7ec0ee, .6);
	shadowLight.position.set(150, 350, 350);
	shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	scene.add(hemisphereLight);  
	scene.add(shadowLight);

	ambientLight = new THREE.AmbientLight(0xFFCC00, .2);
	ambientLight2 = new THREE.AmbientLight(0xDDC0B2, .4);
	//scene.add(ambientLight);
	//scene.add(ambientLight2);
}

var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

ObjectContainer = function(objArray) {};

ObjectContainer.prototype.initialize = function(name){
	if (name == 'underWorld' || name == 'trail' || name == 'lane' || name == 'chargingObstacleContainer'){
		this[name] = [];
	} else if (name == "obstacleContainer") {
		this[name] = [];
		for (var r = 0; r < ROWS; r++){
			this[name].push([]);
		}
	}
}

function init() {
	$('#flashText').hide();
	createScene();
	createLights();
	OC = new ObjectContainer();

	OC.initialize('underWorld');
	OC.initialize('trail');
	OC.initialize('lane');
	OC.initialize('player');
	OC.initialize('chasingBall');
	OC.initialize('fallingObject');
	OC.initialize('chargingObstacle');
	OC.initialize('obstacleContainer');
	OC.initialize('chargingObstacleContainer');

	// Player loading starts the gmame
	createSection();
	createPlayer();	
	createChasingBall();
	//createFallingObstacle(5, 1);
	createObstacleContainer();
	createChargingObstacleContainer();
}

function createPlayer() {
	var manager = new THREE.LoadingManager();

	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	var loader = new THREE.OBJLoader( manager );

	loader.load( 'tricycle.obj', function ( object) {
		object.traverse( function ( child ) {
			var bodyMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
			if ( child instanceof THREE.Mesh ) {
				child.material = bodyMat;
			}
		} );	
		set(object, 'player');
	});
}

function createChasingBall() {
	var radius = 10;
	var geometry = new THREE.SphereGeometry( 10, 6, 6 );
	//geometry.translate(0, -35, radius);
	var material = new THREE.MeshBasicMaterial( {
		color: 0x000000, 
		wireframe: true, 
		wireframeLinewidth: 2
	} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.position.z = 11;
	sphere.position.y -= 30;
	sphere.rotation.z = 90*Math.PI / 180;
	OC['chasingBall'] = sphere;
	scene.add( sphere );
}

function createObstacleContainer() {

	for (var r = 1; r < ROWS; r++){
		// random number of obstacles
		var rnd = Math.random() * 2 | 0;
		console.log(r, rnd);
		for (var o = 0; o < rnd; o++){
			// make the obstacles either falling or stable
			var rndForm = Math.random();
			//if (rndForm < 0.5){
			var rndLane = Math.random() * 3 | 0;
			createFallingObstacle(r, rndLane);
			//OC['obstacleContainer'].push()
			//}
		}
	}
}

function createChargingObstacleContainer() {
	for (var r = 6; r < ROWS; r++){
		// create 4 charging obstacles in the latter rows
		
		// choose lane at random
		var rndLane = Math.random() * 3 | 0;
		createChargingObstacle(r, rndLane)
	}
}

// (lane, distance, distanceActivation)
function createFallingObstacle(row, laneNr){
	var size = LANEWIDTH + LANESPACING;
	var geometry = new THREE.BoxGeometry( size, size, size);
	//geometry.translate(0, -35, radius);
	var material = new THREE.MeshBasicMaterial( {
		color: Colors.pink, 
		wireframe: true, 
		wireframeLinewidth: 2
	} );
	var fallingObject = new THREE.Mesh( geometry, material );
	fallingObject.position.y = row*ROWSIZE;
	fallingObject.position.z = 100;
	fallingObject.position.x = lanes[laneNr];
	OC['obstacleContainer'][row].push(fallingObject);
	scene.add(fallingObject);
}

function createChargingObstacle(row, laneNr){
	var size = LANEWIDTH + LANESPACING;
	var geometry = new THREE.BoxGeometry( size, size, size);
	//geometry.translate(0, -35, radius);
	var material = new THREE.MeshBasicMaterial( {
		color: Colors.pink, 
		wireframe: true, 
		wireframeLinewidth: 2
	} );
	var chargingObstacle = new THREE.Mesh( geometry, material );
	chargingObstacle.position.y = row*ROWSIZE;
	chargingObstacle.position.x = lanes[laneNr];
	chargingObstacle.position.z = 2;
	OC['chargingObstacleContainer'].push(chargingObstacle);
	scene.add(chargingObstacle);
}

function set(object, name){
	OC.initialize('player');
	OC[name] = object;
	scene.add(object);
	if (name == "player"){
		//object.add(camera);
		var bbox = new THREE.Box3().setFromObject(object);
		var displacement = bbox.max.y - bbox.min.y;
		object.position.y += displacement;
		loop();
	}
}

function createSection() {
	var delimiterSize = 20;

	var pg = new THREE.PlaneGeometry(SECTIONHEIGHT, SECTIONHEIGHT, 30, 30);
	createDelimiter(pg, delimiterSize);
	pg.translate(0, SECTIONHEIGHT/2, 0);
	var pm = new THREE.MeshPhongMaterial({
		color:Colors.brown,
		transparent:true,
		opacity:1,
		shading:THREE.FlatShading,
	});
	var underWorld = new THREE.Mesh(pg, pm);
	OC['underWorld'].push(underWorld);
	scene.add(underWorld);

	var pg = new THREE.PlaneGeometry(TRAILWIDTH, SECTIONHEIGHT, 30, 30);
	pg.translate(0, SECTIONHEIGHT/2, 0);
	var pm = new THREE.MeshPhongMaterial({
		color:Colors.blue,
		transparent:true,
		opacity:1,
		shading:THREE.FlatShading,
	});
	var trail = new THREE.Mesh(pg, pm);
	trail.position.z = 1;
	OC['trail'].push(trail);
	scene.add(trail);

	var cols = [Colors.red, Colors.white, Colors.brown]

	var dist = ((TRAILWIDTH - delimiterSize * 2) - LANESPACING*4)/ 3; //120-40 - 20

	for (var l = 0; l < 3; l++){
		var pg = new THREE.PlaneGeometry(LANEWIDTH, SECTIONHEIGHT, 30, 30);
		if (l == 0)
			pg.translate(lanes[0], SECTIONHEIGHT/2, 2);
		if (l == 1)
			pg.translate(lanes[1], SECTIONHEIGHT/2, 2);
		if (l == 2)
			pg.translate(lanes[2], SECTIONHEIGHT/2, 2);
		var pm = new THREE.MeshPhongMaterial({
			color:cols[l%2],
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});
		var lane = new THREE.Mesh(pg, pm);
		OC['lane'].push(lane);
		scene.add(lane);
	}

}

function createDelimiter(pg, boxSize){
	for (var i = 0; i < 2; i++){
		var cg = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
		if (i%2 == 0)
			cg.translate(-TRAILWIDTH/2, 0, 0)
		else 
			cg.translate(TRAILWIDTH/2, 0, 0)
		pg.merge(cg);
	}
}

var _tick = 0;
function loop(){

	OC['player'].position.y += 2;
	OC['chasingBall'].position.y += 2;
	camera.position.y += 2;


	var rowNr = (OC['player'].position.y / ROWSIZE | 0) + 1;
	//console.log(rowNr);

	if (rowNr < ROWS){
		for (var o = 0; o < OC['obstacleContainer'][rowNr].length; o++){
			var condition = OC['obstacleContainer'][rowNr][o].position.y - OC['player'].position.y;
			//console.log(condition, rowNr);
			if(condition < 550 && OC['obstacleContainer'][rowNr][o].position.z > 5 ){
				OC['obstacleContainer'][rowNr][o].position.z -= 2;
			}
		}
		for (var o = 0; o < OC['chargingObstacleContainer'].length; o++){
			var condition = OC['chargingObstacleContainer'][o].position.y - OC['player'].position.y;
			//console.log(condition, rowNr);
			if(condition < 450){
				OC['chargingObstacleContainer'][o].position.y -= 2;
			}
		}
	}

	
	

	
	updateKeyboard();

	
	_tick += 1
	var axis = new THREE.Vector3( 5.5, 0, 0 );
	var angle = -_tick * Math.PI / 64;
	   // matrix is a THREE.Matrix4()
	var _mesh = OC['chasingBall']
	var _matrix = new THREE.Matrix4()

	_matrix.makeRotationAxis( axis.normalize(), angle ); 
	_mesh.rotation.setFromRotationMatrix( _matrix );



	if (OC['player'].position.y > SECTIONHEIGHT){
		OC['player'].position.y = 0;
		OC['chasingBall'].position.y = -55;
		camera.position.y = -125;

	}


	// render the scene
	renderer.render(scene, camera);

	// call the loop function again
	requestAnimationFrame(loop);

}

function updateKeyboard(){
	keyboard.update();

	var mesh = OC.player;

	var moveDistance = 50 * clock.getDelta(); 

	if ( keyboard.down("A") ) 
		mesh.translateX( -LANEWIDTH - LANESPACING );
		//console.log('left');
	if ( keyboard.down("D") ) 
		mesh.translateX(  + LANEWIDTH + LANESPACING );
	if ( keyboard.pressed("Q") )
		mesh.translateX( -moveDistance );
	if ( keyboard.pressed("E") )
		mesh.translateX(  moveDistance );
	if ( keyboard.down("S") ){
		//speed += 5;
		//player.position.z -= 10;
	}
	//$('#pb').attr('aria-valuenow', speed*10);
	if ( keyboard.up("S") ) {}
		//speed = 1;
}

