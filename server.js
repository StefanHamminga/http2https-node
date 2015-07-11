#!/usr/bin/sudo /usr/bin/node
/*

http2https-node - A simple redirect and domain mapping server
===============

Copyright © 2015 Stefan Hamminga <stefan@prjct.net>

http2https-node is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

http2https-node is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
http2https-node.  If not, see <http://www.gnu.org/licenses/>.
*/

YAML           = require('yamljs'); // Sane configuration file formatting
var fs         = require('fs'); // To watch for updates in the domain mapping
var http       = require('http');

//=== Application configuration ================================================
global.CONFIG  = YAML.load('config/global.yaml');
CONFIG.mapping = YAML.load('config/domainmapping.yaml');
var env        = (process.env.NODE_ENV || CONFIG.Env || 'production');


var listen     = [ "", 80 ];
if (CONFIG[env].Listen) {
  listen       = CONFIG[env].Listen.split(":");
}
var _port      = ((CONFIG[env].TargetPort && (CONFIG[env].TargetPort !== 443)) ?
                                           (":" + CONFIG[env].TargetPort) : "");

// TODO: These expressions are the bare minimum, they might need some fine
// tuning to handle all corner cases
var hasQuery   = new RegExp("[^\?]*[\?]+[^\?]*"); // Any URL not starting or ending with, but containing a '?' char
var stripWWW   = new RegExp("^www\.", "i"); // What to snip away from the host

// Handle manipulations of the incoming hostname.
var hostFilter = function(hostname) {
  if (CONFIG.DomainMapping === true) {
    var mappedHost = CONFIG.mapping[hostname];
    if (typeof mappedHost !== 'undefined') {
      return mappedHost;
    } else if (CONFIG[env].StripWWW) {
      return hostname.replace(stripWWW, "");
    } else {
      return hostname;
    }
  } else if (CONFIG.StripWWW) {
    return hostname.replace(stripWWW, "");
  } else {
    return hostname;
  }
};


var saveHostQ = function(hostname, url) {
  if (hasQuery.test(url)) {
    return "&" + CONFIG[env].QueryHostKey + "=" + hostname;
  } else {
    return "?" + CONFIG[env].QueryHostKey + "=" + hostname;
  }
};

var handler = function (request, response) {
  response.writeHead(CONFIG[env].RedirectType || 301, {
    "Location": "https://" +
    hostFilter(request.headers.host) + _port +
    request.url +
    ((CONFIG[env].SendOriginalHostAsQuery === true) ? saveHostQ(request.headers.host, request.url) : "") });
  response.end();
};

server = http.createServer(handler);

if (listen[0] != "") {
  server.listen(listen[1] || 80, listen[0]);
} else {
  server.listen(listen[1] || 80);
}
console.log("Server listening on: ", listen.join(":"));

// Update domain mappings without restarting the server
fs.watch('config/domainmapping.yaml', function (event) {
  if (event === "change") {
    try {
      var newmapping = YAML.load('config/domainmapping.yaml');
      CONFIG.mapping = newmapping;
      console.log("Successfully reloaded domain mapping configuration.");
    } catch (e) {
      console.log("Error loading updated domain mapping file: ", e.message);
    }
  }
});
