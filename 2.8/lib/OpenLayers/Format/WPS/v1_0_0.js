/**
 * @requires OpenLayers/Format/WPS/v1.js
 */

/**
 * Class: OpenLayers.Format.WPS/v1_0_0
 * Parse/encode WPS version 1.0.0.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.WPS.v1>
 */
OpenLayers.Format.WPS.v1_0_0 = OpenLayers.Class(
    OpenLayers.Format.WPS.v1, {
    
	/**
	 * 
	 */
	namespaces: OpenLayers.Util.extend({
					"wps": "http://www.opengis.net/wps/1.0.0"
				}, OpenLayers.Format.WPS.v1.prototype.namespaces),
	
    /**
     * 
     */
	version: "1.0.0",
	
	/**
	 * 
	 */
	schema: "http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd",
	
	/**
	 * 
	 */
	schemaLocation: "http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd",
	
	/**
	 * 
	 */
	schemaLocations: {
        "wps": "http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd",
		//"wps": "http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd",
    },
	
	/**
	 * 
	 */
	readers: {
		"wps": OpenLayers.Util.applyDefaults({
			// add WPS 1.0.0 specific parsers
		}, OpenLayers.Format.WPS.v1.prototype.readers["wps"]),
        "gml": OpenLayers.Format.GML.v2.prototype.readers["gml"],
        "feature": OpenLayers.Format.GML.v2.prototype.readers["feature"],
        "ogc": OpenLayers.Format.Filter.v1_0_0.prototype.readers["ogc"],
		"ows": OpenLayers.Format.OWS.v1_1.prototype.readers["ows"]
	},
	
	/**
	 * 
	 */
	writers: {
		"wps": OpenLayers.Util.applyDefaults({
            // add WPS 1.0.0 specific encoders
        }, OpenLayers.Format.WPS.v1.prototype.writers["wps"]),
        "gml": OpenLayers.Format.GML.v2.prototype.writers["gml"],
        "feature": OpenLayers.Format.GML.v2.prototype.writers["feature"],
        "ogc": OpenLayers.Format.Filter.v1_0_0.prototype.writers["ogc"],
		"ows": OpenLayers.Format.OWS.v1_1.prototype.writers["ows"]
	},
	
	/**
     * Constructor: OpenLayers.Format.WPS.v1_0_0
     * Create a new parser/encoder for WPS version 1.0.0.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.WPS.v1.prototype.initialize.apply(this, [options]);
		
    },

    CLASS_NAME: "OpenLayers.Format.WPS.v1_0_0" 

});