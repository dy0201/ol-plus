var map;
var agsIdentifyTask;

function init() {
	var lon = -122.391667;
	var lat = 37.760628;
	var zoom = 5;							
	
	OpenLayers.ProxyHost= "/openlayers/ApacheProxyServlet?targetUrl=";
    
	var options = 	{
		//panMethod: null, // set 'panMethod' to null to disable animated panning
		controls: [
       		new OpenLayers.Control.LayerSwitcher(),
			//new OpenLayers.Control.LayerSwitcher2(),
       		new OpenLayers.Control.Navigation(),
       		new OpenLayers.Control.PanZoom(),
			//new OpenLayers.Control.PanZoom2(),
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
			
	agsIdentifyTask = new OpenLayers.Control.AgsIdentifyTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		null,
		[
			callback,
			function(olFeatures) {
				OpenLayers.Console.log("...you can pass in multiple callback functions...");
			}
		],
		{
			mode: "select", 
			drawCtrlHandler: OpenLayers.Handler.Polygon, // identify with hand-draw polygon
			drawCtrlHandlerOptions: {
				handlerOptions: {
					keyMask: OpenLayers.Handler.MOD_CTRL // enable geomerty drawing by holding 'Ctrl' key
				}
			}			
		}
	);
	map.addControl(agsIdentifyTask);
	agsIdentifyTask.activate();
	
	var identifyParameters = {					
		'layerIds': [1], // hard code 'rivers' layer, change to identify on another layer									
	};	
	agsIdentifyTask.setTaskParameters(identifyParameters);	
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
	if(agsIdentifyTask.mode == "draw") {
		agsIdentifyTask.switchMode("select");
		document.getElementById('toggle_mode_btn').value = "Select Mode (click to toggle)";
	} else if(agsIdentifyTask.mode == "select") {
		agsIdentifyTask.switchMode("draw");
		document.getElementById('toggle_mode_btn').value = "Draw Mode (click to toggle)";
	}
}

function cleanup() {
	agsIdentifyTask.cleanupResults();
};

function addTestFeatures() {
	var polygon_points = [];
	polygon_points.push(new OpenLayers.Geometry.Point(-121.81625806445312,38.24196650097656));
	polygon_points.push(new OpenLayers.Geometry.Point(-120.02548658007812,38.97255732128906));
	polygon_points.push(new OpenLayers.Geometry.Point(-119.93759595507812,37.92336298535156));
	polygon_points.push(new OpenLayers.Geometry.Point(-121.01425611132812,37.04994989941406));
	polygon_points.push(new OpenLayers.Geometry.Point(-121.81625806445312,38.24196650097656));
	
	var polygon_linearring = new OpenLayers.Geometry.LinearRing(polygon_points);
	var polygon =  new OpenLayers.Geometry.Polygon([polygon_linearring]);
	var polygon_feature = new OpenLayers.Feature.Vector(polygon);
		
	var _interlLayer_ = map.getLayersByName("__internal__")[0];	
	_interlLayer_.addFeatures([polygon_feature]);
}
