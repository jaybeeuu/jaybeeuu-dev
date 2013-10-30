var g_validation;

function setupContents()
{
	g_validation = new Validation(
		{
			errorsId		: '#errors',
			submitButtonId	: '#submit'
		});

	$('#name').focusout(validateName);
	$('#organisation').focusout(validateOrganisation);
	$('#email').focusout(validateEmail);
	$('#subject').focusout(validateSubject);
	$('#content').focusout(validateContent);
	$('submit').click(attemptPost);
}

function attemptPost()
{
	if (vaildateAll())
	{
		onsubimt();
	}
}

function validateAll()
{
	return validateName() && validateOrganisation() && validateEmail() && validateSubject() && validateContent();
}

function validateName()
{
	g_validation.validateElement($('#name'), g_validation.validateText, 'The name is required. Plaese let me know who you are.');
}

function validateOrganisation()
{
	g_validation.validateElement('#organisation', g_validation.validateText, 'Organisation is required. Pleaase tell me the organisation you belong to.');
}

function validateEmail()
{
	g_validation.validateElement($('#email'), g_validation.validateEmail, 'The email address you entered doesn\'t look right. Please give me an email address I can reply to.');
}

function validateSubject()
{
	g_validation.validateElement('#subject', g_validation.validateText, 'Subject is required. Please tell me what this message is about.');
}

function validateContent()
{
	g_validation.validateElement('#content', g_validation.validateText, 'Content is required. What is the message you like to send me?');
}

//@ sourceURL=contact.js