/**
 * @requires OpenLayers/Protocol/SQL.js
 * @requires OpenLayers/Format/GeoJSON.js
 * @requires OpenLayers/Format/WKT.js
 */

/**
 * Class: OpenLayers.Protocol.SQL.ProxiedPostGIS 
 * 
 * An OpenLayers Protocol to read/write features from/into Proxied PostGIS database -
 * - a proxied PostGIS is a PostGIS databased with a http proxy so that -
 * - javascript based application like OpenLayers can access through HTTP 
 *
 * Inherits from:
 *  - <OpenLayers.Protocol.SQL>
 */
OpenLayers.Protocol.SQL.ProxiedPostGIS = OpenLayers.Class(OpenLayers.Protocol.SQL, {
	
	/**
	 * API Property: geometryName
	 * {String}
	 * 
	 * The name of the geometry column in a PostGIS feature class/table.
	 */
	geometryName: "the_geom",
	
	/**
	 * API Property: responseType
	 * {String}
	 * 
	 * PostGIS can output SQL results in multiple format; e.g. GeoJSON, or GML etc.
	 */
	responseType: "geojson",
	
	/**
	 * API Property: whereClauseEncoder
	 * {<OpenLayers.Format.SQL.PostGIS_SQL>}
	 * 
	 * An OpenLayers Format to encode SQL statement for the protocol to read/write features 
	 */
	encoder: null,
	
	/**
     * Constructor: OpenLayers.Protocol.SQL.ProxiedPostGIS
     */
    initialize: function(options) {        
		if (!this.supported()) {
            return;
        }        
        OpenLayers.Protocol.SQL.prototype.initialize.apply(this, [options]);        
        // set default parser if not given in options
        if(this.responseType == "geojson" && !this.parser) {
        	// set GeoJSON as default format
        	this.parser = new OpenLayers.Format.GeoJSON();
        }
        // set default encoder if not given in options
        if(!this.encoder) {
    		this.encoder = new OpenLayers.Format.Filter.SQL({
        		'fidName': this.fidName || "id",
        		'geometryName': this.geometryName || "the_geom",
        		'srid': this.srid || "4326"
        	});     
    	}
    },
    
    /**
     * APIMethod: supported
     * Determine whether a browser supports Gears
     *
     * Returns:
     * {Boolean} The browser supports Gears
     */
    supported: function() {
        // always supported for now
    	return true;
    },
        
    /**
     * APIMethod: destroy
     * Clean up the protocol.
     */
    destroy: function() {
    	OpenLayers.Protocol.SQL.prototype.destroy.apply(this);
    },
    
    /**
     * APIMethod: read
     * Read all features from the database and return a
     * <OpenLayers.Protocol.Response> instance. If the options parameter
     * contains a callback attribute, the function is called with the response
     * as a parameter.
     *
     * Parameters:
     * options - {Object} Optional object for configuring the request; 
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} An <OpenLayers.Protocol.Response>
     *      object.
     */
    read: function(options) {
    	// apply default options
    	options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options || {});
        
        // create <OpenLayers.Protocol.Response>
        var response = new OpenLayers.Protocol.Response({requestType:"read"});
        
        // create sql statement
        var sql = this.createSQLStatement("Select", options);                
        /**
         * TODO: doc the usage of PostGIS proxy, which in this case is a Java servlet
         */        
        // appending request parameters 
        var params = {
        	'sql': sql,								//
        	'geometryName': this.geometryName,		//
        	'responseType': this.responseType,		//
        	'databaseName': this.databaseName,		//
        	'username': this.username,				//
        	'password': this.password				//
        };
        
        // send the HTTP Get request to PostGISProxyServlet for SQL executing
        response.priv = OpenLayers.Request.GET({
            url: this.url, 
            callback: OpenLayers.Util.AgsUtil.createProtocolCallback(this.handleRead, response, options, this),                        
            params: params,
            headers: options.headers           
        });        
        return response;
        
    },
	
    /**
     * private method: handleRead
     */
    handleRead: function(response, options) {
    	//OpenLayers.Console.debug("...handle read gets called...");
    	if(options.callback) {
            var request = response.priv;
            if(request.status >= 200 && request.status < 300) {
                // success
                response.features = this.readAsFeatures(request);
                response.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                // failure
                response.code = OpenLayers.Protocol.Response.FAILURE;
            }
            options.callback.call(options.scope, response);
        }; 
    },
    
    /**
     * 
     */
    commit: function(features, options) {
    
    },
    
    /**
     * 
     */
    handleCommit: function(response, option) {
    
    },
    
    /**
     * private method: createSQLStatement
     */
    createSQLStatement: function(sqlType, options) {    	    	
    	var encoder_options = OpenLayers.Util.applyDefaults({}, options);
    	encoder_options['sqlType'] = sqlType;
    	encoder_options['responesType'] = this.responseType;    	
    	encoder_options['tableName'] = this.tableName;
    	
    	var sqlStatement = this.encoder.write(encoder_options);
    	//OpenLayers.Console.debug(sqlStatement);    	
    	return sqlStatement;    	    
    },
    
    /**
     * private method: readAsFeatures
     * 
     * use to this.parser to parse the response and extract the features
     */
    readAsFeatures: function(request) {    	
    	if(this.responseType == "geojson") {
    		var data = request.responseText;    		
    	} else if(this.responseType == "gml" || this.responseType == "kml" /* or other XML format */) {
    		var data = request.responseXML;
    		if(!data || !data.documentElement) {
                data = request.responseText;
            }
    	}    	
        if(!data) {
            return [];
        }   
        // OpenLayers.Format.GeoJSON implements read() which returns an array of features
        // OpenLayers.Format.GML.* implements read() which returns an array of features
        if(this.parser.read && typeof this.parser.read == "function") {
        	var features = this.parser.read(data);        	
        } else {
        	// TODO: other formats may not implements read(), deal with those specifically        	
        }
        return features;
    },
    
	CLASS_NAME: "OpenLayers.Protocol.SQL.ProxiedPostGIS"
});
