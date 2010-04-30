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

function test_Control_AgsQueryTask_initialize(t){
	setUp();
	t.plan(15);
	
	var agsQueryTask = new OpenLayers.Control.AgsQueryTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		null,
		[],
		{}
	);
	map.addControl(agsQueryTask);
	agsQueryTask.activate();
	
	t.eq(typeof agsQueryTask._resultsParser['parser'], "function", "...initialize _resultsParser['parser'] correctly...");
	t.ok(agsQueryTask._resultsParser['context'] instanceof OpenLayers.Format.AgsJsAdapter, "...initialize _resultsParser['context'] correctly...");	
	t.ok(agsQueryTask.selectControl instanceof OpenLayers.Control.SelectFeature, "...initialize select control correctly...");
	t.ok(agsQueryTask.drawControl instanceof OpenLayers.Control.DrawFeature, "...initialize draw control correctly...");
	t.eq(agsQueryTask.mode, "select", "...initial mode is 'select'...");
	
	t.ok(agsQueryTask.layer instanceof OpenLayers.Layer.Vector, "...initialize an internal vector layer if not passed in as parameter...");
		
	t.eq(agsQueryTask.taskParameters['geometry'], null, "...default 'geometry' value is correct...");
	t.eq(agsQueryTask.taskParameters['outFields'], [0], "...default 'height' value is correct...");
	t.eq(agsQueryTask.taskParameters['returnGeometry'], true, "...default 'returnGeometry' value is correct...");
	t.eq(agsQueryTask.taskParameters['outSpatialReference'], null, "...default 'outSpatialReference' value is correct...");
	t.eq(agsQueryTask.taskParameters['spatialRelationship'], null, "...default 'spatialRelationship' value is correct...");
	t.eq(agsQueryTask.taskParameters['text'], "", "...default 'text' value is correct...");
	t.eq(agsQueryTask.taskParameters['where'], "", "...default 'where' value is correct...");
	
	var agsQueryTask2 = new OpenLayers.Control.AgsQueryTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		vectorLayer,
		[],
		{}
	);
	map.addControl(agsQueryTask2);
	t.ok(agsQueryTask2.layer instanceof OpenLayers.Layer.Vector, "...initialize task with an external vector layer passed in as parameter...");
	t.eq(agsQueryTask2.layer.name, "vectorLayer", "...initialize task with an external vector layer passed in as parameter...");	
}

function test_Control_AgsQueryTask_execute_1(t) {
	setUp();
	t.plan(5);
			
	var agsQueryTask = new OpenLayers.Control.AgsQueryTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/2",
		null,
		[
			function(olFeatures) {						
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...query results are passed in callback correctly...");			
				t.eq(this.layer.features.length, 1, "...this.addResults() adds query results to this.layer correctly...");				
				this.cleanupResults();
				t.eq(this.layer.features.length, 0, "...this.cleanupResults() cleans up query results from this.layer correctly...");
			},
			function(olFeatures) {
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...multiple callbacks are called correctly...");
			}
		],
		{}
	);	
	map.addControl(agsQueryTask);
	agsQueryTask.activate();
	
	// this point is where San Francisco is
	var olGeometry = new OpenLayers.Geometry.Point(-13624578.045883348, 4545665.546829987);	
	var olFeature = new OpenLayers.Feature.Vector(olGeometry);
	var query = {					
		'outFields': ["STATE_NAME"],
		'returnGeometry': true,
		'outSpatialReference': "EPSG:900913",
		'spatialRelationship': "WITHIN"								
	};
	agsQueryTask.setTaskParameters(query);
		
	agsQueryTask.execute(
		[olFeature],
		query,
		[
			function(olFeatures) {
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...callback passed in at runtime is called correctly...");
			}
		]
	);	
	t.wait_result(5);
}





