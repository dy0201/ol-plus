/**
 * @requires OpenLayers/Format/WPS.js
 */

/**
 * Class: OpenLayers.Format.WPS.v1
 * Abstract class not to be instantiated directly.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.WPS.v1 = OpenLayers.Class(OpenLayers.Format.XML, {
		
	/**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        ows: "http://www.opengis.net/ows/1.1", //TODO: is it the correct namespace?  
		ogc: "http://www.opengis.net/ogc"
    },
	
    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "wps",

    /**
     * Property: version
     * {String} WPS version number.
     */
    version: null,

    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.
     */
    schemaLocations: null,
    
    /**
     * Constructor: OpenLayers.Format.WPS.v1_1
     * Create an instance of one of the subclasses.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
        this.options = options;
    },	

    /**
     * Method: read
     */    
	read: function(data) {
        if(typeof data == "string") { 
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        if(data && data.nodeType == 9) {
            data = data.documentElement;
        }		
		if(data.localName === "Capabilities") {
			return this.read_capabilities(data);
		} else if(data.localName === "ProcessDescriptions") {
			return this.read_process_descriptions(data);
		} else if(data.localName === "ExecuteResponse") {
			return this.read_execute_response(data);
		} else {
			OpenLayers.Console.error("...invalid WPS response xml...");	
			return {};	
		}
    },
		
	/**
	 * Method: read_capabilities
	 */
	read_capabilities: function(data) {		
		var capabilities = {};
		this.readNode(data, capabilities);
		return capabilities;
	}, 
	
	/**
	 * Method: read_process_descriptions
	 */
    read_process_descriptions: function(data) {		
		var processDescriptions = {
			processDescriptions: []
		};
		this.readNode(data, processDescriptions);
		return processDescriptions;
	},
	
	/**
	 * Method: read_execute_response
	 */
    read_execute_response: function(data) {		
		var executeResponse = {};
		this.readNode(data, executeResponse);
		return executeResponse;
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
        "wps": {
            "Capabilities": function(node, obj) {
                obj.service = node.getAttribute("service");
				obj.version = node.getAttribute("version");
				obj.processOfferings = [];
                this.readChildNodes(node, obj);
            },
			"ProcessOfferings": function(node, obj) {
				this.readChildNodes(node, obj);
			},
			"Process": function(node, obj) {
				var process = {};
				process.processVersion = node.getAttribute("wps:processVersion");
				this.readChildNodes(node, process);
				if(obj.processOfferings) { // 'processOfferings' exists in GetCapabilities response
					obj.processOfferings.push(process);
				} else { // 'processOfferings' doesn't exists in ExecuteResponse 
					obj.process = process;
				}		
			},
			"ProcessDescriptions": function(node, obj) {
				obj.service = node.getAttribute("service");
				obj.version = node.getAttribute("version");
				obj.processDescriptions = [];
				this.readChildNodes(node, obj);
			},
			"ProcessDescription": function(node, obj) {
				var processDescription = {
					'datainputs': [],
					'processoutputs': [],
				};
				processDescription.statusSupported = node.getAttribute("statusSupported");
				processDescription.storeSupported = node.getAttribute("storeSupported");
				processDescription.processVersion = node.getAttribute("processVersion");				
				this.readChildNodes(node, processDescription);
				obj.processDescriptions.push(processDescription);
			},
			"DataInputs": function(node, obj) {								
				this.readChildNodes(node, obj);
			},
			"Input": function(node, obj) {
				var input = {};
				input.minoccurs = node.getAttribute("minOccurs");
				input.maxoccurs = node.getAttribute("maxOccurs");
				this.readChildNodes(node, input);
				obj.datainputs.push(input);
			},
			"ComplexData": function(node, obj) {
				var complexData = {
					'default': {},
					'supported': [],
				};
				this.readChildNodes(node, complexData);
			},
			"ProcessOutputs": function(node, obj) {
				this.readChildNodes(node, obj);
			},
			"Output": function(node, obj) {
				var output = {};
				this.readChildNodes(node, output);
				obj.processoutputs.push(output);
			},
			"Reference": function(node, obj) {
				var reference = {};
				reference.href = node.getAttribute("href");
				reference.schema = node.getAttribute("schema");
				reference.encoding = node.getAttribute("encoding");
				reference.mimeType = node.getAttribute("mimeType");
				obj.reference = reference;
			},
			"ComplexOutput": function(node, obj) {
				// TODO: 
			},
			"Default": function(node, obj) {		
				var default_type = {}; 
				this.readChildNodes(node, default_type);
				obj['default'] = default_type;
			},
			"Supported": function(node, obj) {
				var supported = {};
				this.readChildNodes(node, supported);
				obj.supported.push(supported);
			},
			"Format": function(node, obj) {
				this.readChildNodes(node, obj);
			},
			"MimeType": function(node, obj) {
				obj.mimetype = this.getChildValue(node);
			},
			"Encoding": function(node, obj) {
				obj.encoding = this.getChildValue(node);
			},
			"Schema": function(node, obj) {
				obj.schema = this.getChildValue(node);
			},
			"ExecuteResponse": function(node, obj) {
				obj.service = node.getAttribute("service");
				obj.version = node.getAttribute("version");
				obj.status = {};
				obj.processoutputs = [];
				this.readChildNodes(node, obj);
			},
			"Status": function(node, obj) {
				obj.status['creationTime'] = node.getAttribute("creationTime");
				this.readChildNodes(node, obj);				
			},
			"ProcessAccepted": function(node, obj) {
				obj.processaccepted = this.getChildValue(node);
			},
			"ProcessStarted": function(node, obj) {
				obj.processstarted = this.getChildValue(node);
			},
			"ProcessPaused": function(node, obj) {
				obj.processpaused = this.getChildValue(node);
			},
			"ProcessSucceeded": function(node, obj) {
				obj.processsucceeded = this.getChildValue(node);
			},
			"ProcessFailed": function(node, obj) {
				obj.processfailed = this.getChildValue(node);
			},
        }
    },

	/**
	 * 
	 */
	writers: {
		"wps": {
			/**
			 * object structure of an excute:
			 * 
			 * {
			 * 		'identifier',
			 * 		'datainputs': [
			 * 			{
			 * 				'identifier'
			 * 				'reference': {
			 * 					'href'
			 * 					'schema'
			 * 					'encoding'
			 * 				}
			 *				'literalData'							 
			 * 				'complexData': {}?
			 * 			},
			 * 			...
			 * 		],
			 * 		'resultoutputs': {
			 * 			'responseDocument': {
			 * 				'storeExecuteResponse',
			 * 				outputs: [
				 * 				{
				 * 					'identifier'
				 * 					'asReference'
				 * 				},
				 * 				...
			 * 				]
			 * 			},
			 * 			'rawdataoutput': {
			 * 				'identifier'
			 * 				'schema'
			 * 				'mimeType'
			 * 			}	
			 * 		}	
			 * }
			 * 
			 */			
			"Execute": function(options) {
				var node = this.createElementNSPlus("wps:Execute", {
                    attributes: {
                        service: "WPS",
                        version: this.version,                        
                        "xsi:schemaLocation": this.schemaLocationAttr(options)
                    }
                });                
				// process 'identifier' 
				this.writeNode("ows:Identifier", options.identifier, node);
                // process input parameters
				this.writeNode("wps:DataInputs", options.datainputs, node);
				// process output parameters
				this.writeNode("wps:ResponseForm", options.resultoutputs, node);
				return node;
			},
			"DataInputs": function(datainputs) {
				var node = this.createElementNSPlus("wps:DataInputs", {});
				if(datainputs instanceof Array) {
					for(var i=0; i<datainputs.length; i++) {
						this.writeNode("wps:Input", datainputs[i], node);
					}	
				}	
				return node;			
			},
			"Input": function(input) {
				var node = this.createElementNSPlus("wps:Input", {});
				this.writeNode("ows:Identifier", input.identifier, node);
				if(input.reference) {
					this.writeNode("wps:Reference", input.reference, node);
				} else if(input.literalData) {
					var data = this.writeNode("wps:Data", null, node);
					this.writeNode("wps:LiteralData", input.literalData, data);
				} else if(input.complexData) {
					// TODO:
				}
				return node;
			},
			"Reference": function(reference) { // HTTP GET xlink:href
				var attributes = {};
				if(reference.href) {
					attributes['xlink:href'] = reference.href;
				}
				if(reference.schema) {
					attributes['schema'] = reference.schema;
				}
				if(reference.encoding) {
					attributes['encoding'] = reference.encoding;
				}
				if(reference.mimeType) {
					attributes['mimeType'] = reference.mimeType;
				}
				var node = this.createElementNSPlus(
					"wps:Reference", 
					{
						'attributes': attributes
					}
				);				
				return node;
			}, 
			"Body": function() {},
			"BodyReference": function() {}, // HTTP POST xlink:href
			"Data": function(data) {
				var node = this.createElementNSPlus("wps:Data", {});
				return node;
			},
			"ComplexData": function() {},
			"LiteralData": function(literalData) {
				var node = this.createElementNSPlus(
					"wps:LiteralData", {
						value: literalData
					}
				);
				return node;
			},
			"BoundingBoxData": function() {},
			"ResponseForm": function(resultoutputs) { 
				var node = this.createElementNSPlus("wps:ResponseForm", {});;
				if(resultoutputs.responsedocument) {					
					this.writeNode("wps:ResponseDocument", resultoutputs.responsedocument, node);
				}
				if(resultoutputs.rawdataoutput) {
					this.writeNode("wps:RawDataOutput", resultoutputs.rawdataoutput, node);
				}
				return node;
			},
			"RawDataOutput": function(rawdataoutput) {
				var attributes = {};
				if(rawdataoutput.schema) {
					attributes['schema'] = rawdataoutput.schema;
				}
				if(rawdataoutput.mimeType) {
					attributes['mimeType'] = rawdataoutput.mimeType;
				}
				var node = this.createElementNSPlus(
					"wps:RawDataOutput",
					{
						'attributes': attributes 		
					}
				);		
				this.writeNode("ows:Identifier", rawdataoutput.identifier, node);	
				return node;
			},
			"ResponseDocument": function(responsedocument) {
				var attributes = {};
				if(responsedocument.storeExecuteResponse) {
					attributes['storeExecuteResponse'] = responsedocument.storeExecuteResponse
				}
				// TODO: other attributes
				var node = this.createElementNSPlus(
					"wps:ResponseDocument",
					{
						'attributes': attributes 		
					}
				);
				if(responsedocument.outputs && responsedocument.outputs instanceof Array) {
					var outputs = responsedocument.outputs;
					for(var i=0; i<outputs.length; i++) {
						this.writeNode("wps:Output", outputs[i], node);	
					}
				}				
				return node;		
			},
			"Output": function(output) {
				var attributes = {};
				if(output.asReference) {
					attributes['asReference'] = output.asReference;
				} 
				// TODO: other attributes
				var node = this.createElementNSPlus(
					"wps:Output",
					{
						'attributes': attributes 		
					}
				);
				this.writeNode("ows:Identifier", output.identifier, node);
				return node;
			},
		}
	},
	
	/**
     * Method: schemaLocationAttr
     * Generate the xsi:schemaLocation attribute value.
     *
     * Returns:
     * {String} The xsi:schemaLocation attribute or undefined if none.
     */
    schemaLocationAttr: function(options) {
		// TODO: take (prefix, schemaLocation) pair in options into account        
        /*
        options = OpenLayers.Util.extend({
            featurePrefix: this.featurePrefix,
            schema: this.schema
        }, options);
        */
		var schemaLocations = OpenLayers.Util.extend({}, this.schemaLocations);        
        /*
        if(options.schema) {
            schemaLocations[options.featurePrefix] = options.schema;
        }
        */
		var parts = [];
        var uri;
        for(var key in schemaLocations) {
            uri = this.namespaces[key];
            if(uri) {
                parts.push(uri + " " + schemaLocations[key]);
            }
        }
        var value = parts.join(" ") || undefined;
        return value;
    },
	
    CLASS_NAME: "OpenLayers.Format.WPS.v1" 

});