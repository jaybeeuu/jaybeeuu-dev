function Validation(options)
{
	var validationReport = new ValidationReport(options);

	this.validateElement = function (settings)
	{
		element = $(settings.elementId);

		var wasValid = doValidateElement(element, settings.validationFunction, settings.message);

		validationReport.updateMessageDisplay();

		return wasValid;
	}

	this.validateElements = function(elements)
	{
		var wasValid = true;

		for (var i = 0; i < elements.length; i++)
		{
			var element = $(elements[i].elementId);

			wasValid = doValidateElement(element, elements[i].validationFunction, elements[i].message) && wasValid;
		}

		validationReport.updateMessageDisplay();

		return wasValid;
	}

	this.validateEmail = function (email)
	{
		return validate(email, [isValidText, isValidEmailAddress]);
	};

	this.validateText = function (text)
	{
		return validate(text, [isValidText]);
	};

	function doValidateElement(element, validationFunction, errorMessage)
	{
		if (validationFunction(element.val()))
		{
			markValid(element);

			return true;
		}

		markInvalid(element, errorMessage);

		return false;
	}

	function validate(obj, validationFunctions)
	{
		if (typeof (obj) == 'undefined')
		{
			return false;
		}

		for (var i = 0; i < validationFunctions.length; i++)
		{
			if (!validationFunctions[i](obj))
			{
				return false;
			}
		}

		return true;
	}

	function isValidText(text)
	{
		if (typeof (text) == 'string' && text.length > 0)
		{
			return true;
		}

		return false;
	}

	function isValidEmailAddress(text)
	{
		var pattern = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;

		if (isValidText(text) && pattern.test(text))
		{
			return true;
		}

		return false;
	}

	function markValid(element)
	{
		if (validationReport != null)
		{
			validationReport.remove(element.attr('id'));
		}
	}

	function markInvalid(element, message)
	{
		if (validationReport != null)
		{
			validationReport.add(element.attr('id'), message);
		}
	}
}

function ValidationReport(options)
{
	var invalidFieldClass = 'invalid';
	var animationTiming = 500;
	var errors = null;
	var submitButton = null;

	var reportCount = 0;

	if (options)
	{
		invalidFieldClass = (typeof (options.invalidFieldClass) != 'undefined') ? options.invalidFieldClass || invalidFieldClass : invalidFieldClass;
		animationTiming = (typeof (options.animationTiming) != 'undefined') ? options.animationTiming || animationTiming : animationTiming;
		errors = (typeof (options.errorsId) != 'undefined') ? $(options.errorsId) : null;
		submitButton = (typeof (options.submitButtonId) != 'undefined') ? $(options.submitButtonId) : null;
	}

	var reports = new Object();

	this.add = function (elementId, message)
	{
		elementId = selectoriseId(elementId);

		if (typeof reports[elementId] == 'undefined')
		{
			addNewMessage(elementId, message);
		}
	}

	this.remove = function (elementId)
	{
		elementId = selectoriseId(elementId);

		if ( typeof reports[elementId] != 'undefined')
		{
			removeMessage(elementId);
		}
	}

	this.updateMessageDisplay = function ()
	{
		if (reportCount <= 0) displayNoErrors();
		else displayErrors();
	}

	function addNewMessage(elementId, message)
	{
		reports[elementId] = message;

		$(elementId).addClass(invalidFieldClass, animationTiming);

		reportCount++;
	}

	function removeMessage(elementId)
	{
		elementId = selectoriseId(elementId);

		$(elementId).removeClass(invalidFieldClass, animationTiming);

		delete reports[elementId];

		reportCount--;
	}

	function displayNoErrors()
	{
		hideElement(errors, function () { showElement(submitButton); });
	}

	function displayErrors()
	{
		hideElement(submitButton,
			function ()
			{
				hideElement(errors,
					function ()
					{
						var errHtml = buildAllReportsMessage();

						errors.html(errHtml);

						showElement(errors);
					})
			});
	}

	function showElement(element, callback)
	{
		element.fadeIn(animationTiming, callback);
	}

	function hideElement(element, callback)
	{
		element.fadeOut(animationTiming, callback);
	}

	function buildAllReportsMessage()
	{
		var errHtml = '<p>Something doesn\'t look right with the form:</p><ul>';

		for (elementId in reports)
		{
			errHtml += '<li>' + reports[elementId] + '</li>';
		}

		errHtml += '</ul>';

		return errHtml;
	}
}

//@ sourceURL=validation.js