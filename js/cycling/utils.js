Utils = function(){
	this.slidingInitialized = false;
  this.slidingObstaclesDirect = [];
}


Utils.prototype.disposeOf = function(arr, name){
	if (name == "chargingObstacleContainer"){
    for (var j = 0; j < arr.length; j++) {
      this.disposeOfObject(arr[j]);
    }
  } else if (name =='obstacleContainer'){
      for (var j = 0; j < arr.length; j++) {
        for (var d = 0; d < 2; d++){
          this.disposeOfObject(arr[j][d]);
        }
      }
  } else {
      if (arr[0] != undefined)
        this.disposeOfObject(arr[0])
  }
}

Utils.prototype.disposeOfObject = function(obj){
	scene.remove(obj);
  obj.geometry.dispose();
  obj.material.dispose();
  
  renderer.dispose(obj);
  renderer.dispose(obj.geometry);
  renderer.dispose(obj.material);
  
  obj = undefined;
}

Utils.prototype.updateKeyboard = function(){
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
  if ( keyboard.down("1") ){
      speed = SPEEDINITIAL + 1;
      $('#pb').attr('aria-valuenow', speed * 5 );
  };
  if ( keyboard.down("2") ){
      speed = SPEEDINITIAL + 2;
      $('#pb').attr('aria-valuenow', speed * 5 );
  };
  if ( keyboard.down("3") ){
      speed = SPEEDINITIAL + 3;
      $('#pb').attr('aria-valuenow', speed * 5 );
  };
  if ( keyboard.down("4") ){
      speed = SPEEDINITIAL + 4;
      $('#pb').attr('aria-valuenow', speed * 5 );
  };
  if ( keyboard.down("9") ){
      speed = SPEEDINITIAL + 9;
      $('#pb').attr('aria-valuenow', speed * 5 );
  };
  if ( keyboard.up("S") ) {
      //speed = SPEEDINITIAL;
      //$('#pb').attr('aria-valuenow', speed * 10 );
  }
}

Utils.prototype.createParticles = function(){
    for (var i=0; i<1; i++){
        var particle = new Particle();
        particlesPool.push(particle);
    }
    particlesHolder = new ParticlesHolder();
    scene.add(particlesHolder.mesh);
}

Utils.prototype.checkRows = function(sectionNr, rowNr){
  var ballPresent = GOC.state['chasingBall'];
	var chasingBall = GOC['chasingBall'];
  var player = GOC['player'];
  for (var o = 0; o < OC[sectionNr]['obstacleContainer'][rowNr].length; o++){
    var object = OC[sectionNr]['obstacleContainer'][rowNr][o];
    //if (ballPresent) {
      var condition = object.position.y - player.position.y;
      var condition2 = object.position.x == player.position.x;
      //console.log(condition, rowNr);
      //this.checkParticles(object, condition, condition2);
      if(condition < 250 && object.position.z > 5 ){
          object.position.z -= speed ;
      } 
    //}       
  }
  for (var o = 0; o < OC[sectionNr]['chargingObstacleContainer'].length; o++){
    var object = OC[sectionNr]['chargingObstacleContainer'][o];
    //if (ballPresent){
      var condition = object.position.y - player.position.y;
      var condition2 = object.position.x == player.position.x;
      //console.log(condition, rowNr);
      //this.checkParticles(object, condition, condition2);
      if(condition < 650){
          OC[sectionNr]['chargingObstacleContainer'][o].position.y -= speed/2;
      }
    //} 
  }
}

Utils.prototype.checkParticles = function(object, condition, condition2){
    if (condition<25 && condition2){
        scene.remove(object);
        particlesHolder.spawnParticles(object.position.clone(), 1, Colors.pink, 4);
    }    
}

Utils.prototype.initSlidingDirection = function(l){
  //this.slidingObstaclesDirect = [];
  this.slidingInitialized = true;
  for (var i = 0; i< l; i++){
    var r = Math.random();
    if (r < 0.5){
      this.slidingObstaclesDirect.push(-2)
    } else {
      this.slidingObstaclesDirect.push(2)
    }
  }
    
}

Utils.prototype.slideObstacles = function(sectionNr, rowNr){
  var container = OC[sectionNr]['slidingObstacleContainer'];
  if (this.slidingInitialized == false){
    this.initSlidingDirection(container.length);
  }

  var obstacle = container[rowNr];
  
  if (obstacle.position.x >= (lanes[2]) || obstacle.position.x <= (lanes[0]))
    this.slidingObstaclesDirect[rowNr] *= -1;

  if (rowNr == 20){
    console.log('here');
  }
  

  obstacle.position.x += this.slidingObstaclesDirect[rowNr]/4//this.slidingObstaclesDirect[rowNr/2 | 0];
  
}




