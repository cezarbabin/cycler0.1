var scene,
camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
renderer, container, clock;

var stats = new Stats();
//var stats2 = new MemoryStats();



var clock = new THREE.Clock();
var keyboard = new KeyboardState();
var OC = [];
var GOC;

var particlesPool = [];
var particlesInUse = [];

/// CONSTANTS
var TRAILWIDTH = 50;
var UWWIDTH = 500;
var SECTIONHEIGHT = 4000;
var ROWS = 21;
var ROWSIZE = SECTIONHEIGHT/ROWS;
var NRSECTIONS = 2;

// LANES
var LANESPACING = 5;
var LANEWIDTH= 10;
var lanes = [-LANEWIDTH/2-LANESPACING-LANEWIDTH/2, 0,  +LANEWIDTH/2+LANESPACING+LANEWIDTH/2] ;

// SPEED
var SPEEDINITIAL;
var speed = SPEEDINITIAL = 6;

window.addEventListener('load', init, false);

function createScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcccccc, 100, 950);
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 120;
    nearPlane = 1;
    farPlane = 20000;
    
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 50;
    camera.position.y = -85;
    camera.rotation.x = 60 * Math.PI / 180;
    
    renderer = new THREE.WebGLRenderer({
                                       alpha: true,
                                       antialias: false
                                       });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(WIDTH, HEIGHT);
    
    
    
    renderer.shadowMap.enabled = true;
    
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
    
    // framerate stat
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );
    
    // memory stats
    //stats2.domElement.style.position = 'fixed';
    //stats2.domElement.style.right   = '0px';
    //stats2.domElement.style.top       = '0px';
    
    //container.appendChild( stats2.domElement );
    
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
    var light = new THREE.SpotLight( 0xFFDDDD,1.2 );
    light.position = camera.position;
    light.target.position.set( 0, 0, 0 );
    scene.add( light );
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

