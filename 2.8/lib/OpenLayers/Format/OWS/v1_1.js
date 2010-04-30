/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XML.js
 */

/**
 * Class: OpenLayers.Format.OWS.v1_1
 * Superclass for OWS version 1.1.* parsers.
 *
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.OWS.v1_1 = OpenLayers.Class(OpenLayers.Format.XML, {
    
    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        ows: "http://www.opengis.net/ows/1.1",
        ogc: "http://www.opengis.net/ogc",        
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance"
    },
    
    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "ows",

    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.
     */
    schemaLocation: null,    
    
    /**
     * Constructor: OpenLayers.Format.OWS.v1_1
     * Instances of this class are not created directly.  Use the
     *     <OpenLayers.Format.OWS> constructor instead.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
    },
    
    /**
     * Method: read
     *
     * Parameters:
     * data - {DOMElement} An SLD document element.
     * options - {Object} Options for the reader.
     *
     * Valid options:
     * namedLayersAsArray - {Boolean}  Generate a namedLayers array.  If false,
     *     the namedLayers property value will be an object keyed by layer name.
     *     Default is false.
     *
     * Returns:
     * {Object} An object representing the SLD.
     */
    read: function(data, options) {
        options = OpenLayers.Util.applyDefaults(options, this.options);
        var sld = {
            namedLayers: options.namedLayersAsArray === true ? [] : {}
        };
        this.readChildNodes(data, sld);
        return sld;
    },
    
    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: OpenLayers.Util.applyDefaults({
		"ows": {
			"Identifier": function(node, obj){
				obj.identifier = this.getChildValue(node);
			},
			"Title": function(node, obj){
				obj.title = this.getChildValue(node);
			},
			"Abstract": function(node, obj){
				obj.description = this.getChildValue(node);
			}
		},
	}, {}),
    
    /**
     * Method: write
     */
    write: function(ows) {
        OpenLayers.Console.error("...OpenLayers.Format.OWS.v1_1.write is not implemented...");
		throw "...OpenLayers.Format.OWS.v1_1.write is not implemented...";
    },
    
    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: OpenLayers.Util.applyDefaults({
        "ows": {
           "Identifier": function(identifier){
				return this.createElementNSPlus("ows:Identifier", {value: identifier});
			},
			"Title": function(title){
				return this.createElementNSPlus("ows:Title", {value: title});
			},
			"Abstract": function(description) {
				return this.createElementNSPlus("ows:Abstract", {value: description});
			} 
        }, 
	}, {}),
    
    CLASS_NAME: "OpenLayers.Format.OWS.v1_1" 

});