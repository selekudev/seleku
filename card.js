let components_card = [{
  name: "seleku-card",
  element: [{
    tagName: "h1",
    id: "2c6b1f61",
    parentId: 0,
    attr: "",
  }, {
    parentElement: "h1",
    id: "1964b51f",
    text: " {namaku} ",
    parentId: "2c6b1f61",
  }, {
    id: "d24d0598",
    text: " #html",
    parentId: 0,
  }, ],
  css: ` h1{ color: red; font-family: sans-serif; }  `
}];


class SelekuComponents_components_card extends SelekuComponents {
  constructor() {
    super();
  }
}

registeryComponents(components_card, SelekuComponents_components_card);
Render(components_card, document.querySelector("body"));




let namaku = "budiman";