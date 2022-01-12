(function(angular) {
  'use strict';
  var app = angular.module('appRoot', []);

  app.controller('appCommon', ['$scope', '$http', function($scope, $http) {
      // ##############
      // Déclaration Func
      $scope.onClick = (e) => {
        $scope.sidenav = e.target.attributes[1].value;
        $scope.sectionTitle = e.target.innerHTML;
        $scope.getFromUrl($scope.sidenav);
      }

      $scope.getFromUrl = (e) => {
        $http.get("/inventaire")
        .then(function (response) {
          $scope.responseMap = response.data;

          $scope.sectionData = false;
          $scope.sectionData = $scope.responseMap.list[e];
        });
      }

      $scope.saveJson = function() {
        $scope.responseMap.list[$scope.sidenav] = $scope.sectionData;

        $http({
          method: "POST",
          url: "/savejson",
          dataType: 'json',
          data: {
            action: JSON.stringify($scope.responseMap)
          },
          headers: { "Content-Type": "application/json" }
        }).then(function (response) {
          console.log("success");
        });
      }
    
      $scope.saveLine = function(key, data) {
        $scope.sectionData[key["key"]].icone       = data.icone;
        $scope.sectionData[key["key"]].NameGroupe  = data.NameGroupe;
        $scope.sectionData[key["key"]].Dollars     = data.Dollars;

        $scope.saveJson();

        $scope.editableLine = false;
      }

      $scope.editLine = function(key) {
        $scope.editableLine = true;
      }

      $scope.addLine = function(key, data) {
        let jsonDataTemp = $scope.sectionData;
         jsonDataTemp[Object.keys(jsonDataTemp).length+1] = {icone: "❓", NameGroupe: "———", Dollars: 0};
          $scope.saveJson();
      }

      $scope.deleteLine = function(key, data) {
        delete $scope.sectionData[key["key"]];
          $scope.saveJson();
      }

      $scope.convertNumber = (x) => {
        return "$ "+parseInt(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      }

      // ############
      // Init
      $scope.responseMap = false;
      $scope.editableLine = false;
      $scope.sidenav = 1;
      $scope.sectionTitle = "📈｜Blanchiment semaine";
      $scope.getFromUrl($scope.sidenav);
  }]);
})(window.angular);