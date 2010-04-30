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
	
	var options = {		                
		projection: "EPSG:4326",		        		        	
   		maxResolution: 0.3515625,		        	        
        maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
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
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}

function tearDown() {
	map.destroy();
	vectorLayer = null;
	map = null;
}

function test_Control_AgsRouteTask_initialize(t){
	setUp();
	t.plan(17);
	
	var agsRouteTask = new OpenLayers.Control.AgsRouteTask(		
		"http://tasks.arcgisonline.com/ArcGIS/rest/services/NetworkAnalysis/ESRI_Route_NA/NAServer/Route",
		null,
		[
			function(olFeatures) {
				t.ok(true, "...callback function 1 of multiple callbacks...");
			},
			function(olFeatures) {
				t.ok(true, "...callback function 2 of multiple callbacks...");
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
	
	t.eq(typeof agsRouteTask._resultsParser['parser'], "function", "...initialize _resultsParser['parser'] correctly...");
	t.eq(agsRouteTask.multiple, true, "...initialize 'multiple' to true correctly...");
	t.eq(agsRouteTask.asynchronous, false, "...initialize 'asynchronous' to false correctly...");
	t.eq(agsRouteTask.stopOrBarrier, "stop", "...initialize 'stopOrBarrier' to 'stop' correctly...");
	
	t.ok(agsRouteTask.stopsAdded instanceof Array, "...initialize 'stopsAdded' correctly...");
	t.ok(agsRouteTask.barriersAdded instanceof Array, "...initialize 'barriersAdded' correctly...");
	
	t.ok(agsRouteTask._resultsParser['context'] instanceof OpenLayers.Format.AgsJsAdapter, "...initialize _resultsParser['context'] correctly...");	
	t.ok(agsRouteTask.selectControl instanceof OpenLayers.Control.SelectFeature, "...initialize select control correctly...");
	t.ok(agsRouteTask.drawControl instanceof OpenLayers.Control.DrawFeature, "...initialize draw control correctly...");
	t.eq(agsRouteTask.mode, "select", "...initial mode is 'select'...");
	
	t.ok(agsRouteTask.layer instanceof OpenLayers.Layer.Vector, "...initialize an internal vector layer if not passed in as parameter...");
		
	t.eq(agsRouteTask.taskParameters['returnDirections'], true, "...default task parameter 'returnDirections' value is correct...");
	t.eq(agsRouteTask.taskParameters['returnRoutes'], true, "...default task parameter 'returnRoutes' value is correct...");
	t.eq(agsRouteTask.taskParameters['returnStops'], true, "...default task parameter 'returnStops' value is correct...");
	t.eq(agsRouteTask.taskParameters['returnBarriers'], true, "...default task parameter 'returnBarriers' value is correct...");
	
	var agsRouteTask2 = new OpenLayers.Control.AgsRouteTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		vectorLayer,
		[],
		{}
	);
	map.addControl(agsRouteTask2);
	t.ok(agsRouteTask2.layer instanceof OpenLayers.Layer.Vector, "...initialize task with an external vector layer passed in as parameter...");
	t.eq(agsRouteTask2.layer.name, "vectorLayer", "...initialize task with an external vector layer passed in as parameter...");	
}


function test_Control_AgsRouteTask_execute_1(t) {
	
	t.plan(9);
	
	var lon = -122.391667;
	var lat = 37.760628;						
	var zoom = 7;
	
	var options = {		                
		projection: "EPSG:4326",		        		        	
   		maxResolution: 0.3515625,		        	        
        maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
		tileSize: new OpenLayers.Size(512,512)
	};									
	var map1 = new OpenLayers.Map('map', options);

	var vectorLayer1 = new OpenLayers.Layer.Vector(
		"vectorLayer", 
		{
			isBaseLayer: true
		}
	);
	map1.addLayer(vectorLayer1);
	map1.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
	
			
	var agsRouteTask3 = new OpenLayers.Control.AgsRouteTask(		
		"http://tasks.arcgisonline.com/ArcGIS/rest/services/NetworkAnalysis/ESRI_Route_NA/NAServer/Route",
		vectorLayer1,
		[
			function(olFeatures) {
				t.ok(true, "...callback function 1 of multiple callbacks...");
				t.ok(olFeatures instanceof Array, "...callback receives an array of OpenLayers.Feature.Vector as parameter...");
				t.eq(olFeatures.length, 7, "...correct number of route, stops and barriers are parsed...");			
				t.ok(olFeatures[0].geometry instanceof OpenLayers.Geometry.MultiLineString, "...route polyline geometry is parsed correctly...");		
				t.eq(olFeatures[0].attributes['Shape_Length'], 0.0754622571123005, "...total length of route is correct...");
				t.eq(olFeatures[0].attributes['Total_Time'], 8.25836150397494, "...total time of route is correct...");
			},
			function(olFeatures) {
				t.ok(true, "...callback function 2 of multiple callbacks...");
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
	map1.addControl(agsRouteTask3);
	agsRouteTask3.activate();
	
	var stopPoint1 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(-122.391667, 37.760628), null, null);
	var stopPoint2 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(-122.401667, 37.770628), null, null);
	var stopPoint3 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(-122.391667, 37.780628), null, null);
	var stopPoint4 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(-122.401667, 37.760628), null, null);
	
	var stops = [];	
	stops.push(stopPoint1);	
	stops.push(stopPoint2);
	stops.push(stopPoint3);	
	stops.push(stopPoint4);

	agsRouteTask3.taskParameters['barriers'] = [];
	var barrierPoint1 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(-122.399676998616, 37.7734150010469), null, null);
	var barrierPoint2 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(-122.398211999502, 37.7599090000302), null, null);
	agsRouteTask3.taskParameters['barriers'].push(barrierPoint1);
	agsRouteTask3.taskParameters['barriers'].push(barrierPoint2);

	agsRouteTask3.execute(
		stops,
		null,
		[
			function(olFeatures) {
				t.ok(true, "...callback function 3 of multiple callbacks...");
			},
			function(olFeatures) {
				t.ok(true, "...callback function 4 of multiple callbacks...");
			}
		]
	);	
	t.wait_result(10);		
}







