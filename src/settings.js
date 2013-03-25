var Settings = function() {
	var self = this;
	self.fenopy_api = "http://fenopy.se/module/search/api.php";
	self.tpb_api = "http://apify.ifc0nfig.com/tpb/search";
	self.ish_api = "http://isohunt.com/js/json.php";

	// should be overridden using json stored in google.storage
	// should add these settings:
	// selected_providers
	// results_limit
};

var SettingsBuilder = function(opts) {
	// TODO: opts should be an object with at least opts.request and
	// opts.response keys which should include the values to be sent in query
	// and to be expected in result (respectively).
	// 
	// Also might be nice to include more info for api such as:
	// name, icon, api_doc, author_name, author_email (for public server push),
	// etc...
	// 
	// The Request keys should be:
	// api_url, sort, order, limit, api_doc
	// 
	// The Response keys should be:
	// result, seeds_num, magnet_link, torrent_link, web_link
};