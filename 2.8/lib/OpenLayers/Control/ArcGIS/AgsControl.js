/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Handler/Polygon.js
 */

/**
 * Class: OpenLayers.Control.AgsControl
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.AgsControl = OpenLayers.Class(OpenLayers.Control, {
	
	/**
     * Property: url - {string}
     *
     * URL to the ArcGIS Server REST resource that represents a map service or a task
     *   Default is ""
     */
	url: "",
	
	
	/**
     * Property: layer - {OpenLayers.Layer.Vector}
     * 
     * A vector layer where control receive its input geometry/feature from and output result 
     *   geometry/features to
     */
	layer: null,
	
	/**
     * Property: mode - {String}
     *
     * Whether to work with hand draw geometry or selected features on map
     *   Default is false, to receive hand draw geometry as input
     */
	mode: "select",
	  
	/**
	  * Property: asynchronous
      *   {Boolean} whether to deal with synchronous gp task or asynchronous gp job
      *   Default is false 
	  */
	asynchronous: false,
	
	/**
	 * Property: adapter - {OpenLayers.Format.AgsJsAdapter}
	 * 
	 * adapter to converting OpenLayers model and AgsJs model back and forth
	 */
	adapter: null,
	
	/**
     * Property: handlers - {Object}
     *
     */
    handlers: null,
	
	/**
     * Property: displayResults - {boolean}
     *  
     * Whether to add/draw result features of task on map 
     *   Default is true
     */
	displayResults: true,
	
	/**
     * Property: taskParameters - {object}
     * 
     * Parameters to define the current task  
     *   to be overwritten by individual task    
     */
	taskParameters: {},
	
    /**
     * Property: taskCallbacks - {Object} array of function
     * 
     * User can pass in callback method when initialize the control or execute the task, 
     *   functions in 'taskCallbacks' will be called after every task is executed
     */
    taskCallbacks: null,
	
	/**
     * Property: _resultFeatures - {OpenLayers.Feature.Vector Array}
     *  
     * Reference to the result features of current task
     *   keep the feature reference so they can be added to or removed from this.layer
     *   executeCallback() will remove 'resultFeatures[]' of previous operation from this.layer
     *   executeCallback() will add 'resultFeatures[]' of current operation to this.layer    
     */
    _resultFeatures: null,
	
	/**
     * Property: resultStyles - {object}
     * 
     * Styles used to draw result features on vector layer
     */
	resultFeatureStyles: {},
	
	/**
     * Property: _resultImages - {OpenLayers.Layer.Image Array}
     * 
     * Reference to the result image layers of current task
     */
	_resultImages: null,
	
	/**
     * Property: resultImageOptions - {object}
     * 
     * Options used to control result image layers
     */
	resultImageOptions: {},
	
	/**
	 * Property: _resultsParser - {object literal}
	 *   _resultsParser.parser - {function} function to parse results from task like identify, find or query
	 *   _resultsParser.context - {object} instance where the parser belongs to
	 */
	_resultsParser: null,
	
	/*********************************************************************************************
	 * properties related to selectControl
	 *********************************************************************************************/
	
	/**
	 * Property: selectControl - {OpenLayers.Control.SelectControl}
	 * 
	 * Select control used to select a feature as input geometry/feature for the ags control
	 */
	selectControl: null,
	
	/**
     * Property: geometryTypes - {String}
     * 
     * Array(String) To restrict selection to a limited set of geometry types, 
     *   send a list of strings corresponding to the geometry class names.
     */
    geometryTypes: null,

    /**
     * Property: clickout - {boolean}
     * 
	 * Unselect features when clicking outside any feature, default is false.
     */
    clickout: false,

    /**
     * Property: toggle - {boolean} 
     * 
     * Unselect a selected feature on click, default is true.
     */
    toggle: true, 
	
	/**
     * Property: multiple - {boolean}
     * 
     * Restrict multiple selection, default is false.
     */
    multiple: false, 
	
	/*********************************************************************************************
	 * properties related to drawControl
	 *********************************************************************************************/
	/**
	 * Property: drawControl - {OpenLayers.Control.DrawFeature}
	 * 
	 * DrawFeature control used to hand draw feature as input geometry/feature to ags control
	 */
	drawControl: null,
	
	/**
	 * Property: drawCtrlHandler - (OpenLayers.Handler.*)
	 * 
	 * Handler for DrawControl to control which type of geometry to draw
	 */
	drawCtrlHandler: OpenLayers.Handler.Polygon,
	
	/**
	 * Property: drawCtrlHandlerOptions 	 
	 * 
	 * Handler options for the DrawControl, e.g. 'multi'
	 */
	drawCtrlHandlerOptions: {},
	
	/**
     * Constructor: <OpenLayers.Control.AgsControl2>
     *
     * Parameters:
     *   url - {String} URL to the ArcGIS Server REST resource that represents a task
     *   layer - {OpenLayers.Layer.Vector} 
     *   callback - {function}
     *   options - {Object} 
     */
	initialize: function(url, layer, callbacks, options) {	
		OpenLayers.Control.prototype.initialize.apply(this, [options]);
		
		this.url = url;
		if(layer && layer instanceof OpenLayers.Layer.Vector) { // user provide a vector layer, and add it to map in setMap()     					
     		this.layer = layer;     		     		
     	} else {			
			// create an internal vector layer, and add it to map in this.setMap()
     		this.layer = new OpenLayers.Layer.Vector( 
				"__internal__",
				{
					displayInLayerSwitcher: false, // won't show up in layer switcher
					isBaseLayer: false
				}
			);				     		
     	}
		if(callbacks) {
			this.taskCallbacks = callbacks;
		}						
		// initialize selectControl
        var selectOptions = {
            geometryTypes: this.geometryTypes,
            clickout: this.clickout,
            toggle: this.toggle,
			multiple: this.multiple,
			callbacks: {
				// double-click existing feature to execute control task or submit job
				dblclick: dojo.hitch(this, this._execute)
			}
        };
        this.selectControl = new OpenLayers.Control.SelectFeature(
            this.layer, 
			selectOptions
        );
		
		// initialize drawControl		
		var drawOptions = OpenLayers.Util.extend(
			{
				// by default drawFeature() in DrawFeature control is binded with 'done', now it's binded with '_execute'
				//   so when a geometry is drawn, it won't be added into layer automatically, instead _execute() is called 
				callbacks:{ done:dojo.hitch(this, this._execute) } // when finish drawing a feature, execute control task or submit job
			},
			this.drawCtrlHandlerOptions
		);
		this.drawControl = new OpenLayers.Control.DrawFeature(
			this.layer,
			this.drawCtrlHandler,
			drawOptions
		);
		
		// other handlers
		this.handlers = {
        	// TODO: add more if necessary
        };
		
		// initialize adapter (OpenLayers.Format.AgsJsAdapter)
		//   for converting ags features/geometry to OpenLayers geometry/feature back and forth
     	//   ''defaultEncodeWkid' config parameter will be set in this.setMap()
		this.adapter = new OpenLayers.Format.AgsJsAdapter();
		
		// initialize this._resultFeatures and this._resultImages 
		this._resultFeatures = [];
		this._resultImages = [];
		
		// apply defaults to this.resultImageOptions
		OpenLayers.Util.applyDefaults(
		    this.resultImageOptions,
		    {
				//opacity: 0.72,
				opacity: 1.0,
			}
		);
		
		// Utility methods from OpenLayers.Util.AgsUtil
		this._isDefined = OpenLayers.Util.AgsUtil.isDefined;
	    this._isAgsGeometry = OpenLayers.Util.AgsUtil.isAgsGeometry;
		this._isOLGeometry = OpenLayers.Util.AgsUtil.isOLGeometry;
		
		// add utility function bindFunction() from AgsUtil
		this._bindFunction = OpenLayers.Util.AgsUtil.bindFunction;
	},
	
	/**
     * APIMethod: destroy
     */
    destroy: function() {        
        this.layer = null;
        this.selectControl.destroy();
        this.drawControl.destroy();
        OpenLayers.Control.prototype.destroy.apply(this, []);
    },
	
	/**
     * APIMethod: activate
     *   Activate the control.
     * 
     * Returns:
     *   {Boolean} Successfully activated the control.
     */
    activate: function() {
		/* 
		 * there is no need to move this.layer to the top when activating the control 
		 *   because the handlers in selectControl or drawControl will do so    
		 */        
		if(this.mode == "select") {
			// TODO: activate other optional handlers in this.handlers if there is any
			return (this.selectControl.activate() && 
					OpenLayers.Control.prototype.activate.apply(this, arguments));	
		} else if(this.mode == "draw") {
			// TODO: activate other optional handlers in this.handlers if there is any
			return (this.drawControl.activate() && 
					OpenLayers.Control.prototype.activate.apply(this, arguments));
		} else {
			return false;
		}		
    },

    /**
     * APIMethod: deactivate
     *   Deactivate the control.
     *
     * Returns: 
     *   {Boolean} Successfully deactivated the control.
     */
    deactivate: function() {
        var deactivated = false;        
        if(OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {            
            this.drawControl.deactivate();
            this.selectControl.deactivate();
            // TODO: deactivate other optional handlers in this.handlers
            deactivated = true;
        }
        return deactivated;
    },
	
	/**
	 * InternalMethod: _execute
	 *   _execute() is called when done drawing a geometry on map, dbl-click feature/features on map,
	 *     and it always creates array of OpenLayers.Feature.Vector as inputs and calls this.execute() to execute a task or submit a job
	 *   
	 * Parameters:
	 *   data - OpenLayers.Geometry or OpenLayers.Feature.Vector or an array of them
	 *   
	 */
	_execute: function(data) {
		var olFeatures = null;
		if(this._isOLGeometry(data)) { // triggered by 'done' drawing a geometry on map			
			if(this.multiple == true) {
				OpenLayers.Console.log("...to allow multiple features as operation input...");
				OpenLayers.Console.log("..._execute will not be triggered by 'done' drawing a geometry on map...");								
				// if 'multiple' is true, execute will not be called when a feature/geometry is drawn
				//   user must trigger the execute() manually when enough features/geometries were collected				
				this.drawControl.drawFeature(data); // 'done' callback is binded with _execute(), so drawFeature() has to be called manually here
				return true;
			} else {
				OpenLayers.Console.log("..._execute triggered by 'done' drawing a geometry on map...");
				OpenLayers.Console.log("...single feature as operation input...");
				olFeatures = [new OpenLayers.Feature.Vector(data)];	
			}			
		} else if(data instanceof OpenLayers.Feature.Vector) { // triggered by 'dblclick' a feature on map
			OpenLayers.Console.log("..._execute triggered by 'dblclick' a feature on map...");
			if(this.multiple == true) {
				OpenLayers.Console.log("...allow multiple features as operation input...");
				olFeatures = this.layer.selectedFeatures;
				// does selectedFeatures maintain the order features being selected
				//   it seems 'yes'
				/*
				for(var i=0; i<olFeatures.length; i++) {
					OpenLayers.Console.log(olFeatures[i].id);
				}
				*/
			} else {
				OpenLayers.Console.log("...single feature as operation input...");
				olFeatures = [data];	
			}			
		} else if(data instanceof Array) { // triggered by using all selected features on the map
			OpenLayers.Console.log("..._execute triggered by using all selected features on the map...");
			olFeatures = data;
		} else {
			OpenLayers.Console.error("...input geometry or feature is missing or invalid...");
   			throw "...input geometry or feature is missing or invalid...";
		}
		this.execute(olFeatures, {}, []);
	},
	
	/**
     * APIMethod: execute 
     *   Execute a task or submit a job on an ArcGIS Server REST task/job resource
     *   never call AgsControl2.execute() directly because it meant to be overwritten by individual task 
     *  
     * Parameters:
     *   {OpenLayers.Feature.Vector Array} - olFeatures
     *   {Object} - taskParameters
     *   {Object} - callbacks
     */
	execute: function(olFeatures, taskParameters, callbacks) {		
		// what a subclass usually do in execute()		
		/*
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
		    'parser': this.adapter.parseAgsResults['identifyResults'], // e.g identify task 
		    'context': this.adapter 
		}; 
		// create a single callback function
		var _onExecuteComplete = this._createCallbacks(
		    this,
			[this.onExecuteComplete],
			{
				callback: _singleTaskCallback
			}				 	    	
		);	 
		// TODO: specific impelemtation	 
		*/
		OpenLayers.Console.error("...execute of OpenLayers.Control.AgsControl is not implemented...");
     	throw "...execute of OpenLayers.Control.AgsControl is not implemented...";
	},
	
	/**
	 * Private Method: onExecuteComplete
	 *   internal callback function when a synchronized task/job is done  
	 *
	 * Parameters:
	 *   agsResults - array of {object}
	 */
	onExecuteComplete: function(agsResults, options) {	
		OpenLayers.Console.debug("...AgsControl OnExecuteComplete is called...");
		var olResults = null;
		try {
			if(this._resultsParser.context && typeof this._resultsParser.parser === "function") {
				// this._resultsParser.parser requires multiple input parameters, then it's in options['args_list']
				//olResults = this._resultsParser.parser.apply(this._resultsParser.context, [agsResults]);
				olResults = this._resultsParser.parser.apply(this._resultsParser.context, [agsResults, options['args_list']]);
			} else {
				OpenLayers.Console.error("..._resultsParser is missing or invalid...");
     			throw "..._resultsParser is missing or invalid...";
			}				
		} catch(e) {
			OpenLayers.Console.error(e.message);
			throw e.message;
		}
		// olResults could be just an instance of OpenLayers.Feature.Vector e.g. from locationToAddress operation
		//   convert it to array [olResults]				
		if(olResults instanceof OpenLayers.Feature.Vector) {
			olResults = [olResults];		
		}								
		this.cleanupResults();						
		this.addResults(olResults);		
		if(this.displayResults === true) {		
			this.showResults();
		}		
		// a single callback			
		options.callback.apply(this, [olResults]);												
	},
	
	/**
	 * Private Method: onExecuteComplete
	 *   internal callback function when an asynchronized job is finished  
	 *
	 * Parameters:
	 *   agsResults - array of {object}
	 *   options - {} object
	 */
	onExecuteAsynComplete: function(agsResults, options) {
		//OpenLayers.Console.log("...asynchronized job succeeded...onExecuteAsynComplete gets called...");
		var _options = OpenLayers.Util.extend(
			{
				'resultFeatures': this._resultFeatures,
				'resultImages': this._resultImages
			},
			options
		);
		try {
			if(this._resultsParser.context && typeof this._resultsParser.parser === "function") {
				this._resultsParser.parser.apply(this._resultsParser.context, [agsResults, options]);
			} else {
				OpenLayers.Console.error("..._resultsParser is missing or invalid...");
     			throw "..._resultsParser is missing or invalid...";
			}				
		} catch(e) {
			throw e;
		}
	},
	
	/**
	 * APIMethod: setTasksParameters
	 *   set task parameters for this control
	 * 
	 * Parameters:
	 *   taskParameters - {object}
	 */
	setTaskParameters: function(taskParameters) {
		var _taskParameters = OpenLayers.Util.extend({}, taskParameters); 
	    OpenLayers.Util.applyDefaults(
		    _taskParameters,
		    this.taskParameters
		);
		OpenLayers.Util.extend(this.taskParameters, _taskParameters); 
	},
	
	/**
     * APIMethod: addResults
     *   add results to map
     * 
     * Parameters:
     *   olResults - {Array of OpenLayers.Feature.Vector or OpenLayers.Layer.Image} array
     */
	addResults: function(olResults) {		
		//OpenLayers.Console.debug("...addResults start...");
		for(var i=0; i<olResults.length; i++) {
			var olResult = olResults[i];
			if(olResult instanceof OpenLayers.Feature.Vector) {
				this._resultFeatures.push(olResult);			
			} else if(olResult instanceof OpenLayers.Layer.Image) {
				olResult.setVisibility(false);
				olResult.setOpacity(this.resultImageOptions.opacity);
				this.map.addLayer(olResult);
				this.map.setLayerIndex(olResult, this.map.getLayerIndex(this.layer)+1);
				this._resultImages.push(olResult);
			} else {
				OpenLayers.Console.log("...skip adding because it's not OpenLayers.Feature.Vector or OpenLayers.Layer.Image...");
			}
		}
		//OpenLayers.Console.debug("...addResults end...");
	},
	
	/**
     * APIMethod: cleanupResults
     *   remove results from map and destroy them
     */
	cleanupResults: function() {		
		this.hideResults();				
		//OpenLayers.Console.debug("...cleanupResults start...");
		// cleanup feature results
		if(this._resultFeatures && this._resultFeatures.length > 0) {
			for(var i=0; i<this._resultFeatures.length; i++) {
				this._resultFeatures[i].destroy();
			}
		}
		this._resultFeatures.length = 0;
		// cleanup image 
		if(this._resultImages && this._resultImages.length > 0) {
			for(var i=0; i<this._resultImages.length; i++) {			
				this.map.removeLayer(this._resultImages[i]);
				//this._resultImages[i].destroy();
			}
		}
		this._resultImages.length = 0;
		//OpenLayers.Console.debug("...cleanupResults end...");
	},
	
	/**
     * APIMethod: hideResults 
     *   remove results from map
     * 
     */
	hideResults: function() {		
		//OpenLayers.Console.debug("...hideResults...");
		// hide feature results
		if(this._resultFeatures && this._resultFeatures.length > 0) {
			this.layer.removeFeatures(this._resultFeatures);
		}
		// hide image results
		if(this._resultImages && this._resultImages.length > 0) {
			for(var i=0; i<this._resultImages.length; i++) {
				this._resultImages[i].setVisibility(false);
			}
		}
	},
	
	/**
     * APIMethod: showResults
     *   draw results on map
     * 
     */
	showResults: function() {
		//OpenLayers.Console.debug("...showResults...");		
		// show feature results
		if(this._resultFeatures && this._resultFeatures.length > 0) {
			this.layer.addFeatures(this._resultFeatures);
		}
		// show image results
		if(this._resultImages && this._resultImages.length > 0) {
			for(var i=0; i<this._resultImages.length; i++) {				
				this._resultImages[i].setVisibility(true);
			}
		}
	},

	/**
     * APIMethod: switchMode 
     *   To switch mode between 'select' and 'draw'
     *   
     * Parameters: 
     *   {boolean} - mode
     */
    switchMode: function(mode) {
    	var wasActive = this.active; 
    	if(this.active === true) {
    		this.deactivate();
    	}    	
    	if(this.mode === "select") {
    		this.selectControl.unselectAll();
    	}
    	if(mode === "select" || mode === "draw") { // user can only set mode to 'select' or 'draw'
    		this.mode = mode;
    	}  	    	    
    	if(wasActive === true) {
    		this.activate();
    	}    
		OpenLayers.Console.log("...control mode switched...current control mode: " + this.mode + "...");	
    },
	
	/**
     * APIMethod: switchDrawCtrlHandler 
     *   To switch between geometry handler of this.drawControl
     *   
     * Parameters: 
     *   (OpenLayer.Handler.*) - object
     */
	switchDrawCtrlHandler: function(handler) {
		var wasActive = this.active; 
		if(this.active === true) {
    		this.deactivate();
    	}
		if(this.mode === "select") {
    		this.selectControl.unselectAll();
    	} 
		this.drawControl.handler = new handler(this.drawControl, this.drawControl.callbacks, this.drawControl.handlerOptions);		
		this.drawCtrlHandler = this.drawControl.handler; 
		if(wasActive === true) {
    		this.activate();
    	}
		OpenLayers.Console.log("...DrawCtrlHandler switched...current DrawCtrlHandler: " + this.drawCtrlHandler.CLASS_NAME + "...");
	},
	
	/**
     * Method: setMap
     *   Set the map property for the control and all handlers.
     *
     * Parameters:
     *   map - {OpenLayers.Map} The control's map.
     */
    setMap: function(map) {
		// hook layer to map
		if(!this.layer.map || !(this.layer.map instanceof OpenLayers.Map)) {
			map.addLayer(this.layer);
		}
		// hook selectControl to map		
        this.selectControl.setMap(map);
		// hook drawControl to map
        this.drawControl.setMap(map);
		// set 'defaultEncodeWkid' to map's projection, so that OpenLayers.Format.AgsJsAdapter can encode/parse
		//   OpenLayers features and ESRI features back and forth correctly
		OpenLayers.Util.extend(
			this.adapter.config, 
			{'defaultEncodeWkid': this.layer.map['projection']}
		);		
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
		OpenLayers.Console.debug("...current control mode: " + this.mode + "...");
		OpenLayers.Console.debug("...current DrawCtrlHandler: " + this.drawCtrlHandler.prototype.CLASS_NAME + "...");
		OpenLayers.Console.log("...adapter defaultEncodeWkid: " + this.adapter.config.defaultEncodeWkid + "...");
    },
	
	/**
	 * InternalAPI: _createCallbacks
	 * 
	 * Parameters:
	 *   context - {Object} object
	 *   methods - {Array of functions} array
	 *   options - {Object} object
	 */
	_createCallbacks: function(context, methods, options) {        
		return dojo.hitch(
			this,
			function(response) {
				var method = null;
				for(var i=0; i<methods.length; i++) {
					method = methods[i];
					if(typeof method == "function") {
						// hard code an 'inputs' options to append multiple input parameters for the original callback
						options['args_list'] = arguments;
						method.apply(context, [response, options]);	
					}						
				}				
			}
		);				
    },

	CLASS_NAME: "OpenLayers.Control.AgsControl"
});