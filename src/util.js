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

    // Generate four random hex digits.
    var word = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    
    // add utility functions to underscore.js
    _.mixin({
    
        // Generate a pseudo-GUID by concatenating random hexadecimal.
        guid: function() {
            return (word() + word() + "-" + word() + "-" + word() + "-" + word() + "-" + word() + word() + word());
        }
    });
})();
