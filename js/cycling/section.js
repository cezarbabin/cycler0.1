/*
  camera.position.z = 60;
  camera.position.y = -85;
  camera.rotation.x = 70 * Math.PI / 180;

*/


Section = function(index) {
	var delimiterSize = 20;
    
  var pg = new THREE.PlaneGeometry(SECTIONHEIGHT, SECTIONHEIGHT, 30, 30);
  this.createDelimiter(pg, delimiterSize, index);
  pg.translate(0, SECTIONHEIGHT/2 + index*SECTIONHEIGHT, 0);
  var pm = new THREE.MeshPhongMaterial({
                                       color:'#009900',
                                       transparent:true,
                                       opacity:1,
                                       shading:THREE.FlatShading,
                                       });

  for (var i = 0; i < 8; i++){
    for (var j = 0; j < 2; j++){
      var max = 180;   
      var min = 120;
      var depth = Math.random() * (max - min) + min;
      var underWorld = MAKETERRAIN.WithParams((SECTIONHEIGHT-TRAILWIDTH)/3, SECTIONHEIGHT, depth);
      underWorld.rotation.x = 90*Math.PI/180;
      if (j == 0)
        underWorld.position.x = - 120;
      else
        underWorld.position.x = 130;
      underWorld.position.z -= 25;
      underWorld.position.y += (i+1) * SECTIONHEIGHT/8 + index*SECTIONHEIGHT;
      OC[index%NRSECTIONS]['underWorld'].push(underWorld);
      OC[index%NRSECTIONS].state['underWorld'] = true;
      scene.add(underWorld);
    }
  }
  
  var pg = new THREE.PlaneGeometry(TRAILWIDTH, SECTIONHEIGHT, 1, 1);
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
  OC[index%NRSECTIONS].state['trail'] = true;
  scene.add(trail);
  
  var cols = [Colors.red, Colors.white, Colors.brown]
  
  var dist = ((TRAILWIDTH - delimiterSize * 2) - LANESPACING*4)/ 3; //120-40 - 20

};

Section.prototype.createDelimiter = function(pg, boxSize, index){
	for (var i = 0; i < 2; i++){
        var cg = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        if (i%2 == 0)
            cg.translate(-TRAILWIDTH/2, 0 + index*SECTIONHEIGHT, 0)
            else
                cg.translate(TRAILWIDTH/2, 0 + index*SECTIONHEIGHT, 0)
                pg.merge(cg);
    }
}