/// <reference path="defs/metahub.d.ts" />
declare module Vineyard {
    class Framework {
        public modules: {
            [name: string]: Vineyard.Module;
        };
        public config;
        public config_folder;
        constructor(config_file?: string);
        public load_modules(modules): void;
        public load(config_file: string): void;
        public start(): void;
    }
}
declare module Vineyard {
    class Module extends MetaHub.Meta_Object {
        public vineyard: Vineyard.Framework;
        constructor(vineyard: Vineyard.Framework);
    }
}
