/**
 * @requires OpenLayers/Protocol.js
 * @requires OpenLayers/Protocol/GeoNames.js
 */

/**
 * Class: OpenLayers.Protocol.GeoNames.Service
 * 
 * Inherits from:
 *  - <OpenLayers.Protocol>
 */
OpenLayers.Protocol.GeoNames.Service = OpenLayers.Class(OpenLayers.Protocol, {
	
	/**
	 * Property: 'service' - {String}
	 * 
	 * A specific type of GeoName service end-point; "Service" is virtual parent of all concrete types 
	 */
	service: "Service",
	
	/**
	 * Property: 'urls'
	 * 
	 * A set of urls for a specific type of GeoNames service
	 * 	 
	 * urls['JSON']: service end point for non-spatial search in JSON
	 * urls['JSON_S']: service end point for spatial search in JSON by location or extent
	 * urls['XML']: service end point for non-spatial search in XML
	 * urls['XML_S']: service end point for spatial search in XML by location or extent
	 */	 
	urls: null,
	
	/**
	 * Property: 'commonQueryParams' - {Array}
	 * 
	 * Define a subset of common query parameters for GeoNames services
	 * a complete list of those parameters is defined in OpenLayers.Protocol.GeoNames.COMMON_QUERY_PARAMS
	 * 
	 * set commonQueryParams to 'all' to include all common query parameters, or 'none' to include none 
	 */
	commonQueryParams: null,
	
	/**
	 * Private Property: 'commonQueryParams' - {object}
	 * 
	 * query parameters that will be appended to the GeoNames request url
	 */
	queryParams: null,
	
	/**
	 * Property: 'isSpatialSearch' - {boolean}
	 * 
	 * indicate whether this GeoNames service supports query by LonLat/BBOX
	 */
	isSpatialSearch: false,
		
	/**
	 * Property: 'isSpatialSearch' - {String}
	 * 
	 * indicate which type of spatial query this GeoNames service supports; 
	 * possible values: "LonLat" or "BBOX"
	 */
	spatialSearchType: null,
		
	/**
     * Constructor: OpenLayers.Protocol.Service
     * A class for GeoNames Service.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.      
     */
	initialize: function(options) {
		// initialize Protocol superclass  
		OpenLayers.Protocol.prototype.initialize.apply(this, [options]);				
		// initialize format based on service type and response format
		this.format = new OpenLayers.Format.GeoNames({
			/*
			 * if user pass in 'service' and 'responseType' as options in constructor, 
			 *     then this.service and this.responseType should be overwritten by those already
			 *     so take this.service and this.responseType 
			 */
			'service': this.service,
			'responseType': this.responseType
		});		
		// apply default commonQueryParams values
		this.applyCommonQueryParams();
	},
	
	/**
	 * API Method: applyCommonQueryParams
	 * 
	 * based on applicable common query parameters defined in this.commonQueryParams, apply the default values
	 * to those parameters, so later they will be included in the request string to GeoNames service
	 */
	applyCommonQueryParams: function() {
		// based on a specific service's commonQueryParams list -
		// - apply default values of commonQueryParams from OpenLayers.Protocol.GeoNames.COMMON_QUERY_PARAMS
		if(this.commonQueryParams.length == 1 && this.commonQueryParams[0] == "none") {
			return;
		} else if(this.commonQueryParams.length == 1 && this.commonQueryParams[0] == "all") {
			OpenLayers.Util.applyDefaults(this.queryParams, OpenLayers.Protocol.GeoNames.COMMON_QUERY_PARAMS);
		} else {
			for(var i=0; i<this.commonQueryParams.length; i++) {				
				this.queryParams[this.commonQueryParams[i]] = OpenLayers.Protocol.GeoNames.COMMON_QUERY_PARAMS[this.commonQueryParams[i]];
			}
		}
	},
	
	/**
     * API Method: read
     * Construct and send a request to search GeoNames service.  
     */
    read: function(options) {        
		options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options || {});
        
        var response = new OpenLayers.Protocol.Response({requestType: "read"});        
        /*
         * pick up the url based on responseType: - 
         * - XML or JSON, and if it supports spatial query
         */ 
        var geoNames_base_url = this.urls[this.responseType];
        if(this.isSpatialSearch == true) { // if this GeoNames service end point supports query with lng/lat or bbox, there might be a different url
        	if(this.urls[this.responseType] != this.urls[this.responseType + "_S"]) {
        		// if url for spatial query exists and is different than non-spatial one
        		geoNames_base_url = this.urls[this.responseType + "_S"];
        	}
        }                               
        var params = OpenLayers.Util.applyDefaults({}, this.queryParams);        
        // merge extra query parameters other than those common ones
        params = OpenLayers.Util.extend(this.queryParams, options.queryParams);        
        // send the ajax request
        response.priv = OpenLayers.Request.GET({
            url: geoNames_base_url, 
            callback: OpenLayers.Util.AgsUtil.createProtocolCallback(this.handleRead, response, options, this),                        
            params: params,
            headers: options.headers           
        });        
        return response;
    },
    
    /**
     * private method: handleRead
     * single callback function of this.read(), and it extracts features from read response  
     */
    handleRead: function(response, options) {
        if(options.callback) {
            var request = response.priv;
            if(request.status >= 200 && request.status < 300) {
                // success 
                response.code = OpenLayers.Protocol.Response.SUCCESS; 
                response.features = this.readAsFeatures(request);
            } else {
                // failure
                response.code = OpenLayers.Protocol.Response.FAILURE;
            }
            options.callback.call(options.scope, response);
        }; 
    },
    
    /**
     * private method: readAsFeatures
     * 
     * use to this.format to parse the response and extract the features
     */
    readAsFeatures: function(request) {    	
    	if(this.responseType == "XML") {
    		var data = request.responseXML;
    		if(!data || !data.documentElement) {
                data = request.responseText;
            }
    	} else if(this.responseType == "JSON") {
    		var data = request.responseText;
    	}    	
        if(!data) {
            return null;
        }
        
        if(this.format.readAsFeatures && typeof this.format.readAsFeatures == "function") {
        	var features = this.format.readAsFeatures(data);
        } else {
        	var features = this.format.read(data);
        }
        return features;
    },
	
	/**
     * Method: abort
     * Abort an ongoing request, the response object passed to
     * this method must come from this protocol (as a result
     * of a read, or commit operation).
     *
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>}
     */
    abort: function(response) {
        if (response) {
            response.priv.abort();
        }
    },
	
	CLASS_NAME: "OpenLayers.Protocol.GeoNames.Service" 
});