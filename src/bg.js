_bkg = null;

var Background = function() {
	var self = this;
	self.cid = null;
	self.title = "Search for torrent links";
	self.currentTabs = [];

	self.on_result = function(result) {
		console.log(result);
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tab.id, {results: result}, self.handle_cs_response);
		});
	};

	self.handle_cs_response = function(response) {
		if (response === undefined) return false;
		if (response.status === "done") {
			console.log("data was received successfully in extension");
		}
	};

	self.search_from_context = function(info, tab) {
		var sterms = info.selectionText;
		if (!sterms || sterms === "") return;
		_search.search(sterms || null, self.on_result);
	};

	self.cid = chrome.contextMenus.create(
		{
			"title": self.title,
			"contexts":["all"],
			"onclick": self.search_from_context
		});
};

_bkg = new Background();