/**
 * @requires OpenLayers/Format.js
 */

/**
 * Function: OpenLayers.Format.GeoNames
 * Used to create a GeoNames protocol.
 *
 * Returns:
 * {<OpenLayers.Format>} A GeoNames format of the given type of service.
 */
OpenLayers.Format.GeoNames = function(options) {
	// apply default settings
	options = OpenLayers.Util.applyDefaults(
        options, OpenLayers.Format.GeoNames.DEFAULTS
    );
    /*
     *	e.g. OpenLayers.Format.GeoNames.SearchXML
     *		OpenLayers.Format.GeoNames.SearchJSON
     */
	var cls = OpenLayers.Format.GeoNames[options.service + options.responseType.toUpperCase()];    
	if(!cls) {
        throw "Unsupported GeoNames service: " + options.service 
        + " or response type: " + options.responseType;
    }
    return new cls(options);
};

/**
 * Constant: OpenLayers.Format.GeoNames.DEFAULTS
 * {Object} Default properties for the GeoNames format.
 */
OpenLayers.Format.GeoNames.DEFAULTS = {
    'service': "Search",
    'type': "JSON"
};
