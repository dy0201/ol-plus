var map;

var point_wfst_layer;
var line_wfst_layer;
var polygon_wfst_layer;

var point_bbox_strategy;
var point_lock_strategy;
var point_save_strategy;

var line_bbox_strategy;
var line_lock_strategy;
var line_save_strategy;

var polygon_bbox_strategy;
var polygon_lock_strategy;
var polygon_save_strategy;

var editLayer;
var editLockStrategy;
var editSaveStrategy;

var modify_control;
var select_control;
var insert_control;
var snap_control;
        
function init() {    
	OpenLayers.ProxyHost= "/openlayers-2.8/ApacheProxyServlet?targetUrl=";
    
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
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/tile/", 
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
    
    // consume a WFS 1.1.0 service from ArcGIS Server
    var lon = -122.40609;
	var lat = 37.80560;
    var zoom = 12;
    
	////////////////////////////////////////////////////////////////////////////////////////////
	// initializing bbox/lock/save strategy
	////////////////////////////////////////////////////////////////////////////////////////////

	point_bbox_strategy = new OpenLayers.Strategy.BBOX()    
    point_lock_strategy = new OpenLayers.Strategy.Lock();     
    point_save_strategy = new OpenLayers.Strategy.Save2();
	
	line_bbox_strategy = new OpenLayers.Strategy.BBOX()    
    line_lock_strategy = new OpenLayers.Strategy.Lock();     
    line_save_strategy = new OpenLayers.Strategy.Save2();
	
	polygon_bbox_strategy = new OpenLayers.Strategy.BBOX()    
    polygon_lock_strategy = new OpenLayers.Strategy.Lock();     
    polygon_save_strategy = new OpenLayers.Strategy.Save2();
    
	////////////////////////////////////////////////////////////////////////////////////////////
	// add a point wfst layer from ArcGIS Server WFS
	////////////////////////////////////////////////////////////////////////////////////////////
	
	point_wfst_layer = new OpenLayers.Layer.Vector(
    	"pizzastores", 
    	{
    		strategies: [
    		    point_bbox_strategy,
    		    point_lock_strategy,
    		    point_save_strategy
    		],
    		protocol: new OpenLayers.Protocol.WFS2(    			    			    				
    			{
    				url: "http://sazabi/arcgis/services/uc2009/sanfrancisco_wfst/GeoDataServer/WFSServer?",    				
    				format: new OpenLayers.Format.WFST2({
        				//version: "1.1.0", 								// no need to specify '1.1.0' cuz it's default					
    					srsName: "urn:x-ogc:def:crs:EPSG:6.9:4326",			// 
    					schema: "http://sazabi/arcgis/services/uc2009/sanfrancisco_wfst/GeoDataServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:pizzastores",
    					featureType: "pizzastores",    					
    					geometryName: "Shape",																		
						featureNS: "http://www.esri.com",
    					featurePrefix: "esri",    					
    					extractAttributes: false,
    					//xy: false,									 	// no need to set xy false cuz it's default in WFST2 format
    					lockExpiry: "3",
        				releaseAction: "ALL",
						// propertyNames: "", 								// array of string to list properties to be returned
    				})        		    				
    			})    			
    	}
    );
    point_wfst_layer.setVisibility(false);
	
	////////////////////////////////////////////////////////////////////////////////////////////
	// add a line wfst layer from ArcGIS Server WFS
	////////////////////////////////////////////////////////////////////////////////////////////
	
	line_wfst_layer = new OpenLayers.Layer.Vector(
    	"highways", 
    	{
    		strategies: [
    		    line_bbox_strategy,
    		    line_lock_strategy,
    		    line_save_strategy
    		],
    		protocol: new OpenLayers.Protocol.WFS2(    			    			    				
    			{
    				url: "http://sazabi/arcgis/services/uc2009/sanfrancisco_wfst/GeoDataServer/WFSServer?",    				
    				format: new OpenLayers.Format.WFST2({
        				//version: "1.1.0", 								// no need to specify '1.1.0' cuz it's default					
    					srsName: "urn:x-ogc:def:crs:EPSG:6.9:4326",			// 
    					schema: "http://sazabi/arcgis/services/uc2009/sanfrancisco_wfst/GeoDataServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:highways",
    					featureType: "highways",    					
    					geometryName: "Shape",																		
						featureNS: "http://www.esri.com",
    					featurePrefix: "esri",    					
    					extractAttributes: false,
    					//xy: false,									 	// no need to set xy false cuz it's default in WFST2 format
    					lockExpiry: "3",
        				releaseAction: "ALL",
						// propertyNames: "", 								// array of string to list properties to be returned
    				})        		    				
    			})    			
    	}
    );
    line_wfst_layer.setVisibility(false);
    	
	////////////////////////////////////////////////////////////////////////////////////////////
	// add a polygon wfst layer from ArcGIS Server WFS
	////////////////////////////////////////////////////////////////////////////////////////////
	
	polygon_wfst_layer = new OpenLayers.Layer.Vector(
    	"blockgroups", 
    	{
    		strategies: [
    		    polygon_bbox_strategy,
    		    polygon_lock_strategy,
    		    polygon_save_strategy
    		],
    		protocol: new OpenLayers.Protocol.WFS2(    			    			    				
    			{
    				url: "http://sazabi/arcgis/services/uc2009/sanfrancisco_wfst/GeoDataServer/WFSServer?",    				
    				format: new OpenLayers.Format.WFST2({
        				//version: "1.1.0", 								// no need to specify '1.1.0' cuz it's default					
    					srsName: "urn:x-ogc:def:crs:EPSG:6.9:4326",			// 
    					schema: "http://sazabi/arcgis/services/uc2009/sanfrancisco_wfst/GeoDataServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:blockgroups",
    					featureType: "blockgroups",    					
    					geometryName: "Shape",																		
						featureNS: "http://www.esri.com",
    					featurePrefix: "esri",    					
    					extractAttributes: false,						
    					//xy: false,									 	// no need to set xy false cuz it's default in WFST2 format
    					lockExpiry: "3",
        				releaseAction: "ALL",
						// propertyNames: "", 								// array of string to list properties to be returned
    				}),
					//maxFeatures: 49,    									// 'maxFeatures' must be set as an option to WFS protocol		    				
    			})    			
    	}
    );
    polygon_wfst_layer.setVisibility(false);
	
    map.addLayer(polygon_wfst_layer);	
	map.addLayer(line_wfst_layer);
	map.addLayer(point_wfst_layer);
	
	////////////////////////////////////////////////////////////////////////////////////////////
	// initializing controls to insert/update/delete features through WFST
	////////////////////////////////////////////////////////////////////////////////////////////
    
	// to edit a layer, set editLayer, editLockStrategy, and editSaveStrategy to that layer
	/*
	editLayer = point_wfst_layer;
	editLockStrategy = point_lock_strategy;
	editSaveStrategy = point_save_strategy;  
	*/
	
	editLayer = line_wfst_layer;
	editLockStrategy = line_lock_strategy;
	editSaveStrategy = line_save_strategy;
	
	/*
	editLayer = point_wfst_layer;
	editLockStrategy = point_lock_strategy;
	editSaveStrategy = point_save_strategy;
    */
	
	editLayer.events.on({    	
    	"featureselected": toggleLockBtns,
    	"featureunselected": disableLockBtns,
    	"afterfeatureslocked": disableLockBtns,
    	"afterfeaturesunlocked": disableLockBtns
    });
    
    select_control = new OpenLayers.Control.SelectFeature(	// create, add and activate a select control
    	editLayer,
    	{
    		clickout: false,
    		toggle: true,
			multiple: true
    	}
    );
    map.addControl(select_control);
    select_control.activate();	// start the select control initially
        
    modify_control = new OpenLayers.Control.ModifyFeature2( // create and add the ModifyFeature2 control  
    	editLayer,
    	{    		
    		mode: OpenLayers.Control.ModifyFeature2.RESHAPE | OpenLayers.Control.ModifyFeature2.ROTATE, // to rotate and reshape the feature
			//mode: OpenLayers.Control.ModifyFeature2.DELETE, // to delete the feature			
    		//clickout: false,
    		//toggle: true
    	}
    );    
    map.addControl(modify_control);
    //modify_control.activate();	
    
	
	insert_control = new OpenLayers.Control.DrawFeature( // create and add the DrawFeature control
		editLayer,
		OpenLayers.Handler.Point,	// to insert point features
		//OpenLayers.Handler.Path,
		//OpenLayers.Handler.Polygon,
		//OpenLayers.Handler.MultiPath,
		//OpenLayers.Handler.MultiPolygon,
		{
			//handlerOptions: {} 
		}
	);
	//map.addControl(insert_control);
    //insert_control.activate();
	
    // an easy way to set up snap control
	snap_control = new OpenLayers.Control.Snapping( // create and activate the Snap control
		{
			layer: line_wfst_layer,
	        targets: [line_wfst_layer, polygon_wfst_layer],
	        greedy: false
    	}
	);
	
	// a more sophisticated way to set up control 
	snap_control = new OpenLayers.Control.Snapping( // create and activate the Snap control
		{
			layer: line_wfst_layer,
	        targets: [
				{ // line_wfst_layer itself as snap target
					layer: line_wfst_layer,
					tolerance: 5,
					node: false,
					//nodeTolerance: 2,
					vertex: true,
					//vertexTolerance: 2,
					edge: true,
					//edgeTolerance: 2,
					//filter: null
				},
				{ // polygon_wfst_layer as snap target
					layer: polygon_wfst_layer,	
					tolerance: 5,
					node: true,
					nodeTolerance: 2,
					vertex: true,
					vertexTolerance: 2,
					edge: true,
					edgeTolerance: 2
					//filter: null
				}				
			],
	        greedy: false
    	}
	);
	
    snap_control.activate();
	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
    
    // load basic styles for vector layer
    OpenLayers.loadURL("sld/wfst_styles.xml", null, null, onStylesLoad);
}

