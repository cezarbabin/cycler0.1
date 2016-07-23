
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

function init() {
	// set up the scene, the camera and the renderer
	createScene();

	// add the lights
	createLights();

	var c =document.getElementById('resolution');
	//makeHighRes(c);

	// add the objects
	//createPlane();
	createRoad();
	createPlayer();
	createEnemy();
	//createSky();

	// start a loop that will update the objects' positions 
	// and render the scene on each frame
	loop();
}

function createScene() {
	// Get the width and the height of the screen,
	// use them to set up the aspect ratio of the camera 
	// and the size of the renderer.
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// Create the scene
	scene = new THREE.Scene();

	// Add a fog effect to the scene; same color as the
	// background color used in the style sheet
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
	
	// Create the camera
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
		// Allow transparency to show the gradient background
		// we defined in the CSS
		alpha: true, 

		// Activate the anti-aliasing; this is less performant,
		// but, as our project is low-poly based, it should be fine :)
		antialias: true
	});

	// Define the size of the renderer; in this case,
	// it will fill the entire screen
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(WIDTH, HEIGHT);
	//var mobileWidth = 640 * window.devicePixelRatio;
	//var mobileHeight = 1136 * window.devicePixelRatio;
	//renderer.setSize( mobileWidth, mobileHeight);
	
	// Enable shadow rendering
	renderer.shadowMap.enabled = true;
	
	// Add the DOM element of the renderer to the 
	// container we created in the HTML
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
	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

