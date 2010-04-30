/**
 * Wikipedia Fulltext Search
 * Webservice Type : XML or JSON
 * 
 * Url : ws.geonames.org/wikipediaSearch?
 * 		 ws.geonames.org/wikipediaSearchJSON?
 * Parameters : 
 * 		 q : place name (urlencoded utf8)
 * 		 title : search in the wikipedia title (optional)
 * 		 lang : language either 'de' or 'en' (default = en)
 * 		 maxRows : maximal number of rows returned (default = 10)
 * Result : returns the wikipedia entries found for the searchterm as xml document
 * Example http://ws.geonames.org/wikipediaSearch?q=london&maxRows=10
 * 
 * Wikipedia Articles in Bounding Box
 * Webservice Type : XML or JSON
 * Url : ws.geonames.org/wikipediaBoundingBox?
 * 		 ws.geonames.org/wikipediaBoundingBoxJSON?
 * Parameters : 
 * 		 south,north,east, west : coordinates of bounding box
 * 		 lang : language either 'de' or 'en' (default = en)
 * 		 maxRows : maximal number of rows returned (default = 10)
 * Result : returns the wikipedia entries within the bounding box as xml document
 * Example http://ws.geonames.org/wikipediaBoundingBox?north=44.1&south=-9.9&east=-22.4&west=55.2
 */

/**
 * @requires OpenLayers/Protocol/GeoNames/Service.js
 */

/**
 * Class: OpenLayers.Protocol.GeoNames.Wikipedia
 * 
 * Inherits from:
 *  - <OpenLayers.Protocol>
 */
OpenLayers.Protocol.GeoNames.Wikipedia = OpenLayers.Class(OpenLayers.Protocol.GeoNames.Service, {
	
	// see OpenLayers.Protocol.GeoNames.Service for details of each of following attributes
	
	/**
	 * 
	 */
	service: "Wikipedia",
	
	/**
	 *
	 */
	urls: {
		'JSON': "http://ws.geonames.org/wikipediaSearchJSON?",
		'JSON_S': "http://ws.geonames.org/wikipediaBoundingBoxJSON?",
		'XML': "http://ws.geonames.org/wikipediaSearch?"
	},
	
	/**
	 * 
	 */
	isSpatialSearch: true,
		
	/**
	 * 
	 */
	spatialSearchType: "BBOX",
	
	/**
	 * 
	 */
	commonQueryParams: ['lang', 'maxRows'],
			
	/**
	 * 
	 */
	queryParams: {
		'q': "",
		'title': ""
	},
			
	/**
	 * 
	 */
	initialize: function(options) {		 
		OpenLayers.Protocol.GeoNames.Service.prototype.initialize.apply(this, [options]);
	},
	
	CLASS_NAME: "OpenLayers.Protocol.GeoNames.Wikipedia" 
});