/**
 * @requires OpenLayers/Protocol/WFS2/v1.js
 * @requires OpenLayers/Format/WFST2/v1_0_0.js
 */

/**
 * Class: OpenLayers.Protocol.WFS2.v1_0_0
 * A WFS v1.0.0 protocol for vector layers.  Create a new instance with the
 *     <OpenLayers.Protocol.WFS2.v1_0_0> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Protocol.WFS2.v1>
 */
OpenLayers.Protocol.WFS2.v1_0_0 = OpenLayers.Class(OpenLayers.Protocol.WFS2.v1, {
    
    /**
     * Property: version
     * {String} WFS version number.
     */
    version: "1.0.0",
    
    /**
     * Constructor: OpenLayers.Protocol.WFS2.v1_0_0
     * A class for giving layers WFS v1.0.0 protocol.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     *
     * Valid options properties:
     * featureType - {String} Local (without prefix) feature typeName (required).
     * featureNS - {String} Feature namespace (optional).
     * featurePrefix - {String} Feature namespace alias (optional - only used
     *     if featureNS is provided).  Default is 'feature'.
     * geometryName - {String} Name of geometry attribute.  Default is 'the_geom'.
     */
   
    CLASS_NAME: "OpenLayers.Protocol.WFS2.v1_0_0" 
});
