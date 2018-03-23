---
layout: post
title: Spring Boot Testing. 
description: Sample Spring Data JPA application - which you can use as a template for you project. 
tags: java spring-boot spring-data jpa cheat-sheet maven gradle microservices unit testing mock
---

As a follower of [TDD](https://en.wikipedia.org/wiki/Test-driven_development) I prefer to write test firstly and then implement logic for passing it. In this post I am going to demonstrate how to do "Unit Testing" in Spring Boot project.

## [Overview](#overview)

Most Agile developers work in this circle of life when adding new code. Write the test first. Make it pass. Then refactor. I’ve been using TDD technique for a few years

![Spring Boot logo]({{ site.baseurl }}/images/spring-boot/tdd-circle.png)

### [Fundamentals of TDD](#fundamentals)

_Test-driven development (TDD)_ is a software development process that relies on the repetition of a very short development cycle. It can be succinctly described by the following set of rules:

- Add a test
- Run all tests and see if the new one fails
- Write some code
- Run tests
- Refactor code
- Repeat

### [Fundamentals of JUnit](#fundamentals-junit)

[JUnit](https://junit.org) is a simple unit testing framework for the Java programming language. It is an implementation of the [xUnit](https://en.wikipedia.org/wiki/XUnit) architecture for unit testing frameworks.

## [Setup](#setup)

As an example application I am going to use project from my previous post - [spring-todo-app](https://github.com/alex-bezverkhniy/spring-todo-app)

## [Dependencies](#dependencies)
Project has next list of dependencies:

- spring-boot-starter-data-jpa
- spring-boot-starter-web
- h2 DB
- spring-boot-starter-test

### [Maven](#maven)
see [pom.xml](https://github.com/alex-bezverkhniy/spring-todo-app/blob/master/pom.xml)
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <!-- JDBC driver for H2 DB -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```


### [Gradle](#gradle)
see [build.gradle](https://github.com/alex-bezverkhniy/spring-todo-app/blob/master/build.gradle)
```groovy
dependencies {
	compile('org.springframework.boot:spring-boot-starter-data-jpa')
	compile('org.springframework.boot:spring-boot-starter-web')
	runtime('com.h2database:h2')
	testCompile('org.springframework.boot:spring-boot-starter-test')
}
```

## [Mocking](#mocking)
Sometimes when you do not need (or don't want) to use real instance of object you can use [Mock Object](https://en.wikipedia.org/wiki/Mock_object) instead. There are several reasons why you need to use _Mock Objects_ eg:
- You don't what to call real logic.
- You need to simulate remote calls (REST services, DB etc)
- You need to simulate behavior of library class or system (I call it "black box")

For mocking object in my tests I use [Mockito framework](http://site.mockito.org/). I found this framework very useful for unit testing. Let's see an example of unit test class:
```java
@RunWith(MockitoJUnitRunner.class) // 1
public class TodoServiceTest {
    @InjectMocks // 2
    private TodoService service;

    @Mock // 3
    private TodoListRepository todoListRepository;

    @Mock
    private TaskRepository taskRepository;
    
    @Test
    public void saveTaskShouldSaveInDBTest() {
        final Task task = new Task();

        when(taskRepository.save(task)).then(invocation -> { // 4
            task.setId(1l);
            return task;
        });

        Task actual = service.saveTask(task);

        verify(taskRepository, times(1)).save(task); // 5
        assertNotNull(actual.getId());
        assertNotNull(actual.getCreatedAt());
        assertNotNull(actual.getCreatedBy());
        assertNotNull(actual.getUpdatedAt());
        assertNotNull(actual.getUpdatedBy());
        assertFalse(actual.getComplete());
    }
}
```
You can find full code [here](https://github.com/alex-bezverkhniy/spring-todo-app/blob/master/src/test/java/com/alexbezverkhniy/samples/springtodoapp/services/TodoServiceTest.java)

Now let's explain source code by lines:

1. `@RunWith(MockitoJUnitRunner.class)` - Annotation which says to JUnit use _MockitoJUnitRunner_ runner instead standard one.
_MockitoJUnitRunner_ initializes mocks annotated with `@Mock`.
2. `@InjectMocks` - by using this annotation Mockito will try to inject mocks only either by constructor injection, setter injection, or property injection in order and as described below.
3. `@Mock` - Mark a field as a mock. 
4. An example of using mocked field. Use it when you want the mock to return particular value when particular method is called.
5. Verifies certain call happened at least once

## [Integration Testing](#integration-testing)
The main purpose of _Integration Testing_ performed to expose defects in the interfaces and in the
interactions between integrated components or systems. I our case we run all modules (_Repository_ and _Service_) together. Actually we start "embedded" _Spring Boot_ application.

Here is an example of _Integration Test_:
```java
@RunWith(SpringRunner.class) \\ 1
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT) \\ 2
public class TodoServiceIntegTest {

    @Autowired \\ 3
    private TodoService service;
    
    ...
    
    @Test
    public void saveItemShouldCreateNewItemInDBTest() { 
        Task task = new Task("task #1", "simple task #1", false);
        Task actual = service.saveTask(task); // 4
        assertNotNull(actual);
        assertNotNull(actual.getId());
    }
    ...
}
```
You can find full code [here](https://github.com/alex-bezverkhniy/spring-todo-app/blob/master/src/test/java/com/alexbezverkhniy/samples/springtodoapp/services/TodoServiceIntegTest.java)

1. `@RunWith(SpringRunner.class)` - Annotation which says to JUnit use _SpringRunner_ ([SpringJUnit4ClassRunner](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/context/junit4/SpringJUnit4ClassRunner.html)) which provides functionality of the Spring TestContext Framework to standard JUnit tests by means of the TestContextManager and associated support classes and annotations. It allows us to use `@Autowired` annotation withing test.
2. `@SpringBootTest(...)` - Does initialization of Application Context_ and we can use _SpringBootContextLoader_
3. `@Autowired` - Injects instance of testable component.
4. We do call of real logic.

When we run _Integration Test_ we actually start _Spring Boot_ server and do testing against real application.

## [@WebMvcTest](#webmvctest)
_WebMvcTest_ is good choose if you don't want to run whole _Spring Boot_ server, like in case of _Integration Test_. It is only going to scan the controller you've defined and the MVC infrastructure.

Here is simple example of usage _WebMvcTest_:
```java
@RunWith(SpringRunner.class)
@WebMvcTest(TodoController.class) \\ 1
public class TodoControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean \\ 2
    private TodoService todoService;

    @Test
    public void souldReturnOneTaskById() throws Exception {
        String expectedJson = "{\"createdAt\":null,\"updatedAt\":null,\"createdBy\":null,\"updatedBy\":null,\"id\":null,\"title\":\"Simple task\",\"description\":\"Just simple task\",\"todoList\":null,\"complete\":false}";

        when(todoService.findTask(1L)).thenReturn(new Task("Simple task", "Just simple task", false));

        mockMvc                                                \\ 3
                .perform(get("/api/tasks/1"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().json(expectedJson));
    }
}
```
You can find full code [here](https://github.com/alex-bezverkhniy/spring-todo-app/blob/master/src/test/java/com/alexbezverkhniy/samples/springtodoapp/controllers/TodoControllerTest.java).

1. By `@WebMvcTest(TodoController.class)` we define that we are going to test _TodoController_.
2. `@MockBean` use _mocked_ version of _Service_
3. Perform GET call to `/api/tasks/1` endpoint, expecting _OK_(HTTP 200) as a result code and as a response JSON content which  should equals to `expectedJson` 

## [Conclusion](#conclusion)

As you can see there are several ways how to test your _Spring Boot_ application. In my practice I use all of them just to be on safe side. You probably may want split _Integration Tests_ and run it separately as different maven/gradle profile, haw to do it I will show in my next post.

Please leave you comments and ask questions!

You can find source code of project [here](https://github.com/alex-bezverkhniy/spring-todo-app)

