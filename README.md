# http2https-node

Simple [Node.js](https://nodejs.org/) based redirect and domain mapping server.

## Operation

### Redirecting

This little server is intended to be used as a companion to a HTTPS based ecosystem. It will [redirect](https://en.wikipedia.org/wiki/URL_redirection) any connection (no matter the hostname) on plain HTTP to the HTTPS equivalent.

### Mapping

There is also a simple mapping system. The simplest supported operation is to strip `www.` from hostnames, transferring a request to `http://www.example.com` to `https://example.com`.

A little more advanced is the domain mapping table, where a requested hostname can be redirected to any other chosen hostname.

### Tracking

If the `SendOriginalHostAsQuery` option is enabled, the original hostname is appended to the new URL as a query string.

## Getting started

Grab a copy of the application from:

https://github.com/StefanHamminga/http2https-node

1. Install the dependencies:

```sh
git clone https://github.com/StefanHamminga/http2https-node
cd http2https-node
npm install
```

2. Edit `.gitignore` to exclude the configuration files from GIT

3. Review the configuration files in `./config/`.


4. Run the server

```sh
sudo node server.js
```
or
```sh
./server.js
```

## Configuration

All configuration files are in [YAML syntax](https://en.wikipedia.org/wiki/YAML#Sample_document).

`global.yaml` is pretty self explanatory:

```yaml
AppName: "http2https-node"
# You can set any value, as long as it has an associated configuration
Env: production

production:
  # IP and port combinations our application listens on. If commented out
  # {node-default}:80 is used.
  Listen: 0.0.0.0:80

  # Port to redirect to. Default action is to not include a port and let the
  # client figure it out. Leave this unconfigured if you plan to include ports
  # in your domain mappings!
  #TargetPort: 443

  # 301 for permanent redirection, 302 for temporary. Defaults to 301
  #RedirectType: 302

  # Should we run the request hostname through a lookup/replacement table?
  # Defaults to false
  DomainMapping: true

  # In case domain mapping is disabled or not applicable, should we strip `www.`
  # from the target hostname? Defaults to false
  StripWWW: true

  # Try and send original hostname as a querystring parameter. Default: false
  SendOriginalHostAsQuery: true
  # The keyname appended
  QueryHostKey: original_hostname
  # Try and send original hostname in a cookie (to be implemented).
  # Default: false
  #SendOriginalHostInCookie: true

development:
  Listen: 0.0.0.0:80
  TargetPort: 443
  RedirectType: 302
  DomainMapping: true
  StripWWW: true
  SendOriginalHostAsQuery: true
  #SendOriginalHostInCookie: true
```

And domain mapping (`domainmapping.yaml`) is done like this:
```yaml
# Simple domain mapping.
# Syntax:
#   incoming.host.com: outgoing.host.org
# or:
#   incoming.host.com: outgoing.host.org:8443
#
# Incoming names need to be unique, outgoing can be anything within reason.
# Adding a symmetric entry is *not* exactly the same as leaving it out. When
# leaving out an entry the www strip filter can still apply. Any matched entry
# here will bypass the strip filter.
#
# You can also add a port (eg. example.com:8443) to the entries here, but be
# sure to comment out any `TargetPort` setting if you do.

www.example.com: example.com
anotherexample.com: www.anotherexample.com
domain.com: domain.com
www.domain.com: www.domain.com
```
