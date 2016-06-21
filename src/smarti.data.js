var smarti = window['smarti'] || {};

smarti.data = {
	getter: function (property) {
		var a = property.replace(/\\?\./g, function (t) { return t == '.' ? '\u000B' : '.'; }).split('\u000B');
		var f = null;
		for (var i = 0; i < a.length; i++) f = this._getter(a[i], f);
		return f;
	},
	get: function (property, dataItem) {
		return this.getter(property)(dataItem);
	},
	sort: function (data, options) {
		if (data && data.length > 0) {
			if (options == null || typeof options == 'string') {
				if (options == 'desc') data.sort(function (x, y) { return x < y; });
				else data.sort(function (x, y) { return x > y; });
			}
			else {
				var s = [].concat(options), f = null;
				for (var i = 0; i < s.length; i++) {
					var d = s[i].dir == 'desc' ? -1 : 1;
					if (!s[i].method) s[i].method = this.getter(s[i].field);
					f = this._sortf(s[i].method, d, f);
				}
				data.sort(f);
			}
		}
	},
	group: function (data, by, aggregates) {
		if (data) {
			var afs = [], gd = [], m = {}, aa = [], f = '';
			if (aggregates) {
				var af = function (a, f, fg, fs) {
					if (fs.indexOf(f) == -1) {
						var fn = a == 'avg' ? '_sum' : '_' + a;
						afs.push(function (i, d, g) { smarti.data[fn](g[a], fg(d), f); });
						fs.push(f);
					}
				}
				for (var a in aggregates) {
					aa.push(a);
					if (a == 'custom') afs = afs.concat(aggregates[a]);
					else if (['sum', 'avg', 'min', 'max'].indexOf(a) >= 0) {
						var ap = [].concat(aggregates[a]), fs = [];
						for (var i = 0; i < ap.length; i++) {
							if (typeof ap[i] == 'string') af(a, ap[i], this.getter(ap[i]), fs);
							else for (var j in ap[i]) af(a, j, ap[i][j], fs);
						}
					}
				}
			}
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
			f = eval('(function(i,d){var v=[],g=null;' + f + '})');
			for (var i = 0, c = data.length; i < c; i++) f(i, data[i]);
			if (gd[0].avg) this.groups(gd, function (k, g) { for (var i in g.avg) g.avg[i] = g.avg[i] / (g.count || 1); });
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
				for (var i = 0; i < data.length; i++) if (f(data[i])) d.push(data[i]);
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
	_getter: function (p, f) {
		if (f) return function (o) { var r = f(o); return r && r[p]; }
		else return function (o) { return o[p]; }
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
			if (g) for (var i = 0; i < d.length; i++) a(m, g(d[i]), 'v');
			else for (var i = 0; i < d.length; i++) a(m, d[i], 'v');
		}
		return m.v;
	},
	_max: function (o, v, f) {
		if (o[f] === undefined || v > o[f]) o[f] = v;
	},
	_min: function (o, v, f) {
		if (o[f] === undefined || v < o[f]) o[f] = v;
	},
	_sum: function (o, v, f) {
		if (o[f] == null) o[f] = v;
		else if (v) o[f] += v;
	},
	_ns: function (str, cs) {
		var s = str != null ? str.toString() : '';
		return cs ? s : s.toLocaleLowerCase();
	}
}
