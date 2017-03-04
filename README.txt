openwebspider(js) v0.2.3
    http://www.openwebspider.org/


Requirements:
     - MySQL Server or MongoDB (2.6+)
     - nodejs


Getting started:
     1. Execute openwebspider-application-server by double-clicking "openwebspider.bat" (windows) or (linux) with:
        # nodejs src/server.js
     2. Open a web-browser at http://127.0.0.1:9999/
     3. Go in the third tab (Database) and configure your settings
     4. Verify that openwebspider correctly connects to your server by clicking the "Verify" button
     5. "Save" your configuration
     6. "Create DB"; this will create all tables needed by openwebspider
        (remember that this will remove all existing tables and will create them from scratch)
     7. Now you are ready to start an openwebspider worker; first tab (Worker): Go


Known issue:
     - The openwebspider's UI uses the Helvetica font; under linux you might not have it installed and,
       especially with google chrome, the application is rendered very badly.
       You can fix this by installing Microsoft TrueType core fonts
	   (e.g. in Ubuntu, Debian, Mint, ...)
          # apt-get install ttf-mscorefonts-installer


Contacts:
    info @ openwebspider.org
