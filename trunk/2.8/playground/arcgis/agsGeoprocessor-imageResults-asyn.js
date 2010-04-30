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
	
    var base_layer1 = new OpenLayers.Layer.AgsTiled( 
		"esri_street_map",  
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/tile/",
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
	
    map.addLayer(base_layer1);  
    /*
	var base_layer2 = new OpenLayers.Layer.AgsTiled( 
		"esri_street_map", 
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer/tile/", 
		//"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/tile/",
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
	map.addLayer(base_layer2); 
	*/
	// brigham WCS service
	/*
	var lon = -112.5;
	var lat = 41.5;							
	var zoom = 8;
   
	agsGeoprocessor2 = new OpenLayers.Control.AgsGeoprocessor(		
		"http://sazabi/ArcGIS/rest/services/wcspro2/GPServer/wcs2slope",
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
				'Service_Url':"http://sazabi/arcgis/services/brigham/GeoDataServer/WCSServer?",
				'Coverage_Name':"1",
				'Service_Version':"1.0.0",
				'Z_factor': 0.00002831
			},
		}
	);
		
	agsGeoprocessor2.geoprocessingResultsParser = function(agsResults, options) {     	       	
		// when result of gp service is image
		var processResultImg = dojo.hitch(
			this,
			function(mapImage) {
				var resultImage = new OpenLayers.Layer.Image(   
					"wcspro:gpresults", 
					mapImage.value.href, 
					this.map.getExtent(),
	        		this.map.getSize(),
					{														
						isBaseLayer: false,
						numZoomLevels: 3													
					}
				); 	
				var evt = {};
        		evt.results = [resultImage];
        		this.events.triggerEvent("asynjobcomplete", evt);
			}
		);

		var imageParameters = new esri.layers.ImageParameters();
		imageParameters.bbox = this.adapter.encodeAgsGeometry.extent.apply(this.adapter, [this.map.getExtent(), "EPSG:4326"]);
		imageParameters.width = (this.map.getSize()).w;
		imageParameters.height = (this.map.getSize()).h;
		imageParameters.format = "png";
		imageParameters.transparent = true;
		
		options.agsGeoprocessor.getResultImage(
			agsResults.jobId, 
			"slope4wcs", 
			imageParameters, 
			processResultImg
		);
    },
    */
	
	// sthelens WCS service
	var lon = -122.19;
	var lat = 46.19;							
	var zoom = 10;
   
	agsGeoprocessor2 = new OpenLayers.Control.AgsGeoprocessor(		
		"http://sazabi/ArcGIS/rest/services/ogctools_sthelens/GPServer/wcs2Hillshade",
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
				'Service_Url':"http://sazabi/arcgis/services/sthelens/GeoDataServer/WCSServer?",
				'Coverage_Name':"2",
				'Service_Version':"1.0.0",
				'output_raster_name':"rasteroutput4wcshillshade",
				'coverage_extent':""
			},
		}
	);
		
	agsGeoprocessor2.geoprocessingResultsParser = function(agsResults, options) {     	       	
		// when result of gp service is image
		var processResultImg = dojo.hitch(
			this,
			function(mapImage) {
				var resultImage = new OpenLayers.Layer.Image(   
					"ogctools:gpresults", 
					mapImage.value.href, 
					this.map.getExtent(),
	        		this.map.getSize(),
					{														
						displayInLayerSwitcher: false,
						isBaseLayer: false,
						numZoomLevels: 3																			
					}
				); 	
				var evt = {};
        		evt.results = [resultImage];
        		this.events.triggerEvent("asynjobcomplete", evt);
			}
		);

		var imageParameters = new esri.layers.ImageParameters();
		imageParameters.bbox = this.adapter.encodeAgsGeometry.extent.apply(this.adapter, [this.map.getExtent(), "EPSG:4326"]);
		imageParameters.width = (this.map.getSize()).w;
		imageParameters.height = (this.map.getSize()).h;
		imageParameters.format = "png";
		imageParameters.transparent = true;
		
		options.agsGeoprocessor.getResultImage(
			agsResults.jobId, 
			"hillshade4wcs", 
			imageParameters, 
			processResultImg
		);
    };
	
	map.addControl(agsGeoprocessor2);
	agsGeoprocessor2.activate();
	
    map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}

