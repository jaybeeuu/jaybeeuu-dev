var Page = function ()
{
	this.baseColour = '#FFFFFF';

	this.backgroundImage = 'images/ship.jpg';

	this.setupContents = function ()
	{
		$('#title').animate({ color: this.baseColour }, g_animationDuration);
		$('#navList span').animate({ color: this.baseColour, borderColor: this.baseColour }, g_animationDuration);
	};
}