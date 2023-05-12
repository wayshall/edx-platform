/* globals DiscussionContentView, DiscussionUtil, ResponseCommentEditView, ResponseCommentShowView */
(function() {
    'use strict';

    // eslint-disable-next-line no-var
    var __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
            // eslint-disable-next-line no-var
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }

            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    // eslint-disable-next-line no-undef
    if (typeof Backbone !== 'undefined' && Backbone !== null) {
        this.ResponseCommentView = (function(_super) {
            // eslint-disable-next-line no-use-before-define
            __extends(ResponseCommentView, _super);

            function ResponseCommentView() {
                // eslint-disable-next-line no-var
                var self = this;
                this.update = function() {
                    return ResponseCommentView.prototype.update.apply(self, arguments);
                };
                this.edit = function() {
                    return ResponseCommentView.prototype.edit.apply(self, arguments);
                };
                this.cancelEdit = function() {
                    return ResponseCommentView.prototype.cancelEdit.apply(self, arguments);
                };
                this._delete = function() {
                    return ResponseCommentView.prototype._delete.apply(self, arguments);
                };
                return ResponseCommentView.__super__.constructor.apply(this, arguments);
            }

            ResponseCommentView.prototype.tagName = 'li';

            ResponseCommentView.prototype.$ = function(selector) {
                return this.$el.find(selector);
            };

            ResponseCommentView.prototype.initialize = function(options) {
                this.startHeader = options.startHeader;
                return ResponseCommentView.__super__.initialize.call(this);
            };

            ResponseCommentView.prototype.render = function() {
                this.renderShowView();
                return this;
            };

            ResponseCommentView.prototype.renderSubView = function(view) {
                view.setElement(this.$el);
                view.render();
                return view.delegateEvents();
            };

            // eslint-disable-next-line consistent-return
            ResponseCommentView.prototype.renderShowView = function() {
                if (!this.showView) {
                    if (this.editView) {
                        this.editView.undelegateEvents();
                        this.editView.$el.empty();
                        this.editView = null;
                    }
                    this.showView = new ResponseCommentShowView({
                        model: this.model
                    });
                    this.showView.bind('comment:_delete', this._delete);
                    this.showView.bind('comment:edit', this.edit);
                    return this.renderSubView(this.showView);
                }
            };

            // eslint-disable-next-line consistent-return
            ResponseCommentView.prototype.renderEditView = function() {
                if (!this.editView) {
                    if (this.showView) {
                        this.showView.undelegateEvents();
                        this.showView.$el.empty();
                        this.showView = null;
                    }
                    this.editView = new ResponseCommentEditView({
                        model: this.model,
                        startHeader: this.startHeader
                    });
                    this.editView.bind('comment:update', this.update);
                    this.editView.bind('comment:cancel_edit', this.cancelEdit);
                    return this.renderSubView(this.editView);
                }
            };

            ResponseCommentView.prototype._delete = function(event) {
                // eslint-disable-next-line no-var
                var $elem, url,
                    self = this;
                event.preventDefault();
                if (!this.model.can('can_delete')) {
                    return;
                }
                // eslint-disable-next-line no-alert
                if (!confirm(gettext('Are you sure you want to delete this comment?'))) {
                    return;
                }
                url = this.model.urlFor('_delete');
                $elem = $(event.target);
                // eslint-disable-next-line consistent-return
                return DiscussionUtil.safeAjax({
                    $elem: $elem,
                    url: url,
                    type: 'POST',
                    success: function() {
                        self.model.remove();
                        return self.$el.remove();
                    },
                    error: function() {
                        return DiscussionUtil.discussionAlert(
                            gettext('Error'),
                            gettext('This comment could not be deleted. Refresh the page and try again.')
                        );
                    }
                });
            };

            ResponseCommentView.prototype.cancelEdit = function(event) {
                this.trigger('comment:cancel_edit', event);
                return this.renderShowView();
            };

            ResponseCommentView.prototype.edit = function(event) {
                this.trigger('comment:edit', event);
                return this.renderEditView();
            };

            ResponseCommentView.prototype.update = function(event) {
                // eslint-disable-next-line no-var
                var newBody, url,
                    self = this;
                newBody = this.editView.$('.edit-comment-body textarea').val();
                url = DiscussionUtil.urlFor('update_comment', this.model.id);
                return DiscussionUtil.safeAjax({
                    $elem: $(event.target),
                    $loading: $(event.target),
                    url: url,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        body: newBody
                    },
                    error: DiscussionUtil.formErrorHandler(this.$('.edit-comment-form-errors')),
                    success: function() {
                        self.model.set('body', newBody);
                        return self.cancelEdit();
                    }
                });
            };

            return ResponseCommentView;
        }(DiscussionContentView));
    }
}).call(window);
