var map;
        
function init() {    
	// confgiure the proxy for JavaScript to request data cross domain 
	OpenLayers.ProxyHost= "/openlayers-2.8/ApacheProxyServlet?targetUrl=";
    
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
    var base_layer = new OpenLayers.Layer.AgsTiled( 
		"I3_Imagery_Prime_World_2D", 
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

    // consume a WFS 1.0.0 service from ArcGIS Server
	var wfs_layer_100 = new OpenLayers.Layer.Vector(
    	"ArcGIS Server WFS 1.0.0", 
    	{
    		strategies: [new OpenLayers.Strategy.BBOX()],
    		protocol: new OpenLayers.Protocol.WFS(    			    			    				
    			{
    				url: "http://sazabi/arcgis/services/sanfrancisco/geodataserver/WFSServer?",
        			format: new OpenLayers.Format.WFST({
        				version: "1.0.0",
    					srsName: "EPSG:4326",
    					schema: "http://sazabi/arcgis/services/sanfrancisco/geodataserver/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:pizzastores",
    					featureType: "pizzastores",
    					//schema: "http://sazabi/arcgis/services/sanfrancisco/geodataserver/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:highways",
    					//featureType: "highways",
    					//schema: "http://sazabi/arcgis/services/sanfrancisco/geodataserver/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:blockgroups",
    					//featureType: "blockgroups",
    					geometryName: "Shape",
    					featureNS: "http://www.esri.com",
    					featurePrefix: "esri",
    					maxFeatures: 999,
    					xy: true
    				})
    			}
			)    			
    	}
    );
	wfs_layer_100.setVisibility(false);
	
	// consume a WFS 1.1.0 service from ArcGIS Server
    var wfs_layer_110 = new OpenLayers.Layer.Vector(
    	"ArcGIS Server WFS 1.1.0", 
    	{
    		strategies: [new OpenLayers.Strategy.BBOX()],
    		protocol: new OpenLayers.Protocol.WFS(    			    			    				
    			{
    				url: "http://sazabi/arcgis/services/sanfrancisco/geodataserver/WFSServer?",
        			format: new OpenLayers.Format.WFST({
        				version: "1.1.0",
    					srsName: "EPSG:4326",
    					//schema: "http://sazabi/arcgis/services/sanfrancisco/geodataserver/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:pizzastores",
    					//featureType: "pizzastores",
    					schema: "http://sazabi/arcgis/services/sanfrancisco/geodataserver/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:highways",
    					featureType: "highways",
    					//schema: "http://sazabi/arcgis/services/sanfrancisco/geodataserver/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:blockgroups",
    					//featureType: "blockgroups",
    					geometryName: "Shape",
    					featureNS: "http://www.esri.com",
    					featurePrefix: "esri",    					
    					xy: false
    				}),					
    			}
			)    			
    	}
    );
	wfs_layer_110.setVisibility(false);	
    map.addLayers([wfs_layer_100, wfs_layer_110]);
	
	// center map to (-122.391667, 37.760628), where San Francisco is located and zoom to level 10
	var lon = -122.391667;
	var lat = 37.760628;
    var zoom = 12;
    map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}
