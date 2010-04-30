var map = null;
var agsLocator = null;

function init() {
	// this is where Portland is
	var lon = -122.838493;
	var lat = 45.432976;
	var zoom = 13;							
	
	OpenLayers.ProxyHost= "/openlayers/ApacheProxyServlet?targetUrl=";
    
	var options = 	{
		//panMethod: null, // set 'panMethod' to null to disable animated panning
		controls: [
       		new OpenLayers.Control.LayerSwitcher(),
			//new OpenLayers.Control.LayerSwitcher2(),
       		new OpenLayers.Control.Navigation(),
       		new OpenLayers.Control.PanZoom(),
			//new OpenLayers.Control.PanZoom2(),
       		new OpenLayers.Control.MousePosition()
       	],
        projection: "EPSG:4326",		        		        	
   		maxResolution: 0.3515625,		        	        
        maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),        
   	};

    map = new OpenLayers.Map('map', options);
	
    var base_layer = new OpenLayers.Layer.AgsTiled( 
		"esri_street_map", 
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer/tile/", 
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
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);				
	
	// initialize agsLocator
	agsLocator = new OpenLayers.Control.AgsLocator(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer",
		null,
		[
			function(olFeatures) {			
				var address = "";
				for(key in olFeatures[0].attributes) {
					if(typeof olFeatures[0].attributes[key] === "string") {
						address = address + " " + olFeatures[0].attributes[key];
					}
				}
				OpenLayers.Console.log("address found: " + address);
				OpenLayers.Console.log("address match score: " + olFeatures[0].attributes['score']);
			}, 
			function(olFeatures) {
				OpenLayers.Console.log("...you can pass in multiple callback functions...");
			}
		],
		{
			mode: "draw", // do reverse geocoding by hand drawing a geometry on map 
			drawCtrlHandler: OpenLayers.Handler.Point, // reverse geocoding with hand-draw polygon
			drawCtrlHandlerOptions: {
				handlerOptions: {
					keyMask: OpenLayers.Handler.MOD_CTRL // enable geomerty drawing by holding 'Ctrl' key
				}
			}
		}
	);				
	map.addControl(agsLocator);
	agsLocator.activate();
	agsLocator.setReverseGeocoding(true);
}

function toggleMode() {
	if(agsLocator.mode == "draw") {
		agsLocator.switchMode("select");
		document.getElementById('toggle_mode_btn').value = "Select Mode (click to toggle)";
	} else if(agsLocator.mode == "select") {
		agsLocator.switchMode("draw");
		document.getElementById('toggle_mode_btn').value = "Draw Mode (click to toggle)";
	}
}

function toggleMode2() {
	if(agsLocator.reverseGeocoding == true) {
		agsLocator.setReverseGeocoding(false);
		document.getElementById('toggle_mode_btn2').value = "Geocoding Mode (click to toggle)";
	} else {
		agsLocator.setReverseGeocoding(true);
		document.getElementById('toggle_mode_btn2').value = "Reverse Geocoding Mode (click to toggle)";
	}
}

function cleanup() {
	agsLocator.cleanupResults();
};

function doGeocoding() {
	var address = {};
	address['address'] = "15960 SW LOON DR";
	address['city'] = "BEAVERTON";
	address['state'] = "OR";
	address['zip'] = "97007";
	
	var parameters = {};
	parameters['address'] = address;
	parameters['outFields'] = ["StreetName", "City", "State", "ZIP"];
	
	agsLocator.setReverseGeocoding(false);	
	agsLocator.execute(
		null,
		parameters,
		[
			function(olFeatures) {
				for(var i=0; i<olFeatures.length; i++) {
					var address = "";							
					for(key in olFeatures[i].attributes) {
						if(typeof olFeatures[i].attributes[key] === "string") {
							address = address + " " + olFeatures[i].attributes[key];
						}
					}
					OpenLayers.Console.debug("address found: " + address);
					OpenLayers.Console.debug("address match score: " + olFeatures[i].attributes['score']);
				}								
			}
		]
	);		
}
