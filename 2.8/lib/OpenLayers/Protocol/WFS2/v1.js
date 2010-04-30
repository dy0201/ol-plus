/**
 * @requires OpenLayers/Protocol/WFS2.js
 * @requires OpenLayers/Protocol/WFS/v1.js
 */

/**
 * Class: OpenLayers.Protocol.WFS2.v1
 * Abstract class for for v1.0.0 and v1.1.0 protocol.
 *
 * Inherits from:
 *  - <OpenLayers.Protocol.WFS.v1>
 */
OpenLayers.Protocol.WFS2.v1 = new OpenLayers.Class(OpenLayers.Protocol.WFS.v1, {
    
    /**
     * Property: version
     * {String} WFS version number.
     */
    version: null,
    
    /**
     * Property: srsName
     * {String} Name of spatial reference system.  Default is "urn:x-ogc:def:crs:EPSG:6.9:4326".
     */
    srsName: "urn:x-ogc:def:crs:EPSG:6.9:4326",
    
	/**
     * Property: bboxSrsName
     * {String} Name of the query bbox spatial reference system.  Default is "urn:x-ogc:def:crs:EPSG:6.9:4326".
     */
    bboxSrsName: "urn:x-ogc:def:crs:EPSG:6.9:4326",	
	
    /**
     * Property: featureType
     * {String} Local feature typeName.
     */
    featureType: null,
    
    /**
     * Property: featureNS
     * {String} Feature namespace.
     */
    featureNS: "http://www.esri.com",	
    
    /**
     * Property: geometryName
     * {String} Name of the geometry attribute for features.
     */
    geometryName: "Shape",

    /**
     * Property: featurePrefix
     * {String} Namespace alias for feature type.  Default is "feature".
     */
    featurePrefix: "esri",
            
    /**
     * Property: formatOptions
     * {Object} Optional options for the format.  If a format is not provided,
     *     this property can be used to extend the default format options.
     */
    formatOptions: {
		xy: false, 				// WFS service 1.1.0 from ArcGIS Server has Lat/Lon order for coordinates
				   				//   'xy = false' meaning coordinate in (lat, lat) order, otherwise in (lon, lat) order  
		lockExpiry: "1",		// minutes it takes for a lock to expire
		releaseAction: "ALL"	// release all locks when a transaction is successfully completed
	},
    
    /**
     * Constructor: OpenLayers.Protocol.WFS2
     * A class for giving layers WFS protocol.
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
    initialize: function(options) {
		OpenLayers.Protocol.WFS.v1.prototype.initialize.apply(this, [options]);		
    },

    /**
     * Method: readWithLock (WFS GetFeatureWithLock)
     * Construct a request for reading new features and locking them at the same time.
     * 
     * Parameters:
     * options - {Object} Optional object for configuring the request.
     * 		options.filter - {OpenLayers.Filter}
     * 		options.callback - {function}
     * 		options.scope - {object}
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} An <OpenLayers.Protocol.Response>
     * object, the same object will be passed to the callback function passed
     * if one exists in the options object.
     */
    readWithLock: function(options) {
    	options = OpenLayers.Util.extend({}, options);
    	OpenLayers.Util.applyDefaults(options, this.options || {});
    	var response = new OpenLayers.Protocol.Response({requestType: "readWithLock"});
    	
    	var req_node = this.format.writeNode("wfs:GetFeatureWithLock", options);
    	OpenLayers.Console.log("...wfs:GetFeatureWithLock request...");
    	OpenLayers.Console.dirxml(req_node);
    	
    	var data = OpenLayers.Format.XML.prototype.write.apply(this.format, [req_node]);
    	//OpenLayers.Console.log(data);
    	        
    	response.priv = OpenLayers.Request.POST({
            url: options.url,
            callback: this.createCallback(this.handleReadWithLock, response, options),
            params: options.params,
            headers: options.headers,
            data: data
        });        
        
        return response;
    },
    
    /**
     * Method: unlock
     * Given a list of feature, assemble a batch request for update, create,
     *     and delete transactions with lockId included.  A commit call on the prototype amounts
     *     to writing a WFS transaction - so the write method on the format
     *     is used.
     *
     * Parameters:
     * options - {Object} Optional object for configuring the request.
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} A response object with a features
     *     property containing any insertIds and a priv property referencing
     *     the XMLHttpRequest object.
     */
    unlock: function(options) {
        options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options);
        
        OpenLayers.Console.log("...wfs:Transaction request...");
        var req_node = this.format.writeNode("wfs:UnlockFeature", options);
        OpenLayers.Console.dirxml(req_node);
        
        var data = OpenLayers.Format.XML.prototype.write.apply(this.format, [req_node]);
    	//OpenLayers.Console.log(data);
        
        var response = new OpenLayers.Protocol.Response({
        	requestType: "unlock",
        	lockId: options.lockId
        });
        
        response.priv = OpenLayers.Request.POST({
            url: options.url,
            data: data,
            callback: this.createCallback(this.handleUnlock, response, options)
        });        
        return response;
    },
    
    /**
     * Method: commitWithLock
     * Given a list of feature, assemble a batch request for update, create,
     *     and delete transactions.  A commit call on the prototype amounts
     *     to writing a WFS transaction with lock - so the write method on the format
     *     is used.
     *
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector>}
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} A response object with a features
     *     property containing any insertIds and a priv property referencing
     *     the XMLHttpRequest object.
     */
    commitWithLock: function(features, options) {

        options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options);
        
        // need a separate commit transaction for each different lockId
        var lockIds = {};
        var responses = {};

        for(var i=0; i<features.length; i++) {
        	if(features[i].lockId && features[i].lockId != "") { // modified/deleted features	        	
				if(lockIds[features[i].lockId] == null) {
	        		lockIds[features[i].lockId] = [];        	
	        	}
	        	lockIds[features[i].lockId].push(features[i]);
        	} else if(features[i].state == OpenLayers.State.INSERT) { // inserted features
				// committing inserted features does not need a 'lockId'
				// use special lockId '__insert__'  
				if(lockIds['__insert__'] == null) {
	        		lockIds['__insert__'] = [];        	
	        	}
				features[i].lockId = "__insert__";
	        	lockIds['__insert__'].push(features[i]);
			} else {
				// do nothing
			}
        }
        // transactions to commit modified/deleted features
        for(var key in lockIds) {
        	if(key && key !== "") {
	        	var featuresWithCommonLockId = lockIds[key];        	
	        	responses[key] = new OpenLayers.Protocol.Response({
	                requestType: "commitWithLock",
	                reqFeatures: featuresWithCommonLockId,
	                lockId: key // carry 'lockId'
	            });
	        	
	        	var req_node = this.format.writeNode("wfs:Transaction", featuresWithCommonLockId);
	        	OpenLayers.Console.log("...transaction with lockId: " + key + "...");
	        	OpenLayers.Console.log("...wfs:Transaction request...");
	        	OpenLayers.Console.dirxml(req_node);
	            var data = OpenLayers.Format.XML.prototype.write.apply(this, [req_node]);
	            //OpenLayers.Console.log(data);
				responses[key].priv = OpenLayers.Request.POST({
		            url: options.url,
		            data: data,
		            callback: this.createCallback(this.handleCommitWithLock, responses[key], options)
		        });				
        	}
        }
        // return a collection of responses indexeed by different lockId
        return responses;
    },
       
    /**
     * Method: handleReadWithLock
     * Deal with response from the readWithLock request.
     *
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object to pass
     *     to the user callback.
     * options - {Object} The user options passed to the readWithLock call.
     */
    handleReadWithLock: function(response, options) {            	
    	this.handleRead(response, options);
    },
    
    /**
     * Method: handleCommitWithLock
     * Deal with response from the commitWithLock request.
     *
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object to pass
     *     to the user callback.
     * options - {Object} The user options passed to the read call.
     */
    handleUnlock: function(response, options) {            	
    	var request = response.priv;
    	OpenLayers.Console.log("...transaction response...");
    	OpenLayers.Console.dirxml(request.responseXML);
    	// since it's actually an empty wfs:Transaction operation, reuse handleCommit()
    	this.handleCommit(response, options);
    },
    
    /**
     * Method: handleCommit
     * Called when the commit request returns.
     * 
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object to pass
     *     to the user callback.
     * options - {Object} The user options passed to the commit call.
     */
    handleCommitWithLock: function(response, options) {
    	var request = response.priv;
    	OpenLayers.Console.log("...transaction response...");
    	OpenLayers.Console.dirxml(request.responseXML);
        this.handleCommit(response, options);
    },
     
    CLASS_NAME: "OpenLayers.Protocol.WFS2.v1" 
});
