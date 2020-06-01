const fs = require("fs");
const path = require("path");

const oldBashrc = path.join(process.env["HOME"], ".bashrc");
const newBashrc = path.join(process.env["HOME"], ".newbashrc");

const replaceLines = {
  60: "    PS1=\"${debian_chroot:+($debian_chroot)}\\n\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\[\\033[33m\\]\\$(git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \\(.*\\)/ (\\1)/')\\n\\[\\033[0m\\033[0;32m\\] \\$\\[\\033[0m\\] \"",
  62: "    PS1=\"${debian_chroot:+($debian_chroot)}\\n\\u@\\h:\\w\\$(git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \\(.*\\)/ (\\1)/')\\n \\$ \""
};

const newBashrcWriteStream = fs.createWriteStream(newBashrc, { flags: 'a' });

const getLineToWrite = (line, lineNumber) => {
  if (replaceLines.hasOwnProperty(lineNumber)) {
    return `#${line}\n${replaceLines[lineNumber]}`;
  } else {
    return line;
  }
};

const oldData = fs.readFileSync(oldBashrc, 'UTF8');

oldData.split('\n').forEach((lineFromFile, lineIndex) => {
  const lineToWrite = getLineToWrite(lineFromFile, lineIndex + 1);
  newBashrcWriteStream.write(`${lineToWrite}\n`);
});

newBashrcWriteStream.close();

fs.renameSync(oldBashrc, path.join(process.env["HOME"], ".oldbashrc"));
fs.renameSync(newBashrc, oldBashrc);
