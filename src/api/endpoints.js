import { api } from './client'

export const authApi = {
  login: (correo, password) => api.post('/auth/admin/login', { correo, password }),
  me: () => api.get('/auth/admin/me'),
  listar: () => api.get('/auth/admin'),
  crear: (data) => api.post('/auth/admin', data),
  actualizar: (id, data) => api.put(`/auth/admin/${id}`, data),
  cambiarPassword: (id, password) => api.patch(`/auth/admin/${id}/password`, { password }),
  eliminar: (id) => api.delete(`/auth/admin/${id}`),
}

export const carrerasApi = {
  listar: () => api.get('/carreras'),
  crear: (data) => api.post('/carreras', data),
  actualizar: (id, data) => api.put(`/carreras/${id}`, data),
  eliminar: (id) => api.delete(`/carreras/${id}`),
}

export const colegiosApi = {
  listar: () => api.get('/colegios'),
  crear: (nombre) => api.post('/colegios', { nombre }),
  actualizar: (id, nombre) => api.put(`/colegios/${id}`, { nombre }),
  eliminar: (id) => api.delete(`/colegios/${id}`),
}

export const triviaApi = {
  listar: (carrera_id) =>
    api.get('/trivia/admin', { params: carrera_id ? { carrera_id } : {} }),
  crear: (data) => api.post('/trivia/admin', data),
  actualizar: (id, data) => api.put(`/trivia/admin/${id}`, data),
  eliminar: (id) => api.delete(`/trivia/admin/${id}`),
}

export const premiosApi = {
  listar: () => api.get('/premios/admin'),
  crear: (data) => api.post('/premios/admin', data),
  actualizar: (id, data) => api.put(`/premios/admin/${id}`, data),
  eliminar: (id) => api.delete(`/premios/admin/${id}`),
  canjes: () => api.get('/premios/admin/canjes'),
}

export const feedbackApi = {
  listar: () => api.get('/feedback/admin'),
  crear: (data) => api.post('/feedback/admin', data),
  actualizar: (id, data) => api.put(`/feedback/admin/${id}`, data),
  eliminar: (id) => api.delete(`/feedback/admin/${id}`),
  respuestas: () => api.get('/feedback/admin/respuestas'),
}

export const recordatoriosApi = {
  listar: () => api.get('/recordatorios/admin'),
  crear: (data) => api.post('/recordatorios/admin', data),
  actualizar: (id, data) => api.put(`/recordatorios/admin/${id}`, data),
  eliminar: (id) => api.delete(`/recordatorios/admin/${id}`),
}

export const analyticsApi = {
  resumen: () => api.get('/analytics/resumen'),
  colegios: () => api.get('/analytics/colegios'),
  carreras: () => api.get('/analytics/carreras'),
  topVisitantes: () => api.get('/analytics/top-visitantes'),
}
