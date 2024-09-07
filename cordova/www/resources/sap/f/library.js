/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/DataType","sap/ui/Global","sap/ui/core/library","sap/ui/layout/library","sap/m/library"],function(D){"use strict";sap.ui.getCore().initLibrary({name:"sap.f",version:"1.71.23",dependencies:["sap.ui.core","sap.m","sap.ui.layout"],designtime:"sap/f/designtime/library.designtime",interfaces:["sap.f.cards.IHeader","sap.f.ICard","sap.f.IShellBar","sap.f.IDynamicPageStickyContent","sap.f.dnd.IGridDroppable"],types:["sap.f.AvatarImageFitType","sap.f.AvatarShape","sap.f.AvatarSize","sap.f.AvatarType","sap.f.AvatarColor","sap.f.cards.HeaderPosition","sap.f.DynamicPageTitleArea","sap.f.DynamicPageTitleShrinkRatio","sap.f.LayoutType"],controls:["sap.f.Avatar","sap.f.cards.Header","sap.f.cards.NumericHeader","sap.f.cards.NumericSideIndicator","sap.f.Card","sap.f.GridContainer","sap.f.DynamicPage","sap.f.DynamicPageHeader","sap.f.DynamicPageTitle","sap.f.FlexibleColumnLayout","sap.f.semantic.SemanticPage","sap.f.GridList","sap.f.GridListItem","sap.f.ShellBar"],elements:["sap.f.DynamicPageAccessibleLandmarkInfo","sap.f.GridContainerItemLayoutData","sap.f.semantic.AddAction","sap.f.semantic.CloseAction","sap.f.semantic.CopyAction","sap.f.semantic.DeleteAction","sap.f.semantic.DiscussInJamAction","sap.f.semantic.EditAction","sap.f.semantic.ExitFullScreenAction","sap.f.semantic.FavoriteAction","sap.f.semantic.FlagAction","sap.f.semantic.FooterMainAction","sap.f.semantic.FullScreenAction","sap.f.semantic.MainAction","sap.f.semantic.MessagesIndicator","sap.f.semantic.NegativeAction","sap.f.semantic.PositiveAction","sap.f.semantic.PrintAction","sap.f.semantic.SemanticButton","sap.f.semantic.SemanticControl","sap.f.semantic.SemanticToggleButton","sap.f.semantic.SendEmailAction","sap.f.semantic.SendMessageAction","sap.f.semantic.ShareInJamAction","sap.f.semantic.TitleMainAction","sap.f.SearchManager"],extensions:{flChangeHandlers:{"sap.f.Avatar":{"hideControl":"default","unhideControl":"default"},"sap.f.DynamicPageHeader":{"hideControl":"default","unhideControl":"default","moveControls":"default"},"sap.f.DynamicPageTitle":"sap/f/flexibility/DynamicPageTitle","sap.f.semantic.SemanticPage":{"moveControls":"default"}},"sap.ui.support":{publicRules:true,internalRules:true}}});var t=sap.f;t.DynamicPageTitleArea={Begin:"Begin",Middle:"Middle"};t.DynamicPageTitleShrinkRatio=D.createType('sap.f.DynamicPageTitleShrinkRatio',{isValid:function(v){return/^(([0-9]\d*)(\.\d)?:([0-9]\d*)(\.\d)?:([0-9]\d*)(\.\d)?)$/.test(v);}},D.getType('string'));t.LayoutType={OneColumn:"OneColumn",TwoColumnsBeginExpanded:"TwoColumnsBeginExpanded",TwoColumnsMidExpanded:"TwoColumnsMidExpanded",MidColumnFullScreen:"MidColumnFullScreen",ThreeColumnsMidExpanded:"ThreeColumnsMidExpanded",ThreeColumnsEndExpanded:"ThreeColumnsEndExpanded",ThreeColumnsMidExpandedEndHidden:"ThreeColumnsMidExpandedEndHidden",ThreeColumnsBeginExpandedEndHidden:"ThreeColumnsBeginExpandedEndHidden",EndColumnFullScreen:"EndColumnFullScreen"};sap.ui.lazyRequire("sap.f.routing.Router");sap.ui.lazyRequire("sap.f.routing.Target");sap.ui.lazyRequire("sap.f.routing.TargetHandler");sap.ui.lazyRequire("sap.f.routing.Targets");t.AvatarShape={Circle:"Circle",Square:"Square"};t.AvatarSize={XS:"XS",S:"S",M:"M",L:"L",XL:"XL",Custom:"Custom"};t.AvatarType={Icon:"Icon",Image:"Image",Initials:"Initials"};t.AvatarColor={Accent1:"Accent1",Accent2:"Accent2",Accent3:"Accent3",Accent4:"Accent4",Accent5:"Accent5",Accent6:"Accent6",Accent7:"Accent7",Accent8:"Accent8",Accent9:"Accent9",Accent10:"Accent10",Random:"Random"};t.AvatarImageFitType={Cover:"Cover",Contain:"Contain"};t.cards.HeaderPosition={Top:"Top",Bottom:"Bottom"};t.cards.AreaType={None:'None',ContentItem:'ContentItem',Content:'Content',Header:'Header'};return t;});
