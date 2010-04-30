var map;
var agsGeometryService;

function init() {
	var lon = -122.391667;
	var lat = 37.760628;
	var zoom = 12;							
	
	OpenLayers.ProxyHost= "/openlayers/ApacheProxyServlet?targetUrl=";
    
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
		"esri_street_map", 
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
			
	agsGeometryService = new OpenLayers.Control.AgsGeometryService(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
		null,
		[
			function(results) {				
				if(this.geometryServiceType == "buffer") {
					OpenLayers.Console.debug("...results of esri.tasks.GeometryService 'buffer' operation...");
					for(var i=0; i<results.length; i++) {
						if(results[i] && results[i] instanceof OpenLayers.Feature.Vector) {
							OpenLayers.Console.debug("...buffer polygon feature: " + results[i].id);															
						}
					}
				} else if(this.geometryServiceType == "project") {
					OpenLayers.Console.debug("...results of esri.tasks.GeometryService 'project' operation...");
					for(var i=0; i<results.length; i++) {
						if(results[i] && results[i] instanceof OpenLayers.Feature.Vector) {
							OpenLayers.Console.debug("...projected feature: " + results[i].geometry);															
						}
					}	
				} else if(this.geometryServiceType == "areasAndLengths") {
					OpenLayers.Console.debug("...results of esri.tasks.GeometryService 'areasAndLengths' operation...");
					if(results.areas) OpenLayers.Console.debug("...areas: " + results.areas);
					if(results.lengths) OpenLayers.Console.debug("...lengths: " + results.lengths);
				} else if (this.geometryServiceType == "labelPoints") {
					OpenLayers.Console.debug("...results of esri.tasks.GeometryService 'labelPoints' operation...");
					for (var i = 0; i < results.length; i++) {
						if (results[i] && results[i] instanceof OpenLayers.Feature.Vector) {
							OpenLayers.Console.debug("...labelPoints: " + results[i].geometry);
						}
					}
				} else if(this.geometryServiceType == "lengths") {
					OpenLayers.Console.debug("...results of esri.tasks.GeometryService 'lengths' operation...");					
					if(results.lengths) OpenLayers.Console.debug("...lengths: " + results.lengths);
				} else if(this.geometryServiceType == "relation") {
					OpenLayers.Console.debug("...results of esri.tasks.GeometryService 'relation' operation...");
					for(var i=0; i<results.length; i++) {
						if(results[i]) {
							OpenLayers.Console.debug("...index of features in that relation: (" + results[i]['geometry1Index'] + "," + results[i]['geometry2Index'] + ")");															
						}
					}
				} else if(this.geometryServiceType == "simplify") {
					OpenLayers.Console.debug("...results of esri.tasks.GeometryService 'simplify' operation...");
					for (var i = 0; i < results.length; i++) {
						if (results[i] && results[i] instanceof OpenLayers.Feature.Vector) {
							OpenLayers.Console.debug("...simplified feature: " + results[i].geometry);
						}
					}
				} else {
					OpenLayers.Console.debug("...results of other types of operations...");
				}	
			},
			function(results) {				
				OpenLayers.Console.log("...you can pass in multiple callback functions...");	
			}
		],
		{
			mode: "select", 
			drawCtrlHandler: OpenLayers.Handler.Polygon, 
			drawCtrlHandlerOptions: {
				handlerOptions: {
					keyMask: OpenLayers.Handler.MOD_CTRL
				}
			},
			geometryServiceType: "buffer",			
		}
	);
	map.addControl(agsGeometryService);
	agsGeometryService.activate();					
	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
	addTestFeatures();		
}

function callback(olFeatures) {				
	
} 

function toggleMode() {
	if(agsGeometryService.mode == "draw") {
		agsGeometryService.switchMode("select");
		document.getElementById('toggle_mode_btn').value = "Select Mode (click to toggle)";
	} else if(agsGeometryService.mode == "select") {
		agsGeometryService.switchMode("draw");
		document.getElementById('toggle_mode_btn').value = "Draw Mode (click to toggle)";
	}
}

function cleanup() {
	agsGeometryService.cleanupResults();
};

function addTestFeatures() {
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
	
	var _interlLayer_ = map.getLayersByName("__internal__")[0];	
	_interlLayer_.addFeatures([point_feature, polygon_feature, polygon2_feature, polyline_feature, polyline2_feature, polyline3_feature]);
}

function doBuffer() {
	if(agsGeometryService.geometryServiceType != "buffer") {
		agsGeometryService.setGeometryServiceType("buffer");
	}
	if(agsGeometryService.mode == "draw") {
		agsGeometryService.switchMode("select");
	}
	agsGeometryService.displayResults = true;
	OpenLayers.Util.extend(
		agsGeometryService.taskParameters,
		{
			'inSpatialReference':		"EPSG:4326",
			'outSpatialReference':		"EPSG:4326"
		}
	);	
}

