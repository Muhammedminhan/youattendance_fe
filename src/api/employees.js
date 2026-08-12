import api from './client';

export async function listEmployees() {
  const res = await api.get('/v1/employees/');
  return res.data.employees;
}

export async function getEmployee(employeeId) {
  const res = await api.get(`/v1/employees/${employeeId}/`);
  return res.data.employee;
}
