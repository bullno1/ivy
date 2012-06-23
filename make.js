var fs = require("fs"),
    marked = require("marked"),
    Mustache = require("mustache"),
    dox = require("dox"),
    ducks = require("./ducks");

/* 
  Builds documentation.
  - index.html -- from readme.markdown
  - api.html -- from dox output
  
*/

// Markdown rendering options
marked.setOptions({
  gfm: false,
  pedantic: false,
  sanitize: false
});

// Generate index.html:
fs.readFile("readme.markdown", function (err, readme) {
  if (err) throw err;
  
  var data = {
    readme: marked(readme.toString())
  };
  
  renderTemplate("templates/index.html", 'index.html', data);
});

// Generate api.html:
fs.readFile("ivy.js", function (err, jsSrc) {
  
  var functions = ducks.parseComments(jsSrc.toString());
  for (var i=0; i < functions.length; i++){
    functions[i].commentHtml = marked(functions[i].comment);
  }
  
  renderTemplate("templates/api.html", 'api.html', {functions: functions});
});

/**
 *  Renders markdown templates to the outputPath path with the given data, and
 *  optional partials.
 */
function renderTemplate(templatePath, outputPath, data, partials){
  fs.readFile(templatePath, function(err, template){
    if (err) throw err;
    
    var html = Mustache.to_html(template.toString(), data, partials);
    fs.writeFile(outputPath, html, function(err){
      if (err) throw err;
    });
  });
}