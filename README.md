# Wizebot Chat History

## Install

How to install **NodeJS**, **Puppeteer**, **Chromium** and **the script** into **AlmaLinux 9.4**

1. Install NodeJS, Chromium, Git and Puppeteer

```
dnf install epel-release

dnf module enable nodejs:20

dnf install nodejs -y

dnf install chromium -y

dnf install git -y

node -v

npm i puppeteer

npm install puppeteer-core

npm install -g npm
```



2. Get the wizebot-chat-history

```
cd /var

mkdir nodejs

cd nodejs

git clone https://github.com/AlexiaGossa/wizebot-chat-history

cd wizebot-chat-history
```


3. How to insert the tchat wizebot widget URL into wizebot-url.txt ?
   
- Go to your wizebot.tv admin panel
- Open Widgets (overlays)
- Open Widget Tchat
- Create a new widget
- Select the clean (on the right side) template


Import the following html code :

```
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

- Clear the CSS code
- Keep the JS code

- Click on "Copy the link"
Insert the link (URL) into the file **"wizebot-url.txt"**

Now you could modify the CSS file named **"wizebot-inject.css"** to apply your own design.


How to execute the wizebot-chat-history
Run the command : `node wizebot-node.js`
You'll see the following text :
**HTTP server started
Running...**

Press **CTRL+C** to stop the script.


## Usage - All Wizebot history URL parameters :

**Clean history immediately :** http://10.138.45.126:8080/?reset

**Display below the tchat a flat color.
height is tchat text is percents.
heightcolor is a rgb value. :**
http://10.138.45.126:8080/?height=80%&heightcolor=rgb(255,230,200)

**Change text messages size :** http://10.138.45.126:8080/?messagesize=2.5vw

**Change the nickname size :** http://10.138.45.126:8080/?nicksize=4vw

**Combine all parameters like this :** http://10.138.45.126:8080/?height=80%&heightcolor=rgb(200,255,200)&messagesize=2vh&nickname=3vh

or

http://10.138.45.126:8080/?height=60%&heightcolor=rgb(255,255,255)&messagesize=3vw&nickname=5vw

**Using the highlight parameter to highlight a new message
The highlight provides a feature for streamer to highlight all incoming messages :** http://10.138.45.126:8080/?height=60%&heightcolor=rgb(255,255,255)&messagesize=3vw&nickname=5vw&highlight