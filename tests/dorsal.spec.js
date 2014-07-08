/*
 * Copyright 2014 Eventbrite
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 describe("DorsalJS", function() {
    beforeEach(function() {
        this.dorsal = new DorsalCore();
        this.clock = sinon.useFakeTimers();
    });

    afterEach(function() {
        this.clock.restore();
    });

    it('initializes without any plugin state', function() {
        expect(this.dorsal.plugins).not.toBeDefined();
    });

    describe('registering plugins', function() {
        beforeEach(function() {
            this.dorsal.registerPlugin('test', function(options) {});
        });

        it('registers a plugin named "test"', function() {
            expect(this.dorsal.plugins.test).toBeDefined();
        });

        describe('unregistering plugins', function() {
            beforeEach(function() {
                this.dorsal.unregisterPlugin('test');
            });

            it('unregisters a plugin named "test"', function() {
                expect(this.dorsal.plugins.test).not.toBeDefined();
            });
        });
    });

    describe('running plugins', function() {
        beforeEach(function() {
            this.dorsal.registerPlugin('test', function(options) {
                options.el.innerHTML = 'hello, world';
            });

            this.html = '<div class="js-d-test"></div>';

            setFixtures(this.html);
            this.dorsal.wire();
            this.clock.tick(10);
        });

        it('runs the test plugin', function() {
            expect($('.js-d-test')).toHaveHtml('hello, world');
        });

        describe('after initial wire', function() {

            beforeEach(function() {
                this.$el = $(this.html);
                this.dorsal.wire(this.$el.get(0));
                this.clock.tick(10);
            });

            it('runs the test plugin on a DOM node', function() {
                expect(this.$el).toHaveHtml('hello, world');
            });

            it('has a dorsal guid', function() {
                expect(this.$el.attr('dorsal-guid')).toBeTruthy();
            });

        });

    });

    describe('data attributes', function() {

        beforeEach(function() {
            this.dorsal.registerPlugin('test', function(options) {
                options.el.innerHTML = options.data.testOneYay + ', ' + options.data.testTwoYay;
            });

            this.html = '<div class="js-d-test" data-d-test-one-yay="hello" data-d-test-two-yay="world"></div>';
            setFixtures(this.html);
            this.dorsal.wire();
            this.clock.tick(10);
        });

        it('gets data attributes without dataset', function() {
            expect($('.js-d-test')).toHaveHtml('hello, world');
        });

        it('gets attributes in older browsers', function() {
            var attributes = this.dorsal._getDataAttributes($(this.html).get(0));
            expect(attributes.testOneYay).toBe('hello');
            expect(attributes.testTwoYay).toBe('world');
        });

        // note this test will actually fail in older browsers
        it('gets attributes in newer browsers', function() {
            var attributes = this.dorsal._getDatasetAttributes($(this.html).get(0));
            expect(attributes.testOneYay).toBe('hello');
            expect(attributes.testTwoYay).toBe('world');
        });

        it('marks element as wired', function() {
            expect($('.js-d-test').data('xdWired')).toContain('test');
        });

    });

    describe('element lifecycle', function() {

        beforeEach(function() {
            var helloReturnedObject = {id: 'hello'},
                self = this;

            this.isReturnedObject = false;

            this.dorsal.registerPlugin('hello', {
                create: function(options) {
                    options.el.innerHTML = options.el.innerHTML + options.data.h;

                    return helloReturnedObject;
                },
                destroy: function(options) {
                    self.isReturnedObject = options.instance.id === helloReturnedObject.id;
                }
            });

            this.dorsal.registerPlugin('world', {
                create: function(options) {
                    options.el.innerHTML = options.el.innerHTML + options.data.w;
                },
                destroy: function(options) {
                    self.worldData = options.data;
                }
            });

            this.$html = $('<div class="js-d-hello js-d-world" data-d-h="hello" data-d-w="world"></div>');
            this.dorsal.wire(this.$html.get(0));
            this.clock.tick(10);
        });

        it('attaches multiple plugins to an element', function() {
            expect(this.$html.data('xdWired').indexOf('hello') > -1).toBeTruthy();
            expect(this.$html.data('xdWired').indexOf('world') > -1).toBeTruthy();
        });

        it('does not allow wiring previously wired plugins', function() {
            this.dorsal.wire(this.$html.get(0), 'hello');
            expect(this.$html.data('xdWired').match(/hello/g).length).toBe(1);
            expect(this.$html.text().match(/hello/g).length).toBe(1);
        });

        describe('unwire all plugins', function() {

            beforeEach(function() {
                this.dorsal.unwire(this.$html.get(0));
            });

            it('removes just the hello and world plugins', function() {
                expect(this.$html.data('xdWired').indexOf('hello') === -1).toBeTruthy();
                expect(this.$html.data('xdWired').indexOf('world') === -1).toBeTruthy();
            });

            it('passes the returned value from create into destroy', function() {
                expect(this.isReturnedObject).toBeTruthy();
            });

            it('passes data to destroy', function() {
                expect(this.worldData.w).toBe('world');
            });

        });

        describe('unwire just the hello plugin', function() {

            beforeEach(function() {
                this.dorsal.unwire(this.$html.get(0));
            });

            it('removes just the hello plugin', function() {
                expect(this.$html.data('xdWired').indexOf('hello') === -1).toBeTruthy();
                expect(this.$html.data('xdWired').indexOf('world') === -1).toBeTruthy();
            });

            it('passes the returned value from create into destroy', function() {
                expect(this.isReturnedObject).toBeTruthy();
            });

            it('passes data to destroy', function() {
                expect(this.worldData.w).toBe('world');
            });

        });

        describe('wiring just the pizza plugin', function() {

            beforeEach(function() {
                this.dorsal.registerPlugin('pizza', function() {});
                this.dorsal.registerPlugin('hotdog', function() {});

                this.$html.addClass('js-d-pizza js-d-hotdog');

                this.dorsal.wire(this.$html.get(0), 'pizza');
                this.clock.tick(10);
            });

            it('runs wire just for pizza', function() {
                expect(this.$html.data('xdWired').indexOf('pizza') !== -1).toBeTruthy();
                expect(this.$html.data('xdWired').indexOf('hotdog') === -1).toBeTruthy();
            });

        });

        describe('rewire', function() {

            beforeEach(function() {
                this.dorsal.rewire(this.$html.get(0));
                this.clock.tick(10);
            });

            it('runs unwire', function() {
                expect(this.isReturnedObject).toBeTruthy();
            });

            it('runs wire', function() {
                // destroy doesn't remove hello, this proves hello was run again
                expect(this.$html.text().match(/hello/g).length).toBe(2);
            });

            it('keeps hello and world in wired attribute', function() {
                expect(this.$html.data('xdWired').indexOf('hello') > -1).toBeTruthy();
                expect(this.$html.data('xdWired').indexOf('world') > -1).toBeTruthy();
            });

        });

    });

});
