var path = require('path');
var td = require('transform-deps');
var through = require('through2');
var debug = require('debug')('bant:rewrite');
var relative = require('relative');

module.exports = function (file, opts) {
  if (!opts) opts = {};

  var filetype = [].concat(opts.extensions).concat(['.js']);
  filetype = new RegExp(filetype.join('|') + '$');

  if (!filetype.test(file)) {
    debug('skipping ' + file);
    return through();
  }
  
  var src = '',
      basedir = opts.basedir || path.dirname(file),
      mapping = opts.mapping || {};

  return through(write, end);

  function write (row, enc, cb) {
    src += row;
    cb();
  }

  function end (cb) {
    var self = this,
        keys = Object.keys(mapping),
        target, key, val, re, n;

    target = td(src, function (id) {
      for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        val = mapping[key];
        if (val.charAt(0) === '.')
          val = relative(file, path.join(basedir, val));
        re = new RegExp('^' + key);
        if (re.test(id)) {
          n = id.replace(re, val);
          debug('replacing ' + id + ' with ' + n + ' in ' + file);
          return n;
        }
      }
    });

    this.push(target);
    cb();
  }
};

