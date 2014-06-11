describe("DorsalJS", function() {
    beforeEach(function() {
        this.dorsal = new DorsalRuntime();
    });

    it('initializes without any plugin state', function() {
        expect(this.dorsal.plugins).not.toBeDefined();
    });

    describe('registering plugins', function() {
        beforeEach(function() {
            this.dorsal.registerPlugin('test', function(options) {});
        });

        it('registers a plugin named "test"', function() {
            expect(this.dorsal.plugins['test']).toBeDefined();
        });

        describe('unregistering plugins', function() {
            beforeEach(function() {
                this.dorsal.unregisterPlugin('test');
            });

            it('unregisters a plugin named "test"', function() {
                expect(this.dorsal.plugins['test']).not.toBeDefined();
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
        });

        it('runs the test plugin', function() {
            expect($('.js-d-test')).toHaveHtml('hello, world');
        });

        describe('after initial wire', function() {

            beforeEach(function() {
                this.$el = $(this.html);
                this.dorsal.wire(this.$el.get(0));
            });

            it('runs the test plugin on a DOM node', function() {
                expect(this.$el).toHaveHtml('hello, world');
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

    });
});
