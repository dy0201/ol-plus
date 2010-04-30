/*
 * Sample code to creat tabs using ExtJs 3.1.0 library
 * 
 * Ext.onReady(function() {       	
		var store = new Ext.data.ArrayStore({	    
		    autoDestroy: true,
		    storeId: 'myStore',
		    
		    idIndex: 0,  
		    fields: [
		       'company',
		       {name: 'price', type: 'float'},
		       {name: 'change', type: 'float'},
		       {name: 'pctChange', type: 'float'},
		       {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'}
		    ]
		});
		
		var myData = [
		              ['3m Co',71.72,0.02,0.03,'9/1 12:00am'],
		              ['Alcoa Inc',29.01,0.42,1.47,'9/1 12:00am'],
		              ['Boeing Co.',75.43,0.53,0.71,'9/1 12:00am'],
		              ['Hewlett-Packard Co.',36.53,-0.03,-0.08,'9/1 12:00am'],
		              ['Wal-Mart Stores, Inc.',45.45,0.73,1.63,'9/1 12:00am']
		          ];
	
		store.loadData(myData);
	    
	    var grid = new Ext.grid.GridPanel({
	        title: "Feature Attributes",
	        store: store,
	        cm: new Ext.grid.ColumnModel([
	            {id: "price", header: "Price", dataIndex: "price", sortable: true},
	            {id: "change", header: "Change", dataIndex: "change", sortable: true},
	            {id: "pctChange", header: "PctChange", dataIndex: "pctChange", sortable: true},
	            {id: "lastChange", header: "LastChange", dataIndex: "lastChange", sortable: true}
	        ]),
	        sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
	        autoExpandColumn: "price",
	        renderTo: document.body,
	        height: 300,
	        width: 500
	    }); 
	    
	});
 *
 *  Embed this code snippet in GetFeatureInfo template
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
    blockgroups.setVisibility(true);
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
	highways.setVisibility(false);
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
	pizzastores.setVisibility(false);
    map.addLayer(pizzastores);   
    
    var info_ctrl = new OpenLayers.Control.WMSGetFeatureInfo({
        url: 'http://4682_OGC_OPEN_0/arcgis/services/sanfrancisco/MapServer/WMSServer?',
    	//url: 'http://sazabi:8080/geoserver/wms?',
        title: 'Identify',
        layers: [blockgroups],
        queryVisible: true,
        // overwrite any parameters in WMS GetFeatureInfo request
        vendorParams: {    	
    		version: "1.1.1",
    		//xsl_template: "http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_html_ext3.xsl",
    		xsl_template: "http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_div_ext3.xsl"
    	},
    	handlerOptions: {
    	}
    });
    map.addControl(info_ctrl);
    info_ctrl.events.register("getfeatureinfo", this, displayGetFeatureInfoResp);
    info_ctrl.activate();
        
    var lon = -122.40609;
	var lat = 37.75560;
    var zoom = 11;
    	
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
        new OpenLayers.Size(768, 240),
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
    // work with xsl template http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_div_ext3.xsl
    popup.setContentHTML(evt.text);
    // work with xsl template http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_html_ext3.xsl
    /*
    popup.setContentHTML(
    	"<iframe width=\"100%\" height=\"100%\" src=\'" +
    		url
    	+ "\'></iframe>"
    );
    */
    map.addPopup(popup);
    popup.show();
}