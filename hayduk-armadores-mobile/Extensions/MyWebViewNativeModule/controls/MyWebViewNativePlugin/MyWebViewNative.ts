import * as application from '@nativescript/core/application';

export let MyWebViewNative;
let MyWebViewNativeModule;
/*
This is a sample of how to implement iOS and Android codes separately in a metadata extension.
Because all ts files in metadata Extensions folder will be bundled together using webpack,
if you execute any iOS codes in Android vice versa, it will likely cause issue such as crash.

By splitting the implementation into different files and encapsulate them in a function, it allows
us to load only the required module for the platform at runtime.
*/
if (!MyWebViewNative) {
    //Here you will check what platform the app is in at runtime.
    if (application.ios) {
        //if app is in iOS platform, load the MyWebViewNative module from ios folder
        MyWebViewNativeModule = require('./ios/MyWebViewNative');
    } else {
        //otherise, assume app is in Android platform, load the MyWebViewNative module from android folder
        MyWebViewNativeModule = require('./android/MyWebViewNative');
    }
    // calling GetMyWebViewNativeClass() will return MyWebViewNative class for the correct platform.
    //  See the MyWebViewNative.ts in ios/andrid folder for details
    MyWebViewNative = MyWebViewNativeModule.GetMyWebViewNativeClass();
}