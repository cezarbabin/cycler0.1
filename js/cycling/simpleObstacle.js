SimpleObstacle = function(row, laneNr, index){
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
  //fallingObject.position.z = 100;
  fallingObject.position.x = lanes[laneNr];
  OC[index%NRSECTIONS]['simpleObstacleContainer'].push(fallingObject);
  OC[index%NRSECTIONS].state['simpleObstacleContainer'] = true;
  scene.add(fallingObject);
}