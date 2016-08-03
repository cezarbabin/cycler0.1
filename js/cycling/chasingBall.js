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
  GOC.state['chasingBall'] = true;
  scene.add( sphere );
}

ChasingBall.prototype.rotate = function(){
  _tick += 1
  var axis = new THREE.Vector3( 5.5, 0, 0 );
  var angle = -_tick * speed * frameTime/30 * Math.PI / 64;
     // matrix is a THREE.Matrix4()
  var _mesh = GOC['chasingBall']
  var _matrix = new THREE.Matrix4()
  
  _matrix.makeRotationAxis( axis.normalize(), angle );
  _mesh.rotation.setFromRotationMatrix( _matrix );
}