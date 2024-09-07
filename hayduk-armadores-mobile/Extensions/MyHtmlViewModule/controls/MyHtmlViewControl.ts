import * as app from '@nativescript/core/application';
import { BaseObservable } from 'mdk-core/observables/BaseObservable';
import { Color } from '@nativescript/core/color';
import { IControl } from 'mdk-core/controls/IControl';
import { Label } from "@nativescript/core/ui/label";
import { StackLayout } from "@nativescript/core/ui/layouts/stack-layout";
import { oModel } from './main-model';
import { Page } from '@nativescript/core/ui/page';
import { HtmlView } from '@nativescript/core/ui/html-view';
import { ObservableArray } from "@nativescript/core/data/observable-array";

export class MyHtmlViewClass extends IControl {
    private _model: any;
    private _observable: BaseObservable;
    private _htmlView: any;
    private _targetLabel: any;
    private _StackLayout: any;
    private oRadPieChart: any;
    private oDonutSeries: any;
    private Selectionmode: any;
    private seriesArray: any;

    public initialize(props) {
        super.initialize(props);

        // Initiate saleorder Model    
        //if(!this._model){ this._model = new oModel(); };

        // Stack Layout
        this._StackLayout = new StackLayout();
        //this._StackLayout.backgroundColor = "#f2efe8";

        // Create Label
        this._targetLabel = new Label();
        this._targetLabel.text = "1er";
        //this._StackLayout.addChild(this._targetLabel);


        // Create Pie Chart using External plugin

        // Extension Properties
        let extProps = this.definition().data.ExtensionProperties;
        if (extProps) {
            // Resolve SalesData
            this.valueResolver().resolveValue(extProps.Html, this.context, true).then(function (Html) {
                this._htmlView = new HtmlView();
                this._htmlView.html = Html;
                this._StackLayout.addChild(this._htmlView);
            }.bind(this));
        }
    }

    public view() {
        return this._StackLayout; // Return View
    }

    public viewIsNative() {
        return true;
    }

    // Abstract Method
    public observable() {
        if (!this._observable) {
            this._observable = new BaseObservable(this, this.definition(), this.page());
        }
        return this._observable;

    }

    // Abstract Method
    public setValue(value: any, notify: boolean): Promise<any> {
        return Promise.resolve();
    }

    public setContainer(container: IControl) {
        // do nothing
    }
}