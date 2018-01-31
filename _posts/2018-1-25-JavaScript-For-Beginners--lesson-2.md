---
layout: post
title: Javascript For Beginners. Lesson 2 - Common programing concepts. 
description: First post about blog purpose
tags: javascript beginners
---

In this lesson I am going to explain basic common concepts of programming. So I will try to answer questions: What compiler/interpreter is? What source code is? Basic elements of your program. etc

### [Speak on the same language with your computer](#speak_same_lang)

As you probably know we could not speak with our computer using human language (excluding cases when we use special software). Sure we cans speak but it will look silly and unproductive. That is why we need something to translate human language to language of zeros and ones - [Binary code](https://en.wikipedia.org/wiki/Binary_code).
![compiler/interpreter]({{ site.baseurl }}/images/javascript-posts/basics-compiler.png)

We can split programming languages in to two big groups [Scripting languages](https://en.wikipedia.org/wiki/Scripting_language) and [Compiled languages](https://en.wikipedia.org/wiki/Compiled_language). In several words: 
 - **Scripting language** has only [Interpreter](https://en.wikipedia.org/wiki/Interpreter_(computing)) which directly translate commands from source code into [Machine code](https://en.wikipedia.org/wiki/Machine_code) which is native language of CPU of your Computer.
 - **Compiled languages** has _Compiler_ which convert you _source code_ into [bytecode](https://en.wikipedia.org/wiki/Byte_code) and [p-code](https://en.wikipedia.org/wiki/Byte_code) (It is something in the middle of _source code_ and _Machine code_) and _Interpreter_ which translate bytecode into [Machine code] simply speaking into your program itself.
 Both groups has advantages and disadvantages but we will not speak about it in this lesson.

### [What source code is](#what_source_code_is)

In several words _Source Code_ is collection of commands or even instructions written in human-readable programming language, which usually looks like a plain text. I case of _JavaScript_ we will call it a *script*.

Here is an example of **JavaScript** _code_ which just print greeting message.
<p data-height="118" data-theme-id="light" data-slug-hash="aEeQPV" data-default-tab="js,result" data-user="alex-bezverkhniy" data-embed-version="2" data-pen-title="tiny js" class="codepen">See the Pen <a href="https://codepen.io/alex-bezverkhniy/pen/aEeQPV/">tiny js</a> by Alexander Bezverkhniy (<a href="https://codepen.io/alex-bezverkhniy">@alex-bezverkhniy</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
In my further lessons I will explain meaning of `document` and `write(...)`, so far you need to remember that we use it for output something on screen.

### [Syntax and Basics of JavaScript](#basic_elem_prog)
[Syntax](https://en.wikipedia.org/wiki/JavaScript_syntax) of **JavaScript** and any other programming languages is the set of rules that define a correctly structured program. In other words it is like grammar for human language. We have to fallow these rule to make our program (or source code) readable for _interpreter_. We could not say or write to _interpreter_ "let's write 'Hi' on the screen" it does not understand us. 

Lets start from the practical example:
<p data-height="265" data-theme-id="light" data-slug-hash="eyqQMB" data-default-tab="js,result" data-user="alex-bezverkhniy" data-embed-version="2" data-pen-title="eyqQMB" class="codepen">See the Pen <a href="https://codepen.io/alex-bezverkhniy/pen/eyqQMB/">eyqQMB</a> by Alexander Bezverkhniy (<a href="https://codepen.io/alex-bezverkhniy">@alex-bezverkhniy</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

{:.info} 
Tab _JS_ - JavaScript code. Tab _Result_ - output of this script.
This script is your first "[Hello World program](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program)" ;-)
You can edit this code by clicking on "edit on [codepen](https://codepen.io)". in right tom corner.

Here is code explanation (by lines):

1. Creates variable with name `myVariable` and set value `'Hello World!'`
2. Uses method `write` of object `document` for writing value of variable onto document.

If you click on _Result_ tab you could see result of this program. 

Now let's dive into theoretical part of JS.

#### [Reserved Words or Keywords](#reserved_words)
All programming languages have [Keywords](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Keywords) it is **Reserved Words** for special language purpose. We ca consider these words as special command. You can find full list of keywords [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Keywords).

For example keyword `var`, from our previous example, defines variable. 

#### Variables
Important part of all programming languages is [Variables](https://en.wikipedia.org/wiki/Variable_(computer_science)). In several words, it is storage location in memory with specific name. In general _Variables_ works like a big catalog-cabinet where each box has _name_ and you can easily put and get values using that _name_.

![old fashion cabinet]({{ site.baseurl }}/images/javascript-posts/erol-ahmed-460277.jpg)
Photo by [Erol Ahmed](https://unsplash.com/photos/Y3KEBQlB1Zk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com)

Here is examples how to declare variable:
```javascript
var myFirstVariable;
```
To set or give a value to variable we use special operator `=`.
```javascript
var myVariable = 'Hello World!';
```

{:.info}
 A semicolon at the end of a line indicates where a statement ends; it is only absolutely required when you need to separate statements on a single line.

 {:.warning}
 JavaScript is case sensitive — `myVariable` is a different variable to `myvariable`. If you are getting problems in your code, check the casing!

You can use any name for your variable by here is [same restrictions](http://www.codelifter.com/main/tips/tip_020.shtml). You can check variable name [here](https://mothereff.in/js-variables).

##### Now time for practice!
Clink on to ![edit on codepen]({{ site.baseurl }}/images/javascript-posts/edit-on-codepen.png){:style="width:100px"}