function setupContents()
{
	$('.skill').each(setupHover);
}

function setupHover(index, element)
{
	$(element).hover(skillsListHover, skillsListUnhover);
}

function skillsListHover(event)
{
	var target = $($(event.target).children('.skill-short-description').filter(':not(:animated)')[0]);

	target.fadeIn(500);
}

function skillsListUnhover(event)
{
	var target = $($(event.target).children('.skill-short-description')[0]);

	target.fadeOut(100);
}

//@ sourceURL=skills.js