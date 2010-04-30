/**
 * @requires OpenLayers/Format.js
 */

/**
 * Function: OpenLayers.Format.SQL
 *
 * Returns:
 * {<OpenLayers.Format>} A SQL Filter format of the given type.
 */
OpenLayers.Format.SQL = function(options) {
    options = OpenLayers.Util.applyDefaults(
        options, OpenLayers.Format.SQL.DEFAULTS
    );
    var cls = OpenLayers.Format.SQL[options.type + "_SQL"];
    if(!cls) {
        throw "Unsupported SQL type: " + options.type;
    }
    return new cls(options);
};

/**
 * Constant: OpenLayers.Format.SQL.DEFAULTS
 * {Object} Default properties for the SQL format.
 */
OpenLayers.Format.SQL.DEFAULTS = {
    'type': "PostGIS"
};