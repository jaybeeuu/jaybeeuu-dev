function HomePage()
{
	this.setupContents = function ()
	{
		$('#contact-link').click(loadContactPage);

		this.constructor.prototype.setupContents.call(this);
	};

	function loadContactPage()
	{
		loadPage('contact');
	}
}

HomePage.prototype = new Page();
HomePage.prototype.constructor = HomePage;

g_page = new HomePage();

//@ sourceURL=home.js