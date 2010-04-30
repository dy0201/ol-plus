var map = null;
var vectorLayer = null;

function setUp() {
	if(map) {
		map.destroy();
		map = null;
		vectorLayer = null;
	}

    var lon = -122.838493;
	var lat = 45.432976;
    var zoom = 12;

	var options = {		                
		projection: "EPSG:4326",		        		        	
   		maxResolution: 0.3515625,		        	        
        maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
	};									
	map = new OpenLayers.Map('map', options);

	vectorLayer = new OpenLayers.Layer.Vector(
		"vectorLayer", 
		{
			isBaseLayer: true
		}
	);
	map.addLayer(vectorLayer);
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}

function tearDown() {
	map.destroy();
	vectorLayer = null;
	map = null;
}

function test_Control_AgsGeoprocessor_initialize(t) {
	setUp();
	t.plan(7);
	
	var agsGeoprocessor = new OpenLayers.Control.AgsGeoprocessor(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_Currents_World/GPServer/MessageInABottle",
		null,
		[],
		{}
	);
	map.addControl(agsGeoprocessor);
	agsGeoprocessor.activate();
	
	t.eq(typeof agsGeoprocessor.geoprocessingParamsEnocoder, "function", "...initialize default geoprocessingParamsEnocoder correctly...");
	t.eq(typeof agsGeoprocessor.geoprocessingResultsParser, "function", "...initialize default geoprocessingResultsParser correctly...");	
	t.ok(agsGeoprocessor.selectControl instanceof OpenLayers.Control.SelectFeature, "...initialize select control correctly...");
	t.ok(agsGeoprocessor.drawControl instanceof OpenLayers.Control.DrawFeature, "...initialize draw control correctly...");
	t.eq(agsGeoprocessor.mode, "select", "...initial mode is 'select'...");
	
	var agsGeoprocessor2 = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		vectorLayer,
		[],
		{}
	);
	map.addControl(agsGeoprocessor2);
	t.ok(agsGeoprocessor2.layer instanceof OpenLayers.Layer.Vector, "...initialize task with an external vector layer passed in as parameter...");
	t.eq(agsGeoprocessor2.layer.name, "vectorLayer", "...initialize task with an external vector layer passed in as parameter...");
}

