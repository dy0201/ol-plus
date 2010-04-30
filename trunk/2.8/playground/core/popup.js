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
		//"http://4682_OGC_OPEN_0/arcgis/services/sanfrancisco/MapServer/WMSServer?",
    	"http://sazabi:8080/geoserver/wms?",
		{ 																									
			layers: "esri:sf_blockgroups",  											
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
    	//"http://4682_OGC_OPEN_0/arcgis/services/sanfrancisco/MapServer/WMSServer?",
    	"http://sazabi:8080/geoserver/wms?",
		{ 																									
			layers: "esri:sf_highways",  											
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
    	//"http://4682_OGC_OPEN_0/arcgis/services/sanfrancisco/MapServer/WMSServer?",
    	"http://sazabi:8080/geoserver/wms?",
		{ 																									
			layers: "esri:sf_pizzastores",  											
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
    
    var info_ctrl_pizzastores = new OpenLayers.Control.WMSGetFeatureInfo({
        //url: 'http://4682_OGC_OPEN_0/arcgis/services/sanfrancisco/MapServer/WMSServer?', 
        url: 'http://sazabi:8080/geoserver/wms?',
    	title: 'Identify',
        layers: [pizzastores],
        queryVisible: true,
        // overwrite any parameters in WMS GetFeatureInfo request
        vendorParams: {    	
    		//version: "1.1.1",
    		//xsl_template: "http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_html_div_red.xsl"
    	},
    	handlerOptions: {
    	}
    });
    map.addControl(info_ctrl_pizzastores);
    info_ctrl_pizzastores.events.register("getfeatureinfo", this, displayGetFeatureInfoResp);
    info_ctrl_pizzastores.activate();
        
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
        new OpenLayers.Size(256, 256),
        "",
        {
    		size: new OpenLayers.Size(10,10),
    		offset: new OpenLayers.Pixel(0,0)
        },
        true,
        null
    );
    popup.autoSize = true;
    //popup.closeOnMove = true;
    popup.setBackgroundColor("white");
    popup.setBorder("1px");
    popup.contentDiv.style.overflow = "auto";
    popup.setContentHTML(evt.text);
    map.addPopup(popup);
    popup.show();
}