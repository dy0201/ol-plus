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

function test_Control_AgsGeometryService_initialize(t) {
	setUp();
	t.plan(20);
	
	var agsGeometryService = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		null,
		[],
		{}
	);
	map.addControl(agsGeometryService);
	agsGeometryService.activate();
	
	t.eq(typeof agsGeometryService._resultsParser['parser'], "function", "...initialize _resultsParser['parser'] correctly...");
	t.ok(agsGeometryService._resultsParser['context'] instanceof OpenLayers.Format.AgsJsAdapter, "...initialize _resultsParser['context'] correctly...");	
	t.ok(agsGeometryService.selectControl instanceof OpenLayers.Control.SelectFeature, "...initialize select control correctly...");
	t.ok(agsGeometryService.drawControl instanceof OpenLayers.Control.DrawFeature, "...initialize draw control correctly...");
	t.eq(agsGeometryService.mode, "select", "...initial mode is 'select'...");
	t.eq(agsGeometryService.geometryServiceType, "buffer", "...initial geometry service operation is 'buffer'...");
	t.eq(agsGeometryService.asynchronous, false, "...geometry service control is always synchronous...");
	t.eq(agsGeometryService.multiple, true, "...multiple feature selection is allowed...");
	t.ok(agsGeometryService.layer instanceof OpenLayers.Layer.Vector, "...initialize an internal vector layer if not passed in as parameter...");
		
	t.eq(agsGeometryService.taskParameters['bufferSpatialReference'], null, "...default 'bufferSpatialReference' value is correct...");
	t.eq(agsGeometryService.taskParameters['distances'], [1], "...default 'distances' value is correct...");
	t.eq(agsGeometryService.taskParameters['features'], null, "...default 'features' value is correct...");
	t.eq(agsGeometryService.taskParameters['outSpatialReference'], null, "...default 'outSpatialReference' value is correct...");
	t.eq(agsGeometryService.taskParameters['unionResults'], false, "...default 'unionResults' value is correct...");
	t.eq(agsGeometryService.taskParameters['unit'], "UNIT_KILOMETER", "...default 'unit' value is correct...");
	t.eq(agsGeometryService.taskParameters['spatialRelationship'], "INTERSECTION", "...default 'spatialRelationship' value is correct...");
	t.eq(agsGeometryService.taskParameters['inSpatialReference'], "EPSG:4326", "...default 'inSpatialReference' value is correct...");
	t.eq(agsGeometryService.taskParameters['comparisonString'], null, "...default 'comparisonString' value is correct...");
	
	var agsGeometryService2 = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		vectorLayer,
		[],
		{}
	);
	map.addControl(agsGeometryService2);
	t.ok(agsGeometryService2.layer instanceof OpenLayers.Layer.Vector, "...initialize task with an external vector layer passed in as parameter...");
	t.eq(agsGeometryService2.layer.name, "vectorLayer", "...initialize task with an external vector layer passed in as parameter...");
}

function test_Control_AgsGeometryService_execute_buffer(t) {
	setUp();
	t.plan(6);
	
	var agsGeometryService = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		null,
		[
			function(olFeatures) {						
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...buffer results are passed in callback correctly...");	
				t.ok(olFeatures[0].geometry instanceof OpenLayers.Geometry.Polygon, "...buffer result is a polygon...");			
				t.eq(this.layer.features.length, 1, "...this.addResults() adds buffer results to this.layer correctly...");				
				this.cleanupResults();
				t.eq(this.layer.features.length, 0, "...this.cleanupResults() cleans up buffer results from this.layer correctly...");
			},
			function(olFeatures) {
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...multiple callbacks are called correctly...");
			}
		],
		{}
	);	
	map.addControl(agsGeometryService);
	agsGeometryService.activate();	
	agsGeometryService.setGeometryServiceType("buffer");
	
	var point = new OpenLayers.Geometry.Point(-13624578.045883348, 4545665.546829987);
	var feature = new OpenLayers.Feature.Vector(point);
	agsGeometryService.execute(
		[feature],
		{
			'inSpatialReference':		"EPSG:900913",
			'outSpatialReference':		"EPSG:900913"
		},
		[
			function(olFeatures) {
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...callback passed in at runtime is called correctly...");
			}
		]
	);
	t.wait_result(5);
}

