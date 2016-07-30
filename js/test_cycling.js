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
	//$('#flashText').hide();
	createScene();
	createLights();
	createPlayer();
}

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
	//stats = new Stats();
	//stats.domElement.style.position = 'absolute';
	//stats.domElement.style.bottom = '0px';
	//stats.domElement.style.zIndex = 100;
	//container.appendChild( stats.domElement );
	
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

Player2 = function() {
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	var loader = new THREE.OBJLoader( manager );
	var mesh ;

	loader.load( 'tricycle.obj', function ( object) {
		object.traverse( function ( child ) {
			var bodyMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
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
	player.position.z = 130;
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
		new THREE.Vector3(0, 0, 750)
	 ];

	 for (var p = 0; p < 12; p++){
	 	var x;
	 	if (p%3 == 0)
	 		x = 50;
	 	else if (p%3 == 1)
	 		x = 0;
	 	else 
	 		x = 100;
	 	points.push(new THREE.Vector3(x, 0, 750 + (p + 1) * 75));
	 }

  for (var i = 0; i < points.length; i++){
      var axis = new THREE.Vector3( 1, 0, 0 );
      var angle = Math.PI / 2;
      points[i].applyAxisAngle( axis, angle );
      points[i].multiplyScalar(60); 
  }

  spline = new THREE.SplineCurve3(points);

  // Create spline guide 
  //splineGuide();
 
  // Create road
  createCurvePath( '#ededed', spline, 500, 45, 1);


  var splinePoints = spline.getPoints(1000);

  // Create mountains
  createTrees(200, 400, splinePoints);
  createGluten(0, 200, splinePoints);
  createTrees(400, 600, splinePoints);
  createMountains(600, 800, splinePoints);

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
  for (var j = 0; j < 10000; j += 20){
  	if (typeof(splinePoints[j]) == 'undefined') {
  		break;
		}
  	var geom = new THREE.DodecahedronGeometry(10, 0 );
		var mat = new THREE.MeshPhongMaterial({
			color:Colors.blue,
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
    //newMesh.rotation.x = Math.random()  * 3 * Math.PI / 180;
    var rnd =  Math.random() * 100;
		newMesh.translateX( - rnd - 50);
		newMesh.translateZ(10);

		coinsHolder.spawnCoins(newMesh.position.x, newMesh.position.y, newMesh.position.z);
  }
}

function createTrees(start, end, splinePoints){
	
	var coneMasterGeometry = new THREE.Geometry();
	for (var j = start; j < end; j += 1){
  	if (typeof(splinePoints[j]) == 'undefined') {
  		break;
		}

		var colorito = ["#B2EC5D", "#77DD77", "#008000", "#85BB65", "#87A96B"];
  	
		var mat = new THREE.MeshPhongMaterial({
			color:colorito[Math.floor(Math.random()*colorito.length)],
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});

		var mat2 = new THREE.MeshPhongMaterial({
			color:Colors.brown,
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});

		var r = Math.random() * (0.7 - 0.3) + 0.3;
		var geom = new THREE.BoxGeometry( r* 100, r * 100,  r*100);
		var geomBottom = new THREE.BoxGeometry(  r* 10,  r*10, r * 70);

		var newMesh = new THREE.Mesh(geom, mat);
		var newMeshBottom = new THREE.Mesh(geomBottom, mat2);

		//newMeshBottom.rotation.y = 90 * Math.PI/180;

		//newMesh.position.set(splinePoints[j].x -250, splinePoints[j].y, splinePoints[j].z);
		newMesh.receiveShadow = true; 
		//newMesh.rotation.x = -60 * Math.PI/180;
		alignmentTransformation(newMesh, j/1000, true);
		alignmentTransformation(newMeshBottom, j/1000, true);

		
		if (j%2 ==0 ) {
			newMesh.translateX(30);
			newMeshBottom.translateX(30);
		} else {
			newMesh.translateX(-230);
			newMeshBottom.translateX(-230);
		}

		//newMesh.rotation.x =  10 * Math.PI/180;
		newMesh.position.z = newMesh.position.z + r*50 + 20;
		newMeshBottom.position.z = newMeshBottom.position.z + r*25 ;

	
		scene.add(newMesh);
		scene.add(newMeshBottom);
	}
}

function createMountains(start, end, splinePoints){
	
	var coneMasterGeometry = new THREE.Geometry();
	for (var j = start; j < end; j += 1){
  	if (typeof(splinePoints[j]) == 'undefined') {
  		break;
		}

		var colorito = ["#8e4e8e", "#472747", "#000066", "#8000FF", "#a64dff"];
  	
		var mat = new THREE.MeshPhongMaterial({
			color:colorito[Math.floor(Math.random()*colorito.length)],
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});

		var mat2 = new THREE.MeshPhongMaterial({
			color:Colors.brown,
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});

		var r = Math.random() * (0.7 - 0.3) + 0.3;
		var geom = new THREE.TetrahedronGeometry( Math.random() * 70 + 50,0 );

		//console.log(geom.vertices.lengt
		var newMesh = new THREE.Mesh(geom, mat);
		newMesh.rotation.z = 90 * Math.random() * Math.PI * 180;

		//newMesh.position.set(splinePoints[j].x -250, splinePoints[j].y, splinePoints[j].z);
		newMesh.receiveShadow = true; 
		//newMesh.rotation.x = -60 * Math.PI/180;
		alignmentTransformation(newMesh, j/1000, true);
		//newMesh.rotation.z = 90 * Math.random() * Math.PI * 180;
		
		if (j%2 ==0 ) {
			newMesh.translateX(50);
		} else {
			newMesh.translateX(-250);
		}

		//newMesh.rotation.x =  10 * Math.PI/180;

		scene.add(newMesh);
	}
}

function createGluten(start, end, splinePoints){
	
	var coneMasterGeometry = new THREE.Geometry();
	for (var j = start; j < end; j += 1){
  	if (typeof(splinePoints[j]) == 'undefined') {
  		break;
		}

		var colorito = ["#FFB90F", "#FBDB0C", "#CDCD00"];
  	
		var mat = new THREE.MeshPhongMaterial({
			color:colorito[Math.floor(Math.random()*colorito.length)],
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});

		var mat2 = new THREE.MeshPhongMaterial({
			color:Colors.brown,
			transparent:true,
			opacity:1,
			shading:THREE.FlatShading,
		});

		var r = Math.random() * (0.7 - 0.3) + 0.3;
		var geom = new THREE.PlaneGeometry( 200, 500, 30, 30 );

		for (var v = 0; v < geom.vertices.length; v++) {
			geom.vertices[v].z = Math.random() * 30 + 10;
		}

		//console.log(geom.vertices.lengt
		var newMesh = new THREE.Mesh(geom, mat);
		newMesh.rotation.z = 90 * Math.random() * Math.PI * 180;

		//newMesh.position.set(splinePoints[j].x -250, splinePoints[j].y, splinePoints[j].z);
		newMesh.receiveShadow = true; 
		//newMesh.rotation.x = -60 * Math.PI/180;
		alignmentTransformation(newMesh, j/1000, true);
		//newMesh.rotation.z = 90 * Math.random() * Math.PI * 180;
		
		if (j%2 ==0 ) {
			newMesh.translateX(80);
		} else {
			newMesh.translateX(-280);
		}

		//newMesh.rotation.x =  10 * Math.PI/180;

		scene.add(newMesh);
	}
}

function splineGuide(){
	var splineGeometry = new THREE.Geometry();
	splineGeometry.vertices = spline.getPoints( 10000 );
	var splineMaterial = new THREE.LineBasicMaterial( { color : 0xff0000, linewidth: 40 } );
	var splineObject = new THREE.Line( splineGeometry, splineMaterial );
  splineObject.translateY(40);
  scene.add(splineObject)
}

function createCurvePath(color, spline, steps, sqLength, percentage, first){

	if (first){
		spline = new THREE.SplineCurve3(spline.points.slice(spline.points.length * first, spline.points.length * percentage | 0));
	} else {
		spline = new THREE.SplineCurve3(spline.points.slice(0, spline.points.length * percentage | 0));
	}
	
	var extrudeSettings = {
    steps           : 10000,
    bevelEnabled    : false,
    extrudePath     : spline
	};

	
	var squareShape = createSquare(sqLength);
  var geometry = new THREE.ExtrudeGeometry( squareShape, extrudeSettings );
  var material = new THREE.MeshLambertMaterial( { color: color, wireframe: false } );
  meshSpline = new THREE.Mesh( geometry, material );
 	meshSpline.translateX(-190);
  scene.add( meshSpline );

}

function createSquare(sqLength){
  var squareShape = new THREE.Shape();
  squareShape.moveTo( 0,0 );
  //squareShape.lineTo( -9,sqLength);
  squareShape.lineTo( 0,sqLength);
  
  squareShape.lineTo( 1,0);
  squareShape.lineTo( 1,sqLength*9);
  squareShape.lineTo( 0,sqLength*9);

  //squareShape.lineTo( -9,sqLength*9);
  squareShape.lineTo( 0, sqLength *10);
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
    color:Colors.blue,
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
    coin.mesh.position.x = x ;
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
      particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, Colors.blue, 3);
      i--;
    }else if (coin.angle > Math.PI){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      i--;
    }
  }
}

var speed = 0.00006;

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

var timeStart;
var timeFinish;

function render() {

		if (t == 0.0001)
			timeStart = Date.now();

		stats.update();

		coinsHolder.rotateCoins();

		keyboard.update();

		checkControls();

    alignmentTransformation(player, t);

    player.translateX(xposition);
    player.translateZ(5);

    //$('#flashText').text();
    //var d = Date.now();
    //d = d.toString();
    //$('#flashWrite').text("00:" + (100 - parseInt(d.substring(8, 10))) + ":" + (9 - parseInt(d.substring(10, 11))));
    
		if (t  > 0.3 ){
    	var newMaterial = new THREE.MeshLambertMaterial( { color: Colors.pink, wireframe: false } );
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

    //if (t > 0.8) speed = 0.0001;
    t = (t >= 1) ? 0 : t += speed;

    renderer.render(scene, camera); 

    if (t > 0.9811){
    	timeEnd = Date.now();
    	console.log("timpul: " + (timeEnd-timeStart)/1000/60)

    }

}

function alignmentTransformation(player, t, object){
	pt = spline.getPoint( t );

  player.position.set( pt.x, pt.y, pt.z);

  
  // get the tangent to the curve
  tangent = spline.getTangent( t ).normalize();
  
  // calculate the axis to rotate around
  axis.crossVectors( up, tangent ).normalize();
  
  // calcluate the angle between the up vector and the tangent
  radians = Math.acos( up.dot( tangent ) );
      
  // set the quaternion
  
  player.quaternion.setFromAxisAngle( axis, radians );
  
  radians = Math.asin(straight.dot(tangent));

  if (!object)
  	player.rotation.x = radians * Math.PI / 180;
}

function checkControls(){
	var moveDistance = 50 * clock.getDelta(); 
		if ( keyboard.pressed("A") ) {
			xposition = xposition-moveDistance ;
		}
    if ( keyboard.pressed("D") ) {
			xposition = xposition+moveDistance ;
		}
		if ( keyboard.down("S") ) {
			speed += 0.00015
			$('#pb').attr('aria-valuenow', 80 );
		}	
		if ( keyboard.up("S") ) {
			speed = 0.00008
			$('#pb').attr('aria-valuenow', 20 );
		}	
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


