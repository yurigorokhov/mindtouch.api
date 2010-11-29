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
    var _isValidCharInUri = function(ch, level) {
        if ((((ch >= 'a') && (ch <= 'z')) || ((ch >= 'A') && (ch <= 'Z'))) || ((ch >= '0') && (ch <= '9'))) {
            return true;
        }
        
        // the following characters are always safe
        switch (ch) {
        case '\'':
        case '(':
        case ')':
        case '*':
        case '-':
        case '.':
        case '_':
        case '!':
            return true;
        }
        
        // based on encoding level, additional character may be safe
        switch (level) {
        case 3 /* fragment */:
            
            // the following characters are safe when used in the fragment of a uri
            switch (ch) {
            case '#':
                return true;
            }
            
            // FALLTHROUGH: all characters safe for UriEncoding.Query are also safe for UriEncoding.Fragment
        case 2 /* query */:
            
            // the following characters are safe when used in the query of a uri
            switch (ch) {
            case '/':
            case ':':
            case '~':
            case '$':
            case ',':
            case ';':
                
                // NOTE (steveb): we don't encode | characters
            case '|':
                
                // NOTE (steveb): don't decode '?', because it's handling is different on various web-servers (e.g. Apache vs. IIS)
                // case '?':
                
                return true;
            }
            
            // FALLTHROUGH: all characters safe for UriEncoding.Segment are also safe for UriEncoding.Query
        case 1 /* segment */:
            
            // the following characters are safe when used in a segment of a uri
            switch (ch) {
            case '@':
                
                // NOTE (steveb): we don't encode ^ characters
            case '^':
                return true;
            }
            break;
        case 0 /* userinfo */:
            
            // the following characters are safe when used in the UserInfo part of a uri
            switch (ch) {
            case '&':
            case '=':
                return true;
            }
            break;
        }
        return false;
    };
    
    var _intToHex = function(value) {
        return (value <= 9) ? value + 0x30 : value - 10 + 0x61;
    };
    
    var _encode = function(text, level) {
        (level || (level = 'segment'));
        var chars = [];
        var bytes = text.encodeUtf8().toBytes();
        for (var i = 0; i < bytes.length; ++i) {
            var asciiByte = bytes[i];
            var asciiChar = String.fromCharCode(asciiByte);
            if (_isValidCharInUri(asciiChar, level)) {
                chars.push(bytes[i]);
            } else if (asciiChar == ' ') {
            
                // replace ' ' with '+'
                chars.push(0x2b); // '+'
            } else {
            
                // replace char with '%' + code
                chars.push(0x25); // '%'
                chars.push(_intToHex((asciiByte >> 4) & 15));
                chars.push(_intToHex(asciiByte & 15));
            }
        }
        return String.fromCharCode.apply(null, chars);
    };
    
    _.extend(String.prototype, {
        encodeUtf8: function() {
            var utftext = '';
            for (var n = 0; n < this.length; n++) {
                var c = this.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },
        
        decodeUtf8: function() {
            var string = '';
            var i = 0;
            var c = c1 = c2 = 0;
            while (i < this.length) {
                c = this.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = this.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = this.charCodeAt(i + 1);
                    c3 = this.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        },
        
        encodeBase64: function() {
        
            // check if input string contains characters outside of the ASCII range
            if (/([^\u0000-\u00ff])/.test(this)) {
                throw new Error('Can\'t base64 encode non-ASCII characters.');
            }
            
            // loop over each character and encode it
            var digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', i = 0, cur, prev, byteNum, result = [];
            while (i < this.length) {
                cur = this.charCodeAt(i);
                byteNum = i % 3;
                switch (byteNum) {
                case 0: // first byte
                    result.push(digits.charAt(cur >> 2));
                    break;
                case 1: // second byte
                    result.push(digits.charAt((prev & 3) << 4 | (cur >> 4)));
                    break;
                case 2: // third byte
                    result.push(digits.charAt((prev & 0x0f) << 2 | (cur >> 6)));
                    result.push(digits.charAt(cur & 0x3f));
                    break;
                }
                prev = cur;
                i++;
            }
            
            // check for trailing characters that were not encoded
            if (byteNum == 0) {
                result.push(digits.charAt((prev & 3) << 4));
                result.push('==');
            } else if (byteNum == 1) {
                result.push(digits.charAt((prev & 0x0f) << 2));
                result.push('=');
            }
            return result.join('');
        },
        
        decodeBase64: function() {
        
            // remove any whitespace characteres from input
            var text = this;
            text = text.replace(/\s/g, '');
            
            // check if input contains any invalid base64 characters
            if (!(/^[a-z0-9\+\/\s]+\={0,2}$/i.test(text)) || text.length % 4 > 0) {
                throw new Error('Not a base64-encoded string.');
            }
            
            // loop over each character and decode it
            var digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', cur, prev, digitNum, i = 0, result = [];
            text = text.replace(/=/g, '');
            while (i < text.length) {
                cur = digits.indexOf(text.charAt(i));
                digitNum = i % 4;
                switch (digitNum) {
                    //case 0: first digit - do nothing, not enough info to work with
                case 1: //second digit
                    result.push(String.fromCharCode(prev << 2 | cur >> 4));
                    break;
                case 2: //third digit
                    result.push(String.fromCharCode((prev & 0x0f) << 4 | cur >> 2));
                    break;
                case 3: //fourth digit
                    result.push(String.fromCharCode((prev & 3) << 6 | cur));
                    break;
                }
                prev = cur;
                i++;
            }
            return result.join('');
        },
        
        toBytes: function() {
            var ch, st, re = [];
            for (var i = 0; i < this.length; i++) {
                ch = this.charCodeAt(i); // get char 
                st = []; // set up "stack"
                do {
                    st.push(ch & 0xFF); // push byte to stack
                    ch = ch >> 8; // shift value down by 1 byte
                } while (ch);
                
                // add stack contents to result
                // done because chars have "wrong" endianness
                re = re.concat(st.reverse());
            }
            
            // return an array of bytes
            return re;
        },
        
        encodeUrlFragment: function() {
            return _encode(this, 3);
        },
        
        encodeUrlQuery: function() {
            return _encode(this, 2);
        },
        
        encodeUrlSegment: function() {
            return _encode(this, 1);
        },
        
        encodeUrlUserInfo: function() {
            return _encode(this, 0);
        }
    });
})();
