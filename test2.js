var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container, clock;

var stats = new Stats();

var clock = new THREE.Clock();
var keyboard = new KeyboardState();

window.addEventListener('load', init, false);

var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

function init() {
	createScene();
	createLights();
	createRoad();

	createPlayer();

	scene.add( meshSpline );

	loop();
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
	

	camera = new THREE.PerspectiveCamera;
	camera.position.x = 0;
	camera.position.z = 200;
	camera.position.y = 50;
	//camera.rotation.x = 90 * Math.PI / 180;
	
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
	renderer.setSize(WIDTH, HEIGHT);
	
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

var randomPoints2 = [new THREE.Vector3(-323.0550147134401, 88.41256695348932, 476.773194135871),
	new THREE.Vector3(-225.4891213071726, 178.8107531261258, 285.3094285584699),
	new THREE.Vector3(-632.6720101292041, 239.72799271191008, 80.6955646173692),
	new THREE.Vector3(-878.2864580990286, 456.8855411916313, -632.9582192820432),
	new THREE.Vector3(-303.8032494241374, 560.7781987719341, -314.6171915891019),
	new THREE.Vector3(-542.9538873114697, 792.558268986469, -129.9714803216823),
	new THREE.Vector3(-413.6004915238309, 874.0640096754225, -26.57707111030811),
	new THREE.Vector3(-173.59237648970083, 951.0395135489118, -286.9272193873354),
	new THREE.Vector3(-578.7684355599442, 1068.451029475109, -345.5103110288372),
	new THREE.Vector3(-279.1934885064545, 1058.6396179616245, 9.419939608452523)];

var randomPoints = [new THREE.Vector3(-323.0550147134401, 10, 476.773194135871),
	new THREE.Vector3(-225.4891213071726, 10, 285.3094285584699),
	new THREE.Vector3(-632.6720101292041, 10, 80.6955646173692),
	new THREE.Vector3(-878.2864580990286, 10, -632.9582192820432),
	new THREE.Vector3(-303.8032494241374, 10, -314.6171915891019),
	new THREE.Vector3(-542.9538873114697, 10, -129.9714803216823),
	new THREE.Vector3(-413.6004915238309, 10, -26.57707111030811),
	new THREE.Vector3(-173.59237648970083, 10, -286.9272193873354),
	new THREE.Vector3(-578.7684355599442, 10, -345.5103110288372),
	new THREE.Vector3(-279.1934885064545, 10, 9.419939608452523)];

var randomPoints3 = [new THREE.Vector3(-323.0550147134401, 88.41256695348932, 10),
	new THREE.Vector3(-225.4891213071726, 178.8107531261258, 10),
	new THREE.Vector3(-632.6720101292041, 239.72799271191008, 10),
	new THREE.Vector3(-878.2864580990286, 456.8855411916313, 10),
	new THREE.Vector3(-303.8032494241374, 560.7781987719341, 10),
	new THREE.Vector3(-542.9538873114697, 792.558268986469, 10),
	new THREE.Vector3(-413.6004915238309, 874.0640096754225, 10),
	new THREE.Vector3(-173.59237648970083, 951.0395135489118, 10),
	new THREE.Vector3(-578.7684355599442, 1068.451029475109, 10),
	new THREE.Vector3(-279.1934885064545, 1058.6396179616245, 10)];


for (var i = 0; i < randomPoints.length; i++){
	randomPoints[i] = randomPoints[i].multiplyScalar(10);
}

var spline = new THREE.SplineCurve3(randomPoints);
var geometry = new THREE.Geometry();
geometry.vertices = spline.getPoints( 150 );

var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

//Create the final Object3d to add to the scene
var splineObject = new THREE.Line( geometry, material );

var extrudeSettings = {
					steps			: 1000,
					bevelEnabled	: false,
					extrudePath		: spline
				};
var sqLength = 20;
var squareShape = new THREE.Shape();
squareShape.moveTo( 0,0 );
squareShape.lineTo( 0, sqLength );
squareShape.lineTo( sqLength, sqLength );
squareShape.lineTo( sqLength, 0 );
squareShape.lineTo( 0, 0 );
var geometry = new THREE.ExtrudeGeometry( squareShape, extrudeSettings );
var material = new THREE.MeshLambertMaterial( { color: 0xb00000, wireframe: false } );
var meshSpline = new THREE.Mesh( geometry, material );

Road = function(color, width){

	// create container
	//this.mesh = new THREE.Object3D();
	
	// create geometry
	var geom = new THREE.BoxGeometry(width,1,590,40,10);
	
	// create the material 
	var mat = new THREE.MeshPhongMaterial({
		color:color,
		transparent:true,
		opacity:1,
		shading:THREE.FlatShading,
	});

	var base = new THREE.Mesh(geom, mat);
	this.mesh = base;

	//generateObstacles(this.mesh, width);

	// Allow the road to receive shadows
	this.mesh.receiveShadow = true; 
}

var roadArray = [];
var obstArray = [];
function createRoad(){

	var colors = [Colors.blue, Colors.red,  Colors.brown, Colors.pink, Colors.white]

	for (var i = 0; i < 5; i++) {
		var temp = new Road(colors[i], 800);
		

		// push it a little bit at the bottom of the scene
		temp.mesh.position.z = -600 * i;

		roadArray.push(temp);

		// add the mesh of the road to the scene
		scene.add(temp.mesh);
		

	}
}



// Making a player
Player = function(){
	var geom = new THREE.BoxGeometry(20,20,20,40,10);

	var mat = new THREE.MeshPhongMaterial({
		color:Colors.brown,
		transparent:true,
		opacity:1,
		shading:THREE.FlatShading,
	});

	this.mesh = new THREE.Mesh(geom, mat);

	// Allow the road to receive shadows
	this.mesh.receiveShadow = true; 
}
var player;
function createPlayer(){
	player = new Player();
	player.mesh.position.y = 10;
	player.mesh.position.z = 180;
	player.mesh.add(camera);
	scene.add(player.mesh);
}


var camPosIndex = 0;
var up = new THREE.Vector3(0, 1, 0 );
var axis = new THREE.Vector3( );
function loop(){
	stats.update();

	// render the scene
	renderer.render(scene, camera);

	// call the loop function again
	requestAnimationFrame(loop);

	camPosIndex++;
  if (camPosIndex > 1000) {
    camPosIndex = 0;
  }
  var camPos = spline.getPoint(camPosIndex / 1000);
  var tangent = spline.getTangent(camPosIndex / 1000);
	
	//axis.crossVectors( up, tangent ).normalize();
	//var radians = Math.acos( up.dot( tangent ) );
  //var camPos = meshSpline.geometry.vertices[camPosIndex];

  player.mesh.position.x = camPos.x;
  player.mesh.position.y = camPos.y;
  player.mesh.position.z = camPos.z;

  var rad = Math.atan2(tangent.x, tangent.y);

  //console.log(tangent);
  
  //player.mesh.rotation.y = rad  ;

  //player.mesh.rotation.x = camRot.x;
  //player.mesh.rotation.y = camRot.y;
  //player.mesh.quaternion.setFromAxisAngle( axis, radians );
  
  //console.log(camPos.x, camPos.y, camPos.z)
  //camera.lookAt(spline.getPoint((camPosIndex+1) / 10000));

}

