import * as app from "@nativescript/core/application";
import { BaseObservable } from "mdk-core/observables/BaseObservable";
// import { Color } from '@nativescript/core/color';
import { IControl } from "mdk-core/controls/IControl";
import { Label } from "@nativescript/core/ui";
import { Color } from "@nativescript/core/color";

export class TestClass extends IControl {
  private _label: any;
  private _observable: BaseObservable;
  private _value: any;

  public initialize(props) {
    console.info("[DEBUG] TestClass.ts");
    super.initialize(props);

    this._value = "Default Value";

    const color = new Color("gray");
    this._label = new Label();
    this._label.backgroundColor = color;
  }

  public view() {
    //Use provided ValueResolver to resolve value to support bindings, rules, etc in your extension
    this.valueResolver()
      .resolveValue(this._value)
      .then((resolvedValue) => {
        this._label.text = resolvedValue;
      });
    return this._label;
  }

  public viewIsNative() {
    return true;
  }

  public observable() {
    if (!this._observable) {
      this._observable = new BaseObservable(
        this,
        this.definition(),
        this.page()
      );
    }
    return this._observable;
  }

  public setValue(value: any, notify: boolean): Promise<any> {
    this._value = value;
    this._label.text = value;
    return Promise.resolve();
  }

  public setContainer(container: IControl) {
    // do nothing
  }

  get isBindable(): boolean {
    return true;
  }

  public bind(): Promise<any> {
    return this.observable().bindValue(this._value);
  }
}
