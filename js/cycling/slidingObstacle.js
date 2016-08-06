SlidingObstacle = function(row, laneNr, index, order){
	var size = LANEWIDTH + LANESPACING;
  var geometry = new THREE.BoxGeometry( size, SECTIONHEIGHT/ROWS, size);
  //geometry.translate(0, -35, radius);
  var material = new THREE.MeshBasicMaterial( {
                                             color: Colors.pink,
                                             //wireframe: true,
                                             //wireframeLinewidth: 2
                                             } );
  var chargingObstacle = new THREE.Mesh( geometry, material );
  chargingObstacle.position.y = row*ROWSIZE + index*SECTIONHEIGHT;
  if (order == 0)
    chargingObstacle.position.x = lanes[2] + 20;
  else 
    chargingObstacle.position.x = lanes[0] - 20;
  chargingObstacle.position.z = 2;
  //console.log(index, row);
  OC[index%NRSECTIONS]['slidingObstacleContainer'].push(chargingObstacle);
  OC[index%NRSECTIONS].state['slidingObstacleContainer'] = true;
  scene.add(chargingObstacle);
}