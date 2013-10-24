$(ready);

var g_currentPage;
var g_animationDuration = 500;

//**************************************************************************
// Events
//**************************************************************************

function ready()
{
	getLastPage();

	$('#title span').click(goHome);

	$('#navList').click(navClicked);

	$(window).resize(resize);
}

function setupScrollbars()
{
	$('#scroller').mCustomScrollbar();
}

function resize(event)
{
	resizeBackground(event);

	if( typeof(resizeContents) != 'undefined' ) resizeContents(event);
}

function resizeBackground(event)
{
	if (getAspectRatio(window) < getAspectRatio('#background'))
	{
		$('#background').css('height', 'auto');
		$('#background').css('width', '100%');
	}
	else
	{
		$('#background').css('height', '100%');
		$('#background').css('width', 'auto');
	}
}

function getLastPage()
{
	loadPage($.cookie('lastPage'));
}

function goHome()
{
	loadPage('home');
}

function navClicked(event)
{
	var target = event.target;

	var page = target.id.replace('Nav', '');

	loadPage(page);
}

//**************************************************************************
// Change Page
//**************************************************************************

function loadPage(page)
{
	if (!page) page = "home";

	if (page == g_currentPage) return;

	var url = 'parts/' + page + '.html';

	$.get(url, changeContents);

	setCurrentPage(page);
}

function setCurrentPage(newPage)
{
	unhighlight(g_currentPage);

	g_currentPage = newPage;

	$.cookie('lastPage', newPage);

	highlight(newPage);
}

function changeContents(page)
{
	if ( typeof(closeDownContents) != "undefined" ) closeDownContents();

	$('#content').fadeOut(g_animationDuration, function ()
	{
		$('#content').html(page);
		$('#content').fadeIn(g_animationDuration, setupNewContents);
	});
}

function setupNewContents()
{
	setupScrollbars();

	resizeBackground();

	typeof (setupContents) != 'undefined' ? setupContents() : null;
}

function getAspectRatio(selector)
{
	return $(selector).height() / $(selector).width()
}

//**************************************************************************
// Highlight
//**************************************************************************

function highlight(page)
{
	if ( ! $('#' + page + 'Nav') ) return;

	$('#' + page + 'Nav').addClass('current');
}

function unhighlight(page)
{
	if ( ! $('#' + page + 'Nav') ) return;

	$('#' + page + 'Nav').removeClass('current');
}

//@ sourceURL=main.js