var scene,
camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
renderer, container, clock;

var stats = new Stats();

var clock = new THREE.Clock();
var keyboard = new KeyboardState();
var OC = [];
var GOC;

/// CONSTANTS
var TRAILWIDTH = 120;
var UWWIDTH = 500;
var SECTIONHEIGHT = 2000;
var ROWS = 10;
var ROWSIZE = SECTIONHEIGHT/ROWS;
var NRSECTIONS = 2;

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
                                       antialias: false
                                       });
    //renderer.setPixelRatio( window.devicePixelRatio );
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
    
    
    GOC.initialize('chasingBall');
    GOC.initialize('player');
    
    createChasingBall();
    createPlayer();
    
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
    var manager = new THREE.LoadingManager();
    
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };
    
    var loader = new THREE.OBJLoader( manager );
    
    /*
     loader.load( 'https://www.dropbox.com/s/co64929w4w0vmc8/tricycle.obj?dl=0', function ( object) {
     object.traverse( function ( child ) {
     var bodyMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
     if ( child instanceof THREE.Mesh ) {
     child.material = bodyMat;
     }
     } );
     set(object, 'player');
     });
     */
    var geom = new THREE.BoxGeometry(20,20,20,40,10);
    
    var mat = new THREE.MeshPhongMaterial({
                                          color:Colors.brown,
                                          transparent:true,
                                          opacity:1,
                                          shading:THREE.FlatShading,
                                          });
    
    var object = new THREE.Mesh(geom, mat);
    set(object, 'player');
    
}

function createChasingBall() {
    var radius = 10;
    var geometry = new THREE.SphereGeometry( 20, 6, 6 );
    //geometry.translate(0, -35, radius);
    var material = new THREE.MeshBasicMaterial( {
                                               color: 0x000000,
                                               wireframe: true,
                                               wireframeLinewidth: 2
                                               } );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.z = 21;
    sphere.position.y -= 70;
    sphere.rotation.z = 90*Math.PI / 180;
    GOC['chasingBall'] = sphere;
    scene.add( sphere );
}

function createObstacleContainer(index) {
    for (var r = 1; r < ROWS; r++){
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
                                         color:Colors.brown,
                                         transparent:true,
                                         opacity:1,
                                         shading:THREE.FlatShading,
                                         });
    var underWorld = new THREE.Mesh(pg, pm);
    ///////////////////
    //var underWorld = MAKETERRAIN.WithParams(SECTIONHEIGHT, SECTIONHEIGHT);
    //underWorld.rotation.x = 90*Math.PI/180;
    //underWorld.position.z -= 20;
    //underWorld.position.y += SECTIONHEIGHT/2 + index*SECTIONHEIGHT;
    OC[index%NRSECTIONS]['underWorld'].push(underWorld);
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
    trail.position.y = index * SECTIONHEIGHT;
    OC[index%NRSECTIONS]['trail'].push(trail);
    scene.add(trail);
    
    var cols = [Colors.red, Colors.white, Colors.brown]
    
    var dist = ((TRAILWIDTH - delimiterSize * 2) - LANESPACING*4)/ 3; //120-40 - 20
    
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
var speed = 3;
var sectionChange = 0;
function loop(){
    
    stats.update();
    //var delta = clock.getDelta();
    GOC['player'].position.y += speed;
    GOC['chasingBall'].position.y += speed;
    camera.position.y += speed;
    
    
    var rowNr = ((GOC['player'].position.y / ROWSIZE | 0) + 1)%ROWS;
    var sectionNr = (camera.position.y / SECTIONHEIGHT | 0) % NRSECTIONS;
    if (sectionNr != sectionChange){
        disposeOf(sectionChange);
        //initializeSection(sectionIndex);
        sectionIndex++;
        //console.log(sectionIndex);
    }
    sectionChange = sectionNr;
    
    //console.log(rowNr);
    
    /*
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
    */
    
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
        var condition = OC[sectionNr]['obstacleContainer'][rowNr][o].position.y - GOC['player'].position.y;
        //console.log(condition, rowNr);
        if(condition < 250 && OC[sectionNr]['obstacleContainer'][rowNr][o].position.z > 5 ){
            OC[sectionNr]['obstacleContainer'][rowNr][o].position.z -= speed ;
        }
    }
    for (var o = 0; o < OC[sectionNr]['chargingObstacleContainer'].length; o++){
        var condition = OC[sectionNr]['chargingObstacleContainer'][o].position.y - GOC['player'].position.y;
        //console.log(condition, rowNr);
        if(condition < 650){
            OC[sectionNr]['chargingObstacleContainer'][o].position.y -= speed/2;
        }
    }
}

function disposeOf(sectionNr){
    var arr = ['trail','lane', 'obstacleContainer', 'chargingObstacleContainer', 'underWorld'];
    
    //disposeOfObject(OC[sectionNr%NRSECTIONS]['underWorld']);
    //disposeOfObject(OC[sectionNr%NRSECTIONS]['trail']);
    
    for (var c = 0; c < arr.length; c++){
        for (var i = 0; i < OC[sectionNr%NRSECTIONS][arr[c]].length; i++){
            //console.log(arr[c]);
            if (arr[c] == "obstacleContainer" || arr[c] == "chargingObstacleContainer"){
                for (var j = 0; j < OC[sectionNr%NRSECTIONS][arr[c]][i].length; j++) {
                    disposeOfObject(OC[sectionNr%NRSECTIONS][arr[c]][i][j]);
                }
            } else {
                disposeOfObject(OC[sectionNr%NRSECTIONS][arr[c]][i])
            }
            
        }
    }
    
}

function disposeOfObject(obj) {
    scene.remove(obj);
    obj.geometry.dispose();
    obj.material.dispose();
    
    renderer.dispose(obj);
    renderer.dispose(obj.geometry);
    renderer.dispose(obj.material);
    
    obj = undefined;
}


function updateKeyboard(){
    keyboard.update();
    
    var mesh = GOC.player;
    
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

