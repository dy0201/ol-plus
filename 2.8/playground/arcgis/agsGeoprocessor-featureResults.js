var map;
var agsGeoprocessor2;
        
function init() {    
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
    
    var lon = -122.838493;
	var lat = 45.432976;
    var zoom = 12;
    
	agsGeoprocessor2 = new OpenLayers.Control.AgsGeoprocessor(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Network/ESRI_DriveTime_US/GPServer/CreateDriveTimePolygons",
		null,		
		null,
		{
			mode: "draw",
			drawCtrlHandler: OpenLayers.Handler.Point,
			drawCtrlHandlerOptions: {
				handlerOptions: {
					keyMask: OpenLayers.Handler.MOD_CTRL
				}
			},
			taskParameters: {'Drive_Times':"1 2 4"},
		}
	);
	
	agsGeoprocessor2.geoprocessingParamsEnocoder = function(agsFeatureSet, tasksParameters){	
		OpenLayers.Console.log("...customized...encode geoprocessing parameters...");
		var params = {
			"Input_Location": agsFeatureSet,
			"Drive_Times": tasksParameters['Drive_Times']
		};
		return params;
	};
		
	agsGeoprocessor2.geoprocessingResultsParser = function(agsResults) {     	   
    	OpenLayers.Console.log("...customized...parse geoprocessing results...");
		var agsGraphics = agsResults[0].value.features;
		var olResults = this.adapter.parseAgsGraphics(agsGraphics);    	
    	return olResults;
    },
	
	map.addControl(agsGeoprocessor2);
	agsGeoprocessor2.activate();
	
    map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}

