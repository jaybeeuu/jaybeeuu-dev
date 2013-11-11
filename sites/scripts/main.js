$(ready);

var g_page;
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
	$('#scroller').mCustomScrollbar({theme: 'light-thin', horizontalScrollbar :true, autoHideScrollbar: true});
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
	g_page = new Page();

	unhighlight(g_currentPage);

	g_currentPage = newPage;

	$.cookie('lastPage', newPage);

	highlight(newPage);
}

function changeContents(page)
{
	$('#index-content').fadeOut(g_animationDuration, function ()
	{
		$('#index-content').html(page);

		$('#index-content').fadeIn(g_animationDuration, setupNewContents);
	});
}

function setupNewContents()
{
	setupScrollbars();

	resizeBackground();

	g_page.setupContents();
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