function test_Control_AgsGeometryService_execute_project(t) {
	setUp();
	t.plan(6);	
	var agsGeometryService = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		null,
		[
			function(olFeatures) {						
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...project results are passed in callback correctly...");		
				var isPass = false;
				if(olFeatures[0].geometry.x == -122.391666982963 && olFeatures[0].geometry.y == 37.7606279955062) {
					isPass = true;
				}	
				t.ok(isPass, "...coordinates in project result are correct...");				
				t.eq(this.layer.features.length, 1, "...this.addResults() adds project results to this.layer correctly...");				
				this.cleanupResults();
				t.eq(this.layer.features.length, 0, "...this.cleanupResults() cleans up project results from this.layer correctly...");				
			},
			function(olFeatures) {
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...multiple callbacks are called correctly...");
			}
		],
		{}
	);	
	map.addControl(agsGeometryService);
	agsGeometryService.activate();	
	agsGeometryService.setGeometryServiceType("project");
	
	var point = new OpenLayers.Geometry.Point(-13624578.045883348, 4545665.546829987);
	var feature = new OpenLayers.Feature.Vector(point);
	agsGeometryService.execute(
		[feature],
		{
			'inSpatialReference':		"EPSG:900913",
			'outSpatialReference':		"EPSG:4326"
		},
		[
			function(olFeatures) {
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...callback passed in at runtime is called correctly...");
			}
		]
	);	
	t.wait_result(5);
}

function test_Control_AgsGeometryService_execute_lengths(t) {
	setUp();
	t.plan(3);	
	var agsGeometryService = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		null,
		[
			function(olResults) {						
				t.eq(olResults.lengths, [0.0250593528484165], "...lengths operation calculated the lengths correctly...");			
			},
			function(olResults) {
				t.eq(olResults.lengths, [0.0250593528484165], "...multiple callbacks are called correctly...");
			}
		],
		{
			displayResults: false
		}
	);	
	map.addControl(agsGeometryService);
	agsGeometryService.activate();	
	agsGeometryService.setGeometryServiceType("lengths");
	
	var polyline_points = [];
	polyline_points.push(new OpenLayers.Geometry.Point(-122.42788755053711, 37.76861025402832));
	polyline_points.push(new OpenLayers.Geometry.Point(-122.42428266162109, 37.771442666748044));
	polyline_points.push(new OpenLayers.Geometry.Point(-122.42136441821289, 37.76835276196289));
	polyline_points.push(new OpenLayers.Geometry.Point(-122.42119275683594, 37.77401758740234));
	polyline_points.push(new OpenLayers.Geometry.Point(-122.41664373034668, 37.77152849743652));
	polyline_points.push(new OpenLayers.Geometry.Point(-122.415442100708, 37.77676416943359));
	
	var polyline_linestring = new OpenLayers.Geometry.LineString(polyline_points);
	var polyline =  new OpenLayers.Geometry.MultiLineString([polyline_linestring]);
	var polyline_feature = new OpenLayers.Feature.Vector(polyline);
	
	// force map.projection to be null, so that input geometry can carry projection "EPSG:4326"
	map.projection = null;
	agsGeometryService.execute(
		[polyline_feature],
		{
			'inSpatialReference': 	"EPSG:4326",			
		},
		[
			function(olResults) {				
				t.eq(olResults.lengths, [0.0250593528484165], "...callback passed in at runtime is called correctly...");	
			}
		]
	);
	t.wait_result(5);
}

