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
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.25"
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
    "leaflet": "github:Leaflet/Leaflet@1.5.1",
    "text": "github:systemjs/plugin-text@0.0.11"
  },
  packages: {}
});
