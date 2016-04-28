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
			var m = {}, f = '', gd = [], p = null, ag = {}, af = '', ap = '', aa = [];
			if (aggregates) {
				var sum = function (i, d, f) { smarti.data._sum(p.sum, ag.sum[f].call(d, d), f); }
				var min = function (i, d, f) { smarti.data._min(p.min, ag.min[f].call(d, d), f); }
				var max = function (i, d, f) { smarti.data._max(p.max, ag.max[f].call(d, d), f); }
				var custom = function (i, d, f) { p.custom[f] = ag.custom[f](i, d, p); }
				var avg = function (i, d, f) { smarti.data._sum(p.avg, ag.avg[f].call(d, d), f); }
				var pavg = function (g, f) { g.avg[f] /= g.count; }
				var post = function (a, g, f) { g[a][f] = ag[a][f].call(g[a], g[a]); }
				for (var a in aggregates) {
					aa.push(a);
					ag[a] = {};
					var aggr = [].concat(aggregates[a]);
					for (var i = 0; i < aggr.length; i++) {
						var k = aggr[i];
						if (typeof k == 'string') ag[a][k] = this.getter(k);
						else {
							for (kk in k);
							ag[a][kk] = k[kk];
							k = kk;
						}
						k = k.replace(/'/g, "\\'");
						var ff = a + "(i,d,'" + k + "');";
						if (a == 'avg') ap += "pavg(g,'" + k + "');";
						if (['sum', 'avg', 'min', 'max', 'custom'].indexOf(a) >= 0 && af.indexOf(ff) == -1) af += ff;
						else ap += "post('" + a + "',g,'" + k + "');";
					}
				}
			}
			var g = [].concat(by);
			var gf = function (i, d, v) {
				v.push(g[i] ? g[i].call(d, d) : '');
				var k = JSON.stringify(v);
				if (!m[k]) {
					m[k] = new smarti.data._group(i, d, aa);
					if (g[i]) m[k].value = v[i];
					if (i == 0) gd.push(m[k]); else p.items.push(m[k]);
				}
				p = m[k];
				p.last = d;
				p.count++;
				if (i == g.length - 1) p.items.push(d);
			}
			for (var i = 0; i < g.length; i++) {
				if (g && typeof g[i] == 'string') g[i] = this.getter(g[i]);
				f += 'gf(' + i + ',d,v);' + af;
			}
			f = eval('(function(i,d){var v=[];' + f + '})');

			for (var i = 0; i < data.length; i++) f(i, data[i]);
			if (ap) this.groups(gd, eval('(function(g){' + ap + '})'));
			return gd;
		}
		return data;
	},
	groups: function (groups, callback) {
		if (groups && callback && groups[0] instanceof smarti.data._group) {
			for (var i = 0; i < groups.length; i++) {
				callback(groups[i]);
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
