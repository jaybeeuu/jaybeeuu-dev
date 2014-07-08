function PortfolioPage()
{
	this.backgroundImage = 'images/melbourneExhibitionHall.jpg';

	this.setupContents = function ()
	{
		$('#scroller').tiles();

		this.constructor.prototype.setupContents.call(this);
	}
}

PortfolioPage.prototype = new Page();
PortfolioPage.prototype.constructor = PortfolioPage;

g_page = new PortfolioPage();

//@ sourceURL=portfolio.js