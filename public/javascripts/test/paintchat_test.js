var assert = require('assert'),
test = require('selenium-webdriver/testing'),
webdriver = require('selenium-webdriver');
 
describe('Paint Chat', function() {
  // test.it('should work', function(done) {
    var driver;
    test.before( function(){
      driver = new webdriver.Builder().
      withCapabilities(webdriver.Capabilities.chrome()).
      build();
      driver.get('http://localhost:3000');
    });

    test.describe('Login page',function(){
      
      test.describe('Pseudo Login Textbox',function() {
        var pseudoLogin;
        test.before(function (){
          pseudoLogin = driver.findElement(webdriver.By.id('pseudo'));
          pseudoLogin.sendKeys('AutomatedTester');
        });
        test.it('should be set to AutomatedTester',function(){
          pseudoLogin.getAttribute('value').then(function(value){
          assert.equal(value,'AutomatedTester');
          });
        });
      });

      test.describe('Chatroom Login Textbox',function() {
        var chatRoom;
        test.before(function(){
          chatRoom = driver.findElement(webdriver.By.id('roomname'))
          chatRoom.sendKeys('1');
        })
        test.it('should be set to 1',function(){
          chatRoom.getAttribute('value').then(function(value){
          assert.equal(value,'1');
          });
        });
      });
      
      test.after(function(){
        var loginButton = driver.findElement(webdriver.By.id('loginsubmit'));
        loginButton.click();
      })
    
    });
    
    test.describe('Canvas',function(){
      var canvas;
      var robot;
      test.before(function(){
        canvas = driver.findElement(webdriver.By.id('draw'));
        // robot = new Robot();
      })
      test.it('click and drag mouse', function(){
        var coordinates = canvas.getLocation();
        console.log(coordinates);
        webdriver.mouse_move_at("document.getElementById('draw')","20,20");
        webdriver.mous_up_at("document.getElementById('draw')","80,20");

        // var evObj = canvas.createEvent('MouseEvents');
        // evObj.initMouseEvent("mouseover",true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        // arguments[0].dispatchEvent(evObj);
      })
    })

    test.after(function (){
      driver.quit();
    });
  // });
});