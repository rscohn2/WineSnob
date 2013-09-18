var wineData = null;
var fuseSearcher = null;

function main() {
    initLocalStorage();
    initSearch();
}

function initLocalStorage() {
    localStorage['wine-db'] = wineTestData;
    wineData = wineTestData;
    var options = {keys: ['name']};
    fuseSearcher = new Fuse(wineData, options);
}

function initSearch() {
    var $searchBox = $('#pageMainSearchBox');
    var $searchResults = $('#pageMainWineList');
    var $splash = $('#pageMainSplash');
    var $wineCount = $('#pageMainWineCount');
    var listTemplate = $('#pageMainSearchItem').html();
    $wineCount.text(wineData.length);
    $splash.show();
    $searchResults.hide();

    var lastText = '';
    $searchBox.keyup(function() {
        var text = $searchBox.val();
        if (text !== lastText) {
            lastText = text;
            if (text) {
                var results = fuseSearcher.search(text);
                var html = Mustache.to_html(listTemplate, {results: results});
                $searchResults.html(html);
                $splash.hide();
                $searchResults.show();
            }
            else {
                $wineCount.text(wineData.length);
                $splash.show();
                $searchResults.hide();
            }
        }
    });
}

function pageMainItemClicked(id) {
    var wine = _.find(wineData, function(el) {
        if (el.id === id){
            return true;
        }
    });

    var item = {
        varietal: wine.varietal,
        appelation: wine.appelation,
        rating: wine.rating,
        priceBottleStore: wine.storeBottlePrice.toFixed(2),
        priceGlass: wine.glassPrice.toFixed(2),
        priceBottleRestaurant: wine.restaurantBottlePrice.toFixed(2),
        notes: wine.notes
    };

    var $pageDetails = $('#pageDetails');
    var $pageDetailsHeaderName = $('#pageDetailsHeaderName');
    var detailsTemplate = $('#pageDetailsTemplate').html();
    var html = Mustache.to_html(detailsTemplate, item);
    $pageDetails.html(html);
    $('#pageDetailsMyRating').raty({ score: wine.rating, readOnly: true });
    $pageDetailsHeaderName.html(wine.name);
}

$(main);