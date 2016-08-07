Labirinth = function(index){
	var columnMaterial = new THREE.MeshPhongMaterial({
	 color:Colors.blue,
	 transparent:true,
	 opacity:1,
	 shading:THREE.FlatShading,
	 });

//// FIRST LEVEL
/*
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
  */

  /// SECOND LEVEL
  
  var pg = new THREE.BoxGeometry(10, SECTIONHEIGHT-10, 40);
  pg.translate(lanes[2] + 20, index*SECTIONHEIGHT, 20);
  var pm = new THREE.MeshPhongMaterial({
                                       color:Colors.red,
                                       opacity:1,
                                       shading:THREE.FlatShading,
                                       });

  /// SECOND LEVEL
  var g2 = new THREE.BoxGeometry(10, SECTIONHEIGHT - 10, 40);
	g2.translate(lanes[0] - 20, index * SECTIONHEIGHT, 20);
	g2 = new THREE.Mesh(g2, pm);
	g2.updateMatrix();
	pg.merge(g2.geometry, g2.matrix);

	for (var i = 0; i < 2; i++){
		var g2 = new THREE.BoxGeometry(10, SECTIONHEIGHT - 10, 10);
		if (i==0)
			g2.translate(lanes[0] - 30, index * SECTIONHEIGHT, 45);
		else 
			g2.translate(lanes[2] + 30, index * SECTIONHEIGHT, 45);
		g2 = new THREE.Mesh(g2, pm);
		g2.updateMatrix();
		pg.merge(g2.geometry, g2.matrix);
	}

	for (var i = 0; i < 2; i++){
		var g2 = new THREE.BoxGeometry(10, SECTIONHEIGHT - 10, 10);

		if (i==0)
			g2.translate(lanes[0] - 40, index * SECTIONHEIGHT, 55);
		else 
			g2.translate(lanes[2] + 40, index * SECTIONHEIGHT, 55);
		g2 = new THREE.Mesh(g2, pm);
		g2.updateMatrix();
		pg.merge(g2.geometry, g2.matrix);
	}

	for (var i = 0; i < 80; i++){
		var g2 = new THREE.ConeGeometry(20, 40, 10 );
		g2.rotateX(90*Math.PI/180)
		if (i%2 == 0)
			g2.translate(lanes[0] - 50, index * SECTIONHEIGHT + i*(SECTIONHEIGHT/40), 80);
		else 
			g2.translate(lanes[2] + 50, index * SECTIONHEIGHT + i*(SECTIONHEIGHT/40), 80);
		g2 = new THREE.Mesh(g2, pm);
		
		g2.updateMatrix();
		pg.merge(g2.geometry, g2.matrix, 1);
	}



	var trail = new THREE.Mesh(pg, pm);

  OC[index%NRSECTIONS]['trail'].push(trail);
  OC[index%NRSECTIONS].state['trail'] = true;

	scene.add(trail);


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