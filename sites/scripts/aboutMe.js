function AboutMe()
{
	this.backgroundImage = 'images/tree.jpg';
}

AboutMe.prototype = new Page();
AboutMe.prototype.constructor = AboutMe;

g_page = new AboutMe();

//@ sourceURL=aboutMe.js