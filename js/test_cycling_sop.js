window.addEventListener('load', init, false);

var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x68c3c0
};

var sectionIndex;
function init() {
    new Scene();
    new Lights();
    
    for (var i = 0; i < NRSECTIONS; i++) {
        OC.push(new ObjectContainer());
    }
    for (var i = 0; i < NRSECTIONS; i++) {
        initializeSection(i);
    }
    sectionIndex = NRSECTIONS;
    
    GOC = new ObjectContainer();
    GOC.initialize('chasingBall');
    GOC.initialize('player');
    
    new ChasingBall();
    new Player(); 
    setupTert();   
}

function setupTert(){
    utils.createParticles();
    $('#flashText').hide();
}

function initializeSection(i) {
    OC[i%NRSECTIONS].initialize('underWorld');
    OC[i%NRSECTIONS].initialize('trail');
    OC[i%NRSECTIONS].initialize('lane');
    OC[i%NRSECTIONS].initialize('obstacleContainer');
    OC[i%NRSECTIONS].initialize('chargingObstacleContainer');
    // Player loading starts the gmame
    new Section(i);
    fillObstacleContainer(i);
    fillChargingObstacleContainer(i);
}

function fillObstacleContainer(index) {
    for (var row = 0; row < ROWS; row++){
        var rnd = 2; 
        for (var o = 0; o < rnd; o++){
            var rndForm = Math.random();
            var rndLane = Math.random() * 3 | 0;
            new FallingObstacle(row, rndLane, index);
        }
    }
    //this.state['obstacleContainer'] = true;
}

function fillChargingObstacleContainer(index) {
    for (var r = 6; r < ROWS; r++){
        var rndLane = Math.random() * 3 | 0;
        new ChargingObstacle(r, rndLane, index)
    }
    //this.state['chargingObstacleContainer'] = true;
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
    stats2.update();
  
    GOC['player'].position.y += speed * frameTime/30;
    GOC['chasingBall'].position.y += speed * frameTime/30;
    camera.position.y += speed * frameTime/30;
    
    
    var rowNr = ((GOC['player'].position.y / ROWSIZE | 0) + 1)%ROWS;
    var sectionNr = (camera.position.y / SECTIONHEIGHT | 0) % NRSECTIONS;
    if (sectionNr != sectionChange){
        if (sectionIndex%100 == 0){
            console.log(sectionIndex);
        }
        var arr = ['trail','lane', 'obstacleContainer', 'chargingObstacleContainer', 'underWorld'];
        var currentContainer = OC[sectionChange%NRSECTIONS]
        for (var i = 0; i < arr.length; i++){
            if (currentContainer.state[arr[i]] == true)
                utils.disposeOf(currentContainer[arr[i]], arr[i]);
        }
        initializeSection(sectionIndex);
        sectionIndex++;
    }
    sectionChange = sectionNr;

    if (rowNr < ROWS){
        var minRow = rowNr - 1;
        if (minRow < 0)
            minRow = 0;
        var maxRow = rowNr + 1;
        if (maxRow > ROWS){
            maxRow = 0;
            for (var r = minRow; r < maxRow; r++)
                utils.checkRows(sectionNr+1, r);
        } else {
            for (var r = minRow; r < maxRow; r++)
                utils.checkRows(sectionNr, r);
        }
    }
    
    utils.updateKeyboard();
    
    _tick += 1
    var axis = new THREE.Vector3( 5.5, 0, 0 );
    var angle = -_tick * speed *  Math.PI / 64;
       // matrix is a THREE.Matrix4()
    var _mesh = GOC['chasingBall']
    var _matrix = new THREE.Matrix4()
    
    _matrix.makeRotationAxis( axis.normalize(), angle );
    _mesh.rotation.setFromRotationMatrix( _matrix );

    // render the scene
    renderer.render(scene, camera);
    
    // call the loop function again
    requestAnimationFrame(loop);  
}


