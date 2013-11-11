function ExperiencePage()
{
	this.baseColour = '#000000';
}

ExperiencePage.prototype = new Page();
ExperiencePage.prototype.constructor = ExperiencePage;

g_page = new ExperiencePage();

//@ sourceURL=experience.js