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

Dorsal.registerPlugin('lorem', function(options) {
    var type = options.data.nonStandardLorem || 'lorem',
        loremMap = {
            bacon: 'Bacon ipsum dolor sit amet jerky pastrami pork belly, meatloaf ground round kielbasa corned beef cow sausage. Pork belly leberkas boudin frankfurter. Capicola brisket prosciutto meatloaf pork. Pork belly landjaeger pancetta spare ribs shankle shoulder. Rump prosciutto jowl cow. Shankle chuck andouille t-bone rump.',
            lorem: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quaerat, eaque, sapiente, ea, porro soluta sed temporibus alias dicta iste quam similique unde consectetur rerum. Voluptas, quae soluta tempore illo ex.'
        };

    options.el.innerHTML = loremMap[type];
});
