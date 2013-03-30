var SearchUI = function() {
    var self = this;

    self.selector = '.torrent_find_0d1fc2b95';

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

    self.drawBox = function(data) {
        var template_url = chrome.extension.getURL('search_box.html'),
            items = [], item, tb;

        $.get(template_url, function(tmpl) {
            console.log('Rendering Mustache.js template...');
            Object.keys(data).forEach(function(k) {
                item = data[k];
                item.prov = k;
                if (item.magnet) {
                    item.href = "href=" + item.magnet;
                } else if (item.torrent_link) {
                    item.href = "href=" + item.torrent_link;
                    item.download = "download=" + item.torrent_link.substring(
                        item.torrent_link.lastIndexOf('/') + 1);
                } else {
                    console.log("No link found for provider " + k + "'s result");
                    return true;
                }
                item.title = "title=" + item.name;
                items.push(item);
            });
            tb = Mustache.to_html(
                tmpl,
                {
                    items: items
                }
            );
            $(self.selector).remove();
            $('body').prepend(tb);
            $(self.selector).offset(self.calcOffset()).fadeIn().drags();
            self.registerClickHandlers(self.selector);
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