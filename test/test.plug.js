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
$(function() {
    module('Plug');
    
    // Variable to catch the last request.
    window.lastRequest = null;
    window.lastCallback = null;
    
    // Stub out jQuery.ajax...
    $.ajax = function(obj) {
        lastRequest = _.extend({
            headers: {}
        }, obj);
        var xhrMethods = {
            setRequestHeader: function(name, value) {
                lastRequest.headers[name] = value;
            },
            getResponseHeader: function(name) {
                return null;
            }
        };
        if (obj.beforeSend) {
            obj.beforeSend.apply(obj.context || obj, [_.extend({}, xhrMethods)]);
        }
        if (obj.async) {
            obj.complete.apply(obj.context || obj, [_.extend({
                status: 200
            }, xhrMethods)]);
            return null;
        }
        return _.extend({
            status: 200
        }, xhrMethods);
    };
    
    var ajaxCallback = function(xhr) {
        window.lastCallback = xhr;
    };
    
    // setup plug parsing tests
    var hosts = {
        'http://localhost': function(p) {
            equal(p.protocol, 'http', 'protocol');
            equal(p.hostname, 'localhost', 'host');
            equal(p.port, '80', 'port');
            equal(p.implicitPort, true, 'implicit port');
        },
        'https://localhost': function(p) {
            equal(p.protocol, 'https', 'protocol');
            equal(p.hostname, 'localhost', 'host');
            equal(p.port, '443', 'port');
            equal(p.implicitPort, true, 'implicit port');
        },
        'http://localhost:8080': function(p) {
            equal(p.protocol, 'http', 'protocol');
            equal(p.hostname, 'localhost', 'host');
            equal(p.port, '8080', 'port');
            equal(p.implicitPort, false, 'implicit port');
        },
        'http://localhost:80': function(p) {
            equal(p.protocol, 'http', 'protocol');
            equal(p.hostname, 'localhost', 'host');
            equal(p.port, '80', 'port');
            equal(p.implicitPort, false, 'implicit port');
        },
        'https://localhost:443': function(p) {
            equal(p.protocol, 'https', 'protocol');
            equal(p.hostname, 'localhost', 'host');
            equal(p.port, '443', 'port');
            equal(p.implicitPort, false, 'implicit port');
        },
        'https://localhost:8080': function(p) {
            equal(p.protocol, 'https', 'protocol');
            equal(p.hostname, 'localhost', 'host');
            equal(p.port, '8080', 'port');
            equal(p.implicitPort, false, 'implicit port');
        },
        'http://192.168.1.1': function(p) {
            equal(p.protocol, 'http', 'protocol');
            equal(p.hostname, '192.168.1.1', 'host');
            equal(p.port, '80', 'port');
            equal(p.implicitPort, true, 'implicit port');
        },
        'http://192.168.1.1:8080': function(p) {
            equal(p.protocol, 'http', 'protocol');
            equal(p.hostname, '192.168.1.1', 'host');
            equal(p.port, '8080', 'port');
            equal(p.implicitPort, false, 'implicit port');
        },
        'https://192.168.1.1': function(p) {
            equal(p.protocol, 'https', 'protocol');
            equal(p.hostname, '192.168.1.1', 'host');
            equal(p.port, '443', 'port');
            equal(p.implicitPort, true, 'implicit port');
        },
        'https://192.168.1.1:8080': function(p) {
            equal(p.protocol, 'https', 'protocol');
            equal(p.hostname, '192.168.1.1', 'host');
            equal(p.port, '8080', 'port');
            equal(p.implicitPort, false, 'implicit port');
        },
        'http://sub.domain.root': function(p) {
            equal(p.protocol, 'http', 'protocol');
            equal(p.hostname, 'sub.domain.root', 'host');
            equal(p.port, '80', 'port');
            equal(p.implicitPort, true, 'implicit port');
        },
        'http://sub.domain.root:8080': function(p) {
            equal(p.protocol, 'http', 'protocol');
            equal(p.hostname, 'sub.domain.root', 'host');
            equal(p.port, '8080', 'port');
            equal(p.implicitPort, false, 'implicit port');
        },
        'https://sub.domain.root': function(p) {
            equal(p.protocol, 'https', 'protocol');
            equal(p.hostname, 'sub.domain.root', 'host');
            equal(p.port, '443', 'port');
            equal(p.implicitPort, true, 'implicit port');
        },
        'https://sub.domain.root:8080': function(p) {
            equal(p.protocol, 'https', 'protocol');
            equal(p.hostname, 'sub.domain.root', 'host');
            equal(p.port, '8080', 'port');
            equal(p.implicitPort, false, 'implicit port');
        },
        '': function(p) {
            equal(p.protocol, null, 'protocol');
            equal(p.hostname, null, 'host');
            equal(p.port, null, 'port');
            equal(p.implicitPort, true, 'implicit port');
        },
        'file://': function(p) {
            equal(p.protocol, 'file', 'protocol');
            equal(p.hostname, '', 'host');
            equal(p.port, null, 'port');
            equal(p.implicitPort, true, 'implicit port');
        }
    };
    var paths = {
        '/': function(p) {
            deepEqual(p.segments, [], 'segments');
            equal(p.trailingSlash, true, 'trailing slash');
        },
        '/path': function(p) {
            deepEqual(p.segments, ['path'], 'segments');
            equal(p.trailingSlash, false, 'trailing slash');
        },
        '/path/': function(p) {
            deepEqual(p.segments, ['path'], 'segments');
            equal(p.trailingSlash, true, 'trailing slash');
        },
        '/path/subpath': function(p) {
            deepEqual(p.segments, ['path', 'subpath'], 'segments');
            equal(p.trailingSlash, false, 'trailing slash');
        }
    };
    var params = {
        '': function(p) {
            equal(p.params, null, 'params');
        },
        '?a=b': function(p) {
            deepEqual(p.params, {
                a: 'b'
            }, 'params');
        },
        '?a=b&c=d': function(p) {
            deepEqual(p.params, {
                a: 'b',
                c: 'd'
            }, 'params');
        },
        '?': function(p) {
            deepEqual(p.params, {}, 'params');
        },
        '?a': function(p) {
            deepEqual(p.params, {
                a: null
            }, 'params');
        },
        '?a=': function(p) {
            deepEqual(p.params, {
                a: ''
            }, 'params');
        }
    };
    var fragments = {
        '': function(p) {
            equal(p.fragment, null, 'fragment');
        },
        '#': function(p) {
            equal(p.fragment, '', 'fragment');
        },
        '#frag/sub#subsub': function(p) {
            equal(p.fragment, 'frag/sub#subsub', 'fragment');
        },
    };
    
    // run all parsing tests
    for (var host in hosts) {
        for (var path in paths) {
            for (var param in params) {
                for (var fragment in fragments) {
                    (function() {
                        var h = hosts[host];
                        var p = paths[path];
                        var q = params[param];
                        var f = fragments[fragment];
                        var url = host + path + param + fragment;
                        test('parse ' + url, function() {
                            PageBus.reset();
                            PageBus.subscribe('test-channel', null, function(name, message, data) {
                                window.lastCallback = message;
                            });
                            window.lastRequest = null;
                            window.lastCallback = null;
                            var plug = new Plug(url);
                            equal(plug.getUrl(), url, 'url');
                            h(plug);
                            p(plug);
                            q(plug);
                            f(plug);
                        });
                    })();
                }
            }
        }
    }
    
    // setup plug call tests
    var requests = {
        'http://localhost/path/subpath/?a=b&c=d#foo': function(p) {
            equal(lastRequest.headers['Front-End-Https'], null, 'Front-End-Https');
        },
        'https://localhost:80/path/subpath/?a=b&c=d#foo': function(p) {
            equal(lastRequest.headers['Front-End-Https'], 'On', 'Front-End-Https');
        }
    };
    var actions = {
        'get': function(p) {
            var xhr = p.get();
            equal(lastRequest.type, 'GET', 'verb');
            equal(lastRequest.async, false, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(xhr.status, 200, 'response')
        },
        'callback get': function(p) {
            p.get(ajaxCallback);
            equal(lastRequest.type, 'GET', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'channel get': function(p) {
            p.get('test-channel');
            equal(lastRequest.type, 'GET', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'post': function(p) {
            var xhr = p.post();
            equal(lastRequest.type, 'POST', 'verb');
            equal(lastRequest.async, false, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(xhr.status, 200, 'response')
        },
        'callback post': function(p) {
            p.post(null, null, ajaxCallback);
            equal(lastRequest.type, 'POST', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'channel post': function(p) {
            p.post(null, null, 'test-channel');
            equal(lastRequest.type, 'POST', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'head': function(p) {
            var xhr = p.head();
            equal(lastRequest.type, 'HEAD', 'verb');
            equal(lastRequest.async, false, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(xhr.status, 200, 'response')
        },
        'callback head': function(p) {
            p.head(ajaxCallback);
            equal(lastRequest.type, 'HEAD', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'channel head': function(p) {
            p.head('test-channel');
            equal(lastRequest.type, 'HEAD', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'options': function(p) {
            var xhr = p.options();
            equal(lastRequest.type, 'OPTIONS', 'verb');
            equal(lastRequest.async, false, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(xhr.status, 200, 'response')
        },
        'callback options': function(p) {
            p.options(ajaxCallback);
            equal(lastRequest.type, 'OPTIONS', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'channel options': function(p) {
            p.options('test-channel');
            equal(lastRequest.type, 'OPTIONS', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], null, 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'put': function(p) {
            var xhr = p.put();
            equal(lastRequest.type, 'POST', 'verb');
            equal(lastRequest.async, false, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], 'PUT', 'X-HTTP-Method-Override');
            equal(xhr.status, 200, 'response')
        },
        'callback put': function(p) {
            p.put(null, null, ajaxCallback);
            equal(lastRequest.type, 'POST', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], 'PUT', 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'channel put': function(p) {
            p.put(null, null, 'test-channel');
            equal(lastRequest.type, 'POST', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], 'PUT', 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'del': function(p) {
            var xhr = p.del();
            equal(lastRequest.type, 'POST', 'verb');
            equal(lastRequest.async, false, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], 'DELETE', 'X-HTTP-Method-Override');
            equal(xhr.status, 200, 'response')
        },
        'callback del': function(p) {
            p.del(ajaxCallback);
            equal(lastRequest.type, 'POST', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], 'DELETE', 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        },
        'channel del': function(p) {
            p.del('test-channel');
            equal(lastRequest.type, 'POST', 'verb');
            equal(lastRequest.async, true, 'async');
            equal(lastRequest.headers['X-HTTP-Method-Override'], 'DELETE', 'X-HTTP-Method-Override');
            equal(lastCallback.status, 200, 'callback')
        }
    };
    
    // run all calling tests
    for (var request in requests) {
        for (var action in actions) {
            (function() {
                var r = requests[request];
                var a = actions[action];
                var url = request;
                test(action + ' ' + url, function() {
                    window.lastRequest = null;
                    window.lastCallback = null;
                    var plug = new Plug(url);
                    a(plug);
                    r(plug);
                });
            })();
        }
    }
    
    test('at', function() {
        var p = new Plug('http://localhost/path').at('subpath', 'other');
        equal(p.getUrl(), 'http://localhost/path/subpath/other');
        equal(p.protocol, 'http');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, ['path', 'subpath', 'other']);
        deepEqual(p.params, null);
        equal(p.fragment, null);
        deepEqual(p.headers, {});
    });
    
    test('at with url encoding', function() {
        var p = new Plug('http://localhost/').at('path', 'urn:custom.mindtouch.com#test');
        equal(p.getUrl(), 'http://localhost/path/urn%3acustom.mindtouch.com%23test');
        equal(p.protocol, 'http');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, ['path', 'urn:custom.mindtouch.com#test']);
        deepEqual(p.params, null);
        equal(p.fragment, null);
        deepEqual(p.headers, {});
    });
    
    test('at with utf8 encoding of \u20AC', function() {
        var p = new Plug('http://localhost/').at('\u20AC');
        equal(p.getUrl(), 'http://localhost/%e2%82%ac');
        equal(p.protocol, 'http');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, ['\u20AC']);
        deepEqual(p.params, null);
        equal(p.fragment, null);
        deepEqual(p.headers, {});
    });
    
    test('at immutable', function() {
        var p = new Plug('https://localhost:80/path/subpath/?a=b&c=d#foo');
        p.at('subpath', 'other');
        equal(p.protocol, 'https');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, ['path', 'subpath']);
        deepEqual(p.params, {
            a: 'b',
            c: 'd'
        });
        equal(p.fragment, 'foo');
        deepEqual(p.headers, {});
    });
    
    test('withParam', function() {
        var p = new Plug('http://localhost/').withParam('a', 'b');
        equal(p.getUrl(), 'http://localhost/?a=b');
        equal(p.protocol, 'http');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, []);
        deepEqual(p.params, {
            a: 'b'
        });
        equal(p.fragment, null);
        deepEqual(p.headers, {});
    });
    
    test('withParam immutable', function() {
        var p = new Plug('https://localhost:80/path/subpath/?a=b&c=d#foo');
        p.withParam('e', 'f');
        equal(p.protocol, 'https');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, ['path', 'subpath']);
        deepEqual(p.params, {
            a: 'b',
            c: 'd'
        });
        equal(p.fragment, 'foo');
        deepEqual(p.headers, {});
    });
    
    test('withParams', function() {
        var p = new Plug('http://localhost/?a=b').withParams({
            c: 'd',
            e: 'f'
        });
        equal(p.getUrl(), 'http://localhost/?a=b&c=d&e=f');
        equal(p.protocol, 'http');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, []);
        deepEqual(p.params, {
            a: 'b',
            c: 'd',
            e: 'f'
        });
        equal(p.fragment, null);
        deepEqual(p.headers, {});
    });
    
    test('withParams immutable', function() {
        var p = new Plug('https://localhost:80/path/subpath/?a=b&c=d#foo');
        p.withParams({
            c: 'd',
            e: 'f'
        });
        equal(p.protocol, 'https');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, ['path', 'subpath']);
        deepEqual(p.params, {
            a: 'b',
            c: 'd'
        });
        equal(p.fragment, 'foo');
        deepEqual(p.headers, {});
    });
    
    test('withoutParam', function() {
        var p = new Plug('http://localhost/?a=b&c=d').withoutParam('a');
        equal(p.getUrl(), 'http://localhost/?c=d');
        equal(p.protocol, 'http');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, []);
        deepEqual(p.params, {
            c: 'd'
        });
        equal(p.fragment, null);
        deepEqual(p.headers, {});
    });
    
    test('withoutParam immutable', function() {
        var p = new Plug('https://localhost:80/path/subpath/?a=b&c=d#foo');
        p.withoutParam('a');
        equal(p.protocol, 'https');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, ['path', 'subpath']);
        deepEqual(p.params, {
            a: 'b',
            c: 'd'
        });
        equal(p.fragment, 'foo');
        deepEqual(p.headers, {});
    });
    
    test('withHeader', function() {
        var p = new Plug('http://localhost/').withHeader('Slug', 'value');
        equal(p.protocol, 'http');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, []);
        deepEqual(p.params, null);
        equal(p.fragment, null);
        deepEqual(p.headers, {
            Slug: 'value'
        });
    });
    
    test('withHeader immutable', function() {
        var p = new Plug('https://localhost:80/path/subpath/?a=b&c=d#foo');
        p.withHeader('Slug', 'value');
        equal(p.protocol, 'https');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, ['path', 'subpath']);
        deepEqual(p.params, {
            a: 'b',
            c: 'd'
        });
        equal(p.fragment, 'foo');
        deepEqual(p.headers, {});
    });
    
    test('withHeaders', function() {
        var p = new Plug('http://localhost/').withHeaders({
            Slug: 'value',
            Header: 'header-value'
        });
        equal(p.protocol, 'http');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, []);
        deepEqual(p.params, null);
        equal(p.fragment, null);
        deepEqual(p.headers, {
            Slug: 'value',
            Header: 'header-value'
        });
    });
    
    test('withHeaders immutable', function() {
        var p = new Plug('https://localhost:80/path/subpath/?a=b&c=d#foo');
        p.withHeaders({
            Slug: 'value',
            Header: 'header-value'
        });
        equal(p.protocol, 'https');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, ['path', 'subpath']);
        deepEqual(p.params, {
            a: 'b',
            c: 'd'
        });
        equal(p.fragment, 'foo');
        deepEqual(p.headers, {});
    });
    
    test('withoutHeader', function() {
        var p = new Plug('http://localhost/').withHeaders({
            Slug: 'value',
            Header: 'header-value'
        }).withoutHeader('Slug')
        equal(p.protocol, 'http');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, []);
        deepEqual(p.params, null);
        equal(p.fragment, null);
        deepEqual(p.headers, {
            Header: 'header-value'
        });
    });
    
    test('withoutHeader immutable', function() {
        var p = new Plug('https://localhost:80/path/subpath/?a=b&c=d#foo').withHeaders({
            Slug: 'value',
            Header: 'header-value'
        });
        p.withoutHeader('Slug')
        equal(p.protocol, 'https');
        equal(p.hostname, 'localhost');
        equal(p.port, '80');
        deepEqual(p.segments, ['path', 'subpath']);
        deepEqual(p.params, {
            a: 'b',
            c: 'd'
        });
        equal(p.fragment, 'foo');
        deepEqual(p.headers, {
            Slug: 'value',
            Header: 'header-value'
        });
    });
});
