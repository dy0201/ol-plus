/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * licence.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Layer/Grid.js
 */

/**
 * Class: OpenLayers.Layer.TileCache
 * A read only TileCache layer.  Used to requests tiles cached by TileCache in
 *     a web accessible cache.  This means that you have to pre-populate your
 *     cache before this layer can be used.  It is meant only to read tiles
 *     created by TileCache, and not to make calls to TileCache for tile
 *     creation.  Create a new instance with the
 *     <OpenLayers.Layer.TileCache> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Grid>
 */
OpenLayers.Layer.TileCache = OpenLayers.Class(OpenLayers.Layer.Grid, {

    /** 
     * APIProperty: isBaseLayer
     * {Boolean} Treat this layer as a base layer.  Default is true.
     */
    isBaseLayer: true,
    
    /** 
     * APIProperty: format
     * {String} Mime type of the images returned.  Default is image/png.
     */
    format: 'image/png',

    /**
     * APIProperty: serverResolutions
     * {Array} A list of all resolutions available on the server.  Only set this 
     *     property if the map resolutions differs from the server.
     */
    serverResolutions: null,

    /**
     * Constructor: OpenLayers.Layer.TileCache
     * Create a new read only TileCache layer.
     *
     * Parameters:
     * name - {String} Name of the layer displayed in the interface
     * url - {String} Location of the web accessible cache (not the location of
     *     your tilecache script!)
     * layername - {String} Layer name as defined in the TileCache 
     *     configuration
     * options - {Object} Optional object with properties to be set on the
     *     layer.  Note that you should speficy your resolutions to match
     *     your TileCache configuration.  This can be done by setting
     *     the resolutions array directly (here or on the map), by setting
     *     maxResolution and numZoomLevels, or by using scale based properties.
     */
    initialize: function(name, url, layername, options) {
        this.layername = layername;
        OpenLayers.Layer.Grid.prototype.initialize.apply(this,
                                                         [name, url, {}, options]);
        this.extension = this.format.split('/')[1].toLowerCase();
        this.extension = (this.extension == 'jpg') ? 'jpeg' : this.extension;
    },    

    /**
     * APIMethod: clone
     * obj - {Object} 
     * 
     * Returns:
     * {<OpenLayers.Layer.TileCache>} An exact clone of this 
     *     <OpenLayers.Layer.TileCache>
     */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer.TileCache(this.name,
                                                 this.url,
                                                 this.layername,
                                                 this.getOptions());
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
     *     passed-in bounds and appropriate tile size specified as parameters.
     */
    getURL: function(bounds) {
        var res = this.map.getResolution();
        var bbox = this.maxExtent;
        var size = this.tileSize;
        var tileX = Math.round((bounds.left - bbox.left) / (res * size.w));
        var tileY = Math.round((bounds.bottom - bbox.bottom) / (res * size.h));
        var tileZ = this.serverResolutions != null ?
            OpenLayers.Util.indexOf(this.serverResolutions, res) :
            this.map.getZoom();
        /**
         * Zero-pad a positive integer.
         * number - {Int} 
         * length - {Int} 
         *
         * Returns:
         * {String} A zero-padded string
         */
        function zeroPad(number, length) {
            number = String(number);
            var zeros = [];
            for(var i=0; i<length; ++i) {
                zeros.push('0');
            }
            return zeros.join('').substring(0, length - number.length) + number;
        }
        var components = [
            this.layername,
            zeroPad(tileZ, 2),
            zeroPad(parseInt(tileX / 1000000), 3),
            zeroPad((parseInt(tileX / 1000) % 1000), 3),
            zeroPad((parseInt(tileX) % 1000), 3),
            zeroPad(parseInt(tileY / 1000000), 3),
            zeroPad((parseInt(tileY / 1000) % 1000), 3),
            zeroPad((parseInt(tileY) % 1000), 3) + '.' + this.extension
        ];
        var path = components.join('/'); 
        var url = this.url;
        if (url instanceof Array) {
            url = this.selectUrl(path, url);
        }
        url = (url.charAt(url.length - 1) == '/') ? url : url + '/';
        return url + path;
    },

    /**
     * Method: addTile
     * Create a tile, initialize it, and add it to the layer div. 
     *
     * Parameters: 
     * bounds - {<OpenLayers.Bounds>} 
     * position - {<OpenLayers.Pixel>}
     *
     * Returns:
     * {<OpenLayers.Tile.Image>} The added <OpenLayers.Tile.Image>
     */
    addTile:function(bounds, position) {
        var url = this.getURL(bounds);
        return new OpenLayers.Tile.Image(this, position, bounds, 
                                             url, this.tileSize);
    },
    
    CLASS_NAME: "OpenLayers.Layer.TileCache"
});
