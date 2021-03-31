class SelekuComponents extends HTMLElement {
    constructor(args) {
        super();
        this.element = [];
        this.styles = "";
        this.script = "";
        // this.root = this.attachShadow({mode: "open"});
    }
    get Js() {
        let script = document.createElement("script");
        script.textContent = this.script.replace("#js", "");
        return script;
    }
    get Css() {
        let style = document.createElement("style");
        style.textContent = this.styles.replace("#css", "");
        return style;
    }
    get Html() {
        // let element: string[] = this.element;
        let element = this.element;
        let html = [];
        let setattr = (element, attr) => {
            let match_of_html = [];
            if (attr.match(/\w*\=".*?\"/igm))
                match_of_html = [...match_of_html, match_of_html, ...attr.match(/\w*\=".*?\"/igm) || []];
            if (attr.match(/\w*\='.*?\'/igm))
                match_of_html = [...match_of_html, match_of_html, ...attr.match(/\w*\='.*?\'/igm) || []];
            if (attr.match(/\w*\={.*?\}/igm) && !((attr.match(/\w*:*\w*\={.*?\}/igm))))
                match_of_html = [...match_of_html, match_of_html, ...attr.match(/\w*\={.*?\}/igm) || []];
            if (attr.match(/\w*:*\w*\={.*?\}/igm))
                match_of_html = [...match_of_html, match_of_html, ...attr.match(/\w*:*\w*\={.*?\}/igm) || []];
            let attribute_object = [];
            match_of_html.forEach((e, _index) => {
                if (e instanceof Array) {
                    match_of_html[_index] = "";
                }
                else {
                    let attribute = e?.replace?.("=", "~@")?.split("~@");
                    for (let x = 0; x < attribute?.length - 1; x++) {
                        attribute_object.push({
                            name: attribute[x],
                            value: (e => {
                                try {
                                    return eval(attribute[x + 1]);
                                }
                                catch (err) {
                                    return attribute[x + 1];
                                }
                            })()
                        });
                    }
                }
            });
            attribute_object.forEach(tokens => {
                element.setAttribute(tokens.name, tokens.value);
            });
            return element;
        };
        let seleku_element = () => {
            try {
                element.forEach((el) => {
                    if (el?.tagName && el?.id)
                        html.push({
                            element: (el?.attr?.trim().length > 0) ? setattr(document.createElement(el.tagName), el?.attr) : document.createElement(el.tagName),
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
            }
            catch (err) {
            }
        };
        let html_result = () => {
            seleku_element();
            let id_of_parent = [];
            html.forEach(_el => (_el?.id && _el?.element) ? id_of_parent.push({ obj_id: _el.id, obj: _el.element }) : "");
            html.forEach((_el, index) => {
                id_of_parent.forEach(el => {
                    if (el?.obj_id === _el?.parentId && _el?.element)
                        el?.obj.appendChild(_el?.element);
                    else if (el?.obj_id === _el?.parentId && _el?.text) {
                        el.obj.textContent = _el?.text;
                        html[index] = "";
                    }
                });
            });
            let components_child = [];
            html.forEach((el) => {
                if (el.parentId === null || el.parentId === 0) {
                    document.body.appendChild(el.element);
                    components_child.push(el.element);
                }
            });
            return components_child;
        };
        return html_result();
    }
    create(element) {
        this.element = element;
        if (document.head.querySelector("style") instanceof HTMLStyleElement) {
            document.head.querySelector("style").textContent += this.styles;
        }
        else {
            document.head.appendChild(this.Css);
        }
        this.Html.forEach((elements) => {
            this.appendChild(elements);
        });
    }
}
let registeryComponents = (args, class_define) => {
    args.forEach(e => {
        customElements.define(e.name, class_define);
    });
};
let Render = (args, parent) => {
    if (parent)
        args.forEach(e => {
            let a = document.createElement(e.name);
            if (e.css || e.js)
                a.styles = e.css;
            a.script = e.js;
            a.create(e.element);
            parent.innerHTML += a.innerHTML;
        });
    else
        args.forEach(e => {
            let a = document.createElement(e.name);
            if (e.css || e.js)
                a.styles = e.css;
            a.script = e.js;
            a.create(e.element);
            document.body.appendChild(a);
        });
};
