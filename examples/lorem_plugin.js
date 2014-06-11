Dorsal.registerPlugin('lorem', function(options) {
    var type = options.data.nonStandardLorem || 'lorem',
        loremMap = {
            bacon: 'Bacon ipsum dolor sit amet jerky pastrami pork belly, meatloaf ground round kielbasa corned beef cow sausage. Pork belly leberkas boudin frankfurter. Capicola brisket prosciutto meatloaf pork. Pork belly landjaeger pancetta spare ribs shankle shoulder. Rump prosciutto jowl cow. Shankle chuck andouille t-bone rump.',
            lorem: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quaerat, eaque, sapiente, ea, porro soluta sed temporibus alias dicta iste quam similique unde consectetur rerum. Voluptas, quae soluta tempore illo ex.'
        };

    options.el.innerHTML = loremMap[type];
});
