/**
 * @requires OpenLayers/Control/ArcGIS/AgsControl.js
 *
 * Class: OpenLayers.Control.AgsGeoprocessor
 *
 * Inherits from:
 *  - <OpenLayers.Control.AgsControl>
 */

OpenLayers.Control.AgsGeoprocessor = OpenLayers.Class(OpenLayers.Control.AgsControl, {
     
     /**
      * Property: multiple
      *   {Boolean} restrict multiple selection.
      *   Default is true, for AgsGeoprocessor to allow mulitple feature selection
      */
     multiple: true, 
	  
	 /**
	   * Property: asynchronous
       *   {Boolean} whether to deal with synchronous gp task or asynchronous gp job
       *   Default is false 
	   */
	 asynchronous: false,
	 
	 /**
	  * 
	  */
	 asynJobCompleteCallback: null,
	 
	 /**
      * Constructor: <OpenLayers.Control.ArcGIS.AgsGeoprocessor>
      *
      * Parameters:
      *   url - {String} URL to the ArcGIS Server REST resource
      *   layer - {OpenLayers.Layer.Vector} 
      *   callbacks - {function}
      *   options - {Object} 
      */
	 initialize: function(url, layer, callbacks, options) {	 	  
		 // call parent initializer
		 OpenLayers.Control.AgsControl.prototype.initialize.apply(this, [url, layer, callbacks, options]);	 			 			 
		 // add a new event to the control to indicate the complete of a asyn gp job
		 this.events.addEventType("asynjobcomplete");
		 
		 // add utility function bindFunction() from AgsUtil
		 this._bindFunction = OpenLayers.Util.AgsUtil.bindFunction;
		 
		 
		 // create callback for new event 'asynjobcomplete', which add and show results and the gp job
		 // use dojo if defined
		 var addAndShowResults = this._bindFunction(		 	
			function(evt) {
				this.cleanupResults();
				this.addResults(evt.results);
				this.showResults();
			},
			this
		 );		 
		 // use dojo anyway
		 /*
		 var addAndShowResults = dojo.hitch(
		 	this,
			function(evt) {
				this.cleanupResults();
				this.addResults(evt.results);
				this.showResults();
			}
		 );
		 */		 
		 var _asynTaskCallbacks = [];
		 _asynTaskCallbacks = _asynTaskCallbacks.concat(this.taskCallbacks);
		 _asynTaskCallbacks = _asynTaskCallbacks.concat([addAndShowResults]);
		 this.asynJobCompleteCallback = this._createCallbacks(
			this,
			_asynTaskCallbacks,
			{}				 	    	
		 );			 				
		 // register the listener callback to event 'asynjobcomplete'
		 this.events.on({
		 	"asynjobcomplete": this.asynJobCompleteCallback,
			scope:this
		 });		 		 
		 
		 // use dojo if defined
		 this.execute = this._bindFunction(this.execute, this);
		 // hitch execute, use dojo anyway		 
		 //this.execute = dojo.hitch(this, this.execute);	 
	 },
	 
	 /**
	  * API Method: destroy
	  */
     destroy: function() {        
         // unregister the listener callback to event 'asynjobcomplete'
		 this.events.un({
		 	"asynjobcomplete": this.asynJobCompleteCallback,
			scope:this
		 });
         OpenLayers.Control.AgsControl.prototype.destroy.apply(this, []);
     },
	 
	 /**
      * API Method: execute 
      *   Execute gp task 
      *   
      * Parameters:
      *   {OpenLayers.Feature.Vector Array} - olFeatures
      *   {object} - taskParameters
      *   {object} - callbacks
      */
	execute: function(olFeatures, taskParameters, callbacks) {
		// assemble parameters to execute task/job
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
		// _resultsParser
		this._resultsParser = {
			'parser': this.geoprocessingResultsParser,
			'context': this
		};
		
		// geometry input of an arcgis geoprocessing service is usually esri.tasks.FeatureSet
		//   so create esri.tasks.FeatureSet as input for geoprocessingParamsEnocoder				
		var agsFeatureSet = this.adapter.encodeAgsFeatureSet(olFeatures, this.layer.map['projection'], {});
		//OpenLayers.Console.log("...execute geoprocessing task...");
		var agsGeoprocessor = new esri.tasks.Geoprocessor(this.url);
		var geoprocessingParams = this.geoprocessingParamsEnocoder(agsFeatureSet, _taskParameters);
		
		// callbacks for synchronous gp tasks
		if(this.asynchronous == false) {
			var _onExecuteComplete = this._createCallbacks(
				this,
				[this.onExecuteComplete],
				{
					callback: _singleTaskCallback
				}				 	    	
			);	
			agsGeoprocessor.execute(geoprocessingParams, _onExecuteComplete);
		} else { // callbacks for asynchronous gp tasks
			var _onExecuteAsynComplete = this._createCallbacks(
				this,
				[this.onExecuteAsynComplete],
				{
					agsGeoprocessor: agsGeoprocessor,
					//callback: _singleTaskCallback					
				}				 	    	
			);							
			// does not support statusCallback now
			agsGeoprocessor.submitJob(geoprocessingParams, _onExecuteAsynComplete, null);
		}
	},	
      
    /**
     * API Method: geoprocessingParamsEnocoder
     *   overwrite 'geoprocessingParamsEnocoder' to encode geoprocessing parameters  
     * 
     * Parameters:
     *   agsFeatureSet - {esri.task.FeatureSet}
     *   taskParameters - {Object}
     *                                          
     */
    geoprocessingParamsEnocoder: function(agsFeatureSet, tasksParameters) {     	   
    	//OpenLayers.Console.log("...encode geoprocessing parameters...");
		var geoprocessingParams = tasksParameters;
    	return geoprocessingParams;
    },
    
    /**
     * API Method: geoprocessingResultsParser
     *   overwrite 'geoprocessingResultsParser' to parse geoprocessing results 
     * 
     * Parameters:
     *   agsResults - {Object}: results from geoprocessing task or job, can be anything
     *                            
     * Returns:
     *   olResults - {Object}
     */    
    geoprocessingResultsParser: function(agsResults, options) {     	   
    	//OpenLayers.Console.log("...parse geoprocessing results...");
		var olResults = {};    	
    	return olResults;
    },
              
    CLASS_NAME: "OpenLayers.Control.AgsGeoprocessor"
});