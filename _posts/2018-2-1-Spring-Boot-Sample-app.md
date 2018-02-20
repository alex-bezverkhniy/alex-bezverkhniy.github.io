---
layout: post
title: Sample Spring Boot application. 
description: Sample Spring Boot application - which you can use as a template for you project. 
tags: java spring-boot cheat-sheet maven gradle microservices
---

[Spring Ecosystem](https://spring.io/) is so popular in "Java World" for last several years and if you want to be on the cutting-edge of Java technologies you should to have [Spring Boot](https://projects.spring.io/spring-boot/) in your skills list. I am going to show how to level up your String application with _Spring Boot_.

![Spring Boot logo]({{ site.baseurl }}/images/spring-boot/spring-boot-logo.png)

I use Spring Boot almost in all my Java Projects. This framework or tool set really makes easy to create _Spring Applications_. Here is basic useful features:
- Embed Tomcat, Jetty or Undertow
- Automatic configurations 
- Production-ready features and tools.
- Simple integration with other Spring Projects

You can find more details [here](https://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/#boot-features).

I created "template project" for quick start. [spring-boot-sample](https://github.com/alex-bezverkhniy/spring-boot-sample). Welcome to fork and use!
In this post I am going to provide short description/explanation on this project.

## [Requirements](#requirements)
- [Java 7/8](https://java.com/en/download/)
- [Maven](https://maven.apache.org/) or [Gradle](https://gradle.org/)
- Your favorite IDE or Editor.

## [Project structure](#project-structure)

{:.nolineno}
```ssh
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── alexbezverkhniy
│   │   │           └── samples
│   │   │               ├── SampleApplication.java
│   │   │               ├── controllers
│   │   │               │   └── SampleController.java
│   │   │               └── services
│   │   │                   └── SampleService.java
│   │   └── resources
│   │       └── application.yml
│   └── test
│       ├── java
│       │   └── com
│       │       └── alexbezverkhniy
│       │           └── samples
│       │               ├── controllers
│       │               │   └── SampleControllerTest.java
│       │               └── services
│       │                   └── SampleServiceTest.java
│       └── resources
│           └── application.yml
├── build.gradle
├── pom.xml
└── README.md
```

You can see the project has one controller - `SampleController.java`, one service - `SampleService.java` and main application itself - `SampleApplication.java`.
You can build project using [Maven](https://maven.apache.org) or [Gradle](https://gradle.org).

Also you can find two tests classes: 
- `SampleControllerTest.java` - integration test for controller.
- `SampleServiceTest.java` - simple test for service.

## [Build with Gradle](#build-with-gradle)

If you going to use Gradle as a build tool. You can see that `build.gradle` file has only tree dependences.

{:.nolineno}
```groovy
dependencies {
    compile("org.springframework.boot:spring-boot-starter-web")
    testCompile("org.springframework.boot:spring-boot-starter-test")
    testCompile("junit:junit")
}
```
Everything do you need to  build this project just run next command:

{:.nolineno}
```ssh
gradle build
```

## [Build with Maven](#build-with-maven)
The same you can see in 'pom.xml' file. We have two dependencies.

{:.nolineno}
```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>            
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
```
To build this project run next command:

{:.nolineno}
```ssh
mvn clean install
```

## [Services and controllers](#services-and-controllers)

Now lets dive deeper into source code. This is very simple project and it has only one controller and one service. We probably can avoid of creating service for such a simple logic, but I am trying to fallow next rule: 

{:.info}
Implement all business logic inside services, and use controllers for handling requests and response.

So you can see that we don't have business logic; in our _controller_:
```java
@Controller
@RequestMapping(value = "/api/sample")
public class SampleController {

    @Autowired
    private SampleService sampleService;

    @RequestMapping(value = "/greeting", method = RequestMethod.GET)
    public String greeting() {
        return sampleService.getGreetingMessage();
    }
}
```

But we do have it in _service_ 
```java
@Component
public class SampleService {

    @Value("${name:World}")
    protected String name;

    public String getGreetingMessage() {
        return String.format("Hello %s!", name);
    }
}
```

## [Run Spring Boot application](#run-spring-boot-application)

To run Spring Boot application you can use several ways:

### [Run with gradle](#run-with-gradle)
To run application from Gradle you can use Spring Boot Gradle plugin. This plugin includes a run goal which can be used to quickly compile and run your application.

```ssh
gradle bootRun
```

### [Run with maven](#run-with-maven)

Similar way for Maven based project, there is Spring Boot Maven plugin. This plugin includes a run goal which can be used to quickly compile and run your application.

```ssh
mvn spring-boot:run
```

### [Run as _standalone_ application](#run-as-standalone-app)
Before run the application you need to successfully build it.

```ssh
java -jar target/spring-boot-sample-1.0.0-SNAPSHOT.jar
```
or in case of Gradle base project:
```ssh
java -jar  build/libs/spring-boot-sample-1.0.0-SNAPSHOT.jar
```

## Testing Application

After running application we can do a little "smoke test" with [curl](https://en.wikipedia.org/wiki/CURL).

```ssh
curl -X GET 'http://localhost:8080/api/sample/greeting'
```

In the result you should see `Hello Alex!`.

In my next post I am going to show and explain how to do Integration Testing with Spring Boot. 
