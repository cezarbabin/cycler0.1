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
	$('#flashText').hide();
	createScene();
	createLights();
	createPlayer();
	
}

Player2 = function() {
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	var loader = new THREE.OBJLoader( manager );
	var mesh ;

	loader.load( 'tricycle.obj', function ( object) {
		object.traverse( function ( child ) {
			var bodyMat = new THREE.MeshPhongMaterial({color:Colors.pink, shading:THREE.FlatShading});
			if ( child instanceof THREE.Mesh ) {
				child.material = bodyMat;
			}
		} );
		
		set(object, true);
	} );
}

function set(object){
	player = object;
	player.position.y = 10;
	player.position.z = 180;
	player.add(camera);
	scene.add(player);
	createH();
	setXInitialPosition();
	animate();
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
	player = new Player2();	
}

function setXInitialPosition(){
	var pt = spline.getPoint( 0.00005);
	xposition = -100;
}

function createH(){
	points =  [
		new THREE.Vector3(0, 0, 0),
	  new THREE.Vector3(100, 0, 75),
	  new THREE.Vector3(0, 0, 150),
	  new THREE.Vector3(50, 0, 225),
	  new THREE.Vector3(0, 0, 300),
	  new THREE.Vector3(100, 0, 375),
	  new THREE.Vector3(0, 0, 450),
	  new THREE.Vector3(50, 0, 525),
		new THREE.Vector3(0, 0, 600),
		new THREE.Vector3(100, 0, 675),
		new THREE.Vector3(0, 0, 750),
		new THREE.Vector3(0, 0, 1750)
	  ];

  for (var i = 0; i < points.length; i++){
      var axis = new THREE.Vector3( 1, 0, 0 );
      var angle = Math.PI / 2;
      points[i].applyAxisAngle( axis, angle );
      points[i].multiplyScalar(30); 
  }

  spline = new THREE.SplineCurve3(points);


  var splineGeometry = new THREE.Geometry();
	splineGeometry.vertices = spline.getPoints( 10000 );

	var splineMaterial = new THREE.LineBasicMaterial( { color : 0xff0000, linewidth: 19 } );

	//Create the final Object3d to add to the scene
	var splineObject = new THREE.Line( splineGeometry, splineMaterial );
  //spline2 = new THREE.SplineCurve3(points.slice(0, 3));
  //spline3 = new THREE.SplineCurve3(points.slice(3, 5));
  splineObject.translateX(100);
  splineObject.translateY(20);
  scene.add(splineObject)

  var sqLength = 20;


  //createCurvePath( Colors.brown, spline, 500, sqLength, 0.25);
  createCurvePath( Colors.white, spline, 500, sqLength, 1);

  var splinePoints = spline.getPoints(1000);



	var coneMasterGeometry = new THREE.Geometry();
	for (var j = 0; j < 1000; j += 1){
  	if (typeof(splinePoints[j]) == 'undefined') {
  		break;
		}
  	
		var mat = new THREE.MeshPhongMaterial({
			color:0x00FF7F,
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});

		var r = Math.random();
		var geom = new THREE.ConeGeometry( r* 300, r * 250, 3 );
		if (j%2 ==0 ){
			geom.translate(sqLength*46, 0 ,0);
		} 

		var newMesh = new THREE.Mesh(geom, mat);

		newMesh.receiveShadow = true; 

		newMesh.rotation.x = 90 * Math.PI/180;

		newMesh.position.set(splinePoints[j].x -250, splinePoints[j].y, splinePoints[j].z);

		scene.add(newMesh);
	}

	// PARTICLES AND COINS
	for (var i=0; i<10; i++){
    var particle = new Particle();
    particlesPool.push(particle);
  }
  particlesHolder = new ParticlesHolder();
	coinsHolder = new CoinsHolder(20);
  scene.add(coinsHolder.mesh)
  scene.add(particlesHolder.mesh)

	var splinePoints = spline.getPoints(10000);
  var up = new THREE.Vector3(0, 1, 0);
	var axis = new THREE.Vector3( );
	var radians;
  for (var j = 0; j < 10000; j += 200){
  	if (typeof(splinePoints[j]) == 'undefined') {
  		break;
		}
  	var geom = new THREE.DodecahedronGeometry(10, 0 );
		var mat = new THREE.MeshPhongMaterial({
			color:Colors.red,
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});
		var newMesh = new THREE.Mesh(geom, mat);
		newMesh.receiveShadow = true; 

		newMesh.position.set(splinePoints[j].x, splinePoints[j].y, splinePoints[j].z);

		//scene.add(newMesh);
		
		tangent = spline.getTangent( j/10000 ).normalize();
    axis.crossVectors( up, tangent ).normalize();
    radians = Math.acos( up.dot( tangent ) ); 
    newMesh.quaternion.setFromAxisAngle( axis, radians );
    newMesh.rotation.x = Math.random()  * 3 * Math.PI / 180;
    var rnd =  Math.random() * 100;
		newMesh.translateX( - rnd - 50);
		newMesh.translateZ(10);

		coinsHolder.spawnCoins(newMesh.position.x, newMesh.position.y, newMesh.position.z);


  }
}

