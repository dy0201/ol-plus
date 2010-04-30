var map;
var wfs_layer;
var bbox_strategy;
var lock_strategy;
var save_strategy;
var modify_control;
var select_control;
var insert_control;
        
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
    
    /*
    // use this when there is no internet connection
    var base_layer = new OpenLayers.Layer.WMS(   
	 	"sf_blockgroups", 
		"http://sazabi:8079/geoserver-1.6.5/wms", 
		{ 											
			layers: 'esri:sf_blockgroups', // WMS layer name for 'counties' layer
			styles: '',																											
			srs: 'EPSG:4326',																																																									
			format: 'image/png',											
			transparent: true
		},
		{														
			isBaseLayer: true,
			singleTile: true,
			displayOutsideMaxExtent: true														
		}
	);
    */
    map.addLayer(base_layer);

    /*
    // consume a WFS 1.0.0 service from GeoServer
    var lon = 146.7;
	var lat = -41.8;
    var zoom = 6;
        
    var wfs_layer = new OpenLayers.Layer.Vector(
    	"GeoServer WFS", 
    	{
    		strategies: [new OpenLayers.Strategy.BBOX()],
    		protocol: new OpenLayers.Protocol.WFS(
    			{    				
    				url: "http://publicus.opengeo.org/geoserver/wfs",
    				featureType: "tasmania_roads",
    				featureNS: "http://www.openplans.org/topp"
    			}
    		),
    	}
    );
    */    
    
    // consume a WFS 1.1.0 service from ArcGIS Server
    var lon = -122.391667;
	var lat = 37.760628;
    var zoom = 10;
    
    bbox_strategy = new OpenLayers.Strategy.BBOX()
    // lock_strategy will be used by GUI to sent lock feature request
    lock_strategy = new OpenLayers.Strategy.Lock();
    // save_strategy will be used by GUI to send transaction request
    save_strategy = new OpenLayers.Strategy.Save2();
    
    wfs_layer = new OpenLayers.Layer.Vector(
    	"arcgis server wfs ", 
    	{
    		strategies: [
    		    bbox_strategy,
    		    lock_strategy,
    		    save_strategy
    		],
    		protocol: new OpenLayers.Protocol.WFS2(    			    			    				
    			{
    				url: "http://4682_OGC_AGS_0/arcgis/services/sanfrancisco_wfst/MapServer/WFSServer?",    				
    				format: new OpenLayers.Format.WFST2({
        				//version: "1.1.0",
    					srsName: "urn:x-ogc:def:crs:EPSG:6.9:4326",
    					schema: "http://4682_OGC_AGS_0/arcgis/services/sanfrancisco_wfst/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:pizzastores",
    					featureType: "pizzastores",
    					//schema: "http://sazabi/arcgis/services/sanfrancisco_wfst/GeoDataServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:highways",
    					//featureType: "highways",
    					//schema: "http://sazabi/arcgis/services/sanfrancisco_wfst/GeoDataServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:blockgroups",
    					//featureType: "blockgroups",
    					geometryName: "Shape",																		
						featureNS: "http://www.esri.com",
    					featurePrefix: "esri",
    					
    					extractAttributes: false,
    					//xy: false,
    					lockExpiry: "1",
        				releaseAction: "ALL",
						// propertyNames: "", array of string to list properties to be returned
    				}),
    				//maxFeatures: 49,
    				/*
    				// another way to initialize WFS protocol by passing all options
    				// options for WFST format go into 'formatOptions'
    				url: "http://sazabi/arcgis/services/sanfrancisco/MapServer/WFSServer",  			
					version: "1.1.0",
					srsName: "EPSG:4326",
					schema: "http://sazabi/arcgis/services/sanfrancisco/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:pizzastores",
					featureType: "pizzastores",
					geometryName: "Shape",
					featureNS: "http://www.esri.com/wfst",
					featurePrefix: "esri",
					formatOptions: {
						xy: false
					}
    				*/
    			})    			
    	}
    );
    wfs_layer.setVisibility(false);
    map.addLayer(wfs_layer);
    
    //
    wfs_layer.events.on({    	
    	"featureselected": toggleLockBtns,
    	"featureunselected": disableLockBtns,
    	"afterfeatureslocked": disableLockBtns,
    	"afterfeaturesunlocked": disableLockBtns
    });
    
    // create, add and activate the SelectFeature control
    
    select_control = new OpenLayers.Control.SelectFeature(
    	wfs_layer,
    	{
    		clickout: false,
    		toggle: true,
			multiple: true
    	}
    );
    map.addControl(select_control);
    select_control.activate();
    
    
    // create, add and activate the DragFeature control
    /*
    drag_control = new OpenLayers.Control.DragFeature(
    	wfs_layer,
    	{
    	
    	}
    );
    map.addControl(drag_control);
    drag_control.activate();
    */
    
    // create, add and activate the ModifyFeature control       
    modify_control = new OpenLayers.Control.ModifyFeature2(
    	wfs_layer,
    	{    		
    		mode: OpenLayers.Control.ModifyFeature2.RESHAPE | OpenLayers.Control.ModifyFeature2.ROTATE, // to rotate and reshape the feature
			//mode: OpenLayers.Control.ModifyFeature2.DELETE, // to delete the feature
			/*
    		geometryTypes:[
    		    "OpenLayers.Geometry.Point",
    		    "OpenLayers.Geometry.LineString",
    		    "OpenLayers.Geometry.Polygon"
    		],
    		*/
    		//clickout: false,
    		//toggle: true
    	}
    );    
    map.addControl(modify_control);
    //modify_control.activate();	
    
	// create, add and activate the DrawFeature control
	insert_control = new OpenLayers.Control.DrawFeature(
		wfs_layer,
		OpenLayers.Handler.Point,
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
	
    map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
    
    // load basic styles for vector layer
    OpenLayers.loadURL("http://august-openlayers.appspot.com/sld/uc2009/wfst_styles.xml", null, null, onStylesLoad);
}

