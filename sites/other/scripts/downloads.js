$(ready);

var g_page;
var g_currentPageName;
var g_animationDuration = 500;

//**************************************************************************
// Events
//**************************************************************************

function ready()
{
	$(window).resize(resize);
	
	$('#scroller').tiles();
}

var img = getImage('index-content-background', '/images/nullarbor.jpg', 'background',
	function (ing)
	{
		$('#index-content').append(img);

		resizeBackground();

		$('#scroller').mCustomScrollbar({ theme: 'light-thin', scrollIntertia: 0, autoHideScrollbar: true });

		$('#index-content').fadeIn(g_animationDuration);
	});

function setupScrollbars()
{
	$('#scroller').mCustomScrollbar('update');
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