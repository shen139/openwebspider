# openwebspider(js)
Open Source Web Spider


## Requirements:
* MySQL Server or PostgreSQL
* nodejs


## Install

```sh
$ npm install
$ node src/server.js
```


## Getting started:
* Open a web-browser at http://127.0.0.1:9999/
* Go in the third tab (Database) and configure your settings
* Verify that openwebspider correctly connects to your server by clicking the "Verify" button
* "Save" your configuration
* "Create DB"; this will create all tables needed by openwebspider
* (remember that this will remove all existing tables and will create them from scratch)
* Now you are ready to start an openwebspider worker; first tab (Worker): Go


## Known issue:
The openwebspider's UI uses the Helvetica font; under linux you might not have it installed and,
especially with google chrome, the application is rendered very badly.
You can fix this by installing Microsoft TrueType core fonts
(e.g. in Ubuntu, Debian, Mint, ...)
```sh
# apt-get install ttf-mscorefonts-installer
```


## Contacts:
	http://www.openwebspider.org/
    info @ openwebspider.org


## License

The MIT License (MIT)

Copyright (c) 2017 Stefano Alimonti <info@openwebspider.org>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

http://www.openwebspider.org/license/