function test_Control_AgsGeoprocessor_execute_asyn_1(t) {
	setUp();
	t.plan(4);
	
	var agsGeoprocessor = new OpenLayers.Control.AgsGeoprocessor(		
		"http://orthogonal.esri.com/ArcGIS/rest/services/Portland/PortlandMap/GPServer/BufferModel",
		null,		
		[
			function(evt) {								
				t.ok(evt.results[0].geometry instanceof OpenLayers.Geometry.Polygon, "...asynchronous geoprocessing task completed successfully and callback function is called correctly...");
			},
			function(evt) {
				t.ok(true, "...multiple callback functions are called correctly...");
			},
		],
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
	
	agsGeoprocessor.geoprocessingParamsEnocoder = function(agsFeatureSet, tasksParameters) {     	       	
		var geoprocessingParams = {};
		
		agsFeatureSet.geometryType = "esriGeometryPoint";
		//agsFeatureSet.spatialReference = new esri.SpatialReference({wkid:"4326"});
		
		geoprocessingParams['InputPoints'] = agsFeatureSet;
		geoprocessingParams['env:outSR'] = "4326";
		
		var linearUnits = new esri.tasks.LinearUnit();
		linearUnits.distance = tasksParameters.distance;
		linearUnits.units = tasksParameters.units;
		geoprocessingParams['Distance'] = linearUnits;
		t.ok(true, "...customized geoprocessingParamsEnocoder is called correctly...");
		return geoprocessingParams;
    };
	
	agsGeoprocessor.geoprocessingResultsParser = function(agsResults, options) {     	   
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
		t.ok(true, "...customized geoprocessingResultsParser is called correctly...");
		// esri JSAPI call to get asynchronous gp job results
		options.agsGeoprocessor.getResultData(
			agsResults.jobId, 
			"output", 
			processResultData
		);
    };
	
	map.addControl(agsGeoprocessor);
	agsGeoprocessor.activate();
	
	var olPoint = new OpenLayers.Geometry.Point(-122.838493, 45.432976);
	var olFeature = new OpenLayers.Feature.Vector(olPoint);
	agsGeoprocessor.execute(
		[olFeature],
		{},
		[]
	);			
	t.wait_result(30);
}

function test_Control_AgsGeoprocessor_execute_asyn_2(t) {
	setUp();
	t.plan(3);
	
	var agsGeoprocessor = new OpenLayers.Control.AgsGeoprocessor(		
		"http://sazabi/ArcGIS/rest/services/ogctools_sthelens/GPServer/wcs2Hillshade",
		null,		
		[
			function(evt) {								
				t.ok(evt.results[0] instanceof OpenLayers.Layer.Image, "...asynchronous geoprocessing task completed successfully and callback function is called correctly...");
			},
			function(evt) {
				t.ok(true, "...multiple callback functions are called correctly...");
			}
		],
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
				'Service_Url':"http://sazabi/arcgis/services/sthelens/GeoDataServer/WCSServer?",
				'Coverage_Name':"2",
				'Service_Version':"1.0.0",
				'output_raster_name':"rasteroutput4wcshillshade",
				'coverage_extent':""
			},
		}
	);
		
	agsGeoprocessor.geoprocessingResultsParser = function(agsResults, options) {     	       	
		var processResultImg = dojo.hitch(
			this,
			function(mapImage) {
				var resultImage = new OpenLayers.Layer.Image(   
					"__gpImgResults__", 
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
		t.ok(true, "...customized geoprocessingResultsParser is called correctly...");
		options.agsGeoprocessor.getResultImage(
			agsResults.jobId, 
			"hillshade4wcs", 
			imageParameters, 
			processResultImg
		);
    };
	
	map.addControl(agsGeoprocessor);
	agsGeoprocessor.activate();
	
	//var olPoint = new OpenLayers.Geometry.Point(-122.838493, 45.432976);
	//var olFeature = new OpenLayers.Feature.Vector(olPoint);
	agsGeoprocessor.execute(
		[],
		{},
		[]
	);			
	t.wait_result(45);
}

function test_Control_AgsGeoprocessor_execute_syn_1(t) {
	setUp();
	t.plan(5);
	
	var agsGeoprocessor = new OpenLayers.Control.AgsGeoprocessor(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Network/ESRI_DriveTime_US/GPServer/CreateDriveTimePolygons",
		null,		
		[
			function(olResults) {
				var isPass = false;
				if(olResults[0].geometry instanceof OpenLayers.Geometry.Polygon && olResults[1].geometry instanceof OpenLayers.Geometry.Polygon && olResults[2].geometry instanceof OpenLayers.Geometry.Polygon) {
					isPass = true;
				}
				t.ok(isPass, "...synchronous geoprocessing task completed successfully and callback function is called correctly...");				
			},
			function(olResults) {
				t.ok(true, "...multiple callback functions are called correctly...");
			},
		],
		{
			mode: "draw",
			drawCtrlHandler: OpenLayers.Handler.Point,
			drawCtrlHandlerOptions: {
				handlerOptions: {
					keyMask: OpenLayers.Handler.MOD_CTRL
				}
			},
			//taskParameters: {'Drive_Times':"1 2 4"},
		}
	);
	
	agsGeoprocessor.geoprocessingParamsEnocoder = function(agsFeatureSet, tasksParameters){	
		//OpenLayers.Console.log("...customized...encode geoprocessing parameters...");
		var params = {
			"Input_Location": agsFeatureSet,
			"Drive_Times": tasksParameters['Drive_Times']
		};
		t.ok(true, "...customized geoprocessingParamsEnocoder is called correctly...");
		return params;
	};
		
	agsGeoprocessor.geoprocessingResultsParser = function(agsResults) {     	   
    	//OpenLayers.Console.log("...customized...parse geoprocessing results...");
		var agsGraphics = agsResults[0].value.features;
		var olResults = this.adapter.parseAgsGraphics(agsGraphics); 
		t.ok(true, "...customized geoprocessingResultsParser is called correctly...");   	
    	return olResults;
    },
	
	map.addControl(agsGeoprocessor);
	agsGeoprocessor.activate();
	
	var olPoint = new OpenLayers.Geometry.Point(-122.838493, 45.432976);
	var olFeature = new OpenLayers.Feature.Vector(olPoint);
	agsGeoprocessor.execute(
		[olFeature],
		{
			'Drive_Times':"1 2 4"
		},
		[
			function(olResults) {
				t.ok(true, "...callback function passed in at runtime is called correctly...");
			},
		]
	);
			
	t.wait_result(30);
}



