var map;
var agsRouteTask;

function init() {
	var lon = -122.391667;
	var lat = 37.760628;
	var zoom = 12;							
	
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
			
	agsRouteTask = new OpenLayers.Control.AgsRouteTask(		
		"http://tasks.arcgisonline.com/ArcGIS/rest/services/NetworkAnalysis/ESRI_Route_NA/NAServer/Route",
		null,
		[
			callback,
			function(olFeatures) {
				OpenLayers.Console.log("...you can pass in multiple callback functions...");
			}
		],
		{
			mode: "select", // do route solving by hand drawing multiple point geometries on map 
			drawCtrlHandler: OpenLayers.Handler.Point, 
			drawCtrlHandlerOptions: {
				handlerOptions: {
					keyMask: OpenLayers.Handler.MOD_CTRL // enable geomerty drawing by holding 'Ctrl' key
				}
			}			
		}
	);
	// you can modify the dblclick callback of handler for drawControl of AgsRouteTask to tigger route solving
	// it doesn't need to be dblclick to trigger route solving, you can use a button or something else
	agsRouteTask.drawControl.handler.dblclick = OpenLayers.Util.AgsUtil.bindFunction(
		function(evt){
			OpenLayers.Console.debug("...dblclick detected in 'draw' mode...solving route by added stops and barriers...");
			this.execute(
				this.stopsAdded, 
				{
					'barriers': this.barriersAdded
				}, 
				null
			);
			OpenLayers.Event.stop(evt);
			return false;	
		},
		agsRouteTask
	);	
	map.addControl(agsRouteTask);
	agsRouteTask.activate();
	
	var routeParameters = {										
		// add more if necessary
		// add two barriers
		'barriers': [
			new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(-122.399676998616, 37.7734150010469)),
			new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(-122.398211999502, 37.7599090000302)),
		]								
	};
	agsRouteTask.setTaskParameters(routeParameters);
										
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
	addTestFeatures();								
}

function callback(olFeatures) {
	OpenLayers.Console.debug("...callback being called here...");
	for(var i=0; i<olFeatures.length; i++) {
		if(olFeatures[i] && olFeatures[i] instanceof OpenLayers.Feature.Vector) {
			//OpenLayers.Console.debug("...stop: " + olFeatures[i].id);									
			//OpenLayers.Console.debug("...feature found: " + olFeatures[i].attributes['CITY_NAME'] + " location: " + olFeatures[i].geometry);
		}
	}
} 

function toggleMode() {
	if(agsRouteTask.mode == "draw") {
		agsRouteTask.switchMode("select");
		document.getElementById('toggle_mode_btn').value = "Select Mode (click to toggle)";
	} else if(agsRouteTask.mode == "select") {
		agsRouteTask.switchMode("draw");
		document.getElementById('toggle_mode_btn').value = "Draw Mode (click to toggle)";
	}
}

function toggleStopsAndBarriers() {
	if(agsRouteTask.stopOrBarrier == "stop") {
		agsRouteTask.stopOrBarrier = "barrier";
		document.getElementById('toggle_mode_btn2').value = "Add Barriers (click to toggle)";
	} else if(agsRouteTask.stopOrBarrier == "barrier") {
		agsRouteTask.stopOrBarrier = "stop";
		document.getElementById('toggle_mode_btn2').value = "Add Stops (click to toggle)";
	}
}

function cleanup() {
	agsRouteTask.cleanupResults();
};

function cleanupStops() {
	agsRouteTask.cleanupStops();
};

function cleanupBarriers() {
	agsRouteTask.cleanupBarriers();
};

function addTestFeatures() {
	var point1 = new OpenLayers.Geometry.Point(-122.391667, 37.760628);
	var point1_feature = new OpenLayers.Feature.Vector(point1);
	
	var point2 = new OpenLayers.Geometry.Point(-122.401667, 37.770628);
	var point2_feature = new OpenLayers.Feature.Vector(point2);
	
	var point3 = new OpenLayers.Geometry.Point(-122.391667, 37.780628);
	var point3_feature = new OpenLayers.Feature.Vector(point3);
	
	var point4 = new OpenLayers.Geometry.Point(-122.401667, 37.760628);
	var point4_feature = new OpenLayers.Feature.Vector(point4);
		
	var _interlLayer_ = map.getLayersByName("__internal__")[0];	
	_interlLayer_.addFeatures([point1_feature, point2_feature, point3_feature, point4_feature]);
}