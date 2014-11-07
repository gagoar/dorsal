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

DorsalCore.prototype.VERSION = '0.4.0';
DorsalCore.prototype.CSS_PREFIX = '.js-d-';
DorsalCore.prototype.DATA_IGNORE_PREFIX = 'xd';
DorsalCore.prototype.DATA_PREFIX = 'd';
DorsalCore.prototype.DATA_DORSAL_WIRED = 'data-' + DorsalCore.prototype.DATA_IGNORE_PREFIX + '-wired';
DorsalCore.prototype.GUID_KEY = 'dorsal-guid';
DorsalCore.prototype.ELEMENT_TO_PLUGINS_MAP = {};

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

/**
 * _getDataAttributes
 *
 * @param {DOMNode} el
 * @returns {Object} all the data- attributes present in the given element
 */
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

/**
 * _getAttributes
 *
 * @param {DOMNode} el
 * @returns {Object} all the data- attributes present in the given element
 */
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

/**
 * registeredPlugins
 *
 * @returns {Array} registered plugin names
 */
DorsalCore.prototype.registeredPlugins = function() {
    return Object.keys(this.plugins);
};

/**
 * wireElementsFrom
 * @param {DOMNode} parentNode
 * @param {Promise} deferred object to proxy to the next method
 *
 */
DorsalCore.prototype._wireElementsFrom = function(parentNode, deferred) {
    var isValidNode = parentNode && 'querySelectorAll' in parentNode,
        plugins = this.registeredPlugins(),
        index = 0,
        pluginName,
        pluginCSSClass,
        nodes;

    if (!isValidNode) {
        return;
    }

    pluginName = plugins[index++];

    while(pluginName) {
        nodes = parentNode.querySelectorAll(this.CSS_PREFIX + pluginName);

        if (nodes.length) {
            this._wireElements(nodes, [pluginName], deferred);
        }
        pluginName = plugins[index++];
    }
};

/**
 * _wireElements
 * @param {Array} nodes DomNodes to wire
 * @param {Array|String} plugins plugins to wire the given nodes.
 * @param {Promise} deferred object to proxy to the next method
 *
 */
DorsalCore.prototype._wireElements = function(nodes, plugins, deferred) {
    var nodeIndex = 0,
        node = nodes[nodeIndex++];

    while(node) {
        this._wireElement(node, plugins, deferred);
        node = nodes[nodeIndex++];
    }
};
/**
 * _wireElement
 * @param {DomNode} nodes DomNodes to wire
 * @param {Array|String} plugins plugins to wire the given nodes.
 * @param {Promise} deferred object to proxy to the next method
 *
 */
DorsalCore.prototype._wireElement = function(el, plugins, deferred) {
    var self = this;
    window.setTimeout(function() {
        var validElement = el && 'className' in el,
            pluginCSSClass,
            pluginName,
            index = 0;

        if (!validElement) {
            return;
        }

        if (!plugins.length) {
            plugins = self.registeredPlugins();
        }

        pluginName = plugins[index++];

        while(pluginName) {
            pluginCSSClass = self.CSS_PREFIX + pluginName;

            if (el.className.indexOf(pluginCSSClass.substr(1)) > -1) {
                pluginResponse = self._runPlugin(el, pluginName);
                deferred.notify(pluginName, pluginResponse, self);
            }
            pluginName = plugins[index++];
        }


    }, 0);
};

/**
 * _detachPlugin
 * @param {DomNode} nodes DomNodes to unwire
 * @param {String} pluginName plugin to unwire from  the given node.
 * @param {Boolean} hasActuallyDestroyed the unwire status
 *
 */
