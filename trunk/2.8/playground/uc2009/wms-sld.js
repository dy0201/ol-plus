/* 
	global variables
*/
var map;

function init() {			
	
	var lon = -122.391667;
	var lat = 37.760628;							
	var zoom = 10;

	var wms_server_url = "http://sazabi/arcgis/services/uc2009/sanfrancisco_sld/MapServer/WMSServer";
	var sld_url = "http://sazabi:8080/openlayers-2.8/openlayers/2.8+/playground/uc2009/sld/sld_sf_client2.xml";	
	
	var options = 	{
		controls: [ 
       		new OpenLayers.Control.PanZoom2(),
			new OpenLayers.Control.ArgParser(),
            new OpenLayers.Control.LayerSwitcher2(),
            new OpenLayers.Control.Navigation()
       	],
		projection: "EPSG:4326",		        		        	
		maxResolution: 0.3515625,		        	        
		maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90)
	};
								
	map = new OpenLayers.Map('map', options);
							
	var agsTiledLayer = new OpenLayers.Layer.AgsTiled( 
		"ESRI_Imagery_World_2D", 
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer/tile/", 
		{					
			tileSize: new OpenLayers.Size(512, 512),
			tileFormat:'jpg',
			tileOrigin: new OpenLayers.LonLat(-180, 90),
			tileFullExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
			isBaseLayer: true,
			singleTile: false					 					
		}
	);  
	map.addLayer(agsTiledLayer);	
	
	var blockgroups = new OpenLayers.Layer.WMS(   
										"blockgroups", 
										wms_server_url,
										{ 																									
											layers: 'blockgroups',  
											//styles: '',
											styles: 'Population',																																													
											srs: 'EPSG:4326',											
											format: 'image/png',											
											transparent: true
										},
										{											 													
											isBaseLayer: false,
											singleTile: true,
											displayOutsideMaxExtent: true													
										}
									);									
	blockgroups.setOpacity(0.64);								
	blockgroups.setVisibility(false);
	map.addLayer(blockgroups);
	
	var highways = new OpenLayers.Layer.WMS(   
										"highways", 
										wms_server_url, 
										{ 																									
											layers: 'highways',
											styles: 'road_types',
											//styles: '',																																																																													
											srs: 'EPSG:4326',																																									
											format:'image/png',	
											sld: "http://sazabi:8080/openlayers-2.8/openlayers/2.8+/playground/uc2009/sld/sld_sf_client2.xml",											
											transparent: true
										},
										{											 													
											isBaseLayer: false,
											singleTile: true,
											displayOutsideMaxExtent: true													
										}
									);
																	
	highways.setVisibility(false);
	map.addLayer(highways);	
	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);		
}
