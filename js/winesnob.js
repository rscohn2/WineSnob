var wineData = null;
var fuseSearcher = null;
var wineCurrentItem = null;

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
    var listTemplate = $('#pageMainSearchItem').html();
    $splash.show();
    $searchResults.hide();

    $searchBox.keyup(function() {
        var text = $searchBox.val();
        var results = fuseSearcher.search(text);
        var html = Mustache.to_html(listTemplate, {results: results});
        $searchResults.html(html);
        $splash.hide();
        $searchResults.show();
    });
}

function pageMainItemClicked(id) {
    wineCurrentItem = _.find(wineData, function(el) {
        if (el.id === id){
            return true;
        }
    })
    var $pageDetails = $('#pageDetails');
    var $pageDetailsHeaderName = $('#pageDetailsHeaderName');
    var detailsTemplate = $('#pageDetailsTemplate').html();
    var html = Mustache.to_html(detailsTemplate, wineCurrentItem);
    $pageDetails.html(html);
    $pageDetailsHeaderName.html(wineCurrentItem.name);
}

$(main);
