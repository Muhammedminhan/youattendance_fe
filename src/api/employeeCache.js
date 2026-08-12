import { listEmployees, getEmployee } from './employees';

let _list = null;
let _listPromise = null;

export function getCachedEmployees() {
  if (_list) return Promise.resolve(_list);
  if (!_listPromise) {
    _listPromise = listEmployees()
      .then(data => { _list = data; return data; })
      .catch(err => { _listPromise = null; throw err; });
  }
  return _listPromise;
}

export { getEmployee };

export function clearEmployeeCache() {
  _list = null;
  _listPromise = null;
}

export function empInitials(name = '') {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const COLORS = [
  'linear-gradient(135deg,#2563EB,#1E40AF)',
  'linear-gradient(135deg,#E11D48,#9F1239)',
  'linear-gradient(135deg,#059669,#047857)',
  'linear-gradient(135deg,#7C3AED,#6D28D9)',
  'linear-gradient(135deg,#D97706,#B45309)',
  'linear-gradient(135deg,#0891B2,#0E7490)',
];

export function empColor(id = '') {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[h];
}
