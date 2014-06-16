Dorsal
======
[![Build Status](https://travis-ci.org/eventbrite/dorsal.svg)](https://travis-ci.org/eventbrite/dorsal) [![NPM version](https://badge.fury.io/js/dorsal.svg)](http://badge.fury.io/js/dorsal) [![Code Climate](https://codeclimate.com/github/eventbrite/dorsal.png)](https://codeclimate.com/github/eventbrite/dorsal)
What is it?
-----------

TL;DR, a client-side JavaScript boilerplate automation system.

Dorsal allows you to register your bespoke. It will then scour the DOM in search of your plugins and instantiate them. We were inspired by the directives system in Angular and wanted to bring something similar to our frontend stack. Dorsal is platform agnostic, has no dependencies, and has been tested to work with IE8+, Firefox, Safari, and Chrome.

## Setup

Dorsal is agnostic to AMD, CommonJS and namespaces.

- CommonJS/Node: `require('dorsal')`
- AMD: `require('node_modules/dorsal/dist/dorsal')`
- Namespaces: `window.Dorsal` after adding src/dorsal.js as a script

Installation is easiest using npm: `npm install dorsal --save`

API
---

## Register a plugin

The following is an example of a plugin and its usage. We define a Dorsal plugin named `hello-world`. Once `wire` is called Dorsal will query for `.js-d-hello-world` in the DOM and all occurances will be initialized.

    <div class='js-d-hello-world'></div>

    <script>
        Dorsal.registerPlugin('hello-world', function(options) {
            console.log(this === options.el); // true

            options.el.innerHTML = 'Hello World';
        });

        Dorsal.wire()
    </script>

## Wiring

You don't need to wire your whole page. `Dorsal.wire()` accepts an element as an optional argument. If no element is provided it will use `document` as the parent and find all occurances within it.

    <div class='js-d-other-plugin'></div>

    <div class='some-arbitrary-parent-selector'>
        <div class='js-d-hello-world'></div>
        <div class='js-d-hello-world'></div>
        <div class='js-d-hello-world'></div>
    </div>

    <script>
        // if using jquery
        Dorsal.wire($('.js-d-other-plugin').get(0));
        Dorsal.wire($('.some-arbitrary-parent-selector').get(0));
    </script>

## Arguments and Data Attributes

Sometimes you will want to pass options to your selectors. In such cases you can use data attributes.

    <div
        class='js-d-hello-world'
        data-d-non-standard-hello-variant='bacon'
        data-d-prefix='Ohhhh, '
    ></div>

    <script>
        Dorsal.registerPlugin('hello-world', function(options) {
            console.log(options.data.nonStandardHelloVariant); // bacon

            var helloMap = [
                    bacon: 'Bacon world',
                    default: 'Hello world'
                ],
                variant = options.nonStandardHelloVariant || 'default',
                prefix = options.data.prefix || '';

            options.el.innerHTML = prefix + helloMap[variant];
        });

        Dorsal.wire()
    </script>

Examples
--------

See it in action by opening `examples/lorem.html`. This use case automatically inserts Lorem ipsum wherever a `.js-d-lorem` class is used.


License
-------

Copyright 2014 Eventbrite

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

See LICENSE.md.
