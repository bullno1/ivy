function bindHTML(html, obj){
  var el = toDom(html);
  Ivy.bindDom(el, obj);
  
  return el;
}

function toDom(html){
  var el = document.createElement('div');
  el.innerHTML = html;
  
  return el.firstChild;
}

describe('Value binding', function(){
  var snippet = '<input data-bind="value: x"/>';
  
  it('sets the value of an input', function(){
    var input = bindHTML(snippet, {x: 7});
    assert.equal(input.value, 7);
  });
  
  it('updates value when the attribute changes', function(){
    var x = Ivy.attr(7);
    var input = bindHTML(snippet, {x: x});
    x.set(10);
    
    assert.equal(input.value, 10);
  });
  
  it('updates attr when the value changes', function(){
    var x = Ivy.attr(7);
    var input = bindHTML(snippet, {x: x});
    
    input.value = 10;
    simulate(input, 'change');
    
    assert.equal(x.get(), 10);
  });
  
  it('does not sync the input until it blurs', function(){
    var x = Ivy.attr(7);
    var input = bindHTML(snippet, {x: x});
    
    document.body.appendChild(input);
    try {
      input.focus();
      x.set(5);
      assert.equal(input.value, 7);
      input.blur();
      assert.equal(input.value, 5);
    } finally {
      document.body.removeChild(input);
    }
  });
});

describe('Checked binding', function(){
  describe('With checkboxes', function(){
    var snippet = '<input type="checkbox" data-bind="checked: x" />';

    it('sets the state of a checkbox', function(){
      var input = bindHTML(snippet, {x: true});
      assert.isTrue(input.checked);
    });
    
    it('accepts truthy values', function(){
      var input = bindHTML(snippet, {x: 1});
      assert.isTrue(input.checked);
    });
    
    it('updates the state of a checkbox', function(){
      var x = Ivy.attr(false);
      var input = bindHTML(snippet, {x: x});
      x.set(true);
      assert.isTrue(input.checked);
    });
    
    it('updates the state of a attr', function(){
      var x = Ivy.attr(false);
      var input = bindHTML(snippet, {x: x});

      assert.isFalse(x.get());
      simulate(input, 'click');
      assert.isTrue(x.get());
    });
    
  });
  
  describe('With radio buttons', function(){
    var snippet = '<div>\
                    <input id="a" type="radio" data-bind="checked: x" name="r" value="a"/>\
                    <input id="b" type="radio" data-bind="checked: x" name="r" value="b"/>\
                  </div>';

    it('sets the state of a radio button', function(){
      var root = bindHTML(snippet, {x: 'a'});
      assert.isTrue(root.children[0].checked);
      assert.isFalse(root.children[1].checked);
    });
    
    it('updates the state of a radio button', function(){
      var x = Ivy.attr('a');
      var root = bindHTML(snippet, {x: x});
      x.set('b');
      
      assert.isFalse(root.children[0].checked);
      assert.isTrue(root.children[1].checked);
    });
    
    it('updates the state of a attr', function(){
      var x = Ivy.attr('a');
      var root = bindHTML(snippet, {x: x});
      var b = root.children[1];
      
      b.checked = true;
      simulate(b, 'click');
      assert.equal(x.get(), 'b');
    });    
  });
  
});

describe('Text binding', function(){
  var snippet = '<div data-bind="text: x"/>';
  
  it('sets the text of an element', function(){
    var el = bindHTML(snippet, {x: "Hello"});
    assert.equal(el.innerText || el.textContent, "Hello");
  });
  
  it('updates value when the attribute changes', function(){
    var x = Ivy.attr("Hello");
    var el = bindHTML(snippet, {x: x});
    x.set("Bye");
    
    assert.equal(el.innerText || el.textContent, "Bye");
  });
  
  it('only creates text nodes', function(){
    var el = bindHTML(snippet, {x: "<b>Hello</b>"});
    var children = el.children;
    var child;
    
    for(var i=0, len=children; i < len; i++){
      child = children[i];
      assert.equal(child.nodeType, document.TEXT_NODE);
    }
  });
});

describe('ClassName binding', function(){
  var snippet = '<div data-bind="class: x red blue"/>';
  
  it('sets the true className when true', function(){
    var el = bindHTML(snippet, {x: true});
    assert.equal(el.className, "red");
  });
  
  it('sets the false className when false', function(){
    var el = bindHTML(snippet, {x: false});
    assert.equal(el.className, "blue");
  });
  
  it('sets no className if false and no false className exists', function(){
    var el = bindHTML('<div data-bind="class: x red"/>', {x: false});
    assert.equal(el.className, "");
  });
  
  it('does not affect existing classes', function(){
    var el = bindHTML('<div class="orange" data-bind="class: x red"/>', {x: true});
    assert.equal(el.className, "orange red");
  });
  
  it('updates the className when the attribute changes', function(){
    var x  = Ivy.attr(true);
    var el = bindHTML(snippet, {x: x});
    x.set(false);
    
    assert.equal(el.className, "blue");
  });
  
  it('adds the className when initialized with just an attribute', function(){
    var x  = Ivy.attr("lemon");
    var el = bindHTML('<div class="orange" data-bind="class: x"/>', {x: x});
    
    assert.equal(el.className, "orange lemon");
  });
  
  it('updates the className when initialized with just an attribute', function(){
    var x  = Ivy.attr("lemon");
    var el = bindHTML('<div class="orange" data-bind="class: x"/>', {x: x});
    x.set("blue")
    
    assert.equal(el.className, "orange blue");
  });
});

