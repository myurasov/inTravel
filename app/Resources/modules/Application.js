Project.Application = function()
{
  var self = this;
  var navGroup;
  var navHostWindow;
  var settingsWindow;

  self.lastLocationEvent = null;
  self.mainWindow = null;
  self.channel = null;
  self.bgService = null;

  /**
   * Initialize application
   */
  self.init = function()
  {
    // Misc

    // load config
    Project.Config.load().save();

    // prevent screen from locking
    Titanium.App.idleTimerDisabled = true;

    // create messenger
    self.messenger = new Project.Messenger(
      Project.Config.get('channel')
    );

    // Create UI

    self.mainWindow = Project.UI.createMainWindow();

    navHostWindow = Ti.UI.createWindow({
      navBarHidden: true
    });

    navGroup = Ti.UI.iPhone.createNavigationGroup({
      window: self.mainWindow
    })

    navHostWindow.add(navGroup);

    // Show UI

    navHostWindow.open({
      modal: true
    });

    // Events

    self.messenger.addEventListener("ready", function(e){
      // restore watchers
      self.mainWindow.restoreWatchers();

      // start geolocation
      self.startGeolocation();
    });

    // Misc
    if (Project.Config.get('backgroundService'))
      self.registerBgService();
  }

  /**
   * Register bg service
   */
  self.registerBgService = function()
  {
    if (self.bgService == null)
      self.bgService = Ti.App.iOS.registerBackgroundService({url:'modules/BgService.js'});
  }

  /**
   * Unregister bg service
   */
  self.unregisterBgService = function()
  {
    if (self.bgService != null)
    {
      self.bgService.unregister();
      self.bgService = null;
    }
  }

  /**
   * Save config
   */
  self.saveConfig = mym.Utils.dejitter(Project.Config.save, 250);

  self.showSettings = function()
  {
    if (settingsWindow == null)
      settingsWindow = Project.UI.createSettingsWindow();

    self.navigateTo(settingsWindow);
  }

  /**
   * Navigate to window
   */
  self.navigateTo = function(window)
  {
    navGroup.open(window);
  }

  /**
   * Start geolocation
   */
  var geolocationStarted = false;
  self.startGeolocation = function()
  {
    if (geolocationStarted) return;
      geolocationStarted = true;

    Ti.Geolocation.purpose = "Geolocation";
    Ti.Geolocation.preferredProvider = "gps";
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS;
    Ti.Geolocation.distanceFilter = 3;

    Ti.Geolocation.addEventListener("location", self.onLocation);
    setInterval(self.updateLocation, 3000);
    self.updateLocation();
  }

  /**
   * Update location
   */
  self.updateLocation = function()
  {
    Ti.Geolocation.getCurrentPosition(self.onLocation);
  }

  /**
   * Publish last known location
   */
  self.publishLastLocation = function()
  {
    if (self.lastLocationEvent != null)
      self.publishLocation(self.lastLocationEvent.coords.latitude,
        self.lastLocationEvent.coords.longitude);
  }

  /**
   * We've got location
   */
  self.onLocation = function(e)
  {
    if (e.success)
    {
      self.lastLocationEvent = e;

      self.publishLocation(
        e.coords.latitude,
        e.coords.longitude
      );
    }
  }

 /**
  * Publich location
  */
  self.publishLocation = mym.Utils.dejitter(function(lat, lon) {
    Project.Utils.fetchAddress(lat, lon, function(address) {
      var message = {
        location: {
          lat: lat,
          lon: lon,
          address: address
        }
      };

      self.messenger.publish(message);
      Ti.App.fireEvent('app:locationPublished', message);
    });
  }, Project.Config.get('publishTimeout') * 1000);

  /**
 * Get link to web app
 */
  self.getLink = function(shortLink)
  {
    if (shortLink == undefined)
      shortLink = false;

    return (!shortLink ? 'http://' : '') + "iamtravel.in/" + self.messenger.getChannel();
  }


  /**
 * Send email
 */
  self.sendEmail = function(name, email)
  {
    var emailDialog = Titanium.UI.createEmailDialog();

    if (emailDialog.isSupported())
    {
      if (email !== undefined)
        emailDialog.toRecipients = [email];

      emailDialog.subject = "I'm inTravel";
      emailDialog.html = true;

      var body = (name === undefined ? '' : "Hi, " + name + "!<br><br>") + "View My location in real time: <br>" +
      "<a href='" + self.getLink() + "'>" + self.getLink(true) + "</a>";

      emailDialog.messageBody = body;
      emailDialog.open();
    }
    else // Email is not supported
    {
      mym.Utils.alert("Unable to send email.\nPehaps you have not set up a email acount?");
    }
  }

  /**
  * Send SMS
  */
  self.sendSms = function(phone)
  {
    var smsDialog = omorandi.createSMSDialog();

    if (smsDialog.isSupported())
    {
      var body = "Follow my location: " + self.getLink();

      if (phone !== undefined)
        smsDialog.recipients = [phone];

      smsDialog.messageBody = body;
      smsDialog.open({
        animated: true
      });
    }
    else
    {
      mym.Utils.alert("Your device doesn't support SMS");
    }
  }
}