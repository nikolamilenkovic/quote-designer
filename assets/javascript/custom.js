var app = angular.module("PhotoDesigner", ['colorpicker.module', 'ui.bootstrap-slider']);

app.factory('instagram', ['$http', function($http){
	return {
		fetchHashtag: function(hashtag, callback){
			
			var endPoint = "https://api.instagram.com/v1/tags/"+hashtag+"/media/recent?client_id=642176ece1e7445e99244cec26f4de1f&callback=JSON_CALLBACK";
			
			$http.jsonp(endPoint).success(function(response){
				callback(response.data);
			});
		}
	}

}]);

app.directive('myEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if(event.which === 13) {
				scope.$apply(function (){
					scope.$eval(attrs.myEnter);
				});
				
				event.preventDefault();
			}
		});
	};
});

app.controller('PhotoEditorController', ['$scope', 'instagram', function ($scope, instagram){
	$scope.instagram = {};
	$scope.instagram.pics = [];
	$scope.instagram.query = "women";
	$scope.instagram.selected = -1;

	$scope.url = "";

	$scope.settings = {};
	$scope.settings.text = "Žene UVEK tačno ZNAJU šta rade, ali NIKAD ne znaju šta HOĆE! ";
	$scope.settings.textColor = "#ffffff";
	$scope.settings.shadowColor = "#000000";
	$scope.settings.fontSize = "40";
	$scope.settings.textWidth = 0.7;
	$scope.settings.font = "Times New Roman";
	$scope.settings.textVerticalPosition = 0;

	$scope.output = {};
	$scope.output.image = "";

	$scope.instagram.search = function(){
		instagram.fetchHashtag($scope.instagram.query, function(data){
			$scope.instagram.selected = -1;
			$scope.instagram.pics = data;
		});
	}

	$scope.instagram.select = function(id){
		$scope.instagram.selected = id;

		$scope.url = $scope.instagram.pics[$scope.instagram.selected].images.standard_resolution.url;

		$scope.rerender();
	}

	$scope.rerender = function(){
		if($scope.url == "") return false;
		
		var width = 640;
		var height = 640;

		var fontSizePt = $scope.settings.fontSize;
		var fontSizePx = 4 / 3 * fontSizePt;


		var canvas = document.getElementById("image");


		var imageObj = new Image();

		imageObj.crossOrigin = "Anonymous";

		imageObj.onload = function(){
			var scale = height / imageObj.height;
			width = imageObj.width * scale;

			canvas.width = width;
			canvas.height = height;

			var context = canvas.getContext("2d");

			context.drawImage(imageObj, 0, 0, width, height);
			context.font = fontSizePt+"pt "+$scope.settings.font;

			var lines = $scope.getLines(context, $scope.settings.text, width*$scope.settings.textWidth);

			var top = (height - lines.length * fontSizePx) / 2;

			for(i = 0; i < lines.length; i++){
				var textWidth = context.measureText(lines[i]).width;

				context.fillStyle = $scope.settings.shadowColor;
				context.fillText(lines[i], (width - textWidth) / 2 + 1, top + fontSizePx * (i + 1) + 1 + $scope.settings.textVerticalPosition);

				context.fillStyle = $scope.settings.textColor;
				context.fillText(lines[i], (width - textWidth) / 2, top + fontSizePx * (i + 1) + $scope.settings.textVerticalPosition);
			}

			document.getElementById("imageOut").src = canvas.toDataURL("image/png");
		};
		imageObj.src = "https://crossorigin.me/"+$scope.url; 
	}

	$scope.getLines = function(ctx, text, maxWidth) {
		var words = text.split(" ");
		var lines = [];

		var currentLine = words[0];

		for (var i = 1; i < words.length; i++) {
			var word = words[i];
			var width = ctx.measureText(currentLine + " " + word).width;
			if (width < maxWidth) {
				currentLine += " " + word;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		}

		if(currentLine != ""){
			lines.push(currentLine);
		}

		return lines;
	}

	$scope.instagram.isSelected = function(id){
		return $scope.instagram.selected == id;
	}

	$scope.instagram.search();
}]);

