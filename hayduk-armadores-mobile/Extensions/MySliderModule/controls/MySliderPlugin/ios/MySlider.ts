import { View } from '@nativescript/core/ui/core/view';

/*
  This is a way to keep iOS and Android implementation of your extension separate
  You will encapsulate the MySlider class definition inside a function called GetMySliderClass
  This is so that the class definition won't be executed when you load this javascript
  via require function.
  The class definition will only be executed when you execute GetMySliderClass
*/
export function GetMySliderClass() {
    /**
     * IMPLEMENT THE IOS VERSION OF YOUR PLUGIN HERE
     */

    // This is a class that handles the native event callbacks
    @NativeClass()
    class SliderHandler extends NSObject {

        //This handler function will be called whenever the slider's value is changed
        // i.e. whenever user drag the slider's handle
        public valueChanged(nativeSlider: UISlider, nativeEvent: _UIEvent) {
            nativeSlider.value = Math.round(nativeSlider.value);
            const owner: MySlider = (<any>nativeSlider).owner;
            if (owner) {
                owner.setValue(nativeSlider.value);
            }
        }

        //This handler function will be called when user let go of the handle
        // This is where you will trigger an event called "OnSliderValueChanged" to the MDK Extension Class
        public afterValueChanged(nativeSlider: UISlider, nativeEvent: _UIEvent) {
            nativeSlider.value = Math.round(nativeSlider.value);
            const owner: MySlider = (<any>nativeSlider).owner;
            if (owner) {
                owner.setValue(nativeSlider.value);
                var eventData = {
                    eventName: "OnSliderValueChanged",
                    object: owner,
                    value: nativeSlider.value
                };
                owner.notify(eventData);
            }
        }

        public static ObjCExposedMethods = {
            "valueChanged": { returns: interop.types.void, params: [interop.types.id, interop.types.id] },
            "afterValueChanged": { returns: interop.types.void, params: [interop.types.id, interop.types.id] }
        };
    }

    const handler = SliderHandler.new();

    class MySlider extends View {
        private _labelStart;
        private _labelEnd;
        private _label;
        private _labelText = "";
        private _currency = "";
        private _slider;
        private _layout;
        private _value = 0;
        private _max = 0;
        private _min = 0;

        private updateText() {
            this._label.setText(this._labelText)
            var percent = (100 * this._value) / this._max;
            if (isNaN(percent)) percent = 0;
            var disponible = this._max - this._value;
            if (disponible < 0) {
                disponible = 0;
            }
            this._labelStart.text = (this.getNumberFormat(this._value) + " " + this._currency + "  (" + this.getNumberFormat(percent) + "%)")
            this._labelEnd.text = (this.getNumberFormat(this._max) + " " + this._currency)
        }


        public constructor(context: any) {
            super();
            this.createNativeView();
        }

        /**
         * Creates new native controls.
         */
        public createNativeView(): Object {
            //Create the Stack view - this is the main view of this extension
            this._layout = UIStackView.new();
            //Configuring the paddings around the stack view
            this._layout.autoresizingMask = [UIViewAutoresizing.FlexibleHeight, UIViewAutoresizing.FlexibleWidth];
            this._layout.layoutMarginsRelativeArrangement = true;
            let inset = new NSDirectionalEdgeInsets();
            inset.top = 8; inset.leading = 16; inset.bottom = 8; inset.trailing = 16;
            this._layout.directionalLayoutMargins = inset;
            // Set the layout stacking to be vertical
            this._layout.axis = UILayoutConstraintAxis.Vertical;

            //Create the label view (START)
            this._labelStart = UILabel.new();
            this._labelStart.font = this._labelStart.font.fontWithSize(15); //Set font size
            this._labelStart.textColor = UIColor.colorWithRedGreenBlueAlpha(106 / 255, 109 / 255, 112 / 255, 1.0); //Set text color
            this._layout.setCustomSpacingAfterView(4, this._labelStart); //Set the bottom margin of label

            //Create the label view (END)
            this._labelEnd = UILabel.new();
            this._labelEnd.font = this._labelEnd.font.fontWithSize(15); //Set font size
            this._labelEnd.textColor = UIColor.colorWithRedGreenBlueAlpha(106 / 255, 109 / 255, 112 / 255, 1.0); //Set text color
            this._layout.setCustomSpacingAfterView(4, this._labelEnd); //Set the bottom margin of label

            //Create the label view
            this._label = UILabel.new();
            this._label.font = this._label.font.fontWithSize(15); //Set font size
            this._label.textColor = UIColor.colorWithRedGreenBlueAlpha(106 / 255, 109 / 255, 112 / 255, 1.0); //Set text color
            this._layout.setCustomSpacingAfterView(4, this._label); //Set the bottom margin of label

            //Create the slider control
            this._slider = UISlider.new();
            //Assign a handler for whenever value changed i.e. when user is dragging the slider handle
            this._slider.addTargetActionForControlEvents(handler, "valueChanged", UIControlEvents.ValueChanged);
            //Assign a handler for when user let go of the handle
            this._slider.addTargetActionForControlEvents(handler, "afterValueChanged", UIControlEvents.TouchUpInside | UIControlEvents.TouchUpOutside);

            //Add the label and slider to the stack view
            this._layout.addArrangedSubview(this._label);
            this._layout.addArrangedSubview(this._labelStart);
            this._layout.addArrangedSubview(this._slider);
            this._layout.addArrangedSubview(this._labelEnd);

            //store the native view
            this.setNativeView(this._layout);

            //return the stack view
            return this._layout;
        }
        /**
         * Initializes properties/listeners of the native view.
         */
        initNativeView(): void {
            // Attach the owner to nativeViews.
            // When nativeViews are tapped you get the owning JS object through this field.
            (<any>this._slider).owner = this;
            (<any>this._layout).owner = this;
            super.initNativeView();
        }

        /**
         * Clean up references to the native view and resets nativeView to its original state.
         * If you have changed nativeView in some other way except through setNative callbacks
         * you have a chance here to revert it back to its original state
         * so that it could be reused later.
         */
        disposeNativeView(): void {
            // Remove reference from native view to this instance.
            (<any>this._slider).owner = null;
            (<any>this._layout).owner = null;

            // If you want to recycle nativeView and have modified the nativeView
            // without using Property or CssProperty (e.g. outside our property system - 'setNative' callbacks)
            // you have to reset it to its initial state here.
        }

        //Must return the native view of the control for MDK FormCell and Section Extension
        public getView(): any {
            return this._layout;
        }

        public setText(newText: string): void {
            if (newText != null && newText != undefined) {
                this._labelText = newText;
                this._label.text = newText;
            }
        }

        public setValue(newVal: number): void {
            if (newVal != null && newVal != undefined) {
                this._value = newVal;
                this.updateText();
                this._slider.value = newVal;
                /*if (this._slider.value < this._min) {
                    this._slider.value = this._min;
                }
                else {
                    this._slider.value = newVal;
                }*/
            }
        }


        public setMinValue(newMin: number): void {
            if (newMin != null && newMin != undefined) {
                this._min = newMin;
                /*if (this._slider.minimumValue < this._min) {
                    this._slider.minimumValue = this._min;
                }*/
                this._slider.minimumValue = newMin;
            }
        }


        public setMaxValue(newMax: number): void {
            if (newMax != null && newMax != undefined) {
                this._max = newMax;
                this._slider.maximumValue = newMax;
            }
        }

        public setCurrency(newText: string): void {
            if (newText != null && newText != undefined) {
                this._currency = newText;
            }
        }

        public setEnabled(bool: boolean): void {
            this._slider.enabled = bool;
        }

        public getNumberFormat(num) {
            num = num / 100;
            return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        }
        
    }

    return MySlider;
}