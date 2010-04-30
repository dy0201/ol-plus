/**
 * @requires OpenLayers/Control/ArcGIS/AgsControl.js 
 *
 * Class: OpenLayers.Control.AgsLocator
 *
 * Inherits from:
 *  - <OpenLayers.Control.AgsControl>
 */
OpenLayers.Control.AgsLocator = OpenLayers.Class(OpenLayers.Control.AgsControl, {
	/**
  	 * Property: multiple
  	 *   {Boolean} restrict multiple selection.
  	 *   should always be false because AgsLocator can only have one or zero geometry input
  	 */
  	multiple: false, 
	  
	/**
	 * Property: asynchronous
     *   {Boolean} whether to deal with synchronous gp task or asynchronous gp job
     *   should always be false because AgsLocator is always synchronous
	 */
	asynchronous: false,
	 
	/**
     * Property: reverseGeocoding
     *   {boolean}  
     *   default is false for geocoding otherwise 'true' for reverse geocoding 
     */
    reverseGeocoding: false,

	/**
     * Constructor: <OpenLayers.Control.ArcGIS.AgsLocator>
     *
     * Parameters:
     *   url - {String} URL to the ArcGIS Server REST resource that represents a geocode service
     *   layer - {OpenLayers.Layer.Vector} 
     *   callbacks - {Array of functions}
     *   options - {Object} 
     */
	initialize: function(url, layer, callbacks, options) {
		// call parent initializer
		OpenLayers.Control.AgsControl.prototype.initialize.apply(this, [url, layer, callbacks, options]);	 			 			 		 	
		// overwrite this.taskParameters for AgsLocator control
		this.taskParameters = {
			'address': 		{},
			'distance':		50, // in 'meters'
			'outFields':	[],	
			'location':		null			
		};						
		// set parser for AgsLocator results		
		if(this.reverseGeocoding == true) { // reverse geocoding only returns one address candidate
			this._resultsParser = {
				'parser': this.adapter.parseAgsResults['addressCandidate'],
				'context': this.adapter
			};
		} else {
			this._resultsParser = { // geocoding may return multiple locations matching given address
				'parser': this.adapter.parseAgsResults['addressCandidates'],
				'context': this.adapter
			};
		}
		// use dojo if defined
		this.execute = this._bindFunction(this.execute, this);
		// hitch execute, use dojo anyway		 
		//this.execute = dojo.hitch(this, this.execute);
	},
	
	/**
     * API Method: execute 
     *   Find location or address from an ArcGIS Server Rest Geocode service
     *   
     * Parameters:
     *   olFeatures - {Array of OpenLayers.Feature.Vector}
     *   taskParameters - {object}
     *   callbacks - {Array of function} 
     */
	execute: function(olFeatures, taskParameters, callbacks) {						
		// assemble parameters to execute Task
		var _taskParameters = OpenLayers.Util.extend({}, taskParameters); 
		OpenLayers.Util.applyDefaults(
			_taskParameters,
			this.taskParameters
		);			
		// merge additional callbacks
		var _taskCallbacks = [];
		_taskCallbacks = _taskCallbacks.concat(this.taskCallbacks);
		_taskCallbacks = _taskCallbacks.concat(callbacks);
		var _singleTaskCallback = this._createCallbacks(
			this,
			_taskCallbacks,
			{}				 	    	
		);	
		
		// callbacks for synchronous locator tasks
		if (this.asynchronous == false) {
			var agsLocator = new esri.tasks.Locator(this.url);
			// make a single callback for esri.tasks.QueryTask
			var _onExecuteComplete = this._createCallbacks(this, [this.onExecuteComplete], {
				callback: _singleTaskCallback
			});
			// error callback for esri.tasks.QueryTask
			var _onCompleteError = this.errback || null;
			
			if(this.reverseGeocoding == true) {
				// set 'location' parameter
				if(olFeatures[0] instanceof OpenLayers.Feature.Vector && olFeatures[0].geometry instanceof OpenLayers.Geometry.Point) {
					_taskParameters['location'] = olFeatures[0].geometry;
				}
				if(!_taskParameters['location']) {
            		OpenLayers.Console.error("...'location' missing or invalid...");
 					throw "...'location' missing or invalid...";
            	}                	                            	
            	if(!_taskParameters['distance']) {                        		
            		OpenLayers.Console.error("...'distance' missing or invalid...");
 					throw "...'distance' missing or invalid...";
            	}
            	var agsLocation = null;                	
            	agsLocation = this.adapter.encodeAgsLocation(_taskParameters['location']);                	
				agsLocator.locationToAddress(agsLocation, _taskParameters['distance'], _onExecuteComplete, _onCompleteError);
			} else {               	
				if(!_taskParameters['address']) {
            		OpenLayers.Console.error("...'address' missing or invalid...");
 					throw "...'address' missing or invalid...";
            	}
            	if(!_taskParameters['outFields']) {                        		
            		OpenLayers.Console.error("...'outFields' missing or invalid...");
 					throw "...'outFields' missing or invalid...";
            	}
				agsLocator.addressToLocations(_taskParameters['address'], _taskParameters['outFields'], _onExecuteComplete, _onCompleteError);            	                         	 	                					
			}
		} else {
			OpenLayers.Console.error("...'asynchronous' should always be set to 'false' for AgsLocator...");
			throw "...'asynchronous' should always be set to 'false' for AgsLocator...";
		} 					
	},
	
	/**
	 * APIMethod: setReverseGeocoding
	 *   Toggle between geocode service and reverse geocoding
	 *
	 * Parameters: 
	 *   reverseGeocoding - {boolean}
	 *   'true' - reverse geocoding
	 *   'false' - geocoding
	 */
	setReverseGeocoding: function(reverseGeocoding) {
		if(reverseGeocoding == true) {
			this.reverseGeocoding = true;						
			this._resultsParser.parser = this.adapter.parseAgsResults['addressCandidate'];
			//this.activate();
		} else {
			this.reverseGeocoding = false;							
			this._resultsParser.parser = this.adapter.parseAgsResults['addressCandidates'];			
		}
	},

	CLASS_NAME: "OpenLayers.Control.AgsLocator"
});