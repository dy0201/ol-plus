/**
 * @requires OpenLayers/Format.js
 */

/**
 * Function: OpenLayers.Format.WFST2
 * Used to create a versioned WFS protocol that supports Lock/GetFeatureWithLock.  Default version is 1.0.0.
 *
 * Returns:
 * {<OpenLayers.Format>} A WFST format of the given version.
 */
OpenLayers.Format.WFST2 = function(options) {
    options = OpenLayers.Util.applyDefaults(
        options, OpenLayers.Format.WFST2.DEFAULTS
    );
    var cls = OpenLayers.Format.WFST2["v"+options.version.replace(/\./g, "_")];
    if(!cls) {
        throw "Unsupported WFST version: " + options.version;
    }
    return new cls(options);
}

/**
 * Constant: OpenLayers.Format.WFST.DEFAULTS
 * {Object} Default properties for the WFST format.
 */
OpenLayers.Format.WFST2.DEFAULTS = {
    "version": "1.1.0"
};
