/*
 * MindTouch API - javascript api for mindtouch
 * Copyright (c) 2010 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * For community documentation and downloads visit developer.mindtouch.com;
 * please review the licensing section.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
    var root = this;
    var $ = root.jQuery;
    
    root.Plug = function(url, options) {
    
        // ensure we have a url to work with
        if (!url) {
            throw new Error("missing url argument");
        }
        
        // in case we're called as a regular function
        if (!(this instanceof Plug)) {
            return new Plug(url, options);
        }
        
        // initailize options if omitted
        options || (options = {});
        this.headers = options.headers || {};
        $.extend(this, (typeof url === 'string') ? _parseUrl(url) : url, options);
    };
    
    // object used to extend XHR instances (since it has no prototype)
    var extendXhr = function(xhr) {
        return $.extend(xhr, {
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
            },
			
			isJson: function() {
				var jsonType = 'application/json';
				var contentType = this.getResponseHeader('Content-Type') || '';
				return contentType.substr(0, jsonType.length) === jsonType;
			},
			
			getJson: function() {
				if(!this.isSuccess()) {
					throw new Error('Response failed (status: ' + this.status + ' - ' + this.getStatusText() + ')');
				}
				if(!this.isJson()) {
					throw new Error('Response is not JSON (Content-Type: ' + this.getResponseHeader('Content-Type') + ')');
				}
				
				// TODO (steveb): we should use a safe JSON parsing library here like jQuery.parseJSON!
				return eval(this.responseText);
			}
        });
    };
    
    // uri parser function
    var _uriRegex = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(#.*)?)/;
    var _uriRegexKeys = ['original', 'protocol', 'authority', 'userInfo', 'user', 'password', 'hostname', 'port', 'relative', 'path', 'directory', 'file', 'query', 'fragment'];
    var _parseUrl = function(url) {
        if (!url) {
            return {
                original: '',
                protocol: null,
                authority: null,
                userInfo: null,
                user: null,
                password: null,
                hostname: null,
                port: null,
                relative: null,
                path: null,
                directory: null,
                file: null,
                query: null,
                params: null,
                fragment: null,
                segments: []
            };
        }
        
        // parse url
        var matches = _uriRegex.exec(url);
        var result = {};
        for (var i = 0; i < _uriRegexKeys.length; ++i) {
            result[_uriRegexKeys[i]] = matches[i] || null;
        }
        
        // decode fragment
        result.fragment = (result.fragment !== null) ? decodeURIComponent(result.fragment.substr(1)).decodeUtf8() : null;
        
        // detect trailing slash
        result.trailingSlash = result.path ? (result.path[result.path.length - 1] === '/') : false;
        
        // convert query into params
        result.params = (url.indexOf('?') < 0) ? null : (function() {
            var ret = {};
            if (result.query !== null) {
                var params = result.query.split('&');
                for (var i = 0; i < params.length; ++i) {
                    if (params[i]) {
                        var param = params[i].split('=');
                        ret[param[0]] = (param.length > 1) ? decodeURIComponent(param[1]).decodeUtf8() : null;
                    }
                }
            }
            return ret;
        })();
        
        // convert path into segments
        result.segments = (function() {
            var ret = result.path.replace(/^\//, '').replace(/\/$/, '').split('/');
            if (ret.length === 1 && ret[0].length === 0) {
                ret = [];
            } else {
                for (var i = 0; i < ret.length; ++i) {
                    ret[i] = decodeURIComponent(ret[i]).decodeUtf8();
                }
            }
            return ret;
        })();
        
        // determine protocol; some browsers return 'file:' instead of '' when it's missing 
        result.protocol = result.protocol ? result.protocol : null;
        
        // determine hostname; some browsers return 'localhost' instead of '' when it's missing
        result.hostname = result.protocol ? (result.hostname || '') : null;
        
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
    
    $.extend(this.Plug.prototype, {
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
                $.each(this.params, function(key, value) {
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
        
        get: function(callback, /* consider removing from function argument list and access via arguments array */ verb) {
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
                complete: async &&
                function(xhr) {
                    _.callOrPublish(callback, extendXhr(xhr));
                }
            });
            if (!async) {
                return extendXhr(xhr);
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
                complete: async &&
                function(xhr) {
                    _.callOrPublish(callback, extendXhr(xhr));
                }
            });
            if (!async) {
                return extendXhr(xhr);
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
                if (arguments[i] === null) {
                    throw new Error('argument ' + (i + 1) + ' is null');
                }
            }
            var segments = [];
            $.each(this.segments, function(index, value) {
                segments.push(value.toString());
            });
            $.each(arguments, function(index, value) {
                segments.push(value.toString());
            });
            return new Plug(this, $.extend({}, this.options, {
                segments: segments,
                trailingSlash: false
            }));
        },
        
        withParam: function(key, value) {
            var params = $.extend({}, this.params);
            params[key] = value;
            return new Plug(this, $.extend({}, this.options, {
                params: params
            }));
        },
        
        withParams: function(values) {
            var params = $.extend({}, this.params, values);
            return new Plug(this, $.extend({}, this.options, {
                params: params
            }));
        },
        
        withoutParam: function(key) {
            var params = $.extend({}, this.params);
            delete params[key];
            return new Plug(this, $.extend({}, this.options, {
                params: params
            }));
        },
        
        withTrailingSlash: function() {
            return new Plug(this, $.extend({}, this.options, {
                trailingSlash: true
            }));
        },
        
        withoutTrailingSlash: function() {
            return new Plug(this, $.extend({}, this.options, {
                trailingSlash: true
            }));
        },
        
        withHeader: function(key, value) {
            var headers = $.extend({}, this.headers);
            headers[key] = value;
            return new Plug(this, $.extend({}, this.options, {
                headers: headers
            }));
        },
        
        withHeaders: function(values) {
            var headers = $.extend({}, this.headers, values);
            return new Plug(this, $.extend({}, this.options, {
                headers: headers
            }));
        },
        
        withoutHeader: function(key) {
            var headers = $.extend({}, this.headers);
            delete headers[key];
            return new Plug(this, $.extend({}, this.options, {
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
