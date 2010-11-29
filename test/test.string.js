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
    module('String');
    
    test('toBytes', function() {
        var before = 'hello world';
        var after = before.toBytes();
        deepEqual(after, [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]);
    });
    
    test('encodeUtf8', function() {
        var before = '\u20AC';
        var after = before.encodeUtf8();
        deepEqual(after.toBytes(), [0xE2, 0x82, 0xAC]);
    });
    
    test('decodeUtf8', function() {
        var before = String.fromCharCode.apply(null, [0xE2, 0x82, 0xAC]);
        var after = before.decodeUtf8();
        equal(after, '\u20AC');
    });
    
    test('encodeBase64', function() {
        var before = 'the quick brown fox jumps over the lazy dog';
        var after = before.encodeBase64();
        equal(after, 'dGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZw==');
    });
    
    test('decodeBase64', function() {
        var before = 'dGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZw==';
        var after = before.decodeBase64();
        equal(after, 'the quick brown fox jumps over the lazy dog');
    });
	
	test('encodeUrlFragment: a^b|c#d', function() {
		var before = 'a^b|c#d';
		var after = before.encodeUrlFragment();
		equal(after, before);
	});
	
	test('encodeUrlQuery: a^b|c', function() {
		var before = 'a^b|c';
		var after = before.encodeUrlQuery();
		equal(after, before);
	});
	
	test('encodeUrlQuery: a#b', function() {
		var before = 'a#b';
		var after = before.encodeUrlQuery();
		equal(after, 'a%23b');
	});
	
	test('encodeUrlQuery: a^b:c|d', function() {
		var before = 'a^b:c|d';
		var after = before.encodeUrlQuery();
		equal(after, before);
	});
	
	test('encodeUrlSegment: a^b:c|d', function() {
		var before = 'a^b:c|d';
		var after = before.encodeUrlSegment();
		equal(after, 'a^b%3ac%7cd');
	});
	
	test('encodeUrlSegment: a/b', function() {
		var before = 'a/b';
		var after = before.encodeUrlSegment();
		equal(after, 'a%2fb');
	});
	
	test('encodeUrlSegment: a#b', function() {
		var before = 'a#b';
		var after = before.encodeUrlSegment();
		equal(after, 'a%23b');
	});
});
