Labirinth = function(index){
	var columnMaterial = new THREE.MeshPhongMaterial({
	 color:Colors.blue,
	 transparent:true,
	 opacity:1,
	 shading:THREE.FlatShading,
	 });

//// FIRST LEVEL
	var pg = new THREE.BoxGeometry(10, SECTIONHEIGHT, 30);
  pg.translate(0, SECTIONHEIGHT/2, 15);
  var pm = new THREE.MeshPhongMaterial({
                                       color:Colors.pink,
                                       opacity:1,
                                       shading:THREE.FlatShading,
                                       });

	var trail = new THREE.Mesh(pg, pm);
	trail.position.x = 5 + TRAILWIDTH/2;
  trail.position.z = 0;
  trail.position.y = index * SECTIONHEIGHT;
  OC[index%NRSECTIONS]['trail'].push(trail);
  OC[index%NRSECTIONS].state['trail'] = true;
  scene.add(trail);

  var pg = new THREE.BoxGeometry(10, SECTIONHEIGHT, 30);
  pg.translate(0, SECTIONHEIGHT/2, 15);
  var pm = new THREE.MeshPhongMaterial({
                                       color:Colors.pink,
                                       opacity:1,
                                       shading:THREE.FlatShading,
                                       });

	var trail = new THREE.Mesh(pg, pm);
	trail.position.x = -(5 + TRAILWIDTH/2);
  trail.position.z = 0;
  trail.position.y = index * SECTIONHEIGHT;
  OC[index%NRSECTIONS]['trail'].push(trail);
  OC[index%NRSECTIONS].state['trail'] = true;
  scene.add(trail);

  /// SECOND LEVEL
  var pg = new THREE.BoxGeometry(10, SECTIONHEIGHT, 40);
  pg.translate(0, SECTIONHEIGHT/2, 45);
  var pm = new THREE.MeshPhongMaterial({
                                       color:Colors.pink,
                                       opacity:1,
                                       shading:THREE.FlatShading,
                                       });

	var trail = new THREE.Mesh(pg, pm);
	trail.position.x = 20 + TRAILWIDTH/2;
  //trail.position.z = 30;
  trail.position.y = index * SECTIONHEIGHT;
  OC[index%NRSECTIONS]['trail'].push(trail);
  OC[index%NRSECTIONS].state['trail'] = true;
  scene.add(trail);

  /// SECOND LEVEL
  var pg = new THREE.BoxGeometry(10, SECTIONHEIGHT, 40);
  pg.translate(0, SECTIONHEIGHT/2, 45);
  var pm = new THREE.MeshPhongMaterial({
                                       color:Colors.pink,
                                       opacity:1,
                                       shading:THREE.FlatShading,
                                       });

	var trail = new THREE.Mesh(pg, pm);
	trail.position.x = -(20 + TRAILWIDTH/2);
  //trail.position.z = 30;
  trail.position.y = index * SECTIONHEIGHT;
  OC[index%NRSECTIONS]['trail'].push(trail);
  OC[index%NRSECTIONS].state['trail'] = true;
  scene.add(trail);

  var pg = new THREE.PlaneGeometry(TRAILWIDTH, SECTIONHEIGHT, 1, 1);
  pg.translate(0, SECTIONHEIGHT/2, 0);
  var pm = new THREE.MeshPhongMaterial({
                                       color:0xFFFDD0,
                                
                                       opacity:1,
                                       shading:THREE.FlatShading,
                                       });

	var trail = new THREE.Mesh(pg, pm);
  trail.position.z =0;
  trail.position.y = index * SECTIONHEIGHT;
  OC[index%NRSECTIONS]['trail'].push(trail);
  OC[index%NRSECTIONS].state['trail'] = true;
  scene.add(trail);

}