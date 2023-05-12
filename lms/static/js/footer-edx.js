/* eslint-disable-next-line no-use-before-define, no-var */
var edx = edx || {};

(function($) {
    'use strict';

    edx.footer = (function() {
        // eslint-disable-next-line no-var
        var _fn = {
            el: '#footer-edx-v3',

            analytics: {
                init: function() {
                    _fn.$el = _fn.$el || $(_fn.el);

                    /**
                     *  Only continue if the expected element
                     *  to add footer to is in the DOM
                     */
                    if (_fn.$el.length) {
                        _fn.analytics.eventListener();
                    }
                },

                eventListener: function() {
                    if (window.analytics) {
                        _fn.$el.on('click', 'a', _fn.analytics.track);
                    }
                },

                track: function(event) {
                    // eslint-disable-next-line no-var
                    var $link = $(event.currentTarget);

                    // Only tracking external links
                    if ($link.hasClass('external')) {
                        window.analytics.track('edx.bi.footer.link', {
                            category: 'outbound_link',
                            label: $link.attr('href')
                        });
                    }
                }
            }
        };

        return {
            analytics: _fn.analytics.init
        };
    }());

    edx.footer.analytics();
// eslint-disable-next-line no-undef
}(jQuery));
