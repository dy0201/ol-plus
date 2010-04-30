/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format.js
 */

/**
 * Function: OpenLayers.Format.WPS
 * Used to parse/encode WPS.  Default version is 1.0.0.
 *
 * Returns:
 *
 */
OpenLayers.Format.WPS = function(options) {
    options = OpenLayers.Util.applyDefaults(
        options, OpenLayers.Format.WPS.DEFAULTS
    );
    var cls = OpenLayers.Format.WPS["v"+options.version.replace(/\./g, "_")];
    if(!cls) {
        throw "Unsupported WPS version: " + options.version;
    }
    return new cls(options);
};

/**
 * Constant: OpenLayers.Format.WFST.DEFAULTS
 * {Object} Default properties for the WFST format.
 */
OpenLayers.Format.WPS.DEFAULTS = {
    "version": "1.0.0"
};