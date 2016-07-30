
var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container, clock;

var stats = new Stats();

var clock = new THREE.Clock();
var keyboard = new KeyboardState();

var collidableMeshList = [];

var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

window.addEventListener('load', init, false);


var player;
var enemy;
function init() {
	createScene();
	createLights();
	player = new Player2(false);
	enemy = new Player2(true);
	createRoad();
}

function createScene() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 120;
	nearPlane = 1;
	farPlane = 20000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	
	// Set the position of the camera
	camera.position.z = 20;
  camera.position.y = 50;
  camera.rotation.x = -30 * Math.PI / 180;
	
	// Create the renderer
	renderer = new THREE.WebGLRenderer({ 
		alpha: true, 
		antialias: true
	});

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(WIDTH, HEIGHT);

	renderer.shadowMap.enabled = true;
	
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);

	//stats = new Stats();
	//stats.domElement.style.position = 'absolute';
	//stats.domElement.style.bottom = '0px';
	//stats.domElement.style.zIndex = 100;
	//container.appendChild( stats.domElement );
	
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
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);
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
}

Road = function(color, width){
	this.mesh = MAKETERRAIN.WithParams('gey')
	this.mesh.receiveShadow = true; 
}

Obstacle = function(width){
	// Generate obstacles randomly
	var singleGeometry = new THREE.Geometry();
	var geom = new THREE.IcosahedronGeometry(20,Math.random()*3 | 0);

	geom.translate(0, -20, 0);

	var mat = new THREE.MeshPhongMaterial({
			color:Colors.white,
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});

	for (var i = 0; i < 5; i++) {
		//var mesh = new THREE.Mesh(geom);
		var mesh = new THREE.Mesh(geom);

		mesh.position.z = Math.random() * 590;
		//mesh.position.z = 100;
		mesh.position.x = posNeg() * Math.random() * width/4;
		//mesh.position.x = -80;
		mesh.position.y = 10;

		mesh.updateMatrix();

		singleGeometry.merge(mesh.geometry, mesh.matrix);
	}

	this.mesh = new THREE.Mesh(singleGeometry, mat);
}

Mountain = function(width){
	var singleGeometry = new THREE.Geometry();
	var geom = new THREE.DodecahedronGeometry(300,Math.random()*2 | 0);
	geom.rotateX(Math.random() * Math.PI);

	var mat = new THREE.MeshPhongMaterial({
		color:0x666666,
		transparent:true,
		opacity:1,
		shading:THREE.FlatShading,
	});

	for (var i = 0; i < 5; i++) {
		//var mesh = new THREE.Mesh(geom);
		var mesh = new THREE.Mesh(geom);


		var rnd = Math.random();
		if (rnd > 0.5) {
			mesh.position.x = width/2 + 150;
		}
		else {
			mesh.position.x = -width/2 - 150;
		}
		

		mesh.position.z = Math.random() * 590;
		mesh.position.y = -60;

		mesh.updateMatrix();

		singleGeometry.merge(mesh.geometry, mesh.matrix);
	}
	this.mesh = new THREE.Mesh(singleGeometry, mat);
}

function posNeg(){
	var n = Math.random();
	if (n > 0.5) {
		return -1;
	} else {
		return 1;
	}
}

// Instantiate the road and add it to the scene:
var roadArray = [];
//var obstArray = [];
var mountainArray = [];
function createRoad(){

	var colors = [Colors.blue, Colors.red,  Colors.brown, Colors.pink, Colors.white]

	for (var i = 0; i < 5; i++) {
		var temp = new Road(Colors.blue, 800);
		var mountain = new Mountain(800);
		temp.mesh.position.z = -600 * i;
		mountain.mesh.position.z = -600 * i;

		roadArray.push(temp);
		mountainArray.push(mountain);

		scene.add(temp.mesh);
		scene.add(mountain.mesh);
		

	}
}

// Making a player
Player = function(color, enemy){
	this.mesh = new THREE.Object3D();

	// Make boat
	var geom = new THREE.ConeGeometry( 5, 20, 32 );
	geom.translate(0, 20, 0);
	var cylinder = new THREE.CylinderGeometry( 5, 5, 20, 32 );
	THREE.GeometryUtils.merge(geom, cylinder);
	geom.rotateX(-90 * Math.PI / 180);
	var backCone = new THREE.ConeGeometry( 5, 20, 32 );
	backCone.rotateX(90 * Math.PI / 180);
	backCone.translate(0, 0, 20);
	THREE.GeometryUtils.merge(geom, backCone);
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.brown,
		transparent:true,
		opacity:1,
		shading:THREE.FlatShading,
	});
	var boat = new THREE.Mesh(geom, mat);
	this.mesh.add(boat);

	//var geom = new new THREE.ConeGeometry( 5, 20, 32 );


	// Body of the pilot
	var bodyGeom = new THREE.BoxGeometry(5,5,2);
	var bodyMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
	bodyGeom.translate(0, 10, 0);
	var body = new THREE.Mesh(bodyGeom, bodyMat);
	this.mesh.add(body);

	// Face of the pilot
	var faceGeom = new THREE.BoxGeometry(8,8,8);
	var faceMat = new THREE.MeshLambertMaterial({color:Colors.white});
	var face = new THREE.Mesh(faceGeom, faceMat);
	faceGeom.translate(0, 3, 0);
	this.mesh.add(face);

	var helmetGeom = new THREE.SphereGeometry(3, 20, 20);
	var helmetMat = new THREE.MeshLambertMaterial({color:color});
	var helmet = new THREE.Mesh(helmetGeom, helmetMat);
	helmetGeom.translate(0, 12, 1);
	this.mesh.add(helmet);

	if (enemy){

	}

	this.mesh.receiveShadow = true;
}

