OpenLayers.Util.AgsUtil = (function() {
	return function() {}
})();

OpenLayers.Util.AgsUtil.isDefined = function(value) {
	if (value === undefined || value === null || value === "") {
		return false;
	}
	else {
		return true;
    }
};

/**
 * API Method: isNumber
 *   tell if a value is number or not
 *   
 * Parameters:
 *   value - (*) object
 *   
 * Returns
 *   true or false
 */
OpenLayers.Util.AgsUtil.isNumber = function(value) {
	if(value === undefined || value === null || value === "") {
		return false;
	} else if(typeof value === "number") {
		return true;
	} else {
		return false;
    }
};

OpenLayers.Util.AgsUtil.isBoolean = function(value) {
	if (value === undefined || value === null || value === "") {
		return false;
	} else if(typeof value === "boolean") {
		return true;
	}
	else {
		return false;
    }
};

OpenLayers.Util.AgsUtil.isAgsGeometry = function(value) {
	if (value === undefined || value === null || value === "") {
		return false;
	} else if(value instanceof esri.geometry.Point) {
		return true;
	} else if(value instanceof esri.geometry.Polyline) {
		return true;
	} else if(value instanceof esri.geometry.Polygon) {
		return true;
	} else if(value instanceof esri.geometry.Extent) {
		return true;
	}else {
		return false;
    }
};

OpenLayers.Util.AgsUtil.isOLGeometry = function(value) {
	if (value === undefined || value === null || value === "") {
		return false;
	} else if(value instanceof OpenLayers.Geometry.Point) {
		return true;
	} else if(value instanceof OpenLayers.Geometry.LineString) {
		return true;
	} else if(value instanceof OpenLayers.Geometry.LinearRing) {
		return true;
	} else if(value instanceof OpenLayers.Geometry.MultiLineString) {
		return true;
	} else if(value instanceof OpenLayers.Geometry.MultiPoint) {
		return true;
	} else if(value instanceof OpenLayers.Geometry.MultiPolygon) {
		return true;
	} else if(value instanceof OpenLayers.Geometry.Polygon) {
		return true;
	} else if(value instanceof OpenLayers.Bounds) {
		return true;
	}else {
		return false;
    }
};

/**
 * APIMethod: isSameOLPoint
 *   tell if point1 represents the same geographic point as point2
 * 
 * @param {OpenLayers.Geometry.Point} point1
 * @param {OpenLayers.Geometry.Point} point2
 * 
 * Returns:
 *   true or false
 */
OpenLayers.Util.AgsUtil.isSameOLPoint = function(point1, point2) {
	if(typeof point1.x === "number" && typeof point1.y === "number" && typeof point2.x === "number" && typeof point2.y === "number") {
		if(point1.x == point2.x && point1.y == point2.y) {
			return true;
		}	
	}
	return false;
};

/**
 * APIMethod: dispatch
 *   Allows multiple asynchronous sequences to be called in parallel.  A final
 *   callback is called when all other sequences report that they are done.
 * 
 * Parameters:
 *   functions - {Array(Function)} List of functions to be called.  All
 *     functions will be called with two arguments - a callback to call when
 *     the sequence is done and a storage object
 *   complete - {Function} A function that will be called when all other
 *     functions report that they are done.  The final callback will be
 *     called with the storage object passed to all other functions.
 *   scope - {Object} Optional object to be set as the scope of all functions
 *     called.
 */
OpenLayers.Util.AgsUtil.dispatch = function(functions, complete, scope) {
	var requests = functions.length;
    var responses = 0;
    var storage = {};
    
	function respond() {
        ++responses;
        if(responses === requests) {
            complete.call(scope, storage);
        }
    }
	
    function trigger(index) {
        window.setTimeout(function() {
            functions[index].apply(scope, [respond, storage]);
        });
    }
	
    for(var i=0; i<requests; ++i) {
        trigger(i);
    }	
};

	/**
	 * Static method: bind a function to a specific context/scope
	 *     if dojo is defined, use dojo.hitch(), otherwise use OpenLayers.Function.bind()
	 */

/**
 * APIMethod: bindFunction
 *   Static method: bind a function to a specific context/scope
 *   if dojo is defined, use dojo.hitch(), otherwise use OpenLayers.Function.bind()
 * 
 * Parameters:
 *   func - {function}
 *   scope - {Object}
 */
OpenLayers.Util.AgsUtil.bindFunction = function(func, scope) {
	if(window.dojo !== undefined) {
		//OpenLayers.Console.log("...dojo found...use dojo.hitch() to bind function to scope...");
		return dojo.hitch(scope, func);
	} else {
		OpenLayers.Console.log("...dojo not found...use OpenLayers.Function.bind() to bind function to scope...");
		return OpenLayers.Function.bind(func, scope);
	}
};



/**
 * 
 */
OpenLayers.Util.AgsUtil.createSingleCallback = function(methods, options, scope) {        
	if(window.dojo !== undefined) {
		return dojo.hitch(
			       scope,
				   function(response) {
			    	   var method = null;
			    	   for(var i=0; i<methods.length; i++) {
			    		   method = methods[i];
			    		   if(typeof method == "function") {						
			    			   method.apply(scope, [response, options]);	
			    		   }						
			    	   }				
			       }
			   );
    } else {
    	return OpenLayers.Function.bind(
    			   function(response) {
			    	   var method = null;
			    	   for(var i=0; i<methods.length; i++) {
			    		   method = methods[i];
			    		   if(typeof method == "function") {						
			    			   method.apply(scope, [response, options]);	
			    		   }						
			    	   }				
			       },
			       scope
    	       );
    }
};

//==================================================================================================
// OpenLayers.Protocol related
// ==================================================================================================

/**
 * API Method: createCallback
 * Create a callback function with a <OpenLayers.Protocol.Response> as a parameter
 * 
 * Parameters:
 * 
 * 		method - function
 * 		response - OpenLayers.Protocol.Response
 * 		options	- object
 * 		scope - object
 */
OpenLayers.Util.AgsUtil.createProtocolCallback = function(method, response, options, scope) {    
	if(window.dojo !== undefined) {
    	return dojo.hitch(
    		       scope, 
    		       function() {
    		    	   if(typeof method == "function") {
    		    		   /*
    		    		    * caller pass in a OpenLayers.Protocol.Response so that
    		    		    *   in the actual callback OpenLayers.Request.XMHTTPRequest
    		    		    *   can be accessed through response.priv
    		    		    */ 
    		    		   method.apply(this, [response, options]);
    		    	   }
    		       }
    		   );
    } else {
    	return OpenLayers.Function.bind(
    		       function() {
    		    	   if(typeof method == "function") {
    		    		   method.apply(this, [response, options]);
    		    	   }
    		       }, 
    		       scope
    		   );
    }	
};


