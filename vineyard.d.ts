/// <reference path="ground.d.ts" />
/// <reference path="metahub.d.ts" />
declare module Vineyard {
    class Soil {
        public bulbs: {
            [name: string]: Vineyard.Bulb;
        };
        public config;
        public config_folder;
        public ground: Ground.Core;
        constructor(config_file?: string);
        static create_ground(db_name: string, databases, trellis_files): Ground.Core;
        public load_bulbs(bulbs): void;
        public load(config_file: string): void;
        public grow(): void;
    }
}
declare module Vineyard {
    class Bulb extends MetaHub.Meta_Object {
        public soil: Vineyard.Soil;
        public config;
        constructor(soil: Vineyard.Soil, config);
        public grow(): void;
    }
}
declare module "vineyard" {
  export = Vineyard
}