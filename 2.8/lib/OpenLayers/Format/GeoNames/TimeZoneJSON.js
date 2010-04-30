/**
 * @requires OpenLayers/Format/GeoNames/ServiceJSON.js
 */

/**
 * Class: OpenLayers.Format.GeoNames.TimeZoneJSON
 *
 * Inherits from:
 *  - <OpenLayers.Format.GeoNames.ServiceJSON>
 */
OpenLayers.Format.GeoNames.TimeZoneJSON = OpenLayers.Class(OpenLayers.Format.GeoNames.ServiceJSON, {
    /**
     * Constructor: OpenLayers.Format.GeoNames.TimeZoneJSON
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {    
		// initialize superclass OpenLayers.Format.GeoNames.ServiceJSON
		OpenLayers.Format.GeoNames.ServiceJSON.prototype.initialize.apply(this, [options]);						
    },
    
    CLASS_NAME: "OpenLayers.Format.GeoNames.TimeZoneJSON" 
});
