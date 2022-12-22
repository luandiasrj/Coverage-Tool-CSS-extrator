function readFile() {
  var e = document.getElementById("file").files[0],
      t = new FileReader;
  t.onload = function(e) {
      var t = CoverageExtrator(e.target.result);
      "" != document.getElementById("content").innerHTML && (document.getElementById("content").innerHTML = "", document.getElementById("copy").classList.remove("show")), document.getElementById("content").parentElement.classList.add("show"), document.getElementById("content").innerHTML = t, document.getElementById("download").classList.add("show"), document.getElementById("copy").classList.add("show"), document.getElementById("download").scrollIntoView({
          behavior: "smooth"
      }), document.getElementById("file").value = ""
  };
  try {
      t.readAsText(e)
  } catch (n) {
      alert("Please select a valid json file")
  }
}

function download() {
  var e = document.getElementById("content").innerText,
      t = document.createElement("a");
  t.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(e)), t.setAttribute("download", "coverage.css"), t.style.display = "none", document.body.appendChild(t), t.click(), document.body.removeChild(t)
}

function copyToClipboard() {
  var e = document.getElementById("content").innerText,
      t = document.createElement("textarea");
  t.value = e, t.setAttribute("readonly", ""), t.style.position = "absolute", t.style.left = "-9999px", document.body.appendChild(t), document.getSelection().rangeCount > 0 && document.getSelection().removeAllRanges(), t.select(), document.execCommand("copy"), document.body.removeChild(t)
}
const copyButton = document.getElementById("copy");

function ShowElement(e) {
  document.getElementById(e).classList.add("show")
}

function CoverageExtrator(e) {
  for (var t = "", e = JSON.parse(e), n = 0; n < e.length; n++)
      if (e[n].url.match(/.css$/)) {
          FileUrl = "  File: " + e[n].url;
          var s = "-".repeat(FileUrl.length);
          document.getElementById("showcss").checked ? t += "<span style='color:darkgreen'>/*" + s + "/*\n " + FileUrl + "\n/*" + s + "*/\n</span>" : t += "/*" + s + "/*\n " + FileUrl + "\n/*" + s + "*/\n", Ranges = [];
          for (var l = 0; l < e[n].ranges.length; l++) Ranges.push({
              Start: e[n].ranges[l].start,
              End: e[n].ranges[l].end
          });
          let c = "",
              o = 0,
              a = !1;
          for (var l = 0; l < e[n].ranges.length; l++) {
              var d = e[n].ranges[l].start,
                  r = e[n].ranges[l].end;
              if (rule = e[n].text.slice(o, d), c = e[n].text.slice(d, r), o = r, OriginalRule = rule, a) {
                  var i = rule.search(/\}\s*\}|\}\s*\n*\s*\}/);
                  if (i < 0) {
                      var h = rule.indexOf("{");
                      h > rule.indexOf("}") && (i = rule.indexOf("}") - 1)
                  }
                  i > 0 && (document.getElementById("showcss").checked ? (t += rule.slice(0, i + 1), t += "\n<span style='color:blue'>}</span>", rule = rule.slice(i + 2, rule.length)) : t += "\n}", a = !1)
              }
              var g = OriginalRule.lastIndexOf("@media");
              if (g > 0 && !1 == a) {
                  document.getElementById("showcss").checked && (t += before = rule.slice(0, rule.lastIndexOf("@media")));
                  var h = OriginalRule.indexOf("{", g);
                  0 != (OriginalRule.slice(g, OriginalRule.length).match(/\{/g) || []).length - (OriginalRule.slice(g, OriginalRule.length).match(/\}/g) || []).length ? (mediaHeader = OriginalRule.slice(g, h + 1), document.getElementById("showcss").checked ? (t += "\n<span style='color:blue'>" + mediaHeader + "</span>", afterMedia = OriginalRule.slice(h + 1, rule.length)) : t += "\n" + mediaHeader, a = !0) : (document.getElementById("showcss").checked && (afterMedia = OriginalRule.slice(g, rule.length)), a = !1), document.getElementById("showcss").checked && (rule = afterMedia)
              }
              document.getElementById("showcss").checked && (t += rule), document.getElementById("showcss").checked ? t += "<span class='marked'>" + c + "</span>" : t += c + "\n"
          }
          var y = e[n].text.slice(o, e[n].text.length);
          if (a) {
              var i = y.search(/\}\s*\}/);
              i < 0 && (i = y.indexOf("}")), i > 0 ? ("\n}" != (before = y.slice(0, i + 1)) && document.getElementById("showcss").checked && (t += before), document.getElementById("showcss").checked ? (t += "\n<span style='color:blue'>}\n</span>", t += y.slice(i + 2, y.length) + "\n") : t += "}\n", a = !1) : document.getElementById("showcss").checked && (t += y + "\n")
          } else document.getElementById("showcss").checked && (t += y + "\n")
      } return t
}
copyButton.addEventListener("click", function() {
  copyButton.value = "Copied!", setTimeout(function() {
      copyButton.value = "Copy to clipboard"
  }, 2e3)
});