import { BaseControl } from 'mdk-core/controls/BaseControl';
import { MySlider } from './MySliderPlugin/MySlider'

export class MySliderClass extends BaseControl {
    private _slider: MySlider;
    private _minVal: number = 0;
    private _maxVal: number = 0;
    private _value: number = 0;
    private _enabled: boolean = true;

    public initialize(props) {
        super.initialize(props);

        //Create the Slider plugin control
        this.createSlider();
        //Assign the slider's native view as the main view of this extension
        this.setView(this._slider.getView());
    }

    private createSlider() {
        //Create MySlider and initialize its native view
        this._slider = new MySlider(this.androidContext());
        this._slider.initNativeView();

        this._slider.setMinValue(this._minVal);
        this._slider.setMaxValue(this._maxVal);
        //this._slider.setEnabled(this._enabled);

        //Set the slider's properties if "ExtensionProperties" is defined
        let extProps = this.definition().data.ExtensionProperties;
        if (extProps) {
            //In here you will use ValueResolver to resolve binding/rules for the properties
            // This will allow the app to use binding/rules to set the properties' value

            // Resolve Enable
            this.valueResolver().resolveValue(extProps.Enable, this.context, true).then(function (enabled) {
                if (enabled !== null && enabled !== undefined) {
                    this._enabled = enabled;
                }
            }.bind(this));

            // Resolve title's value
            this.valueResolver().resolveValue(extProps.Title, this.context, true).then(function (title) {
                this._slider.setText(title);
            }.bind(this));

            // Resolve currency value
            this.valueResolver().resolveValue(extProps.Currency, this.context, true).then(function (currency) {
                this._slider.setCurrency(currency);
            }.bind(this));

            // Resolve min value
            this.valueResolver().resolveValue(extProps.MinValue, this.context, true).then(function (minVal) {

                if (minVal !== null && minVal !== undefined) {
                    var iMinValue = parseFloat(minVal);
                    if (!isNaN(iMinValue)) {
                        this._minVal = iMinValue;
                        this._slider.setMinValue(this._minVal);
                    }
                }
            }.bind(this));

            // Resolve max value
            this.valueResolver().resolveValue(extProps.MaxValue, this.context, true).then(function (maxVal) {
                if (maxVal !== null && maxVal !== undefined) {
                    var iMaxValue = parseFloat(maxVal);
                    if (!isNaN(iMaxValue)) {
                        this._maxVal = iMaxValue;
                        this._slider.setMaxValue(this._maxVal);
                    }
                }
            }.bind(this));

            // Resolve value
            this.valueResolver().resolveValue(extProps.Value, this.context, true).then(function (value) {
                if (value !== null && value !== undefined) {
                    var iValue = parseFloat(value);
                    if (!isNaN(iValue)) {
                        this._value = iValue;
                        this.setValue(this._value, false, false);
                    }
                }
            }.bind(this));



        }

        //Set up listener for MySlider's OnSliderValueChanged event that will be triggered when user let of the slider's handle
        // It's eventData object contain a property 'value' that will contain the value of the slider
        this._slider.on("OnSliderValueChanged", function (eventData) {
            //We will call the setValue
            if (eventData.value !== null && eventData.value !== undefined) {
                if (this._enabled) {

                    this._value = eventData.value;
                    this.setValue(this._value, true, false);

                } else {
                    this.setValue(this._value, true, false);
                }
            }
        }.bind(this));
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

    public setValue(value: any, notify: boolean, isTextValue?: boolean): Promise<any> {
        //Check the value

        if (value != null && value != undefined && !isNaN(value)) {

            if (typeof value == "string" && value.trim() == "") {
                return Promise.reject("Error: Value is not a number");
            }

            let val = Number.parseFloat(value);
            //Don't let value go lower than permitted minimum or higher than permitted maximum
            val = val < this._minVal ? this._minVal : val;
            val = val > this._maxVal ? this._maxVal : val;

            if (this._slider) {
                //Set the slider's value
                this._value = val;
                this._slider.setValue(this._value);
            }

            return this.observable().setValue(this._value, notify, isTextValue);

            //Store the value. The observable will trigger "OnValueChange" to the MDK app
            // MDK app can register to this event in the metadata with property "OnValueChange"

        } else if (typeof value == "object") {
            let val: any;
            if (this._slider) {
                //Set the slider's value
                val = value.Value;

                this._minVal = value.MinValue;
                this._maxVal = value.MaxValue;
                this._value = val;
                this._slider.setCurrency(value.Currency);
                this._slider.setMinValue(this._minVal);
                this._slider.setMaxValue(this._maxVal);
                this._slider.setValue(this._value);
            }

            return this.observable().setValue(this._value, notify, isTextValue);

        } else if (isNaN(value)) {

            return Promise.reject("Error: Value is not a number");

        }
        return Promise.resolve();
    }


    public viewIsNative() {
        return true;
    }
}