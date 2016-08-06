

Scene = function(){
	HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcccccc, 100, 950);
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 120;
  nearPlane = 1;
  farPlane = 20000;
  
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 60;
  camera.position.y = -85;
  camera.rotation.x = 70 * Math.PI / 180;
  
  renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false
  });
  renderer.setPixelRatio( window.devicePixelRatio);
  renderer.setSize(WIDTH, HEIGHT);
  
  renderer.shadowMap.enabled = true;
  
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);
  
  // framerate stat
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild( stats.domElement );
  
  // memory stats
  stats2.domElement.style.position = 'fixed';
  stats2.domElement.style.right   = '0px';
  stats2.domElement.style.top       = '0px';
  container.appendChild( stats2.domElement );
  
  // Listen to the screen: if the user resizes it
  // we have to update the camera and the renderer size

  window.addEventListener('resize', function(){
 		HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  }, false);
}

