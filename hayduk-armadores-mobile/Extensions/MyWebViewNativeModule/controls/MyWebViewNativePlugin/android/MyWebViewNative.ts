import { Observable } from '@nativescript/core/data/observable';
import { View } from '@nativescript/core/ui/core/view';
import { layout } from '@nativescript/core/ui/core/view';
import { device as Device } from '@nativescript/core/platform';
/*
  This is a way to keep iOS and Android implementation of your extension separate
  We will encapsulate the MyWebViewNative class definition inside a function called GetMyWebViewNativeClass
  This is so that the class definition won't be executed when you load this javascript
  via require function.
  The class definition will only be executed when you execute GetMyWebViewNativeClass
*/
declare var com: any;
declare var android: any;
export function GetMyWebViewNativeClass() {
    /**
     * IMPLEMENT THE ANDROID VERSION OF YOUR PLUGIN HERE
     * In this sample you have 2 controls a label and a seekbar (slider)
     * You extends this control with Observable (View) class so that you can accept listeners
     *  and notify them when UI interaction is triggered
     */
    function getPadding() {
        // Return left & right padding in dp
        // For tablet you want 24dp, for other type you use 16dp
        return Device.deviceType === 'Tablet' ? 24 : 16;
    }

    class MyWebViewNative extends View {
        private _androidcontext;
        private _label;
        private _labelText = "";
        private _seekbar;
        private _layout;
        private _value = 0;
        private _min = 0; //Used to track min for API 25 or lower
        private _webViewNative;
        private _webSettings;
        private updateText() {
            this._label.setText(this._labelText)
        }

        public constructor(context: any) {
            super();
            this._androidcontext = context;
            this.createNativeView();
        }

        /**
         * Creates new native controls.
         */
        public createNativeView(): Object {
            //Create an Android label
            this._label = new android.widget.TextView(this._androidcontext);
            const labelBottomPaddingInPx = layout.round(layout.toDevicePixels(8)); // For top & bottom padding, always 16dp
            this._label.setPadding(0, 0, 0, labelBottomPaddingInPx);
            this._label.setLayoutParams(new android.view.ViewGroup.LayoutParams(-1, -2));

            //Create an Android seekbar
            //this._seekbar = new android.widget.SeekBar(this._androidcontext);
            //this._seekbar.setLayoutParams(new android.view.ViewGroup.LayoutParams(-1, -2));

            this._webViewNative = new android.webkit.WebView(this._androidcontext);
            /*this._webViewNative.setWebChromeClient(new android.webkit.WebChromeClient(this._androidcontext));
            this._webViewNative.setWebViewClient(new android.webkit.WebViewClient(this._androidcontext));
            this._webViewNative.getSettings().setJavaScriptEnabled(true);*/
            this._webViewNative.setLayoutParams(new android.view.ViewGroup.LayoutParams(-1, -2));
            //this._webSettings = new android.webkit.WebSettings(this._androidcontext);
            //this._webSettings = this._webViewNative.getSettings();
            //this._webSettings.setCacheMode(this._webSettings.LOAD_NO_CACHE);
            this._webViewNative.loadUrl("https://www.google.com");
            //Create a LinearLayout container to contain the label and seekbar
            this._layout = new android.widget.LinearLayout(this._androidcontext);
            this._layout.setOrientation(android.widget.LinearLayout.VERTICAL);
            this._layout.setLayoutParams(new android.view.ViewGroup.LayoutParams(-1, -1));

            const hortPaddingInPx = layout.round(layout.toDevicePixels(getPadding()));
            const vertPaddingInPx = layout.round(layout.toDevicePixels(16)); // For top & bottom padding, always 16dp
            this._layout.setPadding(hortPaddingInPx, vertPaddingInPx, hortPaddingInPx, vertPaddingInPx);
            this._layout.addView(this._label);
            //this._layout.addView(this._seekbar);
            this._layout.addView(this._webViewNative);
            this.setNativeView(this._layout);
            return this._layout;
        }

        /**
         * Initializes properties/listeners of the native view.
         */
        initNativeView(): void {
            console.log("initNativeView called");
            // Attach the owner to nativeView.
            // When nativeView is tapped you get the owning JS object through this field.
            //(<any>this._seekbar).owner = this;
            (<any>this._layout).owner = this;
            super.initNativeView();

            //Attach a listener to be notified whenever the native Seekbar is changed so that you can notify the MDK Extension
            /*this._seekbar.setOnSeekBarChangeListener(new android.widget.SeekBar.OnSeekBarChangeListener({
                onStartTrackingTouch(seekBar: any) {
                },
                onStopTrackingTouch(seekBar: any) {
                    var eventData = {
                        eventName: "OnSliderValueChanged",
                        object: seekBar.owner,
                        value: seekBar.owner._value
                    };
                    seekBar.owner.notify(eventData);
                },
                onProgressChanged(seekBar: any, progress: number, fromUser: boolean) {
                    seekBar.owner._value = progress;
                    seekBar.owner.updateText();
                }
            }));*/
        }

        /**
         * Clean up references to the native view and resets nativeView to its original state.
         * If you have changed nativeView in some other way except through setNative callbacks
         * you have a chance here to revert it back to its original state
         * so that it could be reused later.
         */
        disposeNativeView(): void {
            // Remove reference from native view to this instance.
            //(<any>this._seekbar).owner = null;
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
                this._label.setText(newText);
            }
        }

    }
    return MyWebViewNative;
}