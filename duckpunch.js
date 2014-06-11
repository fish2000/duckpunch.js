/*jslint ass: true, browser: true, devel: true, laxbreak: true, nomen: true, sloppy: true, sub: true, white: true */

if (exports && typeof global === 'object' && global && global === global.global) {
    var window, document,
        Hashes = require('jshashes'),
        underscore = require('underscore');
    window = global;
    window['Hashes'] = Hashes;
    window['_'] = underscore;
    document = undefined;
}

(function (underscore, hashes, document, undefined) {
    
    var SIGNATURE_LENGTH = 27,
        SIGNATURE_SALT = 'django.core.signing.Signer',
        SIGNATURE_SECRET = 'YO DOGG',
        SIGNATURE_SEPARATOR = ':',
        SIGNATURE_DJANGO_SALT = 'signer',
        
        hex_decode_regex = /^(#|0?x|\\x|%)([0-9a-f]{1,16})/i,
        thousands_regex = /(\d+)(\d{3})/,
        millions_regex = /(\d+)(\d{6})/,
        
        magnitude_value = function (regex) {
            return function () {
                var intpart = this.toString().split('.')[0];
                return regex.test(intpart)
                    ? intpart.replace(regex, '$1').toInt()
                    : 0;
            };
        },
        
        magnitude_format = function (func_name, suffix) {
            return function () {
                return Number.prototype[func_name]
                    .call(this)
                    .addCommas(
                        arguments[1])
                    .suffixWith(
                        arguments[0] || suffix);
            };
        };
    
    String.prototype.capitalize = (function (regex) {
        return function () {
            return this.replace(regex,
                function (m, leadspc, startchr) {
                    return leadspc + startchr.toUpperCase();
                }
            );
        };
    })(/(^|\s)([a-z])/g);

    String.prototype.normalize = (function (regex) {
        return function () {
            return this.trim()
                .replace(regex, '')
                .toLowerCase();
        };
    })(/\W/g);

    if (typeof document === "object" && typeof document.createElement !== "undefined") {

        String.prototype.htmlquote = String.prototype.htmlQuote = (function (textarea) {
            return function () {
                textarea.innerHTML = this;
                return textarea.innerHTML;
            };
        })(document.createElement('textarea'));

        String.prototype.htmlunquote = String.prototype.htmlUnquote = (function (textarea) {
            return function () {
                textarea.innerHTML = this;
                return textarea.value;
            };
        })(document.createElement('textarea'));

    }

    String.prototype.uriencode = String.prototype.uriEncode = function () {
        return encodeURIComponent(this);
    };

    String.prototype.uriquote = String.prototype.uriQuote = function () {
        return encodeURI(this);
    };

    String.prototype.uridecode = String.prototype.uriDecode = function () {
        return decodeURIComponent(this);
    };

    String.prototype.uriunquote = String.prototype.uriUnquote = function () {
        return decodeURI(this);
    };

    String.prototype.hexdecode = String.prototype.hexDecode = (function (regex, undefined) {
        return function () {
            var hextokens = this.match(regex);
            return hextokens && hextokens[2] !== undefined
                ? parseInt(hextokens[2], 16)
                : NaN;
        };
    })(hex_decode_regex);
    
    String.prototype.toInteger = String.prototype.toInt = function () {
        return parseInt(this.normalize(), 10);
    };

    String.prototype.toFloat = function () {
        var precise = arguments[0] || undefined,
            number = parseFloat(this.normalize());
        return !isNaN(precise)
            ? parseFloat(number.toPrecision(precise))
            : number;
    };

    String.prototype.toChars = function () {
        var out = [];
        for (var idx = 0; idx < this.length; idx++) {
            out.push(this.charAt(idx));
        }
        return out;
    };

    String.prototype.format = (function (regex, undefined) {
        /// simple formatter, adapted from:
        ///     http://stackoverflow.com/a/4673436/298171
        /// 'Hey {0}, fuck off and {1}'.format("buddy", "die");
        return function () {
            var args = arguments;
            return this.replace(
                regex, function (match, idx) { 
                    return args[idx] !== undefined
                        ? args[idx]
                        : match;
                }
            );
        };
    })(/{(\d+)}/g);
    
    String.prototype.test = function () {
        /// Test a string with a regex
        var args = Array.prototype.slice.call(arguments),
            regex = args.length > 0
                ? args[0]
                : new RegExp('');
        if (typeof regex === "string") {
            regex = new RegExp.apply(arguments);
        }
        return regex.test(this);
    };

    /// Python string method aliases:
    String.prototype.upper = String.prototype.toUpperCase;
    String.prototype.lower = String.prototype.toLowerCase;
    String.prototype.isupper = String.prototype.isUpper = function () {
        return this.toUpperCase().toString() === this.toString(); };
    String.prototype.islower = String.prototype.isLower = function () {
        return this.toLowerCase().toString() === this.toString(); };

    /// str.startsWith() and str.endsWith() polyfills courtesy MDN:
    /// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith#Examples
    String.prototype.startswith = String.prototype.startsWith = function (putative_substring) {
        var position = arguments[1] || 0;
        return this.indexOf(putative_substring, position) === position;
    };
    String.prototype.endswith = String.prototype.endsWith = function (putative_substring) {
        var position_arg = arguments[1] || this.length,
            position = position_arg - putative_substring.length,
            last_index = this.lastIndexOf(putative_substring);
        return last_index !== -1 && last_index === position;
    };

    String.prototype.prefixwith = String.prototype.prefixWith = function (putative_prefix) {
        return this.startswith(putative_prefix)
            ? this.toString()
            : putative_prefix.toString() + this.toString();
    };

    String.prototype.suffixwith = String.prototype.suffixWith = function (putative_suffix) {
        return this.endswith(putative_suffix)
            ? this.toString()
            : this.toString() + putative_suffix.toString();
    };

    String.prototype.chomp = (function (regex, undefined) {
        return function () {
            var arg = arguments[0] || undefined,
                chomper = (arg === undefined)
                    ? regex
                    : new RegExp("(" + arg + ")+$");
            return this.replace(chomper, '');
        };
    })(/(\s|\n|\r)+$/);
    
    String.prototype.rsplit = String.prototype.splitRight = (function (regex) {
        return function () {
            var limit = arguments[0] || 0,
                sep = arguments[1] || regex;
            split = this.split(sep);
            return limit ? split.splice(-limit) : split;
        };
    })(/\s+/);
    
    String.prototype.rsplit_bleh = (function (regex) {
        return function () {
            var limit = arguments[0] || 0,
                tmp = arguments[1] || regex,
                sep = (typeof tmpsep === "object") ? tmp : new RegExp("(" + tmp + ")+"),
                string = this.toString(),
                result = sep.exec(string),
                out = [], first_idx, last_idx;
            while (result !== null) {
                first_idx = result.index;
                last_idx = result.lastIndex;
                if (first_idx !== 0) {
                    out.push(string.substring(0, first_idx));
                    string = string.slice(first_idx);
                }
                out.push(result[0]);
                string = string.slice(result[0].length);
                result = sep.exec(string);
            }
            if (string !== '') { out.push(string); }
            return out;
        };
    })(/\s+/);

    String.prototype.isalpha = String.prototype.isAlpha = (function (regex) {
        return function () { return regex.test(this); };
    })(/^[A-Za-z]+$/);

    String.prototype.isalnum = String.prototype.isAlNum = (function (regex) {
        return function () { return regex.test(this); };
    })(/^[A-Za-z0-9]+$/);

    String.prototype.isdigit = String.prototype.isDigit = (function (regex) {
        return function () { return regex.test(this); };
    })(/^[0-9]+$/);

    String.prototype.isspace = String.prototype.isSpace = (function (regex) {
        return function () { return regex.test(this); };
    })(/^\s+$/);

    String.prototype.slugify = (function (nonwords, edges) {
        return function () {
            return this.trim()
                .replace(edges, '$1')
                .toLowerCase()
                .replace(nonwords, arguments[0] || '-')
                .toString();
        };
    })(/\W+/g, /^\W*(.*?)\W*?$/);

    if (hashes !== undefined) {
        /// Django-compatible string signatures
        
        String.prototype.signature = (function (SHA1, padding) {
            return function (key_secret, salt) {
                var sha1 = new SHA1({ utf8: false, b64pad: padding }),
                    key = sha1.raw(salt + key_secret),
                    hmac64 = sha1.setPad(padding).b64_hmac(key, this).chomp();
                return hmac64.replace(/\//g, '_').replace(/\+/g, '-'); /// Replacements are a Django thing
            };
        })(hashes.SHA1, ' ');
        
        String.prototype.sign = function () {
            var key_secret = arguments[0] || SIGNATURE_SECRET,
                key_salt = arguments[1] || SIGNATURE_SALT,
                sep = arguments[2] || SIGNATURE_SEPARATOR,
                salt = key_salt + SIGNATURE_DJANGO_SALT,
                signature = this.signature(key_secret, salt);
            return (this + sep + signature);
        };
        
        String.prototype.unsign = function () {
            var key_secret = arguments[0] || SIGNATURE_SECRET,
                key_salt = arguments[1] || SIGNATURE_SALT,
                sep = arguments[2] || SIGNATURE_SEPARATOR,
                salt = key_salt + SIGNATURE_DJANGO_SALT,
                split = this.split(sep),
                sig = split.pop(),
                orig = split.join(sep),
                signature = orig.signature(key_secret, salt);
            return sig == signature ? orig : false;
        };
        
        String.prototype.voidsign = function () {
            var sep = arguments[0] || SIGNATURE_SEPARATOR,
                split = this.split(sep),
                sig = split.pop(),
                orig = split.join(sep);
            return (this.indexOf(sep) !== -1 && sig.length === SIGNATURE_LENGTH) ? orig : this.toString();
        };
        
    }

    Number.prototype.zeropad = Number.prototype.zeroPad = function () {
        var places = arguments[0] || 0,
            zeros = places - this.toString().length + 1;
        return Array(+(zeros > 0 && zeros)).join("0") + this.toString();
    };

    Number.prototype.hexencode = Number.prototype.hexEncode = function () {
        return Math.round(this)
            .toString(16)
            .prefixwith(arguments[0] || "#");
    };

    Number.prototype.addcommas = Number.prototype.addCommas = (function (regex) {
        return function () {
            var comma = arguments[0] || ',',
                decimal = this.toString().split('.'),
                intpart = decimal[0],
                fracpart = decimal.length > 1 ? '.' + decimal[1] : '';
            while (regex.test(intpart)) {
                intpart = intpart.replace(regex,
                    '$1' + comma + '$2');
            }
            return intpart + fracpart;
        };
    })(thousands_regex);
    
    Number.prototype.kilo = magnitude_value(thousands_regex);
    Number.prototype.milli = magnitude_value(millions_regex);
    Number.prototype.kilos = magnitude_format('kilo', 'K');
    Number.prototype.millions = magnitude_format('milli', 'MM');

    Array.prototype.copy = function () {
        return this.concat([]);
    };

    Array.prototype.toStrings = function () {
        return this.copy().map(function (val) {
            return val.toString();
        });
    };

    Array.prototype.toIntegers = Array.prototype.toInts = function () {
        return this.toStrings().map(function (val) {
            return val.toInteger();
        });
    };

    Array.prototype.toFloats = function () {
        return this.toStrings().map(function (val) {
            return this.toFloat();
        });
    };

    Array.prototype.first = Array.prototype.car = function () {
        return this.length > 0
            ? this[0]
            : undefined;
    };

    Array.prototype.rest = Array.prototype.cdr = function () {
        var out = this.copy();
        return (out.length > 0 && out.shift())
            ? out
            : undefined;
    };

    Array.prototype.last = function () {
        return this.length > 0
            ? this[this.length - 1]
            : undefined;
    };

    Array.prototype.sum = function () {
        return this.toFloats().reduce(
            function (memo, nn) {
                return memo + nn;
            },
        0);
    };

    Array.prototype.max = function () {
        return this.toFloats().reduce(
            function (memo, nn) {
                return Math.max(memo, nn);
            },
        0);
    };

    Array.prototype.min = function () {
        return this.toFloats().reduce(
            function (memo, nn) {
                return Math.min(memo, nn);
            },
        0);
    };

    Array.prototype.reversed = function () {
        var out = this.copy();
        out.reverse();
        return out;
    };

    Array.prototype.sortWith = function () {
        var out = this.copy();
        out.sort.apply(arguments);
        return out;
    };

    Array.prototype.median = function () {
        return this.toFloats().sortWith(
            function (a, b) { return a - b; }
        )[
            Math.round(this.length / 2.0)
        ];
    };

    Array.prototype.floatAverage = function () {
        return this.toFloats().sum() / this.length;
    };

    Array.prototype.average = Array.prototype.mean = function () {
        return Math.round(this.floatAverage());
    };

    Array.prototype.mode = function () {
        /// depends on underscore.js
        return underscore === undefined
            ? undefined
            : underscore(this.toInts())
                .chain()
                .countBy()
                .pairs()
                .sortBy(function (item) { return item[1]; })
                .value()
                .pop()
                .shift()
                .toString()
                .toInt();
    };

    Date.prototype.getCalendarMonth = function () {
        return (arguments[0] || this.getMonth()) + 1;
    };

    Date.prototype.setCalendarMonth = function (calendarmonth) {
        return this.setMonth(calendarmonth - 1);
    };

    Date.prototype.getDaysInMonth = (function (regex) {
        return function () {
            /// the last line (the money-shot) was shamelessly cribbed from:
            ///     http://stackoverflow.com/a/1811003/298171
            var month = arguments[0] || this.getMonth(),
                year = arguments[1] || this.getYear();
            return regex.test(month) ? 30 : month == 1 ? (!Boolean(year % 4) && year % 100) || !Boolean(year % 400) ? 29 : 28 : 31;
        };
    })(/8|3|5|10/);

    Date.prototype.getDaysInCalendarMonth = function () {
        /// this function manually corrects a JS month to a calendar month
        /// in order to return results from a non-calendar-month function --
        /// we don't want to double-implement that freaky inline conditional
        /// in Date.getDaysInMonth()'s return value line.
        var calendarmonth = arguments[0] || this.getCalendarMonth(),
            year = arguments[1] || this.getYear();
        return this.getDaysInMonth(calendarmonth - 1, year);
    };

    Date.prototype.getLastMonth = function () {
        var month = arguments[0] || this.getMonth();
        return month === 0 ? 11 : month - 1;
    };

    Date.prototype.getLastCalendarMonth = function () {
        var calendarmonth = arguments[0] || this.getCalendarMonth();
        return calendarmonth === 1 ? 12 : calendarmonth - 1;
    };

    Date.prototype.oneMonthAgo = function () {
        var month = arguments[0] || this.getMonth(),
            lastmonth = this.getLastMonth(month),
            amonthago = new Date();
        amonthago.setMonth(lastmonth);
        return amonthago;
    };

    Date.prototype.oneCalendarMonthAgo = function () {
        var calendarmonth = arguments[0] || this.getCalendarMonth(),
            lastcalendarmonth = this.getLastCalendarMonth(calendarmonth),
            acalendarmonthago = new Date();
        acalendarmonthago.setCalendarMonth(lastcalendarmonth);
        return acalendarmonthago;
    };

    Date.prototype.getDaysInPrecedingMonth = function () {
        var lastmonth = this.oneMonthAgo(arguments[0] || this.getMonth()),
            yearinquestion = arguments[1] || lastmonth.getYear();
        return this.getDaysInMonth(lastmonth.getMonth(), yearinquestion);
    };

    Date.prototype.getDaysInPrecedingCalendarMonth = function () {
        var lastcalendarmonth = this.oneCalendarMonthAgo(arguments[0] || this.getCalendarMonth()),
            yearinquestion = arguments[1] || lastcalendarmonth.getYear();
        return this.getDaysInCalendarMonth(lastcalendarmonth.getCalendarMonth(), yearinquestion);
    };

    Date.prototype.pastThirtyOne = function () {
        var past31 = [];
        for (var d = new Date(), dd = d.getDate(), lmd = d.getDaysInPrecedingMonth() + dd, idx = 0; idx < 31; idx++) {
            past31.unshift(dd - idx < 1 ? (lmd - idx) : (dd - idx));
        }
        return past31;
    };

    Date.prototype.pastThirtyOneDateObjects = function () {
        var past31days = [];
        for (var d = new Date(), dd = d.getDate(), lmd = d.getDaysInPrecedingMonth() + dd, idx = 0; idx < 31; idx++) {
            var day = dd - idx < 1 ? (lmd - idx) : (dd - idx),
                month = dd - idx < 1 ? d.getLastMonth() : d.getMonth(),
                date = new Date();
            date.setMonth(month);
            date.setDate(day);
            past31days.unshift(date);
        }
        return past31days;
    };

    Date.prototype.pastThirtyOneCalendarDays = function () {
        var past31days = [];
        for (var d = new Date(), dd = d.getDate(), lmd = d.getDaysInPrecedingMonth() + dd, idx = 0; idx < 31; idx++) {
            var day = dd - idx < 1 ? (lmd - idx) : (dd - idx),
                month = dd - idx < 1 ? d.getLastMonth() : d.getMonth(),
                date = new Date();
            date.setMonth(month);
            date.setDate(day);
            past31days.unshift({
                calendarmonth: date.getCalendarMonth(),
                day: date.getDate()
            });
        }
        return past31days;
    };
    
})(window['_'], window['Hashes'], document);