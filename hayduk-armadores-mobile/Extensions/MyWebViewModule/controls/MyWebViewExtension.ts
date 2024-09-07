import * as app from "@nativescript/core/application";
import { BaseObservable } from "mdk-core/observables/BaseObservable";
import { IControl } from "mdk-core/controls/IControl";
import { Label } from "@nativescript/core/ui/label";
// import { StackLayout } from "@nativescript/core/ui/layouts/stack-layout";
import { GridLayout } from "@nativescript/core/ui/layouts/grid-layout";
// import { WebView } from "@nativescript/core/ui/web-view";
import {
  AdvancedWebViewOptions,
  openAdvancedUrl,
} from "nativescript-advanced-webview";

export class MyWebViewClass extends IControl {
  private _model: any;
  private _observable: BaseObservable;
  private _targetLabel: any;
  private _layout: any;
  private oWebViewEx1: any;
  private _Url = "";
  // private oWebViewAdvance: any;
  public initialize(props) {
    console.info("[DEBUG] MyWebViewExtension.ts - initialize");

    super.initialize(props);

    // init();

    // Stack Layout
    // this._layout = new StackLayout();
    this._layout = new GridLayout();
    this._layout.backgroundColor = "#354A5F";

    // Create Label
    this._targetLabel = new Label();
    this._targetLabel.text = "Demo";
    //this._StackLayout.addChild(this._targetLabel);
    //this._StackLayout.addChild(this.oWebViewAdvance);
    // var hc = "https://haydukcontigo.hayduk.com.pe/";
    //var uriex = "https://www.hayduk.com.pe/";
    //this.oWebViewEx = new WebView();
    //this.oWebViewEx.src = uriex;
    //this._StackLayout.addChild(this.oWebViewEx);

    //////////////
    let extProps = this.definition().data.ExtensionProperties;
    if (extProps) {
      // Resolve SalesData
      return this.valueResolver()
        .resolveValue(extProps.Url, this.context, true)
        .then(
          function (Url) {
            ////////////////
            console.info(
              "[DEBUG] MyWebViewExtension.ts - valueResolver - url:",
              Url
            );

            // OPCION 1
            // this.oWebViewEx1 = new WebView();
            // //this.oWebViewEx1.android.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_NO_CACHE);
            // //this.oWebViewEx1.android.getSettings().setAppCacheEnabled(true);
            // //this.oWebViewEx1.android.getSettings().setJavaScriptEnabled(true);
            // //this.oWebViewEx1.android.getSettings().setAppCacheEnabled(true);
            // this.oWebViewEx1.src = Url;
            // return this._layout.addChild(this.oWebViewEx1);

            // OPCION 2
            // try {
                const opts: AdvancedWebViewOptions = {
                  url: Url,
                  showTitle: false,
                  toolbarColor: "#354A5F",
                  toolbarControlsColor: "#354A5F",
                  isClosed: (res) => {
                    console.log("[DEBUG] Closed Hayduk Contigo web page", res);
                  },
                };
    
                openAdvancedUrl(opts);
                console.log(
                  "[DEBUG] MyWebViewExtension.ts - openAdvancedUrl - end"
                );
            // } catch (error) {
            //     console.log("[DEBUG] MyWebViewExtension.ts ERROR");
            //     console.log(error);
            // }

            //         // this._targetLabel.text = Url;
            //         // this._targetLabel.textAlignment = "center";
            //         // this._targetLabel.fontWeight = "bold";
            //         // this.oWebView = new WebView();

            // CTAPIA
            // this.oWebViewAdvance = new AdvancedWebview();
            // this.oWebViewAdvance.src = Url;

            // this._Url = Url;
            //         // this.oWebView.android.src = this._Url;
            //         // this.oWebView.android.loadUrl(this._Url);
            //         //this.oWebView.android.getSettings().setAppCacheEnabled(true);
            //         //this.oWebView.android.getSettings().setJavaScriptEnabled(true);
            //         //this.oWebView.android.getSettings().setAppCacheEnabled(true);
            //         //this.oWebView.src = this._Url;
            // this._StackLayout.addChild(this.oWebViewAdvance); // CTAPIA
            //         //this.oWebView.src = this._Url;
            //         //this.oWebView.android.getSettings().setAllowContentAccess(true);
            //         //this.oWebView.android.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_NO_CACHE);
            //         //this.oWebView.android.getSettings().setAllowFileAccessFromFileURLs(true);
            //         //this.oWebView.android.getSettings().setAllowUniversalAccessFromFileURLs(true);
            //         //this.oWebView.android.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
            //         //this.oWebView.android.getSettings().setMediaPlaybackRequiresUserGesture(false);

            //         //this.oWebView.android.getSettings().setDomStorageEnabled(true);
            //         //this.oWebView.android.getSettings().setAllowFileAccess(true);
            //         //this.oWebView.android.getSettings().setUseWideViewPort(true);
            //         //this.oWebView.android.getSettings().setLoadWithOverviewMode(true);
            //         //this.oWebView.android.getSettings().setSupportZoom(true);

            //         //this.oWebView.android.getSettings().setAllowFileAccess(true);
            //         //this.oWebView.android.getSettings().setAllowContentAccess(true);

            //         //this.oWebView.android.getSettings().setSaveFormData(true);
            //         //this.oWebView.android.setWebContentsDebuggingEnabled(true);
            //         //this.oWebView.android.clearCache(true);
            //         //this.oWebView.android.clearHistory();
            //         //this.oWebView.android.setWebViewClient(new android.webkit.WebViewClient());
          }.bind(this)
        );
    }
    // Initiate saleorder Model
    // if (!this._model) { this._model = new oModel(); };

    //this.oWebViewUtils = new WebViewUtils();
    //const headers: Map<string, string> = new Map();
    //this.headers.set("Token", "Berear :1234");
    //this.headers.set("X-Custom-Header", "Set at " + new Date().toTimeString());
    //this.oWebView.onLoadStarted = function (args) {
    //this.oWebViewUtils.addHeaders(this.oWebView, this.headers);
    //}
    //this.oWebView.onLoadFinished = function (args) {
    //this.oWebViewUtils.addHeaders(this.oWebView, this.headers);
    //}
    //this._Url = "https://pe.linkedin.com/company/hayduk";

    //const myHtmlView = new HtmlView();
    // Extension Properties
  }
  public view() {
    console.info("[DEBUG] MyWebViewExtension.ts - view - start", this._layout);
    return this._layout; // Return View
  }

