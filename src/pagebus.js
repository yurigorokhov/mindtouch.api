/**
 * Copyright (c) 2006-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 *
 * TIBCO(R) PageBus 1.1.0
 *
 * Copyright (c) 2010, MindTouch Inc.
 * MindTouch PageBus 3.0.0
 *
 */
(function() {
    var root = this;
    var PageBus = root.PageBus = {
        version: '3.0.0'
    };
    
    // PageBus Subscription object
    PageBus.Subscription = function(context, callback, data) {
        this.id = _.uniqueId();
        this.callback = callback;
        this.data = data;
        this.context = context;
        this.channel = null;
    };
    _.extend(PageBus.Subscription.prototype, {
        dispose: function() {
            if (this.channel) {
                try {
                    this.channel.unsubscribe(this);
                } finally {
                    this.channel = null;
                }
            }
        }
    });
    
    // PageBus Channel object
    PageBus.Channel = function() {
        this.channels = {};
        this.subscribers = [];
        this.lastMessage = null;
    };
    _.extend(PageBus.Channel.prototype, {
        subscribe: function(path, index, subscription) {
        
            // check if we've reached the proper channel
            if (index === path.length) {
                subscription.channel = this;
                this.subscribers.push(subscription);
                return subscription;
            }
            
            // recurse into inner channels; create them if need be
            var channel = this.channels[path[index]] || (this.channels[path[index]] = new PageBus.Channel());
            try {
                return channel.subscribe(path, index + 1, subscription);
            } catch (err) {
            
                // check if inner channel is empty
                if (channel.isEmpty()) {
                
                    // remove unusued channel
                    delete this.channels[path[index]];
                }
                throw err;
            }
        },
        
        publish: function(path, index, channel, message, notifications) {
        
            // check if we've reached the proper channel
            if (index === path.length) {
                this.lastMessage = message;
                _.each(this.subscribers, function(subscriber) {
                    notifications.push(_.bind(subscriber.callback, subscriber.context, channel, message, subscriber.data));
                });
                return;
            }
            
            // recurse into inner channels; create them if need be
            var subchannel = this.channels[path[index]] || (this.channels[path[index]] = new PageBus.Channel());
            subchannel.publish(path, index + 1, channel, message, notifications);
            
            // check for path wildcard channel
            subchannel = this.channels['*'];
            if (!_.isUndefined(subchannel)) {
                _.each(subchannel.subscribers, function(subscriber) {
                    notifications.push(_.bind(subscriber.callback, subscriber.context, channel, message, subscriber.data));
                });
            }
        },
        
        query: function(path, index) {
        
            // check if we've reached the proper channel
            if (index === path.length) {
                return this.lastMessage;
            }
            
            // recurse into inner channels
            var subchannel = this.channels[path[index]];
            return !_.isUndefined(subchannel) ? subchannel.query(path, index + 1) : null;
        },
        
        unsubscribe: function(subscription) {
            for (var i = 0; i < this.subscribers.length; ++i) {
                if (subscription.id === this.subscribers[i].id) {
                    this.subscribers.splice(i, 1);
                    return;
                }
            }
        },
        
        isEmpty: function() {
            return (this.subscribers.length === 0) && _.isEmpty(this.channels) && (this.lastMessage === null);
        }
    });
    
    // PageBus state
    var _root = new PageBus.Channel();
    var _reentrancy = 0;
    var _notifications = [];
    
    // private methods
    var _parseName = function(channel, allowWildcards) {
        if (channel === null || channel === '') {
            throw new Error('PageBus.BadName');
        }
        var path = channel.split('.');
        for (var i = 0; i < path.length; ++i) {
            if ((path[i] === '') || ((path[i].indexOf('*') !== -1) && (!allowWildcards || path[i] !== '*'))) {
                throw new Error('PageBus.BadName');
            }
        }
        return path;
    };
    
    // public methods
    _.extend(PageBus, {
        reset: function() {
            _root = new PageBus.Channel();
        },
        
        subscribe: function(channel, context, callback, data) {
        
            // check if subscribe(channel, callback, data) was used
            if (_.isFunction(context)) {
                data = callback;
                callback = context;
                context = null;
            }
            return _root.subscribe(_parseName(channel, true), 0, new PageBus.Subscription(context || root, callback, data));
        },
        
        publish: function(channel, message) {
            _root.publish(_parseName(channel, false), 0, channel, message, _notifications);
            
            // only dispatch notifications in outermost invocation
            if (_reentrancy === 0) {
                try {
                    ++_reentrancy;
                    while (_notifications.length) {
                    
                        // reset the global notifications list
                        var notifications = _notifications;
                        _notifications = [];
                        
                        // iterate over pending notifications
                        _.each(notifications, function(notify) {
                            notify();
                        });
                    }
                } finally {
                    --_reentrancy;
                }
            }
        },
        
        query: function(channel) {
            return _root.query(_parseName(channel, false), 0);
        },
        
        unsubscribe: function(subscription) {
            subscription.dispose();
        }
    });
})();
