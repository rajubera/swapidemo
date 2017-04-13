'use strict';

var baseUrl = 'https://swapi.co/api/';

var endpoints = {
    'people': 'people/',
    'planets': 'planets/'
}

var getSWApi = function(key) {
    if (endpoints[key]) {
        return baseUrl + endpoints[key]
    }

}
module.exports = getSWApi;
