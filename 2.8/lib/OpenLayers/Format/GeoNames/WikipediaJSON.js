/**
 * @requires OpenLayers/Format/GeoNames/ServiceJSON.js
 */

/**
 * Class: OpenLayers.Format.GeoNames.WikipediaJSON
 *
 * Inherits from:
 *  - <OpenLayers.Format.JSON>
 */
OpenLayers.Format.GeoNames.WikipediaJSON = OpenLayers.Class(OpenLayers.Format.GeoNames.ServiceJSON, {
    
    /**
     * Constructor: OpenLayers.Format.GeoNames.WikipediaJSON
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {    
		// initialize superclass OpenLayers.Format.GeoNames.ServiceJSON
		OpenLayers.Format.GeoNames.ServiceJSON.prototype.initialize.apply(this, [options]);						
    },
    
    CLASS_NAME: "OpenLayers.Format.GeoNames.WikipediaJSON" 
});
