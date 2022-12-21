function readFile() {
  // read json file and replace the content
  var file = document.getElementById("file").files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    var css = CoverageExtrator(e.target.result);

    // Reset elements to default
    if (document.getElementById("content").innerHTML != "") {
      document.getElementById("content").innerHTML = "";
      // Remove class show from copy button
      document.getElementById("copy").classList.remove("show");
    }

    // Add show class to content parent
    document.getElementById("content").parentElement.classList.add("show");

    document.getElementById("content").innerHTML = css;
    ShowElement("download");
    ShowElement("copy");
    document.getElementById("download").scrollIntoView({ behavior: "smooth" });
    document.getElementById("file").value = "";
  };

  reader.readAsText(file);
}

// Download unstyled text
function download() {
  var text = document.getElementById("content").innerText;
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", "coverage.css");
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
// Copy unstyled text to clipboard
function copyToClipboard() {
  var text = document.getElementById("content").innerText;
  var element = document.createElement("textarea");
  element.value = text;
  element.setAttribute("readonly", "");
  element.style.position = "absolute";
  element.style.left = "-9999px";
  document.body.appendChild(element);
  element.select();
  document.execCommand("copy");
  document.body.removeChild(element);
}

// Show a message when the copy button is clicked
const copyButton = document.getElementById("copy");
copyButton.addEventListener("click", function () {
  copyButton.value = "Copied!";
  setTimeout(function () {
    copyButton.value = "Copy to clipboard";
  }, 2000);
});

function ShowElement(element) {
  document.getElementById(element).classList.add("show");
}


function CoverageExtrator(json) {
  var css = "";
  var json = JSON.parse(json);

  // Verify if the json key url have an css extension
  for (var i = 0; i < json.length; i++) {
    if (json[i].url.match(/.css$/)) {
      // Add the css to the variable css
      FileUrl = "  File: " + json[i].url;
      var Repeat = "-".repeat(FileUrl.length);
      if (document.getElementById("showcss").checked) {
        css +=
          "<span style='color:darkgreen'>/*" +
          Repeat +
          "/*\n " +
          FileUrl +
          "\n/*" +
          Repeat +
          "*/\n</span>";
      } else {
        css += "/*" + Repeat + "/*\n " + FileUrl + "\n/*" + Repeat + "*/\n";
      }

      Ranges = [];

      // Loop through the json key ranges and add the [start and end] of the range to the array Ranges
      for (var j = 0; j < json[i].ranges.length; j++) {
        Ranges.push({
          Start: json[i].ranges[j].start,
          End: json[i].ranges[j].end,
        });
      }

      let markedText = "";
      let currentPositon = 0;
      let MediaOpen = false;

      for (var j = 0; j < json[i].ranges.length; j++) {
        // Get the length of the range
        var RgStart = json[i].ranges[j].start;
        var RgEnd = json[i].ranges[j].end;
        // Get the text of the range
        rule = json[i].text.slice(currentPositon, RgStart); // Get the text before the range
        markedText = json[i].text.slice(RgStart, RgEnd); // Get the text of the range
        currentPositon = RgEnd; // Set the current position to the end of the range
        OriginalRule = rule; // Save the original rule

        // ==================== Text before the range ====================
        // If Media is open, find the position of the first pair of closing curly braces with space or new line
        if (MediaOpen) {
          var MediaClose = rule.search(/\}\s*\}|\}\s*\n*\s*\}/);
          // If MediaClose is smaller than 0, it means that the media is still open
          if (MediaClose < 0) {
            // Check if the closing curly brace comes before opening
            var OpenBrace = rule.indexOf("{");
            var CloseBrace = rule.indexOf("}");
            if (OpenBrace > CloseBrace) {
              // If the position of the first { is greater than 0, it means that the media is closed
              // Add the text before the { to the css variable
              MediaClose = rule.indexOf("}") - 1;
            }
          }

          // If the position of the first }} is greater than 0, it means that the media is closed
          if (MediaClose > 0) {
            if (document.getElementById("showcss").checked) {
              // Add the text before the }} to the css variable
              css += rule.slice(0, MediaClose + 1);
              // Add the text of } styled to the css variable
              css += "\n<span style='color:blue'>}</span>";

              rule = rule.slice(MediaClose + 2, rule.length);
            } else {
              css += "\n}";
            }

            MediaOpen = false;
          }
        }

        // Check if have @media in the original rule
        var MediaRule = OriginalRule.lastIndexOf("@media");

        if (MediaRule > 0) {
          // If MediaRule is greater than 0, it means that the rule have @media

          if (MediaOpen == false) {
            // If MediaOpen is false, it means that the media is closed
            // Add the text before the @media to the css variable
            if (document.getElementById("showcss").checked) {
              before = rule.slice(0, rule.lastIndexOf("@media"));
              css += before;
            }

            // Search for the first of curly brace after the @media
            var OpenBrace = OriginalRule.indexOf("{", MediaRule);
            // Count the number of curly braces between the @media and the final of the original rule, if the number of curly braces is odd, it means that the media is open
            var Braces =
              (
                OriginalRule.slice(MediaRule, OriginalRule.length).match(
                  /\{/g
                ) || []
              ).length -
              (
                OriginalRule.slice(MediaRule, OriginalRule.length).match(
                  /\}/g
                ) || []
              ).length;
            // If the number of curly braces is greater than 0, it means that the media is open
            if (Braces != 0) {
              mediaHeader = OriginalRule.slice(MediaRule, OpenBrace + 1);
              if (document.getElementById("showcss").checked) {
                css += "\n<span style='color:blue'>" + mediaHeader + "</span>";
                afterMedia = OriginalRule.slice(OpenBrace + 1, rule.length);
              } else {
                css += "\n" + mediaHeader;
              }

              MediaOpen = true;
            } else {
              if (document.getElementById("showcss").checked) {
                afterMedia = OriginalRule.slice(MediaRule, rule.length);
              }

              MediaOpen = false;
            }
            if (document.getElementById("showcss").checked) {
              rule = afterMedia;
            }
          }
        }

        // Add the text to the css variable
        if (document.getElementById("showcss").checked) {
          css += rule;
        }

        // ==================== Marked text ====================
        if (document.getElementById("showcss").checked) {
          // Add the text of the range to the css variable with the style
          css += "<span class='marked'>" + markedText + "</span>";
        } else {
          // Add the text of the range to the css variable with the style
          css += markedText + "\n";
        }
      }
      // ==================== Text after the last range ====================
      // Get the text after the last range
      var lastText = json[i].text.slice(currentPositon, json[i].text.length);
      if (MediaOpen) {
        // Find the position of the first pair of curly braces
        var MediaClose = lastText.search(/\}\s*\}/);
        if (MediaClose < 0) {
          // Search for the position of first curly brace indexof
          MediaClose = lastText.indexOf("}");
        }

        // If the position of the first }} is greater than 0, it means that the media is closed
        if (MediaClose > 0) {
          // Add the text before the }} to the css variable
          before = lastText.slice(0, MediaClose + 1);
          // If var before is different from just one }
          if (before != "\n}") {
            if (document.getElementById("showcss").checked) {
              css += before;
            }
          }

          if (document.getElementById("showcss").checked) {
            // Add the text of } styled to the css variable
            css += "\n<span style='color:blue'>}\n</span>";
            // Add the text after the }} to the css variable
            css += lastText.slice(MediaClose + 2, lastText.length) + "\n";
          } else {
            css += "}\n";
          }
          MediaOpen = false;
        } else {
          if (document.getElementById("showcss").checked) {
            // Add the text after the last range to the css variable
            css += lastText + "\n";
          }
        }
      } else {
        if (document.getElementById("showcss").checked) {
          // Add the text after the last range to the css variable
          css += lastText + "\n";
        }
      }
    }
  }

    return css;
  
}
