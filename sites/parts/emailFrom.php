<?php

if(isset($_POST['email'])) {
    $email_to = "info@joshuawallace.co.uk";
    $email_subject = "Website Contact: ";
     
     
    function died($error) {
        // your error code can go here
        echo "We are very sorry, but there were error(s) found with the form you submitted. ";
        echo "These errors appear below.<br /><br />";
        echo $error."<br /><br />";
        echo "Please go back and fix these errors.<br /><br />";
        die();
    }
     
    // validation expected data exists
    if( !isset($_POST['name']))
	{
        died('The Name is missing from the post.');
    }
	if(	!isset($_POST['organisation']))
	{
        died('The Organisation is missing from the post.');
    }
	if(	!isset($_POST['email']))
	{
        died('The Email is missing from the post.');
    }
	if(	!isset($_POST['subject']))
	{
        died('The Subject is missing from the post.');
    }
	if(	!isset($_POST['content']))
	{
        died('The Content is missing from the post.');
    }
     
    $name = $_POST['name']; // required
    $organisation = $_POST['organisation']; // required
    $email_from = $_POST['email']; // required
    $subject = $_POST['subject']; // required
    $content = $_POST['content']; // required
     
    $error_message = "";
    $email_exp = '/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/';
  if(!preg_match($email_exp,$email_from)) {
    $error_message .= 'The Email Address you entered does not appear to be valid.<br />';
  }
    $string_exp = "/^[A-Za-z .'-]+$/";
  if(!preg_match($string_exp,$name)) {
    $error_message .= 'The Name you entered does not appear to be valid.<br />';
  }
  if(strlen($organisation) < 2) {
    $error_message .= 'The Organisation you entered does not appear to be valid.<br />';
  }
  if(strlen($subject) < 2) {
    $error_message .= 'The Subject you entered does not appear to be valid.<br />';
  }
  if(strlen($content) < 2) {
    $error_message .= 'The Content you entered does not appear to be valid.<br />';
  }
  if(strlen($error_message) > 0) {
    died($error_message);
  }
    $email_message = "Source: http://joshuawallace.co.uk/parts/emailForm.php\n";
     
    function clean_string($string) {
      $bad = array("content-type","bcc:","to:","cc:","href");
      return str_replace($bad,"",$string);
    }
     
    $email_message .= "Name: ".clean_string($name)."\n";
	$email_message .= "Organisation: ".clean_string($organisation)."\n";
    $email_message .= "Email: ".clean_string($email_from)."\n\n";
    $email_message .= "Content: \n".clean_string($content)."\n";
     
    $email_subject .= $subject;

// create email headers
$headers = 'From: '.$email_from."\r\n".
'Reply-To: '.$email_from."\r\n" .
'X-Mailer: PHP/' . phpversion();
@mail($email_to, $email_subject, $email_message, $headers); 
?>
 
Thank you for contacting me; I will be in touch with you very soon.
 
<?php
}
?>