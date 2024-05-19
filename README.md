<h1>How to prepare your AlmaLinux 9.4</h1>

Connect to a ssh with a root or similar account on your AlmaLinux :

`dnf install epel-release`

`dnf module enable nodejs:20`

`dnf install nodejs -y`

`dnf install chromium -y`

`dnf install git -y`

`node -v`

`npm i puppeteer`

`npm install puppeteer-core`

`npm install -g npm`



<h1>Install the script</h1>

With your ssh session :

`cd /var`

`mkdir nodejs`

`cd nodejs`

`git clone https://github.com/AlexiaGossa/wizebot-chat-history`

`cd wizebot-chat-history`



<h1>How to use the script</h1>
   
1. Go to your wizebot.tv admin panel

2. Open Widgets (overlays)

3. Open Widget chatbot

4. Create a new widget

5. Select the clean (on the right side) template

6. Import the following HTML code into the Wizebot <b>HTML</b> part :

```html
<link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet">

<div class="template message_div animated fadeIn">
    <div>
        <div class="sticker" style="background-color:{user_color};"></div>
        <div class="time">{message_time}</div>
        <div class="badges"></div>
        <div class="nicksimple">{user_display_name}</div>
        <div class="nick"></div>
        <div class="left"></div>
        <div class="message" msgtype="{message_type}"></div>
    </div>
</div>
<div id="messagescontainer">
<div id="messages" dir="ltr"></div>
</div> 

<!-- Horizontal order : dir="ltr" = Left to right / dir="rtl" = Right to left -->
<!-- TAGs available : {user_name} {user_display_name} {user_name_full} (Display name + Username) {user_color} {user_invert_color} (For background ?) {user_badges} {message_text} {message_time} {message_type} {message_color} (For announcement type) -->
```

7. Clear the CSS code in the Wizebot <b>CSS</b> part

8. Keep the Javascript code in the Wizebot <b>JAVASCRIPT</b> part

9. Click on "Copy the link" on the top of the Wizebot web page

10. With your ssh session, open the <b>wizebot-url.txt</b> with nano `nano wizebot-url.txt` and paste the link into nano.




<h1>Customize the design</h1>

Now you could modify the CSS file named <b>wizebot-inject.css</b> to apply your own design.

<b>Don't forget to restart the nodeJS script after each modification.</b>


<h1>Run the script</h1>

<h2>Configure your firewall / Open ports</h2>

Open 1 or 2 TCP ports on your system :

8080 for HTTP

8443 for HTTPS if you provide some certs

<h2>Want to immediately test the script ?</h2>

You want to execute the wizebot-chat-history script now ?

Run the command : `node wizebot-node.js`

You'll see the following text :

```
HTTP server started
Running...
```

Press CTRL+C to stop the script.


<h2>Install and start the script with the system</h2>

To do...


<h1>Wizebot history URL parameters</h1>

We assume the script is running on a system using the IP 192.168.1.126 and using the HTTP 8080 port.
<br/>
<hr>

<h3>Basic display</h3>
> <span>http://</span>192.168.1.126:8080/
<br/><br/>
<hr>

<h3>Clear history immediately</h3>
The History is immediately cleared. All opened webpages need to be reloaded.
<br/>
<br/>
Open a new browser tab and paste the following url.<br/>
> <span>http://</span>192.168.1.126:8080/?reset
<br/><br/>
Wait for tab loading and close it. Now you need to reload all other tabs and windows displaying the chat.<br/>
<br/>
This feature is very usefull before starting a new live stream to clear all previous messages.<br/>
<br/><br/>
<hr>

<h3>Display a flat color below the chatbot</h3>
<p>There is 2 parameters : height and heightcolor :
<br/>
<b>height</b> is chatbot text area in percents.
<br/>
<b>heightcolor</b> is flat area color using a rgb value.</p>
<br/>
URL samples</br>
> <span>http://</span>192.168.1.126:8080/?height=80%&heightcolor=rgb(255,230,200)
</br>
> <span>http://</span>192.168.1.126:8080/?height=63%&heightcolor=rgb(255,255,255)
<br/><br/>
<hr>

<h3>Change text messages size</h3>
<b>messagesize</b> is message size in css units (I recommand you to use vw and vh).
<br/>
<a href="https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units">More information about CSS units.</a><br/>
<br/>
URL samples</br>
> <span>http://</span>192.168.1.126:8080/?messagesize=2.5vw
<br/>
> <span>http://</span>192.168.1.126:8080/?messagesize=4vh
<br/><br/>
<hr>


<h3>Change the nickname size</h3>
<b>nicksize</b> is nickname size in css units (I recommand you to use vw and vh).
<br/>
</br>
URL samples</br>
> <span>http://</span>192.168.1.126:8080/?nicksize=4vw
<br/>
> <span>http://</span>192.168.1.126:8080/?nicksize=5.2vh
<br/><br/>
<hr>


<h3>Highlight a new message</h3>
Highlighting a new message is a feature very useful for streamer to highlight all new incoming messages.
</br>
<b>highlight</b> parameter without any value will enable the feature. The new incoming messages is blinked some few seconds to highlight them.
</br>
</br>
URL sample</br>
> <span>http://</span>192.168.1.126:8080/?height=60%&heightcolor=rgb(255,255,255)&messagesize=3vw&nickname=5vw&highlight
<br/><br/>
<hr>


<h3>Combine multiple parameters</h3>
You could combine multiple parameters... You must use ? for the first parameter and & for each of the following parameters. 
</br>
</br>
URL samples</br>
> <span>http://</span>192.168.1.126:8080/?height=80%&heightcolor=rgb(200,255,200)&messagesize=2vh&nickname=3vh
</br>
> <span>http://</span>192.168.1.126:8080/?height=60%&heightcolor=rgb(255,255,255)&messagesize=3vw&nickname=5vw
</br>




