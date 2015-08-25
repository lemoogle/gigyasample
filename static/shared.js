/* redirectToLogout
* creates form and submits post function with the User as a parameter, I could use getUserInfo but I started using Flask templating so I decided to keep this way
* Also allows me to display email passed on when it didn't exist.
*/
redirectToLogout=function(user){
	var form = $('<form action="/b/" name="vote" method="post" style="display:none;"><input type="text" name="user" value=\''+JSON.stringify(user)+'\'></input></form>');
	$(form).submit();
}

/* connectionAdded
* if a connection is added on page B, reload the page
*/
connectionAdded=function(eventObj){
	redirectToLogout(eventObj.user);
}
/* checkIfLoggedIn
* called if user goes straight to /b , will "log them in" if they are already logged in from previously, else will redirect to a.
*/
checkIfLoggedIn=function(eventObj){
	if (eventObj.user.providers.length!=0){
		redirectToLogout(eventObj.user)
	}
	else(
		window.location.replace("/a")
	)
}

/* login
* checks if email has been set manually, then redirect to B.
*/
login=function(){
			if ($('#emailInput').val()){
				user.email=$('#emailInput').val()
			}
			console.log("HELLO")
			redirectToLogout(user)
}

/* checkEmail
*  if email doesn't exist, ask for user to insert.
*/
checkEmail= function(eventObj){
user=eventObj.user
if ( user.email!= ""){
login()
}
else{
$('#emailForm').show()
}
}
