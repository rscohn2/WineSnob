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
    $('#cameraButton').click(addPhotoToWine);
}

function addPhotoToWine() {
    if (cordovaReady) {
        console.log('taking a picure');
        navigator.camera.getPicture(photoSuccess, photoError);
    } else {
        alert('Camera is not available');
    }
}

function photoSuccess(imageUri) {
    var $photo = $('#pageEnterPhoto');
    $photo.attr('src', imageUri);
    $photo.show();
    currentWine.photo = imageUri;
}

function photoError(message) {
    console.log('photo error');
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
        notes: currentWine.notes,
        photo: currentWine.photo
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
    currentWine = {};
    prepareEnterPage();
}

function homeButtonClicked() {
    pageMainShowSplash();
}

function editButtonClicked() {
    prepareEnterPage();
}

function prepareEnterPage() {
    var item = _.clone(currentWine);
    item.priceBottleStore = getEditPrice(currentWine.priceBottleStore);
    item.priceGlass = getEditPrice(currentWine.priceGlass);
    item.priceBottleRestaurant = getEditPrice(currentWine.priceBottleRestaurant);
    item.rating = (typeof currentWine.rating === 'number') ? currentWine.rating : 0;

    var $pageEnterBody = $('#pageEnterBody');
    var enterTemplate = $('#pageEnterTemplate').html();
    var html = Mustache.to_html(enterTemplate, item);
    $pageEnterBody.html(html);
    $('#pageEnterTemplateRating').raty({score: item.rating});
    var $photo = $('#pageEnterPhoto');
    if (item.photo) {
        $photo.show();
    }
    else {
        $photo.hide();
    }
}

function saveEnterPage() {
    currentWine.name = $('#wineName').val();
    currentWine.varietal = $('#wineVarietal').val();
    currentWine.appelation = $('#wineAppelation').val();
    currentWine.notes = $('#wineNotes').val();
    currentWine.rating = $('#pageEnterTemplateRating').raty('score');
    currentWine.priceBottleStore = parsePrice($('#winePriceBottleStore').val());
    currentWine.priceGlass = parsePrice($('#winePriceGlass').val());
    currentWine.priceBottleRestaurant = parsePrice($('#winePriceBottleRestaurant').val());

    if (currentWine.id) {
        var index = findWineIndexById(currentWine.id);
        changeWineEntry(index, currentWine);
    }
    else {
        currentWine.id = nextId.toString();
        nextId++;
        addWineEntry(currentWine);
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
    wineData[index] = item;
    localStorage['wine-db'][index] = item;
    indexWines();
}

function addWineEntry(item) {
    wineData.push(item);
    localStorage['wine-db'][wineData.length-1] = item;
    indexWines();
}

function indexWines() {
    var options = {keys: ['name']};
    fuseSearcher = new Fuse(wineData, options);
}

$(main);