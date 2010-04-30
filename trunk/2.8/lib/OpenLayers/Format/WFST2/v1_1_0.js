/**
 * @requires OpenLayers/Format/WFST2/v1.js
 * @requires OpenLayers/Format/GML/v3.js
 * @requires OpenLayers/Format/Filter/v1_1_0.js
 */

/**
 * Class: OpenLayers.Format.WFST2.v1_1_0
 * A format for creating WFS v1.1.0 transactions.  Create a new instance with the
 *     <OpenLayers.Format.WFST2.v1_1_0> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.WFST.v1>
 */
OpenLayers.Format.WFST2.v1_1_0 = OpenLayers.Class(OpenLayers.Format.WFST2.v1, {
    
    /**
     * Property: version
     * {String} WFS version number.
     */
    version: "1.1.0",
    
    /**
     * Property: schemaLocations
     * {Object} Properties are namespace aliases, values are schema locations.
     */
    schemaLocations: {
        "wfs": "http://schemas.opengis.net/wfs/1.1.0/wfs.xsd"
    },
    
    /**
     * Constructor: OpenLayers.Format.WFST2.v1_1_0
     * A class for parsing and generating WFS v1.1.0 transactions.
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
    
    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "wfs": OpenLayers.Util.applyDefaults({
            "TransactionResponse": function(node, obj) {
                obj.insertIds = [];
                obj.success = false;
                this.readChildNodes(node, obj);
            },
            "TransactionSummary": function(node, obj) {
                // this is a limited test of success
                obj.success = true;
            },
            "InsertResults": function(node, obj) {
                this.readChildNodes(node, obj);
            },
            "Feature": function(node, container) {
                var obj = {fids: []};
                this.readChildNodes(node, obj);
                container.insertIds.push(obj.fids[0]);
            }
        }, OpenLayers.Format.WFST2.v1.prototype.readers["wfs"]),
        // readers in OpenLayers.Format.GML.v3 doesn't support 'MultiCurve' or 'MultiSurface'
		// add readers under 'gml' namespace to support parsing 'MultiCurve' or 'MultiSurface'
		"gml":  OpenLayers.Util.applyDefaults({ 			
			srsName: this.srsName
			/*
			"MultiCurve": function(node, container) { // add support gml:MultiCurve
                var obj = {components: []};
                this.readChildNodes(node, obj);
                if(obj.components.length > 0) {
                    container.components = [
                        new OpenLayers.Geometry.MultiLineString(obj.components)
                    ];
                }
            },
            "curveMember": function(node, obj) { // add support gml:curveMember
                this.readChildNodes(node, obj);
            },
            "MultiSurface": function(node, container) { // add support gml:MultiSurface
                var obj = {components: []};
                this.readChildNodes(node, obj);
                if(obj.components.length > 0) {
                    container.components = [
                        new OpenLayers.Geometry.MultiPolygon(obj.components)
                    ];
                }
            },
            "surfaceMember": function(node, obj) { // add support gml:surfaceMember
                this.readChildNodes(node, obj);
            }
			*/
		}, OpenLayers.Format.GML.v3.prototype.readers["gml"]),
        "feature": OpenLayers.Format.GML.v3.prototype.readers["feature"],
        "ogc": OpenLayers.Format.Filter.v1_1_0.prototype.readers["ogc"]
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        // writers for 'wfs' namespace
		"wfs": OpenLayers.Util.applyDefaults({
            "Query": function(options) {
                options = OpenLayers.Util.extend({
                    featureNS: this.featureNS,
                    featurePrefix: this.featurePrefix,
                    featureType: this.featureType,
                    srsName: this.srsName
                }, options);
                var node = this.createElementNSPlus("wfs:Query", {
                    attributes: {
                        typeName: (options.featureNS ? options.featurePrefix + ":" : "") +
                            options.featureType,
                        srsName: options.srsName
                    }
                });
                if(options.featureNS) {
                    node.setAttribute("xmlns:" + options.featurePrefix, options.featureNS);
                }
                if(options.filter) {
                    this.setFilterProperty(options.filter);
                    this.writeNode("ogc:Filter", options.filter, node);
                }
                return node;
            }
        }, OpenLayers.Format.WFST2.v1.prototype.writers["wfs"]),
		// writers in OpenLayers.Format.GML.v3 doesn't support 'MultiCurve' or 'MultiSurface' out of box
		// add writers under 'gml' namespace to support encoding 'MultiCurve' or 'MultiSurface'
        "gml": OpenLayers.Util.applyDefaults({			
        	/*
			"MultiCurve": function(geometry) {
                var node = this.createElementNSPlus("gml:MultiCurve");
                for(var i=0; i<geometry.components.length; ++i) {
                    this.writeNode("curveMember", geometry.components[i], node);
                }
                return node;
            },
            "curveMember": function(geometry) {
                var node = this.createElementNSPlus("gml:curveMember");
                this.writeNode("LineString", geometry, node);
                return node;
            },
            "MultiSurface": function(geometry) {
                var node = this.createElementNSPlus("gml:MultiSurface");
                for(var i=0; i<geometry.components.length; ++i) {
                    this.writeNode(
                        "surfaceMember", geometry.components[i], node
                    );
                }
                return node;
            },
            "surfaceMember": function(geometry) {
                var node = this.createElementNSPlus("gml:surfaceMember");
                this.writeNode("Polygon", geometry, node);
                return node;
            }
            */
		}, OpenLayers.Format.GML.v3.prototype.writers["gml"]),
        // writers['feature'] in OpenLayers.Format.GML.v3 doesn't support customized namespace
		// override writers['feature'] in OpenLayers.Format.GML.v3
        "feature": OpenLayers.Util.applyDefaults({
            "_typeName": function(feature) {
				// use this.featurePrefix instead of hard coded prefix "feature"
                var node = this.createElementNSPlus(this.featurePrefix + ":" + this.featureType, {
                    attributes: {fid: feature.fid}
                });
                if(feature.geometry) {
                    this.writeNode("feature:_geometry", feature.geometry, node);
                }
                for(var name in feature.attributes) {
                    // check if attribute is defined in WFS feature type schema
                	// skip those which are not defined in schema because they will cause failure in WFS transactions 
                	// also include those defined in this.attributes_alias
                	var value = feature.attributes[name];
                	if(this.attributes[name]) {                		
                		if(value != null) {
                            this.writeNode(
                                "feature:_attribute",
                                {name: name, value: value}, node
                            );
                        }
                	} else if(this.attributes[this.attribute_alias[name]]) {                		
                		if(value != null) {
                            this.writeNode(
                                "feature:_attribute",
                                {name: this.attribute_alias[name], value: value}, node
                            );
                        }
                	}                	                    
                }
                return node;
            },
            "_geometry": function(geometry) {
                if(this.externalProjection && this.internalProjection) {
                    geometry = geometry.clone().transform(
                        this.internalProjection, this.externalProjection
                    );
                }    
                // use this.featurePrefix instead of hard coded prefix "feature"
				var node = this.createElementNSPlus(
                    this.featurePrefix + ":" + this.geometryName
                );
                // gml:multiPolygon could be gml:multiPolygon or gml:multiSurface
				// gml:multiLineString could be gml:multiLineString or gml:multiCurve
				var type = this.geometryTypes[geometry.CLASS_NAME];				
                var child = this.writeNode("gml:" + type, geometry, node);
                if(this.srsName) {
                    child.setAttribute("srsName", this.srsName);
                }
                return node;
            },
            "_attribute": function(obj) {
				// use this.featurePrefix instead of hard coded prefix "feature"
                return this.createElementNSPlus(this.featurePrefix + ":" + obj.name, {
                    value: obj.value
                });
            }
        }, OpenLayers.Format.GML.v3.prototype.writers["feature"]),
		"ogc": OpenLayers.Format.Filter.v1_1_0.prototype.writers["ogc"]
    },

    CLASS_NAME: "OpenLayers.Format.WFST2.v1_1_0" 
});
