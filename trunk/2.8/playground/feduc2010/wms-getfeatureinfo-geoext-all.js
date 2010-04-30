var map;
var popup;

var panel; 
var tree;
var treeFromJSON;
var treeConfigJSON;

var slider;
var registerRadio;

Ext.onReady(function() {	    		
	
	// set the proxy url for corss-domain ajax calls
	OpenLayers.ProxyHost= "/openlayers-2.8/ApacheProxyServlet?resourceUrl=";
	
	// =====================================================================================
	// Map
	// =====================================================================================
	
	map = new OpenLayers.Map({	// call OpenLayers.Map constructor to initialize map        	
		//panMethod: null, // set 'panMethod' to null to disable animated panning
        controls: [		      
            //new OpenLayers.Control.LayerSwitcher2(),
        	new OpenLayers.Control.Navigation(),
        	new OpenLayers.Control.PanZoom2(),
        	new OpenLayers.Control.MousePosition()
        ],
        projection: "EPSG:4326",		        		        	
        maxResolution: 0.3515625,		        	        
        maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90)
    });
	
	// =====================================================================================
	// WMS layers
	// =====================================================================================
	
    var blockgroups = new OpenLayers.Layer.WMS(   
    	"Blockgroups", 
    	"http://4682_OGC_AGS_0/arcgis/services/sanfrancisco/MapServer/WMSServer?",
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

    var highways = new OpenLayers.Layer.WMS(   
    	"Highways", 
    	"http://4682_OGC_AGS_0/arcgis/services/sanfrancisco/MapServer/WMSServer?",
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
     
    
    var pizzastores = new OpenLayers.Layer.WMS(   
    	"Pizzastores", 
    	"http://4682_OGC_AGS_0/arcgis/services/sanfrancisco/MapServer/WMSServer?",
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
	
	// =====================================================================================
	// Control
	// =====================================================================================
	
	var info_ctrl = new OpenLayers.Control.WMSGetFeatureInfo({
        url: 'http://4682_OGC_AGS_0/arcgis/services/sanfrancisco/MapServer/WMSServer?',
    	//url: 'http://sazabi:8080/geoserver/wms?',
        title: 'Identify',
        layers: [highways],
        queryVisible: true,
        // overwrite any parameters in WMS GetFeatureInfo request
        vendorParams: {    	
    		version: "1.1.1",
    		xsl_template: "http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_html_div_red.xsl",
    		//xsl_template: "http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_html_div_blue.xsl"
    	},
    	handlerOptions: {
    	}
    });
    map.addControl(info_ctrl);
    info_ctrl.events.register("getfeatureinfo", this, displayGetFeatureInfoResp);
    
    var info_ctrl_video = new OpenLayers.Control.WMSGetFeatureInfo({
        url: 'http://4682_OGC_AGS_0/arcgis/services/sanfrancisco/MapServer/WMSServer?',
    	//url: 'http://sazabi:8080/geoserver/wms?',
        title: 'Identify',
        layers: [pizzastores],
        queryVisible: true,
        // overwrite any parameters in WMS GetFeatureInfo request
        vendorParams: {    	
    		version: "1.1.1",
    		xsl_template: "http://zeon/resources/xsl/getfeatureinfo/featureinfo_text_html_div_video.xsl"
    	},
    	handlerOptions: {
    	}
    });
    map.addControl(info_ctrl_video);
    info_ctrl_video.events.register("getfeatureinfo", this, displayGetFeatureInfoResp);
    
    var info_ctrl_geojson = new OpenLayers.Control.WMSGetFeatureInfo({
        url: 'http://4682_OGC_AGS_0/arcgis/services/sanfrancisco/MapServer/WMSServer?',
    	//url: 'http://sazabi:8080/geoserver/wms?',
        title: 'Identify',
        layers: [blockgroups],
        queryVisible: true,
        // overwrite any parameters in WMS GetFeatureInfo request
        vendorParams: {    	
    		version: "1.1.1",
    		info_format: "text/plain",
    		xsl_template: "http://zeon/resources/xsl/getfeatureinfo/featureinfo_application_geojson.xsl"    		
    	},
    	handlerOptions: {
    	}
    });
    
    // customize OpenLayers.Control.WMSGetFeatureInfo control
    info_ctrl_geojson.request = OpenLayers.Util.AgsUtil.bindFunction(  
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
	                //new OpenLayers.Size(500, 400),
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
	            	//"<object width=\"425\" height=\"344\"><param name=\"movie\" value=\"http://www.youtube.com/v/Q1n3XitgsH0&hl=en_US&fs=1&\"></param><param name=\"allowFullScreen\" value=\"false\"></param><param name=\"allowscriptaccess\" value=\"always\"></param><embed src=\"http://www.youtube.com/v/Q1n3XitgsH0&hl=en_US&fs=1&\" type=\"application/x-shockwave-flash\" allowscriptaccess=\"always\" allowfullscreen=\"false\" width=\"425\" height=\"344\"></embed></object>"	            	
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
		info_ctrl_geojson
    );
    map.addControl(info_ctrl_geojson); 
    
	// =====================================================================================
	// Tree and Panel
	// =====================================================================================
	
	// create a GeoExt.MapPanel and initialize an OpenLayers.Map directly inside it
    panel = new GeoExt.MapPanel({        
    	title: "Map",		// give a title for the MapPanel                
    	border: true,		// attribute inherit from Ext.Panel
        region: "center",	//          
        map: map,        
        center: new OpenLayers.LonLat(-122.40609, 37.75560),				// center the initial map
        zoom: 	11,											// zoom level for initial map	
        layers: [											// add layers in map by listing them in an array
	        // call OpenLayers code to create multiple layers and add to map
            //   you can multiple base layers and overlays at a time      											
            new OpenLayers.Layer.AgsTiled( 					
				"ESRI_Imagery_World_2D", 
				"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer/tile/", 
				{					
					tileSize: new OpenLayers.Size(512, 512),
					tileFormat:'jpg',
					tileOrigin: new OpenLayers.LonLat(-180, 90),
					tileFullExtent: new OpenLayers.Bounds(-180, -90, 180, 90), 	
					isBaseLayer: true,
					buffer: 0,
					singleTile: false,
					transitionEffect: 'resize'
				}
			),
			new OpenLayers.Layer.AgsTiled( 					
				"ESRI_StreetMap_World_2D", 
				"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/tile/", 
				{					
					tileSize: new OpenLayers.Size(512, 512),
					tileFormat:'jpg',
					tileOrigin: new OpenLayers.LonLat(-180, 90),
					tileFullExtent: new OpenLayers.Bounds(-180, -90, 180, 90), 	
					isBaseLayer: true,
					buffer: 0,
					singleTile: false,
					transitionEffect: 'resize'
				}
			),
			new OpenLayers.Layer.AgsTiled( 
				"ESRI_ShadedRelief_World_2D", 
				"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_ShadedRelief_World_2D/MapServer/tile/", 
				{					
					tileSize: new OpenLayers.Size(512, 512),
					tileFormat:'jpg',
					tileOrigin: new OpenLayers.LonLat(-180, 90),
					tileFullExtent: new OpenLayers.Bounds(-180, -90, 180, 90), 	
					isBaseLayer: true,
					buffer: 0,
					singleTile: false,
					transitionEffect: 'resize'
				}
			),				
			blockgroups,
			highways,			
			pizzastores
        ],    	        
        // embed a slider in the map
        items: [{
            xtype: "gx_zoomslider",
            vertical: true,
            height: 100,
            x: 20,									// absolute position 'x' to place slider
            y: 125,									// absolute position 'y' to place slider				
            plugins: new GeoExt.ZoomSliderTip()
        }]	        
    });	  
    
    // TODO: doc
    registerRadio = function(node) {
	    if(!node.hasListener("radiochange")) {
	        node.on("radiochange", function(node) {
	        	// activate/deactivate GetFeatureInfo control	        	
	        	if(node.layer.name == "Pizzastores") {
	        		info_ctrl.deactivate();
	        		info_ctrl_video.activate();
	        		info_ctrl_geojson.deactivate();
	        		OpenLayers.Console.debug("...identify on pizzastores layer...");
	        	} else if(node.layer.name == "Highways") {
	        		info_ctrl.activate();
	        		info_ctrl_video.deactivate();
	        		info_ctrl_geojson.deactivate();
	        		OpenLayers.Console.debug("...identify on highways layer...");
	        	} else if(node.layer.name == "Blockgroups") {
	        		info_ctrl.deactivate();
	        		info_ctrl_video.deactivate();
	        		info_ctrl_geojson.activate();
	        		OpenLayers.Console.debug("...identify on blockgroups layer...");
	        	} else {
	        		OpenLayers.Console.debug("...layer not found...");
	        	}
	        });
	    }
	};
	
	/*
	 * instead of defining the tree (child nodes of tree root), the structure can be defined outside 
	 *   as a json object like below
	 */	
	treeConfigJSON = new OpenLayers.Format.JSON().write(
		[
			{
				nodeType: "gx_baselayercontainer",
				text: 'base layers'
				/*
		         * you're suppose to set 'layerStore' to MapPanel.layers
		         * but the magic here for you don't have to specify is in default LayerLoader 
		         * in GeoExt.tree.LayerLoader, there is code:
		         * 		if(!this.store) {
            				this.store = GeoExt.MapPanel.guess().layers;
        		 *		}
        		 * in which it's looping all Ext components in the page to find an instance of GeoExt.MapPanel
        		 * and take layers from there 
		         */
				//layerStore: panel.layers,
		        //leaf: false,
		        //expanded: true
			}, 
			{
				nodeType: "gx_overlaylayercontainer",
				text: 'overlay layers',
			    loader: {
					/*
					// define you own logic to whether include a layer in tree or not
					filter: function(record) {
	            		// return true to include, otherwise to exclude							
						return record.get("layer").name.indexOf("arcgis93est layer2") == -1;
	        		},											
					*/
					baseAttrs: {	
						/*
						 * when include this 'checkedGroup' all overlay layers include in this
						 *   layer container will be rendered with a radio box instead of checkbox,
						 *   so that only one layer can be turned on at a time
						 *   the value of 'checkedGroup' doesn't seem to have any effect 
						 */							
						//checkedGroup: "mutual-exclusive",  	
						radioGroup: "active"
			    	}						        	
				}
			}
		],
		true
	);
	
    
	// create the tree panel with tree structure configuration defined above	
	treeFromJSON = new Ext.tree.TreePanel({
		border: true,
		region: "west",		// the position of the TreePanel in a BorderLayout container
		title: "Layers",
		width: 200,
		split: true,
		collapsible: true,
		collapseMode: "mini",
		autoScroll: true,	
		enableDD: true,
		/*
		 * A TreeLoader provides for lazy loading of an Ext.tree.TreeNode's child nodes from a specified URL. 
		 * The response must be a JavaScript Array definition whose elements are node definition objects 
		 */
		loader: new Ext.tree.TreeLoader({			
			// 'applyLoader' has to be set to false
			// so the loader of child nodes such BaseLayerContainer and OverlayLayerContainer will be applied
			applyLoader: false
		}),
		root: {
			nodeType: "async",					
			children: Ext.decode(treeConfigJSON)
		},				
		listeners: {
	        "append": registerRadio,
	        "insert": registerRadio
	    },
		rootVisible: false,
		lines: false			
	});
			
	new Ext.Viewport({
        layout: "fit",
        hideBorders: true,
        items: {
            layout: "border",
            deferredRender: false,
            items: [
                panel, 
                treeFromJSON
            ]
        }
    });  
	
	// ===========================================================================================
	// Activate control
	// ===========================================================================================
	//info_ctrl.activate();
	//info_ctrl_video.activate();
	//info_ctrl_geojson.activate();
	
});	

function displayGetFeatureInfoResp(evt) {
    if(popup != null) {
    	map.removePopup(popup);
    	popup.destroy();
        popup = null;
    }   
    popup = new OpenLayers.Popup.FramedCloud(
		"GetFeatureInfo Results",     	
    	map.getLonLatFromPixel(evt.xy),    	
        new OpenLayers.Size(640, 360),
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
    map.addPopup(popup);
    popup.show();    
}


