var assert = require('assert'),
    test = require('selenium-webdriver/testing'),
    webdriver = require('selenium-webdriver');

test.describe('PaintChat', function() {

    var driver;
    test.before(function() {
        console.log("Before...");
        driver = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
        build();
        driver.get('http://localhost:3000');
    });

    test.describe('Test_Name', function() {
        test.it('Should return true if name receives input correctly', function() {
            console.log("Test_Name");
            var loginName = driver.findElement(webdriver.By.id('pseudo'));
            loginName.sendKeys("Tester_Name");
            loginName.getAttribute('value').then(function(value) {
                assert.equal(value, 'Tester_Name');
            });
        });
    });

    test.describe('Test_Room', function() {
        test.it('Should return true if the room receives input correctly', function() {
            console.log('Test_Room');
            var roomName = driver.findElement(webdriver.By.id('roomname'));
            roomName.sendKeys("Tester_Room");
            roomName.getAttribute('value').then(function(value) {
                assert.equal(value, 'Tester_Room');
            });
            driver.findElement(webdriver.By.id('loginsubmit')).click(); // Login
        });
    });

    test.describe('Test_Message_Accuracy', function() {
        test.it('Should return true if the messages receive input correctly', function() {
            console.log('Test_Message_Accuracy');
            var message = driver.findElement(webdriver.By.id('messageInput'));
            var sendMessage = driver.findElement(webdriver.By.id('submit'));
            message.sendKeys('Testing message accuracy');
            message.getAttribute('value').then(function(value) {
                assert.equal(value, 'Testing message accuracy');
            });
            sendMessage.click();
        });
    });

    test.describe('Test_Message_Influx', function() {
        test.it('Should return true if all [count] messages are sent', function() {
            var count = 30;
            var message = driver.findElement(webdriver.By.id('messageInput'));
            var sendMessage = driver.findElement(webdriver.By.id('submit'));
            console.log('Test_Message_Accuracy');
            var messageCount = [];
            for (var i = 0; i < count; i++) {
                message.sendKeys(i);
                messageCount.push(message);
                sendMessage.click();
            }
            assert(messageCount.length == count);
        });
    });

    test.describe('Test_Message_Escape_Characters', function() {
        test.it('Should return true if all input is escaped correctly', function() {
            console.log("Test_Message_Escape_Characters");
            var message = driver.findElement(webdriver.By.id('messageInput'));
            var sendMessage = driver.findElement(webdriver.By.id('submit'));
            message.sendKeys('<img src="notfound" onerror="alert(\'vulnerable to xss\')" ');
            sendMessage.click();
        });
    });

    test.after(function() {
        //            driver.quit();
    });
});


// test.describe('PaintChat Tests', function() {
//     test.it('Test: Login + Chat', function() {
//         var driver = new webdriver.Builder().
//         withCapabilities(webdriver.Capabilities.chrome()).
//         build();
//         driver.get('http://localhost:3000');
//         var loginName = driver.findElement(webdriver.By.id('pseudo'));
//         loginName.sendKeys("Tester_Name");
//         loginName.getAttribute('value').then(function(value) {
//             assert.equal(value, 'Tester_Name');
//         });
//     });
// });