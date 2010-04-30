var map;
var agsFindTask;
			
function init() {
	
	var lon = -122.391667;
	var lat = 37.760628;
	var zoom = 7;							
	
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
						
	agsFindTask = new OpenLayers.Control.AgsFindTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		null,
		[
			callback,
			function(olfeatures) {
				OpenLayers.Console.log("...you can pass in multiple callback functions...");
			}
		], 
		{
			displayResults: true, // default value
			errback: function(error){
				OpenLayers.Console.error("...error executing esri.tasks.FindTask...");
			}
		}
	);
	// IMPORTANT: although there is no map interaction but you still must add it to map
	map.addControl(agsFindTask);							
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);						
}

function callback(olFeatures) {				
	for(var i=0; i<olFeatures.length; i++) {
		if(olFeatures[i] && olFeatures[i] instanceof OpenLayers.Feature.Vector) {									
			//OpenLayers.Console.debug("...feature found: " + olFeatures[i].id);
			OpenLayers.Console.debug("...feature found: " + olFeatures[i].attributes['CITY_NAME'] + " location: " + olFeatures[i].geometry);
		}
	}
} 

function find() {
	var findParameters = {
		'outSpatialReference': map['projection'],
		'layerIds': [0],
		'searchFields': ["CITY_NAME"],
		'contains': true,
		'searchText': "San " // change the Find criterias here
	};
	agsFindTask.execute(
		findParameters, 
		[
			function(olFeatures) {
				OpenLayers.Console.log("...you can pass in multiple callback functions at runtime too...");
			}		
		]
	);
}

function cleanup() {
	agsFindTask.cleanupResults();
};
