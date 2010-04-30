/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Strategy.js
 * @requires OpenLayers/Strategy/Save.js
 */

/**
 * Class: OpenLayers.Strategy.Save2
 * A strategy that commits modifications to all features upon the <saveWithLock>()
 *     function call.
 *
 * Inherits from:
 *  - <OpenLayers.Strategy.Save2>
 */
OpenLayers.Strategy.Save2 = OpenLayers.Class(OpenLayers.Strategy.Save, {

    /**
     * Constructor: OpenLayers.Strategy.Save2
     * Create a new Save strategy.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     */
    initialize: function(options) {
        OpenLayers.Strategy.Save.prototype.initialize.apply(this, [options]);
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
         * check if vector layer protocol supports necessary interfaces for Save2 strategy
         * 
         * necessary protocol interfaces:
         * 		'commitWithLock' commit modified features to server with a valid lockId 		         
         */
    	var canCommitWithLock = (typeof this.layer.protocol.commitWithLock == "function") ? true : false;
    	if(!this.layer.protocol || canCommitWithLock == false) {
    		OpenLayers.Console.error("...can not activate Save2 strategy...vector layer protocol does not support commitWithLock interface...");
    		return false;
    	}
    	var activated = OpenLayers.Strategy.Save.prototype.activate.call(this);
    	if(activated) {
    		// register listener on following layer events
        	this.layer.events.addEventType("transactionsucceeded");
			this.layer.events.addEventType("transactionfailed");        	
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
        var deactivated = OpenLayers.Strategy.Save.prototype.deactivate.call(this);
        if(deactivated) {
        	// do nothing
        }
        return deactivated;
    },
    
    /**
     * Method: saveWithLock
     */
    saveWithLock: function(features) {    	
		if(this.active == true) {
	    	if(!features){
	            features = this.layer.features;
	        }
	        this.layer.protocol.commitWithLock(features, {
	            callback: this.onSaveWithLock,
	            scope: this
	        });
		} else {
			OpenLayers.Console.error("...can not call saveWithLock...Save2 strategy is not activated...");
			throw "...can not call saveWithLock...Save2 strategy is not activated...";
		}
    },

    /**
     * Method: onSaveWithLock
     * 
     * when modified features have been committed to server, synchronize modified features with server at client-side
     */
    onSaveWithLock: function(response) {
    	// response.reqFeatures contains all updated/inserted/deleted features
    	// response.lockId the common lockId response.reqFeatures have
		// response.insertIds contains fid of all inserted features
    	
    	// if 'releaseAction' is 'ALL', release locked features no matter what
    	if(this.layer.protocol.releaseAction == "ALL") {      		
    		// since releaseAction = 'ALL' releases features at server-side, 
    		//   so just trigger "afterfeaturesunlocked" event on layer
    		var evt = {    			
    			lockId: response.lockId
    		};
    		this.layer.events.triggerEvent("afterfeaturesunlocked", evt);    		
    	} else if(this.layer.protocol.releaseAction == "SOME") {
    		// TODO: difficult if fail to commit some of the features 
    		//   because client-side can not differentiate which feature is released at server-side     		
    	}    	
    	if(response.success()) {
    		OpenLayers.Console.log("...transaction succeeded...");    		    		
    		// synchronize inserted/updated/deleted features
    		var modifiedFeatures = response.reqFeatures;            
            var state;
            var modifiedFeature;
            var toDestroy = [];
            var toSynchronize = [];
            for(var i=0, len=modifiedFeatures.length; i<len; ++i) {
            	modifiedFeature = modifiedFeatures[i];
                state = modifiedFeature.state;
                if(state) {
                    if(state == OpenLayers.State.DELETE) {
                    	toDestroy.push(modifiedFeature);
                    } else if (state == OpenLayers.State.UPDATE) {
                    	toSynchronize.push(modifiedFeature);
                    } else if (state == OpenLayers.State.INSERT) {
                    	// do nothing
                    }
                    modifiedFeature.state = null;
                }
            }
            // delete features which are deleted at server-side from map at client-side
            OpenLayers.Console.log("...synchronize deleted features..." + "...features number: " + toDestroy.length);            
            // if some feature failed to be deleted at server-side, it will be difficult to synchronize at client-side
			//   because client-side has no idea which feaure has been deleted successfully, which were not.
			if(toDestroy.length > 0) {            	
                this.layer.destroyFeatures(toDestroy);
            }
            // to synchronize features
            // newly inserted features should be synchronized
        	
            if(toSynchronize.length > 0 || response.insertIds.length > 0) {
            	// inserted features should be synchronized
				var fids = response.insertIds || [];				
				// updated features should be synchronized
            	for(var i=0; i<toSynchronize.length; i++) {
                	if(toSynchronize[i].fid) {
                		fids.push(toSynchronize[i].fid);
                	}
                }
            	var featureIdFilter = new OpenLayers.Filter.FeatureId({
                    fids: fids
                });        
            	// read insert/updated features from server-side and merge them into layer
            	OpenLayers.Console.log("...synchronize inserted/updated features...features number: " + fids.length);
            	this.layer.protocol.read({
                    filter: featureIdFilter,
                    callback: this.synchronizeFeatures,
                    scope: this
                });
            }
    	} else {
    		OpenLayers.Console.log("...transaction failed...");
			this.layer.events.triggerEvent("transactionfailed", {});
    		// TODO: roll back?
    	}
    },
    
    /**
     * Method: synchronizeFeatures
     */
    synchronizeFeatures: function(response) {
        if(response.success() && response.features) {
        	//OpenLayers.Console.log("...wfs:GetFeture response...");        	
        	var synchronizedFeatures = response.features;
        	var featuresToSyn = [];
        	for(var i=0; i<synchronizedFeatures.length; i++) {
        		var fid = synchronizedFeatures[i].fid; 
        		var featureToSyn = this.layer.getFeatureByFid(fid);
        		// remove this feature from lock strategy's lockedfeature list
        		for(var j=0; j<this.layer.strategies.length; j++) {
        			var strategy = this.layer.strategies[j];
        			if(strategy instanceof OpenLayers.Strategy.Lock) {
        				OpenLayers.Console.debug("...layer has lock strategy...");
        				for(var k=0; k<strategy.lockedFeatures.length; k++) {
        					if(strategy.lockedFeatures[k].fid == featureToSyn.fid) {
        						OpenLayers.Console.debug("...remove commited feature from locked feature list...");
        						OpenLayers.Util.removeItem(strategy.lockedFeatures, strategy.lockedFeatures[k]);
        					}
        				}
        			}
        		}
        		if(featureToSyn) {
        			featuresToSyn.push(featureToSyn);					
        		}
        	}        	
        	this.layer.destroyFeatures(featuresToSyn);        	
        	this.layer.addFeatures(synchronizedFeatures);
        	OpenLayers.Console.log("...inserted/updated features synchronized...features number: " + synchronizedFeatures.length);
        	
        	this.layer.events.triggerEvent("transactionsucceeded", {});
		}
    },
 
    CLASS_NAME: "OpenLayers.Strategy.Save2" 
});
