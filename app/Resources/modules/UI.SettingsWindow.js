/**
 * Setting window
 */

Project.UI.createSettingsWindow = function()
{
  var view;
  var tableView;
  var sliderInterval;
  var labelInterval;
  var switchBgService;

  function _createView()
  {
    view = Ti.UI.createWindow({
      title: "Settings",
      barImage: "images/bar.png",
      barColor: Project.Config.get('_barColor'),
      backgroundImage: "images/bg.png",
      backgroundRepeat: true
    });

    //

    view.add(tableView = Ti.UI.createTableView({
      style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
      backgroundColor: "transparent"
    }));

    // Location update

    var s1 = Ti.UI.createTableViewSection({
      footerView: Project.UI.createHelpLabel({
        text: 'Minimum interval between location sharing.'
      })
    });

    var r;

    s1.add(r = Ti.UI.createTableViewRow({
      title: 'Location update interval',
      backgroundColor: "white"
    }));

    r.add(labelInterval = Ti.UI.createLabel({
      text: '',
      color: "#4c566c",
      textAlign: "right",
      right: 10,
      width: 100,
      height: 44
    }));

    s1.add(r = Ti.UI.createTableViewRow({
      backgroundColor: "white"
    }));

    r.add(sliderInterval = Ti.UI.createSlider({
      left: 10,
      right: 10,
      max: 60,
      min: 3,
      value: Project.Config.get('publishTimeout'),
      height: 44
    }));

    // Bg service

    var s2 = Ti.UI.createTableViewSection({
      footerView: Project.UI.createHelpLabel({
        text: 'Share your location while app is not active (up to 10 minutes).',
        lines: 2
      })
    });

    r = Ti.UI.createTableViewRow({
      title: 'Background service',
      height: 44,
      backgroundColor: "white"
    });

    r.add(switchBgService = Titanium.UI.createSwitch({
      value: Project.Config.get('backgroundService'),
      right: 10
    }))

    s2.add(r);


    //

    tableView.setData([s1, s2]);
  }

  function _attachEvents()
  {
    sliderInterval.addEventListener("change", function(e){
      Project.Config.set('publishTimeout', Math.round(e.value));
      labelInterval.text = Math.round(e.value) + ' sec';
      Project.application.publishLocation.interval = e.value * 1000;
      Project.application.saveConfig();
    });

    switchBgService.addEventListener("change", function(e){
      if (e.value)
        Project.application.registerBgService();
      else
        Project.application.unregisterBgService();

      Project.Config.set('backgroundService', e.value);
      Project.application.saveConfig();
    });

    view.addEventListener("open", function(){
      Project.application.mainWindow.setTitle("inTravel")
    });

    view.addEventListener("blur", function(){
      Project.application.mainWindow.setTitle(' ')
    });
  }

  _createView();
  _attachEvents();

  return view;
}