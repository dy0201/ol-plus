/* 
	global variables
*/
var map;
var fire;
var dates;
var cursor;
var intervalId;

var fire_previous;
var fire_next;


function init() {			
	
	var lon = -110.3540;
	var lat = 44.6386;							
	var zoom = 7;

	var wms_server_url = "http://geoweb:8399/arcgis/services/uc2009/fire/MapServer/WMSServer";
	//var sld_url = "http://sazabi:8080/openlayers-2.8/openlayers/2.8+/playground/sld/time/f88perim.xml";		
	
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
	
	dates = [];
	dates.push("1988-06-30T00:00:00/1988-07-01T00:00:00/PT1H");
	for(var i=1; i<=31; i++) {
		if(i<10) {
			dates.push("1988-06-30T00:00:00/1988-07-0" + i + "T00:00:00/PT1H");	
		} else {
			dates.push("1988-06-30T00:00:00/1988-07-" + i + "T00:00:00/PT1H");
		}		
	}
	for(var i=1; i<=31; i++) {
		if(i<10) {
			dates.push("1988-06-30T00:00:00/1988-08-0" + i + "T00:00:00/PT1H");	
		} else {
			dates.push("1988-06-30T00:00:00/1988-08-" + i + "T00:00:00/PT1H");
		}
	}
	for(var i=1; i<=30; i++) {
		if(i<10) {
			dates.push("1988-06-30T00:00:00/1988-09-0" + i + "T00:00:00/PT1H");	
		} else {
			dates.push("1988-06-30T00:00:00/1988-09-" + i + "T00:00:00/PT1H");
		}
	}
	for(var i=1; i<=1; i++) {
		dates.push("1988-06-30T00:00:00/1988-10-0" + i + "T00:00:00/PT1H");
	}

	cursor = 0;
	
	fire = new OpenLayers.Layer.WMS(   
										"Fire", 
										wms_server_url,
										{ 																									
											layers: "fire",  											
											styles: "",																																																																	
											srs: "EPSG:4326",											
											format: "image/png8",
											//sld: sld_url,
											exceptions: "text/xml",																
											transparent: true,											
											//bgcolor: "0x000000"
											time: dates[0]											
										},
										{											 													
											isBaseLayer: false,
											singleTile: true,
											displayOutsideMaxExtent: true,
											displayInLayerSwitcher: false													
										}
									);									
	//fire.setOpacity(0.49);								
	fire.setVisibility(true);
	//map.addLayer(fire);
	fire_next = fire;
	fire_previous = fire;	
	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);		
}

function previous() {
	if(cursor > 0) {
		cursor--;		
	}	
	var timeStr = dates[cursor];
	OpenLayers.Console.debug(timeStr);
	fire.mergeNewParams(
		{
			time: timeStr
		}
	);
}

function next() {
	if(cursor < dates.length-1) {
		cursor++;		
	} else {				
		cursor = 0;
		stop();
		return;
	}	
	var timeStr = dates[cursor];
	OpenLayers.Console.debug(timeStr);
	document.getElementById("time").innerHTML = "Date: " + timeStr;
	fire_previous = fire_next;
	fire_next = fire_next.clone();	
	fire_next.mergeNewParams(
		{
			time: timeStr
		}
	);
	map.addLayer(fire_next);
	if(fire_previous != fire_next) {
		//map.removeLayer(fire_previous, false);
	}
}

function start() {
	intervalId = window.setInterval(next, 200);
}

function stop() {
	if(intervalId) {
		window.clearInterval(intervalId);
	}
}

