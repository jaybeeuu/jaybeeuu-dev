function HomePage()
{
}

HomePage.prototype = new Page();
HomePage.prototype.constructor = HomePage;

g_page = new HomePage();

//@ sourceURL=home.js