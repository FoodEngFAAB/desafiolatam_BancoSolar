//Importar paquetes requeridos para el desafío
const http = require('http')
const url = require('url')
const fs = require('fs')

//importacion de funciones asincronas de queries.js
const { insertDB, queryDB, editDB, deleteDB, transferDB, queryTransfDB } = require('./queries')

//Inicializa servidor
http

    .createServer(async (req, res) => {
        try {
            if (req.url == '/' & req.method === 'GET') {
                res.setHeader('content-type', 'text/html')
                const reading = fs.readFileSync('index.html', 'utf-8')
                res.end(reading)
            }
        } catch (error) {
            console.log('Ha ocurrido un error (.CREATESERVER). Comuníquese con el(la) administrador(a). Código:\n', error.code)
            res.end()
        }

        //Disponibiliza petición POST.
        if (req.url == '/usuario' && req.method === 'POST') {
            try {
                let body = ""
                req.on('data', (chunk) => {
                    body += chunk
                })
                req.on('end', async () => {
                    const dataDB = Object.values(JSON.parse(body))
                    const answer = await insertDB(dataDB)
                    res.end(JSON.stringify(answer))
                })
            } catch (error) {
                console.log('Ha ocurrido un error (calling POST QUERY). Usuario(a) no creado(a). Código:\n', error.code)
                res.end()
            }
        }

        //Disponibiliza petición GET
        //Consulta usuarios
        if (req.url == '/usuarios' && req.method === 'GET')
            try {
                const usersRegistered = await queryDB()
                res.end(JSON.stringify(usersRegistered.rows))
            } catch (error) {
                console.log('Ha ocurrido un error (calling GET QUERY). Comuníquese con el(la) administrador(a). Código:\n', error.code)
                res.end()
            }
        //Disponibiliza petición PUT
        if (req.url.startsWith('/usuario') && req.method === 'PUT') {
            const { id } = url.parse(req.url, true).query
            try {
                let body = ""
                req.on('data', (chunk) => {
                    body += chunk
                })
                req.on('end', async () => {
                    const dataDB = Object.values(JSON.parse(body))
                    const answer = await editDB(dataDB, id)
                    res.end(JSON.stringify(answer))
                })
            } catch (error) {
                console.log('Ha ocurrido un error (calling PUT QUERY). Registro no editado. Código:\n', error.code)
                res.end()
            }
        }
        //Disponibiliza petición DELETE
        if (req.url.startsWith('/usuario?') && req.method == 'DELETE') {
            try {
                const { id } = url.parse(req.url, true).query
                const answer = await (deleteDB(id))
                res.end(JSON.stringify(answer))
            } catch (error) {
                console.log('Ha ocurrido un error (calling DELETE QUERY). Usuario(a) no ha sido eliminado. Verifique que usuario(a) puede ser eliminado y/o que los datos son correctos (por ejemplo, saldo positivo). Código:\n', error.code)
                res.end()
            }
        }
        //Disponibiliza petición POST
        //Nueva transferencia
        if (req.url == '/transferencia' && req.method === 'POST') {
            try {
                let body = ""
                req.on('data', (chunk) => {
                    body += chunk
                })
                req.on('end', async () => {
                    const dataDB = Object.values(JSON.parse(body))
                    const answer = await transferDB(dataDB)
                    res.end(JSON.stringify(answer))
                })
            } catch (error) {
                console.log('Ha ocurrido un error (calling POST QUERY, trasnferencias). Transferencia no realizada. Código:\n', error.code)
                res.end()
            }
        }
        //consultar las transferencias realizadas
        if (req.url == '/transferencias' && req.method === 'GET') {
            try {
                const transferRegistered = await queryTransfDB()
                res.end(JSON.stringify(transferRegistered.rows))
            } catch (error) {
                console.log('Ha ocurrido un error (calling GET QUERY, transferencias). No se puede(n) visualizar la(s) transferencia(s) realizada(s). Código:\n', error.code)
                res.end()
            }
        }

    }).listen(3000, console.log(`Servidor trabajando en puerto 3000`))
