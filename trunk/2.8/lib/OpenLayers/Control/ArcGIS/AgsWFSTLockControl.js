/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Control/Button.js
 */

/**
 * Class: OpenLayers.Control.AgsWFSTLockControl
 * 
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.AgsWFSTLockControl = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: type
     * {String} Note that this control is not intended to be added directly
     *     to a control panel.
     */
    type: OpenLayers.Control.TYPE_TOGGLE,
    
    /**
     * 
     */
    layer: null,
    
    /**
     * 
     */
    lockStrategy: null,
    
    /**
     * API attribute 
     * {<OpenLayers.Control>}
     */
    lock: null,
    
    /**
     * 
     */
    lockOptions: null,
    
    /**
     * API attribute
     * {<OpenLayers.Control>}
     */
    unlock: null,
    
    /**
     * 
     */
    unlockOptions: null,
    
    /**
     * Constructor: OpenLayers.Control.AgsWFSTLockControl
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(layer, options) {
		OpenLayers.Control.prototype.initialize.apply(this, [options]);
		
		// TODO: check if layer has lock strategy, if no, throw exception
		if(layer instanceof OpenLayers.Layer.Vector) {     					
     		for(var i=0; i<layer.strategies.length; i++) {
     			if(layer.strategies[i] instanceof OpenLayers.Strategy.Lock) {
     				this.layer = layer;
     				this.lockStrategy = layer.strategies[i];
     			} 
     		}			     		     	
     	} else {			
     		// TODO: throw exception
     		OpenLayers.Console.error("...lock control error...");
     	}
		
		if(this.layer && this.lockStrategy) {
			
			var lockOptions = {
	            trigger: OpenLayers.Function.bind(this.lockTrigger, this)	            
	        };
	        OpenLayers.Util.extend(lockOptions, this.lockOptions);
	        this.lock = new OpenLayers.Control.Button(lockOptions);
	        
	        var unlockOptions = {
	            trigger: OpenLayers.Function.bind(this.unlockTrigger, this)	            
	        };
	        OpenLayers.Util.extend(unlockOptions, this.unlockOptions);
	        this.unlock = new OpenLayers.Control.Button(unlockOptions);	       	       
	        
	        var toggleButtonFunc = OpenLayers.Util.AgsUtil.bindFunction(
        		function(evt) {
		        	// TODO: improve the button toggle logic 
        			//   #1: lock and unlock button not correctly enabled/disabled when other features are still selected
        			var feature = evt.feature;
		        	if(this.lockStrategy.isFeatureLocked(feature)) {							        		
		        		this.lock.deactivate();
		        		this.unlock.activate();
		        	} else {
		        		this.lock.activate();
		        		this.unlock.deactivate();
		        	}	        	
			   },
		       this
	        );
	        
	        var disableButtonFunc = OpenLayers.Util.AgsUtil.bindFunction(
        		function(evt) {
        			this.lock.deactivate();
	        		this.unlock.deactivate();        	
			   },
		       this
	        );
	        
	        this.layer.events.on({
				"featureselected": toggleButtonFunc,
		    	"featureunselected": disableButtonFunc,
		    	"afterfeatureslocked": disableButtonFunc,
		    	"afterfeaturesunlocked": disableButtonFunc
			});
	        
		} else {
			// TODO: throw exception
			OpenLayers.Console.error("...lock control error...");
		}		
	},
	
	/**
	 * 
	 */
	destroy: function() {
		OpenLayers.Control.prototype.destroy.apply(this);
		this.lock.destroy();
		this.unlock.destroy();
		this.deactivate();
	},
	
	/** 
     * Method: setMap
     * Set the map property for the control and <previous> and <next> child
     *     controls.
     *
     * Parameters:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {
        this.map = map;        
    },
    
    /**
     * Method: draw
     * Called when the control is added to the map.
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        this.lock.draw();
        this.unlock.draw();        
    },
    
    /**
     * 
     */
    activate: function() {
    	return OpenLayers.Control.prototype.activate.apply(this);
    },
    
    /**
     * 
     */
    deactivate: function() {
    	return OpenLayers.Control.prototype.deactivate.apply(this);
    },
	
	/**
	 * 
	 */
	lockTrigger: function() {		
		if(this.layer.selectedFeatures.length > 0) {
			this.lockStrategy.lockFeatures(this.layer.selectedFeatures);
		}
	},
	
	/**
	 * 
	 */
	unlockTrigger: function() {
		this.lockStrategy.unlockAllFeatures();		
	},
	
    CLASS_NAME: "OpenLayers.Control.AgsWFSTLockControl"    	
});