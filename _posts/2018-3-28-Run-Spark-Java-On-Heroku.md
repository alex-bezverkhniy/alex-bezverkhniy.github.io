---
layout: post
title: Deploy and Run Spark(java) on Heroku.
description: The easiest way to run your REST API PoC on Heroku. 
tags: groovy spark cheat-sheet maven gradle microservices heroku
---

Couple days ago I build my PoC (Proof of Concept) project based on Spark (java) framework. It was REST API which I deployed and run on [Heroku](https://heroku.com/) cloud platform. The Dev process was really rapid and I am going to share my experience how to quickly create REST API and run it on Heroku. As an example of I am going to implement simple temperature converter.

![Spark+Heroku]({{ site.baseurl }}/images/spark-heroku.png)

## [Requirements or tools](#requirements)
- [Java 7/8](https://java.com/en/download/). I tested my app on Java 8 but I think it should work on Java 7.
- [Groovy](http://groovy-lang.org/download.html). I use [Groovy 2.5.3](https://dl.bintray.com/groovy/maven/apache-groovy-binary-2.5.0-beta-3.zip).
- [Maven](https://maven.apache.org/). I use _Maven_ only for letting know Heroku that I deploy Java Project
- [Spark](http://sparkjava.com/). Spark Framework is a simple and expressive Java/Kotlin web framework DSL built for rapid development. 

## [Project structure](#project-structure)
The project structure is really simple. There are simple groovy script, pom.xml and Procfile.

```
├── Procfile
├── README.md
├── converter-api.groovy
└── pom.xml

```
As I mentioned I use Maven only for Heroky deployment process see details [here](https://devcenter.heroku.com/articles/getting-started-with-java#introduction). All logic located in `converter-api.groovy`. 

## [Spark framework](#spark-framework)
As I mentioned [Spark framework](http://sparkjava.com/) is a simple Java web framework, DSL based. 

### [Spark intro](#spark-intro)
Spark provide declarative and expressive syntax it is really simple framework. You can find detailed documentation [here](http://sparkjava.com/documentation#getting-started). I am going to explain only basic conception or build blocks. All "build blocks" presented as _static_ methods of [Spark](http://static.javadoc.io/com.sparkjava/spark-core/2.7.2/spark/Spark.html) class.

#### [Routes](routes)

_Routes_ - the main build block of _Spark Framework_. By using _Router_ you can handle all HTTP verbs - GET, POST, PUT, DELETE, HEAD, TRACE, CONNECT, OPTIONS. Verbs presented as _static_ imported functions with arguments:
(`path`, `acceptType`, `callback`, `transformer`). `callback` can receive `request` and produce `response`. See more details [here](http://sparkjava.com/documentation#routes).

#### [Request](request)
`Request` contains request information itself and functionality is provided by the request parameter.
Attributes, cookies, headers, ip, host, params, etc.
See more details [here](http://sparkjava.com/documentation#request).

#### [Response](response)
`Response`, in its turn, contains response information:
_body_ - response content, _header_ - set headers, _status_ - response HTTP status, etc. See more details [here](http://sparkjava.com/documentation#request).



### [Controller source code](#controller-source-code)
Due to using Groovy and Spark framework source code on API PoC looks graceful and short.

```groovy
@Grab('com.sparkjava:spark-core:2.7.2')                                     // 1
@Grab('org.slf4j:slf4j-simple:1.7.21')

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import groovy.json.*
import static spark.Spark.*

def toJson = { JsonOutput.toJson(it) } as spark.ResponseTransformer          // 2
Logger logger = LoggerFactory.getLogger("Main")
float RATE = 1.8000
int GAP = 32

port(System.getenv("PORT") ? Integer.parseInt(System.getenv("PORT")) : 4567) // 3

get("/health", { req, res ->
    return [status: "UP"]
}, toJson)

path("/api", {
    path("/convert/to", {
        get("/celsius/:temperature", { req, res ->                            // 4
            float temperature = Float.parseFloat(req.params(":temperature"))
            Map result = [celsius: ((temperature - GAP) / RATE), fahrenheit: temperature]
            logger.info("Fahrenheit to Celsius: " + result)
            result
        }, toJson)                                                            // 5

        get("/fahrenheit/:temperature", { req, res ->
            float temperature = Float.parseFloat(req.params(":temperature"))
            Map result = [celsius: temperature, fahrenheit: ((temperature * RATE) + GAP)]
            logger.info("Celsius to Fahrenheit: " + result)
            result
        }, toJson)
    })
})
```
You can find this code in my repo [alex-bezverkhniy/converter-api-sample](https://github.com/alex-bezverkhniy/converter-api-sample)

1. I use [Grape (Groovy Dependency Manager)](http://docs.groovy-lang.org/latest/html/documentation/grape.html) to add two dependencies 
    - [Spark framework](http://sparkjava.com/) - For providing HTTP handling
    - [Simple Logging Facade for Java (SLF4J)](https://www.slf4j.org/) - For logging.

2. _Spark_ allow us to intercept HTTP responses with `spark.ResponseTransformer` and apply same transformations on it. In my case I do JSON transformation.
3. Port settings. Using ENV variable to get port number withing _Heroku_ [dyno](https://devcenter.heroku.com/articles/dyno-types)
4. [Routes](http://sparkjava.com/documentation#routes) definition. By `:temperature` I define request param for passing temperature.
5. By using Groovy [Closure](http://groovy-lang.org/closures.html) I pass `ResponseTransformer` to my _Route_.

## [Run on local](#run-on-local)

To run this API locally you have two ways: via Groovy script and via Heroku CLI.

To run as Groovy script use next command:
```
groovy converter-api

```

To run via _Heroku CLI_ use next command:
```
heroku local web 
```

But before you need to create a new empty application by using next _Heroku CLI_ command
```
heroku create
Creating app... done, ⬢ <your project name>
https://<your project name>.herokuapp.com/ | https://git.heroku.com/<your project name>.git
```
For more the details please see [official documentation](https://devcenter.heroku.com/articles/git)

## [Deploy and run on Heroku](#deploy-and-run-on-heroku)

To deploy on Heroku you need to push your changes to `heroku master`:
```
git push heroku master
Initializing repository, done.
updating 'refs/heads/master'
...
```
Use this same command whenever you want to deploy the latest committed version of your code to Heroku.

## [Testing](#testing)

To test application use next requests:

### Health check
```ssh
curl -X GET http://<your project name>.herokuapp.com/health | python -m json.tool
```
If application works well you should see next JSON as a result:
```json
{
  "status": "UP"
}
```

### Convert fahrenheit to celsius
```ssh
curl -X GET http://<your project name>.herokuapp.com/api/convert/to/celsius/10 | python -m json.tool
```
### Convert fahrenheit to fahrenheit
```ssh
curl -X GET http://<your project name>.herokuapp.com/api/convert/to/fahrenheit/10 | python -m json.tool
```

## [Instead conclusion](#conclusion)

You can use this [project](https://github.com/alex-bezverkhniy/converter-api-sample) as a template for your PoC.
Fill free to ask questions and leave comments!