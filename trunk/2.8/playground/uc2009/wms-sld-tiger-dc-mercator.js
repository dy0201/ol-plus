// global variables
var map;

function init() {			
	// initialize the OpenLayers map with some options
	var options = {		
		projection: "EPSG:900913",					// map porjection is Google Maps web mercator (EPSG:900913 in OpenLayers but EPSG:102113 in ArcGIS Server)
		units: "m",									// map unit
		maxResolution: 156543.0339,					// maximum resolution	
		maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),		// maximum extent
		controls: [		      
			new OpenLayers.Control.LayerSwitcher2(),	// pan and zoom bar	
			new OpenLayers.Control.Navigation(),		// more like a simple table of content
			new OpenLayers.Control.PanZoom2(),			// mouse panning and zooming on map	
		],
	};								
	map = new OpenLayers.Map('map', options);
	 					
	var gSatellite = new OpenLayers.Layer.Google( // add base layer from Google Maps 
		"Google Satellite", 
		{	
			type: G_SATELLITE_MAP,
			'sphericalMercator': true, 
			'maxZoomLevel':18
		}
	); 
	map.addLayer(gSatellite);					

	var tiger_dc = new OpenLayers.Layer.WMS(   
		"Washington D.C", 														// give layer a name
		"http://sazabi/arcgis/services/uc2009/tiger_dc/MapServer/WMSServer",	// WMS base url
		{ 																									
			version: "1.3.0",													// consume an 1.3.0 WMS
			layers: "1,0,2",  													// request three WMS layers
																				/* mimic GMaps look and feel */	
			styles: "gmaps,gmaps,gmaps",										// assign different named-styles to layers, although they all have the same name "gmaps" but they are different 																																																						
			crs: "EPSG:102113",													// request map in web mercator projection												
			format: "image/png",
			sld: "http://sazabi:8080/openlayers-2.8/openlayers/2.8+/playground/uc2009/sld/dc_styles_ags.xml", // reference the SLD with style definitions 		
			bgcolor: "0xEDEAE2",												// background color				
			transparent: "false",												// not transparent
		},
		{											 													
			isBaseLayer: false,
			singleTile: true,
			displayOutsideMaxExtent: true													
		}
	);									
	tiger_dc.setOpacity(0.81);								
	tiger_dc.setVisibility(false);
	map.addLayer(tiger_dc);	
	
	// center map to (-77.03763, 38.89649), where White House is located and zoom to level 12 
	var lon = -77.03763;
	var lat = 38.89649;							
	var zoom = 13;
	
	// since map is in mercator projection so convert the coordinates first 
	var center_mercator = OpenLayers.Layer.SphericalMercator.forwardMercator(lon, lat);
	center_mercator_x = center_mercator.lon;
	center_mercator_y = center_mercator.lat;
	
	map.setCenter(new OpenLayers.LonLat(center_mercator_x, center_mercator_y), zoom);
}
