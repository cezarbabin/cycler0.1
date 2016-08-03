var MAKETERRAIN = {
	WithParams : function(width, height){
		var temp = {
			alea: RAND_MT,
			generator: PN_GENERATOR,
			width: width+100,
			height: height+100,
			widthSegments: 60,
			heightSegments: 60,
			depth: 190,
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
		//MOUNTAINS2_COLORS.ms_ColorArray = ['#0076A3', '#3BB9FF', '#336699','#3BB9FF' ];
		MOUNTAINS2_COLORS.ms_ColorArray = ['#a0e7af', '#0eae21', '#1e8bc3','#c4dcc0' ];
		var mesh = TERRAINGENDEMO.Load(temp);
		return mesh;
		//MainLoop();
	}
}

