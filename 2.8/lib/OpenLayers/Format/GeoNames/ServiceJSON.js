/**
 * @requires OpenLayers/Format/JSON.js
 * @requires OpenLayers/Format/GeoNames.js
 */

/**
 * Class: OpenLayers.Format.GeoNames.ServiceJSON
 *
 * Inherits from:
 *  - <OpenLayers.Format.JSON>
 */
OpenLayers.Format.GeoNames.ServiceJSON = OpenLayers.Class(OpenLayers.Format.JSON, {    
    /**
     * Constructor: OpenLayers.Format.GeoNames.ServiceJSON
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {    
		// initialize superclass OpenLayers.Format.JSON
		OpenLayers.Format.JSON.prototype.initialize.apply(this, [options]);						
    },
    
    /**
     * API Method: read
     * Wrapper of this.readAsFetures to be consistent with other formats like GeoJSON or GML 
     * 
     */
    read: function(data) {
    	return this.readAsFeatures(data);
    },
    
    /**
     * API Method: readAsFeatures
     * Parse JSON string to extract features
     * 
     */
    readAsFeatures: function(data) {
    	// TODO: doc the original structure of JSON string    	
    	// GeoNames service JSON response has a quite common syntax as below:
    	/*
    	 * e.g.
    	 * {
    	 * 		'totalResultsCount': 49,
    	 * 		'geonames': [
    	 * 			{
    	 * 				attribute1: value1,
    	 * 				...
    	 * 				lng: longitude,
    	 * 				lat: latitude,
    	 * 				...
    	 * 			},
    	 * 			...
    	 * 		]
    	 * }
    	 * 
    	 * readAsFeatures will be overriden if specific GeoNames has different JSON response structure
    	 */    	
    	var result = OpenLayers.Format.JSON.prototype.read.apply(this, [data]);
    	var result_items = result['geonames'];
    	var result_items_count = result['totalResultsCount'];
    	
    	var features = [];
    	if(result_items instanceof Array) {    		        
        	for(var i=0; i<result_items.length; i++) {
        		// extract lon and lat to create a point feature
        		var lng = result_items[i]['lng'];
        		var lat = result_items[i]['lat'];
        		if(lng != null && lat != null) {
        			var geometry = new OpenLayers.Geometry.Point(lng, lat);    			    			
            		var feature = new OpenLayers.Feature.Vector(geometry, result_items[i]);
            		features.push(feature);
        		} else {
        			OpenLayers.Console.debug("...can not extract location information...");    			
        		}    		
        	}        	
    	}
    	return features;    	
    },
  
    CLASS_NAME: "OpenLayers.Format.GeoNames.ServiceJSON" 
});
