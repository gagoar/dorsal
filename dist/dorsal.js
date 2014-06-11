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

/*! dorsal - v0.3.0 - 2014-06-11 */

var DorsalRuntime = function() {};

DorsalRuntime.prototype.VERSION = '0.0.1';
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
