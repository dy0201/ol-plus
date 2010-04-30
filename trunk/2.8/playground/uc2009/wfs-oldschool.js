var map;         
	
function init()	{
	// confgiure the proxy for JavaScript to request data cross domain 	
    OpenLayers.ProxyHost="/openlayers-2.8/ApacheProxyServlet?resourceUrl=";

    // initialize the OpenLayers map with some options	
	var options = 	{		
		projection: "EPSG:4326",								// map porjection is WGS:84 (EPSG:4326)	        		        	
		maxResolution: 0.3515625,								// maximum resolution		        	        
		maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),	// maximum extent
		controls: [ 
       		new OpenLayers.Control.PanZoom2(),					// pan and zoom bar						
            new OpenLayers.Control.LayerSwitcher2(),			// more like a simple table of content
            new OpenLayers.Control.Navigation()					// mouse panning and zooming on map
       	]
	};								
	map = new OpenLayers.Map('map', options);					// give an id of DIV in html to create map
	
	/*
	 * base layer
	 */
    var base_layer  = new OpenLayers.Layer.AgsTiled( 
   		"I3_Imagery_Prime_World", 
   		"http://server.arcgisonline.com/ArcGIS/rest/services/I3_Imagery_Prime_World_2D/MapServer/tile/", 
   		{					
   			tileSize: new OpenLayers.Size(512, 512),
   			tileFormat:'jpg',
   			tileOrigin: new OpenLayers.LonLat(-180, 90),
   			tileFullExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
   			isBaseLayer: true,
   			singleTile: false					 					
   		}
   	);
    map.addLayer(base_layer);

	// working with ArcGIS Server WFS Service 1.0.0  
	// the old way: OpenLayers.Layer.WFS
    var pizzastores_100 = new OpenLayers.Layer.WFS( 
        "pizzastores",																// give a layer name
        "http://sazabi/arcgis/services/sanfrancisco/geodataserver/wfsserver?",		// WFS base url
        {
            typename: "pizzastores", 												// WFS feature type name            
        },
        { 
        	geometry_column: "Shape",												// Geometry attribute name of each feature
			format: OpenLayers.Format.GML.v2,										// Format (GML2) to parse GML response
        	formatOptions: {														// Necessary information to parse GML correctly
				featureType: "pizzastores",											// WFS feature type name, also the xml element name for each feature in GML
				featureNS: "http://www.esri.com",									// Name space URI for each feature member in GML
				geometryName: "Shape",												// Geometry attribute name of each feature
				extractAttributes: true,											// Whether to parse non-spatial attributes or not
				srsName: "EPSG:4326",												// Coordinate system of each feature in GML
				xy: true // coordinates in [lon,lat] order							// is coordinates in [lon, lat] order or the reverse way
        	},
            isBaseLayer: false
        }
    );
    pizzastores_100.setVisibility(false);
	map.addLayer(pizzastores_100);
	
	/*
	var highways_100 = new OpenLayers.Layer.WFS( 
        "highways",
        "http://sazabi/arcgis/services/sanfrancisco/geodataserver/wfsserver?",
        {
            typename: "highways", 
            maxfeatures: 1000
        },
        { 
        	geometry_column: "Shape",
			format: OpenLayers.Format.GML.v2,
        	formatOptions: {
				featureType: "highways",
				featureNS: "http://www.esri.com",
				geometryName: "Shape",
				extractAttributes: true,
				srsName: "EPSG:4326",
				xy: true // coordinates in [lon,lat] order
        	},
            isBaseLayer: false
        }
    );
    highways_100.setVisibility(false);
	map.addLayer(highways_100);

    var blockgroups_100 = new OpenLayers.Layer.WFS( 
        "blockgroups",
        "http://sazabi/arcgis/services/sanfrancisco/geodataserver/wfsserver?",
        {
            typename: "blockgroups", 
            maxfeatures: 49
        },
        { 
        	geometry_column: "Shape",
			format: OpenLayers.Format.GML.v2,
        	formatOptions: {
				featureType: "blockgroups",
				featureNS: "http://www.esri.com",
				geometryName: "Shape",
				extractAttributes: true,
				srsName: "EPSG:4326",
				xy: true // coordinates in [lon,lat] order
        	},
            isBaseLayer: false
        }
    );
    blockgroups_100.setVisibility(false);
    map.addLayer(blockgroups_100);       	                    
    */
	
    // working with ArcGIS Server WFS Service 1.1.0 
    // BBOX filter encoded by OpenLayers.Layer.WFS is always in [lon,lat] order, and you can't turn BBOX off without replacing it with another filter
    // the easiest way to make it work with ArcGIS Server WFS 1.1.0 
	//   you need a patch to flip the order of the x and y in BBOX based on 'formatOption.xy'
    /*
	var pizzastores_110 = new OpenLayers.Layer.WFS( 
        "pizzastores",
        "http://sazabi/arcgis/services/sanfrancisco/geodataserver/wfsserver?",
        {
        	// you have to make them upper case so they won't be overwritten, a bug in OL
        	TYPENAME: "pizzastores",
            VERSION: "1.1.0" 
        },
        { 
        	geometry_column: "Shape",
			format: OpenLayers.Format.GML.v3,
        	formatOptions: {
				featureType: "pizzastores",
				featureNS: "http://www.esri.com",
				geometryName: "Shape",
				extractAttributes: true,
				srsName: "EPSG:4326",
				xy: false // coordinates in [lat,lon] order
        	},
            isBaseLayer: false
        }
    );
    pizzastores_110.setVisibility(false);
	map.addLayer(pizzastores_110); 
	*/
	
    var highways_110 = new OpenLayers.Layer.WFS( 
        "highways",
        "http://sazabi/arcgis/services/sanfrancisco/geodataserver/wfsserver?",
        {
        	TYPENAME: "highways", 
            VERSION: "1.1.0" // you have to make it upper case so it won't be overwritten, a bug in OL
        },
        { 
        	geometry_column: "Shape",
			format: OpenLayers.Format.GML.v3,
        	formatOptions: {
				featureType: "highways",
				featureNS: "http://www.esri.com",
				geometryName: "Shape",
				extractAttributes: true,
				srsName: "EPSG:4326",
				xy: false // coordinates in [lat,lon] order
        	},
            isBaseLayer: false
        }
    );
    highways_110.setVisibility(false);
    map.addLayer(highways_110);

    var blockgroups_110 = new OpenLayers.Layer.WFS( 
        "blockgroups",
        "http://sazabi/arcgis/services/sanfrancisco/geodataserver/wfsserver?",
        {
        	TYPENAME: "blockgroups", 
            VERSION: "1.1.0", // you have to make it upper case so it won't be overwritten, a bug in OL
            maxfeatures: 49
        },
        { 
        	geometry_column: "Shape",
			format: OpenLayers.Format.GML.v3,
        	formatOptions: {
				featureType: "blockgroups",
				featureNS: "http://www.esri.com",
				geometryName: "Shape",
				extractAttributes: true,
				srsName: "EPSG:4326",
				xy: false // coordinates in [lat,lon] order
        	},
            isBaseLayer: false
        }
    );
    blockgroups_110.setVisibility(false);
    map.addLayer(blockgroups_110);
	
	// center map to (-122.391667, 37.760628), where San Francisco is located and zoom to level 10
	var lon = -122.391667;
	var lat = 37.760628;
    var zoom = 10;
    map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}
