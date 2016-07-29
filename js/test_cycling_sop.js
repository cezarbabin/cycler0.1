var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container, clock;

var stats = new Stats();

var clock = new THREE.Clock();
var keyboard = new KeyboardState();
var OC;

/// CONSTANTS
var TRAILWIDTH = 100;
var UWWIDTH = 500;
var SECTIONHEIGHT = 1000;

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
	if (name == 'underWorld' || name == 'trail'){
		this[name] = [];
	} 
}

function init() {
	$('#flashText').hide();
	createScene();
	createLights();
	OC = new ObjectContainer();

	OC.initialize('underWorld');
	OC.initialize('trail');
	OC.initialize('player');
	OC.initialize('chasingBall');

	// Player loading starts the gmame
	createSection();
	createPlayer();	
	createChasingBall();
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

function set(object, name){
	OC.initialize('player');
	OC[name] = object;
	scene.add(object);
	if (name == "player"){
		object.add(camera);
		var bbox = new THREE.Box3().setFromObject(object);
		var displacement = bbox.max.y - bbox.min.y;
		object.position.y += displacement;
		loop();
	}
}

function createSection() {
	var pg = new THREE.PlaneGeometry(SECTIONHEIGHT, SECTIONHEIGHT, 30, 30);
	createDelimiter(pg);
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

	var cg = new THREE.BoxGeometry(20, 20, 20)
}

function createDelimiter(pg){
	for (var i = 0; i < 2; i++){
		var cg = new THREE.BoxGeometry(20, 20, 20)
		if (i%2 == 0)
			cg.translate(-TRAILWIDTH/2, 0, 0)
		else 
			cg.translate(TRAILWIDTH/2, 0, 0)
		pg.merge(cg);
	}
}

var _tick = 0;
function loop(){

	OC['player'].position.y +=1;
	OC['chasingBall'].position.y += 1;

	
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

	}


	// render the scene
	renderer.render(scene, camera);

	// call the loop function again
	requestAnimationFrame(loop);

}

