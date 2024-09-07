import {
  init
} from "nativescript-advanced-webview";

var clientAPI;

/**
 * Describe this function...
 */
export default async function LoadLibrariesRule(clientAPI) {
  console.info("[DEBUG] LoadLibrariesRule.js - nativescript-advanced-webview.init()");
    init();
    
}