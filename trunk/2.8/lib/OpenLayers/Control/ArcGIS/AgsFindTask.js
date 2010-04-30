/**
 * @requires OpenLayers/Control/ArcGIS/AgsControl.js
 *
 * Class: OpenLayers.Control.AgsFindTask
 *
 * Inherits from:
 *  - <OpenLayers.Control.AgsControl>
 */

OpenLayers.Control.AgsFindTask = OpenLayers.Class(OpenLayers.Control.AgsControl, {
     
     /**
      * Property: multiple
      *   {Boolean} restrict multiple selection.
      *   should always be false because AgsFindTask2 doesn't need any geometry input
      */
      multiple: false, 
	  
	 /**
	   * Property: asynchronous
       *   {Boolean} whether to deal with synchronous gp task or asynchronous gp job
       *   should always be false because AgsFindTask2 is always synchronous
	   */
	  asynchronous: false,
	 
	 /**
      * Constructor: <OpenLayers.Control.ArcGIS.AgsFindTask>
      *
      * Parameters:
      *   url - {String} URL to the ArcGIS Server REST resource
      *   layer - {OpenLayers.Layer.Vector} 
      *   callbacks - {Array of functions}
      *   options - {Object} 
      */
	 initialize: function(url, layer, callbacks, options) {	 	  
		 // call parent initializer
		 OpenLayers.Control.AgsControl.prototype.initialize.apply(this, [url, layer, callbacks, options]);	 			 			 
		 
		 // default task parameters for a esri.tasks.FindTask control
		 this.taskParameters = {
			 "contains":			false,
			 "outSpatialReference":	null,	
			 "returnGeometry":		true,
			 "layerIds":			[],
			 "searchFields":		[],
		 	 "searchText":			""
		 };
		 // set default parser for AgsFindTask results
		 this._resultsParser = {
			 'parser': this.adapter.parseAgsResults['findResults'],
			 'context': this.adapter
		 };	
		 		 		 		 
		 // use dojo if defined
		 this.execute = this._bindFunction(this.execute, this);
		 // hitch execute, use dojo anyway		 
		 //this.execute = dojo.hitch(this, this.execute);
		 
		 // since FindTask doesn't need any geometry input, so disable the map interaction
		 //   disabling map interaction makes it possible for FindTask coexist with other ags controls 
		 this.active = false;
		 this.activate = function() {return false;};
		 this.deactivate = function() {return false;};	 
	 },
	 
	 /**
     * API Method: execute 
     *   Execute esri.tasks.FindTask
     *   
     * Parameters:
     *   {object} - taskParameters
     *   {object} - callbacks
     */
	execute: function(/*olFeatures,*/ taskParameters, callbacks) {
		// assemble parameters to execute FindTask
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
		// callbacks for synchronous find tasks
		if(this.asynchronous == false) {
			//OpenLayers.Console.log("...execute esri.tasks.FindTask...");
			var agsFindTask = new esri.tasks.FindTask(this.url);
			// make a single callback for esri.tasks.FindTask
			var _onExecuteComplete = this._createCallbacks(
				this,
				[this.onExecuteComplete],
				{
					callback: _singleTaskCallback
				}				 	    	
			);
			// error callback for esri.tasks.FindTask
			var _onCompleteError = this.errback || null;
			// encode esri.tasks.FindParameters
			try {			
				var agsFindParameters = this.adapter.encodeAgsFindParameters(_taskParameters);		     	
	     	} catch(e) {
	     		throw e;
	     	}	
			agsFindTask.execute(agsFindParameters, _onExecuteComplete, _onCompleteError);				
		} else { 
			OpenLayers.Console.error("...'asynchronous' should always be set to 'false' for AgsFindTask ...");
			throw "...'asynchronous' should always be set to 'false' for AgsFindTask ...";
		}
	},	
              
    CLASS_NAME: "OpenLayers.Control.AgsFindTask"
});