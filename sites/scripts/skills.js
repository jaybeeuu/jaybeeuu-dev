function SkillsPage()
{
	this.setupContents = function ()
	{
		$('#scroller').tiles();

		this.constructor.prototype.setupContents.call(this);
	}
}

SkillsPage.prototype = new Page();
SkillsPage.prototype.constructor = SkillsPage;

g_page = new SkillsPage();

//@ sourceURL=skills.js