describe('DOM Attribute binding', function(){
  var snippet = '<div data-bind="attr: x data-name"/>';
  
  it('sets the attribute', function(){
    var el = bindHTML(snippet, {x: "Marty"});
    assert.equal(el.getAttribute('data-name'), "Marty");
  });
  
  it('updates the attribute', function(){
    var x  = Ivy.attr("Marty");
    var el = bindHTML(snippet, {x: x});
    x.set("Doc");
    
    assert.equal(el.getAttribute('data-name'), "Doc");
  });
  
  it('handles boolean properties', function(){
    var el = bindHTML('<input data-bind="attr: x disabled">', {x: 1});

    assert.isTrue(el.disabled);
  });
});

describe('Focused binding', function(){
  var snippet = '<input data-bind="focus: x"/>';
  var el, x;

  beforeEach(function(){
    x = Ivy.attr();
    el = bindHTML(snippet, {x:x});
    document.body.appendChild(el);
  });

  afterEach(function(){
    document.body.removeChild(el);
  });

  it('focuses when set to true', function(done){
    Ivy.dom.on(el, 'focus', callback);
    x.set(true);

    function callback(){
      Ivy.dom.off(el, 'focus', callback);
      done();
    }
  });

  it('blurs when set to false', function(done){
    Ivy.dom.on(el, 'blur', callback);

    el.focus();
    x.set(false); // blur it

    function callback(){
      Ivy.dom.off(el, 'blur', callback);
      done();
    }
  });

  it('sets the attr to true when focused', function(){
    el.focus();
    assert.isTrue(x.get());
  });

  it('sets the attr to false when blurred', function(){
    el.focus(); el.blur(); // Force a blur event
    assert.isFalse(x.get());
  });

});

describe('Each binding', function(){
  var snippet = '<ul data-bind="each: x"><li/></ul>';
  
  it('is empty when the array is empty', function(){
    var el = bindHTML(snippet, {x: []});
    assert.equal(el.children.length, 0);
  });
  
  it('creates a child for each array item', function(){
    var el = bindHTML(snippet, {x: [1,2,3]});
    assert.equal(el.children.length, 3);
  });
  
  it('adds children when new items are added', function(){
    var x  = Ivy.array([1,2,3]);
    var el = bindHTML(snippet, {x: x});
    x.push(4);
    assert.equal(el.children.length, 4);
  });
  
  it('removes children when items are removed', function(){
    var x  = Ivy.array([1,2,3]);
    var el = bindHTML(snippet, {x: x});
    x.pop();
    assert.equal(el.children.length, 2);
  });
  
  it('sets the context of each item', function(){
    var x  = Ivy.array([{y:"a"}, {y:"b"}]);
    var el = bindHTML('<ul data-bind="each: x"><li data-bind="attr: y title"></li></ul>', {x: x});

    assert.equal(el.children[0].title, 'a');
    assert.equal(el.children[1].title, 'b');
  });
  
  it('handles multiple child nodes', function(){
    var x  = Ivy.array([1,2]);
    var el = bindHTML('<ul data-bind="each: x"><li/><li/></ul>', {x: x});
    x.push(1);
    
    assert.equal(el.children.length, 6);
  });
  
  it('optionally uses the node with referenced by the second parameter as the template', function(){
    var template = document.createElement('script');
    template.setAttribute('id', 'cake');
    template.setAttribute('type', 'text/html');
    template.innerText = '<div data-bind="attr: y title"/>';
    
    try {
      
      document.head.appendChild(template);
      
      var x  = Ivy.array([{y:"a"}, {y:"b"}]);
      var el = bindHTML('<div data-bind="each: x cake"></div>', {x: x});

      assert.equal(el.children[0].title, 'a');
      assert.equal(el.children[1].title, 'b');
      
    } finally {
      document.head.removeChild(template);
    }
  });
  
});

