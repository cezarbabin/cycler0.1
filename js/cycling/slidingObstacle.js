SlidingObstacle = function(row, index, order){
	var size = LANEWIDTH + LANESPACING;
  var geometry = new THREE.BoxGeometry( 40, SECTIONHEIGHT/10 -5, 30);
  var material = new THREE.MeshPhongMaterial( {
    color: Colors.red,
    opacity:1,
    shading:THREE.FlatShading,
    } );
  var chargingObstacle = new THREE.Mesh( geometry, material );
  chargingObstacle.castShadow = true;

  
  chargingObstacle.position.y = row*(SECTIONHEIGHT/10) + SECTIONHEIGHT/10 - 50 + index*SECTIONHEIGHT;
  if (order == 0)
    chargingObstacle.position.x = lanes[2] + 60;
  else 
    chargingObstacle.position.x = lanes[0] - 60;
  
  chargingObstacle.position.z = 15;
  //console.log(index, row);
  OC[index%NRSECTIONS]['slidingObstacleContainer'].push(chargingObstacle);
  OC[index%NRSECTIONS].state['slidingObstacleContainer'] = true;
  scene.add(chargingObstacle);
}