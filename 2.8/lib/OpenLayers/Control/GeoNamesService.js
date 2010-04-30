/**
 * @requires OpenLayers/Handler/Box.js
 * @requires OpenLayers/Handler/Click.js
 */

/**
 * Class: OpenLayers.Control.GeoNamesService  
 * 
 * Inherits:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.GeoNamesService = OpenLayers.Class(OpenLayers.Control, {
	
	/**
     * APIProperty: KeyMask
     * {Integer} <OpenLayers.Handler> key code of the key, which has to be
     *    pressed, while drawing the box with the mouse on the screen 
     * 
     * Default: <OpenLayers.Handler.MOD_CTRL, so hold Ctrl key to draw a box on map to do spatial query against Geonames services 
     */
    boxKeyMask: OpenLayers.Handler.MOD_CTRL,
    
    /**
     * APIProperty: KeyMask
     * {Integer} <OpenLayers.Handler> key code of the key, which has to be
     *    pressed, while clicking the mouse on the screen 
     *    
     * Default: <OpenLayers.Handler.MOD_CTRL, so hold Ctrl key to click on map to do spatial query against Geonames services
     */
    clickKeyMask: OpenLayers.Handler.MOD_CTRL,
    
    /**
     * APIProperty: enableLonLatQuery
     * 
     * {boolean} - when the control is activated, whether to allow user to click on map to do query 
     */
    enableLonLatQuery: false,
    
    /**
     * APIProperty: enableBBOXQuery
     * 
     * {boolean} - when the control is activated, whether to allow user to draw box on map to do query
     */
    enableBBOXQuery: false,
    
    /**
     * Property: query 
     * {<OpenLayers.Control.Button>}
     * 
     * a sub control to deal with non-spatial related GeoNames service like "search"
     */
    query: null,
    
    /**
     * Property: protocol
     * {<OpenLayers.Protocol.GeoNames.*>}
     * 
     * One of the OpenLayers.Protocol.GeoNames.* protocol
     * the protocol is used to send the GeoNames query request and read/parse query response 
     */
    protocol: null,
    
    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>}
     * 
     * Optionally a vector can be associated with this control, so that features extracted from - 
     * - the query response can be displayed on the map; if it is WFST layer then query results can be -
     * - persisted into back-end data source.
     * 
     */
    layer: null,
    
    /**
     * API Property: callbacks
     * {Array of functions}
     * 
     * Optionally user can pass in a set of extra callback functions to further processed the query response -
     * - each callback function will be registered to listen to "geonamesquerycompleted", and will be passed in an evt like below:
     * 
     * {
     * 		features: <features>	// array of features extracted from query results
     * }
     * 
     */
    callbacks: [],
    
    /**
     * API Property: getQueryParams
     * 
     * getQueryParams() is to get search text from GUI or other user interaction  
     */
    getQueryParams: function() { return {'q':""}; },
    
    /**
     * Constructor: OpenLayers.Control.GeoNamesService
     * Create a new GeoNamesService control
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *                    the control
     */
    initialize: function(options) {
        this.handlers = {};
        OpenLayers.Control.prototype.initialize.apply(this, arguments);        
        /* add utilities functions */
        // OpenLayers.Util.AgsUtil.createSingleCallback -
        // - merge an array of callback functions into one single callback function
        this._createSingleCallback = OpenLayers.Util.AgsUtil.createSingleCallback;
        // create the 'query' Button sub-control to handle non-spatial search
        this.query = new OpenLayers.Control.Button({
        	trigger: OpenLayers.Function.bind(this.triggerQuery, this)	
        });       
        // add a new event type "geonamesquerycompleted", which will be triggered when a geoNames service -
        // - query is completed and response is parsed
        this.events.addEventType("geonamesquerycompleted");
        // register user passed-in callback functions to listen to new event "geonamesquerycompleted"
        this.events.on({
    		"geonamesquerycompleted": OpenLayers.Util.AgsUtil.createSingleCallback(this.callbacks, {}, this),
    		scope: this
    	});
    },
    
    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {    	        
    	this.deactivate();
    	this.events.un({
    		"geonamesquerycompleted": OpenLayers.Util.AgsUtil.createSingleCallback(this.callbacks, {}, this),
    		scope: this
    	});
        OpenLayers.Control.prototype.destroy.apply(this,arguments);
    },
    
    /**
     * Method: activate
     */
    activate: function() {     
    	// activate the query button control
    	this.query.activate(); 
    	// activate click handler and box handler based on configuration
    	if(this.enableLonLatQuery == true && this.protocol.isSpatialSearch == true) {
        	if(this.protocol.spatialSearchType == "LonLat") {
        		this.handlers.click.activate();
        	}        
        }
    	if(this.enableBBOXQuery == true && this.protocol.isSpatialSearch == true) {
        	if(this.protocol.spatialSearchType == "BBOX") {
        		this.handlers.box.activate();        		
        	}        
        }
        return OpenLayers.Control.prototype.activate.apply(this,arguments);
    },

    /**
     * Method: deactivate
     */
    deactivate: function() {    
    	// de-activate the query button control
    	this.query.deactivate();
    	// de-activate click and box handler if they were activated
    	if(this.handlers.click.active == true) {
        	this.handlers.click.deactivate();
        }
        if(this.handlers.box.active == true) {
        	this.handlers.box.deactivate();
        }        
        return OpenLayers.Control.prototype.deactivate.apply(this,arguments);
    },
    
    /**
     * Method: draw
     *     draw() is called when control is added into the map; 
     */
    draw: function() {
        this.query.draw();    	
        /*
         * to enable listening to right-click event, see OpenLayers.Control.Navigation for details
         */                  
        this.handlers.click = new OpenLayers.Handler.Click(
            this, 
            {
            	'click': this.defaultClick
            },	
            {            	            	
            	keyMask: this.clickKeyMask
            }
        );        
        this.handlers.box = new OpenLayers.Handler.Box( 
        	this,
            {
        		'done': this.defaultBox
        	}, 
        	{
        		keyMask: this.boxKeyMask
        	} 
        );               
        this.activate();
    },
    
    /**
     * Method: defaultClick 
     * 		handle click event and send spatial GeoNames query by (lng,lat)
     * 
     * Parameters:
     *     evt - {Event} 
     */
    defaultClick: function(evt) {
    	if(this.handlers.click.checkModifiers(evt)) {
    		//OpenLayers.Console.debug("...geonames service control...click event...");
    		if(!this.protocol || this.protocol.spatialSearchType != "LonLat") {
    			// do nothing because this particular GeoNames doesn't support query by lonlat
    			OpenLayers.Console.debug("...ignore the click event...this geonames service doesn't support query by lonlat...");
    			return !this.handlers.click.stopSingle;
    		}
    		var lng = this.map.getLonLatFromPixel(evt.xy).lon;
    		var lat = this.map.getLonLatFromPixel(evt.xy).lat;
    		 var queryParams = {
            	'lng': lng,
            	'lat': lat
            };            
            this.queryGeoNamesService(queryParams);
    	}
    	return !this.handlers.click.stopSingle;    	
    },

    /**
     * Method: defaultBox 
     * 		handle when a box is drawn on map and send spatial GeoNames query by (west, south, east, north)
     * 
     * Parameters:
     *     evt - {OpenLayers.Position} 
     */
    defaultBox: function(position) {
    	if(!this.protocol || this.protocol.spatialSearchType != "BBOX") {
			// do nothing because this particular GeoNames doesn't support query by bbox
    		OpenLayers.Console.debug("...ignore the click event...this geonames service doesn't support query by bbox...");
			return !this.handlers.click.stopSingle;
		}
    	if(this.protocol && this.protocol.isSpatialSearch == true && this.protocol.spatialSearchType == "BBOX") {
	    	if(position instanceof OpenLayers.Bounds) {
	    		//OpenLayers.Console.debug("...geonames service control...box event...");
	    		var minXY = this.map.getLonLatFromPixel(
                        new OpenLayers.Pixel(position.left, position.bottom));
	    		var maxXY = this.map.getLonLatFromPixel(
                        new OpenLayers.Pixel(position.right, position.top));            
	            var xmin = minXY.lon;
	            var xmax = maxXY.lon;
	            var ymin = minXY.lat;
	            var ymax = maxXY.lat;
	            
	            var queryParams = {
	            	'west': xmin,
	            	'east': xmax,
	            	'south': ymin,
	            	'north': ymax
	            };	            
	            this.queryGeoNamesService(queryParams);	            	    	
	    	} else if(position instanceof OpenLayers.Pixel) {
	    		// do nothing; leave it to click handler
	    	}  
    	}
    },
    
    /**
     * private method: triggerQuery
     * 
     * trigger GeoNames service query
     */
    triggerQuery: function() {
    	this.queryGeoNamesService({});
    },
    
    /**
     * API Method: queryGeoNamesService
     * 
     * use this.protocol to query against GeoNames service 
     */
    queryGeoNamesService: function(queryParams) {
    	if(this.protocol) {
    		var mergedQueryParams = {};
    		mergedQueryParams = OpenLayers.Util.applyDefaults({}, this.getQueryParams());
    		mergedQueryParams = OpenLayers.Util.extend(mergedQueryParams, queryParams);
    		var options = {
    			queryParams: mergedQueryParams,
    			callback: OpenLayers.Util.AgsUtil.bindFunction(this.queryGeoNamesServiceCallback, this)
    		};
    		this.protocol.read(options);
    	} else {    		
    		OpenLayers.Console.debug("...no GeoNames protocol is associated with control...");
    		return false;
    	}
    },
    
    /**
     * private method: queryGeoNamesServiceCallback
     * 
     * callback method to add features extracted from query results in this.layer -
     * - and trigger the "geonamesquerycompleted" event
     */
    queryGeoNamesServiceCallback: function(query_results) {
    	//OpenLayers.Console.debug("...queryGeoNamesServiceCallback is called...");
    	OpenLayers.Console.debug("...add geonames query result features in vector layer...");
    	if(this.layer && this.layer instanceof OpenLayers.Layer.Vector) {
    		var features = query_results.features;
    		for(var i=0; i<features.length; i++) {
    			features[i].state = OpenLayers.State.INSERT;    			
    		}
    		this.layer.addFeatures(features);
    		this.layer.events.triggerEvent("featuresadded",{features:features});
    	}
    	// trigger the "geonamesquerycompleted", so extra callbacks will be called
    	this.events.triggerEvent(
    		"geonamesquerycompleted", 
    		{
    			features: query_results.features
    		}
    	);
    },
    	
	CLASS_NAME: "OpenLayers.Control.GeoNamesService"
});