function onStylesLoad(request) {
	
	var sld_format = new OpenLayers.Format.SLD(); 
	var sld = sld_format.read(request.responseXML || request.responseText); //
	
	var point_basic = sld.namedLayers["point"].userStyles[0];
	var point_red_marker = sld.namedLayers["point"].userStyles[1]; // red gmaps style marker
	var point_blue_marker = sld.namedLayers["point"].userStyles[2]; // blue gmaps style marker
	var point_gold_marker = sld.namedLayers["point"].userStyles[3]; // gold gmaps style marker
	
	var line_basic = sld.namedLayers["polyline"].userStyles[0];
	var line_red = sld.namedLayers["polyline"].userStyles[1];
	var line_blue = sld.namedLayers["polyline"].userStyles[2];
	var line_gold = sld.namedLayers["polyline"].userStyles[3];
	
	var polygon_basic = sld.namedLayers["polygon"].userStyles[0];
	var polygon_red = sld.namedLayers["polygon"].userStyles[1];
	var polygon_blue = sld.namedLayers["polygon"].userStyles[2];
	var polygon_gold = sld.namedLayers["polygon"].userStyles[3];
		
	/*
	var shadowStyle = {
		backgroundGraphic: "http://sazabi:8080/openlayers-2.7/slds/openlayers/images/shadow.png",            
        backgroundXOffset: 0,
        backgroundYOffset: -7,
        graphicZIndex: 11,
        backgroundGraphicZIndex: 10,	
	};
	// this is only a trick to overwrite rendering parameters for background graphics
	point_red_marker.setDefaultStyle(shadowStyle);
	point_blue_marker.setDefaultStyle(shadowStyle);
	point_gold_marker.setDefaultStyle(shadowStyle);
	*/	
	
	// set style maps for point wfst layer	
	point_wfst_layer.styleMap = new OpenLayers.StyleMap({		
		'default': point_gold_marker,
		'select': point_blue_marker				
	});	
	point_lock_strategy.setStyleMap(
		new OpenLayers.StyleMap({		
			'default': point_gold_marker,
			'select': point_blue_marker,
			'locked': point_red_marker	
		})
	);	
	
	// set style maps for line wfst layer	
	line_wfst_layer.styleMap = new OpenLayers.StyleMap({		
		'default': line_gold,
		'select': line_blue				
	});	
	line_lock_strategy.setStyleMap(
		new OpenLayers.StyleMap({		
			'default': line_gold,
			'select': line_blue,
			'locked': line_red	
		})
	);
	
	// set style maps for polygon wfst layer	
	polygon_wfst_layer.styleMap = new OpenLayers.StyleMap({		
		'default': polygon_gold,
		'select': polygon_blue				
	});	
	polygon_lock_strategy.setStyleMap(
		new OpenLayers.StyleMap({		
			'default': polygon_gold,
			'select': polygon_blue,
			'locked': polygon_red	
		})
	);
		
	document.getElementById("lock_btn").disabled = true;
	document.getElementById("unlock_btn").disabled = true;
	document.getElementById("select_btn").disabled = true;
	document.getElementById("commit_btn").disabled = false;
}

