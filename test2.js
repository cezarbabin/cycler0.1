var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container, clock;

var stats = new Stats();

var clock = new THREE.Clock();
var keyboard = new KeyboardState();
var xposition;

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
	createH();
	setXInitialPosition();
	animate();
}

function setXInitialPosition(){
	var pt = spline.getPoint( 0.00005);
	xposition = -100;
}

function createH(){
	points =  [new THREE.Vector3(177.6076794686664, -189.59719456131666, 128.8401263489414),
    new THREE.Vector3(-71.23931862284905, -153.9368085070406, 5.284478503819692),
    new THREE.Vector3(-300.12290112941974, -144.47085896766586, 84.18142304788832),
    new THREE.Vector3(-284.73829876413123, -158.77686893740247, -433.4249196789108),
    new THREE.Vector3(-16.913449190888514, -153.90042496472668, -463.34498312188373),
    new THREE.Vector3(551.6592551464272, -160.4979520898124, -620.8820906330495),
    new THREE.Vector3(506.0060755889224, -169.487941154214, -23.248918892483424),
    new THREE.Vector3(265.2380528628295, -165.47463489939983, 179.8685250961414)];
    
  for (var i = 0; i < points.length; i++){
      var axis = new THREE.Vector3( 1, 0, 0 );
      var angle = Math.PI / 2;
      points[i].applyAxisAngle( axis, angle );
      points[i].multiplyScalar(100); 
  }
  spline = new THREE.SplineCurve3(points);

  var splineObject = new THREE.Line( geometry, material );
  var extrudeSettings = {
                      steps           : 1000,
                      bevelEnabled    : false,
                      extrudePath     : spline
                  };
  var sqLength = 20;
  var squareShape = new THREE.Shape();
  squareShape.moveTo( 0,0 );
  squareShape.lineTo( 0, sqLength *10 );
  squareShape.lineTo( 1, sqLength * 10 );
  squareShape.lineTo( 1, 0 );
  squareShape.lineTo( 0, 0 );
  var geometry = new THREE.ExtrudeGeometry( squareShape, extrudeSettings );
  var material = new THREE.MeshLambertMaterial( { color: Colors.blue, wireframe: false } );

  var splinePoints = spline.getPoints(10000);


  var up = new THREE.Vector3(0, 1, 0);
	var axis = new THREE.Vector3( );
	var radians;
  for (var j = 0; j < 10000 ; j += 100){
  	if (typeof(splinePoints[j]) == 'undefined') {
  		break;
		}
  	var geom = new THREE.BoxGeometry(40,40,40,40,10);

		var mat = new THREE.MeshPhongMaterial({
			color:Colors.red,
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});

		var newMesh = new THREE.Mesh(geom, mat);

		// Allow the road to receive shadows
		newMesh.receiveShadow = true; 

		//console.log(geom.vertices[j]);

		newMesh.position.set(splinePoints[j].x, splinePoints[j].y, splinePoints[j].z);



		scene.add(newMesh);
		
		tangent = spline.getTangent( j/10000 ).normalize();
    
    // calculate the axis to rotate around
    axis.crossVectors( up, tangent ).normalize();

    // calcluate the angle between the up vector and the tangent
    radians = Math.acos( up.dot( tangent ) ); 

    newMesh.quaternion.setFromAxisAngle( axis, radians );

    newMesh.rotation.x = Math.random()  * 3 * Math.PI / 180;

    var rnd =  Math.random() * 150;
		newMesh.translateX( - rnd - 50);
		console.log(rnd);

    if (radians > 0) {
    	//newMesh.translateZ(Math.sin(radians) * 20);
    } else  {
    	//newMesh.translateZ(Math.cos(radians) * 20);
    }
  }

  var meshSpline = new THREE.Mesh( geometry, material );

  var material = new THREE.LineBasicMaterial({
      color: 0xff00f0,
  });
  var geometry = new THREE.Geometry();
  for(var i = 0; i < spline.getPoints(200).length; i++){
      geometry.vertices.push(spline.getPoints(200)[i]);  
  }
  var line = new THREE.Line(geometry, material);

  scene.add( meshSpline );
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
	
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 70;
  camera.position.y = -65;
  camera.rotation.x = 60 * Math.PI / 180;

	renderer = new THREE.WebGLRenderer({ 
		// Allow transparency to show the gradient background
		// we defined in the CSS
		alpha: true, 

		// Activate the anti-aliasing; this is less performant,
		// but, as our project is low-poly based, it should be fine :)
		antialias: true 
	});

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

function animate() {
    requestAnimationFrame(animate);
    render();
}   
var t = 0;
var camPosIndex = 0;
var up = new THREE.Vector3(0, 1, 0);
var straight = new THREE.Vector3(-1, 0, 0);
var axis = new THREE.Vector3( );
var axis2 = new THREE.Vector3( );

function render() {

		stats.update();

		keyboard.update();
		var moveDistance = 50 * clock.getDelta(); 
		if ( keyboard.pressed("A") ) {
			xposition = xposition-moveDistance ;		
		}
    if ( keyboard.pressed("D") ) {
			xposition = xposition+moveDistance ;
		}
    
    // set the marker position
    pt = spline.getPoint( t );
    player.mesh.position.set( pt.x, pt.y, pt.z);
    player.mesh.translateX(xposition);
    
    // get the tangent to the curve
    tangent = spline.getTangent( t ).normalize();
    
    // calculate the axis to rotate around
    axis.crossVectors( up, tangent ).normalize();
    axis2.crossVectors( straight, tangent ).normalize();
    
    // calcluate the angle between the up vector and the tangent
    radians = Math.acos( up.dot( tangent ) );
        
    // set the quaternion
    player.mesh.quaternion.setFromAxisAngle( axis, radians );
    
    radians = Math.asin(straight.dot(tangent));
    player.mesh.rotation.x = radians * Math.PI / 180;
    //player.mesh.quaternion.setFromAxisAngle( axis2, radians );

    if (radians > 0) {
    	player.mesh.translateZ(Math.sin(radians) * 20);

    } else  {
    	player.mesh.translateZ(Math.cos(radians) * 20);
    }
        
    t = (t >= 1) ? 0 : t += 0.0001;

    renderer.render(scene, camera); 
}

function update(radians)
{
	keyboard.update();
	var moveDistance = 50 * clock.getDelta(); 
	if ( keyboard.down("left") ) 
		mesh.translateX( -50 );
	if ( keyboard.down("right") ) 
		mesh.translateX(  50 );
	if ( keyboard.pressed("A") ) {
		console.log('hi');
		player.mesh.translateX( -moveDistance );
	}	
	if ( keyboard.pressed("D") )
		player.mesh.translateX(  moveDistance );
	if ( keyboard.down("R") )
		mesh.material.color = new THREE.Color(0xff0000);
	if ( keyboard.up("R") )
		mesh.material.color = new THREE.Color(0x0000ff);
}


