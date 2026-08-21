import { listEmployees, getEmployee as apiGetEmployee } from './employees';

export const MOCK_EMPLOYEES = [
  { employee_id:'EMP001', employee_name:'Arjun Menon',       email:'arjun.menon@company.com',     status:'Active',        shift_start_time:'09:00', shift_end_time:'18:00' },
  { employee_id:'EMP002', employee_name:'Priya Nair',        email:'priya.nair@company.com',       status:'Active',        shift_start_time:'09:00', shift_end_time:'18:00' },
  { employee_id:'EMP003', employee_name:'Rahul Sharma',      email:'rahul.sharma@company.com',     status:'Active',        shift_start_time:'08:30', shift_end_time:'17:30' },
  { employee_id:'EMP004', employee_name:'Sneha Pillai',      email:'sneha.pillai@company.com',     status:'Probation',     shift_start_time:'10:00', shift_end_time:'19:00' },
  { employee_id:'EMP005', employee_name:'Vikram Patel',      email:'vikram.patel@company.com',     status:'Active',        shift_start_time:'09:00', shift_end_time:'18:00' },
  { employee_id:'EMP006', employee_name:'Anjali Krishnan',   email:'anjali.krishnan@company.com',  status:'Active',        shift_start_time:'09:30', shift_end_time:'18:30' },
  { employee_id:'EMP007', employee_name:'Mohammed Faiz',     email:'faiz.m@company.com',           status:'Notice period', shift_start_time:'09:00', shift_end_time:'18:00' },
  { employee_id:'EMP008', employee_name:'Deepa Mathew',      email:'deepa.mathew@company.com',     status:'Active',        shift_start_time:'08:00', shift_end_time:'17:00' },
  { employee_id:'EMP009', employee_name:'Sanjay Kumar',      email:'sanjay.kumar@company.com',     status:'Active',        shift_start_time:'09:00', shift_end_time:'18:00' },
  { employee_id:'EMP010', employee_name:'Lakshmi Rao',       email:'lakshmi.rao@company.com',      status:'Probation',     shift_start_time:'10:00', shift_end_time:'19:00' },
  { employee_id:'EMP011', employee_name:'Aditya Singh',      email:'aditya.singh@company.com',     status:'Active',        shift_start_time:'09:00', shift_end_time:'18:00' },
  { employee_id:'EMP012', employee_name:'Nisha Thomas',      email:'nisha.thomas@company.com',     status:'Terminated',    shift_start_time:'09:00', shift_end_time:'18:00' },
];

let _list = null;
let _listPromise = null;

export function getCachedEmployees() {
  if (_list) return Promise.resolve(_list);
  if (!_listPromise) {
    _listPromise = listEmployees()
      .then(data => { _list = data; return data; })
      .catch(err => {
        _listPromise = null;
        // No backend — return mock data without caching it so real data loads when backend comes up
        if (!err.response) return MOCK_EMPLOYEES;
        throw err;
      });
  }
  return _listPromise;
}

export async function getEmployee(employeeId) {
  // Check live cached list first
  if (_list) {
    const found = _list.find(e => e.employee_id === employeeId);
    if (found) return found;
  }
  try {
    return await apiGetEmployee(employeeId);
  } catch (err) {
    if (!err.response) {
      const found = MOCK_EMPLOYEES.find(e => e.employee_id === employeeId);
      if (found) return found;
      // Not in mock either — signal 404
      const notFound = new Error('Not found');
      notFound.response = { status: 404 };
      throw notFound;
    }
    throw err;
  }
}

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
