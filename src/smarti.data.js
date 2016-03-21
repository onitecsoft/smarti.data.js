smarti.data = {
	getter: function (property) {
		var a = property.replace(/\\?\./g, function (t) { return t == '.' ? '\u000B' : '.'; }).split('\u000B');
		if (a.length > 1) {
			var q = [];
			for (var i = 0; i < a.length; i++) q.push((i > 0 ? q[i - 1] : 'o') + '[a[' + i + ']]');
			var v = q.pop();
			return eval('(function(o){return ' + q.join('&&') + '&&' + v + ';})');
		}
		else return function (o) { return o[a[0]]; };
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
				var s = [].concat(options);
				var f = '';
				for (var i = 0; i < s.length; i++) {
					var d = s[i].dir == 'desc' ? -1 : 1;
					if (!s[i].method) s[i].method = this.getter(s[i].field);
					f += 'sx=s[' + i + '].method.call(x,x);sy=s[' + i + '].method.call(y,y);if(sx>sy)return ' + d + ';if(sx<sy)return ' + -d + ';';
				}
				data.sort(eval('(function(x,y){var gx,gy;' + f + '})'));
			}
		}
	},
	group: function (data, by, aggregates) {
		if (data && (by || aggregates)) {
			var m = {}, f = '', gd = [], p = null, ag = {}, af = '';
			if (aggregates) {
				var sum = function (i, d, f) { smarti.data._sum(p.sum, ag.sum[f].call(d, d), f); }
				var min = function (i, d, f) { smarti.data._min(p.min, ag.min[f].call(d, d), f); }
				var max = function (i, d, f) { smarti.data._max(p.max, ag.max[f].call(d, d), f); }
				var custom = function (i, d, f) { p.custom[f] = ag.custom[f](i, d, p.custom[f]); }
				//avg
				for (var a in aggregates) {
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
						var ff = a + "(i,d,'" + k.replace(/'/g, "\\'") + "');";
						if (['sum', 'min', 'max', 'custom'].indexOf(a) >= 0 && af.indexOf(ff) == -1) af += ff;
					}
				}
			}
			if (by) {
				var g = [].concat(by);
				var gf = function (i, d, v) {
					v.push(g[i].call(d, d));
					var k = JSON.stringify(v);
					if (!m[k]) {
						m[k] = { items: [], level: i, value: v[i], count: 0, first: d, sum: {}, min: {}, max: {}, custom: {} };
						if (i == 0) gd.push(m[k]); else p.items.push(m[k]);
					}
					p = m[k];
					p.last = d;
					p.count++;
					if (i == g.length - 1) p.items.push(d);
				}
				for (var i = 0; i < g.length; i++) {
					if (typeof g[i] == 'string') g[i] = this.getter(g[i]);
					f += 'gf(' + i + ',d,v);' + af;
				}
				f = eval('(function(i,d){var v=[];' + f + '})');
			}
			else {
				gd = [{ items: data, count: data.length, sum: {}, min: {}, max: {}, custom: {} }];
				p = gd[0];
				f = eval('(function(i,d){' + af + '})');
			}
			for (var i = 0; i < data.length; i++) f(i, data[i]);
			return gd;
		}
		return data;
	},
	filter: function (data, filters) {
		if (data && data.length > 0) {
			if (typeof filters === 'function') filters = [filters];
			var f = [];
			for (var i in filters) if (typeof filters[i] === 'function') f.push('filters["' + i + '"](o)');
			if (f.length > 0) {
				var d = [];
				f = eval('(function(o){return ' + f.join('&&') + '})');
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
