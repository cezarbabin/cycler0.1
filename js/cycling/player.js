Player = function(){
	/*
     var manager = new THREE.LoadingManager();
     
     manager.onProgress = function ( item, loaded, total ) {
     console.log( item, loaded, total );
     };
     
     var loader = new THREE.OBJLoader( manager );
     
     
     loader.load( 'tricycle.obj', function ( object) {
     object.traverse( function ( child ) {
     var bodyMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
     if ( child instanceof THREE.Mesh ) {
     child.material = bodyMat;
     }
     } );
     object.scale.x = object.scale.z = object.scale.y = 0.5;
     set(object, 'player');
     });
     */
    
    var geom = new THREE.BoxGeometry(10,10,10,10,10);
    
    var mat = new THREE.MeshPhongMaterial({
                                          color:Colors.brown,
                                          transparent:true,
                                          opacity:1,
                                          shading:THREE.FlatShading,
                                          });
    
    this.mesh = new THREE.Mesh(geom, mat);
    
    this.set(this.mesh, 'player');
    
    //var geom = new THREE.BoxGeometry(20,20,20,40,10); 
}

Player.prototype.set = function(object, name, index){
    if (name == "player"){
        //object.add(camera);
        GOC[name] = object;
        var bbox = new THREE.Box3().setFromObject(object);
        var displacement = bbox.max.y - bbox.min.y;
        object.position.z += 3;
        object.position.y += displacement;
        loop();
    } else {
        OC[index%NRSECTIONS][name] = object;
    }
    scene.add(object);
}