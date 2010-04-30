/*
 * wms-getfeatureinfo-simple, simply send GetFeatureInfo request with xsl template - 
 * - http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_html_div_red.xsl -
 * - display response html (contains table only) in popup.  
 */
var map;
var popup;
        
function init() {    
	OpenLayers.ProxyHost= "/openlayers-2.8/ApacheProxyServlet?resourceUrl=";
    
	var AutoSizeFramedCloud = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
        'autoSize': true
    });
	
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
		"esri_street_map", 
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/tile/", 
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
    
    // WMS layers
    var blockgroups = new OpenLayers.Layer.WMS(   
    	"Blockgroups", 
    	"http://4682_OGC_OPEN_0/arcgis/services/sanfrancisco/MapServer/WMSServer?",
    	//"http://sazabi:8080/geoserver/wms?",
		{ 																									
			layers: "blockgroups",
			//layers: "esri:sf_blockgroups",
			styles: "",																																																																	
			srs: "EPSG:4326",											
			format: "image/png",				
			exceptions: "text/xml",																
			transparent: true																	
		},
		{											 													
			isBaseLayer: false,
			singleTile: true,
			displayOutsideMaxExtent: true														
		}
	);									
    blockgroups.setOpacity(0.49);								
    blockgroups.setVisibility(false);
    map.addLayer(blockgroups);

    var highways = new OpenLayers.Layer.WMS(   
    	"Highways", 
    	"http://4682_OGC_OPEN_0/arcgis/services/sanfrancisco/MapServer/WMSServer?",
    	//"http://sazabi:8080/geoserver/wms?",
		{ 																									
			layers: "highways",
			//layers: "esri:sf_highways",
			styles: "",																																																																	
			srs: "EPSG:4326",											
			format: "image/png",				
			exceptions: "text/xml",																
			transparent: true																	
		},
		{											 													
			isBaseLayer: false,
			singleTile: true,
			displayOutsideMaxExtent: true														
		}
	);									
	highways.setOpacity(1.0);								
	highways.setVisibility(true);
    map.addLayer(highways);   
    
    var pizzastores = new OpenLayers.Layer.WMS(   
    	"Pizzastores", 
    	"http://4682_OGC_OPEN_0/arcgis/services/sanfrancisco/MapServer/WMSServer?",
    	//"http://sazabi:8080/geoserver/wms?",
		{ 																									
			layers: "pizzastores",  											
			//layers: "esri:sf_pizzastores",
			styles: "",																																																																	
			srs: "EPSG:4326",											
			format: "image/png",				
			exceptions: "text/xml",																
			transparent: true																	
		},
		{											 													
			isBaseLayer: false,
			singleTile: true,
			displayOutsideMaxExtent: true														
		}
	);									
	pizzastores.setOpacity(1.0);								
	pizzastores.setVisibility(true);
    map.addLayer(pizzastores);   
    
    var info_ctrl = new OpenLayers.Control.WMSGetFeatureInfo({
        url: 'http://4682_OGC_OPEN_0/arcgis/services/sanfrancisco/MapServer/WMSServer?',
    	//url: 'http://sazabi:8080/geoserver/wms?',
        title: 'Identify',
        layers: [pizzastores, highways, blockgroups],
        queryVisible: true,
        // overwrite any parameters in WMS GetFeatureInfo request
        vendorParams: {    	
    		version: "1.1.1",
    		xsl_template: "http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_html_div_red.xsl"
    	},
    	handlerOptions: {
    	}
    });
    map.addControl(info_ctrl);
    info_ctrl.events.register("getfeatureinfo", this, displayGetFeatureInfoResp);
    info_ctrl.activate();
        
    var lon = -122.40609;
	var lat = 37.75560;
    var zoom = 10;
    	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);    
}

function displayGetFeatureInfoResp(evt) {
    if(popup != null) {
    	map.removePopup(popup);
    	popup.destroy();
        popup = null;
    }   
    popup = new OpenLayers.Popup.FramedCloud(
		"GetFeatureInfo Results",     	
    	map.getLonLatFromPixel(evt.xy),    	
        new OpenLayers.Size(640, 240),
        "",
        // anchor for the popup
        {
    		size: new OpenLayers.Size(10,10),
    		offset: new OpenLayers.Pixel(0,0)
        },
        true,
        null
    );
    popup.autoSize = true;    
    //popup.closeOnMove = true; // causes problem when you scroll the content in popup, base map can't be moved any more. 
    popup.setBackgroundColor("white");
    popup.setBorder("1px");
    popup.contentDiv.style.overflow = "auto";
    popup.setContentHTML(evt.text);
    /*
    popup.setContentHTML(
    	"<iframe src=\'" + 
    	"http://sazabi:8080/geoserver/ows?REQUEST=GetFeatureInfo&SERVICE=WMS&VERSION=1.1.1&LAYERS=esri:world_cities,esri:world_rivers,esri:world_lakes,esri:world_country&STYLES=&FORMAT=image/png&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&SRS=EPSG:4326&BBOX=-108.730396161213,21.5347883575624,-57.3551989876466,62.8397641582368&WIDTH=602&HEIGHT=484&QUERY_LAYERS=esri:world_cities,esri:world_rivers,esri:world_lakes,esri:world_country&X=348&Y=233&INFO_FORMAT=text/html"
    	+ "\'></iframe>"    	
    );
    */
    map.addPopup(popup);
    popup.show();
}