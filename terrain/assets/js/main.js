var MAKETERRAIN = {
	WithParams : function(parameters){
		var temp = {
			alea: RAND_MT,
			generator: PN_GENERATOR,
			width: 500,
			height: 700,
			widthSegments: 30,
			heightSegments: 30,
			depth: 30,
			param: 3,
			filterparam: 1,
			filter: [ BLUR_FILTER ],
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

