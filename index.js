// console.log(__dirname);

var { createReadStream, createWriteStream } = require("fs");
var path = require("path");
const { prototype } = require("stream");
var inputFile = path.join(__dirname, "src", "input.xml");
var outputFile = path.join(__dirname, "src", "output.xml");

// Add a prototype to String for replacing a character at a particular index
String.prototype.replaceAtIndex = function (index, replacedValue) {
  if (index >= this.length) {
    return this.valueOf();
  }
  return this.substring(0, index) + replacedValue + this.substring(index + 1);
};

// Add a prototype to String for adding a character at a particular index
String.prototype.addAtIndex = function (index, newChar) {
  if (index > this.length) {
    return this.valueOf();
  }

  return this.substring(0, index) + newChar + this.substring(index);
};

/**
 * Chunk of data as a string
 * @param {*} parsedData
 * Key for which value has to be replaced
 * @param {*} key
 * New value to be replaced
 * @param {*} newVal
 */
var changeKey = function (parsedData, key, newVal) {
  // Find Index of key
  var index = parsedData.indexOf(key);

  // If key exists, replace oldval with new val
  if (index) {
    var fIndex = parsedData.indexOf('"', index);
    var sIndex = parsedData.indexOf('"', fIndex + 1);
    var oldVal = parsedData.substring(fIndex + 1, sIndex);

    var count = 0;
    // Replace characters upto the length of olVal
    while (count < newVal.length && count < oldVal.length) {
      parsedData = parsedData.replaceAtIndex(fIndex + count + 1, newVal[count]);
      count++;
    }

    // If older value in longer than new value, replace remaining character with empty string
    if (oldVal.length > newVal.length) {
      for (count = 0; count < oldVal.length - newVal.length; count++) {
        parsedData = parsedData.replaceAtIndex(fIndex + newVal.length + 1, "");
      }
    }
    // If older value is shorter than new value, add remaining character of new value to chunk
    else {
      for (count = 0; count < newVal.length - oldVal.length; count++) {
        parsedData = parsedData.addAtIndex(
          sIndex + count,
          newVal[oldVal.length + count]
        );
      }
    }

    return parsedData;
  }
  // If key does not exists, return the chunk as it is
  else {
    return parsedData;
  }
};

/**
 * Key to replace
 * @param {*} key
 * New Value for the key
 * @param {*} newVal
 */
var changeParam = function (key, newVal) {
  var readStream = createReadStream(inputFile, { encoding: "utf-8" });
  var writeStream = createWriteStream(outputFile, { encoding: "utf-8" });
  readStream.on("data", function (chunk) {
    // If chuck contains the key, call helper function to replace value of the key
    if (chunk.toString().includes(key)) {
      writeStream.write(changeKey(chunk.toString(), key, newVal));
    }
    // If chunk does not contain a key, write chunk as it is
    else {
      writeStream.write(chunk.toString());
    }
  });

  // When the input file is complete, close the write stream
  readStream.on("close", function () {
    writeStream.close();
  });
};

// Test case 1 - With new value shorter than old value
// changeParam("android:label", "shorterVal");

// Test case 2 - With new value longer than old value
changeParam("android:label", "LoooooooooooongerVal");
