function HomePage()
{
	this.backgroundImage = 'images/nullarbor.jpg';
}

HomePage.prototype = new Page();
HomePage.prototype.constructor = HomePage;

g_page = new HomePage();

//@ sourceURL=home.js