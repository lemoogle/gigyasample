

## Login

**Localhost:5000/a**
![](http://puu.sh/jNFEu/2598b6b67e.png)

## The login UI
HTML
```html
		<p>
		Login with a social network provider:
		</p>
		<div id="login">
		</div>
```

We create a div that will contain the showLoginUI.

```
	gigya.socialize.addEventHandlers({
	    onLogin:checkEmail,
	   }
	);


gigya.socialize.showLoginUI({
		height: 100
		,width: 330
		,showTermsLink:false // remove 'Terms' link
		,hideGigyaLink:true // remove 'Gigya' link
		,showWhatsThis: true // Pop-up a hint describing the Login Plugin, when the user rolls over the Gigya link.
		,containerID: 'login' // The component will embed itself inside the loginDiv Div
		,cid:''
		});

```

onLogin calls checkEmail

##The email hook

The HTML
```html
<div id="emailForm" style="display: None">
	<p> We need to associate an email to your account! Enter your email here!
	</p>
	<form action="javascript:login()">
	Email:<input id="emailInput" type="text" name="email">
	<button type="submit">Submit</button>
	</form>
</div>
```

We prepare a hidden form that will ask for the email, should it be missing.

```javascript
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
```

We display the form using jQuery for simplicity when the user email is empty, try it out with a Twitter account!

![](http://puu.sh/jNG49/2ab4dc37d8.png)

## Redirecting to the logout page.


If the user account already has an email attached to it, the login function is called, that is the same function that gets called when we submit a manual email.

```javascript
/* login
* checks if email has been set manually, then redirect to B.
*/
login=function(){
			if ($('#emailInput').val()){
				user.email=$('#emailInput').val()
			}
			redirectToLogout(user)
}
```
We check if a manual email input was set and attach it to the user object that we pass to our redirect function

```javascript
/* redirectToLogout
* creates form and submits post function with the User as a parameter, I could use getUserInfo but I started using Flask templating so I decided to keep this way
* Also allows me to display email passed on when it didn't exist.
*/
redirectToLogout=function(user){
	var form = $('<form action="/b/" name="vote" method="post" style="display:none;"><input type="text" name="user" value=\''+JSON.stringify(user)+'\'></input></form>');
	$(form).submit();
}
```

I actually chose to pass the entire user object as a parameter of a POST request to page b. That would ensure that page B would have access to the email I manually set and that I could count the logins server side.
To create the POST redirect we create a form with the user object as a JSON input and submit it to redirect.



# The logout 


## Handling the POST redirect
As I discussed, we actually redirect using a POST method that passes the user object.

```python
import shelve
db = shelve.open("db")

@app.route('/b/',methods=['GET','POST'])
def b():
    if request.method=="GET":
        return render_template('c.html')
    else:
        user = json.loads(request.form.get('user'))
        count=db.get(user["email"],0)
        count+=1
        db[user["email"]]=count
        return render_template('b.html', user=user, count=count)
```


Let's ignore the GET case for now. The "else" case is our POST request. We first parse the JSON of the user object into a python dictionary, we then use our "shelve" database to check how many times that email logged in, we then pass the user object as wel as the updated count to our template for page B, the logout page.

*shelve is a flat file key value store, perfect for our simple usage*

## Jinja templates

```html
		<div style="float:left; margin:0px 10px; padding:10px; border:2px solid blue;">
			<p>
				Welcome!
				<p>You authenticated with <span id="loginProvider"></span></p>
				<div id="UserInfo">
	       <div id="divUserName">{{ user.nickname }}</div>
	       <div id="divUserPhoto"><img id="imgUserPhoto" src="{{user.thumbnailURL}}"/></div>
				 <div id="divLoginCount">Counts: {{count}}</div>
				 <div id="divUserEmail">Email: {{ user.email }}</div>

				 <div id="sharingUI"></div>

	    </div>
			</p>
		</div>
```
Flask uses jinja2 templates, it allows us to render the user information server side. We render the count the nickname, the Email as well as display a thumbnail of the profile pick of our current method of login.

![](http://puu.sh/jNGGQ/ac71e673bc.png)
### Listing the authenticated providers

I first chose to display the providers as a list but instead opted to use the showAddConnectionsUI to show them in a nicer way.


```javascript

			gigya.socialize.addEventHandlers({
				onConnectionAdded:connectionAdded
			 }
			);

			gigya.socialize.showAddConnectionsUI({"containerID":"loginProvider", "width":400});
```

The connectionAdded handler does the same as a login, and redirects to the same page with an updated user.

```javascript
/* connectionAdded
* if a connection is added on page B, reload the page
*/
connectionAdded=function(eventObj){
	redirectToLogout(eventObj.user);
}
```

## The logout button

```html
			<input type="button" onclick="gigya.socialize.logout();window.location.replace('/a'); return false;" value="Logout and return to the login page">

```
Simple stuff!

![](http://puu.sh/jNGQn/a82bb727f9.png)

## Sharing

```javascript
		// Constructing a UserAction Object
		var act = new gigya.socialize.UserAction();
		act.setTitle("Hey I'm sharing something!");  // Setting the Title
		act.setDescription("This is what I'm sharing");   // Setting Description
		 
		// Adding a Media Item (image)
		 
		var params =
		{		containerID:"sharingUI",
		    userAction:act,
				enabledProviders:"{{user.providers|join(', ')}}"
		    ,showMoreButton: true // Enable the "More" button and screen
		    ,showEmailButton: true // Enable the "Email" button and screen
		};
			gigya.socialize.showShareUI(params);
```

![](http://puu.sh/jNGU3/02b6a66345.png)


We use the showShareUI for sharing, we only show providers we're authenticated with.

###Bug ?

Not sure why but the shareUI does not work ( on hitting publish ) when i use the showAddConnectionsUI on the same page. Maybe I'm missing something?

## The GET case

Should the user go directly to page B, we should be able to handle the GET request to the page as well

```python
    if request.method=="GET":
        return render_template('c.html')
```

I actually use a 3rd template for this.


```javascript
gigya.socialize.getUserInfo({callback:checkIfLoggedIn});
```

That page will chose to redirect to the Login or the Logout depending on the output from the getUserInfo

```
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
```

For simplicity, I just check the providers attribute of the user object. 
