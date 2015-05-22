///<reference path='../../vineyard-ground/defs/node.d.ts' />
/// <reference path="../../vineyard-metahub/metahub.d.ts"/>
/// <reference path="../../vineyard-ground/ground.d.ts"/>

if (process.argv.indexOf('--source-map'))
	require('source-map-support').install()

if (process.argv.indexOf('--monitor-promises'))
	require('when/monitor/console')

if (process.argv.indexOf('--profile') > -1) {
	var agent = require('webkit-devtools-agent')
	agent.start()
}

interface Bulb_Configuration {
	path?:string
	class?:string
	parent?:string
}

class Vineyard {
	bulbs:any = {}
	config
	config_folder
	ground:Ground.Core
	root_path:string
	private validator
	private json_schemas = {}
	private module_schema_files = []

	constructor(config_file:string) {
		if (!config_file)
			throw new Error("Vineyard constructor is missing config file path.")

		this.validator = require('tv4')
		this.config = this.load_config(config_file)
		var path = require('path')
		this.config_folder = path.dirname(config_file)

		if (typeof global.SERVER_ROOT_PATH === 'string')
			this.root_path = global.SERVER_ROOT_PATH

		else {
			var path = require('path')
			this.root_path = path.dirname(require['main'].filename)
		}
		console.log('Vineyard root path: ' + this.root_path)
	}

	finalize() {
		var ground_config = this.config.ground

		ground_config.trellis_files = this.module_schema_files.concat(ground_config.trellis_files)
		delete this.module_schema_files

		console.log('schema-files:', ground_config.trellis_files)

		// It's important to load ground before the bulbs since the bulbs usually hook into ground.
		this.ground = Vineyard.create_ground("local",
			ground_config.databases,
			ground_config.trellis_files
		)

		for (var i in this.bulbs) {
			var bulb = this.bulbs[i]
			bulb.ground = this.ground
			bulb.grow()
		}
	}

	static create_ground(db_name:string, databases, trellis_files, metahub_files = null):Ground.Core {
		var path = require('path')
		var ground = new Ground.Core(databases, db_name);
		for (var i in trellis_files) {
			ground.load_schema_from_file(trellis_files[i])
		}

		return ground;
	}

	get_bulb(name:string):Promise {
		return when.resolve(this.bulbs[name])
	}

	load_bulb(name:string, info:Bulb_Configuration = null):Vineyard.Bulb {
		if (!info)
			info = <Bulb_Configuration> this.config.bulbs[name]

		if (!info)
			throw new Error("Could not find configuration for bulb: " + name)

		var file
		if (info.path) {
			var path = require('path')
			file = path.resolve(info.path)
		}
		else {
			file = info.parent || name

			// The "vineyard-" prefix for Vineyard bulbs can be implicit in the configuration JSON.
			try {
				require.resolve(file)
			} catch (e) {
				file = 'vineyard-' + file
			}
		}

		var bulb_class = require(file)
		if (info.class)
			bulb_class = bulb_class[info.class]

		if (!bulb_class)
			throw new Error('Could not load bulb module: "' + name + '" (path=' + file + ').')

		if (typeof bulb_class !== 'function')
			throw new Error('bulb is not a class: "' + name + '" (path=' + file + ').')

		var bulb = new bulb_class(this, info)
		this.bulbs[name] = bulb

		// Offload and re-add schema files added in the configuration so that they always
		// loaded after the module schema files.
		bulb.till_ground(this.config.ground)

		return bulb
	}

	load_all_bulbs() {
		var bulbs = this.config.bulbs
		for (var name in bulbs) {
			this.load_bulb(name)
		}

		this.finalize()
	}

	add_schema(path:string) {
		this.module_schema_files.push(path)
	}

