(function($){

	$.fn.tiles = function (options)
	{
		processOptions(options);

		var visibleDescription = null;

		setup(this);

		function setup(me)
		{
			me.find('.tile').each(setupTile);

			me.find('.tile-description').each(setupTileDescription);
		};

		function setupTile(index, element)
		{
			$(element).hover(tileHover, tileUnhover);

			$(element).click(tileClick);
		}

		function setupTileDescription(index, element)
		{
			$(element).click(tileDescriptionClick);
		}

		function tileHover(event)
		{
			var target = $($(event.target).children('.tile-short-description').filter(':not(:animated)')[0]);

			target.fadeIn(g_animationDuration);
		}

		function tileUnhover(event)
		{
			var target = $(event.target);

			if (!$(event.target).hasClass('tile-short-description'))
			{
				target = $(target.children('.tile-short-description')[0]);
			}

			target.fadeOut(g_animationDuration);
		}

		function tileClick(event)
		{
			var target = $(event.target);

			if (!(target.hasClass('tile')))
			{
				target = $(target.parent('.tile')[0]);
			}

			target = $(target.children('.tile-description')[0]);

			if (target.is(':visible'))
			{
				hideTileDescription(target)
			}
			else
			{
				showTileDescription(target);
			}
		}

		function tileDescriptionClick(event)
		{
			$(event.target).fadeOut(g_animationDuration);
		}

		function showTileDescription(target)
		{
			if (visibleDescription != null)
			{
				//need to fix when people are clicking about rapidly - some weird things happen.
				visibleDescription.fadeOut(g_animationDuration,
					function ()
					{
						target.fadeIn(g_animationDuration,
							function () { setVisibleTileDescription(target); });
					});
			}
			else
			{
				target.fadeIn(g_animationDuration, function () { setVisibleTileDescription(target); });
			}
		}

		function hideTileDescription(target)
		{
			target.fadeOut(g_animationDuration);
			visibleDescription = null;
		}

		function setVisibleTileDescription(target)
		{
			target.mCustomScrollbar({ theme: 'dark-thin', horizontalScrollbar: true, autoHideScrollbar: true });

			visibleDescription = target;

			target.focus();
		}

		function processOptions(options)
		{
			if (!isValidobject(options))
			{
				return;
			}

			if (isValidObject(options.color))
			{
				$('.tile').css({ backgroundColor: options.color });
			}
		}

		function isValidObject(obj)
		{
			return typeof obj != 'undefined' && obj != null
		}
	}
}(jQuery));

//@ sourceURL=tiles.js