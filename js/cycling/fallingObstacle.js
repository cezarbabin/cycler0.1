FallingObstacle = function(row, laneNr, index){
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
  fallingObject.position.z = 150;
  fallingObject.position.x = lanes[laneNr];
  OC[index%NRSECTIONS]['obstacleContainer'][row].push(fallingObject);
  OC[index%NRSECTIONS].state['obstacleContainer'] = true;
  scene.add(fallingObject);
}