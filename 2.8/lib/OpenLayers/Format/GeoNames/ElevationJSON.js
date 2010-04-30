/**
 * @requires OpenLayers/Format/GeoNames/ServiceJSON.js
 */

/**
 * Class: OpenLayers.Format.GeoNames.ElevationJSON
 *
 * Inherits from:
 *  - <OpenLayers.Format.GeoNames.ServiceJSON>
 */
OpenLayers.Format.GeoNames.ElevationJSON = OpenLayers.Class(OpenLayers.Format.GeoNames.ServiceJSON, {
    
    /**
     * Constructor: OpenLayers.Format.GeoNames.ElevationJSON
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {    
		// initialize superclass OpenLayers.Format.GeoNames.ServiceJSON
		OpenLayers.Format.GeoNames.ServiceJSON.prototype.initialize.apply(this, [options]);						
    },
    
    /**
     * API Method: readAsFeatures 
     * 
     * GeoNames elevation service has a slightly different JSON response syntax:
     * 
     * e.g.
     * {
     * 		'geonames': {
     * 			<elevation_source>: elevation value, // e.g. astergdem: 192
     * 			lng: longitude,
     * 			lat: latitude
     * 		}
     * }
     */
    readAsFeatures: function(data) {
    	// TODO: doc the original structure of JSON string    	
    	var result = OpenLayers.Format.JSON.prototype.read.apply(this, [data]);
    	var result_item = result['geonames'];               	
    	var lng = result_item['lng'];
    	var lat = result_item['lat'];
    	if(lng && lat) {
    		var geometry = new OpenLayers.Geometry.Point(lng, lat);    			    			
        	var feature = new OpenLayers.Feature.Vector(geometry, result_item);        		
    	} else {
    		OpenLayers.Console.warning("...can not extract geographic location...skip parsing it as a feature...");    			
    	}    		    	
    	return [feature];
    },

    CLASS_NAME: "OpenLayers.Format.GeoNames.ElevationJSON" 
});
