/*
 * Copyright 2014 Eventbrite
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var DorsalCore = function() {};

DorsalCore.prototype.VERSION = '0.3.3';
DorsalCore.prototype.CSS_PREFIX = '.js-d-';
DorsalCore.prototype.DATA_IGNORE_PREFIX = 'xd';
DorsalCore.prototype.DATA_PREFIX = 'd';
DorsalCore.prototype.DATA_DORSAL_WIRED = 'data-' + DorsalCore.prototype.DATA_IGNORE_PREFIX + '-wired';
DorsalCore.prototype.GUID_KEY = 'dorsal-guid';
DorsalCore.prototype.ELEMENT_TO_PLUGINS_MAP = {};

// from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var createGUID = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

function arrayIndexOf(arr, value) {
    var lengthOfArr = arr.length,
        i = 0;

    if (arr.indexOf) {
        return arr.indexOf(value);
    }

    for (; i < lengthOfArr; i++) {
        if (arr[i] === value) {
            return i;
        }
    }

    return -1;
}

DorsalCore.prototype.registerPlugin = function(pluginName, callback) {
    if (!this.plugins) {
        this.plugins = {};
    }
    this.plugins[pluginName] = callback;
};

DorsalCore.prototype.unregisterPlugin = function(pluginName) {
    delete this.plugins[pluginName];
};

DorsalCore.prototype._getDatasetAttributes = function(el) {
    var dataset = el.dataset,
        dataAttributes = {};

    for (var key in dataset) {
        if ((new RegExp('^' + this.DATA_PREFIX + '[A-Z]')).test(key)) {
            var name = key.substr(this.DATA_PREFIX.length),
                outputKey = name[0].toLowerCase() + name.substr(1);

            dataAttributes[outputKey] = dataset[key];
        }
    }

    return dataAttributes;
};

DorsalCore.prototype._normalizeDataAttribute =  function(attr) {
    return attr.toUpperCase().replace('-','');
};
DorsalCore.prototype._getDataAttributes = function(el) {
    var dataAttributes = {},
        attributes = el.attributes,
        attributesLength = attributes.length,
        nameAttribute = 'name',
        i = 0;

    for (i = 0; i < attributesLength; i++) {
        if ((new RegExp('^data-' + this.DATA_PREFIX + '-')).test(attributes[i][nameAttribute])) {
            var name = attributes[i][nameAttribute].substr(5 + this.DATA_PREFIX.length + 1)
                                                   .toLowerCase()
                                                   .replace(/(\-[a-zA-Z])/g, this._normalizeDataAttribute);
            dataAttributes[name] = attributes[i].value;
        }
    }

    return dataAttributes;
};

DorsalCore.prototype._getAttributes = function(el) {
    if (el.dataset) {
        return this._getDatasetAttributes(el);
    }

    return this._getDataAttributes(el);
};

DorsalCore.prototype._runPlugin = function(el, pluginName) {
    // if already initialized, don't reinitialize
    if (el.getAttribute(this.DATA_DORSAL_WIRED) && el.getAttribute(this.DATA_DORSAL_WIRED).indexOf(pluginName) !== -1) {
        return false;
    }

    var data = this._getAttributes(el),
        wiredAttribute = el.getAttribute(this.DATA_DORSAL_WIRED),
        plugin = this.plugins[pluginName],
        options = {
            el: el,
            data: data
        },
        elementGUID = el.getAttribute(this.GUID_KEY);

    if (!elementGUID) {
        elementGUID = createGUID();
        el.setAttribute(this.GUID_KEY, elementGUID);
        this.ELEMENT_TO_PLUGINS_MAP[elementGUID] = {};
    }

    if (typeof plugin === 'function') {
        this.ELEMENT_TO_PLUGINS_MAP[elementGUID][pluginName] = plugin.call(el, options);
    } else if (typeof plugin === 'object') {
        this.ELEMENT_TO_PLUGINS_MAP[elementGUID][pluginName] = plugin.create.call(el, options);
    }

    if (wiredAttribute) {
        el.setAttribute(this.DATA_DORSAL_WIRED, wiredAttribute + ' ' + pluginName);
    } else {
        el.setAttribute(this.DATA_DORSAL_WIRED, pluginName);
    }
};

DorsalCore.prototype._wireElement = function(el, pluginName) {
    var self = this;
    window.setTimeout(function() {
        var pluginCSSClass = self.CSS_PREFIX + pluginName,
            elements = el.querySelectorAll(pluginCSSClass);

        if (el !== document && el.className.indexOf(pluginCSSClass.substr(1)) > -1) {
            self._runPlugin(el, pluginName);
        }

        for (var elementIndex = 0, element; (element = elements[elementIndex]); elementIndex++) {
            self._runPlugin(element, pluginName);
        }
    }, 0);
};

DorsalCore.prototype._detachPlugin = function(el, pluginName) {
    var remainingPlugins;

    if (el.getAttribute(this.DATA_DORSAL_WIRED).indexOf(pluginName) > -1 &&
        this.plugins[pluginName].destroy) {

        this.plugins[pluginName].destroy({
            el: el,
            data: this._getAttributes(el),
            instance: this.ELEMENT_TO_PLUGINS_MAP
                [el.getAttribute(DorsalCore.prototype.GUID_KEY)]
                [pluginName]
        });

        remainingPlugins = el.getAttribute(this.DATA_DORSAL_WIRED).split(' ');
        // remove 1 instance, at the index where the plugin name exists
        remainingPlugins.splice(arrayIndexOf(remainingPlugins, pluginName), 1);

        el.setAttribute(this.DATA_DORSAL_WIRED, remainingPlugins.join(' '));

        return true;
    }

    return false;
};

/**
 * @param el [DOMNode]
 * @param pluginName [String]
 * @return true if a plugin was detached, false otherwise
 */
DorsalCore.prototype.unwire = function(el, pluginName) {
    // detach a single plugin
    if (pluginName) {
        return this._detachPlugin(el, pluginName);
    }

    var attachedPlugins = el.getAttribute(this.DATA_DORSAL_WIRED).split(' '),
        attachedPluginsCount = attachedPlugins.length,
        hasADetachedPlugin = false,
        iPluginKey,
        i = 0;

    for (; i < attachedPluginsCount; i++) {
        iPluginKey = attachedPlugins[i];

        if (this._detachPlugin(el, iPluginKey)) {
            hasADetachedPlugin =  true;
        }
    }

    return hasADetachedPlugin;
};

DorsalCore.prototype.wire = function(el, pluginName) {
    if (!this.plugins) {
        throw new Error('No plugins registered with Dorsal');
    }

    if (pluginName) {
        this._wireElement(el, [pluginName]);
        return;
    }

    var pluginKeys = Object.keys(this.plugins),
        index = 0,
        length = pluginKeys.length,
        el = el || document;

    for (; index < length; index++) {
        this._wireElement(el, pluginKeys[index]);
    }
};

DorsalCore.prototype.rewire = function(el, pluginName) {
    this.unwire(el, pluginName);
    this.wire(el, pluginName);
};

var Dorsal = new DorsalCore();

Dorsal.create = function() {
    return new DorsalCore();
};
