var SearchUI = function() {
	var self = this;

	self.drawBox = function(data) {
		var template_url = chrome.extension.getURL('search_box.html');
		$.get(template_url, function(tmpl) {
			var items = [], coords;
			console.log('Rendering Mustache.js template...');
			Object.keys(data).forEach(function(k) {
				var item = data[k];
				item.prov = k;
				items.push(item);
			});
			var tb = Mustache.to_html(
				tmpl,
				{
					items: items
				}
			);
			$('body').prepend(tb);
			coords = $(":selected").offset();
			$(".torrent_find_0d1fc2b95").offset(coords).fadeIn();
		});
	};

	self.displayResults = function(results) {
		console.log(results);
		self.drawBox(results);
	};

	chrome.extension.onRequest.addListener(
		function(request, sender, sendResponse) {
			console.log("Torrents Search: onRequest callback fired");
			console.log(request);
			if (request.results) {
				self.displayResults(request.results);
				sendResponse({status: "done"});
			} else if (request.noResults) {
				console.log(request.noResults);
				sendResponse({status: "done"});
			}
		}
	);
};

_search_torrents_view = new SearchUI();