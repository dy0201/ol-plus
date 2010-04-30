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
    
	// sample 1
	var lon = -122.19;
	var lat = 46.19;							
	var zoom = 10;
	
	agsGeoprocessor2 = new OpenLayers.Control.AgsGeoprocessor(		
		"http://sazabi/arcgis/rest/services/ogctools_sthelens/GPServer/wcs2Contour",
		null,		
		null,
		{
			mode: "draw",
			asynchronous: true,
			drawCtrlHandler: OpenLayers.Handler.Polygon,
			drawCtrlHandlerOptions: {
				handlerOptions: {
					keyMask: OpenLayers.Handler.MOD_CTRL
				}
			},
			taskParameters: {
				'service_url': "http://sazabi/arcgis/services/sthelens/GeoDataServer/WCSServer?",
				'Coverage_Name':"2",
				'Service_Version':"1.0.0",				
				'output_raster_name':"rasteroutput4wcscontour",
				'coverage_extent':"",
				'env:outSR':"4326"				
			},
		}
	);
		
	agsGeoprocessor2.geoprocessingResultsParser = function(agsResults, options) {     	   
		// result of this gp service is featureSet		
		var processResultData = dojo.hitch(
			this,
			function(result) {
        		var agsGraphics = result.value.features;
				var olResults = this.adapter.parseAgsGraphics(agsGraphics); 
				var evt = {};
				evt.results = olResults;
        		this.events.triggerEvent("asynjobcomplete", evt);
			}
		);
		
		options.agsGeoprocessor.getResultData(
			agsResults.jobId, 
			"contour4wcs", 
			processResultData
		);
    },
	
	// sample2
	/*
	var lon = -122.6335;
	var lat = 45.4447;							
	var zoom = 8;
    
	agsGeoprocessor2 = new OpenLayers.Control.AgsGeoprocessor(		
		"http://orthogonal.esri.com/ArcGIS/rest/services/Portland/PortlandMap/GPServer/BufferModel",
		null,		
		null,
		{
			mode: "draw",
			asynchronous: true,
			drawCtrlHandler: OpenLayers.Handler.Point,
			drawCtrlHandlerOptions: {
				handlerOptions: {
					keyMask: OpenLayers.Handler.MOD_CTRL
				}
			},
			taskParameters: {
				'distance':5,
				'units':"esriMiles"				
			},
		}
	);
	
	agsGeoprocessor2.geoprocessingParamsEnocoder = function(agsFeatureSet, tasksParameters) {     	       	
		var geoprocessingParams = {};
		
		agsFeatureSet.geometryType = "esriGeometryPoint";
		//agsFeatureSet.spatialReference = new esri.SpatialReference({wkid:"4326"});
		
		geoprocessingParams['InputPoints'] = agsFeatureSet;
		geoprocessingParams['env:outSR'] = "4326";
		
		var linearUnits = new esri.tasks.LinearUnit();
		linearUnits.distance = tasksParameters.distance;
		linearUnits.units = tasksParameters.units;
		geoprocessingParams['Distance'] = linearUnits;
		
		return geoprocessingParams;
    };
	
	agsGeoprocessor2.geoprocessingResultsParser = function(agsResults, options) {     	   
		// result of this gp service is featureSet		
		var processResultData = dojo.hitch(
			this,
			function(result) {
        		var agsGraphics = result.value.features;
				var olResults = this.adapter.parseAgsGraphics(agsGraphics); 
				var evt = {};
				evt.results = olResults;
        		this.events.triggerEvent("asynjobcomplete", evt);
			}
		);
		
		options.agsGeoprocessor.getResultData(
			agsResults.jobId, 
			"output", 
			processResultData
		);
    };
	*/
	map.addControl(agsGeoprocessor2);
	agsGeoprocessor2.activate();
	
    map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}

