---
layout: post
title: Spring Boot Server as a Groovy script. 
description: How to easily create and run Spring Boot Server as a groovy script.
tags: groovy spring-boot cheat-sheet microservices
---

With this post I am going to start series of post related with my **[Cheat Sheet]({{ site.baseurl }}/tag/cheat-sheet/)**. Here is an example of simple [Goovy](http://groovy-lang.org) script which initializes and runs [Spring Boot](https://projects.spring.io/spring-boot/) server.

Sometimes when I am working with my new POC project, e.g. JavaScript UI app, I need simple and lightweight REST server which I could quickly modify. I wrote this simple Groovy script for that purpose.

[Simple REST server (Spring Boot, Groovy)](https://gist.github.com/alex-bezverkhniy/8aa6086370c60298c0183b1668fb9ec8)
```groovy
@Grab('org.springframework.boot:spring-boot-starter-web:1.1.7.RELEASE')
@Grab('org.springframework.boot:spring-boot-starter-actuator:1.1.7.RELEASE')

import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;
import org.springframework.stereotype.*;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
/**
GET     /todos/    Reads all tasks.
POST    /todos/    Creates a new task.
GET     /todo/:id  Reads a task.
PUT     /todo/:id  Updates a task.
DELETE  /todo/:id  Destroys a task.
**/
@Controller
@RequestMapping(value="/api/todos")
@EnableAutoConfiguration
public class TodosController  {
    private static final Logger logger = LoggerFactory.getLogger(TodosController.class)

    private dataTable = [[
      "id": 1,
      "title": "Learn Groovy",
      "completed": false
    ],
    [
      "id": 2,
      "title": "Learn ES6",
      "completed": false
    ]]

    @RequestMapping(value="/", method=RequestMethod.GET)
    @ResponseBody
    Map getAllTasks() {
        logger.info("Get all todos")
        return [
            "total": dataTable.size(),
            "page": 1,
            "perPage": 10,
            "todos": dataTable]
    }

    @RequestMapping(value="/", method=RequestMethod.POST)
    @ResponseBody
    Integer addTask(@RequestBody Map todo) {
        logger.info("Add new todo: ${todo}")
        todo.id = dataTable.size() + 1
        dataTable.push(todo)
        return todo.id
    }

    @RequestMapping(value="/{todoId}", method=RequestMethod.GET)
    @ResponseBody
    Map getTask(@PathVariable("todoId")Integer todoId) {
        logger.info("Get todo: ${todoId}")
        return dataTable.get(todoId - 1)
    }

    @RequestMapping(value="/{todoId}", method=RequestMethod.PUT)
    @ResponseBody
    Map updateTask(@PathVariable("todoId")Integer todoId, @RequestBody Map todo) {
        logger.info("Update todo: ${todoId} with: ${todo}")
        if (dataTable.get(todoId - 1)) {
            todo.id = todoId
            dataTable.set(todoId - 1, todo)
        }
        return todo
    }

    @RequestMapping(value="/{todoId}", method=RequestMethod.DELETE)
    @ResponseBody
    Map removeTask(@PathVariable("todoId")Integer todoId) {
        println("Delete todo: ${todoId}")
        if (dataTable.get(todoId - 1)) {
            return dataTable.remove(todoId - 1)
        }
        return false
    }


    public static void main(String[] args) throws Exception {
        SpringApplication.run(TodosController.class, args);
    }
}
```

## Short explanation

1) Load required dependencies from maven repository.

{:.nolineno}
```groovy 
@Grab('org.springframework.boot:spring-boot-starter-web:1.1.7.RELEASE')
@Grab('org.springframework.boot:spring-boot-starter-actuator:1.1.7.RELEASE')
```
2) Define class/controller/main app in one class. As you see I put `RequestMapping` to set base path, you can easily change it by replacing `/api/todos`.

{:.nolineno}
```groovy
@Controller
@RequestMapping(value="/api/todos")
@EnableAutoConfiguration
public class TodosController  {
    ...
``` 
3) As a Data Storage I use [List](https://docs.oracle.com/javase/8/docs/api/java/util/List.html) of [Map](https://docs.oracle.com/javase/8/docs/api/java/util/Map.html)s which I keep in memory. Groovy allows us define _Map_ by using simple syntax.

{:.nolineno}
```groovy
private dataTable = [[
    "id": 1,
    "title": "Learn Groovy",
    "completed": false
],
[
    "id": 2,
    "title": "Learn ES6",
    "completed": false
]]
```    
4) From line 34 to 80 you can find implementation of [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) methods.

## Run and Test
To run this code use next command

{:.nolineno}
```ssh
groovy rest-server.groovy
```

Here is a simple curl based tests:

### Create new task
{:.nolineno}
```ssh
curl -X POST 'http://localhost:8080/api/todos/' \
-d '{"id":3,"title":"Learn Spring Boot","completed":false}' \
-H "Content-Type: application/json"
```

### Update task by ID
{:.nolineno}
```ssh
curl -X PUT 'http://localhost:8080/api/todos/3' \
-d '{"id":3,"title":"Learn Spring Boot","completed":true}' \
-H "Content-Type: application/json"
```

### Get all tasks:
{:.nolineno}
```ssh
curl -X GET 'http://localhost:8080/api/todos/'
```

### Get task by ID
{:.nolineno}
```ssh
curl -X GET 'http://localhost:8080/api/todos/1'
```

### Delete task by ID
{:.nolineno}
```ssh
curl -X DELETE 'http://localhost:8080/api/todos/1'
```

## Instead of conclusion
Need to add new path? Just add new method with @RequestMapping and have fun.
Have question? Welcome to ask me in comments!