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

DorsalDeferred = function(dorsal) {
    var status = 'pending',
        doneFns = [],
        failFns = [],
        progressFns = [],
        dfd = this,
        promise;

    promise = {
        state: function() {
            return dfd.state();
        },
        done: function(fn) {
            if (status === 'resolved') {
                fn.call(dfd, dorsal);
            }

            doneFns.push(fn);

            return dfd;
        },
        fail: function(fn) {
            if (status === 'rejected') {
                fn.call(dfd, dorsal);
            }

            failFns.push(fn);

            return dfd;
        },
        progress: function(fn) {
            progressFns.push(fn);

            return dfd;
        }
    };

    dfd.state = function() {
        return status;
    };

    dfd.notify = function() {
        var i,
            length = progressFns.length;

        for (i = 0; i < length; i++) {
            progressFns[i].call(dfd, dorsal);
        }
    };

    dfd.reject = function() {
        var i,
            length = failFns.length;

        status = 'rejected';

        for (i = 0; i < length; i++) {
            failFns[i].call(dfd, dorsal);
        }
    };

    dfd.resolve = function() {
        var i,
            length = doneFns.length;

        status = 'resolved';

        for (i = 0; i < length; i++) {
            doneFns[i].call(dfd, dorsal);
        }
    };

    dfd.promise = function() {
        return promise;
    };

    return dfd;
};
