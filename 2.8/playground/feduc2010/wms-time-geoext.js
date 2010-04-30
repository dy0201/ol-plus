var map;
var haiti_osm;
var haiti_osm_previous;
var haiti_osm_next;

var panel; 
var slider;
var toolbar_items;
var tree;
var treeFromJSON;
var treeConfigJSON;

var time_slider;
var time_slider_window;
var time_slider_value;
var time_label;
var intervalId;

/*
 * a hard coded list of time string range from 2010-01-12T21:53:10.000Z to 2010-01-25T20:00:00.000Z
 *   ideally this list should be populated from time extent section of WMS capabilities for each layer  
 */
var haiti_osm_timetable = [
   "2006-07-05T22:24:57.000Z/2010-01-12T21:53:10.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-13T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-13T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-13T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-13T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-13T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-13T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-14T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-14T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-14T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-14T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-14T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-14T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-15T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-15T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-15T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-15T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-15T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-15T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-16T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-16T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-16T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-16T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-16T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-16T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-17T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-17T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-17T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-17T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-17T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-17T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-18T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-18T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-18T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-18T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-18T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-18T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-19T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-19T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-19T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-19T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-19T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-19T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-20T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-20T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-20T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-20T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-20T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-20T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-21T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-21T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-21T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-21T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-21T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-21T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-22T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-22T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-22T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-22T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-22T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-22T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-23T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-23T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-23T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-23T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-23T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-23T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-24T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-24T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-24T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-24T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-24T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-24T20:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-25T00:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-25T04:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-25T08:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-25T12:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-25T16:00:00.000Z",
   "2006-07-05T22:24:57.000Z/2010-01-25T20:00:00.000Z",
];

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
	
    haiti_osm = new OpenLayers.Layer.WMS(   
    	"Haiti OSM", 
    	"http://4682_OGC_AGS_0/arcgis/services/haiti_osm/MapServer/WMSServer?",    
		{ 																									
			layers: "0,1,2",			
			styles: "",																																																																	
			srs: "EPSG:4326",											
			format: "image/png8",				
			exceptions: "text/xml",																
			transparent: true,
			//bgcolor: "ffffff", 
			time: haiti_osm_timetable[0]
		},
		{											 													
			isBaseLayer: false,
			singleTile: true,
			displayOutsideMaxExtent: true														
		}
	);	
    haiti_osm.setOpacity(1.0);								
    haiti_osm.setVisibility(false);      
	
    haiti_osm_previous = haiti_osm; 
    haiti_osm_next = haiti_osm;
    
	// =====================================================================================
	// toolbar items
	// =====================================================================================	
    
    toolbar_items = [];
    
    time_label = new Ext.form.Label({
		'html': "<h5>" + haiti_osm_timetable[0].split("/")[1] + "</h5>",
		'width': 220		
	});       
       
    toolbar_items.push(        	
    	{
	    	iconCls: 'previous', 
	    	handler: function() {    		
    			time_slider_value = time_slider_value - 1;
    			if(time_slider_value < 0) {
    				time_slider_value = 0;
    			}
    			time_slider.setValue(time_slider_value, true);
    			time_label.setText(haiti_osm_timetable[time_slider_value].split("/")[1]);
    			haiti_osm.mergeNewParams({time:haiti_osm_timetable[time_slider_value]});
    		}
    	}
    );
    
    time_slider = new Ext.Slider({        
        width: 214,
        minValue: 0,
        maxValue: 78
    });
    toolbar_items.push(time_slider);
    
    time_slider.on(
    	"change",
    	function(slide, value) {
    		time_slider_value = value;
    		time_label.setText(haiti_osm_timetable[time_slider_value].split("/")[1]);    		
    		//OpenLayers.Console.debug(time_slider_value);
    	}
    );
    time_slider.on(
        	"changecomplete",
        	function(slide, value) {
        		time_slider_value = value;
        		time_label.setText(haiti_osm_timetable[time_slider_value].split("/")[1]);
        		haiti_osm.mergeNewParams({time:haiti_osm_timetable[time_slider_value]});
        		//OpenLayers.Console.debug("...send WMS request...");
        	}
        );
    time_slider_value = 0;
	time_slider.setValue(time_slider_value, false);
    
    toolbar_items.push(
    	{
	    	iconCls: 'next', 
	    	handler: function() {    		
    			time_slider_value = time_slider_value + 1;
    			if(time_slider_value >= haiti_osm_timetable.length) {
    				time_slider_value = haiti_osm_timetable.length - 1;
    			}    				
    			time_slider.setValue(time_slider_value, true);
    			time_label.setText(haiti_osm_timetable[time_slider_value].split("/")[1]);
    			haiti_osm.mergeNewParams({time:haiti_osm_timetable[time_slider_value]});    			    		
	    	}
    	},
    	{
    		iconCls: 'play', 
	    	handler: function() {    			    		
    			var play = function() {
    				time_slider_value = time_slider_value + 1;
        			if(time_slider_value >= haiti_osm_timetable.length) {
        				time_slider_value = haiti_osm_timetable.length - 1;
        				window.clearInterval(intervalId);
        				return;
        			}    				
        			time_slider.setValue(time_slider_value, true);
        			time_label.setText(haiti_osm_timetable[time_slider_value].split("/")[1]);        			
        			haiti_osm.mergeNewParams({time:haiti_osm_timetable[time_slider_value]});
        			
        			haiti_osm_previous = haiti_osm_next;
        			haiti_osm_next = haiti_osm_next.clone();
        			haiti_osm_next.displayInLayerSwitcher = false;
        			haiti_osm_next.mergeNewParams({time:haiti_osm_timetable[time_slider_value]});
        			map.addLayer(haiti_osm_next);
        			if(haiti_osm_previous != haiti_osm_next) {
        				map.removeLayer(haiti_osm_previous, false);
        			}
    			};
    			intervalId = window.setInterval(play, 1000);
	    	}
    	},
    	{
    		iconCls: 'pause', 
	    	handler: function() {    		
    			window.clearInterval(intervalId);
    			//OpenLayers.Console.debug(time_slider_value);
	    	}
    	},
    	{
    		iconCls: 'stop', 
	    	handler: function() {    		
    			time_slider_value = 0;
    			OpenLayers.Console.debug(time_slider_value);
    			time_slider.setValue(time_slider_value, true);
    			time_label.setText(haiti_osm_timetable[time_slider_value].split("/")[1]);
    			window.clearInterval(intervalId);
	    	}
    	}
    );
    toolbar_items.push("-");
    
    // add a date field to change the "TIME" of WMS layers
    /*
    toolbar_items.push(
    	new Ext.form.Label({
    		text: "date: "
    	})
    );
    date_field = new Ext.form.DateField({                      
        width: 220,        
        defaults: {width: 220}                
    });
    toolbar_items.push(date_field);
    toolbar_items.push("-");    
    */
    
    // make WMS time slider a floating window
    var time_slider_window = new Ext.Window({
    	applyTo:'time_slider',
    	title: 'WMS Time Slider',
        //width: 500,
        height:100,
        //minWidth: 300,
        //minHeight: 200,
        layout: 'fit',
        plain:true,
        bodyStyle:'padding:5px;',
        buttonAlign:'center', 
        items: [time_label],
        tbar: toolbar_items
    });
    time_slider_window.show();
      
	// =====================================================================================
	// Tree and Panel
	// =====================================================================================
	
	// create a GeoExt.MapPanel and initialize an OpenLayers.Map directly inside it
    panel = new GeoExt.MapPanel({        
    	title: "Map",		// give a title for the MapPanel                
    	border: true,		// attribute inherit from Ext.Panel
        region: "center",	//          
        map: map,        
        center: new OpenLayers.LonLat(-72.279, 18.555),				// center the initial map
        zoom: 	10,											// zoom level for initial map	
        //tbar: toolbar_items,	// add tool bar to the map panel
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
			haiti_osm
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
    /*
    registerRadio = function(node) {
	    if(!node.hasListener("radiochange")) {
	        node.on("radiochange", function(node) {	        		        	
	        });
	    }
	};
	*/
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
						//radioGroup: "active"
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
	        //"append": registerRadio,
	        //"insert": registerRadio
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
	
});	


