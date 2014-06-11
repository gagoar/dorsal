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

DorsalRuntime.prototype.bootstrap = function() {
    if (!this.plugins) {
        throw new Error('No plugins registered with Dorsal');
    }

    var pluginKeys = Object.keys(this.plugins),
        index = 0,
        elementIndex = 0,
        length = pluginKeys.length,
        elements,
        data;

    for (; index < length; index++) {
        elements = document.querySelectorAll(this.CSS_PREFIX + pluginKeys[index]);
        for (elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            data = this._getAttributes(elements[elementIndex]);
            this.plugins[pluginKeys[index]]({
                el: elements[elementIndex],
                data: data
            });
        }
    }
};

var Dorsal = new DorsalRuntime();

Dorsal.create = function() {
    return new DorsalRuntime();
};
