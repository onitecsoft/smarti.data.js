smarti.data = {
	getter: function (property) {
		var a = property.replace(/\\?\./g, function (t) { return t == '.' ? '\u000B' : '.'; }).split('\u000B');
		if (a.length > 1) {
			var q = [];
			for (var i = 0; i < a.length; i++) q.push((i > 0 ? q[i - 1] : 'o') + '[a[' + i + ']]');
			var v = q.pop();
			return eval('(function(o){return ' + q.join('&&') + '&&' + v + '!=null?' + v + ":'';})");
		}
		else return function (o) { return o[a[0]] != null ? o[a[0]] : ''; };
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
	group: function (data, by/*, aggregates*/) {
		if (data && data.length > 0 && by) {
			var g = [].concat(by), m = {}, f = '', gd = [], p = null;
			var gf = function (i, d, v) {
				v.push(g[i].call(d, d));
				var k = JSON.stringify(v);
				if (!m[k]) {
					m[k] = { items: [], level: i, value: v[i], count: 0 }
					if (i == 0) gd.push(m[k]); else p.items.push(m[k]);
				}
				p = m[k];
				p.count++;
				if (i == g.length - 1) p.items.push(d);
				//todo aggregates
			}
			for (var i = 0; i < g.length; i++) {
				if (typeof g[i] == 'string') g[i] = this.getter(g[i]);
				f += 'gf(' + i + ',d,v);';
			}
			f = eval('(function(i,d){var v=[];' + f + '})');
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
		var s = 0;
		if (data && data.length > 0) {
			if (field) {
				var g = this.getter(field);
				for (var i = 0; i < data.length; i++) s += g(data[i]) || 0;
			}
			else for (var i = 0; i < data.length; i++) s += data[i] || 0;
		}
		return s;
	},
	min: function (data, field) {
		var m;
		if (data && data.length > 0) {
			var g = field ? this.getter(field) : null;
			m = g ? g(data[0]) : data[0];
			if (g) for (var i = 1; i < data.length; i++) { var v = g(data[i]); if (v < m) m = v; }
			else for (var i = 1; i < data.length; i++) { var v = data[i]; if (v < m) m = v; }
		}
		return m || '';
	},
	max: function (data, field) {
		var m;
		if (data && data.length > 0) {
			var g = field ? this.getter(field) : null;
			m = g ? g(data[0]) : data[0];
			if (g) for (var i = 1; i < data.length; i++) { var v = g(data[i]); if (v > m) m = v; }
			else for (var i = 1; i < data.length; i++) { var v = data[i]; if (v > m) m = v; }
		}
		return m || '';
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
	_ns: function (str, cs) {
		var s = str != null ? str.toString() : '';
		return cs ? s : s.toLocaleLowerCase();
	}
}
