var wineData = null;
var fuseSearcher = null;
var currentWine = null;
var nextId = 0;

function main() {
    initWineEntries(wineTestData);
    initEnterPage();
    initSearch();
}

function initEnterPage() {
    $('cameraButton').on('tap', addPhotoToWine)
}

function addPhotoToWine() {
    if (cordovaReady) {
        navigator.camera.getPicture(photoSuccess, photoError);
    } else {
        alert('Camera is not available');
    }
}

function photoSuccess(imageURI) {
    console.log('Photo at: ' + imageURI);    
}

function photoError(message) {
    // IOS quirk
    setTimeout(function() {
        alert('Error taking photo');
    }, 0);
}

function initSearch() {
    var $searchBox = $('#pageMainSearchBox');
    var $searchResults = $('#pageMainWineList');
    var $splash = $('#pageMainSplash');
    var listTemplate = $('#pageMainSearchItem').html();

    pageMainShowSplash();

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
                pageMainShowSplash();
            }
        }
    });
}

function pageMainShowSplash() {
    var $searchBox = $('#pageMainSearchBox');
    var $searchResults = $('#pageMainWineList');
    var $splash = $('#pageMainSplash');
    var $wineCount = $('#pageMainWineCount');

    $searchBox.val('');
    $wineCount.text(wineData.length);
    $splash.show();
    $searchResults.hide();
}

function pageMainItemClicked(id) {
    currentWine = findWineById(id);
    var item = {
        varietal: currentWine.varietal,
        appelation: currentWine.appelation,
        rating:  currentWine.rating,
        priceBottleStore: getDisplayPrice(currentWine.priceBottleStore),
        priceGlass: getDisplayPrice(currentWine.priceGlass),
        priceBottleRestaurant: getDisplayPrice(currentWine.priceBottleRestaurant),
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

function getEditPrice(price) {
    return ((price) ? ('$' + price.toFixed(2)) : null);
}

function parsePrice(price) {
    price = (price[0] === '$') ? price.slice(1) : price;
    var val = parseFloat(price);
    return (isNaN(val)) ? null : val;
}

function addButtonClicked() {
    currentWine = null;
    prepareEnterPage();
}

function homeButtonClicked() {
    pageMainShowSplash();
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
        item.priceBottleStore = getEditPrice(currentWine.priceBottleStore);
        item.priceGlass = getEditPrice(currentWine.priceGlass);
        item.priceBottleRestaurant = getEditPrice(currentWine.priceBottleRestaurant);
    }

    var $pageEnterBody = $('#pageEnterBody');
    var enterTemplate = $('#pageEnterTemplate').html();
    var html = Mustache.to_html(enterTemplate, item);
    $pageEnterBody.html(html);
    var score = (currentWine !== null) ? item.rating : 0;
    $('#pageEnterTemplateRating').raty({score: score});
}

function saveEnterPage() {
    var item = {
        name: $('#wineName').val(),
        varietal: $('#wineVarietal').val(),
        appelation: $('#wineAppelation').val(),
        notes: $('#wineNotes').val(),
        rating: $('#pageEnterTemplateRating').raty('score'),
        priceBottleStore: parsePrice($('#winePriceBottleStore').val()),
        priceGlass: parsePrice($('#winePriceGlass').val()),
        priceBottleRestaurant: parsePrice($('#winePriceBottleRestaurant').val())
    };

    if (currentWine) {
        var index = findWineIndexById(currentWine.id);
        changeWineEntry(index, item);
    }
    else {
        addWineEntry(item);
    }
    pageMainShowSplash();
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