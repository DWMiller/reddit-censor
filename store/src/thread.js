// Invented users and comments so store images show no real people.
const POST = ['sourdough_sam', 'My starter finally doubled after three weeks. What should I bake first?', '#f59e0b', '#b45309'];
const COMMENTS = [
  [0, 'kiln_and_crumb', 'Plain country loaf. Learn one recipe well before you try anything fancy.', '1.2k', '#38bdf8', '#1e3a8a'],
  [1, 'sourdough_sam', 'That was my plan. Any hydration you would start with?', '214', '#f59e0b', '#b45309'],
  [2, 'kiln_and_crumb', '70 percent. Easy to shape, still gets an open crumb.', '187', '#38bdf8', '#1e3a8a'],
  [0, 'rye_humor', 'Pancakes with the discard. Then the loaf. Ask u/kiln_and_crumb, their guide got me started.', '640', '#34d399', '#065f46'],
  [1, 'oven_spring_42', 'Seconding discard pancakes.', '92', '#c084fc', '#4c1d95'],
  [0, 'proofing_drawer', 'Focaccia. It forgives everything.', '388', '#fda4af', '#9f1239'],
];

// Same hash the extension uses, so the colors match what users will see.
function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (name.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  return `hsl(${Math.abs(hash) % 360} 70% 50%)`;
}

const user = (name, prefix = '') => `<span class="user" style="--c:${colorFor(name)}">${prefix}${name}</span>`;
const linkify = (text) => text.replace(/u\/(\w+)/g, (_, name) => user(name, 'u/'));

// <div class="thread" data-count="6" data-censored>
document.querySelectorAll('.thread').forEach((el) => {
  if (el.dataset.censored !== undefined) el.classList.add('censored');
  const count = +(el.dataset.count || COMMENTS.length);
  const [op, title, a, b] = POST;
  const post =
    el.dataset.post === undefined
      ? ''
      : `<div class="post"><div class="by"><span class="avatar" style="--a:${a};--b:${b};--c:${colorFor(op)}"></span>${user(op)} • 5 hr. ago</div><div class="title">${title}</div></div>`;
  el.innerHTML =
    post +
    COMMENTS.slice(0, count)
      .map(
        ([depth, name, text, votes, a, b]) => `<div class="comment d${depth}">
        <span class="avatar" style="--a:${a};--b:${b};--c:${colorFor(name)}"></span>
        <div class="body">
          <div class="by">${user(name)}${name === op ? '<span class="op">OP</span>' : ''} • ${depth + 2} hr. ago</div>
          <div class="text">${linkify(text)}</div>
          <div class="votes">▲ ${votes} ▼ &nbsp; Reply &nbsp; Share</div>
        </div>
      </div>`
      )
      .join('');
});
