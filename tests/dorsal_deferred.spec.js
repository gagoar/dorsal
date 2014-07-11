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

describe("DorsalDeferred", function() {
    beforeEach(function() {
        this.dorsal = { dorsal: true };
        this.doneStub = sinon.stub();
        this.doneStub2 = sinon.stub();
        this.failStub = sinon.stub();
        this.failStub2 = sinon.stub();

        this.deferred = new DorsalDeferred(this.dorsal);
        this.promise = this.deferred.promise();
    });

    it('initializes with a pending state', function() {
        expect(this.deferred.state()).toBe('pending');
    });

    it('can return a promise', function() {
        expect(this.promise.done).not.toBeUndefined();
        expect(this.promise.fail).not.toBeUndefined();
        expect(this.promise.progress).not.toBeUndefined();
    });

    describe('when resolved', function() {
        beforeEach(function() {
            this.promise.done(this.doneStub);
            this.promise.done(this.doneStub2);
            this.promise.fail(this.failStub);
            this.promise.fail(this.failStub2);

            this.deferred.resolve();
        });

        it('triggers done functions', function() {
            expect(this.doneStub).toHaveBeenCalledOnce();
            expect(this.doneStub2).toHaveBeenCalledOnce();
        });

        it('calls the done function with the dorsal object', function() {
            expect(this.doneStub).toHaveBeenCalledWith(this.dorsal);
        });

        it('does not trigger fail functions', function() {
            expect(this.failStub).not.toHaveBeenCalled();
            expect(this.failStub2).not.toHaveBeenCalled();
        });

        it('runs new done functions after being resolved', function() {
            var stub = sinon.stub();
            this.promise.done(stub);

            expect(stub).toHaveBeenCalled();
        });

        it('sets status to resolved', function() {
            expect(this.deferred.state()).toBe('resolved');
        });
    });

    describe('when rejected', function() {
        beforeEach(function() {
            this.promise.done(this.doneStub);
            this.promise.done(this.doneStub2);
            this.promise.fail(this.failStub);
            this.promise.fail(this.failStub2);

            this.deferred.reject();
        });

        it('triggers fail functions', function() {
            expect(this.failStub).toHaveBeenCalledOnce();
            expect(this.failStub2).toHaveBeenCalledOnce();
        });

        it('calls the fail function with the dorsal object', function() {
            expect(this.failStub).toHaveBeenCalledWith(this.dorsal);
        });

        it('does not trigger done functions', function() {
            expect(this.doneStub).not.toHaveBeenCalled();
            expect(this.doneStub2).not.toHaveBeenCalled();
        });

        it('runs new fail functions after being rejected', function() {
            var stub = sinon.stub();
            this.promise.fail(stub);

            expect(stub).toHaveBeenCalled();
        });

        it('sets status to rejected', function() {
            expect(this.deferred.state()).toBe('rejected');
        });
    });

    describe('when notifying progress', function() {
        beforeEach(function() {
            this.progressStub = sinon.stub();
            this.promise.progress(this.progressStub);

            this.deferred.notify(this.dorsal);
        });

        it('triggers progress functions', function() {
            expect(this.progressStub).toHaveBeenCalledOnce();
        });

        it('calls the progress function with the dorsal object', function() {
            expect(this.progressStub).toHaveBeenCalledWith(this.dorsal);
        });
    });
});
