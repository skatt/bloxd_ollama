// ==UserScript==
// @name         Bloxd AI Proxy Redirect
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Redirect Bloxd WebSocket traffic through local AI proxy
// @author       You
// @match        *://*.bloxd.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const ORIGINAL_WS = window.WebSocket;
    const PROXY_WS_URL = "ws://localhost:4999";

    window.WebSocket = function(url, ...args) {
        if (typeof url === "string" && url.includes("bloxd.io")) {
            console.log("🔁 Redirecting WebSocket to proxy:", PROXY_WS_URL);
            return new ORIGINAL_WS(PROXY_WS_URL, ...args);
        }
        return new ORIGINAL_WS(url, ...args);
    };
})();