Particle = function(){
    var geom = new THREE.PlaneGeometry(2,2,2,2);
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

var sectionIndex;
function init() {
    $('#flashText').hide();
    createScene();
    createLights();
    
    for (var i = 0; i < NRSECTIONS; i++) {
        OC.push(new ObjectContainer());
    }
    
    //OC = new ObjectContainer();
    for (var i = 0; i < NRSECTIONS; i++) {
        initializeSection(i);
    }
    sectionIndex = NRSECTIONS;
    
    GOC = new ObjectContainer();
    
    createParticles();
    
    GOC.initialize('chasingBall');
    GOC.initialize('player');
    
    createChasingBall();
    createPlayer();
    
    
}

function createParticles(){
    for (var i=0; i<1; i++){
        var particle = new Particle();
        particlesPool.push(particle);
    }
    particlesHolder = new ParticlesHolder();
    scene.add(particlesHolder.mesh);
}

function initializeSection(i) {
    OC[i%NRSECTIONS].initialize('underWorld');
    OC[i%NRSECTIONS].initialize('trail');
    OC[i%NRSECTIONS].initialize('lane');
    OC[i%NRSECTIONS].initialize('obstacleContainer');
    OC[i%NRSECTIONS].initialize('chargingObstacleContainer');
    // Player loading starts the gmame
    createSection(i);
    createObstacleContainer(i);
    createChargingObstacleContainer(i);
}

function createPlayer() {
    /*
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
     object.scale.x = object.scale.z = object.scale.y = 0.5;
     set(object, 'player');
     });
     */
    
    var geom = new THREE.BoxGeometry(10,10,10,10,10);
    
    var mat = new THREE.MeshPhongMaterial({
                                          color:Colors.brown,
                                          transparent:true,
                                          opacity:1,
                                          shading:THREE.FlatShading,
                                          });
    
    this.mesh = new THREE.Mesh(geom, mat);
    
    set(this.mesh, 'player');
    
    //var geom = new THREE.BoxGeometry(20,20,20,40,10);
    
}

function createChasingBall() {
    var radius = 10;
    var geometry = new THREE.SphereGeometry(5, 6, 6 );
    //geometry.translate(0, -35, radius);
    var material = new THREE.MeshBasicMaterial( {
                                               color: 0x000000,
                                               wireframe: true,
                                               wireframeLinewidth: 2
                                               } );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.z = 21;
    sphere.position.y -= 45;
    sphere.rotation.z = 90*Math.PI / 180;
    GOC['chasingBall'] = sphere;
    scene.add( sphere );
}

function createObstacleContainer(index) {
    for (var r = 0; r < ROWS; r++){
        // random number of obstacles
        //console.log(r);
        var rnd = 2; //Math.random() * 2 | 0;
        //console.log(r, rnd);
        for (var o = 0; o < rnd; o++){
            // make the obstacles either falling or stable
            var rndForm = Math.random();
            //if (rndForm < 0.5){
            var rndLane = Math.random() * 3 | 0;
            createFallingObstacle(r, rndLane, index);
            //OC['obstacleContainer'].push()
            //}
        }
    }
}

function createChargingObstacleContainer(index) {
    for (var r = 6; r < ROWS; r++){
        var rndLane = Math.random() * 3 | 0;
        createChargingObstacle(r, rndLane, index)
    }
}

// (lane, distance, distanceActivation)
function createFallingObstacle(row, laneNr, index){
    var size = LANEWIDTH + LANESPACING;
    var geometry = new THREE.BoxGeometry( size, size, size);
    //geometry.translate(0, -35, radius);
    var material = new THREE.MeshBasicMaterial( {
                                               color: Colors.pink,
                                               wireframe: true,
                                               wireframeLinewidth: 2
                                               } );
    var fallingObject = new THREE.Mesh( geometry, material );
    fallingObject.position.y = row*ROWSIZE + index*SECTIONHEIGHT;
    fallingObject.position.z = 100;
    fallingObject.position.x = lanes[laneNr];
    OC[index%NRSECTIONS]['obstacleContainer'][row].push(fallingObject);
    scene.add(fallingObject);
}

function createChargingObstacle(row, laneNr, index){
    var size = LANEWIDTH + LANESPACING;
    var geometry = new THREE.BoxGeometry( size, size, size);
    //geometry.translate(0, -35, radius);
    var material = new THREE.MeshBasicMaterial( {
                                               color: Colors.pink,
                                               wireframe: true,
                                               wireframeLinewidth: 2
                                               } );
    var chargingObstacle = new THREE.Mesh( geometry, material );
    chargingObstacle.position.y = row*ROWSIZE + index*SECTIONHEIGHT;
    chargingObstacle.position.x = lanes[laneNr];
    chargingObstacle.position.z = 2;
    //console.log(index, row);
    OC[index%NRSECTIONS]['chargingObstacleContainer'].push(chargingObstacle);
    scene.add(chargingObstacle);
}

function set(object, name, index){
    if (name == "player"){
        //object.add(camera);
        GOC[name] = object;
        var bbox = new THREE.Box3().setFromObject(object);
        var displacement = bbox.max.y - bbox.min.y;
        object.position.z += 3;
        object.position.y += displacement;
        loop();
    } else {
        OC[index%NRSECTIONS][name] = object;
    }
    scene.add(object);
}

function createSection(index) {
    var delimiterSize = 20;
    
    var pg = new THREE.PlaneGeometry(SECTIONHEIGHT, SECTIONHEIGHT, 30, 30);
    createDelimiter(pg, delimiterSize, index);
    pg.translate(0, SECTIONHEIGHT/2 + index*SECTIONHEIGHT, 0);
    var pm = new THREE.MeshPhongMaterial({
                                         color:'#009900',
                                         transparent:true,
                                         opacity:1,
                                         shading:THREE.FlatShading,
                                         });
    //var underWorld = new THREE.Mesh(pg, pm);
    //underWorld.position.z -= 35;
    //scene.add(underWorld);
    ///////////////////
    var underWorld = MAKETERRAIN.WithParams((SECTIONHEIGHT-TRAILWIDTH)/3, SECTIONHEIGHT);
    underWorld.rotation.x = 90*Math.PI/180;
    underWorld.position.x = -(SECTIONHEIGHT-TRAILWIDTH)/3/2;
    underWorld.position.z -= 35;
    underWorld.position.y += SECTIONHEIGHT/2 + index*SECTIONHEIGHT;
    OC[index%NRSECTIONS]['underWorld'].push(underWorld);
    scene.add(underWorld);
    var underWorld = MAKETERRAIN.WithParams((SECTIONHEIGHT-TRAILWIDTH)/3, SECTIONHEIGHT);
    underWorld.rotation.x = 90*Math.PI/180;
    underWorld.position.x = (SECTIONHEIGHT-TRAILWIDTH)/3/2;
    underWorld.position.z -= 35;
    underWorld.position.y += SECTIONHEIGHT/2 + index*SECTIONHEIGHT;
    OC[index%NRSECTIONS]['underWorld'].push(underWorld);
    scene.add(underWorld);
    
    
    var pg = new THREE.PlaneGeometry(TRAILWIDTH, SECTIONHEIGHT, 1, 1);
    pg.translate(0, SECTIONHEIGHT/2, 0);
    var pm = new THREE.MeshPhongMaterial({
                                         color:'#4cf1a2',
                                         transparent:true,
                                         opacity:1,
                                         shading:THREE.FlatShading,
                                         });
    var trail = new THREE.Mesh(pg, pm);
    trail.position.z = 1;
    trail.position.y = index * SECTIONHEIGHT;
    OC[index%NRSECTIONS]['trail'].push(trail);
    scene.add(trail);
    
    var cols = [Colors.red, Colors.white, Colors.brown]
    
    var dist = ((TRAILWIDTH - delimiterSize * 2) - LANESPACING*4)/ 3; //120-40 - 20
    /*
     for (var l = 0; l < 3; l++){
     var pg = new THREE.PlaneGeometry(LANEWIDTH, SECTIONHEIGHT, 30, 30);
     if (l == 0)
     pg.translate(lanes[0], index*SECTIONHEIGHT + SECTIONHEIGHT/2, 2);
     if (l == 1)
     pg.translate(lanes[1], index*SECTIONHEIGHT + SECTIONHEIGHT/2, 2);
     if (l == 2)
     pg.translate(lanes[2], index*SECTIONHEIGHT + SECTIONHEIGHT/2, 2);
     var pm = new THREE.MeshPhongMaterial({
     color:cols[l%2],
     transparent:true,
     opacity:1,
     shading:THREE.FlatShading,
     });
     var lane = new THREE.Mesh(pg, pm);
     OC[index%NRSECTIONS]['lane'].push(lane);
     scene.add(lane);
     }
     */
    
}

function createDelimiter(pg, boxSize, index){
    for (var i = 0; i < 2; i++){
        var cg = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        if (i%2 == 0)
            cg.translate(-TRAILWIDTH/2, 0 + index*SECTIONHEIGHT, 0)
            else
                cg.translate(TRAILWIDTH/2, 0 + index*SECTIONHEIGHT, 0)
                pg.merge(cg);
    }
}

var _tick = 0;

var sectionChange = 0;

var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;

function loop(){
    
    var thisFrameTime = (thisLoop=new Date) - lastLoop;
    frameTime+= (thisFrameTime - frameTime) / filterStrength;
    lastLoop = thisLoop;
    
    stats.update();
    //stats2.update();
    //var delta = clock.getDelta();
    GOC['player'].position.y += speed * frameTime/30;
    GOC['chasingBall'].position.y += speed * frameTime/30;
    camera.position.y += speed * frameTime/30;
    
    
    var rowNr = ((GOC['player'].position.y / ROWSIZE | 0) + 1)%ROWS;
    var sectionNr = (camera.position.y / SECTIONHEIGHT | 0) % NRSECTIONS;
    if (sectionNr != sectionChange){
        if (sectionIndex%100 == 0){
            console.log(sectionIndex);
        }
        
        /*
         var thread = new Worker('dispose_worker.js');
         
         // message received from web worker
         thread.onmessage = function(e) {
         output.textContent = e.data;
         console.log(e.data);
         }
         
         
         // start web worker
         thread.postMessage(OC[sectionChange%NRSECTIONS]);
         
         */
        
        var arr = ['trail','lane', 'obstacleContainer', 'chargingObstacleContainer', 'underWorld'];
        for (var i = 0; i < arr.length; i++){
            disposeOf(OC[sectionChange%NRSECTIONS][arr[i]], arr[i]);
            /*
             var thread = new Worker('dispose_worker.js');
             
             
             // message received from web worker
             thread.onmessage = function(e) {
             output.textContent = e.data;
             console.log(e.data);
             }
             
             
             // start web worker
             thread.postMessage(JSON.stringify(OC[sectionChange%NRSECTIONS][arr[i]][0]));
             
             */
            //setInterval(disposeOf(OC[sectionChange%NRSECTIONS][arr[i]], arr[i]), 60);
        }
        
        initializeSection(sectionIndex);
        
        sectionIndex++;
        //console.log(sectionIndex);
    }
    sectionChange = sectionNr;
    
    //console.log(rowNr);
    
    
    if (rowNr < ROWS){
        var minRow = rowNr - 1;
        if (minRow < 0)
            minRow = 0;
        var maxRow = rowNr + 1;
        if (maxRow > ROWS){
            maxRow = 0;
            for (var r = minRow; r < maxRow; r++)
                checkRows(sectionNr+1, r);
        } else {
            for (var r = minRow; r < maxRow; r++)
                checkRows(sectionNr, r);
        }
        
        
        
        
    }
    
    
    updateKeyboard();
    
    _tick += 1
    var axis = new THREE.Vector3( 5.5, 0, 0 );
    var angle = -_tick * speed *  Math.PI / 64;
       // matrix is a THREE.Matrix4()
    var _mesh = GOC['chasingBall']
    var _matrix = new THREE.Matrix4()
    
    _matrix.makeRotationAxis( axis.normalize(), angle );
    _mesh.rotation.setFromRotationMatrix( _matrix );
    
    
    if (GOC['player'].position.y > SECTIONHEIGHT){
        //GOC['player'].position.y = 0;
        //GOC['chasingBall'].position.y = -55;
        //camera.position.y = -125;
    }
    
    // render the scene
    renderer.render(scene, camera);
    
    // call the loop function again
    requestAnimationFrame(loop);
    
}

function checkRows(sectionNr, rowNr){
    for (var o = 0; o < OC[sectionNr]['obstacleContainer'][rowNr].length; o++){
        var object = OC[sectionNr]['obstacleContainer'][rowNr][o];
        var condition = object.position.y - GOC['chasingBall'].position.y;
        var condition2 = object.position.x == GOC['chasingBall'].position.x;
        //console.log(condition, rowNr);
        //checkParticles(object, condition, condition2);
        if(condition < 250 && object.position.z > 5 ){
            object.position.z -= speed ;
        }
        
    }
    for (var o = 0; o < OC[sectionNr]['chargingObstacleContainer'].length; o++){
        var object = OC[sectionNr]['chargingObstacleContainer'][o];
        var condition = object.position.y - GOC['chasingBall'].position.y;
        var condition2 = object.position.x == GOC['chasingBall'].position.x;
        //console.log(condition, rowNr);
        //checkParticles(object, condition, condition2);
        if(condition < 650){
            OC[sectionNr]['chargingObstacleContainer'][o].position.y -= speed/2;
        }
    }
}

function checkParticles(object, condition, condition2){
    if (condition<25 && condition2){
        scene.remove(object);
        particlesHolder.spawnParticles(object.position.clone(), 1, Colors.pink, 4);
    }
    
}

function disposeOf(arr, name){
    //console.log(name)
    //var mainArr = OC[sectionNr%NRSECTIONS];
    
    //for (var c = 0; c < arr.length; c++){
    //for (var i = 0; i < arr.length; i++){
    if (name == "chargingObstacleContainer"){
        for (var j = 0; j < arr.length; j++) {
            disposeOfObject(arr[j]);
        }
    } else if (name =='obstacleContainer'){
        for (var j = 0; j < arr.length; j++) {
            for (var d = 0; d < 2; d++){
                disposeOfObject(arr[j][d]);
            }
            
        }
        
    } else {
        if (arr[0] != undefined)
            disposeOfObject(arr[0])
            }
    //}
    //}
}

function disposeOfObject(obj) {
    scene.remove(obj);
    obj.geometry.dispose();
    obj.material.dispose();
    
    renderer.dispose(obj);
    renderer.dispose(obj.geometry);
    renderer.dispose(obj.material);
    
    obj = undefined;
    //console.log('yes')
}

function updateKeyboard(){
    keyboard.update();
    
    var mesh = GOC.player;
    
    var moveDistance = 50 * clock.getDelta();
    
    if ( keyboard.pressed("A") ) {
        //console.log("cecece");
        var possible = mesh.position.x > lanes[0];
        if (possible){
            mesh.translateX( -LANEWIDTH - LANESPACING );
        }
    }
    if ( keyboard.pressed("D")  ) {
        var possible = mesh.position.x < lanes[2];
        if (possible){
            mesh.translateX(  + LANEWIDTH + LANESPACING );
        }
        
    }
  
    if ( keyboard.pressed("Q") )
        mesh.translateX( -moveDistance );
    if ( keyboard.pressed("E") )
        mesh.translateX(  moveDistance );
    if ( keyboard.down("S") ){
        speed += 8;
        $('#pb').attr('aria-valuenow', 80 );
        //player.position.z -= 10;
    }
    //$('#pb').attr('aria-valuenow', speed*10);
    if ( keyboard.up("S") ) {
        speed = SPEEDINITIAL;
        $('#pb').attr('aria-valuenow', 20 );
    }
    
}

