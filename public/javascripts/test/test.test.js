// var assert = require('assert')
// , randomColor = require('./../draw.js').randomColor;
// describe('Array', function(){
//   describe('#indexOf()', function(){
//     it('should return -1 when the value is not present', function(){
//       assert.equal(-1, [1,2,3].indexOf(0));
//       assert.equal(-1, [1,2,3].indexOf(5));
//     })
//   })
// })
// suite('randomColor',function(){
// 	test("randomColor should return a valid random color",function(){
// 			// expect(randomColor()).to.be.a('String');
// 			assert.equal(1,2);
// 		});

var expect = chai.expect;
 
describe("randomColor", function() {
  it("should return true always",function(){
  	expect(1).to.equal(1);
  })
});

// var webdriver = require('selenium-webdriver');

// var driver = new webdriver.Builder().
//     withCapabilities(webdriver.Capabilities.chrome()).
//     build();

// driver.get('http://www.google.com');
// driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
// driver.findElement(webdriver.By.name('btnG')).click();
// driver.wait(function() {
//   return driver.getTitle().then(function(title) {
//     return title === 'webdriver - Google Search';
//   });
// }, 1000);

// driver.quit();
