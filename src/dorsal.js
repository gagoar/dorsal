var DorsalRuntime = function() {};

DorsalRuntime.prototype.VERSION = '0.0.1';
DorsalRuntime.prototype.CSS_PREFIX = '.js-d-';

DorsalRuntime.prototype.registerPlugin = function(pluginName, callback) {
    if (!this.plugins) {
        this.plugins = {};
    }
    this.plugins[pluginName] = callback;
};

DorsalRuntime.prototype.unregisterPlugin = function(pluginName) {
    delete this.plugins[pluginName];
};

DorsalRuntime.prototype.bootstrap = function() {
    if (!this.plugins) {
        throw new Error('No plugins registered with Dorsal');
    }

    var pluginKeys = Object.keys(this.plugins),
        index = 0,
        elementIndex = 0,
        length = pluginKeys.length,
        elements;

    for (; index < length; index++) {
        elements = document.querySelectorAll(this.CSS_PREFIX + pluginKeys[index]);
        for (elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            this.plugins[pluginKeys[index]]({ el: elements[elementIndex] });
        }
    }
};

var Dorsal = new DorsalRuntime();

Dorsal.create = function() {
    return new DorsalRuntime();
};
