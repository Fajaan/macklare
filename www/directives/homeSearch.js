app.directive('homeSearch', ['$rootScope', '$location', 'Home', function ($rootScope, $location, Home) {
  
  return {
    templateUrl: '/directives/homeSearch.html',
    link: function(scope, elem, attrs) {
      // Changing Menu position depending on site
      if ($location.path() == "/") {
        elem.find('.dropdown-menu').addClass('dropdown-menu-center');
      }
      else if ($location.path() == "/fastigheter" || $location.path() == "/villor" || $location.path() == "/lagenheter") {
        elem.find('.dropdown-menu').addClass('dropdown-menu-right');
      }

      // A function to show/hide wells
      scope.toggleDropdown = function(){
        //Hide/show wells
        //slideToggle is a jQuery method to hide/show elements
        elem.find('.dropdown-menu').slideToggle(700);
        
         //Change button text (example of using "elem")
        var btn = elem.find('.dropdown-toggle');
        btn.html(
          btn.html().indexOf('Sök') >= 0 ? 'Göm sök!': 'Sök här!'
        );
        if (btn.html().indexOf('Sök') >= 0) {
          scope.resetQuery();
        }
         
      };

      // add "has-success" or "has-error" after each search
      // depending on if we got results
      scope.highlight = function() {
        var className = scope.results.length > 0 ? 'has-success' : 'has-error';

        var myResult = scope.results;

        $rootScope.results = scope.results;

        console.log(scope.minAreaSel);

        // If statement that comparing selection so we reroute if the user wants all homes or just houses or apartments
        if (scope.townSel == undefined && scope.minAreaSel == undefined && scope.minPriceSel == undefined && scope.maxPriceSel == undefined && scope.minSizeSel == undefined && scope.maxRoomSel == undefined) {
           $location.path("/fastigheter");
        }
        else if (scope.townSel == 'Villor' && scope.minAreaSel == undefined && scope.minPriceSel == undefined && scope.maxPriceSel == undefined && scope.minSizeSel == undefined && scope.maxRoomSel == undefined) {
          $location.path("/villor");
        }
        else if (scope.townSel == 'Lägenhet' && scope.minAreaSel == undefined && scope.minPriceSel == undefined && scope.maxPriceSel == undefined && scope.minSizeSel == undefined && scope.maxRoomSel == undefined) {
          $location.path("/lagenheter");
        }
        else $location.path("/bostadSokning"); 

        // find my <form>, and add the class
        elem.find('form').addClass(className);

        // a second later,
        // remove the class
        setTimeout(function() {
          // find my <form>, and remove the class
          elem.find('form').removeClass(className);
        }, 2000);
      };
    },
    controller: ['$scope', 'Home', function($scope, Home) {

      // code originally from
      // src: http://lernia.nodebite.se/sokfiltrera-bygg-mongo-queries-fran-select-input/

      // The $scope variables to watch and 
      // what they correspond to in your mongoose model
      var options = {
        townSel: {
          modelHome: "type",
          type: String,
          operator: "$eq"
        },

        minAreaSel: {
          modelHome: "area",
          type: String,
          operator: "$eq"
        },

        minPriceSel: {
          modelHome: "price",
          type: Number,
          operator: "$gte"
        },

        maxPriceSel: {
          modelHome: "price",
          type: Number,
          operator: "$lte"
        },
        
          minSizeSel: {
          modelHome: "size",
          type: Number,
          operator: "$gte"
        },
        
        maxRoomSel: {
          modelHome: "rooms",
          type: Number,
          operator: "$gte"
        }
      };

      // The $scope variables to watch as an array
      var toWatch = [];
      for(var i in options){ toWatch.push(i); }

      $scope.sendQuery = function() {
        var query = {$and:[]}, partQuery, val, ops;
        // Build a mongo $and query by looping through the options
        for(var i in options){
          ops = options[i];
          // Get the value from $scope, convert numbers to numbers
          val = ops.type === Number ? $scope[i] / 1 : $scope[i];
          
          // Ignore empty and faulty values
          if(!val){ continue; }
          // if val is supposed to be a number
          // but it's not, ignore it!
          if(ops.type === Number && isNaN(val)){ continue; }

          // Build this part of the query
          partQuery = {};
          partQuery[ops.modelHome] = {};
          partQuery[ops.modelHome][ops.operator] = val;
          // Add it to the main query
          query.$and.push(partQuery);
        }
        // $and must never be an empty array
        if(query.$and.length === 0){ delete query.$and; }
        // Debug, check how the query looks
        console.log(JSON.stringify(query,'','  '));
        // Query the database through a ngResource object
        $scope.results = Home.get(query, function() {
          // run the "highlight" function from link
          // to show users if the search worked or not
          $scope.highlight();
        });
      };

      // Start Query
      $scope.startQuery = function() {
        $scope.sendQuery();
      };
      // reset all form inputs
      $scope.resetQuery = function() {
        for (var i in options) {
          $scope[i] = ''; // set ng-model to empty string (nothing)
        }
      };
    }]
  };
}]);