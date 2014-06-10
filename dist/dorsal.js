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

/*! dorsal - v0.0.1 - 2014-06-09 */

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
        i = 0,
        j = 0,
        length = pluginKeys.length,
        elements;

    for (; i < length; i++) {
        elements = document.querySelectorAll(this.CSS_PREFIX + pluginKeys[i]);
        for (j = 0; j < elements.length; j++) {
            this.plugins[pluginKeys[i]]({ el: elements[j] });
        }
    }
};

var Dorsal = new DorsalRuntime();

Dorsal.create = function() { 
    return new DorsalRuntime();
};


return Dorsal;

}));
