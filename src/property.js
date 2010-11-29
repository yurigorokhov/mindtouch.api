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
    this.Property = function(options) {
        if (_.isString(options)) {
            var hash = options.indexOf('#');
            if (hash >= 0) {
                options = {
                    name: options.substr(0, hash),
                    namespace: options.substr(hash + 1)
                };
            } else {
                options = {
                    name: options
                };
            }
        }
        
        // initialize settings
        options || (options = {});
        this.name = options.name || 'default';
        this.namespace = options.namespace || 'urn:custom.mindtouch.com';
        this.property = this.namespace + '#' + this.name;
        this.mime = options.mime || 'application/json; charset=utf-8';
        this.serialize = options.serialize || JSON.stringify;
        this.deserialize = options.deserialize || JSON.parse;
        
        // set initial property value
        this.value = null;
        this.etag = null;
        
        // TODO (steveb): initialize api plug properly
        var page_api = new Plug(Deki.BaseHref).at('@api', 'deki', 'pages', Deki.PageId, 'properties');
        this.plug = new Plug(page_api).at(this.property.encodeUrlSegment());
    };
    
    var _error = function(name, op, xhr, error /* fn({ status, text, xhr }) */) {
        if (error) {
            _.publish(error, {
                status: xhr.status,
                text: xhr.getStatusText(),
                xhr: xhr
            });
        } else {
            throw new Error(xhr.errorMessage('An error occurred trying to ' + op + ' property \'' + name + '\''));
        }
    };
    
    _.extend(this.Property.prototype, {
        get: function(success /* fn(this) */, error /* fn({ status, text, xhr }) */) {
        
            // TODO: use etag to do a conditional GET
            
            var _this = this;
            var completion = function(xhr) {
                if (xhr.isSuccess()) {
                    if (xhr.status != 304 /* Not Modified */) {
                        _this.value = _this.deserialize(xhr.responseText);
                        _this.etag = xhr.getETag();
                    }
                    if (success) {
                        _.publish(success, _this);
                    } else {
                        return _this.value;
                    }
                }
                return _error(_this.property, 'get', xhr, error);
            };
            var plug = this.plug;
            if (!success) {
                var xhr = plug.get();
                return completion(xhr);
            } else {
                plug.get(completion);
            }
        },
        
        set: function(value, success /* fn(this) */, error /* fn({ status, text, xhr }) */) {
            var _this = this;
            var completion = function(xhr) {
                if (xhr.isSuccess()) {
                    _this.value = value;
                    _this.etag = xhr.getETag();
                    if (success) {
                        _.publish(success, _this);
                    } else {
                        return _this.value;
                    }
                }
                return _error(_this.property, 'set', xhr, error);
            };
            var plug = this.plug.withParam('abort', 'never');
            if (this.etag) {
            
                // TODO (steveb): only add ETag header if optimistic locking is desired
                plug = plug.withHeader('ETag', this.etag);
            }
            if (!success) {
                var xhr = plug.put(this.serialize(value), this.mime);
                return completion(xhr);
            } else {
                plug.put(this.serialize(value), this.mime, completion);
            }
        },
        
        destroy: function(success /* fn(this) */, error /* fn({ status, text, xhr }) */) {
            var _this = this;
            var completion = function(xhr) {
                if (xhr.isSuccess()) {
                    _this.value = null;
                    _this.etag = null;
                    if (success) {
                        _.publish(success, _this);
                    } else {
                        return _this.value;
                    }
                }
                return _error(_this.property, 'delete', xhr, error);
            };
            if (!success) {
                var xhr = plug.del();
                return completion(xhr);
            } else {
                plug.del(completion);
            }
        }
    });
})();
