// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(['sap/m/GenericTile','sap/m/TileContent','sap/m/NumericContent'],function(G,T,N){"use strict";sap.ui.jsview("sap.ushell.components.tiles.cdm.applauncherdynamic.DynamicTile",{getControllerName:function(){return"sap.ushell.components.tiles.cdm.applauncherdynamic.DynamicTile";},createContent:function(c){this.setHeight('100%');this.setWidth('100%');return new G({size:'Auto',header:'{/properties/title}',subheader:'{/properties/subtitle}',tileContent:[new T({size:'Auto',footer:'{/properties/info}',footerColor:{path:"/data/display_info_state",formatter:function(f){if(!sap.m.ValueColor[f]){f=sap.m.ValueColor.Neutral;}return f;}},unit:'{/properties/number_unit}',content:[new N({truncateValueTo:5,scale:'{/properties/number_factor}',value:'{/properties/number_value}',indicator:'{/properties/number_state_arrow}',valueColor:{path:"/data/display_number_state",formatter:function(v){if(!sap.m.ValueColor[v]){v=sap.m.ValueColor.Neutral;}return v;}},icon:'{/properties/icon}',width:'100%'})]})],press:[c.onPress,c]});}});},true);
