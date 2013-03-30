var _settings = window._settings || new Settings(), _search = null;

$.ajaxSetup({
	// url not set here; uses ping.php
	cache: false,
	contents: "json"
});

var QueryBuilder = function(search_provider, query) {
	// TODO: this object will build a query string using the saved data of a search provider
	// 1. get search provider settings + add callback to settings
	// 2. build a query string from search provider settings
	// 3. return query string
};

var Fenopy = function(sterm) {
	var self = this;

	self.data = [];
	self.handle_error = function(data) {
		console.log(data);
		_search.push_results("fen", {name: "No results found"});
	};

	self.searchComplete = function(data) {
		if (!_search || data.length < 1 || !(data instanceof Object))
			return self.handle_error(data);

		self.data = data;
		var first = data[0];
		_search.push_results("fen", {
			name: first.name,
			seeds: first.seeder,
			magnet: first.magnet
		});
	};

	self.search = function(keywords) {
		var url = _settings.fenopy_api;
		url += "?keyword=" + keywords + "&format=json&sort=peer";
		$.getJSON(url, self.searchComplete).error(self.handle_error);
	};

	if (sterm) return self.search(sterm);
};

var IsoHunt = function(sterm) {
	var self = this;

	self.data = [];
	self.handle_error = function(data) {
		console.log(data);
		_search.push_results("ish", {name: "No results found"});
	};

	self.searchComplete = function(data) {
		if (!_search || data.length < 1 || !(data instanceof Object))
			return self.handle_error(data);

		if (!data.items || data.total_results < 1) return self.handle_error(data);
		self.data = data.items.list;
		var first = self.data[0];
		_search.push_results("ish", {
			name: first.title,
			seeds: first.Seeds,
			torrent_link: first.enclosure_url
		});
	};

	self.search = function(keywords) {
		var url = _settings.ish_api;
		url += "?ihq=" + keywords + "&sort=seeds";
		$.getJSON(url, self.searchComplete).error(self.handle_error);
	};

	if (sterm) return self.search(sterm);
};

var TPBay = function(sterm) {
	var self = this;

	self.data = [];
	self.handle_error = function(data) {
		console.log(data);
		_search.push_results("tpb", {name: "No results found"});
	};

	self.searchComplete = function(data) {
		if (!_search || data.length < 1 || !(data instanceof Object))
			return self.handle_error(data);

		self.data = data;
		var first = data[0];
		_search.push_results("tpb", {
			name: first.name,
			seeds: first.seeders,
			magnet: first.magnet
		});
	};

	self.search = function(keywords) {
		var url = _settings.tpb_api;
		url += "?id=" + keywords + "&sort=seeders";
		$.getJSON(url, self.searchComplete).error(self.handle_error);
	};

	if (sterm) return self.search(sterm);
};

var SearchHandler = function(sterm) {
	var self = this;
	sterm = sterm || null;
	self.cb = [];
	self.providers = ["tpb", "fen", "ish"];
	self.results = {};

	self.search = function(sterm, cb) {
		if (!sterm || !cb) return;
		self.cb.push(cb);
		self.fen = (self.fen) ? self.fen.search(sterm) : new Fenopy(sterm);
		self.tpb = (self.tpb) ? self.tpb.search(sterm) : new TPBay(sterm);
		self.ish = (self.ish) ? self.ish.search(sterm) : new IsoHunt(sterm);
	};

	self.get_providers = function() {
		return self.providers;
	};

	self.push_results = function(provider, best_result) {
		self.results[provider] = best_result;
		if (Object.keys(self.results).length === self.providers.length) {
			var callbacks = self.cb;
			self.cb = [];
			callbacks.forEach(function(cb) {
				cb(self.results);
			});
			self.results = {};
		}
	};

	self.search(sterm);
};

_search = new SearchHandler();