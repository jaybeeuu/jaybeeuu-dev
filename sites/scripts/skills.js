function SkillsPage()
{
	this.setupContents = function ()
	{
		$('.tile').each(setupHover);

		this.constructor.prototype.setupContents.call(this);
	};

	function setupHover(index, element)
	{
		$(element).hover(skillsListHover, skillsListUnhover);
	}

	function skillsListHover(event)
	{
		var target = $($(event.target).children('.tile-short-description').filter(':not(:animated)')[0]);

		target.fadeIn(500);
	}

	function skillsListUnhover(event)
	{
		var target = $($(event.target).children('.tile-short-description')[0]);

		target.fadeOut(100);
	}
}

SkillsPage.prototype = new Page();
SkillsPage.prototype.constructor = SkillsPage;

g_page = new SkillsPage();

//@ sourceURL=skills.js