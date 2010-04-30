/**
 * @requires OpenLayers/Control/ArcGIS/AgsControl.js
 *
 * Class: OpenLayers.Control.AgsIdentifyTask
 *
 * Inherits from:
 *  - <OpenLayers.Control.AgsControl>
 */

OpenLayers.Control.AgsIdentifyTask = OpenLayers.Class(OpenLayers.Control.AgsControl, {
     
     /**
      * Property: multiple
      *   {Boolean} restrict multiple selection.
      *   should always be false because AgsIdentifyTask can only have one or zero geometry input
      */
      multiple: false, 
	  
	 /**
	   * Property: asynchronous
       *   {Boolean} whether to deal with synchronous gp task or asynchronous gp job
       *   should always be false because AgsIdentifyTask is always synchronous
	   */
	  asynchronous: false,
	 
	 /**
      * Constructor: <OpenLayers.Control.AgsIdentifyTask>
      *
      * Parameters:
      *   url - {String} URL to the ArcGIS Server REST resource
      *   layer - {OpenLayers.Layer.Vector} 
      *   callbacks - {Array of function}
      *   options - {Object} 
      */
	 initialize: function(url, layer, callbacks, options) {	 	  
		 // call parent initializer
		 OpenLayers.Control.AgsControl.prototype.initialize.apply(this, [url, layer, callbacks, options]);	 			 			 
		 
		 // default task parameters for a esri.tasks.IdentifyTask control
		 this.taskParameters = {
			 'dpi':					96,
			 'geometry':			null,	
			 'height':				0,
			 'layerIds':			[0],
			 'layerOption':			"all",
			 'mapExtent':			null,
			 'returnGeometry':		true,
			 'spatialReference':	null,
			 'tolerance':			1,
			 'width':				0
		 };
		 
		 // set default parser for AgsIdentifyTask results
		 this._resultsParser = {
			 'parser': this.adapter.parseAgsResults['identifyResults'],
			 'context': this.adapter
		 };	
		 		 		 		 
		 // use dojo if defined
		 this.execute = this._bindFunction(this.execute, this);
		 // hitch execute, use dojo anyway		 
		 //this.execute = dojo.hitch(this, this.execute);		 
	 },
	 
	 /**
     * API Method: execute 
     *   Execute esri.tasks.IdentifyTask
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
		// set width, height, mapExtent and spatialReference
		if(this._isDefined(this.layer.map)) {
			_taskParameters['width'] = this.layer.map.getSize().w ? this.layer.map.getSize().w : _taskParameters['width'];
   			_taskParameters['height'] = this.layer.map.getSize().h ? this.layer.map.getSize().h : _taskParameters['height'];
   			// always overwrite 'mapExtent' when current map has valid extent
   			_taskParameters['mapExtent'] = this.layer.map.getExtent() ? this.layer.map.getExtent() : _taskParameters['mapExtent'];			
   			_taskParameters['spatialReference'] = this.layer.map['projection'] ? this.layer.map['projection'] : _taskParameters['spatialReference'];   				   				
   		} else {
   			OpenLayers.Console.error("...can not execute identify task...this.layer.map is not valid...");
   			throw "...can not execute identify task...this.layer.map is not valid...";
   		} 		
		// set 'geometry' identify parameter
		// multiple feature selection should always be disabled from AgsIdentifyTask control
		//   in case there is more than features/geometries in olFeatures array. always take first one
		if(olFeatures[0] instanceof OpenLayers.Feature.Vector) {
			_taskParameters['geometry'] = olFeatures[0].geometry;
		} else {
			OpenLayers.Console.error("...can not execute identify task...input geometry is not valid...");
   			throw "...can not execute identify task...input geometry is not valid...";
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
		// callbacks for synchronous identify tasks
		if(this.asynchronous == false) {
			//OpenLayers.Console.log("...execute esri.tasks.IdentifyTask...");
			var agsIdentifyTask = new esri.tasks.IdentifyTask(this.url);
			// make a single callback for esri.tasks.IdentifyTask
			var _onExecuteComplete = this._createCallbacks(
				this,
				[this.onExecuteComplete],
				{
					callback: _singleTaskCallback
				}				 	    	
			);
			// error callback for esri.tasks.IdentifyTask
			var _onCompleteError = this.errback || null;
			// encode esri.tasks.IdentifyParameters
			try {			
				var agsIdentifyParameters = this.adapter.encodeAgsIdentifyParameters(_taskParameters);			     	
	     	} catch(e) {
	     		throw e;
	     	}	
			agsIdentifyTask.execute(agsIdentifyParameters, _onExecuteComplete, _onCompleteError);				
		} else { 
			OpenLayers.Console.error("...'asynchronous' should always be set to 'false' for AgsIdentifyTask ...");
			throw "...'asynchronous' should always be set to 'false' for AgsIdentifyTask ...";
		}
	},	
              
    CLASS_NAME: "OpenLayers.Control.AgsIdentifyTask"
});