function onStylesLoad(request) {
	var sld_format = new OpenLayers.Format.SLD();
	// 
	var sld = sld_format.read(request.responseXML || request.responseText);
	
	var point_basic = sld.namedLayers["point"].userStyles[0];
	var point_red_marker = sld.namedLayers["point"].userStyles[1]; // red gmaps style marker
	var point_blue_marker = sld.namedLayers["point"].userStyles[2]; // blue gmaps style marker
	var point_gold_marker = sld.namedLayers["point"].userStyles[3]; // gold gmaps style marker
	
	var polyline_basic = sld.namedLayers["polyline"].userStyles[0];
	var polyline_red = sld.namedLayers["polyline"].userStyles[1];
	var polyline_blue = sld.namedLayers["polyline"].userStyles[2];
	var polyline_gold = sld.namedLayers["polyline"].userStyles[3];
	
	var polygon_basic = sld.namedLayers["polygon"].userStyles[0];
	var polygon_blue = sld.namedLayers["polygon"].userStyles[1];
	var polygon_red = sld.namedLayers["polygon"].userStyles[2];
		
	var shadowStyle = {
		backgroundGraphic: "http://august-openlayers.appspot.com/sld/uc2009/images/shadow.png",            
        backgroundXOffset: 0,
        backgroundYOffset: -7,
        graphicZIndex: 11,
        backgroundGraphicZIndex: 10,	
	};
	// this is only a trick to overwrite rendering parameters for background graphics
	point_red_marker.setDefaultStyle(shadowStyle);
	point_blue_marker.setDefaultStyle(shadowStyle);
	point_gold_marker.setDefaultStyle(shadowStyle);
	
	wfs_layer.styleMap = new OpenLayers.StyleMap({
		// point geometry layer
		'default': point_gold_marker,
		'select': point_blue_marker
		
		// polyline geometry layer
		//'default': polyline_gold,
		//'select': polyline_blue
		
		// polygon geometry layer
		//'default': polygon_basic,
		//'select': polygon_blue,
				
	});	

	lock_strategy.setStyleMap(
		new OpenLayers.StyleMap({
			// point geometry layer
			'default': point_gold_marker,
			'select': point_blue_marker,
			'locked': point_red_marker
			
			// polyline geometry layer
			//'default': polyline_gold,
			//'select': polyline_blue,
			//'locked': polyline_red	
			
			// polygon geometry layer
			//'default': polygon_basic,
			//'select': polygon_blue,
			//'locked': polygon_red			
		})
	);	
	
	//wfs_layer.styleMap.styles["default"] = point_basic;
	//wfs_layer.styleMap.styles["default"] = polyline_basic;
	//wfs_layer.styleMap.styles["default"] = polygon_basic;
	
	wfs_layer.setVisibility(true);
	wfs_layer.refresh(); //it actually does wfs_layer.events.triggerEvent("refresh");
	
	document.getElementById("lock_btn").disabled = true;
	document.getElementById("unlock_btn").disabled = true;
	document.getElementById("select_btn").disabled = true;
	document.getElementById("commit_btn").disabled = false;
	document.getElementById("refresh_btn").disabled = false;
}

function refreshFeatures() {
	wfs_layer.events.triggerEvent("refresh", {'force': true});
}

function lockFeatures() {
	if(wfs_layer.selectedFeatures.length > 0) {
		lock_strategy.lockFeatures(wfs_layer.selectedFeatures);
	}
}

function unlockFeatures() {
	lock_strategy.unlockAllFeatures();
}

function toggleLockBtns(evt) {
	//OpenLayers.Console.log(evt.type);
	//OpenLayers.Console.log(evt.feature.id);
	var feature = evt.feature;
	if(lock_strategy.isFeatureLocked(feature)) {
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
	save_strategy.saveWithLock();
}

