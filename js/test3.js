var wd = window;

var ctnEl = document.getElementById('ctn');
var camera, scene, renderer;
var cubes = [], plane, marker, spline;


// ALLOCATE THESE OUTSIDE OF THE RENDER LOOP - CHANGED
var matrix = new THREE.Matrix4();
var up = new THREE.Vector3( 0, 1, 0 );
var axis = new THREE.Vector3( );
var pt, radians, axis, tangent;


var winDims = [ctnEl.offsetWidth, ctnEl.offsetHeight];
var winHalfW = winDims[0] / 2;

function init() {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 50;
    camera.rotation.x = 40 * Math.PI / 180;

    controls = new THREE.OrbitControls( camera );
    controls.addEventListener( 'change', render );
   
    points =  [new THREE.Vector3(177.6076794686664, -189.59719456131666, 128.8401263489414),
    new THREE.Vector3(-71.23931862284905, -153.9368085070406, 5.284478503819692),
    new THREE.Vector3(-300.12290112941974, -144.47085896766586, 84.18142304788832),
    new THREE.Vector3(-284.73829876413123, -158.77686893740247, -433.4249196789108),
    new THREE.Vector3(-16.913449190888514, -153.90042496472668, -463.34498312188373),
    new THREE.Vector3(551.6592551464272, -160.4979520898124, -620.8820906330495),
    new THREE.Vector3(506.0060755889224, -169.487941154214, -23.248918892483424),
    new THREE.Vector3(265.2380528628295, -165.47463489939983, 179.8685250961414)];
    
    for (var i = 0; i < points.length; i++){
        var axis = new THREE.Vector3( 1, 0, 0 );
        var angle = Math.PI / 2;
        points[i].applyAxisAngle( axis, angle );
    }
    spline = new THREE.SplineCurve3(points);

    var splineObject = new THREE.Line( geometry, material );

    var extrudeSettings = {
                        steps           : 1000,
                        bevelEnabled    : false,
                        extrudePath     : spline
                    };
    var sqLength = 20;
    var squareShape = new THREE.Shape();
    squareShape.moveTo( 0,0 );
    squareShape.lineTo( 0, sqLength );
    squareShape.lineTo( sqLength, sqLength );
    squareShape.lineTo( sqLength, 0 );
    squareShape.lineTo( 0, 0 );
    var geometry = new THREE.ExtrudeGeometry( squareShape, extrudeSettings );
    var material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );
    var meshSpline = new THREE.Mesh( geometry, material );


    
    var material = new THREE.LineBasicMaterial({
        color: 0xff00f0,
    });
    var geometry = new THREE.Geometry();
    for(var i = 0; i < spline.getPoints(200).length; i++){
        geometry.vertices.push(spline.getPoints(200)[i]);  
    }
    var line = new THREE.Line(geometry, material);

    marker = getCube();
    scene.add(marker);
   
    scene.add(line);
    //scene.add(meshSpline);
    marker.add(camera);

    renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(winDims[0], winDims[1]);
    ctnEl.appendChild(renderer.domElement);
}


function getCube(){
    // cube mats and cube
    var mats = [];
    for (var i = 0; i < 6; i ++) {
        mats.push(new THREE.MeshBasicMaterial({color:Math.random()*0xffffff}));
    }
    var cube = new THREE.Mesh(
        new THREE.CubeGeometry(10, 10, 10, 1, 1, 1),
        new THREE.MeshFaceMaterial( mats )
    );
    return cube
}

function animate() {
    requestAnimationFrame(animate);
    render();
}
    
var t = 0;
function render() {
    
    // set the marker position
    pt = spline.getPoint( t );
    marker.position.set( pt.x, pt.y, pt.z );
    
    // get the tangent to the curve
    tangent = spline.getTangent( t ).normalize();
    
    // calculate the axis to rotate around
    axis.crossVectors( up, tangent ).normalize();
    
    // calcluate the angle between the up vector and the tangent
    radians = Math.acos( up.dot( tangent ) );
        
    // set the quaternion
    marker.quaternion.setFromAxisAngle( axis, radians );
        
    t = (t >= 1) ? 0 : t += 0.001;

    renderer.render(scene, camera); 
}

init();
animate();

