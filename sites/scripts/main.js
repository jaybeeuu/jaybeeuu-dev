$(ready);

function ready() {
	getLastPage();

	$('#title span').click(goHome);
	$('#navList').click(navClicked);
}

function getLastPage()
{
	loadPage($.cookie('lastPage'));
}

function goHome()
{
	loadPage('home');
}

function loadPage(page)
{
	if (!page) page = "home";

	var url = 'parts/' + page + '.html';

	$.get(url, function (page) {
		$('#content').html(page);
	});

	$.cookie('lastPage', page);
}

function navClicked(event)
{
	var target = event.target;

	var page = target.id;

	loadPage(page);
}