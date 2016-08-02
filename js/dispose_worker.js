// web worker
self.onmessage = function(e) {
 
	function disposeOf(arr, name){
    //var mainArr = OC[sectionNr%NRSECTIONS];
    //var name = name[0];
    
    //for (var c = 0; c < arr.length; c++){
        for (var i = 0; i < arr.length; i++){
            if (name== 2 || name == 3){
                for (var j = 0; j < arr[i].length; j++) {
                    disposeOfObject(arr[i][j]);
                }
            } else {
                disposeOfObject(arr[i])
            }
        }
    //}
	}

	function disposeOfObject(obj) {
    scene.remove(obj);
    obj.geometry.dispose();
    obj.material.dispose();
    
    renderer.dispose(obj);
    renderer.dispose(obj.geometry);
    renderer.dispose(obj.material);
    
    obj = undefined;
	}
 
	//disposeOf(e);

	self.postMessage(msg + (+new Date() - start) + "ms");
 
};