be sure to install ffmpeg and postgres.

all files in /www/ are public and served staticly; /node/ is private<br>
should only have to npm install node/tr808-server and that will handle http, json requests, db connections, e'er'thing<br>
/www/js/init.js just handles setting up the page and initializing shit (duh)<br>
/www/js/play.js handles playing the machine, as well as sending the POST requests for Save and Export<br>
<br>
/export accepts POST requests to export settings to mp3 (and returns the mp3)<br>
/save accepts POST requests to save settings to database and returns the URL which can be used to access those settings in the future<br>
/save accepts GET requests to restore settings previously saved to database<br>
/lookup accepts POST requests to determine if particular settings are already present in the database. if so, returns the URL used to access them<br>
the en, es, and ro subdomains set language to english, español and română respectively. all above paths work with or without these subdomains.<br>