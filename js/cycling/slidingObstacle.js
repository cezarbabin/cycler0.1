SlidingObstacle = function(row, laneNr, index, pad){
	var size = LANEWIDTH + LANESPACING;
  var geometry = new THREE.BoxGeometry( size, size, size);
  //geometry.translate(0, -35, radius);
  var material = new THREE.MeshBasicMaterial( {
                                             color: Colors.pink,
                                             wireframe: true,
                                             wireframeLinewidth: 2
                                             } );
  var chargingObstacle = new THREE.Mesh( geometry, material );
  chargingObstacle.position.y = row*ROWSIZE + index*SECTIONHEIGHT;
  chargingObstacle.position.x = pad;
  chargingObstacle.position.z = 2;
  //console.log(index, row);
  OC[index%NRSECTIONS]['slidingObstacleContainer'].push(chargingObstacle);
  OC[index%NRSECTIONS].state['slidingObstacleContainer'] = true;
  scene.add(chargingObstacle);
}