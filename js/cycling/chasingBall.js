ChasingBall = function(){
	var radius = 10;
  var geometry = new THREE.SphereGeometry(5, 6, 6 );
  //geometry.translate(0, -35, radius);
  var material = new THREE.MeshBasicMaterial( {
                                             color: 0x000000,
                                             wireframe: true,
                                             wireframeLinewidth: 2
                                             } );
  var sphere = new THREE.Mesh( geometry, material );
  sphere.position.z = 21;
  sphere.position.y -= 45;
  sphere.rotation.z = 90*Math.PI / 180;
  GOC['chasingBall'] = sphere;
  scene.add( sphere );
}