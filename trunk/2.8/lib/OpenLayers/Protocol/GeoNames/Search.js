/**
 * @requires OpenLayers/Protocol/GeoNames/Service.js
 */

/**
 * Class: OpenLayers.Protocol.GeoNames.Search
 * 
 * Inherits from:
 *  - <OpenLayers.Protocol>
 */
OpenLayers.Protocol.GeoNames.Search = OpenLayers.Class(OpenLayers.Protocol.GeoNames.Service, {
	
	// see OpenLayers.Protocol.GeoNames.Service for details of each of following attributes
	
	/**
	 * 
	 */
	service: "Search",
	
	/**
	 * 
	 */
	urls: {
		'JSON': "http://ws.geonames.org/searchJSON?",
		'XML': "http://ws.geonames.org/search?"
	},
	
	/**
	 * 
	 */
	commonQueryParams: ['all'],
	
	/**
	 * 
	 */
	queryParams: {
		/*
		 * include query parameters with default value which are necessary to be appended in request
		 * user of this protocol may or may not supply all query parameters to overwrite default ones here
		 */
		'q': "", 					// {String}; search over all attributes of a place 
		//'name': "",					// {String}; search place name only
		//'name_equals': "",			// {String}; search place with exact place name
		'country': "",				// {String};
		'continentCode': "",		// {String}; restricts the search for toponym of the given continent.
									//			 continent code: AF,AS,EU,NA,OC,SA,AN
		'adminCode1': "",			// {String}; code of administrative subdivision
		'adminCode2': "",			
		'adminCode3': "",			
		//'featureClass': "all",			// {String}; feature class: A,H,L,P,R,S,T,U,V 
		//'featureCode': "all",			// {String}; feature code: see http://www.geonames.org/export/codes.html
		'isNameRequired': true		// {boolean}; at least one of the search term needs to be part of the place name	
	},
	
	/**
	 * 
	 */
	initialize: function(options) {		 
		OpenLayers.Protocol.GeoNames.Service.prototype.initialize.apply(this, [options]);
	},
	
	CLASS_NAME: "OpenLayers.Protocol.GeoNames.Search" 
});
