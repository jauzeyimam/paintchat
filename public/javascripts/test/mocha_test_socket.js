var assert = require('assert'),
    test = require('selenium-webdriver/testing'),
    webdriver = require('selenium-webdriver'),
	express = require('express'),
	socketURL = "http://localhost:3000";

var io = require('socket.io-client');

var client = io.connect(socketURL);
 
test.describe('Test Socket connection', function() {
	test.afterEach(function() {
		client.disconnect();
	});

	  test.it('pseudo check', function() {
		client = io.connect(socketURL);

		client.on('connect', function() {
			client.emit('setPseudo', "User 1");
		});

		client.on('message', function(data) {
			assert.equal(data.message, "Your pseudo is User 1");
		});
	});

	test.it('room check', function() {
		client = io.connect(socketURL);

		client.on('connect', function() {
			client.emit('setRoom', "1");
		});

		client.on('message', function(data) {
			assert.equal(data.message, "Joined room 1");
		});
	});

	test.it('message test', function(){
		client = io.connect(socketURL);

		client.on('connect', function(){
			client.emit('message', "This is a test message");
		});

		client.on('message', function(data){
			assert.equal(data.message, "This is a test message");
		});
	});
});