Player2 = function(enemy) {
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {

		console.log( item, loaded, total );

	};

	var loader = new THREE.OBJLoader( manager );
	var mesh ;

	if (enemy){
		loader.load( 'untitled2.obj', function ( object) {
			object.traverse( function ( child ) {
				var bodyMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading, opacity:0.5});
				if ( child instanceof THREE.Mesh ) {
					child.material = bodyMat;
				}
			} );
			
			set(object, true);
			
		} );

	} else {
		loader.load( 'untitled2.obj', function ( object) {
			object.traverse( function ( child ) {
				var bodyMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
				if ( child instanceof THREE.Mesh ) {
					child.material = bodyMat;
				}
			} );
			
			set(object, false);
		} );
	}

	//this.mesh = playerObj;
}

var playerObj;
function set(object, enemy){
	console.log(enemy);
	if(enemy){
		//enemy.mesh = object;
		createEnemy(object);
		console.log('enemy ready');

	} else {
		//player.mesh = object;	
		createPlayer(object);
		console.log('player ready');

	}

	if (enemy){
		loop();
	}	
}

function createPlayer(player){
	player.position.y = 20;
	player.position.z = 180;
	player.add(camera);
	scene.add(player);
	this.player = player;
}

function createEnemy(enemy){
	enemy.position.y = 20;
	enemy.position.z = 90;
	//enemy.position.x = 20;
	//console.log(enemy.mesh);
	scene.add(enemy);
	this.enemy = enemy;
}

var speed = 1;
var k = 0;
var enemyCounter = 0;
function loop(){
	stats.update();

	enemyCounter += 1;
	if (enemyCounter % 120 == 0)
		this.enemy.position.z -= 30;
	else 
		this.enemy.position.z += 0.1;

	updateKeyboard();
	
	for (var i = 0; i < 5; i++) {
		roadArray[i].mesh.position.z += speed;
		mountainArray[i].mesh.position.z += speed;
		if (roadArray[0].mesh.position.z > 600){
			disposeOfRoadOptimized(roadArray[0]);
			disposeOfRoadOptimized(mountainArray[0]);
			roadArray.shift();
			mountainArray.shift();
			addAnother();
			k++; 
		}
	}

	// render the scene
	renderer.render(scene, camera);

	// call the loop function again
	requestAnimationFrame(loop);
}

function disposeOfRoad(el){
	for (var obj in el.children) {
		console.log('here');
		scene.remove(obj.mesh);
		obj.mesh.geometry.dispose();
		obj.mesh.material.dispose();

		renderer.dispose(obj.mesh);
		renderer.dispose(obj.mesh.geometry);
		renderer.dispose(obj.mesh.material);

		mesh = undefined;
		obj = undefined;
	}
	el.children = undefined;
	el = undefined;
}

function disposeOfRoadOptimized(obj) {
	scene.remove(obj.mesh);
	obj.mesh.geometry.dispose();
	obj.mesh.material.dispose();

	renderer.dispose(obj.mesh);
	renderer.dispose(obj.mesh.geometry);
	renderer.dispose(obj.mesh.material);

	obj.mesh = undefined;
	obj = undefined;
}

function updateKeyboard(){
	keyboard.update();

	var mesh = player.mesh;

	var moveDistance = 50 * clock.getDelta(); 
	if ( keyboard.down("left") ) 
		mesh.translateX( -50 );
		//console.log('left');
	if ( keyboard.down("right") ) 
		mesh.translateX(  50 );
	if ( keyboard.pressed("A") )
		mesh.translateX( -moveDistance );
	if ( keyboard.pressed("D") )
		mesh.translateX(  moveDistance );
	if ( keyboard.down("R") )
		mesh.material.color = new THREE.Color(0xff0000);
	if ( keyboard.up("R") )
		mesh.material.color = new THREE.Color(0x0000ff);
	if ( keyboard.down("S") ){
		speed += 5;
		player.position.z -= 10;
	}
	$('#pb').attr('aria-valuenow', speed*10);
		
	if ( keyboard.up("S") )
		speed = 1;
}

function addAnother() {

	var colors = [Colors.blue, Colors.red];

	var temp = new Road(Colors.blue, 600);
	var tempMountain = new Mountain(600);

	temp.mesh.position.z = -580 * 4;
	tempMountain.mesh.position.z = -580 * 4;
	
	scene.add(temp.mesh);
	scene.add(tempMountain.mesh);

	roadArray.push(temp);
	mountainArray.push(tempMountain);
}

function makeHighRes(c) {
    console.log(c.id);
    var ctx = c.getContext('2d');
    // finally query the various pixel ratios
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;
    var ratio = devicePixelRatio / backingStoreRatio;
    var world = document.getElementById('world');
    // upscale canvas if the two ratios don't match
    if (devicePixelRatio !== backingStoreRatio) {
    
        var oldWidth = world.width;
        var oldHeight = world.height;
        world.width = Math.round(oldWidth * ratio);
        world.height = Math.round(oldHeight * ratio);
        world.style.width = oldWidth + 'px';
        world.style.height = oldHeight + 'px';

        renderer.setSize(world.width, world.height);
    }
}