function test_Control_AgsGeometryService_execute_areasAndLengths(t) {
	setUp();
	t.plan(4);	
	var agsGeometryService = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		null,
		[
			function(olResults) {						
				t.eq(olResults.lengths, [0.0407861328248037], "...areasAndLengths operation calculated the lengths correctly...");
				t.eq(olResults.areas, [0.000103578713606112], "...areasAndLengths operation calculated the areas correctly...");			
			},
			function(olResults) {
				t.ok(true, "...multiple callbacks are called correctly...");
			}
		],
		{
			displayResults: false
		}
	);	
	map.addControl(agsGeometryService);
	agsGeometryService.activate();	
	agsGeometryService.setGeometryServiceType("areasAndLengths");
	
	var polygon_points = [];
	polygon_points.push(new OpenLayers.Geometry.Point(-122.41458379382324, 37.76577784130859));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.4052282487793, 37.77032686779785));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.40067922229004, 37.76234461376953));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.4099489366455, 37.7565939576416));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.41458379382324, 37.76577784130859));
	
	var polygon_linearring = new OpenLayers.Geometry.LinearRing(polygon_points);
	var polygon =  new OpenLayers.Geometry.Polygon([polygon_linearring]);
	var polygon_feature = new OpenLayers.Feature.Vector(polygon);
	
	// force map.projection to be null, so that input geometry can carry projection "EPSG:4326"
	map.projection = null;
	agsGeometryService.execute(
		[polygon_feature],
		{
			'inSpatialReference': "EPSG:4326",
		},
		[
			function(olResults) {				
				t.ok(true, "...callback passed in at runtime is called correctly...");	
			}
		]
	);
	t.wait_result(5);
}

function test_Control_AgsGeometryService_execute_labelPoints(t) {
	setUp();
	t.plan(4);	
	var agsGeometryService = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		null,
		[
			function(olFeatures) {						
				var isPass = false;
				if(olFeatures[0].geometry.x == -122.407631508057 && olFeatures[0].geometry.y == 37.7635949661042) {
					isPass = true;
				}
				t.ok(isPass, "...first label point is calculated correctly...");
				isPass = false;
				if(olFeatures[1].geometry.x == -122.399005523865 && olFeatures[1].geometry.y == 37.7471263202808) {
					isPass = true;
				}
				t.ok(isPass, "...second label point is calculated correctly...");						
			},
			function(olFeatures) {
				t.ok(true, "...multiple callbacks are called correctly...");
			}
		],
		{}
	);	
	map.addControl(agsGeometryService);
	agsGeometryService.activate();	
	agsGeometryService.setGeometryServiceType("labelPoints");
	
	var polygon_points = [];
	polygon_points.push(new OpenLayers.Geometry.Point(-122.41458379382324, 37.76577784130859));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.4052282487793, 37.77032686779785));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.40067922229004, 37.76234461376953));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.4099489366455, 37.7565939576416));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.41458379382324, 37.76577784130859));
	
	var polygon_linearring = new OpenLayers.Geometry.LinearRing(polygon_points);
	var polygon =  new OpenLayers.Geometry.Polygon([polygon_linearring]);
	var polygon_feature = new OpenLayers.Feature.Vector(polygon);
	
	var polygon2_points = [];
	polygon2_points.push(new OpenLayers.Geometry.Point(-122.40385495776367, 37.749470010498044));
	polygon2_points.push(new OpenLayers.Geometry.Point(-122.39415608996582, 37.75135828564453));
	polygon2_points.push(new OpenLayers.Geometry.Point(-122.39467107409668, 37.74577929089355));
	polygon2_points.push(new OpenLayers.Geometry.Point(-122.40042173022461, 37.743204370239255));
	polygon2_points.push(new OpenLayers.Geometry.Point(-122.40385495776367,37.749470010498044));
	
	var polygon2_linearring = new OpenLayers.Geometry.LinearRing(polygon2_points);
	var polygon2 =  new OpenLayers.Geometry.Polygon([polygon2_linearring]);
	var polygon2_feature = new OpenLayers.Feature.Vector(polygon2);
	
	// force map.projection to be null, so that input geometry can carry projection "EPSG:4326"
	map.projection = null;
	agsGeometryService.execute(
		[polygon_feature, polygon2_feature],
		{
			'inSpatialReference': "EPSG:4326"
		},
		[
			function(olFeatures) {				
				t.ok(true, "...callback passed in at runtime is called correctly...");	
			}
		]
	);
	t.wait_result(5);
}

