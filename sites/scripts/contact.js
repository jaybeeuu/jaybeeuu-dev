function ContactPage()
{
	var g_validation;
	var g_validationSettings;

	this.setupContents = function(postSetup)
	{
		var report = new ValidationReport({
			errorsId: '#errors',
			submitButtonId: '#submit',
			animationTiming : g_animationDuration
		});

		g_validation = new Validation(report);

		g_validationSettings =
		[
			{ elementId: '#name', validationFunction: g_validation.validateText, message: 'The name is required. Plaese let me know who you are.' },
			{ elementId: '#organisation', validationFunction: g_validation.validateText, message: 'Organisation is required. Pleaase tell me the organisation you belong to.' },
			{ elementId: '#email', validationFunction: g_validation.validateEmail, message: 'The email address you entered doesn\'t look right. Please give me an email address I can reply to.' },
			{ elementId: '#subject', validationFunction: g_validation.validateText, message: 'Subject is required. Please tell me what this message is about.' },
			{ elementId: '#content', validationFunction: g_validation.validateText, message: 'Content is required. What is the message you like to send me?' }
		];

		$('#name').focusout(validateName);
		$('#organisation').focusout(validateOrganisation);
		$('#email').focusout(validateEmail);
		$('#subject').focusout(validateSubject);
		$('#content').focusout(validateContent);

		$('#submit').click(validateForm);
		
		this.constructor.prototype.setupContents.call(this);
	}

	//**************************************************************************
	// Validation
	//**************************************************************************

	function validateForm()
	{
		return g_validation.validateElements(g_validationSettings);
	}

	function validateName()
	{
		g_validation.validateElement(g_validationSettings[0]);
	}

	function validateOrganisation()
	{
		g_validation.validateElement(g_validationSettings[1]);
	}

	function validateEmail()
	{
		g_validation.validateElement(g_validationSettings[2]);
	}

	function validateSubject()
	{
		g_validation.validateElement(g_validationSettings[3]);
	}

	function validateContent()
	{
		g_validation.validateElement(g_validationSettings[4]);
	}

	//**************************************************************************
	// Form
	//**************************************************************************

	//callback handler for form submit
	$("#contactForm").submit(function (e)
	{
		var postData = $(this).serializeArray();

		var formURL = $(this).attr("action");

		$.ajax(
		{
    		url		: formURL,
    		type	: "POST",
    		data	: postData,
    		success	: submitFormSuccess,
    		error	: submitFormError
		});

		e.preventDefault(); //STOP default action
	});
	
	function submitFormSuccess(data, textStatus, jqXHR)
    {
		$('#submit').fadeOut(
			g_animationDuration,
			function()
			{ 
				$('#errors').html(data);
				$('#errors').fadeIn(g_animationDuration);
			});
	}
	
	function submitFormError(jqXHR, textStatus, errorThrown)
	{
		$('#submit').fadeOut(
			g_animationDuration,
				function()
				{ 
					$('#errors').html(errorThrown);
					$('#errors').fadeIn(g_animationDuration);
				});
	}
}

ContactPage.prototype = new Page();
ContactPage.prototype.constructor = ContactPage;

g_page = new ContactPage();

//@ sourceURL=contact.js
