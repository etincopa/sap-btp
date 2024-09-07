import * as app from '@nativescript/core/application';
import { BaseObservable } from 'mdk-core/observables/BaseObservable';
import { Color } from '@nativescript/core/color';
import { IControl } from 'mdk-core/controls/IControl';

export class MySliderNSClass extends IControl {
  private _control: any;
  private _observable: BaseObservable;
  private _value: any;

  public initialize(props) {
    super.initialize(props);
    if (this.definition().data.ExtensionProperties) {
      this._value = this.definition().data.ExtensionProperties.Value;
    }
    const color = new Color('#004F71');
    if (app.ios) {
      this._control = UITextField.alloc().init();
      this._control.backgroundColor = color.ios;
    } else {
      this._control = new android.widget.EditText(this.androidContext());
      this._control.setTextColor(color.android);
    }
  }

  public view() {
    //Use provided ValueResolver to resolve value to support bindings, rules, etc in your extension
    this.valueResolver().resolveValue(this._value).then((resolvedValue)=> {
      if (app.ios) {
        this._control.text = resolvedValue;
      } else {
        this._control.setText(resolvedValue);
      }
    });
    return this._control;
  }

  public viewIsNative() {
    return true;
  }

  public observable() {
    if (!this._observable) {
      this._observable = new BaseObservable(this, this.definition(), this.page());
    }
    return this._observable;
  }

  public setValue(value: any, notify: boolean): Promise<any> {
    this._value = value;
    if (app.ios) {
      this._control.text = value;
    } else {
      this._control.setText(value);
    }
    return Promise.resolve();
  }

  public setContainer(container: IControl) {
    // do nothing
  }
}