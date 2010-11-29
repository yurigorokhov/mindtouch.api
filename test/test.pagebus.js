/**
 * @author steve_bjorg
 */
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
    module('PageBus');
    
    //--- Channel Name Validation Tests ---
    test('publish null channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.publish(null, 'message');
        }, 'channel name validation');
    });
    
    test('publish empty channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.publish('', 'message');
        }, 'channel name validation');
    });
    
    test('publish wildcard channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.publish('*', 'message');
        }, 'channel name validation');
    });
    
    test('publish invalid channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.publish('foo*', 'message');
        }, 'channel name validation');
    });
    
    test('subscribe null channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.subscribe(null, function() {
            });
        }, 'channel name validation');
    });
    
    test('subscribe empty channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.subscribe('', function() {
            });
        }, 'channel name validation');
    });
    
    test('subscribe invalid channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.subscribe('foo*', function() {
            });
        }, 'channel name validation');
    });
    
    test('query null channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.query(null);
        }, 'channel name validation');
    });
    
    test('query empty channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.query('');
        }, 'channel name validation');
    });
    
    test('query wildcard channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.query('*');
        }, 'channel name validation');
    });
    
    test('query invalid channel', function() {
        PageBus.reset();
        raises(function() {
            PageBus.query('foo*');
        }, 'channel name validation');
    });
    
    //--- Subscribe/Publish Tests ---
    test('subscribe to x, publish to x', function() {
        PageBus.reset();
        var x = null;
        PageBus.subscribe('x', function(name, message, data) {
            x = message;
        });
        PageBus.publish('x', 'test x');
        
        equal(x, 'test x');
    });
    
    test('subscribe to x.y, publish x', function() {
        PageBus.reset();
        var x_y = null;
        PageBus.subscribe('x.y', function(name, message, data) {
            x_y = message;
        });
        PageBus.publish('x', 'test x');
        
        equal(x_y, null);
    });
    
    test('subscribe to x.y, publish x.y', function() {
        PageBus.reset();
        var x_y = null;
        PageBus.subscribe('x.y', function(name, message, data) {
            x_y = message;
        });
        PageBus.publish('x.y', 'test x.y');
        
        equal(x_y, 'test x.y');
    });
    
    test('subscribe to x.*, publish x', function() {
        PageBus.reset();
        var x_ = null;
        PageBus.subscribe('x.*', function(name, message, data) {
            x_ = message;
        });
        PageBus.publish('x', 'test x');
        
        equal(x_, null);
    });
    
    test('subscribe to x.*, publish x.y', function() {
        PageBus.reset();
        var x_ = null;
        PageBus.subscribe('x.*', function(name, message, data) {
            x_ = message;
        });
        PageBus.publish('x.y', 'test x.y');
        
        equal(x_, 'test x.y');
    });
    
    test('subscribe to x.*, publish x.y.z', function() {
        PageBus.reset();
        var x_ = null;
        PageBus.subscribe('x.*', function(name, message, data) {
            x_ = message;
        });
        PageBus.publish('x.y.z', 'test x.y.z');
        
        equal(x_, 'test x.y.z');
    });
    
    //--- Publish/Query Tests ---
    test('publish x, query x', function() {
        PageBus.reset();
        PageBus.publish('x', 'test x');
        var value = PageBus.query('x');
        
        equal(value, 'test x');
    });
    
    test('publish x, query x.y', function() {
        PageBus.reset();
        PageBus.publish('x', 'test x');
        var value = PageBus.query('x.y');
        
        equal(value, null);
    });
    
    test('publish x.y, query x', function() {
        PageBus.reset();
        PageBus.publish('x.y', 'test x.y');
        var value = PageBus.query('x');
        
        equal(value, null);
    });
    
    test('publish x.y, query x.y', function() {
        PageBus.reset();
        PageBus.publish('x.y', 'test x.y');
        var value = PageBus.query('x.y');
        
        equal(value, 'test x.y');
    });
    
    //--- Subscribe/Unsubscribe Tests ---
    test('subscribe to x, unsubscribe, publish to x', function() {
        PageBus.reset();
        var x = null;
        var subscription = PageBus.subscribe('x', function(name, message, data) {
            x = message;
        });
        subscription.dispose();
        PageBus.publish('x', 'test x');
        
        equal(x, null);
    });
    
    test('subscribe to x, unsubscribe, unsubscribe', function() {
        PageBus.reset();
        var x = null;
        var subscription = PageBus.subscribe('x', function(name, message, data) {
            x = message;
        });
        subscription.dispose();
        subscription.dispose();
    });
    
    //--- Nested Subscribe/Publish/Unsubscribe Tests ---
    test('nested unsubscribe', function() {
        PageBus.reset();
        var x1 = null;
        var subscription1 = PageBus.subscribe('x', function(name, message, data) {
            x1 = message;
            subscription2.dispose();
        });
        var x2 = null;
        var subscription2 = PageBus.subscribe('x', function(name, message, data) {
            x2 = message;
        });
        var x3 = null;
        var subscription3 = PageBus.subscribe('x', function(name, message, data) {
            x3 = message;
        });
        PageBus.publish('x', 'test x');
        
        equal(x1, 'test x');
        equal(x2, 'test x');
        equal(x3, 'test x');
    });
    
    test('nested unsubscribe, publish again', function() {
        PageBus.reset();
        var x1 = null;
        var subscription1 = PageBus.subscribe('x', function(name, message, data) {
            x1 = message;
            subscription2.dispose();
        });
        var x2 = null;
        var subscription2 = PageBus.subscribe('x', function(name, message, data) {
            x2 = message;
        });
        var x3 = null;
        var subscription3 = PageBus.subscribe('x', function(name, message, data) {
            x3 = message;
        });
        PageBus.publish('x', 'test x1');
        PageBus.publish('x', 'test x2');
        
        equal(x1, 'test x2');
        equal(x2, 'test x1');
        equal(x3, 'test x2');
    });
    
    test('nested unsubscribe, nested publish', function() {
        PageBus.reset();
        var x1 = null;
        var subscription1 = PageBus.subscribe('x', function(name, message, data) {
            x1 = message;
            subscription2.dispose();
        });
        var x2 = null;
        var subscription2 = PageBus.subscribe('x', function(name, message, data) {
            x2 = message;
            PageBus.publish('x', 'nested test x');
        });
        var x3 = null;
        var subscription3 = PageBus.subscribe('x', function(name, message, data) {
            x3 = message;
        });
        PageBus.publish('x', 'test x');
        
        equal(x1, 'nested test x');
        equal(x2, 'test x');
        equal(x3, 'nested test x');
    });
    
    test('nested publish', function() {
        PageBus.reset();
        var x1 = null;
        PageBus.subscribe('x', function(name, message, data) {
            x1 = message;
        });
        var x2 = null;
        PageBus.subscribe('x', function(name, message, data) {
            x2 = message;
            if (message === 'test x1') {
                PageBus.publish('x', 'test x2');
            }
        });
        var x3 = null;
        PageBus.subscribe('x', function(name, message, data) {
            x3 = message;
        });
        PageBus.publish('x', 'test x1');
        
        equal(x1, 'test x2');
        equal(x2, 'test x2');
        equal(x3, 'test x2');
    });
});
