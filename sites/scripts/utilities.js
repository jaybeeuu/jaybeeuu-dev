if (typeof String.prototype.startsWith != 'function')
{
	String.prototype.startsWith = function (str)
	{
		return this.slice(0, str.length) == str;
	};
}

function selectoriseId(id)
{
	return id.startsWith('#') ? id : '#' + id;
}

//@ sourceURL=utilities.js