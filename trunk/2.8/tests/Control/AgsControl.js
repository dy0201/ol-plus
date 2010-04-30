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

function createTestFeatures() {
	var point = new OpenLayers.Geometry.Point(-122.391667, 37.760628);
	var point_feature = new OpenLayers.Feature.Vector(point);
	
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
	
	var polyline2_points = [];	
	polyline2_points.push(new OpenLayers.Geometry.Point(-122.41329633349609, 37.77530504772949));
	polyline2_points.push(new OpenLayers.Geometry.Point(-122.41089307421875, 37.77230097363281));
	polyline2_points.push(new OpenLayers.Geometry.Point(-122.40737401599121, 37.77685000012207));
	polyline2_points.push(new OpenLayers.Geometry.Point(-122.40505658740234, 37.773159280517575));
	
	var polyline2_linestring = new OpenLayers.Geometry.LineString(polyline2_points);
	var polyline2 =  new OpenLayers.Geometry.MultiLineString([polyline2_linestring]);
	var polyline2_feature = new OpenLayers.Feature.Vector(polyline2);
	
	var polyline3_points = [];	
	polyline3_points.push(new OpenLayers.Geometry.Point(-122.40651570910644, 37.75599314282226));
	polyline3_points.push(new OpenLayers.Geometry.Point(-122.40282498950195, 37.75779558728027));
	polyline3_points.push(new OpenLayers.Geometry.Point(-122.40677320117187, 37.760628));
	polyline3_points.push(new OpenLayers.Geometry.Point(-122.40359746569824,37.76303125927734));
	
	var polyline3_linestring = new OpenLayers.Geometry.LineString(polyline3_points);
	var polyline3 =  new OpenLayers.Geometry.MultiLineString([polyline3_linestring]);
	var polyline3_feature = new OpenLayers.Feature.Vector(polyline3);
	
	return [point_feature, polygon_feature, polygon2_feature, polyline_feature, polyline2_feature, polyline3_feature];
}

function createTestImageLayers() {
	var imageLayer1 = new OpenLayers.Layer.Image(   
		"__gpImgResults1__", 
		"http://www.google.com", 
		map.getExtent(),
	    map.getSize(),
		{														
			displayInLayerSwitcher: false,
			isBaseLayer: false,
			numZoomLevels: 3																			
		}
	); 
	
	var imageLayer2 = new OpenLayers.Layer.Image(   
		"__gpImgResults2__", 
		"http://www.google.com", 
		map.getExtent(),
	    map.getSize(),
		{														
			displayInLayerSwitcher: false,
			isBaseLayer: false,
			numZoomLevels: 3																			
		}
	);	
	
	return [imageLayer1, imageLayer2];
}

function test_Control_AgsControl_addResults(t){
	setUp();
	t.plan(2);
	
	var agsControl1 = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[],
		{}
	);
	map.addControl(agsControl1);
	agsControl1.activate();
	
	var featureResults = createTestFeatures(); // hard code 6 vector features
	agsControl1.addResults(featureResults);
		
	t.eq(agsControl1._resultFeatures.length, 6, "...add correct number of result features...");
	for(var i=0; i<agsControl1._resultFeatures.length; i++) {
		if(!(agsControl1._resultFeatures[i] instanceof OpenLayers.Feature.Vector)) {
			t.ok(false, "...individual result feature is not added correctly...");
		}
	}
	agsControl1.cleanupResults();
	var imageResults = createTestImageLayers(); // hard code 2 image layers
	agsControl1.addResults(imageResults);
	t.eq(agsControl1._resultImages.length, 2, "...add correct number of result images...");
	for(var i=0; i<agsControl1._resultImages.length; i++) {
		if(!(agsControl1._resultImages[i] instanceof OpenLayers.Layer.Image)) {
			t.ok(false, "...individual image feature is not added correctly...");
		}
	}
}

function test_Control_AgsControl_showResults(t){
	setUp();
	t.plan(2);
	
	var agsControl = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[],
		{}
	);
	map.addControl(agsControl);
	agsControl.activate();
	
	var featureResults = createTestFeatures(); // hard code 6 vector features
	agsControl.addResults(featureResults);
	var imageResults = createTestImageLayers(); // hard code 6 vector features
	agsControl.addResults(imageResults);
	agsControl.showResults();
	if(agsControl.layer.features.length == 6) {
		t.ok(true, "...result features exist in map...");
	}
	if(map.getLayersByName("__gpImgResults1__").length == 1 && map.getLayersByName("__gpImgResults2__").length == 1) {
		t.ok(true, "...result images exist in map...");	
	}
	if(map.getLayersByName("__gpImgResults1__")[0].visibility == false || map.getLayersByName("__gpImgResults2__")[0].visibility == false) {
		t.ok(false, "...result images are not visible in map...");
	}
}

