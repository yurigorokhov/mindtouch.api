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
