/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Strategy.js
 */

/**
 * Class: OpenLayers.Strategy.Lock
 * A simple strategy that deal with lock/unlock features and make sure feature are locked before modified
 *     
 *
 * Inherits from:
 *  - <OpenLayers.Strategy>
 */
OpenLayers.Strategy.Lock = OpenLayers.Class(OpenLayers.Strategy, {
    
    /**
     * Property: response
     * {<OpenLayers.Protocol.Response>} The protocol response object returned
     *      by the layer protocol.
     */
    response: null,

    /**
     * 
     */
    lockedFeatures: [],
    
    /**
     * 
     */
    _styleMap: null,
    
    /**
     * Constructor: OpenLayers.Strategy.Lock
     * Create a new Lock strategy.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     */
    initialize: function(options) {
        OpenLayers.Strategy.prototype.initialize.apply(this, [options]);        
    },
    
    /**
     * Method: activate
     * TODO: doc
     * 
     * Returns:
     * {Boolean} The strategy was successfully activated.
     */
    activate: function() {
        /**
         * check if vector layer protocol supports necessary interfaces for Lock strategy
         * 
         * necessary protocol interfaces:
         * 		'readWithLock' read features from server and lock them at the same time 		
         * 		'unlock' unlock features that were locked on server 
         */
    	var canReadWithLock = (typeof this.layer.protocol.readWithLock == "function") ? true : false;
    	var canUnLock = (typeof this.layer.protocol.unlock == "function") ? true : false;
    	if(!this.layer.protocol || canReadWithLock == false || canUnLock == false) {
    		OpenLayers.Console.error("...can not activate Lock strategy...vector layer protocol does not support readWithLock or unlock interfaces...");
    		return false;
    	}
    	// call activate on parent class 
    	var activated = OpenLayers.Strategy.prototype.activate.call(this);
        if(activated) {
            // add two more event related to lock\unlock features
        	this.layer.events.addEventType("afterfeatureslocked");
        	this.layer.events.addEventType("afterfeaturesunlocked");
        	
        	// add getFeatureByFid() function to vector layer
        	// TODO: move this method to vector layer
        	this.layer.getFeatureByFid = OpenLayers.Function.bind(
    			function(fid) {
            		var feature = null;
                    for(var i=0, len=this.features.length; i<len; ++i) {
                        if(this.features[i].fid && this.features[i].fid == fid) {
                            feature = this.features[i];
                            break;
                        }
                    }
                    return feature;
            	},
            	this.layer
        	);   
        	
        	// add getSelectedFeatureByFid function to vector layer
        	// TODO: move this method to vector layer
        	this.layer.getSelectedFeatureByFid = OpenLayers.Function.bind(
    			function(fid) {
            		var feature = null;
                    for(var i=0, len=this.selectedFeatures.length; i<len; ++i) {
                        if(this.selectedFeatures[i].fid && this.selectedFeatures[i].fid == fid) {
                            feature = this.selectedFeatures[i];
                            break;
                        }
                    }
                    return feature;
            	},
            	this.layer
        	);      
        	
        	// register listener on following layer events
        	this.layer.events.on({  
        		"beforefeatureselected": this.synchronizeFeaturesStyle,
        		"featureselected": this.synchronizeFeaturesStyle,
        		"featureunselected": this.synchronizeFeaturesStyle,
        		"afterfeatureslocked": this.synchronizeFeatures,
                "afterfeaturesunlocked": this.synchronizeFeatures,
                scope: this
            });
        	
        	// initialize styles for locked/unlocked features
        	this._styleMap = this.layer.styleMap || new OpenLayers.StyleMap();         	
        	this._defaultStyle = this._styleMap.styles['default'];
        	this._selectStyle = this._styleMap.styles['select'];        	
        	if(this.options && this.options.styleMap) {
        		this._lockedStyle = this.options.styleMap.styles['locked'] || this._styleMap.styles['temporary'];
        	} else {
				this._lockedStyle = this._styleMap.styles['temporary'];
			}         	
        }
        return activated;
    },
    
    /**
     * Method: deactivate
     * Tear down strategy
     * 
     * Returns:
     * {Boolean} The strategy was successfully deactivated.
     */
    deactivate: function() {
        var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
        if(deactivated) {
        	// remove getFeatureByFid() method from vector layer
        	this.layer.getFeatureByFid = null;        	
        	// TODO: doc        	
        	this.layer.events.un({    
        		"beforefeatureselected": this.synchronizeFeaturesStyle,
        		"featureselected": this.synchronizeFeaturesStyle,
        		"featureunselected": this.synchronizeFeaturesStyle,
                "afterfeatureslocked": this.synchronizeFeatures,
                "afterfeaturesunlocked": this.synchronizeFeatures,
                scope: this
            });
        	// remove internal styles
        	this._styleMap = null;
        	this._defaultStyle = null;
        	this._selectStyle = null;
        	this._lockedStyle = null;        	
        }
        return deactivated;
    },
    
    /**
     * Method: isFeatureLocked
     * 
     * Return: {boolean} - if input feature has a 'lockId' or not 
     */
    isFeatureLocked: function(/* OpenLayers.Feature.Vector */feature) {    	
    	if(feature.lockId && feature.lockId !== "") {
    		OpenLayers.Console.log("...feature: " + feature.fid + "...is locked with lockId: " + feature.lockId + "...");
        	return true;
    	} else {
    		OpenLayers.Console.log("...feature: " + feature.fid + "...is not locked...");
    		return false;
    	}    	
    },
    
    /**
     * Method: lockFeatures
     * 
     * lock features at server-side 
     *   and read/synchronize locked feature at client-side
     */
    lockFeatures: function(/* [OpenLayers.Feature.Vector] */features) {
    	if(this.active == true) {
	    	// create 'FeatureId' or 'BBOX' filter
	    	var featureIdfilter = this.createFeatureIdFilter(features);
	    	//var filter = this.createBBOXFilter(bounds);
	        
	    	if(this.response && this.response.priv && typeof this.response.priv.abort == "function") {
	            this.response.priv.abort();
	        }        
	        // call readWithLock() from WFST2 protocol
	        this.response = this.layer.protocol.readWithLock({
	            filter: featureIdfilter,
	            callback: this.onFeaturesLocked,
	            scope: this
	        });
    	} else {
    		OpenLayers.Console.error("...can not call lockFeatures...Lock strategy is not activated...");
    		throw "...can not call lockFeatures...Lock strategy is not activated...";
    	}
    },
    
    /**
     * Method: lockFeaturesWithinExtent
     * 
     * lock features within current visible extent at server-side 
     *   and read/synchronize locked feature at client-side
     */
    lockFeaturesWithinExtent: function(/* [OpenLayers.Feature.Vector] */features) {
    	// TODO: to be implemented
    },
    
    /**
     * Method: unlockFeatures
     * 
     * release locked features at server-side 
     *   and synchronize unlocked feature styles at client-side
     */
    unlockFeatures: function(/* [OpenLayers.Feature.Vector] */features) {    	    	             	
    	if(this.active == true) {
	    	if(this.response && this.response.priv && typeof this.response.priv.abort == "function") {
	            this.response.priv.abort();
	        }
	    	// need separate empty 'wfs:Transaction' request for each different lockId
	    	var lockIds = {};
	    	for(var i=0; i<features.length; i++) {
	    		var lockId = features[i].lockId;
	    		if(lockId && lockIds[lockId] == null) {
	    			lockIds[lockId] = lockId;
	    		}
	    	}
	    	for(var key in lockIds) {
		    	// call unlock() on vector layer protocol
		    	this.response = this.layer.protocol.unlock({
			    	lockId: lockIds[key],
			    	callback: this.onFeaturesUnlocked,
			    	scope: this
		    	});
	    	}
    	} else {
    		OpenLayers.Console.error("...can not call unlockFeatures...Lock strategy is not activated...");
    		throw "...can not call unlockFeatures...Lock strategy is not activated...";
    	} 
    },
    
    /**
     * Method: unlockAllFeatures
     * 
     * release all locked features at server-side
     *   and synchronize unlocked feature styles at client-side
     */
    unlockAllFeatures: function() {
    	this.unlockFeatures(this.lockedFeatures);
    },
    
    /**
     * Method: onFeaturesLocked
     * TODO: doc
     *
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object passed
     *      by the protocol.
     */
    onFeaturesLocked: function(response) {
    	if(response.success() && response.features) {
    		for(var i=0; i<response.features.length; i++) {
    			var lockedFeature = response.features[i];
    			if(lockedFeature.lockId && lockedFeature.lockId != "") {    				
    				//OpenLayers.Console.log("...feature " + lockedFeature.fid + " is locked with lockId: " + response.features[i].lockId);    				
    				//OpenLayers.Console.log("...feature id: " + lockedFeature.id);
    				//OpenLayers.Console.log("...add locked features to lockedFeatures array..."); 
    				this.lockedFeatures.push(lockedFeature);
    			}
    		}
    		var evt = {};
        	evt.features = response.features;
        	this.layer.events.triggerEvent("afterfeatureslocked", evt);
    	} else {
    		OpenLayers.Console.log("...lock features failed...");
    		// no event will be triggered beecause no features are locked
    	}
    },
    
    /**
     * Method: onFeaturesUnlocked
     * TODO: doc
     * 
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object passed
     *      by the protocol.
     */
    onFeaturesUnlocked: function(response) {
    	if(response.success()) {
    		OpenLayers.Console.log("...locked features with lockId " + response.lockId + " are unlocked...");
    		var evt = {
	    		lockId: response.lockId	
	    	};    	
	    	this.layer.events.triggerEvent("afterfeaturesunlocked", evt);
	    	// TODO: synchronize features with server
	    	this.layer.events.triggerEvent("refresh", {force:true}); // force a refresh on map to synchronize unlocked features
    	} else {
    		OpenLayers.Console.log("...unlock features with lockId " + response.lockId + " failed...");
    	}
    },
    
    /**
     * Method: synchronizeFeatures
     * 
     * synchronize locked/unlocked features at client-side
     *   add/remove 'lockId', update feature style, update this.lockedFeatures array
     */
    synchronizeFeatures: function(evt) {    	
    	//OpenLayers.Console.log(evt.type);
    	switch(evt.type) {    		
    		case "afterfeatureslocked":
    			// use feature.fid to synchronize features between layer and this.lockedFeatures    		        		   		
        		for(var i=0; i<this.lockedFeatures.length; i++) {
            		var fid = this.lockedFeatures[i].fid;
            		var lockedFeature = this.layer.getFeatureByFid(fid);
            		if(lockedFeature) {
            			// erase/destroy original feature (that locked) from layer
            			this.layer.eraseFeatures([lockedFeature]);
            			this.layer.removeFeatures([lockedFeature], {slient:false});            			            			
            			// clone locked feature
                		var clonedFeature = this.lockedFeatures[i].clone();            			
                		// 'fid', 'lockId', and 'style' have to be cloned manually
                		clonedFeature.fid = this.lockedFeatures[i].fid;
                		clonedFeature.lockId = this.lockedFeatures[i].lockId;                   		
                		clonedFeature.style = this._lockedStyle.createSymbolizer(clonedFeature);
                		// add/redraw locked feature to layer
            			this.layer.addFeatures([clonedFeature], {slient:false});            			
            			//OpenLayers.Console.log("...redraw locked feature in layer with locked style...");            			        			            		
            		}
            	}
        		OpenLayers.Console.log("...total features number: " + this.layer.features.length 
        			+ "...locked features number: " + this.lockedFeatures.length
        			+ "...selected features number: " + this.layer.selectedFeatures.length);
    			break;
    		case "afterfeaturesunlocked":
    			// use feature.fid to synchronize features between layer and this.lockedFeatures    	       		
        		var __featuresStillLocked = [];
        		for(var i=0; i<this.lockedFeatures.length; i++) {    			
        			var lockId = this.lockedFeatures[i].lockId;    			
        			var fid = this.lockedFeatures[i].fid;
        			if(lockId == evt.lockId) {
        				var unlockedFeature = this.layer.getFeatureByFid(fid);
        				// remove 'locked' style 
        				unlockedFeature.style = null;
        				// remove 'lockId'
        				unlockedFeature.lockId = null;
        				if(this.layer.getSelectedFeatureByFid(fid)) {        					
        					this.layer.drawFeature(unlockedFeature, this._selectStyle.createSymbolizer(unlockedFeature));        					
        				} else {
        					this.layer.drawFeature(unlockedFeature, this._defaultStyle.createSymbolizer(unlockedFeature));
        				}        				          			
        			} else {
        				// filter out unlocked features
        				__featuresStillLocked.push(this.lockedFeatures[i]);
        			}    			
        		}    		
        		//OpenLayers.Console.log("...remove unlocked features from lockedFeatures array...");
        		this.lockedFeatures = null;
        		this.lockedFeatures = __featuresStillLocked;
        		OpenLayers.Console.log("...total features number: " + this.layer.features.length 
            			+ "...locked features number: " + this.lockedFeatures.length
            			+ "...selected features number: " + this.layer.selectedFeatures.length);        		
    			break;
    		default:
    			break;
    	}
    },
    
    /**
     * Method: synchronizeFeaturesStyle
     * 
     */
    synchronizeFeaturesStyle: function(evt) {
    	//OpenLayers.Console.log(evt.type);
    	switch(evt.type) {			
    		// before feature is selected set 'style' to null so that feature will rendered in 'select' style
    		case "beforefeatureselected":
				if(evt.feature.lockId && evt.feature.lockId != "") {        					
					//OpenLayers.Console.log("...set locked feature 'style' to null...");
					evt.feature.style = null;
				}
				break;
			// after feature is selected  set 'style' back to 'locked' style so that feature will rendered in 'locked' style when refreshed
			case "featureselected":
				if(evt.feature.lockId && evt.feature.lockId != "") {        					
					//OpenLayers.Console.log("...set locked feature 'style' back to 'locked'...");
					evt.feature.style = this._lockedStyle.createSymbolizer(evt.feature);
				}
				break;
			default:
				//this.isFeatureLocked(evt.feature);
				break;
    	}
    },

    /****************************************************************************************
     * utility methods for OpenLayers.Strategy.Lock
     ****************************************************************************************/
    
    /**
     * Method: createFeatureIdFilter
     *
     * Returns
     * {<OpenLayers.Filter>} The filter object.
     */
    createFeatureIdFilter: function(features) {
        var fids = [];
        for(var i=0; i<features.length; i++) {
        	if(features[i].fid) {
        		fids.push(features[i].fid);
        	}
        }
    	var filter = new OpenLayers.Filter.FeatureId({
            fids: fids
        });        
        return filter;
    },
    
    /**
     * Method: createBBOXFilter
     *
     * Returns
     * {<OpenLayers.Filter>} The filter object.
     */
    createBBOXFilter: function(bounds) {
        // TODO: to be implemented
    },
    
    /**
     * Method: setStyleMap
     */
    setStyleMap: function(styleMap) {
    	if(styleMap) {
    		this._defaultStyle = styleMap.styles['default'] || this._defaultStyle;
    		this._selectStyle = styleMap.styles['select'] || this._selectStyle;
    		this._lockedStyle = styleMap.styles['locked'] || this._lockedStyle;
    	}
    },
    
    CLASS_NAME: "OpenLayers.Strategy.Lock" 
});
