var __commonJS = (callback, module2) => () => {
  if (!module2) {
    module2 = {exports: {}};
    callback(module2.exports, module2);
  }
  return module2.exports;
};

// ../node_modules/js-beautify/js/src/core/output.js
var require_output = __commonJS((exports2, module2) => {
  "use strict";
  function OutputLine(parent) {
    this.__parent = parent;
    this.__character_count = 0;
    this.__indent_count = -1;
    this.__alignment_count = 0;
    this.__wrap_point_index = 0;
    this.__wrap_point_character_count = 0;
    this.__wrap_point_indent_count = -1;
    this.__wrap_point_alignment_count = 0;
    this.__items = [];
  }
  OutputLine.prototype.clone_empty = function() {
    var line = new OutputLine(this.__parent);
    line.set_indent(this.__indent_count, this.__alignment_count);
    return line;
  };
  OutputLine.prototype.item = function(index) {
    if (index < 0) {
      return this.__items[this.__items.length + index];
    } else {
      return this.__items[index];
    }
  };
  OutputLine.prototype.has_match = function(pattern) {
    for (var lastCheckedOutput = this.__items.length - 1; lastCheckedOutput >= 0; lastCheckedOutput--) {
      if (this.__items[lastCheckedOutput].match(pattern)) {
        return true;
      }
    }
    return false;
  };
  OutputLine.prototype.set_indent = function(indent, alignment) {
    if (this.is_empty()) {
      this.__indent_count = indent || 0;
      this.__alignment_count = alignment || 0;
      this.__character_count = this.__parent.get_indent_size(this.__indent_count, this.__alignment_count);
    }
  };
  OutputLine.prototype._set_wrap_point = function() {
    if (this.__parent.wrap_line_length) {
      this.__wrap_point_index = this.__items.length;
      this.__wrap_point_character_count = this.__character_count;
      this.__wrap_point_indent_count = this.__parent.next_line.__indent_count;
      this.__wrap_point_alignment_count = this.__parent.next_line.__alignment_count;
    }
  };
  OutputLine.prototype._should_wrap = function() {
    return this.__wrap_point_index && this.__character_count > this.__parent.wrap_line_length && this.__wrap_point_character_count > this.__parent.next_line.__character_count;
  };
  OutputLine.prototype._allow_wrap = function() {
    if (this._should_wrap()) {
      this.__parent.add_new_line();
      var next = this.__parent.current_line;
      next.set_indent(this.__wrap_point_indent_count, this.__wrap_point_alignment_count);
      next.__items = this.__items.slice(this.__wrap_point_index);
      this.__items = this.__items.slice(0, this.__wrap_point_index);
      next.__character_count += this.__character_count - this.__wrap_point_character_count;
      this.__character_count = this.__wrap_point_character_count;
      if (next.__items[0] === " ") {
        next.__items.splice(0, 1);
        next.__character_count -= 1;
      }
      return true;
    }
    return false;
  };
  OutputLine.prototype.is_empty = function() {
    return this.__items.length === 0;
  };
  OutputLine.prototype.last = function() {
    if (!this.is_empty()) {
      return this.__items[this.__items.length - 1];
    } else {
      return null;
    }
  };
  OutputLine.prototype.push = function(item) {
    this.__items.push(item);
    var last_newline_index = item.lastIndexOf("\n");
    if (last_newline_index !== -1) {
      this.__character_count = item.length - last_newline_index;
    } else {
      this.__character_count += item.length;
    }
  };
  OutputLine.prototype.pop = function() {
    var item = null;
    if (!this.is_empty()) {
      item = this.__items.pop();
      this.__character_count -= item.length;
    }
    return item;
  };
  OutputLine.prototype._remove_indent = function() {
    if (this.__indent_count > 0) {
      this.__indent_count -= 1;
      this.__character_count -= this.__parent.indent_size;
    }
  };
  OutputLine.prototype._remove_wrap_indent = function() {
    if (this.__wrap_point_indent_count > 0) {
      this.__wrap_point_indent_count -= 1;
    }
  };
  OutputLine.prototype.trim = function() {
    while (this.last() === " ") {
      this.__items.pop();
      this.__character_count -= 1;
    }
  };
  OutputLine.prototype.toString = function() {
    var result = "";
    if (this.is_empty()) {
      if (this.__parent.indent_empty_lines) {
        result = this.__parent.get_indent_string(this.__indent_count);
      }
    } else {
      result = this.__parent.get_indent_string(this.__indent_count, this.__alignment_count);
      result += this.__items.join("");
    }
    return result;
  };
  function IndentStringCache(options, baseIndentString) {
    this.__cache = [""];
    this.__indent_size = options.indent_size;
    this.__indent_string = options.indent_char;
    if (!options.indent_with_tabs) {
      this.__indent_string = new Array(options.indent_size + 1).join(options.indent_char);
    }
    baseIndentString = baseIndentString || "";
    if (options.indent_level > 0) {
      baseIndentString = new Array(options.indent_level + 1).join(this.__indent_string);
    }
    this.__base_string = baseIndentString;
    this.__base_string_length = baseIndentString.length;
  }
  IndentStringCache.prototype.get_indent_size = function(indent, column) {
    var result = this.__base_string_length;
    column = column || 0;
    if (indent < 0) {
      result = 0;
    }
    result += indent * this.__indent_size;
    result += column;
    return result;
  };
  IndentStringCache.prototype.get_indent_string = function(indent_level, column) {
    var result = this.__base_string;
    column = column || 0;
    if (indent_level < 0) {
      indent_level = 0;
      result = "";
    }
    column += indent_level * this.__indent_size;
    this.__ensure_cache(column);
    result += this.__cache[column];
    return result;
  };
  IndentStringCache.prototype.__ensure_cache = function(column) {
    while (column >= this.__cache.length) {
      this.__add_column();
    }
  };
  IndentStringCache.prototype.__add_column = function() {
    var column = this.__cache.length;
    var indent = 0;
    var result = "";
    if (this.__indent_size && column >= this.__indent_size) {
      indent = Math.floor(column / this.__indent_size);
      column -= indent * this.__indent_size;
      result = new Array(indent + 1).join(this.__indent_string);
    }
    if (column) {
      result += new Array(column + 1).join(" ");
    }
    this.__cache.push(result);
  };
  function Output(options, baseIndentString) {
    this.__indent_cache = new IndentStringCache(options, baseIndentString);
    this.raw = false;
    this._end_with_newline = options.end_with_newline;
    this.indent_size = options.indent_size;
    this.wrap_line_length = options.wrap_line_length;
    this.indent_empty_lines = options.indent_empty_lines;
    this.__lines = [];
    this.previous_line = null;
    this.current_line = null;
    this.next_line = new OutputLine(this);
    this.space_before_token = false;
    this.non_breaking_space = false;
    this.previous_token_wrapped = false;
    this.__add_outputline();
  }
  Output.prototype.__add_outputline = function() {
    this.previous_line = this.current_line;
    this.current_line = this.next_line.clone_empty();
    this.__lines.push(this.current_line);
  };
  Output.prototype.get_line_number = function() {
    return this.__lines.length;
  };
  Output.prototype.get_indent_string = function(indent, column) {
    return this.__indent_cache.get_indent_string(indent, column);
  };
  Output.prototype.get_indent_size = function(indent, column) {
    return this.__indent_cache.get_indent_size(indent, column);
  };
  Output.prototype.is_empty = function() {
    return !this.previous_line && this.current_line.is_empty();
  };
  Output.prototype.add_new_line = function(force_newline) {
    if (this.is_empty() || !force_newline && this.just_added_newline()) {
      return false;
    }
    if (!this.raw) {
      this.__add_outputline();
    }
    return true;
  };
  Output.prototype.get_code = function(eol) {
    this.trim(true);
    var last_item = this.current_line.pop();
    if (last_item) {
      if (last_item[last_item.length - 1] === "\n") {
        last_item = last_item.replace(/\n+$/g, "");
      }
      this.current_line.push(last_item);
    }
    if (this._end_with_newline) {
      this.__add_outputline();
    }
    var sweet_code = this.__lines.join("\n");
    if (eol !== "\n") {
      sweet_code = sweet_code.replace(/[\n]/g, eol);
    }
    return sweet_code;
  };
  Output.prototype.set_wrap_point = function() {
    this.current_line._set_wrap_point();
  };
  Output.prototype.set_indent = function(indent, alignment) {
    indent = indent || 0;
    alignment = alignment || 0;
    this.next_line.set_indent(indent, alignment);
    if (this.__lines.length > 1) {
      this.current_line.set_indent(indent, alignment);
      return true;
    }
    this.current_line.set_indent();
    return false;
  };
  Output.prototype.add_raw_token = function(token) {
    for (var x = 0; x < token.newlines; x++) {
      this.__add_outputline();
    }
    this.current_line.set_indent(-1);
    this.current_line.push(token.whitespace_before);
    this.current_line.push(token.text);
    this.space_before_token = false;
    this.non_breaking_space = false;
    this.previous_token_wrapped = false;
  };
  Output.prototype.add_token = function(printable_token) {
    this.__add_space_before_token();
    this.current_line.push(printable_token);
    this.space_before_token = false;
    this.non_breaking_space = false;
    this.previous_token_wrapped = this.current_line._allow_wrap();
  };
  Output.prototype.__add_space_before_token = function() {
    if (this.space_before_token && !this.just_added_newline()) {
      if (!this.non_breaking_space) {
        this.set_wrap_point();
      }
      this.current_line.push(" ");
    }
  };
  Output.prototype.remove_indent = function(index) {
    var output_length = this.__lines.length;
    while (index < output_length) {
      this.__lines[index]._remove_indent();
      index++;
    }
    this.current_line._remove_wrap_indent();
  };
  Output.prototype.trim = function(eat_newlines) {
    eat_newlines = eat_newlines === void 0 ? false : eat_newlines;
    this.current_line.trim();
    while (eat_newlines && this.__lines.length > 1 && this.current_line.is_empty()) {
      this.__lines.pop();
      this.current_line = this.__lines[this.__lines.length - 1];
      this.current_line.trim();
    }
    this.previous_line = this.__lines.length > 1 ? this.__lines[this.__lines.length - 2] : null;
  };
  Output.prototype.just_added_newline = function() {
    return this.current_line.is_empty();
  };
  Output.prototype.just_added_blankline = function() {
    return this.is_empty() || this.current_line.is_empty() && this.previous_line.is_empty();
  };
  Output.prototype.ensure_empty_line_above = function(starts_with, ends_with) {
    var index = this.__lines.length - 2;
    while (index >= 0) {
      var potentialEmptyLine = this.__lines[index];
      if (potentialEmptyLine.is_empty()) {
        break;
      } else if (potentialEmptyLine.item(0).indexOf(starts_with) !== 0 && potentialEmptyLine.item(-1) !== ends_with) {
        this.__lines.splice(index + 1, 0, new OutputLine(this));
        this.previous_line = this.__lines[this.__lines.length - 2];
        break;
      }
      index--;
    }
  };
  module2.exports.Output = Output;
});

// ../node_modules/js-beautify/js/src/core/token.js
var require_token = __commonJS((exports2, module2) => {
  "use strict";
  function Token(type, text, newlines, whitespace_before) {
    this.type = type;
    this.text = text;
    this.comments_before = null;
    this.newlines = newlines || 0;
    this.whitespace_before = whitespace_before || "";
    this.parent = null;
    this.next = null;
    this.previous = null;
    this.opened = null;
    this.closed = null;
    this.directives = null;
  }
  module2.exports.Token = Token;
});

// ../node_modules/js-beautify/js/src/javascript/acorn.js
var require_acorn = __commonJS((exports2) => {
  "use strict";
  var baseASCIIidentifierStartChars = "\\x23\\x24\\x40\\x41-\\x5a\\x5f\\x61-\\x7a";
  var baseASCIIidentifierChars = "\\x24\\x30-\\x39\\x41-\\x5a\\x5f\\x61-\\x7a";
  var nonASCIIidentifierStartChars = "\\xaa\\xb5\\xba\\xc0-\\xd6\\xd8-\\xf6\\xf8-\\u02c1\\u02c6-\\u02d1\\u02e0-\\u02e4\\u02ec\\u02ee\\u0370-\\u0374\\u0376\\u0377\\u037a-\\u037d\\u0386\\u0388-\\u038a\\u038c\\u038e-\\u03a1\\u03a3-\\u03f5\\u03f7-\\u0481\\u048a-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05d0-\\u05ea\\u05f0-\\u05f2\\u0620-\\u064a\\u066e\\u066f\\u0671-\\u06d3\\u06d5\\u06e5\\u06e6\\u06ee\\u06ef\\u06fa-\\u06fc\\u06ff\\u0710\\u0712-\\u072f\\u074d-\\u07a5\\u07b1\\u07ca-\\u07ea\\u07f4\\u07f5\\u07fa\\u0800-\\u0815\\u081a\\u0824\\u0828\\u0840-\\u0858\\u08a0\\u08a2-\\u08ac\\u0904-\\u0939\\u093d\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097f\\u0985-\\u098c\\u098f\\u0990\\u0993-\\u09a8\\u09aa-\\u09b0\\u09b2\\u09b6-\\u09b9\\u09bd\\u09ce\\u09dc\\u09dd\\u09df-\\u09e1\\u09f0\\u09f1\\u0a05-\\u0a0a\\u0a0f\\u0a10\\u0a13-\\u0a28\\u0a2a-\\u0a30\\u0a32\\u0a33\\u0a35\\u0a36\\u0a38\\u0a39\\u0a59-\\u0a5c\\u0a5e\\u0a72-\\u0a74\\u0a85-\\u0a8d\\u0a8f-\\u0a91\\u0a93-\\u0aa8\\u0aaa-\\u0ab0\\u0ab2\\u0ab3\\u0ab5-\\u0ab9\\u0abd\\u0ad0\\u0ae0\\u0ae1\\u0b05-\\u0b0c\\u0b0f\\u0b10\\u0b13-\\u0b28\\u0b2a-\\u0b30\\u0b32\\u0b33\\u0b35-\\u0b39\\u0b3d\\u0b5c\\u0b5d\\u0b5f-\\u0b61\\u0b71\\u0b83\\u0b85-\\u0b8a\\u0b8e-\\u0b90\\u0b92-\\u0b95\\u0b99\\u0b9a\\u0b9c\\u0b9e\\u0b9f\\u0ba3\\u0ba4\\u0ba8-\\u0baa\\u0bae-\\u0bb9\\u0bd0\\u0c05-\\u0c0c\\u0c0e-\\u0c10\\u0c12-\\u0c28\\u0c2a-\\u0c33\\u0c35-\\u0c39\\u0c3d\\u0c58\\u0c59\\u0c60\\u0c61\\u0c85-\\u0c8c\\u0c8e-\\u0c90\\u0c92-\\u0ca8\\u0caa-\\u0cb3\\u0cb5-\\u0cb9\\u0cbd\\u0cde\\u0ce0\\u0ce1\\u0cf1\\u0cf2\\u0d05-\\u0d0c\\u0d0e-\\u0d10\\u0d12-\\u0d3a\\u0d3d\\u0d4e\\u0d60\\u0d61\\u0d7a-\\u0d7f\\u0d85-\\u0d96\\u0d9a-\\u0db1\\u0db3-\\u0dbb\\u0dbd\\u0dc0-\\u0dc6\\u0e01-\\u0e30\\u0e32\\u0e33\\u0e40-\\u0e46\\u0e81\\u0e82\\u0e84\\u0e87\\u0e88\\u0e8a\\u0e8d\\u0e94-\\u0e97\\u0e99-\\u0e9f\\u0ea1-\\u0ea3\\u0ea5\\u0ea7\\u0eaa\\u0eab\\u0ead-\\u0eb0\\u0eb2\\u0eb3\\u0ebd\\u0ec0-\\u0ec4\\u0ec6\\u0edc-\\u0edf\\u0f00\\u0f40-\\u0f47\\u0f49-\\u0f6c\\u0f88-\\u0f8c\\u1000-\\u102a\\u103f\\u1050-\\u1055\\u105a-\\u105d\\u1061\\u1065\\u1066\\u106e-\\u1070\\u1075-\\u1081\\u108e\\u10a0-\\u10c5\\u10c7\\u10cd\\u10d0-\\u10fa\\u10fc-\\u1248\\u124a-\\u124d\\u1250-\\u1256\\u1258\\u125a-\\u125d\\u1260-\\u1288\\u128a-\\u128d\\u1290-\\u12b0\\u12b2-\\u12b5\\u12b8-\\u12be\\u12c0\\u12c2-\\u12c5\\u12c8-\\u12d6\\u12d8-\\u1310\\u1312-\\u1315\\u1318-\\u135a\\u1380-\\u138f\\u13a0-\\u13f4\\u1401-\\u166c\\u166f-\\u167f\\u1681-\\u169a\\u16a0-\\u16ea\\u16ee-\\u16f0\\u1700-\\u170c\\u170e-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176c\\u176e-\\u1770\\u1780-\\u17b3\\u17d7\\u17dc\\u1820-\\u1877\\u1880-\\u18a8\\u18aa\\u18b0-\\u18f5\\u1900-\\u191c\\u1950-\\u196d\\u1970-\\u1974\\u1980-\\u19ab\\u19c1-\\u19c7\\u1a00-\\u1a16\\u1a20-\\u1a54\\u1aa7\\u1b05-\\u1b33\\u1b45-\\u1b4b\\u1b83-\\u1ba0\\u1bae\\u1baf\\u1bba-\\u1be5\\u1c00-\\u1c23\\u1c4d-\\u1c4f\\u1c5a-\\u1c7d\\u1ce9-\\u1cec\\u1cee-\\u1cf1\\u1cf5\\u1cf6\\u1d00-\\u1dbf\\u1e00-\\u1f15\\u1f18-\\u1f1d\\u1f20-\\u1f45\\u1f48-\\u1f4d\\u1f50-\\u1f57\\u1f59\\u1f5b\\u1f5d\\u1f5f-\\u1f7d\\u1f80-\\u1fb4\\u1fb6-\\u1fbc\\u1fbe\\u1fc2-\\u1fc4\\u1fc6-\\u1fcc\\u1fd0-\\u1fd3\\u1fd6-\\u1fdb\\u1fe0-\\u1fec\\u1ff2-\\u1ff4\\u1ff6-\\u1ffc\\u2071\\u207f\\u2090-\\u209c\\u2102\\u2107\\u210a-\\u2113\\u2115\\u2119-\\u211d\\u2124\\u2126\\u2128\\u212a-\\u212d\\u212f-\\u2139\\u213c-\\u213f\\u2145-\\u2149\\u214e\\u2160-\\u2188\\u2c00-\\u2c2e\\u2c30-\\u2c5e\\u2c60-\\u2ce4\\u2ceb-\\u2cee\\u2cf2\\u2cf3\\u2d00-\\u2d25\\u2d27\\u2d2d\\u2d30-\\u2d67\\u2d6f\\u2d80-\\u2d96\\u2da0-\\u2da6\\u2da8-\\u2dae\\u2db0-\\u2db6\\u2db8-\\u2dbe\\u2dc0-\\u2dc6\\u2dc8-\\u2dce\\u2dd0-\\u2dd6\\u2dd8-\\u2dde\\u2e2f\\u3005-\\u3007\\u3021-\\u3029\\u3031-\\u3035\\u3038-\\u303c\\u3041-\\u3096\\u309d-\\u309f\\u30a1-\\u30fa\\u30fc-\\u30ff\\u3105-\\u312d\\u3131-\\u318e\\u31a0-\\u31ba\\u31f0-\\u31ff\\u3400-\\u4db5\\u4e00-\\u9fcc\\ua000-\\ua48c\\ua4d0-\\ua4fd\\ua500-\\ua60c\\ua610-\\ua61f\\ua62a\\ua62b\\ua640-\\ua66e\\ua67f-\\ua697\\ua6a0-\\ua6ef\\ua717-\\ua71f\\ua722-\\ua788\\ua78b-\\ua78e\\ua790-\\ua793\\ua7a0-\\ua7aa\\ua7f8-\\ua801\\ua803-\\ua805\\ua807-\\ua80a\\ua80c-\\ua822\\ua840-\\ua873\\ua882-\\ua8b3\\ua8f2-\\ua8f7\\ua8fb\\ua90a-\\ua925\\ua930-\\ua946\\ua960-\\ua97c\\ua984-\\ua9b2\\ua9cf\\uaa00-\\uaa28\\uaa40-\\uaa42\\uaa44-\\uaa4b\\uaa60-\\uaa76\\uaa7a\\uaa80-\\uaaaf\\uaab1\\uaab5\\uaab6\\uaab9-\\uaabd\\uaac0\\uaac2\\uaadb-\\uaadd\\uaae0-\\uaaea\\uaaf2-\\uaaf4\\uab01-\\uab06\\uab09-\\uab0e\\uab11-\\uab16\\uab20-\\uab26\\uab28-\\uab2e\\uabc0-\\uabe2\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\uf900-\\ufa6d\\ufa70-\\ufad9\\ufb00-\\ufb06\\ufb13-\\ufb17\\ufb1d\\ufb1f-\\ufb28\\ufb2a-\\ufb36\\ufb38-\\ufb3c\\ufb3e\\ufb40\\ufb41\\ufb43\\ufb44\\ufb46-\\ufbb1\\ufbd3-\\ufd3d\\ufd50-\\ufd8f\\ufd92-\\ufdc7\\ufdf0-\\ufdfb\\ufe70-\\ufe74\\ufe76-\\ufefc\\uff21-\\uff3a\\uff41-\\uff5a\\uff66-\\uffbe\\uffc2-\\uffc7\\uffca-\\uffcf\\uffd2-\\uffd7\\uffda-\\uffdc";
  var nonASCIIidentifierChars = "\\u0300-\\u036f\\u0483-\\u0487\\u0591-\\u05bd\\u05bf\\u05c1\\u05c2\\u05c4\\u05c5\\u05c7\\u0610-\\u061a\\u0620-\\u0649\\u0672-\\u06d3\\u06e7-\\u06e8\\u06fb-\\u06fc\\u0730-\\u074a\\u0800-\\u0814\\u081b-\\u0823\\u0825-\\u0827\\u0829-\\u082d\\u0840-\\u0857\\u08e4-\\u08fe\\u0900-\\u0903\\u093a-\\u093c\\u093e-\\u094f\\u0951-\\u0957\\u0962-\\u0963\\u0966-\\u096f\\u0981-\\u0983\\u09bc\\u09be-\\u09c4\\u09c7\\u09c8\\u09d7\\u09df-\\u09e0\\u0a01-\\u0a03\\u0a3c\\u0a3e-\\u0a42\\u0a47\\u0a48\\u0a4b-\\u0a4d\\u0a51\\u0a66-\\u0a71\\u0a75\\u0a81-\\u0a83\\u0abc\\u0abe-\\u0ac5\\u0ac7-\\u0ac9\\u0acb-\\u0acd\\u0ae2-\\u0ae3\\u0ae6-\\u0aef\\u0b01-\\u0b03\\u0b3c\\u0b3e-\\u0b44\\u0b47\\u0b48\\u0b4b-\\u0b4d\\u0b56\\u0b57\\u0b5f-\\u0b60\\u0b66-\\u0b6f\\u0b82\\u0bbe-\\u0bc2\\u0bc6-\\u0bc8\\u0bca-\\u0bcd\\u0bd7\\u0be6-\\u0bef\\u0c01-\\u0c03\\u0c46-\\u0c48\\u0c4a-\\u0c4d\\u0c55\\u0c56\\u0c62-\\u0c63\\u0c66-\\u0c6f\\u0c82\\u0c83\\u0cbc\\u0cbe-\\u0cc4\\u0cc6-\\u0cc8\\u0cca-\\u0ccd\\u0cd5\\u0cd6\\u0ce2-\\u0ce3\\u0ce6-\\u0cef\\u0d02\\u0d03\\u0d46-\\u0d48\\u0d57\\u0d62-\\u0d63\\u0d66-\\u0d6f\\u0d82\\u0d83\\u0dca\\u0dcf-\\u0dd4\\u0dd6\\u0dd8-\\u0ddf\\u0df2\\u0df3\\u0e34-\\u0e3a\\u0e40-\\u0e45\\u0e50-\\u0e59\\u0eb4-\\u0eb9\\u0ec8-\\u0ecd\\u0ed0-\\u0ed9\\u0f18\\u0f19\\u0f20-\\u0f29\\u0f35\\u0f37\\u0f39\\u0f41-\\u0f47\\u0f71-\\u0f84\\u0f86-\\u0f87\\u0f8d-\\u0f97\\u0f99-\\u0fbc\\u0fc6\\u1000-\\u1029\\u1040-\\u1049\\u1067-\\u106d\\u1071-\\u1074\\u1082-\\u108d\\u108f-\\u109d\\u135d-\\u135f\\u170e-\\u1710\\u1720-\\u1730\\u1740-\\u1750\\u1772\\u1773\\u1780-\\u17b2\\u17dd\\u17e0-\\u17e9\\u180b-\\u180d\\u1810-\\u1819\\u1920-\\u192b\\u1930-\\u193b\\u1951-\\u196d\\u19b0-\\u19c0\\u19c8-\\u19c9\\u19d0-\\u19d9\\u1a00-\\u1a15\\u1a20-\\u1a53\\u1a60-\\u1a7c\\u1a7f-\\u1a89\\u1a90-\\u1a99\\u1b46-\\u1b4b\\u1b50-\\u1b59\\u1b6b-\\u1b73\\u1bb0-\\u1bb9\\u1be6-\\u1bf3\\u1c00-\\u1c22\\u1c40-\\u1c49\\u1c5b-\\u1c7d\\u1cd0-\\u1cd2\\u1d00-\\u1dbe\\u1e01-\\u1f15\\u200c\\u200d\\u203f\\u2040\\u2054\\u20d0-\\u20dc\\u20e1\\u20e5-\\u20f0\\u2d81-\\u2d96\\u2de0-\\u2dff\\u3021-\\u3028\\u3099\\u309a\\ua640-\\ua66d\\ua674-\\ua67d\\ua69f\\ua6f0-\\ua6f1\\ua7f8-\\ua800\\ua806\\ua80b\\ua823-\\ua827\\ua880-\\ua881\\ua8b4-\\ua8c4\\ua8d0-\\ua8d9\\ua8f3-\\ua8f7\\ua900-\\ua909\\ua926-\\ua92d\\ua930-\\ua945\\ua980-\\ua983\\ua9b3-\\ua9c0\\uaa00-\\uaa27\\uaa40-\\uaa41\\uaa4c-\\uaa4d\\uaa50-\\uaa59\\uaa7b\\uaae0-\\uaae9\\uaaf2-\\uaaf3\\uabc0-\\uabe1\\uabec\\uabed\\uabf0-\\uabf9\\ufb20-\\ufb28\\ufe00-\\ufe0f\\ufe20-\\ufe26\\ufe33\\ufe34\\ufe4d-\\ufe4f\\uff10-\\uff19\\uff3f";
  var identifierStart = "(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierStartChars + nonASCIIidentifierStartChars + "])";
  var identifierChars = "(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])*";
  exports2.identifier = new RegExp(identifierStart + identifierChars, "g");
  exports2.identifierStart = new RegExp(identifierStart);
  exports2.identifierMatch = new RegExp("(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])+");
  exports2.newline = /[\n\r\u2028\u2029]/;
  exports2.lineBreak = new RegExp("\r\n|" + exports2.newline.source);
  exports2.allLineBreaks = new RegExp(exports2.lineBreak.source, "g");
});

// ../node_modules/js-beautify/js/src/core/options.js
var require_options = __commonJS((exports2, module2) => {
  "use strict";
  function Options(options, merge_child_field) {
    this.raw_options = _mergeOpts(options, merge_child_field);
    this.disabled = this._get_boolean("disabled");
    this.eol = this._get_characters("eol", "auto");
    this.end_with_newline = this._get_boolean("end_with_newline");
    this.indent_size = this._get_number("indent_size", 4);
    this.indent_char = this._get_characters("indent_char", " ");
    this.indent_level = this._get_number("indent_level");
    this.preserve_newlines = this._get_boolean("preserve_newlines", true);
    this.max_preserve_newlines = this._get_number("max_preserve_newlines", 32786);
    if (!this.preserve_newlines) {
      this.max_preserve_newlines = 0;
    }
    this.indent_with_tabs = this._get_boolean("indent_with_tabs", this.indent_char === "	");
    if (this.indent_with_tabs) {
      this.indent_char = "	";
      if (this.indent_size === 1) {
        this.indent_size = 4;
      }
    }
    this.wrap_line_length = this._get_number("wrap_line_length", this._get_number("max_char"));
    this.indent_empty_lines = this._get_boolean("indent_empty_lines");
    this.templating = this._get_selection_list("templating", ["auto", "none", "django", "erb", "handlebars", "php", "smarty"], ["auto"]);
  }
  Options.prototype._get_array = function(name, default_value) {
    var option_value = this.raw_options[name];
    var result = default_value || [];
    if (typeof option_value === "object") {
      if (option_value !== null && typeof option_value.concat === "function") {
        result = option_value.concat();
      }
    } else if (typeof option_value === "string") {
      result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
    }
    return result;
  };
  Options.prototype._get_boolean = function(name, default_value) {
    var option_value = this.raw_options[name];
    var result = option_value === void 0 ? !!default_value : !!option_value;
    return result;
  };
  Options.prototype._get_characters = function(name, default_value) {
    var option_value = this.raw_options[name];
    var result = default_value || "";
    if (typeof option_value === "string") {
      result = option_value.replace(/\\r/, "\r").replace(/\\n/, "\n").replace(/\\t/, "	");
    }
    return result;
  };
  Options.prototype._get_number = function(name, default_value) {
    var option_value = this.raw_options[name];
    default_value = parseInt(default_value, 10);
    if (isNaN(default_value)) {
      default_value = 0;
    }
    var result = parseInt(option_value, 10);
    if (isNaN(result)) {
      result = default_value;
    }
    return result;
  };
  Options.prototype._get_selection = function(name, selection_list, default_value) {
    var result = this._get_selection_list(name, selection_list, default_value);
    if (result.length !== 1) {
      throw new Error("Invalid Option Value: The option '" + name + "' can only be one of the following values:\n" + selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
    }
    return result[0];
  };
  Options.prototype._get_selection_list = function(name, selection_list, default_value) {
    if (!selection_list || selection_list.length === 0) {
      throw new Error("Selection list cannot be empty.");
    }
    default_value = default_value || [selection_list[0]];
    if (!this._is_valid_selection(default_value, selection_list)) {
      throw new Error("Invalid Default Value!");
    }
    var result = this._get_array(name, default_value);
    if (!this._is_valid_selection(result, selection_list)) {
      throw new Error("Invalid Option Value: The option '" + name + "' can contain only the following values:\n" + selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
    }
    return result;
  };
  Options.prototype._is_valid_selection = function(result, selection_list) {
    return result.length && selection_list.length && !result.some(function(item) {
      return selection_list.indexOf(item) === -1;
    });
  };
  function _mergeOpts(allOptions, childFieldName) {
    var finalOpts = {};
    allOptions = _normalizeOpts(allOptions);
    var name;
    for (name in allOptions) {
      if (name !== childFieldName) {
        finalOpts[name] = allOptions[name];
      }
    }
    if (childFieldName && allOptions[childFieldName]) {
      for (name in allOptions[childFieldName]) {
        finalOpts[name] = allOptions[childFieldName][name];
      }
    }
    return finalOpts;
  }
  function _normalizeOpts(options) {
    var convertedOpts = {};
    var key;
    for (key in options) {
      var newKey = key.replace(/-/g, "_");
      convertedOpts[newKey] = options[key];
    }
    return convertedOpts;
  }
  module2.exports.Options = Options;
  module2.exports.normalizeOpts = _normalizeOpts;
  module2.exports.mergeOpts = _mergeOpts;
});

// ../node_modules/js-beautify/js/src/javascript/options.js
var require_options2 = __commonJS((exports2, module2) => {
  "use strict";
  var BaseOptions = require_options().Options;
  var validPositionValues = ["before-newline", "after-newline", "preserve-newline"];
  function Options(options) {
    BaseOptions.call(this, options, "js");
    var raw_brace_style = this.raw_options.brace_style || null;
    if (raw_brace_style === "expand-strict") {
      this.raw_options.brace_style = "expand";
    } else if (raw_brace_style === "collapse-preserve-inline") {
      this.raw_options.brace_style = "collapse,preserve-inline";
    } else if (this.raw_options.braces_on_own_line !== void 0) {
      this.raw_options.brace_style = this.raw_options.braces_on_own_line ? "expand" : "collapse";
    }
    var brace_style_split = this._get_selection_list("brace_style", ["collapse", "expand", "end-expand", "none", "preserve-inline"]);
    this.brace_preserve_inline = false;
    this.brace_style = "collapse";
    for (var bs = 0; bs < brace_style_split.length; bs++) {
      if (brace_style_split[bs] === "preserve-inline") {
        this.brace_preserve_inline = true;
      } else {
        this.brace_style = brace_style_split[bs];
      }
    }
    this.unindent_chained_methods = this._get_boolean("unindent_chained_methods");
    this.break_chained_methods = this._get_boolean("break_chained_methods");
    this.space_in_paren = this._get_boolean("space_in_paren");
    this.space_in_empty_paren = this._get_boolean("space_in_empty_paren");
    this.jslint_happy = this._get_boolean("jslint_happy");
    this.space_after_anon_function = this._get_boolean("space_after_anon_function");
    this.space_after_named_function = this._get_boolean("space_after_named_function");
    this.keep_array_indentation = this._get_boolean("keep_array_indentation");
    this.space_before_conditional = this._get_boolean("space_before_conditional", true);
    this.unescape_strings = this._get_boolean("unescape_strings");
    this.e4x = this._get_boolean("e4x");
    this.comma_first = this._get_boolean("comma_first");
    this.operator_position = this._get_selection("operator_position", validPositionValues);
    this.test_output_raw = this._get_boolean("test_output_raw");
    if (this.jslint_happy) {
      this.space_after_anon_function = true;
    }
  }
  Options.prototype = new BaseOptions();
  module2.exports.Options = Options;
});

// ../node_modules/js-beautify/js/src/core/inputscanner.js
var require_inputscanner = __commonJS((exports2, module2) => {
  "use strict";
  var regexp_has_sticky = RegExp.prototype.hasOwnProperty("sticky");
  function InputScanner(input_string) {
    this.__input = input_string || "";
    this.__input_length = this.__input.length;
    this.__position = 0;
  }
  InputScanner.prototype.restart = function() {
    this.__position = 0;
  };
  InputScanner.prototype.back = function() {
    if (this.__position > 0) {
      this.__position -= 1;
    }
  };
  InputScanner.prototype.hasNext = function() {
    return this.__position < this.__input_length;
  };
  InputScanner.prototype.next = function() {
    var val = null;
    if (this.hasNext()) {
      val = this.__input.charAt(this.__position);
      this.__position += 1;
    }
    return val;
  };
  InputScanner.prototype.peek = function(index) {
    var val = null;
    index = index || 0;
    index += this.__position;
    if (index >= 0 && index < this.__input_length) {
      val = this.__input.charAt(index);
    }
    return val;
  };
  InputScanner.prototype.__match = function(pattern, index) {
    pattern.lastIndex = index;
    var pattern_match = pattern.exec(this.__input);
    if (pattern_match && !(regexp_has_sticky && pattern.sticky)) {
      if (pattern_match.index !== index) {
        pattern_match = null;
      }
    }
    return pattern_match;
  };
  InputScanner.prototype.test = function(pattern, index) {
    index = index || 0;
    index += this.__position;
    if (index >= 0 && index < this.__input_length) {
      return !!this.__match(pattern, index);
    } else {
      return false;
    }
  };
  InputScanner.prototype.testChar = function(pattern, index) {
    var val = this.peek(index);
    pattern.lastIndex = 0;
    return val !== null && pattern.test(val);
  };
  InputScanner.prototype.match = function(pattern) {
    var pattern_match = this.__match(pattern, this.__position);
    if (pattern_match) {
      this.__position += pattern_match[0].length;
    } else {
      pattern_match = null;
    }
    return pattern_match;
  };
  InputScanner.prototype.read = function(starting_pattern, until_pattern, until_after) {
    var val = "";
    var match;
    if (starting_pattern) {
      match = this.match(starting_pattern);
      if (match) {
        val += match[0];
      }
    }
    if (until_pattern && (match || !starting_pattern)) {
      val += this.readUntil(until_pattern, until_after);
    }
    return val;
  };
  InputScanner.prototype.readUntil = function(pattern, until_after) {
    var val = "";
    var match_index = this.__position;
    pattern.lastIndex = this.__position;
    var pattern_match = pattern.exec(this.__input);
    if (pattern_match) {
      match_index = pattern_match.index;
      if (until_after) {
        match_index += pattern_match[0].length;
      }
    } else {
      match_index = this.__input_length;
    }
    val = this.__input.substring(this.__position, match_index);
    this.__position = match_index;
    return val;
  };
  InputScanner.prototype.readUntilAfter = function(pattern) {
    return this.readUntil(pattern, true);
  };
  InputScanner.prototype.get_regexp = function(pattern, match_from) {
    var result = null;
    var flags = "g";
    if (match_from && regexp_has_sticky) {
      flags = "y";
    }
    if (typeof pattern === "string" && pattern !== "") {
      result = new RegExp(pattern, flags);
    } else if (pattern) {
      result = new RegExp(pattern.source, flags);
    }
    return result;
  };
  InputScanner.prototype.get_literal_regexp = function(literal_string) {
    return RegExp(literal_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
  };
  InputScanner.prototype.peekUntilAfter = function(pattern) {
    var start = this.__position;
    var val = this.readUntilAfter(pattern);
    this.__position = start;
    return val;
  };
  InputScanner.prototype.lookBack = function(testVal) {
    var start = this.__position - 1;
    return start >= testVal.length && this.__input.substring(start - testVal.length, start).toLowerCase() === testVal;
  };
  module2.exports.InputScanner = InputScanner;
});

// ../node_modules/js-beautify/js/src/core/tokenstream.js
var require_tokenstream = __commonJS((exports2, module2) => {
  "use strict";
  function TokenStream(parent_token) {
    this.__tokens = [];
    this.__tokens_length = this.__tokens.length;
    this.__position = 0;
    this.__parent_token = parent_token;
  }
  TokenStream.prototype.restart = function() {
    this.__position = 0;
  };
  TokenStream.prototype.isEmpty = function() {
    return this.__tokens_length === 0;
  };
  TokenStream.prototype.hasNext = function() {
    return this.__position < this.__tokens_length;
  };
  TokenStream.prototype.next = function() {
    var val = null;
    if (this.hasNext()) {
      val = this.__tokens[this.__position];
      this.__position += 1;
    }
    return val;
  };
  TokenStream.prototype.peek = function(index) {
    var val = null;
    index = index || 0;
    index += this.__position;
    if (index >= 0 && index < this.__tokens_length) {
      val = this.__tokens[index];
    }
    return val;
  };
  TokenStream.prototype.add = function(token) {
    if (this.__parent_token) {
      token.parent = this.__parent_token;
    }
    this.__tokens.push(token);
    this.__tokens_length += 1;
  };
  module2.exports.TokenStream = TokenStream;
});

// ../node_modules/js-beautify/js/src/core/pattern.js
var require_pattern = __commonJS((exports2, module2) => {
  "use strict";
  function Pattern(input_scanner, parent) {
    this._input = input_scanner;
    this._starting_pattern = null;
    this._match_pattern = null;
    this._until_pattern = null;
    this._until_after = false;
    if (parent) {
      this._starting_pattern = this._input.get_regexp(parent._starting_pattern, true);
      this._match_pattern = this._input.get_regexp(parent._match_pattern, true);
      this._until_pattern = this._input.get_regexp(parent._until_pattern);
      this._until_after = parent._until_after;
    }
  }
  Pattern.prototype.read = function() {
    var result = this._input.read(this._starting_pattern);
    if (!this._starting_pattern || result) {
      result += this._input.read(this._match_pattern, this._until_pattern, this._until_after);
    }
    return result;
  };
  Pattern.prototype.read_match = function() {
    return this._input.match(this._match_pattern);
  };
  Pattern.prototype.until_after = function(pattern) {
    var result = this._create();
    result._until_after = true;
    result._until_pattern = this._input.get_regexp(pattern);
    result._update();
    return result;
  };
  Pattern.prototype.until = function(pattern) {
    var result = this._create();
    result._until_after = false;
    result._until_pattern = this._input.get_regexp(pattern);
    result._update();
    return result;
  };
  Pattern.prototype.starting_with = function(pattern) {
    var result = this._create();
    result._starting_pattern = this._input.get_regexp(pattern, true);
    result._update();
    return result;
  };
  Pattern.prototype.matching = function(pattern) {
    var result = this._create();
    result._match_pattern = this._input.get_regexp(pattern, true);
    result._update();
    return result;
  };
  Pattern.prototype._create = function() {
    return new Pattern(this._input, this);
  };
  Pattern.prototype._update = function() {
  };
  module2.exports.Pattern = Pattern;
});

// ../node_modules/js-beautify/js/src/core/whitespacepattern.js
var require_whitespacepattern = __commonJS((exports2, module2) => {
  "use strict";
  var Pattern = require_pattern().Pattern;
  function WhitespacePattern(input_scanner, parent) {
    Pattern.call(this, input_scanner, parent);
    if (parent) {
      this._line_regexp = this._input.get_regexp(parent._line_regexp);
    } else {
      this.__set_whitespace_patterns("", "");
    }
    this.newline_count = 0;
    this.whitespace_before_token = "";
  }
  WhitespacePattern.prototype = new Pattern();
  WhitespacePattern.prototype.__set_whitespace_patterns = function(whitespace_chars, newline_chars) {
    whitespace_chars += "\\t ";
    newline_chars += "\\n\\r";
    this._match_pattern = this._input.get_regexp("[" + whitespace_chars + newline_chars + "]+", true);
    this._newline_regexp = this._input.get_regexp("\\r\\n|[" + newline_chars + "]");
  };
  WhitespacePattern.prototype.read = function() {
    this.newline_count = 0;
    this.whitespace_before_token = "";
    var resulting_string = this._input.read(this._match_pattern);
    if (resulting_string === " ") {
      this.whitespace_before_token = " ";
    } else if (resulting_string) {
      var matches = this.__split(this._newline_regexp, resulting_string);
      this.newline_count = matches.length - 1;
      this.whitespace_before_token = matches[this.newline_count];
    }
    return resulting_string;
  };
  WhitespacePattern.prototype.matching = function(whitespace_chars, newline_chars) {
    var result = this._create();
    result.__set_whitespace_patterns(whitespace_chars, newline_chars);
    result._update();
    return result;
  };
  WhitespacePattern.prototype._create = function() {
    return new WhitespacePattern(this._input, this);
  };
  WhitespacePattern.prototype.__split = function(regexp, input_string) {
    regexp.lastIndex = 0;
    var start_index = 0;
    var result = [];
    var next_match = regexp.exec(input_string);
    while (next_match) {
      result.push(input_string.substring(start_index, next_match.index));
      start_index = next_match.index + next_match[0].length;
      next_match = regexp.exec(input_string);
    }
    if (start_index < input_string.length) {
      result.push(input_string.substring(start_index, input_string.length));
    } else {
      result.push("");
    }
    return result;
  };
  module2.exports.WhitespacePattern = WhitespacePattern;
});

// ../node_modules/js-beautify/js/src/core/tokenizer.js
var require_tokenizer = __commonJS((exports2, module2) => {
  "use strict";
  var InputScanner = require_inputscanner().InputScanner;
  var Token = require_token().Token;
  var TokenStream = require_tokenstream().TokenStream;
  var WhitespacePattern = require_whitespacepattern().WhitespacePattern;
  var TOKEN = {
    START: "TK_START",
    RAW: "TK_RAW",
    EOF: "TK_EOF"
  };
  var Tokenizer = function(input_string, options) {
    this._input = new InputScanner(input_string);
    this._options = options || {};
    this.__tokens = null;
    this._patterns = {};
    this._patterns.whitespace = new WhitespacePattern(this._input);
  };
  Tokenizer.prototype.tokenize = function() {
    this._input.restart();
    this.__tokens = new TokenStream();
    this._reset();
    var current;
    var previous = new Token(TOKEN.START, "");
    var open_token = null;
    var open_stack = [];
    var comments = new TokenStream();
    while (previous.type !== TOKEN.EOF) {
      current = this._get_next_token(previous, open_token);
      while (this._is_comment(current)) {
        comments.add(current);
        current = this._get_next_token(previous, open_token);
      }
      if (!comments.isEmpty()) {
        current.comments_before = comments;
        comments = new TokenStream();
      }
      current.parent = open_token;
      if (this._is_opening(current)) {
        open_stack.push(open_token);
        open_token = current;
      } else if (open_token && this._is_closing(current, open_token)) {
        current.opened = open_token;
        open_token.closed = current;
        open_token = open_stack.pop();
        current.parent = open_token;
      }
      current.previous = previous;
      previous.next = current;
      this.__tokens.add(current);
      previous = current;
    }
    return this.__tokens;
  };
  Tokenizer.prototype._is_first_token = function() {
    return this.__tokens.isEmpty();
  };
  Tokenizer.prototype._reset = function() {
  };
  Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
    this._readWhitespace();
    var resulting_string = this._input.read(/.+/g);
    if (resulting_string) {
      return this._create_token(TOKEN.RAW, resulting_string);
    } else {
      return this._create_token(TOKEN.EOF, "");
    }
  };
  Tokenizer.prototype._is_comment = function(current_token) {
    return false;
  };
  Tokenizer.prototype._is_opening = function(current_token) {
    return false;
  };
  Tokenizer.prototype._is_closing = function(current_token, open_token) {
    return false;
  };
  Tokenizer.prototype._create_token = function(type, text) {
    var token = new Token(type, text, this._patterns.whitespace.newline_count, this._patterns.whitespace.whitespace_before_token);
    return token;
  };
  Tokenizer.prototype._readWhitespace = function() {
    return this._patterns.whitespace.read();
  };
  module2.exports.Tokenizer = Tokenizer;
  module2.exports.TOKEN = TOKEN;
});

// ../node_modules/js-beautify/js/src/core/directives.js
var require_directives = __commonJS((exports2, module2) => {
  "use strict";
  function Directives(start_block_pattern, end_block_pattern) {
    start_block_pattern = typeof start_block_pattern === "string" ? start_block_pattern : start_block_pattern.source;
    end_block_pattern = typeof end_block_pattern === "string" ? end_block_pattern : end_block_pattern.source;
    this.__directives_block_pattern = new RegExp(start_block_pattern + / beautify( \w+[:]\w+)+ /.source + end_block_pattern, "g");
    this.__directive_pattern = / (\w+)[:](\w+)/g;
    this.__directives_end_ignore_pattern = new RegExp(start_block_pattern + /\sbeautify\signore:end\s/.source + end_block_pattern, "g");
  }
  Directives.prototype.get_directives = function(text) {
    if (!text.match(this.__directives_block_pattern)) {
      return null;
    }
    var directives = {};
    this.__directive_pattern.lastIndex = 0;
    var directive_match = this.__directive_pattern.exec(text);
    while (directive_match) {
      directives[directive_match[1]] = directive_match[2];
      directive_match = this.__directive_pattern.exec(text);
    }
    return directives;
  };
  Directives.prototype.readIgnored = function(input) {
    return input.readUntilAfter(this.__directives_end_ignore_pattern);
  };
  module2.exports.Directives = Directives;
});

// ../node_modules/js-beautify/js/src/core/templatablepattern.js
var require_templatablepattern = __commonJS((exports2, module2) => {
  "use strict";
  var Pattern = require_pattern().Pattern;
  var template_names = {
    django: false,
    erb: false,
    handlebars: false,
    php: false,
    smarty: false
  };
  function TemplatablePattern(input_scanner, parent) {
    Pattern.call(this, input_scanner, parent);
    this.__template_pattern = null;
    this._disabled = Object.assign({}, template_names);
    this._excluded = Object.assign({}, template_names);
    if (parent) {
      this.__template_pattern = this._input.get_regexp(parent.__template_pattern);
      this._excluded = Object.assign(this._excluded, parent._excluded);
      this._disabled = Object.assign(this._disabled, parent._disabled);
    }
    var pattern = new Pattern(input_scanner);
    this.__patterns = {
      handlebars_comment: pattern.starting_with(/{{!--/).until_after(/--}}/),
      handlebars_unescaped: pattern.starting_with(/{{{/).until_after(/}}}/),
      handlebars: pattern.starting_with(/{{/).until_after(/}}/),
      php: pattern.starting_with(/<\?(?:[=]|php)/).until_after(/\?>/),
      erb: pattern.starting_with(/<%[^%]/).until_after(/[^%]%>/),
      django: pattern.starting_with(/{%/).until_after(/%}/),
      django_value: pattern.starting_with(/{{/).until_after(/}}/),
      django_comment: pattern.starting_with(/{#/).until_after(/#}/),
      smarty: pattern.starting_with(/{(?=[^}{\s\n])/).until_after(/[^\s\n]}/),
      smarty_comment: pattern.starting_with(/{\*/).until_after(/\*}/),
      smarty_literal: pattern.starting_with(/{literal}/).until_after(/{\/literal}/)
    };
  }
  TemplatablePattern.prototype = new Pattern();
  TemplatablePattern.prototype._create = function() {
    return new TemplatablePattern(this._input, this);
  };
  TemplatablePattern.prototype._update = function() {
    this.__set_templated_pattern();
  };
  TemplatablePattern.prototype.disable = function(language) {
    var result = this._create();
    result._disabled[language] = true;
    result._update();
    return result;
  };
  TemplatablePattern.prototype.read_options = function(options) {
    var result = this._create();
    for (var language in template_names) {
      result._disabled[language] = options.templating.indexOf(language) === -1;
    }
    result._update();
    return result;
  };
  TemplatablePattern.prototype.exclude = function(language) {
    var result = this._create();
    result._excluded[language] = true;
    result._update();
    return result;
  };
  TemplatablePattern.prototype.read = function() {
    var result = "";
    if (this._match_pattern) {
      result = this._input.read(this._starting_pattern);
    } else {
      result = this._input.read(this._starting_pattern, this.__template_pattern);
    }
    var next = this._read_template();
    while (next) {
      if (this._match_pattern) {
        next += this._input.read(this._match_pattern);
      } else {
        next += this._input.readUntil(this.__template_pattern);
      }
      result += next;
      next = this._read_template();
    }
    if (this._until_after) {
      result += this._input.readUntilAfter(this._until_pattern);
    }
    return result;
  };
  TemplatablePattern.prototype.__set_templated_pattern = function() {
    var items = [];
    if (!this._disabled.php) {
      items.push(this.__patterns.php._starting_pattern.source);
    }
    if (!this._disabled.handlebars) {
      items.push(this.__patterns.handlebars._starting_pattern.source);
    }
    if (!this._disabled.erb) {
      items.push(this.__patterns.erb._starting_pattern.source);
    }
    if (!this._disabled.django) {
      items.push(this.__patterns.django._starting_pattern.source);
      items.push(this.__patterns.django_value._starting_pattern.source);
      items.push(this.__patterns.django_comment._starting_pattern.source);
    }
    if (!this._disabled.smarty) {
      items.push(this.__patterns.smarty._starting_pattern.source);
    }
    if (this._until_pattern) {
      items.push(this._until_pattern.source);
    }
    this.__template_pattern = this._input.get_regexp("(?:" + items.join("|") + ")");
  };
  TemplatablePattern.prototype._read_template = function() {
    var resulting_string = "";
    var c = this._input.peek();
    if (c === "<") {
      var peek1 = this._input.peek(1);
      if (!this._disabled.php && !this._excluded.php && peek1 === "?") {
        resulting_string = resulting_string || this.__patterns.php.read();
      }
      if (!this._disabled.erb && !this._excluded.erb && peek1 === "%") {
        resulting_string = resulting_string || this.__patterns.erb.read();
      }
    } else if (c === "{") {
      if (!this._disabled.handlebars && !this._excluded.handlebars) {
        resulting_string = resulting_string || this.__patterns.handlebars_comment.read();
        resulting_string = resulting_string || this.__patterns.handlebars_unescaped.read();
        resulting_string = resulting_string || this.__patterns.handlebars.read();
      }
      if (!this._disabled.django) {
        if (!this._excluded.django && !this._excluded.handlebars) {
          resulting_string = resulting_string || this.__patterns.django_value.read();
        }
        if (!this._excluded.django) {
          resulting_string = resulting_string || this.__patterns.django_comment.read();
          resulting_string = resulting_string || this.__patterns.django.read();
        }
      }
      if (!this._disabled.smarty) {
        if (this._disabled.django && this._disabled.handlebars) {
          resulting_string = resulting_string || this.__patterns.smarty_comment.read();
          resulting_string = resulting_string || this.__patterns.smarty_literal.read();
          resulting_string = resulting_string || this.__patterns.smarty.read();
        }
      }
    }
    return resulting_string;
  };
  module2.exports.TemplatablePattern = TemplatablePattern;
});

// ../node_modules/js-beautify/js/src/javascript/tokenizer.js
var require_tokenizer2 = __commonJS((exports2, module2) => {
  "use strict";
  var InputScanner = require_inputscanner().InputScanner;
  var BaseTokenizer = require_tokenizer().Tokenizer;
  var BASETOKEN = require_tokenizer().TOKEN;
  var Directives = require_directives().Directives;
  var acorn = require_acorn();
  var Pattern = require_pattern().Pattern;
  var TemplatablePattern = require_templatablepattern().TemplatablePattern;
  function in_array(what, arr) {
    return arr.indexOf(what) !== -1;
  }
  var TOKEN = {
    START_EXPR: "TK_START_EXPR",
    END_EXPR: "TK_END_EXPR",
    START_BLOCK: "TK_START_BLOCK",
    END_BLOCK: "TK_END_BLOCK",
    WORD: "TK_WORD",
    RESERVED: "TK_RESERVED",
    SEMICOLON: "TK_SEMICOLON",
    STRING: "TK_STRING",
    EQUALS: "TK_EQUALS",
    OPERATOR: "TK_OPERATOR",
    COMMA: "TK_COMMA",
    BLOCK_COMMENT: "TK_BLOCK_COMMENT",
    COMMENT: "TK_COMMENT",
    DOT: "TK_DOT",
    UNKNOWN: "TK_UNKNOWN",
    START: BASETOKEN.START,
    RAW: BASETOKEN.RAW,
    EOF: BASETOKEN.EOF
  };
  var directives_core = new Directives(/\/\*/, /\*\//);
  var number_pattern = /0[xX][0123456789abcdefABCDEF]*|0[oO][01234567]*|0[bB][01]*|\d+n|(?:\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/;
  var digit = /[0-9]/;
  var dot_pattern = /[^\d\.]/;
  var positionable_operators = ">>> === !== << && >= ** != == <= >> || ?? |> < / - + > : & % ? ^ | *".split(" ");
  var punct = ">>>= ... >>= <<= === >>> !== **= => ^= :: /= << <= == && -= >= >> != -- += ** || ?? ++ %= &= *= |= |> = ! ? > < : / ^ - + * & % ~ |";
  punct = punct.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
  punct = "\\?\\.(?!\\d) " + punct;
  punct = punct.replace(/ /g, "|");
  var punct_pattern = new RegExp(punct);
  var line_starters = "continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export".split(",");
  var reserved_words = line_starters.concat(["do", "in", "of", "else", "get", "set", "new", "catch", "finally", "typeof", "yield", "async", "await", "from", "as"]);
  var reserved_word_pattern = new RegExp("^(?:" + reserved_words.join("|") + ")$");
  var in_html_comment;
  var Tokenizer = function(input_string, options) {
    BaseTokenizer.call(this, input_string, options);
    this._patterns.whitespace = this._patterns.whitespace.matching(/\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff/.source, /\u2028\u2029/.source);
    var pattern_reader = new Pattern(this._input);
    var templatable = new TemplatablePattern(this._input).read_options(this._options);
    this.__patterns = {
      template: templatable,
      identifier: templatable.starting_with(acorn.identifier).matching(acorn.identifierMatch),
      number: pattern_reader.matching(number_pattern),
      punct: pattern_reader.matching(punct_pattern),
      comment: pattern_reader.starting_with(/\/\//).until(/[\n\r\u2028\u2029]/),
      block_comment: pattern_reader.starting_with(/\/\*/).until_after(/\*\//),
      html_comment_start: pattern_reader.matching(/<!--/),
      html_comment_end: pattern_reader.matching(/-->/),
      include: pattern_reader.starting_with(/#include/).until_after(acorn.lineBreak),
      shebang: pattern_reader.starting_with(/#!/).until_after(acorn.lineBreak),
      xml: pattern_reader.matching(/[\s\S]*?<(\/?)([-a-zA-Z:0-9_.]+|{[\s\S]+?}|!\[CDATA\[[\s\S]*?\]\]|)(\s+{[\s\S]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{[\s\S]+?}))*\s*(\/?)\s*>/),
      single_quote: templatable.until(/['\\\n\r\u2028\u2029]/),
      double_quote: templatable.until(/["\\\n\r\u2028\u2029]/),
      template_text: templatable.until(/[`\\$]/),
      template_expression: templatable.until(/[`}\\]/)
    };
  };
  Tokenizer.prototype = new BaseTokenizer();
  Tokenizer.prototype._is_comment = function(current_token) {
    return current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.BLOCK_COMMENT || current_token.type === TOKEN.UNKNOWN;
  };
  Tokenizer.prototype._is_opening = function(current_token) {
    return current_token.type === TOKEN.START_BLOCK || current_token.type === TOKEN.START_EXPR;
  };
  Tokenizer.prototype._is_closing = function(current_token, open_token) {
    return (current_token.type === TOKEN.END_BLOCK || current_token.type === TOKEN.END_EXPR) && (open_token && (current_token.text === "]" && open_token.text === "[" || current_token.text === ")" && open_token.text === "(" || current_token.text === "}" && open_token.text === "{"));
  };
  Tokenizer.prototype._reset = function() {
    in_html_comment = false;
  };
  Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
    var token = null;
    this._readWhitespace();
    var c = this._input.peek();
    if (c === null) {
      return this._create_token(TOKEN.EOF, "");
    }
    token = token || this._read_non_javascript(c);
    token = token || this._read_string(c);
    token = token || this._read_word(previous_token);
    token = token || this._read_singles(c);
    token = token || this._read_comment(c);
    token = token || this._read_regexp(c, previous_token);
    token = token || this._read_xml(c, previous_token);
    token = token || this._read_punctuation();
    token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());
    return token;
  };
  Tokenizer.prototype._read_word = function(previous_token) {
    var resulting_string;
    resulting_string = this.__patterns.identifier.read();
    if (resulting_string !== "") {
      resulting_string = resulting_string.replace(acorn.allLineBreaks, "\n");
      if (!(previous_token.type === TOKEN.DOT || previous_token.type === TOKEN.RESERVED && (previous_token.text === "set" || previous_token.text === "get")) && reserved_word_pattern.test(resulting_string)) {
        if (resulting_string === "in" || resulting_string === "of") {
          return this._create_token(TOKEN.OPERATOR, resulting_string);
        }
        return this._create_token(TOKEN.RESERVED, resulting_string);
      }
      return this._create_token(TOKEN.WORD, resulting_string);
    }
    resulting_string = this.__patterns.number.read();
    if (resulting_string !== "") {
      return this._create_token(TOKEN.WORD, resulting_string);
    }
  };
  Tokenizer.prototype._read_singles = function(c) {
    var token = null;
    if (c === "(" || c === "[") {
      token = this._create_token(TOKEN.START_EXPR, c);
    } else if (c === ")" || c === "]") {
      token = this._create_token(TOKEN.END_EXPR, c);
    } else if (c === "{") {
      token = this._create_token(TOKEN.START_BLOCK, c);
    } else if (c === "}") {
      token = this._create_token(TOKEN.END_BLOCK, c);
    } else if (c === ";") {
      token = this._create_token(TOKEN.SEMICOLON, c);
    } else if (c === "." && dot_pattern.test(this._input.peek(1))) {
      token = this._create_token(TOKEN.DOT, c);
    } else if (c === ",") {
      token = this._create_token(TOKEN.COMMA, c);
    }
    if (token) {
      this._input.next();
    }
    return token;
  };
  Tokenizer.prototype._read_punctuation = function() {
    var resulting_string = this.__patterns.punct.read();
    if (resulting_string !== "") {
      if (resulting_string === "=") {
        return this._create_token(TOKEN.EQUALS, resulting_string);
      } else if (resulting_string === "?.") {
        return this._create_token(TOKEN.DOT, resulting_string);
      } else {
        return this._create_token(TOKEN.OPERATOR, resulting_string);
      }
    }
  };
  Tokenizer.prototype._read_non_javascript = function(c) {
    var resulting_string = "";
    if (c === "#") {
      if (this._is_first_token()) {
        resulting_string = this.__patterns.shebang.read();
        if (resulting_string) {
          return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + "\n");
        }
      }
      resulting_string = this.__patterns.include.read();
      if (resulting_string) {
        return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + "\n");
      }
      c = this._input.next();
      var sharp = "#";
      if (this._input.hasNext() && this._input.testChar(digit)) {
        do {
          c = this._input.next();
          sharp += c;
        } while (this._input.hasNext() && c !== "#" && c !== "=");
        if (c === "#") {
        } else if (this._input.peek() === "[" && this._input.peek(1) === "]") {
          sharp += "[]";
          this._input.next();
          this._input.next();
        } else if (this._input.peek() === "{" && this._input.peek(1) === "}") {
          sharp += "{}";
          this._input.next();
          this._input.next();
        }
        return this._create_token(TOKEN.WORD, sharp);
      }
      this._input.back();
    } else if (c === "<" && this._is_first_token()) {
      resulting_string = this.__patterns.html_comment_start.read();
      if (resulting_string) {
        while (this._input.hasNext() && !this._input.testChar(acorn.newline)) {
          resulting_string += this._input.next();
        }
        in_html_comment = true;
        return this._create_token(TOKEN.COMMENT, resulting_string);
      }
    } else if (in_html_comment && c === "-") {
      resulting_string = this.__patterns.html_comment_end.read();
      if (resulting_string) {
        in_html_comment = false;
        return this._create_token(TOKEN.COMMENT, resulting_string);
      }
    }
    return null;
  };
  Tokenizer.prototype._read_comment = function(c) {
    var token = null;
    if (c === "/") {
      var comment = "";
      if (this._input.peek(1) === "*") {
        comment = this.__patterns.block_comment.read();
        var directives = directives_core.get_directives(comment);
        if (directives && directives.ignore === "start") {
          comment += directives_core.readIgnored(this._input);
        }
        comment = comment.replace(acorn.allLineBreaks, "\n");
        token = this._create_token(TOKEN.BLOCK_COMMENT, comment);
        token.directives = directives;
      } else if (this._input.peek(1) === "/") {
        comment = this.__patterns.comment.read();
        token = this._create_token(TOKEN.COMMENT, comment);
      }
    }
    return token;
  };
  Tokenizer.prototype._read_string = function(c) {
    if (c === "`" || c === "'" || c === '"') {
      var resulting_string = this._input.next();
      this.has_char_escapes = false;
      if (c === "`") {
        resulting_string += this._read_string_recursive("`", true, "${");
      } else {
        resulting_string += this._read_string_recursive(c);
      }
      if (this.has_char_escapes && this._options.unescape_strings) {
        resulting_string = unescape_string(resulting_string);
      }
      if (this._input.peek() === c) {
        resulting_string += this._input.next();
      }
      resulting_string = resulting_string.replace(acorn.allLineBreaks, "\n");
      return this._create_token(TOKEN.STRING, resulting_string);
    }
    return null;
  };
  Tokenizer.prototype._allow_regexp_or_xml = function(previous_token) {
    return previous_token.type === TOKEN.RESERVED && in_array(previous_token.text, ["return", "case", "throw", "else", "do", "typeof", "yield"]) || previous_token.type === TOKEN.END_EXPR && previous_token.text === ")" && previous_token.opened.previous.type === TOKEN.RESERVED && in_array(previous_token.opened.previous.text, ["if", "while", "for"]) || in_array(previous_token.type, [
      TOKEN.COMMENT,
      TOKEN.START_EXPR,
      TOKEN.START_BLOCK,
      TOKEN.START,
      TOKEN.END_BLOCK,
      TOKEN.OPERATOR,
      TOKEN.EQUALS,
      TOKEN.EOF,
      TOKEN.SEMICOLON,
      TOKEN.COMMA
    ]);
  };
  Tokenizer.prototype._read_regexp = function(c, previous_token) {
    if (c === "/" && this._allow_regexp_or_xml(previous_token)) {
      var resulting_string = this._input.next();
      var esc = false;
      var in_char_class = false;
      while (this._input.hasNext() && ((esc || in_char_class || this._input.peek() !== c) && !this._input.testChar(acorn.newline))) {
        resulting_string += this._input.peek();
        if (!esc) {
          esc = this._input.peek() === "\\";
          if (this._input.peek() === "[") {
            in_char_class = true;
          } else if (this._input.peek() === "]") {
            in_char_class = false;
          }
        } else {
          esc = false;
        }
        this._input.next();
      }
      if (this._input.peek() === c) {
        resulting_string += this._input.next();
        resulting_string += this._input.read(acorn.identifier);
      }
      return this._create_token(TOKEN.STRING, resulting_string);
    }
    return null;
  };
  Tokenizer.prototype._read_xml = function(c, previous_token) {
    if (this._options.e4x && c === "<" && this._allow_regexp_or_xml(previous_token)) {
      var xmlStr = "";
      var match = this.__patterns.xml.read_match();
      if (match) {
        var rootTag = match[2].replace(/^{\s+/, "{").replace(/\s+}$/, "}");
        var isCurlyRoot = rootTag.indexOf("{") === 0;
        var depth = 0;
        while (match) {
          var isEndTag = !!match[1];
          var tagName = match[2];
          var isSingletonTag = !!match[match.length - 1] || tagName.slice(0, 8) === "![CDATA[";
          if (!isSingletonTag && (tagName === rootTag || isCurlyRoot && tagName.replace(/^{\s+/, "{").replace(/\s+}$/, "}"))) {
            if (isEndTag) {
              --depth;
            } else {
              ++depth;
            }
          }
          xmlStr += match[0];
          if (depth <= 0) {
            break;
          }
          match = this.__patterns.xml.read_match();
        }
        if (!match) {
          xmlStr += this._input.match(/[\s\S]*/g)[0];
        }
        xmlStr = xmlStr.replace(acorn.allLineBreaks, "\n");
        return this._create_token(TOKEN.STRING, xmlStr);
      }
    }
    return null;
  };
  function unescape_string(s) {
    var out = "", escaped = 0;
    var input_scan = new InputScanner(s);
    var matched = null;
    while (input_scan.hasNext()) {
      matched = input_scan.match(/([\s]|[^\\]|\\\\)+/g);
      if (matched) {
        out += matched[0];
      }
      if (input_scan.peek() === "\\") {
        input_scan.next();
        if (input_scan.peek() === "x") {
          matched = input_scan.match(/x([0-9A-Fa-f]{2})/g);
        } else if (input_scan.peek() === "u") {
          matched = input_scan.match(/u([0-9A-Fa-f]{4})/g);
        } else {
          out += "\\";
          if (input_scan.hasNext()) {
            out += input_scan.next();
          }
          continue;
        }
        if (!matched) {
          return s;
        }
        escaped = parseInt(matched[1], 16);
        if (escaped > 126 && escaped <= 255 && matched[0].indexOf("x") === 0) {
          return s;
        } else if (escaped >= 0 && escaped < 32) {
          out += "\\" + matched[0];
          continue;
        } else if (escaped === 34 || escaped === 39 || escaped === 92) {
          out += "\\" + String.fromCharCode(escaped);
        } else {
          out += String.fromCharCode(escaped);
        }
      }
    }
    return out;
  }
  Tokenizer.prototype._read_string_recursive = function(delimiter, allow_unescaped_newlines, start_sub) {
    var current_char;
    var pattern;
    if (delimiter === "'") {
      pattern = this.__patterns.single_quote;
    } else if (delimiter === '"') {
      pattern = this.__patterns.double_quote;
    } else if (delimiter === "`") {
      pattern = this.__patterns.template_text;
    } else if (delimiter === "}") {
      pattern = this.__patterns.template_expression;
    }
    var resulting_string = pattern.read();
    var next = "";
    while (this._input.hasNext()) {
      next = this._input.next();
      if (next === delimiter || !allow_unescaped_newlines && acorn.newline.test(next)) {
        this._input.back();
        break;
      } else if (next === "\\" && this._input.hasNext()) {
        current_char = this._input.peek();
        if (current_char === "x" || current_char === "u") {
          this.has_char_escapes = true;
        } else if (current_char === "\r" && this._input.peek(1) === "\n") {
          this._input.next();
        }
        next += this._input.next();
      } else if (start_sub) {
        if (start_sub === "${" && next === "$" && this._input.peek() === "{") {
          next += this._input.next();
        }
        if (start_sub === next) {
          if (delimiter === "`") {
            next += this._read_string_recursive("}", allow_unescaped_newlines, "`");
          } else {
            next += this._read_string_recursive("`", allow_unescaped_newlines, "${");
          }
          if (this._input.hasNext()) {
            next += this._input.next();
          }
        }
      }
      next += pattern.read();
      resulting_string += next;
    }
    return resulting_string;
  };
  module2.exports.Tokenizer = Tokenizer;
  module2.exports.TOKEN = TOKEN;
  module2.exports.positionable_operators = positionable_operators.slice();
  module2.exports.line_starters = line_starters.slice();
});

// ../node_modules/js-beautify/js/src/javascript/beautifier.js
var require_beautifier = __commonJS((exports2, module2) => {
  "use strict";
  var Output = require_output().Output;
  var Token = require_token().Token;
  var acorn = require_acorn();
  var Options = require_options2().Options;
  var Tokenizer = require_tokenizer2().Tokenizer;
  var line_starters = require_tokenizer2().line_starters;
  var positionable_operators = require_tokenizer2().positionable_operators;
  var TOKEN = require_tokenizer2().TOKEN;
  function in_array(what, arr) {
    return arr.indexOf(what) !== -1;
  }
  function ltrim(s) {
    return s.replace(/^\s+/g, "");
  }
  function generateMapFromStrings(list) {
    var result = {};
    for (var x = 0; x < list.length; x++) {
      result[list[x].replace(/-/g, "_")] = list[x];
    }
    return result;
  }
  function reserved_word(token, word) {
    return token && token.type === TOKEN.RESERVED && token.text === word;
  }
  function reserved_array(token, words) {
    return token && token.type === TOKEN.RESERVED && in_array(token.text, words);
  }
  var special_words = ["case", "return", "do", "if", "throw", "else", "await", "break", "continue", "async"];
  var validPositionValues = ["before-newline", "after-newline", "preserve-newline"];
  var OPERATOR_POSITION = generateMapFromStrings(validPositionValues);
  var OPERATOR_POSITION_BEFORE_OR_PRESERVE = [OPERATOR_POSITION.before_newline, OPERATOR_POSITION.preserve_newline];
  var MODE = {
    BlockStatement: "BlockStatement",
    Statement: "Statement",
    ObjectLiteral: "ObjectLiteral",
    ArrayLiteral: "ArrayLiteral",
    ForInitializer: "ForInitializer",
    Conditional: "Conditional",
    Expression: "Expression"
  };
  function remove_redundant_indentation(output, frame) {
    if (frame.multiline_frame || frame.mode === MODE.ForInitializer || frame.mode === MODE.Conditional) {
      return;
    }
    output.remove_indent(frame.start_line_index);
  }
  function split_linebreaks(s) {
    s = s.replace(acorn.allLineBreaks, "\n");
    var out = [], idx = s.indexOf("\n");
    while (idx !== -1) {
      out.push(s.substring(0, idx));
      s = s.substring(idx + 1);
      idx = s.indexOf("\n");
    }
    if (s.length) {
      out.push(s);
    }
    return out;
  }
  function is_array(mode) {
    return mode === MODE.ArrayLiteral;
  }
  function is_expression(mode) {
    return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional]);
  }
  function all_lines_start_with(lines, c) {
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line.charAt(0) !== c) {
        return false;
      }
    }
    return true;
  }
  function each_line_matches_indent(lines, indent) {
    var i = 0, len = lines.length, line;
    for (; i < len; i++) {
      line = lines[i];
      if (line && line.indexOf(indent) !== 0) {
        return false;
      }
    }
    return true;
  }
  function Beautifier(source_text, options) {
    options = options || {};
    this._source_text = source_text || "";
    this._output = null;
    this._tokens = null;
    this._last_last_text = null;
    this._flags = null;
    this._previous_flags = null;
    this._flag_store = null;
    this._options = new Options(options);
  }
  Beautifier.prototype.create_flags = function(flags_base, mode) {
    var next_indent_level = 0;
    if (flags_base) {
      next_indent_level = flags_base.indentation_level;
      if (!this._output.just_added_newline() && flags_base.line_indent_level > next_indent_level) {
        next_indent_level = flags_base.line_indent_level;
      }
    }
    var next_flags = {
      mode,
      parent: flags_base,
      last_token: flags_base ? flags_base.last_token : new Token(TOKEN.START_BLOCK, ""),
      last_word: flags_base ? flags_base.last_word : "",
      declaration_statement: false,
      declaration_assignment: false,
      multiline_frame: false,
      inline_frame: false,
      if_block: false,
      else_block: false,
      do_block: false,
      do_while: false,
      import_block: false,
      in_case_statement: false,
      in_case: false,
      case_body: false,
      indentation_level: next_indent_level,
      alignment: 0,
      line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
      start_line_index: this._output.get_line_number(),
      ternary_depth: 0
    };
    return next_flags;
  };
  Beautifier.prototype._reset = function(source_text) {
    var baseIndentString = source_text.match(/^[\t ]*/)[0];
    this._last_last_text = "";
    this._output = new Output(this._options, baseIndentString);
    this._output.raw = this._options.test_output_raw;
    this._flag_store = [];
    this.set_mode(MODE.BlockStatement);
    var tokenizer = new Tokenizer(source_text, this._options);
    this._tokens = tokenizer.tokenize();
    return source_text;
  };
  Beautifier.prototype.beautify = function() {
    if (this._options.disabled) {
      return this._source_text;
    }
    var sweet_code;
    var source_text = this._reset(this._source_text);
    var eol = this._options.eol;
    if (this._options.eol === "auto") {
      eol = "\n";
      if (source_text && acorn.lineBreak.test(source_text || "")) {
        eol = source_text.match(acorn.lineBreak)[0];
      }
    }
    var current_token = this._tokens.next();
    while (current_token) {
      this.handle_token(current_token);
      this._last_last_text = this._flags.last_token.text;
      this._flags.last_token = current_token;
      current_token = this._tokens.next();
    }
    sweet_code = this._output.get_code(eol);
    return sweet_code;
  };
  Beautifier.prototype.handle_token = function(current_token, preserve_statement_flags) {
    if (current_token.type === TOKEN.START_EXPR) {
      this.handle_start_expr(current_token);
    } else if (current_token.type === TOKEN.END_EXPR) {
      this.handle_end_expr(current_token);
    } else if (current_token.type === TOKEN.START_BLOCK) {
      this.handle_start_block(current_token);
    } else if (current_token.type === TOKEN.END_BLOCK) {
      this.handle_end_block(current_token);
    } else if (current_token.type === TOKEN.WORD) {
      this.handle_word(current_token);
    } else if (current_token.type === TOKEN.RESERVED) {
      this.handle_word(current_token);
    } else if (current_token.type === TOKEN.SEMICOLON) {
      this.handle_semicolon(current_token);
    } else if (current_token.type === TOKEN.STRING) {
      this.handle_string(current_token);
    } else if (current_token.type === TOKEN.EQUALS) {
      this.handle_equals(current_token);
    } else if (current_token.type === TOKEN.OPERATOR) {
      this.handle_operator(current_token);
    } else if (current_token.type === TOKEN.COMMA) {
      this.handle_comma(current_token);
    } else if (current_token.type === TOKEN.BLOCK_COMMENT) {
      this.handle_block_comment(current_token, preserve_statement_flags);
    } else if (current_token.type === TOKEN.COMMENT) {
      this.handle_comment(current_token, preserve_statement_flags);
    } else if (current_token.type === TOKEN.DOT) {
      this.handle_dot(current_token);
    } else if (current_token.type === TOKEN.EOF) {
      this.handle_eof(current_token);
    } else if (current_token.type === TOKEN.UNKNOWN) {
      this.handle_unknown(current_token, preserve_statement_flags);
    } else {
      this.handle_unknown(current_token, preserve_statement_flags);
    }
  };
  Beautifier.prototype.handle_whitespace_and_comments = function(current_token, preserve_statement_flags) {
    var newlines = current_token.newlines;
    var keep_whitespace = this._options.keep_array_indentation && is_array(this._flags.mode);
    if (current_token.comments_before) {
      var comment_token = current_token.comments_before.next();
      while (comment_token) {
        this.handle_whitespace_and_comments(comment_token, preserve_statement_flags);
        this.handle_token(comment_token, preserve_statement_flags);
        comment_token = current_token.comments_before.next();
      }
    }
    if (keep_whitespace) {
      for (var i = 0; i < newlines; i += 1) {
        this.print_newline(i > 0, preserve_statement_flags);
      }
    } else {
      if (this._options.max_preserve_newlines && newlines > this._options.max_preserve_newlines) {
        newlines = this._options.max_preserve_newlines;
      }
      if (this._options.preserve_newlines) {
        if (newlines > 1) {
          this.print_newline(false, preserve_statement_flags);
          for (var j = 1; j < newlines; j += 1) {
            this.print_newline(true, preserve_statement_flags);
          }
        }
      }
    }
  };
  var newline_restricted_tokens = ["async", "break", "continue", "return", "throw", "yield"];
  Beautifier.prototype.allow_wrap_or_preserved_newline = function(current_token, force_linewrap) {
    force_linewrap = force_linewrap === void 0 ? false : force_linewrap;
    if (this._output.just_added_newline()) {
      return;
    }
    var shouldPreserveOrForce = this._options.preserve_newlines && current_token.newlines || force_linewrap;
    var operatorLogicApplies = in_array(this._flags.last_token.text, positionable_operators) || in_array(current_token.text, positionable_operators);
    if (operatorLogicApplies) {
      var shouldPrintOperatorNewline = in_array(this._flags.last_token.text, positionable_operators) && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE) || in_array(current_token.text, positionable_operators);
      shouldPreserveOrForce = shouldPreserveOrForce && shouldPrintOperatorNewline;
    }
    if (shouldPreserveOrForce) {
      this.print_newline(false, true);
    } else if (this._options.wrap_line_length) {
      if (reserved_array(this._flags.last_token, newline_restricted_tokens)) {
        return;
      }
      this._output.set_wrap_point();
    }
  };
  Beautifier.prototype.print_newline = function(force_newline, preserve_statement_flags) {
    if (!preserve_statement_flags) {
      if (this._flags.last_token.text !== ";" && this._flags.last_token.text !== "," && this._flags.last_token.text !== "=" && (this._flags.last_token.type !== TOKEN.OPERATOR || this._flags.last_token.text === "--" || this._flags.last_token.text === "++")) {
        var next_token = this._tokens.peek();
        while (this._flags.mode === MODE.Statement && !(this._flags.if_block && reserved_word(next_token, "else")) && !this._flags.do_block) {
          this.restore_mode();
        }
      }
    }
    if (this._output.add_new_line(force_newline)) {
      this._flags.multiline_frame = true;
    }
  };
  Beautifier.prototype.print_token_line_indentation = function(current_token) {
    if (this._output.just_added_newline()) {
      if (this._options.keep_array_indentation && current_token.newlines && (current_token.text === "[" || is_array(this._flags.mode))) {
        this._output.current_line.set_indent(-1);
        this._output.current_line.push(current_token.whitespace_before);
        this._output.space_before_token = false;
      } else if (this._output.set_indent(this._flags.indentation_level, this._flags.alignment)) {
        this._flags.line_indent_level = this._flags.indentation_level;
      }
    }
  };
  Beautifier.prototype.print_token = function(current_token) {
    if (this._output.raw) {
      this._output.add_raw_token(current_token);
      return;
    }
    if (this._options.comma_first && current_token.previous && current_token.previous.type === TOKEN.COMMA && this._output.just_added_newline()) {
      if (this._output.previous_line.last() === ",") {
        var popped = this._output.previous_line.pop();
        if (this._output.previous_line.is_empty()) {
          this._output.previous_line.push(popped);
          this._output.trim(true);
          this._output.current_line.pop();
          this._output.trim();
        }
        this.print_token_line_indentation(current_token);
        this._output.add_token(",");
        this._output.space_before_token = true;
      }
    }
    this.print_token_line_indentation(current_token);
    this._output.non_breaking_space = true;
    this._output.add_token(current_token.text);
    if (this._output.previous_token_wrapped) {
      this._flags.multiline_frame = true;
    }
  };
  Beautifier.prototype.indent = function() {
    this._flags.indentation_level += 1;
    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  };
  Beautifier.prototype.deindent = function() {
    if (this._flags.indentation_level > 0 && (!this._flags.parent || this._flags.indentation_level > this._flags.parent.indentation_level)) {
      this._flags.indentation_level -= 1;
      this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
    }
  };
  Beautifier.prototype.set_mode = function(mode) {
    if (this._flags) {
      this._flag_store.push(this._flags);
      this._previous_flags = this._flags;
    } else {
      this._previous_flags = this.create_flags(null, mode);
    }
    this._flags = this.create_flags(this._previous_flags, mode);
    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  };
  Beautifier.prototype.restore_mode = function() {
    if (this._flag_store.length > 0) {
      this._previous_flags = this._flags;
      this._flags = this._flag_store.pop();
      if (this._previous_flags.mode === MODE.Statement) {
        remove_redundant_indentation(this._output, this._previous_flags);
      }
      this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
    }
  };
  Beautifier.prototype.start_of_object_property = function() {
    return this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement && (this._flags.last_token.text === ":" && this._flags.ternary_depth === 0 || reserved_array(this._flags.last_token, ["get", "set"]));
  };
  Beautifier.prototype.start_of_statement = function(current_token) {
    var start = false;
    start = start || reserved_array(this._flags.last_token, ["var", "let", "const"]) && current_token.type === TOKEN.WORD;
    start = start || reserved_word(this._flags.last_token, "do");
    start = start || !(this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement) && reserved_array(this._flags.last_token, newline_restricted_tokens) && !current_token.newlines;
    start = start || reserved_word(this._flags.last_token, "else") && !(reserved_word(current_token, "if") && !current_token.comments_before);
    start = start || this._flags.last_token.type === TOKEN.END_EXPR && (this._previous_flags.mode === MODE.ForInitializer || this._previous_flags.mode === MODE.Conditional);
    start = start || this._flags.last_token.type === TOKEN.WORD && this._flags.mode === MODE.BlockStatement && !this._flags.in_case && !(current_token.text === "--" || current_token.text === "++") && this._last_last_text !== "function" && current_token.type !== TOKEN.WORD && current_token.type !== TOKEN.RESERVED;
    start = start || this._flags.mode === MODE.ObjectLiteral && (this._flags.last_token.text === ":" && this._flags.ternary_depth === 0 || reserved_array(this._flags.last_token, ["get", "set"]));
    if (start) {
      this.set_mode(MODE.Statement);
      this.indent();
      this.handle_whitespace_and_comments(current_token, true);
      if (!this.start_of_object_property()) {
        this.allow_wrap_or_preserved_newline(current_token, reserved_array(current_token, ["do", "for", "if", "while"]));
      }
      return true;
    }
    return false;
  };
  Beautifier.prototype.handle_start_expr = function(current_token) {
    if (!this.start_of_statement(current_token)) {
      this.handle_whitespace_and_comments(current_token);
    }
    var next_mode = MODE.Expression;
    if (current_token.text === "[") {
      if (this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === ")") {
        if (reserved_array(this._flags.last_token, line_starters)) {
          this._output.space_before_token = true;
        }
        this.print_token(current_token);
        this.set_mode(next_mode);
        this.indent();
        if (this._options.space_in_paren) {
          this._output.space_before_token = true;
        }
        return;
      }
      next_mode = MODE.ArrayLiteral;
      if (is_array(this._flags.mode)) {
        if (this._flags.last_token.text === "[" || this._flags.last_token.text === "," && (this._last_last_text === "]" || this._last_last_text === "}")) {
          if (!this._options.keep_array_indentation) {
            this.print_newline();
          }
        }
      }
      if (!in_array(this._flags.last_token.type, [TOKEN.START_EXPR, TOKEN.END_EXPR, TOKEN.WORD, TOKEN.OPERATOR])) {
        this._output.space_before_token = true;
      }
    } else {
      if (this._flags.last_token.type === TOKEN.RESERVED) {
        if (this._flags.last_token.text === "for") {
          this._output.space_before_token = this._options.space_before_conditional;
          next_mode = MODE.ForInitializer;
        } else if (in_array(this._flags.last_token.text, ["if", "while"])) {
          this._output.space_before_token = this._options.space_before_conditional;
          next_mode = MODE.Conditional;
        } else if (in_array(this._flags.last_word, ["await", "async"])) {
          this._output.space_before_token = true;
        } else if (this._flags.last_token.text === "import" && current_token.whitespace_before === "") {
          this._output.space_before_token = false;
        } else if (in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === "catch") {
          this._output.space_before_token = true;
        }
      } else if (this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
        if (!this.start_of_object_property()) {
          this.allow_wrap_or_preserved_newline(current_token);
        }
      } else if (this._flags.last_token.type === TOKEN.WORD) {
        this._output.space_before_token = false;
        var peek_back_two = this._tokens.peek(-3);
        if (this._options.space_after_named_function && peek_back_two) {
          var peek_back_three = this._tokens.peek(-4);
          if (reserved_array(peek_back_two, ["async", "function"]) || peek_back_two.text === "*" && reserved_array(peek_back_three, ["async", "function"])) {
            this._output.space_before_token = true;
          } else if (this._flags.mode === MODE.ObjectLiteral) {
            if (peek_back_two.text === "{" || peek_back_two.text === "," || peek_back_two.text === "*" && (peek_back_three.text === "{" || peek_back_three.text === ",")) {
              this._output.space_before_token = true;
            }
          }
        }
      } else {
        this.allow_wrap_or_preserved_newline(current_token);
      }
      if (this._flags.last_token.type === TOKEN.RESERVED && (this._flags.last_word === "function" || this._flags.last_word === "typeof") || this._flags.last_token.text === "*" && (in_array(this._last_last_text, ["function", "yield"]) || this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ["{", ","]))) {
        this._output.space_before_token = this._options.space_after_anon_function;
      }
    }
    if (this._flags.last_token.text === ";" || this._flags.last_token.type === TOKEN.START_BLOCK) {
      this.print_newline();
    } else if (this._flags.last_token.type === TOKEN.END_EXPR || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.END_BLOCK || this._flags.last_token.text === "." || this._flags.last_token.type === TOKEN.COMMA) {
      this.allow_wrap_or_preserved_newline(current_token, current_token.newlines);
    }
    this.print_token(current_token);
    this.set_mode(next_mode);
    if (this._options.space_in_paren) {
      this._output.space_before_token = true;
    }
    this.indent();
  };
  Beautifier.prototype.handle_end_expr = function(current_token) {
    while (this._flags.mode === MODE.Statement) {
      this.restore_mode();
    }
    this.handle_whitespace_and_comments(current_token);
    if (this._flags.multiline_frame) {
      this.allow_wrap_or_preserved_newline(current_token, current_token.text === "]" && is_array(this._flags.mode) && !this._options.keep_array_indentation);
    }
    if (this._options.space_in_paren) {
      if (this._flags.last_token.type === TOKEN.START_EXPR && !this._options.space_in_empty_paren) {
        this._output.trim();
        this._output.space_before_token = false;
      } else {
        this._output.space_before_token = true;
      }
    }
    this.deindent();
    this.print_token(current_token);
    this.restore_mode();
    remove_redundant_indentation(this._output, this._previous_flags);
    if (this._flags.do_while && this._previous_flags.mode === MODE.Conditional) {
      this._previous_flags.mode = MODE.Expression;
      this._flags.do_block = false;
      this._flags.do_while = false;
    }
  };
  Beautifier.prototype.handle_start_block = function(current_token) {
    this.handle_whitespace_and_comments(current_token);
    var next_token = this._tokens.peek();
    var second_token = this._tokens.peek(1);
    if (this._flags.last_word === "switch" && this._flags.last_token.type === TOKEN.END_EXPR) {
      this.set_mode(MODE.BlockStatement);
      this._flags.in_case_statement = true;
    } else if (this._flags.case_body) {
      this.set_mode(MODE.BlockStatement);
    } else if (second_token && (in_array(second_token.text, [":", ","]) && in_array(next_token.type, [TOKEN.STRING, TOKEN.WORD, TOKEN.RESERVED]) || in_array(next_token.text, ["get", "set", "..."]) && in_array(second_token.type, [TOKEN.WORD, TOKEN.RESERVED]))) {
      if (!in_array(this._last_last_text, ["class", "interface"])) {
        this.set_mode(MODE.ObjectLiteral);
      } else {
        this.set_mode(MODE.BlockStatement);
      }
    } else if (this._flags.last_token.type === TOKEN.OPERATOR && this._flags.last_token.text === "=>") {
      this.set_mode(MODE.BlockStatement);
    } else if (in_array(this._flags.last_token.type, [TOKEN.EQUALS, TOKEN.START_EXPR, TOKEN.COMMA, TOKEN.OPERATOR]) || reserved_array(this._flags.last_token, ["return", "throw", "import", "default"])) {
      this.set_mode(MODE.ObjectLiteral);
    } else {
      this.set_mode(MODE.BlockStatement);
    }
    var empty_braces = !next_token.comments_before && next_token.text === "}";
    var empty_anonymous_function = empty_braces && this._flags.last_word === "function" && this._flags.last_token.type === TOKEN.END_EXPR;
    if (this._options.brace_preserve_inline) {
      var index = 0;
      var check_token = null;
      this._flags.inline_frame = true;
      do {
        index += 1;
        check_token = this._tokens.peek(index - 1);
        if (check_token.newlines) {
          this._flags.inline_frame = false;
          break;
        }
      } while (check_token.type !== TOKEN.EOF && !(check_token.type === TOKEN.END_BLOCK && check_token.opened === current_token));
    }
    if ((this._options.brace_style === "expand" || this._options.brace_style === "none" && current_token.newlines) && !this._flags.inline_frame) {
      if (this._flags.last_token.type !== TOKEN.OPERATOR && (empty_anonymous_function || this._flags.last_token.type === TOKEN.EQUALS || reserved_array(this._flags.last_token, special_words) && this._flags.last_token.text !== "else")) {
        this._output.space_before_token = true;
      } else {
        this.print_newline(false, true);
      }
    } else {
      if (is_array(this._previous_flags.mode) && (this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.COMMA)) {
        if (this._flags.last_token.type === TOKEN.COMMA || this._options.space_in_paren) {
          this._output.space_before_token = true;
        }
        if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR && this._flags.inline_frame) {
          this.allow_wrap_or_preserved_newline(current_token);
          this._previous_flags.multiline_frame = this._previous_flags.multiline_frame || this._flags.multiline_frame;
          this._flags.multiline_frame = false;
        }
      }
      if (this._flags.last_token.type !== TOKEN.OPERATOR && this._flags.last_token.type !== TOKEN.START_EXPR) {
        if (this._flags.last_token.type === TOKEN.START_BLOCK && !this._flags.inline_frame) {
          this.print_newline();
        } else {
          this._output.space_before_token = true;
        }
      }
    }
    this.print_token(current_token);
    this.indent();
    if (!empty_braces && !(this._options.brace_preserve_inline && this._flags.inline_frame)) {
      this.print_newline();
    }
  };
  Beautifier.prototype.handle_end_block = function(current_token) {
    this.handle_whitespace_and_comments(current_token);
    while (this._flags.mode === MODE.Statement) {
      this.restore_mode();
    }
    var empty_braces = this._flags.last_token.type === TOKEN.START_BLOCK;
    if (this._flags.inline_frame && !empty_braces) {
      this._output.space_before_token = true;
    } else if (this._options.brace_style === "expand") {
      if (!empty_braces) {
        this.print_newline();
      }
    } else {
      if (!empty_braces) {
        if (is_array(this._flags.mode) && this._options.keep_array_indentation) {
          this._options.keep_array_indentation = false;
          this.print_newline();
          this._options.keep_array_indentation = true;
        } else {
          this.print_newline();
        }
      }
    }
    this.restore_mode();
    this.print_token(current_token);
  };
  Beautifier.prototype.handle_word = function(current_token) {
    if (current_token.type === TOKEN.RESERVED) {
      if (in_array(current_token.text, ["set", "get"]) && this._flags.mode !== MODE.ObjectLiteral) {
        current_token.type = TOKEN.WORD;
      } else if (current_token.text === "import" && this._tokens.peek().text === "(") {
        current_token.type = TOKEN.WORD;
      } else if (in_array(current_token.text, ["as", "from"]) && !this._flags.import_block) {
        current_token.type = TOKEN.WORD;
      } else if (this._flags.mode === MODE.ObjectLiteral) {
        var next_token = this._tokens.peek();
        if (next_token.text === ":") {
          current_token.type = TOKEN.WORD;
        }
      }
    }
    if (this.start_of_statement(current_token)) {
      if (reserved_array(this._flags.last_token, ["var", "let", "const"]) && current_token.type === TOKEN.WORD) {
        this._flags.declaration_statement = true;
      }
    } else if (current_token.newlines && !is_expression(this._flags.mode) && (this._flags.last_token.type !== TOKEN.OPERATOR || (this._flags.last_token.text === "--" || this._flags.last_token.text === "++")) && this._flags.last_token.type !== TOKEN.EQUALS && (this._options.preserve_newlines || !reserved_array(this._flags.last_token, ["var", "let", "const", "set", "get"]))) {
      this.handle_whitespace_and_comments(current_token);
      this.print_newline();
    } else {
      this.handle_whitespace_and_comments(current_token);
    }
    if (this._flags.do_block && !this._flags.do_while) {
      if (reserved_word(current_token, "while")) {
        this._output.space_before_token = true;
        this.print_token(current_token);
        this._output.space_before_token = true;
        this._flags.do_while = true;
        return;
      } else {
        this.print_newline();
        this._flags.do_block = false;
      }
    }
    if (this._flags.if_block) {
      if (!this._flags.else_block && reserved_word(current_token, "else")) {
        this._flags.else_block = true;
      } else {
        while (this._flags.mode === MODE.Statement) {
          this.restore_mode();
        }
        this._flags.if_block = false;
        this._flags.else_block = false;
      }
    }
    if (this._flags.in_case_statement && reserved_array(current_token, ["case", "default"])) {
      this.print_newline();
      if (this._flags.last_token.type !== TOKEN.END_BLOCK && (this._flags.case_body || this._options.jslint_happy)) {
        this.deindent();
      }
      this._flags.case_body = false;
      this.print_token(current_token);
      this._flags.in_case = true;
      return;
    }
    if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
      if (!this.start_of_object_property()) {
        this.allow_wrap_or_preserved_newline(current_token);
      }
    }
    if (reserved_word(current_token, "function")) {
      if (in_array(this._flags.last_token.text, ["}", ";"]) || this._output.just_added_newline() && !(in_array(this._flags.last_token.text, ["(", "[", "{", ":", "=", ","]) || this._flags.last_token.type === TOKEN.OPERATOR)) {
        if (!this._output.just_added_blankline() && !current_token.comments_before) {
          this.print_newline();
          this.print_newline(true);
        }
      }
      if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD) {
        if (reserved_array(this._flags.last_token, ["get", "set", "new", "export"]) || reserved_array(this._flags.last_token, newline_restricted_tokens)) {
          this._output.space_before_token = true;
        } else if (reserved_word(this._flags.last_token, "default") && this._last_last_text === "export") {
          this._output.space_before_token = true;
        } else if (this._flags.last_token.text === "declare") {
          this._output.space_before_token = true;
        } else {
          this.print_newline();
        }
      } else if (this._flags.last_token.type === TOKEN.OPERATOR || this._flags.last_token.text === "=") {
        this._output.space_before_token = true;
      } else if (!this._flags.multiline_frame && (is_expression(this._flags.mode) || is_array(this._flags.mode))) {
      } else {
        this.print_newline();
      }
      this.print_token(current_token);
      this._flags.last_word = current_token.text;
      return;
    }
    var prefix = "NONE";
    if (this._flags.last_token.type === TOKEN.END_BLOCK) {
      if (this._previous_flags.inline_frame) {
        prefix = "SPACE";
      } else if (!reserved_array(current_token, ["else", "catch", "finally", "from"])) {
        prefix = "NEWLINE";
      } else {
        if (this._options.brace_style === "expand" || this._options.brace_style === "end-expand" || this._options.brace_style === "none" && current_token.newlines) {
          prefix = "NEWLINE";
        } else {
          prefix = "SPACE";
          this._output.space_before_token = true;
        }
      }
    } else if (this._flags.last_token.type === TOKEN.SEMICOLON && this._flags.mode === MODE.BlockStatement) {
      prefix = "NEWLINE";
    } else if (this._flags.last_token.type === TOKEN.SEMICOLON && is_expression(this._flags.mode)) {
      prefix = "SPACE";
    } else if (this._flags.last_token.type === TOKEN.STRING) {
      prefix = "NEWLINE";
    } else if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === "*" && (in_array(this._last_last_text, ["function", "yield"]) || this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ["{", ","]))) {
      prefix = "SPACE";
    } else if (this._flags.last_token.type === TOKEN.START_BLOCK) {
      if (this._flags.inline_frame) {
        prefix = "SPACE";
      } else {
        prefix = "NEWLINE";
      }
    } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
      this._output.space_before_token = true;
      prefix = "NEWLINE";
    }
    if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ")") {
      if (this._flags.inline_frame || this._flags.last_token.text === "else" || this._flags.last_token.text === "export") {
        prefix = "SPACE";
      } else {
        prefix = "NEWLINE";
      }
    }
    if (reserved_array(current_token, ["else", "catch", "finally"])) {
      if ((!(this._flags.last_token.type === TOKEN.END_BLOCK && this._previous_flags.mode === MODE.BlockStatement) || this._options.brace_style === "expand" || this._options.brace_style === "end-expand" || this._options.brace_style === "none" && current_token.newlines) && !this._flags.inline_frame) {
        this.print_newline();
      } else {
        this._output.trim(true);
        var line = this._output.current_line;
        if (line.last() !== "}") {
          this.print_newline();
        }
        this._output.space_before_token = true;
      }
    } else if (prefix === "NEWLINE") {
      if (reserved_array(this._flags.last_token, special_words)) {
        this._output.space_before_token = true;
      } else if (this._flags.last_token.text === "declare" && reserved_array(current_token, ["var", "let", "const"])) {
        this._output.space_before_token = true;
      } else if (this._flags.last_token.type !== TOKEN.END_EXPR) {
        if ((this._flags.last_token.type !== TOKEN.START_EXPR || !reserved_array(current_token, ["var", "let", "const"])) && this._flags.last_token.text !== ":") {
          if (reserved_word(current_token, "if") && reserved_word(current_token.previous, "else")) {
            this._output.space_before_token = true;
          } else {
            this.print_newline();
          }
        }
      } else if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ")") {
        this.print_newline();
      }
    } else if (this._flags.multiline_frame && is_array(this._flags.mode) && this._flags.last_token.text === "," && this._last_last_text === "}") {
      this.print_newline();
    } else if (prefix === "SPACE") {
      this._output.space_before_token = true;
    }
    if (current_token.previous && (current_token.previous.type === TOKEN.WORD || current_token.previous.type === TOKEN.RESERVED)) {
      this._output.space_before_token = true;
    }
    this.print_token(current_token);
    this._flags.last_word = current_token.text;
    if (current_token.type === TOKEN.RESERVED) {
      if (current_token.text === "do") {
        this._flags.do_block = true;
      } else if (current_token.text === "if") {
        this._flags.if_block = true;
      } else if (current_token.text === "import") {
        this._flags.import_block = true;
      } else if (this._flags.import_block && reserved_word(current_token, "from")) {
        this._flags.import_block = false;
      }
    }
  };
  Beautifier.prototype.handle_semicolon = function(current_token) {
    if (this.start_of_statement(current_token)) {
      this._output.space_before_token = false;
    } else {
      this.handle_whitespace_and_comments(current_token);
    }
    var next_token = this._tokens.peek();
    while (this._flags.mode === MODE.Statement && !(this._flags.if_block && reserved_word(next_token, "else")) && !this._flags.do_block) {
      this.restore_mode();
    }
    if (this._flags.import_block) {
      this._flags.import_block = false;
    }
    this.print_token(current_token);
  };
  Beautifier.prototype.handle_string = function(current_token) {
    if (current_token.text.startsWith("`") && current_token.newlines === 0 && current_token.whitespace_before === "" && (current_token.previous.text === ")" || this._flags.last_token.type === TOKEN.WORD)) {
    } else if (this.start_of_statement(current_token)) {
      this._output.space_before_token = true;
    } else {
      this.handle_whitespace_and_comments(current_token);
      if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.inline_frame) {
        this._output.space_before_token = true;
      } else if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
        if (!this.start_of_object_property()) {
          this.allow_wrap_or_preserved_newline(current_token);
        }
      } else if (current_token.text.startsWith("`") && this._flags.last_token.type === TOKEN.END_EXPR && (current_token.previous.text === "]" || current_token.previous.text === ")") && current_token.newlines === 0) {
        this._output.space_before_token = true;
      } else {
        this.print_newline();
      }
    }
    this.print_token(current_token);
  };
  Beautifier.prototype.handle_equals = function(current_token) {
    if (this.start_of_statement(current_token)) {
    } else {
      this.handle_whitespace_and_comments(current_token);
    }
    if (this._flags.declaration_statement) {
      this._flags.declaration_assignment = true;
    }
    this._output.space_before_token = true;
    this.print_token(current_token);
    this._output.space_before_token = true;
  };
  Beautifier.prototype.handle_comma = function(current_token) {
    this.handle_whitespace_and_comments(current_token, true);
    this.print_token(current_token);
    this._output.space_before_token = true;
    if (this._flags.declaration_statement) {
      if (is_expression(this._flags.parent.mode)) {
        this._flags.declaration_assignment = false;
      }
      if (this._flags.declaration_assignment) {
        this._flags.declaration_assignment = false;
        this.print_newline(false, true);
      } else if (this._options.comma_first) {
        this.allow_wrap_or_preserved_newline(current_token);
      }
    } else if (this._flags.mode === MODE.ObjectLiteral || this._flags.mode === MODE.Statement && this._flags.parent.mode === MODE.ObjectLiteral) {
      if (this._flags.mode === MODE.Statement) {
        this.restore_mode();
      }
      if (!this._flags.inline_frame) {
        this.print_newline();
      }
    } else if (this._options.comma_first) {
      this.allow_wrap_or_preserved_newline(current_token);
    }
  };
  Beautifier.prototype.handle_operator = function(current_token) {
    var isGeneratorAsterisk = current_token.text === "*" && (reserved_array(this._flags.last_token, ["function", "yield"]) || in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.COMMA, TOKEN.END_BLOCK, TOKEN.SEMICOLON]));
    var isUnary = in_array(current_token.text, ["-", "+"]) && (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.START_EXPR, TOKEN.EQUALS, TOKEN.OPERATOR]) || in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === ",");
    if (this.start_of_statement(current_token)) {
    } else {
      var preserve_statement_flags = !isGeneratorAsterisk;
      this.handle_whitespace_and_comments(current_token, preserve_statement_flags);
    }
    if (reserved_array(this._flags.last_token, special_words)) {
      this._output.space_before_token = true;
      this.print_token(current_token);
      return;
    }
    if (current_token.text === "*" && this._flags.last_token.type === TOKEN.DOT) {
      this.print_token(current_token);
      return;
    }
    if (current_token.text === "::") {
      this.print_token(current_token);
      return;
    }
    if (this._flags.last_token.type === TOKEN.OPERATOR && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)) {
      this.allow_wrap_or_preserved_newline(current_token);
    }
    if (current_token.text === ":" && this._flags.in_case) {
      this.print_token(current_token);
      this._flags.in_case = false;
      this._flags.case_body = true;
      if (this._tokens.peek().type !== TOKEN.START_BLOCK) {
        this.indent();
        this.print_newline();
      } else {
        this._output.space_before_token = true;
      }
      return;
    }
    var space_before = true;
    var space_after = true;
    var in_ternary = false;
    if (current_token.text === ":") {
      if (this._flags.ternary_depth === 0) {
        space_before = false;
      } else {
        this._flags.ternary_depth -= 1;
        in_ternary = true;
      }
    } else if (current_token.text === "?") {
      this._flags.ternary_depth += 1;
    }
    if (!isUnary && !isGeneratorAsterisk && this._options.preserve_newlines && in_array(current_token.text, positionable_operators)) {
      var isColon = current_token.text === ":";
      var isTernaryColon = isColon && in_ternary;
      var isOtherColon = isColon && !in_ternary;
      switch (this._options.operator_position) {
        case OPERATOR_POSITION.before_newline:
          this._output.space_before_token = !isOtherColon;
          this.print_token(current_token);
          if (!isColon || isTernaryColon) {
            this.allow_wrap_or_preserved_newline(current_token);
          }
          this._output.space_before_token = true;
          return;
        case OPERATOR_POSITION.after_newline:
          this._output.space_before_token = true;
          if (!isColon || isTernaryColon) {
            if (this._tokens.peek().newlines) {
              this.print_newline(false, true);
            } else {
              this.allow_wrap_or_preserved_newline(current_token);
            }
          } else {
            this._output.space_before_token = false;
          }
          this.print_token(current_token);
          this._output.space_before_token = true;
          return;
        case OPERATOR_POSITION.preserve_newline:
          if (!isOtherColon) {
            this.allow_wrap_or_preserved_newline(current_token);
          }
          space_before = !(this._output.just_added_newline() || isOtherColon);
          this._output.space_before_token = space_before;
          this.print_token(current_token);
          this._output.space_before_token = true;
          return;
      }
    }
    if (isGeneratorAsterisk) {
      this.allow_wrap_or_preserved_newline(current_token);
      space_before = false;
      var next_token = this._tokens.peek();
      space_after = next_token && in_array(next_token.type, [TOKEN.WORD, TOKEN.RESERVED]);
    } else if (current_token.text === "...") {
      this.allow_wrap_or_preserved_newline(current_token);
      space_before = this._flags.last_token.type === TOKEN.START_BLOCK;
      space_after = false;
    } else if (in_array(current_token.text, ["--", "++", "!", "~"]) || isUnary) {
      if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR) {
        this.allow_wrap_or_preserved_newline(current_token);
      }
      space_before = false;
      space_after = false;
      if (current_token.newlines && (current_token.text === "--" || current_token.text === "++")) {
        this.print_newline(false, true);
      }
      if (this._flags.last_token.text === ";" && is_expression(this._flags.mode)) {
        space_before = true;
      }
      if (this._flags.last_token.type === TOKEN.RESERVED) {
        space_before = true;
      } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
        space_before = !(this._flags.last_token.text === "]" && (current_token.text === "--" || current_token.text === "++"));
      } else if (this._flags.last_token.type === TOKEN.OPERATOR) {
        space_before = in_array(current_token.text, ["--", "-", "++", "+"]) && in_array(this._flags.last_token.text, ["--", "-", "++", "+"]);
        if (in_array(current_token.text, ["+", "-"]) && in_array(this._flags.last_token.text, ["--", "++"])) {
          space_after = true;
        }
      }
      if ((this._flags.mode === MODE.BlockStatement && !this._flags.inline_frame || this._flags.mode === MODE.Statement) && (this._flags.last_token.text === "{" || this._flags.last_token.text === ";")) {
        this.print_newline();
      }
    }
    this._output.space_before_token = this._output.space_before_token || space_before;
    this.print_token(current_token);
    this._output.space_before_token = space_after;
  };
  Beautifier.prototype.handle_block_comment = function(current_token, preserve_statement_flags) {
    if (this._output.raw) {
      this._output.add_raw_token(current_token);
      if (current_token.directives && current_token.directives.preserve === "end") {
        this._output.raw = this._options.test_output_raw;
      }
      return;
    }
    if (current_token.directives) {
      this.print_newline(false, preserve_statement_flags);
      this.print_token(current_token);
      if (current_token.directives.preserve === "start") {
        this._output.raw = true;
      }
      this.print_newline(false, true);
      return;
    }
    if (!acorn.newline.test(current_token.text) && !current_token.newlines) {
      this._output.space_before_token = true;
      this.print_token(current_token);
      this._output.space_before_token = true;
      return;
    } else {
      this.print_block_commment(current_token, preserve_statement_flags);
    }
  };
  Beautifier.prototype.print_block_commment = function(current_token, preserve_statement_flags) {
    var lines = split_linebreaks(current_token.text);
    var j;
    var javadoc = false;
    var starless = false;
    var lastIndent = current_token.whitespace_before;
    var lastIndentLength = lastIndent.length;
    this.print_newline(false, preserve_statement_flags);
    this.print_token_line_indentation(current_token);
    this._output.add_token(lines[0]);
    this.print_newline(false, preserve_statement_flags);
    if (lines.length > 1) {
      lines = lines.slice(1);
      javadoc = all_lines_start_with(lines, "*");
      starless = each_line_matches_indent(lines, lastIndent);
      if (javadoc) {
        this._flags.alignment = 1;
      }
      for (j = 0; j < lines.length; j++) {
        if (javadoc) {
          this.print_token_line_indentation(current_token);
          this._output.add_token(ltrim(lines[j]));
        } else if (starless && lines[j]) {
          this.print_token_line_indentation(current_token);
          this._output.add_token(lines[j].substring(lastIndentLength));
        } else {
          this._output.current_line.set_indent(-1);
          this._output.add_token(lines[j]);
        }
        this.print_newline(false, preserve_statement_flags);
      }
      this._flags.alignment = 0;
    }
  };
  Beautifier.prototype.handle_comment = function(current_token, preserve_statement_flags) {
    if (current_token.newlines) {
      this.print_newline(false, preserve_statement_flags);
    } else {
      this._output.trim(true);
    }
    this._output.space_before_token = true;
    this.print_token(current_token);
    this.print_newline(false, preserve_statement_flags);
  };
  Beautifier.prototype.handle_dot = function(current_token) {
    if (this.start_of_statement(current_token)) {
    } else {
      this.handle_whitespace_and_comments(current_token, true);
    }
    if (reserved_array(this._flags.last_token, special_words)) {
      this._output.space_before_token = false;
    } else {
      this.allow_wrap_or_preserved_newline(current_token, this._flags.last_token.text === ")" && this._options.break_chained_methods);
    }
    if (this._options.unindent_chained_methods && this._output.just_added_newline()) {
      this.deindent();
    }
    this.print_token(current_token);
  };
  Beautifier.prototype.handle_unknown = function(current_token, preserve_statement_flags) {
    this.print_token(current_token);
    if (current_token.text[current_token.text.length - 1] === "\n") {
      this.print_newline(false, preserve_statement_flags);
    }
  };
  Beautifier.prototype.handle_eof = function(current_token) {
    while (this._flags.mode === MODE.Statement) {
      this.restore_mode();
    }
    this.handle_whitespace_and_comments(current_token);
  };
  module2.exports.Beautifier = Beautifier;
});

// ../node_modules/js-beautify/js/src/javascript/index.js
var require_javascript = __commonJS((exports2, module2) => {
  "use strict";
  var Beautifier = require_beautifier().Beautifier;
  var Options = require_options2().Options;
  function js_beautify(js_source_text, options) {
    var beautifier = new Beautifier(js_source_text, options);
    return beautifier.beautify();
  }
  module2.exports = js_beautify;
  module2.exports.defaultOptions = function() {
    return new Options();
  };
});

// ../node_modules/js-beautify/js/src/css/options.js
var require_options3 = __commonJS((exports2, module2) => {
  "use strict";
  var BaseOptions = require_options().Options;
  function Options(options) {
    BaseOptions.call(this, options, "css");
    this.selector_separator_newline = this._get_boolean("selector_separator_newline", true);
    this.newline_between_rules = this._get_boolean("newline_between_rules", true);
    var space_around_selector_separator = this._get_boolean("space_around_selector_separator");
    this.space_around_combinator = this._get_boolean("space_around_combinator") || space_around_selector_separator;
    var brace_style_split = this._get_selection_list("brace_style", ["collapse", "expand", "end-expand", "none", "preserve-inline"]);
    this.brace_style = "collapse";
    for (var bs = 0; bs < brace_style_split.length; bs++) {
      if (brace_style_split[bs] !== "expand") {
        this.brace_style = "collapse";
      } else {
        this.brace_style = brace_style_split[bs];
      }
    }
  }
  Options.prototype = new BaseOptions();
  module2.exports.Options = Options;
});

// ../node_modules/js-beautify/js/src/css/beautifier.js
var require_beautifier2 = __commonJS((exports2, module2) => {
  "use strict";
  var Options = require_options3().Options;
  var Output = require_output().Output;
  var InputScanner = require_inputscanner().InputScanner;
  var Directives = require_directives().Directives;
  var directives_core = new Directives(/\/\*/, /\*\//);
  var lineBreak = /\r\n|[\r\n]/;
  var allLineBreaks = /\r\n|[\r\n]/g;
  var whitespaceChar = /\s/;
  var whitespacePattern = /(?:\s|\n)+/g;
  var block_comment_pattern = /\/\*(?:[\s\S]*?)((?:\*\/)|$)/g;
  var comment_pattern = /\/\/(?:[^\n\r\u2028\u2029]*)/g;
  function Beautifier(source_text, options) {
    this._source_text = source_text || "";
    this._options = new Options(options);
    this._ch = null;
    this._input = null;
    this.NESTED_AT_RULE = {
      "@page": true,
      "@font-face": true,
      "@keyframes": true,
      "@media": true,
      "@supports": true,
      "@document": true
    };
    this.CONDITIONAL_GROUP_RULE = {
      "@media": true,
      "@supports": true,
      "@document": true
    };
  }
  Beautifier.prototype.eatString = function(endChars) {
    var result = "";
    this._ch = this._input.next();
    while (this._ch) {
      result += this._ch;
      if (this._ch === "\\") {
        result += this._input.next();
      } else if (endChars.indexOf(this._ch) !== -1 || this._ch === "\n") {
        break;
      }
      this._ch = this._input.next();
    }
    return result;
  };
  Beautifier.prototype.eatWhitespace = function(allowAtLeastOneNewLine) {
    var result = whitespaceChar.test(this._input.peek());
    var newline_count = 0;
    while (whitespaceChar.test(this._input.peek())) {
      this._ch = this._input.next();
      if (allowAtLeastOneNewLine && this._ch === "\n") {
        if (newline_count === 0 || newline_count < this._options.max_preserve_newlines) {
          newline_count++;
          this._output.add_new_line(true);
        }
      }
    }
    return result;
  };
  Beautifier.prototype.foundNestedPseudoClass = function() {
    var openParen = 0;
    var i = 1;
    var ch = this._input.peek(i);
    while (ch) {
      if (ch === "{") {
        return true;
      } else if (ch === "(") {
        openParen += 1;
      } else if (ch === ")") {
        if (openParen === 0) {
          return false;
        }
        openParen -= 1;
      } else if (ch === ";" || ch === "}") {
        return false;
      }
      i++;
      ch = this._input.peek(i);
    }
    return false;
  };
  Beautifier.prototype.print_string = function(output_string) {
    this._output.set_indent(this._indentLevel);
    this._output.non_breaking_space = true;
    this._output.add_token(output_string);
  };
  Beautifier.prototype.preserveSingleSpace = function(isAfterSpace) {
    if (isAfterSpace) {
      this._output.space_before_token = true;
    }
  };
  Beautifier.prototype.indent = function() {
    this._indentLevel++;
  };
  Beautifier.prototype.outdent = function() {
    if (this._indentLevel > 0) {
      this._indentLevel--;
    }
  };
  Beautifier.prototype.beautify = function() {
    if (this._options.disabled) {
      return this._source_text;
    }
    var source_text = this._source_text;
    var eol = this._options.eol;
    if (eol === "auto") {
      eol = "\n";
      if (source_text && lineBreak.test(source_text || "")) {
        eol = source_text.match(lineBreak)[0];
      }
    }
    source_text = source_text.replace(allLineBreaks, "\n");
    var baseIndentString = source_text.match(/^[\t ]*/)[0];
    this._output = new Output(this._options, baseIndentString);
    this._input = new InputScanner(source_text);
    this._indentLevel = 0;
    this._nestedLevel = 0;
    this._ch = null;
    var parenLevel = 0;
    var insideRule = false;
    var insidePropertyValue = false;
    var enteringConditionalGroup = false;
    var insideAtExtend = false;
    var insideAtImport = false;
    var topCharacter = this._ch;
    var whitespace;
    var isAfterSpace;
    var previous_ch;
    while (true) {
      whitespace = this._input.read(whitespacePattern);
      isAfterSpace = whitespace !== "";
      previous_ch = topCharacter;
      this._ch = this._input.next();
      if (this._ch === "\\" && this._input.hasNext()) {
        this._ch += this._input.next();
      }
      topCharacter = this._ch;
      if (!this._ch) {
        break;
      } else if (this._ch === "/" && this._input.peek() === "*") {
        this._output.add_new_line();
        this._input.back();
        var comment = this._input.read(block_comment_pattern);
        var directives = directives_core.get_directives(comment);
        if (directives && directives.ignore === "start") {
          comment += directives_core.readIgnored(this._input);
        }
        this.print_string(comment);
        this.eatWhitespace(true);
        this._output.add_new_line();
      } else if (this._ch === "/" && this._input.peek() === "/") {
        this._output.space_before_token = true;
        this._input.back();
        this.print_string(this._input.read(comment_pattern));
        this.eatWhitespace(true);
      } else if (this._ch === "@") {
        this.preserveSingleSpace(isAfterSpace);
        if (this._input.peek() === "{") {
          this.print_string(this._ch + this.eatString("}"));
        } else {
          this.print_string(this._ch);
          var variableOrRule = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);
          if (variableOrRule.match(/[ :]$/)) {
            variableOrRule = this.eatString(": ").replace(/\s$/, "");
            this.print_string(variableOrRule);
            this._output.space_before_token = true;
          }
          variableOrRule = variableOrRule.replace(/\s$/, "");
          if (variableOrRule === "extend") {
            insideAtExtend = true;
          } else if (variableOrRule === "import") {
            insideAtImport = true;
          }
          if (variableOrRule in this.NESTED_AT_RULE) {
            this._nestedLevel += 1;
            if (variableOrRule in this.CONDITIONAL_GROUP_RULE) {
              enteringConditionalGroup = true;
            }
          } else if (!insideRule && parenLevel === 0 && variableOrRule.indexOf(":") !== -1) {
            insidePropertyValue = true;
            this.indent();
          }
        }
      } else if (this._ch === "#" && this._input.peek() === "{") {
        this.preserveSingleSpace(isAfterSpace);
        this.print_string(this._ch + this.eatString("}"));
      } else if (this._ch === "{") {
        if (insidePropertyValue) {
          insidePropertyValue = false;
          this.outdent();
        }
        if (enteringConditionalGroup) {
          enteringConditionalGroup = false;
          insideRule = this._indentLevel >= this._nestedLevel;
        } else {
          insideRule = this._indentLevel >= this._nestedLevel - 1;
        }
        if (this._options.newline_between_rules && insideRule) {
          if (this._output.previous_line && this._output.previous_line.item(-1) !== "{") {
            this._output.ensure_empty_line_above("/", ",");
          }
        }
        this._output.space_before_token = true;
        if (this._options.brace_style === "expand") {
          this._output.add_new_line();
          this.print_string(this._ch);
          this.indent();
          this._output.set_indent(this._indentLevel);
        } else {
          this.indent();
          this.print_string(this._ch);
        }
        this.eatWhitespace(true);
        this._output.add_new_line();
      } else if (this._ch === "}") {
        this.outdent();
        this._output.add_new_line();
        if (previous_ch === "{") {
          this._output.trim(true);
        }
        insideAtImport = false;
        insideAtExtend = false;
        if (insidePropertyValue) {
          this.outdent();
          insidePropertyValue = false;
        }
        this.print_string(this._ch);
        insideRule = false;
        if (this._nestedLevel) {
          this._nestedLevel--;
        }
        this.eatWhitespace(true);
        this._output.add_new_line();
        if (this._options.newline_between_rules && !this._output.just_added_blankline()) {
          if (this._input.peek() !== "}") {
            this._output.add_new_line(true);
          }
        }
      } else if (this._ch === ":") {
        if ((insideRule || enteringConditionalGroup) && !(this._input.lookBack("&") || this.foundNestedPseudoClass()) && !this._input.lookBack("(") && !insideAtExtend && parenLevel === 0) {
          this.print_string(":");
          if (!insidePropertyValue) {
            insidePropertyValue = true;
            this._output.space_before_token = true;
            this.eatWhitespace(true);
            this.indent();
          }
        } else {
          if (this._input.lookBack(" ")) {
            this._output.space_before_token = true;
          }
          if (this._input.peek() === ":") {
            this._ch = this._input.next();
            this.print_string("::");
          } else {
            this.print_string(":");
          }
        }
      } else if (this._ch === '"' || this._ch === "'") {
        this.preserveSingleSpace(isAfterSpace);
        this.print_string(this._ch + this.eatString(this._ch));
        this.eatWhitespace(true);
      } else if (this._ch === ";") {
        if (parenLevel === 0) {
          if (insidePropertyValue) {
            this.outdent();
            insidePropertyValue = false;
          }
          insideAtExtend = false;
          insideAtImport = false;
          this.print_string(this._ch);
          this.eatWhitespace(true);
          if (this._input.peek() !== "/") {
            this._output.add_new_line();
          }
        } else {
          this.print_string(this._ch);
          this.eatWhitespace(true);
          this._output.space_before_token = true;
        }
      } else if (this._ch === "(") {
        if (this._input.lookBack("url")) {
          this.print_string(this._ch);
          this.eatWhitespace();
          parenLevel++;
          this.indent();
          this._ch = this._input.next();
          if (this._ch === ")" || this._ch === '"' || this._ch === "'") {
            this._input.back();
          } else if (this._ch) {
            this.print_string(this._ch + this.eatString(")"));
            if (parenLevel) {
              parenLevel--;
              this.outdent();
            }
          }
        } else {
          this.preserveSingleSpace(isAfterSpace);
          this.print_string(this._ch);
          this.eatWhitespace();
          parenLevel++;
          this.indent();
        }
      } else if (this._ch === ")") {
        if (parenLevel) {
          parenLevel--;
          this.outdent();
        }
        this.print_string(this._ch);
      } else if (this._ch === ",") {
        this.print_string(this._ch);
        this.eatWhitespace(true);
        if (this._options.selector_separator_newline && !insidePropertyValue && parenLevel === 0 && !insideAtImport) {
          this._output.add_new_line();
        } else {
          this._output.space_before_token = true;
        }
      } else if ((this._ch === ">" || this._ch === "+" || this._ch === "~") && !insidePropertyValue && parenLevel === 0) {
        if (this._options.space_around_combinator) {
          this._output.space_before_token = true;
          this.print_string(this._ch);
          this._output.space_before_token = true;
        } else {
          this.print_string(this._ch);
          this.eatWhitespace();
          if (this._ch && whitespaceChar.test(this._ch)) {
            this._ch = "";
          }
        }
      } else if (this._ch === "]") {
        this.print_string(this._ch);
      } else if (this._ch === "[") {
        this.preserveSingleSpace(isAfterSpace);
        this.print_string(this._ch);
      } else if (this._ch === "=") {
        this.eatWhitespace();
        this.print_string("=");
        if (whitespaceChar.test(this._ch)) {
          this._ch = "";
        }
      } else if (this._ch === "!" && !this._input.lookBack("\\")) {
        this.print_string(" ");
        this.print_string(this._ch);
      } else {
        this.preserveSingleSpace(isAfterSpace);
        this.print_string(this._ch);
      }
    }
    var sweetCode = this._output.get_code(eol);
    return sweetCode;
  };
  module2.exports.Beautifier = Beautifier;
});

// ../node_modules/js-beautify/js/src/css/index.js
var require_css = __commonJS((exports2, module2) => {
  "use strict";
  var Beautifier = require_beautifier2().Beautifier;
  var Options = require_options3().Options;
  function css_beautify(source_text, options) {
    var beautifier = new Beautifier(source_text, options);
    return beautifier.beautify();
  }
  module2.exports = css_beautify;
  module2.exports.defaultOptions = function() {
    return new Options();
  };
});

// ../node_modules/js-beautify/js/src/html/options.js
var require_options4 = __commonJS((exports2, module2) => {
  "use strict";
  var BaseOptions = require_options().Options;
  function Options(options) {
    BaseOptions.call(this, options, "html");
    if (this.templating.length === 1 && this.templating[0] === "auto") {
      this.templating = ["django", "erb", "handlebars", "php"];
    }
    this.indent_inner_html = this._get_boolean("indent_inner_html");
    this.indent_body_inner_html = this._get_boolean("indent_body_inner_html", true);
    this.indent_head_inner_html = this._get_boolean("indent_head_inner_html", true);
    this.indent_handlebars = this._get_boolean("indent_handlebars", true);
    this.wrap_attributes = this._get_selection("wrap_attributes", ["auto", "force", "force-aligned", "force-expand-multiline", "aligned-multiple", "preserve", "preserve-aligned"]);
    this.wrap_attributes_indent_size = this._get_number("wrap_attributes_indent_size", this.indent_size);
    this.extra_liners = this._get_array("extra_liners", ["head", "body", "/html"]);
    this.inline = this._get_array("inline", [
      "a",
      "abbr",
      "area",
      "audio",
      "b",
      "bdi",
      "bdo",
      "br",
      "button",
      "canvas",
      "cite",
      "code",
      "data",
      "datalist",
      "del",
      "dfn",
      "em",
      "embed",
      "i",
      "iframe",
      "img",
      "input",
      "ins",
      "kbd",
      "keygen",
      "label",
      "map",
      "mark",
      "math",
      "meter",
      "noscript",
      "object",
      "output",
      "progress",
      "q",
      "ruby",
      "s",
      "samp",
      "select",
      "small",
      "span",
      "strong",
      "sub",
      "sup",
      "svg",
      "template",
      "textarea",
      "time",
      "u",
      "var",
      "video",
      "wbr",
      "text",
      "acronym",
      "big",
      "strike",
      "tt"
    ]);
    this.void_elements = this._get_array("void_elements", [
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "keygen",
      "link",
      "menuitem",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
      "!doctype",
      "?xml",
      "basefont",
      "isindex"
    ]);
    this.unformatted = this._get_array("unformatted", []);
    this.content_unformatted = this._get_array("content_unformatted", [
      "pre",
      "textarea"
    ]);
    this.unformatted_content_delimiter = this._get_characters("unformatted_content_delimiter");
    this.indent_scripts = this._get_selection("indent_scripts", ["normal", "keep", "separate"]);
  }
  Options.prototype = new BaseOptions();
  module2.exports.Options = Options;
});

// ../node_modules/js-beautify/js/src/html/tokenizer.js
var require_tokenizer3 = __commonJS((exports2, module2) => {
  "use strict";
  var BaseTokenizer = require_tokenizer().Tokenizer;
  var BASETOKEN = require_tokenizer().TOKEN;
  var Directives = require_directives().Directives;
  var TemplatablePattern = require_templatablepattern().TemplatablePattern;
  var Pattern = require_pattern().Pattern;
  var TOKEN = {
    TAG_OPEN: "TK_TAG_OPEN",
    TAG_CLOSE: "TK_TAG_CLOSE",
    ATTRIBUTE: "TK_ATTRIBUTE",
    EQUALS: "TK_EQUALS",
    VALUE: "TK_VALUE",
    COMMENT: "TK_COMMENT",
    TEXT: "TK_TEXT",
    UNKNOWN: "TK_UNKNOWN",
    START: BASETOKEN.START,
    RAW: BASETOKEN.RAW,
    EOF: BASETOKEN.EOF
  };
  var directives_core = new Directives(/<\!--/, /-->/);
  var Tokenizer = function(input_string, options) {
    BaseTokenizer.call(this, input_string, options);
    this._current_tag_name = "";
    var templatable_reader = new TemplatablePattern(this._input).read_options(this._options);
    var pattern_reader = new Pattern(this._input);
    this.__patterns = {
      word: templatable_reader.until(/[\n\r\t <]/),
      single_quote: templatable_reader.until_after(/'/),
      double_quote: templatable_reader.until_after(/"/),
      attribute: templatable_reader.until(/[\n\r\t =>]|\/>/),
      element_name: templatable_reader.until(/[\n\r\t >\/]/),
      handlebars_comment: pattern_reader.starting_with(/{{!--/).until_after(/--}}/),
      handlebars: pattern_reader.starting_with(/{{/).until_after(/}}/),
      handlebars_open: pattern_reader.until(/[\n\r\t }]/),
      handlebars_raw_close: pattern_reader.until(/}}/),
      comment: pattern_reader.starting_with(/<!--/).until_after(/-->/),
      cdata: pattern_reader.starting_with(/<!\[CDATA\[/).until_after(/]]>/),
      conditional_comment: pattern_reader.starting_with(/<!\[/).until_after(/]>/),
      processing: pattern_reader.starting_with(/<\?/).until_after(/\?>/)
    };
    if (this._options.indent_handlebars) {
      this.__patterns.word = this.__patterns.word.exclude("handlebars");
    }
    this._unformatted_content_delimiter = null;
    if (this._options.unformatted_content_delimiter) {
      var literal_regexp = this._input.get_literal_regexp(this._options.unformatted_content_delimiter);
      this.__patterns.unformatted_content_delimiter = pattern_reader.matching(literal_regexp).until_after(literal_regexp);
    }
  };
  Tokenizer.prototype = new BaseTokenizer();
  Tokenizer.prototype._is_comment = function(current_token) {
    return false;
  };
  Tokenizer.prototype._is_opening = function(current_token) {
    return current_token.type === TOKEN.TAG_OPEN;
  };
  Tokenizer.prototype._is_closing = function(current_token, open_token) {
    return current_token.type === TOKEN.TAG_CLOSE && (open_token && ((current_token.text === ">" || current_token.text === "/>") && open_token.text[0] === "<" || current_token.text === "}}" && open_token.text[0] === "{" && open_token.text[1] === "{"));
  };
  Tokenizer.prototype._reset = function() {
    this._current_tag_name = "";
  };
  Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
    var token = null;
    this._readWhitespace();
    var c = this._input.peek();
    if (c === null) {
      return this._create_token(TOKEN.EOF, "");
    }
    token = token || this._read_open_handlebars(c, open_token);
    token = token || this._read_attribute(c, previous_token, open_token);
    token = token || this._read_close(c, open_token);
    token = token || this._read_raw_content(c, previous_token, open_token);
    token = token || this._read_content_word(c);
    token = token || this._read_comment_or_cdata(c);
    token = token || this._read_processing(c);
    token = token || this._read_open(c, open_token);
    token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());
    return token;
  };
  Tokenizer.prototype._read_comment_or_cdata = function(c) {
    var token = null;
    var resulting_string = null;
    var directives = null;
    if (c === "<") {
      var peek1 = this._input.peek(1);
      if (peek1 === "!") {
        resulting_string = this.__patterns.comment.read();
        if (resulting_string) {
          directives = directives_core.get_directives(resulting_string);
          if (directives && directives.ignore === "start") {
            resulting_string += directives_core.readIgnored(this._input);
          }
        } else {
          resulting_string = this.__patterns.cdata.read();
        }
      }
      if (resulting_string) {
        token = this._create_token(TOKEN.COMMENT, resulting_string);
        token.directives = directives;
      }
    }
    return token;
  };
  Tokenizer.prototype._read_processing = function(c) {
    var token = null;
    var resulting_string = null;
    var directives = null;
    if (c === "<") {
      var peek1 = this._input.peek(1);
      if (peek1 === "!" || peek1 === "?") {
        resulting_string = this.__patterns.conditional_comment.read();
        resulting_string = resulting_string || this.__patterns.processing.read();
      }
      if (resulting_string) {
        token = this._create_token(TOKEN.COMMENT, resulting_string);
        token.directives = directives;
      }
    }
    return token;
  };
  Tokenizer.prototype._read_open = function(c, open_token) {
    var resulting_string = null;
    var token = null;
    if (!open_token) {
      if (c === "<") {
        resulting_string = this._input.next();
        if (this._input.peek() === "/") {
          resulting_string += this._input.next();
        }
        resulting_string += this.__patterns.element_name.read();
        token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
      }
    }
    return token;
  };
  Tokenizer.prototype._read_open_handlebars = function(c, open_token) {
    var resulting_string = null;
    var token = null;
    if (!open_token) {
      if (this._options.indent_handlebars && c === "{" && this._input.peek(1) === "{") {
        if (this._input.peek(2) === "!") {
          resulting_string = this.__patterns.handlebars_comment.read();
          resulting_string = resulting_string || this.__patterns.handlebars.read();
          token = this._create_token(TOKEN.COMMENT, resulting_string);
        } else {
          resulting_string = this.__patterns.handlebars_open.read();
          token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
        }
      }
    }
    return token;
  };
  Tokenizer.prototype._read_close = function(c, open_token) {
    var resulting_string = null;
    var token = null;
    if (open_token) {
      if (open_token.text[0] === "<" && (c === ">" || c === "/" && this._input.peek(1) === ">")) {
        resulting_string = this._input.next();
        if (c === "/") {
          resulting_string += this._input.next();
        }
        token = this._create_token(TOKEN.TAG_CLOSE, resulting_string);
      } else if (open_token.text[0] === "{" && c === "}" && this._input.peek(1) === "}") {
        this._input.next();
        this._input.next();
        token = this._create_token(TOKEN.TAG_CLOSE, "}}");
      }
    }
    return token;
  };
  Tokenizer.prototype._read_attribute = function(c, previous_token, open_token) {
    var token = null;
    var resulting_string = "";
    if (open_token && open_token.text[0] === "<") {
      if (c === "=") {
        token = this._create_token(TOKEN.EQUALS, this._input.next());
      } else if (c === '"' || c === "'") {
        var content = this._input.next();
        if (c === '"') {
          content += this.__patterns.double_quote.read();
        } else {
          content += this.__patterns.single_quote.read();
        }
        token = this._create_token(TOKEN.VALUE, content);
      } else {
        resulting_string = this.__patterns.attribute.read();
        if (resulting_string) {
          if (previous_token.type === TOKEN.EQUALS) {
            token = this._create_token(TOKEN.VALUE, resulting_string);
          } else {
            token = this._create_token(TOKEN.ATTRIBUTE, resulting_string);
          }
        }
      }
    }
    return token;
  };
  Tokenizer.prototype._is_content_unformatted = function(tag_name) {
    return this._options.void_elements.indexOf(tag_name) === -1 && (this._options.content_unformatted.indexOf(tag_name) !== -1 || this._options.unformatted.indexOf(tag_name) !== -1);
  };
  Tokenizer.prototype._read_raw_content = function(c, previous_token, open_token) {
    var resulting_string = "";
    if (open_token && open_token.text[0] === "{") {
      resulting_string = this.__patterns.handlebars_raw_close.read();
    } else if (previous_token.type === TOKEN.TAG_CLOSE && previous_token.opened.text[0] === "<" && previous_token.text[0] !== "/") {
      var tag_name = previous_token.opened.text.substr(1).toLowerCase();
      if (tag_name === "script" || tag_name === "style") {
        var token = this._read_comment_or_cdata(c);
        if (token) {
          token.type = TOKEN.TEXT;
          return token;
        }
        resulting_string = this._input.readUntil(new RegExp("</" + tag_name + "[\\n\\r\\t ]*?>", "ig"));
      } else if (this._is_content_unformatted(tag_name)) {
        resulting_string = this._input.readUntil(new RegExp("</" + tag_name + "[\\n\\r\\t ]*?>", "ig"));
      }
    }
    if (resulting_string) {
      return this._create_token(TOKEN.TEXT, resulting_string);
    }
    return null;
  };
  Tokenizer.prototype._read_content_word = function(c) {
    var resulting_string = "";
    if (this._options.unformatted_content_delimiter) {
      if (c === this._options.unformatted_content_delimiter[0]) {
        resulting_string = this.__patterns.unformatted_content_delimiter.read();
      }
    }
    if (!resulting_string) {
      resulting_string = this.__patterns.word.read();
    }
    if (resulting_string) {
      return this._create_token(TOKEN.TEXT, resulting_string);
    }
  };
  module2.exports.Tokenizer = Tokenizer;
  module2.exports.TOKEN = TOKEN;
});

// ../node_modules/js-beautify/js/src/html/beautifier.js
var require_beautifier3 = __commonJS((exports2, module2) => {
  "use strict";
  var Options = require_options4().Options;
  var Output = require_output().Output;
  var Tokenizer = require_tokenizer3().Tokenizer;
  var TOKEN = require_tokenizer3().TOKEN;
  var lineBreak = /\r\n|[\r\n]/;
  var allLineBreaks = /\r\n|[\r\n]/g;
  var Printer = function(options, base_indent_string) {
    this.indent_level = 0;
    this.alignment_size = 0;
    this.max_preserve_newlines = options.max_preserve_newlines;
    this.preserve_newlines = options.preserve_newlines;
    this._output = new Output(options, base_indent_string);
  };
  Printer.prototype.current_line_has_match = function(pattern) {
    return this._output.current_line.has_match(pattern);
  };
  Printer.prototype.set_space_before_token = function(value, non_breaking) {
    this._output.space_before_token = value;
    this._output.non_breaking_space = non_breaking;
  };
  Printer.prototype.set_wrap_point = function() {
    this._output.set_indent(this.indent_level, this.alignment_size);
    this._output.set_wrap_point();
  };
  Printer.prototype.add_raw_token = function(token) {
    this._output.add_raw_token(token);
  };
  Printer.prototype.print_preserved_newlines = function(raw_token) {
    var newlines = 0;
    if (raw_token.type !== TOKEN.TEXT && raw_token.previous.type !== TOKEN.TEXT) {
      newlines = raw_token.newlines ? 1 : 0;
    }
    if (this.preserve_newlines) {
      newlines = raw_token.newlines < this.max_preserve_newlines + 1 ? raw_token.newlines : this.max_preserve_newlines + 1;
    }
    for (var n = 0; n < newlines; n++) {
      this.print_newline(n > 0);
    }
    return newlines !== 0;
  };
  Printer.prototype.traverse_whitespace = function(raw_token) {
    if (raw_token.whitespace_before || raw_token.newlines) {
      if (!this.print_preserved_newlines(raw_token)) {
        this._output.space_before_token = true;
      }
      return true;
    }
    return false;
  };
  Printer.prototype.previous_token_wrapped = function() {
    return this._output.previous_token_wrapped;
  };
  Printer.prototype.print_newline = function(force) {
    this._output.add_new_line(force);
  };
  Printer.prototype.print_token = function(token) {
    if (token.text) {
      this._output.set_indent(this.indent_level, this.alignment_size);
      this._output.add_token(token.text);
    }
  };
  Printer.prototype.indent = function() {
    this.indent_level++;
  };
  Printer.prototype.get_full_indent = function(level) {
    level = this.indent_level + (level || 0);
    if (level < 1) {
      return "";
    }
    return this._output.get_indent_string(level);
  };
  var get_type_attribute = function(start_token) {
    var result = null;
    var raw_token = start_token.next;
    while (raw_token.type !== TOKEN.EOF && start_token.closed !== raw_token) {
      if (raw_token.type === TOKEN.ATTRIBUTE && raw_token.text === "type") {
        if (raw_token.next && raw_token.next.type === TOKEN.EQUALS && raw_token.next.next && raw_token.next.next.type === TOKEN.VALUE) {
          result = raw_token.next.next.text;
        }
        break;
      }
      raw_token = raw_token.next;
    }
    return result;
  };
  var get_custom_beautifier_name = function(tag_check, raw_token) {
    var typeAttribute = null;
    var result = null;
    if (!raw_token.closed) {
      return null;
    }
    if (tag_check === "script") {
      typeAttribute = "text/javascript";
    } else if (tag_check === "style") {
      typeAttribute = "text/css";
    }
    typeAttribute = get_type_attribute(raw_token) || typeAttribute;
    if (typeAttribute.search("text/css") > -1) {
      result = "css";
    } else if (typeAttribute.search(/module|((text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect))/) > -1) {
      result = "javascript";
    } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(html)/) > -1) {
      result = "html";
    } else if (typeAttribute.search(/test\/null/) > -1) {
      result = "null";
    }
    return result;
  };
  function in_array(what, arr) {
    return arr.indexOf(what) !== -1;
  }
  function TagFrame(parent, parser_token, indent_level) {
    this.parent = parent || null;
    this.tag = parser_token ? parser_token.tag_name : "";
    this.indent_level = indent_level || 0;
    this.parser_token = parser_token || null;
  }
  function TagStack(printer) {
    this._printer = printer;
    this._current_frame = null;
  }
  TagStack.prototype.get_parser_token = function() {
    return this._current_frame ? this._current_frame.parser_token : null;
  };
  TagStack.prototype.record_tag = function(parser_token) {
    var new_frame = new TagFrame(this._current_frame, parser_token, this._printer.indent_level);
    this._current_frame = new_frame;
  };
  TagStack.prototype._try_pop_frame = function(frame) {
    var parser_token = null;
    if (frame) {
      parser_token = frame.parser_token;
      this._printer.indent_level = frame.indent_level;
      this._current_frame = frame.parent;
    }
    return parser_token;
  };
  TagStack.prototype._get_frame = function(tag_list, stop_list) {
    var frame = this._current_frame;
    while (frame) {
      if (tag_list.indexOf(frame.tag) !== -1) {
        break;
      } else if (stop_list && stop_list.indexOf(frame.tag) !== -1) {
        frame = null;
        break;
      }
      frame = frame.parent;
    }
    return frame;
  };
  TagStack.prototype.try_pop = function(tag, stop_list) {
    var frame = this._get_frame([tag], stop_list);
    return this._try_pop_frame(frame);
  };
  TagStack.prototype.indent_to_tag = function(tag_list) {
    var frame = this._get_frame(tag_list);
    if (frame) {
      this._printer.indent_level = frame.indent_level;
    }
  };
  function Beautifier(source_text, options, js_beautify, css_beautify) {
    this._source_text = source_text || "";
    options = options || {};
    this._js_beautify = js_beautify;
    this._css_beautify = css_beautify;
    this._tag_stack = null;
    var optionHtml = new Options(options, "html");
    this._options = optionHtml;
    this._is_wrap_attributes_force = this._options.wrap_attributes.substr(0, "force".length) === "force";
    this._is_wrap_attributes_force_expand_multiline = this._options.wrap_attributes === "force-expand-multiline";
    this._is_wrap_attributes_force_aligned = this._options.wrap_attributes === "force-aligned";
    this._is_wrap_attributes_aligned_multiple = this._options.wrap_attributes === "aligned-multiple";
    this._is_wrap_attributes_preserve = this._options.wrap_attributes.substr(0, "preserve".length) === "preserve";
    this._is_wrap_attributes_preserve_aligned = this._options.wrap_attributes === "preserve-aligned";
  }
  Beautifier.prototype.beautify = function() {
    if (this._options.disabled) {
      return this._source_text;
    }
    var source_text = this._source_text;
    var eol = this._options.eol;
    if (this._options.eol === "auto") {
      eol = "\n";
      if (source_text && lineBreak.test(source_text)) {
        eol = source_text.match(lineBreak)[0];
      }
    }
    source_text = source_text.replace(allLineBreaks, "\n");
    var baseIndentString = source_text.match(/^[\t ]*/)[0];
    var last_token = {
      text: "",
      type: ""
    };
    var last_tag_token = new TagOpenParserToken();
    var printer = new Printer(this._options, baseIndentString);
    var tokens = new Tokenizer(source_text, this._options).tokenize();
    this._tag_stack = new TagStack(printer);
    var parser_token = null;
    var raw_token = tokens.next();
    while (raw_token.type !== TOKEN.EOF) {
      if (raw_token.type === TOKEN.TAG_OPEN || raw_token.type === TOKEN.COMMENT) {
        parser_token = this._handle_tag_open(printer, raw_token, last_tag_token, last_token);
        last_tag_token = parser_token;
      } else if (raw_token.type === TOKEN.ATTRIBUTE || raw_token.type === TOKEN.EQUALS || raw_token.type === TOKEN.VALUE || raw_token.type === TOKEN.TEXT && !last_tag_token.tag_complete) {
        parser_token = this._handle_inside_tag(printer, raw_token, last_tag_token, tokens);
      } else if (raw_token.type === TOKEN.TAG_CLOSE) {
        parser_token = this._handle_tag_close(printer, raw_token, last_tag_token);
      } else if (raw_token.type === TOKEN.TEXT) {
        parser_token = this._handle_text(printer, raw_token, last_tag_token);
      } else {
        printer.add_raw_token(raw_token);
      }
      last_token = parser_token;
      raw_token = tokens.next();
    }
    var sweet_code = printer._output.get_code(eol);
    return sweet_code;
  };
  Beautifier.prototype._handle_tag_close = function(printer, raw_token, last_tag_token) {
    var parser_token = {
      text: raw_token.text,
      type: raw_token.type
    };
    printer.alignment_size = 0;
    last_tag_token.tag_complete = true;
    printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
    if (last_tag_token.is_unformatted) {
      printer.add_raw_token(raw_token);
    } else {
      if (last_tag_token.tag_start_char === "<") {
        printer.set_space_before_token(raw_token.text[0] === "/", true);
        if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.has_wrapped_attrs) {
          printer.print_newline(false);
        }
      }
      printer.print_token(raw_token);
    }
    if (last_tag_token.indent_content && !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
      printer.indent();
      last_tag_token.indent_content = false;
    }
    if (!last_tag_token.is_inline_element && !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
      printer.set_wrap_point();
    }
    return parser_token;
  };
  Beautifier.prototype._handle_inside_tag = function(printer, raw_token, last_tag_token, tokens) {
    var wrapped = last_tag_token.has_wrapped_attrs;
    var parser_token = {
      text: raw_token.text,
      type: raw_token.type
    };
    printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
    if (last_tag_token.is_unformatted) {
      printer.add_raw_token(raw_token);
    } else if (last_tag_token.tag_start_char === "{" && raw_token.type === TOKEN.TEXT) {
      if (printer.print_preserved_newlines(raw_token)) {
        raw_token.newlines = 0;
        printer.add_raw_token(raw_token);
      } else {
        printer.print_token(raw_token);
      }
    } else {
      if (raw_token.type === TOKEN.ATTRIBUTE) {
        printer.set_space_before_token(true);
        last_tag_token.attr_count += 1;
      } else if (raw_token.type === TOKEN.EQUALS) {
        printer.set_space_before_token(false);
      } else if (raw_token.type === TOKEN.VALUE && raw_token.previous.type === TOKEN.EQUALS) {
        printer.set_space_before_token(false);
      }
      if (raw_token.type === TOKEN.ATTRIBUTE && last_tag_token.tag_start_char === "<") {
        if (this._is_wrap_attributes_preserve || this._is_wrap_attributes_preserve_aligned) {
          printer.traverse_whitespace(raw_token);
          wrapped = wrapped || raw_token.newlines !== 0;
        }
        if (this._is_wrap_attributes_force) {
          var force_attr_wrap = last_tag_token.attr_count > 1;
          if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.attr_count === 1) {
            var is_only_attribute = true;
            var peek_index = 0;
            var peek_token;
            do {
              peek_token = tokens.peek(peek_index);
              if (peek_token.type === TOKEN.ATTRIBUTE) {
                is_only_attribute = false;
                break;
              }
              peek_index += 1;
            } while (peek_index < 4 && peek_token.type !== TOKEN.EOF && peek_token.type !== TOKEN.TAG_CLOSE);
            force_attr_wrap = !is_only_attribute;
          }
          if (force_attr_wrap) {
            printer.print_newline(false);
            wrapped = true;
          }
        }
      }
      printer.print_token(raw_token);
      wrapped = wrapped || printer.previous_token_wrapped();
      last_tag_token.has_wrapped_attrs = wrapped;
    }
    return parser_token;
  };
  Beautifier.prototype._handle_text = function(printer, raw_token, last_tag_token) {
    var parser_token = {
      text: raw_token.text,
      type: "TK_CONTENT"
    };
    if (last_tag_token.custom_beautifier_name) {
      this._print_custom_beatifier_text(printer, raw_token, last_tag_token);
    } else if (last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) {
      printer.add_raw_token(raw_token);
    } else {
      printer.traverse_whitespace(raw_token);
      printer.print_token(raw_token);
    }
    return parser_token;
  };
  Beautifier.prototype._print_custom_beatifier_text = function(printer, raw_token, last_tag_token) {
    var local = this;
    if (raw_token.text !== "") {
      var text = raw_token.text, _beautifier, script_indent_level = 1, pre = "", post = "";
      if (last_tag_token.custom_beautifier_name === "javascript" && typeof this._js_beautify === "function") {
        _beautifier = this._js_beautify;
      } else if (last_tag_token.custom_beautifier_name === "css" && typeof this._css_beautify === "function") {
        _beautifier = this._css_beautify;
      } else if (last_tag_token.custom_beautifier_name === "html") {
        _beautifier = function(html_source, options) {
          var beautifier = new Beautifier(html_source, options, local._js_beautify, local._css_beautify);
          return beautifier.beautify();
        };
      }
      if (this._options.indent_scripts === "keep") {
        script_indent_level = 0;
      } else if (this._options.indent_scripts === "separate") {
        script_indent_level = -printer.indent_level;
      }
      var indentation = printer.get_full_indent(script_indent_level);
      text = text.replace(/\n[ \t]*$/, "");
      if (last_tag_token.custom_beautifier_name !== "html" && text[0] === "<" && text.match(/^(<!--|<!\[CDATA\[)/)) {
        var matched = /^(<!--[^\n]*|<!\[CDATA\[)(\n?)([ \t\n]*)([\s\S]*)(-->|]]>)$/.exec(text);
        if (!matched) {
          printer.add_raw_token(raw_token);
          return;
        }
        pre = indentation + matched[1] + "\n";
        text = matched[4];
        if (matched[5]) {
          post = indentation + matched[5];
        }
        text = text.replace(/\n[ \t]*$/, "");
        if (matched[2] || matched[3].indexOf("\n") !== -1) {
          matched = matched[3].match(/[ \t]+$/);
          if (matched) {
            raw_token.whitespace_before = matched[0];
          }
        }
      }
      if (text) {
        if (_beautifier) {
          var Child_options = function() {
            this.eol = "\n";
          };
          Child_options.prototype = this._options.raw_options;
          var child_options = new Child_options();
          text = _beautifier(indentation + text, child_options);
        } else {
          var white = raw_token.whitespace_before;
          if (white) {
            text = text.replace(new RegExp("\n(" + white + ")?", "g"), "\n");
          }
          text = indentation + text.replace(/\n/g, "\n" + indentation);
        }
      }
      if (pre) {
        if (!text) {
          text = pre + post;
        } else {
          text = pre + text + "\n" + post;
        }
      }
      printer.print_newline(false);
      if (text) {
        raw_token.text = text;
        raw_token.whitespace_before = "";
        raw_token.newlines = 0;
        printer.add_raw_token(raw_token);
        printer.print_newline(true);
      }
    }
  };
  Beautifier.prototype._handle_tag_open = function(printer, raw_token, last_tag_token, last_token) {
    var parser_token = this._get_tag_open_token(raw_token);
    if ((last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) && !last_tag_token.is_empty_element && raw_token.type === TOKEN.TAG_OPEN && raw_token.text.indexOf("</") === 0) {
      printer.add_raw_token(raw_token);
      parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name);
    } else {
      printer.traverse_whitespace(raw_token);
      this._set_tag_position(printer, raw_token, parser_token, last_tag_token, last_token);
      if (!parser_token.is_inline_element) {
        printer.set_wrap_point();
      }
      printer.print_token(raw_token);
    }
    if (this._is_wrap_attributes_force_aligned || this._is_wrap_attributes_aligned_multiple || this._is_wrap_attributes_preserve_aligned) {
      parser_token.alignment_size = raw_token.text.length + 1;
    }
    if (!parser_token.tag_complete && !parser_token.is_unformatted) {
      printer.alignment_size = parser_token.alignment_size;
    }
    return parser_token;
  };
  var TagOpenParserToken = function(parent, raw_token) {
    this.parent = parent || null;
    this.text = "";
    this.type = "TK_TAG_OPEN";
    this.tag_name = "";
    this.is_inline_element = false;
    this.is_unformatted = false;
    this.is_content_unformatted = false;
    this.is_empty_element = false;
    this.is_start_tag = false;
    this.is_end_tag = false;
    this.indent_content = false;
    this.multiline_content = false;
    this.custom_beautifier_name = null;
    this.start_tag_token = null;
    this.attr_count = 0;
    this.has_wrapped_attrs = false;
    this.alignment_size = 0;
    this.tag_complete = false;
    this.tag_start_char = "";
    this.tag_check = "";
    if (!raw_token) {
      this.tag_complete = true;
    } else {
      var tag_check_match;
      this.tag_start_char = raw_token.text[0];
      this.text = raw_token.text;
      if (this.tag_start_char === "<") {
        tag_check_match = raw_token.text.match(/^<([^\s>]*)/);
        this.tag_check = tag_check_match ? tag_check_match[1] : "";
      } else {
        tag_check_match = raw_token.text.match(/^{{(?:[\^]|#\*?)?([^\s}]+)/);
        this.tag_check = tag_check_match ? tag_check_match[1] : "";
        if (raw_token.text === "{{#>" && this.tag_check === ">" && raw_token.next !== null) {
          this.tag_check = raw_token.next.text;
        }
      }
      this.tag_check = this.tag_check.toLowerCase();
      if (raw_token.type === TOKEN.COMMENT) {
        this.tag_complete = true;
      }
      this.is_start_tag = this.tag_check.charAt(0) !== "/";
      this.tag_name = !this.is_start_tag ? this.tag_check.substr(1) : this.tag_check;
      this.is_end_tag = !this.is_start_tag || raw_token.closed && raw_token.closed.text === "/>";
      this.is_end_tag = this.is_end_tag || this.tag_start_char === "{" && (this.text.length < 3 || /[^#\^]/.test(this.text.charAt(2)));
    }
  };
  Beautifier.prototype._get_tag_open_token = function(raw_token) {
    var parser_token = new TagOpenParserToken(this._tag_stack.get_parser_token(), raw_token);
    parser_token.alignment_size = this._options.wrap_attributes_indent_size;
    parser_token.is_end_tag = parser_token.is_end_tag || in_array(parser_token.tag_check, this._options.void_elements);
    parser_token.is_empty_element = parser_token.tag_complete || parser_token.is_start_tag && parser_token.is_end_tag;
    parser_token.is_unformatted = !parser_token.tag_complete && in_array(parser_token.tag_check, this._options.unformatted);
    parser_token.is_content_unformatted = !parser_token.is_empty_element && in_array(parser_token.tag_check, this._options.content_unformatted);
    parser_token.is_inline_element = in_array(parser_token.tag_name, this._options.inline) || parser_token.tag_start_char === "{";
    return parser_token;
  };
  Beautifier.prototype._set_tag_position = function(printer, raw_token, parser_token, last_tag_token, last_token) {
    if (!parser_token.is_empty_element) {
      if (parser_token.is_end_tag) {
        parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name);
      } else {
        if (this._do_optional_end_element(parser_token)) {
          if (!parser_token.is_inline_element) {
            printer.print_newline(false);
          }
        }
        this._tag_stack.record_tag(parser_token);
        if ((parser_token.tag_name === "script" || parser_token.tag_name === "style") && !(parser_token.is_unformatted || parser_token.is_content_unformatted)) {
          parser_token.custom_beautifier_name = get_custom_beautifier_name(parser_token.tag_check, raw_token);
        }
      }
    }
    if (in_array(parser_token.tag_check, this._options.extra_liners)) {
      printer.print_newline(false);
      if (!printer._output.just_added_blankline()) {
        printer.print_newline(true);
      }
    }
    if (parser_token.is_empty_element) {
      if (parser_token.tag_start_char === "{" && parser_token.tag_check === "else") {
        this._tag_stack.indent_to_tag(["if", "unless", "each"]);
        parser_token.indent_content = true;
        var foundIfOnCurrentLine = printer.current_line_has_match(/{{#if/);
        if (!foundIfOnCurrentLine) {
          printer.print_newline(false);
        }
      }
      if (parser_token.tag_name === "!--" && last_token.type === TOKEN.TAG_CLOSE && last_tag_token.is_end_tag && parser_token.text.indexOf("\n") === -1) {
      } else {
        if (!(parser_token.is_inline_element || parser_token.is_unformatted)) {
          printer.print_newline(false);
        }
        this._calcluate_parent_multiline(printer, parser_token);
      }
    } else if (parser_token.is_end_tag) {
      var do_end_expand = false;
      do_end_expand = parser_token.start_tag_token && parser_token.start_tag_token.multiline_content;
      do_end_expand = do_end_expand || !parser_token.is_inline_element && !(last_tag_token.is_inline_element || last_tag_token.is_unformatted) && !(last_token.type === TOKEN.TAG_CLOSE && parser_token.start_tag_token === last_tag_token) && last_token.type !== "TK_CONTENT";
      if (parser_token.is_content_unformatted || parser_token.is_unformatted) {
        do_end_expand = false;
      }
      if (do_end_expand) {
        printer.print_newline(false);
      }
    } else {
      parser_token.indent_content = !parser_token.custom_beautifier_name;
      if (parser_token.tag_start_char === "<") {
        if (parser_token.tag_name === "html") {
          parser_token.indent_content = this._options.indent_inner_html;
        } else if (parser_token.tag_name === "head") {
          parser_token.indent_content = this._options.indent_head_inner_html;
        } else if (parser_token.tag_name === "body") {
          parser_token.indent_content = this._options.indent_body_inner_html;
        }
      }
      if (!(parser_token.is_inline_element || parser_token.is_unformatted) && (last_token.type !== "TK_CONTENT" || parser_token.is_content_unformatted)) {
        printer.print_newline(false);
      }
      this._calcluate_parent_multiline(printer, parser_token);
    }
  };
  Beautifier.prototype._calcluate_parent_multiline = function(printer, parser_token) {
    if (parser_token.parent && printer._output.just_added_newline() && !((parser_token.is_inline_element || parser_token.is_unformatted) && parser_token.parent.is_inline_element)) {
      parser_token.parent.multiline_content = true;
    }
  };
  var p_closers = ["address", "article", "aside", "blockquote", "details", "div", "dl", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "main", "nav", "ol", "p", "pre", "section", "table", "ul"];
  var p_parent_excludes = ["a", "audio", "del", "ins", "map", "noscript", "video"];
  Beautifier.prototype._do_optional_end_element = function(parser_token) {
    var result = null;
    if (parser_token.is_empty_element || !parser_token.is_start_tag || !parser_token.parent) {
      return;
    }
    if (parser_token.tag_name === "body") {
      result = result || this._tag_stack.try_pop("head");
    } else if (parser_token.tag_name === "li") {
      result = result || this._tag_stack.try_pop("li", ["ol", "ul"]);
    } else if (parser_token.tag_name === "dd" || parser_token.tag_name === "dt") {
      result = result || this._tag_stack.try_pop("dt", ["dl"]);
      result = result || this._tag_stack.try_pop("dd", ["dl"]);
    } else if (parser_token.parent.tag_name === "p" && p_closers.indexOf(parser_token.tag_name) !== -1) {
      var p_parent = parser_token.parent.parent;
      if (!p_parent || p_parent_excludes.indexOf(p_parent.tag_name) === -1) {
        result = result || this._tag_stack.try_pop("p");
      }
    } else if (parser_token.tag_name === "rp" || parser_token.tag_name === "rt") {
      result = result || this._tag_stack.try_pop("rt", ["ruby", "rtc"]);
      result = result || this._tag_stack.try_pop("rp", ["ruby", "rtc"]);
    } else if (parser_token.tag_name === "optgroup") {
      result = result || this._tag_stack.try_pop("optgroup", ["select"]);
    } else if (parser_token.tag_name === "option") {
      result = result || this._tag_stack.try_pop("option", ["select", "datalist", "optgroup"]);
    } else if (parser_token.tag_name === "colgroup") {
      result = result || this._tag_stack.try_pop("caption", ["table"]);
    } else if (parser_token.tag_name === "thead") {
      result = result || this._tag_stack.try_pop("caption", ["table"]);
      result = result || this._tag_stack.try_pop("colgroup", ["table"]);
    } else if (parser_token.tag_name === "tbody" || parser_token.tag_name === "tfoot") {
      result = result || this._tag_stack.try_pop("caption", ["table"]);
      result = result || this._tag_stack.try_pop("colgroup", ["table"]);
      result = result || this._tag_stack.try_pop("thead", ["table"]);
      result = result || this._tag_stack.try_pop("tbody", ["table"]);
    } else if (parser_token.tag_name === "tr") {
      result = result || this._tag_stack.try_pop("caption", ["table"]);
      result = result || this._tag_stack.try_pop("colgroup", ["table"]);
      result = result || this._tag_stack.try_pop("tr", ["table", "thead", "tbody", "tfoot"]);
    } else if (parser_token.tag_name === "th" || parser_token.tag_name === "td") {
      result = result || this._tag_stack.try_pop("td", ["table", "thead", "tbody", "tfoot", "tr"]);
      result = result || this._tag_stack.try_pop("th", ["table", "thead", "tbody", "tfoot", "tr"]);
    }
    parser_token.parent = this._tag_stack.get_parser_token();
    return result;
  };
  module2.exports.Beautifier = Beautifier;
});

// ../node_modules/js-beautify/js/src/html/index.js
var require_html = __commonJS((exports2, module2) => {
  "use strict";
  var Beautifier = require_beautifier3().Beautifier;
  var Options = require_options4().Options;
  function style_html(html_source, options, js_beautify, css_beautify) {
    var beautifier = new Beautifier(html_source, options, js_beautify, css_beautify);
    return beautifier.beautify();
  }
  module2.exports = style_html;
  module2.exports.defaultOptions = function() {
    return new Options();
  };
});

// ../node_modules/js-beautify/js/src/index.js
var require_src = __commonJS((exports2, module2) => {
  "use strict";
  var js_beautify = require_javascript();
  var css_beautify = require_css();
  var html_beautify = require_html();
  function style_html(html_source, options, js, css) {
    js = js || js_beautify;
    css = css || css_beautify;
    return html_beautify(html_source, options, js, css);
  }
  style_html.defaultOptions = html_beautify.defaultOptions;
  module2.exports.js = js_beautify;
  module2.exports.css = css_beautify;
  module2.exports.html = style_html;
});

// ../node_modules/js-beautify/js/index.js
var require_js = __commonJS((exports2, module2) => {
  "use strict";
  function get_beautify(js_beautify, css_beautify, html_beautify) {
    var beautify = function(src, config) {
      return js_beautify.js_beautify(src, config);
    };
    beautify.js = js_beautify.js_beautify;
    beautify.css = css_beautify.css_beautify;
    beautify.html = html_beautify.html_beautify;
    beautify.js_beautify = js_beautify.js_beautify;
    beautify.css_beautify = css_beautify.css_beautify;
    beautify.html_beautify = html_beautify.html_beautify;
    return beautify;
  }
  if (typeof define === "function" && define.amd) {
    define([
      "./lib/beautify",
      "./lib/beautify-css",
      "./lib/beautify-html"
    ], function(js_beautify, css_beautify, html_beautify) {
      return get_beautify(js_beautify, css_beautify, html_beautify);
    });
  } else {
    (function(mod) {
      var beautifier = require_src();
      beautifier.js_beautify = beautifier.js;
      beautifier.css_beautify = beautifier.css;
      beautifier.html_beautify = beautifier.html;
      mod.exports = get_beautify(beautifier, beautifier, beautifier);
    })(module2);
  }
});

// grammar.js
var require_grammar = __commonJS((exports2, module2) => {
  var fs = require("fs");
  var beautify = require_js().js;
  var all_file_context = [];
  var grammar = class {
    constructor(args) {
      this._path = args.path;
      this._file_name = args.file_name;
      this.config = args.config;
      if (args.content)
        this.content = args.content;
    }
    read() {
      if (this.file_name instanceof Array)
        this.file_name.forEach((i) => {
          fs.open(this._path + i, "r", (err, data) => {
            if (err)
              throw err;
            fs.readFile(data, (err2, _data) => {
              if (err2)
                throw err2;
              all_file_context.push(_data.toString("utf8"));
            });
          });
        });
      else
        fs.open(this._path + this._file_name, "r", (err, data) => {
          if (err)
            throw err;
          fs.readFile(data, (err2, _data) => {
            if (err2)
              throw err2;
            console.log(_data.toString("utf8"));
          });
        });
      return all_file_context;
    }
    write() {
      if (this.file_name instanceof Array)
        this.file_name.forEach((i) => {
          fs.open(this._path + i, "w+", (err, data) => {
            if (err)
              throw err;
            fs.writeFile(data, this.content, (err2) => {
              if (err2)
                throw err2;
            });
          });
        });
      else
        fs.open(this._file_name, "w+", (err, data) => {
          if (err)
            throw err;
          fs.writeFile(data, beautify(this.content, {indent_size: 2, space_in_empty_paren: true}), (err2) => {
            if (err2)
              throw err2;
          });
        });
    }
  };
  module2.exports = {
    grammar,
    all_file_context
  };
});

// ../node_modules/node-html-parser/dist/nodes/node.js
var require_node = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var Node = function() {
    function Node2(parentNode) {
      if (parentNode === void 0) {
        parentNode = null;
      }
      this.parentNode = parentNode;
      this.childNodes = [];
    }
    Object.defineProperty(Node2.prototype, "innerText", {
      get: function() {
        return this.rawText;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Node2.prototype, "textContent", {
      get: function() {
        return this.rawText;
      },
      set: function(val) {
        this.rawText = val;
      },
      enumerable: false,
      configurable: true
    });
    return Node2;
  }();
  exports2.default = Node;
});

// ../node_modules/node-html-parser/dist/nodes/type.js
var require_type = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var NodeType;
  (function(NodeType2) {
    NodeType2[NodeType2["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeType2[NodeType2["TEXT_NODE"] = 3] = "TEXT_NODE";
    NodeType2[NodeType2["COMMENT_NODE"] = 8] = "COMMENT_NODE";
  })(NodeType || (NodeType = {}));
  exports2.default = NodeType;
});

// ../node_modules/node-html-parser/dist/nodes/comment.js
var require_comment = __commonJS((exports2) => {
  "use strict";
  var __extends = exports2 && exports2.__extends || function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  var node_1 = __importDefault(require_node());
  var type_1 = __importDefault(require_type());
  var CommentNode = function(_super) {
    __extends(CommentNode2, _super);
    function CommentNode2(rawText, parentNode) {
      var _this = _super.call(this, parentNode) || this;
      _this.rawText = rawText;
      _this.nodeType = type_1.default.COMMENT_NODE;
      return _this;
    }
    Object.defineProperty(CommentNode2.prototype, "text", {
      get: function() {
        return this.rawText;
      },
      enumerable: false,
      configurable: true
    });
    CommentNode2.prototype.toString = function() {
      return "<!--" + this.rawText + "-->";
    };
    return CommentNode2;
  }(node_1.default);
  exports2.default = CommentNode;
});

// ../node_modules/he/he.js
var require_he = __commonJS((exports2, module2) => {
  /*! https://mths.be/he v1.2.0 by @mathias | MIT license */
  (function(root) {
    var freeExports = typeof exports2 == "object" && exports2;
    var freeModule = typeof module2 == "object" && module2 && module2.exports == freeExports && module2;
    var freeGlobal = typeof global == "object" && global;
    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
      root = freeGlobal;
    }
    var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    var regexAsciiWhitelist = /[\x01-\x7F]/g;
    var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
    var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
    var encodeMap = {"\xAD": "shy", "\u200C": "zwnj", "\u200D": "zwj", "\u200E": "lrm", "\u2063": "ic", "\u2062": "it", "\u2061": "af", "\u200F": "rlm", "\u200B": "ZeroWidthSpace", "\u2060": "NoBreak", "\u0311": "DownBreve", "\u20DB": "tdot", "\u20DC": "DotDot", "	": "Tab", "\n": "NewLine", "\u2008": "puncsp", "\u205F": "MediumSpace", "\u2009": "thinsp", "\u200A": "hairsp", "\u2004": "emsp13", "\u2002": "ensp", "\u2005": "emsp14", "\u2003": "emsp", "\u2007": "numsp", "\xA0": "nbsp", "\u205F\u200A": "ThickSpace", "\u203E": "oline", _: "lowbar", "\u2010": "dash", "\u2013": "ndash", "\u2014": "mdash", "\u2015": "horbar", ",": "comma", ";": "semi", "\u204F": "bsemi", ":": "colon", "\u2A74": "Colone", "!": "excl", "\xA1": "iexcl", "?": "quest", "\xBF": "iquest", ".": "period", "\u2025": "nldr", "\u2026": "mldr", "\xB7": "middot", "'": "apos", "\u2018": "lsquo", "\u2019": "rsquo", "\u201A": "sbquo", "\u2039": "lsaquo", "\u203A": "rsaquo", '"': "quot", "\u201C": "ldquo", "\u201D": "rdquo", "\u201E": "bdquo", "\xAB": "laquo", "\xBB": "raquo", "(": "lpar", ")": "rpar", "[": "lsqb", "]": "rsqb", "{": "lcub", "}": "rcub", "\u2308": "lceil", "\u2309": "rceil", "\u230A": "lfloor", "\u230B": "rfloor", "\u2985": "lopar", "\u2986": "ropar", "\u298B": "lbrke", "\u298C": "rbrke", "\u298D": "lbrkslu", "\u298E": "rbrksld", "\u298F": "lbrksld", "\u2990": "rbrkslu", "\u2991": "langd", "\u2992": "rangd", "\u2993": "lparlt", "\u2994": "rpargt", "\u2995": "gtlPar", "\u2996": "ltrPar", "\u27E6": "lobrk", "\u27E7": "robrk", "\u27E8": "lang", "\u27E9": "rang", "\u27EA": "Lang", "\u27EB": "Rang", "\u27EC": "loang", "\u27ED": "roang", "\u2772": "lbbrk", "\u2773": "rbbrk", "\u2016": "Vert", "\xA7": "sect", "\xB6": "para", "@": "commat", "*": "ast", "/": "sol", undefined: null, "&": "amp", "#": "num", "%": "percnt", "\u2030": "permil", "\u2031": "pertenk", "\u2020": "dagger", "\u2021": "Dagger", "\u2022": "bull", "\u2043": "hybull", "\u2032": "prime", "\u2033": "Prime", "\u2034": "tprime", "\u2057": "qprime", "\u2035": "bprime", "\u2041": "caret", "`": "grave", "\xB4": "acute", "\u02DC": "tilde", "^": "Hat", "\xAF": "macr", "\u02D8": "breve", "\u02D9": "dot", "\xA8": "die", "\u02DA": "ring", "\u02DD": "dblac", "\xB8": "cedil", "\u02DB": "ogon", \u02C6: "circ", \u02C7: "caron", "\xB0": "deg", "\xA9": "copy", "\xAE": "reg", "\u2117": "copysr", \u2118: "wp", "\u211E": "rx", "\u2127": "mho", "\u2129": "iiota", "\u2190": "larr", "\u219A": "nlarr", "\u2192": "rarr", "\u219B": "nrarr", "\u2191": "uarr", "\u2193": "darr", "\u2194": "harr", "\u21AE": "nharr", "\u2195": "varr", "\u2196": "nwarr", "\u2197": "nearr", "\u2198": "searr", "\u2199": "swarr", "\u219D": "rarrw", "\u219D\u0338": "nrarrw", "\u219E": "Larr", "\u219F": "Uarr", "\u21A0": "Rarr", "\u21A1": "Darr", "\u21A2": "larrtl", "\u21A3": "rarrtl", "\u21A4": "mapstoleft", "\u21A5": "mapstoup", "\u21A6": "map", "\u21A7": "mapstodown", "\u21A9": "larrhk", "\u21AA": "rarrhk", "\u21AB": "larrlp", "\u21AC": "rarrlp", "\u21AD": "harrw", "\u21B0": "lsh", "\u21B1": "rsh", "\u21B2": "ldsh", "\u21B3": "rdsh", "\u21B5": "crarr", "\u21B6": "cularr", "\u21B7": "curarr", "\u21BA": "olarr", "\u21BB": "orarr", "\u21BC": "lharu", "\u21BD": "lhard", "\u21BE": "uharr", "\u21BF": "uharl", "\u21C0": "rharu", "\u21C1": "rhard", "\u21C2": "dharr", "\u21C3": "dharl", "\u21C4": "rlarr", "\u21C5": "udarr", "\u21C6": "lrarr", "\u21C7": "llarr", "\u21C8": "uuarr", "\u21C9": "rrarr", "\u21CA": "ddarr", "\u21CB": "lrhar", "\u21CC": "rlhar", "\u21D0": "lArr", "\u21CD": "nlArr", "\u21D1": "uArr", "\u21D2": "rArr", "\u21CF": "nrArr", "\u21D3": "dArr", "\u21D4": "iff", "\u21CE": "nhArr", "\u21D5": "vArr", "\u21D6": "nwArr", "\u21D7": "neArr", "\u21D8": "seArr", "\u21D9": "swArr", "\u21DA": "lAarr", "\u21DB": "rAarr", "\u21DD": "zigrarr", "\u21E4": "larrb", "\u21E5": "rarrb", "\u21F5": "duarr", "\u21FD": "loarr", "\u21FE": "roarr", "\u21FF": "hoarr", "\u2200": "forall", "\u2201": "comp", "\u2202": "part", "\u2202\u0338": "npart", "\u2203": "exist", "\u2204": "nexist", "\u2205": "empty", "\u2207": "Del", "\u2208": "in", "\u2209": "notin", "\u220B": "ni", "\u220C": "notni", "\u03F6": "bepsi", "\u220F": "prod", "\u2210": "coprod", "\u2211": "sum", "+": "plus", "\xB1": "pm", "\xF7": "div", "\xD7": "times", "<": "lt", "\u226E": "nlt", "<\u20D2": "nvlt", "=": "equals", "\u2260": "ne", "=\u20E5": "bne", "\u2A75": "Equal", ">": "gt", "\u226F": "ngt", ">\u20D2": "nvgt", "\xAC": "not", "|": "vert", "\xA6": "brvbar", "\u2212": "minus", "\u2213": "mp", "\u2214": "plusdo", "\u2044": "frasl", "\u2216": "setmn", "\u2217": "lowast", "\u2218": "compfn", "\u221A": "Sqrt", "\u221D": "prop", "\u221E": "infin", "\u221F": "angrt", "\u2220": "ang", "\u2220\u20D2": "nang", "\u2221": "angmsd", "\u2222": "angsph", "\u2223": "mid", "\u2224": "nmid", "\u2225": "par", "\u2226": "npar", "\u2227": "and", "\u2228": "or", "\u2229": "cap", "\u2229\uFE00": "caps", "\u222A": "cup", "\u222A\uFE00": "cups", "\u222B": "int", "\u222C": "Int", "\u222D": "tint", "\u2A0C": "qint", "\u222E": "oint", "\u222F": "Conint", "\u2230": "Cconint", "\u2231": "cwint", "\u2232": "cwconint", "\u2233": "awconint", "\u2234": "there4", "\u2235": "becaus", "\u2236": "ratio", "\u2237": "Colon", "\u2238": "minusd", "\u223A": "mDDot", "\u223B": "homtht", "\u223C": "sim", "\u2241": "nsim", "\u223C\u20D2": "nvsim", "\u223D": "bsim", "\u223D\u0331": "race", "\u223E": "ac", "\u223E\u0333": "acE", "\u223F": "acd", "\u2240": "wr", "\u2242": "esim", "\u2242\u0338": "nesim", "\u2243": "sime", "\u2244": "nsime", "\u2245": "cong", "\u2247": "ncong", "\u2246": "simne", "\u2248": "ap", "\u2249": "nap", "\u224A": "ape", "\u224B": "apid", "\u224B\u0338": "napid", "\u224C": "bcong", "\u224D": "CupCap", "\u226D": "NotCupCap", "\u224D\u20D2": "nvap", "\u224E": "bump", "\u224E\u0338": "nbump", "\u224F": "bumpe", "\u224F\u0338": "nbumpe", "\u2250": "doteq", "\u2250\u0338": "nedot", "\u2251": "eDot", "\u2252": "efDot", "\u2253": "erDot", "\u2254": "colone", "\u2255": "ecolon", "\u2256": "ecir", "\u2257": "cire", "\u2259": "wedgeq", "\u225A": "veeeq", "\u225C": "trie", "\u225F": "equest", "\u2261": "equiv", "\u2262": "nequiv", "\u2261\u20E5": "bnequiv", "\u2264": "le", "\u2270": "nle", "\u2264\u20D2": "nvle", "\u2265": "ge", "\u2271": "nge", "\u2265\u20D2": "nvge", "\u2266": "lE", "\u2266\u0338": "nlE", "\u2267": "gE", "\u2267\u0338": "ngE", "\u2268\uFE00": "lvnE", "\u2268": "lnE", "\u2269": "gnE", "\u2269\uFE00": "gvnE", "\u226A": "ll", "\u226A\u0338": "nLtv", "\u226A\u20D2": "nLt", "\u226B": "gg", "\u226B\u0338": "nGtv", "\u226B\u20D2": "nGt", "\u226C": "twixt", "\u2272": "lsim", "\u2274": "nlsim", "\u2273": "gsim", "\u2275": "ngsim", "\u2276": "lg", "\u2278": "ntlg", "\u2277": "gl", "\u2279": "ntgl", "\u227A": "pr", "\u2280": "npr", "\u227B": "sc", "\u2281": "nsc", "\u227C": "prcue", "\u22E0": "nprcue", "\u227D": "sccue", "\u22E1": "nsccue", "\u227E": "prsim", "\u227F": "scsim", "\u227F\u0338": "NotSucceedsTilde", "\u2282": "sub", "\u2284": "nsub", "\u2282\u20D2": "vnsub", "\u2283": "sup", "\u2285": "nsup", "\u2283\u20D2": "vnsup", "\u2286": "sube", "\u2288": "nsube", "\u2287": "supe", "\u2289": "nsupe", "\u228A\uFE00": "vsubne", "\u228A": "subne", "\u228B\uFE00": "vsupne", "\u228B": "supne", "\u228D": "cupdot", "\u228E": "uplus", "\u228F": "sqsub", "\u228F\u0338": "NotSquareSubset", "\u2290": "sqsup", "\u2290\u0338": "NotSquareSuperset", "\u2291": "sqsube", "\u22E2": "nsqsube", "\u2292": "sqsupe", "\u22E3": "nsqsupe", "\u2293": "sqcap", "\u2293\uFE00": "sqcaps", "\u2294": "sqcup", "\u2294\uFE00": "sqcups", "\u2295": "oplus", "\u2296": "ominus", "\u2297": "otimes", "\u2298": "osol", "\u2299": "odot", "\u229A": "ocir", "\u229B": "oast", "\u229D": "odash", "\u229E": "plusb", "\u229F": "minusb", "\u22A0": "timesb", "\u22A1": "sdotb", "\u22A2": "vdash", "\u22AC": "nvdash", "\u22A3": "dashv", "\u22A4": "top", "\u22A5": "bot", "\u22A7": "models", "\u22A8": "vDash", "\u22AD": "nvDash", "\u22A9": "Vdash", "\u22AE": "nVdash", "\u22AA": "Vvdash", "\u22AB": "VDash", "\u22AF": "nVDash", "\u22B0": "prurel", "\u22B2": "vltri", "\u22EA": "nltri", "\u22B3": "vrtri", "\u22EB": "nrtri", "\u22B4": "ltrie", "\u22EC": "nltrie", "\u22B4\u20D2": "nvltrie", "\u22B5": "rtrie", "\u22ED": "nrtrie", "\u22B5\u20D2": "nvrtrie", "\u22B6": "origof", "\u22B7": "imof", "\u22B8": "mumap", "\u22B9": "hercon", "\u22BA": "intcal", "\u22BB": "veebar", "\u22BD": "barvee", "\u22BE": "angrtvb", "\u22BF": "lrtri", "\u22C0": "Wedge", "\u22C1": "Vee", "\u22C2": "xcap", "\u22C3": "xcup", "\u22C4": "diam", "\u22C5": "sdot", "\u22C6": "Star", "\u22C7": "divonx", "\u22C8": "bowtie", "\u22C9": "ltimes", "\u22CA": "rtimes", "\u22CB": "lthree", "\u22CC": "rthree", "\u22CD": "bsime", "\u22CE": "cuvee", "\u22CF": "cuwed", "\u22D0": "Sub", "\u22D1": "Sup", "\u22D2": "Cap", "\u22D3": "Cup", "\u22D4": "fork", "\u22D5": "epar", "\u22D6": "ltdot", "\u22D7": "gtdot", "\u22D8": "Ll", "\u22D8\u0338": "nLl", "\u22D9": "Gg", "\u22D9\u0338": "nGg", "\u22DA\uFE00": "lesg", "\u22DA": "leg", "\u22DB": "gel", "\u22DB\uFE00": "gesl", "\u22DE": "cuepr", "\u22DF": "cuesc", "\u22E6": "lnsim", "\u22E7": "gnsim", "\u22E8": "prnsim", "\u22E9": "scnsim", "\u22EE": "vellip", "\u22EF": "ctdot", "\u22F0": "utdot", "\u22F1": "dtdot", "\u22F2": "disin", "\u22F3": "isinsv", "\u22F4": "isins", "\u22F5": "isindot", "\u22F5\u0338": "notindot", "\u22F6": "notinvc", "\u22F7": "notinvb", "\u22F9": "isinE", "\u22F9\u0338": "notinE", "\u22FA": "nisd", "\u22FB": "xnis", "\u22FC": "nis", "\u22FD": "notnivc", "\u22FE": "notnivb", "\u2305": "barwed", "\u2306": "Barwed", "\u230C": "drcrop", "\u230D": "dlcrop", "\u230E": "urcrop", "\u230F": "ulcrop", "\u2310": "bnot", "\u2312": "profline", "\u2313": "profsurf", "\u2315": "telrec", "\u2316": "target", "\u231C": "ulcorn", "\u231D": "urcorn", "\u231E": "dlcorn", "\u231F": "drcorn", "\u2322": "frown", "\u2323": "smile", "\u232D": "cylcty", "\u232E": "profalar", "\u2336": "topbot", "\u233D": "ovbar", "\u233F": "solbar", "\u237C": "angzarr", "\u23B0": "lmoust", "\u23B1": "rmoust", "\u23B4": "tbrk", "\u23B5": "bbrk", "\u23B6": "bbrktbrk", "\u23DC": "OverParenthesis", "\u23DD": "UnderParenthesis", "\u23DE": "OverBrace", "\u23DF": "UnderBrace", "\u23E2": "trpezium", "\u23E7": "elinters", "\u2423": "blank", "\u2500": "boxh", "\u2502": "boxv", "\u250C": "boxdr", "\u2510": "boxdl", "\u2514": "boxur", "\u2518": "boxul", "\u251C": "boxvr", "\u2524": "boxvl", "\u252C": "boxhd", "\u2534": "boxhu", "\u253C": "boxvh", "\u2550": "boxH", "\u2551": "boxV", "\u2552": "boxdR", "\u2553": "boxDr", "\u2554": "boxDR", "\u2555": "boxdL", "\u2556": "boxDl", "\u2557": "boxDL", "\u2558": "boxuR", "\u2559": "boxUr", "\u255A": "boxUR", "\u255B": "boxuL", "\u255C": "boxUl", "\u255D": "boxUL", "\u255E": "boxvR", "\u255F": "boxVr", "\u2560": "boxVR", "\u2561": "boxvL", "\u2562": "boxVl", "\u2563": "boxVL", "\u2564": "boxHd", "\u2565": "boxhD", "\u2566": "boxHD", "\u2567": "boxHu", "\u2568": "boxhU", "\u2569": "boxHU", "\u256A": "boxvH", "\u256B": "boxVh", "\u256C": "boxVH", "\u2580": "uhblk", "\u2584": "lhblk", "\u2588": "block", "\u2591": "blk14", "\u2592": "blk12", "\u2593": "blk34", "\u25A1": "squ", "\u25AA": "squf", "\u25AB": "EmptyVerySmallSquare", "\u25AD": "rect", "\u25AE": "marker", "\u25B1": "fltns", "\u25B3": "xutri", "\u25B4": "utrif", "\u25B5": "utri", "\u25B8": "rtrif", "\u25B9": "rtri", "\u25BD": "xdtri", "\u25BE": "dtrif", "\u25BF": "dtri", "\u25C2": "ltrif", "\u25C3": "ltri", "\u25CA": "loz", "\u25CB": "cir", "\u25EC": "tridot", "\u25EF": "xcirc", "\u25F8": "ultri", "\u25F9": "urtri", "\u25FA": "lltri", "\u25FB": "EmptySmallSquare", "\u25FC": "FilledSmallSquare", "\u2605": "starf", "\u2606": "star", "\u260E": "phone", "\u2640": "female", "\u2642": "male", "\u2660": "spades", "\u2663": "clubs", "\u2665": "hearts", "\u2666": "diams", "\u266A": "sung", "\u2713": "check", "\u2717": "cross", "\u2720": "malt", "\u2736": "sext", "\u2758": "VerticalSeparator", "\u27C8": "bsolhsub", "\u27C9": "suphsol", "\u27F5": "xlarr", "\u27F6": "xrarr", "\u27F7": "xharr", "\u27F8": "xlArr", "\u27F9": "xrArr", "\u27FA": "xhArr", "\u27FC": "xmap", "\u27FF": "dzigrarr", "\u2902": "nvlArr", "\u2903": "nvrArr", "\u2904": "nvHarr", "\u2905": "Map", "\u290C": "lbarr", "\u290D": "rbarr", "\u290E": "lBarr", "\u290F": "rBarr", "\u2910": "RBarr", "\u2911": "DDotrahd", "\u2912": "UpArrowBar", "\u2913": "DownArrowBar", "\u2916": "Rarrtl", "\u2919": "latail", "\u291A": "ratail", "\u291B": "lAtail", "\u291C": "rAtail", "\u291D": "larrfs", "\u291E": "rarrfs", "\u291F": "larrbfs", "\u2920": "rarrbfs", "\u2923": "nwarhk", "\u2924": "nearhk", "\u2925": "searhk", "\u2926": "swarhk", "\u2927": "nwnear", "\u2928": "toea", "\u2929": "tosa", "\u292A": "swnwar", "\u2933": "rarrc", "\u2933\u0338": "nrarrc", "\u2935": "cudarrr", "\u2936": "ldca", "\u2937": "rdca", "\u2938": "cudarrl", "\u2939": "larrpl", "\u293C": "curarrm", "\u293D": "cularrp", "\u2945": "rarrpl", "\u2948": "harrcir", "\u2949": "Uarrocir", "\u294A": "lurdshar", "\u294B": "ldrushar", "\u294E": "LeftRightVector", "\u294F": "RightUpDownVector", "\u2950": "DownLeftRightVector", "\u2951": "LeftUpDownVector", "\u2952": "LeftVectorBar", "\u2953": "RightVectorBar", "\u2954": "RightUpVectorBar", "\u2955": "RightDownVectorBar", "\u2956": "DownLeftVectorBar", "\u2957": "DownRightVectorBar", "\u2958": "LeftUpVectorBar", "\u2959": "LeftDownVectorBar", "\u295A": "LeftTeeVector", "\u295B": "RightTeeVector", "\u295C": "RightUpTeeVector", "\u295D": "RightDownTeeVector", "\u295E": "DownLeftTeeVector", "\u295F": "DownRightTeeVector", "\u2960": "LeftUpTeeVector", "\u2961": "LeftDownTeeVector", "\u2962": "lHar", "\u2963": "uHar", "\u2964": "rHar", "\u2965": "dHar", "\u2966": "luruhar", "\u2967": "ldrdhar", "\u2968": "ruluhar", "\u2969": "rdldhar", "\u296A": "lharul", "\u296B": "llhard", "\u296C": "rharul", "\u296D": "lrhard", "\u296E": "udhar", "\u296F": "duhar", "\u2970": "RoundImplies", "\u2971": "erarr", "\u2972": "simrarr", "\u2973": "larrsim", "\u2974": "rarrsim", "\u2975": "rarrap", "\u2976": "ltlarr", "\u2978": "gtrarr", "\u2979": "subrarr", "\u297B": "suplarr", "\u297C": "lfisht", "\u297D": "rfisht", "\u297E": "ufisht", "\u297F": "dfisht", "\u299A": "vzigzag", "\u299C": "vangrt", "\u299D": "angrtvbd", "\u29A4": "ange", "\u29A5": "range", "\u29A6": "dwangle", "\u29A7": "uwangle", "\u29A8": "angmsdaa", "\u29A9": "angmsdab", "\u29AA": "angmsdac", "\u29AB": "angmsdad", "\u29AC": "angmsdae", "\u29AD": "angmsdaf", "\u29AE": "angmsdag", "\u29AF": "angmsdah", "\u29B0": "bemptyv", "\u29B1": "demptyv", "\u29B2": "cemptyv", "\u29B3": "raemptyv", "\u29B4": "laemptyv", "\u29B5": "ohbar", "\u29B6": "omid", "\u29B7": "opar", "\u29B9": "operp", "\u29BB": "olcross", "\u29BC": "odsold", "\u29BE": "olcir", "\u29BF": "ofcir", "\u29C0": "olt", "\u29C1": "ogt", "\u29C2": "cirscir", "\u29C3": "cirE", "\u29C4": "solb", "\u29C5": "bsolb", "\u29C9": "boxbox", "\u29CD": "trisb", "\u29CE": "rtriltri", "\u29CF": "LeftTriangleBar", "\u29CF\u0338": "NotLeftTriangleBar", "\u29D0": "RightTriangleBar", "\u29D0\u0338": "NotRightTriangleBar", "\u29DC": "iinfin", "\u29DD": "infintie", "\u29DE": "nvinfin", "\u29E3": "eparsl", "\u29E4": "smeparsl", "\u29E5": "eqvparsl", "\u29EB": "lozf", "\u29F4": "RuleDelayed", "\u29F6": "dsol", "\u2A00": "xodot", "\u2A01": "xoplus", "\u2A02": "xotime", "\u2A04": "xuplus", "\u2A06": "xsqcup", "\u2A0D": "fpartint", "\u2A10": "cirfnint", "\u2A11": "awint", "\u2A12": "rppolint", "\u2A13": "scpolint", "\u2A14": "npolint", "\u2A15": "pointint", "\u2A16": "quatint", "\u2A17": "intlarhk", "\u2A22": "pluscir", "\u2A23": "plusacir", "\u2A24": "simplus", "\u2A25": "plusdu", "\u2A26": "plussim", "\u2A27": "plustwo", "\u2A29": "mcomma", "\u2A2A": "minusdu", "\u2A2D": "loplus", "\u2A2E": "roplus", "\u2A2F": "Cross", "\u2A30": "timesd", "\u2A31": "timesbar", "\u2A33": "smashp", "\u2A34": "lotimes", "\u2A35": "rotimes", "\u2A36": "otimesas", "\u2A37": "Otimes", "\u2A38": "odiv", "\u2A39": "triplus", "\u2A3A": "triminus", "\u2A3B": "tritime", "\u2A3C": "iprod", "\u2A3F": "amalg", "\u2A40": "capdot", "\u2A42": "ncup", "\u2A43": "ncap", "\u2A44": "capand", "\u2A45": "cupor", "\u2A46": "cupcap", "\u2A47": "capcup", "\u2A48": "cupbrcap", "\u2A49": "capbrcup", "\u2A4A": "cupcup", "\u2A4B": "capcap", "\u2A4C": "ccups", "\u2A4D": "ccaps", "\u2A50": "ccupssm", "\u2A53": "And", "\u2A54": "Or", "\u2A55": "andand", "\u2A56": "oror", "\u2A57": "orslope", "\u2A58": "andslope", "\u2A5A": "andv", "\u2A5B": "orv", "\u2A5C": "andd", "\u2A5D": "ord", "\u2A5F": "wedbar", "\u2A66": "sdote", "\u2A6A": "simdot", "\u2A6D": "congdot", "\u2A6D\u0338": "ncongdot", "\u2A6E": "easter", "\u2A6F": "apacir", "\u2A70": "apE", "\u2A70\u0338": "napE", "\u2A71": "eplus", "\u2A72": "pluse", "\u2A73": "Esim", "\u2A77": "eDDot", "\u2A78": "equivDD", "\u2A79": "ltcir", "\u2A7A": "gtcir", "\u2A7B": "ltquest", "\u2A7C": "gtquest", "\u2A7D": "les", "\u2A7D\u0338": "nles", "\u2A7E": "ges", "\u2A7E\u0338": "nges", "\u2A7F": "lesdot", "\u2A80": "gesdot", "\u2A81": "lesdoto", "\u2A82": "gesdoto", "\u2A83": "lesdotor", "\u2A84": "gesdotol", "\u2A85": "lap", "\u2A86": "gap", "\u2A87": "lne", "\u2A88": "gne", "\u2A89": "lnap", "\u2A8A": "gnap", "\u2A8B": "lEg", "\u2A8C": "gEl", "\u2A8D": "lsime", "\u2A8E": "gsime", "\u2A8F": "lsimg", "\u2A90": "gsiml", "\u2A91": "lgE", "\u2A92": "glE", "\u2A93": "lesges", "\u2A94": "gesles", "\u2A95": "els", "\u2A96": "egs", "\u2A97": "elsdot", "\u2A98": "egsdot", "\u2A99": "el", "\u2A9A": "eg", "\u2A9D": "siml", "\u2A9E": "simg", "\u2A9F": "simlE", "\u2AA0": "simgE", "\u2AA1": "LessLess", "\u2AA1\u0338": "NotNestedLessLess", "\u2AA2": "GreaterGreater", "\u2AA2\u0338": "NotNestedGreaterGreater", "\u2AA4": "glj", "\u2AA5": "gla", "\u2AA6": "ltcc", "\u2AA7": "gtcc", "\u2AA8": "lescc", "\u2AA9": "gescc", "\u2AAA": "smt", "\u2AAB": "lat", "\u2AAC": "smte", "\u2AAC\uFE00": "smtes", "\u2AAD": "late", "\u2AAD\uFE00": "lates", "\u2AAE": "bumpE", "\u2AAF": "pre", "\u2AAF\u0338": "npre", "\u2AB0": "sce", "\u2AB0\u0338": "nsce", "\u2AB3": "prE", "\u2AB4": "scE", "\u2AB5": "prnE", "\u2AB6": "scnE", "\u2AB7": "prap", "\u2AB8": "scap", "\u2AB9": "prnap", "\u2ABA": "scnap", "\u2ABB": "Pr", "\u2ABC": "Sc", "\u2ABD": "subdot", "\u2ABE": "supdot", "\u2ABF": "subplus", "\u2AC0": "supplus", "\u2AC1": "submult", "\u2AC2": "supmult", "\u2AC3": "subedot", "\u2AC4": "supedot", "\u2AC5": "subE", "\u2AC5\u0338": "nsubE", "\u2AC6": "supE", "\u2AC6\u0338": "nsupE", "\u2AC7": "subsim", "\u2AC8": "supsim", "\u2ACB\uFE00": "vsubnE", "\u2ACB": "subnE", "\u2ACC\uFE00": "vsupnE", "\u2ACC": "supnE", "\u2ACF": "csub", "\u2AD0": "csup", "\u2AD1": "csube", "\u2AD2": "csupe", "\u2AD3": "subsup", "\u2AD4": "supsub", "\u2AD5": "subsub", "\u2AD6": "supsup", "\u2AD7": "suphsub", "\u2AD8": "supdsub", "\u2AD9": "forkv", "\u2ADA": "topfork", "\u2ADB": "mlcp", "\u2AE4": "Dashv", "\u2AE6": "Vdashl", "\u2AE7": "Barv", "\u2AE8": "vBar", "\u2AE9": "vBarv", "\u2AEB": "Vbar", "\u2AEC": "Not", "\u2AED": "bNot", "\u2AEE": "rnmid", "\u2AEF": "cirmid", "\u2AF0": "midcir", "\u2AF1": "topcir", "\u2AF2": "nhpar", "\u2AF3": "parsim", "\u2AFD": "parsl", "\u2AFD\u20E5": "nparsl", "\u266D": "flat", "\u266E": "natur", "\u266F": "sharp", "\xA4": "curren", "\xA2": "cent", $: "dollar", "\xA3": "pound", "\xA5": "yen", "\u20AC": "euro", "\xB9": "sup1", "\xBD": "half", "\u2153": "frac13", "\xBC": "frac14", "\u2155": "frac15", "\u2159": "frac16", "\u215B": "frac18", "\xB2": "sup2", "\u2154": "frac23", "\u2156": "frac25", "\xB3": "sup3", "\xBE": "frac34", "\u2157": "frac35", "\u215C": "frac38", "\u2158": "frac45", "\u215A": "frac56", "\u215D": "frac58", "\u215E": "frac78", \u{1D4B6}: "ascr", \u{1D552}: "aopf", \u{1D51E}: "afr", \u{1D538}: "Aopf", \u{1D504}: "Afr", \u{1D49C}: "Ascr", \u00AA: "ordf", \u00E1: "aacute", \u00C1: "Aacute", \u00E0: "agrave", \u00C0: "Agrave", \u0103: "abreve", \u0102: "Abreve", \u00E2: "acirc", \u00C2: "Acirc", \u00E5: "aring", \u00C5: "angst", \u00E4: "auml", \u00C4: "Auml", \u00E3: "atilde", \u00C3: "Atilde", \u0105: "aogon", \u0104: "Aogon", \u0101: "amacr", \u0100: "Amacr", \u00E6: "aelig", \u00C6: "AElig", \u{1D4B7}: "bscr", \u{1D553}: "bopf", \u{1D51F}: "bfr", \u{1D539}: "Bopf", \u212C: "Bscr", \u{1D505}: "Bfr", \u{1D520}: "cfr", \u{1D4B8}: "cscr", \u{1D554}: "copf", \u212D: "Cfr", \u{1D49E}: "Cscr", \u2102: "Copf", \u0107: "cacute", \u0106: "Cacute", \u0109: "ccirc", \u0108: "Ccirc", \u010D: "ccaron", \u010C: "Ccaron", \u010B: "cdot", \u010A: "Cdot", \u00E7: "ccedil", \u00C7: "Ccedil", "\u2105": "incare", \u{1D521}: "dfr", \u2146: "dd", \u{1D555}: "dopf", \u{1D4B9}: "dscr", \u{1D49F}: "Dscr", \u{1D507}: "Dfr", \u2145: "DD", \u{1D53B}: "Dopf", \u010F: "dcaron", \u010E: "Dcaron", \u0111: "dstrok", \u0110: "Dstrok", \u00F0: "eth", \u00D0: "ETH", \u2147: "ee", \u212F: "escr", \u{1D522}: "efr", \u{1D556}: "eopf", \u2130: "Escr", \u{1D508}: "Efr", \u{1D53C}: "Eopf", \u00E9: "eacute", \u00C9: "Eacute", \u00E8: "egrave", \u00C8: "Egrave", \u00EA: "ecirc", \u00CA: "Ecirc", \u011B: "ecaron", \u011A: "Ecaron", \u00EB: "euml", \u00CB: "Euml", \u0117: "edot", \u0116: "Edot", \u0119: "eogon", \u0118: "Eogon", \u0113: "emacr", \u0112: "Emacr", \u{1D523}: "ffr", \u{1D557}: "fopf", \u{1D4BB}: "fscr", \u{1D509}: "Ffr", \u{1D53D}: "Fopf", \u2131: "Fscr", \uFB00: "fflig", \uFB03: "ffilig", \uFB04: "ffllig", \uFB01: "filig", fj: "fjlig", \uFB02: "fllig", \u0192: "fnof", \u210A: "gscr", \u{1D558}: "gopf", \u{1D524}: "gfr", \u{1D4A2}: "Gscr", \u{1D53E}: "Gopf", \u{1D50A}: "Gfr", \u01F5: "gacute", \u011F: "gbreve", \u011E: "Gbreve", \u011D: "gcirc", \u011C: "Gcirc", \u0121: "gdot", \u0120: "Gdot", \u0122: "Gcedil", \u{1D525}: "hfr", \u210E: "planckh", \u{1D4BD}: "hscr", \u{1D559}: "hopf", \u210B: "Hscr", \u210C: "Hfr", \u210D: "Hopf", \u0125: "hcirc", \u0124: "Hcirc", \u210F: "hbar", \u0127: "hstrok", \u0126: "Hstrok", \u{1D55A}: "iopf", \u{1D526}: "ifr", \u{1D4BE}: "iscr", \u2148: "ii", \u{1D540}: "Iopf", \u2110: "Iscr", \u2111: "Im", \u00ED: "iacute", \u00CD: "Iacute", \u00EC: "igrave", \u00CC: "Igrave", \u00EE: "icirc", \u00CE: "Icirc", \u00EF: "iuml", \u00CF: "Iuml", \u0129: "itilde", \u0128: "Itilde", \u0130: "Idot", \u012F: "iogon", \u012E: "Iogon", \u012B: "imacr", \u012A: "Imacr", \u0133: "ijlig", \u0132: "IJlig", \u0131: "imath", \u{1D4BF}: "jscr", \u{1D55B}: "jopf", \u{1D527}: "jfr", \u{1D4A5}: "Jscr", \u{1D50D}: "Jfr", \u{1D541}: "Jopf", \u0135: "jcirc", \u0134: "Jcirc", \u0237: "jmath", \u{1D55C}: "kopf", \u{1D4C0}: "kscr", \u{1D528}: "kfr", \u{1D4A6}: "Kscr", \u{1D542}: "Kopf", \u{1D50E}: "Kfr", \u0137: "kcedil", \u0136: "Kcedil", \u{1D529}: "lfr", \u{1D4C1}: "lscr", \u2113: "ell", \u{1D55D}: "lopf", \u2112: "Lscr", \u{1D50F}: "Lfr", \u{1D543}: "Lopf", \u013A: "lacute", \u0139: "Lacute", \u013E: "lcaron", \u013D: "Lcaron", \u013C: "lcedil", \u013B: "Lcedil", \u0142: "lstrok", \u0141: "Lstrok", \u0140: "lmidot", \u013F: "Lmidot", \u{1D52A}: "mfr", \u{1D55E}: "mopf", \u{1D4C2}: "mscr", \u{1D510}: "Mfr", \u{1D544}: "Mopf", \u2133: "Mscr", \u{1D52B}: "nfr", \u{1D55F}: "nopf", \u{1D4C3}: "nscr", \u2115: "Nopf", \u{1D4A9}: "Nscr", \u{1D511}: "Nfr", \u0144: "nacute", \u0143: "Nacute", \u0148: "ncaron", \u0147: "Ncaron", \u00F1: "ntilde", \u00D1: "Ntilde", \u0146: "ncedil", \u0145: "Ncedil", "\u2116": "numero", \u014B: "eng", \u014A: "ENG", \u{1D560}: "oopf", \u{1D52C}: "ofr", \u2134: "oscr", \u{1D4AA}: "Oscr", \u{1D512}: "Ofr", \u{1D546}: "Oopf", \u00BA: "ordm", \u00F3: "oacute", \u00D3: "Oacute", \u00F2: "ograve", \u00D2: "Ograve", \u00F4: "ocirc", \u00D4: "Ocirc", \u00F6: "ouml", \u00D6: "Ouml", \u0151: "odblac", \u0150: "Odblac", \u00F5: "otilde", \u00D5: "Otilde", \u00F8: "oslash", \u00D8: "Oslash", \u014D: "omacr", \u014C: "Omacr", \u0153: "oelig", \u0152: "OElig", \u{1D52D}: "pfr", \u{1D4C5}: "pscr", \u{1D561}: "popf", \u2119: "Popf", \u{1D513}: "Pfr", \u{1D4AB}: "Pscr", \u{1D562}: "qopf", \u{1D52E}: "qfr", \u{1D4C6}: "qscr", \u{1D4AC}: "Qscr", \u{1D514}: "Qfr", \u211A: "Qopf", \u0138: "kgreen", \u{1D52F}: "rfr", \u{1D563}: "ropf", \u{1D4C7}: "rscr", \u211B: "Rscr", \u211C: "Re", \u211D: "Ropf", \u0155: "racute", \u0154: "Racute", \u0159: "rcaron", \u0158: "Rcaron", \u0157: "rcedil", \u0156: "Rcedil", \u{1D564}: "sopf", \u{1D4C8}: "sscr", \u{1D530}: "sfr", \u{1D54A}: "Sopf", \u{1D516}: "Sfr", \u{1D4AE}: "Sscr", "\u24C8": "oS", \u015B: "sacute", \u015A: "Sacute", \u015D: "scirc", \u015C: "Scirc", \u0161: "scaron", \u0160: "Scaron", \u015F: "scedil", \u015E: "Scedil", \u00DF: "szlig", \u{1D531}: "tfr", \u{1D4C9}: "tscr", \u{1D565}: "topf", \u{1D4AF}: "Tscr", \u{1D517}: "Tfr", \u{1D54B}: "Topf", \u0165: "tcaron", \u0164: "Tcaron", \u0163: "tcedil", \u0162: "Tcedil", "\u2122": "trade", \u0167: "tstrok", \u0166: "Tstrok", \u{1D4CA}: "uscr", \u{1D566}: "uopf", \u{1D532}: "ufr", \u{1D54C}: "Uopf", \u{1D518}: "Ufr", \u{1D4B0}: "Uscr", \u00FA: "uacute", \u00DA: "Uacute", \u00F9: "ugrave", \u00D9: "Ugrave", \u016D: "ubreve", \u016C: "Ubreve", \u00FB: "ucirc", \u00DB: "Ucirc", \u016F: "uring", \u016E: "Uring", \u00FC: "uuml", \u00DC: "Uuml", \u0171: "udblac", \u0170: "Udblac", \u0169: "utilde", \u0168: "Utilde", \u0173: "uogon", \u0172: "Uogon", \u016B: "umacr", \u016A: "Umacr", \u{1D533}: "vfr", \u{1D567}: "vopf", \u{1D4CB}: "vscr", \u{1D519}: "Vfr", \u{1D54D}: "Vopf", \u{1D4B1}: "Vscr", \u{1D568}: "wopf", \u{1D4CC}: "wscr", \u{1D534}: "wfr", \u{1D4B2}: "Wscr", \u{1D54E}: "Wopf", \u{1D51A}: "Wfr", \u0175: "wcirc", \u0174: "Wcirc", \u{1D535}: "xfr", \u{1D4CD}: "xscr", \u{1D569}: "xopf", \u{1D54F}: "Xopf", \u{1D51B}: "Xfr", \u{1D4B3}: "Xscr", \u{1D536}: "yfr", \u{1D4CE}: "yscr", \u{1D56A}: "yopf", \u{1D4B4}: "Yscr", \u{1D51C}: "Yfr", \u{1D550}: "Yopf", \u00FD: "yacute", \u00DD: "Yacute", \u0177: "ycirc", \u0176: "Ycirc", \u00FF: "yuml", \u0178: "Yuml", \u{1D4CF}: "zscr", \u{1D537}: "zfr", \u{1D56B}: "zopf", \u2128: "Zfr", \u2124: "Zopf", \u{1D4B5}: "Zscr", \u017A: "zacute", \u0179: "Zacute", \u017E: "zcaron", \u017D: "Zcaron", \u017C: "zdot", \u017B: "Zdot", \u01B5: "imped", \u00FE: "thorn", \u00DE: "THORN", \u0149: "napos", \u03B1: "alpha", \u0391: "Alpha", \u03B2: "beta", \u0392: "Beta", \u03B3: "gamma", \u0393: "Gamma", \u03B4: "delta", \u0394: "Delta", \u03B5: "epsi", \u03F5: "epsiv", \u0395: "Epsilon", \u03DD: "gammad", \u03DC: "Gammad", \u03B6: "zeta", \u0396: "Zeta", \u03B7: "eta", \u0397: "Eta", \u03B8: "theta", \u03D1: "thetav", \u0398: "Theta", \u03B9: "iota", \u0399: "Iota", \u03BA: "kappa", \u03F0: "kappav", \u039A: "Kappa", \u03BB: "lambda", \u039B: "Lambda", \u03BC: "mu", \u00B5: "micro", \u039C: "Mu", \u03BD: "nu", \u039D: "Nu", \u03BE: "xi", \u039E: "Xi", \u03BF: "omicron", \u039F: "Omicron", \u03C0: "pi", \u03D6: "piv", \u03A0: "Pi", \u03C1: "rho", \u03F1: "rhov", \u03A1: "Rho", \u03C3: "sigma", \u03A3: "Sigma", \u03C2: "sigmaf", \u03C4: "tau", \u03A4: "Tau", \u03C5: "upsi", \u03A5: "Upsilon", \u03D2: "Upsi", \u03C6: "phi", \u03D5: "phiv", \u03A6: "Phi", \u03C7: "chi", \u03A7: "Chi", \u03C8: "psi", \u03A8: "Psi", \u03C9: "omega", \u03A9: "ohm", \u0430: "acy", \u0410: "Acy", \u0431: "bcy", \u0411: "Bcy", \u0432: "vcy", \u0412: "Vcy", \u0433: "gcy", \u0413: "Gcy", \u0453: "gjcy", \u0403: "GJcy", \u0434: "dcy", \u0414: "Dcy", \u0452: "djcy", \u0402: "DJcy", \u0435: "iecy", \u0415: "IEcy", \u0451: "iocy", \u0401: "IOcy", \u0454: "jukcy", \u0404: "Jukcy", \u0436: "zhcy", \u0416: "ZHcy", \u0437: "zcy", \u0417: "Zcy", \u0455: "dscy", \u0405: "DScy", \u0438: "icy", \u0418: "Icy", \u0456: "iukcy", \u0406: "Iukcy", \u0457: "yicy", \u0407: "YIcy", \u0439: "jcy", \u0419: "Jcy", \u0458: "jsercy", \u0408: "Jsercy", \u043A: "kcy", \u041A: "Kcy", \u045C: "kjcy", \u040C: "KJcy", \u043B: "lcy", \u041B: "Lcy", \u0459: "ljcy", \u0409: "LJcy", \u043C: "mcy", \u041C: "Mcy", \u043D: "ncy", \u041D: "Ncy", \u045A: "njcy", \u040A: "NJcy", \u043E: "ocy", \u041E: "Ocy", \u043F: "pcy", \u041F: "Pcy", \u0440: "rcy", \u0420: "Rcy", \u0441: "scy", \u0421: "Scy", \u0442: "tcy", \u0422: "Tcy", \u045B: "tshcy", \u040B: "TSHcy", \u0443: "ucy", \u0423: "Ucy", \u045E: "ubrcy", \u040E: "Ubrcy", \u0444: "fcy", \u0424: "Fcy", \u0445: "khcy", \u0425: "KHcy", \u0446: "tscy", \u0426: "TScy", \u0447: "chcy", \u0427: "CHcy", \u045F: "dzcy", \u040F: "DZcy", \u0448: "shcy", \u0428: "SHcy", \u0449: "shchcy", \u0429: "SHCHcy", \u044A: "hardcy", \u042A: "HARDcy", \u044B: "ycy", \u042B: "Ycy", \u044C: "softcy", \u042C: "SOFTcy", \u044D: "ecy", \u042D: "Ecy", \u044E: "yucy", \u042E: "YUcy", \u044F: "yacy", \u042F: "YAcy", \u2135: "aleph", \u2136: "beth", \u2137: "gimel", \u2138: "daleth"};
    var regexEscape = /["&'<>`]/g;
    var escapeMap = {
      '"': "&quot;",
      "&": "&amp;",
      "'": "&#x27;",
      "<": "&lt;",
      ">": "&gt;",
      "`": "&#x60;"
    };
    var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
    var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
    var regexDecode = /&(CounterClockwiseContourIntegral|DoubleLongLeftRightArrow|ClockwiseContourIntegral|NotNestedGreaterGreater|NotSquareSupersetEqual|DiacriticalDoubleAcute|NotRightTriangleEqual|NotSucceedsSlantEqual|NotPrecedesSlantEqual|CloseCurlyDoubleQuote|NegativeVeryThinSpace|DoubleContourIntegral|FilledVerySmallSquare|CapitalDifferentialD|OpenCurlyDoubleQuote|EmptyVerySmallSquare|NestedGreaterGreater|DoubleLongRightArrow|NotLeftTriangleEqual|NotGreaterSlantEqual|ReverseUpEquilibrium|DoubleLeftRightArrow|NotSquareSubsetEqual|NotDoubleVerticalBar|RightArrowLeftArrow|NotGreaterFullEqual|NotRightTriangleBar|SquareSupersetEqual|DownLeftRightVector|DoubleLongLeftArrow|leftrightsquigarrow|LeftArrowRightArrow|NegativeMediumSpace|blacktriangleright|RightDownVectorBar|PrecedesSlantEqual|RightDoubleBracket|SucceedsSlantEqual|NotLeftTriangleBar|RightTriangleEqual|SquareIntersection|RightDownTeeVector|ReverseEquilibrium|NegativeThickSpace|longleftrightarrow|Longleftrightarrow|LongLeftRightArrow|DownRightTeeVector|DownRightVectorBar|GreaterSlantEqual|SquareSubsetEqual|LeftDownVectorBar|LeftDoubleBracket|VerticalSeparator|rightleftharpoons|NotGreaterGreater|NotSquareSuperset|blacktriangleleft|blacktriangledown|NegativeThinSpace|LeftDownTeeVector|NotLessSlantEqual|leftrightharpoons|DoubleUpDownArrow|DoubleVerticalBar|LeftTriangleEqual|FilledSmallSquare|twoheadrightarrow|NotNestedLessLess|DownLeftTeeVector|DownLeftVectorBar|RightAngleBracket|NotTildeFullEqual|NotReverseElement|RightUpDownVector|DiacriticalTilde|NotSucceedsTilde|circlearrowright|NotPrecedesEqual|rightharpoondown|DoubleRightArrow|NotSucceedsEqual|NonBreakingSpace|NotRightTriangle|LessEqualGreater|RightUpTeeVector|LeftAngleBracket|GreaterFullEqual|DownArrowUpArrow|RightUpVectorBar|twoheadleftarrow|GreaterEqualLess|downharpoonright|RightTriangleBar|ntrianglerighteq|NotSupersetEqual|LeftUpDownVector|DiacriticalAcute|rightrightarrows|vartriangleright|UpArrowDownArrow|DiacriticalGrave|UnderParenthesis|EmptySmallSquare|LeftUpVectorBar|leftrightarrows|DownRightVector|downharpoonleft|trianglerighteq|ShortRightArrow|OverParenthesis|DoubleLeftArrow|DoubleDownArrow|NotSquareSubset|bigtriangledown|ntrianglelefteq|UpperRightArrow|curvearrowright|vartriangleleft|NotLeftTriangle|nleftrightarrow|LowerRightArrow|NotHumpDownHump|NotGreaterTilde|rightthreetimes|LeftUpTeeVector|NotGreaterEqual|straightepsilon|LeftTriangleBar|rightsquigarrow|ContourIntegral|rightleftarrows|CloseCurlyQuote|RightDownVector|LeftRightVector|nLeftrightarrow|leftharpoondown|circlearrowleft|SquareSuperset|OpenCurlyQuote|hookrightarrow|HorizontalLine|DiacriticalDot|NotLessGreater|ntriangleright|DoubleRightTee|InvisibleComma|InvisibleTimes|LowerLeftArrow|DownLeftVector|NotSubsetEqual|curvearrowleft|trianglelefteq|NotVerticalBar|TildeFullEqual|downdownarrows|NotGreaterLess|RightTeeVector|ZeroWidthSpace|looparrowright|LongRightArrow|doublebarwedge|ShortLeftArrow|ShortDownArrow|RightVectorBar|GreaterGreater|ReverseElement|rightharpoonup|LessSlantEqual|leftthreetimes|upharpoonright|rightarrowtail|LeftDownVector|Longrightarrow|NestedLessLess|UpperLeftArrow|nshortparallel|leftleftarrows|leftrightarrow|Leftrightarrow|LeftRightArrow|longrightarrow|upharpoonleft|RightArrowBar|ApplyFunction|LeftTeeVector|leftarrowtail|NotEqualTilde|varsubsetneqq|varsupsetneqq|RightTeeArrow|SucceedsEqual|SucceedsTilde|LeftVectorBar|SupersetEqual|hookleftarrow|DifferentialD|VerticalTilde|VeryThinSpace|blacktriangle|bigtriangleup|LessFullEqual|divideontimes|leftharpoonup|UpEquilibrium|ntriangleleft|RightTriangle|measuredangle|shortparallel|longleftarrow|Longleftarrow|LongLeftArrow|DoubleLeftTee|Poincareplane|PrecedesEqual|triangleright|DoubleUpArrow|RightUpVector|fallingdotseq|looparrowleft|PrecedesTilde|NotTildeEqual|NotTildeTilde|smallsetminus|Proportional|triangleleft|triangledown|UnderBracket|NotHumpEqual|exponentiale|ExponentialE|NotLessTilde|HilbertSpace|RightCeiling|blacklozenge|varsupsetneq|HumpDownHump|GreaterEqual|VerticalLine|LeftTeeArrow|NotLessEqual|DownTeeArrow|LeftTriangle|varsubsetneq|Intersection|NotCongruent|DownArrowBar|LeftUpVector|LeftArrowBar|risingdotseq|GreaterTilde|RoundImplies|SquareSubset|ShortUpArrow|NotSuperset|quaternions|precnapprox|backepsilon|preccurlyeq|OverBracket|blacksquare|MediumSpace|VerticalBar|circledcirc|circleddash|CircleMinus|CircleTimes|LessGreater|curlyeqprec|curlyeqsucc|diamondsuit|UpDownArrow|Updownarrow|RuleDelayed|Rrightarrow|updownarrow|RightVector|nRightarrow|nrightarrow|eqslantless|LeftCeiling|Equilibrium|SmallCircle|expectation|NotSucceeds|thickapprox|GreaterLess|SquareUnion|NotPrecedes|NotLessLess|straightphi|succnapprox|succcurlyeq|SubsetEqual|sqsupseteq|Proportion|Laplacetrf|ImaginaryI|supsetneqq|NotGreater|gtreqqless|NotElement|ThickSpace|TildeEqual|TildeTilde|Fouriertrf|rmoustache|EqualTilde|eqslantgtr|UnderBrace|LeftVector|UpArrowBar|nLeftarrow|nsubseteqq|subsetneqq|nsupseteqq|nleftarrow|succapprox|lessapprox|UpTeeArrow|upuparrows|curlywedge|lesseqqgtr|varepsilon|varnothing|RightFloor|complement|CirclePlus|sqsubseteq|Lleftarrow|circledast|RightArrow|Rightarrow|rightarrow|lmoustache|Bernoullis|precapprox|mapstoleft|mapstodown|longmapsto|dotsquare|downarrow|DoubleDot|nsubseteq|supsetneq|leftarrow|nsupseteq|subsetneq|ThinSpace|ngeqslant|subseteqq|HumpEqual|NotSubset|triangleq|NotCupCap|lesseqgtr|heartsuit|TripleDot|Leftarrow|Coproduct|Congruent|varpropto|complexes|gvertneqq|LeftArrow|LessTilde|supseteqq|MinusPlus|CircleDot|nleqslant|NotExists|gtreqless|nparallel|UnionPlus|LeftFloor|checkmark|CenterDot|centerdot|Mellintrf|gtrapprox|bigotimes|OverBrace|spadesuit|therefore|pitchfork|rationals|PlusMinus|Backslash|Therefore|DownBreve|backsimeq|backprime|DownArrow|nshortmid|Downarrow|lvertneqq|eqvparsl|imagline|imagpart|infintie|integers|Integral|intercal|LessLess|Uarrocir|intlarhk|sqsupset|angmsdaf|sqsubset|llcorner|vartheta|cupbrcap|lnapprox|Superset|SuchThat|succnsim|succneqq|angmsdag|biguplus|curlyvee|trpezium|Succeeds|NotTilde|bigwedge|angmsdah|angrtvbd|triminus|cwconint|fpartint|lrcorner|smeparsl|subseteq|urcorner|lurdshar|laemptyv|DDotrahd|approxeq|ldrushar|awconint|mapstoup|backcong|shortmid|triangle|geqslant|gesdotol|timesbar|circledR|circledS|setminus|multimap|naturals|scpolint|ncongdot|RightTee|boxminus|gnapprox|boxtimes|andslope|thicksim|angmsdaa|varsigma|cirfnint|rtriltri|angmsdab|rppolint|angmsdac|barwedge|drbkarow|clubsuit|thetasym|bsolhsub|capbrcup|dzigrarr|doteqdot|DotEqual|dotminus|UnderBar|NotEqual|realpart|otimesas|ulcorner|hksearow|hkswarow|parallel|PartialD|elinters|emptyset|plusacir|bbrktbrk|angmsdad|pointint|bigoplus|angmsdae|Precedes|bigsqcup|varkappa|notindot|supseteq|precneqq|precnsim|profalar|profline|profsurf|leqslant|lesdotor|raemptyv|subplus|notnivb|notnivc|subrarr|zigrarr|vzigzag|submult|subedot|Element|between|cirscir|larrbfs|larrsim|lotimes|lbrksld|lbrkslu|lozenge|ldrdhar|dbkarow|bigcirc|epsilon|simrarr|simplus|ltquest|Epsilon|luruhar|gtquest|maltese|npolint|eqcolon|npreceq|bigodot|ddagger|gtrless|bnequiv|harrcir|ddotseq|equivDD|backsim|demptyv|nsqsube|nsqsupe|Upsilon|nsubset|upsilon|minusdu|nsucceq|swarrow|nsupset|coloneq|searrow|boxplus|napprox|natural|asympeq|alefsym|congdot|nearrow|bigstar|diamond|supplus|tritime|LeftTee|nvinfin|triplus|NewLine|nvltrie|nvrtrie|nwarrow|nexists|Diamond|ruluhar|Implies|supmult|angzarr|suplarr|suphsub|questeq|because|digamma|Because|olcross|bemptyv|omicron|Omicron|rotimes|NoBreak|intprod|angrtvb|orderof|uwangle|suphsol|lesdoto|orslope|DownTee|realine|cudarrl|rdldhar|OverBar|supedot|lessdot|supdsub|topfork|succsim|rbrkslu|rbrksld|pertenk|cudarrr|isindot|planckh|lessgtr|pluscir|gesdoto|plussim|plustwo|lesssim|cularrp|rarrsim|Cayleys|notinva|notinvb|notinvc|UpArrow|Uparrow|uparrow|NotLess|dwangle|precsim|Product|curarrm|Cconint|dotplus|rarrbfs|ccupssm|Cedilla|cemptyv|notniva|quatint|frac35|frac38|frac45|frac56|frac58|frac78|tridot|xoplus|gacute|gammad|Gammad|lfisht|lfloor|bigcup|sqsupe|gbreve|Gbreve|lharul|sqsube|sqcups|Gcedil|apacir|llhard|lmidot|Lmidot|lmoust|andand|sqcaps|approx|Abreve|spades|circeq|tprime|divide|topcir|Assign|topbot|gesdot|divonx|xuplus|timesd|gesles|atilde|solbar|SOFTcy|loplus|timesb|lowast|lowbar|dlcorn|dlcrop|softcy|dollar|lparlt|thksim|lrhard|Atilde|lsaquo|smashp|bigvee|thinsp|wreath|bkarow|lsquor|lstrok|Lstrok|lthree|ltimes|ltlarr|DotDot|simdot|ltrPar|weierp|xsqcup|angmsd|sigmav|sigmaf|zeetrf|Zcaron|zcaron|mapsto|vsupne|thetav|cirmid|marker|mcomma|Zacute|vsubnE|there4|gtlPar|vsubne|bottom|gtrarr|SHCHcy|shchcy|midast|midcir|middot|minusb|minusd|gtrdot|bowtie|sfrown|mnplus|models|colone|seswar|Colone|mstpos|searhk|gtrsim|nacute|Nacute|boxbox|telrec|hairsp|Tcedil|nbumpe|scnsim|ncaron|Ncaron|ncedil|Ncedil|hamilt|Scedil|nearhk|hardcy|HARDcy|tcedil|Tcaron|commat|nequiv|nesear|tcaron|target|hearts|nexist|varrho|scedil|Scaron|scaron|hellip|Sacute|sacute|hercon|swnwar|compfn|rtimes|rthree|rsquor|rsaquo|zacute|wedgeq|homtht|barvee|barwed|Barwed|rpargt|horbar|conint|swarhk|roplus|nltrie|hslash|hstrok|Hstrok|rmoust|Conint|bprime|hybull|hyphen|iacute|Iacute|supsup|supsub|supsim|varphi|coprod|brvbar|agrave|Supset|supset|igrave|Igrave|notinE|Agrave|iiiint|iinfin|copysr|wedbar|Verbar|vangrt|becaus|incare|verbar|inodot|bullet|drcorn|intcal|drcrop|cularr|vellip|Utilde|bumpeq|cupcap|dstrok|Dstrok|CupCap|cupcup|cupdot|eacute|Eacute|supdot|iquest|easter|ecaron|Ecaron|ecolon|isinsv|utilde|itilde|Itilde|curarr|succeq|Bumpeq|cacute|ulcrop|nparsl|Cacute|nprcue|egrave|Egrave|nrarrc|nrarrw|subsup|subsub|nrtrie|jsercy|nsccue|Jsercy|kappav|kcedil|Kcedil|subsim|ulcorn|nsimeq|egsdot|veebar|kgreen|capand|elsdot|Subset|subset|curren|aacute|lacute|Lacute|emptyv|ntilde|Ntilde|lagran|lambda|Lambda|capcap|Ugrave|langle|subdot|emsp13|numero|emsp14|nvdash|nvDash|nVdash|nVDash|ugrave|ufisht|nvHarr|larrfs|nvlArr|larrhk|larrlp|larrpl|nvrArr|Udblac|nwarhk|larrtl|nwnear|oacute|Oacute|latail|lAtail|sstarf|lbrace|odblac|Odblac|lbrack|udblac|odsold|eparsl|lcaron|Lcaron|ograve|Ograve|lcedil|Lcedil|Aacute|ssmile|ssetmn|squarf|ldquor|capcup|ominus|cylcty|rharul|eqcirc|dagger|rfloor|rfisht|Dagger|daleth|equals|origof|capdot|equest|dcaron|Dcaron|rdquor|oslash|Oslash|otilde|Otilde|otimes|Otimes|urcrop|Ubreve|ubreve|Yacute|Uacute|uacute|Rcedil|rcedil|urcorn|parsim|Rcaron|Vdashl|rcaron|Tstrok|percnt|period|permil|Exists|yacute|rbrack|rbrace|phmmat|ccaron|Ccaron|planck|ccedil|plankv|tstrok|female|plusdo|plusdu|ffilig|plusmn|ffllig|Ccedil|rAtail|dfisht|bernou|ratail|Rarrtl|rarrtl|angsph|rarrpl|rarrlp|rarrhk|xwedge|xotime|forall|ForAll|Vvdash|vsupnE|preceq|bigcap|frac12|frac13|frac14|primes|rarrfs|prnsim|frac15|Square|frac16|square|lesdot|frac18|frac23|propto|prurel|rarrap|rangle|puncsp|frac25|Racute|qprime|racute|lesges|frac34|abreve|AElig|eqsim|utdot|setmn|urtri|Equal|Uring|seArr|uring|searr|dashv|Dashv|mumap|nabla|iogon|Iogon|sdote|sdotb|scsim|napid|napos|equiv|natur|Acirc|dblac|erarr|nbump|iprod|erDot|ucirc|awint|esdot|angrt|ncong|isinE|scnap|Scirc|scirc|ndash|isins|Ubrcy|nearr|neArr|isinv|nedot|ubrcy|acute|Ycirc|iukcy|Iukcy|xutri|nesim|caret|jcirc|Jcirc|caron|twixt|ddarr|sccue|exist|jmath|sbquo|ngeqq|angst|ccaps|lceil|ngsim|UpTee|delta|Delta|rtrif|nharr|nhArr|nhpar|rtrie|jukcy|Jukcy|kappa|rsquo|Kappa|nlarr|nlArr|TSHcy|rrarr|aogon|Aogon|fflig|xrarr|tshcy|ccirc|nleqq|filig|upsih|nless|dharl|nlsim|fjlig|ropar|nltri|dharr|robrk|roarr|fllig|fltns|roang|rnmid|subnE|subne|lAarr|trisb|Ccirc|acirc|ccups|blank|VDash|forkv|Vdash|langd|cedil|blk12|blk14|laquo|strns|diams|notin|vDash|larrb|blk34|block|disin|uplus|vdash|vBarv|aelig|starf|Wedge|check|xrArr|lates|lbarr|lBarr|notni|lbbrk|bcong|frasl|lbrke|frown|vrtri|vprop|vnsup|gamma|Gamma|wedge|xodot|bdquo|srarr|doteq|ldquo|boxdl|boxdL|gcirc|Gcirc|boxDl|boxDL|boxdr|boxdR|boxDr|TRADE|trade|rlhar|boxDR|vnsub|npart|vltri|rlarr|boxhd|boxhD|nprec|gescc|nrarr|nrArr|boxHd|boxHD|boxhu|boxhU|nrtri|boxHu|clubs|boxHU|times|colon|Colon|gimel|xlArr|Tilde|nsime|tilde|nsmid|nspar|THORN|thorn|xlarr|nsube|nsubE|thkap|xhArr|comma|nsucc|boxul|boxuL|nsupe|nsupE|gneqq|gnsim|boxUl|boxUL|grave|boxur|boxuR|boxUr|boxUR|lescc|angle|bepsi|boxvh|varpi|boxvH|numsp|Theta|gsime|gsiml|theta|boxVh|boxVH|boxvl|gtcir|gtdot|boxvL|boxVl|boxVL|crarr|cross|Cross|nvsim|boxvr|nwarr|nwArr|sqsup|dtdot|Uogon|lhard|lharu|dtrif|ocirc|Ocirc|lhblk|duarr|odash|sqsub|Hacek|sqcup|llarr|duhar|oelig|OElig|ofcir|boxvR|uogon|lltri|boxVr|csube|uuarr|ohbar|csupe|ctdot|olarr|olcir|harrw|oline|sqcap|omacr|Omacr|omega|Omega|boxVR|aleph|lneqq|lnsim|loang|loarr|rharu|lobrk|hcirc|operp|oplus|rhard|Hcirc|orarr|Union|order|ecirc|Ecirc|cuepr|szlig|cuesc|breve|reals|eDDot|Breve|hoarr|lopar|utrif|rdquo|Umacr|umacr|efDot|swArr|ultri|alpha|rceil|ovbar|swarr|Wcirc|wcirc|smtes|smile|bsemi|lrarr|aring|parsl|lrhar|bsime|uhblk|lrtri|cupor|Aring|uharr|uharl|slarr|rbrke|bsolb|lsime|rbbrk|RBarr|lsimg|phone|rBarr|rbarr|icirc|lsquo|Icirc|emacr|Emacr|ratio|simne|plusb|simlE|simgE|simeq|pluse|ltcir|ltdot|empty|xharr|xdtri|iexcl|Alpha|ltrie|rarrw|pound|ltrif|xcirc|bumpe|prcue|bumpE|asymp|amacr|cuvee|Sigma|sigma|iiint|udhar|iiota|ijlig|IJlig|supnE|imacr|Imacr|prime|Prime|image|prnap|eogon|Eogon|rarrc|mdash|mDDot|cuwed|imath|supne|imped|Amacr|udarr|prsim|micro|rarrb|cwint|raquo|infin|eplus|range|rangd|Ucirc|radic|minus|amalg|veeeq|rAarr|epsiv|ycirc|quest|sharp|quot|zwnj|Qscr|race|qscr|Qopf|qopf|qint|rang|Rang|Zscr|zscr|Zopf|zopf|rarr|rArr|Rarr|Pscr|pscr|prop|prod|prnE|prec|ZHcy|zhcy|prap|Zeta|zeta|Popf|popf|Zdot|plus|zdot|Yuml|yuml|phiv|YUcy|yucy|Yscr|yscr|perp|Yopf|yopf|part|para|YIcy|Ouml|rcub|yicy|YAcy|rdca|ouml|osol|Oscr|rdsh|yacy|real|oscr|xvee|andd|rect|andv|Xscr|oror|ordm|ordf|xscr|ange|aopf|Aopf|rHar|Xopf|opar|Oopf|xopf|xnis|rhov|oopf|omid|xmap|oint|apid|apos|ogon|ascr|Ascr|odot|odiv|xcup|xcap|ocir|oast|nvlt|nvle|nvgt|nvge|nvap|Wscr|wscr|auml|ntlg|ntgl|nsup|nsub|nsim|Nscr|nscr|nsce|Wopf|ring|npre|wopf|npar|Auml|Barv|bbrk|Nopf|nopf|nmid|nLtv|beta|ropf|Ropf|Beta|beth|nles|rpar|nleq|bnot|bNot|nldr|NJcy|rscr|Rscr|Vscr|vscr|rsqb|njcy|bopf|nisd|Bopf|rtri|Vopf|nGtv|ngtr|vopf|boxh|boxH|boxv|nges|ngeq|boxV|bscr|scap|Bscr|bsim|Vert|vert|bsol|bull|bump|caps|cdot|ncup|scnE|ncap|nbsp|napE|Cdot|cent|sdot|Vbar|nang|vBar|chcy|Mscr|mscr|sect|semi|CHcy|Mopf|mopf|sext|circ|cire|mldr|mlcp|cirE|comp|shcy|SHcy|vArr|varr|cong|copf|Copf|copy|COPY|malt|male|macr|lvnE|cscr|ltri|sime|ltcc|simg|Cscr|siml|csub|Uuml|lsqb|lsim|uuml|csup|Lscr|lscr|utri|smid|lpar|cups|smte|lozf|darr|Lopf|Uscr|solb|lopf|sopf|Sopf|lneq|uscr|spar|dArr|lnap|Darr|dash|Sqrt|LJcy|ljcy|lHar|dHar|Upsi|upsi|diam|lesg|djcy|DJcy|leqq|dopf|Dopf|dscr|Dscr|dscy|ldsh|ldca|squf|DScy|sscr|Sscr|dsol|lcub|late|star|Star|Uopf|Larr|lArr|larr|uopf|dtri|dzcy|sube|subE|Lang|lang|Kscr|kscr|Kopf|kopf|KJcy|kjcy|KHcy|khcy|DZcy|ecir|edot|eDot|Jscr|jscr|succ|Jopf|jopf|Edot|uHar|emsp|ensp|Iuml|iuml|eopf|isin|Iscr|iscr|Eopf|epar|sung|epsi|escr|sup1|sup2|sup3|Iota|iota|supe|supE|Iopf|iopf|IOcy|iocy|Escr|esim|Esim|imof|Uarr|QUOT|uArr|uarr|euml|IEcy|iecy|Idot|Euml|euro|excl|Hscr|hscr|Hopf|hopf|TScy|tscy|Tscr|hbar|tscr|flat|tbrk|fnof|hArr|harr|half|fopf|Fopf|tdot|gvnE|fork|trie|gtcc|fscr|Fscr|gdot|gsim|Gscr|gscr|Gopf|gopf|gneq|Gdot|tosa|gnap|Topf|topf|geqq|toea|GJcy|gjcy|tint|gesl|mid|Sfr|ggg|top|ges|gla|glE|glj|geq|gne|gEl|gel|gnE|Gcy|gcy|gap|Tfr|tfr|Tcy|tcy|Hat|Tau|Ffr|tau|Tab|hfr|Hfr|ffr|Fcy|fcy|icy|Icy|iff|ETH|eth|ifr|Ifr|Eta|eta|int|Int|Sup|sup|ucy|Ucy|Sum|sum|jcy|ENG|ufr|Ufr|eng|Jcy|jfr|els|ell|egs|Efr|efr|Jfr|uml|kcy|Kcy|Ecy|ecy|kfr|Kfr|lap|Sub|sub|lat|lcy|Lcy|leg|Dot|dot|lEg|leq|les|squ|div|die|lfr|Lfr|lgE|Dfr|dfr|Del|deg|Dcy|dcy|lne|lnE|sol|loz|smt|Cup|lrm|cup|lsh|Lsh|sim|shy|map|Map|mcy|Mcy|mfr|Mfr|mho|gfr|Gfr|sfr|cir|Chi|chi|nap|Cfr|vcy|Vcy|cfr|Scy|scy|ncy|Ncy|vee|Vee|Cap|cap|nfr|scE|sce|Nfr|nge|ngE|nGg|vfr|Vfr|ngt|bot|nGt|nis|niv|Rsh|rsh|nle|nlE|bne|Bfr|bfr|nLl|nlt|nLt|Bcy|bcy|not|Not|rlm|wfr|Wfr|npr|nsc|num|ocy|ast|Ocy|ofr|xfr|Xfr|Ofr|ogt|ohm|apE|olt|Rho|ape|rho|Rfr|rfr|ord|REG|ang|reg|orv|And|and|AMP|Rcy|amp|Afr|ycy|Ycy|yen|yfr|Yfr|rcy|par|pcy|Pcy|pfr|Pfr|phi|Phi|afr|Acy|acy|zcy|Zcy|piv|acE|acd|zfr|Zfr|pre|prE|psi|Psi|qfr|Qfr|zwj|Or|ge|Gg|gt|gg|el|oS|lt|Lt|LT|Re|lg|gl|eg|ne|Im|it|le|DD|wp|wr|nu|Nu|dd|lE|Sc|sc|pi|Pi|ee|af|ll|Ll|rx|gE|xi|pm|Xi|ic|pr|Pr|in|ni|mp|mu|ac|Mu|or|ap|Gt|GT|ii);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)(?!;)([=a-zA-Z0-9]?)|&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+)/g;
    var decodeMap = {aacute: "\xE1", Aacute: "\xC1", abreve: "\u0103", Abreve: "\u0102", ac: "\u223E", acd: "\u223F", acE: "\u223E\u0333", acirc: "\xE2", Acirc: "\xC2", acute: "\xB4", acy: "\u0430", Acy: "\u0410", aelig: "\xE6", AElig: "\xC6", af: "\u2061", afr: "\u{1D51E}", Afr: "\u{1D504}", agrave: "\xE0", Agrave: "\xC0", alefsym: "\u2135", aleph: "\u2135", alpha: "\u03B1", Alpha: "\u0391", amacr: "\u0101", Amacr: "\u0100", amalg: "\u2A3F", amp: "&", AMP: "&", and: "\u2227", And: "\u2A53", andand: "\u2A55", andd: "\u2A5C", andslope: "\u2A58", andv: "\u2A5A", ang: "\u2220", ange: "\u29A4", angle: "\u2220", angmsd: "\u2221", angmsdaa: "\u29A8", angmsdab: "\u29A9", angmsdac: "\u29AA", angmsdad: "\u29AB", angmsdae: "\u29AC", angmsdaf: "\u29AD", angmsdag: "\u29AE", angmsdah: "\u29AF", angrt: "\u221F", angrtvb: "\u22BE", angrtvbd: "\u299D", angsph: "\u2222", angst: "\xC5", angzarr: "\u237C", aogon: "\u0105", Aogon: "\u0104", aopf: "\u{1D552}", Aopf: "\u{1D538}", ap: "\u2248", apacir: "\u2A6F", ape: "\u224A", apE: "\u2A70", apid: "\u224B", apos: "'", ApplyFunction: "\u2061", approx: "\u2248", approxeq: "\u224A", aring: "\xE5", Aring: "\xC5", ascr: "\u{1D4B6}", Ascr: "\u{1D49C}", Assign: "\u2254", ast: "*", asymp: "\u2248", asympeq: "\u224D", atilde: "\xE3", Atilde: "\xC3", auml: "\xE4", Auml: "\xC4", awconint: "\u2233", awint: "\u2A11", backcong: "\u224C", backepsilon: "\u03F6", backprime: "\u2035", backsim: "\u223D", backsimeq: "\u22CD", Backslash: "\u2216", Barv: "\u2AE7", barvee: "\u22BD", barwed: "\u2305", Barwed: "\u2306", barwedge: "\u2305", bbrk: "\u23B5", bbrktbrk: "\u23B6", bcong: "\u224C", bcy: "\u0431", Bcy: "\u0411", bdquo: "\u201E", becaus: "\u2235", because: "\u2235", Because: "\u2235", bemptyv: "\u29B0", bepsi: "\u03F6", bernou: "\u212C", Bernoullis: "\u212C", beta: "\u03B2", Beta: "\u0392", beth: "\u2136", between: "\u226C", bfr: "\u{1D51F}", Bfr: "\u{1D505}", bigcap: "\u22C2", bigcirc: "\u25EF", bigcup: "\u22C3", bigodot: "\u2A00", bigoplus: "\u2A01", bigotimes: "\u2A02", bigsqcup: "\u2A06", bigstar: "\u2605", bigtriangledown: "\u25BD", bigtriangleup: "\u25B3", biguplus: "\u2A04", bigvee: "\u22C1", bigwedge: "\u22C0", bkarow: "\u290D", blacklozenge: "\u29EB", blacksquare: "\u25AA", blacktriangle: "\u25B4", blacktriangledown: "\u25BE", blacktriangleleft: "\u25C2", blacktriangleright: "\u25B8", blank: "\u2423", blk12: "\u2592", blk14: "\u2591", blk34: "\u2593", block: "\u2588", bne: "=\u20E5", bnequiv: "\u2261\u20E5", bnot: "\u2310", bNot: "\u2AED", bopf: "\u{1D553}", Bopf: "\u{1D539}", bot: "\u22A5", bottom: "\u22A5", bowtie: "\u22C8", boxbox: "\u29C9", boxdl: "\u2510", boxdL: "\u2555", boxDl: "\u2556", boxDL: "\u2557", boxdr: "\u250C", boxdR: "\u2552", boxDr: "\u2553", boxDR: "\u2554", boxh: "\u2500", boxH: "\u2550", boxhd: "\u252C", boxhD: "\u2565", boxHd: "\u2564", boxHD: "\u2566", boxhu: "\u2534", boxhU: "\u2568", boxHu: "\u2567", boxHU: "\u2569", boxminus: "\u229F", boxplus: "\u229E", boxtimes: "\u22A0", boxul: "\u2518", boxuL: "\u255B", boxUl: "\u255C", boxUL: "\u255D", boxur: "\u2514", boxuR: "\u2558", boxUr: "\u2559", boxUR: "\u255A", boxv: "\u2502", boxV: "\u2551", boxvh: "\u253C", boxvH: "\u256A", boxVh: "\u256B", boxVH: "\u256C", boxvl: "\u2524", boxvL: "\u2561", boxVl: "\u2562", boxVL: "\u2563", boxvr: "\u251C", boxvR: "\u255E", boxVr: "\u255F", boxVR: "\u2560", bprime: "\u2035", breve: "\u02D8", Breve: "\u02D8", brvbar: "\xA6", bscr: "\u{1D4B7}", Bscr: "\u212C", bsemi: "\u204F", bsim: "\u223D", bsime: "\u22CD", bsol: "\\", bsolb: "\u29C5", bsolhsub: "\u27C8", bull: "\u2022", bullet: "\u2022", bump: "\u224E", bumpe: "\u224F", bumpE: "\u2AAE", bumpeq: "\u224F", Bumpeq: "\u224E", cacute: "\u0107", Cacute: "\u0106", cap: "\u2229", Cap: "\u22D2", capand: "\u2A44", capbrcup: "\u2A49", capcap: "\u2A4B", capcup: "\u2A47", capdot: "\u2A40", CapitalDifferentialD: "\u2145", caps: "\u2229\uFE00", caret: "\u2041", caron: "\u02C7", Cayleys: "\u212D", ccaps: "\u2A4D", ccaron: "\u010D", Ccaron: "\u010C", ccedil: "\xE7", Ccedil: "\xC7", ccirc: "\u0109", Ccirc: "\u0108", Cconint: "\u2230", ccups: "\u2A4C", ccupssm: "\u2A50", cdot: "\u010B", Cdot: "\u010A", cedil: "\xB8", Cedilla: "\xB8", cemptyv: "\u29B2", cent: "\xA2", centerdot: "\xB7", CenterDot: "\xB7", cfr: "\u{1D520}", Cfr: "\u212D", chcy: "\u0447", CHcy: "\u0427", check: "\u2713", checkmark: "\u2713", chi: "\u03C7", Chi: "\u03A7", cir: "\u25CB", circ: "\u02C6", circeq: "\u2257", circlearrowleft: "\u21BA", circlearrowright: "\u21BB", circledast: "\u229B", circledcirc: "\u229A", circleddash: "\u229D", CircleDot: "\u2299", circledR: "\xAE", circledS: "\u24C8", CircleMinus: "\u2296", CirclePlus: "\u2295", CircleTimes: "\u2297", cire: "\u2257", cirE: "\u29C3", cirfnint: "\u2A10", cirmid: "\u2AEF", cirscir: "\u29C2", ClockwiseContourIntegral: "\u2232", CloseCurlyDoubleQuote: "\u201D", CloseCurlyQuote: "\u2019", clubs: "\u2663", clubsuit: "\u2663", colon: ":", Colon: "\u2237", colone: "\u2254", Colone: "\u2A74", coloneq: "\u2254", comma: ",", commat: "@", comp: "\u2201", compfn: "\u2218", complement: "\u2201", complexes: "\u2102", cong: "\u2245", congdot: "\u2A6D", Congruent: "\u2261", conint: "\u222E", Conint: "\u222F", ContourIntegral: "\u222E", copf: "\u{1D554}", Copf: "\u2102", coprod: "\u2210", Coproduct: "\u2210", copy: "\xA9", COPY: "\xA9", copysr: "\u2117", CounterClockwiseContourIntegral: "\u2233", crarr: "\u21B5", cross: "\u2717", Cross: "\u2A2F", cscr: "\u{1D4B8}", Cscr: "\u{1D49E}", csub: "\u2ACF", csube: "\u2AD1", csup: "\u2AD0", csupe: "\u2AD2", ctdot: "\u22EF", cudarrl: "\u2938", cudarrr: "\u2935", cuepr: "\u22DE", cuesc: "\u22DF", cularr: "\u21B6", cularrp: "\u293D", cup: "\u222A", Cup: "\u22D3", cupbrcap: "\u2A48", cupcap: "\u2A46", CupCap: "\u224D", cupcup: "\u2A4A", cupdot: "\u228D", cupor: "\u2A45", cups: "\u222A\uFE00", curarr: "\u21B7", curarrm: "\u293C", curlyeqprec: "\u22DE", curlyeqsucc: "\u22DF", curlyvee: "\u22CE", curlywedge: "\u22CF", curren: "\xA4", curvearrowleft: "\u21B6", curvearrowright: "\u21B7", cuvee: "\u22CE", cuwed: "\u22CF", cwconint: "\u2232", cwint: "\u2231", cylcty: "\u232D", dagger: "\u2020", Dagger: "\u2021", daleth: "\u2138", darr: "\u2193", dArr: "\u21D3", Darr: "\u21A1", dash: "\u2010", dashv: "\u22A3", Dashv: "\u2AE4", dbkarow: "\u290F", dblac: "\u02DD", dcaron: "\u010F", Dcaron: "\u010E", dcy: "\u0434", Dcy: "\u0414", dd: "\u2146", DD: "\u2145", ddagger: "\u2021", ddarr: "\u21CA", DDotrahd: "\u2911", ddotseq: "\u2A77", deg: "\xB0", Del: "\u2207", delta: "\u03B4", Delta: "\u0394", demptyv: "\u29B1", dfisht: "\u297F", dfr: "\u{1D521}", Dfr: "\u{1D507}", dHar: "\u2965", dharl: "\u21C3", dharr: "\u21C2", DiacriticalAcute: "\xB4", DiacriticalDot: "\u02D9", DiacriticalDoubleAcute: "\u02DD", DiacriticalGrave: "`", DiacriticalTilde: "\u02DC", diam: "\u22C4", diamond: "\u22C4", Diamond: "\u22C4", diamondsuit: "\u2666", diams: "\u2666", die: "\xA8", DifferentialD: "\u2146", digamma: "\u03DD", disin: "\u22F2", div: "\xF7", divide: "\xF7", divideontimes: "\u22C7", divonx: "\u22C7", djcy: "\u0452", DJcy: "\u0402", dlcorn: "\u231E", dlcrop: "\u230D", dollar: "$", dopf: "\u{1D555}", Dopf: "\u{1D53B}", dot: "\u02D9", Dot: "\xA8", DotDot: "\u20DC", doteq: "\u2250", doteqdot: "\u2251", DotEqual: "\u2250", dotminus: "\u2238", dotplus: "\u2214", dotsquare: "\u22A1", doublebarwedge: "\u2306", DoubleContourIntegral: "\u222F", DoubleDot: "\xA8", DoubleDownArrow: "\u21D3", DoubleLeftArrow: "\u21D0", DoubleLeftRightArrow: "\u21D4", DoubleLeftTee: "\u2AE4", DoubleLongLeftArrow: "\u27F8", DoubleLongLeftRightArrow: "\u27FA", DoubleLongRightArrow: "\u27F9", DoubleRightArrow: "\u21D2", DoubleRightTee: "\u22A8", DoubleUpArrow: "\u21D1", DoubleUpDownArrow: "\u21D5", DoubleVerticalBar: "\u2225", downarrow: "\u2193", Downarrow: "\u21D3", DownArrow: "\u2193", DownArrowBar: "\u2913", DownArrowUpArrow: "\u21F5", DownBreve: "\u0311", downdownarrows: "\u21CA", downharpoonleft: "\u21C3", downharpoonright: "\u21C2", DownLeftRightVector: "\u2950", DownLeftTeeVector: "\u295E", DownLeftVector: "\u21BD", DownLeftVectorBar: "\u2956", DownRightTeeVector: "\u295F", DownRightVector: "\u21C1", DownRightVectorBar: "\u2957", DownTee: "\u22A4", DownTeeArrow: "\u21A7", drbkarow: "\u2910", drcorn: "\u231F", drcrop: "\u230C", dscr: "\u{1D4B9}", Dscr: "\u{1D49F}", dscy: "\u0455", DScy: "\u0405", dsol: "\u29F6", dstrok: "\u0111", Dstrok: "\u0110", dtdot: "\u22F1", dtri: "\u25BF", dtrif: "\u25BE", duarr: "\u21F5", duhar: "\u296F", dwangle: "\u29A6", dzcy: "\u045F", DZcy: "\u040F", dzigrarr: "\u27FF", eacute: "\xE9", Eacute: "\xC9", easter: "\u2A6E", ecaron: "\u011B", Ecaron: "\u011A", ecir: "\u2256", ecirc: "\xEA", Ecirc: "\xCA", ecolon: "\u2255", ecy: "\u044D", Ecy: "\u042D", eDDot: "\u2A77", edot: "\u0117", eDot: "\u2251", Edot: "\u0116", ee: "\u2147", efDot: "\u2252", efr: "\u{1D522}", Efr: "\u{1D508}", eg: "\u2A9A", egrave: "\xE8", Egrave: "\xC8", egs: "\u2A96", egsdot: "\u2A98", el: "\u2A99", Element: "\u2208", elinters: "\u23E7", ell: "\u2113", els: "\u2A95", elsdot: "\u2A97", emacr: "\u0113", Emacr: "\u0112", empty: "\u2205", emptyset: "\u2205", EmptySmallSquare: "\u25FB", emptyv: "\u2205", EmptyVerySmallSquare: "\u25AB", emsp: "\u2003", emsp13: "\u2004", emsp14: "\u2005", eng: "\u014B", ENG: "\u014A", ensp: "\u2002", eogon: "\u0119", Eogon: "\u0118", eopf: "\u{1D556}", Eopf: "\u{1D53C}", epar: "\u22D5", eparsl: "\u29E3", eplus: "\u2A71", epsi: "\u03B5", epsilon: "\u03B5", Epsilon: "\u0395", epsiv: "\u03F5", eqcirc: "\u2256", eqcolon: "\u2255", eqsim: "\u2242", eqslantgtr: "\u2A96", eqslantless: "\u2A95", Equal: "\u2A75", equals: "=", EqualTilde: "\u2242", equest: "\u225F", Equilibrium: "\u21CC", equiv: "\u2261", equivDD: "\u2A78", eqvparsl: "\u29E5", erarr: "\u2971", erDot: "\u2253", escr: "\u212F", Escr: "\u2130", esdot: "\u2250", esim: "\u2242", Esim: "\u2A73", eta: "\u03B7", Eta: "\u0397", eth: "\xF0", ETH: "\xD0", euml: "\xEB", Euml: "\xCB", euro: "\u20AC", excl: "!", exist: "\u2203", Exists: "\u2203", expectation: "\u2130", exponentiale: "\u2147", ExponentialE: "\u2147", fallingdotseq: "\u2252", fcy: "\u0444", Fcy: "\u0424", female: "\u2640", ffilig: "\uFB03", fflig: "\uFB00", ffllig: "\uFB04", ffr: "\u{1D523}", Ffr: "\u{1D509}", filig: "\uFB01", FilledSmallSquare: "\u25FC", FilledVerySmallSquare: "\u25AA", fjlig: "fj", flat: "\u266D", fllig: "\uFB02", fltns: "\u25B1", fnof: "\u0192", fopf: "\u{1D557}", Fopf: "\u{1D53D}", forall: "\u2200", ForAll: "\u2200", fork: "\u22D4", forkv: "\u2AD9", Fouriertrf: "\u2131", fpartint: "\u2A0D", frac12: "\xBD", frac13: "\u2153", frac14: "\xBC", frac15: "\u2155", frac16: "\u2159", frac18: "\u215B", frac23: "\u2154", frac25: "\u2156", frac34: "\xBE", frac35: "\u2157", frac38: "\u215C", frac45: "\u2158", frac56: "\u215A", frac58: "\u215D", frac78: "\u215E", frasl: "\u2044", frown: "\u2322", fscr: "\u{1D4BB}", Fscr: "\u2131", gacute: "\u01F5", gamma: "\u03B3", Gamma: "\u0393", gammad: "\u03DD", Gammad: "\u03DC", gap: "\u2A86", gbreve: "\u011F", Gbreve: "\u011E", Gcedil: "\u0122", gcirc: "\u011D", Gcirc: "\u011C", gcy: "\u0433", Gcy: "\u0413", gdot: "\u0121", Gdot: "\u0120", ge: "\u2265", gE: "\u2267", gel: "\u22DB", gEl: "\u2A8C", geq: "\u2265", geqq: "\u2267", geqslant: "\u2A7E", ges: "\u2A7E", gescc: "\u2AA9", gesdot: "\u2A80", gesdoto: "\u2A82", gesdotol: "\u2A84", gesl: "\u22DB\uFE00", gesles: "\u2A94", gfr: "\u{1D524}", Gfr: "\u{1D50A}", gg: "\u226B", Gg: "\u22D9", ggg: "\u22D9", gimel: "\u2137", gjcy: "\u0453", GJcy: "\u0403", gl: "\u2277", gla: "\u2AA5", glE: "\u2A92", glj: "\u2AA4", gnap: "\u2A8A", gnapprox: "\u2A8A", gne: "\u2A88", gnE: "\u2269", gneq: "\u2A88", gneqq: "\u2269", gnsim: "\u22E7", gopf: "\u{1D558}", Gopf: "\u{1D53E}", grave: "`", GreaterEqual: "\u2265", GreaterEqualLess: "\u22DB", GreaterFullEqual: "\u2267", GreaterGreater: "\u2AA2", GreaterLess: "\u2277", GreaterSlantEqual: "\u2A7E", GreaterTilde: "\u2273", gscr: "\u210A", Gscr: "\u{1D4A2}", gsim: "\u2273", gsime: "\u2A8E", gsiml: "\u2A90", gt: ">", Gt: "\u226B", GT: ">", gtcc: "\u2AA7", gtcir: "\u2A7A", gtdot: "\u22D7", gtlPar: "\u2995", gtquest: "\u2A7C", gtrapprox: "\u2A86", gtrarr: "\u2978", gtrdot: "\u22D7", gtreqless: "\u22DB", gtreqqless: "\u2A8C", gtrless: "\u2277", gtrsim: "\u2273", gvertneqq: "\u2269\uFE00", gvnE: "\u2269\uFE00", Hacek: "\u02C7", hairsp: "\u200A", half: "\xBD", hamilt: "\u210B", hardcy: "\u044A", HARDcy: "\u042A", harr: "\u2194", hArr: "\u21D4", harrcir: "\u2948", harrw: "\u21AD", Hat: "^", hbar: "\u210F", hcirc: "\u0125", Hcirc: "\u0124", hearts: "\u2665", heartsuit: "\u2665", hellip: "\u2026", hercon: "\u22B9", hfr: "\u{1D525}", Hfr: "\u210C", HilbertSpace: "\u210B", hksearow: "\u2925", hkswarow: "\u2926", hoarr: "\u21FF", homtht: "\u223B", hookleftarrow: "\u21A9", hookrightarrow: "\u21AA", hopf: "\u{1D559}", Hopf: "\u210D", horbar: "\u2015", HorizontalLine: "\u2500", hscr: "\u{1D4BD}", Hscr: "\u210B", hslash: "\u210F", hstrok: "\u0127", Hstrok: "\u0126", HumpDownHump: "\u224E", HumpEqual: "\u224F", hybull: "\u2043", hyphen: "\u2010", iacute: "\xED", Iacute: "\xCD", ic: "\u2063", icirc: "\xEE", Icirc: "\xCE", icy: "\u0438", Icy: "\u0418", Idot: "\u0130", iecy: "\u0435", IEcy: "\u0415", iexcl: "\xA1", iff: "\u21D4", ifr: "\u{1D526}", Ifr: "\u2111", igrave: "\xEC", Igrave: "\xCC", ii: "\u2148", iiiint: "\u2A0C", iiint: "\u222D", iinfin: "\u29DC", iiota: "\u2129", ijlig: "\u0133", IJlig: "\u0132", Im: "\u2111", imacr: "\u012B", Imacr: "\u012A", image: "\u2111", ImaginaryI: "\u2148", imagline: "\u2110", imagpart: "\u2111", imath: "\u0131", imof: "\u22B7", imped: "\u01B5", Implies: "\u21D2", in: "\u2208", incare: "\u2105", infin: "\u221E", infintie: "\u29DD", inodot: "\u0131", int: "\u222B", Int: "\u222C", intcal: "\u22BA", integers: "\u2124", Integral: "\u222B", intercal: "\u22BA", Intersection: "\u22C2", intlarhk: "\u2A17", intprod: "\u2A3C", InvisibleComma: "\u2063", InvisibleTimes: "\u2062", iocy: "\u0451", IOcy: "\u0401", iogon: "\u012F", Iogon: "\u012E", iopf: "\u{1D55A}", Iopf: "\u{1D540}", iota: "\u03B9", Iota: "\u0399", iprod: "\u2A3C", iquest: "\xBF", iscr: "\u{1D4BE}", Iscr: "\u2110", isin: "\u2208", isindot: "\u22F5", isinE: "\u22F9", isins: "\u22F4", isinsv: "\u22F3", isinv: "\u2208", it: "\u2062", itilde: "\u0129", Itilde: "\u0128", iukcy: "\u0456", Iukcy: "\u0406", iuml: "\xEF", Iuml: "\xCF", jcirc: "\u0135", Jcirc: "\u0134", jcy: "\u0439", Jcy: "\u0419", jfr: "\u{1D527}", Jfr: "\u{1D50D}", jmath: "\u0237", jopf: "\u{1D55B}", Jopf: "\u{1D541}", jscr: "\u{1D4BF}", Jscr: "\u{1D4A5}", jsercy: "\u0458", Jsercy: "\u0408", jukcy: "\u0454", Jukcy: "\u0404", kappa: "\u03BA", Kappa: "\u039A", kappav: "\u03F0", kcedil: "\u0137", Kcedil: "\u0136", kcy: "\u043A", Kcy: "\u041A", kfr: "\u{1D528}", Kfr: "\u{1D50E}", kgreen: "\u0138", khcy: "\u0445", KHcy: "\u0425", kjcy: "\u045C", KJcy: "\u040C", kopf: "\u{1D55C}", Kopf: "\u{1D542}", kscr: "\u{1D4C0}", Kscr: "\u{1D4A6}", lAarr: "\u21DA", lacute: "\u013A", Lacute: "\u0139", laemptyv: "\u29B4", lagran: "\u2112", lambda: "\u03BB", Lambda: "\u039B", lang: "\u27E8", Lang: "\u27EA", langd: "\u2991", langle: "\u27E8", lap: "\u2A85", Laplacetrf: "\u2112", laquo: "\xAB", larr: "\u2190", lArr: "\u21D0", Larr: "\u219E", larrb: "\u21E4", larrbfs: "\u291F", larrfs: "\u291D", larrhk: "\u21A9", larrlp: "\u21AB", larrpl: "\u2939", larrsim: "\u2973", larrtl: "\u21A2", lat: "\u2AAB", latail: "\u2919", lAtail: "\u291B", late: "\u2AAD", lates: "\u2AAD\uFE00", lbarr: "\u290C", lBarr: "\u290E", lbbrk: "\u2772", lbrace: "{", lbrack: "[", lbrke: "\u298B", lbrksld: "\u298F", lbrkslu: "\u298D", lcaron: "\u013E", Lcaron: "\u013D", lcedil: "\u013C", Lcedil: "\u013B", lceil: "\u2308", lcub: "{", lcy: "\u043B", Lcy: "\u041B", ldca: "\u2936", ldquo: "\u201C", ldquor: "\u201E", ldrdhar: "\u2967", ldrushar: "\u294B", ldsh: "\u21B2", le: "\u2264", lE: "\u2266", LeftAngleBracket: "\u27E8", leftarrow: "\u2190", Leftarrow: "\u21D0", LeftArrow: "\u2190", LeftArrowBar: "\u21E4", LeftArrowRightArrow: "\u21C6", leftarrowtail: "\u21A2", LeftCeiling: "\u2308", LeftDoubleBracket: "\u27E6", LeftDownTeeVector: "\u2961", LeftDownVector: "\u21C3", LeftDownVectorBar: "\u2959", LeftFloor: "\u230A", leftharpoondown: "\u21BD", leftharpoonup: "\u21BC", leftleftarrows: "\u21C7", leftrightarrow: "\u2194", Leftrightarrow: "\u21D4", LeftRightArrow: "\u2194", leftrightarrows: "\u21C6", leftrightharpoons: "\u21CB", leftrightsquigarrow: "\u21AD", LeftRightVector: "\u294E", LeftTee: "\u22A3", LeftTeeArrow: "\u21A4", LeftTeeVector: "\u295A", leftthreetimes: "\u22CB", LeftTriangle: "\u22B2", LeftTriangleBar: "\u29CF", LeftTriangleEqual: "\u22B4", LeftUpDownVector: "\u2951", LeftUpTeeVector: "\u2960", LeftUpVector: "\u21BF", LeftUpVectorBar: "\u2958", LeftVector: "\u21BC", LeftVectorBar: "\u2952", leg: "\u22DA", lEg: "\u2A8B", leq: "\u2264", leqq: "\u2266", leqslant: "\u2A7D", les: "\u2A7D", lescc: "\u2AA8", lesdot: "\u2A7F", lesdoto: "\u2A81", lesdotor: "\u2A83", lesg: "\u22DA\uFE00", lesges: "\u2A93", lessapprox: "\u2A85", lessdot: "\u22D6", lesseqgtr: "\u22DA", lesseqqgtr: "\u2A8B", LessEqualGreater: "\u22DA", LessFullEqual: "\u2266", LessGreater: "\u2276", lessgtr: "\u2276", LessLess: "\u2AA1", lesssim: "\u2272", LessSlantEqual: "\u2A7D", LessTilde: "\u2272", lfisht: "\u297C", lfloor: "\u230A", lfr: "\u{1D529}", Lfr: "\u{1D50F}", lg: "\u2276", lgE: "\u2A91", lHar: "\u2962", lhard: "\u21BD", lharu: "\u21BC", lharul: "\u296A", lhblk: "\u2584", ljcy: "\u0459", LJcy: "\u0409", ll: "\u226A", Ll: "\u22D8", llarr: "\u21C7", llcorner: "\u231E", Lleftarrow: "\u21DA", llhard: "\u296B", lltri: "\u25FA", lmidot: "\u0140", Lmidot: "\u013F", lmoust: "\u23B0", lmoustache: "\u23B0", lnap: "\u2A89", lnapprox: "\u2A89", lne: "\u2A87", lnE: "\u2268", lneq: "\u2A87", lneqq: "\u2268", lnsim: "\u22E6", loang: "\u27EC", loarr: "\u21FD", lobrk: "\u27E6", longleftarrow: "\u27F5", Longleftarrow: "\u27F8", LongLeftArrow: "\u27F5", longleftrightarrow: "\u27F7", Longleftrightarrow: "\u27FA", LongLeftRightArrow: "\u27F7", longmapsto: "\u27FC", longrightarrow: "\u27F6", Longrightarrow: "\u27F9", LongRightArrow: "\u27F6", looparrowleft: "\u21AB", looparrowright: "\u21AC", lopar: "\u2985", lopf: "\u{1D55D}", Lopf: "\u{1D543}", loplus: "\u2A2D", lotimes: "\u2A34", lowast: "\u2217", lowbar: "_", LowerLeftArrow: "\u2199", LowerRightArrow: "\u2198", loz: "\u25CA", lozenge: "\u25CA", lozf: "\u29EB", lpar: "(", lparlt: "\u2993", lrarr: "\u21C6", lrcorner: "\u231F", lrhar: "\u21CB", lrhard: "\u296D", lrm: "\u200E", lrtri: "\u22BF", lsaquo: "\u2039", lscr: "\u{1D4C1}", Lscr: "\u2112", lsh: "\u21B0", Lsh: "\u21B0", lsim: "\u2272", lsime: "\u2A8D", lsimg: "\u2A8F", lsqb: "[", lsquo: "\u2018", lsquor: "\u201A", lstrok: "\u0142", Lstrok: "\u0141", lt: "<", Lt: "\u226A", LT: "<", ltcc: "\u2AA6", ltcir: "\u2A79", ltdot: "\u22D6", lthree: "\u22CB", ltimes: "\u22C9", ltlarr: "\u2976", ltquest: "\u2A7B", ltri: "\u25C3", ltrie: "\u22B4", ltrif: "\u25C2", ltrPar: "\u2996", lurdshar: "\u294A", luruhar: "\u2966", lvertneqq: "\u2268\uFE00", lvnE: "\u2268\uFE00", macr: "\xAF", male: "\u2642", malt: "\u2720", maltese: "\u2720", map: "\u21A6", Map: "\u2905", mapsto: "\u21A6", mapstodown: "\u21A7", mapstoleft: "\u21A4", mapstoup: "\u21A5", marker: "\u25AE", mcomma: "\u2A29", mcy: "\u043C", Mcy: "\u041C", mdash: "\u2014", mDDot: "\u223A", measuredangle: "\u2221", MediumSpace: "\u205F", Mellintrf: "\u2133", mfr: "\u{1D52A}", Mfr: "\u{1D510}", mho: "\u2127", micro: "\xB5", mid: "\u2223", midast: "*", midcir: "\u2AF0", middot: "\xB7", minus: "\u2212", minusb: "\u229F", minusd: "\u2238", minusdu: "\u2A2A", MinusPlus: "\u2213", mlcp: "\u2ADB", mldr: "\u2026", mnplus: "\u2213", models: "\u22A7", mopf: "\u{1D55E}", Mopf: "\u{1D544}", mp: "\u2213", mscr: "\u{1D4C2}", Mscr: "\u2133", mstpos: "\u223E", mu: "\u03BC", Mu: "\u039C", multimap: "\u22B8", mumap: "\u22B8", nabla: "\u2207", nacute: "\u0144", Nacute: "\u0143", nang: "\u2220\u20D2", nap: "\u2249", napE: "\u2A70\u0338", napid: "\u224B\u0338", napos: "\u0149", napprox: "\u2249", natur: "\u266E", natural: "\u266E", naturals: "\u2115", nbsp: "\xA0", nbump: "\u224E\u0338", nbumpe: "\u224F\u0338", ncap: "\u2A43", ncaron: "\u0148", Ncaron: "\u0147", ncedil: "\u0146", Ncedil: "\u0145", ncong: "\u2247", ncongdot: "\u2A6D\u0338", ncup: "\u2A42", ncy: "\u043D", Ncy: "\u041D", ndash: "\u2013", ne: "\u2260", nearhk: "\u2924", nearr: "\u2197", neArr: "\u21D7", nearrow: "\u2197", nedot: "\u2250\u0338", NegativeMediumSpace: "\u200B", NegativeThickSpace: "\u200B", NegativeThinSpace: "\u200B", NegativeVeryThinSpace: "\u200B", nequiv: "\u2262", nesear: "\u2928", nesim: "\u2242\u0338", NestedGreaterGreater: "\u226B", NestedLessLess: "\u226A", NewLine: "\n", nexist: "\u2204", nexists: "\u2204", nfr: "\u{1D52B}", Nfr: "\u{1D511}", nge: "\u2271", ngE: "\u2267\u0338", ngeq: "\u2271", ngeqq: "\u2267\u0338", ngeqslant: "\u2A7E\u0338", nges: "\u2A7E\u0338", nGg: "\u22D9\u0338", ngsim: "\u2275", ngt: "\u226F", nGt: "\u226B\u20D2", ngtr: "\u226F", nGtv: "\u226B\u0338", nharr: "\u21AE", nhArr: "\u21CE", nhpar: "\u2AF2", ni: "\u220B", nis: "\u22FC", nisd: "\u22FA", niv: "\u220B", njcy: "\u045A", NJcy: "\u040A", nlarr: "\u219A", nlArr: "\u21CD", nldr: "\u2025", nle: "\u2270", nlE: "\u2266\u0338", nleftarrow: "\u219A", nLeftarrow: "\u21CD", nleftrightarrow: "\u21AE", nLeftrightarrow: "\u21CE", nleq: "\u2270", nleqq: "\u2266\u0338", nleqslant: "\u2A7D\u0338", nles: "\u2A7D\u0338", nless: "\u226E", nLl: "\u22D8\u0338", nlsim: "\u2274", nlt: "\u226E", nLt: "\u226A\u20D2", nltri: "\u22EA", nltrie: "\u22EC", nLtv: "\u226A\u0338", nmid: "\u2224", NoBreak: "\u2060", NonBreakingSpace: "\xA0", nopf: "\u{1D55F}", Nopf: "\u2115", not: "\xAC", Not: "\u2AEC", NotCongruent: "\u2262", NotCupCap: "\u226D", NotDoubleVerticalBar: "\u2226", NotElement: "\u2209", NotEqual: "\u2260", NotEqualTilde: "\u2242\u0338", NotExists: "\u2204", NotGreater: "\u226F", NotGreaterEqual: "\u2271", NotGreaterFullEqual: "\u2267\u0338", NotGreaterGreater: "\u226B\u0338", NotGreaterLess: "\u2279", NotGreaterSlantEqual: "\u2A7E\u0338", NotGreaterTilde: "\u2275", NotHumpDownHump: "\u224E\u0338", NotHumpEqual: "\u224F\u0338", notin: "\u2209", notindot: "\u22F5\u0338", notinE: "\u22F9\u0338", notinva: "\u2209", notinvb: "\u22F7", notinvc: "\u22F6", NotLeftTriangle: "\u22EA", NotLeftTriangleBar: "\u29CF\u0338", NotLeftTriangleEqual: "\u22EC", NotLess: "\u226E", NotLessEqual: "\u2270", NotLessGreater: "\u2278", NotLessLess: "\u226A\u0338", NotLessSlantEqual: "\u2A7D\u0338", NotLessTilde: "\u2274", NotNestedGreaterGreater: "\u2AA2\u0338", NotNestedLessLess: "\u2AA1\u0338", notni: "\u220C", notniva: "\u220C", notnivb: "\u22FE", notnivc: "\u22FD", NotPrecedes: "\u2280", NotPrecedesEqual: "\u2AAF\u0338", NotPrecedesSlantEqual: "\u22E0", NotReverseElement: "\u220C", NotRightTriangle: "\u22EB", NotRightTriangleBar: "\u29D0\u0338", NotRightTriangleEqual: "\u22ED", NotSquareSubset: "\u228F\u0338", NotSquareSubsetEqual: "\u22E2", NotSquareSuperset: "\u2290\u0338", NotSquareSupersetEqual: "\u22E3", NotSubset: "\u2282\u20D2", NotSubsetEqual: "\u2288", NotSucceeds: "\u2281", NotSucceedsEqual: "\u2AB0\u0338", NotSucceedsSlantEqual: "\u22E1", NotSucceedsTilde: "\u227F\u0338", NotSuperset: "\u2283\u20D2", NotSupersetEqual: "\u2289", NotTilde: "\u2241", NotTildeEqual: "\u2244", NotTildeFullEqual: "\u2247", NotTildeTilde: "\u2249", NotVerticalBar: "\u2224", npar: "\u2226", nparallel: "\u2226", nparsl: "\u2AFD\u20E5", npart: "\u2202\u0338", npolint: "\u2A14", npr: "\u2280", nprcue: "\u22E0", npre: "\u2AAF\u0338", nprec: "\u2280", npreceq: "\u2AAF\u0338", nrarr: "\u219B", nrArr: "\u21CF", nrarrc: "\u2933\u0338", nrarrw: "\u219D\u0338", nrightarrow: "\u219B", nRightarrow: "\u21CF", nrtri: "\u22EB", nrtrie: "\u22ED", nsc: "\u2281", nsccue: "\u22E1", nsce: "\u2AB0\u0338", nscr: "\u{1D4C3}", Nscr: "\u{1D4A9}", nshortmid: "\u2224", nshortparallel: "\u2226", nsim: "\u2241", nsime: "\u2244", nsimeq: "\u2244", nsmid: "\u2224", nspar: "\u2226", nsqsube: "\u22E2", nsqsupe: "\u22E3", nsub: "\u2284", nsube: "\u2288", nsubE: "\u2AC5\u0338", nsubset: "\u2282\u20D2", nsubseteq: "\u2288", nsubseteqq: "\u2AC5\u0338", nsucc: "\u2281", nsucceq: "\u2AB0\u0338", nsup: "\u2285", nsupe: "\u2289", nsupE: "\u2AC6\u0338", nsupset: "\u2283\u20D2", nsupseteq: "\u2289", nsupseteqq: "\u2AC6\u0338", ntgl: "\u2279", ntilde: "\xF1", Ntilde: "\xD1", ntlg: "\u2278", ntriangleleft: "\u22EA", ntrianglelefteq: "\u22EC", ntriangleright: "\u22EB", ntrianglerighteq: "\u22ED", nu: "\u03BD", Nu: "\u039D", num: "#", numero: "\u2116", numsp: "\u2007", nvap: "\u224D\u20D2", nvdash: "\u22AC", nvDash: "\u22AD", nVdash: "\u22AE", nVDash: "\u22AF", nvge: "\u2265\u20D2", nvgt: ">\u20D2", nvHarr: "\u2904", nvinfin: "\u29DE", nvlArr: "\u2902", nvle: "\u2264\u20D2", nvlt: "<\u20D2", nvltrie: "\u22B4\u20D2", nvrArr: "\u2903", nvrtrie: "\u22B5\u20D2", nvsim: "\u223C\u20D2", nwarhk: "\u2923", nwarr: "\u2196", nwArr: "\u21D6", nwarrow: "\u2196", nwnear: "\u2927", oacute: "\xF3", Oacute: "\xD3", oast: "\u229B", ocir: "\u229A", ocirc: "\xF4", Ocirc: "\xD4", ocy: "\u043E", Ocy: "\u041E", odash: "\u229D", odblac: "\u0151", Odblac: "\u0150", odiv: "\u2A38", odot: "\u2299", odsold: "\u29BC", oelig: "\u0153", OElig: "\u0152", ofcir: "\u29BF", ofr: "\u{1D52C}", Ofr: "\u{1D512}", ogon: "\u02DB", ograve: "\xF2", Ograve: "\xD2", ogt: "\u29C1", ohbar: "\u29B5", ohm: "\u03A9", oint: "\u222E", olarr: "\u21BA", olcir: "\u29BE", olcross: "\u29BB", oline: "\u203E", olt: "\u29C0", omacr: "\u014D", Omacr: "\u014C", omega: "\u03C9", Omega: "\u03A9", omicron: "\u03BF", Omicron: "\u039F", omid: "\u29B6", ominus: "\u2296", oopf: "\u{1D560}", Oopf: "\u{1D546}", opar: "\u29B7", OpenCurlyDoubleQuote: "\u201C", OpenCurlyQuote: "\u2018", operp: "\u29B9", oplus: "\u2295", or: "\u2228", Or: "\u2A54", orarr: "\u21BB", ord: "\u2A5D", order: "\u2134", orderof: "\u2134", ordf: "\xAA", ordm: "\xBA", origof: "\u22B6", oror: "\u2A56", orslope: "\u2A57", orv: "\u2A5B", oS: "\u24C8", oscr: "\u2134", Oscr: "\u{1D4AA}", oslash: "\xF8", Oslash: "\xD8", osol: "\u2298", otilde: "\xF5", Otilde: "\xD5", otimes: "\u2297", Otimes: "\u2A37", otimesas: "\u2A36", ouml: "\xF6", Ouml: "\xD6", ovbar: "\u233D", OverBar: "\u203E", OverBrace: "\u23DE", OverBracket: "\u23B4", OverParenthesis: "\u23DC", par: "\u2225", para: "\xB6", parallel: "\u2225", parsim: "\u2AF3", parsl: "\u2AFD", part: "\u2202", PartialD: "\u2202", pcy: "\u043F", Pcy: "\u041F", percnt: "%", period: ".", permil: "\u2030", perp: "\u22A5", pertenk: "\u2031", pfr: "\u{1D52D}", Pfr: "\u{1D513}", phi: "\u03C6", Phi: "\u03A6", phiv: "\u03D5", phmmat: "\u2133", phone: "\u260E", pi: "\u03C0", Pi: "\u03A0", pitchfork: "\u22D4", piv: "\u03D6", planck: "\u210F", planckh: "\u210E", plankv: "\u210F", plus: "+", plusacir: "\u2A23", plusb: "\u229E", pluscir: "\u2A22", plusdo: "\u2214", plusdu: "\u2A25", pluse: "\u2A72", PlusMinus: "\xB1", plusmn: "\xB1", plussim: "\u2A26", plustwo: "\u2A27", pm: "\xB1", Poincareplane: "\u210C", pointint: "\u2A15", popf: "\u{1D561}", Popf: "\u2119", pound: "\xA3", pr: "\u227A", Pr: "\u2ABB", prap: "\u2AB7", prcue: "\u227C", pre: "\u2AAF", prE: "\u2AB3", prec: "\u227A", precapprox: "\u2AB7", preccurlyeq: "\u227C", Precedes: "\u227A", PrecedesEqual: "\u2AAF", PrecedesSlantEqual: "\u227C", PrecedesTilde: "\u227E", preceq: "\u2AAF", precnapprox: "\u2AB9", precneqq: "\u2AB5", precnsim: "\u22E8", precsim: "\u227E", prime: "\u2032", Prime: "\u2033", primes: "\u2119", prnap: "\u2AB9", prnE: "\u2AB5", prnsim: "\u22E8", prod: "\u220F", Product: "\u220F", profalar: "\u232E", profline: "\u2312", profsurf: "\u2313", prop: "\u221D", Proportion: "\u2237", Proportional: "\u221D", propto: "\u221D", prsim: "\u227E", prurel: "\u22B0", pscr: "\u{1D4C5}", Pscr: "\u{1D4AB}", psi: "\u03C8", Psi: "\u03A8", puncsp: "\u2008", qfr: "\u{1D52E}", Qfr: "\u{1D514}", qint: "\u2A0C", qopf: "\u{1D562}", Qopf: "\u211A", qprime: "\u2057", qscr: "\u{1D4C6}", Qscr: "\u{1D4AC}", quaternions: "\u210D", quatint: "\u2A16", quest: "?", questeq: "\u225F", quot: '"', QUOT: '"', rAarr: "\u21DB", race: "\u223D\u0331", racute: "\u0155", Racute: "\u0154", radic: "\u221A", raemptyv: "\u29B3", rang: "\u27E9", Rang: "\u27EB", rangd: "\u2992", range: "\u29A5", rangle: "\u27E9", raquo: "\xBB", rarr: "\u2192", rArr: "\u21D2", Rarr: "\u21A0", rarrap: "\u2975", rarrb: "\u21E5", rarrbfs: "\u2920", rarrc: "\u2933", rarrfs: "\u291E", rarrhk: "\u21AA", rarrlp: "\u21AC", rarrpl: "\u2945", rarrsim: "\u2974", rarrtl: "\u21A3", Rarrtl: "\u2916", rarrw: "\u219D", ratail: "\u291A", rAtail: "\u291C", ratio: "\u2236", rationals: "\u211A", rbarr: "\u290D", rBarr: "\u290F", RBarr: "\u2910", rbbrk: "\u2773", rbrace: "}", rbrack: "]", rbrke: "\u298C", rbrksld: "\u298E", rbrkslu: "\u2990", rcaron: "\u0159", Rcaron: "\u0158", rcedil: "\u0157", Rcedil: "\u0156", rceil: "\u2309", rcub: "}", rcy: "\u0440", Rcy: "\u0420", rdca: "\u2937", rdldhar: "\u2969", rdquo: "\u201D", rdquor: "\u201D", rdsh: "\u21B3", Re: "\u211C", real: "\u211C", realine: "\u211B", realpart: "\u211C", reals: "\u211D", rect: "\u25AD", reg: "\xAE", REG: "\xAE", ReverseElement: "\u220B", ReverseEquilibrium: "\u21CB", ReverseUpEquilibrium: "\u296F", rfisht: "\u297D", rfloor: "\u230B", rfr: "\u{1D52F}", Rfr: "\u211C", rHar: "\u2964", rhard: "\u21C1", rharu: "\u21C0", rharul: "\u296C", rho: "\u03C1", Rho: "\u03A1", rhov: "\u03F1", RightAngleBracket: "\u27E9", rightarrow: "\u2192", Rightarrow: "\u21D2", RightArrow: "\u2192", RightArrowBar: "\u21E5", RightArrowLeftArrow: "\u21C4", rightarrowtail: "\u21A3", RightCeiling: "\u2309", RightDoubleBracket: "\u27E7", RightDownTeeVector: "\u295D", RightDownVector: "\u21C2", RightDownVectorBar: "\u2955", RightFloor: "\u230B", rightharpoondown: "\u21C1", rightharpoonup: "\u21C0", rightleftarrows: "\u21C4", rightleftharpoons: "\u21CC", rightrightarrows: "\u21C9", rightsquigarrow: "\u219D", RightTee: "\u22A2", RightTeeArrow: "\u21A6", RightTeeVector: "\u295B", rightthreetimes: "\u22CC", RightTriangle: "\u22B3", RightTriangleBar: "\u29D0", RightTriangleEqual: "\u22B5", RightUpDownVector: "\u294F", RightUpTeeVector: "\u295C", RightUpVector: "\u21BE", RightUpVectorBar: "\u2954", RightVector: "\u21C0", RightVectorBar: "\u2953", ring: "\u02DA", risingdotseq: "\u2253", rlarr: "\u21C4", rlhar: "\u21CC", rlm: "\u200F", rmoust: "\u23B1", rmoustache: "\u23B1", rnmid: "\u2AEE", roang: "\u27ED", roarr: "\u21FE", robrk: "\u27E7", ropar: "\u2986", ropf: "\u{1D563}", Ropf: "\u211D", roplus: "\u2A2E", rotimes: "\u2A35", RoundImplies: "\u2970", rpar: ")", rpargt: "\u2994", rppolint: "\u2A12", rrarr: "\u21C9", Rrightarrow: "\u21DB", rsaquo: "\u203A", rscr: "\u{1D4C7}", Rscr: "\u211B", rsh: "\u21B1", Rsh: "\u21B1", rsqb: "]", rsquo: "\u2019", rsquor: "\u2019", rthree: "\u22CC", rtimes: "\u22CA", rtri: "\u25B9", rtrie: "\u22B5", rtrif: "\u25B8", rtriltri: "\u29CE", RuleDelayed: "\u29F4", ruluhar: "\u2968", rx: "\u211E", sacute: "\u015B", Sacute: "\u015A", sbquo: "\u201A", sc: "\u227B", Sc: "\u2ABC", scap: "\u2AB8", scaron: "\u0161", Scaron: "\u0160", sccue: "\u227D", sce: "\u2AB0", scE: "\u2AB4", scedil: "\u015F", Scedil: "\u015E", scirc: "\u015D", Scirc: "\u015C", scnap: "\u2ABA", scnE: "\u2AB6", scnsim: "\u22E9", scpolint: "\u2A13", scsim: "\u227F", scy: "\u0441", Scy: "\u0421", sdot: "\u22C5", sdotb: "\u22A1", sdote: "\u2A66", searhk: "\u2925", searr: "\u2198", seArr: "\u21D8", searrow: "\u2198", sect: "\xA7", semi: ";", seswar: "\u2929", setminus: "\u2216", setmn: "\u2216", sext: "\u2736", sfr: "\u{1D530}", Sfr: "\u{1D516}", sfrown: "\u2322", sharp: "\u266F", shchcy: "\u0449", SHCHcy: "\u0429", shcy: "\u0448", SHcy: "\u0428", ShortDownArrow: "\u2193", ShortLeftArrow: "\u2190", shortmid: "\u2223", shortparallel: "\u2225", ShortRightArrow: "\u2192", ShortUpArrow: "\u2191", shy: "\xAD", sigma: "\u03C3", Sigma: "\u03A3", sigmaf: "\u03C2", sigmav: "\u03C2", sim: "\u223C", simdot: "\u2A6A", sime: "\u2243", simeq: "\u2243", simg: "\u2A9E", simgE: "\u2AA0", siml: "\u2A9D", simlE: "\u2A9F", simne: "\u2246", simplus: "\u2A24", simrarr: "\u2972", slarr: "\u2190", SmallCircle: "\u2218", smallsetminus: "\u2216", smashp: "\u2A33", smeparsl: "\u29E4", smid: "\u2223", smile: "\u2323", smt: "\u2AAA", smte: "\u2AAC", smtes: "\u2AAC\uFE00", softcy: "\u044C", SOFTcy: "\u042C", sol: "/", solb: "\u29C4", solbar: "\u233F", sopf: "\u{1D564}", Sopf: "\u{1D54A}", spades: "\u2660", spadesuit: "\u2660", spar: "\u2225", sqcap: "\u2293", sqcaps: "\u2293\uFE00", sqcup: "\u2294", sqcups: "\u2294\uFE00", Sqrt: "\u221A", sqsub: "\u228F", sqsube: "\u2291", sqsubset: "\u228F", sqsubseteq: "\u2291", sqsup: "\u2290", sqsupe: "\u2292", sqsupset: "\u2290", sqsupseteq: "\u2292", squ: "\u25A1", square: "\u25A1", Square: "\u25A1", SquareIntersection: "\u2293", SquareSubset: "\u228F", SquareSubsetEqual: "\u2291", SquareSuperset: "\u2290", SquareSupersetEqual: "\u2292", SquareUnion: "\u2294", squarf: "\u25AA", squf: "\u25AA", srarr: "\u2192", sscr: "\u{1D4C8}", Sscr: "\u{1D4AE}", ssetmn: "\u2216", ssmile: "\u2323", sstarf: "\u22C6", star: "\u2606", Star: "\u22C6", starf: "\u2605", straightepsilon: "\u03F5", straightphi: "\u03D5", strns: "\xAF", sub: "\u2282", Sub: "\u22D0", subdot: "\u2ABD", sube: "\u2286", subE: "\u2AC5", subedot: "\u2AC3", submult: "\u2AC1", subne: "\u228A", subnE: "\u2ACB", subplus: "\u2ABF", subrarr: "\u2979", subset: "\u2282", Subset: "\u22D0", subseteq: "\u2286", subseteqq: "\u2AC5", SubsetEqual: "\u2286", subsetneq: "\u228A", subsetneqq: "\u2ACB", subsim: "\u2AC7", subsub: "\u2AD5", subsup: "\u2AD3", succ: "\u227B", succapprox: "\u2AB8", succcurlyeq: "\u227D", Succeeds: "\u227B", SucceedsEqual: "\u2AB0", SucceedsSlantEqual: "\u227D", SucceedsTilde: "\u227F", succeq: "\u2AB0", succnapprox: "\u2ABA", succneqq: "\u2AB6", succnsim: "\u22E9", succsim: "\u227F", SuchThat: "\u220B", sum: "\u2211", Sum: "\u2211", sung: "\u266A", sup: "\u2283", Sup: "\u22D1", sup1: "\xB9", sup2: "\xB2", sup3: "\xB3", supdot: "\u2ABE", supdsub: "\u2AD8", supe: "\u2287", supE: "\u2AC6", supedot: "\u2AC4", Superset: "\u2283", SupersetEqual: "\u2287", suphsol: "\u27C9", suphsub: "\u2AD7", suplarr: "\u297B", supmult: "\u2AC2", supne: "\u228B", supnE: "\u2ACC", supplus: "\u2AC0", supset: "\u2283", Supset: "\u22D1", supseteq: "\u2287", supseteqq: "\u2AC6", supsetneq: "\u228B", supsetneqq: "\u2ACC", supsim: "\u2AC8", supsub: "\u2AD4", supsup: "\u2AD6", swarhk: "\u2926", swarr: "\u2199", swArr: "\u21D9", swarrow: "\u2199", swnwar: "\u292A", szlig: "\xDF", Tab: "	", target: "\u2316", tau: "\u03C4", Tau: "\u03A4", tbrk: "\u23B4", tcaron: "\u0165", Tcaron: "\u0164", tcedil: "\u0163", Tcedil: "\u0162", tcy: "\u0442", Tcy: "\u0422", tdot: "\u20DB", telrec: "\u2315", tfr: "\u{1D531}", Tfr: "\u{1D517}", there4: "\u2234", therefore: "\u2234", Therefore: "\u2234", theta: "\u03B8", Theta: "\u0398", thetasym: "\u03D1", thetav: "\u03D1", thickapprox: "\u2248", thicksim: "\u223C", ThickSpace: "\u205F\u200A", thinsp: "\u2009", ThinSpace: "\u2009", thkap: "\u2248", thksim: "\u223C", thorn: "\xFE", THORN: "\xDE", tilde: "\u02DC", Tilde: "\u223C", TildeEqual: "\u2243", TildeFullEqual: "\u2245", TildeTilde: "\u2248", times: "\xD7", timesb: "\u22A0", timesbar: "\u2A31", timesd: "\u2A30", tint: "\u222D", toea: "\u2928", top: "\u22A4", topbot: "\u2336", topcir: "\u2AF1", topf: "\u{1D565}", Topf: "\u{1D54B}", topfork: "\u2ADA", tosa: "\u2929", tprime: "\u2034", trade: "\u2122", TRADE: "\u2122", triangle: "\u25B5", triangledown: "\u25BF", triangleleft: "\u25C3", trianglelefteq: "\u22B4", triangleq: "\u225C", triangleright: "\u25B9", trianglerighteq: "\u22B5", tridot: "\u25EC", trie: "\u225C", triminus: "\u2A3A", TripleDot: "\u20DB", triplus: "\u2A39", trisb: "\u29CD", tritime: "\u2A3B", trpezium: "\u23E2", tscr: "\u{1D4C9}", Tscr: "\u{1D4AF}", tscy: "\u0446", TScy: "\u0426", tshcy: "\u045B", TSHcy: "\u040B", tstrok: "\u0167", Tstrok: "\u0166", twixt: "\u226C", twoheadleftarrow: "\u219E", twoheadrightarrow: "\u21A0", uacute: "\xFA", Uacute: "\xDA", uarr: "\u2191", uArr: "\u21D1", Uarr: "\u219F", Uarrocir: "\u2949", ubrcy: "\u045E", Ubrcy: "\u040E", ubreve: "\u016D", Ubreve: "\u016C", ucirc: "\xFB", Ucirc: "\xDB", ucy: "\u0443", Ucy: "\u0423", udarr: "\u21C5", udblac: "\u0171", Udblac: "\u0170", udhar: "\u296E", ufisht: "\u297E", ufr: "\u{1D532}", Ufr: "\u{1D518}", ugrave: "\xF9", Ugrave: "\xD9", uHar: "\u2963", uharl: "\u21BF", uharr: "\u21BE", uhblk: "\u2580", ulcorn: "\u231C", ulcorner: "\u231C", ulcrop: "\u230F", ultri: "\u25F8", umacr: "\u016B", Umacr: "\u016A", uml: "\xA8", UnderBar: "_", UnderBrace: "\u23DF", UnderBracket: "\u23B5", UnderParenthesis: "\u23DD", Union: "\u22C3", UnionPlus: "\u228E", uogon: "\u0173", Uogon: "\u0172", uopf: "\u{1D566}", Uopf: "\u{1D54C}", uparrow: "\u2191", Uparrow: "\u21D1", UpArrow: "\u2191", UpArrowBar: "\u2912", UpArrowDownArrow: "\u21C5", updownarrow: "\u2195", Updownarrow: "\u21D5", UpDownArrow: "\u2195", UpEquilibrium: "\u296E", upharpoonleft: "\u21BF", upharpoonright: "\u21BE", uplus: "\u228E", UpperLeftArrow: "\u2196", UpperRightArrow: "\u2197", upsi: "\u03C5", Upsi: "\u03D2", upsih: "\u03D2", upsilon: "\u03C5", Upsilon: "\u03A5", UpTee: "\u22A5", UpTeeArrow: "\u21A5", upuparrows: "\u21C8", urcorn: "\u231D", urcorner: "\u231D", urcrop: "\u230E", uring: "\u016F", Uring: "\u016E", urtri: "\u25F9", uscr: "\u{1D4CA}", Uscr: "\u{1D4B0}", utdot: "\u22F0", utilde: "\u0169", Utilde: "\u0168", utri: "\u25B5", utrif: "\u25B4", uuarr: "\u21C8", uuml: "\xFC", Uuml: "\xDC", uwangle: "\u29A7", vangrt: "\u299C", varepsilon: "\u03F5", varkappa: "\u03F0", varnothing: "\u2205", varphi: "\u03D5", varpi: "\u03D6", varpropto: "\u221D", varr: "\u2195", vArr: "\u21D5", varrho: "\u03F1", varsigma: "\u03C2", varsubsetneq: "\u228A\uFE00", varsubsetneqq: "\u2ACB\uFE00", varsupsetneq: "\u228B\uFE00", varsupsetneqq: "\u2ACC\uFE00", vartheta: "\u03D1", vartriangleleft: "\u22B2", vartriangleright: "\u22B3", vBar: "\u2AE8", Vbar: "\u2AEB", vBarv: "\u2AE9", vcy: "\u0432", Vcy: "\u0412", vdash: "\u22A2", vDash: "\u22A8", Vdash: "\u22A9", VDash: "\u22AB", Vdashl: "\u2AE6", vee: "\u2228", Vee: "\u22C1", veebar: "\u22BB", veeeq: "\u225A", vellip: "\u22EE", verbar: "|", Verbar: "\u2016", vert: "|", Vert: "\u2016", VerticalBar: "\u2223", VerticalLine: "|", VerticalSeparator: "\u2758", VerticalTilde: "\u2240", VeryThinSpace: "\u200A", vfr: "\u{1D533}", Vfr: "\u{1D519}", vltri: "\u22B2", vnsub: "\u2282\u20D2", vnsup: "\u2283\u20D2", vopf: "\u{1D567}", Vopf: "\u{1D54D}", vprop: "\u221D", vrtri: "\u22B3", vscr: "\u{1D4CB}", Vscr: "\u{1D4B1}", vsubne: "\u228A\uFE00", vsubnE: "\u2ACB\uFE00", vsupne: "\u228B\uFE00", vsupnE: "\u2ACC\uFE00", Vvdash: "\u22AA", vzigzag: "\u299A", wcirc: "\u0175", Wcirc: "\u0174", wedbar: "\u2A5F", wedge: "\u2227", Wedge: "\u22C0", wedgeq: "\u2259", weierp: "\u2118", wfr: "\u{1D534}", Wfr: "\u{1D51A}", wopf: "\u{1D568}", Wopf: "\u{1D54E}", wp: "\u2118", wr: "\u2240", wreath: "\u2240", wscr: "\u{1D4CC}", Wscr: "\u{1D4B2}", xcap: "\u22C2", xcirc: "\u25EF", xcup: "\u22C3", xdtri: "\u25BD", xfr: "\u{1D535}", Xfr: "\u{1D51B}", xharr: "\u27F7", xhArr: "\u27FA", xi: "\u03BE", Xi: "\u039E", xlarr: "\u27F5", xlArr: "\u27F8", xmap: "\u27FC", xnis: "\u22FB", xodot: "\u2A00", xopf: "\u{1D569}", Xopf: "\u{1D54F}", xoplus: "\u2A01", xotime: "\u2A02", xrarr: "\u27F6", xrArr: "\u27F9", xscr: "\u{1D4CD}", Xscr: "\u{1D4B3}", xsqcup: "\u2A06", xuplus: "\u2A04", xutri: "\u25B3", xvee: "\u22C1", xwedge: "\u22C0", yacute: "\xFD", Yacute: "\xDD", yacy: "\u044F", YAcy: "\u042F", ycirc: "\u0177", Ycirc: "\u0176", ycy: "\u044B", Ycy: "\u042B", yen: "\xA5", yfr: "\u{1D536}", Yfr: "\u{1D51C}", yicy: "\u0457", YIcy: "\u0407", yopf: "\u{1D56A}", Yopf: "\u{1D550}", yscr: "\u{1D4CE}", Yscr: "\u{1D4B4}", yucy: "\u044E", YUcy: "\u042E", yuml: "\xFF", Yuml: "\u0178", zacute: "\u017A", Zacute: "\u0179", zcaron: "\u017E", Zcaron: "\u017D", zcy: "\u0437", Zcy: "\u0417", zdot: "\u017C", Zdot: "\u017B", zeetrf: "\u2128", ZeroWidthSpace: "\u200B", zeta: "\u03B6", Zeta: "\u0396", zfr: "\u{1D537}", Zfr: "\u2128", zhcy: "\u0436", ZHcy: "\u0416", zigrarr: "\u21DD", zopf: "\u{1D56B}", Zopf: "\u2124", zscr: "\u{1D4CF}", Zscr: "\u{1D4B5}", zwj: "\u200D", zwnj: "\u200C"};
    var decodeMapLegacy = {aacute: "\xE1", Aacute: "\xC1", acirc: "\xE2", Acirc: "\xC2", acute: "\xB4", aelig: "\xE6", AElig: "\xC6", agrave: "\xE0", Agrave: "\xC0", amp: "&", AMP: "&", aring: "\xE5", Aring: "\xC5", atilde: "\xE3", Atilde: "\xC3", auml: "\xE4", Auml: "\xC4", brvbar: "\xA6", ccedil: "\xE7", Ccedil: "\xC7", cedil: "\xB8", cent: "\xA2", copy: "\xA9", COPY: "\xA9", curren: "\xA4", deg: "\xB0", divide: "\xF7", eacute: "\xE9", Eacute: "\xC9", ecirc: "\xEA", Ecirc: "\xCA", egrave: "\xE8", Egrave: "\xC8", eth: "\xF0", ETH: "\xD0", euml: "\xEB", Euml: "\xCB", frac12: "\xBD", frac14: "\xBC", frac34: "\xBE", gt: ">", GT: ">", iacute: "\xED", Iacute: "\xCD", icirc: "\xEE", Icirc: "\xCE", iexcl: "\xA1", igrave: "\xEC", Igrave: "\xCC", iquest: "\xBF", iuml: "\xEF", Iuml: "\xCF", laquo: "\xAB", lt: "<", LT: "<", macr: "\xAF", micro: "\xB5", middot: "\xB7", nbsp: "\xA0", not: "\xAC", ntilde: "\xF1", Ntilde: "\xD1", oacute: "\xF3", Oacute: "\xD3", ocirc: "\xF4", Ocirc: "\xD4", ograve: "\xF2", Ograve: "\xD2", ordf: "\xAA", ordm: "\xBA", oslash: "\xF8", Oslash: "\xD8", otilde: "\xF5", Otilde: "\xD5", ouml: "\xF6", Ouml: "\xD6", para: "\xB6", plusmn: "\xB1", pound: "\xA3", quot: '"', QUOT: '"', raquo: "\xBB", reg: "\xAE", REG: "\xAE", sect: "\xA7", shy: "\xAD", sup1: "\xB9", sup2: "\xB2", sup3: "\xB3", szlig: "\xDF", thorn: "\xFE", THORN: "\xDE", times: "\xD7", uacute: "\xFA", Uacute: "\xDA", ucirc: "\xFB", Ucirc: "\xDB", ugrave: "\xF9", Ugrave: "\xD9", uml: "\xA8", uuml: "\xFC", Uuml: "\xDC", yacute: "\xFD", Yacute: "\xDD", yen: "\xA5", yuml: "\xFF"};
    var decodeMapNumeric = {"0": "\uFFFD", "128": "\u20AC", "130": "\u201A", "131": "\u0192", "132": "\u201E", "133": "\u2026", "134": "\u2020", "135": "\u2021", "136": "\u02C6", "137": "\u2030", "138": "\u0160", "139": "\u2039", "140": "\u0152", "142": "\u017D", "145": "\u2018", "146": "\u2019", "147": "\u201C", "148": "\u201D", "149": "\u2022", "150": "\u2013", "151": "\u2014", "152": "\u02DC", "153": "\u2122", "154": "\u0161", "155": "\u203A", "156": "\u0153", "158": "\u017E", "159": "\u0178"};
    var invalidReferenceCodePoints = [1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 64976, 64977, 64978, 64979, 64980, 64981, 64982, 64983, 64984, 64985, 64986, 64987, 64988, 64989, 64990, 64991, 64992, 64993, 64994, 64995, 64996, 64997, 64998, 64999, 65e3, 65001, 65002, 65003, 65004, 65005, 65006, 65007, 65534, 65535, 131070, 131071, 196606, 196607, 262142, 262143, 327678, 327679, 393214, 393215, 458750, 458751, 524286, 524287, 589822, 589823, 655358, 655359, 720894, 720895, 786430, 786431, 851966, 851967, 917502, 917503, 983038, 983039, 1048574, 1048575, 1114110, 1114111];
    var stringFromCharCode = String.fromCharCode;
    var object = {};
    var hasOwnProperty = object.hasOwnProperty;
    var has = function(object2, propertyName) {
      return hasOwnProperty.call(object2, propertyName);
    };
    var contains = function(array, value) {
      var index = -1;
      var length = array.length;
      while (++index < length) {
        if (array[index] == value) {
          return true;
        }
      }
      return false;
    };
    var merge = function(options, defaults) {
      if (!options) {
        return defaults;
      }
      var result = {};
      var key2;
      for (key2 in defaults) {
        result[key2] = has(options, key2) ? options[key2] : defaults[key2];
      }
      return result;
    };
    var codePointToSymbol = function(codePoint, strict) {
      var output = "";
      if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
        if (strict) {
          parseError("character reference outside the permissible Unicode range");
        }
        return "\uFFFD";
      }
      if (has(decodeMapNumeric, codePoint)) {
        if (strict) {
          parseError("disallowed character reference");
        }
        return decodeMapNumeric[codePoint];
      }
      if (strict && contains(invalidReferenceCodePoints, codePoint)) {
        parseError("disallowed character reference");
      }
      if (codePoint > 65535) {
        codePoint -= 65536;
        output += stringFromCharCode(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      output += stringFromCharCode(codePoint);
      return output;
    };
    var hexEscape = function(codePoint) {
      return "&#x" + codePoint.toString(16).toUpperCase() + ";";
    };
    var decEscape = function(codePoint) {
      return "&#" + codePoint + ";";
    };
    var parseError = function(message) {
      throw Error("Parse error: " + message);
    };
    var encode = function(string, options) {
      options = merge(options, encode.options);
      var strict = options.strict;
      if (strict && regexInvalidRawCodePoint.test(string)) {
        parseError("forbidden code point");
      }
      var encodeEverything = options.encodeEverything;
      var useNamedReferences = options.useNamedReferences;
      var allowUnsafeSymbols = options.allowUnsafeSymbols;
      var escapeCodePoint = options.decimal ? decEscape : hexEscape;
      var escapeBmpSymbol = function(symbol) {
        return escapeCodePoint(symbol.charCodeAt(0));
      };
      if (encodeEverything) {
        string = string.replace(regexAsciiWhitelist, function(symbol) {
          if (useNamedReferences && has(encodeMap, symbol)) {
            return "&" + encodeMap[symbol] + ";";
          }
          return escapeBmpSymbol(symbol);
        });
        if (useNamedReferences) {
          string = string.replace(/&gt;\u20D2/g, "&nvgt;").replace(/&lt;\u20D2/g, "&nvlt;").replace(/&#x66;&#x6A;/g, "&fjlig;");
        }
        if (useNamedReferences) {
          string = string.replace(regexEncodeNonAscii, function(string2) {
            return "&" + encodeMap[string2] + ";";
          });
        }
      } else if (useNamedReferences) {
        if (!allowUnsafeSymbols) {
          string = string.replace(regexEscape, function(string2) {
            return "&" + encodeMap[string2] + ";";
          });
        }
        string = string.replace(/&gt;\u20D2/g, "&nvgt;").replace(/&lt;\u20D2/g, "&nvlt;");
        string = string.replace(regexEncodeNonAscii, function(string2) {
          return "&" + encodeMap[string2] + ";";
        });
      } else if (!allowUnsafeSymbols) {
        string = string.replace(regexEscape, escapeBmpSymbol);
      }
      return string.replace(regexAstralSymbols, function($0) {
        var high = $0.charCodeAt(0);
        var low = $0.charCodeAt(1);
        var codePoint = (high - 55296) * 1024 + low - 56320 + 65536;
        return escapeCodePoint(codePoint);
      }).replace(regexBmpWhitelist, escapeBmpSymbol);
    };
    encode.options = {
      allowUnsafeSymbols: false,
      encodeEverything: false,
      strict: false,
      useNamedReferences: false,
      decimal: false
    };
    var decode = function(html2, options) {
      options = merge(options, decode.options);
      var strict = options.strict;
      if (strict && regexInvalidEntity.test(html2)) {
        parseError("malformed character reference");
      }
      return html2.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7, $8) {
        var codePoint;
        var semicolon;
        var decDigits;
        var hexDigits;
        var reference;
        var next;
        if ($1) {
          reference = $1;
          return decodeMap[reference];
        }
        if ($2) {
          reference = $2;
          next = $3;
          if (next && options.isAttributeValue) {
            if (strict && next == "=") {
              parseError("`&` did not start a character reference");
            }
            return $0;
          } else {
            if (strict) {
              parseError("named character reference was not terminated by a semicolon");
            }
            return decodeMapLegacy[reference] + (next || "");
          }
        }
        if ($4) {
          decDigits = $4;
          semicolon = $5;
          if (strict && !semicolon) {
            parseError("character reference was not terminated by a semicolon");
          }
          codePoint = parseInt(decDigits, 10);
          return codePointToSymbol(codePoint, strict);
        }
        if ($6) {
          hexDigits = $6;
          semicolon = $7;
          if (strict && !semicolon) {
            parseError("character reference was not terminated by a semicolon");
          }
          codePoint = parseInt(hexDigits, 16);
          return codePointToSymbol(codePoint, strict);
        }
        if (strict) {
          parseError("named character reference was not terminated by a semicolon");
        }
        return $0;
      });
    };
    decode.options = {
      isAttributeValue: false,
      strict: false
    };
    var escape = function(string) {
      return string.replace(regexEscape, function($0) {
        return escapeMap[$0];
      });
    };
    var he = {
      version: "1.2.0",
      encode,
      decode,
      escape,
      unescape: decode
    };
    if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
      define(function() {
        return he;
      });
    } else if (freeExports && !freeExports.nodeType) {
      if (freeModule) {
        freeModule.exports = he;
      } else {
        for (var key in he) {
          has(he, key) && (freeExports[key] = he[key]);
        }
      }
    } else {
      root.he = he;
    }
  })(exports2);
});

// ../node_modules/domelementtype/lib/index.js
var require_lib = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.Doctype = exports2.CDATA = exports2.Tag = exports2.Style = exports2.Script = exports2.Comment = exports2.Directive = exports2.Text = exports2.Root = exports2.isTag = void 0;
  function isTag(elem) {
    return elem.type === "tag" || elem.type === "script" || elem.type === "style";
  }
  exports2.isTag = isTag;
  exports2.Root = "root";
  exports2.Text = "text";
  exports2.Directive = "directive";
  exports2.Comment = "comment";
  exports2.Script = "script";
  exports2.Style = "style";
  exports2.Tag = "tag";
  exports2.CDATA = "cdata";
  exports2.Doctype = "doctype";
});

// ../node_modules/domutils/lib/tagtypes.js
var require_tagtypes = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.hasChildren = exports2.isComment = exports2.isText = exports2.isCDATA = exports2.isTag = void 0;
  var domelementtype_1 = require_lib();
  function isTag(node) {
    return domelementtype_1.isTag(node);
  }
  exports2.isTag = isTag;
  function isCDATA(node) {
    return node.type === "cdata";
  }
  exports2.isCDATA = isCDATA;
  function isText(node) {
    return node.type === "text";
  }
  exports2.isText = isText;
  function isComment(node) {
    return node.type === "comment";
  }
  exports2.isComment = isComment;
  function hasChildren(node) {
    return Object.prototype.hasOwnProperty.call(node, "children");
  }
  exports2.hasChildren = hasChildren;
});

// ../node_modules/entities/lib/maps/entities.json
var require_entities = __commonJS((exports2, module2) => {
  module2.exports = {Aacute: "\xC1", aacute: "\xE1", Abreve: "\u0102", abreve: "\u0103", ac: "\u223E", acd: "\u223F", acE: "\u223E\u0333", Acirc: "\xC2", acirc: "\xE2", acute: "\xB4", Acy: "\u0410", acy: "\u0430", AElig: "\xC6", aelig: "\xE6", af: "\u2061", Afr: "\u{1D504}", afr: "\u{1D51E}", Agrave: "\xC0", agrave: "\xE0", alefsym: "\u2135", aleph: "\u2135", Alpha: "\u0391", alpha: "\u03B1", Amacr: "\u0100", amacr: "\u0101", amalg: "\u2A3F", amp: "&", AMP: "&", andand: "\u2A55", And: "\u2A53", and: "\u2227", andd: "\u2A5C", andslope: "\u2A58", andv: "\u2A5A", ang: "\u2220", ange: "\u29A4", angle: "\u2220", angmsdaa: "\u29A8", angmsdab: "\u29A9", angmsdac: "\u29AA", angmsdad: "\u29AB", angmsdae: "\u29AC", angmsdaf: "\u29AD", angmsdag: "\u29AE", angmsdah: "\u29AF", angmsd: "\u2221", angrt: "\u221F", angrtvb: "\u22BE", angrtvbd: "\u299D", angsph: "\u2222", angst: "\xC5", angzarr: "\u237C", Aogon: "\u0104", aogon: "\u0105", Aopf: "\u{1D538}", aopf: "\u{1D552}", apacir: "\u2A6F", ap: "\u2248", apE: "\u2A70", ape: "\u224A", apid: "\u224B", apos: "'", ApplyFunction: "\u2061", approx: "\u2248", approxeq: "\u224A", Aring: "\xC5", aring: "\xE5", Ascr: "\u{1D49C}", ascr: "\u{1D4B6}", Assign: "\u2254", ast: "*", asymp: "\u2248", asympeq: "\u224D", Atilde: "\xC3", atilde: "\xE3", Auml: "\xC4", auml: "\xE4", awconint: "\u2233", awint: "\u2A11", backcong: "\u224C", backepsilon: "\u03F6", backprime: "\u2035", backsim: "\u223D", backsimeq: "\u22CD", Backslash: "\u2216", Barv: "\u2AE7", barvee: "\u22BD", barwed: "\u2305", Barwed: "\u2306", barwedge: "\u2305", bbrk: "\u23B5", bbrktbrk: "\u23B6", bcong: "\u224C", Bcy: "\u0411", bcy: "\u0431", bdquo: "\u201E", becaus: "\u2235", because: "\u2235", Because: "\u2235", bemptyv: "\u29B0", bepsi: "\u03F6", bernou: "\u212C", Bernoullis: "\u212C", Beta: "\u0392", beta: "\u03B2", beth: "\u2136", between: "\u226C", Bfr: "\u{1D505}", bfr: "\u{1D51F}", bigcap: "\u22C2", bigcirc: "\u25EF", bigcup: "\u22C3", bigodot: "\u2A00", bigoplus: "\u2A01", bigotimes: "\u2A02", bigsqcup: "\u2A06", bigstar: "\u2605", bigtriangledown: "\u25BD", bigtriangleup: "\u25B3", biguplus: "\u2A04", bigvee: "\u22C1", bigwedge: "\u22C0", bkarow: "\u290D", blacklozenge: "\u29EB", blacksquare: "\u25AA", blacktriangle: "\u25B4", blacktriangledown: "\u25BE", blacktriangleleft: "\u25C2", blacktriangleright: "\u25B8", blank: "\u2423", blk12: "\u2592", blk14: "\u2591", blk34: "\u2593", block: "\u2588", bne: "=\u20E5", bnequiv: "\u2261\u20E5", bNot: "\u2AED", bnot: "\u2310", Bopf: "\u{1D539}", bopf: "\u{1D553}", bot: "\u22A5", bottom: "\u22A5", bowtie: "\u22C8", boxbox: "\u29C9", boxdl: "\u2510", boxdL: "\u2555", boxDl: "\u2556", boxDL: "\u2557", boxdr: "\u250C", boxdR: "\u2552", boxDr: "\u2553", boxDR: "\u2554", boxh: "\u2500", boxH: "\u2550", boxhd: "\u252C", boxHd: "\u2564", boxhD: "\u2565", boxHD: "\u2566", boxhu: "\u2534", boxHu: "\u2567", boxhU: "\u2568", boxHU: "\u2569", boxminus: "\u229F", boxplus: "\u229E", boxtimes: "\u22A0", boxul: "\u2518", boxuL: "\u255B", boxUl: "\u255C", boxUL: "\u255D", boxur: "\u2514", boxuR: "\u2558", boxUr: "\u2559", boxUR: "\u255A", boxv: "\u2502", boxV: "\u2551", boxvh: "\u253C", boxvH: "\u256A", boxVh: "\u256B", boxVH: "\u256C", boxvl: "\u2524", boxvL: "\u2561", boxVl: "\u2562", boxVL: "\u2563", boxvr: "\u251C", boxvR: "\u255E", boxVr: "\u255F", boxVR: "\u2560", bprime: "\u2035", breve: "\u02D8", Breve: "\u02D8", brvbar: "\xA6", bscr: "\u{1D4B7}", Bscr: "\u212C", bsemi: "\u204F", bsim: "\u223D", bsime: "\u22CD", bsolb: "\u29C5", bsol: "\\", bsolhsub: "\u27C8", bull: "\u2022", bullet: "\u2022", bump: "\u224E", bumpE: "\u2AAE", bumpe: "\u224F", Bumpeq: "\u224E", bumpeq: "\u224F", Cacute: "\u0106", cacute: "\u0107", capand: "\u2A44", capbrcup: "\u2A49", capcap: "\u2A4B", cap: "\u2229", Cap: "\u22D2", capcup: "\u2A47", capdot: "\u2A40", CapitalDifferentialD: "\u2145", caps: "\u2229\uFE00", caret: "\u2041", caron: "\u02C7", Cayleys: "\u212D", ccaps: "\u2A4D", Ccaron: "\u010C", ccaron: "\u010D", Ccedil: "\xC7", ccedil: "\xE7", Ccirc: "\u0108", ccirc: "\u0109", Cconint: "\u2230", ccups: "\u2A4C", ccupssm: "\u2A50", Cdot: "\u010A", cdot: "\u010B", cedil: "\xB8", Cedilla: "\xB8", cemptyv: "\u29B2", cent: "\xA2", centerdot: "\xB7", CenterDot: "\xB7", cfr: "\u{1D520}", Cfr: "\u212D", CHcy: "\u0427", chcy: "\u0447", check: "\u2713", checkmark: "\u2713", Chi: "\u03A7", chi: "\u03C7", circ: "\u02C6", circeq: "\u2257", circlearrowleft: "\u21BA", circlearrowright: "\u21BB", circledast: "\u229B", circledcirc: "\u229A", circleddash: "\u229D", CircleDot: "\u2299", circledR: "\xAE", circledS: "\u24C8", CircleMinus: "\u2296", CirclePlus: "\u2295", CircleTimes: "\u2297", cir: "\u25CB", cirE: "\u29C3", cire: "\u2257", cirfnint: "\u2A10", cirmid: "\u2AEF", cirscir: "\u29C2", ClockwiseContourIntegral: "\u2232", CloseCurlyDoubleQuote: "\u201D", CloseCurlyQuote: "\u2019", clubs: "\u2663", clubsuit: "\u2663", colon: ":", Colon: "\u2237", Colone: "\u2A74", colone: "\u2254", coloneq: "\u2254", comma: ",", commat: "@", comp: "\u2201", compfn: "\u2218", complement: "\u2201", complexes: "\u2102", cong: "\u2245", congdot: "\u2A6D", Congruent: "\u2261", conint: "\u222E", Conint: "\u222F", ContourIntegral: "\u222E", copf: "\u{1D554}", Copf: "\u2102", coprod: "\u2210", Coproduct: "\u2210", copy: "\xA9", COPY: "\xA9", copysr: "\u2117", CounterClockwiseContourIntegral: "\u2233", crarr: "\u21B5", cross: "\u2717", Cross: "\u2A2F", Cscr: "\u{1D49E}", cscr: "\u{1D4B8}", csub: "\u2ACF", csube: "\u2AD1", csup: "\u2AD0", csupe: "\u2AD2", ctdot: "\u22EF", cudarrl: "\u2938", cudarrr: "\u2935", cuepr: "\u22DE", cuesc: "\u22DF", cularr: "\u21B6", cularrp: "\u293D", cupbrcap: "\u2A48", cupcap: "\u2A46", CupCap: "\u224D", cup: "\u222A", Cup: "\u22D3", cupcup: "\u2A4A", cupdot: "\u228D", cupor: "\u2A45", cups: "\u222A\uFE00", curarr: "\u21B7", curarrm: "\u293C", curlyeqprec: "\u22DE", curlyeqsucc: "\u22DF", curlyvee: "\u22CE", curlywedge: "\u22CF", curren: "\xA4", curvearrowleft: "\u21B6", curvearrowright: "\u21B7", cuvee: "\u22CE", cuwed: "\u22CF", cwconint: "\u2232", cwint: "\u2231", cylcty: "\u232D", dagger: "\u2020", Dagger: "\u2021", daleth: "\u2138", darr: "\u2193", Darr: "\u21A1", dArr: "\u21D3", dash: "\u2010", Dashv: "\u2AE4", dashv: "\u22A3", dbkarow: "\u290F", dblac: "\u02DD", Dcaron: "\u010E", dcaron: "\u010F", Dcy: "\u0414", dcy: "\u0434", ddagger: "\u2021", ddarr: "\u21CA", DD: "\u2145", dd: "\u2146", DDotrahd: "\u2911", ddotseq: "\u2A77", deg: "\xB0", Del: "\u2207", Delta: "\u0394", delta: "\u03B4", demptyv: "\u29B1", dfisht: "\u297F", Dfr: "\u{1D507}", dfr: "\u{1D521}", dHar: "\u2965", dharl: "\u21C3", dharr: "\u21C2", DiacriticalAcute: "\xB4", DiacriticalDot: "\u02D9", DiacriticalDoubleAcute: "\u02DD", DiacriticalGrave: "`", DiacriticalTilde: "\u02DC", diam: "\u22C4", diamond: "\u22C4", Diamond: "\u22C4", diamondsuit: "\u2666", diams: "\u2666", die: "\xA8", DifferentialD: "\u2146", digamma: "\u03DD", disin: "\u22F2", div: "\xF7", divide: "\xF7", divideontimes: "\u22C7", divonx: "\u22C7", DJcy: "\u0402", djcy: "\u0452", dlcorn: "\u231E", dlcrop: "\u230D", dollar: "$", Dopf: "\u{1D53B}", dopf: "\u{1D555}", Dot: "\xA8", dot: "\u02D9", DotDot: "\u20DC", doteq: "\u2250", doteqdot: "\u2251", DotEqual: "\u2250", dotminus: "\u2238", dotplus: "\u2214", dotsquare: "\u22A1", doublebarwedge: "\u2306", DoubleContourIntegral: "\u222F", DoubleDot: "\xA8", DoubleDownArrow: "\u21D3", DoubleLeftArrow: "\u21D0", DoubleLeftRightArrow: "\u21D4", DoubleLeftTee: "\u2AE4", DoubleLongLeftArrow: "\u27F8", DoubleLongLeftRightArrow: "\u27FA", DoubleLongRightArrow: "\u27F9", DoubleRightArrow: "\u21D2", DoubleRightTee: "\u22A8", DoubleUpArrow: "\u21D1", DoubleUpDownArrow: "\u21D5", DoubleVerticalBar: "\u2225", DownArrowBar: "\u2913", downarrow: "\u2193", DownArrow: "\u2193", Downarrow: "\u21D3", DownArrowUpArrow: "\u21F5", DownBreve: "\u0311", downdownarrows: "\u21CA", downharpoonleft: "\u21C3", downharpoonright: "\u21C2", DownLeftRightVector: "\u2950", DownLeftTeeVector: "\u295E", DownLeftVectorBar: "\u2956", DownLeftVector: "\u21BD", DownRightTeeVector: "\u295F", DownRightVectorBar: "\u2957", DownRightVector: "\u21C1", DownTeeArrow: "\u21A7", DownTee: "\u22A4", drbkarow: "\u2910", drcorn: "\u231F", drcrop: "\u230C", Dscr: "\u{1D49F}", dscr: "\u{1D4B9}", DScy: "\u0405", dscy: "\u0455", dsol: "\u29F6", Dstrok: "\u0110", dstrok: "\u0111", dtdot: "\u22F1", dtri: "\u25BF", dtrif: "\u25BE", duarr: "\u21F5", duhar: "\u296F", dwangle: "\u29A6", DZcy: "\u040F", dzcy: "\u045F", dzigrarr: "\u27FF", Eacute: "\xC9", eacute: "\xE9", easter: "\u2A6E", Ecaron: "\u011A", ecaron: "\u011B", Ecirc: "\xCA", ecirc: "\xEA", ecir: "\u2256", ecolon: "\u2255", Ecy: "\u042D", ecy: "\u044D", eDDot: "\u2A77", Edot: "\u0116", edot: "\u0117", eDot: "\u2251", ee: "\u2147", efDot: "\u2252", Efr: "\u{1D508}", efr: "\u{1D522}", eg: "\u2A9A", Egrave: "\xC8", egrave: "\xE8", egs: "\u2A96", egsdot: "\u2A98", el: "\u2A99", Element: "\u2208", elinters: "\u23E7", ell: "\u2113", els: "\u2A95", elsdot: "\u2A97", Emacr: "\u0112", emacr: "\u0113", empty: "\u2205", emptyset: "\u2205", EmptySmallSquare: "\u25FB", emptyv: "\u2205", EmptyVerySmallSquare: "\u25AB", emsp13: "\u2004", emsp14: "\u2005", emsp: "\u2003", ENG: "\u014A", eng: "\u014B", ensp: "\u2002", Eogon: "\u0118", eogon: "\u0119", Eopf: "\u{1D53C}", eopf: "\u{1D556}", epar: "\u22D5", eparsl: "\u29E3", eplus: "\u2A71", epsi: "\u03B5", Epsilon: "\u0395", epsilon: "\u03B5", epsiv: "\u03F5", eqcirc: "\u2256", eqcolon: "\u2255", eqsim: "\u2242", eqslantgtr: "\u2A96", eqslantless: "\u2A95", Equal: "\u2A75", equals: "=", EqualTilde: "\u2242", equest: "\u225F", Equilibrium: "\u21CC", equiv: "\u2261", equivDD: "\u2A78", eqvparsl: "\u29E5", erarr: "\u2971", erDot: "\u2253", escr: "\u212F", Escr: "\u2130", esdot: "\u2250", Esim: "\u2A73", esim: "\u2242", Eta: "\u0397", eta: "\u03B7", ETH: "\xD0", eth: "\xF0", Euml: "\xCB", euml: "\xEB", euro: "\u20AC", excl: "!", exist: "\u2203", Exists: "\u2203", expectation: "\u2130", exponentiale: "\u2147", ExponentialE: "\u2147", fallingdotseq: "\u2252", Fcy: "\u0424", fcy: "\u0444", female: "\u2640", ffilig: "\uFB03", fflig: "\uFB00", ffllig: "\uFB04", Ffr: "\u{1D509}", ffr: "\u{1D523}", filig: "\uFB01", FilledSmallSquare: "\u25FC", FilledVerySmallSquare: "\u25AA", fjlig: "fj", flat: "\u266D", fllig: "\uFB02", fltns: "\u25B1", fnof: "\u0192", Fopf: "\u{1D53D}", fopf: "\u{1D557}", forall: "\u2200", ForAll: "\u2200", fork: "\u22D4", forkv: "\u2AD9", Fouriertrf: "\u2131", fpartint: "\u2A0D", frac12: "\xBD", frac13: "\u2153", frac14: "\xBC", frac15: "\u2155", frac16: "\u2159", frac18: "\u215B", frac23: "\u2154", frac25: "\u2156", frac34: "\xBE", frac35: "\u2157", frac38: "\u215C", frac45: "\u2158", frac56: "\u215A", frac58: "\u215D", frac78: "\u215E", frasl: "\u2044", frown: "\u2322", fscr: "\u{1D4BB}", Fscr: "\u2131", gacute: "\u01F5", Gamma: "\u0393", gamma: "\u03B3", Gammad: "\u03DC", gammad: "\u03DD", gap: "\u2A86", Gbreve: "\u011E", gbreve: "\u011F", Gcedil: "\u0122", Gcirc: "\u011C", gcirc: "\u011D", Gcy: "\u0413", gcy: "\u0433", Gdot: "\u0120", gdot: "\u0121", ge: "\u2265", gE: "\u2267", gEl: "\u2A8C", gel: "\u22DB", geq: "\u2265", geqq: "\u2267", geqslant: "\u2A7E", gescc: "\u2AA9", ges: "\u2A7E", gesdot: "\u2A80", gesdoto: "\u2A82", gesdotol: "\u2A84", gesl: "\u22DB\uFE00", gesles: "\u2A94", Gfr: "\u{1D50A}", gfr: "\u{1D524}", gg: "\u226B", Gg: "\u22D9", ggg: "\u22D9", gimel: "\u2137", GJcy: "\u0403", gjcy: "\u0453", gla: "\u2AA5", gl: "\u2277", glE: "\u2A92", glj: "\u2AA4", gnap: "\u2A8A", gnapprox: "\u2A8A", gne: "\u2A88", gnE: "\u2269", gneq: "\u2A88", gneqq: "\u2269", gnsim: "\u22E7", Gopf: "\u{1D53E}", gopf: "\u{1D558}", grave: "`", GreaterEqual: "\u2265", GreaterEqualLess: "\u22DB", GreaterFullEqual: "\u2267", GreaterGreater: "\u2AA2", GreaterLess: "\u2277", GreaterSlantEqual: "\u2A7E", GreaterTilde: "\u2273", Gscr: "\u{1D4A2}", gscr: "\u210A", gsim: "\u2273", gsime: "\u2A8E", gsiml: "\u2A90", gtcc: "\u2AA7", gtcir: "\u2A7A", gt: ">", GT: ">", Gt: "\u226B", gtdot: "\u22D7", gtlPar: "\u2995", gtquest: "\u2A7C", gtrapprox: "\u2A86", gtrarr: "\u2978", gtrdot: "\u22D7", gtreqless: "\u22DB", gtreqqless: "\u2A8C", gtrless: "\u2277", gtrsim: "\u2273", gvertneqq: "\u2269\uFE00", gvnE: "\u2269\uFE00", Hacek: "\u02C7", hairsp: "\u200A", half: "\xBD", hamilt: "\u210B", HARDcy: "\u042A", hardcy: "\u044A", harrcir: "\u2948", harr: "\u2194", hArr: "\u21D4", harrw: "\u21AD", Hat: "^", hbar: "\u210F", Hcirc: "\u0124", hcirc: "\u0125", hearts: "\u2665", heartsuit: "\u2665", hellip: "\u2026", hercon: "\u22B9", hfr: "\u{1D525}", Hfr: "\u210C", HilbertSpace: "\u210B", hksearow: "\u2925", hkswarow: "\u2926", hoarr: "\u21FF", homtht: "\u223B", hookleftarrow: "\u21A9", hookrightarrow: "\u21AA", hopf: "\u{1D559}", Hopf: "\u210D", horbar: "\u2015", HorizontalLine: "\u2500", hscr: "\u{1D4BD}", Hscr: "\u210B", hslash: "\u210F", Hstrok: "\u0126", hstrok: "\u0127", HumpDownHump: "\u224E", HumpEqual: "\u224F", hybull: "\u2043", hyphen: "\u2010", Iacute: "\xCD", iacute: "\xED", ic: "\u2063", Icirc: "\xCE", icirc: "\xEE", Icy: "\u0418", icy: "\u0438", Idot: "\u0130", IEcy: "\u0415", iecy: "\u0435", iexcl: "\xA1", iff: "\u21D4", ifr: "\u{1D526}", Ifr: "\u2111", Igrave: "\xCC", igrave: "\xEC", ii: "\u2148", iiiint: "\u2A0C", iiint: "\u222D", iinfin: "\u29DC", iiota: "\u2129", IJlig: "\u0132", ijlig: "\u0133", Imacr: "\u012A", imacr: "\u012B", image: "\u2111", ImaginaryI: "\u2148", imagline: "\u2110", imagpart: "\u2111", imath: "\u0131", Im: "\u2111", imof: "\u22B7", imped: "\u01B5", Implies: "\u21D2", incare: "\u2105", in: "\u2208", infin: "\u221E", infintie: "\u29DD", inodot: "\u0131", intcal: "\u22BA", int: "\u222B", Int: "\u222C", integers: "\u2124", Integral: "\u222B", intercal: "\u22BA", Intersection: "\u22C2", intlarhk: "\u2A17", intprod: "\u2A3C", InvisibleComma: "\u2063", InvisibleTimes: "\u2062", IOcy: "\u0401", iocy: "\u0451", Iogon: "\u012E", iogon: "\u012F", Iopf: "\u{1D540}", iopf: "\u{1D55A}", Iota: "\u0399", iota: "\u03B9", iprod: "\u2A3C", iquest: "\xBF", iscr: "\u{1D4BE}", Iscr: "\u2110", isin: "\u2208", isindot: "\u22F5", isinE: "\u22F9", isins: "\u22F4", isinsv: "\u22F3", isinv: "\u2208", it: "\u2062", Itilde: "\u0128", itilde: "\u0129", Iukcy: "\u0406", iukcy: "\u0456", Iuml: "\xCF", iuml: "\xEF", Jcirc: "\u0134", jcirc: "\u0135", Jcy: "\u0419", jcy: "\u0439", Jfr: "\u{1D50D}", jfr: "\u{1D527}", jmath: "\u0237", Jopf: "\u{1D541}", jopf: "\u{1D55B}", Jscr: "\u{1D4A5}", jscr: "\u{1D4BF}", Jsercy: "\u0408", jsercy: "\u0458", Jukcy: "\u0404", jukcy: "\u0454", Kappa: "\u039A", kappa: "\u03BA", kappav: "\u03F0", Kcedil: "\u0136", kcedil: "\u0137", Kcy: "\u041A", kcy: "\u043A", Kfr: "\u{1D50E}", kfr: "\u{1D528}", kgreen: "\u0138", KHcy: "\u0425", khcy: "\u0445", KJcy: "\u040C", kjcy: "\u045C", Kopf: "\u{1D542}", kopf: "\u{1D55C}", Kscr: "\u{1D4A6}", kscr: "\u{1D4C0}", lAarr: "\u21DA", Lacute: "\u0139", lacute: "\u013A", laemptyv: "\u29B4", lagran: "\u2112", Lambda: "\u039B", lambda: "\u03BB", lang: "\u27E8", Lang: "\u27EA", langd: "\u2991", langle: "\u27E8", lap: "\u2A85", Laplacetrf: "\u2112", laquo: "\xAB", larrb: "\u21E4", larrbfs: "\u291F", larr: "\u2190", Larr: "\u219E", lArr: "\u21D0", larrfs: "\u291D", larrhk: "\u21A9", larrlp: "\u21AB", larrpl: "\u2939", larrsim: "\u2973", larrtl: "\u21A2", latail: "\u2919", lAtail: "\u291B", lat: "\u2AAB", late: "\u2AAD", lates: "\u2AAD\uFE00", lbarr: "\u290C", lBarr: "\u290E", lbbrk: "\u2772", lbrace: "{", lbrack: "[", lbrke: "\u298B", lbrksld: "\u298F", lbrkslu: "\u298D", Lcaron: "\u013D", lcaron: "\u013E", Lcedil: "\u013B", lcedil: "\u013C", lceil: "\u2308", lcub: "{", Lcy: "\u041B", lcy: "\u043B", ldca: "\u2936", ldquo: "\u201C", ldquor: "\u201E", ldrdhar: "\u2967", ldrushar: "\u294B", ldsh: "\u21B2", le: "\u2264", lE: "\u2266", LeftAngleBracket: "\u27E8", LeftArrowBar: "\u21E4", leftarrow: "\u2190", LeftArrow: "\u2190", Leftarrow: "\u21D0", LeftArrowRightArrow: "\u21C6", leftarrowtail: "\u21A2", LeftCeiling: "\u2308", LeftDoubleBracket: "\u27E6", LeftDownTeeVector: "\u2961", LeftDownVectorBar: "\u2959", LeftDownVector: "\u21C3", LeftFloor: "\u230A", leftharpoondown: "\u21BD", leftharpoonup: "\u21BC", leftleftarrows: "\u21C7", leftrightarrow: "\u2194", LeftRightArrow: "\u2194", Leftrightarrow: "\u21D4", leftrightarrows: "\u21C6", leftrightharpoons: "\u21CB", leftrightsquigarrow: "\u21AD", LeftRightVector: "\u294E", LeftTeeArrow: "\u21A4", LeftTee: "\u22A3", LeftTeeVector: "\u295A", leftthreetimes: "\u22CB", LeftTriangleBar: "\u29CF", LeftTriangle: "\u22B2", LeftTriangleEqual: "\u22B4", LeftUpDownVector: "\u2951", LeftUpTeeVector: "\u2960", LeftUpVectorBar: "\u2958", LeftUpVector: "\u21BF", LeftVectorBar: "\u2952", LeftVector: "\u21BC", lEg: "\u2A8B", leg: "\u22DA", leq: "\u2264", leqq: "\u2266", leqslant: "\u2A7D", lescc: "\u2AA8", les: "\u2A7D", lesdot: "\u2A7F", lesdoto: "\u2A81", lesdotor: "\u2A83", lesg: "\u22DA\uFE00", lesges: "\u2A93", lessapprox: "\u2A85", lessdot: "\u22D6", lesseqgtr: "\u22DA", lesseqqgtr: "\u2A8B", LessEqualGreater: "\u22DA", LessFullEqual: "\u2266", LessGreater: "\u2276", lessgtr: "\u2276", LessLess: "\u2AA1", lesssim: "\u2272", LessSlantEqual: "\u2A7D", LessTilde: "\u2272", lfisht: "\u297C", lfloor: "\u230A", Lfr: "\u{1D50F}", lfr: "\u{1D529}", lg: "\u2276", lgE: "\u2A91", lHar: "\u2962", lhard: "\u21BD", lharu: "\u21BC", lharul: "\u296A", lhblk: "\u2584", LJcy: "\u0409", ljcy: "\u0459", llarr: "\u21C7", ll: "\u226A", Ll: "\u22D8", llcorner: "\u231E", Lleftarrow: "\u21DA", llhard: "\u296B", lltri: "\u25FA", Lmidot: "\u013F", lmidot: "\u0140", lmoustache: "\u23B0", lmoust: "\u23B0", lnap: "\u2A89", lnapprox: "\u2A89", lne: "\u2A87", lnE: "\u2268", lneq: "\u2A87", lneqq: "\u2268", lnsim: "\u22E6", loang: "\u27EC", loarr: "\u21FD", lobrk: "\u27E6", longleftarrow: "\u27F5", LongLeftArrow: "\u27F5", Longleftarrow: "\u27F8", longleftrightarrow: "\u27F7", LongLeftRightArrow: "\u27F7", Longleftrightarrow: "\u27FA", longmapsto: "\u27FC", longrightarrow: "\u27F6", LongRightArrow: "\u27F6", Longrightarrow: "\u27F9", looparrowleft: "\u21AB", looparrowright: "\u21AC", lopar: "\u2985", Lopf: "\u{1D543}", lopf: "\u{1D55D}", loplus: "\u2A2D", lotimes: "\u2A34", lowast: "\u2217", lowbar: "_", LowerLeftArrow: "\u2199", LowerRightArrow: "\u2198", loz: "\u25CA", lozenge: "\u25CA", lozf: "\u29EB", lpar: "(", lparlt: "\u2993", lrarr: "\u21C6", lrcorner: "\u231F", lrhar: "\u21CB", lrhard: "\u296D", lrm: "\u200E", lrtri: "\u22BF", lsaquo: "\u2039", lscr: "\u{1D4C1}", Lscr: "\u2112", lsh: "\u21B0", Lsh: "\u21B0", lsim: "\u2272", lsime: "\u2A8D", lsimg: "\u2A8F", lsqb: "[", lsquo: "\u2018", lsquor: "\u201A", Lstrok: "\u0141", lstrok: "\u0142", ltcc: "\u2AA6", ltcir: "\u2A79", lt: "<", LT: "<", Lt: "\u226A", ltdot: "\u22D6", lthree: "\u22CB", ltimes: "\u22C9", ltlarr: "\u2976", ltquest: "\u2A7B", ltri: "\u25C3", ltrie: "\u22B4", ltrif: "\u25C2", ltrPar: "\u2996", lurdshar: "\u294A", luruhar: "\u2966", lvertneqq: "\u2268\uFE00", lvnE: "\u2268\uFE00", macr: "\xAF", male: "\u2642", malt: "\u2720", maltese: "\u2720", Map: "\u2905", map: "\u21A6", mapsto: "\u21A6", mapstodown: "\u21A7", mapstoleft: "\u21A4", mapstoup: "\u21A5", marker: "\u25AE", mcomma: "\u2A29", Mcy: "\u041C", mcy: "\u043C", mdash: "\u2014", mDDot: "\u223A", measuredangle: "\u2221", MediumSpace: "\u205F", Mellintrf: "\u2133", Mfr: "\u{1D510}", mfr: "\u{1D52A}", mho: "\u2127", micro: "\xB5", midast: "*", midcir: "\u2AF0", mid: "\u2223", middot: "\xB7", minusb: "\u229F", minus: "\u2212", minusd: "\u2238", minusdu: "\u2A2A", MinusPlus: "\u2213", mlcp: "\u2ADB", mldr: "\u2026", mnplus: "\u2213", models: "\u22A7", Mopf: "\u{1D544}", mopf: "\u{1D55E}", mp: "\u2213", mscr: "\u{1D4C2}", Mscr: "\u2133", mstpos: "\u223E", Mu: "\u039C", mu: "\u03BC", multimap: "\u22B8", mumap: "\u22B8", nabla: "\u2207", Nacute: "\u0143", nacute: "\u0144", nang: "\u2220\u20D2", nap: "\u2249", napE: "\u2A70\u0338", napid: "\u224B\u0338", napos: "\u0149", napprox: "\u2249", natural: "\u266E", naturals: "\u2115", natur: "\u266E", nbsp: "\xA0", nbump: "\u224E\u0338", nbumpe: "\u224F\u0338", ncap: "\u2A43", Ncaron: "\u0147", ncaron: "\u0148", Ncedil: "\u0145", ncedil: "\u0146", ncong: "\u2247", ncongdot: "\u2A6D\u0338", ncup: "\u2A42", Ncy: "\u041D", ncy: "\u043D", ndash: "\u2013", nearhk: "\u2924", nearr: "\u2197", neArr: "\u21D7", nearrow: "\u2197", ne: "\u2260", nedot: "\u2250\u0338", NegativeMediumSpace: "\u200B", NegativeThickSpace: "\u200B", NegativeThinSpace: "\u200B", NegativeVeryThinSpace: "\u200B", nequiv: "\u2262", nesear: "\u2928", nesim: "\u2242\u0338", NestedGreaterGreater: "\u226B", NestedLessLess: "\u226A", NewLine: "\n", nexist: "\u2204", nexists: "\u2204", Nfr: "\u{1D511}", nfr: "\u{1D52B}", ngE: "\u2267\u0338", nge: "\u2271", ngeq: "\u2271", ngeqq: "\u2267\u0338", ngeqslant: "\u2A7E\u0338", nges: "\u2A7E\u0338", nGg: "\u22D9\u0338", ngsim: "\u2275", nGt: "\u226B\u20D2", ngt: "\u226F", ngtr: "\u226F", nGtv: "\u226B\u0338", nharr: "\u21AE", nhArr: "\u21CE", nhpar: "\u2AF2", ni: "\u220B", nis: "\u22FC", nisd: "\u22FA", niv: "\u220B", NJcy: "\u040A", njcy: "\u045A", nlarr: "\u219A", nlArr: "\u21CD", nldr: "\u2025", nlE: "\u2266\u0338", nle: "\u2270", nleftarrow: "\u219A", nLeftarrow: "\u21CD", nleftrightarrow: "\u21AE", nLeftrightarrow: "\u21CE", nleq: "\u2270", nleqq: "\u2266\u0338", nleqslant: "\u2A7D\u0338", nles: "\u2A7D\u0338", nless: "\u226E", nLl: "\u22D8\u0338", nlsim: "\u2274", nLt: "\u226A\u20D2", nlt: "\u226E", nltri: "\u22EA", nltrie: "\u22EC", nLtv: "\u226A\u0338", nmid: "\u2224", NoBreak: "\u2060", NonBreakingSpace: "\xA0", nopf: "\u{1D55F}", Nopf: "\u2115", Not: "\u2AEC", not: "\xAC", NotCongruent: "\u2262", NotCupCap: "\u226D", NotDoubleVerticalBar: "\u2226", NotElement: "\u2209", NotEqual: "\u2260", NotEqualTilde: "\u2242\u0338", NotExists: "\u2204", NotGreater: "\u226F", NotGreaterEqual: "\u2271", NotGreaterFullEqual: "\u2267\u0338", NotGreaterGreater: "\u226B\u0338", NotGreaterLess: "\u2279", NotGreaterSlantEqual: "\u2A7E\u0338", NotGreaterTilde: "\u2275", NotHumpDownHump: "\u224E\u0338", NotHumpEqual: "\u224F\u0338", notin: "\u2209", notindot: "\u22F5\u0338", notinE: "\u22F9\u0338", notinva: "\u2209", notinvb: "\u22F7", notinvc: "\u22F6", NotLeftTriangleBar: "\u29CF\u0338", NotLeftTriangle: "\u22EA", NotLeftTriangleEqual: "\u22EC", NotLess: "\u226E", NotLessEqual: "\u2270", NotLessGreater: "\u2278", NotLessLess: "\u226A\u0338", NotLessSlantEqual: "\u2A7D\u0338", NotLessTilde: "\u2274", NotNestedGreaterGreater: "\u2AA2\u0338", NotNestedLessLess: "\u2AA1\u0338", notni: "\u220C", notniva: "\u220C", notnivb: "\u22FE", notnivc: "\u22FD", NotPrecedes: "\u2280", NotPrecedesEqual: "\u2AAF\u0338", NotPrecedesSlantEqual: "\u22E0", NotReverseElement: "\u220C", NotRightTriangleBar: "\u29D0\u0338", NotRightTriangle: "\u22EB", NotRightTriangleEqual: "\u22ED", NotSquareSubset: "\u228F\u0338", NotSquareSubsetEqual: "\u22E2", NotSquareSuperset: "\u2290\u0338", NotSquareSupersetEqual: "\u22E3", NotSubset: "\u2282\u20D2", NotSubsetEqual: "\u2288", NotSucceeds: "\u2281", NotSucceedsEqual: "\u2AB0\u0338", NotSucceedsSlantEqual: "\u22E1", NotSucceedsTilde: "\u227F\u0338", NotSuperset: "\u2283\u20D2", NotSupersetEqual: "\u2289", NotTilde: "\u2241", NotTildeEqual: "\u2244", NotTildeFullEqual: "\u2247", NotTildeTilde: "\u2249", NotVerticalBar: "\u2224", nparallel: "\u2226", npar: "\u2226", nparsl: "\u2AFD\u20E5", npart: "\u2202\u0338", npolint: "\u2A14", npr: "\u2280", nprcue: "\u22E0", nprec: "\u2280", npreceq: "\u2AAF\u0338", npre: "\u2AAF\u0338", nrarrc: "\u2933\u0338", nrarr: "\u219B", nrArr: "\u21CF", nrarrw: "\u219D\u0338", nrightarrow: "\u219B", nRightarrow: "\u21CF", nrtri: "\u22EB", nrtrie: "\u22ED", nsc: "\u2281", nsccue: "\u22E1", nsce: "\u2AB0\u0338", Nscr: "\u{1D4A9}", nscr: "\u{1D4C3}", nshortmid: "\u2224", nshortparallel: "\u2226", nsim: "\u2241", nsime: "\u2244", nsimeq: "\u2244", nsmid: "\u2224", nspar: "\u2226", nsqsube: "\u22E2", nsqsupe: "\u22E3", nsub: "\u2284", nsubE: "\u2AC5\u0338", nsube: "\u2288", nsubset: "\u2282\u20D2", nsubseteq: "\u2288", nsubseteqq: "\u2AC5\u0338", nsucc: "\u2281", nsucceq: "\u2AB0\u0338", nsup: "\u2285", nsupE: "\u2AC6\u0338", nsupe: "\u2289", nsupset: "\u2283\u20D2", nsupseteq: "\u2289", nsupseteqq: "\u2AC6\u0338", ntgl: "\u2279", Ntilde: "\xD1", ntilde: "\xF1", ntlg: "\u2278", ntriangleleft: "\u22EA", ntrianglelefteq: "\u22EC", ntriangleright: "\u22EB", ntrianglerighteq: "\u22ED", Nu: "\u039D", nu: "\u03BD", num: "#", numero: "\u2116", numsp: "\u2007", nvap: "\u224D\u20D2", nvdash: "\u22AC", nvDash: "\u22AD", nVdash: "\u22AE", nVDash: "\u22AF", nvge: "\u2265\u20D2", nvgt: ">\u20D2", nvHarr: "\u2904", nvinfin: "\u29DE", nvlArr: "\u2902", nvle: "\u2264\u20D2", nvlt: "<\u20D2", nvltrie: "\u22B4\u20D2", nvrArr: "\u2903", nvrtrie: "\u22B5\u20D2", nvsim: "\u223C\u20D2", nwarhk: "\u2923", nwarr: "\u2196", nwArr: "\u21D6", nwarrow: "\u2196", nwnear: "\u2927", Oacute: "\xD3", oacute: "\xF3", oast: "\u229B", Ocirc: "\xD4", ocirc: "\xF4", ocir: "\u229A", Ocy: "\u041E", ocy: "\u043E", odash: "\u229D", Odblac: "\u0150", odblac: "\u0151", odiv: "\u2A38", odot: "\u2299", odsold: "\u29BC", OElig: "\u0152", oelig: "\u0153", ofcir: "\u29BF", Ofr: "\u{1D512}", ofr: "\u{1D52C}", ogon: "\u02DB", Ograve: "\xD2", ograve: "\xF2", ogt: "\u29C1", ohbar: "\u29B5", ohm: "\u03A9", oint: "\u222E", olarr: "\u21BA", olcir: "\u29BE", olcross: "\u29BB", oline: "\u203E", olt: "\u29C0", Omacr: "\u014C", omacr: "\u014D", Omega: "\u03A9", omega: "\u03C9", Omicron: "\u039F", omicron: "\u03BF", omid: "\u29B6", ominus: "\u2296", Oopf: "\u{1D546}", oopf: "\u{1D560}", opar: "\u29B7", OpenCurlyDoubleQuote: "\u201C", OpenCurlyQuote: "\u2018", operp: "\u29B9", oplus: "\u2295", orarr: "\u21BB", Or: "\u2A54", or: "\u2228", ord: "\u2A5D", order: "\u2134", orderof: "\u2134", ordf: "\xAA", ordm: "\xBA", origof: "\u22B6", oror: "\u2A56", orslope: "\u2A57", orv: "\u2A5B", oS: "\u24C8", Oscr: "\u{1D4AA}", oscr: "\u2134", Oslash: "\xD8", oslash: "\xF8", osol: "\u2298", Otilde: "\xD5", otilde: "\xF5", otimesas: "\u2A36", Otimes: "\u2A37", otimes: "\u2297", Ouml: "\xD6", ouml: "\xF6", ovbar: "\u233D", OverBar: "\u203E", OverBrace: "\u23DE", OverBracket: "\u23B4", OverParenthesis: "\u23DC", para: "\xB6", parallel: "\u2225", par: "\u2225", parsim: "\u2AF3", parsl: "\u2AFD", part: "\u2202", PartialD: "\u2202", Pcy: "\u041F", pcy: "\u043F", percnt: "%", period: ".", permil: "\u2030", perp: "\u22A5", pertenk: "\u2031", Pfr: "\u{1D513}", pfr: "\u{1D52D}", Phi: "\u03A6", phi: "\u03C6", phiv: "\u03D5", phmmat: "\u2133", phone: "\u260E", Pi: "\u03A0", pi: "\u03C0", pitchfork: "\u22D4", piv: "\u03D6", planck: "\u210F", planckh: "\u210E", plankv: "\u210F", plusacir: "\u2A23", plusb: "\u229E", pluscir: "\u2A22", plus: "+", plusdo: "\u2214", plusdu: "\u2A25", pluse: "\u2A72", PlusMinus: "\xB1", plusmn: "\xB1", plussim: "\u2A26", plustwo: "\u2A27", pm: "\xB1", Poincareplane: "\u210C", pointint: "\u2A15", popf: "\u{1D561}", Popf: "\u2119", pound: "\xA3", prap: "\u2AB7", Pr: "\u2ABB", pr: "\u227A", prcue: "\u227C", precapprox: "\u2AB7", prec: "\u227A", preccurlyeq: "\u227C", Precedes: "\u227A", PrecedesEqual: "\u2AAF", PrecedesSlantEqual: "\u227C", PrecedesTilde: "\u227E", preceq: "\u2AAF", precnapprox: "\u2AB9", precneqq: "\u2AB5", precnsim: "\u22E8", pre: "\u2AAF", prE: "\u2AB3", precsim: "\u227E", prime: "\u2032", Prime: "\u2033", primes: "\u2119", prnap: "\u2AB9", prnE: "\u2AB5", prnsim: "\u22E8", prod: "\u220F", Product: "\u220F", profalar: "\u232E", profline: "\u2312", profsurf: "\u2313", prop: "\u221D", Proportional: "\u221D", Proportion: "\u2237", propto: "\u221D", prsim: "\u227E", prurel: "\u22B0", Pscr: "\u{1D4AB}", pscr: "\u{1D4C5}", Psi: "\u03A8", psi: "\u03C8", puncsp: "\u2008", Qfr: "\u{1D514}", qfr: "\u{1D52E}", qint: "\u2A0C", qopf: "\u{1D562}", Qopf: "\u211A", qprime: "\u2057", Qscr: "\u{1D4AC}", qscr: "\u{1D4C6}", quaternions: "\u210D", quatint: "\u2A16", quest: "?", questeq: "\u225F", quot: '"', QUOT: '"', rAarr: "\u21DB", race: "\u223D\u0331", Racute: "\u0154", racute: "\u0155", radic: "\u221A", raemptyv: "\u29B3", rang: "\u27E9", Rang: "\u27EB", rangd: "\u2992", range: "\u29A5", rangle: "\u27E9", raquo: "\xBB", rarrap: "\u2975", rarrb: "\u21E5", rarrbfs: "\u2920", rarrc: "\u2933", rarr: "\u2192", Rarr: "\u21A0", rArr: "\u21D2", rarrfs: "\u291E", rarrhk: "\u21AA", rarrlp: "\u21AC", rarrpl: "\u2945", rarrsim: "\u2974", Rarrtl: "\u2916", rarrtl: "\u21A3", rarrw: "\u219D", ratail: "\u291A", rAtail: "\u291C", ratio: "\u2236", rationals: "\u211A", rbarr: "\u290D", rBarr: "\u290F", RBarr: "\u2910", rbbrk: "\u2773", rbrace: "}", rbrack: "]", rbrke: "\u298C", rbrksld: "\u298E", rbrkslu: "\u2990", Rcaron: "\u0158", rcaron: "\u0159", Rcedil: "\u0156", rcedil: "\u0157", rceil: "\u2309", rcub: "}", Rcy: "\u0420", rcy: "\u0440", rdca: "\u2937", rdldhar: "\u2969", rdquo: "\u201D", rdquor: "\u201D", rdsh: "\u21B3", real: "\u211C", realine: "\u211B", realpart: "\u211C", reals: "\u211D", Re: "\u211C", rect: "\u25AD", reg: "\xAE", REG: "\xAE", ReverseElement: "\u220B", ReverseEquilibrium: "\u21CB", ReverseUpEquilibrium: "\u296F", rfisht: "\u297D", rfloor: "\u230B", rfr: "\u{1D52F}", Rfr: "\u211C", rHar: "\u2964", rhard: "\u21C1", rharu: "\u21C0", rharul: "\u296C", Rho: "\u03A1", rho: "\u03C1", rhov: "\u03F1", RightAngleBracket: "\u27E9", RightArrowBar: "\u21E5", rightarrow: "\u2192", RightArrow: "\u2192", Rightarrow: "\u21D2", RightArrowLeftArrow: "\u21C4", rightarrowtail: "\u21A3", RightCeiling: "\u2309", RightDoubleBracket: "\u27E7", RightDownTeeVector: "\u295D", RightDownVectorBar: "\u2955", RightDownVector: "\u21C2", RightFloor: "\u230B", rightharpoondown: "\u21C1", rightharpoonup: "\u21C0", rightleftarrows: "\u21C4", rightleftharpoons: "\u21CC", rightrightarrows: "\u21C9", rightsquigarrow: "\u219D", RightTeeArrow: "\u21A6", RightTee: "\u22A2", RightTeeVector: "\u295B", rightthreetimes: "\u22CC", RightTriangleBar: "\u29D0", RightTriangle: "\u22B3", RightTriangleEqual: "\u22B5", RightUpDownVector: "\u294F", RightUpTeeVector: "\u295C", RightUpVectorBar: "\u2954", RightUpVector: "\u21BE", RightVectorBar: "\u2953", RightVector: "\u21C0", ring: "\u02DA", risingdotseq: "\u2253", rlarr: "\u21C4", rlhar: "\u21CC", rlm: "\u200F", rmoustache: "\u23B1", rmoust: "\u23B1", rnmid: "\u2AEE", roang: "\u27ED", roarr: "\u21FE", robrk: "\u27E7", ropar: "\u2986", ropf: "\u{1D563}", Ropf: "\u211D", roplus: "\u2A2E", rotimes: "\u2A35", RoundImplies: "\u2970", rpar: ")", rpargt: "\u2994", rppolint: "\u2A12", rrarr: "\u21C9", Rrightarrow: "\u21DB", rsaquo: "\u203A", rscr: "\u{1D4C7}", Rscr: "\u211B", rsh: "\u21B1", Rsh: "\u21B1", rsqb: "]", rsquo: "\u2019", rsquor: "\u2019", rthree: "\u22CC", rtimes: "\u22CA", rtri: "\u25B9", rtrie: "\u22B5", rtrif: "\u25B8", rtriltri: "\u29CE", RuleDelayed: "\u29F4", ruluhar: "\u2968", rx: "\u211E", Sacute: "\u015A", sacute: "\u015B", sbquo: "\u201A", scap: "\u2AB8", Scaron: "\u0160", scaron: "\u0161", Sc: "\u2ABC", sc: "\u227B", sccue: "\u227D", sce: "\u2AB0", scE: "\u2AB4", Scedil: "\u015E", scedil: "\u015F", Scirc: "\u015C", scirc: "\u015D", scnap: "\u2ABA", scnE: "\u2AB6", scnsim: "\u22E9", scpolint: "\u2A13", scsim: "\u227F", Scy: "\u0421", scy: "\u0441", sdotb: "\u22A1", sdot: "\u22C5", sdote: "\u2A66", searhk: "\u2925", searr: "\u2198", seArr: "\u21D8", searrow: "\u2198", sect: "\xA7", semi: ";", seswar: "\u2929", setminus: "\u2216", setmn: "\u2216", sext: "\u2736", Sfr: "\u{1D516}", sfr: "\u{1D530}", sfrown: "\u2322", sharp: "\u266F", SHCHcy: "\u0429", shchcy: "\u0449", SHcy: "\u0428", shcy: "\u0448", ShortDownArrow: "\u2193", ShortLeftArrow: "\u2190", shortmid: "\u2223", shortparallel: "\u2225", ShortRightArrow: "\u2192", ShortUpArrow: "\u2191", shy: "\xAD", Sigma: "\u03A3", sigma: "\u03C3", sigmaf: "\u03C2", sigmav: "\u03C2", sim: "\u223C", simdot: "\u2A6A", sime: "\u2243", simeq: "\u2243", simg: "\u2A9E", simgE: "\u2AA0", siml: "\u2A9D", simlE: "\u2A9F", simne: "\u2246", simplus: "\u2A24", simrarr: "\u2972", slarr: "\u2190", SmallCircle: "\u2218", smallsetminus: "\u2216", smashp: "\u2A33", smeparsl: "\u29E4", smid: "\u2223", smile: "\u2323", smt: "\u2AAA", smte: "\u2AAC", smtes: "\u2AAC\uFE00", SOFTcy: "\u042C", softcy: "\u044C", solbar: "\u233F", solb: "\u29C4", sol: "/", Sopf: "\u{1D54A}", sopf: "\u{1D564}", spades: "\u2660", spadesuit: "\u2660", spar: "\u2225", sqcap: "\u2293", sqcaps: "\u2293\uFE00", sqcup: "\u2294", sqcups: "\u2294\uFE00", Sqrt: "\u221A", sqsub: "\u228F", sqsube: "\u2291", sqsubset: "\u228F", sqsubseteq: "\u2291", sqsup: "\u2290", sqsupe: "\u2292", sqsupset: "\u2290", sqsupseteq: "\u2292", square: "\u25A1", Square: "\u25A1", SquareIntersection: "\u2293", SquareSubset: "\u228F", SquareSubsetEqual: "\u2291", SquareSuperset: "\u2290", SquareSupersetEqual: "\u2292", SquareUnion: "\u2294", squarf: "\u25AA", squ: "\u25A1", squf: "\u25AA", srarr: "\u2192", Sscr: "\u{1D4AE}", sscr: "\u{1D4C8}", ssetmn: "\u2216", ssmile: "\u2323", sstarf: "\u22C6", Star: "\u22C6", star: "\u2606", starf: "\u2605", straightepsilon: "\u03F5", straightphi: "\u03D5", strns: "\xAF", sub: "\u2282", Sub: "\u22D0", subdot: "\u2ABD", subE: "\u2AC5", sube: "\u2286", subedot: "\u2AC3", submult: "\u2AC1", subnE: "\u2ACB", subne: "\u228A", subplus: "\u2ABF", subrarr: "\u2979", subset: "\u2282", Subset: "\u22D0", subseteq: "\u2286", subseteqq: "\u2AC5", SubsetEqual: "\u2286", subsetneq: "\u228A", subsetneqq: "\u2ACB", subsim: "\u2AC7", subsub: "\u2AD5", subsup: "\u2AD3", succapprox: "\u2AB8", succ: "\u227B", succcurlyeq: "\u227D", Succeeds: "\u227B", SucceedsEqual: "\u2AB0", SucceedsSlantEqual: "\u227D", SucceedsTilde: "\u227F", succeq: "\u2AB0", succnapprox: "\u2ABA", succneqq: "\u2AB6", succnsim: "\u22E9", succsim: "\u227F", SuchThat: "\u220B", sum: "\u2211", Sum: "\u2211", sung: "\u266A", sup1: "\xB9", sup2: "\xB2", sup3: "\xB3", sup: "\u2283", Sup: "\u22D1", supdot: "\u2ABE", supdsub: "\u2AD8", supE: "\u2AC6", supe: "\u2287", supedot: "\u2AC4", Superset: "\u2283", SupersetEqual: "\u2287", suphsol: "\u27C9", suphsub: "\u2AD7", suplarr: "\u297B", supmult: "\u2AC2", supnE: "\u2ACC", supne: "\u228B", supplus: "\u2AC0", supset: "\u2283", Supset: "\u22D1", supseteq: "\u2287", supseteqq: "\u2AC6", supsetneq: "\u228B", supsetneqq: "\u2ACC", supsim: "\u2AC8", supsub: "\u2AD4", supsup: "\u2AD6", swarhk: "\u2926", swarr: "\u2199", swArr: "\u21D9", swarrow: "\u2199", swnwar: "\u292A", szlig: "\xDF", Tab: "	", target: "\u2316", Tau: "\u03A4", tau: "\u03C4", tbrk: "\u23B4", Tcaron: "\u0164", tcaron: "\u0165", Tcedil: "\u0162", tcedil: "\u0163", Tcy: "\u0422", tcy: "\u0442", tdot: "\u20DB", telrec: "\u2315", Tfr: "\u{1D517}", tfr: "\u{1D531}", there4: "\u2234", therefore: "\u2234", Therefore: "\u2234", Theta: "\u0398", theta: "\u03B8", thetasym: "\u03D1", thetav: "\u03D1", thickapprox: "\u2248", thicksim: "\u223C", ThickSpace: "\u205F\u200A", ThinSpace: "\u2009", thinsp: "\u2009", thkap: "\u2248", thksim: "\u223C", THORN: "\xDE", thorn: "\xFE", tilde: "\u02DC", Tilde: "\u223C", TildeEqual: "\u2243", TildeFullEqual: "\u2245", TildeTilde: "\u2248", timesbar: "\u2A31", timesb: "\u22A0", times: "\xD7", timesd: "\u2A30", tint: "\u222D", toea: "\u2928", topbot: "\u2336", topcir: "\u2AF1", top: "\u22A4", Topf: "\u{1D54B}", topf: "\u{1D565}", topfork: "\u2ADA", tosa: "\u2929", tprime: "\u2034", trade: "\u2122", TRADE: "\u2122", triangle: "\u25B5", triangledown: "\u25BF", triangleleft: "\u25C3", trianglelefteq: "\u22B4", triangleq: "\u225C", triangleright: "\u25B9", trianglerighteq: "\u22B5", tridot: "\u25EC", trie: "\u225C", triminus: "\u2A3A", TripleDot: "\u20DB", triplus: "\u2A39", trisb: "\u29CD", tritime: "\u2A3B", trpezium: "\u23E2", Tscr: "\u{1D4AF}", tscr: "\u{1D4C9}", TScy: "\u0426", tscy: "\u0446", TSHcy: "\u040B", tshcy: "\u045B", Tstrok: "\u0166", tstrok: "\u0167", twixt: "\u226C", twoheadleftarrow: "\u219E", twoheadrightarrow: "\u21A0", Uacute: "\xDA", uacute: "\xFA", uarr: "\u2191", Uarr: "\u219F", uArr: "\u21D1", Uarrocir: "\u2949", Ubrcy: "\u040E", ubrcy: "\u045E", Ubreve: "\u016C", ubreve: "\u016D", Ucirc: "\xDB", ucirc: "\xFB", Ucy: "\u0423", ucy: "\u0443", udarr: "\u21C5", Udblac: "\u0170", udblac: "\u0171", udhar: "\u296E", ufisht: "\u297E", Ufr: "\u{1D518}", ufr: "\u{1D532}", Ugrave: "\xD9", ugrave: "\xF9", uHar: "\u2963", uharl: "\u21BF", uharr: "\u21BE", uhblk: "\u2580", ulcorn: "\u231C", ulcorner: "\u231C", ulcrop: "\u230F", ultri: "\u25F8", Umacr: "\u016A", umacr: "\u016B", uml: "\xA8", UnderBar: "_", UnderBrace: "\u23DF", UnderBracket: "\u23B5", UnderParenthesis: "\u23DD", Union: "\u22C3", UnionPlus: "\u228E", Uogon: "\u0172", uogon: "\u0173", Uopf: "\u{1D54C}", uopf: "\u{1D566}", UpArrowBar: "\u2912", uparrow: "\u2191", UpArrow: "\u2191", Uparrow: "\u21D1", UpArrowDownArrow: "\u21C5", updownarrow: "\u2195", UpDownArrow: "\u2195", Updownarrow: "\u21D5", UpEquilibrium: "\u296E", upharpoonleft: "\u21BF", upharpoonright: "\u21BE", uplus: "\u228E", UpperLeftArrow: "\u2196", UpperRightArrow: "\u2197", upsi: "\u03C5", Upsi: "\u03D2", upsih: "\u03D2", Upsilon: "\u03A5", upsilon: "\u03C5", UpTeeArrow: "\u21A5", UpTee: "\u22A5", upuparrows: "\u21C8", urcorn: "\u231D", urcorner: "\u231D", urcrop: "\u230E", Uring: "\u016E", uring: "\u016F", urtri: "\u25F9", Uscr: "\u{1D4B0}", uscr: "\u{1D4CA}", utdot: "\u22F0", Utilde: "\u0168", utilde: "\u0169", utri: "\u25B5", utrif: "\u25B4", uuarr: "\u21C8", Uuml: "\xDC", uuml: "\xFC", uwangle: "\u29A7", vangrt: "\u299C", varepsilon: "\u03F5", varkappa: "\u03F0", varnothing: "\u2205", varphi: "\u03D5", varpi: "\u03D6", varpropto: "\u221D", varr: "\u2195", vArr: "\u21D5", varrho: "\u03F1", varsigma: "\u03C2", varsubsetneq: "\u228A\uFE00", varsubsetneqq: "\u2ACB\uFE00", varsupsetneq: "\u228B\uFE00", varsupsetneqq: "\u2ACC\uFE00", vartheta: "\u03D1", vartriangleleft: "\u22B2", vartriangleright: "\u22B3", vBar: "\u2AE8", Vbar: "\u2AEB", vBarv: "\u2AE9", Vcy: "\u0412", vcy: "\u0432", vdash: "\u22A2", vDash: "\u22A8", Vdash: "\u22A9", VDash: "\u22AB", Vdashl: "\u2AE6", veebar: "\u22BB", vee: "\u2228", Vee: "\u22C1", veeeq: "\u225A", vellip: "\u22EE", verbar: "|", Verbar: "\u2016", vert: "|", Vert: "\u2016", VerticalBar: "\u2223", VerticalLine: "|", VerticalSeparator: "\u2758", VerticalTilde: "\u2240", VeryThinSpace: "\u200A", Vfr: "\u{1D519}", vfr: "\u{1D533}", vltri: "\u22B2", vnsub: "\u2282\u20D2", vnsup: "\u2283\u20D2", Vopf: "\u{1D54D}", vopf: "\u{1D567}", vprop: "\u221D", vrtri: "\u22B3", Vscr: "\u{1D4B1}", vscr: "\u{1D4CB}", vsubnE: "\u2ACB\uFE00", vsubne: "\u228A\uFE00", vsupnE: "\u2ACC\uFE00", vsupne: "\u228B\uFE00", Vvdash: "\u22AA", vzigzag: "\u299A", Wcirc: "\u0174", wcirc: "\u0175", wedbar: "\u2A5F", wedge: "\u2227", Wedge: "\u22C0", wedgeq: "\u2259", weierp: "\u2118", Wfr: "\u{1D51A}", wfr: "\u{1D534}", Wopf: "\u{1D54E}", wopf: "\u{1D568}", wp: "\u2118", wr: "\u2240", wreath: "\u2240", Wscr: "\u{1D4B2}", wscr: "\u{1D4CC}", xcap: "\u22C2", xcirc: "\u25EF", xcup: "\u22C3", xdtri: "\u25BD", Xfr: "\u{1D51B}", xfr: "\u{1D535}", xharr: "\u27F7", xhArr: "\u27FA", Xi: "\u039E", xi: "\u03BE", xlarr: "\u27F5", xlArr: "\u27F8", xmap: "\u27FC", xnis: "\u22FB", xodot: "\u2A00", Xopf: "\u{1D54F}", xopf: "\u{1D569}", xoplus: "\u2A01", xotime: "\u2A02", xrarr: "\u27F6", xrArr: "\u27F9", Xscr: "\u{1D4B3}", xscr: "\u{1D4CD}", xsqcup: "\u2A06", xuplus: "\u2A04", xutri: "\u25B3", xvee: "\u22C1", xwedge: "\u22C0", Yacute: "\xDD", yacute: "\xFD", YAcy: "\u042F", yacy: "\u044F", Ycirc: "\u0176", ycirc: "\u0177", Ycy: "\u042B", ycy: "\u044B", yen: "\xA5", Yfr: "\u{1D51C}", yfr: "\u{1D536}", YIcy: "\u0407", yicy: "\u0457", Yopf: "\u{1D550}", yopf: "\u{1D56A}", Yscr: "\u{1D4B4}", yscr: "\u{1D4CE}", YUcy: "\u042E", yucy: "\u044E", yuml: "\xFF", Yuml: "\u0178", Zacute: "\u0179", zacute: "\u017A", Zcaron: "\u017D", zcaron: "\u017E", Zcy: "\u0417", zcy: "\u0437", Zdot: "\u017B", zdot: "\u017C", zeetrf: "\u2128", ZeroWidthSpace: "\u200B", Zeta: "\u0396", zeta: "\u03B6", zfr: "\u{1D537}", Zfr: "\u2128", ZHcy: "\u0416", zhcy: "\u0436", zigrarr: "\u21DD", zopf: "\u{1D56B}", Zopf: "\u2124", Zscr: "\u{1D4B5}", zscr: "\u{1D4CF}", zwj: "\u200D", zwnj: "\u200C"};
});

// ../node_modules/entities/lib/maps/legacy.json
var require_legacy = __commonJS((exports2, module2) => {
  module2.exports = {Aacute: "\xC1", aacute: "\xE1", Acirc: "\xC2", acirc: "\xE2", acute: "\xB4", AElig: "\xC6", aelig: "\xE6", Agrave: "\xC0", agrave: "\xE0", amp: "&", AMP: "&", Aring: "\xC5", aring: "\xE5", Atilde: "\xC3", atilde: "\xE3", Auml: "\xC4", auml: "\xE4", brvbar: "\xA6", Ccedil: "\xC7", ccedil: "\xE7", cedil: "\xB8", cent: "\xA2", copy: "\xA9", COPY: "\xA9", curren: "\xA4", deg: "\xB0", divide: "\xF7", Eacute: "\xC9", eacute: "\xE9", Ecirc: "\xCA", ecirc: "\xEA", Egrave: "\xC8", egrave: "\xE8", ETH: "\xD0", eth: "\xF0", Euml: "\xCB", euml: "\xEB", frac12: "\xBD", frac14: "\xBC", frac34: "\xBE", gt: ">", GT: ">", Iacute: "\xCD", iacute: "\xED", Icirc: "\xCE", icirc: "\xEE", iexcl: "\xA1", Igrave: "\xCC", igrave: "\xEC", iquest: "\xBF", Iuml: "\xCF", iuml: "\xEF", laquo: "\xAB", lt: "<", LT: "<", macr: "\xAF", micro: "\xB5", middot: "\xB7", nbsp: "\xA0", not: "\xAC", Ntilde: "\xD1", ntilde: "\xF1", Oacute: "\xD3", oacute: "\xF3", Ocirc: "\xD4", ocirc: "\xF4", Ograve: "\xD2", ograve: "\xF2", ordf: "\xAA", ordm: "\xBA", Oslash: "\xD8", oslash: "\xF8", Otilde: "\xD5", otilde: "\xF5", Ouml: "\xD6", ouml: "\xF6", para: "\xB6", plusmn: "\xB1", pound: "\xA3", quot: '"', QUOT: '"', raquo: "\xBB", reg: "\xAE", REG: "\xAE", sect: "\xA7", shy: "\xAD", sup1: "\xB9", sup2: "\xB2", sup3: "\xB3", szlig: "\xDF", THORN: "\xDE", thorn: "\xFE", times: "\xD7", Uacute: "\xDA", uacute: "\xFA", Ucirc: "\xDB", ucirc: "\xFB", Ugrave: "\xD9", ugrave: "\xF9", uml: "\xA8", Uuml: "\xDC", uuml: "\xFC", Yacute: "\xDD", yacute: "\xFD", yen: "\xA5", yuml: "\xFF"};
});

// ../node_modules/entities/lib/maps/xml.json
var require_xml = __commonJS((exports2, module2) => {
  module2.exports = {amp: "&", apos: "'", gt: ">", lt: "<", quot: '"'};
});

// ../node_modules/entities/lib/maps/decode.json
var require_decode = __commonJS((exports2, module2) => {
  module2.exports = {"0": 65533, "128": 8364, "130": 8218, "131": 402, "132": 8222, "133": 8230, "134": 8224, "135": 8225, "136": 710, "137": 8240, "138": 352, "139": 8249, "140": 338, "142": 381, "145": 8216, "146": 8217, "147": 8220, "148": 8221, "149": 8226, "150": 8211, "151": 8212, "152": 732, "153": 8482, "154": 353, "155": 8250, "156": 339, "158": 382, "159": 376};
});

// ../node_modules/entities/lib/decode_codepoint.js
var require_decode_codepoint = __commonJS((exports2) => {
  "use strict";
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  var decode_json_1 = __importDefault(require_decode());
  var fromCodePoint = String.fromCodePoint || function(codePoint) {
    var output = "";
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  };
  function decodeCodePoint(codePoint) {
    if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
      return "\uFFFD";
    }
    if (codePoint in decode_json_1.default) {
      codePoint = decode_json_1.default[codePoint];
    }
    return fromCodePoint(codePoint);
  }
  exports2.default = decodeCodePoint;
});

// ../node_modules/entities/lib/decode.js
var require_decode2 = __commonJS((exports2) => {
  "use strict";
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.decodeHTML = exports2.decodeHTMLStrict = exports2.decodeXML = void 0;
  var entities_json_1 = __importDefault(require_entities());
  var legacy_json_1 = __importDefault(require_legacy());
  var xml_json_1 = __importDefault(require_xml());
  var decode_codepoint_1 = __importDefault(require_decode_codepoint());
  var strictEntityRe = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
  exports2.decodeXML = getStrictDecoder(xml_json_1.default);
  exports2.decodeHTMLStrict = getStrictDecoder(entities_json_1.default);
  function getStrictDecoder(map) {
    var replace = getReplacer(map);
    return function(str) {
      return String(str).replace(strictEntityRe, replace);
    };
  }
  var sorter = function(a, b) {
    return a < b ? 1 : -1;
  };
  exports2.decodeHTML = function() {
    var legacy = Object.keys(legacy_json_1.default).sort(sorter);
    var keys = Object.keys(entities_json_1.default).sort(sorter);
    for (var i = 0, j = 0; i < keys.length; i++) {
      if (legacy[j] === keys[i]) {
        keys[i] += ";?";
        j++;
      } else {
        keys[i] += ";";
      }
    }
    var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
    var replace = getReplacer(entities_json_1.default);
    function replacer(str) {
      if (str.substr(-1) !== ";")
        str += ";";
      return replace(str);
    }
    return function(str) {
      return String(str).replace(re, replacer);
    };
  }();
  function getReplacer(map) {
    return function replace(str) {
      if (str.charAt(1) === "#") {
        var secondChar = str.charAt(2);
        if (secondChar === "X" || secondChar === "x") {
          return decode_codepoint_1.default(parseInt(str.substr(3), 16));
        }
        return decode_codepoint_1.default(parseInt(str.substr(2), 10));
      }
      return map[str.slice(1, -1)] || str;
    };
  }
});

// ../node_modules/entities/lib/encode.js
var require_encode = __commonJS((exports2) => {
  "use strict";
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.escapeUTF8 = exports2.escape = exports2.encodeNonAsciiHTML = exports2.encodeHTML = exports2.encodeXML = void 0;
  var xml_json_1 = __importDefault(require_xml());
  var inverseXML = getInverseObj(xml_json_1.default);
  var xmlReplacer = getInverseReplacer(inverseXML);
  exports2.encodeXML = getASCIIEncoder(inverseXML);
  var entities_json_1 = __importDefault(require_entities());
  var inverseHTML = getInverseObj(entities_json_1.default);
  var htmlReplacer = getInverseReplacer(inverseHTML);
  exports2.encodeHTML = getInverse(inverseHTML, htmlReplacer);
  exports2.encodeNonAsciiHTML = getASCIIEncoder(inverseHTML);
  function getInverseObj(obj) {
    return Object.keys(obj).sort().reduce(function(inverse, name) {
      inverse[obj[name]] = "&" + name + ";";
      return inverse;
    }, {});
  }
  function getInverseReplacer(inverse) {
    var single = [];
    var multiple = [];
    for (var _i = 0, _a = Object.keys(inverse); _i < _a.length; _i++) {
      var k = _a[_i];
      if (k.length === 1) {
        single.push("\\" + k);
      } else {
        multiple.push(k);
      }
    }
    single.sort();
    for (var start = 0; start < single.length - 1; start++) {
      var end = start;
      while (end < single.length - 1 && single[end].charCodeAt(1) + 1 === single[end + 1].charCodeAt(1)) {
        end += 1;
      }
      var count = 1 + end - start;
      if (count < 3)
        continue;
      single.splice(start, count, single[start] + "-" + single[end]);
    }
    multiple.unshift("[" + single.join("") + "]");
    return new RegExp(multiple.join("|"), "g");
  }
  var reNonASCII = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
  var getCodePoint = String.prototype.codePointAt != null ? function(str) {
    return str.codePointAt(0);
  } : function(c) {
    return (c.charCodeAt(0) - 55296) * 1024 + c.charCodeAt(1) - 56320 + 65536;
  };
  function singleCharReplacer(c) {
    return "&#x" + (c.length > 1 ? getCodePoint(c) : c.charCodeAt(0)).toString(16).toUpperCase() + ";";
  }
  function getInverse(inverse, re) {
    return function(data) {
      return data.replace(re, function(name) {
        return inverse[name];
      }).replace(reNonASCII, singleCharReplacer);
    };
  }
  var reEscapeChars = new RegExp(xmlReplacer.source + "|" + reNonASCII.source, "g");
  function escape(data) {
    return data.replace(reEscapeChars, singleCharReplacer);
  }
  exports2.escape = escape;
  function escapeUTF8(data) {
    return data.replace(xmlReplacer, singleCharReplacer);
  }
  exports2.escapeUTF8 = escapeUTF8;
  function getASCIIEncoder(obj) {
    return function(data) {
      return data.replace(reEscapeChars, function(c) {
        return obj[c] || singleCharReplacer(c);
      });
    };
  }
});

// ../node_modules/entities/lib/index.js
var require_lib2 = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.decodeXMLStrict = exports2.decodeHTML5Strict = exports2.decodeHTML4Strict = exports2.decodeHTML5 = exports2.decodeHTML4 = exports2.decodeHTMLStrict = exports2.decodeHTML = exports2.decodeXML = exports2.encodeHTML5 = exports2.encodeHTML4 = exports2.escapeUTF8 = exports2.escape = exports2.encodeNonAsciiHTML = exports2.encodeHTML = exports2.encodeXML = exports2.encode = exports2.decodeStrict = exports2.decode = void 0;
  var decode_1 = require_decode2();
  var encode_1 = require_encode();
  function decode(data, level) {
    return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTML)(data);
  }
  exports2.decode = decode;
  function decodeStrict(data, level) {
    return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTMLStrict)(data);
  }
  exports2.decodeStrict = decodeStrict;
  function encode(data, level) {
    return (!level || level <= 0 ? encode_1.encodeXML : encode_1.encodeHTML)(data);
  }
  exports2.encode = encode;
  var encode_2 = require_encode();
  Object.defineProperty(exports2, "encodeXML", {enumerable: true, get: function() {
    return encode_2.encodeXML;
  }});
  Object.defineProperty(exports2, "encodeHTML", {enumerable: true, get: function() {
    return encode_2.encodeHTML;
  }});
  Object.defineProperty(exports2, "encodeNonAsciiHTML", {enumerable: true, get: function() {
    return encode_2.encodeNonAsciiHTML;
  }});
  Object.defineProperty(exports2, "escape", {enumerable: true, get: function() {
    return encode_2.escape;
  }});
  Object.defineProperty(exports2, "escapeUTF8", {enumerable: true, get: function() {
    return encode_2.escapeUTF8;
  }});
  Object.defineProperty(exports2, "encodeHTML4", {enumerable: true, get: function() {
    return encode_2.encodeHTML;
  }});
  Object.defineProperty(exports2, "encodeHTML5", {enumerable: true, get: function() {
    return encode_2.encodeHTML;
  }});
  var decode_2 = require_decode2();
  Object.defineProperty(exports2, "decodeXML", {enumerable: true, get: function() {
    return decode_2.decodeXML;
  }});
  Object.defineProperty(exports2, "decodeHTML", {enumerable: true, get: function() {
    return decode_2.decodeHTML;
  }});
  Object.defineProperty(exports2, "decodeHTMLStrict", {enumerable: true, get: function() {
    return decode_2.decodeHTMLStrict;
  }});
  Object.defineProperty(exports2, "decodeHTML4", {enumerable: true, get: function() {
    return decode_2.decodeHTML;
  }});
  Object.defineProperty(exports2, "decodeHTML5", {enumerable: true, get: function() {
    return decode_2.decodeHTML;
  }});
  Object.defineProperty(exports2, "decodeHTML4Strict", {enumerable: true, get: function() {
    return decode_2.decodeHTMLStrict;
  }});
  Object.defineProperty(exports2, "decodeHTML5Strict", {enumerable: true, get: function() {
    return decode_2.decodeHTMLStrict;
  }});
  Object.defineProperty(exports2, "decodeXMLStrict", {enumerable: true, get: function() {
    return decode_2.decodeXML;
  }});
});

// ../node_modules/dom-serializer/lib/foreignNames.js
var require_foreignNames = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.attributeNames = exports2.elementNames = void 0;
  exports2.elementNames = new Map([
    ["altglyph", "altGlyph"],
    ["altglyphdef", "altGlyphDef"],
    ["altglyphitem", "altGlyphItem"],
    ["animatecolor", "animateColor"],
    ["animatemotion", "animateMotion"],
    ["animatetransform", "animateTransform"],
    ["clippath", "clipPath"],
    ["feblend", "feBlend"],
    ["fecolormatrix", "feColorMatrix"],
    ["fecomponenttransfer", "feComponentTransfer"],
    ["fecomposite", "feComposite"],
    ["feconvolvematrix", "feConvolveMatrix"],
    ["fediffuselighting", "feDiffuseLighting"],
    ["fedisplacementmap", "feDisplacementMap"],
    ["fedistantlight", "feDistantLight"],
    ["fedropshadow", "feDropShadow"],
    ["feflood", "feFlood"],
    ["fefunca", "feFuncA"],
    ["fefuncb", "feFuncB"],
    ["fefuncg", "feFuncG"],
    ["fefuncr", "feFuncR"],
    ["fegaussianblur", "feGaussianBlur"],
    ["feimage", "feImage"],
    ["femerge", "feMerge"],
    ["femergenode", "feMergeNode"],
    ["femorphology", "feMorphology"],
    ["feoffset", "feOffset"],
    ["fepointlight", "fePointLight"],
    ["fespecularlighting", "feSpecularLighting"],
    ["fespotlight", "feSpotLight"],
    ["fetile", "feTile"],
    ["feturbulence", "feTurbulence"],
    ["foreignobject", "foreignObject"],
    ["glyphref", "glyphRef"],
    ["lineargradient", "linearGradient"],
    ["radialgradient", "radialGradient"],
    ["textpath", "textPath"]
  ]);
  exports2.attributeNames = new Map([
    ["definitionurl", "definitionURL"],
    ["attributename", "attributeName"],
    ["attributetype", "attributeType"],
    ["basefrequency", "baseFrequency"],
    ["baseprofile", "baseProfile"],
    ["calcmode", "calcMode"],
    ["clippathunits", "clipPathUnits"],
    ["diffuseconstant", "diffuseConstant"],
    ["edgemode", "edgeMode"],
    ["filterunits", "filterUnits"],
    ["glyphref", "glyphRef"],
    ["gradienttransform", "gradientTransform"],
    ["gradientunits", "gradientUnits"],
    ["kernelmatrix", "kernelMatrix"],
    ["kernelunitlength", "kernelUnitLength"],
    ["keypoints", "keyPoints"],
    ["keysplines", "keySplines"],
    ["keytimes", "keyTimes"],
    ["lengthadjust", "lengthAdjust"],
    ["limitingconeangle", "limitingConeAngle"],
    ["markerheight", "markerHeight"],
    ["markerunits", "markerUnits"],
    ["markerwidth", "markerWidth"],
    ["maskcontentunits", "maskContentUnits"],
    ["maskunits", "maskUnits"],
    ["numoctaves", "numOctaves"],
    ["pathlength", "pathLength"],
    ["patterncontentunits", "patternContentUnits"],
    ["patterntransform", "patternTransform"],
    ["patternunits", "patternUnits"],
    ["pointsatx", "pointsAtX"],
    ["pointsaty", "pointsAtY"],
    ["pointsatz", "pointsAtZ"],
    ["preservealpha", "preserveAlpha"],
    ["preserveaspectratio", "preserveAspectRatio"],
    ["primitiveunits", "primitiveUnits"],
    ["refx", "refX"],
    ["refy", "refY"],
    ["repeatcount", "repeatCount"],
    ["repeatdur", "repeatDur"],
    ["requiredextensions", "requiredExtensions"],
    ["requiredfeatures", "requiredFeatures"],
    ["specularconstant", "specularConstant"],
    ["specularexponent", "specularExponent"],
    ["spreadmethod", "spreadMethod"],
    ["startoffset", "startOffset"],
    ["stddeviation", "stdDeviation"],
    ["stitchtiles", "stitchTiles"],
    ["surfacescale", "surfaceScale"],
    ["systemlanguage", "systemLanguage"],
    ["tablevalues", "tableValues"],
    ["targetx", "targetX"],
    ["targety", "targetY"],
    ["textlength", "textLength"],
    ["viewbox", "viewBox"],
    ["viewtarget", "viewTarget"],
    ["xchannelselector", "xChannelSelector"],
    ["ychannelselector", "yChannelSelector"],
    ["zoomandpan", "zoomAndPan"]
  ]);
});

// ../node_modules/dom-serializer/lib/index.js
var require_lib3 = __commonJS((exports2) => {
  "use strict";
  var __assign = exports2 && exports2.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, {enumerable: true, get: function() {
      return m[k];
    }});
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {enumerable: true, value: v});
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports2 && exports2.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  var ElementType = __importStar(require_lib());
  var entities_1 = require_lib2();
  var foreignNames_1 = require_foreignNames();
  var unencodedElements = new Set([
    "style",
    "script",
    "xmp",
    "iframe",
    "noembed",
    "noframes",
    "plaintext",
    "noscript"
  ]);
  function formatAttributes(attributes, opts) {
    if (!attributes)
      return;
    return Object.keys(attributes).map(function(key) {
      var _a, _b;
      var value = (_a = attributes[key]) !== null && _a !== void 0 ? _a : "";
      if (opts.xmlMode === "foreign") {
        key = (_b = foreignNames_1.attributeNames.get(key)) !== null && _b !== void 0 ? _b : key;
      }
      if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
        return key;
      }
      return key + '="' + (opts.decodeEntities ? entities_1.encodeXML(value) : value.replace(/"/g, "&quot;")) + '"';
    }).join(" ");
  }
  var singleTag = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ]);
  function render(node, options) {
    if (options === void 0) {
      options = {};
    }
    var nodes = Array.isArray(node) || node.cheerio ? node : [node];
    var output = "";
    for (var i = 0; i < nodes.length; i++) {
      output += renderNode(nodes[i], options);
    }
    return output;
  }
  exports2.default = render;
  function renderNode(node, options) {
    switch (node.type) {
      case ElementType.Root:
        return render(node.children, options);
      case ElementType.Directive:
      case ElementType.Doctype:
        return renderDirective(node);
      case ElementType.Comment:
        return renderComment(node);
      case ElementType.CDATA:
        return renderCdata(node);
      case ElementType.Script:
      case ElementType.Style:
      case ElementType.Tag:
        return renderTag(node, options);
      case ElementType.Text:
        return renderText(node, options);
    }
  }
  var foreignModeIntegrationPoints = new Set([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext",
    "annotation-xml",
    "foreignObject",
    "desc",
    "title"
  ]);
  var foreignElements = new Set(["svg", "math"]);
  function renderTag(elem, opts) {
    var _a;
    if (opts.xmlMode === "foreign") {
      elem.name = (_a = foreignNames_1.elementNames.get(elem.name)) !== null && _a !== void 0 ? _a : elem.name;
      if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
        opts = __assign(__assign({}, opts), {xmlMode: false});
      }
    }
    if (!opts.xmlMode && foreignElements.has(elem.name)) {
      opts = __assign(__assign({}, opts), {xmlMode: "foreign"});
    }
    var tag = "<" + elem.name;
    var attribs = formatAttributes(elem.attribs, opts);
    if (attribs) {
      tag += " " + attribs;
    }
    if (elem.children.length === 0 && (opts.xmlMode ? opts.selfClosingTags !== false : opts.selfClosingTags && singleTag.has(elem.name))) {
      if (!opts.xmlMode)
        tag += " ";
      tag += "/>";
    } else {
      tag += ">";
      if (elem.children.length > 0) {
        tag += render(elem.children, opts);
      }
      if (opts.xmlMode || !singleTag.has(elem.name)) {
        tag += "</" + elem.name + ">";
      }
    }
    return tag;
  }
  function renderDirective(elem) {
    return "<" + elem.data + ">";
  }
  function renderText(elem, opts) {
    var data = elem.data || "";
    if (opts.decodeEntities && !(elem.parent && unencodedElements.has(elem.parent.name))) {
      data = entities_1.encodeXML(data);
    }
    return data;
  }
  function renderCdata(elem) {
    return "<![CDATA[" + elem.children[0].data + "]]>";
  }
  function renderComment(elem) {
    return "<!--" + elem.data + "-->";
  }
});

// ../node_modules/domutils/lib/stringify.js
var require_stringify = __commonJS((exports2) => {
  "use strict";
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.getText = exports2.getInnerHTML = exports2.getOuterHTML = void 0;
  var tagtypes_1 = require_tagtypes();
  var dom_serializer_1 = __importDefault(require_lib3());
  function getOuterHTML(node, options) {
    return dom_serializer_1.default(node, options);
  }
  exports2.getOuterHTML = getOuterHTML;
  function getInnerHTML(node, options) {
    return tagtypes_1.hasChildren(node) ? node.children.map(function(node2) {
      return getOuterHTML(node2, options);
    }).join("") : "";
  }
  exports2.getInnerHTML = getInnerHTML;
  function getText(node) {
    if (Array.isArray(node))
      return node.map(getText).join("");
    if (tagtypes_1.isTag(node))
      return node.name === "br" ? "\n" : getText(node.children);
    if (tagtypes_1.isCDATA(node))
      return getText(node.children);
    if (tagtypes_1.isText(node))
      return node.data;
    return "";
  }
  exports2.getText = getText;
});

// ../node_modules/domutils/lib/traversal.js
var require_traversal = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.prevElementSibling = exports2.nextElementSibling = exports2.getName = exports2.hasAttrib = exports2.getAttributeValue = exports2.getSiblings = exports2.getParent = exports2.getChildren = void 0;
  var tagtypes_1 = require_tagtypes();
  var emptyArray = [];
  function getChildren(elem) {
    var _a;
    return (_a = elem.children) !== null && _a !== void 0 ? _a : emptyArray;
  }
  exports2.getChildren = getChildren;
  function getParent(elem) {
    return elem.parent || null;
  }
  exports2.getParent = getParent;
  function getSiblings(elem) {
    var _a, _b;
    var parent = getParent(elem);
    if (parent != null)
      return getChildren(parent);
    var siblings = [elem];
    var prev = elem.prev, next = elem.next;
    while (prev != null) {
      siblings.unshift(prev);
      _a = prev, prev = _a.prev;
    }
    while (next != null) {
      siblings.push(next);
      _b = next, next = _b.next;
    }
    return siblings;
  }
  exports2.getSiblings = getSiblings;
  function getAttributeValue(elem, name) {
    var _a;
    return (_a = elem.attribs) === null || _a === void 0 ? void 0 : _a[name];
  }
  exports2.getAttributeValue = getAttributeValue;
  function hasAttrib(elem, name) {
    return elem.attribs != null && Object.prototype.hasOwnProperty.call(elem.attribs, name) && elem.attribs[name] != null;
  }
  exports2.hasAttrib = hasAttrib;
  function getName(elem) {
    return elem.name;
  }
  exports2.getName = getName;
  function nextElementSibling(elem) {
    var _a;
    var next = elem.next;
    while (next !== null && !tagtypes_1.isTag(next))
      _a = next, next = _a.next;
    return next;
  }
  exports2.nextElementSibling = nextElementSibling;
  function prevElementSibling(elem) {
    var _a;
    var prev = elem.prev;
    while (prev !== null && !tagtypes_1.isTag(prev))
      _a = prev, prev = _a.prev;
    return prev;
  }
  exports2.prevElementSibling = prevElementSibling;
});

// ../node_modules/domutils/lib/manipulation.js
var require_manipulation = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.prepend = exports2.prependChild = exports2.append = exports2.appendChild = exports2.replaceElement = exports2.removeElement = void 0;
  function removeElement(elem) {
    if (elem.prev)
      elem.prev.next = elem.next;
    if (elem.next)
      elem.next.prev = elem.prev;
    if (elem.parent) {
      var childs = elem.parent.children;
      childs.splice(childs.lastIndexOf(elem), 1);
    }
  }
  exports2.removeElement = removeElement;
  function replaceElement(elem, replacement) {
    var prev = replacement.prev = elem.prev;
    if (prev) {
      prev.next = replacement;
    }
    var next = replacement.next = elem.next;
    if (next) {
      next.prev = replacement;
    }
    var parent = replacement.parent = elem.parent;
    if (parent) {
      var childs = parent.children;
      childs[childs.lastIndexOf(elem)] = replacement;
    }
  }
  exports2.replaceElement = replaceElement;
  function appendChild(elem, child) {
    removeElement(child);
    child.next = null;
    child.parent = elem;
    if (elem.children.push(child) > 1) {
      var sibling = elem.children[elem.children.length - 2];
      sibling.next = child;
      child.prev = sibling;
    } else {
      child.prev = null;
    }
  }
  exports2.appendChild = appendChild;
  function append(elem, next) {
    removeElement(next);
    var parent = elem.parent;
    var currNext = elem.next;
    next.next = currNext;
    next.prev = elem;
    elem.next = next;
    next.parent = parent;
    if (currNext) {
      currNext.prev = next;
      if (parent) {
        var childs = parent.children;
        childs.splice(childs.lastIndexOf(currNext), 0, next);
      }
    } else if (parent) {
      parent.children.push(next);
    }
  }
  exports2.append = append;
  function prependChild(elem, child) {
    removeElement(child);
    child.parent = elem;
    child.prev = null;
    if (elem.children.unshift(child) !== 1) {
      var sibling = elem.children[1];
      sibling.prev = child;
      child.next = sibling;
    } else {
      child.next = null;
    }
  }
  exports2.prependChild = prependChild;
  function prepend(elem, prev) {
    removeElement(prev);
    var parent = elem.parent;
    if (parent) {
      var childs = parent.children;
      childs.splice(childs.indexOf(elem), 0, prev);
    }
    if (elem.prev) {
      elem.prev.next = prev;
    }
    prev.parent = parent;
    prev.prev = elem.prev;
    prev.next = elem;
    elem.prev = prev;
  }
  exports2.prepend = prepend;
});

// ../node_modules/domutils/lib/querying.js
var require_querying = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.findAll = exports2.existsOne = exports2.findOne = exports2.findOneChild = exports2.find = exports2.filter = void 0;
  var tagtypes_1 = require_tagtypes();
  function filter(test, node, recurse, limit) {
    if (recurse === void 0) {
      recurse = true;
    }
    if (limit === void 0) {
      limit = Infinity;
    }
    if (!Array.isArray(node))
      node = [node];
    return find(test, node, recurse, limit);
  }
  exports2.filter = filter;
  function find(test, nodes, recurse, limit) {
    var result = [];
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
      var elem = nodes_1[_i];
      if (test(elem)) {
        result.push(elem);
        if (--limit <= 0)
          break;
      }
      if (recurse && tagtypes_1.hasChildren(elem) && elem.children.length > 0) {
        var children = find(test, elem.children, recurse, limit);
        result.push.apply(result, children);
        limit -= children.length;
        if (limit <= 0)
          break;
      }
    }
    return result;
  }
  exports2.find = find;
  function findOneChild(test, nodes) {
    return nodes.find(test);
  }
  exports2.findOneChild = findOneChild;
  function findOne(test, nodes, recurse) {
    if (recurse === void 0) {
      recurse = true;
    }
    var elem = null;
    for (var i = 0; i < nodes.length && !elem; i++) {
      var checked = nodes[i];
      if (!tagtypes_1.isTag(checked)) {
        continue;
      } else if (test(checked)) {
        elem = checked;
      } else if (recurse && checked.children.length > 0) {
        elem = findOne(test, checked.children);
      }
    }
    return elem;
  }
  exports2.findOne = findOne;
  function existsOne(test, nodes) {
    return nodes.some(function(checked) {
      return tagtypes_1.isTag(checked) && (test(checked) || checked.children.length > 0 && existsOne(test, checked.children));
    });
  }
  exports2.existsOne = existsOne;
  function findAll(test, nodes) {
    var _a;
    var result = [];
    var stack = nodes.filter(tagtypes_1.isTag);
    var elem;
    while (elem = stack.shift()) {
      var children = (_a = elem.children) === null || _a === void 0 ? void 0 : _a.filter(tagtypes_1.isTag);
      if (children && children.length > 0) {
        stack.unshift.apply(stack, children);
      }
      if (test(elem))
        result.push(elem);
    }
    return result;
  }
  exports2.findAll = findAll;
});

// ../node_modules/domutils/lib/legacy.js
var require_legacy2 = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.getElementsByTagType = exports2.getElementsByTagName = exports2.getElementById = exports2.getElements = exports2.testElement = void 0;
  var querying_1 = require_querying();
  var tagtypes_1 = require_tagtypes();
  var Checks = {
    tag_name: function(name) {
      if (typeof name === "function") {
        return function(elem) {
          return tagtypes_1.isTag(elem) && name(elem.name);
        };
      } else if (name === "*") {
        return tagtypes_1.isTag;
      }
      return function(elem) {
        return tagtypes_1.isTag(elem) && elem.name === name;
      };
    },
    tag_type: function(type) {
      if (typeof type === "function") {
        return function(elem) {
          return type(elem.type);
        };
      }
      return function(elem) {
        return elem.type === type;
      };
    },
    tag_contains: function(data) {
      if (typeof data === "function") {
        return function(elem) {
          return tagtypes_1.isText(elem) && data(elem.data);
        };
      }
      return function(elem) {
        return tagtypes_1.isText(elem) && elem.data === data;
      };
    }
  };
  function getAttribCheck(attrib, value) {
    if (typeof value === "function") {
      return function(elem) {
        return tagtypes_1.isTag(elem) && value(elem.attribs[attrib]);
      };
    }
    return function(elem) {
      return tagtypes_1.isTag(elem) && elem.attribs[attrib] === value;
    };
  }
  function combineFuncs(a, b) {
    return function(elem) {
      return a(elem) || b(elem);
    };
  }
  function compileTest(options) {
    var funcs = Object.keys(options).map(function(key) {
      var value = options[key];
      return key in Checks ? Checks[key](value) : getAttribCheck(key, value);
    });
    return funcs.length === 0 ? null : funcs.reduce(combineFuncs);
  }
  function testElement(options, node) {
    var test = compileTest(options);
    return test ? test(node) : true;
  }
  exports2.testElement = testElement;
  function getElements(options, nodes, recurse, limit) {
    if (limit === void 0) {
      limit = Infinity;
    }
    var test = compileTest(options);
    return test ? querying_1.filter(test, nodes, recurse, limit) : [];
  }
  exports2.getElements = getElements;
  function getElementById(id, nodes, recurse) {
    if (recurse === void 0) {
      recurse = true;
    }
    if (!Array.isArray(nodes))
      nodes = [nodes];
    return querying_1.findOne(getAttribCheck("id", id), nodes, recurse);
  }
  exports2.getElementById = getElementById;
  function getElementsByTagName(tagName, nodes, recurse, limit) {
    if (recurse === void 0) {
      recurse = true;
    }
    if (limit === void 0) {
      limit = Infinity;
    }
    return querying_1.filter(Checks.tag_name(tagName), nodes, recurse, limit);
  }
  exports2.getElementsByTagName = getElementsByTagName;
  function getElementsByTagType(type, nodes, recurse, limit) {
    if (recurse === void 0) {
      recurse = true;
    }
    if (limit === void 0) {
      limit = Infinity;
    }
    return querying_1.filter(Checks.tag_type(type), nodes, recurse, limit);
  }
  exports2.getElementsByTagType = getElementsByTagType;
});

// ../node_modules/domutils/lib/helpers.js
var require_helpers = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.uniqueSort = exports2.compareDocumentPosition = exports2.removeSubsets = void 0;
  var tagtypes_1 = require_tagtypes();
  function removeSubsets(nodes) {
    var idx = nodes.length;
    while (--idx >= 0) {
      var node = nodes[idx];
      if (idx > 0 && nodes.lastIndexOf(node, idx - 1) >= 0) {
        nodes.splice(idx, 1);
        continue;
      }
      for (var ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
        if (nodes.includes(ancestor)) {
          nodes.splice(idx, 1);
          break;
        }
      }
    }
    return nodes;
  }
  exports2.removeSubsets = removeSubsets;
  function compareDocumentPosition(nodeA, nodeB) {
    var aParents = [];
    var bParents = [];
    if (nodeA === nodeB) {
      return 0;
    }
    var current = tagtypes_1.hasChildren(nodeA) ? nodeA : nodeA.parent;
    while (current) {
      aParents.unshift(current);
      current = current.parent;
    }
    current = tagtypes_1.hasChildren(nodeB) ? nodeB : nodeB.parent;
    while (current) {
      bParents.unshift(current);
      current = current.parent;
    }
    var maxIdx = Math.min(aParents.length, bParents.length);
    var idx = 0;
    while (idx < maxIdx && aParents[idx] === bParents[idx]) {
      idx++;
    }
    if (idx === 0) {
      return 1;
    }
    var sharedParent = aParents[idx - 1];
    var siblings = sharedParent.children;
    var aSibling = aParents[idx];
    var bSibling = bParents[idx];
    if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
      if (sharedParent === nodeB) {
        return 4 | 16;
      }
      return 4;
    }
    if (sharedParent === nodeA) {
      return 2 | 8;
    }
    return 2;
  }
  exports2.compareDocumentPosition = compareDocumentPosition;
  function uniqueSort(nodes) {
    nodes = nodes.filter(function(node, i, arr) {
      return !arr.includes(node, i + 1);
    });
    nodes.sort(function(a, b) {
      var relative = compareDocumentPosition(a, b);
      if (relative & 2) {
        return -1;
      } else if (relative & 4) {
        return 1;
      }
      return 0;
    });
    return nodes;
  }
  exports2.uniqueSort = uniqueSort;
});

// ../node_modules/domutils/lib/index.js
var require_lib4 = __commonJS((exports2) => {
  "use strict";
  var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, {enumerable: true, get: function() {
      return m[k];
    }});
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
        __createBinding(exports3, m, p);
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  __exportStar(require_stringify(), exports2);
  __exportStar(require_traversal(), exports2);
  __exportStar(require_manipulation(), exports2);
  __exportStar(require_querying(), exports2);
  __exportStar(require_legacy2(), exports2);
  __exportStar(require_helpers(), exports2);
  __exportStar(require_tagtypes(), exports2);
});

// ../node_modules/boolbase/index.js
var require_boolbase = __commonJS((exports2, module2) => {
  module2.exports = {
    trueFunc: function trueFunc() {
      return true;
    },
    falseFunc: function falseFunc() {
      return false;
    }
  };
});

// ../node_modules/css-what/lib/parse.js
var require_parse = __commonJS((exports2) => {
  "use strict";
  var __spreadArrays = exports2 && exports2.__spreadArrays || function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.isTraversal = void 0;
  var reName = /^[^\\#]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\-\u00b0-\uFFFF])+/;
  var reEscape = /\\([\da-f]{1,6}\s?|(\s)|.)/gi;
  var reAttr = /^\s*(?:(\*|[-\w]*)\|)?((?:\\.|[\w\u00b0-\uFFFF-])+)\s*(?:(\S?)=\s*(?:(['"])((?:[^\\]|\\[^])*?)\4|(#?(?:\\.|[\w\u00b0-\uFFFF-])*)|)|)\s*([iI])?\]/;
  var actionTypes = {
    undefined: "exists",
    "": "equals",
    "~": "element",
    "^": "start",
    $: "end",
    "*": "any",
    "!": "not",
    "|": "hyphen"
  };
  var Traversals = {
    ">": "child",
    "<": "parent",
    "~": "sibling",
    "+": "adjacent"
  };
  var attribSelectors = {
    "#": ["id", "equals"],
    ".": ["class", "element"]
  };
  var unpackPseudos = new Set([
    "has",
    "not",
    "matches",
    "is",
    "host",
    "host-context"
  ]);
  var traversalNames = new Set(__spreadArrays([
    "descendant"
  ], Object.keys(Traversals).map(function(k) {
    return Traversals[k];
  })));
  function isTraversal(selector) {
    return traversalNames.has(selector.type);
  }
  exports2.isTraversal = isTraversal;
  var stripQuotesFromPseudos = new Set(["contains", "icontains"]);
  var quotes = new Set(['"', "'"]);
  function funescape(_, escaped, escapedWhitespace) {
    var high = parseInt(escaped, 16) - 65536;
    return high !== high || escapedWhitespace ? escaped : high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
  }
  function unescapeCSS(str) {
    return str.replace(reEscape, funescape);
  }
  function isWhitespace(c) {
    return c === " " || c === "\n" || c === "	" || c === "\f" || c === "\r";
  }
  function parse(selector, options) {
    var subselects = [];
    var endIndex = parseSelector(subselects, "" + selector, options, 0);
    if (endIndex < selector.length) {
      throw new Error("Unmatched selector: " + selector.slice(endIndex));
    }
    return subselects;
  }
  exports2.default = parse;
  function parseSelector(subselects, selector, options, selectorIndex) {
    var _a, _b;
    if (options === void 0) {
      options = {};
    }
    var tokens = [];
    var sawWS = false;
    function getName(offset) {
      var match = selector.slice(selectorIndex + offset).match(reName);
      if (!match) {
        throw new Error("Expected name, found " + selector.slice(selectorIndex));
      }
      var name = match[0];
      selectorIndex += offset + name.length;
      return unescapeCSS(name);
    }
    function stripWhitespace(offset) {
      while (isWhitespace(selector.charAt(selectorIndex + offset)))
        offset++;
      selectorIndex += offset;
    }
    function isEscaped(pos) {
      var slashCount = 0;
      while (selector.charAt(--pos) === "\\")
        slashCount++;
      return (slashCount & 1) === 1;
    }
    function ensureNotTraversal() {
      if (tokens.length > 0 && isTraversal(tokens[tokens.length - 1])) {
        throw new Error("Did not expect successive traversals.");
      }
    }
    stripWhitespace(0);
    while (selector !== "") {
      var firstChar = selector.charAt(selectorIndex);
      if (isWhitespace(firstChar)) {
        sawWS = true;
        stripWhitespace(1);
      } else if (firstChar in Traversals) {
        ensureNotTraversal();
        tokens.push({type: Traversals[firstChar]});
        sawWS = false;
        stripWhitespace(1);
      } else if (firstChar === ",") {
        if (tokens.length === 0) {
          throw new Error("Empty sub-selector");
        }
        subselects.push(tokens);
        tokens = [];
        sawWS = false;
        stripWhitespace(1);
      } else {
        if (sawWS) {
          ensureNotTraversal();
          tokens.push({type: "descendant"});
          sawWS = false;
        }
        if (firstChar in attribSelectors) {
          var _c = attribSelectors[firstChar], name_1 = _c[0], action = _c[1];
          tokens.push({
            type: "attribute",
            name: name_1,
            action,
            value: getName(1),
            ignoreCase: false,
            namespace: null
          });
        } else if (firstChar === "[") {
          var attributeMatch = selector.slice(selectorIndex + 1).match(reAttr);
          if (!attributeMatch) {
            throw new Error("Malformed attribute selector: " + selector.slice(selectorIndex));
          }
          var completeSelector = attributeMatch[0], _d = attributeMatch[1], namespace = _d === void 0 ? null : _d, baseName = attributeMatch[2], actionType = attributeMatch[3], _e = attributeMatch[5], quotedValue = _e === void 0 ? "" : _e, _f = attributeMatch[6], value = _f === void 0 ? quotedValue : _f, ignoreCase = attributeMatch[7];
          selectorIndex += completeSelector.length + 1;
          var name_2 = unescapeCSS(baseName);
          if ((_a = options.lowerCaseAttributeNames) !== null && _a !== void 0 ? _a : !options.xmlMode) {
            name_2 = name_2.toLowerCase();
          }
          tokens.push({
            type: "attribute",
            name: name_2,
            action: actionTypes[actionType],
            value: unescapeCSS(value),
            namespace,
            ignoreCase: !!ignoreCase
          });
        } else if (firstChar === ":") {
          if (selector.charAt(selectorIndex + 1) === ":") {
            tokens.push({
              type: "pseudo-element",
              name: getName(2).toLowerCase()
            });
            continue;
          }
          var name_3 = getName(1).toLowerCase();
          var data = null;
          if (selector.charAt(selectorIndex) === "(") {
            if (unpackPseudos.has(name_3)) {
              if (quotes.has(selector.charAt(selectorIndex + 1))) {
                throw new Error("Pseudo-selector " + name_3 + " cannot be quoted");
              }
              data = [];
              selectorIndex = parseSelector(data, selector, options, selectorIndex + 1);
              if (selector.charAt(selectorIndex) !== ")") {
                throw new Error("Missing closing parenthesis in :" + name_3 + " (" + selector + ")");
              }
              selectorIndex += 1;
            } else {
              selectorIndex += 1;
              var start = selectorIndex;
              var counter = 1;
              for (; counter > 0 && selectorIndex < selector.length; selectorIndex++) {
                if (selector.charAt(selectorIndex) === "(" && !isEscaped(selectorIndex)) {
                  counter++;
                } else if (selector.charAt(selectorIndex) === ")" && !isEscaped(selectorIndex)) {
                  counter--;
                }
              }
              if (counter) {
                throw new Error("Parenthesis not matched");
              }
              data = selector.slice(start, selectorIndex - 1);
              if (stripQuotesFromPseudos.has(name_3)) {
                var quot = data.charAt(0);
                if (quot === data.slice(-1) && quotes.has(quot)) {
                  data = data.slice(1, -1);
                }
                data = unescapeCSS(data);
              }
            }
          }
          tokens.push({type: "pseudo", name: name_3, data});
        } else {
          var namespace = null;
          var name_4 = void 0;
          if (firstChar === "*") {
            selectorIndex += 1;
            name_4 = "*";
          } else if (reName.test(selector.slice(selectorIndex))) {
            name_4 = getName(0);
          } else {
            if (tokens.length && tokens[tokens.length - 1].type === "descendant") {
              tokens.pop();
            }
            addToken(subselects, tokens);
            return selectorIndex;
          }
          if (selector.charAt(selectorIndex) === "|") {
            namespace = name_4;
            if (selector.charAt(selectorIndex + 1) === "*") {
              name_4 = "*";
              selectorIndex += 2;
            } else {
              name_4 = getName(1);
            }
          }
          if (name_4 === "*") {
            tokens.push({type: "universal", namespace});
          } else {
            if ((_b = options.lowerCaseTags) !== null && _b !== void 0 ? _b : !options.xmlMode) {
              name_4 = name_4.toLowerCase();
            }
            tokens.push({type: "tag", name: name_4, namespace});
          }
        }
      }
    }
    addToken(subselects, tokens);
    return selectorIndex;
  }
  function addToken(subselects, tokens) {
    if (subselects.length > 0 && tokens.length === 0) {
      throw new Error("Empty sub-selector");
    }
    subselects.push(tokens);
  }
});

// ../node_modules/css-what/lib/stringify.js
var require_stringify2 = __commonJS((exports2) => {
  "use strict";
  var __spreadArrays = exports2 && exports2.__spreadArrays || function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  var actionTypes = {
    equals: "",
    element: "~",
    start: "^",
    end: "$",
    any: "*",
    not: "!",
    hyphen: "|"
  };
  var charsToEscape = new Set(__spreadArrays(Object.keys(actionTypes).map(function(typeKey) {
    return actionTypes[typeKey];
  }).filter(Boolean), [
    ":",
    "[",
    "]",
    " ",
    "\\",
    "(",
    ")"
  ]));
  function stringify(selector) {
    return selector.map(stringifySubselector).join(", ");
  }
  exports2.default = stringify;
  function stringifySubselector(token) {
    return token.map(stringifyToken).join("");
  }
  function stringifyToken(token) {
    switch (token.type) {
      case "child":
        return " > ";
      case "parent":
        return " < ";
      case "sibling":
        return " ~ ";
      case "adjacent":
        return " + ";
      case "descendant":
        return " ";
      case "universal":
        return getNamespace(token.namespace) + "*";
      case "tag":
        return getNamespacedName(token);
      case "pseudo-element":
        return "::" + escapeName(token.name);
      case "pseudo":
        if (token.data === null)
          return ":" + escapeName(token.name);
        if (typeof token.data === "string") {
          return ":" + escapeName(token.name) + "(" + escapeName(token.data) + ")";
        }
        return ":" + escapeName(token.name) + "(" + stringify(token.data) + ")";
      case "attribute": {
        if (token.name === "id" && token.action === "equals" && !token.ignoreCase && !token.namespace) {
          return "#" + escapeName(token.value);
        }
        if (token.name === "class" && token.action === "element" && !token.ignoreCase && !token.namespace) {
          return "." + escapeName(token.value);
        }
        var name_1 = getNamespacedName(token);
        if (token.action === "exists") {
          return "[" + name_1 + "]";
        }
        return "[" + name_1 + actionTypes[token.action] + "='" + escapeName(token.value) + "'" + (token.ignoreCase ? "i" : "") + "]";
      }
    }
  }
  function getNamespacedName(token) {
    return "" + getNamespace(token.namespace) + escapeName(token.name);
  }
  function getNamespace(namespace) {
    return namespace ? (namespace === "*" ? "*" : escapeName(namespace)) + "|" : "";
  }
  function escapeName(str) {
    return str.split("").map(function(c) {
      return charsToEscape.has(c) ? "\\" + c : c;
    }).join("");
  }
});

// ../node_modules/css-what/lib/index.js
var require_lib5 = __commonJS((exports2) => {
  "use strict";
  var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, {enumerable: true, get: function() {
      return m[k];
    }});
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
        __createBinding(exports3, m, p);
  };
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.stringify = exports2.parse = void 0;
  __exportStar(require_parse(), exports2);
  var parse_1 = require_parse();
  Object.defineProperty(exports2, "parse", {enumerable: true, get: function() {
    return __importDefault(parse_1).default;
  }});
  var stringify_1 = require_stringify2();
  Object.defineProperty(exports2, "stringify", {enumerable: true, get: function() {
    return __importDefault(stringify_1).default;
  }});
});

// ../node_modules/css-select/lib/procedure.js
var require_procedure = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.isTraversal = exports2.procedure = void 0;
  exports2.procedure = {
    universal: 50,
    tag: 30,
    attribute: 1,
    pseudo: 0,
    "pseudo-element": 0,
    descendant: -1,
    child: -1,
    parent: -1,
    sibling: -1,
    adjacent: -1,
    _flexibleDescendant: -1
  };
  function isTraversal(t) {
    return exports2.procedure[t.type] < 0;
  }
  exports2.isTraversal = isTraversal;
});

// ../node_modules/css-select/lib/sort.js
var require_sort = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var procedure_1 = require_procedure();
  var attributes = {
    exists: 10,
    equals: 8,
    not: 7,
    start: 6,
    end: 6,
    any: 5,
    hyphen: 4,
    element: 4
  };
  function sortByProcedure(arr) {
    var procs = arr.map(getProcedure);
    for (var i = 1; i < arr.length; i++) {
      var procNew = procs[i];
      if (procNew < 0)
        continue;
      for (var j = i - 1; j >= 0 && procNew < procs[j]; j--) {
        var token = arr[j + 1];
        arr[j + 1] = arr[j];
        arr[j] = token;
        procs[j + 1] = procs[j];
        procs[j] = procNew;
      }
    }
  }
  exports2.default = sortByProcedure;
  function getProcedure(token) {
    var proc = procedure_1.procedure[token.type];
    if (token.type === "attribute") {
      proc = attributes[token.action];
      if (proc === attributes.equals && token.name === "id") {
        proc = 9;
      }
      if (token.ignoreCase) {
        proc >>= 1;
      }
    } else if (token.type === "pseudo") {
      if (!token.data) {
        proc = 3;
      } else if (token.name === "has" || token.name === "contains") {
        proc = 0;
      } else if (Array.isArray(token.data)) {
        proc = 0;
        for (var i = 0; i < token.data.length; i++) {
          if (token.data[i].length !== 1)
            continue;
          var cur = getProcedure(token.data[i][0]);
          if (cur === 0) {
            proc = 0;
            break;
          }
          if (cur > proc)
            proc = cur;
        }
        if (token.data.length > 1 && proc > 0)
          proc -= 1;
      } else {
        proc = 1;
      }
    }
    return proc;
  }
});

// ../node_modules/css-select/lib/attributes.js
var require_attributes = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.attributeRules = void 0;
  var boolbase_1 = require_boolbase();
  var reChars = /[-[\]{}()*+?.,\\^$|#\s]/g;
  function escapeRegex(value) {
    return value.replace(reChars, "\\$&");
  }
  exports2.attributeRules = {
    equals: function(next, data, _a) {
      var adapter = _a.adapter;
      var name = data.name;
      var value = data.value;
      if (data.ignoreCase) {
        value = value.toLowerCase();
        return function(elem) {
          var _a2;
          return ((_a2 = adapter.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.toLowerCase()) === value && next(elem);
        };
      }
      return function(elem) {
        return adapter.getAttributeValue(elem, name) === value && next(elem);
      };
    },
    hyphen: function(next, data, _a) {
      var adapter = _a.adapter;
      var name = data.name;
      var value = data.value;
      var len = value.length;
      if (data.ignoreCase) {
        value = value.toLowerCase();
        return function hyphenIC(elem) {
          var attr = adapter.getAttributeValue(elem, name);
          return attr != null && (attr.length === len || attr.charAt(len) === "-") && attr.substr(0, len).toLowerCase() === value && next(elem);
        };
      }
      return function hyphen(elem) {
        var attr = adapter.getAttributeValue(elem, name);
        return attr != null && attr.substr(0, len) === value && (attr.length === len || attr.charAt(len) === "-") && next(elem);
      };
    },
    element: function(next, _a, _b) {
      var name = _a.name, value = _a.value, ignoreCase = _a.ignoreCase;
      var adapter = _b.adapter;
      if (/\s/.test(value)) {
        return boolbase_1.falseFunc;
      }
      var regex = new RegExp("(?:^|\\s)" + escapeRegex(value) + "(?:$|\\s)", ignoreCase ? "i" : "");
      return function element2(elem) {
        var attr = adapter.getAttributeValue(elem, name);
        return attr != null && regex.test(attr) && next(elem);
      };
    },
    exists: function(next, _a, _b) {
      var name = _a.name;
      var adapter = _b.adapter;
      return function(elem) {
        return adapter.hasAttrib(elem, name) && next(elem);
      };
    },
    start: function(next, data, _a) {
      var adapter = _a.adapter;
      var name = data.name;
      var value = data.value;
      var len = value.length;
      if (len === 0) {
        return boolbase_1.falseFunc;
      }
      if (data.ignoreCase) {
        value = value.toLowerCase();
        return function(elem) {
          var _a2;
          return ((_a2 = adapter.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.substr(0, len).toLowerCase()) === value && next(elem);
        };
      }
      return function(elem) {
        var _a2;
        return !!((_a2 = adapter.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.startsWith(value)) && next(elem);
      };
    },
    end: function(next, data, _a) {
      var adapter = _a.adapter;
      var name = data.name;
      var value = data.value;
      var len = -value.length;
      if (len === 0) {
        return boolbase_1.falseFunc;
      }
      if (data.ignoreCase) {
        value = value.toLowerCase();
        return function(elem) {
          var _a2;
          return ((_a2 = adapter.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.substr(len).toLowerCase()) === value && next(elem);
        };
      }
      return function(elem) {
        var _a2;
        return !!((_a2 = adapter.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.endsWith(value)) && next(elem);
      };
    },
    any: function(next, data, _a) {
      var adapter = _a.adapter;
      var name = data.name, value = data.value;
      if (value === "") {
        return boolbase_1.falseFunc;
      }
      if (data.ignoreCase) {
        var regex_1 = new RegExp(escapeRegex(value), "i");
        return function anyIC(elem) {
          var attr = adapter.getAttributeValue(elem, name);
          return attr != null && regex_1.test(attr) && next(elem);
        };
      }
      return function(elem) {
        var _a2;
        return !!((_a2 = adapter.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.includes(value)) && next(elem);
      };
    },
    not: function(next, data, _a) {
      var adapter = _a.adapter;
      var name = data.name;
      var value = data.value;
      if (value === "") {
        return function(elem) {
          return !!adapter.getAttributeValue(elem, name) && next(elem);
        };
      } else if (data.ignoreCase) {
        value = value.toLowerCase();
        return function(elem) {
          var attr = adapter.getAttributeValue(elem, name);
          return attr != null && attr.toLocaleLowerCase() !== value && next(elem);
        };
      }
      return function(elem) {
        return adapter.getAttributeValue(elem, name) !== value && next(elem);
      };
    }
  };
});

// ../node_modules/nth-check/lib/parse.js
var require_parse2 = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.parse = void 0;
  var RE_NTH_ELEMENT = /^([+-]?\d*n)?\s*(?:([+-]?)\s*(\d+))?$/;
  function parse(formula) {
    formula = formula.trim().toLowerCase();
    if (formula === "even") {
      return [2, 0];
    } else if (formula === "odd") {
      return [2, 1];
    }
    var parsed = formula.match(RE_NTH_ELEMENT);
    if (!parsed) {
      throw new Error("n-th rule couldn't be parsed ('" + formula + "')");
    }
    var a;
    if (parsed[1]) {
      a = parseInt(parsed[1], 10);
      if (isNaN(a)) {
        a = parsed[1].startsWith("-") ? -1 : 1;
      }
    } else
      a = 0;
    var b = (parsed[2] === "-" ? -1 : 1) * (parsed[3] ? parseInt(parsed[3], 10) : 0);
    return [a, b];
  }
  exports2.parse = parse;
});

// ../node_modules/nth-check/lib/compile.js
var require_compile = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.compile = void 0;
  var boolbase_1 = require_boolbase();
  function compile(parsed) {
    var a = parsed[0];
    var b = parsed[1] - 1;
    if (b < 0 && a <= 0)
      return boolbase_1.falseFunc;
    if (a === -1)
      return function(index) {
        return index <= b;
      };
    if (a === 0)
      return function(index) {
        return index === b;
      };
    if (a === 1)
      return b < 0 ? boolbase_1.trueFunc : function(index) {
        return index >= b;
      };
    var absA = Math.abs(a);
    var bMod = (b % absA + absA) % absA;
    return a > 1 ? function(index) {
      return index >= b && index % absA === bMod;
    } : function(index) {
      return index <= b && index % absA === bMod;
    };
  }
  exports2.compile = compile;
});

// ../node_modules/nth-check/lib/index.js
var require_lib6 = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.compile = exports2.parse = void 0;
  var parse_1 = require_parse2();
  Object.defineProperty(exports2, "parse", {enumerable: true, get: function() {
    return parse_1.parse;
  }});
  var compile_1 = require_compile();
  Object.defineProperty(exports2, "compile", {enumerable: true, get: function() {
    return compile_1.compile;
  }});
  function nthCheck(formula) {
    return compile_1.compile(parse_1.parse(formula));
  }
  exports2.default = nthCheck;
});

// ../node_modules/css-select/lib/pseudo-selectors/filters.js
var require_filters = __commonJS((exports2) => {
  "use strict";
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.filters = void 0;
  var nth_check_1 = __importDefault(require_lib6());
  var boolbase_1 = require_boolbase();
  var attributes_1 = require_attributes();
  var checkAttrib = attributes_1.attributeRules.equals;
  function getAttribFunc(name, value) {
    var data = {
      type: "attribute",
      action: "equals",
      ignoreCase: false,
      namespace: null,
      name,
      value
    };
    return function attribFunc(next, _rule, options) {
      return checkAttrib(next, data, options);
    };
  }
  function getChildFunc(next, adapter) {
    return function(elem) {
      var parent = adapter.getParent(elem);
      return !!parent && adapter.isTag(parent) && next(elem);
    };
  }
  exports2.filters = {
    contains: function(next, text, _a) {
      var adapter = _a.adapter;
      return function contains(elem) {
        return next(elem) && adapter.getText(elem).includes(text);
      };
    },
    icontains: function(next, text, _a) {
      var adapter = _a.adapter;
      var itext = text.toLowerCase();
      return function icontains(elem) {
        return next(elem) && adapter.getText(elem).toLowerCase().includes(itext);
      };
    },
    "nth-child": function(next, rule, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      var func = nth_check_1.default(rule);
      if (func === boolbase_1.falseFunc)
        return boolbase_1.falseFunc;
      if (func === boolbase_1.trueFunc)
        return getChildFunc(next, adapter);
      return function nthChild(elem) {
        var siblings = adapter.getSiblings(elem);
        var pos = 0;
        for (var i = 0; i < siblings.length; i++) {
          if (equals(elem, siblings[i]))
            break;
          if (adapter.isTag(siblings[i])) {
            pos++;
          }
        }
        return func(pos) && next(elem);
      };
    },
    "nth-last-child": function(next, rule, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      var func = nth_check_1.default(rule);
      if (func === boolbase_1.falseFunc)
        return boolbase_1.falseFunc;
      if (func === boolbase_1.trueFunc)
        return getChildFunc(next, adapter);
      return function nthLastChild(elem) {
        var siblings = adapter.getSiblings(elem);
        var pos = 0;
        for (var i = siblings.length - 1; i >= 0; i--) {
          if (equals(elem, siblings[i]))
            break;
          if (adapter.isTag(siblings[i])) {
            pos++;
          }
        }
        return func(pos) && next(elem);
      };
    },
    "nth-of-type": function(next, rule, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      var func = nth_check_1.default(rule);
      if (func === boolbase_1.falseFunc)
        return boolbase_1.falseFunc;
      if (func === boolbase_1.trueFunc)
        return getChildFunc(next, adapter);
      return function nthOfType(elem) {
        var siblings = adapter.getSiblings(elem);
        var pos = 0;
        for (var i = 0; i < siblings.length; i++) {
          var currentSibling = siblings[i];
          if (equals(elem, currentSibling))
            break;
          if (adapter.isTag(currentSibling) && adapter.getName(currentSibling) === adapter.getName(elem)) {
            pos++;
          }
        }
        return func(pos) && next(elem);
      };
    },
    "nth-last-of-type": function(next, rule, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      var func = nth_check_1.default(rule);
      if (func === boolbase_1.falseFunc)
        return boolbase_1.falseFunc;
      if (func === boolbase_1.trueFunc)
        return getChildFunc(next, adapter);
      return function nthLastOfType(elem) {
        var siblings = adapter.getSiblings(elem);
        var pos = 0;
        for (var i = siblings.length - 1; i >= 0; i--) {
          var currentSibling = siblings[i];
          if (equals(elem, currentSibling))
            break;
          if (adapter.isTag(currentSibling) && adapter.getName(currentSibling) === adapter.getName(elem)) {
            pos++;
          }
        }
        return func(pos) && next(elem);
      };
    },
    root: function(next, _rule, _a) {
      var adapter = _a.adapter;
      return function(elem) {
        var parent = adapter.getParent(elem);
        return (parent == null || !adapter.isTag(parent)) && next(elem);
      };
    },
    scope: function(next, rule, options, context) {
      var equals = options.equals;
      if (!context || context.length === 0) {
        return exports2.filters.root(next, rule, options);
      }
      if (context.length === 1) {
        return function(elem) {
          return equals(context[0], elem) && next(elem);
        };
      }
      return function(elem) {
        return context.includes(elem) && next(elem);
      };
    },
    checkbox: getAttribFunc("type", "checkbox"),
    file: getAttribFunc("type", "file"),
    password: getAttribFunc("type", "password"),
    radio: getAttribFunc("type", "radio"),
    reset: getAttribFunc("type", "reset"),
    image: getAttribFunc("type", "image"),
    submit: getAttribFunc("type", "submit"),
    hover: function(next, _rule, _a) {
      var adapter = _a.adapter;
      var isHovered = adapter.isHovered;
      if (typeof isHovered !== "function") {
        return boolbase_1.falseFunc;
      }
      return function hover(elem) {
        return isHovered(elem) && next(elem);
      };
    },
    visited: function(next, _rule, _a) {
      var adapter = _a.adapter;
      var isVisited = adapter.isVisited;
      if (typeof isVisited !== "function") {
        return boolbase_1.falseFunc;
      }
      return function visited(elem) {
        return isVisited(elem) && next(elem);
      };
    },
    active: function(next, _rule, _a) {
      var adapter = _a.adapter;
      var isActive = adapter.isActive;
      if (typeof isActive !== "function") {
        return boolbase_1.falseFunc;
      }
      return function active(elem) {
        return isActive(elem) && next(elem);
      };
    }
  };
});

// ../node_modules/css-select/lib/pseudo-selectors/pseudos.js
var require_pseudos = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.verifyPseudoArgs = exports2.pseudos = void 0;
  var isLinkTag = namePseudo(["a", "area", "link"]);
  exports2.pseudos = {
    empty: function(elem, _a) {
      var adapter = _a.adapter;
      return !adapter.getChildren(elem).some(function(elem2) {
        return adapter.isTag(elem2) || adapter.getText(elem2) !== "";
      });
    },
    "first-child": function(elem, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      var firstChild = adapter.getSiblings(elem).find(function(elem2) {
        return adapter.isTag(elem2);
      });
      return firstChild != null && equals(elem, firstChild);
    },
    "last-child": function(elem, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      var siblings = adapter.getSiblings(elem);
      for (var i = siblings.length - 1; i >= 0; i--) {
        if (equals(elem, siblings[i]))
          return true;
        if (adapter.isTag(siblings[i]))
          break;
      }
      return false;
    },
    "first-of-type": function(elem, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      var siblings = adapter.getSiblings(elem);
      var elemName = adapter.getName(elem);
      for (var i = 0; i < siblings.length; i++) {
        var currentSibling = siblings[i];
        if (equals(elem, currentSibling))
          return true;
        if (adapter.isTag(currentSibling) && adapter.getName(currentSibling) === elemName) {
          break;
        }
      }
      return false;
    },
    "last-of-type": function(elem, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      var siblings = adapter.getSiblings(elem);
      var elemName = adapter.getName(elem);
      for (var i = siblings.length - 1; i >= 0; i--) {
        var currentSibling = siblings[i];
        if (equals(elem, currentSibling))
          return true;
        if (adapter.isTag(currentSibling) && adapter.getName(currentSibling) === elemName) {
          break;
        }
      }
      return false;
    },
    "only-of-type": function(elem, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      var elemName = adapter.getName(elem);
      return adapter.getSiblings(elem).every(function(sibling) {
        return equals(elem, sibling) || !adapter.isTag(sibling) || adapter.getName(sibling) !== elemName;
      });
    },
    "only-child": function(elem, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      return adapter.getSiblings(elem).every(function(sibling) {
        return equals(elem, sibling) || !adapter.isTag(sibling);
      });
    },
    "any-link": function(elem, options) {
      return isLinkTag(elem, options) && options.adapter.hasAttrib(elem, "href");
    },
    link: function(elem, options) {
      var _a, _b;
      return ((_b = (_a = options.adapter).isVisited) === null || _b === void 0 ? void 0 : _b.call(_a, elem)) !== true && exports2.pseudos["any-link"](elem, options);
    },
    selected: function(elem, _a) {
      var adapter = _a.adapter, equals = _a.equals;
      if (adapter.hasAttrib(elem, "selected"))
        return true;
      else if (adapter.getName(elem) !== "option")
        return false;
      var parent = adapter.getParent(elem);
      if (!parent || !adapter.isTag(parent) || adapter.getName(parent) !== "select" || adapter.hasAttrib(parent, "multiple")) {
        return false;
      }
      var siblings = adapter.getChildren(parent);
      var sawElem = false;
      for (var i = 0; i < siblings.length; i++) {
        var currentSibling = siblings[i];
        if (adapter.isTag(currentSibling)) {
          if (equals(elem, currentSibling)) {
            sawElem = true;
          } else if (!sawElem) {
            return false;
          } else if (adapter.hasAttrib(currentSibling, "selected")) {
            return false;
          }
        }
      }
      return sawElem;
    },
    disabled: function(elem, _a) {
      var adapter = _a.adapter;
      return adapter.hasAttrib(elem, "disabled");
    },
    enabled: function(elem, _a) {
      var adapter = _a.adapter;
      return !adapter.hasAttrib(elem, "disabled");
    },
    checked: function(elem, options) {
      return options.adapter.hasAttrib(elem, "checked") || exports2.pseudos.selected(elem, options);
    },
    required: function(elem, _a) {
      var adapter = _a.adapter;
      return adapter.hasAttrib(elem, "required");
    },
    optional: function(elem, _a) {
      var adapter = _a.adapter;
      return !adapter.hasAttrib(elem, "required");
    },
    parent: function(elem, options) {
      return !exports2.pseudos.empty(elem, options);
    },
    header: namePseudo(["h1", "h2", "h3", "h4", "h5", "h6"]),
    button: function(elem, _a) {
      var adapter = _a.adapter;
      var name = adapter.getName(elem);
      return name === "button" || name === "input" && adapter.getAttributeValue(elem, "type") === "button";
    },
    input: namePseudo(["input", "textarea", "select", "button"]),
    text: function(elem, _a) {
      var adapter = _a.adapter;
      var type = adapter.getAttributeValue(elem, "type");
      return adapter.getName(elem) === "input" && (!type || type.toLowerCase() === "text");
    }
  };
  function namePseudo(names) {
    if (typeof Set !== "undefined") {
      var nameSet_1 = new Set(names);
      return function(elem, _a) {
        var adapter = _a.adapter;
        return nameSet_1.has(adapter.getName(elem));
      };
    }
    return function(elem, _a) {
      var adapter = _a.adapter;
      return names.includes(adapter.getName(elem));
    };
  }
  function verifyPseudoArgs(func, name, subselect) {
    if (subselect === null) {
      if (func.length > 2 && name !== "scope") {
        throw new Error("pseudo-selector :" + name + " requires an argument");
      }
    } else {
      if (func.length === 2) {
        throw new Error("pseudo-selector :" + name + " doesn't have any arguments");
      }
    }
  }
  exports2.verifyPseudoArgs = verifyPseudoArgs;
});

// ../node_modules/css-select/lib/pseudo-selectors/subselects.js
var require_subselects = __commonJS((exports2) => {
  "use strict";
  var __spreadArrays = exports2 && exports2.__spreadArrays || function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.subselects = exports2.getNextSiblings = exports2.ensureIsTag = exports2.PLACEHOLDER_ELEMENT = void 0;
  var boolbase_1 = require_boolbase();
  var procedure_1 = require_procedure();
  exports2.PLACEHOLDER_ELEMENT = {};
  function containsTraversal(t) {
    return t.some(procedure_1.isTraversal);
  }
  function ensureIsTag(next, adapter) {
    if (next === boolbase_1.falseFunc)
      return next;
    return function(elem) {
      return adapter.isTag(elem) && next(elem);
    };
  }
  exports2.ensureIsTag = ensureIsTag;
  function getNextSiblings(elem, adapter) {
    var siblings = adapter.getSiblings(elem);
    if (siblings.length <= 1)
      return [];
    var elemIndex = siblings.indexOf(elem);
    if (elemIndex < 0 || elemIndex === siblings.length - 1)
      return [];
    return siblings.slice(elemIndex + 1).filter(adapter.isTag);
  }
  exports2.getNextSiblings = getNextSiblings;
  exports2.subselects = {
    is: function(next, token, options, context, compileToken) {
      return exports2.subselects.matches(next, token, options, context, compileToken);
    },
    matches: function(next, token, options, context, compileToken) {
      var opts = {
        xmlMode: !!options.xmlMode,
        strict: !!options.strict,
        adapter: options.adapter,
        equals: options.equals,
        rootFunc: next
      };
      return compileToken(token, opts, context);
    },
    not: function(next, token, options, context, compileToken) {
      var opts = {
        xmlMode: !!options.xmlMode,
        strict: !!options.strict,
        adapter: options.adapter,
        equals: options.equals
      };
      if (opts.strict) {
        if (token.length > 1 || token.some(containsTraversal)) {
          throw new Error("complex selectors in :not aren't allowed in strict mode");
        }
      }
      var func = compileToken(token, opts, context);
      if (func === boolbase_1.falseFunc)
        return next;
      if (func === boolbase_1.trueFunc)
        return boolbase_1.falseFunc;
      return function not(elem) {
        return !func(elem) && next(elem);
      };
    },
    has: function(next, subselect, options, _context, compileToken) {
      var adapter = options.adapter;
      var opts = {
        xmlMode: !!options.xmlMode,
        strict: !!options.strict,
        adapter,
        equals: options.equals
      };
      var context = subselect.some(containsTraversal) ? [exports2.PLACEHOLDER_ELEMENT] : void 0;
      var compiled = compileToken(subselect, opts, context);
      if (compiled === boolbase_1.falseFunc)
        return boolbase_1.falseFunc;
      if (compiled === boolbase_1.trueFunc) {
        return function(elem) {
          return adapter.getChildren(elem).some(adapter.isTag) && next(elem);
        };
      }
      var hasElement = ensureIsTag(compiled, adapter);
      var _a = compiled.shouldTestNextSiblings, shouldTestNextSiblings = _a === void 0 ? false : _a;
      if (context) {
        return function(elem) {
          context[0] = elem;
          var childs = adapter.getChildren(elem);
          var nextElements = shouldTestNextSiblings ? __spreadArrays(childs, getNextSiblings(elem, adapter)) : childs;
          return next(elem) && adapter.existsOne(hasElement, nextElements);
        };
      }
      return function(elem) {
        return next(elem) && adapter.existsOne(hasElement, adapter.getChildren(elem));
      };
    }
  };
});

// ../node_modules/css-select/lib/pseudo-selectors/index.js
var require_pseudo_selectors = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.compilePseudoSelector = exports2.pseudos = exports2.filters = void 0;
  var boolbase_1 = require_boolbase();
  var filters_1 = require_filters();
  Object.defineProperty(exports2, "filters", {enumerable: true, get: function() {
    return filters_1.filters;
  }});
  var pseudos_1 = require_pseudos();
  Object.defineProperty(exports2, "pseudos", {enumerable: true, get: function() {
    return pseudos_1.pseudos;
  }});
  var subselects_1 = require_subselects();
  var reCSS3 = /^(?:(?:nth|last|first|only)-(?:child|of-type)|root|empty|(?:en|dis)abled|checked|not)$/;
  function compilePseudoSelector(next, selector, options, context, compileToken) {
    var name = selector.name, data = selector.data;
    if (options.strict && !reCSS3.test(name)) {
      throw new Error(":" + name + " isn't part of CSS3");
    }
    if (Array.isArray(data)) {
      return subselects_1.subselects[name](next, data, options, context, compileToken);
    }
    if (name in filters_1.filters) {
      return filters_1.filters[name](next, data, options, context);
    }
    if (name in pseudos_1.pseudos) {
      var pseudo_1 = pseudos_1.pseudos[name];
      pseudos_1.verifyPseudoArgs(pseudo_1, name, data);
      return pseudo_1 === boolbase_1.falseFunc ? boolbase_1.falseFunc : next === boolbase_1.trueFunc ? function(elem) {
        return pseudo_1(elem, options, data);
      } : function(elem) {
        return pseudo_1(elem, options, data) && next(elem);
      };
    }
    throw new Error("unmatched pseudo-class :" + name);
  }
  exports2.compilePseudoSelector = compilePseudoSelector;
});

// ../node_modules/css-select/lib/general.js
var require_general = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.compileGeneralSelector = void 0;
  var attributes_1 = require_attributes();
  var pseudo_selectors_1 = require_pseudo_selectors();
  function compileGeneralSelector(next, selector, options, context, compileToken) {
    var adapter = options.adapter, equals = options.equals;
    switch (selector.type) {
      case "pseudo-element":
        throw new Error("Pseudo-elements are not supported by css-select");
      case "attribute":
        if (options.strict && (selector.ignoreCase || selector.action === "not")) {
          throw new Error("Unsupported attribute selector");
        }
        return attributes_1.attributeRules[selector.action](next, selector, options);
      case "pseudo":
        return pseudo_selectors_1.compilePseudoSelector(next, selector, options, context, compileToken);
      case "tag":
        return function tag(elem) {
          return adapter.getName(elem) === selector.name && next(elem);
        };
      case "descendant":
        if (options.cacheResults === false || typeof WeakSet === "undefined") {
          return function descendant(elem) {
            var current = elem;
            while (current = adapter.getParent(current)) {
              if (adapter.isTag(current) && next(current)) {
                return true;
              }
            }
            return false;
          };
        }
        var isFalseCache_1 = new WeakSet();
        return function cachedDescendant(elem) {
          var current = elem;
          while (current = adapter.getParent(current)) {
            if (!isFalseCache_1.has(current)) {
              if (adapter.isTag(current) && next(current)) {
                return true;
              }
              isFalseCache_1.add(current);
            }
          }
          return false;
        };
      case "_flexibleDescendant":
        return function flexibleDescendant(elem) {
          var current = elem;
          do {
            if (adapter.isTag(current) && next(current))
              return true;
          } while (current = adapter.getParent(current));
          return false;
        };
      case "parent":
        if (options.strict) {
          throw new Error("Parent selector isn't part of CSS3");
        }
        return function parent(elem) {
          return adapter.getChildren(elem).some(function(elem2) {
            return adapter.isTag(elem2) && next(elem2);
          });
        };
      case "child":
        return function child(elem) {
          var parent = adapter.getParent(elem);
          return !!parent && adapter.isTag(parent) && next(parent);
        };
      case "sibling":
        return function sibling(elem) {
          var siblings = adapter.getSiblings(elem);
          for (var i = 0; i < siblings.length; i++) {
            var currentSibling = siblings[i];
            if (equals(elem, currentSibling))
              break;
            if (adapter.isTag(currentSibling) && next(currentSibling)) {
              return true;
            }
          }
          return false;
        };
      case "adjacent":
        return function adjacent(elem) {
          var siblings = adapter.getSiblings(elem);
          var lastElement;
          for (var i = 0; i < siblings.length; i++) {
            var currentSibling = siblings[i];
            if (equals(elem, currentSibling))
              break;
            if (adapter.isTag(currentSibling)) {
              lastElement = currentSibling;
            }
          }
          return !!lastElement && next(lastElement);
        };
      case "universal":
        return next;
    }
  }
  exports2.compileGeneralSelector = compileGeneralSelector;
});

// ../node_modules/css-select/lib/compile.js
var require_compile2 = __commonJS((exports2) => {
  "use strict";
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.compileToken = exports2.compileUnsafe = exports2.compile = void 0;
  var css_what_1 = require_lib5();
  var boolbase_1 = require_boolbase();
  var sort_1 = __importDefault(require_sort());
  var procedure_1 = require_procedure();
  var general_1 = require_general();
  var subselects_1 = require_subselects();
  function compile(selector, options, context) {
    var next = compileUnsafe(selector, options, context);
    return subselects_1.ensureIsTag(next, options.adapter);
  }
  exports2.compile = compile;
  function compileUnsafe(selector, options, context) {
    var token = css_what_1.parse(selector, options);
    return compileToken(token, options, context);
  }
  exports2.compileUnsafe = compileUnsafe;
  function includesScopePseudo(t) {
    return t.type === "pseudo" && (t.name === "scope" || Array.isArray(t.data) && t.data.some(function(data) {
      return data.some(includesScopePseudo);
    }));
  }
  var DESCENDANT_TOKEN = {type: "descendant"};
  var FLEXIBLE_DESCENDANT_TOKEN = {
    type: "_flexibleDescendant"
  };
  var SCOPE_TOKEN = {type: "pseudo", name: "scope", data: null};
  function absolutize(token, _a, context) {
    var adapter = _a.adapter;
    var hasContext = !!(context === null || context === void 0 ? void 0 : context.every(function(e) {
      var parent = adapter.getParent(e);
      return e === subselects_1.PLACEHOLDER_ELEMENT || !!(parent && adapter.isTag(parent));
    }));
    for (var _i = 0, token_1 = token; _i < token_1.length; _i++) {
      var t = token_1[_i];
      if (t.length > 0 && procedure_1.isTraversal(t[0]) && t[0].type !== "descendant") {
      } else if (hasContext && !t.some(includesScopePseudo)) {
        t.unshift(DESCENDANT_TOKEN);
      } else {
        continue;
      }
      t.unshift(SCOPE_TOKEN);
    }
  }
  function compileToken(token, options, context) {
    var _a;
    token = token.filter(function(t) {
      return t.length > 0;
    });
    token.forEach(sort_1.default);
    context = (_a = options.context) !== null && _a !== void 0 ? _a : context;
    var isArrayContext = Array.isArray(context);
    var finalContext = context && (Array.isArray(context) ? context : [context]);
    absolutize(token, options, finalContext);
    var shouldTestNextSiblings = false;
    var query = token.map(function(rules) {
      if (rules.length >= 2) {
        var first = rules[0], second = rules[1];
        if (first.type !== "pseudo" || first.name !== "scope") {
        } else if (isArrayContext && second.type === "descendant") {
          rules[1] = FLEXIBLE_DESCENDANT_TOKEN;
        } else if (second.type === "adjacent" || second.type === "sibling") {
          shouldTestNextSiblings = true;
        }
      }
      return compileRules(rules, options, finalContext);
    }).reduce(reduceRules, boolbase_1.falseFunc);
    query.shouldTestNextSiblings = shouldTestNextSiblings;
    return query;
  }
  exports2.compileToken = compileToken;
  function compileRules(rules, options, context) {
    var _a;
    return rules.reduce(function(previous, rule) {
      return previous === boolbase_1.falseFunc ? boolbase_1.falseFunc : general_1.compileGeneralSelector(previous, rule, options, context, compileToken);
    }, (_a = options.rootFunc) !== null && _a !== void 0 ? _a : boolbase_1.trueFunc);
  }
  function reduceRules(a, b) {
    if (b === boolbase_1.falseFunc || a === boolbase_1.trueFunc) {
      return a;
    }
    if (a === boolbase_1.falseFunc || b === boolbase_1.trueFunc) {
      return b;
    }
    return function combine(elem) {
      return a(elem) || b(elem);
    };
  }
});

// ../node_modules/css-select/lib/index.js
var require_lib7 = __commonJS((exports2) => {
  "use strict";
  var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, {enumerable: true, get: function() {
      return m[k];
    }});
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {enumerable: true, value: v});
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports2 && exports2.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.pseudos = exports2.filters = exports2.is = exports2.selectOne = exports2.selectAll = exports2.prepareContext = exports2._compileToken = exports2._compileUnsafe = exports2.compile = void 0;
  var DomUtils = __importStar(require_lib4());
  var boolbase_1 = require_boolbase();
  var compile_1 = require_compile2();
  var subselects_1 = require_subselects();
  var defaultEquals = function(a, b) {
    return a === b;
  };
  var defaultOptions = {
    adapter: DomUtils,
    equals: defaultEquals
  };
  function convertOptionFormats(options) {
    var _a, _b, _c, _d;
    var opts = options !== null && options !== void 0 ? options : defaultOptions;
    (_a = opts.adapter) !== null && _a !== void 0 ? _a : opts.adapter = DomUtils;
    (_b = opts.equals) !== null && _b !== void 0 ? _b : opts.equals = (_d = (_c = opts.adapter) === null || _c === void 0 ? void 0 : _c.equals) !== null && _d !== void 0 ? _d : defaultEquals;
    return opts;
  }
  function wrapCompile(func) {
    return function addAdapter(selector, options, context) {
      var opts = convertOptionFormats(options);
      return func(selector, opts, context);
    };
  }
  exports2.compile = wrapCompile(compile_1.compile);
  exports2._compileUnsafe = wrapCompile(compile_1.compileUnsafe);
  exports2._compileToken = wrapCompile(compile_1.compileToken);
  function getSelectorFunc(searchFunc) {
    return function select(query, elements, options) {
      var opts = convertOptionFormats(options);
      if (typeof query !== "function") {
        query = compile_1.compileUnsafe(query, opts, elements);
      }
      var filteredElements = prepareContext(elements, opts.adapter, query.shouldTestNextSiblings);
      return searchFunc(query, filteredElements, opts);
    };
  }
  function prepareContext(elems, adapter, shouldTestNextSiblings) {
    if (shouldTestNextSiblings === void 0) {
      shouldTestNextSiblings = false;
    }
    if (shouldTestNextSiblings) {
      elems = appendNextSiblings(elems, adapter);
    }
    return Array.isArray(elems) ? adapter.removeSubsets(elems) : adapter.getChildren(elems);
  }
  exports2.prepareContext = prepareContext;
  function appendNextSiblings(elem, adapter) {
    var elems = Array.isArray(elem) ? elem.slice(0) : [elem];
    for (var i = 0; i < elems.length; i++) {
      var nextSiblings = subselects_1.getNextSiblings(elems[i], adapter);
      elems.push.apply(elems, nextSiblings);
    }
    return elems;
  }
  exports2.selectAll = getSelectorFunc(function(query, elems, options) {
    return query === boolbase_1.falseFunc || !elems || elems.length === 0 ? [] : options.adapter.findAll(query, elems);
  });
  exports2.selectOne = getSelectorFunc(function(query, elems, options) {
    return query === boolbase_1.falseFunc || !elems || elems.length === 0 ? null : options.adapter.findOne(query, elems);
  });
  function is(elem, query, options) {
    var opts = convertOptionFormats(options);
    return (typeof query === "function" ? query : compile_1.compile(query, opts))(elem);
  }
  exports2.is = is;
  exports2.default = exports2.selectAll;
  var pseudo_selectors_1 = require_pseudo_selectors();
  Object.defineProperty(exports2, "filters", {enumerable: true, get: function() {
    return pseudo_selectors_1.filters;
  }});
  Object.defineProperty(exports2, "pseudos", {enumerable: true, get: function() {
    return pseudo_selectors_1.pseudos;
  }});
});

// ../node_modules/node-html-parser/dist/nodes/text.js
var require_text = __commonJS((exports2) => {
  "use strict";
  var __extends = exports2 && exports2.__extends || function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  var type_1 = __importDefault(require_type());
  var node_1 = __importDefault(require_node());
  var TextNode = function(_super) {
    __extends(TextNode2, _super);
    function TextNode2(rawText, parentNode) {
      var _this = _super.call(this, parentNode) || this;
      _this.rawText = rawText;
      _this.nodeType = type_1.default.TEXT_NODE;
      return _this;
    }
    Object.defineProperty(TextNode2.prototype, "text", {
      get: function() {
        return this.rawText;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextNode2.prototype, "isWhitespace", {
      get: function() {
        return /^(\s|&nbsp;)*$/.test(this.rawText);
      },
      enumerable: false,
      configurable: true
    });
    TextNode2.prototype.toString = function() {
      return this.text;
    };
    return TextNode2;
  }(node_1.default);
  exports2.default = TextNode;
});

// ../node_modules/node-html-parser/dist/matcher.js
var require_matcher = __commonJS((exports2) => {
  "use strict";
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  var type_1 = __importDefault(require_type());
  function isTag(node) {
    return node && node.nodeType === type_1.default.ELEMENT_NODE;
  }
  function getAttributeValue(elem, name) {
    return isTag(elem) ? elem.getAttribute(name) : void 0;
  }
  function getName(elem) {
    return (elem && elem.rawTagName || "").toLowerCase();
  }
  function getChildren(node) {
    return node && node.childNodes;
  }
  function getParent(node) {
    return node ? node.parentNode : null;
  }
  function getText(node) {
    return node.text;
  }
  function removeSubsets(nodes) {
    var idx = nodes.length;
    var node;
    var ancestor;
    var replace;
    while (--idx > -1) {
      node = ancestor = nodes[idx];
      nodes[idx] = null;
      replace = true;
      while (ancestor) {
        if (nodes.indexOf(ancestor) > -1) {
          replace = false;
          nodes.splice(idx, 1);
          break;
        }
        ancestor = getParent(ancestor);
      }
      if (replace) {
        nodes[idx] = node;
      }
    }
    return nodes;
  }
  function existsOne(test, elems) {
    return elems.some(function(elem) {
      return isTag(elem) ? test(elem) || existsOne(test, getChildren(elem)) : false;
    });
  }
  function getSiblings(node) {
    var parent = getParent(node);
    return parent && getChildren(parent);
  }
  function hasAttrib(elem, name) {
    return getAttributeValue(elem, name) !== void 0;
  }
  function findOne(test, elems) {
    var elem = null;
    for (var i = 0, l = elems.length; i < l && !elem; i++) {
      var el = elems[i];
      if (test(el)) {
        elem = el;
      } else {
        var childs = getChildren(el);
        if (childs && childs.length > 0) {
          elem = findOne(test, childs);
        }
      }
    }
    return elem;
  }
  function findAll(test, nodes) {
    var result = [];
    for (var i = 0, j = nodes.length; i < j; i++) {
      if (!isTag(nodes[i]))
        continue;
      if (test(nodes[i]))
        result.push(nodes[i]);
      var childs = getChildren(nodes[i]);
      if (childs)
        result = result.concat(findAll(test, childs));
    }
    return result;
  }
  exports2.default = {
    isTag,
    getAttributeValue,
    getName,
    getChildren,
    getParent,
    getText,
    removeSubsets,
    existsOne,
    getSiblings,
    hasAttrib,
    findOne,
    findAll
  };
});

// ../node_modules/node-html-parser/dist/back.js
var require_back = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  function arr_back(arr) {
    return arr[arr.length - 1];
  }
  exports2.default = arr_back;
});

// ../node_modules/node-html-parser/dist/parse.js
var require_parse3 = __commonJS((exports2) => {
  "use strict";
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  var back_1 = __importDefault(require_back());
  var html_1 = require_html2();
  function parse(data, options) {
    if (options === void 0) {
      options = {lowerCaseTagName: false, comment: false};
    }
    var stack = html_1.base_parse(data, options);
    var root = stack[0];
    var _loop_1 = function() {
      var last = stack.pop();
      var oneBefore = back_1.default(stack);
      if (last.parentNode && last.parentNode.parentNode) {
        if (last.parentNode === oneBefore && last.tagName === oneBefore.tagName) {
          oneBefore.removeChild(last);
          last.childNodes.forEach(function(child) {
            oneBefore.parentNode.appendChild(child);
          });
          stack.pop();
        } else {
          oneBefore.removeChild(last);
          last.childNodes.forEach(function(child) {
            oneBefore.appendChild(child);
          });
        }
      } else {
      }
    };
    while (stack.length > 1) {
      _loop_1();
    }
    return root;
  }
  exports2.default = parse;
});

// ../node_modules/node-html-parser/dist/nodes/html.js
var require_html2 = __commonJS((exports2) => {
  "use strict";
  var __extends = exports2 && exports2.__extends || function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var __spreadArray = exports2 && exports2.__spreadArray || function(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
      to[j] = from[i];
    return to;
  };
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.base_parse = void 0;
  var he_1 = __importDefault(require_he());
  var css_select_1 = require_lib7();
  var node_1 = __importDefault(require_node());
  var type_1 = __importDefault(require_type());
  var text_1 = __importDefault(require_text());
  var matcher_1 = __importDefault(require_matcher());
  var back_1 = __importDefault(require_back());
  var comment_1 = __importDefault(require_comment());
  var parse_1 = __importDefault(require_parse3());
  function decode(val) {
    return JSON.parse(JSON.stringify(he_1.default.decode(val)));
  }
  var kBlockElements = new Map();
  kBlockElements.set("DIV", true);
  kBlockElements.set("div", true);
  kBlockElements.set("P", true);
  kBlockElements.set("p", true);
  kBlockElements.set("LI", true);
  kBlockElements.set("li", true);
  kBlockElements.set("TD", true);
  kBlockElements.set("td", true);
  kBlockElements.set("SECTION", true);
  kBlockElements.set("section", true);
  kBlockElements.set("BR", true);
  kBlockElements.set("br", true);
  var DOMTokenList = function() {
    function DOMTokenList2(valuesInit, afterUpdate) {
      if (valuesInit === void 0) {
        valuesInit = [];
      }
      if (afterUpdate === void 0) {
        afterUpdate = function() {
          return null;
        };
      }
      this._set = new Set(valuesInit);
      this._afterUpdate = afterUpdate;
    }
    DOMTokenList2.prototype._validate = function(c) {
      if (/\s/.test(c)) {
        throw new Error("DOMException in DOMTokenList.add: The token '" + c + "' contains HTML space characters, which are not valid in tokens.");
      }
    };
    DOMTokenList2.prototype.add = function(c) {
      this._validate(c);
      this._set.add(c);
      this._afterUpdate(this);
    };
    DOMTokenList2.prototype.replace = function(c1, c2) {
      this._validate(c2);
      this._set.delete(c1);
      this._set.add(c2);
      this._afterUpdate(this);
    };
    DOMTokenList2.prototype.remove = function(c) {
      this._set.delete(c) && this._afterUpdate(this);
    };
    DOMTokenList2.prototype.toggle = function(c) {
      this._validate(c);
      if (this._set.has(c))
        this._set.delete(c);
      else
        this._set.add(c);
      this._afterUpdate(this);
    };
    DOMTokenList2.prototype.contains = function(c) {
      return this._set.has(c);
    };
    Object.defineProperty(DOMTokenList2.prototype, "length", {
      get: function() {
        return this._set.size;
      },
      enumerable: false,
      configurable: true
    });
    DOMTokenList2.prototype.values = function() {
      return this._set.values();
    };
    Object.defineProperty(DOMTokenList2.prototype, "value", {
      get: function() {
        return Array.from(this._set.values());
      },
      enumerable: false,
      configurable: true
    });
    DOMTokenList2.prototype.toString = function() {
      return Array.from(this._set.values()).join(" ");
    };
    return DOMTokenList2;
  }();
  var HTMLElement = function(_super) {
    __extends(HTMLElement2, _super);
    function HTMLElement2(tagName, keyAttrs, rawAttrs, parentNode) {
      if (rawAttrs === void 0) {
        rawAttrs = "";
      }
      var _this = _super.call(this, parentNode) || this;
      _this.rawAttrs = rawAttrs;
      _this.nodeType = type_1.default.ELEMENT_NODE;
      _this.rawTagName = tagName;
      _this.rawAttrs = rawAttrs || "";
      _this.childNodes = [];
      _this.classList = new DOMTokenList(keyAttrs.class ? keyAttrs.class.split(/\s+/) : [], function(classList) {
        return _this.setAttribute("class", classList.toString());
      });
      if (keyAttrs.id) {
        _this.id = keyAttrs.id;
        if (!rawAttrs) {
          _this.rawAttrs = 'id="' + keyAttrs.id + '"';
        }
      }
      if (keyAttrs.class) {
        if (!rawAttrs) {
          var cls = 'class="' + _this.classList.toString() + '"';
          if (_this.rawAttrs) {
            _this.rawAttrs += " " + cls;
          } else {
            _this.rawAttrs = cls;
          }
        }
      }
      return _this;
    }
    HTMLElement2.prototype.remove = function() {
      var _this = this;
      if (this.parentNode) {
        var children = this.parentNode.childNodes;
        this.parentNode.childNodes = children.filter(function(child) {
          return _this !== child;
        });
      }
    };
    HTMLElement2.prototype.removeChild = function(node) {
      this.childNodes = this.childNodes.filter(function(child) {
        return child !== node;
      });
    };
    HTMLElement2.prototype.exchangeChild = function(oldNode, newNode) {
      var children = this.childNodes;
      this.childNodes = children.map(function(child) {
        if (child === oldNode) {
          return newNode;
        }
        return child;
      });
    };
    Object.defineProperty(HTMLElement2.prototype, "tagName", {
      get: function() {
        return this.rawTagName ? this.rawTagName.toUpperCase() : this.rawTagName;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "localName", {
      get: function() {
        return this.rawTagName.toLowerCase();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "rawText", {
      get: function() {
        return this.childNodes.reduce(function(pre, cur) {
          return pre += cur.rawText;
        }, "");
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "textContent", {
      get: function() {
        return this.rawText;
      },
      set: function(val) {
        var content = [new text_1.default(val, this)];
        this.childNodes = content;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "text", {
      get: function() {
        return decode(this.rawText);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "structuredText", {
      get: function() {
        var currentBlock = [];
        var blocks = [currentBlock];
        function dfs(node) {
          if (node.nodeType === type_1.default.ELEMENT_NODE) {
            if (kBlockElements.get(node.rawTagName)) {
              if (currentBlock.length > 0) {
                blocks.push(currentBlock = []);
              }
              node.childNodes.forEach(dfs);
              if (currentBlock.length > 0) {
                blocks.push(currentBlock = []);
              }
            } else {
              node.childNodes.forEach(dfs);
            }
          } else if (node.nodeType === type_1.default.TEXT_NODE) {
            if (node.isWhitespace) {
              currentBlock.prependWhitespace = true;
            } else {
              var text = node.text;
              if (currentBlock.prependWhitespace) {
                text = " " + text;
                currentBlock.prependWhitespace = false;
              }
              currentBlock.push(text);
            }
          }
        }
        dfs(this);
        return blocks.map(function(block) {
          return block.join("").trim().replace(/\s{2,}/g, " ");
        }).join("\n").replace(/\s+$/, "");
      },
      enumerable: false,
      configurable: true
    });
    HTMLElement2.prototype.toString = function() {
      var tag = this.rawTagName;
      if (tag) {
        var is_void = /area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr/i.test(tag);
        var attrs = this.rawAttrs ? " " + this.rawAttrs : "";
        if (is_void) {
          return "<" + tag + attrs + ">";
        }
        return "<" + tag + attrs + ">" + this.innerHTML + "</" + tag + ">";
      }
      return this.innerHTML;
    };
    Object.defineProperty(HTMLElement2.prototype, "innerHTML", {
      get: function() {
        return this.childNodes.map(function(child) {
          return child.toString();
        }).join("");
      },
      set: function(content) {
        var r = parse_1.default(content);
        this.childNodes = r.childNodes.length ? r.childNodes : [new text_1.default(content, this)];
      },
      enumerable: false,
      configurable: true
    });
    HTMLElement2.prototype.set_content = function(content, options) {
      if (options === void 0) {
        options = {};
      }
      if (content instanceof node_1.default) {
        content = [content];
      } else if (typeof content == "string") {
        var r = parse_1.default(content, options);
        content = r.childNodes.length ? r.childNodes : [new text_1.default(content, this)];
      }
      this.childNodes = content;
    };
    HTMLElement2.prototype.replaceWith = function() {
      var _this = this;
      var nodes = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        nodes[_i] = arguments[_i];
      }
      var content = nodes.map(function(node) {
        if (node instanceof node_1.default) {
          return [node];
        } else if (typeof node == "string") {
          var r = parse_1.default(node);
          return r.childNodes.length ? r.childNodes : [new text_1.default(node, _this)];
        }
        return [];
      }).flat();
      var idx = this.parentNode.childNodes.findIndex(function(child) {
        return child === _this;
      });
      this.parentNode.childNodes = __spreadArray(__spreadArray(__spreadArray([], this.parentNode.childNodes.slice(0, idx)), content), this.parentNode.childNodes.slice(idx + 1));
    };
    Object.defineProperty(HTMLElement2.prototype, "outerHTML", {
      get: function() {
        return this.toString();
      },
      enumerable: false,
      configurable: true
    });
    HTMLElement2.prototype.trimRight = function(pattern) {
      for (var i = 0; i < this.childNodes.length; i++) {
        var childNode = this.childNodes[i];
        if (childNode.nodeType === type_1.default.ELEMENT_NODE) {
          childNode.trimRight(pattern);
        } else {
          var index = childNode.rawText.search(pattern);
          if (index > -1) {
            childNode.rawText = childNode.rawText.substr(0, index);
            this.childNodes.length = i + 1;
          }
        }
      }
      return this;
    };
    Object.defineProperty(HTMLElement2.prototype, "structure", {
      get: function() {
        var res = [];
        var indention = 0;
        function write(str) {
          res.push("  ".repeat(indention) + str);
        }
        function dfs(node) {
          var idStr = node.id ? "#" + node.id : "";
          var classStr = node.classList.length ? "." + node.classList.value.join(".") : "";
          write("" + node.rawTagName + idStr + classStr);
          indention++;
          node.childNodes.forEach(function(childNode) {
            if (childNode.nodeType === type_1.default.ELEMENT_NODE) {
              dfs(childNode);
            } else if (childNode.nodeType === type_1.default.TEXT_NODE) {
              if (!childNode.isWhitespace) {
                write("#text");
              }
            }
          });
          indention--;
        }
        dfs(this);
        return res.join("\n");
      },
      enumerable: false,
      configurable: true
    });
    HTMLElement2.prototype.removeWhitespace = function() {
      var _this = this;
      var o = 0;
      this.childNodes.forEach(function(node) {
        if (node.nodeType === type_1.default.TEXT_NODE) {
          if (node.isWhitespace) {
            return;
          }
          node.rawText = node.rawText.trim();
        } else if (node.nodeType === type_1.default.ELEMENT_NODE) {
          node.removeWhitespace();
        }
        _this.childNodes[o++] = node;
      });
      this.childNodes.length = o;
      return this;
    };
    HTMLElement2.prototype.querySelectorAll = function(selector) {
      return css_select_1.selectAll(selector, this, {
        xmlMode: true,
        adapter: matcher_1.default
      });
    };
    HTMLElement2.prototype.querySelector = function(selector) {
      return css_select_1.selectOne(selector, this, {
        xmlMode: true,
        adapter: matcher_1.default
      });
    };
    HTMLElement2.prototype.appendChild = function(node) {
      this.childNodes.push(node);
      node.parentNode = this;
      return node;
    };
    Object.defineProperty(HTMLElement2.prototype, "firstChild", {
      get: function() {
        return this.childNodes[0];
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "lastChild", {
      get: function() {
        return back_1.default(this.childNodes);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "attrs", {
      get: function() {
        if (this._attrs) {
          return this._attrs;
        }
        this._attrs = {};
        var attrs = this.rawAttributes;
        for (var key in attrs) {
          var val = attrs[key] || "";
          this._attrs[key.toLowerCase()] = decode(val);
        }
        return this._attrs;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "attributes", {
      get: function() {
        var ret_attrs = {};
        var attrs = this.rawAttributes;
        for (var key in attrs) {
          var val = attrs[key] || "";
          ret_attrs[key] = decode(val);
        }
        return ret_attrs;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "rawAttributes", {
      get: function() {
        if (this._rawAttrs) {
          return this._rawAttrs;
        }
        var attrs = {};
        if (this.rawAttrs) {
          var re = /\b([a-z][a-z0-9-_]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/ig;
          var match = void 0;
          while (match = re.exec(this.rawAttrs)) {
            attrs[match[1]] = match[2] || match[3] || match[4] || null;
          }
        }
        this._rawAttrs = attrs;
        return attrs;
      },
      enumerable: false,
      configurable: true
    });
    HTMLElement2.prototype.removeAttribute = function(key) {
      var attrs = this.rawAttributes;
      delete attrs[key];
      if (this._attrs) {
        delete this._attrs[key];
      }
      this.rawAttrs = Object.keys(attrs).map(function(name) {
        var val = JSON.stringify(attrs[name]);
        if (val === void 0 || val === "null") {
          return name;
        }
        return name + "=" + val;
      }).join(" ");
    };
    HTMLElement2.prototype.hasAttribute = function(key) {
      return key.toLowerCase() in this.attrs;
    };
    HTMLElement2.prototype.getAttribute = function(key) {
      return this.attrs[key.toLowerCase()];
    };
    HTMLElement2.prototype.setAttribute = function(key, value) {
      if (arguments.length < 2) {
        throw new Error("Failed to execute 'setAttribute' on 'Element'");
      }
      var k2 = key.toLowerCase();
      var attrs = this.rawAttributes;
      for (var k in attrs) {
        if (k.toLowerCase() === k2) {
          key = k;
          break;
        }
      }
      attrs[key] = String(value);
      if (this._attrs) {
        this._attrs[k2] = decode(attrs[key]);
      }
      this.rawAttrs = Object.keys(attrs).map(function(name) {
        var val = JSON.stringify(attrs[name]);
        if (val === "null" || val === '""') {
          return name;
        }
        return name + "=" + val;
      }).join(" ");
    };
    HTMLElement2.prototype.setAttributes = function(attributes) {
      if (this._attrs) {
        delete this._attrs;
      }
      if (this._rawAttrs) {
        delete this._rawAttrs;
      }
      this.rawAttrs = Object.keys(attributes).map(function(name) {
        var val = attributes[name];
        if (val === "null" || val === '""') {
          return name;
        }
        return name + "=" + JSON.stringify(String(val));
      }).join(" ");
    };
    HTMLElement2.prototype.insertAdjacentHTML = function(where, html2) {
      var _a, _b, _c;
      var _this = this;
      if (arguments.length < 2) {
        throw new Error("2 arguments required");
      }
      var p = parse_1.default(html2);
      if (where === "afterend") {
        var idx = this.parentNode.childNodes.findIndex(function(child) {
          return child === _this;
        });
        (_a = this.parentNode.childNodes).splice.apply(_a, __spreadArray([idx + 1, 0], p.childNodes));
        p.childNodes.forEach(function(n) {
          if (n instanceof HTMLElement2) {
            n.parentNode = _this.parentNode;
          }
        });
      } else if (where === "afterbegin") {
        (_b = this.childNodes).unshift.apply(_b, p.childNodes);
      } else if (where === "beforeend") {
        p.childNodes.forEach(function(n) {
          _this.appendChild(n);
        });
      } else if (where === "beforebegin") {
        var idx = this.parentNode.childNodes.findIndex(function(child) {
          return child === _this;
        });
        (_c = this.parentNode.childNodes).splice.apply(_c, __spreadArray([idx, 0], p.childNodes));
        p.childNodes.forEach(function(n) {
          if (n instanceof HTMLElement2) {
            n.parentNode = _this.parentNode;
          }
        });
      } else {
        throw new Error("The value provided ('" + where + "') is not one of 'beforebegin', 'afterbegin', 'beforeend', or 'afterend'");
      }
    };
    Object.defineProperty(HTMLElement2.prototype, "nextSibling", {
      get: function() {
        if (this.parentNode) {
          var children = this.parentNode.childNodes;
          var i = 0;
          while (i < children.length) {
            var child = children[i++];
            if (this === child) {
              return children[i] || null;
            }
          }
          return null;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "nextElementSibling", {
      get: function() {
        if (this.parentNode) {
          var children = this.parentNode.childNodes;
          var i = 0;
          var find = false;
          while (i < children.length) {
            var child = children[i++];
            if (find) {
              if (child instanceof HTMLElement2) {
                return child || null;
              }
            } else if (this === child) {
              find = true;
            }
          }
          return null;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(HTMLElement2.prototype, "classNames", {
      get: function() {
        return this.classList.toString();
      },
      enumerable: false,
      configurable: true
    });
    return HTMLElement2;
  }(node_1.default);
  exports2.default = HTMLElement;
  var kMarkupPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z][-.:0-9_a-z]*)\s*([^>]*?)(\/?)>/ig;
  var kAttributePattern = /(^|\s)(id|class)\s*=\s*("([^"]*)"|'([^']*)'|(\S+))/ig;
  var kSelfClosingElements = {
    area: true,
    AREA: true,
    base: true,
    BASE: true,
    br: true,
    BR: true,
    col: true,
    COL: true,
    hr: true,
    HR: true,
    img: true,
    IMG: true,
    input: true,
    INPUT: true,
    link: true,
    LINK: true,
    meta: true,
    META: true,
    source: true,
    SOURCE: true,
    embed: true,
    EMBED: true,
    param: true,
    PARAM: true,
    track: true,
    TRACK: true,
    wbr: true,
    WBR: true
  };
  var kElementsClosedByOpening = {
    li: {li: true, LI: true},
    LI: {li: true, LI: true},
    p: {p: true, div: true, P: true, DIV: true},
    P: {p: true, div: true, P: true, DIV: true},
    b: {div: true, DIV: true},
    B: {div: true, DIV: true},
    td: {td: true, th: true, TD: true, TH: true},
    TD: {td: true, th: true, TD: true, TH: true},
    th: {td: true, th: true, TD: true, TH: true},
    TH: {td: true, th: true, TD: true, TH: true},
    h1: {h1: true, H1: true},
    H1: {h1: true, H1: true},
    h2: {h2: true, H2: true},
    H2: {h2: true, H2: true},
    h3: {h3: true, H3: true},
    H3: {h3: true, H3: true},
    h4: {h4: true, H4: true},
    H4: {h4: true, H4: true},
    h5: {h5: true, H5: true},
    H5: {h5: true, H5: true},
    h6: {h6: true, H6: true},
    H6: {h6: true, H6: true}
  };
  var kElementsClosedByClosing = {
    li: {ul: true, ol: true, UL: true, OL: true},
    LI: {ul: true, ol: true, UL: true, OL: true},
    a: {div: true, DIV: true},
    A: {div: true, DIV: true},
    b: {div: true, DIV: true},
    B: {div: true, DIV: true},
    i: {div: true, DIV: true},
    I: {div: true, DIV: true},
    p: {div: true, DIV: true},
    P: {div: true, DIV: true},
    td: {tr: true, table: true, TR: true, TABLE: true},
    TD: {tr: true, table: true, TR: true, TABLE: true},
    th: {tr: true, table: true, TR: true, TABLE: true},
    TH: {tr: true, table: true, TR: true, TABLE: true}
  };
  var frameflag = "documentfragmentcontainer";
  function base_parse(data, options) {
    if (options === void 0) {
      options = {lowerCaseTagName: false, comment: false};
    }
    var elements = options.blockTextElements || {
      script: true,
      noscript: true,
      style: true,
      pre: true
    };
    var element_names = Object.keys(elements);
    var kBlockTextElements = element_names.map(function(it) {
      return new RegExp(it, "i");
    });
    var kIgnoreElements = element_names.filter(function(it) {
      return elements[it];
    }).map(function(it) {
      return new RegExp(it, "i");
    });
    function element_should_be_ignore(tag) {
      return kIgnoreElements.some(function(it) {
        return it.test(tag);
      });
    }
    function is_block_text_element(tag) {
      return kBlockTextElements.some(function(it) {
        return it.test(tag);
      });
    }
    var root = new HTMLElement(null, {}, "", null);
    var currentParent = root;
    var stack = [root];
    var lastTextPos = -1;
    var match;
    data = "<" + frameflag + ">" + data + "</" + frameflag + ">";
    var _loop_1 = function() {
      if (lastTextPos > -1) {
        if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
          var text = data.substring(lastTextPos, kMarkupPattern.lastIndex - match[0].length);
          currentParent.appendChild(new text_1.default(text, currentParent));
        }
      }
      lastTextPos = kMarkupPattern.lastIndex;
      if (match[2] === frameflag) {
        return "continue";
      }
      if (match[0][1] === "!") {
        if (options.comment) {
          var text = data.substring(lastTextPos - 3, lastTextPos - match[0].length + 4);
          currentParent.appendChild(new comment_1.default(text, currentParent));
        }
        return "continue";
      }
      if (options.lowerCaseTagName) {
        match[2] = match[2].toLowerCase();
      }
      if (!match[1]) {
        var attrs = {};
        for (var attMatch = void 0; attMatch = kAttributePattern.exec(match[3]); ) {
          attrs[attMatch[2].toLowerCase()] = attMatch[4] || attMatch[5] || attMatch[6];
        }
        var tagName = currentParent.rawTagName;
        if (!match[4] && kElementsClosedByOpening[tagName]) {
          if (kElementsClosedByOpening[tagName][match[2]]) {
            stack.pop();
            currentParent = back_1.default(stack);
          }
        }
        currentParent = currentParent.appendChild(new HTMLElement(match[2], attrs, match[3], null));
        stack.push(currentParent);
        if (is_block_text_element(match[2])) {
          var closeMarkup_1 = "</" + match[2] + ">";
          var index = function() {
            if (options.lowerCaseTagName) {
              return data.toLocaleLowerCase().indexOf(closeMarkup_1, kMarkupPattern.lastIndex);
            }
            return data.indexOf(closeMarkup_1, kMarkupPattern.lastIndex);
          }();
          if (element_should_be_ignore(match[2])) {
            var text = void 0;
            if (index === -1) {
              text = data.substr(kMarkupPattern.lastIndex);
            } else {
              text = data.substring(kMarkupPattern.lastIndex, index);
            }
            if (text.length > 0) {
              currentParent.appendChild(new text_1.default(text, currentParent));
            }
          }
          if (index === -1) {
            lastTextPos = kMarkupPattern.lastIndex = data.length + 1;
          } else {
            lastTextPos = kMarkupPattern.lastIndex = index + closeMarkup_1.length;
            match[1] = "true";
          }
        }
      }
      if (match[1] || match[4] || kSelfClosingElements[match[2]]) {
        while (true) {
          if (currentParent.rawTagName === match[2]) {
            stack.pop();
            currentParent = back_1.default(stack);
            break;
          } else {
            var tagName = currentParent.tagName;
            if (kElementsClosedByClosing[tagName]) {
              if (kElementsClosedByClosing[tagName][match[2]]) {
                stack.pop();
                currentParent = back_1.default(stack);
                continue;
              }
            }
            break;
          }
        }
      }
    };
    while (match = kMarkupPattern.exec(data)) {
      _loop_1();
    }
    return stack;
  }
  exports2.base_parse = base_parse;
});

// ../node_modules/node-html-parser/dist/valid.js
var require_valid = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var html_1 = require_html2();
  function valid(data, options) {
    if (options === void 0) {
      options = {lowerCaseTagName: false, comment: false};
    }
    var stack = html_1.base_parse(data, options);
    return Boolean(stack.length === 1);
  }
  exports2.default = valid;
});

// ../node_modules/node-html-parser/dist/index.js
var require_dist = __commonJS((exports2) => {
  "use strict";
  var __importDefault = exports2 && exports2.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.NodeType = exports2.TextNode = exports2.Node = exports2.valid = exports2.default = exports2.parse = exports2.HTMLElement = exports2.CommentNode = void 0;
  var comment_1 = require_comment();
  Object.defineProperty(exports2, "CommentNode", {enumerable: true, get: function() {
    return __importDefault(comment_1).default;
  }});
  var html_1 = require_html2();
  Object.defineProperty(exports2, "HTMLElement", {enumerable: true, get: function() {
    return __importDefault(html_1).default;
  }});
  var parse_1 = require_parse3();
  Object.defineProperty(exports2, "parse", {enumerable: true, get: function() {
    return __importDefault(parse_1).default;
  }});
  Object.defineProperty(exports2, "default", {enumerable: true, get: function() {
    return __importDefault(parse_1).default;
  }});
  var valid_1 = require_valid();
  Object.defineProperty(exports2, "valid", {enumerable: true, get: function() {
    return __importDefault(valid_1).default;
  }});
  var node_1 = require_node();
  Object.defineProperty(exports2, "Node", {enumerable: true, get: function() {
    return __importDefault(node_1).default;
  }});
  var text_1 = require_text();
  Object.defineProperty(exports2, "TextNode", {enumerable: true, get: function() {
    return __importDefault(text_1).default;
  }});
  var type_1 = require_type();
  Object.defineProperty(exports2, "NodeType", {enumerable: true, get: function() {
    return __importDefault(type_1).default;
  }});
});

// ../node_modules/indexof/index.js
var require_indexof = __commonJS((exports2, module2) => {
  var indexOf = [].indexOf;
  module2.exports = function(arr, obj) {
    if (indexOf)
      return arr.indexOf(obj);
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] === obj)
        return i;
    }
    return -1;
  };
});

// ../node_modules/class-list/index.js
var require_class_list = __commonJS((exports2, module2) => {
  var indexof = require_indexof();
  module2.exports = ClassList;
  function ClassList(elem) {
    var cl = elem.classList;
    if (cl) {
      return cl;
    }
    var classList = {
      add,
      remove,
      contains,
      toggle,
      toString: $toString,
      length: 0,
      item
    };
    return classList;
    function add(token) {
      var list = getTokens();
      if (indexof(list, token) > -1) {
        return;
      }
      list.push(token);
      setTokens(list);
    }
    function remove(token) {
      var list = getTokens(), index = indexof(list, token);
      if (index === -1) {
        return;
      }
      list.splice(index, 1);
      setTokens(list);
    }
    function contains(token) {
      return indexof(getTokens(), token) > -1;
    }
    function toggle(token) {
      if (contains(token)) {
        remove(token);
        return false;
      } else {
        add(token);
        return true;
      }
    }
    function $toString() {
      return elem.className;
    }
    function item(index) {
      var tokens = getTokens();
      return tokens[index] || null;
    }
    function getTokens() {
      var className = elem.className;
      return filter(className.split(" "), isTruthy);
    }
    function setTokens(list) {
      var length = list.length;
      elem.className = list.join(" ");
      classList.length = length;
      for (var i = 0; i < list.length; i++) {
        classList[i] = list[i];
      }
      delete list[length];
    }
  }
  function filter(arr, fn) {
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
      if (fn(arr[i]))
        ret.push(arr[i]);
    }
    return ret;
  }
  function isTruthy(value) {
    return !!value;
  }
});

// ../node_modules/html-element/html-attributes.js
var require_html_attributes = __commonJS((exports2, module2) => {
  var PROPS_TO_ATTRS = {
    className: "class",
    htmlFor: "for"
  };
  var HTML_ATTRIBUTES = {
    accept: new Set([
      "form",
      "input"
    ]),
    "accept-charset": new Set([
      "form"
    ]),
    accesskey: "GLOBAL",
    action: new Set([
      "form"
    ]),
    align: new Set([
      "applet",
      "caption",
      "col",
      "colgroup",
      "hr",
      "iframe",
      "img",
      "table",
      "tbody",
      "td",
      "tfoot",
      "th",
      "thead",
      "tr"
    ]),
    alt: new Set([
      "applet",
      "area",
      "img",
      "input"
    ]),
    async: new Set([
      "script"
    ]),
    autocomplete: new Set([
      "form",
      "input"
    ]),
    autofocus: new Set([
      "button",
      "input",
      "keygen",
      "select",
      "textarea"
    ]),
    autoplay: new Set([
      "audio",
      "video"
    ]),
    autosave: new Set([
      "input"
    ]),
    bgcolor: new Set([
      "body",
      "col",
      "colgroup",
      "marquee",
      "table",
      "tbody",
      "tfoot",
      "td",
      "th",
      "tr"
    ]),
    border: new Set([
      "img",
      "object",
      "table"
    ]),
    buffered: new Set([
      "audio",
      "video"
    ]),
    challenge: new Set([
      "keygen"
    ]),
    charset: new Set([
      "meta",
      "script"
    ]),
    checked: new Set([
      "command",
      "input"
    ]),
    cite: new Set([
      "blockquote",
      "del",
      "ins",
      "q"
    ]),
    class: "GLOBAL",
    code: new Set([
      "applet"
    ]),
    codebase: new Set([
      "applet"
    ]),
    color: new Set([
      "basefont",
      "font",
      "hr"
    ]),
    cols: new Set([
      "textarea"
    ]),
    colspan: new Set([
      "td",
      "th"
    ]),
    content: new Set([
      "meta"
    ]),
    contenteditable: "GLOBAL",
    contextmenu: "GLOBAL",
    controls: new Set([
      "audio",
      "video"
    ]),
    coords: new Set([
      "area"
    ]),
    data: new Set([
      "object"
    ]),
    datetime: new Set([
      "del",
      "ins",
      "time"
    ]),
    default: new Set([
      "track"
    ]),
    defer: new Set([
      "script"
    ]),
    dir: "GLOBAL",
    dirname: new Set([
      "input",
      "textarea"
    ]),
    disabled: new Set([
      "button",
      "command",
      "fieldset",
      "input",
      "keygen",
      "optgroup",
      "option",
      "select",
      "textarea"
    ]),
    download: new Set([
      "a",
      "area"
    ]),
    draggable: "GLOBAL",
    dropzone: "GLOBAL",
    enctype: new Set([
      "form"
    ]),
    for: new Set([
      "label",
      "output"
    ]),
    form: new Set([
      "button",
      "fieldset",
      "input",
      "keygen",
      "label",
      "meter",
      "object",
      "output",
      "progress",
      "select",
      "textarea"
    ]),
    formaction: new Set([
      "input",
      "button"
    ]),
    headers: new Set([
      "td",
      "th"
    ]),
    height: new Set([
      "canvas",
      "embed",
      "iframe",
      "img",
      "input",
      "object",
      "video"
    ]),
    hidden: "GLOBAL",
    high: new Set([
      "meter"
    ]),
    href: new Set([
      "a",
      "area",
      "base",
      "link"
    ]),
    hreflang: new Set([
      "a",
      "area",
      "link"
    ]),
    "http-equiv": new Set([
      "meta"
    ]),
    icon: new Set([
      "command"
    ]),
    id: "GLOBAL",
    ismap: new Set([
      "img"
    ]),
    itemprop: "GLOBAL",
    keytype: new Set([
      "keygen"
    ]),
    kind: new Set([
      "track"
    ]),
    label: new Set([
      "track"
    ]),
    lang: "GLOBAL",
    language: new Set([
      "script"
    ]),
    list: new Set([
      "input"
    ]),
    loop: new Set([
      "audio",
      "bgsound",
      "marquee",
      "video"
    ]),
    low: new Set([
      "meter"
    ]),
    manifest: new Set([
      "html"
    ]),
    max: new Set([
      "input",
      "meter",
      "progress"
    ]),
    maxlength: new Set([
      "input",
      "textarea"
    ]),
    maxlength: new Set([
      "input",
      "textarea"
    ]),
    media: new Set([
      "a",
      "area",
      "link",
      "source",
      "style"
    ]),
    method: new Set([
      "form"
    ]),
    min: new Set([
      "input",
      "meter"
    ]),
    multiple: new Set([
      "input",
      "select"
    ]),
    muted: new Set([
      "video"
    ]),
    name: new Set([
      "button",
      "form",
      "fieldset",
      "iframe",
      "input",
      "keygen",
      "object",
      "output",
      "select",
      "textarea",
      "map",
      "meta",
      "param"
    ]),
    novalidate: new Set([
      "form"
    ]),
    open: new Set([
      "details"
    ]),
    optimum: new Set([
      "meter"
    ]),
    pattern: new Set([
      "input"
    ]),
    ping: new Set([
      "a",
      "area"
    ]),
    placeholder: new Set([
      "input",
      "textarea"
    ]),
    poster: new Set([
      "video"
    ]),
    preload: new Set([
      "audio",
      "video"
    ]),
    radiogroup: new Set([
      "command"
    ]),
    readonly: new Set([
      "input",
      "textarea"
    ]),
    rel: new Set([
      "a",
      "area",
      "link"
    ]),
    required: new Set([
      "input",
      "select",
      "textarea"
    ]),
    reversed: new Set([
      "ol"
    ]),
    rows: new Set([
      "textarea"
    ]),
    rowspan: new Set([
      "td",
      "th"
    ]),
    sandbox: new Set([
      "iframe"
    ]),
    scope: new Set([
      "th"
    ]),
    scoped: new Set([
      "style"
    ]),
    seamless: new Set([
      "iframe"
    ]),
    selected: new Set([
      "option"
    ]),
    shape: new Set([
      "a",
      "area"
    ]),
    size: new Set([
      "input",
      "select"
    ]),
    sizes: new Set([
      "img",
      "link",
      "source"
    ]),
    span: new Set([
      "col",
      "colgroup"
    ]),
    spellcheck: "GLOBAL",
    src: new Set([
      "audio",
      "embed",
      "iframe",
      "img",
      "input",
      "script",
      "source",
      "track",
      "video"
    ]),
    srcdoc: new Set([
      "iframe"
    ]),
    srclang: new Set([
      "track"
    ]),
    srcset: new Set([
      "img"
    ]),
    start: new Set([
      "ol"
    ]),
    step: new Set([
      "input"
    ]),
    style: "GLOBAL",
    summary: new Set([
      "table"
    ]),
    tabindex: "GLOBAL",
    target: new Set([
      "a",
      "area",
      "base",
      "form"
    ]),
    title: "GLOBAL",
    type: new Set([
      "button",
      "input",
      "command",
      "embed",
      "object",
      "script",
      "source",
      "style",
      "menu"
    ]),
    usemap: new Set([
      "img",
      "input",
      "object"
    ]),
    value: new Set([
      "button",
      "option",
      "input",
      "li",
      "meter",
      "progress",
      "param"
    ]),
    width: new Set([
      "canvas",
      "embed",
      "iframe",
      "img",
      "input",
      "object",
      "video"
    ]),
    wrap: new Set([
      "textarea"
    ])
  };
  function isStandardAttribute(attrName, tagName) {
    tagName = tagName.toLowerCase();
    var attr = HTML_ATTRIBUTES[attrName.toLowerCase()];
    return !!attr && (attr === "GLOBAL" || attr.has(tagName));
  }
  function propToAttr(prop) {
    return PROPS_TO_ATTRS[prop] || prop;
  }
  module2.exports = {
    isStandardAttribute,
    propToAttr
  };
});

// ../node_modules/html-element/index.js
var require_html_element = __commonJS((exports2, module2) => {
  var ClassList = require_class_list();
  var htmlAttributes = require_html_attributes();
  function Event(type, data) {
    this.type = type;
    this.target = null;
    Object.keys(data || {}).forEach(function(attr) {
      this[attr] = data[attr];
    }, this);
  }
  Event.prototype.preventDefault = function() {
  };
  Event.prototype.stopPropagation = function() {
  };
  Event.prototype.stopImmediatePropagation = function() {
  };
  function addEventListener(eventType, listener) {
    this._eventListeners = this._eventListeners || {};
    this._eventListeners[eventType] = this._eventListeners[eventType] || [];
    var listeners = this._eventListeners[eventType];
    if (listeners.indexOf(listener) === -1) {
      listeners.push(listener);
    }
  }
  function removeEventListener(eventType, listener) {
    var listeners = this._eventListeners && this._eventListeners[eventType];
    if (listeners) {
      var index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
  function dispatchEvent(event) {
    event.target = this;
    var listeners = this._eventListeners && this._eventListeners[event.type];
    if (listeners) {
      listeners.forEach(function(listener) {
        listener(event);
      });
    }
    return true;
  }
  function Document() {
  }
  Document.prototype.createTextNode = function(v) {
    var n = new Text();
    n.textContent = v;
    n.nodeName = "#text";
    n.nodeType = 3;
    return n;
  };
  Document.prototype.createElement = function(nodeName) {
    var el = new Element();
    el.nodeName = el.tagName = nodeName;
    return el;
  };
  Document.prototype.createComment = function(data) {
    var el = new Comment();
    el.data = data;
    return el;
  };
  Document.prototype.addEventListener = addEventListener;
  Document.prototype.removeEventListener = removeEventListener;
  Document.prototype.dispatchEvent = dispatchEvent;
  function Node() {
  }
  Text.prototype = new Node();
  Element.prototype = new Node();
  Comment.prototype = new Node();
  function Style(el) {
    this.el = el;
    this.styles = [];
  }
  Style.prototype.setProperty = function(n, v) {
    this.el._setProperty(this.styles, {name: n, value: v});
  };
  Style.prototype.getProperty = function(n) {
    return this.el._getProperty(this.styles, n);
  };
  Style.prototype.__defineGetter__("cssText", function() {
    var stylified = "";
    this.styles.forEach(function(s) {
      stylified += s.name + ":" + s.value + ";";
    });
    return stylified;
  });
  Style.prototype.__defineSetter__("cssText", function(v) {
    this.styles.length = 0;
    v.split(";").forEach(function(part) {
      var splitPoint = part.indexOf(":");
      if (splitPoint) {
        var key = part.slice(0, splitPoint).trim();
        var value = part.slice(splitPoint + 1).trim();
        this.setProperty(key, value);
      }
    }, this);
  });
  function Attribute(name, value) {
    if (name) {
      this.name = name;
      this.value = value ? value : "";
    }
  }
  function Element() {
    var self = this;
    this.style = new Style(this);
    this.classList = ClassList(this);
    this.childNodes = [];
    this.attributes = [];
    this.dataset = {};
    this.className = "";
    this._setProperty = function(arr, obj, key, val) {
      var p = self._getProperty(arr, key);
      if (p) {
        p.value = String(val);
        return;
      }
      arr.push(typeof obj === "function" ? new obj(key.toLowerCase(), String(val)) : obj);
    };
    this._getProperty = function(arr, key) {
      if (!key)
        return;
      key = key.toLowerCase();
      for (var i = 0; i < arr.length; i++) {
        if (key === arr[i].name)
          return arr[i];
      }
    };
  }
  Element.prototype.nodeType = 1;
  Element.prototype.appendChild = function(child) {
    child.parentElement = this;
    this.childNodes.push(child);
    return child;
  };
  Element.prototype.setAttribute = function(n, v) {
    if (n === "style") {
      this.style.cssText = v;
    } else {
      this._setProperty(this.attributes, Attribute, n, v);
    }
  };
  Element.prototype.getAttribute = function(n) {
    if (n === "style") {
      return this.style.cssText;
    } else {
      var result = this._getProperty(this.attributes, n);
      return typeof result !== "undefined" ? result.value : null;
    }
  };
  Element.prototype.removeAttribute = function(n) {
    if (n === "class") {
      delete this.className;
    } else {
      for (var i = 0, len = this.attributes.length; i < len; i++) {
        if (this.attributes[i].name === n) {
          this.attributes.splice(i, 1);
          break;
        }
      }
    }
  };
  Element.prototype.replaceChild = function(newChild, oldChild) {
    var self = this;
    var replaced = false;
    this.childNodes.forEach(function(child, index) {
      if (child === oldChild) {
        self.childNodes[index] = newChild;
        newChild.parentElement = this;
        replaced = true;
      }
    });
    if (replaced)
      return oldChild;
  };
  Element.prototype.removeChild = function(rChild) {
    var self = this;
    var removed = true;
    this.childNodes.forEach(function(child, index) {
      if (child === rChild) {
        self.childNodes.splice(index, 1);
        rChild.parentElement = null;
        removed = true;
      }
    });
    if (removed)
      return rChild;
  };
  Element.prototype.insertBefore = function(newChild, existingChild) {
    var childNodes = this.childNodes;
    if (existingChild === null) {
      childNodes.push(newChild);
    } else {
      for (var i = 0, len = childNodes.length; i < len; i++) {
        var child = childNodes[i];
        if (child === existingChild) {
          i === 0 ? childNodes.unshift(newChild) : childNodes.splice(i, 0, newChild);
          break;
        }
      }
    }
    newChild.parentElement = this;
    return newChild;
  };
  Element.prototype.addEventListener = addEventListener;
  Element.prototype.removeEventListener = removeEventListener;
  Element.prototype.dispatchEvent = dispatchEvent;
  Element.prototype.insertAdjacentHTML = function(position, text) {
  };
  Element.prototype.__defineGetter__("innerHTML", function() {
    var s = this.childNodes.html || "";
    this.childNodes.forEach(function(e) {
      s += e.outerHTML || e.textContent;
    });
    return s;
  });
  Element.prototype.__defineSetter__("innerHTML", function(v) {
    this.childNodes.length = 0;
    this.childNodes.html = v;
  });
  Element.prototype.__defineGetter__("outerHTML", function() {
    var a = [], self = this;
    var VOID_ELEMENTS = {
      AREA: true,
      BASE: true,
      BR: true,
      COL: true,
      EMBED: true,
      HR: true,
      IMG: true,
      INPUT: true,
      KEYGEN: true,
      LINK: true,
      META: true,
      PARAM: true,
      SOURCE: true,
      TRACK: true,
      WBR: true
    };
    function _stringify(arr) {
      var attr = [], value;
      arr.forEach(function(a2) {
        value = a2.name != "style" ? a2.value : self.style.cssText;
        attr.push(a2.name + '="' + escapeAttribute(value) + '"');
      });
      return attr.length ? " " + attr.join(" ") : "";
    }
    function _dataify(data) {
      var attr = [], value;
      Object.keys(data).forEach(function(name) {
        attr.push("data-" + name + '="' + escapeAttribute(data[name]) + '"');
      });
      return attr.length ? " " + attr.join(" ") : "";
    }
    function _propertify() {
      var props = [];
      for (var key in self) {
        var attrName = htmlAttributes.propToAttr(key);
        if (self.hasOwnProperty(key) && ["string", "boolean", "number"].indexOf(typeof self[key]) !== -1 && htmlAttributes.isStandardAttribute(attrName, self.nodeName) && _shouldOutputProp(key, attrName)) {
          props.push({name: attrName, value: self[key]});
        }
      }
      return props ? _stringify(props) : "";
    }
    function _shouldOutputProp(prop, attr) {
      if (self.getAttribute(attr)) {
        return false;
      } else {
        if (prop === "className" && !self[prop]) {
          return false;
        }
      }
      return true;
    }
    var attrs = this.style.cssText ? this.attributes.concat([{name: "style"}]) : this.attributes;
    a.push("<" + this.nodeName + _propertify() + _stringify(attrs) + _dataify(this.dataset) + ">");
    if (!VOID_ELEMENTS[this.nodeName.toUpperCase()]) {
      a.push(this.innerHTML);
      a.push("</" + this.nodeName + ">");
    }
    return a.join("");
  });
  Element.prototype.__defineGetter__("textContent", function() {
    var s = "";
    this.childNodes.forEach(function(e) {
      s += e.textContent;
    });
    return s;
  });
  Element.prototype.__defineSetter__("textContent", function(v) {
    var textNode = new Text();
    textNode.textContent = v;
    this.childNodes = [textNode];
    return v;
  });
  function escapeHTML(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escapeAttribute(s) {
    return escapeHTML(s).replace(/"/g, "&quot;");
  }
  Element.prototype.nodeValue = null;
  function Text() {
  }
  Text.prototype.nodeType = 3;
  Text.prototype.nodeName = "#text";
  Text.prototype.__defineGetter__("textContent", function() {
    return escapeHTML(this.value || "");
  });
  Text.prototype.__defineSetter__("textContent", function(v) {
    this.value = v;
  });
  Text.prototype.__defineGetter__("nodeValue", function() {
    return escapeHTML(this.value || "");
  });
  Text.prototype.__defineSetter__("nodeValue", function(v) {
    this.value = v;
  });
  Text.prototype.__defineGetter__("length", function() {
    return (this.value || "").length;
  });
  Text.prototype.replaceData = function(offset, length, str) {
    this.value = this.value.slice(0, offset) + str + this.value.slice(offset + length);
  };
  function Comment() {
  }
  Comment.prototype.nodeType = 8;
  Comment.prototype.nodeName = "#comment";
  Comment.prototype.__defineGetter__("data", function() {
    return this.value;
  });
  Comment.prototype.__defineSetter__("data", function(v) {
    this.value = v;
  });
  Comment.prototype.__defineGetter__("outerHTML", function() {
    return "<!--" + escapeHTML(this.value || "") + "-->";
  });
  Comment.prototype.__defineGetter__("nodeValue", function() {
    return escapeHTML(this.value || "");
  });
  Comment.prototype.__defineSetter__("nodeValue", function(v) {
    this.value = v;
  });
  function defineParentNode(obj) {
    obj.__defineGetter__("parentNode", function() {
      return this.parentElement;
    });
  }
  defineParentNode(Element.prototype);
  defineParentNode(Comment.prototype);
  defineParentNode(Text.prototype);
  defineParentNode(Node.prototype);
  module2.exports = {
    Document,
    Node,
    Element,
    Comment,
    Text,
    document: new Document(),
    Event,
    CustomEvent: Event
  };
});

// tokens_all.js
var require_tokens_all = __commonJS((exports2) => {
  exports2.tokens_all = [
    {
      token: "div",
      type: "multiElement",
      col: 0,
      is: null,
      element: []
    },
    {
      token: "h1",
      type: "multiElement",
      col: 0,
      is: null,
      element: []
    },
    {
      token: "p",
      type: "multiElement",
      col: 0,
      is: null,
      element: []
    },
    {
      token: "b",
      type: "multiElement",
      col: 0,
      is: null,
      element: []
    },
    {
      token: "input",
      type: "singleElement",
      col: 0,
      is: null,
      element: []
    }
  ];
});

// seleku-core.js
var require_seleku_core = __commonJS((exports, module) => {
  var html = [];
  var setattr = (element, attr) => {
    let match_of_html = [];
    if (attr.match(/\w*\=".*?\"/igm))
      match_of_html = [...match_of_html, match_of_html, ...attr.match(/\w*\=".*?\"/igm) || []];
    if (attr.match(/\w*\='.*?\'/igm))
      match_of_html = [...match_of_html, match_of_html, ...attr.match(/\w*\='.*?\'/igm) || []];
    if (attr.match(/\w*\={.*?\}/igm) && !attr.match(/\w*:*\w*\={.*?\}/igm))
      match_of_html = [...match_of_html, match_of_html, ...attr.match(/\w*\={.*?\}/igm) || []];
    if (attr.match(/\w*:*\w*\={.*?\}/igm))
      match_of_html = [...match_of_html, match_of_html, ...attr.match(/\w*:*\w*\={.*?\}/igm) || []];
    let attribute_object = [];
    match_of_html.forEach((e, _index) => {
      if (e instanceof Array) {
        match_of_html[_index] = "";
      } else {
        console.log(match_of_html);
        let attribute = e?.replace?.("=", "~@")?.split("~@");
        for (let x = 0; x < attribute?.length - 1; x++) {
          attribute_object.push({
            name: attribute[x],
            value: ((e) => {
              try {
                return eval(attribute[x + 1]);
              } catch (err) {
                return attribute[x + 1];
              }
            })()
          });
        }
      }
    });
    attribute_object.forEach((tokens) => {
      element.setAttribute(tokens.name, tokens.value);
    });
    return element;
  };
  var seleku_element = () => {
    try {
      element.forEach((el) => {
        if (el?.tagName && el?.id)
          html.push({
            element: el?.attr?.trim().length > 0 ? setattr(document.createElement(el.tagName), el?.attr) : document.createElement(el.tagName),
            id: el.id,
            parentId: el?.parentId
          });
        if (el?.text && el?.parentId) {
          html.push({
            text: el?.text,
            id: el.id,
            parentId: el?.parentId
          });
        }
      });
    } catch (err) {
    }
  };
  var html_result = () => {
    seleku_element();
    let id_of_parent = [];
    html.forEach((_el) => _el?.id && _el?.element ? id_of_parent.push({obj_id: _el.id, obj: _el.element}) : "");
    html.forEach((_el, index) => {
      id_of_parent.forEach((el) => {
        if (el?.obj_id === _el?.parentId && _el?.element)
          el?.obj.appendChild(_el?.element);
        else if (el?.obj_id === _el?.parentId && _el?.text) {
          el.obj.textContent = _el?.text;
          html[index] = "";
        }
      });
    });
    html.forEach((el) => {
      if (el.parentId === null || el.parentId === 0) {
        document.body.appendChild(el.element);
      }
    });
  };
  html_result();
});

// global_def.js
var require_global_def = __commonJS((exports2) => {
  var fs = require("fs");
  var path = require("path");
  var {grammar} = require_grammar();
  var nodeParser = require_dist();
  var html_parent = require_html_element().document;
  var {tokens_all} = require_tokens_all();
  var {seleku_core} = require_seleku_core();
  exports2.CREATE_UUID = () => {
    let dt = new Date().getTime();
    let uuid = "xxxxxxxx".replace(/[xy]/g, function(c2) {
      let r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c2 == "x" ? r : r & 3 | 8).toString(16);
    });
    return uuid;
  };
  exports2.getDataFile = (file_name) => {
    return new Promise((resolve, reject) => {
      fs.open(file_name, "r", (err, data) => {
        fs.readFile(data, (err2, _data) => {
          let a = _data.toString("utf-8").replace(/\<html>/igm, "#html").replace(/\<*\/html>/igm, "#html").replace(/\<style.*?\>/igm, "#css").replace(/\<*\/style>/igm, "#css").replace(/\<script.*?\>/igm, "#js").replace(/\<*\/script>/igm, "#js").split(/\n/);
          let numbers = 0;
          let data_of_html = [];
          let elements = "";
          a.forEach((element2, index) => {
            if (/\<.*?\>/igm.test(element2) && /\<*\/.*?\>/igm.test(element2)) {
              if ([...element2.match(/\<.*?\>/igm) || [1]].length > 1) {
                elements = element2.replace(/\<.*?\>/igm, " ");
                element2 = element2.replace(elements.trim(), element2.replace(/\<.*?\>/igm, "\n"));
                a[index] = element2;
              }
            }
            if (/\<.*?\>/igm.test(element2))
              data_of_html.push({
                element: element2,
                col: index
              });
          });
          resolve({data: a.join("\n"), info_of_data: data_of_html});
        });
      });
    });
  };
  exports2.lexer = (args) => {
    let data = args.split("\n").filter((token) => token.length > 0 && token !== "\r");
    let data_all = [];
    data.forEach((token, index) => data_all.push({string: token.trim(), col: index}));
    return data_all;
  };
  exports2.data_to_ast = (data_from_lexers) => {
    return new Promise((resolve, reject) => {
      let data_from_lexer = data_from_lexers;
      const analyze_syntax = (() => {
        let data = [];
        let g = [];
        data_from_lexer.forEach((i, col) => {
          i.forEach((e, index) => {
            tokens_all.forEach((j) => {
              if (e.match(new RegExp(`<${j.token}`)) || e.match(new RegExp(`<*/${j.token}`))) {
                new RegExp(`<*/${j.token}>`).test(e) ? (() => {
                  g.push({
                    token: j.token,
                    type: j.type,
                    col,
                    is: "closeTag",
                    element: i
                  });
                })() : (() => {
                  g.push({
                    token: j.token,
                    type: j.type,
                    col,
                    is: "openTag",
                    element: i
                  });
                })();
              } else if (e.match(/\w*/igm) && !(e.match(/\<.*?\>/igm) && !e.match(/\/.*?\>/igm))) {
                g.push({
                  token: e,
                  type: "",
                  col: 0,
                  is: "text",
                  element: []
                });
              }
            });
          });
        });
        resolve(g);
      })();
    });
  };
  exports2.whitespaceLexer = (args) => {
    let all_attr = [];
    let position = [];
    args.split("\n").forEach((i, index) => {
      if (i.match(/\w*\=".*?\"/))
        all_attr = [...all_attr, ...i.match(/\w*\=".*?\"/igm) || []];
      all_attr.forEach((x, y) => {
        args = args.replace(/\w*\=".*?\"/, ` #${y} `);
        position.push({id: `#${y}`, data: x});
      });
    });
    let compire = args.split(" ").filter((token) => token.length > 0);
    let result = [];
    compire.forEach((token, index) => {
      position.forEach((x) => {
        if (new RegExp(x.id).test(token))
          compire[index] = token.replace(x.id, x.data);
      });
    });
    return compire;
  };
  var tag;
  (function(tag2) {
    tag2[tag2["openTag"] = 0] = "openTag";
    tag2[tag2["closeTag"] = 1] = "closeTag";
  })(tag || (tag = {}));
  exports2.AST = (args, lex, css, js, config) => {
    let openTag = [];
    let closeTag = [];
    for (let x = -1; x < args.length; x++) {
      if (args[x - 1]?.pos < args[x]?.pos && (args[x]?.pos < args[x + 1]?.pos || args[x]?.pos === args[x + 1]?.pos) && args[x].token.length > 0) {
        openTag.push({
          token: args[x].token,
          col: args[x].col
        });
      } else if (args[x].token.length > 0) {
        closeTag.push({
          [args[x].token]: args[x].token,
          col: args[x].col
        });
      }
    }
    for (let a2 = 0; a2 < openTag.length; a2++) {
      for (let b = 0; b < closeTag.length; b++) {
        if (closeTag[b][openTag[a2].token]) {
          closeTag[b][openTag[a2].token] = "";
          openTag[a2].token = "";
          break;
        }
      }
    }
    let data_string = [];
    for (let element2 of args) {
      data_string.push(element2.el.join(" "));
    }
    let obj = [];
    let CREATE_UUID2 = () => {
      let dt = new Date().getTime();
      let uuid = "xxxxxxxx".replace(/[xy]/g, function(c2) {
        let r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c2 == "x" ? r : r & 3 | 8).toString(16);
      });
      return uuid;
    };
    let convert = (argv) => {
      obj.push({
        parentElement: argv.parent,
        tagName: argv.name,
        id: argv.id,
        text: argv.text,
        parentId: argv.parentId,
        attr: argv.attr
      });
      let index = 0;
      if (argv.child.length > 0) {
        argv.child.forEach(({...children}, _index) => {
          if (children.childNodes.length > 0 && children.rawTagName) {
            convert({
              child: children.childNodes,
              parent: argv.name,
              parentId: argv.id,
              id: CREATE_UUID2(),
              name: children.rawTagName,
              attr: children.rawAttrs
            });
          } else {
            convert({
              child: children.childNodes,
              parent: argv.name,
              parentId: argv.id,
              id: CREATE_UUID2(),
              name: children.rawTagName,
              attr: children.rawAttrs
            });
          }
          if (children.rawText && children.rawText.trim().length > 0) {
            convert({
              child: children.childNodes,
              parent: argv.name,
              parentId: argv.id,
              text: children.rawText,
              id: CREATE_UUID2(),
              name: children.rawTagName,
              attr: children.rawAttrs
            });
          }
        });
      }
    };
    let all_string = "";
    lex.forEach((el) => {
      el.forEach((result) => {
        all_string += " " + result.trim();
      });
    });
    let data_parser = {...nodeParser.parse(all_string)};
    convert({
      child: data_parser.childNodes,
      name: data_parser.childNodes[0].rawTagName,
      id: 0,
      parentId: 0
    });
    function convertToText(obj2) {
      const string = [];
      if (typeof obj2 == "object" && obj2.join == void 0) {
        string.push("{");
        for (const prop in obj2) {
          string.push(prop, ": ", convertToText(obj2[prop]), ",");
        }
        string.push("}");
      } else if (typeof obj2 == "object" && !(obj2.join == void 0)) {
        string.push("[");
        for (const prop in obj2) {
          string.push(convertToText(obj2[prop]), ",");
        }
        string.push("]");
      } else if (typeof obj2 == "function") {
        string.push(obj2.toString());
      } else {
        string.push(JSON.stringify(obj2));
      }
      return string.join("");
    }
    let $element = JSON.parse(JSON.stringify(obj));
    $element = $element.filter(($el, _index) => {
      return !($el.tagName === void 0 && $el.text === void 0);
    });
    let config_file = fs.readFileSync(__dirname + "/user.config.js").toString("utf-8");
    let file_name = path.basename(config.file).match(/\.*\w*/)[0];
    let joss = fs.readFileSync(__dirname + "/joss.js").toString("utf-8");
    let seleku_embed = fs.readFileSync(__dirname + "/seleku-embbeded.js").toString("utf-8");
    let a = new grammar({
      path: config.dirOut,
      file_name: file_name + ".js",
      config: "",
      content: `${!config.isComponent ? fs.readFileSync(__dirname + "/reactivity.js") : ""}
		let components_${file_name} = [{name: "seleku-${file_name}",element: ${convertToText($element)}, css: \`${css.join(" ").replace(/\n/igm, " ").replace(/\#css/igm, "")}\`}];

		${!config.isComponent ? fs.readFileSync(__dirname + "/seleku-components.js") : ""}
		${config_file.replace(/\@seleku_pre/igm, "components_" + file_name).replace(/\@seleku_selector/igm, `"${config.renderTarget}"`)}
		${!config.isComponent ? joss : ""}
		${!config.isComponent ? seleku_embed : ""}
		${js.join("\n").replace(/#js/, "")}
		`
    });
    a.write();
  };
});

// config.js
var require_config = __commonJS((exports2) => {
  var declaration = [
    "#html",
    "#css",
    "#js"
  ];
  exports2.declarate = (query) => {
    for (let decorator of declaration) {
      query = query.replace(decorator, "#sapartor");
    }
    return query.split("#sapartor");
  };
});

// lexer.js
var {getDataFile, CREATE_UUID, lexer, data_to_ast, whitespaceLexer, AST} = require_global_def();
var {declarate, registerDecorator} = require_config();
var typeOfElement;
(function(typeOfElement2) {
  typeOfElement2[typeOfElement2["multiElement"] = 0] = "multiElement";
  typeOfElement2[typeOfElement2["singleElement"] = 1] = "singleElement";
})(typeOfElement || (typeOfElement = {}));
var is_tag;
(function(is_tag2) {
  is_tag2[is_tag2["openTag"] = 0] = "openTag";
  is_tag2[is_tag2["closeTag"] = 1] = "closeTag";
})(is_tag || (is_tag = {}));
module.exports.compile = async (args) => {
  let seleku_file = await (() => getDataFile(args.file))();
  let tokens = lexer(seleku_file.data);
  let tokens_html = [];
  let final_data_to_ast = [];
  let Html = [];
  let Css = [];
  let Js = [];
  tokens.forEach((element2) => tokens_html.push(element2.string));
  let all_tokens_of_web = declarate(tokens_html.join("\n"));
  all_tokens_of_web.forEach((tokens_of_seleku) => {
    if (/\#*\html/igm.test(tokens_of_seleku)) {
      Html = [tokens_of_seleku];
    }
    if (/\#css*/igm.test(tokens_of_seleku)) {
      Css = [tokens_of_seleku];
    }
    if (/\#*\js/igm.test(tokens_of_seleku)) {
      Js = [tokens_of_seleku];
    }
  });
  const lexer_result = Html.join("").split("\n").map((element2) => whitespaceLexer(element2));
  let position = 0;
  let g = async () => {
    let a = await (() => data_to_ast(lexer_result))();
    a.forEach((lexer2, index) => {
      if (lexer2.type === typeOfElement[0] && lexer2.is === is_tag[0]) {
        position++;
        final_data_to_ast.push({el: lexer2.element, col: lexer2.col, pos: position, token: lexer2.token, type: lexer2.is});
      } else if (lexer2.type === typeOfElement[1]) {
        position++;
        final_data_to_ast.push({el: lexer2.element, col: lexer2.col, pos: position, token: lexer2.token, type: lexer2.is});
      } else if (lexer2.type === typeOfElement[0] && lexer2.is === is_tag[1]) {
        final_data_to_ast.push({el: lexer2.element, col: lexer2.col, pos: position, token: lexer2.token, type: lexer2.is});
      }
    });
    final_data_to_ast[-1] = {el: [], col: -1, pos: -1, token: "", type: "nothing"};
    AST(final_data_to_ast, lexer_result, Css, Js, args);
  };
  g();
};
