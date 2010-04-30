/* 
	global variables
*/
var map;
var spearfish;

function init() {			
	
	var lon = -103.7455;
	var lat = 44.4363;							
	var zoom = 10;

	var wms_server_url = "http://geoweb:8399/arcgis/services/uc2009/spearfish/MapServer/WMSServer";
	var sld_url = "http://sazabi:8080/openlayers-2.8/openlayers/2.8+/playground/sld/raster-symbolizer/ags-rastersymbolizer-spearfish.xml";	
	
	var options = 	{
		controls: [ 
       		new OpenLayers.Control.PanZoom2(),
			new OpenLayers.Control.ArgParser(),
            new OpenLayers.Control.LayerSwitcher2(),
            new OpenLayers.Control.Navigation(),
			new OpenLayers.Control.MousePosition()
       	],
		projection: "EPSG:4326",		        		        	
		maxResolution: 0.3515625,		        	        
		maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90)
	};
								
	map = new OpenLayers.Map('map', options);
							
	var agsTiledLayer = new OpenLayers.Layer.AgsTiled( 
		"ESRI_Imagery_World_2D", 
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer/tile/",
		//"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/tile/", 
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
	
	spearfish = new OpenLayers.Layer.WMS(   
										"Spearfish DEM", 
										wms_server_url,
										{ 																									
											//layers: "0",
											layers: "spearfish",  											
											styles: "",																																																																	
											srs: "EPSG:4326",											
											format: "image/png",
											sld: sld_url,
											exceptions: "text/xml",																
											transparent: true,											
											//bgcolor: "0x000000"											
										},
										{											 													
											isBaseLayer: false,
											singleTile: true,
											displayOutsideMaxExtent: true													
										}
									);									
	spearfish.setOpacity(0.72);								
	spearfish.setVisibility(false);
	map.addLayer(spearfish);	
	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);		
}

function donothing() {
	spearfish.mergeNewParams(
		{
			styles: "donothing"
		}
	);
}

function doShadedrelief() {
	spearfish.mergeNewParams(
		{
			styles: "shadedrelief"
		}
	);	
}

function doShadedreliefChannel() {
	spearfish.mergeNewParams(
		{
			styles: "shadedrelief_channel"
		}
	);	
}

function doChannels() {
	spearfish.mergeNewParams(
		{
			styles: "channels"
		}
	);
}

function doChannelsReverse() {
	spearfish.mergeNewParams(
		{
			styles: "channels_reverse"
		}
	);
}

function doChannelsMono() {
	spearfish.mergeNewParams(
		{
			styles: "channels_mono"
		}
	);
}

function doChannelsSelection() {
	spearfish.mergeNewParams(
		{
			styles: "channels_selection"
		}
	);
}

function doContrastNormalize() {
	spearfish.mergeNewParams(
		{
			styles: "contrast_normalize"
		}
	);
}

function doContrastHistogram() {
	spearfish.mergeNewParams(
		{
			styles: "contrast_histogram"
		}
	);
}

function doContrastGamma() {
	spearfish.mergeNewParams(
		{
			styles: "contrast_gamma"
		}
	);
}

function doColormap1() {
	spearfish.mergeNewParams(
		{
			styles: "colormap_1"
		}
	);	
}

function doColormap2() {
	spearfish.mergeNewParams(
		{
			styles: "colormap_2"
		}
	);	
}
