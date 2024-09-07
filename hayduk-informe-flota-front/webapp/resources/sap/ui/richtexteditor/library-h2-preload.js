/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */
sap.ui.predefine('sap/ui/richtexteditor/library',['jquery.sap.global','sap/ui/core/Core','sap/ui/core/library'],function(q,C,l){"use strict";sap.ui.getCore().initLibrary({name:"sap.ui.richtexteditor",dependencies:["sap.ui.core"],types:["sap.ui.richtexteditor.EditorType"],interfaces:["sap.ui.richtexteditor.IToolbar"],controls:["sap.ui.richtexteditor.RichTextEditor","sap.ui.richtexteditor.ToolbarWrapper"],elements:[],version:"1.54.7"});sap.ui.richtexteditor.EditorType={TinyMCE:"TinyMCE",TinyMCE4:"TinyMCE4"};sap.ui.richtexteditor.EditorCommands={Bold:{icon:"bold-text",command:"Bold",style:"bold",bundleKey:"BOLD_BUTTON_TOOLTIP"},Italic:{icon:"italic-text",command:"Italic",style:"italic",bundleKey:"ITALIC_BUTTON_TOOLTIP"},Underline:{icon:"underline-text",command:"Underline",style:"underline",bundleKey:"UNDERLINE_BUTTON_TOOLTIP"},Strikethrough:{icon:"strikethrough",command:"Strikethrough",style:"strikethrough",bundleKey:"STRIKETHROUGH_BUTTON_TOOLTIP"},Copy:{icon:"copy",command:"Copy",bundleKey:"COPY_BUTTON_TOOLTIP"},Cut:{icon:"scissors",command:"Cut",bundleKey:"CUT_BUTTON_TOOLTIP"},Paste:{icon:"paste",command:"Paste",bundleKey:"PASTE_BUTTON_TOOLTIP"},UnorderedList:{icon:"list",command:"InsertUnorderedList",bundleKey:"UNORDERED_LIST_BUTTON_TOOLTIP"},OrderedList:{icon:"numbered-text",command:"InsertOrderedList",bundleKey:"ORDERED_LIST_BUTTON_TOOLTIP"},Outdent:{icon:"outdent",command:"Outdent",bundleKey:"OUTDENT_BUTTON_TOOLTIP"},Indent:{icon:"indent",command:"Indent",bundleKey:"INDENT_BUTTON_TOOLTIP"},Undo:{icon:"undo",command:"Undo",bundleKey:"UNDO_BUTTON_TOOLTIP"},Redo:{icon:"redo",command:"Redo",bundleKey:"REDO_BUTTON_TOOLTIP"},TextAlign:{Left:{text:"Left",icon:"text-align-left",style:"alignleft",bundleKey:"TEXTALIGH_LEFT"},Center:{text:"Center",icon:"text-align-center",style:"aligncenter",bundleKey:"TEXTALIGH_CENTER"},Right:{text:"Right",icon:"text-align-right",style:"alignright",bundleKey:"TEXTALIGH_RIGHT"},Full:{text:"Full",icon:"text-align-justified",style:"alignjustify",bundleKey:"TEXTALIGH_FULL"},bundleKey:"TEXTALIGN_BUTTON_TOOLTIP"},FontFamily:{AndaleMono:{text:"Andale Mono",commandValue:'"andale mono",monospace'},Arial:{text:"Arial",commandValue:"arial, helvetica, sans-serif"},ArialBlack:{text:"Arial Black",commandValue:'"arial black", sans-serif'},BookAntiqua:{text:"Book Antiqua",commandValue:'"book antiqua", palatino, serif'},ComicSansMS:{text:"Comic Sans MS",commandValue:'"comic sans ms", sans-serif'},CourierNew:{text:"Courier New",commandValue:'"courier new", couriret, monospace'},Georgia:{text:"Georgia",commandValue:"georgia, palatino, serif"},Helvetica:{text:"Helvetica",commandValue:'helvetica, arial, sans-serif'},Impact:{text:"Impact",commandValue:"impact, sans-serif"},Symbol:{text:"Symbol",commandValue:'"symbol"'},Tahoma:{text:"Tahoma",commandValue:"tahoma, arial, helvetica, sans-serif"},Terminal:{text:"Terminal",commandValue:"terminal, monaco, monospace"},TimesNewRoman:{text:"Times New Roman",commandValue:'"times new roman", times, sans-serif'},TrebuchetMS:{text:"Trebuchet MS",commandValue:'"trebuchet ms", geneva, sans-serif'},Verdana:{text:"Verdana",commandValue:"verdana, geneva, sans-serif"},Webdings:{text:"Webdings",commandValue:'"webdings"'},Wingings:{text:"Wingings",commandValue:'wingings, "zapf dingbats"'}},FontSize:[8,10,12,14,18,24,36],TextColor:{icon:"text-color",command:"ForeColor",style:"color",defaultValue:"#000000",bundleKey:"TEXT_COLOR_BUTTON_TOOLTIP"},BackgroundColor:{icon:"color-fill",command:"HiliteColor",style:"background-color",defaultValue:"#ffffff",bundleKey:"BACKGROUND_COLOR_BUTTON_TOOLTIP"},InsertImage:{icon:"picture",bundleKey:"IMAGE_BUTTON_TOOLTIP"},InsertLink:{icon:"chain-link",bundleKey:"LINK_BUTTON_TOOLTIP"},Unlink:{icon:"broken-link",command:"unlink",bundleKey:"UNLINK_BUTTON_TOOLTIP"},InsertTable:{icon:"table-view",bundleKey:"TABLE_BUTTON_TOOLTIP"},FormatBlock:{Paragraph:{text:"Paragraph",commandValue:"p",bundleKey:"PARAGRAPH_BUTTON_TEXT"},Heading1:{text:"Heading 1",commandValue:"h1",bundleKey:"HEADING1_BUTTON_TEXT"},Heading2:{text:"Heading 2",commandValue:"h2",bundleKey:"HEADING2_BUTTON_TEXT"},Heading3:{text:"Heading 3",commandValue:"h3",bundleKey:"HEADING3_BUTTON_TEXT"},Heading4:{text:"Heading 4",commandValue:"h4",bundleKey:"HEADING4_BUTTON_TEXT"},Heading5:{text:"Heading 5",commandValue:"h5",bundleKey:"HEADING5_BUTTON_TEXT"},Heading6:{text:"Heading 6",commandValue:"h6",bundleKey:"HEADING6_BUTTON_TEXT"}}};sap.ui.richtexteditor.Accessibility={FontFamily:"FONT_FAMILY_TEXT",FontSize:"FONT_SIZE_TEXT",FormatBlock:"FORMAT_BUTTON_TOOLTIP"};sap.ui.richtexteditor.ButtonGroups={"font-style":["Bold","Italic","Underline","Strikethrough"],"text-align":["TextAlign"],"formatselect":["FormatBlock"],"font":["FontFamily","FontSize","TextColor","BackgroundColor"],"structure":["UnorderedList","OrderedList","Outdent","Indent"],"link":["InsertLink","Unlink"],"insert":["InsertImage"],"undo":["Undo","Redo"],"clipboard":["Cut","Copy","Paste"],"custom":[]};var s=function(){sap.ui.require(["sap/m/MenuItem","sap/m/Button","sap/m/OverflowToolbarButton","sap/m/OverflowToolbarToggleButton","sap/m/SplitButton","sap/m/MenuButton","sap/m/Menu","sap/m/Select","sap/m/ToolbarSeparator","sap/m/OverflowToolbar","sap/m/OverflowToolbarLayoutData","sap/m/Dialog","sap/m/Label","sap/m/CheckBox","sap/m/Input","sap/m/HBox","sap/m/VBox","sap/m/Text","sap/m/StepInput","sap/ui/core/InvisibleText","sap/m/ColorPalettePopover"],function(m,B,o,O,S,M,c,d,t,e,f,D,L,g,i,h,v,T,j,I,k){sap.ui.richtexteditor.RichTextEditorHelper.bSapMLoaded=true;_.Button=B;_.OverflowToolbarButton=o;_.OverflowToolbarToggleButton=O;_.SplitButton=S;_.MenuButton=M;_.Menu=c;_.Select=d;_.ToolbarSeparator=t;_.OverflowToolbar=e;_.OverflowToolbarLayoutData=f;_.MenuItem=m;_.Dialog=D;_.Label=L;_.CheckBox=g;_.Input=i;_.HBox=h;_.VBox=h;_.Text=T;_.StepInput=j;_.InvisibleText=I;_.ColorPalettePopover=k;});};var _={};var a=function(c,S){if(_[c]){return new _[c](S);}};q.sap.setObject("sap.ui.richtexteditor.RichTextEditorHelper",{bSapMLoaded:false,createOverflowToolbar:function(i,c){return a("OverflowToolbar",{id:i,content:c});},createInvisibleText:function(c){return a("InvisibleText",c);},createButton:function(c){c.type=sap.m.ButtonType.Transparent;return a("Button",c);},createOverflowToolbarButton:function(c){c.type=sap.m.ButtonType.Transparent;return a("OverflowToolbarButton",c);},createSplitButton:function(c){c.type=sap.m.ButtonType.Default;return a("SplitButton",c);},createOverflowToolbarToggleButton:function(c){c.type=sap.m.ButtonType.Transparent;return a("OverflowToolbarToggleButton",c);},createMenuButton:function(i,I,f,c,t){return a("MenuButton",{layoutData:a("OverflowToolbarLayoutData",{priority:sap.m.OverflowToolbarPriority.NeverOverflow}),type:sap.m.ButtonType.Transparent,id:i,menu:a("Menu",{itemSelected:f,items:I}),icon:c,tooltip:t});},createMenuItem:function(i,t,I){return a("MenuItem",{id:i,icon:I,text:t});},createToggleButton:function(c){c.layoutData=a("OverflowToolbarLayoutData",{priority:sap.m.OverflowToolbarPriority.NeverOverflow});c.type=sap.m.ButtonType.Transparent;return a("ToggleButton",c);},createToolbarSeparator:function(){return a("ToolbarSeparator");},createSelect:function(c){return a("Select",c);},createInput:function(c){return a("Input",c);},createLabel:function(c){return a("Label",c);},createCheckBox:function(c){return a("CheckBox",c);},createDialog:function(c){return a("Dialog",c).addStyleClass("sapUiPopupWithPadding");},createText:function(c){return a("Text",c);},createHBox:function(c){return a("HBox",c);},createVBox:function(c){return a("VBox",c);},createStepInput:function(c){return a("StepInput",c);},createColorPalettePopover:function(c){return a("ColorPalettePopover",c);}});if(sap.ui.getCore().getLoadedLibraries()["sap.m"]){s();}else{var b=function(e){var E=e.getParameters();if(E.stereotype==="library"&&E.name==="sap.m"){q.sap.delayedCall(0,null,s);q.sap.delayedCall(0,sap.ui.getCore(),'detachLibraryChanged',[b]);}};sap.ui.getCore().attachLibraryChanged(b);}return sap.ui.richtexteditor;},false);jQuery.sap.registerPreloadedModules({"name":"sap/ui/richtexteditor/library-h2-preload","version":"2.0","modules":{"sap/ui/richtexteditor/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.ui.richtexteditor","type":"library","embeds":[],"applicationVersion":{"version":"1.54.7"},"title":"A rich text editor (RTE) control.","description":"A rich text editor (RTE) control. Requires installation of an additional rich text editor library.","ach":"CA-UI5-CTR-RIL","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":["base","sap_belize","sap_belize_hcb","sap_belize_hcw","sap_belize_plus","sap_bluecrystal","sap_hcb","sap_ux"]},"sap.ui5":{"dependencies":{"minUI5Version":"1.54","libs":{"sap.ui.core":{"minVersion":"1.54.7"}}},"library":{"i18n":"messagebundle.properties","content":{"controls":["sap.ui.richtexteditor.RichTextEditor","sap.ui.richtexteditor.ToolbarWrapper"],"elements":[],"types":["sap.ui.richtexteditor.EditorType"],"interfaces":["sap.ui.richtexteditor.IToolbar"]}}}}'}});
