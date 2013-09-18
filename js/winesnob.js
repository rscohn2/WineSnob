var wineData = null;
var fuseSearcher = null;
var currentWine = null;

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
    currentWine = findWineById(id);
    var item = {
        varietal: currentWine.varietal,
        appelation: currentWine.appelation,
        rating:  currentWine.rating,
        priceBottleStore: currentWine.storeBottlePrice.toFixed(2),
        priceGlass: currentWine.glassPrice.toFixed(2),
        priceBottleRestaurant: currentWine.restaurantBottlePrice.toFixed(2),
        notes: currentWine.notes
    };

    var $pageDetails = $('#pageDetails');
    var $pageDetailsHeaderName = $('#pageDetailsHeaderName');
    var detailsTemplate = $('#pageDetailsTemplate').html();
    var html = Mustache.to_html(detailsTemplate, item);
    $pageDetails.html(html);
    $('#pageDetailsMyRating').raty({ score: currentWine.rating, readOnly: true });
    $pageDetailsHeaderName.html(currentWine.name);
}

function addButtonClicked() {
    currentWine = null;
    prepareEnterPage();
}

function editButtonClicked() {
    prepareEnterPage();
}

function prepareEnterPage(id) {
    var item = {};
    if (currentWine !== null) {
        item.name = currentWine.name;
        item.varietal = currentWine.varietal;
        item.appelation = currentWine.appelation;
        item.notes = currentWine.notes;
    }

    var $pageEnter = $('#pageEnter');
    var enterTemplate = $('#pageEnterTemplate').html();
    var html = Mustache.to_html(enterTemplate, item);
    $pageEnter.html(html);
    $('#pageEnterTemplateRating').raty({score: currentWine.rating});
}

function findWineById(id) {
    return _.find(wineData, function(el) {
        if (el.id === id){
            return true;
        }
    });
}

$(main);