/**
 * @requires OpenLayers/Format/GeoNames/ServiceJSON.js
 */

/**
 * Class: OpenLayers.Format.GeoNames.SearchJSON
 *
 * Inherits from:
 *  - <OpenLayers.Format.JSON>
 */
OpenLayers.Format.GeoNames.SearchJSON = OpenLayers.Class(OpenLayers.Format.GeoNames.ServiceJSON, {
    
    /**
     * Constructor: OpenLayers.Format.GeoNames.SearchJSON
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {    
		// initialize superclass OpenLayers.Format.JSON
		OpenLayers.Format.GeoNames.ServiceJSON.prototype.initialize.apply(this, [options]);						
    },
    
    CLASS_NAME: "OpenLayers.Format.GeoNames.SearchJSON" 
});
