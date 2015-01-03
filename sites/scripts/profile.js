function Profile()
{
	this.backgroundImage = 'images/tree.jpg';
}

Profile.prototype = new Page();
Profile.prototype.constructor = Profile;

g_page = new Profile();

//@ sourceURL=profile.js