DorsalCore.prototype._detachPlugin = function(el, pluginName) {
    var remainingPlugins,
        hasActuallyDestroyed = false;

    if (typeof el.getAttribute(this.DATA_DORSAL_WIRED) !== 'string') {
        return false;
    }

    if (el.getAttribute(this.DATA_DORSAL_WIRED).indexOf(pluginName) > -1 &&
        this.plugins[pluginName].destroy) {

        this.plugins[pluginName].destroy({
            el: el,
            data: this._getAttributes(el),
            instance: this.ELEMENT_TO_PLUGINS_MAP
                [el.getAttribute(DorsalCore.prototype.GUID_KEY)]
                [pluginName]
        });

        hasActuallyDestroyed = true;
    }

    // remove plugin
    remainingPlugins = el.getAttribute(this.DATA_DORSAL_WIRED).split(' ');
    // remove 1 instance, at the index where the plugin name exists
    remainingPlugins.splice(arrayIndexOf(remainingPlugins, pluginName), 1);
    el.setAttribute(this.DATA_DORSAL_WIRED, remainingPlugins.join(' '));

    return hasActuallyDestroyed;
};

/**
 * unwire
 * @param {DOMNode} el
 * @param {String} pluginName
 * @returns {Boolean} true if a plugin was detached, false otherwise
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

/**
 * wire
 * wire can be used as follow:
 * 0 argument: Will wire each element having the prefix on them.
 * 1 argument (DomNode): Will wire all the children elements from a given node.
 * 1 argument (Array): Will wire all the elements from a given Collection.
 * 2 argument (DomNode, PluginName): Will wire the node/plugin respectively.
 *
 *
 * @param {DOMNode} el
 * @param {String} pluginName
 * @returns {Promise} deferred async wiring of dorsal
 */
DorsalCore.prototype.wire = function(el, pluginName) {
    var deferred = new DorsalDeferred(this.ELEMENT_TO_PLUGINS_MAP),
        pluginKeys = this.registeredPlugins(),
        pluginCount = (pluginName !== undefined) ? 1 : pluginKeys.length,
        pluginsCalled = 0,
        action;

    deferred.promise().progress(function() {
        pluginsCalled++;
        if (pluginsCalled === pluginCount) {
            deferred.resolve();
        }
    });

    if (!this.plugins) {
        throw new Error('No plugins registered with Dorsal');
    }

    switch(arguments.length) {
        case 1:
            // if el is Array we wire those given elements
            // otherwise we query elements inside the given element
            if (isHTMLElement(el)) {
                this._wireElementsFrom(el, deferred);
            } else {
                this._wireElements(el, [], deferred);
            }
            break;
        case 2:
            // wiring element/plugin respectively.
            action = isHTMLElement(el) ? '_wireElement' : '_wireElements';

            this[action](el, [pluginName], deferred);
            break;
        default:
            // without arguments, we define document as our parentElement
            this._wireElementsFrom(document, deferred);
            break;
    }

    return deferred.promise();
};

/**
 * rewire
 *
 * @param {DOMNode} el
 * @param {stirng} pluginName
 * @returns {Promise} deferred async wiring of dorsal
 */
DorsalCore.prototype.rewire = function(el, pluginName) {
    var deferred;

    this.unwire(el, pluginName);

    if (!pluginName) {
        el  = [el];

        deferred = this.wire(el);
    } else {
        deferred = this.wire(el, pluginName);
    }

    return deferred;
};

/**
 * get
 *
 * @param {Array} nodes DomNodes given
 * @returns {Array} all object instances stored for given element/s
 */
DorsalCore.prototype.get = function(nodes) {
    var instances = [],
        instance,
        i = 0,
        node;

    if (isHTMLElement(nodes)) {
        nodes = [nodes];
    }

    node = nodes[i++];

    while(node) {
        instance = this._instancesFor(node);
        if (instance) {
            instances.push(instance);
        }

        node = nodes[i++];
    }

    return instances;
};

/**
 * _instancesFor
 *
 * @param {DomNode} el DomNodes given
 * @returns {Object} all instances stored for a particular element
*/

DorsalCore.prototype._instancesFor = function(el) {

    var elementGUID = isHTMLElement(el) ?
            el.getAttribute(this.GUID_KEY)
            : el;

    return this.ELEMENT_TO_PLUGINS_MAP[elementGUID];
};

var Dorsal = new DorsalCore();

Dorsal.create = function() {
    return new DorsalCore();
};
