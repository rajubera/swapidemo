'use strict';

var request = require('request');

var getSWApi = require('../config/swapis');

var cachedSWData = {
    'allpeople': null,
    'allplanets': null,
    'peopleUrlMap': null
}

var fetchPeople = function(cb, page, people) {
    page = page || 1;
    people = people || [];
    if (cachedSWData.allpeople) {
        cb(null, cachedSWData.allpeople);
    } else {
        var url = getSWApi('people') + '?page=' + page;
        request.get(url, function(error, response, body) {
            if (error) {
                return cb(error);
            }
            var data = JSON.parse(body);
            people = people.concat(data.results);
            if (data.next) {
                fetchPeople(cb, (page + 1), people)
            } else {
                cachedSWData.allpeople = people;
                cb(null, cachedSWData.allpeople);
            }
        })

    }

}
var fetchPlanets = function(cb, page, planets) {
    page = page || 1;
    planets = planets || [];
    if (cachedSWData.allplanets) {
        cb(null, cachedSWData.allplanets);
    } else {
        var url = getSWApi('planets') + '?page=' + page;
        request.get(url, function(error, response, body) {
            if (error) {
                return cb(error);
            }
            var data = JSON.parse(body);
            planets = planets.concat(data.results);
            if (data.next) {
                fetchPlanets(cb, (page + 1), planets)
            } else {
                cachedSWData.allplanets = planets;
                cb(null, cachedSWData.allplanets);
            }
        })

    }

}
var getPeopleUrlMap = function() {
    if (cachedSWData.peopleUrlMap) {
        return cachedSWData.peopleUrlMap;
    } else {
        var map = {};
        for (var i = 0; i < cachedSWData.allpeople.length; i++) {
            map[cachedSWData.allpeople[i].url] = cachedSWData.allpeople[i];
        }
        cachedSWData.peopleUrlMap = map;
        return cachedSWData.peopleUrlMap;
    }
}
exports.getCharacters = function(req, res, next) {
    var sortByProp = req.query.sort;
    fetchPeople(function(err, data) {
        if (err) {
            return next(err);
        }
        if (data[0] && data[0][sortByProp]) {
            data.sort(function(p1, p2) {
                var prop1 = p1[sortByProp];
                var prop2 = p2[sortByProp];

                if (sortByProp === 'name') {
                    return prop1 > prop2 ? 1 : (prop1 == prop2) ? 0 : -1;
                } else {

                    prop1 = prop1.replace(/,/g, '');
                    prop2 = prop2.replace(/,/g, '');
                    return (Number(prop1) || Math.min()) - (Number(prop2) || Math.min());
                }
            })
        }

        res.json(data.slice(0, 50));
    })
}

exports.getCharacterByName = function(req, res, next) {
    var url = getSWApi('people') + '?search=' + req.params.name;
    request.get(url, function(error, response, body) {
        var data = JSON.parse(body);
        if (data.results[0]) {
            // res.status(200).json(data.results[0]);
            res.render('character', data.results[0]);
        } else {
            res.status(400).send('No character found with the name:' + req.params.name);
        }
    })
}
exports.getPlanetResidents = function(req, res, next) {
    fetchPeople(function(err, data) {
        if (err) {
            return next(err);
        }
        var peopleMap = getPeopleUrlMap();

        fetchPlanets(function(err, planets) {
            if (err) {
                return next(err);
            }
            var planetsResident = {};
            for (var i = 0; i < planets.length; i++) {
            	planetsResident[planets[i].name] = planets[i].residents.map(function(url){
            		return peopleMap[url].name;
            	})
            }
            res.json(planetsResident);
        })

        
    })
}
