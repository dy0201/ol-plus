/**
 * Timezone
 * 
 * Webservice Type : REST
 * Url : ws.geonames.org/timezone?
 * Parameters : lat,lng, radius (buffer in km for closest timezone in coastal areas);
 * Result : the timezone at the lat/lng with gmt offset (1. January) and dst offset (1. July)
 * Example http://ws.geonames.org/timezone?lat=47.01&lng=10.2
 * 
 * Response elements:
 * 
 * timezoneId: name of the timezone (according to olson), this information is sufficient to work with the timezone and defines DST rules, consult the documentation of your development environment.
 * time: the local current time
 * rawOffset: the amount of time in hours to add to UTC to get standard time in this time zone.
 * gmtOffset: offset to GMT at 1. January (deprecated)
 * dstOffset: offset to GMT at 1. July (deprecated)
 */

/**
 * @requires OpenLayers/Protocol/GeoNames/Service.js
 */

/**
 * Class: OpenLayers.Protocol.GeoNames.TimeZone
 * 
 * Inherits from:
 *  - <OpenLayers.Protocol>
 */
OpenLayers.Protocol.GeoNames.TimeZone = OpenLayers.Class(OpenLayers.Protocol.GeoNames.Service, {
	
	// see OpenLayers.Protocol.GeoNames.Service for details of each of following attributes
	
	/**
	 * 
	 */
	service: "TimeZone",
	
	/**
	 * 	 
	 */
	urls: {
		'JSON': "http://ws.geonames.org/timezoneJSON?",
		'JSON_S': "http://ws.geonames.org/timezoneJSON?",
		'XML': "http://ws.geonames.org/timezone?"
	},
	
	/**
	 * 
	 */
	isSpatialSearch: true,
		
	/**
	 * 
	 */
	spatialSearchType: "LonLat",
	
	/**
	 * 
	 */
	commonQueryParams: ['none'],
			
	/**
	 * 
	 */
	queryParams: {
		'radius': 5 // 5km radius
	},
			
	/**
	 * 
	 */
	initialize: function(options) {		 
		OpenLayers.Protocol.GeoNames.Service.prototype.initialize.apply(this, [options]);
	},
	
	CLASS_NAME: "OpenLayers.Protocol.GeoNames.TimeZone" 
});