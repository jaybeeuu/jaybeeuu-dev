$(ready);

var g_page;
var g_currentPageName;
var g_animationDuration = 500;

//**************************************************************************
// Events
//**************************************************************************

function ready()
{
	preloadImages();

	getLastPage();

	setupNavLinks('#navList');

	$('#title span').click(goHome);

	$(window).resize(resize);

}

var images = new Array()

function preloadImages()
{
	doPreload(
		'images/nullarbor.jpg',
		'images/tree.jpg',
		'images/englishBayPark.jpg',
		'images/melbourneExhibitionHall.jpg',
		'images/lionsGateBridge.jpg'
	)
}

function doPreload()
{
	for (i = 0; i < doPreload.arguments.length; i++)
	{
		images[i] = new Image()
		images[i].src = doPreload.arguments[i]
	}
}

function setupScrollbars()
{
	$('#scroller').mCustomScrollbar('update');
}

function setupNavLinks(parent)
{
	$(parent + ' .navButton').each(function (index, element) { $(element).click(navClicked); });
}

function resize(event)
{
	resizeBackground(event);

	if( typeof(resizeContents) != 'undefined' ) resizeContents(event);
}

function resizeBackground(event)
{
	if (getAspectRatio(window) < 2/3)
	{
		$('#index-content-background').css('height', 'auto');
		$('#index-content-background').css('width', $(window).width() + 'px');
	}
	else
	{
		$('#index-content-background').css('height', $(window).height() + 'px');
		$('#index-content-background').css('width', 'auto');
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
	var target = $(event.target);

	var targetAttr = target.attr('data-target');

	var page =  (typeof targetAttr ==  'undefined') ? target.html() : targetAttr;

	loadPage(page);
}

//**************************************************************************
// Change Page
//**************************************************************************

function loadPage(pageName)
{
	if (!pageName) pageName = "home";

	if (pageName == g_currentPageName) return;

	var url = 'parts/' + pageName + '.html';

	$.get(url, function (page) { changeContents(page, pageName); });
}

function changeContents(page, pageName)
{
	unhighlight(g_currentPageName);

	$('#index-content').fadeOut(g_animationDuration, function ()
	{
		$('#index-content').html(page);

		var img = getImage('index-content-background', g_page.backgroundImage, 'background',
			function ()
			{
				$('#index-content').append(img);

				resizeBackground();

				$('#scroller').mCustomScrollbar({ theme: 'light-thin', scrollIntertia: 0, autoHideScrollbar: true });

				$('#index-content').fadeIn(g_animationDuration, function ()
				{
					setupNewContents();

					setNavCurrentPage(pageName);
				});
			});
	});
}

function setNavCurrentPage(newPage)
{
	g_page = new Page();

	g_currentPageName = newPage;

	$.cookie('lastPage', newPage);
	
	highlight(newPage);
}


function setupNewContents()
{
	setupScrollbars();

	setupNavLinks('#index-content');

	g_page.setupContents();
}

function getAspectRatio(selector)
{
	return $(selector).height() / $(selector).width()
}

function getImage(id, src, alt, nextAction)
{
	var img = new Image();

	img.id = id;

	img.onload = nextAction;

	img.alt = alt;

	img.src = src;

	return img;
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