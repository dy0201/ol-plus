var map;
var proxied_postgis_layer;
        
function init() {    
	
	OpenLayers.ProxyHost = "/openlayers-2.8/ApacheProxyServlet?resourceUrl=";
    
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
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_ShadedRelief_World_2D/MapServer/tile/", 
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
 
    // initialize proxied_postgis layer
    var lon = 14.0558;
	var lat = 40.8419;
    var zoom = 7;
        
    // create a vector layer to read features from PostGIS through a proxy
    proxied_postgis_layer = new OpenLayers.Layer.Vector(
    	"PostGIS", // give a layer name just as other vector layers
    	{
    		strategies: [new OpenLayers.Strategy.BBOX()],	// use a BBOX strategy to read features when extent changes 
    		protocol: new OpenLayers.Protocol.SQL.ProxiedPostGIS({    				    			
    			url: "/openlayers-2.8/PostGISProxyServlet?",	// postgis proxy url -
    															// - if PostGIS proxy is on anohter machine, configure the OpenLayers.ProxyHost
    			databaseName: "postgis_rome",					// postgis database name to connect 
    			tableName: "historical_sites",					// postgis feature class or table name
    			username: "postgres",							// postgis username
    			password: "postgres",							// postgis password
    			geometryName: "the_geom",						// name of the geometry column of feature class
    			responseType: "geojson",    					// format of geometry field in response from PostGIS -
    															// - possible values are: 'geojson', 'kml', or 'gml' etc.
    			encoder: new OpenLayers.Format.SQL({
    				'type': "PostGIS",							// type of OpenLayers.Format.SQL to create SQL statement, only PostGIS is supported 
    	    		'fidName': "id",							// column name of feature class used to create FeatureId filter
    	    		'geometryName': "the_geom",					// name of the geometry column of feature class
    	    		'srid': "4326",								// wkid/srid of feature class in postgis, used to encode geometry wkt
    	    		'fields': []
    			})
    			/* 
    			 * omit the 'parser', so default OpenLayers.Format,GeoJSON will be used -
    			 * - because of 'responseType' is set to "geojson"
    			 */
    			//parser: new OpenLayers.Format.GeoJSON()
    		})
    	}
    );
    
    proxied_postgis_layer.setVisibility(false);
    map.addLayer(proxied_postgis_layer);
    	
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
	
	proxied_postgis_layer.styleMap = new OpenLayers.StyleMap({
		// point geometry layer
		'default': point_gold_marker,
		'select': point_blue_marker	
	});	
	
	//proxied_postgis_layer.setVisibility(true);
	//proxied_postgis_layer.refresh(); 
}


