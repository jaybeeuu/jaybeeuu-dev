function ExperiencePage()
{
	this.baseColour = '#FFFFFF';
}

ExperiencePage.prototype = new Page();
ExperiencePage.prototype.constructor = ExperiencePage;

g_page = new ExperiencePage();

//@ sourceURL=experience.js