function lockFeatures() {
	if(editLayer.selectedFeatures.length > 0) {
		editLockStrategy.lockFeatures(editLayer.selectedFeatures);
	}
}

function unlockFeatures() {
	editLockStrategy.unlockAllFeatures();
}

function toggleLockBtns(evt) {
	//OpenLayers.Console.log(evt.type);
	//OpenLayers.Console.log(evt.feature.id);
	var feature = evt.feature;
	if(editLockStrategy.isFeatureLocked(feature)) {
		document.getElementById("lock_btn").disabled = true;
		document.getElementById("unlock_btn").disabled = false;
	} else {
		document.getElementById("lock_btn").disabled = false;
		document.getElementById("unlock_btn").disabled = true;
	}
}

function disableLockBtns(evt) {
	document.getElementById("lock_btn").disabled = true;
	document.getElementById("unlock_btn").disabled = true;
}

function activateModifyCtrl(evt) {
	select_control.deactivate();
	modify_control.activate();
	document.getElementById("select_btn").disabled = false;
	document.getElementById("modify_btn").disabled = true;
}

function deactivateModifyCtrl(evt) {
	modify_control.deactivate();
	select_control.activate();	
	document.getElementById("select_btn").disabled = true;
	document.getElementById("modify_btn").disabled = false;
}

function commit() {
	editSaveStrategy.saveWithLock();
}

