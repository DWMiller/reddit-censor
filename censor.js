function hashCode(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(i) {
  var c = (i & 0x00ffffff).toString(16).toUpperCase();

  return '00000'.substring(0, 6 - c.length) + c;
}

function getFields() {
  const authorFields = [...document.querySelectorAll('.commentarea .author')];

  const sorted = authorFields.reduce((acc, element) => {
    const username = element.innerHTML;

    if (!acc[username]) {
      acc[username] = {
        color: intToRGB(hashCode(username)),
        elements: [],
      };
    }

    acc[username].elements.push(element);

    return acc;
  }, {});

  return sorted;
}

function colorize(user) {
  user.elements.forEach(function(element) {
    element.style.backgroundColor = `#${user.color}`;
    element.style.color = `#${user.color}`;
  });
}

const data = getFields();

for (let user in data) {
  colorize(data[user]);
}
