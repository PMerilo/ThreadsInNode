
# FlashMessenger
A simple and lightweight flash-message module for Express and Twitter Bootstrap.

## Features
1. You can create Twitter Bootstrap alerts from server
2. Icon support
3. Multi-Alert support
4. Multi-Message support in one alert
5. Supports multiple redirects
6. Auto-rendering: No need to create a template var for a partial or block
7. FlashMessenger can be accessed from response object


# Install 
npm install flash-messenger --save

# Initialization
  ```javascript
    var FlashMessenger = require('flash-messenger');
    app.use(FlashMessenger.middleware);
  ```
  
# Setup !IMPORTANT
After installation you need to create a template partial file. For handlebars template engine you can use the code below.
If you want to write your own style make sure you are using the correct template vars. The most important is:
```javascript
flashMessenger.alertsBeforeFlush
```
This will return the stored alerts. The alerts stored in the session will be deleted. 

# Template 
The following exampe is written in [Handlebars](http://handlebarsjs.com/). Simply copy the code, create a partial and call it in your layout.hbs file. If you are using another template engine you need to translate the code into the syntax of your template engine.

```html
{{#each flashMessenger.alertsBeforeFlush}}
    <div class="alert alert-{{this.type}} {{#if this.canBeDismissed}}alert-dismissible{{/if}}">
        {{#if this.canBeDismissed}}
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
        {{/if}}
        <h4>
            {{#if this.titleIcon}}
                <i class="{{this.titleIcon}}"></i>
            {{/if}}
            {{this.title}}
        </h4>
        {{#if this.messages}}
            <ol>
                {{#each this.messages}}
                    <li>{{this}}</li>
                {{/each}}
            </ol>
        {{/if}}
    </div>
{{/each}}
```

# Usage
After initialization the property flashMessenger is accessable from the respone object:
 ```javascript
    app.get('/', req,res){
          //This creates an Bootstrap error alert     
          res.flashMessenger.error('Something went wrong.');
          res.render('path/to/your/template');
          //that's it. The rendering works automatically 
    }
 ```
 Note: Typically flash message module only supports redirects. In this one you do not need to make a redirect to use it. You can simply render it directly. Redirects are also supported. 
 
## More Actions
 
 ```javascript
    app.get('/', req,res){
          //This creates an Bootstrap success alert with the title: 'Yeah, you did it.'  
          var alert = res.flashMessenger.success('Yeah, you did it.');
          //Make the alert box dismissable
          alert.isDismissible = true;
          //set an font awesome icon
          alert.titleIcon: 'fa fa-thumbs-o-up'
          alert.addMessage('Now go to mainpage');
          alert.addMessage('Wash yourself');
          alert.addMessage('Go to bed');
          
          //This creates another Bootstrap alert with the type info and the title: 'Here comes another info'  
          var anotherAlert = res.flashMessenger.info('Here comes another info');
          res.flashMessenger.add(anotherAlert);
          
          res.render('path/to/your/template');
          //that's it. The rendering of the bootstrap alerts works automatically 
    }
 ```
 
# Template Vars

The following template vars can be used to customize the view if neccessary.
```javascript
1. array flashMessenger.alertsBeforeFlush (Array of alert objects, calling this alerts will be deleted from session)
2. string alert.type (danger, error, info, success)
3. bool alert.canBedismissed 
4. string alert.titleIcon (FontAwesome or glyphicon icon)
5. array alert.messages (strings within the alert box for detail information)
 ```
    




