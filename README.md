# redis-update-events
Node module that uses Redis PUBSUB to broadcast all events

**! This is a work in progress !**

## Installing

Currently nothing is published. Install with

```
 npm install --save rangermauve/redis-update-events
```

## API

``` javascript
var RUE = require("redis-update-events");

var connection = RUE({
	port: 6379,
	scope: "demo"
});

connection.on("SET:somekey", function(data){
	var value = data.value;
	console.log("New value for somekey is:", value);
});
```


### `on(event, cb)`

### `off(event, cb)`

### `set(key, value, cb)`

### `del(key, cb)`

More to come soon-ish, maybe.
