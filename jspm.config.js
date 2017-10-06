SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "q-quiz/": "script_src/",
    "github:": "jspm_packages/github/"
  },
  browserConfig: {
    "baseURL": "/"
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.21"
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "q-quiz": {
      "main": "q-quiz.js",
      "meta": {
        "*.js": {
          "loader": "plugin-babel"
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "core-js": "npm:core-js@2.5.1",
    "fs": "npm:jspm-nodelibs-fs@0.2.1",
    "leaflet": "github:Leaflet/Leaflet@1.0.3",
    "path": "npm:jspm-nodelibs-path@0.2.3",
    "process": "npm:jspm-nodelibs-process@0.2.1",
    "text": "github:systemjs/plugin-text@0.0.9"
  },
  packages: {}
});
