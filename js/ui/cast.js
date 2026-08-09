// Cast presentation helpers.
export const castPortraits=[
'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=480&h=600&q=88',
'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=480&h=600&q=88'
];
export function portraitFor(name){let hash=0;for(const char of name)hash=(hash*31+char.charCodeAt(0))>>>0;return castPortraits[hash%castPortraits.length]}
export function castCard(person){const name=typeof person==='string'?person:person.name;const role=typeof person==='string'?'Featured cast':(person.character||'Cast');const photo=typeof person==='string'?portraitFor(name):(person.photo||portraitFor(name));const initials=name.split(/\s+/).map(part=>part[0]).join('').slice(0,2);return `<article class="cast-card"><div class="cast-photo"><img src="${photo}" alt="Portrait of ${name}" loading="lazy" decoding="async" width="480" height="600" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden aria-hidden="true">${initials}</span></div><div class="cast-copy"><strong>${name}</strong><small>${role}</small></div></article>`}