function test_Control_AgsControl_hideResults(t){
	setUp();
	t.plan(4);
	
	var agsControl = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[],
		{}
	);
	map.addControl(agsControl);
	agsControl.activate();
	
	var featureResults = createTestFeatures(); // hard code 6 vector features
	agsControl.addResults(featureResults);
	var imageResults = createTestImageLayers(); // hard code 2 image layers
	agsControl.addResults(imageResults);
	agsControl.showResults();
	if(agsControl.layer.features.length == 6) {
		t.ok(true, "...result features exist in map before hide...");
	}
	if(map.getLayersByName("__gpImgResults1__").length == 1 && map.getLayersByName("__gpImgResults2__").length == 1) {
		t.ok(true, "...result images exist in map before hide...");	
	}	
	agsControl.hideResults();
	if(map.getLayersByName("__gpImgResults1__")[0].visibility == false && map.getLayersByName("__gpImgResults2__")[0].visibility == false) {
		t.ok(true, "...result images are hidden in map correctly...");
	}
	if(agsControl.layer.features.length == 0) {
		t.ok(true, "...result features are removed from map correctly...");
	}
}

function test_Control_AgsControl_cleanupResults(t){
	setUp();
	t.plan(4);
	
	var agsControl = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[],
		{}
	);
	map.addControl(agsControl);
	agsControl.activate();
	
	var featureResults = createTestFeatures(); // hard code 6 vector features
	agsControl.addResults(featureResults);
	var imageResults = createTestImageLayers(); // hard code 6 vector features
	agsControl.addResults(imageResults);
	agsControl.showResults();
	if(agsControl.layer.features.length == 6) {
		t.ok(true, "...result features exist in map before cleanup...");
	}
	if(map.getLayersByName("__gpImgResults1__").length == 1 && map.getLayersByName("__gpImgResults2__").length == 1) {
		t.ok(true, "...result images exist in map before cleanup...");	
	}
	
	agsControl.cleanupResults();
	t.eq(agsControl._resultImages.length, 0, "...remove result images from control correctly...");
	if(map.getLayersByName("__gpImgResults1__").length == 0 && map.getLayersByName("__gpImgResults2__").length == 0) {
		t.ok(true, "...remove result images from map correctly...");	
	}	
	if(agsControl.layer.features.length == 6) {
		t.ok(true, "...remove result features from map correctly...");
	}
}

function test_Control_AgsControl_switchMode(t){
	setUp();
	t.plan(4);
	
	var agsControl = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[
			function(){},
			function(){},
		],
		{
			//mode: "select", // default mode is 'select' 
		}
	);
	map.addControl(agsControl);
	agsControl.activate();
	
	agsControl.switchMode("draw");
	t.eq(agsControl.mode, "draw", "...switch to draw mode correctly...");
	t.eq(agsControl.drawControl.active, true, "...switch to draw mode activate drawControl...");
	
	agsControl.switchMode("select");
	t.eq(agsControl.mode, "select", "...switch select mode correctly...");
	t.eq(agsControl.selectControl.active, true, "...switch to select mode activate selectControl...");	
}

function test_Control_AgsControl_switchDrawCtrlHandler(t){
	setUp();
	t.plan(5);
	
	var agsControl = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[
			function(){},
			function(){},
		],
		{
			mode: "draw", // default mode is 'select' 
		}
	);
	map.addControl(agsControl);
	agsControl.activate();
	
	t.ok(agsControl.drawControl.handler instanceof OpenLayers.Handler.Polygon, "...default drawControl handler is OpenLayers.Handler.Polygon...");
	agsControl.switchDrawCtrlHandler(OpenLayers.Handler.Point);
	t.ok(agsControl.drawControl.handler instanceof OpenLayers.Handler.Point, "...switch drawControl handler correctly...");
	t.ok(agsControl.drawCtrlHandler instanceof OpenLayers.Handler.Point, "...reset drawCtrlHandler correctly...");
	t.eq(agsControl.drawControl.active, true, "...switch drawControl handler correctly does not deactivate draw control...");
	
	agsControl.deactivate();
	agsControl.switchDrawCtrlHandler(OpenLayers.Handler.MultiPath);	
	t.eq(agsControl.drawControl.active, false, "...switch drawControl handler correctly does not activate draw control...");
	
}

