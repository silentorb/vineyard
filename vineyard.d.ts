/// <reference path="../vineyard-ground/defs/node.d.ts" />
/// <reference path="../vineyard-metahub/metahub.d.ts" />
/// <reference path="../vineyard-ground/ground.d.ts" />
interface Bulb_Configuration {
    path?: string;
    class?: string;
    parent?: string;
}
declare class Vineyard {
    public bulbs: any;
    public config: any;
    public config_folder: any;
    public ground: Ground.Core;
    public root_path: string;
    private validator;
    private json_schemas;
    constructor(config_file: string);
    static create_ground(db_name: string, databases: any, trellis_files: any, metahub_files?: any): Ground.Core;
    public get_bulb(name: string): Promise;
    public load_bulb(name: string): void;
    public load_all_bulbs(): void;
    public load_config(config_file: string): any;
    static deep_merge(source: any, target: any): any;
    public start(): Promise;
    public stop(): Promise;
    public load_json_schema(name: any, path: any): void;
    public add_json_schema(name: any, schema: any): void;
    public find_schema_errors(data: any, schema_name: any): any;
}
declare module Vineyard {
    interface IUser {
        id?: any;
        name?: string;
        roles?: IRole[];
    }
    interface IRole {
        id?: any;
        name?: string;
    }
    class Bulb extends MetaHub.Meta_Object {
        public vineyard: Vineyard;
        public config: any;
        public ground: Ground.Core;
        constructor(vineyard: Vineyard, config: any);
        public grow(): void;
        public start(): void;
        public stop(): void;
    }
}
declare module "vineyard" {
  export = Vineyard
}