function createCurvePath(color, spline, steps, sqLength, percentage, first){

	if (first){
		spline = new THREE.SplineCurve3(spline.points.slice(spline.points.length * first, spline.points.length * percentage | 0));
	} else {
		spline = new THREE.SplineCurve3(spline.points.slice(0, spline.points.length * percentage | 0));
	}
	
	var extrudeSettings = {
    steps           : 1000,
    bevelEnabled    : false,
    extrudePath     : spline
	};

	
	var squareShape = createSquare(sqLength);
  var geometry = new THREE.ExtrudeGeometry( squareShape, extrudeSettings );
  var material = new THREE.MeshLambertMaterial( { color: color, wireframe: false } );
  meshSpline = new THREE.Mesh( geometry, material );
  scene.add( meshSpline );

}

function createSquare(sqLength){
  var squareShape = new THREE.Shape();
  squareShape.moveTo( 0,0 );
  squareShape.lineTo( -20,sqLength);
  squareShape.lineTo( 0,sqLength);
  
  squareShape.lineTo( 1,0);
  squareShape.lineTo( 1,sqLength*9);
  squareShape.lineTo( 0,sqLength*9);

  squareShape.lineTo( -20,sqLength*9);
  squareShape.lineTo( 0, sqLength *11 );
  return squareShape;
}

var particlesPool = [];
var particlesInUse = [];

Particle = function(){
  var geom = new THREE.TetrahedronGeometry(3,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0x009999,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
}

Particle.prototype.explode = function(pos, color, scale){
  var _this = this;
  var _p = this.mesh.parent;
  this.mesh.material.color = new THREE.Color( color);
  this.mesh.material.needsUpdate = true;
  this.mesh.scale.set(scale, scale, scale);
  var targetX = pos.x + (-1 + Math.random()*2)*50;
  var targetY = pos.y + (-1 + Math.random()*2)*50;
  var speed = .6+Math.random()*.2;
  //console.log(pos);
 // console.log(player.position);
  TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
  TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
  TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
      if(_p) _p.remove(_this.mesh);
      _this.mesh.scale.set(1,1,1);
      particlesPool.unshift(_this);
    }});
}

ParticlesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.particlesInUse = [];
}

ParticlesHolder.prototype.spawnParticles = function(pos, density, color, scale){

  var nPArticles = density;
  for (var i=0; i<nPArticles; i++){
    var particle;
    if (particlesPool.length) {
      particle = particlesPool.pop();
    }else{
      particle = new Particle();
    }
    this.mesh.add(particle.mesh);
    particle.mesh.visible = true;
    var _this = this;
    particle.mesh.position.y = pos.y;
    particle.mesh.position.x = pos.x;
    //particle.mesh.position.z = pos.z;
    particle.explode(pos,color, scale);
  }
}

Coin = function(){
  var geom = new THREE.TetrahedronGeometry(20,0);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.red,
    shininess:0,
    specular:0xffffff,

    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}

CoinsHolder = function (nCoins){
  this.mesh = new THREE.Object3D();
  this.coinsInUse = [];
  this.coinsPool = [];
  for (var i=0; i<nCoins; i++){
    var coin = new Coin();
    this.coinsPool.push(coin);
  }
}

