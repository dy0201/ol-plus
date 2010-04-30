/**
 * @requires OpenLayers/Layer/Grid.js
 * @requires OpenLayers/Tile/Image.js
 */

/**
 * Class: OpenLayers.Layer.AgsDynamic
 * Instances of OpenLayers.Layer.AgsDynamic are used to display data from ArcGIS Server
 *   Map Service through its REST endpoint. 
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Grid>
 */
OpenLayers.Layer.AgsDynamic = OpenLayers.Class(OpenLayers.Layer.Grid, {
    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs 
     */
    DEFAULT_PARAMS: { 
    	F: "image",
        DPI: "96",
        FORMAT: "png",
        TRANSPARENT: false
    },
    
    /**
     * Property: reproject
     * *Deprecated*. See http://trac.openlayers.org/wiki/SphericalMercator
     * for information on the replacement for this functionality. 
     * {Boolean} Try to reproject this layer if its coordinate reference system
     *           is different than that of the base layer.  Default is true.  
     *           Set this in the layer options.  Should be set to false in 
     *           most cases.
     */
    //reproject: false,
 
    /**
     * APIProperty: isBaseLayer
     * {Boolean} Default is true for AgsDynamic layer
     */
    isBaseLayer: true,
    
    /**
     * APIProperty: encodeBBOX
     * {Boolean} Should the BBOX commas be encoded? 
     */
    encodeBBOX: false,
 
    /**
     * Constructor: OpenLayers.Layer.AgsDynamic
     * Create a new AgsDynamic layer object
     *
     * Parameters:
     * name - {String} A name for the layer
     * url - {String} Base url REST ArcGIS Server Map Service                
     * params - {Object} An object with key/value pairs representing the
     *                   GetMap query string parameters and parameter values.
     * options - {Ojbect} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, url, params, options) {        
        params = OpenLayers.Util.upperCaseObject(params);        
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, [name, url, params, options]);
        
        OpenLayers.Util.applyDefaults(
        	this.params,					   
            OpenLayers.Util.upperCaseObject(this.DEFAULT_PARAMS)
        );

        //layer is transparent        
        if (this.params.TRANSPARENT && 
            this.params.TRANSPARENT.toString().toLowerCase() == "true") {            
            // unless explicitly set in options, make layer an overlay
            if ( (options == null) || (!options.isBaseLayer) ) {
                this.isBaseLayer = false;
            }             
            // jpegs can never be transparent, so intelligently switch the 
            //  format, depending on teh browser's capabilities
            if (this.params.FORMAT == "image/jpeg") {
                this.params.FORMAT = OpenLayers.Util.alphaHack() ? "image/gif"
                                                                 : "image/png";
            }
        }
    },    
    
    /**
     * Method: destroy
     * Destroy this layer
     */
    destroy: function() {
        // for now, nothing special to do here. 
        OpenLayers.Layer.Grid.prototype.destroy.apply(this, arguments);  
    },

    
    /**
     * Method: clone
     * Create a clone of this layer
     *
     * Returns:
     * {<OpenLayers.Layer.WMS>} An exact clone of this layer
     */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer.AgsDynamic(this.name,
                                           this.url,
                                           this.params,
                                           this.options);
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },    
    
    /**
     * Method: getURL
     * Return a GetMap query string for this layer
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} A bounds representing the bbox for the
     *                                request.
     *
     * Returns:
     * {String} A string with the layer's url and parameters and also the
     *          passed-in bounds and appropriate tile size specified as 
     *          parameters.
     */
    getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);
        
        var imageSize = this.getImageSize(); 
        var newParams = {
            'BBOX': this.encodeBBOX ?  bounds.toBBOX() : bounds.toArray(),
            'SIZE': imageSize.w + "," + imageSize.h           
        };
        var requestString = this.getFullRequestString(newParams);
        return requestString;
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

    /**
     * APIMethod: mergeNewParams
     * Catch changeParams and uppercase the new params to be merged in
     *     before calling changeParams on the super class.
     * 
     *     Once params have been changed, we will need to re-init our tiles.
     * 
     * Parameters:
     * newParams - {Object} Hashtable of new params to use
     */
    mergeNewParams:function(newParams) {
        var upperParams = OpenLayers.Util.upperCaseObject(newParams);
        var newArguments = [upperParams];
        return OpenLayers.Layer.Grid.prototype.mergeNewParams.apply(this, 
                                                             newArguments);
    },

    /** 
     * Method: getFullRequestString
     * Combine the layer's url with its params and these newParams. 
     *
     * Parameters:
     * newParams - {Object}
     * altUrl - {String} Use this as the url instead of the layer's url
     * 
     * Returns:
     * {String} 
     */
    getFullRequestString:function(newParams, altUrl) {
        var projectionCode = this.map.getProjection();        
        if(this.params['BBOXSR'] === null || this.params['BBOXSR'] === undefined) {
        	this.params['BBOXSR'] = projectionCode.split(":")[1];
        	this.params['IMAGESR'] = projectionCode.split(":")[1];
        } else {
        	this.params['IMAGESR'] = this.params['BBOXSR']; 
        }        
        return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(
                                                    this, arguments);
    },

    CLASS_NAME: "OpenLayers.Layer.AgsDynamic"
});
