#!/usr/bin/env node
// Service to render a Vega specification to PNG/SVG

var express = require('express'),
vega = require("vega");

var port = process.argv[2] || 8888,
app = express(),
svgHeader =
'<?xml version="1.0" encoding="utf-8"?>\n' +
'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';

app.use(function(req, res, next) {
  var data = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    data += chunk;
   });

  req.on('end', function() {
    if (data) {
      req.body = data;
    }
    next();
  });
});

// Render vega specification as SVG or PNG.
// Set `format` to specify the output format
// Set `header` to `true` to include XML header and SVG doctype
app.post('/', function (req, res, next) {
  var spec = JSON.parse(req.body),
  header = req.query.header === "true",
  format = req.query.format || "svg";
  var view = new vega.View(vega.parse(spec), {renderer: 'none'});

  if (format === "svg") {
    console.log("Rendering an SVG");
    res.set('Content-Type', 'image/svg+xml');
    view.toSVG()
      .then(function(svg) {
        res.send((header ? svgHeader : "") + svg);
      })
      .catch(function(err) { console.error(err); });

  } else if (format === "png") {
    console.log("Rendering a PNG");
    res.set('Content-Type', 'image/png');
    view.toCanvas()
      .then(function(canvas) {
        // process node-canvas instance
        // for example, generate a PNG stream to write
        var stream = canvas.createPNGStream();
        stream
          .on("data", function(chunk) { res.write(chunk); })
          .on("end", function() { res.end(); });
      })
      .catch(function(err) { console.error(err); });
  } else {
    res.set('Content-Type', 'text');
    res.send("Invalid format " + format);
  }
});

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Server listening at http://%s:%s", host, port);
});
