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
  OC[index%NRSECTIONS].state['trail'] = true;
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
                                       color:'#EBEBEB',
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