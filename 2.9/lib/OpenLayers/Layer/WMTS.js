/* Copyright (c) 2006-2009 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer/Grid.js
 * @requires OpenLayers/Tile/Image.js
 */

/**
 * Class: OpenLayers.Layer.WMTS
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Grid>
 */
OpenLayers.Layer.WMTS = OpenLayers.Class(OpenLayers.Layer.Grid, {
    
    /**
     * APIProperty: isBaseLayer
     * {Boolean}
     */
    isBaseLayer: true,

    /**
     * APIProperty: requestEncoding
     * {String} default is "REST", it can also be "KVP"
     */
    requestEncoding: "KVP",
    
    /**
     * constant: DEFAULT_PARAMS
     * {Object} default parameters for WMTS GetCapabilities/GetTile requests
     */
    DEFAULT_PARAMS: {
		service: "WMTS",
		version: "1.0.0",
		request: "GetTile",				
		format: "image/jpeg"
	},
	
    /**
     * APIProperty: tileOrigin
     * {<OpenLayers.Pixel>}
     */
    tileOrigin: null,
    
    /**
     * APIProperty: tileFullExtent
     * {<OpenLayers.Bounds>}
     */
    tileFullExtent: null,

	/**
     * APIProperty: tileFormatSuffix
     * {String}
     */
    tileFormatSuffix: "jpg",	

    /**
     * APIProperty: tileMatrics
     * {<Array>} tile maxtics information loaded from WMTS capabilities
     */
    tileMatrics: null,
    
	/**
	 * APIProperty: dimensions
	 * {<Array>} parameters in this.params that should be considered as a WMTS dimension parameter
	 */
	dimensions: [],
    
    /**
     * APIProperty: formatSuffixMap
     * {Object} a map between WMTS 'format' request parameter and tile image file suffix
     */
    formatSuffixMap: {
		'image/png': 	"png",
		'image/png8': 	"png",
		'image/png24': 	"png",
		'image/png32': 	"png",
		'png': 			"png",
		'image/jpeg': 	"jpg",
		'image/jpg': 	"jpg",
		'jpeg': 		"jpg",
		'jpg': 			"jpg"
	},
    
    /**
     * Constructor: OpenLayers.Layer.WMTS
     * 
     * Parameters:
     * name - {String}
     * url - {String}
     * params - {Object} WMTS request parameters
     * options - {Object} extra options to tag onto the layer
     */
    initialize: function(name, url, params, options) {
		var newArguments = [];        
        params = OpenLayers.Util.upperCaseObject(params); //uppercase params
        newArguments.push(name, url, params, options);       
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
        OpenLayers.Util.applyDefaults(
        	this.params, 
            OpenLayers.Util.upperCaseObject(this.DEFAULT_PARAMS)
        );
        // there must be a 'url'
        if(!this.url || this.url == "") {
        	OpenLayers.Console.error("...url missing or empty...");
     		//throw "...url missing or empty...";	
    	}               	          
        // format
        if(this.params.FORMAT != null) {
        	this.tileFormatSuffix = this.formatSuffixMap[this.params.FORMAT] || this.tileFormatSuffix;        	
        }
	},    
	
	/**
	 * APIMethod: setMap
	 * {OpenLayers.Map} overwrite default 'setMap' from Layer
	 */
	setMap: function(map) {		
		OpenLayers.Layer.Grid.prototype.setMap.apply(this, arguments);
		/*
		 * if this.tileMatrics is loaded from capabilities, update the tileSize and tileOrigin from -
		 *   - one of the tileMatrix based on zoom level
		 *   - tileSize and tileOrigin will be updated from tileMatrics if zoom level changed
		 */		
		if(this.tileMatrics!=null && this.tileMatrics.length>0) {
			//OpenLayers.Console.debug("...initialize tileOrigin and tileSize...");
			var zoom = this.map.getZoom();																	
			this.tileOrigin = this.tileMatrics[zoom].topLeftCorner;  
			this.tileSize = new OpenLayers.Size(this.tileMatrics[zoom].tileWidth, this.tileMatrics[zoom].tileHeight);								
			// listen on map event 'zoomend'		
			this.map.events.on({
				'zoomend': function(evt) {
					var zoom = this.map.getZoom();
					if(this.tileMatrics != null) {
						var tileMatrix = this.tileMatrics[zoom]; 								
						this.tileOrigin = tileMatrix.topLeftCorner;  
						this.tileSize = new OpenLayers.Size(tileMatrix.tileWidth, tileMatrix.tileHeight);
						//OpenLayers.Console.debug("...zoom changed...update tileOrigin and tileSize...");
					}
				},
				scope: this
			});
		}		
        if(this.tileSize === null) {
        	OpenLayers.Console.warn("...tileSize missing or empty...use 256x256...");
     		this.tileSize = new OpenLayers.Size(256, 256);
    	}
        if(!this.tileOrigin) { 
        	OpenLayers.Console.warn("...tileOrigin missing or empty...use bottom left corner of map...");
        	this.tileOrigin = new OpenLayers.LonLat(this.map.maxExtent.left, this.map.maxExtent.bottom);
        }   
        if(!this.tileFullExtent) { 
        	OpenLayers.Console.warn("...tileFullExtent missing or empty...use full extent of map...");
        	this.tileFullExtent = this.map.maxExtent;
        }
	},
		
    /**
     * APIMethod:destroy
     */
    destroy: function() {
        // for now, nothing special to do here. 
        OpenLayers.Layer.Grid.prototype.destroy.apply(this, arguments);  
    },
    
    /**
     * APIMethod: clone
     * 
     * Parameters:
     * obj - {Object}
     * 
     * Returns:
     * {<OpenLayers.Layer.WMTS>} An exact clone of this <OpenLayers.Layer.WMTS>
     */
    clone: function (obj) {        
        if (obj == null) {
            obj = new OpenLayers.Layer.WMTS(this.name, this.url, this.options);
        }
        //get all additions from superclasses
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);
        // copy/set any non-init, non-simple values here
        return obj;
    },    
    
    /**
     * Method: getURL
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * 
     * Returns:
     * {String} A string with the layer's url and parameters and also the 
     *          passed-in bounds and appropriate tile size specified as 
     *          parameters
     */
    getURL: function(bounds) {
        bounds = this.adjustBounds(bounds);
        
        var res = this.map.getResolution();        
        var path = null;
        var url = null;
        
        if(!this.tileFullExtent || this.tileFullExtent.intersectsBounds(bounds)) {        	
        	var zoom = this.map.getZoom(); 
        	var col = null;
	        if(this.tileOrigin.lon <= bounds.left) {
	        	col = Math.round((bounds.left - this.tileOrigin.lon) / (res * this.tileSize.w));
	        } else if(this.tileOrigin.lon >= bounds.right) {
	        	col = Math.round((this.tileOrigin.lon - bounds.right) / (res * this.tileSize.w));
	        } else {
	        	//return "../../img/transparent.png";
	        	return "";
	        	OpenLayers.Console.warn("...invalid tileOrigin...");
     			//throw "...invalid tileOrigin...";	
	        }                
	        var row = null;
	        if(this.tileOrigin.lat >= bounds.top) {
	        	row = Math.round((this.tileOrigin.lat - bounds.top) / (res * this.tileSize.h));
	        } else if(this.tileOrigin.lat <= bounds.bottom) {
	        	row = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
	        } else {
	        	//return "../../img/transparent.png";
	        	return "";
	        	OpenLayers.Console.warn("...invalid tileOrigin...");
     			//throw "...invalid tileOrigin...";
	        }        
	        
	        if(this.requestEncoding === "REST") {
	        	// include 'version', 'layer' and 'style' in tile resource url
		        path = this.params['VERSION'] + "/" + this.params['LAYER'] + "/" + this.params['STYLE'] + "/";
		        // include 'dimension' if there is any
		        for(var i=0; i<this.dimensions.length; i++) {
		        	if(this.params[this.dimensions[i]]) {
		        		path = path + this.params[this.dimensions[i]] + "/";
		        	}
		        }
		        // include 'tileMatrixSet'
		        path = path + this.params['TILEMATRIXSET'] + "/";	        
		        // include 'zoom'
		        path = path + zoom + "/";
		        // include 'tileRow', 'tileColumn' and tile image suffix
		        path = path + row + "/" + col + "." + this.tileFormatSuffix;
		        
		        url = this.url;
		        if (url instanceof Array) {
		            url = this.selectUrl(path, url);
		        }
		        //OpenLayers.Console.debug("bounds: " + bounds.toString());
		        //OpenLayers.Console.debug("url: " + url + path);
		        return url + path;
	        } else if(this.requestEncoding === "KVP") {
	        	var tileMatrixId;
	        	if(this.tileMatrics==null || this.tileMatrics.length==0) {
	        		//OpenLayers.Console.error("...this.tileMatrics missing or empty...");	         		
	        		tileMatrixId = zoom;
	        	} else {
	        		tileMatrixId = this.tileMatrics[zoom].identifier
	        	}
	        	var newParams = {	        		
	        		'TILEMATRIX': tileMatrixId,
	        		'TILEROW': row,
	        		'TILECOL': col	        		
	            };
	        	//OpenLayers.Console.debug("bounds: " + bounds.toString());
		        //OpenLayers.Console.debug("url: " + OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, [newParams]));
	        	return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, [newParams]);
	        } else { 
	        	OpenLayers.Console.error("...unsupported WMTS request encoding " + this.requestEncoding + "...");
     			throw "...unsupported WMTS request encoding " + this.requestEncoding + "...";
	        }
	    } else {
	    	// area outside of tiles' full extent
	    	//return "../../img/transparent.png";
	    	return "";
	    }        
    },
    
    /**
     * APIMethod: mergeNewParams
     * Catch changeParams and uppercase the new params to be merged in
     *     before calling changeParams on the super class.
     * 
     *     Once params have been changed, the tiles will be reloaded with
     *     the new parameters.
     * 
     * Parameters:
     * newParams - {Object} Hashtable of new params to use
     */
    mergeNewParams:function(newParams) {
        if(this.requestEncoding === "KVP") {
	    	var upperParams = OpenLayers.Util.upperCaseObject(newParams);
	        var newArguments = [upperParams];
	        return OpenLayers.Layer.Grid.prototype.mergeNewParams.apply(this, newArguments);
        }
    },

    /**
     * Method: addTile
     * addTile creates a tile, initializes it, and adds it to the layer div. 
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * position - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {<OpenLayers.Tile.Image>} The added OpenLayers.Tile.Image
     */
    addTile:function(bounds,position) {
        return new OpenLayers.Tile.Image(this, position, bounds, 
                                         null, this.tileSize);
    },

    CLASS_NAME: "OpenLayers.Layer.WMTS"
});
