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
        initializeSection(i, 0);
    }
    sectionIndex = NRSECTIONS;
    
    GOC = new ObjectContainer();
    GOC.initialize('chasingBall');
    GOC.initialize('player');
    
    //this.chasingBall = new ChasingBall();
    new Player(); 
    setupTert();   
}

function setupTert(){
    utils.createParticles();
    $('#flashText').hide();
}

function initializeSection(i, level) {
    OC[i%NRSECTIONS].initialize('underWorld');
    OC[i%NRSECTIONS].initialize('trail');
    OC[i%NRSECTIONS].initialize('lane');
    OC[i%NRSECTIONS].initialize('obstacleContainer');
    OC[i%NRSECTIONS].initialize('chargingObstacleContainer');
    OC[i%NRSECTIONS].initialize('simpleObstacleContainer');
    OC[i%NRSECTIONS].initialize('slidingObstacleContainer');
    // Player loading starts the gmame
    new Section(i);

    if (level == 0) fillFalling(i);
    else fillSliding(i);
    //if (level == 1) fillCharging(i);
    //if (level == 2) fillSliding(i);
    //fillFalling(i);
    //fillCharging(i);
    //fillSimple(i);
    
}

function fillFalling(index) {
    for (var row = 0; row < ROWS; row++){
        var rnd = 2; 
        for (var o = 0; o < rnd; o++){
            var rndForm = Math.random();
            var rndLane = Math.random() * 3 | 0;
            new FallingObstacle(row, rndLane, index);
        }
    }
}

function fillSimple(index) {
    for (var row = 0; row < ROWS; row++){
        var rnd = 2; 
        for (var o = 0; o < rnd; o++){
            var rndForm = Math.random();
            var rndLane = Math.random() * 3 | 0;
            new SimpleObstacle(row, rndLane, index);
        }
    }
}

function fillCharging(index) {
    for (var r = 6; r < ROWS; r++){
        var rndLane = Math.random() * 3 | 0;
        new ChargingObstacle(r, rndLane, index)
    }
}
function fillSliding(index) {
    var rndLane = 1;
    var max = lanes[2];
    var min = lanes[0];
    for (var r = 0; r < ROWS; r ++){
        var pad = Math.random() * (max - min) + min;
        new SlidingObstacle(r, rndLane, index, pad)
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
    stats2.update();
  
    GOC['player'].position.y += speed * frameTime/30;
    if (GOC.state['chasingBall'] == true){
        GOC['chasingBall'].position.y += speed * frameTime/30;
        this.chasingBall.rotate();
    }
        
    camera.position.y += speed * frameTime/30;
    
    
    var rowNr = ((GOC['player'].position.y / ROWSIZE | 0) + 1)%ROWS;
    var sectionNr = (camera.position.y / SECTIONHEIGHT | 0) % NRSECTIONS;
    var currentContainer = OC[sectionChange%NRSECTIONS]
    
    if (sectionNr != sectionChange){
        //if (sectionIndex%100 == 0){
        // Choose type of level (5 sections = 1:30)
           // console.log(sectionIndex);
        //}
        var arr = ['trail','lane', 'obstacleContainer', 'chargingObstacleContainer', 'underWorld'];
       
        for (var i = 0; i < arr.length; i++){
            if (currentContainer.state[arr[i]] == true)
                utils.disposeOf(currentContainer[arr[i]], arr[i]);
        }
        console.log(sectionIndex /3 | 0);
        initializeSection(sectionIndex, sectionIndex /3 | 0);
        sectionIndex++;
    }
    sectionChange = sectionNr;

    var anyObstacles = (
        currentContainer.state['obstacleContainer'] == true ||
        currentContainer.state['chargingObstacleContainer'] == true);

    if (anyObstacles){
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

    var anySlidingObstacles = currentContainer.state['slidingObstacleContainer'] == true;
    if (anySlidingObstacles){
        var minRow = rowNr - 1;
        if (minRow < 0)
            minRow = 0;
        var maxRow = rowNr + 3;
        if (maxRow > ROWS){
            for (var r = minRow; r < ROWS; r++){utils.slideObstacles(sectionNr, r);}
            maxRow = maxRow % ROWS;
            minRow = 0;
            for (var r = minRow; r < maxRow; r++){utils.slideObstacles((sectionNr+1)%NRSECTIONS, r);}

        } else {
            for (var r = minRow; r < maxRow; r++){utils.slideObstacles(sectionNr, r);}
                //
        }
        //utils.slideObstalces()
    }
    
    utils.updateKeyboard();
    
    

    // render the scene
    renderer.render(scene, camera);
    
    // call the loop function again
    requestAnimationFrame(loop);  
}



