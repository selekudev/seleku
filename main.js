class $Reactivity {
  constructor($args, $event = () => {}) {
    this._main = $args;
    this._event = $event;
  }
  setToGlobal(_main) {
    for (let _x in _main) {
      try {
        eval(`${_x} = ${_main[_x]}`);
      } catch (err) {
        console.warn("can't to set from object reactive to global");
      }
    }
  }
  setReactivity(object, key) {
    let _data = object[key];
    let _event = this._event;
    let setToGlobal = this.setToGlobal;
    Object.defineProperty(object, key, {
      get() {
        return _data;
      },
      set($fn) {
        _event(this);
        try {
          _data = $fn();
        } catch (err) {
          _data = $fn;
        }
        setToGlobal(object);
      }
    });
  }
  init() {
    for (let _x in this._main) {
      try {
        eval(`this._main[_x] = ${_x}`);
      } catch (err) {
        console.warn("the global variabel " + _x + " is not found ");
      }
      this.setReactivity(this._main, _x);
    }
    return this._main;
  }
}
let $Reactive = (args, event) => {
  contexts = {
    ...contexts,
    ...new $Reactivity(args, event).init()
  };
};

let components_main = [{
  name: "seleku-main",
  element: [{
    tagName: "div",
    id: "443a61d8",
    parentId: 0,
    attr: "class=\"card\" ",
  }, {
    parentElement: "div",
    tagName: "b",
    id: "0a2827e9",
    parentId: "443a61d8",
    attr: "",
  }, {
    parentElement: "b",
    id: "3fa4a69e",
    text: "Hallo ",
    parentId: "0a2827e9",
  }, {
    parentElement: "b",
    tagName: "p",
    id: "6c7c6b9f",
    parentId: "0a2827e9",
    attr: "",
  }, {
    parentElement: "p",
    id: "4fe31ceb",
    text: " {namaku} ",
    parentId: "6c7c6b9f",
  }, {
    parentElement: "div",
    tagName: "div",
    id: "a9c7d68b",
    parentId: "443a61d8",
    attr: "class=\"card-input\" ",
  }, {
    parentElement: "div",
    tagName: "input",
    id: "1677584b",
    parentId: "a9c7d68b",
    attr: "type=\"text\" this:bind={namaku} name=\"\" ",
  }, {
    id: "63170182",
    text: " #html",
    parentId: 0,
  }, ],
  css: ` .card{ width: 300px; height: 200px; background: white; box-shadow: 0px 2px 20px rgba(0,0,0,0.1); border-radius: 10px; position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; display: flex; justify-content: center; align-items: center; flex-direction: column; } .card b{ width: 80%; font-size: 15px; padding: 10px; box-sizing: border-box; font-family: sans-serif; text-transform: uppercase; } .card b p{ font-weight: 500; font-size: 12px; text-transform: lowercase; color: rgba(20,20,20.0.25); } .card .card-input{ width: 100%; padding: 20px 0px; display: flex; justify-content: center; align-items: center; flex-wrap: wrap; } .card .card-input input{ width: 80%; outline: none; background: rgb(250,250,255); border-radius: 10px; border: none; padding: 10px 20px; font-size: 12px; box-sizing: border-box; font-family: sans-serif; } `
}];

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
        } else {
          let attribute = e?.replace?.("=", "~@")?.split("~@");
          for (let x = 0; x < attribute?.length - 1; x++) {
            attribute_object.push({
              name: attribute[x],
              value: (e => {
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
      } catch (err) {}
    };
    let html_result = () => {
      seleku_element();
      let id_of_parent = [];
      html.forEach(_el => (_el?.id && _el?.element) ? id_of_parent.push({
        obj_id: _el.id,
        obj: _el.element
      }) : "");
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
    } else {
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

class SelekuComponents_components_main extends SelekuComponents {
  constructor() {
    super();
  }
}

registeryComponents(components_main, SelekuComponents_components_main);
Render(components_main, document.querySelector("#app"));

let Joss_utility_class = [];
let oneProps = {
  "dbs-": {
    "box-shadow": {
      value: "0px 2px 5px rgba(0,0,0,$)",
      type: ""
    }
  },
  "c-": {
    "color": {
      value: null,
      type: ""
    }
  },
  "ffs-": {
    "font-family": "sans-serif"
  },
  "bottom-": {
    "bottom": {
      value: null,
      type: ""
    }
  },
  "top-": {
    "top": {
      value: null,
      type: ""
    }
  },
  "left-": {
    "left": {
      value: null,
      type: ""
    }
  },
  "right-": {
    "right": {
      value: null,
      type: ""
    }
  },
  "cur-": {
    "cursor": {
      value: null,
      type: ""
    }
  },
  "br-": {
    "border": {
      value: null,
      type: ""
    }
  },
  "pos-": {
    "position": {
      value: null,
      type: ""
    }
  },
  "pad-": {
    "padding": {
      value: null,
      type: ""
    }
  },
  "m-": {
    "margin": {
      value: null,
      type: ""
    }
  },
  "t-": {
    "top": {
      value: null,
      type: ""
    }
  },
  "bg-": {
    "background": {
      value: null,
      type: ""
    }
  },
  "d-": {
    "display": {
      value: null,
      type: ""
    }
  },
  "w-": {
    "width": {
      value: null,
      type: ""
    }
  },
  "h-": {
    "height": {
      value: null,
      type: ""
    }
  },
  "o-": {
    "opacity": {
      value: null,
      type: ""
    }
  },
  "f-": {
    "filter": {
      value: null,
      type: ""
    }
  },

  "t-": {
    "transform": {
      value: null,
      type: ""
    }
  },
}

let twoProps = {
  "p-t-": {
    "padding-top": {
      value: null,
      type: ""
    },
  },
  "br-r-": {
    "border-radius": {
      value: null,
      type: ""
    },
  },
  "p-b-": {
    "padding-bottom": {
      value: null,
      type: ""
    },
  },
  "f-s-": {
    "font-size": {
      value: null,
      type: ""
    }
  },
  "bg-c-": {
    "background-color": {
      value: null,
      type: ""
    }
  },
  "bg-i-": {
    "background-image": {
      value: 'url("$")',
      type: ""
    }
  },
  "o-l-": {
    "outline": {
      value: null,
      type: ""
    }
  },
  "t-t-": {
    "text-transform": {
      value: null,
      type: ""
    }
  },
  "f-w-": {
    "font-weight": {
      value: null,
      type: ""
    }
  },
  "f-f-": {
    "font-family": {
      value: null,
      type: ""
    }
  },
  "l-s-": {
    "letter-spacing": {
      value: null,
      type: ""
    }
  },
  "b-s-": {
    "box-shadow": {
      value: null,
      type: ""
    }
  },
  "bg-g-": {
    "background": {
      value: "linear-gradient(to bottom, $)",
      type: ""
    }
  },
  "j-c-": {
    "justify-content": {
      value: null,
      type: ""
    }
  },
  "flex-d-": {
    "flex-direction": {
      value: null,
      type: ""
    }
  },
  "flex-w-": {
    "flex-wrap": {
      value: null,
      type: ""
    }
  },
  "align-i-": {
    "align-items": {
      value: null,
      type: ""
    }
  }
}

let CREATE_UUID = () => {
  let dt = new Date().getTime();
  let uuid = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

class joss_overload {

  my_class = "";
  my_element;

  constructor(obj) {
    if (obj.class) {
      this.my_class = obj.class;
      this.my_element = obj.element;
    }
  }

  oneClassDirection() {

    let Class = this.my_class;
    let Allclass = [];
    let index = -1;
    let g = "";
    let name = "";
    let property = [];


    for (let x in oneProps) {
      Allclass.push(x);
    }

    Allclass.forEach((i) => {
      if (Class.match(i)) {

        const class_name = Class;

        let result = Class.split(/-/igm).filter((j) => {
          return i.split(/-/igm).indexOf(j) !== -1;
        });

        if (result.length !== 0 && result.length === 1) {
          for (let x in oneProps[i]) {

            index++;

            property.push(x + ": ");

            if (typeof oneProps[i][x] === "object") {
              if (Class.split(/-/igm)[Class.split(/-/igm).length - 1].match(/\(.*?\)/) && oneProps[i][x].value === null) {
                oneProps[i][x].value = Class.split(/-/igm)[Class.split(/-/igm).length - 1].replace(/\(/igm, "").replace(/\)/igm, "");
                property[index] += oneProps[i][x].value + oneProps[i][x].type + ";";
                Class = Class.replace(Class.split(/-/igm)[Class.split(/-/igm).length - 1], CREATE_UUID());
              } else if (oneProps[i][x].value === null) {
                oneProps[i][x].value = Class.split(/-/igm)[Class.split(/-/igm).length - 1];
                property[index] += oneProps[i][x].value + oneProps[i][x].type + ";";
                Class = Class.replace(Class.split(/-/igm)[Class.split(/-/igm).length - 1], CREATE_UUID());
              } else if (oneProps[i][x].value.match(/\$/igm)) {
                oneProps[i][x].value = oneProps[i][x].value.replace(/\$/igm, Class.split(/-/igm)[Class.split(/-/igm).length - 1]);
                property[index] += oneProps[i][x].value + oneProps[i][x].type + ";";
                Class = Class.replace(Class.split(/-/igm)[Class.split(/-/igm).length - 1], CREATE_UUID());
              } else {
                oneProps[i][x].value = oneProps[i][x].value.replace(/\$/igm, Class.split(/-/igm)[Class.split(/-/igm).length - 1]);
                property[index] += oneProps[i][x].value + oneProps[i][x].type + ";";
                Class = Class.replace(Class.split(/-/igm)[Class.split(/-/igm).length - 1], CREATE_UUID());
              }

              // di sini woi di benerin

            } else {
              property[index] += oneProps[i][x] + ";";
            }
            g = `.${Class}{${property.join(" ")}}`;
            name = class_name;

            this.my_element.className = this.my_element.className.replace(class_name, Class);
            if (typeof oneProps[i][x] === "object") {
              oneProps[i][x].value = null;
            }
          }
        }

      }
    });

    for (let x in Joss_utility_class) {
      if (name.length > 0) {
        if (Joss_utility_class[x].Name === name) {

          // do something
          this.my_element.className = this.my_element.className.replace(Class, Joss_utility_class[x].Class);
          return "";

        }
      }
    }

    if (g.length > 0 && name.length > 0) {
      Joss_utility_class.push({
        Class: Class,
        Name: name,
        glob: g
      });
    }

    return g;

  }

  twoClassDirection() {

    let a = this.my_class;
    let Allclass = [];
    let index = -1;
    let property = [];
    let g = "";
    let name = "";

    for (let x in twoProps) {
      Allclass.push(x);
    }



    Allclass.forEach((i) => {

      if (a.match(i)) {

        const class_name = a;

        let result = a.split(/-/igm).filter((j) => {
          return i.split(/-/igm).indexOf(j) !== -1;
        });

        if (result.length === 2) {
          for (let x in twoProps[i]) {
            if (twoProps[i].hasOwnProperty(x)) {
              index++;

              property.push(x + ": ");

              if (typeof twoProps[i][x] === "object") {
                if (a.split(/-/igm)[a.split(/-/igm).length - 1].match(/\(.*?\)/) && twoProps[i][x].value === null) {
                  twoProps[i][x].value = a.split(/-/igm)[a.split(/-/igm).length - 1].replace(/^\(/igm, "").replace(/\)$/igm, "");
                  property[index] += twoProps[i][x].value + twoProps[i][x].type + ";";
                  a = a.replace(a.split(/-/igm)[a.split(/-/igm).length - 1], CREATE_UUID());
                } else if (twoProps[i][x].value === null) {
                  twoProps[i][x].value = a.split(/-/igm)[a.split(/-/igm).length - 1];
                  property[index] += twoProps[i][x].value + twoProps[i][x].type + ";";
                  a = a.replace(a.split(/-/igm)[a.split(/-/igm).length - 1], CREATE_UUID());
                } else if (twoProps[i][x].value.match(/\$/igm)) {
                  twoProps[i][x].value = twoProps[i][x].value.replace(/\$/igm, a.split(/-/igm)[a.split(/-/igm).length - 1]);
                  property[index] += twoProps[i][x].value + twoProps[i][x].type + ";";
                  a = a.replace(a.split(/-/igm)[a.split(/-/igm).length - 1], CREATE_UUID());
                } else {
                  twoProps[i][x].value = twoProps[i][x].value.replace(/\$/igm, a.split(/-/igm)[a.split(/-/igm).length - 1]);
                  property[index] += twoProps[i][x].value + twoProps[i][x].type + ";";
                  a = a.replace(a.split(/-/igm)[a.split(/-/igm).length - 1], CREATE_UUID());
                }

              } else {
                property[index] += twoProps[i][x] + ";";
              }
              g = `.${a}{${property.join(" ")}}`;
              name = class_name;
              this.my_element.className = this.my_element.className.replace(class_name, a);
              twoProps[i][x].value = null
            }
          }
        }
      }
    });

    for (let x in Joss_utility_class) {
      if (name.length > 0) {
        if (Joss_utility_class[x].Name === name) {

          // do something
          this.my_element.className = this.my_element.className.replace(a, Joss_utility_class[x].Class);
          return "";

        }
      }
    }

    if (g.length > 0 && name.length > 0) {
      Joss_utility_class.push({
        Class: a,
        Name: name,
        glob: g
      });
    }

    return g;
  }

  update() {
    let style = document.createElement("style");
    let all = [];
    Joss_utility_class.forEach((i) => {
      all.push(i.glob);
    });
    style.textContent = all.join(" ")

    if (document.querySelector("style")) {
      document.querySelector("style").textContent += all.join(" ");
      return;
    } else {
      document.head.appendChild(style);
      return;
    }
  }
}
let JOSS = joss_overload;
let body = document.body;
let child;
let allElement = [];
let allElementAttribute = [];
let allElements = [];
let {
  ["log"]: _c, ["error"]: _e
} = console;
let Name;

let selekDOM = (element) => {

  if (body.children.length !== 0 && !element) {

    child = body.children;

  } else {
    child = element.children;
  }


  if (child !== undefined) {

    for (let attr of child) {
      if (attr.getAttribute("class")) {
        let allOfLongProperty = attr.getAttribute("class").match(/\(.*?\)/);
        let attrOfElement;
        allOfLongProperty?.forEach((i, index) => {
          attrOfElement = attr.getAttribute("class").replace(/\(.*?\)/, "$" + index).replace(/\s+/igm, "~");
          attrOfElement = attrOfElement.replace("$" + index, i).split("~");
        });

        if (attrOfElement === void 0) {
          attrOfElement = attr.getAttribute("class").split(" ");
        }


        for (let attrOfElementStyle of attrOfElement) {
          if (attrOfElementStyle.split(/-/igm).length === 3) {
            new JOSS({
              class: attrOfElementStyle,
              element: attr
            }).twoClassDirection()
          } else if (attrOfElementStyle.split(/-/igm).length === 2) {
            new JOSS({
              class: attrOfElementStyle,
              element: attr
            }).oneClassDirection()
          }
        }


      }
    }

    for (let el of child) {

      if (el.toString() === document.createElement("script").toString()) {
        //do something
      } else {
        let content = el.innerHTML;
        let theMain = content.replace(/{/igm, " {").replace(/}/igm, "} ").split(" ");
        let mainDOMLocation = [];

        for (let x in theMain) {
          if (theMain[x].match(/{/) || theMain[x].match(/}/)) {
            mainDOMLocation.push({
              location: x
            });
          }
        }

        let arrayOfContext = content.replace(/\s+/igm, "").replace(/{/igm, "~").replace(/}/igm, "~").split("~");
        let context = [];

        allElements.push(el);

        try {
          context = content.replace(/\<(.*)\>\w*/igm, "").match(/\{*[^{]*[}]/igm);
          if (context === null) {

            if (el.attributes.length !== 0) {
              allElement.push({
                element: el,
                attr: el.attributes
              });
              selekDOM(el);
            } else {
              selekDOM(el);
            }

          }

          if (context.length !== 0) {
            context.forEach((cont) => {
              allElement.push({
                element: el,
                bindTo: cont.replace(/{/igm, "").replace(/}/igm, "")
              });
              try {
                eval(cont.replace(/{/igm, "").replace(/}/igm, ""));

                el.innerHTML = el.innerHTML.replace(cont, eval(cont.replace(/{/igm, "").replace(/}/igm, "")));

              } catch (err) {
                if (err) {
                  _e(`the ${cont.replace(/{/igm,"").replace(/}/igm,"")} is not define`);
                  el.innerHTML = el.innerHTML.replace(cont, `<b class="danger"> ${cont.replace(/{/igm,"").replace(/}/igm,"")} </b>`)
                }
              }
            });
          }
          if (el.children.length !== 0) {
            selekDOM(el);
          }


        } catch (err) {
          if (!err) {
            context = content.match(/\{*[^{]*[}]/igm);
          }
        }
      }

    }
  }
}

let reactive = () => {

  window.contexts = {
    main: "main"
  };

  try {

    allElementAttribute.forEach((_i) => {
      if (_i.attr) {
        contexts[_i.attr] = eval(_i.attr);
      }
      if (_i.bindTo) {
        contexts[_i.bindTo] = eval(_i.bindTo);
      }
    });

    function reactivity(object, key) {
      let val = object[key];

      Object.defineProperty(object, key, {
        get() {
          return val;
        },
        set(args) {
          val = args;
          notify(key)
        }
      });
    }

    function setReactivity(object) {
      for (let obj in object) {
        if (object.hasOwnProperty(obj)) {
          reactivity(object, obj);
        }
      }
    }

    function notify(name) {

      allElements.forEach((_i) => {
        try {
          if (_i.value === "" || _i.value !== "" && typeof _i.value === "string") {
            _i.value = eval(_i.getAttribute("this:bind").replace(/{/igm, "").replace(/}/igm, "")).toString();
            _i.oninput = () => {
              allElementAttribute.forEach((_j) => {
                name = _i.getAttribute("this:bind").replace(/{/igm, "").replace(/}/igm, "");
                if (name == _j.bindTo) {
                  contexts[name] = `${_i.value}`;
                  eval(`${name} = "${_i.value}"`);
                  _j.element.innerHTML = eval(name);
                }

              });
            }

          } else {
            allElementAttribute.forEach((_j) => {
              try {
                if (name == _j.bindTo) {
                  eval(`${name} = ${contexts[name]}`);
                  _j.element.innerHTML = eval(name);
                }
              } catch (err) {
                eval(`${name} = ${contexts[name]}`);
                _j.element.innerHTML = eval(name);
              }

            });
          }

        } catch (err) {
          allElementAttribute.forEach((_j) => {
            if (name === _j.attr) {
              let g = {
                ..._j.element.attributes
              };

              if (Name === undefined) {
                for (let x in g) {
                  if (g[x].value.match(/\{(.*?)\}/)) {

                    try {
                      if (g[x].name === "this:bind") {
                        return;
                      }
                      eval(`${name} = "${contexts[name]}"`);
                      _j.element.setAttribute(g[x].name, contexts[name]);
                      Name = g[x].name;
                    } catch (error) {
                      e(error)

                    }


                  }

                }
              } else {

                try {
                  eval(`${name} = "${contexts[name]}"`);
                  _j.element.setAttribute(Name, contexts[name]);

                } catch (error) {
                  e(error)
                }
              }
            }

            if (name == _j.bindTo) {

              try {
                try {
                  eval(`${name} = ${contexts[name]}`);
                } catch (err) {
                  eval(`${name} = "${contexts[name]}"`);
                };

                _j.element.innerHTML = contexts[name];

              } catch (err) {
                return;

              }

            }

          });
        }
      });

    }

    setReactivity(contexts);
    contexts.main = contexts.main;


  } catch (err) {

  }
}

const binding = () => {
  allElement.forEach((element) => {
    if (element.attr) {
      for (let x in element.attr) {
        if (typeof element.attr[x] !== "function" && typeof element.attr[x] !== "number") {
          if (element.attr[x].value.match(/\{(.*?)\}/)) {
            allElementAttribute.push({
              element: element.element,
              attr: element.attr[x].value.replace(/{/igm, "").replace(/}/igm, "")
            });
          }

        }
      }
    } else {
      allElementAttribute.push({
        element: element.element,
        bindTo: element.bindTo
      });
    }

  });
}

window.onload = () => {
  selekDOM();
  binding();
  reactive();
  new JOSS({
    class: "",
    element: ""
  }).update();
}

let _nama = "Ari Susanto";