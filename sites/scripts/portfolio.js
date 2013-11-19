function PortfolioPage()
{
	this.setupContents = function ()
	{
		$('#scroller').tiles();

		this.constructor.prototype.setupContents.call(this);
	}
}

PortfolioPage.prototype = new Page();
PortfolioPage.prototype.constructor = PortfolioPage;

g_page = new SkillsPage();

//@ sourceURL=portfolio.js