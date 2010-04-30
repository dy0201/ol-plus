var map;         
	
function init()	{

	var lon = -122.391667;
	var lat = 37.760628;
    var zoom = 10;
	
    OpenLayers.ProxyHost="/openlayers-2.8/ApacheProxyServlet?resourceUrl=";

    var options = {
   		controls: [
       		new OpenLayers.Control.LayerSwitcher2(),
       		new OpenLayers.Control.Navigation(),
       		new OpenLayers.Control.PanZoom2()
       	],
        projection: "EPSG:4326",		        		        	
   		maxResolution: 0.3515625,		        	        
        maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90)
   	};


    map = new OpenLayers.Map('map', options);

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
	// functional out of the box
    var pizzastores_100 = new OpenLayers.Layer.WFS( 
        "pizzastores",
        "http://sazabi/arcgis/services/sanfrancisco/geodataserver/wfsserver?",
        {
            typename: "pizzastores", 
            maxfeatures: 1000
        },
        { 
        	geometry_column: "Shape",
			format: OpenLayers.Format.GML.v2,
        	formatOptions: {
				featureType: "pizzastores",
				featureNS: "http://www.esri.com",
				geometryName: "Shape",
				extractAttributes: true,
				srsName: "EPSG:4326",
				xy: true // coordinates in [lon,lat] order
        	},
            isBaseLayer: false
        }
    );
    pizzastores_100.setVisibility(false);

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
    map.addLayers([pizzastores_100, highways_100, blockgroups_100]);
	            	                    
    
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
    map.addLayers([pizzastores_110, highways_110, blockgroups_110]);
    */
    map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}
