#!/usr/bin/env node
"use strict";
const meow = require("meow");
const generate = require("./index");

const cli = meow(
  `
    Usage
      $ foo <input>
 
    Options
      --config, -c  Include a config file
 
    Examples
      $ foo --config=your.config.jjs
`,
  {
    flags: {
      config: {
        type: "string",
        alias: "c"
      }
    }
  }
);
/*
{
    input: ['unicorns'],
    flags: {rainbow: true},
    ...
}
*/
generate(cli.flags.config);
