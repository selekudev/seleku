let fs = require("fs");
let path = require("path");
let { grammar } = require("./grammar");
let nodeParser = require('node-html-parser');
let html_parent = require('html-element').document;
let { tokens_all } = require("./tokens_all");
let { seleku_core } = require("./seleku-core");
let { ["log"]: c } = console;
//custom fungsi uuid 
exports.CREATE_UUID = () => {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};
//fungsi imni untuk mengambil data dari file seleku
exports.getDataFile = (file_name) => {
    return (new Promise((resolve, reject) => {
        fs.open(file_name, "r", (err, data) => {
            fs.readFile(data, (err, _data) => {
                let a = _data.toString("utf-8").replace(/\<html>/igm, "#html").replace(/\<*\/html>/igm, "#html").replace(/\<style.*?\>/igm, "#css").replace(/\<*\/style>/igm, "#css").replace(/\<script.*?\>/igm, "#js").replace(/\<*\/script>/igm, "#js").split(/\n/);
                let numbers = 0;
                let data_of_html = [];
                let elements = "";
                a.forEach((element, index) => {
                    if (/\<.*?\>/igm.test(element) && /\<*\/.*?\>/igm.test(element)) {
                        if ([...element.match(/\<.*?\>/igm) || [1]].length > 1) {
                            elements = element.replace(/\<.*?\>/igm, " ");
                            element = element.replace(elements.trim(), element.replace(/\<.*?\>/igm, "\n"));
                            a[index] = element;
                        }
                    }
                    if (/\<.*?\>/igm.test(element))
                        data_of_html.push({
                            element: element,
                            col: index
                        });
                });
                resolve({ data: a.join("\n"), info_of_data: data_of_html });
            });
        });
    }));
};
//fungsi lexer yaitu fungsi yang mendata setiap query string
exports.lexer = (args) => {
    let data = args.split("\n").filter(token => token.length > 0 && token !== "\r");
    let data_all = [];
    data.forEach((token, index) => data_all.push({ string: token.trim(), col: index }));
    return data_all;
};
// fungsi yang mengembalikan data yang telah di lexer dan memberikan informasi yang lebih mendetail
exports.data_to_ast = (data_from_lexers) => {
    return (new Promise((resolve, reject) => {
        let data_from_lexer = data_from_lexers;
        const analyze_syntax = (() => {
            let data = [];
            let g = [];
            data_from_lexer.forEach((i, col) => {
                i.forEach((e, index) => {
                    tokens_all.forEach((j) => {
                        if (e.match(new RegExp(`\<${j.token}`)) || e.match(new RegExp(`\<*\/${j.token}`))) {
                            (new RegExp(`\<*\/${j.token}\>`).test(e)) ?
                                (() => {
                                    g.push({
                                        token: j.token,
                                        type: j.type,
                                        col: col,
                                        is: "closeTag",
                                        element: i
                                    });
                                })() :
                                (() => {
                                    g.push({
                                        token: j.token,
                                        type: j.type,
                                        col: col,
                                        is: "openTag",
                                        element: i
                                    });
                                })();
                        }
                        else if (e.match(/\w*/igm) && !(e.match(/\<.*?\>/igm) && !(e.match(/\/.*?\>/igm)))) {
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
    }));
};
// ini adalah fungsi yang memisahkan attribut html pada seleku 
exports.whitespaceLexer = (args) => {
    let all_attr = [];
    let position = [];
    args.split("\n").forEach((i, index) => {
        if (i.match(/\w*\=".*?\"/))
            all_attr = [...all_attr, ...i.match(/\w*\=".*?\"/igm) || []];
        all_attr.forEach((x, y) => {
            args = args.replace(/\w*\=".*?\"/, ` #${y} `);
            position.push({ id: `#${y}`, data: x });
        });
    });
    let compire = args.split(" ").
        filter(token => token.length > 0);
    let result = [];
    compire.forEach((token, index) => {
        position.forEach(x => {
            if (new RegExp(x.id).test(token))
                compire[index] = token.replace(x.id, x.data);
        });
    });
    return compire;
};
var tag;
(function (tag) {
    tag[tag["openTag"] = 0] = "openTag";
    tag[tag["closeTag"] = 1] = "closeTag";
})(tag || (tag = {}));
exports.AST = (args, lex, css, js, config) => {
    let openTag = [];
    let closeTag = [];
    for (let x = -1; x < args.length; x++) {
        if (args[x - 1]?.pos < args[x]?.pos && (args[x]?.pos < args[x + 1]?.pos || args[x]?.pos === args[x + 1]?.pos) && args[x].token.length > 0) {
            openTag.push({
                token: args[x].token,
                col: args[x].col
            });
        }
        else if (args[x].token.length > 0) {
            closeTag.push({
                [args[x].token]: args[x].token,
                col: args[x].col
            });
        }
    }
    for (let a = 0; a < openTag.length; a++) {
        for (let b = 0; b < closeTag.length; b++) {
            if (closeTag[b][openTag[a].token]) {
                closeTag[b][openTag[a].token] = "";
                openTag[a].token = "";
                break;
            }
        }
    }
    let data_string = [];
    for (let element of args) {
        data_string.push(element.el.join(" "));
    }
    let obj = [];
    let CREATE_UUID = () => {
        let dt = new Date().getTime();
        let uuid = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
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
            argv.child.forEach(({ ...children }, _index) => {
                if (children.childNodes.length > 0 && children.rawTagName) {
                    convert({
                        child: children.childNodes,
                        parent: argv.name,
                        parentId: argv.id,
                        id: CREATE_UUID(),
                        name: children.rawTagName,
                        attr: children.rawAttrs
                    });
                }
                else {
                    convert({
                        child: children.childNodes,
                        parent: argv.name,
                        parentId: argv.id,
                        id: CREATE_UUID(),
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
                        id: CREATE_UUID(),
                        name: children.rawTagName,
                        attr: children.rawAttrs
                    });
                }
            });
        }
    };
    let all_string = "";
    lex.forEach(el => {
        el.forEach(result => {
            all_string += " " + result.trim();
        });
    });
    let data_parser = { ...nodeParser.parse(all_string) };
    convert({
        child: data_parser.childNodes,
        name: data_parser.childNodes[0].rawTagName,
        id: 0,
        parentId: 0
    });
    // Make an object a string that evaluates to an equivalent object
    //  Note that eval() seems tricky and sometimes you have to do
    //  something like eval("a = " + yourString), then use the value
    //  of a.
    //
    //  Also this leaves extra commas after everything, but JavaScript
    //  ignores them.
    function convertToText(obj) {
        // create an array that will later be joined into a string.
        const string = [];
        // is object
        //    Both arrays and objects seem to return "object"
        //    when typeof(obj) is applied to them. So instead
        //    I am checking to see if they have the property
        //    join, which normal objects don't have but
        //    arrays do.
        if (typeof (obj) == "object" && (obj.join == undefined)) {
            string.push("{");
            for (const prop in obj) {
                string.push(prop, ": ", convertToText(obj[prop]), ",");
            }
            string.push("}");
            // is array
        }
        else if (typeof (obj) == "object" && !(obj.join == undefined)) {
            string.push("[");
            for (const prop in obj) {
                string.push(convertToText(obj[prop]), ",");
            }
            string.push("]");
            // is function
        }
        else if (typeof (obj) == "function") {
            string.push(obj.toString());
            // all other values can be done with JSON.stringify
        }
        else {
            string.push(JSON.stringify(obj));
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
        content: `${(!config.isComponent) ? fs.readFileSync(__dirname + "/reactivity.js") : ""}
		let components_${file_name} = [{name: "seleku-${file_name}",element: ${convertToText($element)}, css: \`${css.join(" ").replace(/\n/igm, " ").replace(/\#css/igm, "")}\`}];\n
		${(!config.isComponent) ? fs.readFileSync(__dirname + "/seleku-components.js") : ""}
		${config_file.replace(/\@seleku_pre/igm, "components_" + file_name).replace(/\@seleku_selector/igm, `"${config.renderTarget}"`)}
		${(!config.isComponent) ? joss : ""}
		${(!config.isComponent) ? seleku_embed : ""}
		${js.join("\n").replace(/#js/, "")}
		`
    });
    a.write();
    // console.log(openTag,closeTag)
};
