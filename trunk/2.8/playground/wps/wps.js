var map;
var vectorLayer;

var wps_format = new OpenLayers.Format.WPS();
var json_format = new OpenLayers.Format.JSON();

function init() {			
	
	OpenLayers.ProxyHost= "/openlayers-2.8/ApacheProxyServlet?resourceUrl=";
	
	var lon = -122.391667;
	var lat = 37.760628;							
	var zoom = 10;
	
	var options = 	{
		controls: [ // 
       		new OpenLayers.Control.PanZoom2(),
			new OpenLayers.Control.ArgParser(),
            //new OpenLayers.Control.Attribution(),
            //new OpenLayers.Control.KeyboardDefaults(),
            new OpenLayers.Control.LayerSwitcher2(),
			new OpenLayers.Control.MousePosition(),
            //new OpenLayers.Control.OverviewMap(),
            new OpenLayers.Control.Navigation()
       	],
		projection: "EPSG:4326",		        		        	
		maxResolution: 0.3515625,		        	        
		maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90)
	};							
	map = new OpenLayers.Map('map', options);
				
	var agsTiledLayer = new OpenLayers.Layer.AgsTiled( 
		"AgsTiled Layer", 
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
	
	vectorLayer = new OpenLayers.Layer.Vector("WPS Results");
	map.addLayer(vectorLayer);	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);	
}

function capabilitiesLoadComplete(request) {	
	capabilities = wps_format.read(request.responseXML || request.responseText);
   	OpenLayers.Console.debug("...service type: " + capabilities.service + "...service version: " + capabilities.version + "...");
	if(capabilities && capabilities.processOfferings instanceof Array) {
		for(var i=0; i<capabilities.processOfferings.length; i++) {
			var process = capabilities.processOfferings[i];
			OpenLayers.Console.debug("...process: " + process.identifier + "...processVersion: " + process.processVersion + "...");
		}	
	} else {
		OpenLayers.Console.debug("... no process found...");
	}	
}

function processDescriptionsLoadComplete(request) {
	var processDescriptions = wps_format.read(request.responseXML || request.responseText);
	OpenLayers.Console.debug("...omit details of DescribeProcess response...");
	OpenLayers.Console.debug("...processDescriptions parsed...");
}

function executeResponseLoadComplete(request) {
	var executeResponse = wps_format.read(request.responseXML || request.responseText);
	OpenLayers.Console.debug("...executeResponse parsed...");
}

function executeComplete(response) {
	var wfst2_format = new OpenLayers.Format.WFST2(
		{
			version:"1.0.0",
			featureNS: "http://www.esri.com",
    		featurePrefix: "highways",
			featureType: "highways",
			extractAttributes: false,
			xy: true
		}
	);
	var features = wfst2_format.read(response.responseXML);
	vectorLayer.addFeatures(features);
}

function parse() {		
	//OpenLayers.loadURL("http://10.49.52.177:8080/52n-wps-webapp-2.0-rc5-SNAPSHOT/WebProcessingService?Request=GetCapabilities&Service=WPS&Version=1.0.0", null, null, capabilitiesLoadComplete);	
	OpenLayers.loadURL("http://10.49.52.177:8080/52n-wps-webapp-2.0-rc5-SNAPSHOT/WebProcessingService?Request=DescribeProcess&service=WPS&identifier=org.n52.wps.server.algorithm.SimpleBufferAlgorithm", null, null, processDescriptionsLoadComplete);
	//OpenLayers.loadURL("execute_response_responsedocument.xml", null, null, executeResponseLoadComplete);
}

function execute() {
		
	OpenLayers.loadURL(
		// create wps execute request for 'SimpleBufferAlgorithm' process	
		"request/52n_wps_server_aimplebufferalgorithm_execute_rawdataoutput.json",
		// create wps execute request for 'hillshade' process
		// "request/52n_wps_sextante_hillshade_execute_responsedocument.json",
		// create wps execute request for 'contourline' process
		// "request/52n_wps_sextante_contourline_execute_rawdataoutput.json",
		{}, // request parameters
		this,
		function(response) { // success handler
			// read wps execute request information from a json string 
			var reqObj = json_format.read(response.responseText);
			// assemble the wps execute request
			var req = wps_format.writeNode("wps:Execute", reqObj);
			var reqXml = wps_format.write(req);
			// print out the request xml body
		    OpenLayers.Console.debug(reqXml);
		    // send the request
			/*
			OpenLayers.Request.POST({
		        url: "http://10.49.52.177:8080/52n-wps-webapp-2.0-rc5-SNAPSHOT/WebProcessingService",
		        callback: function(response) {},
		        params: {},
		        headers: {},
		        data: data
		    }); 
			*/		
		}, 
		function(response) {} // error handler 
	);	
}

