var map;
var agsGeoprocessor_hillshade;
var agsGeoprocessor_contour;
        
function init() {    
	initOLMap();
}

function initOLMap() {
	OpenLayers.ProxyHost= "/openlayers-2.8/ApacheProxyServlet?targetUrl=";
    
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
		"ESRI_Imagery_World_2D", 
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
	
	// sthelens WCS service
	var lon = -122.19;
	var lat = 46.19;							
	var zoom = 10;
   
    // hillshade gp task
	agsGeoprocessor_hillshade = new OpenLayers.Control.AgsGeoprocessor(		
		"http://sazabi/arcgis/rest/services/ogctools_sthelens/GPServer/wcs2Hillshade",
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
		
	agsGeoprocessor_hillshade.geoprocessingResultsParser = function(agsResults, options) {     	       	
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
	
	map.addControl(agsGeoprocessor_hillshade);
	//agsGeoprocessor_hillshade.activate();
	
	// contour gp task
	agsGeoprocessor_contour = new OpenLayers.Control.AgsGeoprocessor(		
		"http://sazabi/arcgis/rest/services/ogctools_sthelens/GPServer/wcs2Contour",
		null,		
		null,
		{
			//mode: "draw",
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
				'output_raster_name':"rasteroutput4wcscontour",
				'coverage_extent':"",
				'env:outSR':"4326"				
			},
		}
	);
		
	agsGeoprocessor_contour.geoprocessingResultsParser = function(agsResults, options) {     	   
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
	map.addControl(agsGeoprocessor_contour);
	//agsGeoprocessor_contour.activate();
	
    map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);	
}

function doHillshade() {
	agsGeoprocessor_hillshade.activate();
	agsGeoprocessor_hillshade.execute([], {}, {});
}

function doContour() {
	agsGeoprocessor_contour.activate();
	agsGeoprocessor_contour.execute([], {}, {});
}
