/**
 *
 * HTML5 Color Picker
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2012, Script Tutorials
 * http://www.script-tutorials.com/
 */

$(function() {
    var bCanPreview = false; // can preview
    var oldValues = null; // oldValues for cancel button

    // create canvas and context objects
    var canvas = document.getElementById('picker');
    var ctx = canvas.getContext('2d');
    var drawCanvas = document.getElementById('draw');
    var drawctx = drawCanvas.getContext('2d');

    // drawing active image
    var image = new Image();
    image.onload = function() {
        ctx.drawImage(image, 0, 0, image.width, image.height); // draw the image on the canvas
    }

    // select desired colorwheel
    image.src = 'images/colorwheel.png';

    $('#picker').mousemove(function(e) { // mouse move handler
        if (bCanPreview) {
            // get coordinates of current position
            var canvasOffset = $(canvas).offset();
            var canvasX = Math.floor(e.pageX - canvasOffset.left);
            var canvasY = Math.floor(e.pageY - canvasOffset.top);

            // get current pixel
            var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
            var pixel = imageData.data;
            // update preview color
            var pixelColor = "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
            $('.preview').css('backgroundColor', pixelColor);

            // update controls
            $('#rVal').val(pixel[0]);
            $('#gVal').val(pixel[1]);
            $('#bVal').val(pixel[2]);
            $('#rgbVal').val(pixel[0] + ',' + pixel[1] + ',' + pixel[2]);

            var dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
            $('#hexVal').val('#' + ('0000' + dColor.toString(16)).substr(-6));
        }
    });
    var allowConfirm = true;
    $('#hexVal').keydown(function(e) {
        allowConfirm = false;
        if (e.which == 13) {
            if (isValidHex($('#hexVal').val())) {
                $('.preview').css('backgroundColor', $('#hexVal').val());
                pixel = [parseInt($('#hexVal').val().substring(1, 3), 16),
                    parseInt($('#hexVal').val().substring(3, 5), 16),
                    parseInt($('#hexVal').val().substring(5, 7), 16)
                ]
                $('#rVal').val(pixel[0]);
                $('#gVal').val(pixel[1]);
                $('#bVal').val(pixel[2]);
                $('#rgbVal').val(pixel[0] + ',' + pixel[1] + ',' + pixel[2]);
                allowConfirm = true;
            } else {
                alert("Invalid Input: Please input a '#' followed by 6 hex characters (0-9 and A-F).");
            }
        }
    });
    $('#rVal').keydown(function(e) {
        allowConfirm = false;
        if (e.which == 13) {
            if (isValidRGB($('#rVal').val())) {
                var pixel = [parseInt($('#rVal').val()), parseInt($('#gVal').val()), parseInt($('#bVal').val())];
                rgbChange(pixel);
                allowConfirm = true;
            } else {
                alert("Invalid Input: Please input a number between 0 and 255.");
            }
        }
    });
    $('#gVal').keydown(function(e) {
        allowConfirm = false;
        if (e.which == 13) {
            if (isValidRGB($('#gVal').val())) {
                var pixel = [parseInt($('#rVal').val()), parseInt($('#gVal').val()), parseInt($('#bVal').val())];
                rgbChange(pixel);
                allowConfirm = true;
            } else {
                alert("Invalid Input: Please input a number between 0 and 255.");
            }
        }
    });
    $('#bVal').keydown(function(e) {
        allowConfirm = false;
        if (e.which == 13) {
            if (isValidRGB($('#bVal').val())) {
                var pixel = [parseInt($('#rVal').val()), parseInt($('#gVal').val()), parseInt($('#bVal').val())];
                rgbChange(pixel);
                allowConfirm = true;
            } else {
                alert("Invalid Input: Please input a number between 0 and 255.");
            }
        }
    });
    $('#rgbVal').click(function(e) {
        alert("Please change RGB values individually.");
        $('#rVal').focus();
    });
    $('.preview').click(function(e) { // preview click
        if (!bCanPreview) {
            oldValues = {
                hexVal: $('#hexVal').val(),
                rVal: $('#rVal').val(),
                gVal: $('#gVal').val(),
                bVal: $('#bVal').val(),
                rgbVal: $('#rgbVal').val(),
            }
            $('#draw').fadeOut("slow", "linear");
            $('.colorpicker').fadeIn("slow", "linear");
            console.log(oldValues);
            bCanPreview = true;
        }
    });
    $('#picker').click(function(e) { // click event handler
        $('.colorpicker').fadeOut("slow", "linear");
        $('#draw').fadeIn("slow", "linear");
        bCanPreview = false;
        e.stopPropagation();
    });
    $('#confirm').click(function(e) { // click event handler
        if (allowConfirm) {
            $('.colorpicker').fadeOut("slow", "linear");
            $('#draw').fadeIn("slow", "linear");
            bCanPreview = false;
        } else {
            alert("Make sure to press Enter after changing the fields. Make sure all fields contain valid values.   ");
        }
        e.stopPropagation();
    });
    $('#cancel').click(function(e) {
        if (oldValues != null) {
            $('#hexVal').val(oldValues.hexVal);
            $('#rVal').val(oldValues.rVal);
            $('#gVal').val(oldValues.gVal);
            $('#bVal').val(oldValues.bVal);
            $('#rgbVal').val(oldValues.rgbVal);
            $('.preview').css('backgroundColor', $('#hexVal').val());
        }
        $('.colorpicker').fadeOut("slow", "linear");
        $('#draw').fadeIn("slow", "linear");
        bCanPreview = false;
        e.stopPropagation();
    });
    $('#black').click(function(e) {
        //update preview color
        var pixelColor = "rgb(0, 0, 0)";
        $('.preview').css('backgroundColor', pixelColor);
        $('#hexVal').val('#000000');

        //update controls
        $('#rVal').val('0');
        $('#gVal').val('0');
        $('#bVal').val('0');
        $('#rgbVal').val('0, 0, 0');
    });
    $('#white').click(function(e) {
        //update preview color
        var pixelColor = "rgb(255, 255, 255)";
        $('.preview').css('backgroundColor', pixelColor);
        $('#hexVal').val('#FFFFFF');

        //update controls
        $('#rVal').val('255');
        $('#gVal').val('255');
        $('#bVal').val('255');
        $('#rgbVal').val('255, 255, 255');
    });

    function isValidHex(str) {
        if (str.charAt(0) != '#' || isNaN(parseInt(str.substr(1, str.length), 16)) || str.length != 7) {
            return false;
        }
        var whitelist = "ABCDEFabcdef0123456789";
        for (var i = 1; i < str.length; i++) {
            if (whitelist.indexOf(str.charAt(i)) == -1) {
                return false;
            }
        }
        return true;
    }

    function isValidRGB(str) {
        for (var i = 0; i < str.length; i++) {
            if (isNaN(str.charAt(i))) {
                return false;
            }
        }
        if (parseInt(str) > 255 || parseInt(str < 0)) {
            return false;
        } else {
            return true;
        }
    }

    function rgbChange(pixel) {
        // update preview color
        var pixelColor = "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
        $('.preview').css('backgroundColor', pixelColor);

        // update controls
        $('#rVal').val(pixel[0]);
        $('#gVal').val(pixel[1]);
        $('#bVal').val(pixel[2]);
        $('#rgbVal').val(pixel[0] + ',' + pixel[1] + ',' + pixel[2]);

        var dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
        $('#hexVal').val('#' + ('0000' + dColor.toString(16)).substr(-6));
    }
});