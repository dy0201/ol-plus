/*
function initExt() {
	Ext.onReady(extOnReady);
}
*/
function extOnReady() {
	
	//Ext.QuickTips.init();	
	
	/**
		
	 */
	var feature_types = new Array();	
	var first_wfs_featuretype = -1;
	
	for(var i=0; i<map.getNumLayers(); i++) {
		if(map.layers[i].CLASS_NAME == "OpenLayers.Layer.WFS2") {
			if(first_wfs_featuretype < 0) {
				first_wfs_featuretype = i;
			} 
			var feature_type = new Array();
			feature_type[0] = i;
			feature_type[1] = map.layers[i].params.typename.split(":")[1];
			feature_type[2] = map.layers[i].name;
			feature_types.push(feature_type);
		}
	}
	
	if(first_wfs_featuretype >= 0) {
		current_active_featuretype = feature_type[first_wfs_featuretype];
		current_active_featuretype_index = first_wfs_featuretype;
	}
	
    var featuretype_store = new Ext.data.SimpleStore({
    	fields: ['featureTypeIndex', 'featureTypeName'],
    	data: feature_types
	});
	
	var combo = new Ext.form.ComboBox({
        id: 'ext-select-featuretype',
        store: featuretype_store,
        displayField: 'featureTypeName',
        valueField: 'featureTypeName',
        typeAhead: true,
        mode: 'local',
        triggerAction: 'all',
        emptyText: 'Select a feature type...',
        selectOnFocus: true,
        width: 200
    });
    
    combo.addListener('select', onSwitchFeatureType);
    
    /**
		
	 */
	var edit_menu = new Ext.menu.Menu({
        id: 'ext-menu-edit',   
        items: [/*{
             			 text: '<b>Select features</b>',
			             value: 'select',
			             checked: false,
			             group: 'edit-option',
			             handler: onSwitchEditOperation
        		},*/{
			             text: '<b>Insert features</b>',
			             value: 'insert',
			             checked: false,
			             group: 'edit-option',
			             handler: onSwitchEditOperation
        		}, {
			             text: '<b>Update features</b>',
			             value: 'modify',
			             checked: false,
			             group: 'edit-option',
			             handler: onSwitchEditOperation			             
         		}, {
			             text: '<b>Remove features</b>',
			             value: 'remove',
			             checked: false,
			             group: 'edit-option',
			             handler: onSwitchEditOperation
         }]                      
    }); 
    
    var lock_menu = new Ext.menu.Menu({
        id: 'ext-menu-lock',
        items: [{
               			text: '<b>Lock selected features</b>',            				
            			handler: onLockSelectedFeatures
            	}, {
            			text: '<b>Lock features in current extent</b>',
            			handler: onLockFeaturesInCurrentExtent
            	}, {
            			text: '<b>Release all locks</b>',
            			handler: onReleaseAllLocks
        }]
    }); 
	
	var commit_button = new Ext.Toolbar.Button({
		id: 'ext-button-commit',
		text: '<b>Commit</b>',
		handler: onCommit
	});
	
	var select_features_button = new Ext.Toolbar.Button({ 
		id: 'ext-button-select-features',
		text: '<b>Select</b>',
        enableToggle: true,
        toggleHandler: onToggleSelectFeaturesControl,
        pressed: false
	});
	
	var clear_features_button = new Ext.Toolbar.Button({ 
		id: 'ext-button-clear-features',
		text: '<b>Clear</b>',
        handler: onClearSelectedFeatures
	});

	/**
		
	 */
	 	
	var toolbar = new Ext.Toolbar();
    toolbar.render('toolbar');
    
    toolbar.addText('<b>WFS Feature Types: </b>');    
    toolbar.addField(combo);
    toolbar.addSpacer();
    toolbar.addSeparator();
    toolbar.addSpacer();
    toolbar.addButton(select_features_button);
    toolbar.addSpacer();
    toolbar.addButton(clear_features_button);
    toolbar.addSpacer();
    toolbar.addSeparator();
    toolbar.addSpacer();
    
    toolbar.add(    	
    	{
            text:'<b>Edit</b>',
            menu: edit_menu  
        },
        ' ',
        {
        	text:'<b>Lock</b>',
        	menu: lock_menu
        }
    );
    
    toolbar.addSpacer();  
    toolbar.addSeparator();
    toolbar.addSpacer();
    toolbar.addButton(commit_button);
    toolbar.addSpacer();
    toolbar.addSeparator();
    
    /**
     *
     */
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

    var mySource = {};
	var save_attribute_button = new Ext.Toolbar.Button({
		id: 'ext-button-save-attribute',
		text: '<b>Save</b>',
		//disabled: true,
		handler: onSaveFeatureAttribute
	});    
    var grid = new Ext.grid.PropertyGrid({
        id: 'ext-grid-attributes',
        source: mySource,
        autoHeight: false,
        height: 600,
        width: 260,
        title: 'Feature attributes',
        clickToEdit: 2,
        buttons: [save_attribute_button]
    });

    grid.render('attributes');
}

function onToggleSelectFeaturesControl(element) {
	toggleSelectFeaturesControl(element);
}

function onClearSelectedFeatures() {
	clearSelectedFeatures();
}

function onSwitchFeatureType(element) {
	current_active_featuretype = element.value;
	switchFeatureType(element.value);
}

function onSwitchEditOperation(element, checked){    
    var select_button = Ext.getCmp('ext-button-select-features');
   	if(select_button.pressed == true) {
   		select_button.toggle();
   	}
	switchEditOperation(element);
}

function onCommit(element){
	commitChanges();       
}

function onLockSelectedFeatures(element) {
	lockSelectedFeatures();
}

function onLockFeaturesInCurrentExtent(element) {
	lockFeaturesInCurrentExtext();
}

function onReleaseAllLocks(element) {
	releaseLockedFeatures();
}

function onSaveFeatureAttribute(element) {
	//Ext.log("Save attributes of a feature...");
	saveFeatureAttribute();
}
