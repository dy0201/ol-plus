/**
 * @requires OpenLayers/Protocol.js
 */

/**
 * Function: OpenLayers.Protocol.WFS2
 * Used to create a versioned WFS protocol that supports Lock/GetFeatureWithLock.  Default version is 1.0.0.
 *
 * Returns:
 * {<OpenLayers.Protocol>} A WFS protocol of the given version.
 */
OpenLayers.Protocol.WFS2 = function(options) {
    options = OpenLayers.Util.applyDefaults(
        options, OpenLayers.Protocol.WFS2.DEFAULTS
    );
    var cls = OpenLayers.Protocol.WFS2["v"+options.version.replace(/\./g, "_")];
    if(!cls) {
        throw "Unsupported WFS version: " + options.version;
    }
    return new cls(options);
}

/**
 * Function: OpenLayers.Protocol.WFS.fromWMSLayer
 * Convenience function to create a WFS protocol from a WMS layer.  This makes
 *     the assumption that a WFS requests can be issued at the same URL as
 *     WMS requests and that a WFS featureType exists with the same name as the
 *     WMS layer.
 *     
 * This function is designed to auto-configure <url>, <featureType>,
 *     <featurePrefix> and <srsName> for WFS <version> 1.1.0. Note that
 *     srsName matching with the WMS layer will not work with WFS 1.0.0..
 * 
 * Parameters:
 * layer - {<OpenLayers.Layer.WMS>} WMS layer that has a matching WFS
 *     FeatureType at the same server url with the same typename.
 * options - {Object} Default properties to be set on the protocol.
 *
 */
// inherit 'fromWMSLayer' function from WFS protocol
OpenLayers.Protocol.WFS2.fromWMSLayer = OpenLayers.Protocol.WFS.fromWMSLayer;

/**
 * Constant: OpenLayers.Protocol.WFS2.DEFAULTS
 */
OpenLayers.Protocol.WFS2.DEFAULTS = {
    "version": "1.1.0"
};
