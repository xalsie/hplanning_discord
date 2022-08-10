(function(angular) {
  'use strict';
  var app = angular.module('appRoot', []);

  app.filter('unixToDate', () => {
    return (x) => {
      return moment.unix(x).format("lll");
    }
  });

  app.controller('appCommon', ['$scope', '$http', '$location', ($scope, $http, $location) => {
    // ##############
    // Déclaration Func
    $scope.onClick = (e) => {
      if (e.target.className != "nav-link text-white") return; // is not section not return

      if (($scope.editableLine || $scope.btnSave)) {
        if (!window.confirm("Les actions ne sont pas enregistré, Etes-vous sur de vouloir quitter la page ?")) {
          e.preventDefault();
          return false;
        }
      }

      $scope.editableLine = false;
      $scope.btnSave = false;

      $scope.sidenav = e.target.attributes[1].value;
      $scope.sectionTitle = e.target.innerHTML;
      if ($scope.sidenav != 8) $scope.getFromUrl($scope.sidenav);
    }

    $scope.autoSelectUrl = () => {
      if (!$location.url()) {
        $scope.sidenav      = 1;
        $scope.sectionTitle = "📈｜Blanchiment semaine";
        $scope.getFromUrl($scope.sidenav);
        return;
      }

      $scope.sidenav = $location.url().replace(/#/gi, '');
      $scope.sectionTitle = Object.values($("a.nav-link")).filter((item) => {return (item.hash == $location.url())})[0].outerText;
      if ($scope.sidenav != 8) $scope.getFromUrl($scope.sidenav);
    }
    

    $scope.getPseudoById = async (id) => {
      var response = await $http.get("/getPseudoById?id="+id);

      return response.data;
    }

    $scope.getFromUrl = async (idNav) => {
      $http.get("/inventaire").then((response) => {
        $scope.responseMap = response.data;
        $scope.sectionData = response.data.list[idNav];
        $scope.toDateUpdateSection = response.data.list[idNav].majTime;
        $http.get("/getPseudoById?id="+response.data.list[idNav].majId).then((responsePseudo) => {
          $scope.toNameUpdateSection = responsePseudo.data;
        })
      })
    }

    $scope.saveJson = () => {
      for (let i = 1; i <= Object.keys($scope.sectionData).length-2; i++) {
        // console.log($scope.sectionData[i]);
        // console.log(Object.keys($scope.sectionData));
        if ($scope.sectionData[i].tmp == "1")
          $scope.sectionData[i].tmp = "0";
      }

      $scope.responseMap.list[$scope.sidenav] = $scope.sectionData;

      // console.log(JSON.stringify($scope.logs));
      var logsString = JSON.stringify($scope.logs);

      $http({
        method: "POST",
        url: "/savejson",
        dataType: 'json',
        data: {
          autofunc: true,
          action: JSON.stringify($scope.responseMap),
          section: ($scope.sidenav).toString(),
          logs: logsString
        },
        headers: { "Content-Type": "application/json" }
      }).then((response) => {
        console.log("success");

        $scope.toNameUpdateSection = (($scope.session.pseudo)? $scope.session.pseudo:$scope.session.firstname+" "+$scope.session.lastname);
        $scope.toDateUpdateSection = moment().unix();

        $scope.logs.delete = {};
        $scope.logs.modify = {};
        $scope.logs.add = {};
      });

      $scope.editableLine   = false;
      $scope.btnSave        = false;
    }

    $scope.saveLine = (key, data) => {
      switch ($scope.param()) {
        case 1:
          $scope.sectionData[key["key"]].Icone  = data.Icone;
          $scope.sectionData[key["key"]].Name   = data.Name;
          $scope.sectionData[key["key"]].Cash   = data.Cash;
          break;
        case 2:
          $scope.sectionData[key["key"]].countItems = data.countItems;
          $scope.sectionData[key["key"]].nameItems  = data.nameItems;
          break;
      }

      if ($scope.sectionData[key["key"]].tmp == '1') {
        $scope.logs.add[$scope.sectionData[key["key"]].uuid] = $scope.sectionData[key["key"]];
      } else {
        var uuid = $scope.sectionData[key["key"]].uuid;

        $scope.logs.modify[uuid] = $scope.sectionData[key["key"]];
      }

      // console.log($scope.logs);
      // console.log($scope.sectionData[key["key"]]);

      $scope.sectionData.majId    = $scope.session.iduser;
      $scope.sectionData.majTime  = moment().unix();

      // $scope.saveJson();
      $scope.editableLine   = false;
      $scope.btnSave        = true;
    }

    $scope.editLine = (key) => {
      $scope.editableLine = true;
    }

    $scope.addLine = (key) => {
      var _uuid = uuidGen(5);
      var obj = {};

      switch ($scope.param($scope.sidenav)) {
        case 1:
          obj = {Icone: "❓", Name: "———", Cash: 0, tmp: "1", uuid: _uuid};
          $scope.sectionData[Object.keys($scope.sectionData).length+1-2] = obj;
          break;
        case 2:
          obj = {countItems: 0, nameItems: "Armes", tmp: "1", uuid: _uuid};
          $scope.sectionData[Object.keys($scope.sectionData).length+1-2] = obj;
          break;
      }

      Object.assign($scope.logs.add, {[_uuid]: obj});

      $scope.btnSave = true;
    }

    $scope.deleteLine = (key, data) => {
      var _arrayCount = Object.keys($scope.sectionData).length-2;

      // if ($scope.sectionData[key["key"]].tmp != "1") Object.assign($scope.logs.delete, {[$scope.sectionData[key["key"]].uuid]: $scope.sectionData[key["key"]]});
      if ($scope.sectionData[key["key"]].tmp != "1") $scope.logs.delete.push($scope.sectionData[key["key"]].uuid);

      delete $scope.logs.modify[$scope.sectionData[key["key"]].uuid];

      delete $scope.sectionData[key["key"]];
      let i = 1;
      for (let key of Object.keys($scope.sectionData)) {
        if (key == "majId" || key == "majTime")
          console.log("   -> true - "+key);
        else
          $scope.sectionData[i++] = $scope.sectionData[key];
      }
      if (parseInt(key["key"]) != _arrayCount) delete $scope.sectionData[Object.keys($scope.sectionData).length-2]

      // console.log($scope.logs);

      $scope.editableLine = false;
      $scope.btnSave      = true;
    }

    $scope.upLine = (key) => {
      key = parseInt(key["key"]);

      if (key === 0) return;
      [$scope.sectionData[key], $scope.sectionData[key-1]] = [$scope.sectionData[key-1], $scope.sectionData[key]];

      $scope.edit     = false;
      $scope.btnSave  = true;
    }

    $scope.downLine = (key) => {
      key = parseInt(key["key"]);

      if (key === Object.keys($scope.sectionData).length) return;
      [$scope.sectionData[key], $scope.sectionData[key+1]] = [$scope.sectionData[key+1], $scope.sectionData[key]];

      $scope.edit     = false;
      $scope.btnSave  = true;
    }

    $scope.param = (data) => {
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

    $scope.getSession = () => {
      $http({
        method: "POST",
        url: "/getSession",
        dataType: 'json',
        data: {
          autofunc: true
        },
        headers: { "Content-Type": "html/json" }
      }).then((res) => {
        $scope.session    = res.data;
        $scope.session.grade = parseInt($scope.session.grade);
        $scope.permission = ($scope.session.loggedin && $scope.session.permission == 1);
      });
    }

    $scope.getProfile = () => {
      $http({
        method: "POST",
        url: "/getProfile",
        dataType: 'json',
        data: {
          autofunc: true
        },
        headers: { "Content-Type": "html/json" }
      }).then((res) => {
        $scope.profile  = res.data;
      });
    }

    $scope.saveProfile = () => {
      var profile = JSON.stringify($scope.profile);

      $http({
        method: "POST",
        url: "/saveprofile",
        dataType: 'json',
        data: {
          autofunc: true,
          action: profile
        },
        headers: { "Content-Type": "application/json" }
      }).then((res) => {
        console.log(res);

        $scope.profile.date_modif = moment().unix();
        $scope.profile.modif_name = $scope.profile.pseudo;

        $scope.session.fname    = $scope.profile.firstname;
        $scope.session.lname    = $scope.profile.lastname;
        $scope.session.pseudo   = $scope.profile.pseudo;
        $scope.session.group    = $scope.profile.group;
        $scope.session.grade    = $scope.profile.grade;
        $scope.session.permission = ($scope.session.loggedin && $scope.profile.permission == 1);
        // $scope.session    = res.data;
        // $scope.permission = ($scope.session.loggedin && $scope.session.permission == 1);
      });
    }

    $scope.convertNumber = (x) => {
      return "$ "+parseInt(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    window.addEventListener("beforeunload", function (e) {
      if ($scope.editableLine || $scope.btnSave) {
        var confirmationMessage = "\o/";
      
        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
      }

      return false;
    });

    // ############
    // Init
    $scope.responseMap  = $scope.editableLine = $scope.btnSave = false;
    $scope.sectionData  = false;
    $scope.permission   = false;
    $scope.toNameUpdateSection = "";
    $scope.toDateUpdateSection = "";
    $scope.logs = {};
    $scope.logs.delete = [];
    $scope.logs.modify = {};
    $scope.logs.add = {};

    $scope.getSession();
    $scope.getProfile();

    $scope.autoSelectUrl();
  }]);

})(window.angular);

function uuidGen(count) {
  var founded = false;
  var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
  var str = '';

  for(var i = 0; i < count; i++) {
      str += _sym[parseInt(Math.random() * (_sym.length))];
  }

  return "$1/"+str;
}