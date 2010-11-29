/*
 * MindTouch Core - open source enterprise collaborative networking
 * Copyright (c) 2006-2010 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * For community documentation and downloads visit www.opengarden.org;
 * please review the licensing section.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 * http://www.gnu.org/copyleft/lesser.html
 */
(function() {

    // object used to extend XHR instances (since it has no prototype)
    var extendXhr = function(xhr) {
        return _.extend(xhr, {
            getStatusText: function() {
                switch (this.status) {
                case 100:
                    return 'Continue';
                case 101:
                    return 'Switching Protocols';
                case 200:
                    return 'Ok';
                case 201:
                    return 'Created';
                case 202:
                    return 'Accepted';
                case 203:
                    return 'Non-Authoritative Information';
                case 204:
                    return 'No Content';
                case 205:
                    return 'Reset Content';
                case 206:
                    return 'Partial Content';
                case 207:
                    return 'Multi-Status';
                case 300:
                    return 'Multiple Choices';
                case 301:
                    return 'Moved Permanently';
                case 302:
                    return 'Found';
                case 303:
                    return 'See Other';
                case 304:
                    return 'Not Modified';
                case 305:
                    return 'Use Proxy';
                case 306:
                    return '(Reserved)';
                case 307:
                    return 'Temporary Redirect';
                case 400:
                    return 'Bad Request';
                case 401:
                    return 'Unauthorized';
                case 402:
                    return 'Payment Required';
                case 403:
                    return 'Forbidden';
                case 404:
                    return 'Not Found';
                case 405:
                    return 'Method Not Allowed';
                case 406:
                    return 'Not Acceptable';
                case 407:
                    return 'Proxy Authentication';
                case 408:
                    return 'Request Timeout';
                case 409:
                    return 'Conflict';
                case 410:
                    return 'Gone';
                case 411:
                    return 'Length Required';
                case 412:
                    return 'Precondition Failed';
                case 413:
                    return 'Request Entity Too Large';
                case 414:
                    return 'Request-URI Too Long';
                case 415:
                    return 'Unsupported Media Type';
                case 416:
                    return 'Requested Range Not Satisfiable';
                case 417:
                    return 'Expectation Failed';
                case 422:
                    return 'Unprocessable Entity';
                case 423:
                    return 'Locked';
                case 424:
                    return 'Failed Dependency';
                case 500:
                    return 'Internal Server Error';
                case 501:
                    return 'Not Implemented';
                case 502:
                    return 'Bad Gateway';
                case 503:
                    return 'Service Unavailable';
                case 504:
                    return 'Gateway Timeout';
                case 505:
                    return 'HTTP Version Not Supported';
                case 507:
                    return 'Insufficient Storage';
                }
                return '(Unknown)';
            },
            
            isSuccess: function() {
                return (this.status >= 200 && this.status < 300) || (this.status == 304 /* Not Modified */);
            },
            
            getETag: function() {
                var etag = this.getResponseHeader('ETag');
                
                // fix etag if content encoding was used
                var encoding = this.getResponseHeader('Content-Encoding');
                if (encoding && (encoding.length > 0)) {
                    etag = etag.replace('-' + encoding, '');
                }
                return etag;
            },
            
            errorMessage: function(message) {
                return (mesage || 'Request failed') + ' (status: ' + this.status + ' - ' + this.getStatusText() + ')';
            }
        });
    };
    
    var _parseUrl = function(url) {
        if (!url) {
            return {
                original: '',
                protocol: '',
                host: '',
                port: '0',
                params: null,
                fragment: null,
                segments: []
            };
        }
        var a = document.createElement('a');
        a.href = url;
        var result = {
            original: url,
            port: (function() {
                return (a.port && a.port !== '0') ? a.port : null;
            })(),
            //query: a.search,
            params: (function() {
                var ret = (url.indexOf('?') >= 0) ? {} : null, seg = a.search.replace(/^\?/, '').split('&');
                for (var i = 0; i < seg.length; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    var s = seg[i].split('=');
                    ret[s[0]] = (s.length > 1) ? decodeURIComponent(s[1]).decodeUtf8() : null;
                }
                return ret;
            })(),
            fragment: (url.indexOf('#') != -1) ? decodeURIComponent(a.hash.substr(1)).decodeUtf8() : null,
            segments: (function() {
                var ret = a.pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
                if (ret.length === 1 && ret[0].length === 0) {
                    ret = [];
                } else {
                    for (var i = 0; i < ret.length; ++i) {
                        ret[i] = decodeURIComponent(ret[i]).decodeUtf8();
                    }
                }
                return ret;
            })(),
            trailingSlash: a.pathname ? a.pathname[a.pathname.length - 1] == '/' : false
            //file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            //path: a.pathname.replace(/^([^\/])/, '/$1'),
            //relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [, ''])[1]
        };
        
        // determine protocol; some browsers return 'file:' instead of '' when it's missing 
        result.protocol = (a.protocol !== 'file:' || url.substr(0, 7) === 'file://') ? a.protocol.replace(':', '') : null;
        
        // determine hostname; some browsers return 'localhost' instead of '' when it's missing
        result.hostname = result.protocol ? a.hostname : null;
        
        // check if url contained it's default port number explicitly
        result.implicitPort = (result.port === null);
        if (result.implicitPort && result.protocol) {
            switch (result.protocol) {
            case 'http':
                result.port = '80';
                break;
            case 'https':
                result.port = '443';
                break;
            case 'ftp':
                result.port = '21';
                break;
            case 'file':
                result.port = null;
                break;
            default:
                
                // we don't know the default port number for this protocol
                result.port = 0;
                break;
            }
            
            // check if url contained it's default port number explicitly
            var prefix = result.protocol + '://' + result.hostname + ':';
            result.implicitPort = (url.substr(0, prefix.length) !== prefix);
        }
        return result;
    };
    
    var _invoke = function(callback, data) {
        if (_.isString(callback)) {
            PageBus.publish(callback, data);
        } else if (_.isFunction(callback)) {
            callback.apply(null, [data]);
        } else {
            throw new Error('invalid plug callback');
        }
    };
    
    this.Plug = function(url, options) {
        if (!url) {
            throw new Error("missing url argument");
        }
        options || (options = {});
        this.headers = options.headers || {};
        _.extend(this, _.isString(url) ? _parseUrl(url) : url, options);
    };
    
    _.extend(this.Plug.prototype, {
        getUrl: function() {
            var url = '';
            if (this.protocol) {
                url += this.protocol + '://' + this.hostname;
            }
            if (!this.implicitPort && this.port) {
                url += ':' + this.port;
            }
            for (var i = 0; i < this.segments.length; ++i) {
                url += '/' + this.segments[i].encodeUrlSegment();
            }
            if (this.trailingSlash) {
                url += '/';
            }
            if (this.params) {
                url += '?';
                var first = true;
                _.each(this.params, function(value, key) {
                    if (!first) {
                        url += '&';
                    }
                    first = false;
                    url += key.encodeUrlQuery();
                    if (value !== null) {
                        url += '=' + value.encodeUrlQuery();
                    }
                });
            }
            if (this.fragment !== null) {
                url += '#' + this.fragment.encodeUrlFragment();
            }
            return url;
        },
        
        get: function(callback, verb) {
            var async = callback != null;
            
            // initiate AJAX request
            var xhr = $.ajax({
                context: this,
                
                // determine if request should be done asynchronously
                async: async,
                
                // set the request location
                url: this.getUrl(),
                
                // set the request HTTP verb
                type: verb || 'GET',
                cache: false,
                
                // add custom header which checks if the property was modified since we read it
                beforeSend: this._beforeSend,
                
                // set callback
                complete: function(xhr) {
                    extendXhr(xhr);
                    if (callback) {
                        _invoke(callback, xhr);
                    } else if (!xhr.isSuccess()) {
                        throw new Error('Plug ' + (this.headers['X-HTTP-Method-Override'] || 'GET') + ' request failed for ' + this.getUrl() + ' (status: ' + xhr.status + ' - ' + xhr.getStatusText() + ')');
                    }
                }
            });
            if (!async) {
                extendXhr(xhr);
                return xhr;
            }
        },
        
        post: function(value, mime, callback) {
            var async = callback != null;
            
            // initiate AJAX request
            var xhr = $.ajax({
                context: this,
                
                // determine if request should be done asynchronously
                async: async,
                
                // set the request location
                url: this.getUrl(),
                
                // set the request HTTP verb
                type: 'POST',
                
                // set the value of the updated property
                data: value,
                contentType: mime,
                processData: false,
                
                // add custom header which checks if the property was modified since we read it
                beforeSend: this._beforeSend,
                
                // set callback
                complete: function(xhr) {
                    extendXhr(xhr);
                    if (callback) {
                        _invoke(callback, xhr);
                    } else if (!xhr.isSuccess()) {
                        throw new Error('Plug ' + (this.headers['X-HTTP-Method-Override'] || 'POST') + ' request failed for ' + this.getUrl() + ' (status: ' + xhr.status + ' - ' + xhr.getStatusText() + ')');
                    }
                }
            });
            if (!async) {
                extendXhr(xhr);
                return xhr;
            }
        },
        
        put: function(value, mime, callback) {
            return this.withHeader('X-HTTP-Method-Override', 'PUT').post(value, mime, callback);
        },
        
        head: function(callback) {
            return this.get(callback, 'HEAD');
        },
        
        options: function(callback) {
            return this.get(callback, 'OPTIONS');
        },
        
        del: function(callback) {
            return this.withHeader('X-HTTP-Method-Override', 'DELETE').post(null, null, callback);
        },
        
        at: function() {
            for (var i = 0; i < arguments.length; ++i) {
                if (_.isNull(arguments[i])) {
                    throw new Error('argument ' + (i + 1) + ' is null');
                }
            }
            var segments = this.segments.concat.apply(this.segments, _.map(arguments, function(v) {
                return _.isString(v) ? v : new String(v);
            }));
            return new Plug(this, _.extend({}, this.options, {
                segments: segments,
                trailingSlash: false
            }));
        },
        
        withParam: function(key, value) {
            var params = _.extend({}, this.params);
            params[key] = value;
            return new Plug(this, _.extend({}, this.options, {
                params: params
            }));
        },
        
        withParams: function(values) {
            var params = _.extend({}, this.params, values);
            return new Plug(this, _.extend({}, this.options, {
                params: params
            }));
        },
        
        withoutParam: function(key) {
            var params = _.extend({}, this.params);
            delete params[key];
            return new Plug(this, _.extend({}, this.options, {
                params: params
            }));
        },
        
        withTrailingSlash: function() {
            return new Plug(this, _.extend({}, this.options, {
                trailingSlash: true
            }));
        },
        
        withoutTrailingSlash: function() {
            return new Plug(this, _.extend({}, this.options, {
                trailingSlash: true
            }));
        },
        
        withHeader: function(key, value) {
            var headers = _.extend({}, this.headers);
            headers[key] = value;
            return new Plug(this, _.extend({}, this.options, {
                headers: headers
            }));
        },
        
        withHeaders: function(values) {
            var headers = _.extend({}, this.headers, values);
            return new Plug(this, _.extend({}, this.options, {
                headers: headers
            }));
        },
        
        withoutHeader: function(key) {
            var headers = _.extend({}, this.headers);
            delete headers[key];
            return new Plug(this, _.extend({}, this.options, {
                headers: headers
            }));
        },
        
        _beforeSend: function(xhr) {
            if (this.headers) {
                $.each(this.headers, function(header, header_value) {
                    if ((typeof header_value != 'object') && (typeof header_value != 'function')) {
                        xhr.setRequestHeader(header, header_value);
                    }
                });
            }
            if (this.protocol === 'https') {
                xhr.setRequestHeader('Front-End-Https', 'On');
            }
            return true;
        }
    });
})();
