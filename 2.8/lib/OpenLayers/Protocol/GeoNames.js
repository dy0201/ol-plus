/**
 * @requires OpenLayers/Protocol.js
 */

/**
 * Function: OpenLayers.Protocol.GeoNames
 * Used to create a specific GeoNames protocol.  Default protocol is 'Service',
 *     which is parent protocol for other specific protocols 
 *
 * Returns:
 * {<OpenLayers.Protocol>} A GeoNames protocol of the given web service
 */
OpenLayers.Protocol.GeoNames = function(options) {
    // apply default service type and response format
	options = OpenLayers.Util.applyDefaults(
        options, OpenLayers.Protocol.GeoNames.DEFAULTS
    );
	// instantiate a GeoNames service protocol based on type of service like "wikipedia" or "search"
	var cls = OpenLayers.Protocol.GeoNames[options.service];    
	if(!cls) {
        throw "Unsupported GeoName service: " + options.service;
    }
    return new cls(options);
};

/**
 * Constant: OpenLayers.Protocol.GeoNames.DEFAULTS
 */
OpenLayers.Protocol.GeoNames.DEFAULTS = {    
	'service': "Service",
	'responseType': "JSON"
};

/**
 * Constant: OpenLayers.Protocol.GeoNames.COMMON_QUERY_PARAMS
 */
OpenLayers.Protocol.GeoNames.COMMON_QUERY_PARAMS = {    
	/* common search parameters */	
	'lang': 		"en",
	'charset': 		"UTF-8",
	'type': 		"json",
	'operator': 	"AND",
	'style':		"MEDIUM",
	'maxRows':		49,
	'startRow':		0
	
	/* default spatial search parameters for GeoNames spatial query */
	/*
	'lng':			0.0,
	'lat':			0.0,
	'west':			-180.0,
	'east':			180.0,
	'south':		-90.0,
	'north':		90.0
	*/
};

