// @ts-nocheck
/** biome-ignore-all lint: reason */

/**
 * Apathy Theme Demo File
 * This file showcases the various syntax highlighting features
 * TODO: Add more examples
 * FIXME: Fix any color issues
 * NOTE: This is just for demonstration
 */

// Import statements
import React, { useState, useEffect } from "react"; // [semantic: namespace + function imports]
import { someFunction } from "./utils"; // [semantic: function import]

// Constants and variables

const THEME_NAME = "Apathy"; // [semantic: variable.readonly.declaration + string]
const VERSION = "1.0.0"; // [semantic: variable.readonly.declaration + string]

let isDarkMode = true; // [semantic: variable.declaration + boolean]
var oldStyleVar = "deprecated"; // [semantic: variable.declaration + string]

// Class definition
class ThemeDemo { // [semantic: class.declaration]
  constructor(name) { // [semantic: method.declaration + parameter]
    this.name = name; // [semantic: property + parameter]
    this.colors = { // [semantic: property]
      background: "#0F0D1A", // [semantic: property + string]
      foreground: "#E6E2D1", // [semantic: property + string]
      accent: "#FF7A00", // [semantic: property + string]
    };
  }

  // Method with various syntax elements
  async getDemoData(param1, param2 = "default") { // [semantic: method.async.declaration + parameters]
    try {
      // String literals and template strings
      const message = `Hello ${this.name}!`; // [semantic: variable.readonly.declaration + string + property]
      const singleQuoted = "Single quoted string"; // [semantic: variable.readonly.declaration + string]
      const doubleQuoted = "Double quoted string"; // [semantic: variable.readonly.declaration + string]

      // Numbers and booleans
      const numbers = [42, 3.14, 0xff, 0b1010]; // [semantic: variable.readonly.declaration + numbers]
      const flags = [true, false, null, undefined]; // [semantic: variable.readonly.declaration + keywords]

      // Regular expressions
      const regex = /^[a-zA-Z0-9]+$/gi; // [semantic: variable.readonly.declaration + regexp]

      // Functions and arrow functions
      const processData = (data) => { // [semantic: variable.readonly.declaration + function + parameter]
        return data.map((item) => item.toLowerCase()); // [semantic: parameter + method + parameter + method]
      };

      // Control flow
      if (param1 && param2) { // [semantic: parameter + operator + parameter]
        for (let i = 0; i < numbers.length; i++) { // [semantic: variable + variable + property]
          console.log(`Number ${i}: ${numbers[i]}`); // [semantic: variable + method + variable + variable]
        }
      } else {
        throw new Error("Invalid parameters"); // [semantic: keyword + class + string]
      }

      // Async operations
      const result = await fetch("/api/data"); // [semantic: variable.readonly.declaration + function + string]
      return await result.json(); // [semantic: variable + method]
    } catch (error) { // [semantic: variable.declaration]
      console.error("Error:", error.message); // [semantic: variable + method + string + variable + property]
      return null; // [semantic: keyword]
    }
  }
}

// Function expressions
const createTheme = function (options = {}) { // [semantic: variable.readonly.declaration + function + parameter]
  const defaultOptions = { // [semantic: variable.readonly.declaration]
    name: "Default", // [semantic: property + string]
    type: "dark", // [semantic: property + string]
    ...options, // [semantic: parameter]
  };

  return new ThemeDemo(defaultOptions.name); // [semantic: class + variable + property]
};

// Arrow functions with destructuring
const { name, type } = createTheme({ name: "Apathy", type: "dark" }); // [semantic: variable.readonly.declaration + function]

// Modern JavaScript features
const themeConfig = { // [semantic: variable.readonly.declaration]
  ...defaultOptions, // [semantic: variable]
  features: ["syntax-highlighting", "ui-theming", "git-integration"], // [semantic: property + strings]
  isRecommended: true, // [semantic: property + boolean]
};

// Export statement
export { ThemeDemo, createTheme }; // [semantic: class + function exports]
export default themeConfig; // [semantic: variable export]

Project.prototype.addItem = function (itemName) { // [semantic: variable + property + function + parameter]
  for (item in cart["trick"]) { // [semantic: variable + variable + property]
    this.ageNum = opts / 13; // NOTE This is an arbitrary number for now.- // [semantic: property + variable + operator + number]
    Cart.create({ // [semantic: variable + method]
      melons: true, // HACK This will clear out your bank account.- // [semantic: property + boolean]
      count: 34 + 4347, // TODO validation on these options. - // [semantic: property + numbers]
      when: "Super duper color man!", // XXX Nice and colored memos. - // [semantic: property + string]
    });
  }
};
var utilityCreate = function (numBoxes, location) { // [semantic: variable.declaration + function + parameters]
  var parts = namespace.split("."), // [semantic: variable + variable + method + string]
    name = parts.pop; // [semantic: variable + variable + property]
  // Apparently 'insert' blocks on server if called-
  if (/^\s (.*) [0-9a-z]+||>?a$/.test(parts["name"])) // [semantic: regexp + method + variable]
    throw new Error("Oh noes!"); // [semantic: keyword + class + string]
  // Make sure this works
  return !isTypeSet(chapter) ? setTypeYes : MyClass.create(); // [semantic: function + variable + variable + variable + method]
};

// ----------------------------------------------------------------------------
// @Component - create items factory
// ----------------------------------------------------------------------------
if ((themeName && window.shouldRun) || catalog === null) { // [semantic: variable + variable + property + variable + keyword]
  // XXX Might want to namespace
  window["property"].apply(this, arguments); // [semantic: variable + property + method + variable]

  // pubsub
  if (Meteor.isServer) { // [semantic: variable + property]
    Meteor.publish(null, function () { // [semantic: variable + method + function]
      return NoGuessworkChapters._collection.find(); // [semantic: variable + property + method]
    });
    NoGuessworkChapters.allow({ // [semantic: variable + method]
      insert: function () { // [semantic: property + function]
        return true; // Allow insertions // [semantic: boolean]
      },
      update: function () { // [semantic: property + function]
        return null; // Allow updates // [semantic: boolean]
      },
      remove: function () { // [semantic: property + function]
        return true; // Allow removals // [semantic: boolean]
      },
    });
  }
}
