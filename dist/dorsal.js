/**
 * @license
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

/*! dorsal - v0.3.1 - 2014-06-12 */

(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory();
    }
    else if(typeof define === 'function' && define.amd) {
        define([], factory);
    }
    else {
        root['Dorsal'] = factory();
    }
}(this, function() {

var DorsalRuntime = function() {};

DorsalRuntime.prototype.VERSION = '0.3.1';
DorsalRuntime.prototype.CSS_PREFIX = '.js-d-';
DorsalRuntime.prototype.DATA_PREFIX = 'd';

DorsalRuntime.prototype.registerPlugin = function(pluginName, callback) {
    if (!this.plugins) {
        this.plugins = {};
    }
    this.plugins[pluginName] = callback;
};

DorsalRuntime.prototype.unregisterPlugin = function(pluginName) {
    delete this.plugins[pluginName];
};

DorsalRuntime.prototype._getDatasetAttributes = function(el) {
    var dataset = el.dataset,
        dataAttributes = {};

    for (key in dataset) {
        if ((new RegExp('^' + this.DATA_PREFIX + '[A-Z]')).test(key)) {
            var name = key.substr(this.DATA_PREFIX.length),
                outputKey = name[0].toLowerCase() + name.substr(1);

            dataAttributes[outputKey] = dataset[key];
        }
    }

    return dataAttributes;
}

DorsalRuntime.prototype._getDataAttributes = function(el) {
    var dataAttributes = {},
        attributes = el.attributes,
        attributesLength = attributes.length,
        nameAttribute = 'name',
        i = 0;

    for (i = 0; i < attributesLength; i++) {
        if ((new RegExp('^data-' + this.DATA_PREFIX + '-')).test(attributes[i][nameAttribute])) {
            var name = attributes[i][nameAttribute].substr(5 + this.DATA_PREFIX.length + 1).toLowerCase().replace(/(\-[a-zA-Z])/g, function($1) {
                return $1.toUpperCase().replace('-','');
            })
            dataAttributes[name] = attributes[i].value;
        }
    }

    return dataAttributes;
}

DorsalRuntime.prototype._getAttributes = function(el) {
    if (el.dataset) {
        return this._getDatasetAttributes(el);
    }

    return this._getDataAttributes(el);
}

DorsalRuntime.prototype._runPlugin = function(plugin, el) {
    var data = this._getAttributes(el);
    plugin.call(el, {
        el: el,
        data: data
    });
}

DorsalRuntime.prototype.wire = function(el) {
    if (!this.plugins) {
        throw new Error('No plugins registered with Dorsal');
    }

    var pluginKeys = Object.keys(this.plugins),
        index = 0,
        elementIndex = 0,
        length = pluginKeys.length,
        elements,
        data,
        el = el || document,
        pluginCSSClass;

    for (; index < length; index++) {
        pluginCSSClass = this.CSS_PREFIX + pluginKeys[index];
        elements = el.querySelectorAll(pluginCSSClass);

        if (el !== document && el.className.indexOf(pluginCSSClass.substr(1)) > -1) {
            this._runPlugin(this.plugins[pluginKeys[index]], el);
        }

        for (elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            this._runPlugin(this.plugins[pluginKeys[index]], elements[elementIndex]);
        }
    }
};

var Dorsal = new DorsalRuntime();

Dorsal.create = function() {
    return new DorsalRuntime();
};


return Dorsal;

}));