function test_Control_AgsControl_execute(t){
	setUp();
	t.plan(1);
	
	var agsControl = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[
			function(){},
			function(){},
		],
		{
			//mode: "select", // default mode is 'select' 
		}
	);
	map.addControl(agsControl);
	agsControl.activate();
	
	try{
		agsControl.execute();
	} catch(e) {
		t.ok(true, "...can not call execute() directly...");
	}
}

function test_Control_AgsControl_activate(t){
	setUp();
	t.plan(4);
	
	var agsControl = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[
			function(){},
			function(){},
		],
		{
			//mode: "select", // default mode is 'select' 
		}
	);
	map.addControl(agsControl);
	agsControl.activate();
	
	t.ok(agsControl.selectControl.active, "...in 'select' mode...this.selectControl is activated correctly...");
	t.eq(agsControl.drawControl.active, null, "...in 'select' mode...this.drawControl is not activated...");
	
	var agsControl2 = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[
			function(){},
			function(){},
		],
		{
			mode: "draw", // default mode is 'select' 
		}
	);
	map.addControl(agsControl2);
	agsControl2.activate();
	
	t.ok(agsControl2.drawControl.active, "...in 'draw' mode...this.drawControl is activated correctly...");
	t.eq(agsControl2.selectControl.active, null, "...in 'draw' mode...this.selectControl is not activated...");	
}

function test_Control_AgsControl_deactivate(t){
	setUp();
	t.plan(2);
	
	var agsControl = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[
			function(){},
			function(){},
		],
		{
			//mode: "select", // default mode is 'select' 
		}
	);
	map.addControl(agsControl);
	agsControl.activate();
	agsControl.switchMode("draw");
	
	agsControl.deactivate();
	
	t.eq(agsControl.selectControl.active, false, "...this.selectControl is deactivated correctly...");
	t.eq(agsControl.drawControl.active, false, "...this.drawControl is deactivated correctly...");
}


function test_Control_AgsControl_initialize(t){
	setUp();
	t.plan(19);
	
	var agsControl = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		null,
		[
			function(){},
			function(){},
		],
		{}
	);
	map.addControl(agsControl);
	t.eq(agsControl.url, "http://www.google.com/", "...initialize url correctly...");
	t.ok(agsControl.layer instanceof OpenLayers.Layer.Vector, "...initialize an internal vector layer if not passed in as parameter...");
	var isPass = false;
	if(agsControl.taskCallbacks.length == 2) {
		if(typeof agsControl.taskCallbacks[0] == "function" && typeof agsControl.taskCallbacks[1] == "function") {
			isPass = true;
		}
	}
	t.ok(isPass, "...initialize task callback functions correctly...");	
	t.ok(agsControl.selectControl instanceof OpenLayers.Control.SelectFeature, "...initialize select control correctly...");
	t.ok(agsControl.drawControl instanceof OpenLayers.Control.DrawFeature, "...initialize draw control correctly...");
	
	t.ok(agsControl.selectControl.map instanceof OpenLayers.Map, "...hook select control to map correctly...");
	t.ok(agsControl.drawControl.map instanceof OpenLayers.Map, "...hook draw control to map correctly...");
		
	t.eq(agsControl.mode, "select", "...initial mode is 'select'...");
	t.eq(agsControl.asynchronous, false, "...initial asynchronous mode is false...");	
	t.ok(agsControl.adapter instanceof OpenLayers.Format.AgsJsAdapter, "...initialize adapter correctly...");
	t.eq(agsControl.adapter.config['defaultEncodeWkid'], "EPSG:4326", "...use projection of map as 'defaultEncodeWkid' of adapter...");
	
	t.ok(agsControl._resultFeatures instanceof Array, "...initialize _resultFeatures correctly...");
	t.ok(agsControl._resultImages instanceof Array, "...initialize _resultImages correctly...");
	
	t.eq(typeof agsControl._isDefined, "function", "...initialize utility _isDefined correctly...");
	t.eq(typeof agsControl._isAgsGeometry, "function", "...initialize utility _isAgsGeometry correctly...");
	t.eq(typeof agsControl._isOLGeometry, "function", "...initialize utility _isOLGeometry correctly...");
	t.eq(typeof agsControl._bindFunction, "function", "...initialize utility _bindFunction correctly...");
	
	var agsControl2 = new OpenLayers.Control.AgsControl(
		"http://www.google.com/",
		vectorLayer,
		[],
		{}
	);
	map.addControl(agsControl2);
	t.ok(agsControl2.layer instanceof OpenLayers.Layer.Vector, "...initialize control with an external vector layer passed in as parameter...");
	t.eq(agsControl2.layer.name, "vectorLayer", "...initialize control with an external vector layer passed in as parameter...");
}



