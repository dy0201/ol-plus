/**
 * @requires OpenLayers/Control/ArcGIS/AgsControl.js 
 *
 * Class: OpenLayers.Control.AgsQueryTask
 *
 * Inherits from:
 *  - <OpenLayers.Control.AgsControl>
 */
 
OpenLayers.Control.AgsQueryTask = OpenLayers.Class(OpenLayers.Control.AgsControl, {	
	/**
  	 * Property: multiple
  	 *   {Boolean} restrict multiple selection.
  	 *   should always be false because AgsQueryTask can only have one or zero geometry input
  	 */
  	 multiple: false, 
	  
	/**
	 * Property: asynchronous
     *   {Boolean} whether to deal with synchronous gp task or asynchronous gp job
     *   should always be false because AgsQueryTask is always synchronous
	 */
	 asynchronous: false,
	
	/**
     * Constructor: <OpenLayers.Control.ArcGIS.AgsQueryTask>
     *
     * Parameters:
     *   url - {String} URL to the ArcGIS Server REST resource that represents a map service
     *   layer - {OpenLayers.Layer.Vector} 
     *   callbacks - {Array of functions}
     *   options - {Object} 
     */
	initialize: function(url, layer, callbacks, options) {
		// call parent initializer
		OpenLayers.Control.AgsControl.prototype.initialize.apply(this, [url, layer, callbacks, options]);	 			 			 
		 
		// overwrite this.taskParameters for AgsQueryTask control
		this.taskParameters = {
			'geometry':				null,				
			'outFields':			[0],
			'returnGeometry':		true,
			'outSpatialReference':	null,
			'spatialRelationship':	null,
			'text':					"",
			'where':				""
		};				
		// set parser for AgsQueryTask results
		this._resultsParser = {
			'parser': this.adapter.parseAgsResults['featureSet'],
			'context': this.adapter
		};				
		// use dojo if defined
		this.execute = this._bindFunction(this.execute, this);
		// hitch execute, use dojo anyway		 
		//this.execute = dojo.hitch(this, this.execute);	
	},
	
	/**
     * API Method: execute 
     *   Execute identify operation 
     *   
     * Parameters:
     * 	 olFeatures - {Array of OpenLayers.Feature.Vector}	
     *   taskParameters - {object}
     *   callbacks - {Array of functions}
     */
	execute: function(olFeatures, taskParameters, callbacks) {			     	
		// assemble parameters to execute Task
		var _taskParameters = OpenLayers.Util.extend({}, taskParameters); 
		OpenLayers.Util.applyDefaults(
			_taskParameters,
			this.taskParameters
		);		
		// set 'outSpatialReference' query parameter
		if(this._isDefined(this.layer.map)) {
			_taskParameters['outSpatialReference'] = this.layer.map['projection'] ? this.layer.map['projection'] : _taskParameters['outSpatialReference']; 
		}		
		// set 'geometry' query parameter
		// multiple feature selection should always be disabled from AgsQueryTask control
		//   in case there is more than features/geometries in olFeatures array. always take first one
		if(olFeatures[0] instanceof OpenLayers.Feature.Vector) {
			_taskParameters['geometry'] = olFeatures[0].geometry ? olFeatures[0].geometry : _taskParameters['geometry'];
		} else {
			OpenLayers.Console.error("...can not execute query task...input geometry is not valid...");
   			throw "...can not execute query task...input geometry is not valid...";
		}
		 				
		// merge additional callbacks
		var _taskCallbacks = [];
		_taskCallbacks = _taskCallbacks.concat(this.taskCallbacks);
		_taskCallbacks = _taskCallbacks.concat(callbacks);
		var _singleTaskCallback = this._createCallbacks(
			this,
			_taskCallbacks,
			{}				 	    	
		);	
		
		// callbacks for synchronous query tasks
		if (this.asynchronous == false) {
			var agsQueryTask = new esri.tasks.QueryTask(this.url);
			// make a single callback for esri.tasks.QueryTask
			var _onExecuteComplete = this._createCallbacks(this, [this.onExecuteComplete], {
				callback: _singleTaskCallback
			});
			// error callback for esri.tasks.QueryTask
			var _onCompleteError = this.errback || null;
			try {
				var agsQuery = this.adapter.encodeAgsQuery(_taskParameters);
			} 
			catch (e) {
				throw e;
			}
			agsQueryTask.execute(agsQuery, _onExecuteComplete, _onCompleteError);
		} else {
			OpenLayers.Console.error("...'asynchronous' should always be set to 'false' for AgsQueryTask ...");
			throw "...'asynchronous' should always be set to 'false' for AgsQueryTask ...";
		} 				
	},

	CLASS_NAME: "OpenLayers.Control.AgsQueryTask"
});