(function() {
    'use strict';

    describe('VideoAutoAdvance', function() {
        // eslint-disable-next-line no-var
        var state, oldOTBD;
        beforeEach(function() {
            oldOTBD = window.onTouchBasedDevice;
            // eslint-disable-next-line no-undef
            window.onTouchBasedDevice = jasmine
                .createSpy('onTouchBasedDevice').and.returnValue(null);
            // eslint-disable-next-line no-undef
            jasmine.clock().install();
        });
        afterEach(function() {
            $('source').remove();
            state.storage.clear();

            if (state.videoPlayer) {
                state.videoPlayer.destroy();
            }
            window.onTouchBasedDevice = oldOTBD;
            // eslint-disable-next-line no-undef
            jasmine.clock().uninstall();
        });
        describe('when auto-advance feature is unset (default behaviour)', function() {
            beforeEach(function() {
                // eslint-disable-next-line no-undef
                state = jasmine.initializePlayer('video.html');
                appendLoadFixtures('sequence.html');
            });
            it('no auto-advance button is shown', function() {
                // eslint-disable-next-line no-var
                var $button = $('.control.auto-advance');
                expect($button).not.toExist();
            });
            it('when video ends, it will not auto-advance to next unit', function() {
                // eslint-disable-next-line no-var
                var $nextButton = $('.sequence-nav-button.button-next').first();
                expect($nextButton).toExist();

                // not auto-clicked yet
                spyOnEvent($nextButton, 'click');
                expect('click').not.toHaveBeenTriggeredOn($nextButton);

                state.el.trigger('ended');
                // eslint-disable-next-line no-undef
                jasmine.clock().tick(2);

                // still not auto-clicked
                expect('click').not.toHaveBeenTriggeredOn($nextButton);
            });
        });
        describe('when auto-advance feature is set', function() {
            describe('and auto-advance is enabled', function() {
                beforeEach(function() {
                    // eslint-disable-next-line no-undef
                    state = jasmine.initializePlayer('video_autoadvance.html');
                    appendLoadFixtures('sequence.html');
                });
                it('an active auto-advance button is shown', function() {
                    // eslint-disable-next-line no-var
                    var $button = $('.control.auto-advance');
                    expect($button).toExist();
                    expect($button).toHaveClass('active');
                });
                it('when button is clicked, it will deactivate auto-advance', function() {
                    // eslint-disable-next-line no-var
                    var $button = $('.control.auto-advance');
                    $button.click();
                    expect($button).not.toHaveClass('active');
                });
                it('when video ends, it will auto-advance to next unit', function() {
                    // eslint-disable-next-line no-var
                    var $nextButton = $('.sequence-nav-button.button-next').first();
                    expect($nextButton).toExist();

                    // not auto-clicked yet
                    spyOnEvent($nextButton, 'click');
                    expect('click').not.toHaveBeenTriggeredOn($nextButton);

                    state.el.trigger('ended');
                    // eslint-disable-next-line no-undef
                    jasmine.clock().tick(2);

                    // now it was auto-clicked
                    expect('click').toHaveBeenTriggeredOn($nextButton);
                });
            });

            describe('when auto-advance is disabled', function() {
                beforeEach(function() {
                    // eslint-disable-next-line no-undef
                    state = jasmine.initializePlayer('video_autoadvance_disabled.html');
                    appendLoadFixtures('sequence.html');
                });
                it('an inactive auto-advance button is shown', function() {
                    // eslint-disable-next-line no-var
                    var $button = $('.control.auto-advance');
                    expect($button).toExist();
                    expect($button).not.toHaveClass('active');
                });
                it('when the button is clicked, it will activate auto-advance', function() {
                    // eslint-disable-next-line no-var
                    var $button = $('.control.auto-advance');
                    $button.click();
                    expect($button).toHaveClass('active');
                });
                it('when video ends, it will not auto-advance to next unit', function() {
                    // eslint-disable-next-line no-var
                    var $nextButton = $('.sequence-nav-button.button-next').first();
                    expect($nextButton).toExist();

                    // not auto-clicked yet
                    spyOnEvent($nextButton, 'click');
                    expect('click').not.toHaveBeenTriggeredOn($nextButton);

                    state.el.trigger('ended');
                    // eslint-disable-next-line no-undef
                    jasmine.clock().tick(2);

                    // still not auto-clicked
                    expect('click').not.toHaveBeenTriggeredOn($nextButton);
                });
            });
        });
    });
}).call(this);
