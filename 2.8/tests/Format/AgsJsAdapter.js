var adapter = null;
var _error = -99;

function setUp() {
	adapter = new OpenLayers.Format.AgsJsAdapter();
}

function tearDown() {
	adapter = null;
}

function test_Format_AgsJsAdapter_constructor(t) {
	setUp();
	t.plan(2);
	t.ok(adapter instanceof OpenLayers.Format.AgsJsAdapter, "...adapter is an instance of OpenLayers.Format.AgsJsAdapter...");
	t.eq(adapter.config['defaultEncodeWkid'], "EPSG:900913", "...config option 'defaultEncodeWkid' is set to 'EPSG:900913'...");
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsGeometry_point(t) {
	setUp()
	t.plan(7);
	var agsSpatialReference = {};
    agsSpatialReference['wkid'] = "4326";		
	var agsPoint = new esri.geometry.Point(34.49, 49.34, new esri.SpatialReference(agsSpatialReference));
	
	// parses agsPoint to olPoint
	var olPoint = adapter.parseAgsGeometry['point'].apply(adapter, [agsPoint]);
	t.ok(olPoint instanceof OpenLayers.Geometry.Point, "...olPoint is instance of OpenLayers.Geometry.Point...");
	t.eq(olPoint.x, 34.49, "...olPoint.x equals to agsPoint.x...");
	t.eq(olPoint.y, 49.34, "...olPoint.y equals to agsPoint.y...");
	
	// throws exception when input agsPoint.x is null
	agsPoint.x = null;
	try {
		olPoint = adapter.parseAgsGeometry['point'].apply(adapter, [agsPoint]);
	} catch(e) {
		t.ok(true, "...throws exception when input agsPoint.x is null...");
	}
	
	// throws exception when input agsPoint.y is null
	agsPoint.x = 34.49;
	agsPoint.y = null;
	try {
		olPoint = adapter.parseAgsGeometry['point'].apply(adapter, [agsPoint]);
	} catch(e) {
		t.ok(true, "...throws exception when input agsPoint.y is null...");
	}
	
	// throws exception when input agsPoint.x is not number
	agsPoint.x = "34.49";
	agsPoint.y = 49.34;
	try {
		olPoint = adapter.parseAgsGeometry['point'].apply(adapter, [agsPoint]);
	} catch(e) {
		t.ok(true, "...throws exception when input agsPoint.x is not number...");
	}
	
	// throws exception when input agsPoint.y is not number
	agsPoint.x = 34.49;
	agsPoint.y = "49.34";
	try {
		olPoint = adapter.parseAgsGeometry['point'].apply(adapter, [agsPoint]);
	} catch(e) {
		t.ok(true, "...throws exception when input agsPoint.y is not number...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsGeometry_coordinate(t) {
	setUp();	
	t.plan(7);
	
	var agsCoordinate = [34.49, 49.34];
	var olPoint = adapter.parseAgsGeometry['coordinate'].apply(adapter, [agsCoordinate]);
	
	// parses agsCoordinate to olPoint
	t.ok(olPoint instanceof OpenLayers.Geometry.Point, "...olPoint is instance of OpenLayers.Geometry.Point...");
	t.eq(olPoint.x, 34.49, "...olPoint.x equals to x of [x, y]...");
	t.eq(olPoint.y, 49.34, "...olPoint.y equals to y of [x, y]...");
	
	// throws exception when x of [x, y] is null
	var agsCoordinate = [null, 49.34];
	try {
		olPoint = adapter.parseAgsGeometry['coordinate'].apply(adapter, [agsCoordinate]);
	} catch(e) {
		t.ok(true, "...throws exception when x of [x, y] is null...");
	}
	
	// throws exception when y of [x, y] is null
	var agsCoordinate = [34.49, null];
	try {
		olPoint = adapter.parseAgsGeometry['coordinate'].apply(adapter, [agsCoordinate]);
	} catch(e) {
		t.ok(true, "...throws exception when y of [x, y] is null...");
	}
	
	// throws exception when x of [x, y] is not number
	var agsCoordinate = [34.49, "49.34"];
	try {
		olPoint = adapter.parseAgsGeometry['coordinate'].apply(adapter, [agsCoordinate]);
	} catch(e) {
		t.ok(true, "...throws exception when x of [x, y] is not number...");
	}
	
	// throws exception when y of [x, y] is not number
	var agsCoordinate = ["34.49", 49.34];
	try {
		olPoint = adapter.parseAgsGeometry['coordinate'].apply(adapter, [agsCoordinate]);
	} catch(e) {
		t.ok(true, "...throws exception when y of [x, y] is not number...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsGeometry_path(t) {
	setUp();	
	t.plan(6);
	
	var agsPointArray = [];
	agsPointArray.push([0,0]);
	agsPointArray.push([1,1]);
	agsPointArray.push([2,2]);
	agsPointArray.push([3,3]);
	
	var olLineString = adapter.parseAgsGeometry['path'].apply(adapter, [agsPointArray]);
	
	t.ok(olLineString instanceof OpenLayers.Geometry.LineString, "...olLineString is instance of OpenLayers.Geometry.LineString...");
	t.eq(olLineString.components.length, agsPointArray.length, "...olLineString has correct number of OpenLayers.Geometry.Point...");
	
	var isPass = 0;
	for(var i=0; i<olLineString.components.length; i++) {
		var agsCoordinate = agsPointArray[i];
		var olPoint = olLineString.components[i];
		if(olPoint.x === agsCoordinate[0] && olPoint.y === agsCoordinate[1]){
			isPass++;
		} else {
			isPass = _error;
		}
	}
	t.eq(agsPointArray.length, olLineString.components.length, "...parses every [x,y] in the path to a point in OpenLayers.Geometry.LineString...");
	t.eq(isPass, olLineString.components.length, "...parses every [x,y] in the path to a point in OpenLayers.Geometry.LineString...");
	
	agsPointArray[3] = [34.49, "49.34"];
	try {
		olLineString = adapter.parseAgsGeometry['path'].apply(adapter, [agsPointArray]);
	} catch(e) {
		t.ok(true, "...throws exception if any element in input array is not [x, y]...");
	}
	
	agsPointArray = {};
	try {
		olLineString = adapter.parseAgsGeometry['path'].apply(adapter, [agsPointArray]);
	} catch(e) {
		t.ok(true, "...throws exception if input is not an array...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsGeometry_ring(t) {
	setUp();	
	t.plan(7);
	
	var agsPointArray = [];
	agsPointArray.push([0,0]);
	agsPointArray.push([0,1]);
	agsPointArray.push([1,1]);
	agsPointArray.push([1,0]);
	agsPointArray.push([0,0]);
	
	var olLinearRing = adapter.parseAgsGeometry['ring'].apply(adapter, [agsPointArray]);
	
	t.ok(olLinearRing instanceof OpenLayers.Geometry.LinearRing, "...olLinearRing is instance of OpenLayers.Geometry.LinearRing...");
	t.eq(olLinearRing.components.length, agsPointArray.length, "...olLinearRing has correct number of OpenLayers.Geometry.Point...");
	
	var isPass = 0;
	for(var i=0; i<olLinearRing.components.length; i++) {
		var agsCoordinate = agsPointArray[i];
		var olPoint = olLinearRing.components[i];
		if(olPoint.x === agsCoordinate[0] && olPoint.y === agsCoordinate[1]){
			isPass++;			
		} else {
			isPass = _error;
			break;
		}
	}
	t.eq(agsPointArray.length, olLinearRing.components.length, "...parses every [x,y] to a point in OpenLayers.Geometry.LinearRing...");
	t.eq(isPass, olLinearRing.components.length, "...parses every [x,y] to a point in OpenLayers.Geometry.LinearRing...");
	
	agsPointArray[4] = [1, "0"];
	try {
		olLineString = adapter.parseAgsGeometry['ring'].apply(adapter, [agsPointArray]);
	} catch(e) {
		t.ok(true, "...throws exception if any element in input array is not [x, y]...");
	}
	
	agsPointArray = {};
	try {
		olLineString = adapter.parseAgsGeometry['ring'].apply(adapter, [agsPointArray]);
	} catch(e) {
		t.ok(true, "...throws exception if input is not an array...");
	}
	
	var agsPointArray2 = [];
	agsPointArray2.push([0,0]);
	agsPointArray2.push([0,1]);
	agsPointArray2.push([1,1]);
	agsPointArray2.push([1,0]);
	agsPointArray2.push([0,3]);
	
	try {
		olLineString = adapter.parseAgsGeometry['ring'].apply(adapter, [agsPointArray2]);
	} catch(e) {
		t.ok(true, "...throws exception if input is not a closed ring...");
	}
	
	tearDown();	
}

function test_Format_AgsJsAdapter_parseAgsGeometry_polyline(t) {
	setUp();
	t.plan(4);
	
	var findTask = new esri.tasks.FindTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/");
    findParams = new esri.tasks.FindParameters();
    findParams.layerIds = [1];
    findParams.searchFields = ["NAME"];
    findParams.returnGeometry = true;
    
    findParams.searchText = "Rio Grande";
    findTask.execute(
    	findParams, 
    	function(findResults) {
    		var adapter = new OpenLayers.Format.AgsJsAdapter({});
    		var agsPolyline = findResults[0].feature.geometry;
    		var olMultiLineString = adapter.parseAgsGeometry['polyline'].apply(adapter, [agsPolyline]);
    		
    		t.ok(olMultiLineString instanceof OpenLayers.Geometry.MultiLineString, "...olMultiLineString is instance of OpenLayers.Geometry.MultiLineString...");
    		
    		var isPass = 0;
    		var length = agsPolyline.paths[0].length;
    		for(var i=0; i<length; i++) {
    			var x1 = olMultiLineString.components[0].components[i].x;
    			var y1 = olMultiLineString.components[0].components[i].y;
    			var x2 = agsPolyline.paths[0][i][0];
    			var y2 = agsPolyline.paths[0][i][1];
    			if(x1 === x2 && y1 === y2) {
    				isPass++;    				
    			} else {
    				isPass = _error;
    				break;
    			}    			
    		}	
    		t.eq(olMultiLineString.components[0].components.length, length, "...parses correct number of [x,y] to points in OpenLayers.Geometry.MultiLineString...");
    		t.eq(isPass, length, "...parses every [x,y] to a point in OpenLayers.Geometry.MultiLineString correctly...");    		
    	}
    );
    t.wait_result(3);
    
    var agsPolyline2 = {};
   	agsPolyline2['paths'] = {};
	try {
		var olMultiLineString2 = adapter.parseAgsGeometry['polyline'].apply(adapter, [agsPolyline2]);
	} catch(e) {    			
		t.ok(true, "...throws exception if input is not array or not valid...");
	}
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsGeometry_polygon(t) {
	setUp();	
	t.plan(4);
	
	var findTask = new esri.tasks.FindTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/");
    findParams = new esri.tasks.FindParameters();
    findParams.layerIds = [2];
    findParams.searchFields = ["STATE_NAME"];
    findParams.returnGeometry = true;
    
    findParams.searchText = "Nevada";
    findTask.execute(
    	findParams, 
    	function(findResults) {
    		var adapter = new OpenLayers.Format.AgsJsAdapter({});
    		var agsPolygon = findResults[0].feature.geometry;
    		var olPolygon = adapter.parseAgsGeometry['polygon'].apply(adapter, [agsPolygon]);
    		
    		t.ok(olPolygon instanceof OpenLayers.Geometry.Polygon, "...returns instance of OpenLayers.Geometry.Polygon...");
    		
    		var isPass = 0;
    		var length = agsPolygon.rings[0].length;
    		for(var i=0; i<length; i++) {
    			var x1 = olPolygon.components[0].components[i].x;
    			var y1 = olPolygon.components[0].components[i].y;
    			var x2 = agsPolygon.rings[0][i][0];
    			var y2 = agsPolygon.rings[0][i][1];
    			if(x1 === x2 && y1 === y2) {
    				isPass++;    				    			
    			} else {
    				isPass = _error;
    				break;
    			}    			
    		}	
    		t.eq(olPolygon.components[0].components.length, length, "...parses correct number of [x,y] to points in OpenLayers.Geometry.Polygon...");
    		t.eq(isPass, length, "...parses every [x,y] to a point in OpenLayers.Geometry.Polygon correctly...");    		
    	}
    );
    t.wait_result(3);
    
    var agsPolygon2 = {};
   	agsPolygon2['rings'] = {};
	try {
		var olPolygon2 = adapter.parseAgsGeometry['polygon'].apply(adapter, [agsPolygon2]);
	} catch(e) {    			
		t.ok(true, "...throws exception if input is not array or not valid...");
	}	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsGeometry_multipoint(t) {
	setUp();
	t.plan(4);
	
	var agsSpatialReference = {};
    agsSpatialReference['wkid'] = "4326";
	var agsMultiPoint = new esri.geometry.Multipoint(new esri.SpatialReference(agsSpatialReference));
	
	agsMultiPoint.addPoint(new esri.geometry.Point(1, 1, new esri.SpatialReference(agsSpatialReference)));
	agsMultiPoint.addPoint(new esri.geometry.Point(2, 2, new esri.SpatialReference(agsSpatialReference)));
	agsMultiPoint.addPoint(new esri.geometry.Point(3, 3, new esri.SpatialReference(agsSpatialReference)));
	
	var olPoints = adapter.parseAgsGeometry['multipoint'].apply(adapter, [agsMultiPoint]);
	
	t.ok(olPoints instanceof Array, "...olPoints is instance of Array of OpenLayers.Geometry.Point...");
    		
    var isPass = 0;
    var length = agsMultiPoint.points.length;
    for(var i=0; i<length; i++) {
    	var x1 = olPoints[i].x;
    	var y1 = olPoints[i].y;
    	var x2 = agsMultiPoint.points[i][0];
    	var y2 = agsMultiPoint.points[i][1];
    	
		if(x1 === x2 && y1 === y2) {
    		isPass++;    				    			
		} else {
    		isPass = _error;
			//t.debug_print("x1:" + x1 + " x2:" + x2 + " y1:" + y1 + " y2:" + y2);
    		break;
    	}    			
    }	
    t.eq(olPoints.length, length, "...parses correct number of [x,y] to points in Array of OpenLayers.Geometry.Point...");
    t.eq(isPass, length, "...parses every [x,y] to a point in Array of OpenLayers.Geometry.Polygon correctly..."); 
	
	var agsMultiPoint2 = {};
   	agsMultiPoint2['points'] = {};
	try {
		var olPoints2 = adapter.parseAgsGeometry['multipoint'].apply(adapter, [agsMultiPoint2]);
	} catch(e) {    			
		t.ok(true, "...throws exception if input is not array or not valid...");
	}
	tearDown();
}

function test_Format_AGSJSAdapter_parseAgsGeometry_extent(t) {
	setUp();	
	t.plan(3);
	
	var agsSpatialReference = {};
    agsSpatialReference['wkid'] = "4326";		
	var agsExtent = new esri.geometry.Extent(-180, -90, 180, 90, new esri.SpatialReference(agsSpatialReference));
	
	var olBounds = adapter.parseAgsGeometry['extent'].apply(adapter, [agsExtent]);
	t.ok(olBounds instanceof OpenLayers.Bounds, "...olBounds is instance of OpenLayers.Bounds...");
	
	var isPass = true;
	var bounds = olBounds.toArray();
	if(bounds[0] !== agsExtent.xmin) {
		isPass = false;
	}
	if(bounds[1] !== agsExtent.ymin) {
		isPass = false;
	}
	if(bounds[2] !== agsExtent.xmax) {
		isPass = false;
	}
	if(bounds[3] !== agsExtent.ymax) {
		isPass = false;
	}
	t.ok(isPass, "...parses minx, miny, maxx, maxy correctly to OpenLayers.Bounds...");
	
	agsExtent.xmin = null;
	try {
		var olBounds2 = adapter.parseAgsGeometry['extent'].apply(adapter, [agsExtent]);
	} catch(e) {
		t.ok(true, "...throws exception if xmin, ymin, xmax, or ymax of agsExtent is null or not valid...");
	}	
	tearDown();
}

function test_Format_AGSJSAdapter_parseAgsSymbol_SimpleMarkerSymbol(t) {
	setUp();	
	t.plan(10);
	
    var simpleMarkerSymbol1 = new esri.symbol.SimpleMarkerSymbol(
    	"STYLE_CIRCLE", 
    	8,
    	new esri.symbol.SimpleLineSymbol(
			"STYLE_DASHDOT",
			null, // set null for default color (0,0,0,1) 
			2
		),
    	null // set null for default color (0,0,0,1)
    );
	simpleMarkerSymbol1.setOffset(34, 49);
	
	var olStyle1 = adapter.parseAgsSymbol['SimpleMarkerSymbol'].apply(adapter, [simpleMarkerSymbol1]);
	
	t.eq(olStyle1['pointRadius'], 8, "...parses 'pointRadius' correctly...");
	t.eq(olStyle1['fillColor'], "#000000", "...parses 'fillColor' correctly...");
	t.eq(olStyle1['fillOpacity'], 1, "...parses 'fillOpacity' correctly...");
	t.eq(olStyle1['graphicXOffset'], 34, "...parses 'graphicXOffset' correctly...");
	t.eq(olStyle1['graphicYOffset'], 49, "...parses 'graphicYOffset' correctly...");
	t.eq(olStyle1['strokeDashstyle'], "dashdot", "...parses 'strokeDashstyle' correctly...");
	t.eq(olStyle1['strokeWidth'], 2, "...parses 'strokeWidth' correctly...");
	t.eq(olStyle1['strokeColor'], "#000000", "...parses 'strokeColor' correctly...");
	t.eq(olStyle1['strokeOpacity'], 1, "...parses 'strokeOpacity' correctly...");
	
	var simpleMarkerSymbol2 = {
		'name': "name",
		'value': "value"
	};
	
	try {
		var olStyle2 = adapter.parseAgsSymbol['SimpleMarkerSymbol'].apply(adapter, [simpleMarkerSymbol2]);
	} catch(e) {
		t.ok(true, "...throws exception if input is invalid esri.symbol.SimpleMarkerSymbol...");
	}
	
	tearDown();
}

function test_Format_AGSJSAdapter_parseAgsSymbol_SimpleLineSymbol(t) {
	setUp();	
	t.plan(5);
	
    var simpleLineSymbol1 = new esri.symbol.SimpleLineSymbol(
    	"STYLE_DASH", 
    	null, // set null for default color (0,0,0,1)
    	2
    );
	
	var olStyle1 = adapter.parseAgsSymbol['SimpleLineSymbol'].apply(adapter, [simpleLineSymbol1]);
		
	t.eq(olStyle1['strokeDashstyle'], "dash", "...parses 'strokeDashstyle' correctly...");
	t.eq(olStyle1['strokeWidth'], 2, "...parses 'strokeWidth' correctly...");
	t.eq(olStyle1['strokeColor'], "#000000", "...parses 'strokeColor' correctly...");
	t.eq(olStyle1['strokeOpacity'], 1, "...parses 'strokeOpacity' correctly...");
	
	var simpleLineSymbol2 = {
		'name': "name",
		'value': "value"
	};
		
	try {
		var olStyle2 = adapter.parseAgsSymbol['SimpleLineSymbol'].apply(adapter, [simpleLineSymbol2]);
	} catch(e) {
		t.ok(true, "...throws exception if input is invalid esri.symbol.SimpleLineSymbol...");
	}	
	tearDown();
}

function test_Format_AGSJSAdapter_parseAgsSymbol_PictureMarkerSymbol(t) {
	setUp();	
	t.plan(7);
	
    var pictureMarkerSymbol1 = new esri.symbol.PictureMarkerSymbol(
    	"http://www.google.com/pictures/marker.png",
		34,
		49
    );
	pictureMarkerSymbol1.setOffset(34, 49);
	pictureMarkerSymbol1.setSize(8);
	
	var olStyle1 = adapter.parseAgsSymbol['PictureMarkerSymbol'].apply(adapter, [pictureMarkerSymbol1]);
		
	t.eq(olStyle1['externalGraphic'], "http://www.google.com/pictures/marker.png", "...parses 'externalGraphic' correctly...");
	t.eq(olStyle1['graphicWidth'], 34, "...parses 'strokeWidth' correctly...");
	t.eq(olStyle1['graphicHeight'], 49, "...parses 'strokeHeight' correctly...");
	t.eq(olStyle1['graphicXOffset'], 34, "...parses 'graphicXOffset' correctly...");
	t.eq(olStyle1['graphicYOffset'], 49, "...parses 'graphicYOffset' correctly...");
	t.eq(olStyle1['pointRadius'], 8, "...parses 'pointRadius' correctly...");
	
	var pictureMarkerSymbol2 = {
		'name': "name",
		'value': "value"
	};
		
	try {
		var olStyle2 = adapter.parseAgsSymbol['PictureMarkerSymbol'].apply(adapter, [pictureMarkerSymbol2]);
	} catch(e) {
		t.ok(true, "...throws exception if input is invalid esri.symbol.PictureMarkerSymbol...");
	}	
	tearDown();
}

function test_Format_AGSJSAdapter_parseAgsSymbol_SimpleFillSymbol(t) {
	setUp();	
	t.plan(7);
	
    var simpleFillSymbol1 = new esri.symbol.SimpleFillSymbol(
    	"STYLE_SOLID", 
    	new esri.symbol.SimpleLineSymbol(
			"STYLE_DASHDOT",
			null, // set null for default color (0,0,0,1) 
			2
		),
    	new dojo.Color([255,255,255]) // set null for default color (0,0,0,1)
    );
	
	var olStyle1 = adapter.parseAgsSymbol['SimpleFillSymbol'].apply(adapter, [simpleFillSymbol1]);
	
	t.eq(olStyle1['fillColor'], "#ffffff", "...parses 'fillColor' correctly...");
	t.eq(olStyle1['fillOpacity'], 1, "...parses 'fillOpacity' correctly...");	
	t.eq(olStyle1['strokeDashstyle'], "dashdot", "...parses 'strokeDashstyle' correctly...");
	t.eq(olStyle1['strokeWidth'], 2, "...parses 'strokeWidth' correctly...");
	t.eq(olStyle1['strokeColor'], "#000000", "...parses 'strokeColor' correctly...");
	t.eq(olStyle1['strokeOpacity'], 1, "...parses 'strokeOpacity' correctly...");
	
	var simpleFillSymbol2 = {
		'name': "name",
		'value': "value"
	};
	
	try {
		var olStyle2 = adapter.parseAgsSymbol['SimpleFillSymbol'].apply(adapter, [simpleFillSymbol2]);
	} catch(e) {
		t.ok(true, "...throws exception if input is invalid esri.symbol.SimpleFillSymbol...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsSpatialReference(t) {
	setUp();
	t.plan(3);
	
	var agsSpatialReference = {};
    agsSpatialReference['wkid'] = "4326";		
    
    var olSpatialReference = adapter.parseAgsSpatialReference(new esri.SpatialReference(agsSpatialReference));
	t.eq("EPSG:4326", olSpatialReference, "...parses esri.SpatialReference 4326 correctly...");
	
	var agsSpatialReference1 = {};
    agsSpatialReference1['wkid'] = "102113";		
    
    var olSpatialReference1 = adapter.parseAgsSpatialReference(new esri.SpatialReference(agsSpatialReference1));
	t.eq("EPSG:900913", olSpatialReference1, "...parses esri.SpatialReference 102113 correctly...");
	
	var agsSpatialReference2 = {};
	agsSpatialReference2['wkid'] = null;
	try {
		var olSpatialReference2 = adapter.parseAgsSpatialReference(agsSpatialReference2);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid esri.SpatialReference...");
	}
	
	tearDown();
}

function test_Format_AGSJSAdapter_parseAgsGraphic(t) {
	setUp();
	t.plan(15);
	
	var findTask = new esri.tasks.FindTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/");
    findParams = new esri.tasks.FindParameters();
    findParams.layerIds = [0];
    findParams.searchFields = ["CITY_NAME"];
    findParams.returnGeometry = true;
    
    findParams.searchText = "Los Angeles";
    findTask.execute(
    	findParams, 
    	function(findResults) {
    		var adapter = new OpenLayers.Format.AgsJsAdapter({});
    		var agsGraphic = findResults[0].feature;
    		
    		//infoTemplate 
    		agsGraphic.infoTemplate = new esri.InfoTemplate("title", "<html>content</html>");
    		
    		//symbol
    		agsGraphic.symbol = new esri.symbol.SimpleMarkerSymbol(
		    	"STYLE_CIRCLE", 
		    	8,
		    	new esri.symbol.SimpleLineSymbol(
					"STYLE_DASHDOT",
					null, // set null for default color (0,0,0,1) 
					2
				),
		    	null // set null for default color (0,0,0,1)
		    );
			agsGraphic.symbol.setOffset(34, 49);	
    		
    		var olFeature = adapter.parseAgsGraphic.apply(adapter, [agsGraphic]);  
    		//t.debug_print("Geometry of OpenLayers.Feature.Vector" + olFeature.geometry);
    		t.ok(olFeature instanceof OpenLayers.Feature.Vector, "...olFeature is an instance of OpenLayers.Feature.Vector...");		
    		t.ok(olFeature.geometry instanceof OpenLayers.Geometry.Point, "...parses geometry of esri.Graphic correctly...");
			
			var isPass = true;
			for(key in agsGraphic.attributes) {
				var value1 = agsGraphic.attributes[key];
				var value2 = olFeature.attributes[key];
				if(value1 !== value2) {
					isPass = false;
					break;
				}
			}
			t.ok(isPass, "...parses attributes of esri.Graphic correctly...");
    	
    		t.eq(olFeature.attributes['infoTemplateTitle'], "title", "...parses infoTemplateTitle correctly...");
    		t.eq(olFeature.attributes['infoTemplateContent'], "<html>content</html>", "...parses infoTemplateContent correctly...");
    		
			t.eq(olFeature.style['pointRadius'], 8, "...parses 'pointRadius' correctly...");
			t.eq(olFeature.style['fillColor'], "#000000", "...parses 'fillColor' correctly...");
			t.eq(olFeature.style['fillOpacity'], 1, "...parses 'fillOpacity' correctly...");
			t.eq(olFeature.style['graphicXOffset'], 34, "...parses 'graphicXOffset' correctly...");
			t.eq(olFeature.style['graphicYOffset'], 49, "...parses 'graphicYOffset' correctly...");
			t.eq(olFeature.style['strokeDashstyle'], "dashdot", "...parses 'strokeDashstyle' correctly...");
			t.eq(olFeature.style['strokeWidth'], 2, "...parses 'strokeWidth' correctly...");
			t.eq(olFeature.style['strokeColor'], "#000000", "...parses 'strokeColor' correctly...");
			t.eq(olFeature.style['strokeOpacity'], 1, "...parses 'strokeOpacity' correctly...");
    	}
    );
    t.wait_result(3);	
    
    var agsGraphic1 = {};
    agsGraphic1['geometry'] = "invalid";
    try {
    	var olFeature1 = adapter.parseAgsGraphic.apply(adapter, [agsGraphic]);
    } catch(e) {
    	t.ok(true, "...throws exception if input agsGraphic does not have a valid geometry...");
    }
	
	tearDown();
}

function test_Format_AGSJSAdapter_parseAgsGraphics(t) {
	setUp();
	t.plan(2);

	var findTask = new esri.tasks.FindTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/");
    findParams = new esri.tasks.FindParameters();
    findParams.layerIds = [0];
    findParams.searchFields = ["CITY_NAME"];
    findParams.returnGeometry = true;
    
    findParams.searchText = "San ";
    findParams.contain = true;
    findTask.execute(
    	findParams, 
    	function(findResults) {
    		var adapter = new OpenLayers.Format.AgsJsAdapter({});
    		var agsGraphics = [];
    		for(var i=0; i<findResults.length; i++) {
    			agsGraphics.push(findResults[i].feature);
    		}
    		var olFeatures = adapter.parseAgsGraphics.apply(adapter, [agsGraphics]);
    		//t.debug_print("number of esri.Graphic in the array: " + olFeatures.length);
	    	var isPass = 0;
    		for(var j=0; j<olFeatures.length; j++) {    			
    			if(olFeatures[j] instanceof OpenLayers.Feature.Vector) {
    				isPass++;
    			} else {
    				isPass = _error;
    				break;
    			}
    		}
    		t.eq(isPass, olFeatures.length, "...parses array of esri.Graphic and returns an array of OpenLayers.Feature.Vector correctly...");
    	}
    );
	t.wait_result(3);
	
	var agsGraphics1 = {};
    try {
    	var olFeatures1 = adapter.parseAgsGraphics.apply(adapter, [agsGraphics1]);
    } catch(e) {
    	t.ok(true, "...throws exception if input agsGraphics is not an array...");
    }
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsIdentifyResult(t) {
	setUp();
	t.plan(5);
	
	var identifyTask = new esri.tasks.IdentifyTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer");
	
	var agsSpatialReference = {};
    agsSpatialReference['wkid'] = "4326";		
	var agsPoint = new esri.geometry.Point(-118.41211440542, 34.1121065382343, new esri.SpatialReference(agsSpatialReference));
	var agsExtent = new esri.geometry.Extent(-118.41211440543, 34.1121065382342, -118.41211440541, 34.1121065382344, new esri.SpatialReference(agsSpatialReference));
	
	identifyParams = new esri.tasks.IdentifyParameters();
    identifyParams.dpi = 96;
    identifyParams.width = 1024;
    identifyParams.dpi = 512;
    identifyParams.layerId = [0]; // hard coded identify will return 8 identifyResult
    identifyParams.layerOption = "visible";    
    identifyParams.tolerance = 1;
    identifyParams.returnGeometry = true;
	identifyParams.geometry = agsPoint; 
	identifyParams.mapExtent = agsExtent;
	identifyParams.spatialReference = new esri.SpatialReference(agsSpatialReference);
	
	identifyTask.execute(
		identifyParams,
		function(identifyResults) {
			var adapter = new OpenLayers.Format.AgsJsAdapter({});
			var identifyResult = identifyResults[0];			
			var olFeature = adapter.parseAgsResults['identifyResult'].apply(adapter, [identifyResult]);
			t.ok(olFeature instanceof OpenLayers.Feature.Vector, "...olFeature is an instance of OpenLayers.Feature.Vector...");		
			//t.debug_print("city found: " + olFeature.attributes['CITY_NAME']);
			t.ok(olFeature.attributes['displayFieldName'], "...parses 'displayFieldName' attribute correctly...");
			var isPass = true;
			if(olFeature.attributes['layerId'] === null || olFeature.attributes['layerId'] === "undefined") {
				isPass = false;
			}
			t.ok(isPass, "...parses 'layerId' attribute correctly...");
			t.ok(olFeature.attributes['layerName'], "...parses 'layerName' attribute correctly...");
		}
	);
	t.wait_result(3);
	
	var identifyResult1 = {};
	identifyResult1['feature'] = null;
	try {
		var olFeature1 = adapter.parseAgsResults['identifyResult'].apply(adapter, [identifyResult1]);
	} catch(e) {
		t.ok(true, "...throws exception when the input is invalid esri.Graphic...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsIdentifyResults(t) {
	setUp();
	t.plan(3);
	
	var identifyTask = new esri.tasks.IdentifyTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer");
	
	var agsSpatialReference = {};
    agsSpatialReference['wkid'] = "4326";		
	var agsPoint = new esri.geometry.Point(-118.41211440542, 34.1121065382343, new esri.SpatialReference(agsSpatialReference));
	var agsExtent = new esri.geometry.Extent(-118.41211440543, 34.1121065382342, -118.41211440541, 34.1121065382344, new esri.SpatialReference(agsSpatialReference));
	
	identifyParams = new esri.tasks.IdentifyParameters();
    identifyParams.dpi = 96;
    identifyParams.width = 1024;
    identifyParams.dpi = 512;
    identifyParams.layerId = [0]; // hard coded identify will return 8 identifyResult
    identifyParams.layerOption = "visible";    
    identifyParams.tolerance = 1;
    identifyParams.returnGeometry = true;
	identifyParams.geometry = agsPoint; 
	identifyParams.mapExtent = agsExtent;
	identifyParams.spatialReference = new esri.SpatialReference(agsSpatialReference);
	
	identifyTask.execute(
		identifyParams,
		function(identifyResults) {
			var adapter = new OpenLayers.Format.AgsJsAdapter({});
			var olFeatures = adapter.parseAgsResults['identifyResults'].apply(adapter, [identifyResults]);			
			var isPass = true;
			var count = 0;
			for(var i=0; i<8; i++) {				
				if(!(olFeatures[i] instanceof OpenLayers.Feature.Vector)) {
					isPass = false;
				} else {
					//t.debug_print("city found: " + olFeatures[i].attributes['CITY_NAME']);
					count++;
				}
			}
			t.eq(count, 8, "...parses number of esri.tasks.IdentifyResult correctly...");
			t.ok(isPass, "...parses array of esri.tasks.IdentifyResult and returns an array of instance of OpenLayers.Feature.Vector correctly...");
		}
	);	
	t.wait_result(3);
	
	var identifyResults1 = {};
	try {
		var olFeatures = adapter.parseAgsResults['identifyResults'].apply(adapter, [identifyResults1]);	
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid array of esri.tasks.IdentifyResult...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsAddressCandidate(t) {
	setUp();
	t.plan(4);
	
	var locator = new esri.tasks.Locator("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer");
	
	var address = {};
	address['address'] = "380 New York Str";
	address['city'] = "Redlands";
	address['state'] = "CA";
	address['zip'] = "92373";
	
	var outFields = null;
	
	locator.addressToLocations(
		address,
		["StreetName", "City", "State", "ZIP"],		
		function(addressCandidates) {
			var adapter = new OpenLayers.Format.AgsJsAdapter({});
			var olFeature = adapter.parseAgsResults['addressCandidate'].apply(adapter, [addressCandidates[0]]);
			t.ok(olFeature instanceof OpenLayers.Feature.Vector, "...olFeature is an instance of OpenLayers.Feature.Vector...");

			t.eq("380 NEW YORK ST, REDLANDS, CA, 92373", olFeature.attributes['address'], "...parses 'address' attribute correctly...");
			//t.debug_print("address found: " + olFeature.attributes['address']);
			t.eq(100, olFeature.attributes['score'], "...parses 'score' attribute correctly...");
			//t.debug_print("score of found address: " + olFeature.attributes['score']);
		}
	);
	t.wait_result(3);
	
	var addressCandidate1 = {};
	addressCandidate1['location'] = null;
	try {
		var olFeature = adapter.parseAgsResults['addressCandidate'].apply(adapter, [addressCandidate1]);
	} catch(e) {
		t.ok(true, "...throws exception when input addressCandidate has invalid location...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsAddressCandidates(t) {
	setUp();
	t.plan(3);
	
	var locator = new esri.tasks.Locator("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer");
	
	var address = {};
	address['address'] = "380 New York Str";
	address['city'] = "Redlands";
	address['state'] = "CA";
	address['zip'] = "92373";
	
	var outFields = null;
	
	// hard coded geocoding request returns 		
	locator.addressToLocations(
		address,
		["StreetName", "City", "State", "ZIP"],	
		function(addressCandidates) {
			var adapter = new OpenLayers.Format.AgsJsAdapter({});
			var olFeatures = adapter.parseAgsResults['addressCandidates'].apply(adapter, [addressCandidates]);
			var isPass = true;
			var count = 0;
			for(var i=0; i<olFeatures.length; i++) {
				if(!(olFeatures[i] instanceof OpenLayers.Feature.Vector)) {
					isPass = false;				
				} else {
					count++;
				}
			}
			t.ok(isPass, "...returns an array of instance of OpenLayers.Feature.Vector...");
			t.eq(count, 10, "...parses array of esri.tasks.AddressCandidate...");
		}
	);
	t.wait_result(3);
	
	var addressCandidates1 = {};
	try {
		var olFeatures1 = adapter.parseAgsResults['addressCandidates'].apply(adapter, [addressCandidates1]);		
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid array of esri.tasks.AddressCandidate...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsFindResult(t) {
	setUp();
	t.plan(6);
	
	var findTask = new esri.tasks.FindTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/");
    findParams = new esri.tasks.FindParameters();
    findParams.layerIds = [0];
    findParams.searchFields = ["CITY_NAME"];
    findParams.returnGeometry = true;
    
    findParams.searchText = "Los Angeles";
    findTask.execute(
    	findParams,
    	function(findResults) {
    		var adapter = new OpenLayers.Format.AgsJsAdapter({});
    		var olFeature = adapter.parseAgsResults['findResult'].apply(adapter, [findResults[0]]);
    		t.ok(olFeature instanceof OpenLayers.Feature.Vector, "...olFeature is an instance of OpenLayers.Feature.Vector...");
    		t.eq("CITY_NAME", olFeature.attributes['displayFieldName'], "...parses 'displayFieldName' attribute...");
    		//t.debug_print("displayFieldName of findResult: " + olFeature.attributes['displayFieldName']);
    		t.eq("CITY_NAME", olFeature.attributes['foundFieldName'], "...parses 'foundFieldName' attribute...");
    		//t.debug_print("foundFieldName of findResult: " + olFeature.attributes['foundFieldName']);
    		t.eq(0, olFeature.attributes['layerId'], "...parses'layerId' attribute...");
    		//t.debug_print("layerId of findResult: " + olFeature.attributes['layerId']);
    		t.eq("Cities", olFeature.attributes['layerName'], "...parses 'layerName' attribute...");		
    		//t.debug_print("layerName of findResult: " + olFeature.attributes['layerName']);
    	}
    );
	
	t.wait_result(3);
	
	var findResult1 = {};
	findResult1['feature'] = null;
	
	try {
		var olFeature1 = adapter.parseAgsResults['findResult'].apply(adapter, [findResult1]);
	} catch(e) {
		t.ok(true, "...throws exception when input findResult has invalid feature esri.Graphic...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsFindResults(t) {
	setUp();
	t.plan(3);
	
	var findTask = new esri.tasks.FindTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/");
    findParams = new esri.tasks.FindParameters();
    findParams.layerIds = [0];
    findParams.searchFields = ["CITY_NAME"];
    findParams.returnGeometry = true;
    
    findParams.searchText = "San ";
    findParams.contain = true;
    findTask.execute(
    	findParams, 
    	function(findResults) {
    		var adapter = new OpenLayers.Format.AgsJsAdapter({});
    		var olFeatures = adapter.parseAgsResults['findResults'].apply(adapter, [findResults]); 
    		var isPass = true;
    		var count = 0;
    		for(var i=0; i<olFeatures.length; i++) {
    			if(!(olFeatures[i] instanceof OpenLayers.Feature.Vector)) {
    				isPass = false;
    			} else {
    				count++;
    			}
    		}
    		t.ok(isPass, "...olFeatures is an array of instance of OpenLayers.Feature.Vector...");
    		t.eq(32, count, "...parses array of findResult into OpenLayers.Feature.Vector array correctly...");
    		//t.debug_print("cities found: " + olFeatures.length);
    	}
    );	
	t.wait_result(3);
	
	var findResults1 = {};
	try {
		adapter.parseAgsResults['findResults'].apply(adapter, [findResults1]); 
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid array of esri.tasks.FindResult...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsFeatureSet(t) {
	setUp();
	t.plan(3);
	
	var queryTask = new esri.tasks.QueryTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/0");
	var query = new esri.tasks.Query();
	query.returnGeometry = true;
    query.outFields = ["CITY_NAME"];
    query.text = "San ";
    
    queryTask.execute(
    	query,
    	function(featureSet) {
    		var adapter = new OpenLayers.Format.AgsJsAdapter({});
    		var olFeatures = adapter.parseAgsResults['featureSet'].apply(adapter, [featureSet]); 
    		
    		var isPass = true;
    		var count = 0;
    		for(var i=0; i<olFeatures.length; i++) {
    			if(!(olFeatures[i] instanceof OpenLayers.Feature.Vector)) {
    				isPass = false;
    			} else {
    				count++;
    			}
    		}
    		t.ok(isPass, "...olFeatures is an array of instance of OpenLayers.Feature.Vector...");
    		t.eq(32, count, "...parses array of esri.Graphic in esri.tasks.FeatureSet correctly to array of OpenLayers.Feature.Vector...");
    	}
    );
    
    var featureSet1 = {};
	try {
		adapter.parseAgsResults['featureSet'].apply(adapter, [featureSet1]); 
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid instanceof of esri.tasks.FeatureSet...");
	}
	
	t.wait_result(3);
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsAreasAndLengths(t){
	setUp();
	t.plan(3);
	
	var agsAreasAndLengths1 = {
		areas: [0,1],
		lengths: [1,0]
	};
	var olAreasAndLengths = adapter.parseAgsResults['areasAndLengths'].apply(adapter, [agsAreasAndLengths1]);
	t.eq(olAreasAndLengths.areas, [0,1], "...parses agsAreasAndLengths.areas correctly...");
	t.eq(olAreasAndLengths.lengths, [1,0], "...parses agsAreasAndLengths.lengths correctly...");
	
	var agsAreasAndLengths2 = {
		address: [0,1],
		country: [0,1]
	};
	try {
		adapter.parseAgsResults['areasAndLengths'].apply(adapter, [agsAreasAndLengths2]); 
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid instanceof of esri areasAndLengths...");
	}
	tearDown();
}


function test_Format_AgsJsAdapter_parseAgsRelation(t){
	t.plan(1);
	t.ok(true, "...skipped...to be implemented...");
}

function test_Format_AgsJsAdapter_parseAgsRelations(t){
	t.plan(1);
	t.ok(true, "...skipped...to be implemented...");
}



function test_Format_AgsJsAdapter_parseAgsDirectionsFeatureSet(t) {

	setUp();
	t.plan(8);		
	
	// initialize routeTask
	var routeTask = new esri.tasks.RouteTask("http://tasks.arcgisonline.com/ArcGIS/rest/services/NetworkAnalysis/ESRI_Route_NA/NAServer/Route");	
	// create routeParameters
	var routeParameters = new esri.tasks.RouteParameters();	
	// stops and barriers
	routeParameters.stops = new esri.tasks.FeatureSet();	
  	routeParameters.stops.features = [];
  	
	var agsSpatialReference = {};
    agsSpatialReference['wkid'] = 4326;		
	
	routeParameters.stops.spatialReference = agsSpatialReference;
	routeParameters.stops.geometryType = "Point";
	
	// 1075 W. State Street, Redlands, CA
	var stopPoint1 = new esri.geometry.Point(-117.19759941101074, 34.05553943775479, new esri.SpatialReference(agsSpatialReference));
	// Loma Linda Medical Center
	var stopPoint2 = new esri.geometry.Point(-117.26450443267822, 34.04945928842325, new esri.SpatialReference(agsSpatialReference));
	
	var stopGraphic1 = new esri.Graphic(stopPoint1, null, null, null);
	var stopGraphic2 = new esri.Graphic(stopPoint2, null, null, null);
	
	routeParameters.stops.features.push(stopGraphic1);	
	routeParameters.stops.features.push(stopGraphic1);
		
	routeParameters.returnDirections = true;
  	routeParameters.returnRoutes = true;
  	routeParameters.returnStops = true;
  	routeParameters.returnBarriers = true;
	
	// execute route task
	routeTask.solve(
		routeParameters,
		function(routeResults, barriers, message){
			t.ok(true, "...solve returned from server...callback gets called...");					
			var agsRouteResult = routeResults[0];			
			var adapter = new OpenLayers.Format.AgsJsAdapter({});
			try {
				var olRouteResult = adapter.parseAgsResults['routeResult'].apply(adapter, [agsRouteResult]); 
			} catch(e) {
				t.ok(true, "...throws exception when parsing esri.tasks.RouteResult...");
			}				
			
			// testing the content of directions which is being parsed and converted from esri.tasks.DirectionsFeatureSet
			var directions = olRouteResult.directions;
			// test if esri.tasks.DirectionsFeatureSet is converted as OpenLayers.Feature.Vector
			t.ok(directions instanceof OpenLayers.Feature.Vector, "...parse esri.tasks.DirectionsFeatureSet...");
			// test if converted OpenLayers.Feature.Vector has a MultiLineString type geometry
			t.ok(directions.geometry instanceof OpenLayers.Geometry.MultiLineString, "...parse mergedGeometry in esri.tasks.DirectionsFeatureSet..."); 
			// test 'routeId' attribute
			t.eq(directions.attributes.routeId, 1, "...parse 'routeId' attribute in esri.tasks.DirectionsFeatureSet...");
			// test 'routeName' attribute
			t.eq(directions.attributes.routeName, "Location 1 - Location 2", "...parse 'routeName' attribute in esri.tasks.DirectionsFeatureSet...");
			// test 'totalDriveTime' attribute
			t.eq(directions.attributes.totalDriveTime, 0, "...parse 'totalDriveTime' attribute in esri.tasks.DirectionsFeatureSet...");
			// test 'totalLength' attribute
			t.eq(directions.attributes.totalLength, 0, "...parse 'totalLength' attribute in esri.tasks.DirectionsFeatureSet...");
			// test 'totalTime' attribute
			t.eq(directions.attributes.totalTime, 0, "...parse 'totalTime' attribute in esri.tasks.DirectionsFeatureSet...");
		},
		function(error) {
			t.ok(false, "...solve is not successful...");
		}
	);
	t.wait_result(10);	
	tearDown();
	
}

function test_Format_AgsJsAdapter_parseAgsRouteResult(t) {
	setUp();
	t.plan(7);		
	
	// initialize routeTask
	var routeTask = new esri.tasks.RouteTask("http://tasks.arcgisonline.com/ArcGIS/rest/services/NetworkAnalysis/ESRI_Route_NA/NAServer/Route");	
	// create routeParameters
	var routeParameters = new esri.tasks.RouteParameters();	
	// stops and barriers
	routeParameters.stops = new esri.tasks.FeatureSet();	
  	routeParameters.stops.features = [];
  	
	var agsSpatialReference = {};
    agsSpatialReference['wkid'] = 4326;		
	
	routeParameters.stops.spatialReference = agsSpatialReference;
	routeParameters.stops.geometryType = "Point";
	
	// 1075 W. State Street, Redlands, CA
	var stopPoint1 = new esri.geometry.Point(-117.19759941101074, 34.05553943775479, new esri.SpatialReference(agsSpatialReference));
	// Loma Linda Medical Center
	var stopPoint2 = new esri.geometry.Point(-117.26450443267822, 34.04945928842325, new esri.SpatialReference(agsSpatialReference));
	
	var stopGraphic1 = new esri.Graphic(stopPoint1, null, null, null);
	var stopGraphic2 = new esri.Graphic(stopPoint2, null, null, null);
	
	routeParameters.stops.features.push(stopGraphic1);	
	routeParameters.stops.features.push(stopGraphic2);
		
	routeParameters.returnDirections = true;
  	routeParameters.returnRoutes = true;
  	routeParameters.returnStops = true;
  	routeParameters.returnBarriers = true;
	
	// execute route task
	routeTask.solve(
		routeParameters,
		function(routeResults, barriers, message){
			t.ok(true, "...solve returned from server...callback gets called...");					
			var agsRouteResult = routeResults[0];			
			var adapter = new OpenLayers.Format.AgsJsAdapter({});
			try {
				var olRouteResult = adapter.parseAgsResults['routeResult'].apply(adapter, [agsRouteResult]); 
			} catch(e) {
				t.ok(true, "...throws exception when parsing esri.tasks.RouteResult...");
			}				
			
			var directions = olRouteResult.directions;
			t.ok(directions instanceof OpenLayers.Feature.Vector, "...parse esri.tasks.DirectionsFeatureSet...");
			// not testing the integarity of olRouteResult.directions, which will be tested in test_Format_AgsJsAdapter_parseAgsDirectionsFeatureSet
			var route = olRouteResult.route;				
			t.ok(route instanceof OpenLayers.Feature.Vector, "...parse route as esri.Graphic...");
			
			// validating the route name
			var routeName = olRouteResult.routeName;
			t.eq(routeName, "Location 1 - Location 2", "...parse routeName...");
			
			// validation returned stops
			var stops = olRouteResult.stops; 
			t.ok(stops instanceof Array, "...parse returned stops...");
			t.eq(stops.length, 2, "...parse correct number of returned stops...");
			if((stops[0] instanceof OpenLayers.Feature.Vector) && (stops[1] instanceof OpenLayers.Feature.Vector) ) {
				t.ok(true, "...parse individual returned stop...");
			} else {
				t.ok(false, "...parse individual returned stop failed...")
			}									
			// TODO: check barriers
			// TODO: check message
		},
		function(error) {
			t.ok(false, "...solve is not successful...");
		}
	);
	t.wait_result(10);	
	tearDown();
}

function test_Format_AgsJsAdapter_parseAgsRouteResults(t) {
	setUp();
	t.plan(6);		
	
	// initialize routeTask
	var routeTask = new esri.tasks.RouteTask("http://tasks.arcgisonline.com/ArcGIS/rest/services/NetworkAnalysis/ESRI_Route_NA/NAServer/Route");	
	// create routeParameters
	var routeParameters = new esri.tasks.RouteParameters();	
	// stops and barriers
	routeParameters.stops = new esri.tasks.FeatureSet();	
  	routeParameters.stops.features = [];
  	
	var agsSpatialReference = {};
    agsSpatialReference['wkid'] = 4326;		
	
	routeParameters.stops.spatialReference = agsSpatialReference;
	routeParameters.stops.geometryType = "Point";
	
	// 1075 W. State Street, Redlands, CA
	var stopPoint1 = new esri.geometry.Point(-117.19759941101074, 34.05553943775479, new esri.SpatialReference(agsSpatialReference));
	// Loma Linda Medical Center
	var stopPoint2 = new esri.geometry.Point(-117.26450443267822, 34.04945928842325, new esri.SpatialReference(agsSpatialReference));
	
	var stopGraphic1 = new esri.Graphic(stopPoint1, null, null, null);
	var stopGraphic2 = new esri.Graphic(stopPoint2, null, null, null);
	
	routeParameters.stops.features.push(stopGraphic1);	
	routeParameters.stops.features.push(stopGraphic2);
		
	routeParameters.returnDirections = true;
  	routeParameters.returnRoutes = true;
  	routeParameters.returnStops = true;
  	routeParameters.returnBarriers = true;
	
	// execute route task
	routeTask.solve(
		routeParameters,
		function(routeResults, barriers, message){
			t.ok(true, "...solve returned from server...callback gets called...");					
			var agsRouteResults = routeResults;			
			var adapter = new OpenLayers.Format.AgsJsAdapter({});
			try {
				var olRouteResults = adapter.parseAgsResults['routeResults'].apply(adapter, [agsRouteResults, [routeResults, barriers, message]]);
				t.ok(olRouteResults instanceof Array, "...parse array of esri.tasks.RouteResult...");
				t.eq(olRouteResults.length, 3, "...parse correct number of esri.tasks.RouteResult...");
				
			} catch(e) {
				t.ok(false, "...error in parsing esri.tasks.RouteResults..." + e.toString());
			}							
			for(var i=0; i<3; i++) {
				var olRouteResult = olRouteResults[i];
				t.ok(olRouteResult instanceof OpenLayers.Feature.Vector, "...parse individual route, stop and barrier to OpenLayers.Feature.Vector...");
			}																			
		},
		function(error) {
			t.ok(false, "...error function called in solving route..." + error.toString());
		}
	);
	t.wait_result(10);	
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsUnit(t) {
	setUp();
	t.plan(6);
	
	t.eq(adapter.encodeAgsUnit("UNIT_METER"), 9001, "...encode UNIT_METER to 9001...");
	t.eq(adapter.encodeAgsUnit("UNIT_KILOMETER"), 9036, "...encode UNIT_KILOMETER to 9036...");
	t.eq(adapter.encodeAgsUnit("UNIT_FOOT"), 9002, "...encode FOOT to 9002...");
	t.eq(adapter.encodeAgsUnit("UNIT_DEGREE"), 9102, "...encode UNIT_DEGREE to 9102...");
	
	try {
		var agsUnit = adapter.encodeAgsUnit("UNIT_UNSUPPORTED");
	} catch(e) {
		t.ok(true, "...throws exception with unsupported unit string...");
	}
	
	try {
		var agsUnit = adapter.encodeAgsUnit(null);
	} catch(e) {
		t.ok(true, "...throws exception with null input unit string...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsSpatialReference(t) {
	setUp();
	t.plan(5);
	
	var agsSr = adapter.encodeAgsSpatialReference("EPSG:4326");	
	t.ok(agsSr instanceof esri.SpatialReference, "...agsSr instance of esri.SpatialReference...");
	t.eq(agsSr.wkid, 4326, "...encodes 'wkid' 4326 correctly...");
	
	var agsSr1 = adapter.encodeAgsSpatialReference("EPSG:900913");	
	t.eq(agsSr1.wkid, 102113, "...encodes 'wkid' 900913 correctly...");
	
	try {
		var agsSr2 = adapter.encodeAgsSpatialReference("AUTO:1001");
	} catch(e) {
		t.ok(true, "...throws exception if not in 'EPSG' namespace...");
	}
	
	try {
		var agsSr3 = adapter.encodeAgsSpatialReference("EPSG:");
	} catch(e) {
		t.ok(true, "...throws exception if invalid identifier...");
	}
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsGeometry_point(t) {
	setUp();
	t.plan(3);
	
	var olPoint = new OpenLayers.Geometry.Point(34.49, 49.34);
	var olSpatialReference = "EPSG:4326";
	
	var agsPoint = adapter.encodeAgsGeometry['point'].apply(adapter, [olPoint, olSpatialReference]);
	
	t.ok(agsPoint instanceof esri.geometry.Point, "...agsPoint is an instance of esri.geometry.Point...");
	
	var isPass = true;
	if(agsPoint.x !== 34.49 || agsPoint.y !== 49.34) {
		isPass = false;
	}
	t.ok(isPass, "...encodes x, y coordinates from esri.geometry.Point correctly...");
	
	var olPoint1 = [34.49, 49.34];
	
	try {
		var agsPoint1 = adapter.encodeAgsGeometry['point'].apply(adapter, [olPoint1, olSpatialReference]);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid OpenLayers.Geometry.Point...");
	}
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsGeometry_coordinate(t) {
	setUp();
	t.plan(3);
	
	var olPoint = new OpenLayers.Geometry.Point(34.49, 49.34);
	var agsCoordinate = adapter.encodeAgsGeometry['coordinate'].apply(adapter, [olPoint]);
	
	t.ok(agsCoordinate instanceof Array, "...returns an instance of array [x, y]...");
	
	var isPass = true;
	if(agsCoordinate[0] !== 34.49 || agsCoordinate[1] !== 49.34) {
		isPass = false;
	}
	t.ok(isPass, "...enocodes x, y coordinates from esri.geometry.Point...");
	
	var olPoint1 = [34.49, 49.34];
	try {
		var agsCoordinate1 = adapter.encodeAgsGeometry['coordinate'].apply(adapter, [olPoint1]);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid OpenLayers.Geometry.Point...");
	}
	tearDown();
}	

function test_Format_AgsJsAdapter_encodeAgsGeometry_path(t) {
	setUp();
	t.plan(5);
	
	var olPoints = [];
	var olPoint1 = new OpenLayers.Geometry.Point(1, 1);
	var olPoint2 = new OpenLayers.Geometry.Point(2, 2);
	var olPoint3 = new OpenLayers.Geometry.Point(3, 3);
	var olPoint4 = new OpenLayers.Geometry.Point(4, 4);
	var olPoint5 = new OpenLayers.Geometry.Point(5, 5); 
	
	olPoints.push(olPoint1);
	olPoints.push(olPoint2);
	olPoints.push(olPoint3);
	olPoints.push(olPoint4);
	olPoints.push(olPoint5);
	
	var olLineString = new OpenLayers.Geometry.LineString(olPoints);	
	var agsPath = adapter.encodeAgsGeometry['path'].apply(adapter, [olLineString]);
	
	t.ok(agsPath instanceof Array, "...returns an instance of array of [x, y]...");
	t.eq(5, agsPath.length, "...encodes points from OpenLayers.Geometry.LineString...");
	
	var isPass = 0;
	for(var i=0; i<agsPath.length; i++) {
		if(agsPath[i][0] === olPoints[i].x && agsPath[i][1] === olPoints[i].y) {
			isPass++;
		} else {
			isPass = _error;
			break;
		}
	}
	t.eq(agsPath.length, olPoints.length, "...encodes point from OpenLayers.Geometry.LineString...");
	t.eq(isPass, agsPath.length, "...encodes point from OpenLayers.Geometry.LineString...");
	
	var olLineString1 = [];
	try {
		var agsPath1 = adapter.encodeAgsGeometry['path'].apply(adapter, [olLineString1]);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid instanceof OpenLayers.Geometry.LineString...");
	}
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsGeometry_linearring(t) {
	setUp();
	t.plan(5);
	
	var olPoints = [];
	var olPoint1 = new OpenLayers.Geometry.Point(1, 1);
	var olPoint2 = new OpenLayers.Geometry.Point(2, 2);
	var olPoint3 = new OpenLayers.Geometry.Point(3, 3);
	var olPoint4 = new OpenLayers.Geometry.Point(4, 4);
	var olPoint5 = new OpenLayers.Geometry.Point(5, 5); 
	var olPoint6 = new OpenLayers.Geometry.Point(1, 1);
	
	olPoints.push(olPoint1);
	olPoints.push(olPoint2);
	olPoints.push(olPoint3);
	olPoints.push(olPoint4);
	olPoints.push(olPoint5);
	olPoints.push(olPoint6);
	
	var olLinearRing = new OpenLayers.Geometry.LinearRing(olPoints);	
	var agsLinearRing = adapter.encodeAgsGeometry['linearring'].apply(adapter, [olLinearRing]);
	
	t.ok(agsLinearRing instanceof Array, "...returns an instance of array of [x, y]...");
	t.eq(6, agsLinearRing.length, "...encodes points from OpenLayers.Geometry.LinearRing...");
	
	var isPass = 0;
	for(var i=0; i<agsLinearRing.length; i++) {
		if(agsLinearRing[i][0] === olPoints[i].x && agsLinearRing[i][1] === olPoints[i].y) {
			isPass++;
		} else {
			isPass = _error;
			break;
		}
	}
	t.eq(olPoints.length, agsLinearRing.length, "...encodes every point from OpenLayers.Geometry.LinearRing...");
	t.eq(isPass, agsLinearRing.length, "...encodes every point from OpenLayers.Geometry.LinearRing...");
	
	var olLinearRing1 = [];
	try {
		var agsLinearRing1 = adapter.encodeAgsGeometry['linearring'].apply(adapter, [olLinearRing1]);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid instanceof OpenLayers.Geometry.LinearRing...");
	}
	
	var olPoints2 = [];
	var olPoint12 = new OpenLayers.Geometry.Point(1, 1);
	var olPoint22 = new OpenLayers.Geometry.Point(2, 2);
	var olPoint32 = new OpenLayers.Geometry.Point(3, 3);
	var olPoint42 = new OpenLayers.Geometry.Point(4, 4);
	var olPoint52 = new OpenLayers.Geometry.Point(5, 5); 
	var olPoint62 = new OpenLayers.Geometry.Point(1, 8);
	
	olPoints2.push(olPoint12);
	olPoints2.push(olPoint22);
	olPoints2.push(olPoint32);
	olPoints2.push(olPoint42);
	olPoints2.push(olPoint52);
	olPoints2.push(olPoint62);
	
	// smart OpenLayers.Geometry.LinearRing can automatically fix itself when it's not a closed ring
	var olLinearRing2 = new OpenLayers.Geometry.LinearRing(olPoints2);
	olLinearRing2.components[6].y = 8;
	try {
		var agsLinearRing2 = adapter.encodeAgsGeometry['linearring'].apply(adapter, [olLinearRing2]);
	} catch(e) {
		//t.ok(true, "...throws exception when input is not a closed OpenLayers.Geometry.LinearRing...");
	}
	
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsGeometry_polyline(t) {
	setUp();
	t.plan(3);
	
	var olPoints1 = [];
	var olPoint11 = new OpenLayers.Geometry.Point(1, 1);
	var olPoint12 = new OpenLayers.Geometry.Point(2, 2);
	var olPoint13 = new OpenLayers.Geometry.Point(3, 3);
	var olPoint14 = new OpenLayers.Geometry.Point(4, 4);
	var olPoint15 = new OpenLayers.Geometry.Point(5, 5); 
	
	olPoints1.push(olPoint11);
	olPoints1.push(olPoint12);
	olPoints1.push(olPoint13);
	olPoints1.push(olPoint14);
	olPoints1.push(olPoint15);
	
	var olPoints2 = [];
	var olPoint21 = new OpenLayers.Geometry.Point(-1, -1);
	var olPoint22 = new OpenLayers.Geometry.Point(-2, -2);
	var olPoint23 = new OpenLayers.Geometry.Point(-3, -3);
	var olPoint24 = new OpenLayers.Geometry.Point(-4, -4);
	var olPoint25 = new OpenLayers.Geometry.Point(-5, -5); 
	
	olPoints2.push(olPoint21);
	olPoints2.push(olPoint22);
	olPoints2.push(olPoint23);
	olPoints2.push(olPoint24);
	olPoints2.push(olPoint25);
	
	var olLineString1 = new OpenLayers.Geometry.LineString(olPoints1);
	var olLineString2 = new OpenLayers.Geometry.LineString(olPoints2);
	var olMultiLineString = new OpenLayers.Geometry.MultiLineString([olLineString1, olLineString2]);
	var olSpatialReference = "EPSG:4326";
	
	var agsPolyline = adapter.encodeAgsGeometry['polyline'].apply(adapter, [olMultiLineString, olSpatialReference]);
	t.ok(agsPolyline instanceof esri.geometry.Polyline, "...returns an instance of esri.geometry.Polyline...");
	
	var isPass = true;
	if(agsPolyline.paths.length !== 2) {
		isPass = false;
	}
	if(agsPolyline.paths[0].length !== 5) {
		isPass = false;
	}
	if(agsPolyline.paths[1].length !== 5) {
		isPass = false;
	}
	t.ok(isPass, "...encodes paths and points from OpenLayers.Geometry.MultiLineString...");
	
	var olMultiLineString1 = {};
	try {
		var agsPolyline1 = adapter.encodeAgsGeometry['polyline'].apply(adapter, [olMultiLineString1, olSpatialReference]);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid instanceof OpenLayers.Geometry.MultiLineString...");
	}
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsGeometry_polygon(t) {
	setUp();
	t.plan(3);
	
	var olPoints1 = [];
	var olPoint11 = new OpenLayers.Geometry.Point(1, 1);
	var olPoint12 = new OpenLayers.Geometry.Point(2, 2);
	var olPoint13 = new OpenLayers.Geometry.Point(3, 3);
	var olPoint14 = new OpenLayers.Geometry.Point(4, 4);
	var olPoint15 = new OpenLayers.Geometry.Point(5, 5);
	var olPoint16 = new OpenLayers.Geometry.Point(1, 1); 
	
	olPoints1.push(olPoint11);
	olPoints1.push(olPoint12);
	olPoints1.push(olPoint13);
	olPoints1.push(olPoint14);
	olPoints1.push(olPoint15);
	olPoints1.push(olPoint16);
	
	var olPoints2 = [];
	var olPoint21 = new OpenLayers.Geometry.Point(-1, -1);
	var olPoint22 = new OpenLayers.Geometry.Point(-2, -2);
	var olPoint23 = new OpenLayers.Geometry.Point(-3, -3);
	var olPoint24 = new OpenLayers.Geometry.Point(-4, -4);
	var olPoint25 = new OpenLayers.Geometry.Point(-5, -5); 
	var olPoint26 = new OpenLayers.Geometry.Point(-1, -1); 
	
	olPoints2.push(olPoint21);
	olPoints2.push(olPoint22);
	olPoints2.push(olPoint23);
	olPoints2.push(olPoint24);
	olPoints2.push(olPoint25);
	olPoints2.push(olPoint26);
	
	var olLinearRing1 = new OpenLayers.Geometry.LinearRing(olPoints1);
	var olLinearRing2 = new OpenLayers.Geometry.LinearRing(olPoints2);
	var olPolygon = new OpenLayers.Geometry.Polygon([olLinearRing1, olLinearRing1]);
	var olSpatialReference = "EPSG:4326";
	
	var agsPolygon = adapter.encodeAgsGeometry['polygon'].apply(adapter, [olPolygon, olSpatialReference]);
	t.ok(agsPolygon instanceof esri.geometry.Polygon, "...returns an instance of esri.geometry.Polygon...");
	
	var isPass = true;
	if(agsPolygon.rings.length !== 2) {
		isPass = false;
	}
	if(agsPolygon.rings[0].length !== 6) {
		isPass = false;
	}
	if(agsPolygon.rings[1].length !== 6) {
		isPass = false;
	}
	t.ok(isPass, "...encodes rings and points from OpenLayers.Geometry.Polygon...");
	
	var olPolygon1 = {};
	try {
		var agsPolygon1 = adapter.encodeAgsGeometry['polygon'].apply(adapter, [olPolygon1, olSpatialReference]);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid instanceof OpenLayers.Geometry.Polygon...");
	}
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsGeometry_extent(t) {
	setUp();
	t.plan(3);
	
	var olBounds = new OpenLayers.Bounds(-180, -90, 180, 90);
	var olSpatialReference = "EPSG:4326";
	
	var agsExtent = adapter.encodeAgsGeometry['extent'].apply(adapter, [olBounds, olSpatialReference]);
	t.ok(agsExtent instanceof esri.geometry.Extent, "...returns an instance of esri.geometry.Extent...");
	
	var isPass = true;
	if(agsExtent.xmin !== -180 || agsExtent.xmax !== 180 || agsExtent.ymin !== -90  || agsExtent.ymax !== 90) {
		isPass = false;
	}	
	t.ok(isPass, "...encodes xmin, ymin, xmax, ymax from OpenLayers.Bounds...");
	
	var olBounds1 = {};
	try {
		var agsExtent1 = adapter.encodeAgsGeometry['extent'].apply(adapter, [olBounds1, olSpatialReference]);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid instanceof OpenLayers.Bounds...");
	}
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsSymbol_SimpleMarkerSymbol(t) {
	setUp();	
	t.plan(11);
	
	var olStyle = {
		'pointRadius': 8,
		'fillColor': "#000000",
		'fillOpacity': 0.75,
		'graphicXOffset': 34,
		'graphicYOffset': 49,
		'strokeDashstyle': "dashdot",
		'strokeWidth': 2,
		'strokeColor': "#000000",
		'strokeOpacity': 0.49
	};
	
	var agsSimpleMarkerSymbol = adapter.encodeAgsSymbol['SimpleMarkerSymbol'].apply(adapter, [olStyle]);
	
    t.ok(agsSimpleMarkerSymbol instanceof esri.symbol.SimpleMarkerSymbol, "...agsSimpleMarkerSymbol is an instance of esri.symbol.SimpleMarkerSymbol...");
	t.eq(agsSimpleMarkerSymbol.size, 8, "...encodes pointRadius to size correctly...");
	t.eq(agsSimpleMarkerSymbol.color.toHex(), "#000000", "...encodes fillColor to color correctly...");
	t.eq(agsSimpleMarkerSymbol.color.toRgba()[3], 0.75, "...encodes fillOpacity to opacity correctly...");
	t.eq(agsSimpleMarkerSymbol.xoffset, 34, "...encodes graphicXOffset to xoffset correctly...");
	t.eq(agsSimpleMarkerSymbol.yoffset, 49, "...encodes graphicYOffset to yoffset correctly...");
	t.eq(agsSimpleMarkerSymbol.outline.style, "STYLE_DASHDOT", "...encodes strokeDashstyle to outline style correctly...");
	t.eq(agsSimpleMarkerSymbol.outline.color.toHex(), "#000000", "...encodes strokeColor to outline color correctly...");
	t.eq(agsSimpleMarkerSymbol.outline.color.toRgba()[3], 0.49, "...encodes strokeOpacity to outline transparency correctly...");
	t.eq(agsSimpleMarkerSymbol.outline.width, 2, "...encodes strokeWidth to outline width correctly...");
	
	var olStyle2 = null;
	
	try {
		var agsSimpleMarkerSymbol2 = adapter.encodeAgsSymbol['SimpleMarkerSymbol'].apply(adapter, [olStyle2]);
	} catch(e) {
		t.ok(true, "...throws exception if input is invalid OpenLayers style...");
	}
	
	tearDown();	
}

function test_Format_AgsJsAdapter_encodeAgsSymbol_PictureMarkerSymbol(t) {
	setUp();	
	t.plan(7);
	
	var olStyle = {
		'pointRadius': 8,
		'externalGraphic': "http://www.google.com/marker.png",
		'graphicXOffset': 34,
		'graphicYOffset': 49,
		'graphicWidth': 34,
		'graphicHeight': 49,
	};
	
	var agsPictureMarkerSymbol = adapter.encodeAgsSymbol['PictureMarkerSymbol'].apply(adapter, [olStyle]);
	
    t.ok(agsPictureMarkerSymbol instanceof esri.symbol.PictureMarkerSymbol, "...agsPictureMarkerSymbol is an instance of esri.symbol.PictureMarkerSymbol...");
	t.eq(agsPictureMarkerSymbol.size, 8, "...encodes pointRadius to size correctly...");
	t.eq(agsPictureMarkerSymbol.xoffset, 34, "...encodes graphicXOffset to xoffset correctly...");
	t.eq(agsPictureMarkerSymbol.yoffset, 49, "...encodes graphicYOffset to yoffset correctly...");
	t.eq(agsPictureMarkerSymbol.width, 34, "...encodes graphicWidth to width style correctly...");
	t.eq(agsPictureMarkerSymbol.height, 49, "...encodes graphicHeight to height correctly...");
	
	var olStyle2 = null;
	
	try {
		var agsPictureMarkerSymbol2 = adapter.encodeAgsSymbol['PictureMarkerSymbol'].apply(adapter, [olStyle2]);
	} catch(e) {
		t.ok(true, "...throws exception if input is invalid OpenLayers style...");
	}
	
	tearDown();	
}

function test_Format_AgsJsAdapter_encodeAgsSymbol_SimpleLineSymbol(t) {
	setUp();	
	t.plan(6);
	
	var olStyle = {		
		'strokeDashstyle': "dashdot",
		'strokeWidth': 2,
		'strokeColor': "#000000",
		'strokeOpacity': 0.49
	};
	
	var agsSimpleLineSymbol = adapter.encodeAgsSymbol['SimpleLineSymbol'].apply(adapter, [olStyle]);
	
    t.ok(agsSimpleLineSymbol instanceof esri.symbol.SimpleLineSymbol, "...agsSimpleLineSymbol is an instance of esri.symbol.SimpleLineSymbol...");
	t.eq(agsSimpleLineSymbol.style, "STYLE_DASHDOT", "...encodes strokeDashstyle to outline style correctly...");
	t.eq(agsSimpleLineSymbol.color.toHex(), "#000000", "...encodes strokeColor to outline color correctly...");
	t.eq(agsSimpleLineSymbol.color.toRgba()[3], 0.49, "...encodes strokeOpacity to outline transparency correctly...");
	t.eq(agsSimpleLineSymbol.width, 2, "...encodes strokeWidth to outline width correctly...");
	
	var olStyle2 = null;
	
	try {
		var agsSimpleLineSymbol2 = adapter.encodeAgsSymbol['SimpleLineSymbol'].apply(adapter, [olStyle2]);
	} catch(e) {
		t.ok(true, "...throws exception if input is invalid OpenLayers style...");
	}
	
	tearDown();	
}

function test_Format_AgsJsAdapter_encodeAgsSymbol_SimpleFillSymbol(t) {
	setUp();	
	t.plan(8);
	
	var olStyle = {
		'pointRadius': 8,
		'fillColor': "#000000",
		'fillOpacity': 0.75,
		'graphicXOffset': 34,
		'graphicYOffset': 49,
		'strokeDashstyle': "dashdot",
		'strokeWidth': 2,
		'strokeColor': "#000000",
		'strokeOpacity': 0.49
	};
	
	var agsSimpleFillSymbol = adapter.encodeAgsSymbol['SimpleFillSymbol'].apply(adapter, [olStyle]);
	
    t.ok(agsSimpleFillSymbol instanceof esri.symbol.SimpleFillSymbol, "...agsSimpleFillSymbol is an instance of esri.symbol.SimpleFillSymbol...");
	t.eq(agsSimpleFillSymbol.color.toHex(), "#000000", "...encodes fillColor to color correctly...");
	t.eq(agsSimpleFillSymbol.color.toRgba()[3], 0.75, "...encodes fillOpacity to opacity correctly...");
	t.eq(agsSimpleFillSymbol.outline.style, "STYLE_DASHDOT", "...encodes strokeDashstyle to outline style correctly...");
	t.eq(agsSimpleFillSymbol.outline.color.toHex(), "#000000", "...encodes strokeColor to outline color correctly...");
	t.eq(agsSimpleFillSymbol.outline.color.toRgba()[3], 0.49, "...encodes strokeOpacity to outline transparency correctly...");
	t.eq(agsSimpleFillSymbol.outline.width, 2, "...encodes strokeWidth to outline width correctly...");
	
	var olStyle2 = null;
	
	try {
		var agsSimpleFillSymbol2 = adapter.encodeAgsSymbol['SimpleFillSymbol'].apply(adapter, [olStyle2]);
	} catch(e) {
		t.ok(true, "...throws exception if input is invalid OpenLayers style...");
	}
	
	tearDown();	
}

function test_Format_AgsJsAdapter_encodeAgsGraphic(t) {
	setUp();
	t.plan(5);
	
	var olPoint = new OpenLayers.Geometry.Point(34.49, 49.34);
	var olSpatialReference = "EPSG:4326";
	var attributes = {};
	attributes['k1'] = "v1";
	attributes['k2'] = "v2";
	attributes['infoTemplateTitle'] = "title";
	attributes['infoTemplateContent'] = "<html>content</html>";
	
	var olFeature = new OpenLayers.Feature.Vector(olPoint, attributes);
	olFeature.style = OpenLayers.Feature.Vector.style['default'];
	var agsGraphic = adapter.encodeAgsGraphic.apply(adapter, [olFeature, olSpatialReference]); 
	
	t.ok(agsGraphic instanceof esri.Graphic, "...agsGraphic is an instance of esri.Graphic...");
	t.ok(agsGraphic.geometry instanceof esri.geometry.Point, "...encodes geometry of esri.Graphic correctly...");
	
	var isPass = true;
	if(agsGraphic.attributes['k1'] !== "v1" || agsGraphic.attributes['k2'] !== "v2") {
		isPass = false;
	}
	t.ok(isPass, "...encodes attributes of esri.Graphic...");
	
	isPass = true;
	if(agsGraphic.infoTemplate.title !== "title" || agsGraphic.infoTemplate.content !== "<html>content</html>") {
		isPass = false;
	}
	t.ok(isPass, "...encodes infoTemplate of esri.Graphic correctly...");
	t.ok(agsGraphic.symbol instanceof esri.symbol.SimpleMarkerSymbol, "...eencodes symbol of esri.Graphic correctly...");
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsGraphics(t) {
	setUp();
	t.plan(3);
	
	var olPoint = new OpenLayers.Geometry.Point(34.49, 49.34);
	var olSpatialReference = "EPSG:4326";
	var attributes = {};
	attributes['k1'] = "v1";
	attributes['k2'] = "v2";
	attributes['infoTemplateTitle'] = "title";
	attributes['infoTemplateContent'] = "<html>content</html>";
	
	var olFeature = new OpenLayers.Feature.Vector(olPoint, attributes);
	
	var olFeatures = [];
	for(var i=0; i<5; i++) {
		var newOlFeature = olFeature.clone();
		olFeatures.push(newOlFeature);	
	}
	
	var agsGraphics = adapter.encodeAgsGraphics.apply(adapter, [olFeatures, olSpatialReference]);
	
	t.ok(agsGraphics instanceof Array, "...returns an instance of array of esri.Graphic...");
	
	var isPass = true;
	for(var i=0; i<5; i++) {
		if(!(agsGraphics[i] instanceof esri.Graphic)) {
			isPass = false;
		}
	}
	t.ok(isPass, "...encodes every OpenLayers.Feature.Vector in the array...");

	var olFeatures1 = {};
	try {
		var agsGraphics1 = adapter.encodeAgsGraphics.apply(adapter, [olFeatures1, olSpatialReference]);
	} catch(e) {
		t.ok(true, "...throws exception when input is not an array of OpenLayers.Feature.Vector...");
	}
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsFindParameters(t) {
	setUp();	
	t.plan(7);
	
	var findParameters = {
		'contains': null,
		'outSpatialReference': "EPSG:900913",
		'returnGeometry': null,
		'layerIds': [0,1,2],
		'searchFields': ["NAME"],
		'searchText': "August"
	}
	
	var agsFindParameters = adapter.encodeAgsFindParameters(findParameters);
	
	t.ok(agsFindParameters instanceof esri.tasks.FindParameters, "...returns instance of esri.tasks.FindParameters...");
	t.eq(agsFindParameters['contains'], false, "...encodes parameter 'contains'...");
	t.eq(agsFindParameters['outSpatialReference'].wkid, 102113, "...encodes parameter 'outSpatialReference'...");
	t.eq(agsFindParameters['returnGeometry'], true, "...encodes parameter 'returnGeometry'...");
	t.eq(agsFindParameters['layerIds'], [0,1,2], "...encodes parameter 'layerIds'...");
	t.eq(agsFindParameters['searchFields'], ["NAME"], "...encodes parameter 'searchFields'...");
	t.eq(agsFindParameters['searchText'], "August", "...encodes parameter 'searchText'...");
	
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsIdentifyParameters(t) {
	setUp();	
	t.plan(17);
	
	var identifyParameters = {
		'dpi': 90,
		'geometry': new OpenLayers.Geometry.Point(34.49, 49.34),
		'height': 480,
		'layerIds': [0,1,2],
		'layerOption': "visible",
		'mapExtent': new OpenLayers.Bounds(-180, -90, 180, 90),
		'returnGeometry': false,
		'spatialReference': "EPSG:900913",
		'tolerance': 1,
		'width': 640
	}
	
	var agsIdentifyParameters = adapter.encodeAgsIdentifyParameters(identifyParameters);
	
	t.ok(agsIdentifyParameters instanceof esri.tasks.IdentifyParameters, "...returns instance of esri.tasks.IdentifyParameters...");
	t.eq(agsIdentifyParameters['dpi'], 90, "...encodes parameter 'dpi'...");
	t.eq(agsIdentifyParameters['geometry'].x, 34.49, "...encodes parameter 'geometry' from OpenLayers.Geometry.Geometry...");
	t.eq(agsIdentifyParameters['geometry'].y, 49.34, "...encodes parameter 'geometry' from OpenLayers.Geometry.Geometry...");
	t.eq(agsIdentifyParameters['height'], 480, "...encodes parameter 'height'...");
	t.eq(agsIdentifyParameters['layerIds'], [0,1,2], "...encodes parameter 'layerIds'...");
	t.eq(agsIdentifyParameters['layerOption'], "visible", "...encodes parameter 'layerOption'...");
	
	t.ok(agsIdentifyParameters['mapExtent'] instanceof esri.geometry.Extent, "...encodes parameter 'mapExtent'...");
	var isPass = false;
	if(agsIdentifyParameters['mapExtent'].xmin === -180 && agsIdentifyParameters['mapExtent'].ymin === -90 && agsIdentifyParameters['mapExtent'].xmax === 180 && agsIdentifyParameters['mapExtent'].ymax === 90) {
		isPass = true
	}
	t.ok(isPass, "...encodes parameter 'mapExtent'...");
	t.eq(agsIdentifyParameters['returnGeometry'], false, "...encodes parameter 'returnGeometry'...");
	t.eq(agsIdentifyParameters['spatialReference'].wkid, 102113, "...encodes parameter 'spatialReference'...");
	t.eq(agsIdentifyParameters['tolerance'], 1, "...encodes parameter 'tolerance'...");
	t.eq(agsIdentifyParameters['width'], 640, "...encodes parameter 'width'...");
		
	identifyParameters['geometry'] = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(34.49, 49.34));
	identifyParameters['mapExtent'] = new esri.geometry.Extent(-180, -90, 180, 90, agsIdentifyParameters['spatialReference']);
	identifyParameters['spatialReference'] = agsIdentifyParameters['spatialReference'];
	
	agsIdentifyParameters = adapter.encodeAgsIdentifyParameters(identifyParameters);
	t.eq(agsIdentifyParameters['geometry'].x, 34.49, "...encodes parameter 'geometry' from OpenLayers.Feature.Vector...");
	t.eq(agsIdentifyParameters['geometry'].y, 49.34, "...encodes parameter 'geometry' from OpenLayers.Feature.Vector...");
	isPass = false;
	if(agsIdentifyParameters['mapExtent'].xmin === -180 && agsIdentifyParameters['mapExtent'].ymin === -90 && agsIdentifyParameters['mapExtent'].xmax === 180 && agsIdentifyParameters['mapExtent'].ymax === 90) {
		isPass = true
	}
	t.ok(isPass, "...encodes parameter 'mapExtent' from esri.geometry.Extent...");
	t.eq(agsIdentifyParameters['spatialReference'].wkid, 102113, "...encodes parameter 'spatialReference' from esri.SpatialReference...");
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsBufferParameters(t) {
	setUp();	
	t.plan(12);
	
	var olPoint = new OpenLayers.Geometry.Point(34.49, 49.34);
	var olFeature = new OpenLayers.Feature.Vector(olPoint);
	
	var bufferParameters = {
		'bufferSpatialReference': "EPSG:900913",
		'distances': [49,50,51],
		'features': [olPoint, olFeature], 
		'outSpatialReference': "EPSG:900913",
		'unionResults': true,
		'unit': "UNIT_METER"
	}
	
	var agsBufferParameters = adapter.encodeAgsBufferParameters(bufferParameters);
	
	t.ok(agsBufferParameters instanceof esri.tasks.BufferParameters, "...returns instance of esri.tasks.BufferParameters...");
	t.ok(agsBufferParameters['bufferSpatialReference'] instanceof esri.SpatialReference, "...encodes parameter 'bufferSpatialReference'...");
	t.eq(agsBufferParameters['bufferSpatialReference'].wkid, 102113, "...encodes parameter 'contains'...");
	t.ok(agsBufferParameters['outSpatialReference'] instanceof esri.SpatialReference, "...encodes parameter 'outSpatialReference'...");
	t.eq(agsBufferParameters['outSpatialReference'].wkid, 102113, "...encodes parameter 'outSpatialReference'...");
	
	t.ok(agsBufferParameters['features'][0] instanceof esri.Graphic, "...encodes parameter 'features'...");
	t.ok(agsBufferParameters['features'][1] instanceof esri.Graphic, "...encodes parameter 'features'...");
	
	var isPass = false;
	if(agsBufferParameters['features'][0].geometry.x === 34.49 && agsBufferParameters['features'][0].geometry.y === 49.34) {
		isPass = true;
	}
	t.ok(isPass, "...encodes parameter 'features'...");
	
	isPass = false;
	if(agsBufferParameters['features'][1].geometry.x === 34.49 && agsBufferParameters['features'][1].geometry.y === 49.34) {
		isPass = true;
	}
	t.ok(isPass, "...encodes parameter 'features'...");
	
	t.eq(agsBufferParameters['distances'], [49,50,51], "...encodes parameter 'distances'...");
	t.eq(agsBufferParameters['unionResults'], true, "...encodes parameter 'unionResults'...");
	t.eq(agsBufferParameters['unit'], 9001, "...encodes parameter 'unit'...");
	
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsQuery(t) {
	setUp();	
	t.plan(8);
	
	var olPoint = new OpenLayers.Geometry.Point(34.49, 49.34);
	var olFeature = new OpenLayers.Feature.Vector(olPoint);
	
	var query = {
		'geometry': olPoint,
		'outFields': ["NAME", "TITLE"],
		'outSpatialReference': "EPSG:900913",
		'returnGeometry': false,
		'text': "text",
		'where': "where"
	}
	
	var agsQuery = adapter.encodeAgsQuery(query);
	
	t.ok(agsQuery instanceof esri.tasks.Query, "...returns instance of esri.tasks.query...");
	t.ok(agsQuery['geometry'] instanceof esri.geometry.Point, "...encodes parameter 'geometry'...");
	t.eq(agsQuery['geometry'].x, 34.49, "...encodes parameter 'geometry'...");
	t.eq(agsQuery['geometry'].y, 49.34, "...encodes parameter 'geometry'...");
	
	t.eq(agsQuery['outSpatialReference'].wkid, 102113, "...encodes parameter 'outSpatialReference'...");
		
	t.eq(agsQuery['returnGeometry'], false, "...encodes parameter 'returnGeometry'...");
	t.eq(agsQuery['text'], "text", "...encodes parameter 'text'...");
	t.eq(agsQuery['where'], "where", "...encodes parameter 'where'...");
	
	tearDown();
}

function test_Format_AgsJsAdapter_encodeAgsLocation(t) {
	setUp();	
	t.plan(3);
	
	var olPoint = new OpenLayers.Geometry.Point(34.49, 49.34);
	var olFeature = new OpenLayers.Feature.Vector(olPoint);
	
	var agsLocation1 = adapter.encodeAgsLocation(olPoint);
	var agsLocation2 = adapter.encodeAgsLocation(olFeature);
	
	t.ok(agsLocation1 instanceof esri.geometry.Point, "...encodes OpenLayers.Geometry.Point to agsLocation correctly...");
	t.ok(agsLocation2 instanceof esri.geometry.Point, "...encodes OpenLayers.Feature.Vector to agsLocation correctly...");
	
	try {
		var agsLocation3 = adapter.encodeAgsLocation(null);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid...");
	}
	tearDown();	
}

function test_Format_AgsJsAdapter_encodeAgsFeatureSet(t){
	setUp();	
	t.plan(6);
	
	var olPoint = new OpenLayers.Geometry.Point(34.49, 49.34);
	var olFeature1 = new OpenLayers.Feature.Vector(olPoint);
	var olFeature2 = new OpenLayers.Feature.Vector(olPoint);
	var olFeature3 = new OpenLayers.Feature.Vector(olPoint);
	
	var olFeatures = [olFeature1, olFeature2, olFeature3];
	
	var olSpatialReference = "EPSG:4326";
	
	var options = {
		'displayFieldName': "field1,field2,field3",
		'fieldAliases': {
			'name1': "alias1",
			'name2': "alias2",
			'name3': "alias3"
		},
		'geometryType': "esri.geometry.Point",
	}
	
	var agsFeatureSet = adapter.encodeAgsFeatureSet(olFeatures, olSpatialReference, options);
	
	t.ok(agsFeatureSet instanceof esri.tasks.FeatureSet, "...agsFeatureSet is an instance of esri.tasks.FeatureSet...");
	t.ok(agsFeatureSet.spatialReference instanceof esri.SpatialReference, "...agsFeatureSet.spatialReference is an instance of esri.SpatialReference...");
	t.eq(agsFeatureSet.geometryType, "esri.geometry.Point", "...encodes options.geometryType to FeatureSet.geometryType correctly...");
	t.eq(agsFeatureSet.displayFieldName, "field1,field2,field3", "...encodes options.displayFieldName to FeatureSet.displayFieldName correctly...");
	var isPass = false;
	if(agsFeatureSet.fieldAliases['name1'] == "alias1" && agsFeatureSet.fieldAliases['name2'] == "alias2" && agsFeatureSet.fieldAliases['name3'] == "alias3") {
		isPass = true;	
	}
	t.ok(isPass, "...encodes options.fieldAliases to FeatureSet.fieldAliases correctly...");
	try{
		adapter.encodeAgsFeatureSet(null);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid...");
	}
	
	tearDown();
}

/*
function test_Format_AgsJsAdapter_encodeAgsGeometrySpatialRelationship(t){

}  
*/

function test_Format_AgsJsAdapter_encodeAgsRouteParameters(t) {
	
	setUp();	
	t.plan(12);
	
	// create a fake routeParameters object to encode into esri.tasks.RouteParameters
	var routeParameters = {};	
	
	// TODO: 'accumulateAttributes'] - String
	
	var olPoint = new OpenLayers.Geometry.Point(34.49, 49.34);
	var olFeature1 = new OpenLayers.Feature.Vector(olPoint);
	var olFeature2 = new OpenLayers.Feature.Vector(olPoint);
	var olFeature3 = new OpenLayers.Feature.Vector(olPoint);
	var olFeatures = [olFeature1, olFeature2, olFeature3];	
	routeParameters['barriers'] = olFeatures;
	
	// TODO: 'directionsLanguage' - String
	// TODO: 'directionsLengthUnits' - String
	// TODO: 'directionsTimeAttribute' - String
	// TODO: 'doNotLocateOnRestrictedElements' - boolean
	// TODO: 'findBestSequence' - boolean
	// TODO: 'ignoreInvalidLocations' - boolean
	// TODO: 'impedanceAttribute' - String
	// TODO: 'outputGeometryPrecision' - Number
	// TODO: 'outputGeometryPrecisionUnits' - String
	// TODO: 'outputLines' - String 
	
	routeParameters['outSpatialReference'] = "EPSG:4326";
	
	// TODO: 'preserveFirstStop' - boolean
	// TODO: 'preserveLastStrop' - boolean
	// TODO: 'restrictionAttributes' - String
	
	routeParameters['returnBarriers'] = false;				
	routeParameters['returnDirections'] = false;				
	routeParameters['returnRoutes'] = false;				
	routeParameters['returnStops'] = false;
	
	routeParameters['stops'] = [];
	routeParameters['stops'].push(olPoint);
	routeParameters['stops'].push(olFeature1);
	routeParameters['stops'].push(adapter.encodeAgsGraphic(olFeature2, "EPSG:4326"));
	
	// TODO: 'useHierarchy' - Boolean
	// TODO: 'useTimeWindows' - Boolean
	
	var agsRouteParameters = adapter.encodeAgsRouteParameters(routeParameters);
	
	t.ok(agsRouteParameters instanceof esri.tasks.RouteParameters, "...agsRouteParameters is an instance of esri.tasks.RouteParameters...");
	if(agsRouteParameters['barriers'] instanceof esri.tasks.FeatureSet && agsRouteParameters['barriers'].features.length == 3) {
		t.ok(true, "...encode esri.tasks.RouteParameters['barriers']...");	
	} else {
		t.ok(false, "...encode esri.tasks.RouteParameters['barriers'] failed...");
	}	
	t.eq(agsRouteParameters['outSpatialReference'].wkid, 4326, "...encode esri.tasks.RouteParameters['outSpatialReference']...");
	t.eq(agsRouteParameters['returnBarriers'], false, "...encode esri.tasks.RouteParameters['returnBarriers']...");
	t.eq(agsRouteParameters['returnDirections'], false, "...encode esri.tasks.RouteParameters['returnDirections']...");
	t.eq(agsRouteParameters['returnRoutes'], false, "...encode esri.tasks.RouteParameters['returnRoutes']...");
	t.eq(agsRouteParameters['returnStops'], false, "...encode esri.tasks.RouteParameters['returnStops']...");
	
	t.ok(agsRouteParameters['stops'] instanceof esri.tasks.FeatureSet, "...agsRouteParameters['stops'] is an instance of esri.tasks.FeatureSet...");
	
	for(var i=0; i<agsRouteParameters['stops'].features.length; i++) {
		var stop = agsRouteParameters['stops'].features[i];
		if(stop instanceof esri.Graphic && stop.geometry.x == 34.49 && stop.geometry.y == 49.34) {
			t.ok(true, "...encode individual route stop...");
		} else {
			t.ok(false, "...encode individual route stop failed");
		}
	}
		
	try{
		adapter.encodeAgsRouteParameters(null);
	} catch(e) {
		t.ok(true, "...throws exception when input is invalid...");
	}	
	tearDown();	
}