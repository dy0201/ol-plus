/* Copyright (c) 2006 MetaCarta, Inc., published under a modified BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/repository-license.txt 
 * for the full text of the license. */

/**
 * @requires OpenLayers/Format/XML.js
 */

/**
 * Class: OpenLayers.Format.OWS
 * Read/Wite OWS. Create a new instance with the <OpenLayers.Format.OWS>
 *     constructor.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.OWS = OpenLayers.Class(OpenLayers.Format.XML, {
    
    /**
     * APIProperty: defaultVersion
     * {String} Version number to assume if none found.  Default is "1.0.0".
     */
    defaultVersion: "1.1.0",
    
    /**
     * APIProperty: version
     * {String} Specify a version string if one is known.
     */
    version: null,
    
    /**
     * Property: parser
     * {Object} Instance of the versioned parser.  Cached for multiple read and
     *     write calls of the same version.
     */
    parser: null,

    /**
     * Constructor: OpenLayers.Format.OWS
     * Create a new parser for OWS.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
    },

    /**
     * APIMethod: write
     * Write a OWS document
     *
     * Parameters:
     * ows - {Object} An object representing the OWS.
     * options - {Object} Optional configuration object.
     *
     * Returns:
     * {String} An OWS document string.
     */
    write: function(ows, options) {
        var version = (options && options.version) ||
                      this.version || this.defaultVersion;
        if(!this.parser || this.parser.VERSION != version) {
            var format = OpenLayers.Format.OWS[
                "v" + version.replace(/\./g, "_")
            ];
            if(!format) {
                throw "Can't find an OWS parser for version " +
                      version;
            }
            this.parser = new format(this.options);
        }
        var root = this.parser.write(ows);
        return OpenLayers.Format.XML.prototype.write.apply(this, [root]);
    },
    
    /**
     * APIMethod: read
     * Read an OWS doc and return an object representing the OWS.
     *
     * Parameters:
     * data - {String | DOMElement} Data to read.
     * options - {Object} Options for the reader.
     *
     * Returns:
     * {Object} An object representing the OWS.
     */
    read: function(data, options) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        var root = data.documentElement;
        var version = this.version;
        if(!version) {
            version = root.getAttribute("version");
            if(!version) {
                version = this.defaultVersion;
            }
        }
        if(!this.parser || this.parser.VERSION != version) {
            var format = OpenLayers.Format.OWS[
                "v" + version.replace(/\./g, "_")
            ];
            if(!format) {
                throw "Can't find an OWS parser for version " +
                      version;
            }
            this.parser = new format(this.options);
        }
        var ows = this.parser.read(data, options);
        return ows;
    },

    CLASS_NAME: "OpenLayers.Format.OWS" 
});