  public viewIsNative() {
    console.info("[DEBUG] MyWebViewExtension.ts - viewIsNative - start");
    return true; // for Android
  }

  // Abstract Method
  public observable() {
    console.info("[DEBUG] MyWebViewExtension.ts - observable - start");
    if (!this._observable) {
      this._observable = new BaseObservable(
        this,
        this.definition(),
        this.page()
      );
    }
    return this._observable;
  }

  // public onPageLoaded(initialLoading: boolean) {
  //     console.info('[DEBUG] MyWebViewExtension.ts - onPageLoaded - start', initialLoading);
  //     console.info('[DEBUG] MyWebViewExtension.ts - onPageLoaded - url', this._Url);

  //     // const opts: AdvancedWebViewOptions = {
  //     //     url: this._Url,
  //     //     isClosed: (res) => {
  //     //         console.log('[DEBUG] Closed Hayduk Contigo web page', res);
  //     //     },
  //     //     showTitle: false
  //     // };

  //     // openAdvancedUrl(opts);
  //     console.log('[DEBUG] MyWebViewExtension.ts - onPageLoaded - end');
  // }

  // Abstract Method
  public setValue(value: any, notify: boolean): Promise<any> {
    return Promise.resolve();
  }

  public setContainer(container: IControl) {
    // do nothing
  }
}
