const _ = require("lodash")
const uuid = require("uuid")

exports.check_roles = function (request, response, next, paths) {
  //console.log(`Check roles path: ${request.path} method: ${request.method} `)

  //console.log(request.path, request.method)
  var session = request.session
  //console.log("logged", request.path)

  //  if (session.isLogged == undefined) {
  //console.log("logueado", session.isLogged)

  for (let i = 0; i < paths.length; i++) {
    if (paths[i]["permisos"] == undefined && request.path == paths[i].path) {
      //console.log("check roles dice que pasa", request.path)
      next()
      return
    }
  }
  if (session.isLogged == undefined || session.u_data == undefined) {
    console.log("no tiene session", request.headers)
    response.send({ stat: false, code: "DO_LOGIN" })
    return
  }

  let matching_path = _.find(paths, { path: request.path })
  //console.log(",at", matching_path)
  if (!matching_path) {
    console.log("path not found", request.path, request.method)
    if (process.env.mode == "dev") { response.send({ stat: false, text: "No está definido en roles" }) }
    else { response.send({ stat: false, text: "¿¿ guien só??" }) }
    return
  }

  //Validacion de permisos
  console.log(session)
  for (let i = 0; i < paths.length; i++) {
    if (request.path == paths[i].path)
      for (let c = 0; c < session.u_data?.permisos?.length; c++) {
        for (let d = 0; d < paths[i].permisos.length; d++) {
          if (session.u_data.permisos[c] === paths[i].permisos[d]) {
            if (session.u_data.forzar_cambio_clave == 1 && request.path !== "/auth/password_change") {
              console.log("tiene que cambiar clave", request.path)
              request.session.challenge = uuid.v4()
              response.send({ stat: true, data: { code: "DO_CHANGE_PASSWORD" }, code: "DO_CHANGE_PASSWORD" })
              return
            }
            next()
            return
          }
        }
      }
  }
  //si se llega acá es por que no se encontrò ningùn rol que coincida
  //TODO: HACK:
  console.log("[Middleware Helper] no verifica rol")
  response.send({ stat: false, code: "DO_LOGIN" })
  return
  next()









}
