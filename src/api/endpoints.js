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

  listar: () =>
    api.get('/colegios'),

  crear: (data) =>
    api.post('/colegios', data),

  actualizar: (id, data) =>
    api.put(`/colegios/${id}`, data),

  eliminar: (id) =>
    api.delete(`/colegios/${id}`),

}


export const analyticsApi = {
  resumen: () => api.get('/analytics/resumen'),
  colegios: () => api.get('/analytics/colegios'),
  carreras: () => api.get('/analytics/carreras'),
  topVisitantes: () => api.get('/analytics/top-visitantes'),
}

export const triviaApi = {
  listar: (carrera_id) => api.get('/trivia/admin', { params: carrera_id ? { carrera_id } : {} }),
  obtener: (id) => api.get(`/trivia/admin/${id}`),
  crear: (data) => api.post('/trivia/admin', data),
  actualizar: (id, data) => api.put(`/trivia/admin/${id}`, data),
  eliminar: (id) => api.delete(`/trivia/admin/${id}`),
}

export const rewardsApi = {

  listarAdmin: () =>
    api.get('/premios/admin'),

  crear: (data) =>
    api.post('/premios/admin', data),

  actualizar: (id, data) =>
    api.put(`/premios/admin/${id}`, data),

  eliminar: (id) =>
    api.delete(`/premios/admin/${id}`),

  canjes: () =>
    api.get('/premios/admin/canjes'),

  uploadImagen: (file) => {

    const formData = new FormData()

    formData.append('imagen', file)

    return api.post(
      '/premios/admin/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
  },

}

export const remindersApi = {
  listarAdmin: () => api.get('/recordatorios/admin'),
  crearAdmin: (data) => api.post('/recordatorios/admin', data),
  actualizarAdmin: (id, data) => api.put(`/recordatorios/admin/${id}`, data),
  eliminarAdmin: (id) => api.delete(`/recordatorios/admin/${id}`),
}

export const feedbackApi = {
  listarAdmin: () => api.get('/feedback/admin'),
  crear: (data) => api.post('/feedback/admin', data),
  actualizar: (id, data) => api.put(`/feedback/admin/${id}`, data),
  eliminar: (id) => api.delete(`/feedback/admin/${id}`),
  respuestas: () => api.get('/feedback/admin/respuestas'),
  respuestasPregunta: (id) => api.get(`/feedback/admin/${id}/respuestas`),
}
export const qrApi = {

  generar: (data) =>
    api.post(
      '/qr/admin/generar',
      data
    ),

  listarGenerados: () =>
    api.get(
      '/qr/admin/generados'
    ),

  historial: () =>
    api.get(
      '/qr/admin/escaneos'
    ),

}