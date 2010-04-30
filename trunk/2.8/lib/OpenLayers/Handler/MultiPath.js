
/**
 * @requires OpenLayers/Handler.js
 * @requires OpenLayers/Handler/Path.js
 */

OpenLayers.Handler.MultiPath = OpenLayers.Class(OpenLayers.Handler.Path, {
    
    multi: true,
    
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Path.prototype.initialize.apply(this, arguments);
    },
        
    CLASS_NAME: "OpenLayers.Handler.MultiPath"
});
