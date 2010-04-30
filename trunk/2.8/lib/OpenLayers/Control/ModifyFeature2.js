/* Copyright (c) 2006 MetaCarta, Inc., published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt 
 * for the full text of the license. */


/**
 * @requires OpenLayers/Control/DragFeature.js
 * @requires OpenLayers/Control/SelectFeature.js
 * @requires OpenLayers/Handler/Keyboard.js
 */

/**
 * Class: OpenLayers.Control.ModifyFeature2
 * Control to modify features.  When activated, a click renders the vertices
 *     of a feature - these vertices can then be dragged.  By default, the
 *     delete key will delete the vertex under the mouse.  New features are
 *     added by dragging "virtual vertices" between vertices.  Create a new
 *     control with the <OpenLayers.Control.ModifyFeature> constructor.
 *
 * Inherits From:
 *  - <OpenLayers.Control.ModifyFeature2>
 */
OpenLayers.Control.ModifyFeature2 = OpenLayers.Class(OpenLayers.Control.ModifyFeature, {
	
	/**
	 * 
	 */
	deleteFeatureCodes: null,
	
    /**
     * 
     * @param {Object} layer
     * @param {Object} options
     */
	initialize: function(layer, options) {
		OpenLayers.Control.ModifyFeature.prototype.initialize.apply(this, [layer, options]);
		// press lowercase 'q' to delete the feature by default
		this.deleteFeatureCodes = [81]; 		
		this.layer.events.on({
			'transactionsucceeded': function() {
										this.deactivate();
										this.activate();										
									},
			'transactionfailed': function() {
										this.deactivate();
										this.activate();
									},
			scope: this	
		});		
	},
	
	/**
     * Method: selectFeature
     * Called when the select feature control selects a feature.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} the selected feature.
     */
    selectFeature: function(feature) {
        this.feature = feature;       
		if(feature.lockId && feature.lockId != "") {    		
	   		if (this.mode == OpenLayers.Control.ModifyFeature.DELETE) { // DELETE mode
				// TODO: press 'ctrl + d' to delete selected feature or explicitly call this.deleteFeature()
				OpenLayers.Console.log("...feature is locked...control in DELETE mode...it can only be deleted...");
			} else {
				this.resetVertices();
	   			this.dragControl.activate();
				this.onModificationStart(this.feature);	
				OpenLayers.Console.log("...feature is locked...so it can be modified...");
			}				            
		} else {
	    	OpenLayers.Console.log("...feature is not locked...so it can not be modified/deleted...");
	    }
    },
	
	/**
     * Method: dragStart
     * Called by the drag feature control with before a feature is dragged.
     *     This method is used to differentiate between points and vertices
     *     of higher order geometries.  This respects the <geometryTypes>
     *     property and forces a select of points when the drag control is
     *     already active (and stops events from propagating to the select
     *     control).
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} The point or vertex about to be
     *     dragged.
     * pixel - {<OpenLayers.Pixel>} Pixel location of the mouse event.
     */
    dragStart: function(feature, pixel) {
        // only change behavior if the feature is not in the vertices array
        if(feature != this.feature && !feature.geometry.parent &&
           feature != this.dragHandle && feature != this.radiusHandle) {
            if(this.feature) {
                // unselect the currently selected feature
                this.selectControl.clickFeature.apply(this.selectControl,
                                                      [this.feature]);
            }
            // check any constraints on the geometry type
            if(this.geometryTypes == null ||
               OpenLayers.Util.indexOf(this.geometryTypes,
                                       feature.geometry.CLASS_NAME) != -1) {
                
				if(feature.lockId && feature.lockId != "") {
					// select the point
					// if feature is locked then dragControl is activated already, mousedown event won't reach selectControl 
                	// so manually call this.selectControl.clickFeature() to select feature
                	// otherwise don't call it because dragControl is activated so selectControl itself will call clickFeature
	                this.selectControl.clickFeature.apply(this.selectControl,
	                                                      [feature]);
					OpenLayers.Console.log("...feature is locked...drag start...");
	                /**
	                 * TBD: These lines improve workflow by letting the user
	                 *     immediately start dragging after the mouse down.
	                 *     However, it is very ugly to be messing with controls
	                 *     and their handlers in this way.  I'd like a better
	                 *     solution if the workflow change is necessary.
	                 */
	                // prepare the point for dragging
	                this.dragControl.overFeature.apply(this.dragControl,
	                                                   [feature]);
	                this.dragControl.lastPixel = pixel;
	                this.dragControl.handlers.drag.started = true;
	                this.dragControl.handlers.drag.start = pixel;
	                this.dragControl.handlers.drag.last = pixel;
				} else {
					// if feature is not locked then dragControl is not activated yet
                	// so don't call this.selectControl.clickFeature() because mousedown event can reach selectControl
                	OpenLayers.Console.log("...feature is not locked...drag not start...");
				}
            }
        }
    },
	
	/**
     * Method: handleKeypress
     * Called by the feature handler on keypress.  This is used to delete
     *     vertices. If the <deleteCode> property is set, vertices will
     *     be deleted when a feature is selected for modification and
     *     the mouse is over a vertex.
     *
     * Parameters:
     * {Integer} Key code corresponding to the keypress event.
     */
    handleKeypress: function(evt) {
        var code = evt.keyCode;
        
		if(this.mode == OpenLayers.Control.ModifyFeature2.DELETE) {
			if(this.feature &&
	           OpenLayers.Util.indexOf(this.deleteFeatureCodes, code) != -1) {
				if(this.feature.lockId && this.feature.lockId != "") {
					// delete feature at client and change state to "DELETE"				
					this.feature.state = OpenLayers.State.DELETE;
					this.layer.eraseFeatures([this.feature]);
					// remove feature from this.layer.selectedFeatures to avoid feature being drawn again					
					/*
					 * TODO: there seems to be a bug that if one feature is deleted but committed yet
					 * 		 deleting another feature will cause the previous deleted feature being drawn on map  
					 */
					if(OpenLayers.Util.indexOf(this.layer.selectedFeatures, this.feature) != -1) {
						OpenLayers.Util.removeItem(this.layer.selectedFeatures, this.feature);						
					}					
					console.log("...delete feature at client side...");
					this.layer.events.triggerEvent("featuremodified", 
                                       {feature: this.feature});
				} else {
					console.log("...can not delete feature...feature must be locked first...");
				}
			} 
		} else {
			// check for delete key
	        if(this.feature &&
	           OpenLayers.Util.indexOf(this.deleteCodes, code) != -1) {
	            var vertex = this.dragControl.feature;
	            if(vertex &&
	               OpenLayers.Util.indexOf(this.vertices, vertex) != -1 &&
	               !this.dragControl.handlers.drag.dragging &&
	               vertex.geometry.parent) {
	                // remove the vertex
	                vertex.geometry.parent.removeComponent(vertex.geometry);
	                this.layer.drawFeature(this.feature,
	                                       this.selectControl.renderIntent);
	                this.resetVertices();
	                this.setFeatureState();
	                this.onModification(this.feature);
	                this.layer.events.triggerEvent("featuremodified", 
	                                               {feature: this.feature});
	            }
	        }
		}
    },

    CLASS_NAME: "OpenLayers.Control.ModifyFeature2"
});

OpenLayers.Control.ModifyFeature2.RESHAPE = 1;
OpenLayers.Control.ModifyFeature2.RESIZE = 2;
OpenLayers.Control.ModifyFeature2.ROTATE = 4;
OpenLayers.Control.ModifyFeature2.DRAG = 8;
OpenLayers.Control.ModifyFeature2.DELETE = 16;

