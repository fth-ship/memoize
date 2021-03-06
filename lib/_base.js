// To be used internally, memoize factory

'use strict';

var callable = require('es5-ext/object/valid-callable')
  , forEach  = require('es5-ext/object/for-each')
  , ee       = require('event-emitter/lib/core')

  , ext;

module.exports = exports = function (core) {
	return function self(fn/*, options */) {
		var options, length, get, clear, conf;

		callable(fn);
		options = Object(arguments[1]);

		// Do not memoize already memoized function
		if (fn.memoized && !options.force) return fn;

		if (ext.method && (options.method != null)) {
			return ext.method(options.method, options, fn, self);
		}

		conf = ee({ memoize: self, fn: fn });

		// Normalize length
		if (isNaN(options.length)) {
			length = fn.length;
			// Special case
			if (options.async && ext.async) --length;
		} else {
			length = (options.length === false) ? false : (options.length >>> 0);
		}

		core(conf, length, options);

		forEach(ext, function (fn, name) {
			if (fn.force) fn(conf, options);
			else if (options[name]) fn(options[name], conf, options);
		});

		fn = conf.fn;
		get = conf.get;
		clear = conf.clear;

		conf.memoized.clear = function () { clear(get(arguments)); };
		conf.memoized.clearAll = function () {
			conf.emit('purgeall');
			conf.clearAll();
		};
		conf.memoized.memoized = true;
		conf.emit('ready');
		return conf.memoized;
	};
};
ext = exports.ext = {};
