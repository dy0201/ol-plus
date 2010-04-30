var map = null;
var vectorLayer = null;

function setUp() {
	if(map) {
		map.destroy();
		map = null;
		vectorLayer = null;
	}	
	var lon = -122.391667;
	var lat = 37.760628;
	var zoom = 7;
								
	var center_mercator = OpenLayers.Layer.SphericalMercator.forwardMercator(lon, lat);
	center_mercator_x = center_mercator.lon;
	center_mercator_y = center_mercator.lat;
		
	var options = {
		projection: "EPSG:900913",
		units: "m",
		maxResolution: 156543.0339,
		maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
		tileSize: new OpenLayers.Size(512,512)
	};								
	map = new OpenLayers.Map('map', options);
	
	vectorLayer = new OpenLayers.Layer.Vector(
		"vectorLayer", 
		{			
			isBaseLayer: true
		}
	);
	map.addLayer(vectorLayer);
	map.setCenter(new OpenLayers.LonLat(center_mercator_x, center_mercator_y), zoom);
}

function tearDown() {
	map.destroy();
	vectorLayer = null;
	map = null;
}

function test_Control_AgsIdentifyTask_initialize(t) {
	setUp();
	t.plan(18);
	
	var agsIdentifyTask = new OpenLayers.Control.AgsIdentifyTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		null,
		[],
		{}
	);
	map.addControl(agsIdentifyTask);
	agsIdentifyTask.activate();
	
	t.eq(typeof agsIdentifyTask._resultsParser['parser'], "function", "...initialize _resultsParser['parser'] correctly...");
	t.ok(agsIdentifyTask._resultsParser['context'] instanceof OpenLayers.Format.AgsJsAdapter, "...initialize _resultsParser['context'] correctly...");	
	t.ok(agsIdentifyTask.selectControl instanceof OpenLayers.Control.SelectFeature, "...initialize select control correctly...");
	t.ok(agsIdentifyTask.drawControl instanceof OpenLayers.Control.DrawFeature, "...initialize draw control correctly...");
	t.eq(agsIdentifyTask.mode, "select", "...initial mode is 'select'...");
	
	t.ok(agsIdentifyTask.layer instanceof OpenLayers.Layer.Vector, "...initialize an internal vector layer if not passed in as parameter...");
		 
	t.eq(agsIdentifyTask.taskParameters['dpi'], 96, "...default 'dpi' value is correct...");
	t.eq(agsIdentifyTask.taskParameters['geometry'], null, "...default 'geometry' value is correct...");
	t.eq(agsIdentifyTask.taskParameters['height'], 0, "...default 'height' value is correct...");
	t.eq(agsIdentifyTask.taskParameters['layerIds'], [0], "...default 'layerIds' value is correct...");
	t.eq(agsIdentifyTask.taskParameters['layerOption'], "all", "...default 'layerOption' value is correct...");
	t.eq(agsIdentifyTask.taskParameters['mapExtent'], null, "...default 'mapExtent' value is correct...");
	t.eq(agsIdentifyTask.taskParameters['returnGeometry'], true, "...default 'returnGeometry' value is correct...");
	t.eq(agsIdentifyTask.taskParameters['spatialReference'], null, "...default 'spatialReference' value is correct...");
	t.eq(agsIdentifyTask.taskParameters['tolerance'], 1, "...default 'tolerance' value is correct...");
	t.eq(agsIdentifyTask.taskParameters['width'], 0, "...default 'width' value is correct...");
	
	var agsIdentifyTask2 = new OpenLayers.Control.AgsIdentifyTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		vectorLayer,
		[],
		{}
	);
	map.addControl(agsIdentifyTask2);
	t.ok(agsIdentifyTask2.layer instanceof OpenLayers.Layer.Vector, "...initialize task with an external vector layer passed in as parameter...");
	t.eq(agsIdentifyTask2.layer.name, "vectorLayer", "...initialize task with an external vector layer passed in as parameter...");	
}

function test_Control_AgsIdentifyTask_execute_1(t) {
	setUp();
	t.plan(5);
	
	var agsIdentifyTask = new OpenLayers.Control.AgsIdentifyTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		null,
		[
			function(olFeatures) {						
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...identify results are passed in callback correctly...");			
				t.eq(this.layer.features.length, 1, "...this.addResults() adds identify results to this.layer correctly...");				
				this.cleanupResults();
				t.eq(this.layer.features.length, 0, "...this.cleanupResults() cleans up identify results from this.layer correctly...");
			},
			function(olFeatures) {
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...multiple callbacks are called correctly...");
			}
		],
		{}
	);	
	map.addControl(agsIdentifyTask);
	agsIdentifyTask.activate();
	
	// hard code identifyParameter will only find one polygon feature which state "California"
	var sr = {};
	sr['wkid'] = "102113";
	var agsSr = new esri.SpatialReference(sr);
	var identifyParameters = {					
		'layerIds': [2],			
		'mapExtent': new OpenLayers.Bounds(-13781121.079783348, 4467394.029879987, -13468035.011983348, 4623937.063779987)							
	};	
	// this point is where San Francisco is
	var olGeometry = new OpenLayers.Geometry.Point(-13624578.045883348, 4545665.546829987);	
	var olFeature = new OpenLayers.Feature.Vector(olGeometry);
	agsIdentifyTask.execute(
		[olFeature],
		identifyParameters,		
		[			
			function(olFeatures) {
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...callback passed in at runtime is called correctly...");
			}
		]
	);	
	t.wait_result(5);
}

function test_Control_AgsIdentifyTask_execute_2(t) {	
	t.plan(5);	
	var options = 	{		                
		                projection: "EPSG:900913",
				        units: "m",
				        maxResolution: 156543.0339,
				        maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34)									
					};	
	
	var map1 = new OpenLayers.Map('map', options);
	var vectorLayer1 = new OpenLayers.Layer.Vector("vectorLayer");
	map1.addLayer(vectorLayer1);
	
	var agsIdentifyTask = new OpenLayers.Control.AgsIdentifyTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		vectorLayer1,
		[
			function(olFeatures) {						
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...identify results are passed in callback correctly...");			
				t.eq(this.layer.features.length, 1, "...this.addResults() adds identify results to this.layer correctly...");				
				this.cleanupResults();
				t.eq(this.layer.features.length, 0, "...this.cleanupResults() cleans up identify results from this.layer correctly...");
			},
			function(olFeatures) {
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...multiple callbacks are called correctly...");
			}
		],
		{}
	);	
	map1.addControl(agsIdentifyTask);
	agsIdentifyTask.activate();
	
	// hard code identifyParameter will only find one polygon feature which state "California"
	var sr = {};
	sr['wkid'] = "102113";
	var agsSr = new esri.SpatialReference(sr);
	var identifyParameters = {					
		'layerIds': [2],			
		'mapExtent': new OpenLayers.Bounds(-13781121.079783348, 4467394.029879987, -13468035.011983348, 4623937.063779987)							
	};	
	// this point is where San Francisco is
	var olGeometry = new OpenLayers.Geometry.Point(-13624578.045883348, 4545665.546829987);	
	var olFeature = new OpenLayers.Feature.Vector(olGeometry);
	agsIdentifyTask.execute(
		[olFeature],
		identifyParameters,		
		[			
			function(olFeatures) {
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...callback passed in at runtime is called correctly...");
			}
		]
	);	
	t.wait_result(5);
}






