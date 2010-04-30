var map;
        
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

    // consume a WFS 1.1.0 service from ArcGIS Server
    var lon = -122.391667;
	var lat = 37.760628;
    var zoom = 10;
    
	var wfs_layer = new OpenLayers.Layer.Vector(
    	"ArcGIS Server WFS", 
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
	/*
    var wfs_layer = new OpenLayers.Layer.Vector(
    	"ArcGIS Server WFS", 
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
    					//schema: "http://sazabi/arcgis/services/sanfrancisco/geodataserver/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:highways",
    					//featureType: "highways",
    					schema: "http://sazabi/arcgis/services/sanfrancisco/geodataserver/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:blockgroups",
    					featureType: "blockgroups",
    					geometryName: "Shape",
    					featureNS: "http://www.esri.com",
    					featurePrefix: "esri",
    					maxFeatures: 999,
    					xy: false
    				})
    			}
			)    			
    	}
    );
	*/
	wfs_layer.setVisibility(false);
    map.addLayer(wfs_layer);
    map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}
