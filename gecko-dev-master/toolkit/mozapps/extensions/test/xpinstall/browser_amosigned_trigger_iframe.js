// ----------------------------------------------------------------------------
// Test for bug 589598 - Ensure that installing through InstallTrigger
// works in an iframe in web content.

function test() {
  Harness.installConfirmCallback = confirm_install;
  Harness.installEndedCallback = install_ended;
  Harness.installsCompletedCallback = finish_test;
  Harness.finalContentEvent = "InstallComplete";
  Harness.setup();

  var pm = Services.perms;
  pm.add(makeURI("http://example.com/"), "install", pm.ALLOW_ACTION);

  var inner_url = encodeURIComponent(TESTROOT + "installtrigger.html?" + encodeURIComponent(JSON.stringify({
    "Unsigned XPI": {
      URL: TESTROOT + "amosigned.xpi",
      IconURL: TESTROOT + "icon.png",
      toString: function() { return this.URL; }
    }
  })));
  gBrowser.selectedTab = gBrowser.addTab();
  gBrowser.loadURI(TESTROOT + "installtrigger_frame.html?" + inner_url);
}

function confirm_install(window) {
  var items = window.document.getElementById("itemList").childNodes;
  is(items.length, 1, "Should only be 1 item listed in the confirmation dialog");
  is(items[0].name, "XPI Test", "Should have seen the name");
  is(items[0].url, TESTROOT + "amosigned.xpi", "Should have listed the correct url for the item");
  is(items[0].icon, TESTROOT + "icon.png", "Should have listed the correct icon for the item");
  is(items[0].signed, "false", "Should have listed the item as unsigned");
  return true;
}

function install_ended(install, addon) {
  install.cancel();
}

function finish_test(count) {
  is(count, 1, "1 Add-on should have been successfully installed");

  Services.perms.remove(makeURI("http://example.com"), "install");

  var doc = gBrowser.contentWindow.frames[0].document; // Document of iframe
  is(doc.getElementById("return").textContent, "true", "installTrigger in iframe should have claimed success");
  is(doc.getElementById("status").textContent, "0", "Callback in iframe should have seen a success");

  gBrowser.removeCurrentTab();
  Harness.finish();
}