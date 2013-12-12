function MissionPage()
{
	this.setupContents = function ()
	{
		this.baseColour = '#000000';

		this.constructor.prototype.setupContents.call(this);
	};

	function loadContactPage()
	{
	}
}

MissionPage.prototype = new Page();
MissionPage.prototype.constructor = MissionPage;

g_page = new MissionPage();

//@ sourceURL=mission.js