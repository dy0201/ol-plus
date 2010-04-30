/*
 * wms-getfeatureinfo-simple, send GetFeatureInfo request with xsl template - 
 * - http://zeon/resources/xsl/getfeatureinfo/featureinfo_application_geojson.xsl -
 * - the response will be in JSON format, which will parsed and bind to -
 * - an Ext.grid.GridPanel through GeoExt AttributeStore and AttributeReader  
 */
var map;
var popup;

Ext.onReady(init);

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
    		info_format: "text/plain",
    		xsl_template: "http://zeon/resources/xsl/getfeatureinfo/featureinfo_application_geojson.xsl"
    		//xsl_template: "http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_html_red.xsl"
    	},
    	handlerOptions: {
    	}
    });
    // customize OpenLayers.Control.WMSGetFeatureInfo control
    info_ctrl.request = OpenLayers.Util.AgsUtil.bindFunction(  
		/*
		 * instead of sending the GetFeatureInfo request, return the request string - 
		 *   - which then can be used by popup
		 */
		function(clickPosition, options) {
			options = options || {};
	        var layerNames = [];
	        var styleNames = [];

	        var layers = this.findLayers();
	        if(layers.length > 0) {
	            for (var i = 0, len = layers.length; i < len; i++) { 
	                layerNames = layerNames.concat(layers[i].params.LAYERS);    	               
	                if (layers[i].params.STYLES) {
	                    styleNames = styleNames.concat(layers[i].params.STYLES);
	                } else {
	                    if (layers[i].params.LAYERS instanceof Array) {
	                        styleNames = styleNames.concat(new Array(layers[i].params.LAYERS.length));
	                    } else { 
	                        styleNames = styleNames.concat(layers[i].params.LAYERS.replace(/[^,]/g, ""));
	                    }
	                }
	            }	    
	            var wmsOptions = {
	                url: this.url,
	                params: OpenLayers.Util.applyDefaults({
	                    service: "WMS",
	                    version: "1.1.0",
	                    request: "GetFeatureInfo",
	                    layers: layerNames,
	                    query_layers: layerNames,
	                    styles: styleNames,
	                    bbox: this.map.getExtent().toBBOX(),
	                    srs: this.map.getProjection(),
	                    feature_count: this.maxFeatures,
	                    x: clickPosition.x,
	                    y: clickPosition.y,
	                    height: this.map.getSize().h,
	                    width: this.map.getSize().w,
	                    info_format: this.infoFormat 
	                }, this.vendorParams)     	                                   
	            };    	    
	            var url = wmsOptions.url;    	            
	            var paramString = OpenLayers.Util.getParameterString(wmsOptions.params);
	            if(paramString.length > 0) {
	                var separator = (url.indexOf('?') > -1) ? '&' : '?';
	                url += separator + paramString;
	            }    	            
	            if(wmsOptions.proxy && (url.indexOf("http") == 0)) {
	                url = wmsOptions.proxy + encodeURIComponent(url);
	            }
	            OpenLayers.Console.debug(url);
	            
	            // create the popup
	            if(popup != null) {
	            	this.map.removePopup(popup);
	            	popup.destroy();
	                popup = null;
	            }   
	            popup = new OpenLayers.Popup.FramedCloud(
	        		"GetFeatureInfo Results",     	
	        		this.map.getLonLatFromPixel(clickPosition),    	
	                new OpenLayers.Size(350, 300),
	                "",
	                // anchor for the popup
	                {
	            		size: new OpenLayers.Size(10,10),
	            		offset: new OpenLayers.Pixel(0,0)
	                },
	                true,
	                null
	            );
	            popup.autoSize = false;    
	            //popup.closeOnMove = true; // causes problem when you scroll the content in popup, base map can't be moved any more. 
	            popup.setBackgroundColor("white");
	            popup.setBorder("1px");
	            popup.contentDiv.style.overflow = "auto";	            	           
	            popup.setContentHTML(
	            	"<div id=\'div_popup\'></div>"	            	
	            );	            
	            this.map.addPopup(popup);
	            popup.show();
	            	            
	            var store = new GeoExt.data.AttributeStore({    	    	
	                //url: "http://sazabi:8080/geoext/playground/examples/data/attributes_geojson.json"
	            	url: url
	            });    

	            store.reader = new GeoExt.data.AttributeReader(
	            	// meta
	                {
	                	format: new OpenLayers.Format.GeoJSON()
	                },
	                // recordType / fields array
	                ['Name', 'Value']
	            );
	            
	            store.reader.readRecords = OpenLayers.Util.AgsUtil.bindFunction(    	
	            	function(data) {
	        	    	var attributes;
	        	        if(data instanceof Array) {
	        	            attributes = data;
	        	        } else {            
	        	        	var parsed = this.meta.format.read(data);
	        	        	attributes = parsed[0].attributes;
	        	        }
	        	        var recordType = this.recordType;
	        	        var fields = recordType.prototype.fields;
	        	        
	        	        var records = [];	      
	        	        
	        	        for(var i in attributes) {	        	
	        	        	var values = {};
	        	        	if(attributes[i] != null) {
	        	        		values['Name'] = i;
	        	        		values['Value'] = attributes[i];
	        	        		records[records.length] = new recordType(values);
	        	        	}
	        	        }	        
	        	        return {
	        	            success: true,
	        	            records: records,
	        	            totalRecords: records.length
	        	        };
	        	    },
	            	store.reader
	            ); 
	            store.load();
	            		
	            var grid = new Ext.grid.GridPanel({
	                title: "Feature Attributes",
	                store: store,        
	                cm: new Ext.grid.ColumnModel([
	        	        {id: "Name", header: "Name", dataIndex: "Name", sortable: true},
	                    {id: "Value", header: "Value", dataIndex: "Value", sortable: true}
	                ]),        
	                sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
	                autoExpandColumn: "Name",
	                renderTo: 'div_popup',
	                height: 300,
	                width: 350
	            });  
	            //
	            OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
	        } 
		},
		info_ctrl
    );
    
    map.addControl(info_ctrl);    
    info_ctrl.activate();
        
    var lon = -122.40609;
	var lat = 37.75560;
    var zoom = 10;
    	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);    
}

function displayGetFeatureInfoResp(evt) {
    
}