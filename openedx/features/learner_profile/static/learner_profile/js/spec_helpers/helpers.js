// eslint-disable-next-line no-undef
define(['underscore', 'URI', 'edx-ui-toolkit/js/utils/spec-helpers/ajax-helpers'], function(_, URI, AjaxHelpers) {
    'use strict';

    // eslint-disable-next-line no-var
    var expectProfileElementContainsField = function(element, view) {
        // eslint-disable-next-line no-var
        var titleElement, fieldTitle;
        // eslint-disable-next-line no-var
        var $element = $(element);

        // Avoid testing for elements without titles
        titleElement = $element.find('.u-field-title');
        if (titleElement.length === 0) {
            return;
        }

        fieldTitle = titleElement.text().trim();
        if (!_.isUndefined(view.options.title) && !_.isUndefined(fieldTitle)) {
            expect(fieldTitle).toBe(view.options.title);
        }

        if ('fieldValue' in view || 'imageUrl' in view) {
            if ('imageUrl' in view) {
                expect($($element.find('.image-frame')[0]).attr('src')).toBe(view.imageUrl());
            } else if (view.fieldType === 'date') {
                expect(view.fieldValue()).toBe(view.timezoneFormattedDate());
            } else if (view.fieldValue()) {
                expect(view.fieldValue()).toBe(view.modelValue());
            } else if ('optionForValue' in view) {
                expect($($element.find('.u-field-value .u-field-value-readonly')[0]).text()).toBe(
                    view.displayValue(view.modelValue())
                );
            } else {
                expect($($element.find('.u-field-value .u-field-value-readonly')[0]).text()).toBe(view.modelValue());
            }
        } else {
            throw new Error('Unexpected field type: ' + view.fieldType);
        }
    };

    // eslint-disable-next-line no-var
    var expectProfilePrivacyFieldTobeRendered = function(learnerProfileView, othersProfile) {
        // eslint-disable-next-line no-var
        var $accountPrivacyElement = $('.wrapper-profile-field-account-privacy');
        // eslint-disable-next-line no-var
        var $privacyFieldElement = $($accountPrivacyElement).find('.u-field');

        if (othersProfile) {
            expect($privacyFieldElement.length).toBe(0);
        } else {
            expect($privacyFieldElement.length).toBe(1);
            expectProfileElementContainsField($privacyFieldElement, learnerProfileView.options.accountPrivacyFieldView);
        }
    };

    // eslint-disable-next-line no-var
    var expectSectionOneTobeRendered = function(learnerProfileView) {
        // eslint-disable-next-line no-var
        var sectionOneFieldElements = $(learnerProfileView.$('.wrapper-profile-section-one'))
            .find('.u-field, .social-links');

        expect(sectionOneFieldElements.length).toBe(7);
        expectProfileElementContainsField(sectionOneFieldElements[0], learnerProfileView.options.profileImageFieldView);
        expectProfileElementContainsField(sectionOneFieldElements[1], learnerProfileView.options.usernameFieldView);
        expectProfileElementContainsField(sectionOneFieldElements[2], learnerProfileView.options.nameFieldView);

        _.each(_.rest(sectionOneFieldElements, 3), function(sectionFieldElement, fieldIndex) {
            expectProfileElementContainsField(
                sectionFieldElement,
                learnerProfileView.options.sectionOneFieldViews[fieldIndex]
            );
        });
    };

    // eslint-disable-next-line no-var
    var expectSectionTwoTobeRendered = function(learnerProfileView) {
        // eslint-disable-next-line no-var
        var $sectionTwoElement = $('.wrapper-profile-section-two');
        // eslint-disable-next-line no-var
        var $sectionTwoFieldElements = $($sectionTwoElement).find('.u-field');

        expect($sectionTwoFieldElements.length).toBe(learnerProfileView.options.sectionTwoFieldViews.length);

        _.each($sectionTwoFieldElements, function(sectionFieldElement, fieldIndex) {
            expectProfileElementContainsField(
                sectionFieldElement,
                learnerProfileView.options.sectionTwoFieldViews[fieldIndex]
            );
        });
    };

    // eslint-disable-next-line no-var
    var expectProfileSectionsAndFieldsToBeRendered = function(learnerProfileView, othersProfile) {
        expectProfilePrivacyFieldTobeRendered(learnerProfileView, othersProfile);
        expectSectionOneTobeRendered(learnerProfileView);
        expectSectionTwoTobeRendered(learnerProfileView);
    };

    // eslint-disable-next-line no-var
    var expectLimitedProfileSectionsAndFieldsToBeRendered = function(learnerProfileView, othersProfile) {
        // eslint-disable-next-line no-var
        var sectionOneFieldElements = $('.wrapper-profile-section-one').find('.u-field');

        expectProfilePrivacyFieldTobeRendered(learnerProfileView, othersProfile);

        expect(sectionOneFieldElements.length).toBe(2);
        expectProfileElementContainsField(
            sectionOneFieldElements[0],
            learnerProfileView.options.profileImageFieldView
        );
        expectProfileElementContainsField(
            sectionOneFieldElements[1],
            learnerProfileView.options.usernameFieldView
        );

        if (othersProfile) {
            expect($('.profile-private-message').text())
                .toBe('This learner is currently sharing a limited profile.');
        } else {
            expect($('.profile-private-message').text()).toBe('You are currently sharing a limited profile.');
        }
    };

    // eslint-disable-next-line no-var
    var expectProfileSectionsNotToBeRendered = function() {
        expect($('.wrapper-profile-field-account-privacy').length).toBe(0);
        expect($('.wrapper-profile-section-one').length).toBe(0);
        expect($('.wrapper-profile-section-two').length).toBe(0);
    };

    // eslint-disable-next-line no-var
    var expectTabbedViewToBeUndefined = function(requests, tabbedViewView) {
        // Unrelated initial request, no badge request
        expect(requests.length).toBe(1);
        expect(tabbedViewView).toBe(undefined);
    };

    // eslint-disable-next-line no-var
    var expectTabbedViewToBeShown = function(tabbedViewView) {
        expect(tabbedViewView.$el.find('.page-content-nav').is(':visible')).toBe(true);
    };

    // eslint-disable-next-line no-var
    var expectBadgesDisplayed = function(learnerProfileView, length, lastPage) {
        // eslint-disable-next-line no-var
        var $badgeListingView = $('#tabpanel-accomplishments'),
            updatedLength = length,
            placeholder;
        expect($('#tabpanel-about_me').hasClass('is-hidden')).toBe(true);
        expect($badgeListingView.hasClass('is-hidden')).toBe(false);
        if (lastPage) {
            updatedLength += 1;
            placeholder = $badgeListingView.find('.find-course');
            expect(placeholder.length).toBe(1);
            expect(placeholder.attr('href')).toBe('/courses/');
        }
        expect($badgeListingView.find('.badge-display').length).toBe(updatedLength);
    };

    // eslint-disable-next-line no-var
    var expectBadgesHidden = function() {
        // eslint-disable-next-line no-var
        var $accomplishmentsTab = $('#tabpanel-accomplishments');
        if ($accomplishmentsTab.length) {
            // Nonexistence counts as hidden.
            expect($('#tabpanel-accomplishments').hasClass('is-hidden')).toBe(true);
        }
        expect($('#tabpanel-about_me').hasClass('is-hidden')).toBe(false);
    };

    // eslint-disable-next-line no-var
    var expectPage = function(learnerProfileView, pageData) {
        // eslint-disable-next-line no-var
        var $badgeListContainer = $('#tabpanel-accomplishments');
        // eslint-disable-next-line no-var
        var index = $badgeListContainer.find('span.search-count').text().trim();
        expect(index).toBe('Showing ' + (pageData.start + 1) + '-' + (pageData.start + pageData.results.length)
            + ' out of ' + pageData.count + ' total');
        expect($badgeListContainer.find('.current-page').text()).toBe('' + pageData.current_page);
        _.each(pageData.results, function(badge) {
            expect($('.badge-display:contains(' + badge.badge_class.display_name + ')').length).toBe(1);
        });
    };

    // eslint-disable-next-line no-var
    var expectBadgeLoadingErrorIsRendered = function() {
        // eslint-disable-next-line no-var
        var errorMessage = $('.badge-set-display').text();
        expect(errorMessage).toBe(
            'Your request could not be completed. Reload the page and try again. If the issue persists, click the '
            + 'Help tab to report the problem.'
        );
    };

    // eslint-disable-next-line no-var
    var breakBadgeLoading = function(learnerProfileView, requests) {
        // eslint-disable-next-line no-var
        var request = AjaxHelpers.currentRequest(requests);
        // eslint-disable-next-line no-var
        var path = new URI(request.url).path();
        expect(path).toBe('/api/badges/v1/assertions/user/student/');
        AjaxHelpers.respondWithError(requests, 500);
    };

    // eslint-disable-next-line no-var
    var firstPageBadges = {
        count: 30,
        previous: null,
        next: '/arbitrary/url',
        num_pages: 3,
        start: 0,
        current_page: 1,
        results: []
    };

    // eslint-disable-next-line no-var
    var secondPageBadges = {
        count: 30,
        previous: '/arbitrary/url',
        next: '/arbitrary/url',
        num_pages: 3,
        start: 10,
        current_page: 2,
        results: []
    };

    // eslint-disable-next-line no-var
    var thirdPageBadges = {
        count: 30,
        previous: '/arbitrary/url',
        num_pages: 3,
        next: null,
        start: 20,
        current_page: 3,
        results: []
    };

    // eslint-disable-next-line no-var
    var emptyBadges = {
        count: 0,
        previous: null,
        num_pages: 1,
        results: []
    };

    function makeBadge(num) {
        return {
            badge_class: {
                slug: 'test_slug_' + num,
                issuing_component: 'test_component',
                display_name: 'Test Badge ' + num,
                course_id: null,
                description: "Yay! It's a test badge.",
                criteria: 'https://example.com/syllabus',
                image_url: 'http://localhost:8000/media/badge_classes/test_lMB9bRw.png'
            },
            image_url: 'http://example.com/image.png',
            assertion_url: 'http://example.com/example.json',
            created_at: '2015-12-03T16:25:57.676113Z'
        };
    }

    _.each(_.range(0, 10), function(i) {
        firstPageBadges.results.push(makeBadge(i));
    });

    _.each(_.range(10, 20), function(i) {
        secondPageBadges.results.push(makeBadge(i));
    });

    _.each(_.range(20, 30), function(i) {
        thirdPageBadges.results.push(makeBadge(i));
    });

    return {
        expectLimitedProfileSectionsAndFieldsToBeRendered: expectLimitedProfileSectionsAndFieldsToBeRendered,
        expectProfileSectionsAndFieldsToBeRendered: expectProfileSectionsAndFieldsToBeRendered,
        expectProfileSectionsNotToBeRendered: expectProfileSectionsNotToBeRendered,
        expectTabbedViewToBeUndefined: expectTabbedViewToBeUndefined,
        expectTabbedViewToBeShown: expectTabbedViewToBeShown,
        expectBadgesDisplayed: expectBadgesDisplayed,
        expectBadgesHidden: expectBadgesHidden,
        expectBadgeLoadingErrorIsRendered: expectBadgeLoadingErrorIsRendered,
        breakBadgeLoading: breakBadgeLoading,
        firstPageBadges: firstPageBadges,
        secondPageBadges: secondPageBadges,
        thirdPageBadges: thirdPageBadges,
        emptyBadges: emptyBadges,
        expectPage: expectPage,
        makeBadge: makeBadge
    };
});
