var SearchUI = function() {
    var self = this;

    self.selector = '.torrent_find_0d1fc2b95';
    self.mag_img = chrome.extension.getURL('img/magnet.png');
    self.mag_img_disabled = chrome.extension.getURL('img/magnet_disabled.png');
    self.web_img = chrome.extension.getURL('img/webpage.png');
    self.web_img_disabled = chrome.extension.getURL('img/webpage_disabled.png');
    self.tor_img = chrome.extension.getURL('img/torrent.png');
    self.tor_img_disabled = chrome.extension.getURL('img/torrent_disabled.png');
    self.template_url = chrome.extension.getURL('search_box.html');

    self.registerClickHandlers = function(selector) {
        $('.close', selector).click(function(evt) {
            $(selector).fadeOut('fast', function() {
                $(this).remove();
            });
        });
    };

    self.calcOffset = function() {
        var selection, allText, charsOffset, parentElement, parentOffset,
            widthToAdd, upToSelection;

        selection = window.getSelection();
        allText = selection.baseNode.textContent;
        charsOffset = selection.getRangeAt(0).startOffset;
        parentElement = selection.baseNode.parentElement;
        parentOffset = $(parentElement).offset();
        widthToAdd = 0;
        if (charsOffset) {
            upToSelection = allText.slice(0, charsOffset);
            $clone = $(parentElement).clone().offset({x: -99999, y: -99999})
                        .css({display: "inline-block"}).appendTo('body');
            $clone.text(upToSelection);
            widthToAdd = $clone.width();
        }
        parentOffset.left += widthToAdd;
        parentOffset.top += $(parentElement).height() + $(window).scrollTop();
        return parentOffset;
    };

    self.parse_item = function(provider_name, item) {
        item.prov = provider_name;

        // webpage link + image
        if (item.webpage) {
            item.web_img = self.web_img;
        } else {
            item.webpage = "";
            self.web_img = self.web_img_disabled;
        }

        if (item.magnet) {
            item.mag_img = self.mag_img;
        } else {
            item.magnet = "";
            item.mag_img = self.mag_img_disabled;
        }

        if (item.torrent) {
            item.download = item.torrent.substring(
                item.torrent.lastIndexOf('/') +
            1);
            item.tor_img = self.tor_img;
        } else {
            item.torrent = "";
            item.tor_img = self.tor_img_disabled;
        }
        return item;
    };

    self.on_template_received = function(tmpl, items) {
        console.log('Rendering Handlebars.js template');
        var template_div = Handlebars.compile(tmpl),
            result_div = template_div({items: items});

        console.log('Cleaning up existing div and inserting the new one');
        $(self.selector).remove();
        $('body').prepend(result_div);
        $(self.selector).offset(self.calcOffset()).fadeIn().drags();
        self.registerClickHandlers(self.selector);
    };

    self.drawBox = function(data) {
        var items = [];
        console.log("Parsing items from bkg");
        $.each(data, function(key, val) {
            items.push(self.parse_item(key, val));
        });

        console.log('Loading template from extension');
        $.get(self.template_url, function(tmpl) {self.on_template_received(tmpl, items);});
    };

    self.displayResults = function(results) {
        console.log("Received results: ");
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

(function($) {
    $.fn.drags = function(opt) {
        var $el, $drag, z_idx, drg_h, drg_w, pos_y, pos_x;
        opt = $.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle === "") {
            $el = this;
        } else {
            $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            if(opt.handle === "") {
                $drag = $(this).addClass('draggable');
            } else {
                $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            z_idx = $drag.css('z-index');
            drg_h = $drag.outerHeight();
            drg_w = $drag.outerWidth();
            pos_y = $drag.offset().top + drg_h - e.pageY;
            pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                $('.draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on("mouseup", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    };
})(jQuery);

_search_torrents_view = new SearchUI();