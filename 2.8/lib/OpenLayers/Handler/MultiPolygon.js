/**
 * @requires OpenLayers/Handler.js
 * @requires OpenLayers/Handler/Polygon.js
 */

OpenLayers.Handler.MultiPolygon = OpenLayers.Class(OpenLayers.Handler.Polygon, {
    
    multi: true,

    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Polygon.prototype.initialize.apply(this, arguments);
    },
 
    CLASS_NAME: "OpenLayers.Handler.MultiPolygon"
});
