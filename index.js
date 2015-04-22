var NRP = require("node-redis-pubsub");
var toArray = require("to-array");

module.exports = create();

function create(options) {
	return new UpdateEvents(options);
}

function UpdateEvents(options) {
	this.nrp = new NRP(options);
}

UpdateEvents.prototype = {
	on: relay_nrp_fn("on"),
	off: relay_nrp_fn("off"),
	quit: relay_nrp_fn("quite"),
	end: relay_nrp_fn("end"),

	get: relay_redis_fn("get", [], ["value"]),
	set: relay_redis_fn("set", ["value", "EX", "PX"], []),
	del: relay_redis_fn("del", [], []),
};

function relay_nrp_fn(name) {
	return function() {
		var nrp = this.nrp;
		return nrp[name].apply(nrp, arguments);
	}
}

function relay_redis_fn(name, argument_names, result_names) {
	return function(key) {
		var self = this;
		var nrp = this.nrp;
		var redis = nrp.emitter;
		var arg_length = arguments.length;
		var non_cb_args = toArray(arguments).slice(0, arg_length - 1);
		var cb = arguments[arg_length - 1];

		return redis[name].apply(redis, non_cb_args.concat(emit_command));

		function emit_command(err) {
			if (err) return cb(err);
			var result_args = toArray(arguments).slice(1);

			var command_name = name.toUpperCase();
			var event_name = command_name + ":" + key;

			var event_payload = {
				key: key
			};
			result_names.forEach(function(name, index) {
				event_payload[name] = result_args[index];
			});
			argument_names.forEach(function(name, index) {
				event_payload[name] = non_cb_args[index - 1];
			});

			self.nrp.emit(event_name, event_payload);

			cb.apply(self, [null].concat(result_args));
		}
	}
}
