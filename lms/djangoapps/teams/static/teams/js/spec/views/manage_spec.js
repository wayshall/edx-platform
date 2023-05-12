// eslint-disable-next-line no-undef
define([
    'jquery',
    'backbone',
    'underscore',
    'teams/js/views/manage',
    'teams/js/spec_helpers/team_spec_helpers',
    'edx-ui-toolkit/js/utils/spec-helpers/ajax-helpers'
], function($, Backbone, _, ManageView, TeamSpecHelpers, AjaxHelpers) {
    'use strict';

    describe('Team Management Dashboard', function() {
        // eslint-disable-next-line no-var
        var view;
        // eslint-disable-next-line no-var
        var uploadFile = new File([], 'empty-test-file.csv');
        // eslint-disable-next-line no-var
        var mockFileSelectEvent = {target: {files: [uploadFile]}};

        beforeEach(function() {
            setFixtures('<div class="teams-container"></div>');
            view = new ManageView({
                teamEvents: TeamSpecHelpers.teamEvents,
                teamMembershipManagementUrl: '/manage-test-url'
            }).render();
            // eslint-disable-next-line no-undef
            spyOn(view, 'handleCsvUploadSuccess');
            // eslint-disable-next-line no-undef
            spyOn(view, 'handleCsvUploadFailure');
        });

        it('can render itself', function() {
            expect(_.strip(view.$('#download-team-csv').text())).toEqual('Download Memberships');
            expect(_.strip(view.$('#upload-team-csv').text())).toEqual('Upload Memberships');
        });

        it('can handle a successful file upload', function() {
            // eslint-disable-next-line no-var
            var requests = AjaxHelpers.requests(this);
            view.setTeamMembershipCsv(mockFileSelectEvent);
            view.uploadCsv();
            AjaxHelpers.expectRequest(requests, 'POST', view.csvUploadUrl);
            AjaxHelpers.respondWithJson(requests, {});
            expect(view.handleCsvUploadSuccess).toHaveBeenCalled();
        });

        it('can handle a failed file upload', function() {
            // eslint-disable-next-line no-var
            var requests = AjaxHelpers.requests(this);
            view.setTeamMembershipCsv(mockFileSelectEvent);
            view.uploadCsv();
            AjaxHelpers.expectRequest(requests, 'POST', view.csvUploadUrl);
            AjaxHelpers.respondWithError(requests);
            expect(view.handleCsvUploadFailure).toHaveBeenCalled();
        });
    });
});
