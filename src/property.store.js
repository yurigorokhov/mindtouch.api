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

// TODO: PropertyCollectionStore

(function() {
    this.PropertyStore = function(property) {
		if(_.isString(property)) {
	        this.property = new Property(property);
		} else {
	        this.property = property;
		}
        this.fetch();
    };
    
    _.extend(this.PropertyStore.prototype, {
        save: function() {
            this.property.set(this.data);
        },
        
        fetch: function() {
            this.data = this.property.get() || {};
        },
        
        create: function(model) {
            if (!model.id) {
                model.id = model.attributes.id = _.guid();
            }
            this.data[model.id] = model;
            this.save();
            return model;
        },
        
        update: function(model) {
            this.data[model.id] = model;
            this.save();
            return model;
        },
        
        find: function(model) {
            return this.data[model.id];
        },
        
        findAll: function() {
            return _.values(this.data);
        },
        
        destroy: function(model, success, error) {
            delete this.data[model.id];
            this.save();
            return model;
        }
    });
})();
