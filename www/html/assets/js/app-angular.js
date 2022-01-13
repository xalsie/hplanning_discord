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
          // $http.get("/majDiscord");
        });

        $scope.editableLine   = false;
        $scope.btnSave        = false;
      }
    
      $scope.saveLine = function(key, data) {
        switch ($scope.param()) {
          case 1:
            $scope.sectionData[key["key"]].Icone      = data.Icone;
            $scope.sectionData[key["key"]].Name       = data.Name;
            $scope.sectionData[key["key"]].Cash       = data.Cash;
            break;
          case 2:
            $scope.sectionData[key["key"]].countItems = data.countItems;
            $scope.sectionData[key["key"]].nameItems  = data.nameItems;
            break;
        }

        // $scope.saveJson();
        $scope.editableLine   = false;
        $scope.btnSave        = true;
      }

      $scope.editLine = function(key) {
        $scope.editableLine = true;
      }

      $scope.addLine = function(key) {
        switch ($scope.param($scope.sidenav)) {
          case 1:
            $scope.sectionData[Object.keys($scope.sectionData).length+1] = {Icone: "❓", Name: "———", Cash: 0};
            break;
          case 2:
            $scope.sectionData[Object.keys($scope.sectionData).length+1] = {countItems: 0, nameItems: "Armes"};
            break;
        }

        $scope.btnSave = true;
      }

      $scope.deleteLine = function(key, data) {
        delete $scope.sectionData[key["key"]];

        let i = 1;
        for (let key of Object.keys($scope.sectionData)) {
          console.log(i +" -"+ key);
          $scope.sectionData[i++] = $scope.sectionData[key];
        }
        delete $scope.sectionData[Object.keys($scope.sectionData).length]
        
        $scope.editableLine   = false;
        $scope.btnSave        = true;
      }

      $scope.param = function(data) {
        var _rtn = false;
        data = parseInt(data);

        switch (data) {
          case 1: case 2: case 3: case 7:
            _rtn = 1;
            break;
          case 4: case 5: case 6:
            _rtn = 2;
            break;
        }

        return _rtn;
      }

      $scope.convertNumber = (x) => {
        return "$ "+parseInt(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      }

      // ############
      // Init
      $scope.responseMap = $scope.editableLine = $scope.btnSave = false;
      $scope.sidenav = 1;
      $scope.sectionTitle = "📈｜Blanchiment semaine";
      $scope.getFromUrl($scope.sidenav);
  }]);
})(window.angular);