// Making a road object
Road = function(color, width){

	// create container
	//this.mesh = new THREE.Object3D();
	
	// create geometry
	var geom = new THREE.BoxGeometry(width,1,600,40,10);

	//this.waves = [];

	var mat = new THREE.MeshPhongMaterial({
		color:color,
		transparent:true,
		opacity:1,
		shading:THREE.FlatShading,
	});

	for (var i = 0; i < 590; i+=30){
		var rnd = Math.random();

		if (rnd > 0.5) {
			var geometry = new THREE.CylinderGeometry( Math.random() * 20, Math.random() * 20, width, 5 );
			geometry.translate(0, 0, i);
			geometry.rotateZ(-90 * Math.PI / 180);
			THREE.GeometryUtils.merge(geom, geometry);
		}


	}
	
	// create the material 
	

	var base = new THREE.Mesh(geom, mat);
	this.mesh = base;

	//generateObstacles(this.mesh, width);

	// Allow the road to receive shadows
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
	//this.mesh = mesh;

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
var obstArray = [];
var mountainArray = [];
function createRoad(){

	var colors = [Colors.blue, Colors.red,  Colors.brown, Colors.pink, Colors.white]

	for (var i = 0; i < 5; i++) {
		var temp = new Road(Colors.blue, 800);
		var tempObstacle = new Obstacle(800);
		var mountain = new Mountain(800);
		

		// push it a little bit at the bottom of the scene
		temp.mesh.position.z = -600 * i;
		tempObstacle.mesh.position.z = -600 * i;
		mountain.mesh.position.z = -600 * i;

		roadArray.push(temp);
		obstArray.push(tempObstacle);
		mountainArray.push(mountain);

		// add the mesh of the road to the scene
		scene.add(temp.mesh);
		scene.add(tempObstacle.mesh);
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


Player.prototype.updateHairs = function(){
	
	// get the hair
	var hairs = this.hairsTop.children;

	// update them according to the angle angleHairs
	var l = hairs.length;
	for (var i=0; i<l; i++){
		var h = hairs[i];
		// each hair element will scale on cyclical basis between 75% and 100% of its original size
		h.scale.y = .75 + Math.cos(this.angleHairs+i/3)*.25;
	}
	// increment the angle for the next frame
	this.angleHairs += 0.16;
}

var player;
function createPlayer(){
	player = new Player(0x00FF7F, false);
	player.mesh.position.y = 10;
	player.mesh.position.z = 180;
	player.mesh.add(camera);
	scene.add(player.mesh);
}

var enemy;
function createEnemy(){
	enemy = new Player(0x8A2BE2, true);
	enemy.mesh.position.y = 10;
	enemy.mesh.position.z = 90;
	enemy.mesh.position.x = 20;
	scene.add(enemy.mesh);
}

// Setup the clouds
Cloud = function(){
	// Create an empty container that will hold the different parts of the cloud
	this.mesh = new THREE.Object3D();
	
	// create a cube geometry;
	// this shape will be duplicated to create the cloud
	var geom = new THREE.BoxGeometry(20,20,20);
	
	// create a material; a simple white material will do the trick
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.white,  
	});
	
	// duplicate the geometry a random number of times
	var nBlocs = 3+Math.floor(Math.random()*3);
	for (var i=0; i<nBlocs; i++ ){
		
		// create the mesh by cloning the geometry
		var m = new THREE.Mesh(geom, mat); 
		
		// set the position and the rotation of each cube randomly
		m.position.x = i*15;
		m.position.y = Math.random()*10;
		m.position.z = Math.random()*10;
		m.rotation.z = Math.random()*Math.PI*2;
		m.rotation.y = Math.random()*Math.PI*2;
		
		// set the size of the cube randomly
		var s = .1 + Math.random()*.9;
		m.scale.set(s,s,s);
		
		// allow each cube to cast and to receive shadows
		m.castShadow = true;
		m.receiveShadow = true;
		
		// add the cube to the container we first created
		this.mesh.add(m);
	} 
}
// Define a Sky Object
Sky = function(){
	// Create an empty container
	this.mesh = new THREE.Object3D();
	
	// choose a number of clouds to be scattered in the sky
	this.nClouds = 40;
	
	// To distribute the clouds consistently,
	// we need to place them according to a uniform angle
	var stepAngle = Math.PI*2 / this.nClouds;
	
	// create the clouds
	for(var i=0; i<this.nClouds; i++){
		var c = new Cloud();
	 
		// set the rotation and the position of each cloud;
		// for that we use a bit of trigonometry
		var a = stepAngle*i; // this is the final angle of the cloud
		var h = 750; //+ Math.random()*200; // this is the distance between the center of the axis and the cloud itself

		// Trigonometry!!! I hope you remember what you've learned in Math :)
		// in case you don't: 
		// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
		c.mesh.position.y = Math.sin(a)*h;
		c.mesh.position.x = Math.cos(a)*h;

		// rotate the cloud according to its position
		c.mesh.rotation.z = a + Math.PI/2;

		// for a better result, we position the clouds 
		// at random depths inside of the scene
		c.mesh.position.z = -400-Math.random()*800;
		// ******* THATS WHY THERE IS ONLY ONE REGION
		
		// we also set a random scale for each cloud
		var s = 1+Math.random()*2;
		c.mesh.scale.set(s,s,s);

		// do not forget to add the mesh of each cloud in the scene
		this.mesh.add(c.mesh);  
	}  
}

// Now we instantiate the sky and push its center a bit
// towards the bottom of the screen
var sky;
function createSky(){
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}

var speed = 3;
var k = 0;
function loop(){
	stats.update();
	//player.updateHairs();
	//console.log(mountainArray);
	//console.log(obstArray);

	updateKeyboard();
	enemy.mesh.position.z += 0.1;
	for (var i = 0; i < 5; i++) {
		roadArray[i].mesh.position.z += speed;
		obstArray[i].mesh.position.z += speed;
		mountainArray[i].mesh.position.z += speed;
		if (roadArray[0].mesh.position.z > 600){
			disposeOfRoadOptimized(roadArray[0]);
			disposeOfRoadOptimized(obstArray[0]);
			disposeOfRoadOptimized(mountainArray[0]);
			roadArray.shift();
			obstArray.shift();
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
	if ( keyboard.down("S") )
		speed += 5;
		$('#pb').attr('aria-valuenow', speed*10);
	if ( keyboard.up("S") )
		speed = 3;
}

function addAnother() {

	var colors = [Colors.blue, Colors.red];

	var temp = new Road(Colors.blue, 600);
	var tempObst = new Obstacle(600);
	var tempMountain = new Mountain(600);

	// push it a little bit at the bottom of the scene
	console.log(k);

	temp.mesh.position.z = -580 * 4;
	tempObst.mesh.position.z = -580 * 4;
	tempMountain.mesh.position.z = -580 * 4;
	
	scene.add(temp.mesh);
	scene.add(tempObst.mesh);
	scene.add(tempMountain.mesh);

	roadArray.push(temp);
	obstArray.push(tempObst);
	mountainArray.push(tempMountain);


	// add the mesh of the road to the scene
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
        // now scale the context to counter
        // the fact that we've manually scaled
        // our canvas element
        renderer.setSize(world.width, world.height);
    }
}
