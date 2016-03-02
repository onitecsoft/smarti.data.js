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
	},
	filter: function (data, filters) {
		var f = [];
		for (var i in filters) if (typeof filters[i] === 'function') f.push('filters["' + i + '"](o)');
		if (f.length > 0) {
			var d = [];
			f = eval('(function(o){return ' + f.join('&&') + '})');
			for (var i = 0; i < data.length; i++) if (f(data[i])) d.push(data[i]);
			return d;
		}
		else return data;
	},
	contains: function (str, substr, cs) {
		return this._ns(str).indexOf(this._ns(substr)) > -1;
	},
	starts: function (str, substr, cs) {
		return this._ns(str).indexOf(this._ns(substr)) == 0;
	},
	ends: function (str, substr, cs) {
		var s = this._ns(str);
		var m = this._ns(substr);
		return s.indexOf(m, s.length - m.length) > -1;
	},
	_ns: function (str, cs) {
		var s = str != null ? str.toString() : '';
		return cs ? s : s.toLocaleLowerCase();
	}
}
