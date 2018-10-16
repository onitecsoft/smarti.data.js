var smarti = this['smarti'] || { scope: this };

smarti.data = {
	getter: function (property) {
		var a = property.toString().replace(/\\?\./g, function (t) { return t == '.' ? '\u000B' : '.'; }).split('\u000B');
		var f = null;
		for (var i = 0; i < a.length; i++) f = this._g(a[i], f, i + 1 == a.length);
		return f;
	},
	get: function (property, dataItem) {
		return this.getter(property)(dataItem);
	},
	set: function (property, dataItem, value) {
		return this.getter(property)(dataItem, value);
	},
	sort: function (data, options) {
		if (data && data.length > 0) {
			if (options == null || typeof options == 'string') {
				if (options == 'desc') data.sort(function (x, y) { return x < y; });
				else data.sort(function (x, y) { return x > y; });
			}
			else {
				var s = [].concat(options), f = undefined;
				for (var i = 0; i < s.length; i++) {
					var d = s[i].dir == 'desc' ? -1 : 1;
					if (!s[i].method) s[i].method = this.getter(s[i].field);
					f = this._sortf(s[i].method, d, f);
				}
				data.sort(f);
			}
		}
	},
	group: function (data, by, aggregates, callback) {
		if (data) {
			var afs = [], gd = [], m = {}, aa = [], f = '';
			if (aggregates) {
				var af = function (a, f, fg, fs) {
					var s = smarti.data.getter(f);
					if (fs.indexOf(f) == -1) {
						var fn = a == 'avg' ? '_sum' : '_' + a;
						afs.push(function (i, d, g) { smarti.data[fn](g[a], fg(d), s); });
						fs.push(f);
					}
				}
				for (var a in aggregates) {
					if (a == 'custom') afs = afs.concat(aggregates[a]);
					else if (['sum', 'avg', 'min', 'max'].indexOf(a) >= 0) {
						aa.push(a);
						var ap = [].concat(aggregates[a]), fs = [];
						for (var i = 0; i < ap.length; i++) {
							if (typeof ap[i] == 'string') af(a, ap[i], this.getter(ap[i]), fs);
							else for (var j in ap[i]) af(a, j, ap[i][j], fs);
						}
					}
				}
			}
			if (data.length > 0) {
			    var gg = [].concat(by);
			    var gf = function (d, v, g) {
			        var n = v.length;
			        v.push(gg[n] ? gg[n](d) : '');
			        var k = JSON.stringify(v);
			        if (!m[k]) {
			            m[k] = new smarti.data._group(n, d, aa);
			            if (gg[n]) m[k].value = v[n];
			            if (g) g.items.push(m[k]); else gd.push(m[k]);
			        }
			        m[k].last = d;
			        m[k].count++;
			        if (n == gg.length - 1) m[k].items.push(d);
			        return m[k];
			    }
			    for (var i = 0; i < gg.length; i++) {
			        if (gg && typeof gg[i] == 'string') gg[i] = this.getter(gg[i]);
			        f += 'g=gf(d,v,g);';
			        for (var j = 0; j < afs.length; j++) f += 'afs[' + j + '](i,d,g);';
			    }
			    if (callback) f += 'callback(i,d,g);';
			    f = eval('(function(i,d){var v=[],g=null;' + f + '})');
			    for (var i = 0, c = data.length; i < c; i++) f(i, data[i]);
			    if (gd[0].avg) this.groups(gd, function (k, g) { for (var i in g.avg) g.avg[i] = g.avg[i] / (g.count || 1); });
			}
			else gd.push(new smarti.data._group(0, null, aa));
			return gd;
		}
		return data;
	},
	groups: function (groups, callback) {
		if (groups && callback && groups[0] instanceof smarti.data._group) {
			for (var i = 0; i < groups.length; i++) {
				callback(i, groups[i]);
				this.groups(groups[i].items, callback);
			}
		}
	},
	filter: function (data, filters, operator) {
		if (data && data.length > 0 && filters) {
			filters = [].concat(filters);
			if (filters.length > 0) {
				var d = [];
				var f = operator == 'or' ? function (o) {
					for (var j = 0; j < filters.length; j++) if (filters[j].call(o, o)) return true; return false;
				} : function (o) {
					for (var j = 0; j < filters.length; j++) if (!filters[j].call(o, o)) return false; return true;
				};
				for (var i = 0, c = data.length; i < c; i++) if (f(data[i])) d.push(data[i]);
				return d;
			}
		}
		return data;
	},
	sum: function (data, field) {
		return this._aggr(data, field, this._sum);
	},
	min: function (data, field) {
		return this._aggr(data, field, this._min);
	},
	max: function (data, field) {
		return this._aggr(data, field, this._max);
	},
	avg: function (data, field) {
		return data && data.length > 0 ? this.sum(data, field) / data.length : 0;
	},
	contains: function (str, substr, cs) {
		return this._ns(str, cs).indexOf(this._ns(substr, cs)) > -1;
	},
	starts: function (str, substr, cs) {
		return this._ns(str, cs).indexOf(this._ns(substr, cs)) == 0;
	},
	ends: function (str, substr, cs) {
		var s = this._ns(str, cs);
		var m = this._ns(substr, cs);
		return s.indexOf(m, s.length - m.length) > -1;
	},
	_g: function (p, f, last) {
		return function (o, v) {
			var r = f ? (arguments.length > 1 ? f(o, v) : f(o)) : o;
			if (arguments.length > 1) { if (last) r[p] = v; else if (!r[p]) r[p] = {}; }
			return r && r[p];
		}
	},
	_sortf: function (m, d, f) {
		var sf = function (x, y) {
			var sx = m.call(x, x), sy = m.call(y, y);
			if (sy === undefined || sx > sy) return d;
			if (sx === undefined || sx < sy) return -d;
			return 0;
		}
		if (f) return function (x, y) { return f(x, y) || sf(x, y); }
		else return sf;
	},
	_group: function (i, d, a) {
		for (var k = 0; k < a.length; k++) this[a[k]] = {};
		this.items = [];
		this.level = i;
		this.count = 0;
		this.first = d;
		return this;
	},
	_aggr: function (d, f, a) {
		var m = { v: undefined };
		if (d && d.length > 0) {
			var g = f ? this.getter(f) : null;
			if (g) for (var i = 0, c = d.length; i < c; i++) a(m, g(d[i]), this.getter('v'));
			else for (var i = 0, c = d.length; i < c; i++) a(m, d[i], this.getter('v'));
		}
		return m.v;
	},
	_max: function (o, v, g) {
		var r = g(o);
		if (r === undefined || v > r) g(o, v);
	},
	_min: function (o, v, g) {
		var r = g(o);
		if (r === undefined || v < r) g(o, v);
	},
	_sum: function (o, v, g) {
		var r = g(o);
		if (r == null) g(o, v);
		else if (v) g(o, r + v);
	},
	_ns: function (str, cs) {
		var s = str != null ? str.toString() : '';
		return cs ? s : s.toLocaleLowerCase();
	}
}
