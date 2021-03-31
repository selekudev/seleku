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
            console.log(match_of_html);
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
    html.forEach((el) => {
        if (el.parentId === null || el.parentId === 0) {
            document.body.appendChild(el.element);
        }
    });
};
html_result();