function doSimplify() {
	// TODO:
}

function doProject() {
	if(agsGeometryService.geometryServiceType != "project") {
		agsGeometryService.setGeometryServiceType("project");
	}
	if(agsGeometryService.mode == "draw") {
		agsGeometryService.switchMode("select");
	}
	// perform projection from EPSG:4326 to EPSG:102113
	OpenLayers.Util.extend(
		agsGeometryService.taskParameters,
		{
			'inSpatialReference':		"EPSG:4326",
			'outSpatialReference':		"EPSG:102113"
		}
	);	
	agsGeometryService.displayResults = false;
}

function doLengths() {
	if(agsGeometryService.geometryServiceType != "lengths") {
		agsGeometryService.setGeometryServiceType("lengths");
	}
	if(agsGeometryService.mode == "draw") {
		agsGeometryService.switchMode("select");
	}
	OpenLayers.Util.extend(
		agsGeometryService.taskParameters,
		{
			'inSpatialReference':		"EPSG:4326",
			'outSpatialReference':		"EPSG:4326"
		}
	);	
	agsGeometryService.displayResults = false;
}

function doAreasAndLengths() {
	if(agsGeometryService.geometryServiceType != "areasAndLengths") {
		agsGeometryService.setGeometryServiceType("areasAndLengths");
	}
	if(agsGeometryService.mode == "draw") {
		agsGeometryService.switchMode("select");
	}
	OpenLayers.Util.extend(
		agsGeometryService.taskParameters,
		{
			'inSpatialReference':		"EPSG:4326",
			'outSpatialReference':		"EPSG:4326"
		}
	);	
	agsGeometryService.displayResults = false;
}

function doLabelPoints() {
	if(agsGeometryService.geometryServiceType != "labelPoints") {
		agsGeometryService.setGeometryServiceType("labelPoints");
	}
	if(agsGeometryService.mode == "draw") {
		agsGeometryService.switchMode("select");
	}
	OpenLayers.Util.extend(
		agsGeometryService.taskParameters,
		{
			'inSpatialReference':		"EPSG:4326",
			'outSpatialReference':		"EPSG:4326"
		}
	);	
	agsGeometryService.displayResults = true;
}

function doLabelPointsOnMultiPolygons() {
	if(agsGeometryService.geometryServiceType != "labelPoints") {
		agsGeometryService.setGeometryServiceType("labelPoints");
	}
	if(agsGeometryService.mode == "draw") {
		agsGeometryService.switchMode("select");
	}
	OpenLayers.Util.extend(
		agsGeometryService.taskParameters,
		{
			'inSpatialReference':		"EPSG:4326",
			'outSpatialReference':		"EPSG:4326"
		}
	);
	agsGeometryService.multiple = true;
	agsGeometryService.displayResults = true;
	var _interlLayer_ = map.getLayersByName("__internal__")[0];	
	if(_interlLayer_.selectedFeatures) {
		agsGeometryService.execute(
			_interlLayer_.selectedFeatures,
			{},
			[]
		);
	}
}

function doRelation() {
	if(agsGeometryService.geometryServiceType != "relation") {
		agsGeometryService.setGeometryServiceType("relation");
	}
	if(agsGeometryService.mode == "draw") {
		agsGeometryService.switchMode("select");
	}
	OpenLayers.Util.extend(
		agsGeometryService.taskParameters,
		{
			'inSpatialReference':		"EPSG:4326",
			'outSpatialReference':		"EPSG:4326",
			'spatialRelationship': 		"INTERSECTION"
		}
	);
	agsGeometryService.multiple = true;
	agsGeometryService.displayResults = false;
	var _interlLayer_ = map.getLayersByName("__internal__")[0];	
	if(_interlLayer_.selectedFeatures) {
		agsGeometryService.execute(
			_interlLayer_.selectedFeatures,
			{},
			[]
		);
	}
}

function doSimplify() {
	if(agsGeometryService.geometryServiceType != "simplify") {
		agsGeometryService.setGeometryServiceType("simplify");
	}
	if(agsGeometryService.mode == "select") {
		agsGeometryService.switchMode("draw");
	}
	OpenLayers.Util.extend(
		agsGeometryService.taskParameters,
		{
			'inSpatialReference':		"EPSG:4326",
			'outSpatialReference':		"EPSG:4326"		
		}
	);
	agsGeometryService.multiple = true;
	agsGeometryService.displayResults = true;
}


