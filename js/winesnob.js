var wineData = null;
var fuseSearcher = null;
var currentWine = null;
var nextId = 0;

function main() {
    initWineEntries(wineTestData);
    initSearch();
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
        priceBottleStore: getDisplayPrice(currentWine.storeBottlePrice),
        priceGlass: getDisplayPrice(currentWine.glassPrice),
        priceBottleRestaurant: getDisplayPrice(currentWine.restaurantBottlePrice),
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

function getDisplayPrice(price) {
    return ((typeof price === 'number') ? ('$' + price.toFixed(2)) : '-');
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
        item.rating = currentWine.rating;
    }

    var $pageEnter = $('#pageEnter');
    var enterTemplate = $('#pageEnterTemplate').html();
    var html = Mustache.to_html(enterTemplate, item);
    $pageEnter.html(html);
    var score = (currentWine !== null) ? item.rating : 0;
    $('#pageEnterTemplateRating').raty({score: score});
}

function saveEnterPage() {
    var item = {
        name: $('#wineName').val(),
        varietal: $('#wineVarietal').val(),
        appelation: $('#wineAppelation').val(),
        notes: $('#wineNotes').val(),
        rating: $('#pageEnterTemplateRating').raty('score')
    };

    if (currentWine) {
        var index = findWineIndexById(currentWine.id);
        changeWineEntry(index, item);
    }
    else {
        addWineEntry(item);
    }
}

function findWineById(id) {
    return _.find(wineData, function(el) {
        if (el.id === id){
            return true;
        }
    });
}

function findWineIndexById(id) {
    for (var i = 0;  i < wineData.length;  i++) {
        if (wineData[i].id === id) {
            return i;
        }
    }
    return -1;
}

function initWineEntries(wines) {
    localStorage['wine-db'] = wines;
    wineData = wines;
    nextId = wineData.length;
    indexWines();
}

function changeWineEntry(index, item) {
    item.id = wineData[index].id;
    wineData[index] = item;
    localStorage['wine-db'][index] = item;
    indexWines();
}

function addWineEntry(item) {
    item.id = nextId.toString();
    nextId++;
    wineData.push(item);
    localStorage['wine-db'][wineData.length-1] = item;
    indexWines();
}

function indexWines() {
    var options = {keys: ['name']};
    fuseSearcher = new Fuse(wineData, options);
}

$(main);