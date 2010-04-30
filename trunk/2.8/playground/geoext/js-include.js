(function() {
    
    /**
     * This loader brings in all Styler specific and GeoExt related code.
     * Not included here are OpenLayers and Ext code (or Ext ux).
     */

    var jsfiles = new Array(
        "../../../../geoext/apps/styler2/playground/lib/Styler.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/Util.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/Dispatch.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/SchemaManager.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/SLDManager.js",
		"../../../../geoext/apps/styler2/playground/lib/styler/ColorManager.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/form/ColorField.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/FilterPanel.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/FilterBuilder.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/data/AttributesReader.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/data/AttributesStore.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/form/ComparisonComboBox.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/FeatureRenderer.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/RulePanel.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/ScaleLimitPanel.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/MultiSlider.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/tips/MultiSliderTip.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/tips/SliderTip.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/FillSymbolizer.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/StrokeSymbolizer.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/PointSymbolizer.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/LineSymbolizer.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/PolygonSymbolizer.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/form/FontComboBox.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/TextSymbolizer.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/LegendPanel.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/ScaleSlider.js",
        "../../../../geoext/apps/styler2/playground/lib/styler/widgets/tips/ScaleSliderTip.js",
        "../../../../geoext/apps/styler2/playground/externals/tree/WHO/TristateCheckboxNodeUI.js",
        "../../../../geoext/apps/styler2/playground/externals/tree/WHO/TristateCheckboxNode.js",
        "../../../../geoext/apps/styler2/playground/externals/tree/WHO/LayerNodeUI.js",
        "../../../../geoext/apps/styler2/playground/externals/tree/WHO/LayerNode.js",
        "../../../../geoext/apps/styler2/playground/externals/tree/WHO/LayerContainer.js",
        "../../../../geoext/apps/styler2/playground/externals/tree/WHO/OverlayLayerContainer.js"
        //"../../../../geoext/apps/styler2/playground/externals/core/lib/GeoExt/widgets/map/MapPanel.js"
    );

    var appendable = !(/MSIE/.test(navigator.userAgent) ||
                       /Safari/.test(navigator.userAgent));
    var pieces = new Array(jsfiles.length);

    var element = document.getElementsByTagName("head").length ?
                    document.getElementsByTagName("head")[0] :
                    document.body;
    var script;

    for(var i=0; i<jsfiles.length; i++) {
        if(!appendable) {
            pieces[i] = "<script src='" + jsfiles[i] + "'></script>"; 
        } else {
            script = document.createElement("script");
            script.src = jsfiles[i];
            element.appendChild(script);
        }
    }
    if(!appendable) {
        document.write(pieces.join(""));
    }
})();
