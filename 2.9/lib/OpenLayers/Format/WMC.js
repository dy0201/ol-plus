/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XML.js
 */

/**
 * Class: OpenLayers.Format.WMC
 * Read and write Web Map Context documents.
 *
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.WMC = OpenLayers.Class({
    
    /**
     * APIProperty: defaultVersion
     * {String} Version number to assume if none found.  Default is "1.1.0".
     */
    defaultVersion: "1.1.0",
    
    /**
     * APIProperty: version
     * {String} Specify a version string if one is known.
     */
    version: null,

    /**
     * Property: layerOptions
     * {Object} Default options for layers created by the parser. These
     *     options are overridden by the options which are read from the 
     *     capabilities document.
     */
    layerOptions: null, 

    /**
     * Property: layerParams
     * {Object} Default parameters for layers created by the parser. This
     *     can be used to override DEFAULT_PARAMS for OpenLayers.Layer.WMS.
     */
    layerParams: null,
    
    /**
     * Property: parser
     * {Object} Instance of the versioned parser.  Cached for multiple read and
     *     write calls of the same version.
     */
    parser: null,

    /**
     * Constructor: OpenLayers.Format.WMC
     * Create a new parser for WMC docs.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Util.extend(this, options);
        this.options = options;
    },

    /**
     * APIMethod: read
     * Read WMC data from a string, and return an object with map properties
     *     and a list of layers. 
     * 
     * Parameters: 
     * data - {String} or {DOMElement} data to read/parse.
     * options - {Object} The options object must contain a map property.  If
     *     the map property is a string, it must be the id of a dom element
     *     where the new map will be placed. If the map property is an
     *     <OpenLayers.Map>, the layers from the context document will be added
     *     to the map. If the map property is an object, this will be
     *     considered as options to create the map with, in most cases, it would
     *     have a div property.
     *
     * Returns:
     * {<OpenLayers.Map>} A map based on the context.
     */
    read: function(data, options) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        var root = data.documentElement;
        var version = this.version;
        if(!version) {
            version = root.getAttribute("version");
        }
        var parser = this.getParser(version);
        var context = parser.read(data, options);
        var map;
        if(options && options.map) {
            this.context = context;
            if(options.map instanceof OpenLayers.Map) {
                map = this.mergeContextToMap(context, options.map);
            } else {
                var mapOptions = options.map;
                if(OpenLayers.Util.isElement(mapOptions) ||
                   typeof mapOptions == "string") {
                    // we assume mapOptions references a div
                    // element
                    mapOptions = {div: mapOptions};
                }
                map = this.contextToMap(context, mapOptions);
            }
        } else {
            // not documented as part of the API, provided as a non-API option
            map = context;
        }
        return map;
    },

    /**
     * Method: getParser
     * Get the WMC parser given a version. Create a new parser if it does not
     * already exist.
     *
     * Parameters:
     * version - {String} The version of the parser.
     *
     * Returns:
     * {<OpenLayers.Format.WMC.v1>} A WMC parser.
     */
    getParser: function(version) {
        var v = version || this.version || this.defaultVersion;
        if(!this.parser || this.parser.VERSION != v) {
            var format = OpenLayers.Format.WMC[
                "v" + v.replace(/\./g, "_")
            ];
            if(!format) {
                throw "Can't find a WMC parser for version " + v;
            }
            this.parser = new format(this.options);
        }
        return this.parser;
    },

    /**
     * Method: getLayerFromContext
     * Create a WMS layer from a layerContext object.
     *
     * Parameters:
     * layerContext - {Object} An object representing a WMS layer.
     *
     * Returns:
     * {<OpenLayers.Layer.WMS>} A WMS layer.
     */
    getLayerFromContext: function(layerContext) {
        var i, len;
        // fill initial options object from layerContext
        var options = {
            queryable: layerContext.queryable, //keep queryable for api compatibility
            visibility: layerContext.visibility,
            maxExtent: layerContext.maxExtent,
            numZoomLevels: layerContext.numZoomLevels,
            units: layerContext.units,
            isBaseLayer: layerContext.isBaseLayer,
            opacity: layerContext.opacity,
            displayInLayerSwitcher: layerContext.displayInLayerSwitcher,
            singleTile: layerContext.singleTile,
            minScale: layerContext.minScale,
            maxScale: layerContext.maxScale
        };
        if (this.layerOptions) {
            OpenLayers.Util.applyDefaults(options, this.layerOptions);
        }

        var params = {
            layers: layerContext.name, 
            transparent: layerContext.transparent,
            version: layerContext.version
        };
        if (layerContext.formats && layerContext.formats.length>0) {
            // set default value for params if current attribute is not positionned
            params.format = layerContext.formats[0].value;
            for (i=0, len=layerContext.formats.length; i<len; i++) {
                var format = layerContext.formats[i];
                if (format.current == true) {
                    params.format = format.value;
                    break;
                }
            }
        }
        if (layerContext.styles && layerContext.styles.length>0) {
            for (i=0, len=layerContext.styles.length; i<len; i++) {
                var style = layerContext.styles[i];
                if (style.current == true) {
                    // three style types to consider
                    // 1) linked SLD
                    // 2) inline SLD
                    // 3) named style
                    if(style.href) {
                        params.sld = style.href;
                    } else if(style.body) {
                        params.sld_body = style.body;
                    } else {
                        params.styles = style.name;
                    }
                    break;
                }
            }
        }
        if (this.layerParams) {
            OpenLayers.Util.applyDefaults(params, this.layerParams);
        }

        var layer = new OpenLayers.Layer.WMS(
            layerContext.title || layerContext.name,
            layerContext.url,
            params,
            options
        );
        return layer;
    },
    
    /**
     * Method: getLayersFromContext
     * Create an array of WMS layers from an array of layerContext objects.
     *
     * Parameters:
     * layersContext - {Array(Object)} An array of objects representing WMS layers.
     *
     * Returns:
     * {Array(<OpenLayers.Layer.WMS>)} An array of WMS layers.
     */
    getLayersFromContext: function(layersContext) {
        var layers = [];
        for (var i=0, len=layersContext.length; i<len; i++) {
            layers.push(this.getLayerFromContext(layersContext[i]));
        }
        return layers;
    },
    
    /**
     * Method: contextToMap
     * Create a map given a context object.
     *
     * Parameters:
     * context - {Object} The context object.
     * options - {Object} Default map options.
     *
     * Returns:
     * {<OpenLayers.Map>} A map based on the context object.
     */
    contextToMap: function(context, options) {
        options = OpenLayers.Util.applyDefaults({
            maxExtent: context.maxExtent,
            projection: context.projection
        }, options);
        var map = new OpenLayers.Map(options);
        map.addLayers(this.getLayersFromContext(context.layersContext));
        map.setCenter(
            context.bounds.getCenterLonLat(),
            map.getZoomForExtent(context.bounds, true)
        );
        return map;
    },
    
    /**
     * Method: mergeContextToMap
     * Add layers from a context object to a map.
     *
     * Parameters:
     * context - {Object} The context object.
     * map - {<OpenLayers.Map>} The map.
     *
     * Returns:
     * {<OpenLayers.Map>} The same map with layers added.
     */
    mergeContextToMap: function(context, map) {
        map.addLayers(this.getLayersFromContext(context.layersContext));
        return map;
    },

    /**
     * APIMethod: write
     * Write a WMC document given a map.
     *
     * Parameters:
     * obj - {<OpenLayers.Map> | Object} A map or context object.
     * options - {Object} Optional configuration object.
     *
     * Returns:
     * {String} A WMC document string.
     */
    write: function(obj, options) {
        obj = this.toContext(obj);
        var version = options && options.version;
        var parser = this.getParser(version);
        var wmc = parser.write(obj, options);
        return wmc;
    },
    
    /**
     * Method: layerToContext
     * Create a layer context object given a wms layer object.
     *
     * Parameters:
     * obj - {<OpenLayers.Layer.WMS>} The layer.
     *
     * Returns:
     * {Object} A layer context object.
     */
    layerToContext: function(layer) {
        var parser = this.getParser();
        var layerContext = {
            queryable: layer.queryable,
            visibility: layer.visibility,
            name: layer.params["LAYERS"],
            title: layer.name,
            metadataURL: layer.metadataURL,
            version: layer.params["VERSION"],
            url: layer.url,
            maxExtent: layer.maxExtent,
            transparent: layer.params["TRANSPARENT"],
            numZoomLevels: layer.numZoomLevels,
            units: layer.units,
            isBaseLayer: layer.isBaseLayer,
            opacity: layer.opacity,
            displayInLayerSwitcher: layer.displayInLayerSwitcher,
            singleTile: layer.singleTile,
            minScale : (layer.options.resolutions ||
                        layer.options.scales || 
                        layer.options.maxResolution || 
                        layer.options.minScale) ? 
                        layer.minScale : undefined,
            maxScale : (layer.options.resolutions ||
                        layer.options.scales || 
                        layer.options.minResolution || 
                        layer.options.maxScale) ? 
                        layer.maxScale : undefined,
            formats: [{
                value: layer.params["FORMAT"],
                current: true
            }],
            styles: [{
                href: layer.params["SLD"],
                body: layer.params["SLD_BODY"],
                name: layer.params["STYLES"] || parser.defaultStyleName,
                title: parser.defaultStyleTitle,
                current: true
            }]
        };
        return layerContext;
    },
    
    /**
     * Method: toContext
     * Create a context object free from layer given a map or a
     * context object.
     *
     * Parameters:
     * obj - {<OpenLayers.Map> | Object} The map or context.
     *
     * Returns:
     * {Object} A context object.
     */
    toContext: function(obj) {
        var context = {};
        var layers = obj.layers;
        if(obj.CLASS_NAME == "OpenLayers.Map") {
            context.bounds = obj.getExtent();
            context.maxExtent = obj.maxExtent;
            context.projection = obj.projection;
            context.size = obj.getSize();
        }
        else {
            // copy all obj properties except the "layers" property
            OpenLayers.Util.applyDefaults(context, obj);
            if(context.layers != undefined) {
                delete(context.layers);
            }
        }

        if (context.layersContext == undefined) {
            context.layersContext = [];
        }

        // let's convert layers into layersContext object (if any)
        if (layers != undefined && layers instanceof Array) {
            for (var i=0, len=layers.length; i<len; i++) {
                var layer = layers[i];
                if(layer instanceof OpenLayers.Layer.WMS) {
                    context.layersContext.push(this.layerToContext(layer));
                }
            }
        }
        return context;
    },

    CLASS_NAME: "OpenLayers.Format.WMC" 

});
