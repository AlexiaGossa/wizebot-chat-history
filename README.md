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

3. Open Widget Tchat

4. Create a new widget

5. Select the clean (on the right side) template

6. Import the following HTML code in the <b>HTML</b> part :

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

7. Clear the CSS code in the <b>CSS</b> part

8. Keep the Javascript code in the <b>JAVASCRIPT</b> part

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


<h2>Install and start the script with the system</h21>

To do...


<h1>Wizebot history URL parameters</h1>
 

Clean history immediately
http://10.138.45.126:8080/?reset

Display below the tchat a flat color.
height is tchat text is percents.
heightcolor is a rgb value.
http://10.138.45.126:8080/?height=80%&heightcolor=rgb(255,230,200)

Change text messages size
http://10.138.45.126:8080/?messagesize=2.5vw

Change the nickname size
http://10.138.45.126:8080/?nicksize=4vw

Combine all parameters like this
http://10.138.45.126:8080/?height=80%&heightcolor=rgb(200,255,200)&messagesize=2vh&nickname=3vh

http://10.138.45.126:8080/?height=60%&heightcolor=rgb(255,255,255)&messagesize=3vw&nickname=5vw

Using the highlight parameter to highlight a new message
The highlight provides a feature for streamer to highlight all incoming messages.
http://10.138.45.126:8080/?height=60%&heightcolor=rgb(255,255,255)&messagesize=3vw&nickname=5vw&highlight


