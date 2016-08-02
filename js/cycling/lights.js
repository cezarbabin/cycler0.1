Lights = function(){
	hemisphereLight = new THREE.HemisphereLight(0xcccccc,0x000000, .9)
  shadowLight = new THREE.DirectionalLight(0x7ec0ee, .6);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  
  ambientLight = new THREE.AmbientLight(0xFFCC00, .2);
  ambientLight2 = new THREE.AmbientLight(0xDDC0B2, .4);
  //scene.add(ambientLight);
  //scene.add(ambientLight2);
  var light = new THREE.SpotLight( 0xFFDDDD,1.2 );
  light.position = camera.position;
  light.target.position.set( 0, 0, 0 );
  scene.add( light );
}