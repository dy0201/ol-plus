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
							
	var center_mercator = OpenLayers.Layer.SphericalMercator.forwardMercator(lon, lat);
	center_mercator_x = center_mercator.lon;
	center_mercator_y = center_mercator.lat;
	
	var zoom = 7;
	
	var options = 	{		                
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

function test_Control_AgsLocator_initialize(t) {
	setUp();
	t.plan(12);
	
	var agsLocator = new OpenLayers.Control.AgsLocator(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer",
		null,
		[],
		{}
	);
	map.addControl(agsLocator);
	agsLocator.activate();
	
	t.eq(typeof agsLocator._resultsParser['parser'], "function", "...initialize _resultsParser['parser'] correctly...");
	t.ok(agsLocator._resultsParser['context'] instanceof OpenLayers.Format.AgsJsAdapter, "...initialize _resultsParser['context'] correctly...");	
	t.ok(agsLocator.selectControl instanceof OpenLayers.Control.SelectFeature, "...initialize select control correctly...");
	t.ok(agsLocator.drawControl instanceof OpenLayers.Control.DrawFeature, "...initialize draw control correctly...");
	t.eq(agsLocator.mode, "select", "...initial mode is 'select'...");
	
	this.taskParameters = {
			'address': 		{},
			'distance':		50, // in 'meters'
			'outFields':	[],	
			'location':		null			
		};	
	
	t.eq(agsLocator.taskParameters['address'], {}, "...default 'address' value is correct...");
	t.eq(agsLocator.taskParameters['distance'], 50, "...default 'distance' value is correct...");
	t.eq(agsLocator.taskParameters['outFields'], [], "...default 'outFields' value is correct...");
	t.eq(agsLocator.taskParameters['location'], null, "...default 'location' value is correct...");
	
	t.ok(agsLocator.layer instanceof OpenLayers.Layer.Vector, "...initialize an internal vector layer if not passed in as parameter...");
	
	var agsLocator2 = new OpenLayers.Control.AgsLocator(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer",
		vectorLayer,
		[],
		{}
	);
	map.addControl(agsLocator2);
	t.ok(agsLocator2.layer instanceof OpenLayers.Layer.Vector, "...initialize task with an external vector layer passed in as parameter...");
	t.eq(agsLocator2.layer.name, "vectorLayer", "...initialize task with an external vector layer passed in as parameter...");
}

function test_Control_AgsLocator_execute_addressToLocations(t) {
	setUp();
	t.plan(5);
	
	var agsLocator = new OpenLayers.Control.AgsLocator(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer",
		null,
		[
			function(olFeatures) {					
				t.eq(olFeatures.length, 10, "...callbacks are called with correct number of features...");
				t.eq(this.layer.features.length, 10, "...this.addResults() adds locator results to this.layer correctly...");				
				this.cleanupResults();
				t.eq(this.layer.features.length, 0, "...this.cleanupResults() cleans up locator results from this.layer correctly...");
			},
			function(olFeatures) {
				t.eq(olFeatures.length, 10, "...multiple callbacks are called correctly...");
			},
		],
		{
			errback: function(error) {
				t.ok(true, "...error callback is being called correctly...");
			}
		}
	);	
	map.addControl(agsLocator);
	
	var address = {};
	address['address'] = "380 New York Str";
	address['city'] = "Redlands";
	address['state'] = "CA";
	address['zip'] = "92373";
	
	var parameters = {};
	parameters['address'] = address;
	parameters['outFields'] = ["StreetName", "City", "State", "ZIP"];
		
	agsLocator.execute(
		null,
		parameters,
		[
			function(olFeatures) {
				t.eq(olFeatures.length, 10, "...callback passed in at runtime is called correctly...");
			}
		]
	);	
	t.wait_result(5);
}

function test_Control_AgsLocator_execute_locationToAddress(t) {
	//setUp();
	t.plan(10);
	
	var options = {projection: "EPSG:4326"};	
	var map1 = new OpenLayers.Map('map', options);
	var vectorLayer1 = new OpenLayers.Layer.Vector("vectorLayer");
	map1.addLayer(vectorLayer1);
	
	var agsLocator = new OpenLayers.Control.AgsLocator(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer",
		null,
		[
			function(olFeatures) {					
				if(olFeatures[0].attributes['addr_Address'] === "381 NEW YORK ST" && 
					olFeatures[0].attributes['addr_City'] === "REDLANDS" &&
					olFeatures[0].attributes['addr_State'] === "CA" &&
					olFeatures[0].attributes['addr_Zip'] === "92373") {
					t.ok(true, "...callback is called with correct address...");
				}
				t.eq(this.layer.features.length, 1, "...this.addResults() adds address results to this.layer correctly...");				
				this.cleanupResults();
				t.eq(this.layer.features.length, 0, "...this.cleanupResults() cleans up address results from this.layer correctly...");				
			},
			function(olFeatures) {
				if(olFeatures[0].attributes['addr_Address'] === "381 NEW YORK ST" && 
					olFeatures[0].attributes['addr_City'] === "REDLANDS" &&
					olFeatures[0].attributes['addr_State'] === "CA" &&
					olFeatures[0].attributes['addr_Zip'] === "92373") {
					t.ok(true, "..multiple callbacks are called correctly...");
				}				
			},
		],
		{
			reverseGeocoding: true,
			errback: function(error) {
				//t.ok(true, "...error callback is being called correctly...");
			}
		}
	);	
	map1.addControl(agsLocator);
	//agsLocator.activate();
	//agsLocator.setReverseGeocoding(true);
	
	var parameters = {};
	
	parameters['location'] = new OpenLayers.Geometry.Point(-117.195681386, 34.0575170970001);
	parameters['distance'] = 50;
		
	agsLocator.execute(
		[],
		parameters,
		[
			function(olFeatures) {
				if(olFeatures[0].attributes['addr_Address'] === "381 NEW YORK ST" && 
					olFeatures[0].attributes['addr_City'] === "REDLANDS" &&
					olFeatures[0].attributes['addr_State'] === "CA" &&
					olFeatures[0].attributes['addr_Zip'] === "92373") {
					t.ok(true, "...callback passed in at runtime is called correctly...");
				}
			},
		]
	);
	
	t.wait_result(5);
	
	var olFeature = new OpenLayers.Feature.Vector(parameters['location']);
	agsLocator.execute(
		[olFeature],
		parameters,
		[
			function(olFeatures) {					
				if(olFeatures[0].attributes['addr_Address'] === "381 NEW YORK ST" && 
					olFeatures[0].attributes['addr_City'] === "REDLANDS" &&
					olFeatures[0].attributes['addr_State'] === "CA" &&
					olFeatures[0].attributes['addr_Zip'] === "92373") {
					t.ok(true, "...callback passed in at runtime is called correctly...");
				}		
			}	
		]		
	);	
	t.wait_result(5);
}