CoinsHolder.prototype.spawnCoins = function(x, y, z){

  var nCoins = 1;// + Math.floor(Math.random()*10);
  //var d = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
  var amplitude = 10 + Math.round(Math.random()*10);
  for (var i=0; i<nCoins; i++){
    var coin;
    if (this.coinsPool.length) {
      coin = this.coinsPool.pop();
    }else{
      coin = new Coin();
    }
    this.mesh.add(coin.mesh);
    this.coinsInUse.push(coin);
    coin.angle = - (i*0.02);
    coin.distance = 5 + Math.cos(i*.5)*amplitude;

    coin.mesh.position.y = y;
    coin.mesh.position.x = x;
    coin.mesh.position.z = z;

  }
}

CoinsHolder.prototype.rotateCoins = function(){
  for (var i=0; i<this.coinsInUse.length; i++){
    var coin = this.coinsInUse[i];
    if (coin.exploding) continue;

    //var globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
    var diffPos = player.position.clone().sub(coin.mesh.position.clone());
    var d = diffPos.length();
    if (d<15){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, Colors.red, 3);
      i--;
    }else if (coin.angle > Math.PI){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      i--;
    }
  }
}

var speed = 0.0003;



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
	shadowLight = new THREE.DirectionalLight(0xdddddd, .6);
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

	ambientLight = new THREE.AmbientLight(0x3BB9FF, .5);
	scene.add(ambientLight);
}

// Animation stuff
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

		coinsHolder.rotateCoins();

		keyboard.update();
		var moveDistance = 50 * clock.getDelta(); 
		if ( keyboard.pressed("A") ) {
			xposition = xposition-moveDistance ;

		}
    if ( keyboard.pressed("D") ) {
			xposition = xposition+moveDistance ;
		
		}
		if ( keyboard.down("S") ) {
			speed += 0.0003
			$('#pb').attr('aria-valuenow', 80 );
		}	
		if ( keyboard.up("S") ) {
			speed = 0.0003
			$('#pb').attr('aria-valuenow', 20 );
		}	
    
    // set the marker position
    pt = spline.getPoint( t );
    player.position.set( pt.x, pt.y, pt.z);
    player.translateX(xposition);
    
    // get the tangent to the curve
    tangent = spline.getTangent( t ).normalize();
    
    // calculate the axis to rotate around
    axis.crossVectors( up, tangent ).normalize();
    axis2.crossVectors( straight, tangent ).normalize();
    
    // calcluate the angle between the up vector and the tangent
    radians = Math.acos( up.dot( tangent ) );
        
    // set the quaternion
    player.quaternion.setFromAxisAngle( axis, radians );
    
    radians = Math.asin(straight.dot(tangent));
    player.rotation.x = radians * Math.PI / 180;
    //player.quaternion.setFromAxisAngle( axis2, radians );

    if (radians > 0) {
    	//player.translateZ(Math.sin(radians) * 20);

    } else  {
    	//player.translateZ(Math.cos(radians) * 20);
    }

    player.translateZ(10);

    


		if (t  > 0.3 ){
    	var newMaterial = new THREE.MeshLambertMaterial( { color: Colors.brown, wireframe: false } );
    	meshSpline.material = newMaterial;
    	meshSpline.material.needsUpdate = true;
    	//speed = speed/2;
    	$('#flashText').show();
    }
    if (t > 0.5 ){
    	var newMaterial = new THREE.MeshLambertMaterial( { color: Colors.white, wireframe: false } );
    	meshSpline.material = newMaterial;
    	meshSpline.material.needsUpdate = true;
    	//speed = 0.0003;
    	$('#flashText').hide();
    }


        if (t > 0.8) speed = 0.00005;
    t = (t >= 1) ? 0 : t += speed;

    renderer.render(scene, camera); 

     $('#myCanvas').show();
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
		player.translateX( -moveDistance );
	}	
	
	if ( keyboard.pressed("D") )
		player.translateX(  moveDistance );
	if ( keyboard.down("R") )
		mesh.material.color = new THREE.Color(0xff0000);
	if ( keyboard.up("R") )
		mesh.material.color = new THREE.Color(0x0000ff);
}


