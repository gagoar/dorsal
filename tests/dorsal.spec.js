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

            setFixtures('<div class="js-d-test"></div>');
            this.dorsal.bootstrap();
        });

        it('runs the test plugin', function() {
            expect($('.js-d-test')).toHaveHtml('hello, world');
        });
    });
});
