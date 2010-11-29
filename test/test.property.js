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
    module('Property');
    
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
            },
			responseText: '{}'
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
	PageBus.subscribe("test-channel", null, function(name, message, data) {
        window.lastCallback = message;
    });
	
	Deki = {
		BaseHref: "http://localhost/",
		PageId: 1
	};
    
    test('sync get', function() {
		var p = new Property('test');
		p.get();
        equal(lastRequest.url, 'http://localhost/@api/deki/pages/1/properties/urn%253acustom.mindtouch.com%2523test', 'url');
        equal(lastRequest.type, 'GET', 'verb');
        equal(lastRequest.async, false, 'async');
        equal(lastCallback.status, 200, "callback")
    });
});
