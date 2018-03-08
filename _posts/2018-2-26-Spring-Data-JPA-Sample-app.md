---
layout: post
title: Sample Spring Data JPA application. 
description: Sample Spring Data JPA application - which you can use as a template for you project. 
tags: java spring-boot spring-data jpa cheat-sheet maven gradle microservices
---

In this post I am going to demonstrate common methods and approaches of working with [Spring Data JPA](https://projects.spring.io/spring-data-jpa/). _Spring Data JPA_ is a part of the big family [Spring Data](https://projects.spring.io/spring-data). _Spring Data_ which is an umbrella project and the most popular project in set of _Spring Tools_. This project allows us to build fully configuring the persistence layer. I am going to demonstrate and do some code explanation of boilerplate code. 

![Spring Boot logo]({{ site.baseurl }}/images/spring-boot/spring-data-jpa.png)

Spring Data JPA provides an implementation of the data access layer for Spring applications. The main goal of _Spring Data_ and _Spring Data JPA_ in particular is to significantly reduce the amount of boilerplate code required to implement data access layers for various persistence stores. So in several words if you familiar with [DAO](https://en.wikipedia.org/wiki/Data_access_object) pattern by using _Spring Data JPA_ you almost don't need to implement DAO interfaces and it is now the only artifact that needs to be explicitly defined.

## [Spring Data Core Concepts](#spring_data_core_concepts)

_Spring Data_ has several core concepts/abstractions which in general were borrowed from _DAO_ pattern and [JPA](https://en.wikipedia.org/wiki/Java_Persistence_API) specification. 

### [Entity](#entity)

[Entities](https://en.wikipedia.org/wiki/Java_Persistence_API#Entities) - Simple and lightweight java class. I would say _Entity_ is [Java Bean](https://docs.oracle.com/javase/tutorial/javabeans/) or [Domain Object](https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks) which is reflecting particular Data Base table. Entities usually have relationships with other entities and might be expressed/specified through object/relational metadata by using [annotations](https://en.wikipedia.org/wiki/Java_annotation) or XML descriptor file.
Here an example of definition of entity:

``` java
@Entity // 1
@Table // 2
public class Task extends BaseEntity implements Serializable {

    @Id // 3
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String title;

    private String description;

    private Boolean isComplete;

    @ManyToOne  // 4
    private TodoList todoList;

    // ... Constructors

    /// ... Getters/Setters
}
```

1. We use `@Entity` to define Entity _Spring Data JPA_ provides a ClasspathScanningPersistenceUnitPostProcessor to scan packages for classes annotated with `@Entity` or `@MappedSuperclass`.
2. `@Table` _JPA_ annotation. Specifies the primary table for the annotated entity.
3. Another _JPA_ annotation Specifies the primary key of an entity.
4. This class has relation with another _Entity_ - `TodoList`. And Type of relationship is Many To One

### [Repository](#repository)

[Repositories](https://docs.spring.io/spring-data/jpa/docs/2.0.4.RELEASE/reference/html/#repositories) is central part of _Spring Data_ abstraction. In several words repositories are interfaces that you can define to access data.
Here an example of definition of repository:

```java
@Repository // 1
public interface TaskRepository extends 
    CrudRepository<Task, Long>,  // 2
    PagingAndSortingRepository<Task, Long> { // 3
    
    List<Task> findByTitle(String title); // 4
    Page<Task> findByTitle(String title, Pageable pageable);
}
```

1. `@Repository` Indicates that this interface is a _Repository_
2. This interface extends [CrudRepository](https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/repository/CrudRepository.html) for generic CRUD operations on a repository for a specific type. It takes _Entity_ type and type of ID(primary key) of Entity.
3. We extend one more interface [PagingAndSortingRepository](https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/repository/PagingAndSortingRepository.html) which is extension of _CrudRepository_ and provides additional methods to retrieve entities using the pagination and sorting abstraction.
4. Simple method for searching by title. Spring Data JPA automatically pick up name of this method, which use special naming convention - [Query Methods](hhttps://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.query-methods.details), and provides/injects implementation. So we don't need to implement logic of querying data from DB.

#### [Naming Convention for repositories](#naming-convention-repositories)
To consume all _Spring Data_ features, and allowing _Spring Framework_ inject implementation of _Query Methods_  we have to fallow naming convention for repository interfaces and methods. We should call our repositories next format: `<EntityClassName>Repository` 
eg:
    TaskRepository, TodoListRepository etc.
in that case we even do not need to use `@Repository` annotation to indicate that interface is a _Repository_

### [Using Repositories](using-repositories)
To use repository from your _Service_ or _Controller_ you need to define member of your class with type of repository you are going to use and indicate this field (member) with `@Autowired` annotation. Your class also has to be indicated by `@Component` annotation, or annotation derived from `@Component` like `@Service`, `@Controller`.

``` java
@Service
public class TodoService {

    @Autowired
    protected TaskRepository taskRepository;
    ...
}
```

Now you can call method of your repository inside your class methods. here is common CRUD methods:


- `taskRepository.save(task)` - Saves a given entity
- `taskRepository.save(tasks)` - Saves all given entities
- `taskRepository.findOne(yaskId)` - Retrieves an entity by its id
- `taskRepository.exists(taskId)` - Returns whether an entity with the given id exists. true if an entity with the given id exists
- `taskRepository.findAll()` - Returns all entities. Use carefully if you operate big amount of data
- `taskRepository.findAll(TaskIds)` - Returns all instances of the type with the given IDs
- `taskRepository.count()` - Returns the number of entities available
- `taskRepository.delete(taskId)` - Deletes the entity with the given id
- `taskRepository.delete(task)` - Deletes a given entity
- `taskRepository.delete(tasks)` - Deletes the given entities
- `taskRepository.deleteAll()` - Deletes all entities managed by the repository

**entity** - an instance of Task class.

{:.info}
When you are saving new entity into DB and ID of this entity is _Auto Generated_ - `@GeneratedValue(strategy = GenerationType.AUTO)` you don't need to set value for ID manually. 
Do it **ONLY** in case if you want to **update** exists entity.


## [Project description](project-description)

To show features of _Spring Data JPA_ I decided to implement _Todo REST API_ which use almost all _Spring Data JPA_ functional and relatively close to real production application.

### [Project structure](project-structure)

{:.nolineno}
```ssh
└── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── alexbezverkhniy
│   │   │           └── samples
│   │   │               └── springdatajpasample
│   │   │                   ├── SpringDataJpaSampleApplication.java
│   │   │                   ├── controllers
│   │   │                   │   └── TodoController.java
│   │   │                   ├── domain
│   │   │                   │   ├── BaseEntity.java
│   │   │                   │   ├── Task.java
│   │   │                   │   └── TodoList.java
│   │   │                   ├── repositories
│   │   │                   │   ├── TaskRepository.java
│   │   │                   │   └── TodoListRepository.java
│   │   │                   └── services
│   │   │                       ├── TaskNotFoundException.java
│   │   │                       ├── TodoListNotFoundException.java
│   │   │                       └── TodoService.java
│   │   └── resources
│   │       ├── application.yml
│   │       ├── static
│   │       └── templates
│   └── test
│       └── java
│           └── com
│               └── alexbezverkhniy
│                   └── samples
│                       └── springdatajpasample
│                           ├── SpringDataJpaSampleApplicationTests.java
│                           └── services
│                               ├── TodoServiceIntegTest.java
│                               └── TodoServiceTest.java
├── README.md
├── build.gradle
└── pom.xml
```

- `SpringDataJpaSampleApplication.java` - Main application
- `BaseEntity.java` - Base Super class for all Entities
- `Task.java`, `TodoList.java` - Entities
- `TaskRepository.java`, `TodoListRepository.java` -  Repositories
- `TodoService.java` - Main Servers with general logic
- `TodoController.java` - REST Controller for working via HTTP/REST
- `application.yml` -  Has DB connection settings

As you see project has only two related entities `Task.java`, `TodoList.java` which extend one common super class - `BaseEntity.java`. By extending `BaseEntity.java` I want to show how can we define common fields, audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.

### [Entities Diagram](entities-diagram)

In project we use next Domain structure:

![Entities Diagram]({{ site.baseurl }}/images/spring-boot/entities-diagram.png)

### [DataBase Configuration](database-configuration)

This is _String Boot_ project and all configurations you can find in _application.yml_ file. Here is what we have in that file:

```yaml
spring:
  application:
    name: todo-api
  datasource:
    url: jdbc:h2:mem:todoDB;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password:

---

spring:
  profiles: test
  datasource:
    url: jdbc:h2:tcp://localhost/~/todoDB
    driver-class-name: org.h2.Driver
    username: sa
    password:

```
As you can project has only two profiles _default_ and _test_. By default we use embedded [H2 database](http://www.h2database.com/) and for _test_ profile I use H2 database as standalone server. 


## [Run application and call endpoints](run-project-and-call-endpoints)

As I mentioned above [this project](https://github.com/alex-bezverkhniy/spring-data-jpa-sample) is just REST interface for database and I use _Spring Boot_ and embedded _Tomcat_ server to lift up REST controllers and handle HTTP requests.

### [Run application](run-application)

Before run application you need to build this project

#### [Build with Maven](build-with-maven)
```ssh
mvn clean install
```

In case of successful build you should expect this message and should see file `spring-data-jpa-sample-0.0.1-SNAPSHOT.jar` file under `target` folder.
```ssh
...
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 10.244 s
...
```

#### [Build with Gradle](build-with-gradle)
```ssh
gradle clean build
```
In case of successful build you should expect this message and should see file `spring-data-jpa-sample-0.0.1-SNAPSHOT.jar` file in `build/libs`.
```ssh
...
BUILD SUCCESSFUL in 14s
8 actionable tasks: 8 executed
...
```

#### [Run Application](build-with-gradle)

To run application use next command `java -jar target/spring-data-jpa-sample-0.0.1-SNAPSHOT.jar` or `java -jar build/libs/spring-data-jpa-sample-0.0.1-SNAPSHOT.jar` depending on which tool you use for building.

### [Call application](call-application) 

Now we can call our application and do some "smoke test". Here are some examples how can we call through [curl](https://curl.haxx.se)

#### Create Task
*Task data:*
```json
{
  "title": "Sample Task",
  "description": "Just simple task",
  "isComplete": false
}
```

```ssh
curl -X POST \
-H 'Content-Type: application/json' \
-d '{
      "title": "Sample Task",
      "description": "Just simple task",
      "isComplete": false
    }' \
'http://localhost:8080/api/tasks/' \
| python -m json.tool
```

#### Read Task
```ssh
curl -X GET 'http://localhost:8080/api/tasks/1' | python -m json.tool
```

#### Update Task
*Task data:*
```json
{
  "title": "Sample Task",
  "description": "Just simple task",
  "isComplete": false
}
```

```ssh
curl -X PUT \
-H 'Content-Type: application/json' \
-d '{
      "title": "Sample Task",
      "description": "Just simple task",
      "isComplete": false
    }' \
'http://localhost:8080/api/tasks/1' \
| python -m json.tool
```

You can find source code of this project in my [github repository](https://github.com/alex-bezverkhniy/spring-data-jpa-sample). Welcome to ask questions in comments.