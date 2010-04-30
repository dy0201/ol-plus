var map;
var agsQueryTask;

function init() {
	var lon = -122.391667;
	var lat = 37.760628;
	var zoom = 3;							
	
	OpenLayers.ProxyHost= "/openlayers/ApacheProxyServlet?targetUrl=";
    
	var options = 	{
		//panMethod: null, // set 'panMethod' to null to disable animated panning
		controls: [
       		new OpenLayers.Control.LayerSwitcher2(),
       		new OpenLayers.Control.Navigation(),
       		new OpenLayers.Control.PanZoom2(),
       		new OpenLayers.Control.MousePosition()
       	],
        projection: "EPSG:4326",		        		        	
   		maxResolution: 0.3515625,		        	        
        maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
        
   	};

    map = new OpenLayers.Map('map', options);
	
    var base_layer = new OpenLayers.Layer.AgsTiled( 
		"esri_street_map", 
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer/tile/", 
		{					
			tileSize: new OpenLayers.Size(512, 512),
			tileFormat:'jpg',
			tileOrigin: new OpenLayers.LonLat(-180, 90),
			tileFullExtent: new OpenLayers.Bounds(-180, -90, 180, 90), 	
			isBaseLayer: true,
			buffer: 0,
			singleTile: false					 					
		}
	); 
    map.addLayer(base_layer);  
			
	agsQueryTask = new OpenLayers.Control.AgsQueryTask(
		// layer '2' is state layer, change here to query other layers
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/2",
		null,
		[
			callback,
			function(olFeatures) {
				OpenLayers.Console.log("...you can pass in multiple callback functions...");
			}
		],
		{
			mode: "draw", // do query by hand drawing a geometry on map 
			drawCtrlHandler: OpenLayers.Handler.Point, 
			drawCtrlHandlerOptions: {
				handlerOptions: {
					keyMask: OpenLayers.Handler.MOD_CTRL // enable geomerty drawing by holding 'Ctrl' key
				}
			}			
		}
	);
	map.addControl(agsQueryTask);
	agsQueryTask.activate();
	
	var query = {										
		'outFields': ["STATE_NAME"],
		'returnGeometry': true,					
		'spatialRelationship': "WITHIN"									
	};
	agsQueryTask.setTaskParameters(query);
										
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
	addTestFeatures();								
}

function callback(olFeatures) {
	//OpenLayers.Console.debug("...callback being called here...");
	for(var i=0; i<olFeatures.length; i++) {
		if(olFeatures[i] && olFeatures[i] instanceof OpenLayers.Feature.Vector) {
			OpenLayers.Console.debug("...feature found: " + olFeatures[i].id);									
			//OpenLayers.Console.debug("...feature found: " + olFeatures[i].attributes['CITY_NAME'] + " location: " + olFeatures[i].geometry);
		}
	}
} 

function toggleMode() {
	if(agsQueryTask.mode == "draw") {
		agsQueryTask.switchMode("select");
		document.getElementById('toggle_mode_btn').value = "Select Mode (click to toggle)";
	} else if(agsQueryTask.mode == "select") {
		agsQueryTask.switchMode("draw");
		document.getElementById('toggle_mode_btn').value = "Draw Mode (click to toggle)";
	}
}

function cleanup() {
	agsQueryTask.cleanupResults();
};

function addTestFeatures() {
	var point = new OpenLayers.Geometry.Point(-122.391667, 37.760628);
	var point_feature = new OpenLayers.Feature.Vector(point);
		
	var _interlLayer_ = map.getLayersByName("__internal__")[0];	
	_interlLayer_.addFeatures([point_feature]);
}