describe('With binding', function(){
  var snippet = '<div data-bind="with: x"><div data-bind="attr: y title"/></div>';
  it('sets the context for children', function(){
    var x  = Ivy.attr({y: 'Hello'});
    var el = bindHTML(snippet, {x: x});
    
    assert(el.children[0].title, "Hello");
  });
  
  it('updates the context of children', function(){
    var x  = Ivy.attr({y: 'Hello'});
    var el = bindHTML(snippet, {x: x});
    x.set({y: 'Bye'});
    
    assert.equal(el.children[0].title, "Bye");
  });
  
  it('optionally uses the node with referenced by the second parameter as the template', function(){
    var template = document.createElement('script');
    template.setAttribute('id', 'cake');
    template.setAttribute('type', 'text/html');
    template.innerText = '<div data-bind="attr: y title"/>';
    
    try {
      
      document.head.appendChild(template);
      
      var x  = {y: "Hello"};
      var el = bindHTML('<div data-bind="with: x cake"></div>', {x: x});

      assert.equal(el.children[0].title, "Hello");
      
    } finally {
      document.head.removeChild(template);
    }
  });
});

describe('Show binding', function(){
  var snippet = '<div data-bind="show: x"></div>';
  
  it('sets the visibility of the element', function(){
    var el = bindHTML(snippet, {x: false});
    
    assert.equal(el.style.display, "none");
  });
  
  it('updates the visibility of the element', function(){
    var x  = Ivy.attr(false);
    var el = bindHTML(snippet, {x: x});
    x.set(true);
    
    assert.equal(el.style.display, "");
  });
  
  it('retains the initial style of the element', function(){
    var x  = Ivy.attr(false);
    var el = bindHTML('<div style="display: inline" data-bind="show: x"></div>', {x: x});
    x.set(true);
    
    assert.equal(el.style.display, "inline");
  });
});

describe('Event binding', function(){
  var snippet = '<a data-bind="on: click x"></a>';
  
  it('calls the listener when the bound event fires', function(done){
    var el = bindHTML(snippet, {x: callback});
    simulate(el, 'click');
    
    function callback(){ done(); }
  });
  
  it('calls the listener with the current context as this', function(done){
    var obj   = {x: {}, y: callback};
    var el = bindHTML('<div data-bind="with: x"><a data-bind="on: click ../y"></a></div>', obj);
    simulate(el.children[0], 'click');
    
    function callback(){
      assert.equal(this, obj);
      done();
    }
  });
  
  it('calls the listener with the context of the bound function as the argument', function(done){
    var obj   = {x: {}, y: callback};
    var el = bindHTML('<div data-bind="with: x"><a data-bind="on: click ../y"></a></div>', obj);
    simulate(el.children[0], 'click');
    
    function callback(arg){
      assert.equal(arg, obj.x);
      done();
    }
  });
  
  it('does nothing when an unbound event fires', function(){
    var called = false;
    function callback(){ called = true; }
    var el = bindHTML(snippet, {x: callback});
    simulate(el, 'mouseover');
    
    assert.isFalse(called);
  });
  
});

describe('BindingRule', function(){
  describe('constructor', function(){
    it('returns a BindingRule', function(){
      var rule = new Ivy.BindingRule('a:',{});
      assert.instanceOf(rule, Ivy.BindingRule);
    });
    
    it('throws an error when malformed', function(){
      assert['throws'](function(){
        new Ivy.BindingRule('show x',{});
      });
    });
  });
  
  describe('#lookup', function(){
    it('returns the named variable from the context', function(){
      var context = {a: 1, b: 2};
      var rule    = new Ivy.BindingRule('a: x', context);
      
      assert.equal(rule.lookup('a'), 1);
    });
    
    it('returns the current context when path is ""', function(){
      var context = {a: 1, b: 2};
      var rule    = new Ivy.BindingRule('a:', context);
      
      assert.equal(rule.lookup(''), context);
    });
    
    it('returns the current context when path is "."', function(){
      var context = {a: 1, b: 2};
      var rule    = new Ivy.BindingRule('a:', context);
      
      assert.equal(rule.lookup('.'), context);
    });
    
    it('returns the parent context when path is ".."', function(){
      var parent = {a: 1, b: 2};
      var child  = {'..': parent};
      var rule   = new Ivy.BindingRule('a:', child);
      
      assert.equal(rule.lookup('../'), parent);
    });
    
    it('returns values from the parent context', function(){
      var parent = {a: 1, b: 2};
      var child  = {'..': parent};
      var rule   = new Ivy.BindingRule('a:', child);
      
      assert.equal(rule.lookup('../a'), 1);
    });
  });
  
});

describe("Exception Handling", function(){
  var snippet = '<input data-bind="value: x"></input>';
  function bindWithError(el, obj){
    try{
      Ivy.bindDom(el, obj);
    } catch (e) {
      return e;
    }
  }
  
  // Only raise the exception once here because exception handling
  // is relatively slow in JS, and we don't mutate the objects.
  var el = toDom(snippet);
  var error = bindWithError(el, {});
  
  describe("Re-raising exceptions", function(){
    it('annotates binding exceptions with the failing element', function(){
      assert.equal(error.element, el);
      assert.match(error.message, /while binding INPUT/i);
    });
  });
  
  describe("Decorating failed elements", function(){
    it('annotates the failing element', function(){
      assert.equal(el.getAttribute('data-ivy-error'), error.message);
    });
  });
});