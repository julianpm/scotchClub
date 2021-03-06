var scotchApp = {};

scotchApp.apiKey = 'MDpiNWNjYzYyMi03NzY4LTExZTUtOWMxYi01M2MyMTlmYjk0MGU6UVA1bFkyNmhBOGg2NUhwQklHYjVUbXhGaVJENnZQS0tHQVR6';
scotchApp.lat = '';
scotchApp.lon = '';



scotchApp.formSubmit = function(){
	$('.submit-form').on('submit',function(e){
		e.preventDefault();
		scotchApp.findScotch();
		$('.map-size').fadeOut();
	});
};



scotchApp.findScotch = function(){
	var apiURL = 'http://lcboapi.com/products';
	$.ajax({
		url:apiURL,
		method:'GET',
		dataType:'jsonp',
		data:{
			key:scotchApp.apiKey,
			q:'scotch',
			per_page:100,
			order:'price_in_cents.asc'	
		}
	}).then(function(res){
		scotchApp.filterPrice(res.result);
	});
};



scotchApp.filterPrice = function(result){
	var threshold = 60
	var bottleFilter = result.filter(function(value){
		var priceInDollars = (value.price_in_cents/ 100).toFixed(2);			
		if($('input[value=over60]:checked').length > 0){
			return priceInDollars >= threshold && value.image_thumb_url
		} else {
			return priceInDollars < threshold && value.image_thumb_url
		} 
	});
	scotchApp.filterType(bottleFilter);
};



scotchApp.filterType = function(result){
	var typeFilter = result.filter(function(value){
		if($('input[value=single]:checked').length > 0){
			return value.varietal === 'Scotland Malt'
		} else {
			return value.varietal === 'Scotland Blend'
		}
	});
	scotchApp.displayScotch(typeFilter)
};




scotchApp.displayScotch = function(lotsOfScotch){
	$('.clubHeader').fadeOut();
	$('.selectHeader').show();
	$('.results').html('');
	$.each(lotsOfScotch, function(i,value){
		var priceInDollars = (value.price_in_cents/ 100).toFixed(2);
			$('<p>').addClass('scotchPrice').text('$' + value.price_in_cents);
		var name = $('<h3>').addClass('scotchName').text(value.name);
		var bottle = $('<img>').addClass('scotchBottle').attr('src',value.image_thumb_url);
		var variety = $('<p>').addClass('scotchVariety').text(value.varietal);
		var selectButton = $('<p>').addClass('selectButton').text('Select');
		var container = $('<div>').addClass('scotchInfo').attr('data-id', value.id).append(bottle,selectButton,name,variety,priceInDollars);
		$('.results').append(container);

	});
	scotchApp.singleClick();
};




scotchApp.singleClick = function(){
	$('.scotchInfo').on('click',function(){
			var id = $(this).data('id');
			scotchApp.mapScotch(id);
			scotchApp.scotchStores();
			scotchApp.initMap();
			$('.selectHeader').hide();
	});
}




scotchApp.mapScotch = function(id){
	var apiURL = 'http://lcboapi.com/products/' + id;
	$.ajax({
		url:apiURL,
		method:'GET',
		dataType:'jsonp'
		
	}).then(function(res){
		scotchApp.singleScotch(res.result);
	});
};


scotchApp.scotchStores = function(){
	var apiURL = 'http://lcboapi.com/stores/';
	$.ajax({
		url:apiURL,
		method:'GET',
		dataType:'jsonp',
		data:{
			key:scotchApp.apiKey,
			lat: scotchApp.lat,
			lon: scotchApp.lng
		}
	}).then(function(res){
		scotchApp.initMap(res.result[0].latitude, res.result[0].longitude);
		console.log(res);
	});
};



scotchApp.initMap = function(lat,lng) {
  var myLatLng = {lat:lat, lng:lng};
  // Create a map object and specify the DOM element for display.
  var map = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    scrollwheel: false,
    zoom: 15
  });
  // Create a marker and set its position.
  var marker = new google.maps.Marker({
    map: map,
    position: myLatLng,
    title: 'LCBO'
  });
  scotchApp.showMap();
}








// We have the product ID.  Must get store IDs close to us.  Using those
// store IDs, we have to check if product exists in their inventory.
// List store.


scotchApp.singleScotch = function(single){
	$('.scotchInfo').fadeOut();
		var priceInDollars = (single.price_in_cents/ 100).toFixed(2);
			$('<p>').addClass('scotchPrice').text('$' + single.price_in_cents);
		var name = $('<h3>').addClass('scotchName').text(single.name);
		var bottle = $('<img>').addClass('scotchBottle').attr('src',single.image_thumb_url);
		var variety = $('<p>').addClass('scotchVariety').text(single.varietal);
		var scotchStyle = '';
		if (single.style === null){
			// Do nuffin
		}
		else{
			scotchStyle = single.style
		}
		var style = $('<p>').addClass('scotchStyle').text(scotchStyle);
		var tasting_note = '';
		if (single.tasting_note === null){
			//Do nothing
		}
		else {
			tasting_note = single.tasting_note;
		}
		var taste = $('<p>').addClass('scotchTaste').text(tasting_note);
		var serveSugg = '';
		if (single.serving_suggestion === null){
			// Do nuffin
		}
		else{
			serveSugg = single.serving_suggestion;
		}
		var serve = $('<p>').addClass('scotchServe').text(serveSugg);
		var backButton = $('<button>').addClass('backButton').text('Back');
		var container = $('<div>').addClass('scotchSpecific').append(name,bottle,variety,style,taste,serve,priceInDollars,backButton);	
		$('.results').append(container);
};




scotchApp.showMap = function(){
	var lcboMap = $('<div>').addClass('theMap');
	$('.map-size').on('click').fadeIn();
};






scotchApp.backClick = function(){
	$('.results').on('click', '.backButton', function(){
		$('.scotchInfo').fadeIn();
		$('.scotchSpecific').fadeOut();
		$('.map-size').fadeOut();
		$('.selectHeader').show();
	});
};

scotchApp.formSelect = function() {
	$('.input-btn').click(function() {
		$(this).toggleClass('clicked');
	});
};



scotchApp.init = function(){
	navigator.geolocation.getCurrentPosition(function(res){
		console.log(res);
		scotchApp.formSelect();
		scotchApp.lat = res.coords.latitude;
		scotchApp.lng = res.coords.longitude;
		scotchApp.formSubmit();
		scotchApp.backClick();
	});
	// scotchApp.findScotch();
	// 	$(#priceOption).on('change',function(){
	// 		var priceOption = $(this).val();
	// 	});
	// 	$(#typeOption).on('change',function(){
	// 		var typeOption = $(this).val();
	// 	});
};



$(function(){
	scotchApp.init();
});








// result will be a filtered list based on price and type
// displayed in flickity format

// When user finds scotch they want, clicking on a picture
// of the bottle will bring up additional information
// and a map to the nearest LCBO with the desired product
// in stock.





