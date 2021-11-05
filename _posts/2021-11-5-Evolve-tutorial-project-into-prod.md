---
layout: post
title: How to evolve tutorial project into real world app
description: How to move away from writing tutorial projects and create "real world application".
tags: golang microservices gorm gofiber
---

![](https://images.unsplash.com/photo-1591262184859-dd20d214b52a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80)
[Photo by Eugene Zhyvchik - unsplash.com ](https://unsplash.com/@eugenezhyvchik)

## Introduction
It is always hard to break the wall and move away from writing tutorial projects
and create "real world application".  
I went through this process every time in my career when I learned new programming language 
or framework and started using it using it for real world project.
I realized that there are some basic agnostic steps to do that convertion. 
Usually I start new project from research, analys and writing simple POC/tutorial application 
and then I make it "production ready".

In this post we will go through this process and create simple rest api project.
You can find all source code in the [this repository](https://github.com/alex-bezverkhniy/assistant-api). I will split each stage of refactoring into separate branch for simplicity.

## Assistant REST API

 Recently I found interesting framework [gofiber](https://gofiber.io) which looks very similar to Node.js [express.js](http://expressjs.com).  Moreover framework has pretty good performance [see benchmarks](https://docs.gofiber.io/extra/benchmarks). 
Let's learn this framework together, build simple REST API for Help/IT Suport assistant.
API will have next endpoints:
- **/PUT/assist** - Returns assistant greeting message
- **/PUT/assist/`{optionId}`** - Receusve selected answer and returns next question.
We are going to use next data structure (in JSON for simplicity):
```json
{
    "knowlageBase": [
        {
            "id": 0,
            "message": "Hello, I am a virtual asistant. How can I help you?",
            "options": [
                {
                    "id": 0,
                    "message": "I need help with my passowrd",
                    "nextMessage": 1
                },
                {
                    "id": 1,
                    "message": "I need help with my account",
                    "nextMessage": 2
                }
            ]
        },
        {
            "id": 1,
            "message": "Let me clarify what exactly you need?",
            ...
        },
        {
            "id": 2,
            "message": "Let me clarify what exactly you need?",
            "options": [
                {
                    "id": 0,
                    "message": "unclock my accaunt",
                    "nextMessage": 5
                },
                {
                    "id": 1,
                    "message": "block my account",
                    "nextMessage": 6
                }
            ]
        },
        ...
        {
            "id": 7,
            "message": "Thank you for using our service! Have good day!",
            "options": []
        }
    ]
}
```
see full version [here](https://github.com/alex-bezverkhniy/assistant-api/blob/step-0/data.json)

When user calls first endpoint - `/PUT/assist` API respnoses with first _question/message_
Then user have to select _answer_ and calls `/PUT/assist/{optionId}`, Based on user answer API response either with next message or finalize conversation by "good buy" message.

### First snapshot

Here is first version of the API.
As you can see this is typical approach for all "tutorial" project. I put all logic in one file - [main.go](https://github.com/alex-bezverkhniy/assistant-api/blob/step-0/main.go).
```go
// main.go
package main

import (
...
)

// Data Structures

// Option for user selection
type Option struct {
	ID            int    `json:"id"`
	Body          string `json:"body"`
	NextMessageID int    `json:"nextMessageId"`
}

// List of Options
type Options []Option

// Message/Question
type Message struct {
	ID      int     `json:"id"`
	Body    string  `json:"body"`
	Options Options `json:"options"`
}

// Store
type Store struct {
	messages []Message
	fileName string
}

func main() {
	app := fiber.New()

	store, err := NewStore("data.json")
	if err != nil {
		log.Fatal("Cannot read DB file")
	}

	v1 := app.Group("/api/v1")

	assist := v1.Group("/assist")

	assist.Put("/:id?", func(c *fiber.Ctx) error {
		idStr := c.Params("id")
		...

		m, err := store.GetByID(id)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(NewError(err.Error()))
		}
		return c.Status(fiber.StatusOK).JSON(m)
	})

	assistantDB := v1.Group("/assistant/db")
	assistantDB.Get("/", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(store.GetAll())
	})

	assistantDB.Get("/:id", func(c *fiber.Ctx) error {
		idStr := c.Params("id")
	        ...

		m, err := store.GetByID(id)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(NewError(err.Error()))
		}
		return c.Status(fiber.StatusOK).JSON(m)
	})

	log.Fatal(app.Listen(":3000"))
}

// Create new Store
func NewStore(fn string) (*Store, error) {
	...
}

// Create Error message
func NewError(msg string) fiber.Map {
	...
}

// Get all messages
func (s *Store) GetAll() []Message {
	...
}

// Get message by ID
func (s *Store) GetByID(id int) (*Message, error) {
	...
}

```
It is always nice to have a test for our application for first time we can use simple "smoke test" viewer [test.http](https://github.com/alex-bezverkhniy/assistant-api/blob/step-0/test.http) and run it via VS Code plugin - [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).  

### Adding Tests - TDD/DDT.
For deep refactoring, which we are going to approach, we need more advanced tests let's create them.

![](https://media.giphy.com/media/gw3IWyGkC0rsazTi/giphy.gif)

[gofiber](https://gofiber.io) framework provide nice method to test endpoints. 
```go
func (app *App) Test(req *http.Request, msTimeout ...int) (*http.Response, error)
```
We use this method for creating `_test.go` files. The default timeout is 1s let's disable it by passing -1 as a second argument.

As the result of this step we have `main_test.go` where we use [Data Driven Testing](https://en.wikipedia.org/wiki/Data-driven_testing) approach:

```go
//main_test.go

package main

import (
...
)

func TestEndpoints(t *testing.T) {
	tests := []struct {
		description string
		route       string

		// Request
		method string
		body   io.Reader

		// Expected output
		expectedError bool
		expectedCode  int
		expectedBody  string
	}{
		{
			description:   "get default message",
			route:         "/api/v1/assist/",
			method:        "PUT",
			body:          nil,
			expectedError: false,
			expectedCode:  200,
			expectedBody:  `{"id":0,"body":"Hello, I am a virtual assistant. How can I help you?","options":[{"id":0,"body":"I need help with my password","nextMessageId":1},{"id":1,"body":"I need help with my account","nextMessageId":2}]}`,
		},
		...
		{
			description:   "Get record - 404",
			route:         "/api/v1/assistant/db/100",
			method:        "GET",
			body:          nil,
			expectedError: false,
			expectedCode:  404,
			expectedBody:  `{"message":"no messages found","status":"error"}`,
		},
	}

	// Setup the app as it is done in the main function
	app := Setup()

	for _, tt := range tests {
		// Create request
		req, _ := http.NewRequest(
			tt.method,
			tt.route,
			tt.body,
		)
		req.Header.Set("Content-Type", "application/json; charset=UTF-8")

		res, err := app.Test(req, -1)

		assert.Equalf(t, tt.expectedError, err != nil, tt.description)

		if tt.expectedError {
			continue
		}

		assert.Equalf(t, tt.expectedCode, res.StatusCode, tt.description)

		// Read the response body
		body, err := ioutil.ReadAll(res.Body)
		assert.Nilf(t, err, tt.description)

		// Verify, that the reponse body equals the expected body
		assert.Equalf(t, tt.expectedBody, string(body), tt.description)
	}
}
```
At this moment we put all tests in one file, later we can refactor it after splitting our project structure. See full version of `main_test.go` [here](https://github.com/alex-bezverkhniy/assistant-api/blob/step-1/main_test.go)

### Database Support.

At this moment we are OK to use .json file as datasource but if we want later add more advanced features like admin dashboard, monitoring and audit, multiple dialog flows, etc. we have to use external RDBMS or NoSQL storage. Let's for simplicity use [sqlite](https://sqlite.org) and [gorm library](https://gorm.io) to work with.

![](https://media.giphy.com/media/kPrlykW2TpVU4HWx2O/giphy.gif)
[giphy.com](https://giphy.com)

By using _Gorm_ you have more flexibility in case of database migration process, moving to multiple database engines, rapid development cycle, for more details read their [Overview Page](https://gorm.io/docs/#Overview).

Firstly we need to add `gorm` and `sqlite` dependencies
```bash
go get -u gorm.io/gorm
go get -u gorm.io/driver/sqlite
```
Then refactor our Data structures and _map_ them to DB tables.
**from:**
```go
// Option for user selection
type Option struct {
	ID            int    `json:"id"`
	Body          string `json:"body"`
	NextMessageID int    `json:"nextMessageId"`
}

// List of Options
type Options []Option

// Message/Question
type Message struct {
	ID      int     `json:"id"`
	Body    string  `json:"body"`
	Options Options `json:"options"`
}

// Store
type Store struct {
	messages []Message
	fileName string
}
```
**to:**
```go
// Option for user selection
type Option struct {
	gorm.Model
	ID            int    `json:"id"`
	Body          string `json:"body"`
	MessageID int    `json:"nextMessageId"`
}

// Message/Question
type Message struct {
	gorm.Model
	ID      uint    `json:"id"`
	Body    string  `json:"body"`
	Options Options `json:"options"`
	FlowID  uint
}

// Flow - dialog flow
type Flow struct {
	gorm.Model
	Messages []Message
	Title    string
}

type FlowStorage struct {
	db *gorm.DB
}
```
As you can see we do extend our structures from `gorm.Model` and now we have useful fields: `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt`. gorm automatically add these fields to DB table. Also we added additional IDs `MessageID` and `FlowID`

Next step we need initialize _sqlite_ DB via `SetupDB` function:
```go
// main.go
...
// Setup DB connection and does all migration and default data
func SetupDB(dbFile string) (*gorm.DB, error) {

	db, err := gorm.Open(sqlite.Open(dbFile), &gorm.Config{})
	if err != nil {
		log.Fatalln("failed to connect database")
		return nil, err
	}

	db.AutoMigrate(&Option{})
	db.AutoMigrate(&Message{})
	db.AutoMigrate(&Flow{})

	flow, err := LoadFlowFromJson("data.json")
	if err != nil {
		log.Fatalln("cannot load default data")
		return nil, err
	}

	db.Create(flow)

	return db, nil
}
```
Function initializes _sqlite_ DB opens connection and call `AutoMigrate` for each structure/entity. Also loads default data from `data.json`.  
Also we need to change functions `GetAll` and `GetByID` to retrieve data from DB 
```go
// main.go

// Get all messages
func (s *FlowStorage) GetAll() []Message {
	var messages []Message
	s.db.Find(&messages)
	return messages
}

// Get message by ID
func (s *FlowStorage) GetByID(id uint) *Message {
	var msg *Message
	s.db.First(&msg)
	return msg
}
```
Now our API file looks better from "production readiness" point of view, but still have all logic in one [main.go](https://github.com/alex-bezverkhniy/assistant-api/blob/step-2/main.go) file. 

**NOTE**

If you run main_test.go you might see next errors like:
```
Error Trace:	main_test.go:116
Error:      	Not equal: 
				expected: "{\"id\":0,\"body\":\"Hello, I am a virtual assistant. How can I help you?\",\"options\":[{\"id\":0,\"body\":\"I need help with my password\",\"nextMessageId\":1},{\"id\":1,\"body\":\"I need help with my account\",\"nextMessageId\":2}]}"
				actual  : "{\"ID\":0,\"CreatedAt\":\"2021-10-26T13:33:44.200365197-05:00\",\"UpdatedAt\":\"2021-10-26T13:33:44.200365197-05:00\",\"DeletedAt\":null,\"id\":1,\"body\":\"Hello, I am a virtual assistant. How can I help you?\",\"options\":null,\"FlowID\":1}"
```
Thant the case when we need fix our test and add 3 additional fields to response - `CreatedAt`, `UpdatedAt`, `DeletedAt`. see fixed version [here](https://github.com/alex-bezverkhniy/assistant-api/blob/step-2/main_test.go)

By having DB and `gorm` as a ORM library we can easily add CRUD method to our entities.
For instance I show here only one endpoint which creates new message - `POST`:`/api/v1/assistant/db/messages` 

Let's firstly add new "test case" (which is technically test data)
```go
// main.go
...
	tests := []struct {
		description string
		route       string

		// Request
		method string
		body   io.Reader

		// Expected output
		expectedError bool
		expectedCode  int
		expectedBody  string
	}{
...
		{
			description:   "Create new message",
			route:         "/api/v1/assistant/db/messages",
			method:        "POST",
			body:          strings.NewReader(`{"body": "Let me clarify what exactly you need?","options": [],"FlowID": 3}`),
			expectedError: false,
			expectedCode:  201,
			expectedBody:  `{"ID":8,"CreatedAt":"000","UpdatedAt":"000","DeletedAt":"000","body":"Let me clarify what exactly you need?","options":[],"FlowID":3}`,
		},
	}
...
```
Now we can fix the test by implementing `handler`
```go
// main.go
...
assistantDB.Post("/messages", func(c *fiber.Ctx) error {
		var m Message
		if err := c.BodyParser(&m); err != nil {
			c.Status(fiber.StatusBadRequest).JSON(NewError("cannot parse request body"))
		}
		if err := store.CreateMessage(&m); err != nil {
			c.Status(fiber.StatusInternalServerError).JSON(NewError("cannot save new message, try again later"))
		}
		return c.Status(fiber.StatusCreated).JSON(m)
	})
...
// CreateMessage - creates new message in DB
func (s *FlowStorage) CreateMessage(m *Message) error {
	return s.db.Create(m).Error
}
```
See all CRUD methods/endpoints [here](https://github.com/alex-bezverkhniy/assistant-api/blob/8addc22adc8a8ff3d5c78053606355cc64879b8a/main.go#L122)

### Project structure.

Now time to refactor our project structure. 

When you work with simple POC/tutorial project it is OK to have everything in one file, but if you planning deliver it to production you have to think about you project architecture.

There are plenty of design styles: [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design), [Hexagonal Architecture](http://alistair.cockburn.us/Hexagonal+architecture), [Onion Architecture](http://jeffreypalermo.com/blog/the-onion-architecture-part-1/), [Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html), [Model View Controller based Architecture](https://www.w3schools.in/mvc-architecture/), it is up to you which one to use. You can even mix them. Just keep in mind your project tree should be easy to understand and support. I personally fallowing one rule - "Do not overload".

Here is new project structure I am going to use:
```
assistant-api
├── database
├── handler
├── model
├── data.json
├── main.go
├── router.go
├── config.go
├── main_test.go
├── README.md
└── ...

```

Where:
- `database` - package were we will keep DB related components and logic.
- `handler` - package - analog of Controller in _MVC pattern_ will have here HTTP handlers.
- `model` - package - analog of Model in _MVC pattern_ - will have all public data structures.
- `router.go` - file where all routers live.
- `config.go` - configuration logic.


### Security

TODO

### Logging/Metrics.

TODO

### Dockerization

TODO

## Conclusion

Of course we made just a toy project but you can always convert it into advanced one.
Is the glitter I'm going to write additional posts how to add JWT auth to this project.
Hope you got good experience please leave your questions and feedback.
