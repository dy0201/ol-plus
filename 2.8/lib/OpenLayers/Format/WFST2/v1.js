/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XML.js
 * @requires OpenLayers/Format/WFST/v1.js
 */

/**
 * Class: OpenLayers.Format.WFST2.v1
 * Superclass for WFST parsers.
 *
 * Inherits from:
 *  - <OpenLayers.Format.WFST.v1>
 */
OpenLayers.Format.WFST2.v1 = OpenLayers.Class(OpenLayers.Format.WFST.v1, {
    
    /**
     * APIProperty: xy
     * {Boolean} Order of the GML coordinate true:(x,y) or false:(y,x)
     * Changing is not recommended, a new Format should be instantiated.
     */ 
    xy: false,
    
    /**
     * TODO: doc
     */    
    lockExpiry: "1",
    
    /**
     * TODO: doc
     */
    releaseAction: "ALL", // stick to "ALL" for current
    
    /**
     * 
     */
    attributes: null,
    
    /**
     * 
     */
    attribute_alias: {},

    /**
     * Constructor: OpenLayers.Format.WFST2.v1
     * Instances of this class are not created directly.  Use the
     *     <OpenLayers.Format.WFST2.v1_0_0> or <OpenLayers.Format.WFST2.v1_1_0>
     *     constructor instead.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {    
		if(options.featureNS) {
            this.namespaces = OpenLayers.Util.extend(
                {
					feature: options.featureNS
				},
                OpenLayers.Format.WFST.v1.prototype.namespaces
            );
        }
		OpenLayers.Format.WFST.v1.prototype.initialize.apply(this, [options]);
		// add customized namespace prefix/uri pair to the format		
		// important for OpenLayers.Format.XML.createElementNSPlus() 		
		this.namespaces[this.featurePrefix] = this.featureNS;
		
		// extend wfst format with misc properties from filter and gml formats        		
		OpenLayers.Util.extend(
			this, 
			{
            	readOgcExpression: 	OpenLayers.Format.Filter.v1.prototype.readOgcExpression,
            	getFilterType: 		OpenLayers.Format.Filter.v1.prototype.getFilterType,
            	filterMap: 			OpenLayers.Format.Filter.v1.prototype.filterMap,
            	//setGeometryTypes: 	OpenLayers.Format.GML.Base.prototype.setGeometryTypes,
            	regExes: 			OpenLayers.Format.GML.Base.prototype.regExes
        });
		// call OpenLayers.Format.GML.Base.prototype.setGeometryTypes to set 
		//   maps between OpenLayers geometry class names to GML element names						        	
		OpenLayers.Format.GML.Base.prototype.setGeometryTypes.call(this);
		// overwrite this.geometryTypes to encode MultiLineString/MultiPolygon geometry in MultiCurve/MultiSurface
		this.geometryTypes['OpenLayers.Geometry.MultiLineString'] = "MultiCurve";
		this.geometryTypes['OpenLayers.Geometry.MultiPolygon'] = "MultiSurface";		
    
		/*
		 * read the WFS DescribeFeatureType response (as XML schema) 
		 *     and populate this.attributes  
		 */
		if(this.schema && this.schema!="") {
			// TODO: shall I use OpenLayers.Request.Get()?
			//    OpenLayers.loadURL() is calling OpenLayers.Request.Get() under the hood
			OpenLayers.loadURL(
				this.schema, 
				null, 
				null, 
				OpenLayers.Function.bind(
					function(request) {
						var schema_format = new OpenLayers.Format.WFSDescribeFeatureType();
						var schema = schema_format.read(request.responseXML || request.responseText);						
						this.attributes = {};
						if(schema.targetNamespace == this.featureNS && schema.targetPrefix == this.featurePrefix) {
							for(var i=0; i<schema.featureTypes.length; i++) {
								var featureType = schema.featureTypes[i];
								if(featureType.typeName == this.featureType) {
									for(var j=0; j<featureType.properties.length; j++) {
										// take only non-spatial attributes
										if(featureType.properties[j].type.split(":")[0] != "gml") {
											this.attributes[featureType.properties[j].name] = featureType.properties[j];
										}
									}
									return;
								}
							}
						}												
					}, 
					this
				)				
			);			
		}
	},

    /**
     * Method: read
     * Parse the response from a transaction.  Because WFS is split into
     *     Transaction requests (create, update, and delete) and GetFeature
     *     requests (read), this method handles parsing of both types of
     *     responses.
     */
    read: function(data) {
        if(typeof data == "string") { 
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        if(data && data.nodeType == 9) {
            data = data.documentElement;
        }
        var obj = {};
        this.readNode(data, obj);        
		// attach 'lockId' to each feature parsed which will be used for lock/unlock and transactions        
        // obj.lockId carries the common lockId string for all the features in obj.features
        var lockIdValue = obj.lockId;
        //OpenLayers.Console.log(lockIdValue);
        if(obj.features) {
            obj = obj.features;
            // add 'lockId' to each feature as an interal attribute
            for(var i=0; i<obj.length; i++) {            	
            	obj[i].lockId = lockIdValue;
            }
        }               
        return obj;
    },
    
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
            "FeatureCollection": function(node, obj) {
                obj.features = [];
                // parse 'lockId' from GetFeatureWithLock response
                var lockIdValue = node.getAttribute("lockId");                
                obj.lockId = (lockIdValue === "") ? null : lockIdValue;
                //
                this.readChildNodes(node, obj);
            }
        }, OpenLayers.Format.WFST.v1.prototype.readers["wfs"])
    },
    
    /**
     * Method: getSrsName
     */
    getSrsName: function(feature, options) {
        var srsName = this.options.srsName;
        if(!srsName) {
        	srsName = OpenLayers.Format.WFST.v1.prototype.getSrsName(feature, options);
        }
        return srsName;
    },
    
    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "wfs": OpenLayers.Util.applyDefaults({            
            // TODO: doc
            "GetFeatureWithLock": function(options) {
            	var node = this.createElementNSPlus("wfs:GetFeatureWithLock", {
                    attributes: {
	                    service: "WFS",
	                    version: this.version,	                    	                   
	                    expiry: this.lockExpiry, // how long for lock to expire
	                    "xsi:schemaLocation": this.schemaLocationAttr()
	                }
	            });
	            this.writeNode("Query", options, node);
	            return node;
            },
            // override 'Transaction' writer of parent class to support WFS transaction with lock
            "Transaction": function(features) {
                var node = this.createElementNSPlus("wfs:Transaction", {
                    attributes: {
                        service: "WFS",
                        version: this.version,
                        releaseAction: this.releaseAction, 
                    }
                });
                
                if(features) {
                    var name; 
                    var feature;
                    var hasCommonLockId = true;                    
                    // assume features in the transaction have a common lockId, which 'Save' strategy should guarantee 
                    // otherwise no lockId or feature will be include, which causes transaction failure                                        
                    var lockIds = {};
                    hasCommonLockId = false;    
                    for(var i=0, len=features.length; i<len; ++i) {                    	
                        feature = features[i];
                        if(features[i].lockId === null) {break;}
                        lockIds[features[i].lockId] = features[i].lockId;                         
                    }
                    var count = 0;
                    var lockId = null;
                    for(var key in lockIds) {
                    	if(lockId != lockIds[key]) {
                    		count++;
                    		lockId = lockIds[key];
                    	}
                    }
                    if(count == 1 && lockId != null && lockId != "") {hasCommonLockId = true;}
                    
                    if(hasCommonLockId === true) {
	                    // if features have common lockId, include them in transaction
	                    // do not include special lockId "__insert__", which is fake lockId for inserted features
						if(lockId != "__insert__") {
							this.writeNode("LockId", lockId, node);
						} 						
	                    for(var i=0, len=features.length; i<len; ++i) {
	                    	feature = features[i];
	                    	name = this.stateName[feature.state];
	                        if(name) {
	                            this.writeNode(name, feature, node);
	                        }
	                    }
                    }
                }                
                return node;
            },
            "UnlockFeature": function(options) {
                var node = this.createElementNSPlus("wfs:Transaction", {
                    attributes: {
                        service: "WFS",
                        version: this.version,
                        releaseAction: this.releaseAction, 
                    }
                });
                this.writeNode("LockId", options.lockId, node);                
                return node;
            },
            "LockId": function(lockId) {
            	var node = this.createElementNSPlus("wfs:LockId", {
                    attributes: {},
                    value: lockId
                });
            	return node;
            },
        }, OpenLayers.Format.WFST.v1.prototype.writers["wfs"])
    },

    CLASS_NAME: "OpenLayers.Format.WFST2.v1" 
});
