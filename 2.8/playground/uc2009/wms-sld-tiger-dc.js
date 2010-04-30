// global variables
var map;

function init() {			

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
	var tiger_dc = new OpenLayers.Layer.WMS(   
										"Washington D.C",		// give it a layer name
										"http://sazabi/arcgis/services/uc2009/tiger_dc/MapServer/WMSServer",
	/* WMS parameters */				{ 																									
											layers: "1,0,2",  	
											styles: "",																																																																
											srs: "EPSG:4326",		// can be omitted, take from map										
											format: "image/png",	// can be omitted, default as png			
											bgcolor: "0xEDEAE2",	// can be omitted, default transparent background
											transparent: "false",											
										},
	/* OpenLayers parameters */			{											 																								
											singleTile: true																							
										}
									);									
	//tiger_dc.setOpacity(0.81);				// set opacity of overlay WMS layer							
	//tiger_dc.setVisibility(false);			// do not turn it on initially 
	map.addLayer(tiger_dc);					// add the WMS layer in map	
		
	// center map to (-77.03763, 38.89649), where White House is located and zoom to level 12 
	var lon = -77.03763;
	var lat = 38.89649;							
	var zoom = 12;	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);		
}
