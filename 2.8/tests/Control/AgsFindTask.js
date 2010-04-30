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
			displayInLayerSwitcher: false
		}
	);
	map.addLayer(vectorLayer);
}

function tearDown() {
	map.destroy();
	vectorLayer = null;
	map = null;
}

function test_Control_AgsFindTask_initialize(t) {
	setUp();
	t.plan(11);
	
	var agsFindTask = new OpenLayers.Control.AgsFindTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		null,
		[],
		{}
	);
	map.addControl(agsFindTask);
	agsFindTask.activate();
	
	t.eq(typeof agsFindTask._resultsParser['parser'], "function", "...initialize _resultsParser['parser'] correctly...");
	t.ok(agsFindTask._resultsParser['context'] instanceof OpenLayers.Format.AgsJsAdapter, "...initialize _resultsParser['context'] correctly...");	
	//t.eq(agsFindTask.active, false, "...disable map interaction correctly...");
	t.ok(agsFindTask.layer instanceof OpenLayers.Layer.Vector, "...initialize an internal vector layer if not passed in as parameter...");
		 
	t.eq(agsFindTask.taskParameters['contains'], false, "...default 'contains' value is correct...");
	t.eq(agsFindTask.taskParameters['outSpatialReference'], null, "...default 'outSpatialReference' value is correct...");
	t.eq(agsFindTask.taskParameters['returnGeometry'], true, "...default 'returnGeometry' value is correct...");
	t.eq(agsFindTask.taskParameters['layerIds'], [], "...default 'layerIds' value is correct...");
	t.eq(agsFindTask.taskParameters['searchFields'], [], "...default 'searchFields' value is correct...");
	t.eq(agsFindTask.taskParameters['searchText'], "", "...default 'searchText' value is correct...");
	
	var agsFindTask2 = new OpenLayers.Control.AgsFindTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		vectorLayer,
		[],
		{}
	);
	map.addControl(agsFindTask2);
	t.ok(agsFindTask2.layer instanceof OpenLayers.Layer.Vector, "...initialize task with an external vector layer passed in as parameter...");
	t.eq(agsFindTask2.layer.name, "vectorLayer", "...initialize task with an external vector layer passed in as parameter...");
	
	//tearDown();
}

function test_Control_AgsFindTask_destroy(t){
	setUp();
	t.plan(0);
	
	var agsFindTask = new OpenLayers.Control.AgsFindTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		null,
		[],
		{}
	);
	map.addControl(agsFindTask);
	
	try {
		agsFindTask.destroy();	
	} catch(e) {
		t.ok(false, "...OpenLayers.Control.AgsFindTask doesn't destroy itself correctly...");
	}	
}

function test_Control_AgsFindTask_execute_1(t) {		
	setUp();
	t.plan(5);		
	var agsFindTask = new OpenLayers.Control.AgsFindTask(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer",
		null,
		[
			function(olFeatures) {				
				var count = 0;
				for(var i=0; i<32; i++) { // hard coded find operation should return 32 cities features
					if(olFeatures[i] instanceof OpenLayers.Feature.Vector) {
						count++;
					}
				}
				t.eq(32, count, "...callback being called with correct number of find results...");
				t.eq(this.layer.features.length, 32, "...this.addResults() adds find results to this.layer correctly...");
				this.cleanupResults();
				t.eq(this.layer.features.length, 0, "...this.cleanupResults() cleans up find results from this.layer correctly...");						
			},
			function(olFeatures) {				
				var count = 0;
				for(var i=0; i<32; i++) { // hard coded find operation should return 32 cities features
					if(olFeatures[i] instanceof OpenLayers.Feature.Vector) {
						count++;
					}
				}
				t.eq(32, count, "...multiple callback functions are called correctly...");						
			},
		],
		{
			errback: function(error) {
				t.ok(true, "...error callback is being called correctly...");
			}
		}
	);
	map.addControl(agsFindTask);
	//agsFindTask.activate();
	
	// this hard coded find operation returns 32 cities 	
	var findParameters = {
		'outSpatialReference': map['projection'], // wkid:102113
		'layerIds': [0],
		'searchFields': ["CITY_NAME"],
		'contains': true,
		'searchText': "San "
	};
	
	// send a valid request and expect valid find results
	agsFindTask.execute(
		findParameters, 
		[
			function(olFeatures) {				
				var count = 0;
				for(var i=0; i<32; i++) { // hard coded find operation should return 32 cities features
					if(olFeatures[i] instanceof OpenLayers.Feature.Vector) {
						count++;
					}
				}
				t.eq(32, count, "...callback function passed in at runtime is called correctly...");
			}
		]
	);
	
	// send an invalid request and expect error callback
	/*
	agsFindTask.execute(
		{
			'outSpatialReference': map['projection'], // wkid:102113
			'layerIds': [-99],
			'searchFields': ["CITY_NAME"],
			'contains': true,
			'searchText': "San "
		}, 
		[]
	);
	*/
	t.wait_result(8);
}