function test_Control_AgsGeometryService_execute_relation(t){
	setUp();
	t.plan(5);	
	var agsGeometryService = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		null,
		[
			function(results) {										
				var isPass = false;
				if(results[0]['geometry1Index'] == 0 && results[0]['geometry2Index'] == 0) {
					isPass = true;
				}						
				t.ok(isPass, "...relation is calculated correctly...");				
				t.ok(results[0]['feature1'] instanceof OpenLayers.Feature.Vector, "...first feature of the relation returned correctly...");
				t.ok(results[0]['feature2'] instanceof OpenLayers.Feature.Vector, "...second feature of the relation returned correctly...");										
			},
			function(results) {
				t.ok(true, "...multiple callbacks are called correctly...");
			}
		],
		{
			multiple: true,
			displayResults: false
		}
	);	
	map.addControl(agsGeometryService);
	agsGeometryService.activate();	
	agsGeometryService.setGeometryServiceType("relation");
	
	var polyline3_points = [];	
	polyline3_points.push(new OpenLayers.Geometry.Point(-122.40651570910644, 37.75599314282226));
	polyline3_points.push(new OpenLayers.Geometry.Point(-122.40282498950195, 37.75779558728027));
	polyline3_points.push(new OpenLayers.Geometry.Point(-122.40677320117187, 37.760628));
	polyline3_points.push(new OpenLayers.Geometry.Point(-122.40359746569824,37.76303125927734));
	
	var polyline3_linestring = new OpenLayers.Geometry.LineString(polyline3_points);
	var polyline3 =  new OpenLayers.Geometry.MultiLineString([polyline3_linestring]);
	var polyline3_feature = new OpenLayers.Feature.Vector(polyline3);
	
	var polygon_points = [];
	polygon_points.push(new OpenLayers.Geometry.Point(-122.41458379382324, 37.76577784130859));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.4052282487793, 37.77032686779785));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.40067922229004, 37.76234461376953));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.4099489366455, 37.7565939576416));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.41458379382324, 37.76577784130859));
	
	var polygon_linearring = new OpenLayers.Geometry.LinearRing(polygon_points);
	var polygon =  new OpenLayers.Geometry.Polygon([polygon_linearring]);
	var polygon_feature = new OpenLayers.Feature.Vector(polygon);
	
	
	// force map.projection to be null, so that input geometry can carry projection "EPSG:4326"
	map.projection = null;
	agsGeometryService.execute(
		[polygon_feature, polyline3_feature],
		{
			'inSpatialReference':		"EPSG:4326",
			'outSpatialReference':		"EPSG:4326",
			'spatialRelationship': 		"INTERSECTION"
		},
		[
			function(results) {				
				t.ok(true, "...callback passed in at runtime is called correctly...");	
			}
		]
	);
	t.wait_result(5);
}

function test_Control_AgsGeometryService_execute_simplify(t){
	setUp();
	t.plan(6);	
	var agsGeometryService = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		null,
		[
			function(olFeatures) {																		
				t.ok(olFeatures[0] instanceof OpenLayers.Feature.Vector, "...simplify results are passed in callback correctly...");	
				t.ok(olFeatures[0].geometry instanceof OpenLayers.Geometry.Polygon, "...simplify result is correct...");			
				t.eq(this.layer.features.length, 1, "...this.addResults() adds simplify results to this.layer correctly...");				
				this.cleanupResults();
				t.eq(this.layer.features.length, 0, "...this.cleanupResults() cleans up simplify results from this.layer correctly...");											
			},
			function(olFeatures) {
				t.ok(true, "...multiple callbacks are called correctly...");
			}
		],
		{
			multiple: true,
			displayResults: true
		}
	);	
	map.addControl(agsGeometryService);
	agsGeometryService.activate();	
	agsGeometryService.setGeometryServiceType("simplify");
		
	var polygon_points = [];
	polygon_points.push(new OpenLayers.Geometry.Point(-122.41458379382324, 37.76577784130859));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.4052282487793, 37.77032686779785));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.40067922229004, 37.76234461376953));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.4099489366455, 37.7565939576416));
	polygon_points.push(new OpenLayers.Geometry.Point(-122.41458379382324, 37.76577784130859));
	
	var polygon_linearring = new OpenLayers.Geometry.LinearRing(polygon_points);
	var polygon =  new OpenLayers.Geometry.Polygon([polygon_linearring]);
	var polygon_feature = new OpenLayers.Feature.Vector(polygon);
	
	
	// force map.projection to be null, so that input geometry can carry projection "EPSG:4326"
	map.projection = null;
	agsGeometryService.execute(
		[polygon_feature],
		{
			'inSpatialReference':		"EPSG:4326",
			'outSpatialReference':		"EPSG:4326"
		},
		[
			function(olFeatures) {				
				t.ok(true, "...callback passed in at runtime is called correctly...");	
			}
		]
	);
	t.wait_result(5);
}




