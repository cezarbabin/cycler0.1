var MAKETERRAIN = {
	WithParams : function(width, height){
		var temp = {
			alea: RAND_MT,
			generator: PN_GENERATOR,
			width: width+50,
			height: height+50,
			widthSegments: 40,
			heightSegments: 40,
			depth: 150,
			param: 3,
			filterparam: 1,
			filter: [ CIRCLE_FILTER ],
			postgen: [ MOUNTAINS2_COLORS ],
			effect: [ DESTRUCTURE_EFFECT ]
		}

		
		//TERRAINGENDEMO.Initialize( 'canvas-3d', parameters );
		// GUI.Initialize( parameters );
		
		//WINDOW.ResizeCallback = function( inWidth, inHeight ) { TERRAINGENDEMO.Resize( inWidth, inHeight ); };
		//TERRAINGENDEMO.Resize( WINDOW.ms_Width, WINDOW.ms_Height );
		

		// Return the Mesh Here
		var mesh = TERRAINGENDEMO.Load(temp);
		return mesh;
		//MainLoop();
	}
}