	load_config(config_file:string) {
		var fs = require('fs')
		var json = fs.readFileSync(config_file, 'ascii')
		var local = JSON.parse(json)
		var includes = local.includes
		if (typeof includes == 'object') {
			for (var i = 0; i < includes.length; ++i) {
				var include = this.load_config(includes[i])
				// Make sure the merging is done after including
				// or there will be an infinite loop
				local = Vineyard.deep_merge(local, include)
			}
		}

		return local
	}

	static deep_merge(source, target) {
		if (typeof source != 'object')
			throw new Error('Configuration source is not an object.')

		if (typeof target != 'object')
			throw new Error('Configuration target is not an object.')

		for (var key in source) {
			var value = source[key]
			if (typeof value == 'object') {
				if (target[key] === undefined) {
					target[key] = source[key]
				}
				else {
					if (MetaHub.is_array(source)) {
						for (var i = 0; i < source.length; ++i) {
							target.push(source[i])
						}
					}
					else {
						Vineyard.deep_merge(value, target[key])
					}
				}
			}
			else {
				target[key] = value
			}
		}

		return target
	}

	start():Promise {

		this.ground.harden_schema()

		var promises = []
		for (var i in this.bulbs) {
			var bulb = this.bulbs[i]
			promises.push(bulb.start())
		}

		return when.all(promises)
	}

	stop():Promise {
		var promises = []
		for (var i in this.bulbs) {
			var bulb = this.bulbs[i]
			promises.push(bulb.stop())
		}

		return when.all(promises)
			.then(()=> {
				this.ground.stop()
			})
	}

	load_json_schema(name, path) {
		var fs = require('fs')
		this.json_schemas[name] = JSON.parse(fs.readFileSync(path, 'ascii'))
	}

	add_json_schema(name, schema) {
		this.json_schemas[name] = schema
	}

	find_schema_errors(data, schema_name) {
		var schema = this.json_schemas[schema_name]
		if (!schema)
			throw new Error('Could not validate data.  No schema named ' + schema_name + ' was loaded.')

		if (this.validator.validate(data, schema))
			return null

		return this.validator.error
	}
}

module Vineyard {
	export interface IUser {
		id?
		name?:string
		roles?:IRole[]
	}

	export interface IRole {
		id?
		name?:string
	}

	export interface Ground_Configuration {
		databases?:any[]
		trellis_files:string[]
		metahub_files:string[]
	}

	export class Bulb extends MetaHub.Meta_Object {
		vineyard:Vineyard
		config
		ground:Ground.Core

		constructor(vineyard:Vineyard, config) {
			super()
			this.vineyard = vineyard
			this.config = config
		}

		// Called before Ground is loaded to allow injecting any additional Ground configuration
		till_ground(ground_config:Ground_Configuration) {
		}

		// Called after Ground is loaded
		grow() {
		}

		// Starts any long-running bulb processes
		start() {
		}

		// Stops any long-running bulb processes
		stop() {
		}
	}

	export class Version {
		major:number
		minor:number = Infinity
		revision:number = Infinity
		platform:string

		text:string
		value:number

		constructor(text:string) {
			this.text = text
			var tokens = text.trim().split('.')
			var numbers:number[] = []
			for (var i = 0; i < tokens.length; ++i) {
				var token = tokens[i]
				if (token == 'x') {
					numbers.push(Infinity)
				}
				if (token.match(/^\d+$/)) {
					numbers.push(parseInt(token))
				}
				else {
					this.platform = token
				}
			}

			this.major = numbers[0]
			if (numbers.length > 1) {
				this.minor = numbers[1]

				if (numbers.length > 2) {
					this.revision = numbers[2]
				}
			}

			this.value
				= Version.get_finite_value(this.major) * 10000
			+ Version.get_finite_value(this.minor) * 100
			+ Version.get_finite_value(this.revision)
		}

		static is_valid_format(text:string) {
			return text.match(/^\d+(\.(\d+|x))?(\.(\d+|x))?(\.\w+)?$/)
		}

		static get_finite_value(integer:number):number {
			return isFinite(integer)
				? integer
				: 0
		}
	}
}