import { BaseControl } from 'mdk-core/controls/BaseControl';
import { MyWebViewNative } from './MyWebViewNativePlugin/MyWebViewNative'

export class MyWebViewNativeClass extends BaseControl {
    private _webViewNative: MyWebViewNative;
    private _minVal: number = 0;
    private _maxVal: number = 10000;

    public initialize(props) {
        super.initialize(props);

        //Create the Slider plugin control
        this.createSlider();
        //Assign the slider's native view as the main view of this extension
        this.setView(this._webViewNative.getView());
    }

    private createSlider() {
        //Create MyWebViewNative and initialize its native view
        this._webViewNative = new MyWebViewNative(this.androidContext());
        this._webViewNative.initNativeView();

        //Set the slider's properties if "ExtensionProperties" is defined
        let extProps = this.definition().data.ExtensionProperties;
        if (extProps) {
            //In here you will use ValueResolver to resolve binding/rules for the properties
            // This will allow the app to use binding/rules to set the properties' value

            // Resolve title's value
            this.valueResolver().resolveValue(extProps.Url, this.context, true).then(function (url) {
                this._webViewNative.setText(url);
            }.bind(this));

        }

        //Set up listener for MyWebViewNative's OnSliderValueChanged event that will be triggered when user let of the slider's handle
        // It's eventData object contain a property 'value' that will contain the value of the slider
        //this._webViewNative.on("OnSliderValueChanged", function (eventData) {
            //We will call the setValue
            //this.setValue(eventData.value, true, false);
        //}.bind(this));
    }

    // Override
    protected createObservable() {
        let extProps = this.definition().data.ExtensionProperties;
        //Pass ExtensionProperties.OnValueChange to BaseControl's OnValueChange
        if (extProps && extProps.OnValueChange) {
            this.definition().data.OnValueChange = extProps.OnValueChange;
        }
        return super.createObservable();
    }

    public viewIsNative() {
        return true;
    }
}    