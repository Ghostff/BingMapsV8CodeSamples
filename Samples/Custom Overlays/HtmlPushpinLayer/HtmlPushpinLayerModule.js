/*
 * Copyright(c) 2017 Microsoft Corporation. All rights reserved.
 *
 * This code is licensed under the MIT License (MIT).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>
/**
 * A simple class that defines a HTML pushpin.
 */
var HtmlPushpin = (function () {
    /**********************
    * Constructor
    ***********************/
    /**
     * @constructor
     * @param loc The location of the pushpin.
     * @param html The HTML to display as the pushpin.
     * @param anchor An anchor to offset the position of the html so that it aligns with the location.
     */
    function HtmlPushpin(loc, html, anchor) {
        this._location = loc;
        this._anchor = anchor;
        //A property for storing data relative to the pushpin.
        this.metadata = null;
        //Create the pushpins DOM element.
        this._element = document.createElement('div');
        this._element.innerHTML = html;
        this._element.style.position = 'absolute';
    }
    /**
     * Gets the anchor point of the pushpin.
     * @returns The anchor point of the pushpin.
     */
    HtmlPushpin.prototype.getAnchor = function () {
        return this._anchor;
    };
    /**
     * Sets the anchor point of the pushpin.
     * @param anchor The anchor point of the pushpin.
     */
    HtmlPushpin.prototype.setAnchor = function (anchor) {
        this._anchor = anchor;
    };
    /**
     * Gets the location of the pushpin.
     * @returns The location of the pushpin.
     */
    HtmlPushpin.prototype.getLocation = function () {
        return this._location;
    };
    /**
     * Sets the location of the pushpin.
     * @param loc The location of the pushpin.
     */
    HtmlPushpin.prototype.setLocation = function (loc) {
        this._location = loc;
    };
    return HtmlPushpin;
}());
/**
 * A reusable class for overlaying HTML elements as pushpins on the map.
 */
var HtmlPushpinLayer = (function (_super) {
    __extends(HtmlPushpinLayer, _super);
    /**********************
    * Constructor
    ***********************/
    /**
    * @constructor
    */
    function HtmlPushpinLayer(pushpins) {
        _super.call(this, { beneathLabels: false });
        /**********************
        * Private Properties
        ***********************/
        /** Store the pushpins. */
        this._pushpins = null;
        /** A variable to store the viewchange event handler id. */
        this.viewChangeEventHandler = null;
        /** A variable to store a reference to the container for the HTML pushpins. */
        this.container = null;
        this._pushpins = pushpins || [];
    }
    /**********************
    * Overridden functions
    ***********************/
    /**
    * Layer added to map. Setup rendering container.
    */
    HtmlPushpinLayer.prototype.onAdd = function () {
        //Create a div that will hold the pushpins.
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.left = '0px';
        this.container.style.top = '0px';
        this.setHtmlElement(this.container);
    };
    /**
     * Layer loaded, add map events for updating position of data.
     */
    HtmlPushpinLayer.prototype.onLoad = function () {
        var self = this;
        //Reset pushpins as overlay is now loaded.
        self.setPushpins(self._pushpins);
        //Update the position of the pushpin when the view changes.
        this.viewChangeEventHandler = Microsoft.Maps.Events.addHandler(self.getMap(), 'viewchange', function () {
            self._updatePositions();
        });
    };
    /**
     * Layer removed from map. Release resources.
     */
    HtmlPushpinLayer.prototype.onRemove = function () {
        this.setHtmlElement(null);
        //Remove the event handler that is attached to the map.
        Microsoft.Maps.Events.removeHandler(this.viewChangeEventHandler);
    };
    /**********************
    * Public Functions
    ***********************/
    /**
    * Adds a HTML pushpin or array of HTML pushpins to add to the layer.
    * @param pushpin A HTML pushpin or array of HTML pushpins to add to the layer.
    */
    HtmlPushpinLayer.prototype.add = function (pushpin) {
        if (pushpin) {
            if (pushpin instanceof HtmlPushpin) {
                this._pushpins.push(pushpin);
                pushpin._layer = this;
                this.container.appendChild(pushpin._element);
            }
            else if (pushpin instanceof Array) {
                //Add the pushpins to the container.
                for (var i = 0, len = pushpin.length; i < len; i++) {
                    pushpin[i]._layer = this;
                    this.container.appendChild(pushpin[i]._element);
                }
            }
            this._updatePositions();
        }
    };
    /**
     * Removes all pushpins in the layer.
     */
    HtmlPushpinLayer.prototype.clear = function () {
        //Clear any pushpins already in the layer.
        if (this._pushpins) {
            for (var i = 0, len = this._pushpins.length; i < len; i++) {
                this._pushpins[i]._layer = null;
            }
        }
        this._pushpins = [];
        if (this.container) {
            this.container.innerHTML = '';
        }
    };
    /**
     * Retrieves a bounding box that contains all the HTML Pushpin locations.
     * @returns A bounding box that contains all the HTML Pushpin locations.
     */
    HtmlPushpinLayer.prototype.getBounds = function () {
        var locs = [];
        for (var i = 0, len = this._pushpins.length; i < len; i++) {
            locs.push(this._pushpins[i].getLocation());
        }
        return Microsoft.Maps.LocationRect.fromLocations(locs);
    };
    /**
     * Retrieves all HTML pushpins in the layer.
     * @returns All HTML pushpins in the layer.
     */
    HtmlPushpinLayer.prototype.getPushpins = function () {
        return this._pushpins;
    };
    /**
    * Sets the pushpins to be overlaid on top of the map. This will remove any pushpins already in the layer.
    * @param pushpins The HTML pushpins to overlay on the map.
    */
    HtmlPushpinLayer.prototype.setPushpins = function (pushpins) {
        this.clear();
        if (pushpins) {
            //Add the pushpins to the container.
            for (var i = 0, len = pushpins.length; i < len; i++) {
                pushpins[i]._layer = this;
                this.container.appendChild(pushpins[i]._element);
            }
        }
        this._updatePositions();
    };
    /**********************
    * Private Functions
    ***********************/
    /**
    * Updates the position of a HTML pushpin element on the map.
    */
    HtmlPushpinLayer.prototype._updatePushpinPosition = function (pin) {
        var map = this.getMap();
        if (map) {
            //Calculate the pixel location of the pushpin.
            var topLeft = map.tryLocationToPixel(pin.getLocation(), Microsoft.Maps.PixelReference.control);
            //Offset position to account for anchor.
            var anchor = pin.getAnchor();
            topLeft.x -= anchor.x;
            topLeft.y -= anchor.y;
            //Update the position of the pushpin element.
            pin._element.style.left = topLeft.x + 'px';
            pin._element.style.top = topLeft.y + 'px';
        }
    };
    /**
     * Updates the positions of all HTML pushpins in the layer.
     */
    HtmlPushpinLayer.prototype._updatePositions = function () {
        if (this._pushpins) {
            for (var i = 0, len = this._pushpins.length; i < len; i++) {
                this._updatePushpinPosition(this._pushpins[i]);
            }
        }
    };
    return HtmlPushpinLayer;
}(Microsoft.Maps.CustomOverlay));
//Call the module loaded function.
Microsoft.Maps.moduleLoaded('HtmlPushpinLayerModule');
//# sourceMappingURL=HtmlPushpinLayerModule.js.map